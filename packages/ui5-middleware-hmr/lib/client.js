/* eslint-disable */
/**
 * ui5-middleware-hmr — browser client runtime (EXPERIMENTAL / dev-only).
 *
 * Connects to the middleware's websocket and dispatches typed change events:
 *   - css   : re-inject the changed stylesheet, no reload
 *   - i18n  : reload affected ResourceModels, refresh bindings
 *   - json  : re-fetch JSONModels whose url matches the changed file
 *   - module: unload the module via the private ui5loader API and re-require it;
 *             views owning a changed controller are re-instantiated in place
 *   - reload: full page reload (honest fallback)
 *
 * The module hot-swap relies on `sap.ui.loader._.unloadResources`, a private API
 * deprecated as of UI5 1.135. We feature-detect it and fall back to a full reload
 * when it is missing, so a future removal degrades gracefully.
 */
(function () {
	"use strict";

	var PORT = "__HMR_PORT__";
	var PREFIX = "[ui5-middleware-hmr]";

	// view ids currently mid-swap, plus a pending flag for coalescing. Two overlapping
	// async view swaps (rapid successive edits) would otherwise race: the second finds the
	// not-yet-replaced old view, and whichever XMLView.create promise resolves last wins —
	// intermittently leaving stale/initial content or duplicate instances. We serialize per
	// view id: while a swap is in flight we don't start another; we mark it pending and run
	// exactly one more swap when the in-flight one finishes (so the final edit always wins).
	var swapInFlight = {};
	var swapPending = {};

	// same serialize-per-id coalescing as views, but keyed by component id: a component
	// rebuild (destroy + Component.create with the same id) must never overlap another for
	// the same id, or the second create hits a duplicate id on the not-yet-destroyed old one.
	var compSwapInFlight = {};
	var compSwapPending = {};

	function log() {
		var args = Array.prototype.slice.call(arguments);
		args.unshift(PREFIX);
		console.log.apply(console, args);
	}

	function fullReload(why) {
		log("full reload:", why);
		location.reload();
	}

	// ---- feature detection of the private unload API -------------------------
	function getLoader() {
		return window.sap && sap.ui && sap.ui.loader && sap.ui.loader._;
	}
	function canUnload() {
		var l = getLoader();
		return !!(l && typeof l.unloadResources === "function");
	}

	// ---- Core / registry access ---------------------------------------------
	function withCore(cb) {
		if (!window.sap || !sap.ui || !sap.ui.require) {
			return false;
		}
		sap.ui.require(["sap/ui/core/Core"], function (Core) {
			// UI5 2.x: Core is ready synchronously after boot; guard anyway
			if (Core && Core.ready) {
				Core.ready(function () {
					cb(Core);
				});
			} else {
				cb(Core);
			}
		});
		return true;
	}

	// ---- CSS -----------------------------------------------------------------
	function bust(url) {
		return url.replace(/([?&])_hmr=\d+/, "$1").replace(/[?&]$/, "") + (url.indexOf("?") >= 0 ? "&" : "?") + "_hmr=" + Date.now();
	}

	function reloadCss(changedPath) {
		var base = changedPath.split("/").pop();
		var links = document.querySelectorAll('link[rel="stylesheet"]');
		var hit = false;
		for (var i = 0; i < links.length; i++) {
			var href = links[i].getAttribute("href") || "";
			if (href.indexOf(base) >= 0) {
				links[i].setAttribute("href", bust(href));
				hit = true;
			}
		}
		log(hit ? "css reloaded: " + base : "css not found on page, ignoring: " + base);
	}

	// ---- module unload + re-require ------------------------------------------
	function unload(moduleName) {
		var l = getLoader();
		// (name, bPreloadGroup=false → single module, bUnloadAll=true, bDeleteExports=true)
		l.unloadResources(moduleName + ".js", false, true, true);
	}

	function isController(moduleName) {
		return /\.controller$/.test(moduleName);
	}
	function isComponent(moduleName) {
		return /(^|\/)Component$/.test(moduleName);
	}

	function reRequireLeaf(moduleName) {
		unload(moduleName);
		primeModule(moduleName);
	}

	// re-require a module (already unloaded) to prime the cache with fresh code
	function primeModule(moduleName) {
		sap.ui.require([moduleName], function () {
			log("module hot-swapped:", moduleName);
		});
	}

	// Convert a controller module name to its class name:
	//   ui5/app/controller/Main.controller  ->  ui5.app.controller.Main
	function controllerClassName(moduleName) {
		return moduleName.replace(/\.controller$/, "").replace(/\//g, ".");
	}

	// Attempt to refresh a routed view through the router. Returns true if the view was
	// handled as a router target (caller stops), false if not routed (caller falls back to
	// the in-place aggregation swap).
	//
	// The router owns routed views' full lifecycle (creation, the Views cache keyed by both
	// name and id, placement into the container, nav history, NavContainer current-page
	// tracking). The only way to refresh one without corrupting that state is to let the
	// router redo a full navigation: evict the cache entry, destroy the old instance so its
	// fixed viewId is free, then re-parse the CURRENT hash so the router re-matches the
	// active route and rebuilds + re-navigates to the view. (An earlier version used
	// Target.display(); that rebuilt the view but left the NavContainer showing the previous
	// page when the edited view was the current one, and desynced nav state — so a later
	// navTo hit a destroyed reference.)
	function tryRoutedSwap(oldView, done) {
		var Component = sap.ui.require("sap/ui/core/Component");
		var viewNameSlash = oldView.getViewName ? oldView.getViewName().replace(/\./g, "/") : null;
		if (!Component || !viewNameSlash) {
			return false;
		}
		var handled = false;
		Component.registry.forEach(function (comp) {
			if (handled || !comp.getRouter) {
				return;
			}
			var router = comp.getRouter();
			if (!router || !router.getViews || !router.getTarget || typeof router.parse !== "function") {
				return;
			}
			// resolve which target (if any) renders this view, from the routing manifest config
			var cfg = comp.getManifestEntry ? comp.getManifestEntry("/sap.ui5/routing/config") || {} : {};
			var targets = comp.getManifestEntry ? comp.getManifestEntry("/sap.ui5/routing/targets") || {} : {};
			var viewPath = cfg.viewPath ? cfg.viewPath.replace(/\./g, "/") : "";
			var targetName = null;
			Object.keys(targets).forEach(function (tName) {
				if (targetName) return;
				var t = targets[tName];
				var vn = t && (t.viewName || t.name);
				if (!vn) return;
				// The target viewName may be RELATIVE to viewPath (e.g. "fiori.DynamicPage") or
				// already FULLY QUALIFIED (e.g. "ui5.ecosystem...view.fiori.DynamicPage"). A dot
				// alone doesn't distinguish them — a relative name in a subfolder ("fiori.DynamicPage")
				// also contains a dot — so we can't branch on that (doing so misses every subfolder
				// target and drops it to the generic aggregation swap, which on a NavContainer can
				// leave the app showing the first/root page). Instead compute BOTH candidate paths
				// and match either.
				var vnSlash = vn.replace(/\./g, "/");
				var qualified = vnSlash; // treat as already-qualified
				var relative = viewPath ? viewPath + "/" + vnSlash : vnSlash; // treat as relative to viewPath
				if (qualified === viewNameSlash || relative === viewNameSlash) {
					targetName = tName;
				}
			});
			if (!targetName) {
				return; // not a routed target of this component
			}
			handled = true;

			// Is the edited view the one currently displayed? Walk up from the view to see if
			// it (or an ancestor) is the current page of its NavContainer/nav parent. This
			// decides whether we must actively re-display it (current) or can let the next
			// natural navigation rebuild it (non-current).
			var wasCurrent = isCurrentlyDisplayed(oldView);

			// snapshot scroll before we destroy the old DOM; restored onto the fresh view below
			var scroll = captureScroll(oldView);

			// 1) evict the Views cache entry (both name- and id-keyed slots live under this key,
			//    which is `<viewName>`); the cache never auto-evicts destroyed views, so a stale
			//    entry would otherwise be handed out on the next navigation.
			try {
				var views = router.getViews();
				var vc = views && views._oCache && views._oCache.view;
				var dotName = oldView.getViewName();
				if (vc && vc[dotName]) {
					delete vc[dotName];
				}
			} catch (e) {
				/* fall through */
			}
			// 2) destroy the old instance so its fixed viewId is free for the fresh one
			oldView.destroy();

			if (!wasCurrent) {
				// Non-current view: DON'T re-parse. parse(hash) would re-match the CURRENT route
				// (a different view), spuriously re-navigating ("jumps to root/previous view").
				// The evicted cache entry means the next real navTo to this view rebuilds it
				// cleanly via a cache-miss create. Nothing more to do now.
				log("routed view evicted (non-current), will rebuild on next navigation:", viewNameSlash.replace(/\//g, "."));
				return done();
			}

			// 3) current view: re-parse the current hash so the router re-matches the active
			//    route and rebuilds + re-navigates. Because we destroyed the current view, the
			//    NavContainer briefly falls back to its root page, so a normal re-match would
			//    animate root -> view (a visible slide + root flash on every edit). Override the
			//    target's transition to the instant "show" for this refresh so the edited view
			//    reappears in place, then restore the original transition. Wait for the route to
			//    actually match before releasing the in-flight lock so a rapid follow-up edit
			//    can't race the nav.
			try {
				var target = router.getTarget(targetName);
				var origTransition = target && target._oOptions ? target._oOptions.transition : undefined;
				if (target && target._oOptions) {
					target._oOptions.transition = "show";
				}
				var hc = router.getHashChanger && router.getHashChanger();
				var hash = hc && hc.getHash ? hc.getHash() : "";
				var settled = false;
				var finish = function () {
					if (settled) return;
					settled = true;
					if (router.detachRouteMatched) {
						router.detachRouteMatched(finish);
					}
					// restore the original transition so real navigations animate as configured
					if (target && target._oOptions && origTransition !== undefined) {
						target._oOptions.transition = origTransition;
					}
					// find the freshly-rebuilt view instance (same name) and restore scroll onto it
					try {
						var Element = sap.ui.require("sap/ui/core/Element");
						var fresh = null;
						if (Element && Element.registry) {
							Element.registry.forEach(function (el) {
								if (el.isA && el.isA("sap.ui.core.mvc.XMLView") && el.getViewName && el.getViewName() === dotName) {
									fresh = el;
								}
							});
						}
						if (fresh) {
							restoreScroll(fresh, scroll);
						}
					} catch (e) {
						/* best-effort */
					}
					log("routed view refreshed via router re-match:", viewNameSlash.replace(/\//g, "."));
					done();
				};
				if (router.attachRouteMatched) {
					router.attachRouteMatched(finish);
				}
				router.parse(hash);
				// safety net in case no route matches (detached handler never fires)
				setTimeout(finish, 500);
			} catch (e) {
				done();
				fullReload("routed view refresh failed: " + e);
			}
		});
		return handled;
	}

	// True if the given control is (or is contained in) the current page of its nearest
	// NavContainer ancestor — i.e. it's the view the user is looking at right now.
	function isCurrentlyDisplayed(view) {
		try {
			var node = view;
			while (node) {
				var parent = node.getParent && node.getParent();
				if (parent && parent.isA && parent.isA("sap.m.NavContainer") && parent.getCurrentPage) {
					return parent.getCurrentPage() === node;
				}
				node = parent;
			}
		} catch (e) {
			/* fall through */
		}
		return false;
	}

	// ---- scroll position preservation ----------------------------------------
	// A view swap destroys the old DOM and renders fresh, so scroll offsets are lost. We snapshot
	// the scroll of every scrollable element under the view's DOM keyed by a STRUCTURAL PATH from
	// the view root (child-index chain), not by control/DOM id: scroll containers often have
	// auto-generated ids (e.g. an unnamed sap.m.Page) that change across re-instantiation, but the
	// structural position is stable as long as the markup around it doesn't change. The path also
	// descends into open shadow roots (marked with a "#" segment) so scroll inside UI5 Web
	// Components — whose scroll containers live in shadow DOM, not the light DOM — is covered too.
	// After the new view renders we re-apply offsets to the elements at the same paths. Best-effort:
	// anything that moved (because you edited exactly that markup) simply isn't restored.

	// walk the tree under rootEl (descending into open shadow roots), invoking cb(el, path) for
	// every element. A path segment is the child index; a "#" segment marks a shadow-root descent.
	function walkScrollTree(rootEl, cb) {
		var stack = [{ el: rootEl, path: "" }];
		while (stack.length) {
			var cur = stack.pop();
			var el = cur.el;
			cb(el, cur.path);
			// descend into an open shadow root first (its scroll host is the shadowed element)
			if (el.shadowRoot) {
				var sc = el.shadowRoot.children;
				for (var s = sc.length - 1; s >= 0; s--) {
					stack.push({ el: sc[s], path: cur.path + "/#" + s });
				}
			}
			var ch = el.children;
			for (var i = ch.length - 1; i >= 0; i--) {
				stack.push({ el: ch[i], path: cur.path + "/" + i });
			}
		}
	}

	// resolve a path built by walkScrollTree back to an element under rootEl (crossing shadow roots)
	function resolveScrollPath(rootEl, path) {
		if (!path) {
			return rootEl;
		}
		var node = rootEl;
		var segs = path.split("/");
		for (var i = 0; i < segs.length && node; i++) {
			var seg = segs[i];
			if (seg === "") {
				continue;
			}
			if (seg.charAt(0) === "#") {
				var root = node.shadowRoot;
				node = root ? root.children[parseInt(seg.slice(1), 10)] : null;
			} else {
				node = node.children[parseInt(seg, 10)];
			}
		}
		return node || null;
	}

	// snapshot { path -> {top,left} } for every scrolled element under the view's DOM
	function captureScroll(view) {
		var offsets = [];
		try {
			var root = view.getDomRef && view.getDomRef();
			if (!root) {
				return offsets;
			}
			walkScrollTree(root, function (el, path) {
				if ((el.scrollTop > 0 || el.scrollLeft > 0) && path) {
					offsets.push({ path: path, top: el.scrollTop, left: el.scrollLeft });
				}
			});
			// also capture the window/document scroll (view content taller than the viewport)
			var winTop = window.pageYOffset || document.documentElement.scrollTop || 0;
			var winLeft = window.pageXOffset || document.documentElement.scrollLeft || 0;
			if (winTop > 0 || winLeft > 0) {
				offsets.push({ path: "__window__", top: winTop, left: winLeft });
			}
		} catch (e) {
			/* best-effort */
		}
		return offsets;
	}

	// re-apply captured offsets once the new view has rendered. UI5 renders asynchronously and
	// scroll containers (e.g. sap.m.Page's internal ScrollEnablement) may re-layout after the
	// first paint, so we retry a few animation frames before giving up.
	function restoreScroll(view, offsets) {
		if (!offsets || !offsets.length) {
			return;
		}
		var attempts = 0;
		var apply = function () {
			var root = view.getDomRef && view.getDomRef();
			if (!root) {
				if (attempts++ < 10) {
					return requestAnimationFrame(apply);
				}
				return;
			}
			offsets.forEach(function (o) {
				if (o.path === "__window__") {
					window.scrollTo(o.left, o.top);
					return;
				}
				var el = resolveScrollPath(root, o.path);
				if (el) {
					if (o.top) el.scrollTop = o.top;
					if (o.left) el.scrollLeft = o.left;
				}
			});
			// a couple of extra frames catch late re-layout without a visible jump
			if (attempts++ < 3) {
				requestAnimationFrame(apply);
			}
		};
		requestAnimationFrame(apply);
	}

	// Re-instantiate a list of live XMLView instances in place: each new view is created
	// with the same id and dropped into the same parent aggregation slot. XMLView.create
	// re-reads the template fresh, so this picks up .view.xml changes; models on the
	// parent/component survive (only the view's transient UI state is lost).
	function reinstantiateViews(views, XMLView) {
		views.forEach(function (oldView) {
			var id = oldView.getId();
			// serialize swaps per view id: if one is already running, just mark pending so a
			// single follow-up swap runs afterwards with the latest template (final edit wins)
			if (swapInFlight[id]) {
				swapPending[id] = true;
				return;
			}
			swapInFlight[id] = true;
			swapOne(oldView, XMLView);
		});
	}

	// Perform one view swap. On completion, if further edits arrived while in flight, re-run
	// once against the current live instance of the same view name.
	function swapOne(oldView, XMLView) {
		var id = oldView.getId();
		var viewName = oldView.getViewName();
		var done = function () {
			swapInFlight[id] = false;
			if (swapPending[id]) {
				swapPending[id] = false;
				// find the current live view with this name and swap again
				var Element = sap.ui.require("sap/ui/core/Element");
				var current = null;
				if (Element && Element.registry) {
					Element.registry.forEach(function (el) {
						if (el.isA && el.isA("sap.ui.core.mvc.XMLView") && el.getViewName && el.getViewName() === viewName) {
							current = el;
						}
					});
				}
				if (current) {
					swapInFlight[current.getId()] = true;
					swapOne(current, XMLView);
				}
			}
		};

		// If this view is a router TARGET, let the router rebuild it: evict the Views cache
		// entry, destroy the old instance (frees its fixed viewId), then re-parse the current
		// hash so the ROUTER re-creates + re-navigates through its own lifecycle. Doing the
		// create ourselves (destroy+XMLView.create+aggregation insert) corrupts router state —
		// the Views cache and Target keep refs to the destroyed instance, breaking navigation
		// ("object ... was destroyed" on navTo) and leaving stale/empty pages.
		//
		// This MUST run before the parent/component-root checks below: a routed target view can
		// legitimately report an empty getParent() (the router manages placement, and the link
		// isn't always a plain aggregation parent). Falling through to the !parent branch would
		// misclassify it as a Component rootView and rebuild the whole component — which for a
		// routed subview reloads the app and drops the user back on the default (first) page.
		if (tryRoutedSwap(oldView, done)) {
			return;
		}

		// A Component's manifest rootView can't be swapped in place: its parent is the
		// UIComponent itself (getParent() returns the component, not a control with an
		// aggregation slot), so the aggregation-slot logic below can't find or re-insert it.
		// Detect it — no parent at all, OR the view IS its owner component's root control —
		// and rebuild through the component instead (recreates the rootView from the fresh
		// manifest with correct owner/UIArea/router wiring). See swapParentlessView.
		var parent = oldView.getParent();
		if (!parent || isComponentRootView(oldView)) {
			return swapParentlessView(oldView, done);
		}

		// find aggregation + index the view sits in
		var meta = parent.getMetadata();
		var aggs = meta.getAllAggregations();
		var found = null;
		Object.keys(aggs).forEach(function (aggName) {
			if (found) return;
			var val = parent.getAggregation(aggName);
			if (Array.isArray(val)) {
				var idx = val.indexOf(oldView);
				if (idx >= 0) found = { name: aggName, index: idx };
			} else if (val === oldView) {
				found = { name: aggName, index: 0 };
			}
		});
		if (!found) {
			done();
			return fullReload("could not locate view in parent aggregation");
		}
		// Prefer the aggregation's TYPED mutators (e.g. insertPage/removePage on a
		// sap.m.NavContainer) over the generic insertAggregation/removeAggregation. The
		// typed mutators run container-specific bookkeeping — for a NavContainer that's
		// what applies the `sapMNavItem` class + height:100% to the page. The generic
		// mutators skip it, leaving the re-instantiated view collapsed to 0px (DOM present
		// but visually invisible). Fall back to the generic ones if no typed mutator.
		var aggMeta = aggs[found.name];
		var singular = aggMeta && aggMeta.singularName ? aggMeta.singularName : null;
		var cap = singular ? singular.charAt(0).toUpperCase() + singular.slice(1) : null;
		var insertName = cap && typeof parent["insert" + cap] === "function" ? "insert" + cap : null;
		var removeName = cap && typeof parent["remove" + cap] === "function" ? "remove" + cap : null;
		var doRemove = function (view) {
			if (removeName) {
				parent[removeName](view);
			} else {
				parent.removeAggregation(found.name, view);
			}
		};
		var doInsert = function (view) {
			if (insertName) {
				parent[insertName](view, found.index);
			} else {
				parent.insertAggregation(found.name, view, found.index);
			}
		};
		var comp = sap.ui.require("sap/ui/core/Component");
		// resolve the owner component from the view, falling back to the parent
		// (the parent stays alive; the old view is about to be destroyed)
		var owner = comp && comp.getOwnerComponentFor ? comp.getOwnerComponentFor(oldView) || comp.getOwnerComponentFor(parent) : null;
		// preserve the original view id so stable IDs / bindings keep working
		var create = function () {
			return XMLView.create({ id: id, viewName: viewName });
		};
		var runCreate = owner ? owner.runAsOwner.bind(owner, create) : create;
		// snapshot scroll offsets before the old DOM is torn down, restore after the new render
		var scroll = captureScroll(oldView);
		doRemove(oldView);
		oldView.destroy();
		Promise.resolve(runCreate())
			.then(function (newView) {
				doInsert(newView);
				// If this is a routed view, the router caches view instances by name — its
				// cache still points at the destroyed old instance, so a later navigation
				// would render an empty/stale target. Update the cache with the new view.
				syncRouterViewCache(owner, viewName, newView);
				restoreScroll(newView, scroll);
				log("view re-instantiated:", viewName, owner ? "(owner ok)" : "(no owner)");
				done();
			})
			.catch(function (e) {
				done();
				fullReload("view re-instantiation failed: " + e);
			});
	}

	// True if the view is the root control of its owner Component (the manifest rootView).
	// Such a view's getParent() is the UIComponent, so it has no aggregation slot to swap into.
	function isComponentRootView(view) {
		try {
			var Component = sap.ui.require("sap/ui/core/Component");
			var owner = Component && Component.getOwnerComponentFor && Component.getOwnerComponentFor(view);
			if (owner && owner.getRootControl && owner.getRootControl() === view) {
				return true;
			}
			// also treat a direct UIComponent/ComponentContainer parent as a component root
			var parent = view.getParent && view.getParent();
			return !!(parent && parent.isA && (parent.isA("sap.ui.core.UIComponent") || parent.isA("sap.ui.core.ComponentContainer")));
		} catch (e) {
			return false;
		}
	}

	// A view that is a Component's rootView (getParent() is the UIComponent, or falsy — placement
	// resolves via getUIArea() through the ComponentContainer, not a parent aggregation) can't be
	// swapped in place. Delegate to a full Component rebuild so the rootView is recreated from the
	// fresh manifest with correct owner/UIArea/router wiring (editing App.view.xml is otherwise a
	// silent no-op or a "could not locate view" reload). A view placed directly with placeAt() and
	// NO owning Component (only in library test harnesses) has no component to rebuild, so reload.
	function swapParentlessView(oldView, done) {
		var Component = sap.ui.require("sap/ui/core/Component");
		var owner = Component && Component.getOwnerComponentFor && Component.getOwnerComponentFor(oldView);
		if (!owner) {
			// fall back to matching the component whose root control IS this view
			forEachComponent(function (comp) {
				if (!owner && comp.getRootControl && comp.getRootControl() === oldView) {
					owner = comp;
				}
			});
		}
		if (owner) {
			return swapComponent(owner, done);
		}
		done();
		return fullReload("root view has no owning component (placeAt without Component), reloading");
	}

	// Keep the router's view cache in sync after a view is re-instantiated. Routed views are
	// cached by the Views instance (router.getViews()) keyed by view name; without this, the
	// router keeps handing out the destroyed old instance on the next navigation (empty page).
	function syncRouterViewCache(owner, viewName, newView) {
		try {
			if (!owner || !owner.getRouter) {
				return;
			}
			var router = owner.getRouter();
			var views = router && router.getViews && router.getViews();
			if (views && typeof views.setView === "function") {
				// setView(name, viewInstance) replaces the cached instance for this name
				views.setView(viewName, newView);
			}
		} catch (e) {
			// best-effort; a missing/changed cache API just means routed re-nav may reload
			log("router view-cache sync skipped:", String(e));
		}
	}

	// Re-instantiate every XMLView whose controller module changed. Models (app state)
	// survive because they live on the parent/owner component, not the view instance.
	function swapViewsForController(moduleName, alreadyUnloaded) {
		var wanted = controllerClassName(moduleName);
		withCore(function () {
			sap.ui.require(["sap/ui/core/mvc/XMLView", "sap/ui/core/Element"], function (XMLView, Element) {
				var registry = Element.registry || (sap.ui.core.Element && sap.ui.core.Element.registry);
				if (!registry) {
					return fullReload("no Element registry to locate views");
				}
				var affected = [];
				registry.forEach(function (el) {
					if (el.isA && el.isA("sap.ui.core.mvc.XMLView")) {
						// match on the view's controller class, not the view name — views and
						// controllers live under different paths (view/ vs controller/)
						var ctrl = el.getController && el.getController();
						var ctrlName = ctrl && ctrl.getMetadata && ctrl.getMetadata().getName();
						if (ctrlName === wanted) {
							affected.push(el);
						}
					}
				});
				if (!affected.length) {
					log("controller changed but no live view found, re-requiring only:", moduleName);
					return alreadyUnloaded ? primeModule(moduleName) : reRequireLeaf(moduleName);
				}
				if (!alreadyUnloaded) {
					unload(moduleName);
				}
				// Explicitly re-require the controller module to a fresh, executed class BEFORE
				// creating any view. XMLView.create resolves the controller by name; if we let
				// it trigger the (re)load implicitly, it can race the unload and instantiate a
				// stale class. Priming here guarantees the fresh class (with current deps) is in
				// the registry when create() resolves it.
				sap.ui.require([moduleName], function () {
					reinstantiateViews(affected, XMLView);
				});
			});
		});
	}

	// Re-instantiate every live XMLView whose name is in `viewNames` (dot notation, e.g.
	// my.app.view.Main) after its .view.xml template — or a fragment it embeds — changed.
	// XMLView.create re-reads the template (and embedded fragments) fresh from the server,
	// so no XML cache-busting is needed.
	function reloadViews(viewNames) {
		var wanted = {};
		(viewNames || []).forEach(function (n) {
			wanted[String(n).replace(/\./g, "/")] = true;
		});
		withCore(function () {
			sap.ui.require(["sap/ui/core/mvc/XMLView", "sap/ui/core/Element"], function (XMLView, Element) {
				var registry = Element.registry || (sap.ui.core.Element && sap.ui.core.Element.registry);
				if (!registry) {
					return fullReload("no Element registry to locate views");
				}
				var affected = [];
				registry.forEach(function (el) {
					if (el.isA && el.isA("sap.ui.core.mvc.XMLView")) {
						var name = el.getViewName && el.getViewName();
						if (name && wanted[name.replace(/\./g, "/")]) {
							affected.push(el);
						}
					}
				});
				if (!affected.length) {
					return fullReload("view(s) changed but no live instance found: " + (viewNames || []).join(", "));
				}
				reinstantiateViews(affected, XMLView);
			});
		});
	}

	function handleModule(moduleName, dependents) {
		if (!canUnload()) {
			return fullReload("unloadResources API unavailable");
		}
		dependents = dependents || [];

		// A changed module only takes effect for code that re-requires it. Modules that
		// already captured the old reference in their closure (the transitive dependents
		// the server computed) must be re-executed too. Any controller among the affected
		// set means its view must be re-instantiated; any Component means it must be rebuilt.
		var all = [moduleName].concat(dependents);
		var components = all.filter(isComponent);
		var controllers = all.filter(isController);
		var leaves = all.filter(function (m) {
			return !isController(m) && !isComponent(m);
		});

		// Fine-grained overlap rule: a Component rebuild recreates the component's whole control
		// tree (its rootView, routed views and their controllers) from the fresh manifest, so a
		// controller OWNED by a component we're about to rebuild would be swapped twice. Drop those
		// controllers here (a controller belongs to a component when its module sits under the
		// component's namespace, i.e. the component module minus the trailing "/Component").
		var rebuiltNamespaces = components.map(function (c) {
			return c.replace(/\/Component$/, "/");
		});
		var ownedByRebuilt = function (ctrl) {
			return rebuiltNamespaces.some(function (ns) {
				return ctrl.indexOf(ns) === 0;
			});
		};
		if (rebuiltNamespaces.length) {
			controllers = controllers.filter(function (c) {
				return !ownedByRebuilt(c);
			});
		}

		// Ordering is critical (learned the hard way):
		//   1. Prime every LEAF to a *defined* export first. `unloadResources` can leave a
		//      module in state READY but with an undefined export; a dependent that resolves
		//      it in that window captures `undefined`. primeLeaf() re-tries unload+require
		//      until the export is defined, so controllers/components see good deps.
		//   2. Prime the Component module(s) themselves (fresh class for Component.create).
		//   3. Rebuild each affected Component in place (recreates its rootView + routed views).
		//   4. Re-instantiate views for any controllers NOT owned by a rebuilt component.
		primeLeaves(leaves, function () {
			primeLeaves(components, function () {
				if (components.length) {
					log("hot-swap: " + leaves.length + " leaf module(s) + " + components.length + " component(s)" + (controllers.length ? " + " + controllers.length + " controller(s)" : ""));
					withCore(function () {
						components.forEach(function (m) {
							findComponentsByModule(m).forEach(function (comp) {
								swapComponent(comp);
							});
						});
					});
				}
				if (controllers.length) {
					if (!components.length) {
						log("hot-swap: " + leaves.length + " leaf module(s) + " + controllers.length + " controller(s)");
					}
					controllers.forEach(function (c) {
						unload(c); // fresh controller code; view create will re-require it
						swapViewsForController(c, /*alreadyUnloaded*/ true);
					});
				} else if (!components.length && dependents.length) {
					log("hot-swap leaf + " + dependents.length + " dependent(s): " + moduleName);
				}
			});
		});
	}

	// Prime a set of leaf modules so each has a *defined* export before dependents run.
	// Works around the unloadResources quirk where a re-required module can report READY
	// with an undefined export: if the export comes back undefined, unload + require again
	// (bounded retries), then move on.
	function primeLeaves(modules, done) {
		var i = 0;
		function next() {
			if (i >= modules.length) {
				return done && done();
			}
			var m = modules[i++];
			primeOne(m, 3, function () {
				next();
			});
		}
		next();
	}

	function primeOne(moduleName, attemptsLeft, cb) {
		// Force the server to (re)compile and the browser to hold fresh bytes for this
		// module's canonical URL before the loader requires it. This closes a timing gap:
		// the file-change event can arrive before build steps (e.g. transpile) have produced
		// the new output, so a bare re-require may fetch stale code. A no-store fetch of the
		// canonical URL blocks until fresh bytes are available and primes the HTTP cache.
		var url = sap.ui.require.toUrl(moduleName + ".js");
		var proceed = function () {
			unload(moduleName);
			sap.ui.require(
				[moduleName],
				function (mod) {
					// a module that legitimately exports undefined won't benefit from retries, so
					// only retry when we still have attempts AND the export is undefined
					if (mod === undefined && attemptsLeft > 0) {
						return primeOne(moduleName, attemptsLeft - 1, cb);
					}
					log("module hot-swapped:", moduleName);
					cb();
				},
				function () {
					cb();
				},
			);
		};
		try {
			fetch(url, { cache: "no-store" }).then(proceed, proceed);
		} catch (e) {
			proceed();
		}
	}

	// ---- component enumeration ----------------------------------------------
	// iterate every live Component, invoking cb(component) for each
	function forEachComponent(cb) {
		var Component = sap.ui.require("sap/ui/core/Component");
		var registry = Component && Component.registry;
		if (!registry || !registry.forEach) {
			return false;
		}
		registry.forEach(cb);
		return true;
	}

	// ---- component hot-swap --------------------------------------------------
	// Rebuild a live Component in place when its module (Component.js/.ts) changed. A Component
	// is the ROOT of the app — it owns the router, models and the manifest `rootView` — so it
	// can't be slotted into a parent aggregation like a view. Instead we rebuild it through its
	// ComponentContainer: destroy the old instance (freeing its id) and Component.create a fresh
	// one with the SAME id, then hand it back to the container. Component.create re-reads the
	// (no-store) manifest.json, so rootView/routing/model changes are picked up too; the fresh
	// init() re-initialises the router, which re-parses the CURRENT hash (singleton HashChanger),
	// so the active route survives. Runtime-created model/app state is lost — acceptable for dev.

	// find the live component instance(s) whose class matches the changed module name
	function findComponentsByModule(moduleName) {
		// ui5/app/Component -> ui5.app.Component (the component's UI5 class name)
		var wanted = moduleName.replace(/\//g, ".");
		var matches = [];
		forEachComponent(function (comp) {
			var name = comp.getMetadata && comp.getMetadata().getName && comp.getMetadata().getName();
			if (name === wanted) {
				matches.push(comp);
			}
		});
		return matches;
	}

	// locate the ComponentContainer holding a component. The container references the component
	// via an ASSOCIATION (not an aggregation), so there's no getParent() link: prefer the
	// component's own back-reference (comp.oContainer), then fall back to scanning the Element
	// registry for a ComponentContainer whose `component` association is this component's id.
	function findContainerForComponent(comp) {
		if (comp.oContainer) {
			return comp.oContainer;
		}
		var Element = sap.ui.require("sap/ui/core/Element");
		var registry = Element && Element.registry;
		var found = null;
		if (registry && registry.forEach) {
			registry.forEach(function (el) {
				if (found) {
					return;
				}
				if (el.isA && el.isA("sap.ui.core.ComponentContainer") && el.getComponent && el.getComponent() === comp.getId()) {
					found = el;
				}
			});
		}
		return found;
	}

	// rebuild one component in place; `done` is invoked (best-effort) when settled
	function swapComponent(comp, done) {
		done = done || function () {};
		var id = comp.getId();

		// serialize per component id (see compSwapInFlight): coalesce a follow-up edit into one
		// pending rerun rather than racing a second create against the old, not-yet-destroyed id
		if (compSwapInFlight[id]) {
			compSwapPending[id] = true;
			return done();
		}

		var Component = sap.ui.require("sap/ui/core/Component");
		var container = findContainerForComponent(comp);
		if (!Component || !container) {
			return fullReload("component has no container to rebuild: " + id);
		}

		compSwapInFlight[id] = true;
		var name = comp.getMetadata().getComponentName();

		var release = function () {
			compSwapInFlight[id] = false;
			if (compSwapPending[id]) {
				compSwapPending[id] = false;
				// rebuild again against whatever instance now holds this id (latest edit wins)
				var current = findComponentsByModule(name.replace(/\./g, "/") + "/Component")[0];
				if (current) {
					swapComponent(current, function () {});
				}
			}
			done();
		};

		try {
			// A DECLARATIVE ComponentContainer (from ComponentSupport — it carries name/manifest and
			// autoPrefixId) owns component creation: its onBeforeRendering calls _createComponent(),
			// which applies the id prefix EXACTLY ONCE (settings.id "Sample" -> "container-Sample")
			// and re-reads the (no-store) manifest.json. We must NOT Component.create ourselves and
			// hand it back — the container would still auto-create its own, and reusing the already-
			// prefixed global id double-prefixes it ("container-container-Sample") on every swap.
			// Instead: clear the instance, destroy the old one, and let the container recreate via
			// its own lifecycle, settling on its `componentCreated` event. The fresh init() re-runs
			// the router → re-parses the current hash, so the active route survives.
			var canContainerRecreate = !!((container.getName && container.getName()) || (container.getManifest && container.getManifest()));
			if (canContainerRecreate && container.attachComponentCreated) {
				// _createComponent() mutates its own settings.id in place, prefixing it with the
				// container id: "Sample" -> "container-Sample". That write-back is not idempotent —
				// a second recreation would prefix again ("container-container-Sample"). Before
				// triggering recreation, strip the container's own id prefix from the stored
				// settings.id so the re-prefix reproduces the SAME global id exactly once.
				try {
					var cid = container.getId();
					var settings = container.getSettings && container.getSettings();
					if (settings && typeof settings.id === "string" && settings.id.indexOf(cid + "-") === 0) {
						settings.id = settings.id.slice(cid.length + 1);
					}
				} catch (e) {
					/* best-effort; if we can't normalize, the swap still proceeds */
				}
				var settled = false;
				var onCreated = function () {
					if (settled) {
						return;
					}
					settled = true;
					if (container.detachComponentCreated) {
						container.detachComponentCreated(onCreated);
					}
					log("component hot-swapped:", name);
					release();
				};
				container.attachComponentCreated(onCreated);
				container.setComponent(null); // drop the association
				container._oComponentPromise = null; // let onBeforeRendering recreate
				comp.destroy(); // free the id so the recreated one reuses it
				container.invalidate(); // schedule re-render -> onBeforeRendering -> _createComponent
				// safety net: if no create fires (e.g. container never re-renders), reload
				setTimeout(function () {
					if (!settled) {
						settled = true;
						if (container.detachComponentCreated) {
							container.detachComponentCreated(onCreated);
						}
						release();
						fullReload("component rebuild did not complete: " + name);
					}
				}, 5000);
				return;
			}

			// Fallback (programmatic container without name/manifest): create explicitly with the
			// same global id and hand it back. No container auto-create competes on this path.
			container.setComponent(null);
			comp.destroy();
			Promise.resolve(
				Component.create({
					id: id,
					name: name,
					manifest: true, // re-read the fresh manifest.json (rootView/routing/models)
					async: true,
				}),
			)
				.then(function (newComp) {
					container.setComponent(newComp);
					log("component hot-swapped:", name);
					release();
				})
				.catch(function (e) {
					release();
					fullReload("component hot-swap failed: " + e);
				});
		} catch (e) {
			release();
			fullReload("component hot-swap failed: " + e);
		}
	}

	// ---- i18n ----------------------------------------------------------------
	// Hot-refresh translatable texts without a reload by recreating each i18n ResourceModel
	// with a cache-busted bundleUrl and swapping it onto the owning component.
	//
	// Why this shape (learned the hard way):
	//   - ResourceBundle caches parsed properties by absolute URL. Reusing the same URL
	//     (via bundleName or _handleLocalizationChange) returns the stale bundle. A NEW
	//     query param makes a fresh cache key, so the bundle is re-parsed from a new fetch.
	//   - The server sends `Cache-Control: no-store` for .properties (see middleware), so
	//     that fetch actually hits the disk, not the browser HTTP cache.
	//   - comp.setModel(freshModel, name) re-resolves the components's i18n bindings, so
	//     bound texts update in place — no reload, no view re-instantiation.
	function reloadI18n() {
		withCore(function () {
			sap.ui.require(["sap/ui/model/resource/ResourceModel", "sap/ui/core/Component"], function (ResourceModel) {
				var refreshed = 0;
				var pending = [];
				var ok = forEachComponent(function (comp) {
					var models = (comp.getManifestEntry && comp.getManifestEntry("/sap.ui5/models")) || {};
					Object.keys(models).forEach(function (name) {
						var cfg = models[name];
						if (!cfg || cfg.type !== "sap.ui.model.resource.ResourceModel") {
							return;
						}
						var settings = Object.assign({}, cfg.settings || {});
						// resolve to an explicit bundleUrl and cache-bust it (new key => fresh parse)
						var url = settings.bundleUrl;
						if (!url && settings.bundleName) {
							url = sap.ui.require.toUrl(settings.bundleName.replace(/\./g, "/") + ".properties");
						}
						if (!url) {
							return; // can't locate the bundle; leave this model alone
						}
						var sep = url.indexOf("?") >= 0 ? "&" : "?";
						settings.bundleUrl = url + sep + "_hmr=" + Date.now();
						delete settings.bundleName; // bundleUrl wins; avoid the cached module path
						try {
							var old = comp.getModel(name);
							var fresh = new ResourceModel(settings);
							pending.push(
								Promise.resolve(fresh.getResourceBundle()).then(function () {
									comp.setModel(fresh, name);
									if (old && old.destroy) {
										old.destroy();
									}
								}),
							);
							refreshed++;
						} catch (e) {
							log("i18n model recreate failed for '" + name + "':", String(e));
						}
					});
				});

				if (!ok) {
					return fullReload("no Component registry for i18n refresh");
				}
				if (!refreshed) {
					return fullReload("i18n change but no ResourceModel found");
				}
				Promise.all(pending).then(function () {
					log("i18n hot-refreshed " + refreshed + " ResourceModel(s)");
				});
			});
		});
	}

	// ---- json ----------------------------------------------------------------
	// Reload JSONModels whose manifest uri matches the changed file. JSONModel exposes
	// loadData(url), which re-fetches and replaces the data; bindings update automatically.
	function reloadJson(changedPath) {
		var base = changedPath.split("/").pop();
		withCore(function () {
			var refreshed = 0;
			var ok = forEachComponent(function (comp) {
				var models = (comp.getManifestEntry && comp.getManifestEntry("/sap.ui5/models")) || {};
				var dataSources = (comp.getManifestEntry && comp.getManifestEntry("/sap.app/dataSources")) || {};
				Object.keys(models).forEach(function (name) {
					var cfg = models[name];
					if (!cfg || cfg.type !== "sap.ui.model.json.JSONModel") {
						return;
					}
					// resolve the model's uri from a direct settings uri or a referenced dataSource
					var uri = (cfg.settings && cfg.settings.uri) || cfg.uri || (cfg.dataSource && dataSources[cfg.dataSource] && dataSources[cfg.dataSource].uri);
					if (!uri || uri.indexOf(base) < 0) {
						return;
					}
					var model = comp.getModel(name);
					if (model && model.loadData) {
						try {
							// cache-bust so the browser HTTP cache doesn't serve stale JSON
							var sep = uri.indexOf("?") >= 0 ? "&" : "?";
							model.loadData(uri + sep + "_hmr=" + Date.now());
							refreshed++;
						} catch (e) {
							log("json model reload failed for '" + name + "':", String(e));
						}
					}
				});
			});
			if (!ok) {
				return fullReload("no Component registry for json refresh");
			}
			if (refreshed) {
				log("json hot-refreshed " + refreshed + " JSONModel(s): " + base);
			} else {
				fullReload("json change but no matching JSONModel: " + base);
			}
		});
	}

	// ---- dispatch ------------------------------------------------------------
	function dispatch(msg) {
		switch (msg.kind) {
			case "css":
				return reloadCss(msg.path);
			case "module":
				return handleModule(msg.module, msg.dependents);
			case "i18n":
				return reloadI18n();
			case "json":
				return reloadJson(msg.path);
			case "view":
				return reloadViews(msg.views);
			case "reload":
			default:
				return fullReload(msg.path || "unclassified change");
		}
	}

	// ---- connect -------------------------------------------------------------
	function connect() {
		var proto = location.protocol === "https:" ? "wss" : "ws";
		var url = proto + "://" + location.hostname + ":" + PORT;
		var ws;
		try {
			ws = new WebSocket(url);
		} catch (e) {
			log("could not open websocket:", e);
			return;
		}
		ws.onopen = function () {
			log("connected on port " + PORT + (canUnload() ? "" : " (unloadResources unavailable — module changes will full-reload)"));
		};
		ws.onmessage = function (ev) {
			var msg;
			try {
				msg = JSON.parse(ev.data);
			} catch (e) {
				return;
			}
			try {
				dispatch(msg);
			} catch (e) {
				fullReload("dispatch error: " + e);
			}
		};
		ws.onclose = function () {
			// dev server restart — try to reconnect, then reload once back
			setTimeout(connect, 1000);
		};
		ws.onerror = function () {
			ws.close();
		};
	}

	connect();
})();
