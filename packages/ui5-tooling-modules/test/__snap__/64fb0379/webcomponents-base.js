sap.ui.define(['ui5/ecosystem/demo/app/resources/webcomponents', 'ui5/ecosystem/demo/app/resources/Keys'], (function (webcomponents, Keys) { 'use strict';

  const t$2=new WeakMap;let a$2 = class a{static get tasks(){return t$2}static enqueue(s,e){t$2.has(s)||t$2.set(s,[]),t$2.get(s).push(e);}static run(s,e){return t$2.has(s)||t$2.set(s,[]),e().then(()=>{const T=t$2.get(s);if(T.length>0)return a.run(s,T.shift());t$2.delete(s);})}static push(s,e){t$2.get(s)?a.enqueue(s,e):a.run(s,e);}};

  const f$2=e=>{let n=null,a=false,i,o,r;const m=new Promise((t,c)=>{r=u=>{n=n||u;const d=u-n,l=e.duration-d;if(d<=e.duration){const s=1-l/e.duration;e.advance(s),a||(i=requestAnimationFrame(r));}else e.advance(1),t();},o=()=>{a=true,cancelAnimationFrame(i),c(new Error("animation stopped"));};}).catch(t=>t);return a$2.push(e.element,()=>(typeof e.beforeStart=="function"&&e.beforeStart(),requestAnimationFrame(r),new Promise(t=>{m.then(()=>t());}))),{promise:()=>m,stop:()=>o}},v$1=400;

  const n$2=(r,c,a)=>{let o,l;return f$2({beforeStart:()=>{o=r.scrollLeft,l=r.scrollTop;},duration:v$1,element:r,advance:t=>{r.scrollLeft=o+t*c,r.scrollTop=l+t*a;}})};

  const b$2=t=>{let o,a,d,r,s,p,g,y,n,l,h,T;const B=f$2({beforeStart:()=>{t.style.display="block",o=getComputedStyle(t),a=parseFloat(o.paddingTop),d=parseFloat(o.paddingBottom),r=parseFloat(o.marginTop),s=parseFloat(o.marginBottom),p=parseFloat(o.height),g=t.style.overflow,y=t.style.paddingTop,n=t.style.paddingBottom,l=t.style.marginTop,h=t.style.marginBottom,T=t.style.height,t.style.overflow="hidden",t.style.paddingTop="0",t.style.paddingBottom="0",t.style.marginTop="0",t.style.marginBottom="0",t.style.height="0";},duration:v$1,element:t,advance:i=>{t.style.display="block",t.style.paddingTop=`${a*i}px`,t.style.paddingBottom=`${d*i}px`,t.style.marginTop=`${r*i}px`,t.style.marginBottom=`${s*i}px`,t.style.height=`${p*i}px`;}});return B.promise().then(()=>{t.style.overflow=g,t.style.paddingTop=y,t.style.paddingBottom=n,t.style.marginTop=l,t.style.marginBottom=h,t.style.height=T;}),B};

  const u=o=>{let i,a,r,d,n,s,p,g,e,l,y,m;const h=f$2({beforeStart:()=>{const t=o;i=getComputedStyle(t),a=parseFloat(i.paddingTop),r=parseFloat(i.paddingBottom),d=parseFloat(i.marginTop),n=parseFloat(i.marginBottom),s=parseFloat(i.height),p=t.style.overflow,g=t.style.paddingTop,e=t.style.paddingBottom,l=t.style.marginTop,y=t.style.marginBottom,m=t.style.height,t.style.overflow="hidden";},duration:v$1,element:o,advance:t=>{o.style.paddingTop=`${a-a*t}px`,o.style.paddingBottom=`${r-r*t}px`,o.style.marginTop=`${d-d*t}px`,o.style.marginBottom=`${n-n*t}px`,o.style.height=`${s-s*t}px`;}});return h.promise().then(t=>{t instanceof Error||(o.style.overflow=p,o.style.paddingTop=g,o.style.paddingBottom=e,o.style.marginTop=l,o.style.marginBottom=y,o.style.height=m,o.style.display="none");}),h};

  const b$1=(n,e={})=>t=>{Object.prototype.hasOwnProperty.call(t,"metadata")||(t.metadata={});const a=t.metadata;a.events||(a.events={});const l=a.events;l[n]||(e.bubbles=!!e.bubbles,e.cancelable=!!e.cancelable,l[n]=e);};

  const t$1=()=>{let e=document.activeElement;for(;e&&e.shadowRoot&&e.shadowRoot.activeElement;)e=e.shadowRoot.activeElement;return e};

  let f$1 = class f{constructor(e,t){if(!e.isUI5Element)throw new Error("The root web component must be a UI5 Element instance");if(this.rootWebComponent=e,this.rootWebComponent.addEventListener("keydown",this._onkeydown.bind(this)),this._initBound=this._init.bind(this),this.rootWebComponent.attachComponentStateFinalized(this._initBound),typeof t.getItemsCallback!="function")throw new Error("getItemsCallback is required");this._getItems=t.getItemsCallback,this._currentIndex=t.currentIndex||0,this._rowSize=t.rowSize||1,this._behavior=t.behavior||webcomponents.l.Static,this._navigationMode=t.navigationMode||webcomponents.r.Auto,this._affectedPropertiesNames=t.affectedPropertiesNames||[],this._skipItemsSize=t.skipItemsSize||null;}setCurrentItem(e){const t=this._getItems().indexOf(e);if(t===-1){console.warn("The provided item is not managed by ItemNavigation",e);return}this._currentIndex=t,this._applyTabIndex();}setRowSize(e){this._rowSize=e;}_init(){this._getItems().forEach((e,t)=>{e.forcedTabIndex=t===this._currentIndex?"0":"-1";});}_onkeydown(e){if(!this._canNavigate())return;const t=this._navigationMode===webcomponents.r.Horizontal||this._navigationMode===webcomponents.r.Auto,i=this._navigationMode===webcomponents.r.Vertical||this._navigationMode===webcomponents.r.Auto,s=this.rootWebComponent.effectiveDir==="rtl";if(s&&Keys.K(e)&&t)this._handleRight();else if(s&&Keys.c(e)&&t)this._handleLeft();else if(Keys.K(e)&&t)this._handleLeft();else if(Keys.c(e)&&t)this._handleRight();else if(Keys.D(e)&&i)this._handleUp();else if(Keys.P(e)&&i)this._handleDown();else if(Keys.F(e))this._handleHome();else if(Keys.W(e))this._handleEnd();else if(Keys.Y(e))this._handlePageUp();else if(Keys.Z(e))this._handlePageDown();else return;e.preventDefault(),this._applyTabIndex(),this._focusCurrentItem();}_handleUp(){const e=this._getItems().length;if(this._currentIndex-this._rowSize>=0){this._currentIndex-=this._rowSize;return}if(this._behavior===webcomponents.l.Cyclic){const t=this._currentIndex%this._rowSize,i=t===0?this._rowSize-1:t-1,s=Math.ceil(e/this._rowSize);let o=i+(s-1)*this._rowSize;o>e-1&&(o-=this._rowSize),this._currentIndex=o;}else this._currentIndex=0;}_handleDown(){const e=this._getItems().length;if(this._currentIndex+this._rowSize<e){this._currentIndex+=this._rowSize;return}if(this._behavior===webcomponents.l.Cyclic){const i=(this._currentIndex%this._rowSize+1)%this._rowSize;this._currentIndex=i;}else this._currentIndex=e-1;}_handleLeft(){const e=this._getItems().length;if(this._currentIndex>0){this._currentIndex-=1;return}this._behavior===webcomponents.l.Cyclic&&(this._currentIndex=e-1);}_handleRight(){const e=this._getItems().length;if(this._currentIndex<e-1){this._currentIndex+=1;return}this._behavior===webcomponents.l.Cyclic&&(this._currentIndex=0);}_handleHome(){const e=this._rowSize>1?this._rowSize:this._getItems().length;this._currentIndex-=this._currentIndex%e;}_handleEnd(){const e=this._rowSize>1?this._rowSize:this._getItems().length;this._currentIndex+=e-1-this._currentIndex%e;}_handlePageUp(){this._rowSize>1||this._handlePageUpFlat();}_handlePageDown(){this._rowSize>1||this._handlePageDownFlat();}_handlePageUpFlat(){if(this._skipItemsSize===null){this._currentIndex-=this._currentIndex;return}this._currentIndex+1>this._skipItemsSize?this._currentIndex-=this._skipItemsSize:this._currentIndex-=this._currentIndex;}_handlePageDownFlat(){if(this._skipItemsSize===null){this._currentIndex=this._getItems().length-1;return}this._getItems().length-this._currentIndex-1>this._skipItemsSize?this._currentIndex+=this._skipItemsSize:this._currentIndex=this._getItems().length-1;}_applyTabIndex(){const e=this._getItems();for(let t=0;t<e.length;t++)e[t].forcedTabIndex=t===this._currentIndex?"0":"-1";this._affectedPropertiesNames.forEach(t=>{const i=this.rootWebComponent[t];this.rootWebComponent[t]=Array.isArray(i)?[...i]:{...i};});}_focusCurrentItem(){const e=this._getCurrentItem();e&&e.focus();}_canNavigate(){const e=this._getCurrentItem(),t=t$1();return e&&e===t}_getCurrentItem(){const e=this._getItems();if(!e.length)return;for(;this._currentIndex>=e.length;)this._currentIndex-=this._rowSize;this._currentIndex<0&&(this._currentIndex=0);const t=e[this._currentIndex];if(!t)return;if(webcomponents.v(t))return t.getFocusDomRef();const i=this.rootWebComponent.getDomRef();if(i&&t.id)return i.querySelector(`[id="${t.id}"]`)}};

  let n$1;const l$1=new Map,a$1=()=>(n$1||(n$1=new window.ResizeObserver(r=>{window.requestAnimationFrame(()=>{r.forEach(t=>{const s=l$1.get(t.target);s&&Promise.all(s.map(e=>e()));});});})),n$1),c$1=(r,t)=>{const s=l$1.get(r)||[];s.length||a$1().observe(r),l$1.set(r,[...s,t]);},b=(r,t)=>{const s=l$1.get(r)||[];if(s.length===0)return;const e=s.filter(o=>o!==t);e.length===0?(a$1().unobserve(r),l$1.delete(r)):l$1.set(r,e);};class f{static register(t,s){let e=t;webcomponents.v(e)&&(e=e.getDomRef()),e instanceof HTMLElement?c$1(e,s):console.warn("Cannot register ResizeHandler for element",t);}static deregister(t,s){let e=t;webcomponents.v(e)&&(e=e.getDomRef()),e instanceof HTMLElement?b(e,s):console.warn("Cannot deregister ResizeHandler for element",t);}}

  const l="scroll",p=webcomponents.l$1()?"touchend":"mouseup";class v extends webcomponents.i{constructor(t){super();this.supportsTouch=webcomponents.l$1();this.containerComponent=t,this.mouseMove=this.ontouchmove.bind(this),this.mouseUp=this.ontouchend.bind(this),this.touchStart=this.ontouchstart.bind(this),this.supportsTouch=webcomponents.l$1(),this.cachedValue={dragX:0,dragY:0},this.startX=0,this.startY=0,this.supportsTouch?(t.addEventListener("touchstart",this.touchStart,{passive:true}),t.addEventListener("touchmove",this.mouseMove,{passive:true}),t.addEventListener("touchend",this.mouseUp,{passive:true})):t.addEventListener("mousedown",this.touchStart,{passive:true});}set scrollContainer(t){this._container=t;}get scrollContainer(){return this._container}async scrollTo(t,e,s=0,o=0){let r=this.scrollContainer.clientHeight>0&&this.scrollContainer.clientWidth>0;for(;!r&&s>0;)await new Promise(n=>{setTimeout(()=>{r=this.scrollContainer.clientHeight>0&&this.scrollContainer.clientWidth>0,s--,n();},o);});this._container.scrollLeft=t,this._container.scrollTop=e;}move(t,e,s){if(s){this._container.scrollLeft+=t,this._container.scrollTop+=e;return}if(this._container)return n$2(this._container,t,e)}getScrollLeft(){return this._container.scrollLeft}getScrollTop(){return this._container.scrollTop}_isTouchInside(t){let e=null;this.supportsTouch&&t instanceof TouchEvent&&(e=t.touches[0]);const s=this._container.getBoundingClientRect(),o=this.supportsTouch?e.clientX:t.x,r=this.supportsTouch?e.clientY:t.y;return o>=s.left&&o<=s.right&&r>=s.top&&r<=s.bottom}ontouchstart(t){let e=null;this.supportsTouch&&t instanceof TouchEvent&&(e=t.touches[0]),e?(this.startX=e.pageX,this.startY=e.pageY):(document.addEventListener("mouseup",this.mouseUp,{passive:true}),document.addEventListener("mousemove",this.mouseMove,{passive:true})),e&&(this._prevDragX=e.pageX,this._prevDragY=e.pageY),t instanceof MouseEvent&&(this._prevDragX=t.x,this._prevDragY=t.y),this._canScroll=this._isTouchInside(t);}ontouchmove(t){if(!this._canScroll)return;const e=this._container,s=this.supportsTouch?t.touches[0]:null,o=this.supportsTouch?s.pageX:t.x,r=this.supportsTouch?s.pageY:t.y;e.scrollLeft+=this._prevDragX-o,e.scrollTop+=this._prevDragY-r,this.fireEvent(l,{isLeft:o>this._prevDragX,isRight:o<this._prevDragX}),this.cachedValue.dragX=this._prevDragX,this.cachedValue.dragY=this._prevDragY,this._prevDragX=o,this._prevDragY=r;}ontouchend(t){if(this.supportsTouch){const h=Math.abs(t.changedTouches[0].pageX-this.startX),c=Math.abs(t.changedTouches[0].pageY-this.startY);if(h<10&&c<10)return}if(!this._canScroll)return;const e=this._container,s=this.supportsTouch?t.changedTouches[0].pageX:t.x,o=this.supportsTouch?t.changedTouches[0].pageY:t.y;e.scrollLeft+=this._prevDragX-s,e.scrollTop+=this._prevDragY-o;const n=s===this._prevDragX?this.cachedValue.dragX:s;this.fireEvent(p,{isLeft:n<this._prevDragX,isRight:n>this._prevDragX}),this._prevDragX=s,this._prevDragY=o,this.supportsTouch||(document.removeEventListener("mousemove",this.mouseMove),document.removeEventListener("mouseup",this.mouseUp));}}

  const n=new webcomponents.i,t="directionChange",a=e=>{n.attachEvent(t,e);},c=e=>{n.detachEvent(t,e);},o=()=>n.fireEvent(t,void 0);

  const i=async()=>{const e=o();await Promise.all(e),await webcomponents.C({rtlAware:true});};

  // TODO-evo:assert on node throws an error if the assertion is violated

  /**
   * A simple assertion mechanism that logs a message when a given condition is not met.
   *
   * <b>Note:</b> Calls to this method might be removed when the JavaScript code
   *              is optimized during build. Therefore, callers should not rely on any side effects
   *              of this method.
   *
   * @function
   * @since 1.58
   * @alias module:sap/base/assert
   * @param {boolean} bResult Result of the checked assertion
   * @param {string|function():any} vMessage Message that will be logged when the result is <code>false</code>.
   * In case this is a function, the return value of the function will be displayed. This can be used to execute
   * complex code only if the assertion fails.
   * @public
   * @SecSink {1|SECRET} Could expose secret data in logs
   *
   */ /*!
       * OpenUI5
       * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
       * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
       */

  var fnAssert = function (bResult, vMessage) {
    if (!bResult) {
      var sMessage = vMessage;
      /*eslint-disable no-console */
      console.assert(bResult, sMessage);
      /*eslint-enable no-console */
    }
  };

  /*!
   * OpenUI5
   * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
   * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
   */
  /*
   * IMPORTANT: This is a private module, its API must not be used and is subject to change.
   * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
   */
  /**
   * Strips unsafe tags and attributes from HTML.
   *
   * @function
   * @since 1.58
   * @alias module:sap/base/security/sanitizeHTML
   * @param {string} sHTML the HTML to be sanitized.
   * @param {object} [mOptions={}] options for the sanitizer
   * @return {string} sanitized HTML
   * @private
   */
  var fnSanitizeHTML = function (sHTML, mOptions) {
    fnAssert(window.html && window.html.sanitize, "Sanitizer should have been loaded");
    mOptions = mOptions || {
      uriRewriter: function (sUrl) {
        // by default, we use the URLListValidator to check the URLs

        if (webcomponents.oURLListValidator.validate(sUrl)) {
          return sUrl;
        }
      }
    };
    var oTagPolicy = mOptions.tagPolicy || window.html.makeTagPolicy(mOptions.uriRewriter, mOptions.tokenPolicy);
    return window.html.sanitizeWithPolicy(sHTML, oTagPolicy);
  };

  // animations/

  var PackageModule = /*#__PURE__*/Object.freeze({
    __proto__: null,
    EventProvider: webcomponents.i,
    I18nBundle: webcomponents.u,
    ItemNavigation: f$1,
    MediaRange: webcomponents.i$1,
    RegisteredIconCollection: webcomponents.t,
    ResizeHandler: f,
    ScrollEnablement: v,
    UI5Element: webcomponents.b,
    URLListValidator: webcomponents.oURLListValidator,
    addCustomCSS: webcomponents.g,
    applyDirection: i,
    attachBoot: webcomponents.P,
    attachDirectionChange: a,
    attachLanguageChange: webcomponents.t$1,
    attachThemeLoaded: webcomponents.o,
    cancelRender: webcomponents.h,
    customElement: Keys.m,
    default: webcomponents.b,
    detachDirectionChange: c,
    detachLanguageChange: webcomponents.r$1,
    detachThemeLoaded: webcomponents.n,
    event: b$1,
    getAnimationMode: webcomponents.d,
    getCalendarType: webcomponents.i$2,
    getCustomElementsScopingRules: webcomponents.m,
    getCustomElementsScopingSuffix: webcomponents.c,
    getDefaultIconCollection: webcomponents.c$1,
    getDefaultLanguage: webcomponents.m$1,
    getDefaultTheme: webcomponents.g$1,
    getEffectiveDir: webcomponents.r$2,
    getEffectiveIconCollection: webcomponents.i$3,
    getEffectiveScopingSuffixForTag: webcomponents.g$2,
    getFetchDefaultLanguage: webcomponents.c$2,
    getFirstDayOfWeek: webcomponents.n$1,
    getI18nBundle: webcomponents.f,
    getLanguage: webcomponents.d$1,
    getLegacyDateCalendarCustomizing: webcomponents.m$2,
    getNoConflict: webcomponents.o$1,
    getTheme: webcomponents.r$3,
    isAndroid: webcomponents.P$1,
    isChrome: webcomponents.g$3,
    isCombi: webcomponents.m$3,
    isDesktop: webcomponents.f$1,
    isFirefox: webcomponents.b$1,
    isIOS: webcomponents.w,
    isPhone: webcomponents.d$2,
    isSafari: webcomponents.h$1,
    isTablet: webcomponents.a,
    property: Keys.s,
    registerCustomI18nBundleGetter: webcomponents.y,
    registerI18nLoader: webcomponents.$,
    registerIconLoader: webcomponents.T,
    registerLocaleDataLoader: webcomponents.C$1,
    registerThemePropertiesLoader: webcomponents.p,
    renderDeferred: webcomponents.l$2,
    renderFinished: webcomponents.f$2,
    renderImmediately: webcomponents.c$3,
    sanitizeHTML: fnSanitizeHTML,
    scroll: n$2,
    setAnimationMode: webcomponents.m$4,
    setCustomElementsScopingRules: webcomponents.p$1,
    setCustomElementsScopingSuffix: webcomponents.l$3,
    setDefaultIconCollection: webcomponents.e,
    setFetchDefaultLanguage: webcomponents.L,
    setLanguage: webcomponents.s,
    setNoConflict: webcomponents.f$3,
    setTheme: webcomponents.u$1,
    slideDown: b$2,
    slideUp: u,
    slot: Keys.d,
    supportsTouch: webcomponents.l$1
  });

  return PackageModule;

}));
