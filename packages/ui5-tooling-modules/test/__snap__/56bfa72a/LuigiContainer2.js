sap.ui.define(['require', 'exports'], (function (require, exports) { 'use strict';

  var c$d={},e$h=c$d.hasOwnProperty,a$f=c$d.toString,o$i=e$h.toString,l$g=o$i.call(Object),i$i=function(r){var t,n;return !r||a$f.call(r)!=="[object Object]"?false:(t=Object.getPrototypeOf(r),t?(n=e$h.call(t,"constructor")&&t.constructor,typeof n=="function"&&o$i.call(n)===l$g):true)};

  var c$c=Object.create(null),u$d=function(p,m,A,d){var n,t,e,a,o,i,r=arguments[2]||{},f=3,l=arguments.length,s=arguments[0]||false,y=arguments[1]?void 0:c$c;for(typeof r!="object"&&typeof r!="function"&&(r={});f<l;f++)if((o=arguments[f])!=null)for(a in o)n=r[a],e=o[a],!(a==="__proto__"||r===e)&&(s&&e&&(i$i(e)||(t=Array.isArray(e)))?(t?(t=false,i=n&&Array.isArray(n)?n:[]):i=n&&i$i(n)?n:{},r[a]=u$d(s,arguments[1],i,e)):e!==y&&(r[a]=e));return r};

  const e$g=function(n,t){return u$d(true,false,...arguments)};

  const e$f=new Map,s$n=(t,r)=>{e$f.set(t,r);},n$k=t=>e$f.get(t);

  const _$3={themes:{default:"sap_horizon"},languages:{default:"en"},locales:{default:"en",all:["ar","ar_EG","ar_SA","bg","ca","cnr","cs","da","de","de_AT","de_CH","el","el_CY","en","en_AU","en_GB","en_HK","en_IE","en_IN","en_NZ","en_PG","en_SG","en_ZA","es","es_AR","es_BO","es_CL","es_CO","es_MX","es_PE","es_UY","es_VE","et","fa","fi","fr","fr_BE","fr_CA","fr_CH","fr_LU","he","hi","hr","hu","id","it","it_CH","ja","kk","ko","lt","lv","ms","mk","nb","nl","nl_BE","pl","pt","pt_PT","ro","ru","ru_UA","sk","sl","sr","sr_Latn","sv","th","tr","uk","vi","zh_CN","zh_HK","zh_SG","zh_TW"]}},e$e=_$3.themes.default,a$e=_$3.languages.default,r$i=_$3.locales.default,l$f=_$3.locales.all;

  const o$h=typeof document>"u",n$j={search(){return o$h?"":window.location.search}},s$m=()=>o$h?"":window.location.href,u$c=()=>n$j.search();

  const s$l=e=>{const t=document.querySelector(`META[name="${e}"]`);return t&&t.getAttribute("content")},o$g=e=>{const t=s$l("sap-allowed-theme-origins")??s$l("sap-allowedThemeOrigins");return t?t.split(",").some(n=>n==="*"||e===n.trim()):false},a$d=(e,t)=>{const n=new URL(e).pathname;return new URL(n,t).toString()},g$a=e=>{let t;try{if(e.startsWith(".")||e.startsWith("/"))t=new URL(e,s$m()).toString();else {const n=new URL(e),r=n.origin;r&&o$g(r)?t=n.toString():t=a$d(n.toString(),s$m());}return t.endsWith("/")||(t=`${t}/`),`${t}UI5/`}catch{}};

  var u$b=(l=>(l.Full="full",l.Basic="basic",l.Minimal="minimal",l.None="none",l))(u$b||{});

  let i$h = class i{constructor(){this._eventRegistry=new Map;}attachEvent(t,r){const n=this._eventRegistry,e=n.get(t);if(!Array.isArray(e)){n.set(t,[r]);return}e.includes(r)||e.push(r);}detachEvent(t,r){const n=this._eventRegistry,e=n.get(t);if(!e)return;const s=e.indexOf(r);s!==-1&&e.splice(s,1),e.length===0&&n.delete(t);}fireEvent(t,r){const e=this._eventRegistry.get(t);return e?e.map(s=>s.call(this,r)):[]}fireEventAsync(t,r){return Promise.all(this.fireEvent(t,r))}isHandlerAttached(t,r){const e=this._eventRegistry.get(t);return e?e.includes(r):false}hasListeners(t){return !!this._eventRegistry.get(t)}};

  const e$d=new i$h,t$m="configurationReset",i$g=n=>{e$d.attachEvent(t$m,n);};

  let p$4=false,t$l={animationMode:u$b.Full,theme:e$e,themeRoot:void 0,rtl:void 0,language:void 0,timezone:void 0,calendarType:void 0,secondaryCalendarType:void 0,noConflict:false,formatSettings:{},fetchDefaultLanguage:false,defaultFontLoading:true,enableDefaultTooltips:true};const T$4=()=>(o$f(),t$l.theme),S$6=()=>{if(o$f(),t$l.themeRoot!==void 0){if(!g$a(t$l.themeRoot)){console.warn(`The ${t$l.themeRoot} is not valid. Check the allowed origins as suggested in the "setThemeRoot" description.`);return}return t$l.themeRoot}},L$4=()=>(o$f(),t$l.language),R$4=()=>(o$f(),t$l.fetchDefaultLanguage),F$2=()=>(o$f(),t$l.noConflict),U$3=()=>(o$f(),t$l.defaultFontLoading),M$3=()=>(o$f(),t$l.formatSettings),i$f=new Map;i$f.set("true",true),i$f.set("false",false);const w$7=()=>{const n=document.querySelector("[data-ui5-config]")||document.querySelector("[data-id='sap-ui-config']");let e;if(n){try{e=JSON.parse(n.innerHTML);}catch{console.warn("Incorrect data-sap-ui-config format. Please use JSON");}e&&(t$l=e$g(t$l,e));}},z$2=()=>{const n=new URLSearchParams(u$c());n.forEach((e,r)=>{const a=r.split("sap-").length;a===0||a===r.split("sap-ui-").length||g$9(r,e,"sap");}),n.forEach((e,r)=>{r.startsWith("sap-ui")&&g$9(r,e,"sap-ui");});},E$3=n=>{const e=n.split("@")[1];return g$a(e)},P$5=(n,e)=>n==="theme"&&e.includes("@")?e.split("@")[0]:e,g$9=(n,e,r)=>{const a=e.toLowerCase(),s=n.split(`${r}-`)[1];i$f.has(e)&&(e=i$f.get(a)),s==="theme"?(t$l.theme=P$5(s,e),e&&e.includes("@")&&(t$l.themeRoot=E$3(e))):t$l[s]=e;},j$1=()=>{const n=n$k("OpenUI5Support");if(!n||!n.isOpenUI5Detected())return;const e=n.getConfigurationSettingsObject();t$l=e$g(t$l,e);},o$f=()=>{typeof document>"u"||p$4||(l$e(),p$4=true);},l$e=n=>{w$7(),z$2(),j$1();};

  i$g(()=>{});

  var s$k=(i=>(i.Gregorian="Gregorian",i.Islamic="Islamic",i.Japanese="Japanese",i.Buddhist="Buddhist",i.Persian="Persian",i))(s$k||{});

  i$g(()=>{});

  let t$k;let a$c = class a{static getLegacyDateCalendarCustomizing(){return t$k===void 0&&(t$k=M$3()),t$k.legacyDateCalendarCustomizing||[]}};s$n("LegacyDateFormats",a$c);

  i$g(()=>{});const i$e=n$k("LegacyDateFormats");i$e?a$c.getLegacyDateCalendarCustomizing:()=>[];

  let l$d = class l{constructor(){this.list=[],this.lookup=new Set;}add(t){this.lookup.has(t)||(this.list.push(t),this.lookup.add(t));}remove(t){this.lookup.has(t)&&(this.list=this.list.filter(e=>e!==t),this.lookup.delete(t));}shift(){const t=this.list.shift();if(t)return this.lookup.delete(t),t}isEmpty(){return this.list.length===0}isAdded(t){return this.lookup.has(t)}process(t){let e;const s=new Map;for(e=this.shift();e;){const i=s.get(e)||0;if(i>10)throw new Error("Web component processed too many times this task, max allowed is: 10");t(e),s.set(e,i+1),e=this.shift();}}};

  const o$e=(t,n=document.body,r)=>{let e=document.querySelector(t);return e||(e=r?r():document.createElement(t),n.insertBefore(e,n.firstChild))};

  const u$a=()=>{const t=document.createElement("meta");return t.setAttribute("name","ui5-shared-resources"),t.setAttribute("content",""),t},l$c=()=>typeof document>"u"?null:o$e('meta[name="ui5-shared-resources"]',document.head,u$a),m$a=(t,o)=>{const r=t.split(".");let e=l$c();if(!e)return o;for(let n=0;n<r.length;n++){const s=r[n],c=n===r.length-1;Object.prototype.hasOwnProperty.call(e,s)||(e[s]=c?o:{}),e=e[s];}return e};

  const e$c={version:"2.17.0",major:2,minor:17,patch:0,suffix:"",isNext:false,buildTime:1765979913};

  let s$j,t$j={include:[/^ui5-/],exclude:[]};const o$d=new Map,c$b=()=>s$j,m$9=()=>t$j,i$d=e=>{if(!o$d.has(e)){const n=t$j.include.some(r=>e.match(r))&&!t$j.exclude.some(r=>e.match(r));o$d.set(e,n);}return o$d.get(e)},g$8=e=>{if(i$d(e))return c$b()};

  let i$c,s$i="";const u$9=new Map,r$h=m$a("Runtimes",[]),x$2=()=>{if(i$c===void 0){i$c=r$h.length;const e=e$c;r$h.push({...e,get scopingSuffix(){return c$b()},get registeredTags(){return T$3()},get scopingRules(){return m$9()},alias:s$i,description:`Runtime ${i$c} - ver ${e.version}${""}`});}},I$4=()=>i$c,b$6=(e,m)=>{const o=`${e},${m}`;if(u$9.has(o))return u$9.get(o);const t=r$h[e],n=r$h[m];if(!t||!n)throw new Error("Invalid runtime index supplied");if(t.isNext||n.isNext)return t.buildTime-n.buildTime;const c=t.major-n.major;if(c)return c;const a=t.minor-n.minor;if(a)return a;const f=t.patch-n.patch;if(f)return f;const l=new Intl.Collator(void 0,{numeric:true,sensitivity:"base"}).compare(t.suffix,n.suffix);return u$9.set(o,l),l},$$3=()=>r$h;

  const g$7=m$a("Tags",new Map),d$9=new Set;let i$b=new Map,c$a;const m$8=-1,h$7=e=>{d$9.add(e),g$7.set(e,I$4());},w$6=e=>d$9.has(e),T$3=()=>[...d$9.values()],$$2=e=>{let n=g$7.get(e);n===void 0&&(n=m$8),i$b.has(n)||i$b.set(n,new Set),i$b.get(n).add(e),c$a||(c$a=setTimeout(()=>{y$7(),i$b=new Map,c$a=void 0;},1e3));},y$7=()=>{const e=$$3(),n=I$4(),l=e[n];let t="Multiple UI5 Web Components instances detected.";e.length>1&&(t=`${t}
Loading order (versions before 1.1.0 not listed): ${e.map(s=>`
${s.description}`).join("")}`),[...i$b.keys()].forEach(s=>{let o,r;s===m$8?(o=1,r={description:"Older unknown runtime"}):(o=b$6(n,s),r=e[s]);let a;o>0?a="an older":o<0?a="a newer":a="the same",t=`${t}

"${l.description}" failed to define ${i$b.get(s).size} tag(s) as they were defined by a runtime of ${a} version "${r.description}": ${[...i$b.get(s)].sort().join(", ")}.`,o>0?t=`${t}
WARNING! If your code uses features of the above web components, unavailable in ${r.description}, it might not work as expected!`:t=`${t}
Since the above web components were defined by the same or newer version runtime, they should be compatible with your code.`;}),t=`${t}

To prevent other runtimes from defining tags that you use, consider using scoping or have third-party libraries use scoping: https://github.com/UI5/webcomponents/blob/main/docs/2-advanced/06-scoping.md.`,console.warn(t);};

  const t$i=new Set,n$i=e=>{t$i.add(e);},r$g=e=>t$i.has(e);

  const s$h=new Set,d$8=new i$h,n$h=new l$d;let t$h,a$b,m$7,i$a;const l$b=async e=>{n$h.add(e),await P$4();},c$9=e=>{d$8.fireEvent("beforeComponentRender",e),s$h.add(e),e._render();},h$6=e=>{n$h.remove(e),s$h.delete(e);},P$4=async()=>{i$a||(i$a=new Promise(e=>{window.requestAnimationFrame(()=>{n$h.process(c$9),i$a=null,e(),m$7||(m$7=setTimeout(()=>{m$7=void 0,n$h.isEmpty()&&U$2();},200));});})),await i$a;},y$6=()=>t$h||(t$h=new Promise(e=>{a$b=e,window.requestAnimationFrame(()=>{n$h.isEmpty()&&(t$h=void 0,e());});}),t$h),I$3=()=>{const e=T$3().map(r=>customElements.whenDefined(r));return Promise.all(e)},f$8=async()=>{await I$3(),await y$6();},U$2=()=>{n$h.isEmpty()&&a$b&&(a$b(),a$b=void 0,t$h=void 0);},C$3=async e=>{s$h.forEach(r=>{const o=r.constructor,u=o.getMetadata().getTag(),w=r$g(o),p=o.getMetadata().isLanguageAware(),E=o.getMetadata().isThemeAware();(!e||e.tag===u||e.rtlAware&&w||e.languageAware&&p||e.themeAware&&E)&&l$b(r);}),await f$8();};

  const g$6=typeof document>"u",i$9=(e,t)=>t?`${e}|${t}`:e,l$a=e=>e===void 0?true:b$6(I$4(),parseInt(e))===1,c$8=(e,t,r="",s)=>{const d=I$4(),n=new CSSStyleSheet;n.replaceSync(e),n._ui5StyleId=i$9(t,r),s&&(n._ui5RuntimeIndex=d,n._ui5Theme=s),document.adoptedStyleSheets=[...document.adoptedStyleSheets,n];},y$5=(e,t,r="",s)=>{const d=I$4(),n=document.adoptedStyleSheets.find(o=>o._ui5StyleId===i$9(t,r));if(n)if(!s)n.replaceSync(e||"");else {const o=n._ui5RuntimeIndex;(n._ui5Theme!==s||l$a(o))&&(n.replaceSync(e||""),n._ui5RuntimeIndex=String(d),n._ui5Theme=s);}},S$5=(e,t="")=>g$6?true:!!document.adoptedStyleSheets.find(r=>r._ui5StyleId===i$9(e,t)),f$7=(e,t="")=>{document.adoptedStyleSheets=document.adoptedStyleSheets.filter(r=>r._ui5StyleId!==i$9(e,t));},R$3=(e,t,r="",s)=>{S$5(t,r)?y$5(e,t,r,s):c$8(e,t,r,s);},m$6=(e,t)=>e===void 0?t:t===void 0?e:`${e} ${t}`;

  const t$g=new i$h,r$f="themeRegistered",n$g=e=>{t$g.attachEvent(r$f,e);};

  const l$9=new Map,h$5=new Map,u$8=new Map,T$2=new Set,i$8=new Set,m$5=async(e,r,t)=>{const g=`${e}_${r}_${t||""}`,s=l$9.get(g);if(s!==void 0)return s;if(!i$8.has(r)){const $=[...i$8.values()].join(", ");return console.warn(`You have requested a non-registered theme ${r} - falling back to ${e$e}. Registered themes are: ${$}`),a$a(e,e$e)}const[n,d]=await Promise.all([a$a(e,r),t?a$a(e,t,true):void 0]),o=m$6(n,d);return o&&l$9.set(g,o),o},a$a=async(e,r,t=false)=>{const s=(t?u$8:h$5).get(`${e}/${r}`);if(!s){t||console.error(`Theme [${r}] not registered for package [${e}]`);return}let n;try{n=await s(r);}catch(d){console.error(e,d.message);return}return n},w$5=()=>T$2,P$3=e=>i$8.has(e);

  const r$e=new Set,s$g=()=>{let e=document.querySelector(".sapThemeMetaData-Base-baseLib")||document.querySelector(".sapThemeMetaData-UI5-sap-ui-core");if(e)return getComputedStyle(e).backgroundImage;e=document.createElement("span"),e.style.display="none",e.classList.add("sapThemeMetaData-Base-baseLib"),document.body.appendChild(e);let t=getComputedStyle(e).backgroundImage;return t==="none"&&(e.classList.add("sapThemeMetaData-UI5-sap-ui-core"),t=getComputedStyle(e).backgroundImage),document.body.removeChild(e),t},o$c=e=>{const t=/\(["']?data:text\/plain;utf-8,(.*?)['"]?\)$/i.exec(e);if(t&&t.length>=2){let a=t[1];if(a=a.replace(/\\"/g,'"'),a.charAt(0)!=="{"&&a.charAt(a.length-1)!=="}")try{a=decodeURIComponent(a);}catch{r$e.has("decode")||(console.warn("Malformed theme metadata string, unable to decodeURIComponent"),r$e.add("decode"));return}try{return JSON.parse(a)}catch{r$e.has("parse")||(console.warn("Malformed theme metadata string, unable to parse JSON"),r$e.add("parse"));}}},d$7=e=>{let t,a;try{const n=e.Path.split(".");t=n.length===4?n[2]:getComputedStyle(document.body).getPropertyValue("--sapSapThemeId"),a=e.Extends[0];}catch{r$e.has("object")||(console.warn("Malformed theme metadata Object",e),r$e.add("object"));return}return {themeName:t,baseThemeName:a}},m$4=()=>{const e=s$g();if(!e||e==="none")return;const t=o$c(e);if(t)return d$7(t)};

  const t$f=new i$h,d$6="themeLoaded",r$d=e=>t$f.fireEvent(d$6,e);

  const d$5=(r,n)=>{const e=document.createElement("link");return e.type="text/css",e.rel="stylesheet",n&&Object.entries(n).forEach(t=>e.setAttribute(...t)),e.href=r,document.head.appendChild(e),new Promise(t=>{e.addEventListener("load",t),e.addEventListener("error",t);})};

  let t$e;i$g(()=>{t$e=void 0;});const n$f=()=>(t$e===void 0&&(t$e=S$6()),t$e),u$7=e=>`${n$f()}Base/baseLib/${e}/css_variables.css`,i$7=async e=>{const o=document.querySelector(`[sap-ui-webcomponents-theme="${e}"]`);o&&document.head.removeChild(o),await d$5(u$7(e),{"sap-ui-webcomponents-theme":e});};

  let _lib="ui5",_package="webcomponents-theming";const s$f="@"+_lib+"/"+_package,S$4=()=>w$5().has(s$f),P$2=async e=>{if(!S$4())return;const t=await m$5(s$f,e);t&&R$3(t,"data-ui5-theme-properties",s$f,e);},E$2=()=>{f$7("data-ui5-theme-properties",s$f);},U$1=async(e,t)=>{const o=[...w$5()].map(async a=>{if(a===s$f)return;const i=await m$5(a,e,t);i&&R$3(i,`data-ui5-component-properties-${I$4()}`,a);});return Promise.all(o)},k$2=async e=>{const t=m$4();if(t)return t;const r=n$k("OpenUI5Support");if(r&&r.isOpenUI5Detected()){if(r.cssVariablesLoaded())return {themeName:r.getConfigurationSettingsObject()?.theme,baseThemeName:""}}else if(n$f())return await i$7(e),m$4()},w$4=async e=>{const t=await k$2(e);!t||e!==t.themeName?await P$2(e):E$2();const r=P$3(e)?e:t&&t.baseThemeName;await U$1(r||e$e,t&&t.themeName===e?e:void 0),r$d(e);};

  const d$4=()=>new Promise(e=>{document.body?e():document.addEventListener("DOMContentLoaded",()=>{e();});});

  var n$e = `@font-face{font-family:"72";font-style:normal;font-weight:400;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Regular.woff2) format("woff2"),local("72");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72full";font-style:normal;font-weight:400;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Regular-full.woff2) format("woff2")}
@font-face{font-family:"72-Bold";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Bold.woff2) format("woff2"),local("72-Bold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:700;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Bold.woff2) format("woff2"),local("72-Bold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72-Boldfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Bold-full.woff2) format("woff2")}
@font-face{font-family:"72full";font-style:normal;font-weight:700;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Bold-full.woff2) format("woff2")}
@font-face{font-family:"72-Semibold";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Semibold.woff2) format("woff2"),local("72-Semibold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:600;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Semibold.woff2) format("woff2"),local("72-Semibold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72-Semiboldfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Semibold-full.woff2) format("woff2")}
@font-face{font-family:"72full";font-style:normal;font-weight:600;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Semibold-full.woff2) format("woff2")}
@font-face{font-family:"72-SemiboldDuplex";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-SemiboldDuplex.woff2) format("woff2"),local("72-SemiboldDuplex");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72-SemiboldDuplexfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-SemiboldDuplex-full.woff2) format("woff2")}
@font-face{font-family:"72-Light";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Light.woff2) format("woff2"),local("72-Light");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:300;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Light.woff2) format("woff2"),local("72-Light");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72-Lightfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Light-full.woff2) format("woff2")}
@font-face{font-family:"72full";font-style:normal;font-weight:300;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Light-full.woff2) format("woff2")}
@font-face{font-family:"72Black";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Black.woff2) format("woff2"),local("72Black");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+160-161,U+178,U+17D-17E,U+192,U+237,U+2C6-2C7,U+2DC,U+3BC,U+1E0E,U+2013-2014,U+2018-2019,U+201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:900;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Black.woff2) format("woff2"),local("72Black");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+160-161,U+178,U+17D-17E,U+192,U+237,U+2C6-2C7,U+2DC,U+3BC,U+1E0E,U+2013-2014,U+2018-2019,U+201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72Blackfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Black-full.woff2) format("woff2")}
@font-face{font-family:"72full";font-style:normal;font-weight:900;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Black-full.woff2) format("woff2")}
@font-face{font-family:"72-BoldItalic";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-BoldItalic.woff2) format("woff2"),local("72-BoldItalic");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:italic;font-weight:700;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-BoldItalic.woff2) format("woff2"),local("72-BoldItalic");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72full";font-style:italic;font-weight:700;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-BoldItalic-full.woff2) format("woff2")}
@font-face{font-family:"72-Condensed";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Condensed.woff2) format("woff2"),local("72-Condensed");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:400;font-stretch:condensed;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Condensed.woff2) format("woff2"),local("72-Condensed");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:400;font-stretch:condensed;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Condensed-full.woff2) format("woff2");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72-CondensedBold";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-CondensedBold.woff2) format("woff2"),local("72-CondensedBold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:normal;font-weight:700;font-stretch:condensed;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-CondensedBold.woff2) format("woff2"),local("72-CondensedBold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72full";font-style:normal;font-weight:700;font-stretch:condensed;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-CondensedBold-full.woff2) format("woff2")}
@font-face{font-family:"72-Italic";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Italic.woff2) format("woff2"),local("72-Italic");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72";font-style:italic;font-weight:400;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Italic.woff2) format("woff2"),local("72-Italic");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72full";font-style:italic;font-weight:400;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Italic-full.woff2) format("woff2")}
@font-face{font-family:"72Mono";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72Mono-Regular.woff2) format("woff2"),local("72Mono");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72Monofull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72Mono-Regular-full.woff2) format("woff2")}
@font-face{font-family:"72Mono-Bold";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72Mono-Bold.woff2) format("woff2"),local("72Mono-Bold");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
@font-face{font-family:"72Mono-Boldfull";src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72Mono-Bold-full.woff2) format("woff2")}`;

  let o$b;i$g(()=>{o$b=void 0;});const a$9=()=>(o$b===void 0&&(o$b=U$3()),o$b);

  const a$8=()=>{const t=n$k("OpenUI5Support");(!t||!t.isOpenUI5Detected())&&f$6();},f$6=()=>{const t=document.querySelector("head>style[data-ui5-font-face]");!a$9()||t||S$5("data-ui5-font-face")||c$8(n$e,"data-ui5-font-face");};

  var a$7 = ":root{--_ui5_content_density:cozy}.sapUiSizeCompact,.ui5-content-density-compact,[data-ui5-compact-size]{--_ui5_content_density:compact}";

  const e$b=()=>{S$5("data-ui5-system-css-vars")||c$8(a$7,"data-ui5-system-css-vars");};

  var t$d = "html:not(.ui5-content-native-scrollbars){scrollbar-color:var(--sapScrollBar_FaceColor) var(--sapScrollBar_TrackColor)}";

  const s$e=()=>{S$5("data-ui5-scrollbar-styles")||c$8(t$d,"data-ui5-scrollbar-styles");};

  const t$c=typeof document>"u",e$a={get userAgent(){return t$c?"":navigator.userAgent},get chrome(){return t$c?false:/(Chrome|CriOS)/.test(e$a.userAgent)},get safari(){return t$c?false:!e$a.chrome&&/(Version|PhantomJS)\/(\d+\.\d+).*Safari/.test(e$a.userAgent)},get iOS(){return t$c?false:!!navigator.platform.match(/iPhone|iPad|iPod/)||!!(e$a.userAgent.match(/Mac/)&&"ontouchend"in document)}};const h$4=()=>e$a.safari,w$3=()=>e$a.iOS;

  let t$b=false;const i$6=()=>{h$4()&&w$3()&&!t$b&&(document.body.addEventListener("touchstart",()=>{}),t$b=true);};

  let o$a=false,r$c;const p$3=new i$h,b$5=async()=>{if(r$c!==void 0)return r$c;const t=async n=>{if(x$2(),typeof document>"u"){n();return}n$g(F$1);const e=n$k("OpenUI5Support"),f=e?e.isOpenUI5Detected():false,s=n$k("F6Navigation");e&&await e.init(),s&&!f&&s.init(),await d$4(),await w$4(r$b()),e&&e.attachListeners(),a$8(),e$b(),s$e(),i$6(),n(),o$a=true,p$3.fireEvent("boot");};return r$c=new Promise(t),r$c},F$1=t=>{o$a&&t===r$b()&&w$4(r$b());};

  let t$a;i$g(()=>{t$a=void 0;});const r$b=()=>(t$a===void 0&&(t$a=T$4()),t$a);

  var t$9=(o=>(o.SAPIconsV4="SAP-icons-v4",o.SAPIconsV5="SAP-icons-v5",o.SAPIconsTNTV2="tnt-v2",o.SAPIconsTNTV3="tnt-v3",o.SAPBSIconsV1="business-suite-v1",o.SAPBSIconsV2="business-suite-v2",o))(t$9||{});const s$d=new Map;s$d.set("SAP-icons",{legacy:"SAP-icons-v4",sap_horizon:"SAP-icons-v5"}),s$d.set("tnt",{legacy:"tnt-v2",sap_horizon:"tnt-v3"}),s$d.set("business-suite",{legacy:"business-suite-v1",sap_horizon:"business-suite-v2"});

  var t$8=(s=>(s["SAP-icons"]="SAP-icons-v4",s.horizon="SAP-icons-v5",s["SAP-icons-TNT"]="tnt",s.BusinessSuiteInAppSymbols="business-suite",s))(t$8||{});

  const t$7=typeof document>"u",o$9=()=>{if(t$7)return a$e;const a=navigator.languages,n=()=>navigator.language;return a&&a[0]||n()||a$e};

  const e$9=new i$h,n$d="languageChange",t$6=a=>{e$9.attachEvent(n$d,a);};

  let e$8,t$5;i$g(()=>{e$8=void 0,t$5=void 0;});let a$6=false;const s$c=()=>a$6,l$8=()=>(e$8===void 0&&(e$8=L$4()),e$8),h$3=()=>(t$5===void 0&&(t$5=R$4()),t$5);

  const n$c=/^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;let r$a = class r{constructor(s){const t=n$c.exec(s.replace(/_/g,"-"));if(t===null)throw new Error(`The given language ${s} does not adhere to BCP-47.`);this.sLocaleId=s,this.sLanguage=t[1]||a$e,this.sScript=t[2]||"",this.sRegion=t[3]||"",this.sVariant=t[4]&&t[4].slice(1)||null,this.sExtension=t[5]&&t[5].slice(1)||null,this.sPrivateUse=t[6]||null,this.sLanguage&&(this.sLanguage=this.sLanguage.toLowerCase()),this.sScript&&(this.sScript=this.sScript.toLowerCase().replace(/^[a-z]/,i=>i.toUpperCase())),this.sRegion&&(this.sRegion=this.sRegion.toUpperCase());}getLanguage(){return this.sLanguage}getScript(){return this.sScript}getRegion(){return this.sRegion}getVariant(){return this.sVariant}getVariantSubtags(){return this.sVariant?this.sVariant.split("-"):[]}getExtension(){return this.sExtension}getExtensionSubtags(){return this.sExtension?this.sExtension.slice(2).split("-"):[]}getPrivateUse(){return this.sPrivateUse}getPrivateUseSubtags(){return this.sPrivateUse?this.sPrivateUse.slice(2).split("-"):[]}hasPrivateUseSubtag(s){return this.getPrivateUseSubtags().indexOf(s)>=0}toString(){const s=[this.sLanguage];return this.sScript&&s.push(this.sScript),this.sRegion&&s.push(this.sRegion),this.sVariant&&s.push(this.sVariant),this.sExtension&&s.push(this.sExtension),this.sPrivateUse&&s.push(this.sPrivateUse),s.join("-")}};

  const r$9=new Map,n$b=t=>(r$9.has(t)||r$9.set(t,new r$a(t)),r$9.get(t)),c$7=t=>{try{if(t&&typeof t=="string")return n$b(t)}catch{}return new r$a(r$i)},s$b=t=>{const e=l$8();return e?n$b(e):c$7(o$9())};

  const _$2=/^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i,c$6=/(?:^|-)(saptrc|sappsd)(?:-|$)/i,f$5={he:"iw",yi:"ji",nb:"no",sr:"sh"},p$2=i=>{let e;if(!i)return r$i;if(typeof i=="string"&&(e=_$2.exec(i.replace(/_/g,"-")))){let t=e[1].toLowerCase(),n=e[3]?e[3].toUpperCase():void 0;const s=e[2]?e[2].toLowerCase():void 0,r=e[4]?e[4].slice(1):void 0,o=e[6];return t=f$5[t]||t,o&&(e=c$6.exec(o))||r&&(e=c$6.exec(r))?`en_US_${e[1].toLowerCase()}`:(t==="zh"&&!n&&(s==="hans"?n="CN":s==="hant"&&(n="TW")),t+(n?"_"+n+(r?"_"+r.replace("-","_"):""):""))}return r$i};

  const r$8={zh_HK:"zh_TW",in:"id"},n$a=t=>{if(!t)return r$i;if(r$8[t])return r$8[t];const L=t.lastIndexOf("_");return L>=0?t.slice(0,L):t!==r$i?r$i:""};

  const d$3=new Set,m$3=new Set,g$5=new Map,l$7=new Map,u$6=new Map,f$4=(n,t)=>{g$5.set(n,t);},A$2=n=>g$5.get(n),h$2=(n,t)=>{const e=`${n}/${t}`;return u$6.has(e)},B$2=(n,t)=>{const e=`${n}/${t}`,r=u$6.get(e);return r&&!l$7.get(e)&&l$7.set(e,r(t)),l$7.get(e)},M$2=n=>{d$3.has(n)||(console.warn(`[${n}]: Message bundle assets are not configured. Falling back to English texts.`,` Add \`import "${n}/dist/Assets.js"\` in your bundle and make sure your build tool supports dynamic imports and JSON imports. See section "Assets" in the documentation for more information.`),d$3.add(n));},L$3=(n,t)=>t!==a$e&&!h$2(n,t),w$2=async n=>{const t=s$b().getLanguage(),e=s$b().getRegion(),r=s$b().getVariant();let s=t+(e?`-${e}`:"")+(r?`-${r}`:"");if(L$3(n,s))for(s=p$2(s);L$3(n,s);)s=n$a(s);const I=h$3();if(s===a$e&&!I){f$4(n,null);return}if(!h$2(n,s)){M$2(n);return}try{const o=await B$2(n,s);f$4(n,o);}catch(o){const a=o;m$3.has(a.message)||(m$3.add(a.message),console.error(a.message));}};t$6(n=>{const t=[...g$5.keys()];return Promise.all(t.map(w$2))});

  const g$4=/('')|'([^']+(?:''[^']*)*)(?:'|$)|\{([0-9]+(?:\s*,[^{}]*)?)\}|[{}]/g,i$5=(n,t)=>(t=t||[],n.replace(g$4,(p,s,e,r,o)=>{if(s)return "'";if(e)return e.replace(/''/g,"'");if(r){const a=typeof r=="string"?parseInt(r):r;return String(t[a])}throw new Error(`[i18n]: pattern syntax error at pos ${o}`)}));

  const r$7=new Map;let u$5 = class u{constructor(e){this.packageName=e;}getText(e,...i){if(typeof e=="string"&&(e={key:e,defaultText:e}),!e||!e.key)return "";const t=A$2(this.packageName);t&&!t[e.key]&&console.warn(`Key ${e.key} not found in the i18n bundle, the default text will be used`);const l=t&&t[e.key]?t[e.key]:e.defaultText||e.key;return i$5(l,i)}};const a$5=n=>{if(r$7.has(n))return r$7.get(n);const e=new u$5(n);return r$7.set(n,e),e},f$3=async n=>(await w$2(n),a$5(n));

  const c$5=["value-changed","click"];let e$7;i$g(()=>{e$7=void 0;});const s$a=t=>c$5.includes(t),l$6=t=>{const n=o$8();return !(typeof n!="boolean"&&n.events&&n.events.includes&&n.events.includes(t))},o$8=()=>(e$7===void 0&&(e$7=F$2()),e$7),a$4=t=>{const n=o$8();return s$a(t)?false:n===true?true:!l$6(t)};

  var r$6=(l=>(l.Auto="Auto",l.Vertical="Vertical",l.Horizontal="Horizontal",l.Paging="Paging",l))(r$6||{});

  var l$5=(c=>(c.Static="Static",c.Cyclic="Cyclic",c))(l$5||{});

  const s$9=new Map,o$7=new Map,n$9=new Map,c$4=e=>{if(!s$9.has(e)){const a=b$4(e.split("-"));s$9.set(e,a);}return s$9.get(e)},l$4=e=>{if(!o$7.has(e)){const a=e.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();o$7.set(e,a);}return o$7.get(e)},b$4=e=>e.map((a,t)=>t===0?a.toLowerCase():a.charAt(0).toUpperCase()+a.slice(1).toLowerCase()).join(""),C$2=e=>{const a=n$9.get(e);if(a)return a;const t=c$4(e),r=t.charAt(0).toUpperCase()+t.slice(1);return n$9.set(e,r),r};

  const o$6=t=>{if(!(t instanceof HTMLElement))return "default";const e=t.getAttribute("slot");if(e){const r=e.match(/^(.+?)-\d+$/);return r?r[1]:e}return "default"},n$8=t=>t instanceof HTMLSlotElement?t.assignedNodes({flatten:true}).filter(e=>e instanceof HTMLElement):[t],s$8=t=>t.reduce((e,r)=>e.concat(n$8(r)),[]);

  let u$4 = class u{constructor(t){this.metadata=t;}getInitialState(){if(Object.prototype.hasOwnProperty.call(this,"_initialState"))return this._initialState;const t={};if(this.slotsAreManaged()){const o=this.getSlots();for(const[e,s]of Object.entries(o)){const n=s.propertyName||e;t[n]=[],t[c$4(n)]=t[n];}}return this._initialState=t,t}static validateSlotValue(t,a){return g$3(t,a)}getPureTag(){return this.metadata.tag||""}getTag(){const t=this.metadata.tag;if(!t)return "";const a=g$8(t);return a?`${t}-${a}`:t}hasAttribute(t){const a=this.getProperties()[t];return a.type!==Object&&a.type!==Array&&!a.noAttribute}getPropertiesList(){return Object.keys(this.getProperties())}getAttributesList(){return this.getPropertiesList().filter(this.hasAttribute.bind(this)).map(l$4)}canSlotText(){return this.getSlots().default?.type===Node}hasSlots(){return !!Object.entries(this.getSlots()).length}hasIndividualSlots(){return this.slotsAreManaged()&&Object.values(this.getSlots()).some(t=>t.individualSlots)}slotsAreManaged(){return !!this.metadata.managedSlots}supportsF6FastNavigation(){return !!this.metadata.fastNavigation}getProperties(){return this.metadata.properties||(this.metadata.properties={}),this.metadata.properties}getEvents(){return this.metadata.events||(this.metadata.events={}),this.metadata.events}getSlots(){return this.metadata.slots||(this.metadata.slots={}),this.metadata.slots}isLanguageAware(){return !!this.metadata.languageAware}isThemeAware(){return !!this.metadata.themeAware}needsCLDR(){return !!this.metadata.cldr}getShadowRootOptions(){return this.metadata.shadowRootOptions||{}}isFormAssociated(){return !!this.metadata.formAssociated}shouldInvalidateOnChildChange(t,a,o){const e=this.getSlots()[t].invalidateOnChildChange;if(e===void 0)return  false;if(typeof e=="boolean")return e;if(typeof e=="object"){if(a==="property"){if(e.properties===void 0)return  false;if(typeof e.properties=="boolean")return e.properties;if(Array.isArray(e.properties))return e.properties.includes(o);throw new Error("Wrong format for invalidateOnChildChange.properties: boolean or array is expected")}if(a==="slot"){if(e.slots===void 0)return  false;if(typeof e.slots=="boolean")return e.slots;if(Array.isArray(e.slots))return e.slots.includes(o);throw new Error("Wrong format for invalidateOnChildChange.slots: boolean or array is expected")}}throw new Error("Wrong format for invalidateOnChildChange: boolean or object is expected")}getI18n(){return this.metadata.i18n||(this.metadata.i18n={}),this.metadata.i18n}};const g$3=(r,t)=>(r&&n$8(r).forEach(a=>{if(!(a instanceof t.type))throw new Error(`The element is not of type ${t.type.toString()}`)}),r);

  const r$5=()=>m$a("CustomStyle.eventProvider",new i$h),n$7="CustomCSSChange",i$4=t=>{r$5().attachEvent(n$7,t);},c$3=()=>m$a("CustomStyle.customCSSFor",{});i$4(t=>{C$3({tag:t});});const l$3=t=>{const e=c$3();return e[t]?e[t].join(""):""};

  const e$6=t=>Array.isArray(t)?t.filter(r=>!!r).flat(10).join(" "):t;

  const e$5=new Map;i$4(t=>{e$5.delete(`${t}_normal`);});const y$4=t=>{const o=t.getMetadata().getTag(),n=`${o}_normal`,s=n$k("OpenUI5Enablement");if(!e$5.has(n)){let l="";s&&(l=e$6(s.getBusyIndicatorStyles()));const a=l$3(o)||"",m=`${e$6(t.styles)} ${a} ${l}`;e$5.set(n,m);}return e$5.get(n)};

  const e$4=new Map;i$4(t=>{e$4.delete(`${t}_normal`);});const s$7=t=>{const n=`${t.getMetadata().getTag()}_normal`;if(!e$4.has(n)){const a=y$4(t),o=new CSSStyleSheet;o.replaceSync(a),e$4.set(n,[o]);}return e$4.get(n)};

  const s$6=o=>{const e=o.constructor,t=o.shadowRoot;if(!t){console.warn("There is no shadow root to update");return}t.adoptedStyleSheets=s$7(e),e.renderer(o,t);};

  const r$4=[],o$5=t=>r$4.some(s=>t.startsWith(s));

  const t$4=new WeakMap,n$6=(e,o,r)=>{const s=new MutationObserver(o);t$4.set(e,s),s.observe(e,r);},b$3=e=>{const o=t$4.get(e);o&&(o.disconnect(),t$4.delete(e));};

  const r$3=t=>t.matches(":dir(rtl)")?"rtl":"ltr";

  const s$5=["disabled","title","hidden","role","draggable"],r$2=e=>s$5.includes(e)||e.startsWith("aria")?true:![HTMLElement,Element,Node].some(t=>t.prototype.hasOwnProperty(e));

  const n$5=(t,r)=>{if(t.length!==r.length)return  false;for(let e=0;e<t.length;e++)if(t[e]!==r[e])return  false;return  true};

  const n$4=(e,t)=>e.call(t);

  const o$4=t=>{s$4(t)&&e$3(t);},e$3=t=>{if(t._internals?.form){if(n$3(t),!t.name){t._internals?.setFormValue(null);return}t._internals.setFormValue(t.formFormattedValue);}},n$3=async t=>{if(t._internals?.form)if(t.formValidity&&Object.keys(t.formValidity).some(r=>r)){const r=await t.formElementAnchor?.();t._internals.setValidity(t.formValidity,t.formValidityMessage,r);}else t._internals.setValidity({});},s$4=t=>"formFormattedValue"in t&&"name"in t;

  const f$2=new Map,s$3=new Map,i$3=new Map,L$2=new Set;let d$2=false;const O$2={iw:"he",ji:"yi",in:"id"},D$1=t=>{d$2||(console.warn(`[LocaleData] Supported locale "${t}" not configured, import the "Assets.js" module from the webcomponents package you are using.`),d$2=true);},y$3=(t,e,n)=>{t=t&&O$2[t]||t,t==="no"&&(t="nb"),t==="zh"&&!e&&(n==="Hans"?e="CN":n==="Hant"&&(e="TW")),(t==="sh"||t==="sr"&&n==="Latn")&&(t="sr",e="Latn");let o=`${t}_${e}`;return l$f.includes(o)?s$3.has(o)?o:(D$1(o),r$i):(o=t,l$f.includes(o)?s$3.has(o)?o:(D$1(o),r$i):r$i)},u$3=(t,e)=>{f$2.set(t,e);},S$3=t=>{if(!i$3.get(t)){const e=s$3.get(t);if(!e)throw new Error(`CLDR data for locale ${t} is not loaded!`);i$3.set(t,e(t));}return i$3.get(t)},g$2=async(t,e,n)=>{const o=y$3(t,e,n),p=n$k("OpenUI5Support");if(p){const r=p.getLocaleDataObject();if(r){u$3(o,r);return}}try{const r=await S$3(o);u$3(o,r);}catch(r){const c=r;L$2.has(c.message)||(L$2.add(c.message),console.error(c.message));}},m$2=(t,e)=>{s$3.set(t,e);};m$2("en",async()=>(console.warn('[LocaleData] Falling back to loading "en" locale data from CDN.','For production usage, please configure locale data loading via the "Assets.js" module of the webcomponents package you are using.'),(await fetch("https://cdn.jsdelivr.net/npm/@openui5/sap.ui.core@1.120.17/src/sap/ui/core/cldr/en.json")).json())),t$6(()=>{const t=s$b();return g$2(t.getLanguage(),t.getRegion(),t.getScript())});

  let it$1=0;const R$2=new Map,I$2=new Map,O$1={fromAttribute(c,f){return f===Boolean?c!==null:f===Number?c===null?void 0:parseFloat(c):c},toAttribute(c,f){return f===Boolean?c?"":null:f===Object||f===Array||c==null?null:String(c)}};function y$2(c){this._suppressInvalidation||this.constructor.getMetadata().isLanguageAware()&&s$c()||(this.onInvalidation(c),this._changedState.push(c),l$b(this),this._invalidationEventProvider.fireEvent("invalidate",{...c,target:this}));}function at$1(c,f){do{const t=Object.getOwnPropertyDescriptor(c,f);if(t)return t;c=Object.getPrototypeOf(c);}while(c&&c!==HTMLElement.prototype)}let b$2 = class b extends HTMLElement{constructor(){super();this.__shouldHydrate=false;this._rendered=false;const t=this.constructor;this._changedState=[],this._suppressInvalidation=true,this._inDOM=false,this._fullyConnected=false,this._childChangeListeners=new Map,this._slotChangeListeners=new Map,this._invalidationEventProvider=new i$h,this._componentStateFinalizedEventProvider=new i$h;let e;this._domRefReadyPromise=new Promise(n=>{e=n;}),this._domRefReadyPromise._deferredResolve=e,this._doNotSyncAttributes=new Set,this._slotsAssignedNodes=new WeakMap,this._state={...t.getMetadata().getInitialState()},this.initializedProperties=new Map,this.constructor.getMetadata().getPropertiesList().forEach(n=>{if(this.hasOwnProperty(n)){const o=this[n];this.initializedProperties.set(n,o);}}),this._internals=this.attachInternals(),this._initShadowRoot();}_initShadowRoot(){const t=this.constructor;if(t._needsShadowDOM()){const e={mode:"open"};this.shadowRoot?this.__shouldHydrate=true:this.attachShadow({...e,...t.getMetadata().getShadowRootOptions()}),t.getMetadata().slotsAreManaged()&&this.shadowRoot.addEventListener("slotchange",this._onShadowRootSlotChange.bind(this));}}_onShadowRootSlotChange(t){t.target?.getRootNode()===this.shadowRoot&&this._processChildren();}get _id(){return this.__id||(this.__id=`ui5wc_${++it$1}`),this.__id}render(){const t=this.constructor.template;return n$4(t,this)}async connectedCallback(){const t=this.constructor;this.setAttribute(t.getMetadata().getPureTag(),""),t.getMetadata().supportsF6FastNavigation()&&!this.hasAttribute("data-sap-ui-fastnavgroup")&&this.setAttribute("data-sap-ui-fastnavgroup","true");const e=t.getMetadata().slotsAreManaged();this._inDOM=true,e&&(this._startObservingDOMChildren(),await this._processChildren()),t.asyncFinished||await t.definePromise,this._inDOM&&(c$9(this),this._domRefReadyPromise._deferredResolve(),this._fullyConnected=true,this.onEnterDOM());}disconnectedCallback(){const e=this.constructor.getMetadata().slotsAreManaged();this._inDOM=false,e&&this._stopObservingDOMChildren(),this._fullyConnected&&(this.onExitDOM(),this._fullyConnected=false),this._domRefReadyPromise._deferredResolve(),h$6(this);}onBeforeRendering(){}onAfterRendering(){}onEnterDOM(){}onExitDOM(){}_startObservingDOMChildren(){const e=this.constructor.getMetadata();if(!e.hasSlots())return;const n=e.canSlotText(),o={childList:true,subtree:n,characterData:n};n$6(this,this._processChildren.bind(this),o);}_stopObservingDOMChildren(){b$3(this);}async _processChildren(){this.constructor.getMetadata().hasSlots()&&await this._updateSlots();}async _updateSlots(){const t=this.constructor,e=t.getMetadata().getSlots(),s=t.getMetadata().canSlotText(),n=Array.from(s?this.childNodes:this.children),o=new Map,a=new Map;for(const[l,u]of Object.entries(e)){const d=u.propertyName||l;a.set(d,l),o.set(d,[...this._state[d]]),this._clearSlot(l,u);}const r=new Map,i=new Map,h=n.map(async(l,u)=>{const d=o$6(l),g=e[d];if(g===void 0){if(d!=="default"){const p=Object.keys(e).join(", ");console.warn(`Unknown slotName: ${d}, ignoring`,l,`Valid values are: ${p}`);}return}if(g.individualSlots){const p=(r.get(d)||0)+1;r.set(d,p),l._individualSlot=`${d}-${p}`;}if(l instanceof HTMLElement){const p=l.localName;if(p.includes("-")&&!o$5(p)){if(!customElements.get(p)){const L=customElements.whenDefined(p);let E=R$2.get(p);E||(E=new Promise(U=>setTimeout(U,1e3)),R$2.set(p,E)),await Promise.race([L,E]);}customElements.upgrade(l);}}if(l=t.getMetadata().constructor.validateSlotValue(l,g),v$2(l)&&g.invalidateOnChildChange){const p=this._getChildChangeListener(d);l.attachInvalidate.call(l,p);}l instanceof HTMLSlotElement&&this._attachSlotChange(l,d,!!g.invalidateOnChildChange);const C=g.propertyName||d;i.has(C)?i.get(C).push({child:l,idx:u}):i.set(C,[{child:l,idx:u}]);});await Promise.all(h),i.forEach((l,u)=>{this._state[u]=l.sort((d,g)=>d.idx-g.idx).map(d=>d.child),this._state[c$4(u)]=this._state[u];});let _=false;for(const[l,u]of Object.entries(e)){const d=u.propertyName||l;n$5(o.get(d),this._state[d])||(y$2.call(this,{type:"slot",name:a.get(d),reason:"children"}),_=true,t.getMetadata().isFormAssociated()&&e$3(this));}_||y$2.call(this,{type:"slot",name:"default",reason:"textcontent"});}_clearSlot(t,e){const s=e.propertyName||t;this._state[s].forEach(o=>{if(v$2(o)){const a=this._getChildChangeListener(t);o.detachInvalidate.call(o,a);}o instanceof HTMLSlotElement&&this._detachSlotChange(o,t);}),this._state[s]=[],this._state[c$4(s)]=this._state[s];}attachInvalidate(t){this._invalidationEventProvider.attachEvent("invalidate",t);}detachInvalidate(t){this._invalidationEventProvider.detachEvent("invalidate",t);}_onChildChange(t,e){this.constructor.getMetadata().shouldInvalidateOnChildChange(t,e.type,e.name)&&y$2.call(this,{type:"slot",name:t,reason:"childchange",child:e.target});}attributeChangedCallback(t,e,s){let n;if(this._doNotSyncAttributes.has(t))return;const o=this.constructor.getMetadata().getProperties(),a=t.replace(/^ui5-/,""),r=c$4(a);if(o.hasOwnProperty(r)){const i=o[r];n=(i.converter??O$1).fromAttribute(s,i.type),this[r]=n;}}formAssociatedCallback(){this.constructor.getMetadata().isFormAssociated()&&o$4(this);}static get formAssociated(){return this.getMetadata().isFormAssociated()}_updateAttribute(t,e){const s=this.constructor;if(!s.getMetadata().hasAttribute(t))return;const o=s.getMetadata().getProperties()[t],a=l$4(t),i=(o.converter||O$1).toAttribute(e,o.type);this._doNotSyncAttributes.add(a),i==null?this.removeAttribute(a):this.setAttribute(a,i),this._doNotSyncAttributes.delete(a);}_getChildChangeListener(t){return this._childChangeListeners.has(t)||this._childChangeListeners.set(t,this._onChildChange.bind(this,t)),this._childChangeListeners.get(t)}_getSlotChangeListener(t){return this._slotChangeListeners.has(t)||this._slotChangeListeners.set(t,this._onSlotChange.bind(this,t)),this._slotChangeListeners.get(t)}_attachSlotChange(t,e,s){const n=this._getSlotChangeListener(e);t.addEventListener("slotchange",o=>{if(n.call(t,o),s){const a=this._slotsAssignedNodes.get(t);a&&a.forEach(i=>{if(v$2(i)){const h=this._getChildChangeListener(e);i.detachInvalidate.call(i,h);}});const r=s$8([t]);this._slotsAssignedNodes.set(t,r),r.forEach(i=>{if(v$2(i)){const h=this._getChildChangeListener(e);i.attachInvalidate.call(i,h);}});}});}_detachSlotChange(t,e){t.removeEventListener("slotchange",this._getSlotChangeListener(e));}_onSlotChange(t){y$2.call(this,{type:"slot",name:t,reason:"slotchange"});}onInvalidation(t){}updateAttributes(){const e=this.constructor.getMetadata().getProperties();for(const[s,n]of Object.entries(e))this._updateAttribute(s,this[s]);}_render(){const t=this.constructor,e=t.getMetadata().hasIndividualSlots();this.initializedProperties.size>0&&(Array.from(this.initializedProperties.entries()).forEach(([s,n])=>{delete this[s],this[s]=n;}),this.initializedProperties.clear()),this._suppressInvalidation=true;try{this.onBeforeRendering(),this._rendered||this.updateAttributes(),this._componentStateFinalizedEventProvider.fireEvent("componentStateFinalized");}finally{this._suppressInvalidation=false;}this._changedState=[],t._needsShadowDOM()&&s$6(this),this._rendered=true,e&&this._assignIndividualSlotsToChildren(),this.onAfterRendering();}_assignIndividualSlotsToChildren(){Array.from(this.children).forEach(e=>{e._individualSlot&&e.setAttribute("slot",e._individualSlot);});}_waitForDomRef(){return this._domRefReadyPromise}getDomRef(){if(typeof this._getRealDomRef=="function")return this._getRealDomRef();if(!(!this.shadowRoot||this.shadowRoot.children.length===0))return this.shadowRoot.children[0]}getFocusDomRef(){const t=this.getDomRef();if(t)return t.querySelector("[data-sap-focus-ref]")||t}async getFocusDomRefAsync(){return await this._waitForDomRef(),this.getFocusDomRef()}async focus(t){await this._waitForDomRef();const e=this.getFocusDomRef();e===this||!this.isConnected?HTMLElement.prototype.focus.call(this,t):e&&typeof e.focus=="function"&&e.focus(t);}fireEvent(t,e,s=false,n=true){const o=this._fireEvent(t,e,s,n),a=C$2(t);return a!==t?o&&this._fireEvent(a,e,s,n):o}fireDecoratorEvent(t,e){const s=this.getEventData(t),n=s?s.cancelable:false,o=s?s.bubbles:false,a=this._fireEvent(t,e,n,o),r=C$2(t);return r!==t?a&&this._fireEvent(r,e,n,o):a}_fireEvent(t,e,s=false,n=true){const o=new CustomEvent(`ui5-${t}`,{detail:e,composed:false,bubbles:n,cancelable:s}),a=this.dispatchEvent(o);if(a$4(t))return a;const r=new CustomEvent(t,{detail:e,composed:false,bubbles:n,cancelable:s});return this.dispatchEvent(r)&&a}getEventData(t){return this.constructor.getMetadata().getEvents()[t]}getSlottedNodes(t){return s$8(this[t])}attachComponentStateFinalized(t){this._componentStateFinalizedEventProvider.attachEvent("componentStateFinalized",t);}detachComponentStateFinalized(t){this._componentStateFinalizedEventProvider.detachEvent("componentStateFinalized",t);}get effectiveDir(){return n$i(this.constructor),r$3(this)}get isUI5Element(){return  true}get isUI5AbstractElement(){return !this.constructor._needsShadowDOM()}get classes(){return {}}get accessibilityInfo(){}static get observedAttributes(){return this.getMetadata().getAttributesList()}static get tagsToScope(){const t=this.getMetadata().getPureTag(),e=this.getUniqueDependencies().map(s=>s.getMetadata().getPureTag()).filter(i$d);return i$d(t)&&e.push(t),e}static _needsShadowDOM(){return !!this.template||Object.prototype.hasOwnProperty.call(this.prototype,"render")}static _generateAccessors(){const t=this.prototype,e=this.getMetadata().slotsAreManaged(),s=this.getMetadata().getProperties();for(const[n,o]of Object.entries(s)){r$2(n)||console.warn(`"${n}" is not a valid property name. Use a name that does not collide with DOM APIs`);const a=at$1(t,n);let r;a?.set&&(r=a.set);let i;a?.get&&(i=a.get),Object.defineProperty(t,n,{get(){return i?i.call(this):this._state[n]},set(h){const _=this.constructor,l=i?i.call(this):this._state[n];if(l!==h){if(r?r.call(this,h):this._state[n]=h,y$2.call(this,{type:"property",name:n,newValue:h,oldValue:l}),this._rendered){const d=i?i.call(this):this._state[n];this._updateAttribute(n,d);}_.getMetadata().isFormAssociated()&&e$3(this);}}});}if(e){const n=this.getMetadata().getSlots();for(const[o,a]of Object.entries(n)){r$2(o)||console.warn(`"${o}" is not a valid property name. Use a name that does not collide with DOM APIs`);const r=a.propertyName||o,i={get(){return this._state[r]!==void 0?this._state[r]:[]},set(){throw new Error("Cannot set slot content directly, use the DOM APIs (appendChild, removeChild, etc...)")}};Object.defineProperty(t,r,i),r!==c$4(r)&&Object.defineProperty(t,c$4(r),i);}}}static{this.metadata={};}static{this.styles="";}static get dependencies(){return []}static cacheUniqueDependencies(){const t=this.dependencies.filter((e,s,n)=>n.indexOf(e)===s);I$2.set(this,t);}static getUniqueDependencies(){return I$2.has(this)||this.cacheUniqueDependencies(),I$2.get(this)||[]}static async onDefine(){return Promise.resolve()}static fetchI18nBundles(){return Promise.all(Object.entries(this.getMetadata().getI18n()).map(t=>{const{bundleName:e}=t[1];return f$3(e)}))}static fetchCLDR(){return this.getMetadata().needsCLDR()?g$2(s$b().getLanguage(),s$b().getRegion(),s$b().getScript()):Promise.resolve()}static{this.i18nBundleStorage={};}static get i18nBundles(){return this.i18nBundleStorage}static define(){const t=async()=>{await b$5();const o=await Promise.all([this.fetchI18nBundles(),this.fetchCLDR(),this.onDefine()]),[a]=o;Object.entries(this.getMetadata().getI18n()).forEach((r,i)=>{const h=r[1].bundleName;this.i18nBundleStorage[h]=a[i];}),this.asyncFinished=true;};this.definePromise=t();const e=this.getMetadata().getTag(),s=w$6(e),n=customElements.get(e);return n&&!s?$$2(e):n||(this._generateAccessors(),h$7(e),customElements.define(e,this)),this}static getMetadata(){if(this.hasOwnProperty("_metadata"))return this._metadata;const t=[this.metadata];let e=this;for(;e!==b;)e=Object.getPrototypeOf(e),t.unshift(e.metadata);const s=e$g({},...t);return this._metadata=new u$4(s),this._metadata}get validity(){return this._internals.validity}get validationMessage(){return this._internals.validationMessage}checkValidity(){return this._internals.checkValidity()}reportValidity(){return this._internals.reportValidity()}};const v$2=c=>"isUI5Element"in c;

  var cajaHtmlSanitizer = {};

  var hasRequiredCajaHtmlSanitizer;

  function requireCajaHtmlSanitizer () {
  	if (hasRequiredCajaHtmlSanitizer) return cajaHtmlSanitizer;
  	hasRequiredCajaHtmlSanitizer = 1;
  	(function() {
  	/* Copyright Google Inc.
  	 * Licensed under the Apache Licence Version 2.0
  	 * Autogenerated at Tue May 22 10:18:21 PDT 2012
  	 * \@overrides window
  	 * \@provides cssSchema, CSS_PROP_BIT_QUANTITY, CSS_PROP_BIT_HASH_VALUE, CSS_PROP_BIT_NEGATIVE_QUANTITY, CSS_PROP_BIT_QSTRING_CONTENT, CSS_PROP_BIT_QSTRING_URL, CSS_PROP_BIT_HISTORY_INSENSITIVE, CSS_PROP_BIT_Z_INDEX, CSS_PROP_BIT_ALLOWED_IN_LINK */
  	/**
  	 * @const
  	 * @type {number}
  	 */
  	var CSS_PROP_BIT_QUANTITY = 1;
  	/**
  	 * @const
  	 * @type {number}
  	 */
  	var CSS_PROP_BIT_HASH_VALUE = 2;
  	/**
  	 * @const
  	 * @type {number}
  	 */
  	var CSS_PROP_BIT_NEGATIVE_QUANTITY = 4;
  	/**
  	 * @const
  	 * @type {number}
  	 */
  	var CSS_PROP_BIT_QSTRING_CONTENT = 8;
  	/**
  	 * @const
  	 * @type {number}
  	 */
  	var CSS_PROP_BIT_QSTRING_URL = 16;
  	/**
  	 * @const
  	 * @type {number}
  	 */
  	var CSS_PROP_BIT_Z_INDEX = 64;
  	/**
  	 * @const
  	 * @type {number}
  	 */
  	var CSS_PROP_BIT_ALLOWED_IN_LINK = 128;
  	var cssSchema = (function () {
  	    var s = [
  	      'rgb(?:\\(\\s*(?:\\d+|0|\\d+(?:\\.\\d+)?%)\\s*,\\s*(?:\\d+|0|\\d+(?:\\.\\d+)?%)\\s*,\\s*(?:\\d+|0|\\d+(?:\\.\\d+)?%)|a\\(\\s*(?:\\d+|0|\\d+(?:\\.\\d+)?%)\\s*,\\s*(?:\\d+|0|\\d+(?:\\.\\d+)?%)\\s*,\\s*(?:\\d+|0|\\d+(?:\\.\\d+)?%)\\s*,\\s*(?:\\d+|0(?:\\.\\d+)?|\\.\\d+|1(?:\\.0+)?|0|\\d+(?:\\.\\d+)?%)) *\\)'
  	    ], c = [ /^ *$/i, RegExp('^ *(?:\\s*' + s[ 0 ] + '|(?:\\s*' + s[ 0 ] +
  	        ')?)+ *$', 'i'), RegExp('^ *\\s*' + s[ 0 ] + ' *$', 'i'),
  	      RegExp('^ *\\s*' + s[ 0 ] + '\\s*' + s[ 0 ] + ' *$', 'i') ], L = [ [
  	        'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige',
  	        'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown',
  	        'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral',
  	        'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue',
  	        'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkkhaki',
  	        'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred',
  	        'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray',
  	        'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray',
  	        'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia',
  	        'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green',
  	        'greenyellow', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory',
  	        'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon',
  	        'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow',
  	        'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen',
  	        'lightskyblue', 'lightslategray', 'lightsteelblue', 'lightyellow',
  	        'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine',
  	        'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen',
  	        'mediumslateblue', 'mediumspringgreen', 'mediumturquoise',
  	        'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose',
  	        'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab',
  	        'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen',
  	        'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru',
  	        'pink', 'plum', 'powderblue', 'purple', 'red', 'rosybrown',
  	        'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen',
  	        'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray',
  	        'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato',
  	        'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow',
  	        'yellowgreen' ], [ 'all-scroll', 'col-resize', 'crosshair', 'default',
  	        'e-resize', 'hand', 'help', 'move', 'n-resize', 'ne-resize', 'no-drop',
  	        'not-allowed', 'nw-resize', 'pointer', 'progress', 'row-resize',
  	        's-resize', 'se-resize', 'sw-resize', 'text', 'vertical-text',
  	        'w-resize', 'wait' ], [ '-moz-inline-box', '-moz-inline-stack',
  	        'block', 'inline', 'inline-block', 'inline-table', 'list-item',
  	        'run-in', 'table', 'table-caption', 'table-cell', 'table-column',
  	        'table-column-group', 'table-footer-group', 'table-header-group',
  	        'table-row', 'table-row-group' ], [ 'armenian', 'circle', 'decimal',
  	        'decimal-leading-zero', 'disc', 'georgian', 'lower-alpha',
  	        'lower-greek', 'lower-latin', 'lower-roman', 'square', 'upper-alpha',
  	        'upper-latin', 'upper-roman' ], [ '100', '200', '300', '400', '500',
  	        '600', '700', '800', '900', 'bold', 'bolder', 'lighter' ], [
  	        'condensed', 'expanded', 'extra-condensed', 'extra-expanded',
  	        'narrower', 'semi-condensed', 'semi-expanded', 'ultra-condensed',
  	        'ultra-expanded', 'wider' ], [ 'behind', 'center-left', 'center-right',
  	        'far-left', 'far-right', 'left-side', 'leftwards', 'right-side',
  	        'rightwards' ], [ 'large', 'larger', 'small', 'smaller', 'x-large',
  	        'x-small', 'xx-large', 'xx-small' ], [ '-moz-pre-wrap', '-o-pre-wrap',
  	        '-pre-wrap', 'nowrap', 'pre', 'pre-line', 'pre-wrap' ], [ 'dashed',
  	        'dotted', 'double', 'groove', 'outset', 'ridge', 'solid' ], [
  	        'baseline', 'middle', 'sub', 'super', 'text-bottom', 'text-top' ], [
  	        'caption', 'icon', 'menu', 'message-box', 'small-caption', 'status-bar'
  	      ], [ 'fast', 'faster', 'slow', 'slower', 'x-fast', 'x-slow' ], [ 'above',
  	        'below', 'higher', 'level', 'lower' ], [ 'border-box', 'contain',
  	        'content-box', 'cover', 'padding-box' ], [ 'cursive', 'fantasy',
  	        'monospace', 'sans-serif', 'serif' ], [ 'loud', 'silent', 'soft',
  	        'x-loud', 'x-soft' ], [ 'no-repeat', 'repeat-x', 'repeat-y', 'round',
  	        'space' ], [ 'blink', 'line-through', 'overline', 'underline' ], [
  	        'high', 'low', 'x-high', 'x-low' ], [ 'absolute', 'relative', 'static'
  	      ], [ 'capitalize', 'lowercase', 'uppercase' ], [ 'child', 'female',
  	        'male' ], [ 'bidi-override', 'embed' ], [ 'bottom', 'top' ], [ 'clip',
  	        'ellipsis' ], [ 'continuous', 'digits' ], [ 'hide', 'show' ], [
  	        'inside', 'outside' ], [ 'italic', 'oblique' ], [ 'left', 'right' ], [
  	        'ltr', 'rtl' ], [ 'no-content', 'no-display' ], [ 'suppress',
  	        'unrestricted' ], [ 'thick', 'thin' ], [ ',' ], [ '/' ], [ 'always' ],
  	      [ 'auto' ], [ 'avoid' ], [ 'both' ], [ 'break-word' ], [ 'center' ], [
  	        'code' ], [ 'collapse' ], [ 'fixed' ], [ 'hidden' ], [ 'inherit' ], [
  	        'inset' ], [ 'invert' ], [ 'justify' ], [ 'local' ], [ 'medium' ], [
  	        'mix' ], [ 'none' ], [ 'normal' ], [ 'once' ], [ 'repeat' ], [ 'scroll'
  	      ], [ 'separate' ], [ 'small-caps' ], [ 'spell-out' ], [ 'transparent' ],
  	      [ 'visible' ] ];
  	    return {
  	      '-moz-border-radius': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 36 ] ]
  	      },
  	      '-moz-border-radius-bottomleft': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5
  	      },
  	      '-moz-border-radius-bottomright': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5
  	      },
  	      '-moz-border-radius-topleft': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5
  	      },
  	      '-moz-border-radius-topright': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5
  	      },
  	      '-moz-box-shadow': {
  	        'cssExtra': c[ 1 ],
  	        'cssAlternates': [ 'boxShadow' ],
  	        'cssPropBits': 7,
  	        'cssLitGroup': [ L[ 0 ], L[ 35 ], L[ 48 ], L[ 54 ] ]
  	      },
  	      '-moz-opacity': {
  	        'cssPropBits': 1,
  	        'cssLitGroup': [ L[ 47 ] ]
  	      },
  	      '-moz-outline': {
  	        'cssExtra': c[ 3 ],
  	        'cssPropBits': 7,
  	        'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
  	            49 ], L[ 52 ], L[ 54 ] ]
  	      },
  	      '-moz-outline-color': {
  	        'cssExtra': c[ 2 ],
  	        'cssPropBits': 2,
  	        'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 49 ] ]
  	      },
  	      '-moz-outline-style': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
  	      },
  	      '-moz-outline-width': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
  	      },
  	      '-o-text-overflow': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 25 ] ]
  	      },
  	      '-webkit-border-bottom-left-radius': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5
  	      },
  	      '-webkit-border-bottom-right-radius': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5
  	      },
  	      '-webkit-border-radius': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 36 ] ]
  	      },
  	      '-webkit-border-radius-bottom-left': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5
  	      },
  	      '-webkit-border-radius-bottom-right': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5
  	      },
  	      '-webkit-border-radius-top-left': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5
  	      },
  	      '-webkit-border-radius-top-right': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5
  	      },
  	      '-webkit-border-top-left-radius': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5
  	      },
  	      '-webkit-border-top-right-radius': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5
  	      },
  	      '-webkit-box-shadow': {
  	        'cssExtra': c[ 1 ],
  	        'cssAlternates': [ 'boxShadow' ],
  	        'cssPropBits': 7,
  	        'cssLitGroup': [ L[ 0 ], L[ 35 ], L[ 48 ], L[ 54 ] ]
  	      },
  	      'azimuth': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 6 ], L[ 30 ], L[ 42 ], L[ 47 ] ]
  	      },
  	      'background': {
  	        'cssExtra': RegExp('^ *(?:\\s*' + s[ 0 ] + '){0,2} *$', 'i'),
  	        'cssPropBits': 23,
  	        'cssLitGroup': [ L[ 0 ], L[ 14 ], L[ 17 ], L[ 24 ], L[ 30 ], L[ 35 ],
  	          L[ 36 ], L[ 38 ], L[ 42 ], L[ 45 ], L[ 47 ], L[ 51 ], L[ 54 ], L[ 57
  	          ], L[ 58 ], L[ 62 ] ]
  	      },
  	      'background-attachment': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 35 ], L[ 45 ], L[ 51 ], L[ 58 ] ]
  	      },
  	      'background-color': {
  	        'cssExtra': c[ 2 ],
  	        'cssPropBits': 130,
  	        'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 62 ] ]
  	      },
  	      'background-image': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 16,
  	        'cssLitGroup': [ L[ 35 ], L[ 54 ] ]
  	      },
  	      'background-position': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 24 ], L[ 30 ], L[ 35 ], L[ 42 ] ]
  	      },
  	      'background-repeat': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 17 ], L[ 35 ], L[ 57 ] ]
  	      },
  	      'border': {
  	        'cssExtra': c[ 3 ],
  	        'cssPropBits': 7,
  	        'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
  	            52 ], L[ 54 ], L[ 62 ] ]
  	      },
  	      'border-bottom': {
  	        'cssExtra': c[ 3 ],
  	        'cssPropBits': 7,
  	        'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
  	            52 ], L[ 54 ], L[ 62 ] ]
  	      },
  	      'border-bottom-color': {
  	        'cssExtra': c[ 2 ],
  	        'cssPropBits': 2,
  	        'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 62 ] ]
  	      },
  	      'border-bottom-left-radius': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5
  	      },
  	      'border-bottom-right-radius': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5
  	      },
  	      'border-bottom-style': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
  	      },
  	      'border-bottom-width': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
  	      },
  	      'border-collapse': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 44 ], L[ 47 ], L[ 59 ] ]
  	      },
  	      'border-color': {
  	        'cssExtra': RegExp('^ *(?:\\s*' + s[ 0 ] + '){1,4} *$', 'i'),
  	        'cssPropBits': 2,
  	        'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 62 ] ]
  	      },
  	      'border-left': {
  	        'cssExtra': c[ 3 ],
  	        'cssPropBits': 7,
  	        'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
  	            52 ], L[ 54 ], L[ 62 ] ]
  	      },
  	      'border-left-color': {
  	        'cssExtra': c[ 2 ],
  	        'cssPropBits': 2,
  	        'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 62 ] ]
  	      },
  	      'border-left-style': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
  	      },
  	      'border-left-width': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
  	      },
  	      'border-radius': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 36 ] ]
  	      },
  	      'border-right': {
  	        'cssExtra': c[ 3 ],
  	        'cssPropBits': 7,
  	        'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
  	            52 ], L[ 54 ], L[ 62 ] ]
  	      },
  	      'border-right-color': {
  	        'cssExtra': c[ 2 ],
  	        'cssPropBits': 2,
  	        'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 62 ] ]
  	      },
  	      'border-right-style': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
  	      },
  	      'border-right-width': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
  	      },
  	      'border-spacing': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 47 ] ]
  	      },
  	      'border-style': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
  	      },
  	      'border-top': {
  	        'cssExtra': c[ 3 ],
  	        'cssPropBits': 7,
  	        'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
  	            52 ], L[ 54 ], L[ 62 ] ]
  	      },
  	      'border-top-color': {
  	        'cssExtra': c[ 2 ],
  	        'cssPropBits': 2,
  	        'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 62 ] ]
  	      },
  	      'border-top-left-radius': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5
  	      },
  	      'border-top-right-radius': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5
  	      },
  	      'border-top-style': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
  	      },
  	      'border-top-width': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
  	      },
  	      'border-width': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
  	      },
  	      'bottom': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
  	      },
  	      'box-shadow': {
  	        'cssExtra': c[ 1 ],
  	        'cssPropBits': 7,
  	        'cssLitGroup': [ L[ 0 ], L[ 35 ], L[ 48 ], L[ 54 ] ]
  	      },
  	      'caption-side': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 24 ], L[ 47 ] ]
  	      },
  	      'clear': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 30 ], L[ 40 ], L[ 47 ], L[ 54 ] ]
  	      },
  	      'clip': {
  	        'cssExtra':
  	        /^ *\s*rect\(\s*(?:0|[+\-]?\d+(?:\.\d+)?(?:[cem]m|ex|in|p[ctx])|auto)\s*,\s*(?:0|[+\-]?\d+(?:\.\d+)?(?:[cem]m|ex|in|p[ctx])|auto)\s*,\s*(?:0|[+\-]?\d+(?:\.\d+)?(?:[cem]m|ex|in|p[ctx])|auto)\s*,\s*(?:0|[+\-]?\d+(?:\.\d+)?(?:[cem]m|ex|in|p[ctx])|auto) *\) *$/i,
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
  	      },
  	      'color': {
  	        'cssExtra': c[ 2 ],
  	        'cssPropBits': 130,
  	        'cssLitGroup': [ L[ 0 ], L[ 47 ] ]
  	      },
  	      'content': { 'cssPropBits': 0 },
  	      'counter-increment': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
  	      },
  	      'counter-reset': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
  	      },
  	      'cue': {
  	        'cssPropBits': 16,
  	        'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
  	      },
  	      'cue-after': {
  	        'cssPropBits': 16,
  	        'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
  	      },
  	      'cue-before': {
  	        'cssPropBits': 16,
  	        'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
  	      },
  	      'cursor': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 144,
  	        'cssLitGroup': [ L[ 1 ], L[ 35 ], L[ 38 ], L[ 47 ] ]
  	      },
  	      'direction': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 31 ], L[ 47 ] ]
  	      },
  	      'display': {
  	        'cssPropBits': 32,
  	        'cssLitGroup': [ L[ 2 ], L[ 47 ], L[ 54 ] ]
  	      },
  	      'elevation': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 13 ], L[ 47 ] ]
  	      },
  	      'empty-cells': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 27 ], L[ 47 ] ]
  	      },
  	      'filter': {
  	        'cssExtra':
  	        /^ *(?:\s*alpha\(\s*opacity\s*=\s*(?:0|\d+(?:\.\d+)?%|[+\-]?\d+(?:\.\d+)?) *\))+ *$/i,
  	        'cssPropBits': 32
  	      },
  	      'float': {
  	        'cssAlternates': [ 'cssFloat', 'styleFloat' ],
  	        'cssPropBits': 32,
  	        'cssLitGroup': [ L[ 30 ], L[ 47 ], L[ 54 ] ]
  	      },
  	      'font': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 9,
  	        'cssLitGroup': [ L[ 4 ], L[ 7 ], L[ 11 ], L[ 15 ], L[ 29 ], L[ 35 ], L[
  	            36 ], L[ 47 ], L[ 52 ], L[ 55 ], L[ 60 ] ]
  	      },
  	      'font-family': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 8,
  	        'cssLitGroup': [ L[ 15 ], L[ 35 ], L[ 47 ] ]
  	      },
  	      'font-size': {
  	        'cssPropBits': 1,
  	        'cssLitGroup': [ L[ 7 ], L[ 47 ], L[ 52 ] ]
  	      },
  	      'font-stretch': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 5 ], L[ 55 ] ]
  	      },
  	      'font-style': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 29 ], L[ 47 ], L[ 55 ] ]
  	      },
  	      'font-variant': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 47 ], L[ 55 ], L[ 60 ] ]
  	      },
  	      'font-weight': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 4 ], L[ 47 ], L[ 55 ] ],
  	        // ##### BEGIN: MODIFIED BY SAP
  	        'cssLitNumeric': true
  	        // ##### END: MODIFIED BY SAP
  	      },
  	      'height': {
  	        'cssPropBits': 37,
  	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
  	      },
  	      'left': {
  	        'cssPropBits': 37,
  	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
  	      },
  	      'letter-spacing': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 47 ], L[ 55 ] ]
  	      },
  	      'line-height': {
  	        'cssPropBits': 1,
  	        'cssLitGroup': [ L[ 47 ], L[ 55 ] ]
  	      },
  	      'list-style': {
  	        'cssPropBits': 16,
  	        'cssLitGroup': [ L[ 3 ], L[ 28 ], L[ 47 ], L[ 54 ] ]
  	      },
  	      'list-style-image': {
  	        'cssPropBits': 16,
  	        'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
  	      },
  	      'list-style-position': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 28 ], L[ 47 ] ]
  	      },
  	      'list-style-type': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 3 ], L[ 47 ], L[ 54 ] ]
  	      },
  	      'margin': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
  	      },
  	      'margin-bottom': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
  	      },
  	      'margin-left': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
  	      },
  	      'margin-right': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
  	      },
  	      'margin-top': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
  	      },
  	      'max-height': {
  	        'cssPropBits': 1,
  	        'cssLitGroup': [ L[ 38 ], L[ 47 ], L[ 54 ] ]
  	      },
  	      'max-width': {
  	        'cssPropBits': 1,
  	        'cssLitGroup': [ L[ 38 ], L[ 47 ], L[ 54 ] ]
  	      },
  	      'min-height': {
  	        'cssPropBits': 1,
  	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
  	      },
  	      'min-width': {
  	        'cssPropBits': 1,
  	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
  	      },
  	      'opacity': {
  	        'cssPropBits': 33,
  	        'cssLitGroup': [ L[ 47 ] ]
  	      },
  	      'outline': {
  	        'cssExtra': c[ 3 ],
  	        'cssPropBits': 7,
  	        'cssLitGroup': [ L[ 0 ], L[ 9 ], L[ 34 ], L[ 46 ], L[ 47 ], L[ 48 ], L[
  	            49 ], L[ 52 ], L[ 54 ] ]
  	      },
  	      'outline-color': {
  	        'cssExtra': c[ 2 ],
  	        'cssPropBits': 2,
  	        'cssLitGroup': [ L[ 0 ], L[ 47 ], L[ 49 ] ]
  	      },
  	      'outline-style': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 9 ], L[ 46 ], L[ 47 ], L[ 48 ], L[ 54 ] ]
  	      },
  	      'outline-width': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 34 ], L[ 47 ], L[ 52 ] ]
  	      },
  	      'overflow': {
  	        'cssPropBits': 32,
  	        'cssLitGroup': [ L[ 38 ], L[ 46 ], L[ 47 ], L[ 58 ], L[ 63 ] ]
  	      },
  	      'overflow-x': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 32 ], L[ 38 ], L[ 46 ], L[ 58 ], L[ 63 ] ]
  	      },
  	      'overflow-y': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 32 ], L[ 38 ], L[ 46 ], L[ 58 ], L[ 63 ] ]
  	      },
  	      'padding': {
  	        'cssPropBits': 1,
  	        'cssLitGroup': [ L[ 47 ] ]
  	      },
  	      'padding-bottom': {
  	        'cssPropBits': 33,
  	        'cssLitGroup': [ L[ 47 ] ]
  	      },
  	      'padding-left': {
  	        'cssPropBits': 33,
  	        'cssLitGroup': [ L[ 47 ] ]
  	      },
  	      'padding-right': {
  	        'cssPropBits': 33,
  	        'cssLitGroup': [ L[ 47 ] ]
  	      },
  	      'padding-top': {
  	        'cssPropBits': 33,
  	        'cssLitGroup': [ L[ 47 ] ]
  	      },
  	      'page-break-after': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 30 ], L[ 37 ], L[ 38 ], L[ 39 ], L[ 47 ] ]
  	      },
  	      'page-break-before': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 30 ], L[ 37 ], L[ 38 ], L[ 39 ], L[ 47 ] ]
  	      },
  	      'page-break-inside': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 38 ], L[ 39 ], L[ 47 ] ]
  	      },
  	      'pause': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 47 ] ]
  	      },
  	      'pause-after': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 47 ] ]
  	      },
  	      'pause-before': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 47 ] ]
  	      },
  	      'pitch': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 19 ], L[ 47 ], L[ 52 ] ]
  	      },
  	      'pitch-range': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 47 ] ]
  	      },
  	      'play-during': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 16,
  	        'cssLitGroup': [ L[ 38 ], L[ 47 ], L[ 53 ], L[ 54 ], L[ 57 ] ]
  	      },
  	      'position': {
  	        'cssPropBits': 32,
  	        'cssLitGroup': [ L[ 20 ], L[ 47 ] ]
  	      },
  	      'quotes': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 47 ], L[ 54 ] ]
  	      },
  	      'richness': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 47 ] ]
  	      },
  	      'right': {
  	        'cssPropBits': 37,
  	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
  	      },
  	      'speak': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 47 ], L[ 54 ], L[ 55 ], L[ 61 ] ]
  	      },
  	      'speak-header': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 37 ], L[ 47 ], L[ 56 ] ]
  	      },
  	      'speak-numeral': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 26 ], L[ 47 ] ]
  	      },
  	      'speak-punctuation': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 43 ], L[ 47 ], L[ 54 ] ]
  	      },
  	      'speech-rate': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 12 ], L[ 47 ], L[ 52 ] ]
  	      },
  	      'stress': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 47 ] ]
  	      },
  	      'table-layout': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 38 ], L[ 45 ], L[ 47 ] ]
  	      },
  	      'text-align': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 30 ], L[ 42 ], L[ 47 ], L[ 50 ] ]
  	      },
  	      'text-decoration': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 18 ], L[ 47 ], L[ 54 ] ]
  	      },
  	      'text-indent': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 47 ] ]
  	      },
  	      'text-overflow': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 25 ] ]
  	      },
  	      'text-shadow': {
  	        'cssExtra': c[ 1 ],
  	        'cssPropBits': 7,
  	        'cssLitGroup': [ L[ 0 ], L[ 35 ], L[ 48 ], L[ 54 ] ]
  	      },
  	      'text-transform': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 21 ], L[ 47 ], L[ 54 ] ]
  	      },
  	      'text-wrap': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 33 ], L[ 54 ], L[ 55 ] ]
  	      },
  	      'top': {
  	        'cssPropBits': 37,
  	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
  	      },
  	      'unicode-bidi': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 23 ], L[ 47 ], L[ 55 ] ]
  	      },
  	      'vertical-align': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 10 ], L[ 24 ], L[ 47 ] ]
  	      },
  	      'visibility': {
  	        'cssPropBits': 32,
  	        'cssLitGroup': [ L[ 44 ], L[ 46 ], L[ 47 ], L[ 63 ] ]
  	      },
  	      'voice-family': {
  	        'cssExtra': c[ 0 ],
  	        'cssPropBits': 8,
  	        'cssLitGroup': [ L[ 22 ], L[ 35 ], L[ 47 ] ]
  	      },
  	      'volume': {
  	        'cssPropBits': 1,
  	        'cssLitGroup': [ L[ 16 ], L[ 47 ], L[ 52 ] ]
  	      },
  	      'white-space': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 8 ], L[ 47 ], L[ 55 ] ]
  	      },
  	      'width': {
  	        'cssPropBits': 33,
  	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
  	      },
  	      'word-spacing': {
  	        'cssPropBits': 5,
  	        'cssLitGroup': [ L[ 47 ], L[ 55 ] ]
  	      },
  	      'word-wrap': {
  	        'cssPropBits': 0,
  	        'cssLitGroup': [ L[ 41 ], L[ 55 ] ]
  	      },
  	      'z-index': {
  	        'cssPropBits': 69,
  	        'cssLitGroup': [ L[ 38 ], L[ 47 ] ]
  	      },
  	      'zoom': {
  	        'cssPropBits': 1,
  	        'cssLitGroup': [ L[ 55 ] ]
  	      }
  	    };
  	  })();
  	if (typeof window !== 'undefined') {
  	  window['cssSchema'] = cssSchema;
  	}
  	// Copyright (C) 2011 Google Inc.
  	//
  	// Licensed under the Apache License, Version 2.0 (the "License");
  	// you may not use this file except in compliance with the License.
  	// You may obtain a copy of the License at
  	//
  	//      http://www.apache.org/licenses/LICENSE-2.0
  	//
  	// Unless required by applicable law or agreed to in writing, software
  	// distributed under the License is distributed on an "AS IS" BASIS,
  	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  	// See the License for the specific language governing permissions and
  	// limitations under the License.

  	/**
  	 * A lexical scannar for CSS3 as defined at http://www.w3.org/TR/css3-syntax .
  	 *
  	 * @author Mike Samuel <mikesamuel@gmail.com>
  	 * \@provides lexCss, decodeCss
  	 * \@overrides window
  	 */

  	var lexCss;
  	var decodeCss;

  	(function () {

  	  /**
  	   * Decodes an escape sequence as specified in CSS3 section 4.1.
  	   * http://www.w3.org/TR/css3-syntax/#characters
  	   * @private
  	   */
  	  function decodeCssEscape(s) {
  	    var i = parseInt(s.substring(1), 16);
  	    // If parseInt didn't find a hex diigt, it returns NaN so return the
  	    // escaped character.
  	    // Otherwise, parseInt will stop at the first non-hex digit so there's no
  	    // need to worry about trailing whitespace.
  	    if (i > 0xffff) {
  	      // A supplemental codepoint.
  	      return i -= 0x10000,
  	        String.fromCharCode(
  	            0xd800 + (i >> 10),
  	            0xdc00 + (i & 0x3FF));
  	    } else if (i == i) {
  	      return String.fromCharCode(i);
  	    } else if (s[1] < ' ') {
  	      // "a backslash followed by a newline is ignored".
  	      return '';
  	    } else {
  	      return s[1];
  	    }
  	  }

  	  /**
  	   * Returns an equivalent CSS string literal given plain text: foo -> "foo".
  	   * @private
  	   */
  	  function escapeCssString(s, replacer) {
  	    return '"' + s.replace(/[\u0000-\u001f\\\"<>]/g, replacer) + '"';
  	  }

  	  /**
  	   * Maps chars to CSS escaped equivalents: "\n" -> "\\a ".
  	   * @private
  	   */
  	  function escapeCssStrChar(ch) {
  	    return cssStrChars[ch]
  	        || (cssStrChars[ch] = '\\' + ch.charCodeAt(0).toString(16) + ' ');
  	  }

  	  /**
  	   * Maps chars to URI escaped equivalents: "\n" -> "%0a".
  	   * @private
  	   */
  	  function escapeCssUrlChar(ch) {
  	    return cssUrlChars[ch]
  	        || (cssUrlChars[ch] = (ch < '\x10' ? '%0' : '%')
  	            + ch.charCodeAt(0).toString(16));
  	  }

  	  /**
  	   * Mapping of CSS special characters to escaped equivalents.
  	   * @private
  	   */
  	  var cssStrChars = {
  	    '\\': '\\\\'
  	  };

  	  /**
  	   * Mapping of CSS special characters to URL-escaped equivalents.
  	   * @private
  	   */
  	  var cssUrlChars = {
  	    '\\': '%5c'
  	  };

  	  // The comments below are copied from the CSS3 module syntax at
  	  // http://www.w3.org/TR/css3-syntax .
  	  // These string constants minify out when this is run-through closure
  	  // compiler.
  	  // Rules that have been adapted have comments prefixed with "Diff:", and
  	  // where rules have been combined to avoid back-tracking in the regex engine
  	  // or to work around limitations, there is a comment prefixed with
  	  // "NewRule:".

  	  // In the below, we assume CRLF and CR have been normalize to CR.

  	  // wc  ::=  #x9 | #xA | #xC | #xD | #x20
  	  var WC = '[\\t\\n\\f ]';
  	  // w  ::=  wc*
  	  var W = WC + '*';
  	  // nl  ::=  #xA | #xD #xA | #xD | #xC
  	  var NL = '[\\n\\f]';
  	  // nonascii  ::=  [#x80-#xD7FF#xE000-#xFFFD#x10000-#x10FFFF]
  	  // NewRule: Supplemental codepoints are represented as surrogate pairs in JS.
  	  var SURROGATE_PAIR = '[\\ud800-\\udbff][\\udc00-\\udfff]';
  	  var NONASCII = '[\\u0080-\\ud7ff\\ue000-\\ufffd]|' + SURROGATE_PAIR;
  	  // unicode  ::=  '\' [0-9a-fA-F]{1,6} wc?
  	  // NewRule: No point in having ESCAPE do (\\x|\\y)
  	  var UNICODE_TAIL = '[0-9a-fA-F]{1,6}' + WC + '?';
  	  // escape  ::=  unicode
  	  //           | '\' [#x20-#x7E#x80-#xD7FF#xE000-#xFFFD#x10000-#x10FFFF]
  	  // NewRule: Below we use escape tail to efficiently match an escape or a
  	  // line continuation so we can decode string content.
  	  var ESCAPE_TAIL = '(?:' + UNICODE_TAIL
  	      + '|[\\u0020-\\u007e\\u0080-\\ud7ff\\ue000\\ufffd]|'
  	      + SURROGATE_PAIR + ')';
  	  var ESCAPE = '\\\\' + ESCAPE_TAIL;
  	  // urlchar  ::=  [#x9#x21#x23-#x26#x28-#x7E] | nonascii | escape
  	  var URLCHAR = '(?:[\\t\\x21\\x23-\\x26\\x28-\\x5b\\x5d-\\x7e]|'
  	      + NONASCII + '|' + ESCAPE + ')';
  	  // stringchar  ::= urlchar | #x20 | '\' nl
  	  // We ignore mismatched surrogate pairs inside strings, so stringchar
  	  // simplifies to a non-(quote|newline|backslash) or backslash any.
  	  // Since we normalize CRLF to a single code-unit, there is no special
  	  // handling needed for '\\' + CRLF.
  	  var STRINGCHAR = '[^\'"\\n\\f\\\\]|\\\\[\\s\\S]';
  	  // string  ::=  '"' (stringchar | "'")* '"' | "'" (stringchar | '"')* "'"
  	  var STRING = '"(?:\'|' + STRINGCHAR + ')*"'
  	      + '|\'(?:\"|' + STRINGCHAR + ')*\'';
  	  // num  ::=  [0-9]+ | [0-9]* '.' [0-9]+
  	  // Diff: We attach signs to num tokens.
  	  var NUM = '[-+]?(?:[0-9]+(?:[.][0-9]+)?|[.][0-9]+)';
  	  // nmstart  ::=  [a-zA-Z] | '_' | nonascii | escape
  	  var NMSTART = '(?:[a-zA-Z_]|' + NONASCII + '|' + ESCAPE + ')';
  	  // nmchar  ::=  [a-zA-Z0-9] | '-' | '_' | nonascii | escape
  	  var NMCHAR = '(?:[a-zA-Z0-9_-]|' + NONASCII + '|' + ESCAPE + ')';
  	  // ident  ::=  '-'? nmstart nmchar*
  	  var IDENT = '-?' + NMSTART + NMCHAR + '*';

  	  // NewRule: union of IDENT, ATKEYWORD, HASH, but excluding #[0-9].
  	  var WORD_TERM = '(?:@?-?' + NMSTART + '|#)' + NMCHAR + '*';
  	  var NUMERIC_VALUE = NUM + '(?:%|' + IDENT + ')?';
  	  // URI  ::=  "url(" w (string | urlchar* ) w ")"
  	  var URI = 'url[(]' + W + '(?:' + STRING + '|' + URLCHAR + '*)' + W + '[)]';
  	  // UNICODE-RANGE  ::=  "U+" [0-9A-F?]{1,6} ('-' [0-9A-F]{1,6})?
  	  var UNICODE_RANGE = 'U[+][0-9A-F?]{1,6}(?:-[0-9A-F]{1,6})?';
  	  // CDO  ::=  "<\!--"
  	  var CDO = '<\!--';
  	  // CDC  ::=  "-->"
  	  var CDC = '-->';
  	  // S  ::=  wc+
  	  var S = WC + '+';
  	  // COMMENT  ::=  "/*" [^*]* '*'+ ([^/] [^*]* '*'+)* "/"
  	  // Diff: recognizes // comments.
  	  var COMMENT = '/(?:[*][^*]*[*]+(?:[^/][^*]*[*]+)*/|/[^\\n\\f]*)';
  	  // FUNCTION  ::=  ident '('
  	  // Diff: We exclude url explicitly.
  	  // TODO: should we be tolerant of "fn ("?
  	  // ##### BEGIN: MODIFIED BY SAP
  	  // Avoid risk of 'catastrophic backtracking' when unicode escapes are used
  	  // var FUNCTION = '(?!url[(])' + IDENT + '[(]';
  	  var FUNCTION = '(?!url[(])(?=(' + IDENT + '))\\1[(]';
  	  // NewRule: one rule for all the comparison operators.
  	  var CMP_OPS = '[~|^$*]=';
  	  // CHAR  ::=  any character not matched by the above rules, except for " or '
  	  // Diff: We exclude / and \ since they are handled above to prevent
  	  // /* without a following */ from combining when comments are concatenated.
  	  var CHAR = '[^"\'\\\\/]|/(?![/*])';
  	  // BOM  ::=  #xFEFF
  	  var BOM = '\\uFEFF';

  	  var CSS_TOKEN = new RegExp([
  	      BOM, UNICODE_RANGE, URI, FUNCTION, WORD_TERM, STRING, NUMERIC_VALUE,
  	      CDO, CDC, S, COMMENT, CMP_OPS, CHAR].join("|"), 'gi');

  	  /**
  	   * Decodes CSS escape sequences in a CSS string body.
  	   */
  	   decodeCss = function (css) {
  	     return css.replace(
  	         new RegExp('\\\\(?:' + ESCAPE_TAIL + '|' + NL + ')', 'g'),
  	         decodeCssEscape);
  	   };

  	  /**
  	   * Given CSS Text, returns an array of normalized tokens.
  	   * @param {string} cssText
  	   * @return {Array.<string>} tokens where all ignorable token sequences have
  	   *    been reduced to a single {@code " "} and all strings and
  	   *    {@code url(...)} tokens have been normalized to use double quotes as
  	   *    delimiters and to not otherwise contain double quotes.
  	   */
  	  lexCss = function (cssText) {
  	    cssText = '' + cssText;
  	    var tokens = cssText.replace(/\r\n?/g, '\n')  // Normalize CRLF & CR to LF.
  	        .match(CSS_TOKEN) || [];
  	    var j = 0;
  	    var last = ' ';
  	    for (var i = 0, n = tokens.length; i < n; ++i) {
  	      // Normalize all escape sequences.  We will have to re-escape some
  	      // codepoints in string and url(...) bodies but we already know the
  	      // boundaries.
  	      // We might mistakenly treat a malformed identifier like \22\20\22 as a
  	      // string, but that will not break any valid stylesheets since we requote
  	      // and re-escape in string below.
  	      var tok = decodeCss(tokens[i]);
  	      var len = tok.length;
  	      var cc = tok.charCodeAt(0);
  	      tok =
  	          // All strings should be double quoted, and the body should never
  	          // contain a double quote.
  	          (cc == '"'.charCodeAt(0) || cc == '\''.charCodeAt(0))
  	          ? escapeCssString(tok.substring(1, len - 1), escapeCssStrChar)
  	          // A breaking ignorable token should is replaced with a single space.
  	          : (cc == '/'.charCodeAt(0) && len > 1  // Comment.
  	             || tok == '\\' || tok == CDC || tok == CDO || tok == '\ufeff'
  	             // Characters in W.
  	             || cc <= ' '.charCodeAt(0))
  	          ? ' '
  	          // Make sure that all url(...)s are double quoted.
  	          : /url\(/i.test(tok)
  	          ? 'url(' + escapeCssString(
  	            tok.replace(
  	                new RegExp('^url\\(' + W + '["\']?|["\']?' + W + '\\)$', 'gi'),
  	                ''),
  	            escapeCssUrlChar)
  	            + ')'
  	          // Escapes in identifier like tokens will have been normalized above.
  	          : tok;
  	      // Merge adjacent space tokens.
  	      if (last != tok || tok != ' ') {
  	        tokens[j++] = last = tok;
  	      }
  	    }
  	    tokens.length = j;
  	    return tokens;
  	  };
  	})();

  	// Exports for closure compiler.
  	if (typeof window !== 'undefined') {
  	  window['lexCss'] = lexCss;
  	  window['decodeCss'] = decodeCss;
  	}
  	// Copyright (C) 2011 Google Inc.
  	//
  	// Licensed under the Apache License, Version 2.0 (the "License");
  	// you may not use this file except in compliance with the License.
  	// You may obtain a copy of the License at
  	//
  	//      http://www.apache.org/licenses/LICENSE-2.0
  	//
  	// Unless required by applicable law or agreed to in writing, software
  	// distributed under the License is distributed on an "AS IS" BASIS,
  	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  	// See the License for the specific language governing permissions and
  	// limitations under the License.

  	/**
  	 * @fileoverview
  	 * JavaScript support for client-side CSS sanitization.
  	 * The CSS property schema API is defined in CssPropertyPatterns.java which
  	 * is used to generate css-defs.js.
  	 *
  	 * @author mikesamuel@gmail.com
  	 * \@requires CSS_PROP_BIT_ALLOWED_IN_LINK
  	 * \@requires CSS_PROP_BIT_HASH_VALUE
  	 * \@requires CSS_PROP_BIT_NEGATIVE_QUANTITY
  	 * \@requires CSS_PROP_BIT_QSTRING_CONTENT
  	 * \@requires CSS_PROP_BIT_QSTRING_URL
  	 * \@requires CSS_PROP_BIT_QUANTITY
  	 * \@requires CSS_PROP_BIT_Z_INDEX
  	 * \@requires cssSchema
  	 * \@requires decodeCss
  	 * \@requires html4
  	 * \@overrides window
  	 * \@requires parseCssStylesheet
  	 * \@provides sanitizeCssProperty
  	 * \@provides sanitizeCssSelectors
  	 * \@provides sanitizeStylesheet
  	 */

  	/**
  	 * Given a series of normalized CSS tokens, applies a property schema, as
  	 * defined in CssPropertyPatterns.java, and sanitizes the tokens in place.
  	 * @param property a property name.
  	 * @param propertySchema a property of cssSchema as defined by
  	 *    CssPropertyPatterns.java
  	 * @param tokens as parsed by lexCss.  Modified in place.
  	 * @param opt_naiveUriRewriter a URI rewriter; an object with a "rewrite"
  	 *     function that takes a URL and returns a safe URL.
  	 */
  	var sanitizeCssProperty = (function () {
  	  var NOEFFECT_URL = 'url("about:blank")';
  	  /**
  	   * The set of characters that need to be normalized inside url("...").
  	   * We normalize newlines because they are not allowed inside quoted strings,
  	   * normalize quote characters, angle-brackets, and asterisks because they
  	   * could be used to break out of the URL or introduce targets for CSS
  	   * error recovery.  We normalize parentheses since they delimit unquoted
  	   * URLs and calls and could be a target for error recovery.
  	   */
  	  var NORM_URL_REGEXP = /[\n\f\r\"\'()*<>]/g;
  	  /** The replacements for NORM_URL_REGEXP. */
  	  var NORM_URL_REPLACEMENTS = {
  	    '\n': '%0a',
  	    '\f': '%0c',
  	    '\r': '%0d',
  	    '"':  '%22',
  	    '\'': '%27',
  	    '(':  '%28',
  	    ')':  '%29',
  	    '*':  '%2a',
  	    '<':  '%3c',
  	    '>':  '%3e'
  	  };


  	  function normalizeUrl(s) {
  	    if ('string' === typeof s) {
  	      return 'url("' + s.replace(NORM_URL_REGEXP, normalizeUrlChar) + '")';
  	    } else {
  	      return NOEFFECT_URL;
  	    }
  	  }
  	  function normalizeUrlChar(ch) {
  	    return NORM_URL_REPLACEMENTS[ch];
  	  }

  	  // From RFC3986
  	  var URI_SCHEME_RE = new RegExp(
  	      '^' +
  	      '(?:' +
  	        '([^:\/?# ]+)' +         // scheme
  	      ':)?'
  	  );

  	  var ALLOWED_URI_SCHEMES = /^(?:https?|mailto)$/i;

  	  function safeUri(uri, prop, naiveUriRewriter) {
  	    if (!naiveUriRewriter) { return null; }
  	    var parsed = ('' + uri).match(URI_SCHEME_RE);
  	    if (parsed && (!parsed[1] || ALLOWED_URI_SCHEMES.test(parsed[1]))) {
  	      return naiveUriRewriter(uri, prop);
  	    } else {
  	      return null;
  	    }
  	  }

  	  function unionArrays(arrs) {
  	    var map = {};
  	    for (var i = arrs.length; --i >= 0;) {
  	      var arr = arrs[i];
  	      for (var j = arr.length; --j >= 0;) {
  	        map[arr[j]] = ALLOWED_LITERAL;
  	      }
  	    }
  	    return map;
  	  }

  	  /**
  	   * Normalize tokens within a function call they can match against
  	   * cssSchema[propName].cssExtra.
  	   * @return the exclusive end in tokens of the function call.
  	   */
  	  function normalizeFunctionCall(tokens, start) {
  	    var parenDepth = 1, end = start + 1, n = tokens.length;
  	    while (end < n && parenDepth) {
  	      // TODO: Can URLs appear in functions?
  	      var token = tokens[end++];
  	      parenDepth += (token === '(' ? 1 : token === ')' ? -1 : 0);
  	    }
  	    return end;
  	  }

  	  // Used as map value to avoid hasOwnProperty checks.
  	  var ALLOWED_LITERAL = {};

  	  return function (property, propertySchema, tokens, opt_naiveUriRewriter) {
  	    var propBits = propertySchema.cssPropBits;
  	    // Used to determine whether to treat quoted strings as URLs or
  	    // plain text content, and whether unrecognized keywords can be quoted
  	    // to treate ['Arial', 'Black'] equivalently to ['"Arial Black"'].
  	    var qstringBits = propBits & (
  	        CSS_PROP_BIT_QSTRING_CONTENT | CSS_PROP_BIT_QSTRING_URL);
  	    // TODO(mikesamuel): Figure out what to do with props like
  	    // content that admit both URLs and strings.

  	    // Used to join unquoted keywords into a single quoted string.
  	    var lastQuoted = NaN;
  	    var i = 0, k = 0;
  	    for (;i < tokens.length; ++i) {
  	      // Has the effect of normalizing hex digits, keywords,
  	      // and function names.
  	      var token = tokens[i].toLowerCase();
  	      var cc = token.charCodeAt(0), cc1, cc2, isnum1, isnum2, end;
  	      var litGroup, litMap;
  	      token = (
  	        // Strip out spaces.  Normally cssparser.js dumps these, but we
  	        // strip them out in case the content doesn't come via cssparser.js.
  	        (cc === ' '.charCodeAt(0))
  	          ? ''
  	          : (cc === '"'.charCodeAt(0))
  	              ? (  // Quoted string.
  	                  (qstringBits === CSS_PROP_BIT_QSTRING_URL && opt_naiveUriRewriter)
  	                  // Sanitize and convert to url("...") syntax.
  	                  // Treat url content as case-sensitive.
  	                  ? (normalizeUrl(
  	                       safeUri(
  	                         decodeCss(tokens[i].substring(1, token.length - 1)),
  	                         property,
  	                         opt_naiveUriRewriter
  	                       )
  	                     ))
  	                  // Drop if plain text content strings not allowed.
  	                  : (qstringBits === CSS_PROP_BIT_QSTRING_CONTENT) ? token : '')
  	              // Preserve hash color literals if allowed.
  	              : (cc === '#'.charCodeAt(0) && /^#(?:[0-9a-f]{3}){1,2}$/.test(token))
  	                  ? (propBits & CSS_PROP_BIT_HASH_VALUE ? token : '')
  	                  // ##### BEGIN: MODIFIED BY SAP
  	                  // : ('0'.charCodeAt(0) <= cc && cc <= '9'.charCodeAt(0))
  	                  : ('0'.charCodeAt(0) <= cc && cc <= '9'.charCodeAt(0) && !propertySchema.cssLitNumeric)
  	                  // ##### END: MODIFIED BY SAP
  	                      // A number starting with a digit.
  	                      ? ((propBits & CSS_PROP_BIT_QUANTITY)
  	                           ? ((propBits & CSS_PROP_BIT_Z_INDEX)
  	                                ? (token.match(/^\d{1,7}$/) ? token : '')
  	                                : token)
  	                           : '')
  	                      // Normalize quantities so they don't start with a '.' or '+' sign and
  	                      // make sure they all have an integer component so can't be confused
  	                      // with a dotted identifier.
  	                      // This can't be done in the lexer since ".4" is a valid rule part.
  	                      : (cc1 = token.charCodeAt(1),
  	                         cc2 = token.charCodeAt(2),
  	                         isnum1 = '0'.charCodeAt(0) <= cc1 && cc1 <= '9'.charCodeAt(0),
  	                         isnum2 = '0'.charCodeAt(0) <= cc2 && cc2 <= '9'.charCodeAt(0),
  	                         // +.5 -> 0.5 if allowed.
  	                         (cc === '+'.charCodeAt(0)
  	                          && (isnum1 || (cc1 === '.'.charCodeAt(0) && isnum2))))
  	                           ? ((propBits & CSS_PROP_BIT_QUANTITY)
  	                                ? ((propBits & CSS_PROP_BIT_Z_INDEX)
  	                                     ? (token.match(/^\+\d{1,7}$/) ? token : '')
  	                                     : ((isnum1 ? '' : '0') + token.substring(1)))
  	                                : '')
  	                           // -.5 -> -0.5 if allowed otherwise -> 0 if quantities allowed.
  	                           : (cc === '-'.charCodeAt(0)
  	                              && (isnum1 || (cc1 === '.'.charCodeAt(0) && isnum2)))
  	                                ? ((propBits & CSS_PROP_BIT_NEGATIVE_QUANTITY)
  	                                     ? ((propBits & CSS_PROP_BIT_Z_INDEX)
  	                                          ? (token.match(/^\-\d{1,7}$/) ? token : '')
  	                                          : ((isnum1 ? '-' : '-0') + token.substring(1)))
  	                                     : ((propBits & CSS_PROP_BIT_QUANTITY) ? '0' : ''))
  	                                // .5 -> 0.5 if allowed.
  	                                : (cc === '.'.charCodeAt(0) && isnum1)
  	                                     ? ((propBits & CSS_PROP_BIT_QUANTITY) ? '0' + token : '')
  	                                     // Handle url("...") by rewriting the body.
  	                                     : ('url(' === token.substring(0, 4))
  	                                          ? ((opt_naiveUriRewriter && (qstringBits & CSS_PROP_BIT_QSTRING_URL))
  	                                               ? normalizeUrl(
  	                                                   safeUri(
  	                                                     tokens[i].substring(5, token.length - 2),
  	                                                     property,
  	                                                     opt_naiveUriRewriter
  	                                                   )
  	                                                 )
  	                                               : '')
  	                                          // Handle func(...) and literal tokens
  	                                          // such as keywords and punctuation.
  	                                          : (
  	                                             // Step 1. Combine func(...) into something that can be compared
  	                                             // against propertySchema.cssExtra.
  	                                             (token.charAt(token.length-1) === '(')
  	                                             && (end = normalizeFunctionCall(tokens, i),
  	                                               // When tokens is
  	                                               //   ['x', ' ', 'rgb(', '255', ',', '0', ',', '0', ')', ' ', 'y']
  	                                               // and i is the index of 'rgb(' and end is the index of ')'
  	                                               // splices tokens to where i now is the index of the whole call:
  	                                               //   ['x', ' ', 'rgb( 255 , 0 , 0 )', ' ', 'y']
  	                                               tokens.splice(i, end - i,
  	                                                 token = tokens.slice(i, end).join(' '))),
  	                                             litGroup = propertySchema.cssLitGroup,
  	                                             litMap = (
  	                                                litGroup
  	                                                ? (propertySchema.cssLitMap
  	                                                   // Lazily compute the union from litGroup.
  	                                                   || (propertySchema.cssLitMap = unionArrays(litGroup)))
  	                                                : ALLOWED_LITERAL),  // A convenient empty object.
  	                                             (litMap[token] === ALLOWED_LITERAL
  	                                              || propertySchema.cssExtra && propertySchema.cssExtra.test(token)))
  	                                                // Token is in the literal map or matches extra.
  	                                                ? token
  	                                                : (/^\w+$/.test(token)
  	                                                   && (qstringBits === CSS_PROP_BIT_QSTRING_CONTENT))
  	                                                     // Quote unrecognized keywords so font names like
  	                                                      //    Arial Bold
  	                                                      // ->
  	                                                      //    "Arial Bold"
  	                                                      ? (lastQuoted+1 === k
  	                                                         // If the last token was also a keyword that was quoted, then
  	                                                         // combine this token into that.
  	                                                         ? (tokens[lastQuoted] = tokens[lastQuoted]
  	                                                            .substring(0, tokens[lastQuoted].length-1) + ' ' + token + '"',
  	                                                            token = '')
  	                                                         : (lastQuoted = k, '"' + token + '"'))
  	                                                      // Disallowed.
  	                                                      : '');
  	      if (token) {
  	        tokens[k++] = token;
  	      }
  	    }
  	    // For single URL properties, if the URL failed to pass the sanitizer,
  	    // then just drop it.
  	    if (k === 1 && tokens[0] === NOEFFECT_URL) { k = 0; }
  	    tokens.length = k;
  	  };
  	})();

  	/**
  	 * Given a series of tokens, returns two lists of sanitized selectors.
  	 * @param {Array.<string>} selectors In the form produces by csslexer.js.
  	 * @param {string} suffix a suffix that is added to all IDs and which is
  	 *    used as a CLASS names so that the returned selectors will only match
  	 *    nodes under one with suffix as a class name.
  	 *    If suffix is {@code "sfx"}, the selector
  	 *    {@code ["a", "#foo", " ", "b", ".bar"]} will be namespaced to
  	 *    {@code [".sfx", " ", "a", "#foo-sfx", " ", "b", ".bar"]}.
  	 * @return {Array.<Array.<string>>} an array of length 2 where the zeroeth
  	 *    element contains history-insensitive selectors and the first element
  	 *    contains history-sensitive selectors.
  	 */
  	function sanitizeCssSelectors(selectors, suffix) {
  	  // Produce two distinct lists of selectors to sequester selectors that are
  	  // history sensitive (:visited), so that we can disallow properties in the
  	  // property groups for the history sensitive ones.
  	  var historySensitiveSelectors = [];
  	  var historyInsensitiveSelectors = [];

  	  // Remove any spaces that are not operators.
  	  var k = 0, i;
  	  for (i = 0; i < selectors.length; ++i) {
  	    if (!(selectors[i] == ' '
  	          && (selectors[i-1] == '>' || selectors[i+1] == '>'))) {
  	      selectors[k++] = selectors[i];
  	    }
  	  }
  	  selectors.length = k;

  	  // Split around commas.  If there is an error in one of the comma separated
  	  // bits, we throw the whole away, but the failure of one selector does not
  	  // affect others.
  	  var n = selectors.length, start = 0;
  	  for (i = 0; i < n; ++i) {
  	    if (selectors[i] == ',') {
  	      processSelector(start, i);
  	      start = i+1;
  	    }
  	  }
  	  processSelector(start, n);


  	  function processSelector(start, end) {
  	    var historySensitive = false;

  	    // Space around commas is not an operator.
  	    if (selectors[start] === ' ') { ++start; }
  	    if (end-1 !== start && selectors[end] === ' ') { --end; }

  	    // Split the selector into element selectors, content around
  	    // space (ancestor operator) and '>' (descendant operator).
  	    var out = [];
  	    var lastOperator = start;
  	    var elSelector = '';
  	    for (var i = start; i < end; ++i) {
  	      var tok = selectors[i];
  	      var isChild = (tok === '>');
  	      if (isChild || tok === ' ') {
  	        // We've found the end of a single link in the selector chain.
  	        // We disallow absolute positions relative to html.
  	        elSelector = processElementSelector(lastOperator, i, false);
  	        if (!elSelector || (isChild && /^html/i.test(elSelector))) {
  	          return;
  	        }
  	        lastOperator = i+1;
  	        out.push(elSelector, isChild ? ' > ' : ' ');
  	      }
  	    }
  	    elSelector = processElementSelector(lastOperator, end, true);
  	    if (!elSelector) { return; }
  	    out.push(elSelector);

  	    function processElementSelector(start, end, last) {

  	      // Split the element selector into three parts.
  	      // DIV.foo#bar:hover
  	      //    ^       ^
  	      // el classes pseudo
  	      var element, classId, pseudoSelector, tok, elType;
  	      element = '';
  	      if (start < end) {
  	        tok = selectors[start].toLowerCase();
  	        if (tok === '*'
  	            || (tok === 'body' && start+1 !== end && !last)
  	            || ('number' === typeof (elType = html4.ELEMENTS[tok])
  	                && !(elType & html4.eflags.UNSAFE))) {
  	          ++start;
  	          element = tok;
  	        }
  	      }
  	      classId = '';
  	      while (start < end) {
  	        tok = selectors[start];
  	        if (tok.charAt(0) === '#') {
  	          if (/^#_|__$|[^#0-9A-Za-z:_\-]/.test(tok)) { return null; }
  	          // Rewrite ID elements to include the suffix.
  	          classId += tok + '-' + suffix;
  	        } else if (tok === '.') {
  	          if (++start < end
  	              && /^[0-9A-Za-z:_\-]+$/.test(tok = selectors[start])
  	              && !/^_|__$/.test(tok)) {
  	            classId += '.' + tok;
  	          } else {
  	            return null;
  	          }
  	        } else {
  	          break;
  	        }
  	        ++start;
  	      }
  	      pseudoSelector = '';
  	      if (start < end && selectors[start] === ':') {
  	        tok = selectors[++start];
  	        if (tok === 'visited' || tok === 'link') {
  	          if (!/^[a*]?$/.test(element)) {
  	            return null;
  	          }
  	          historySensitive = true;
  	          pseudoSelector = ':' + tok;
  	          element = 'a';
  	          ++start;
  	        }
  	      }
  	      if (start === end) {
  	        return element + classId + pseudoSelector;
  	      }
  	      return null;
  	    }


  	    var safeSelector = out.join('');
  	    if (/^body\b/.test(safeSelector)) {
  	      // Substitute the class that is attached to pseudo body elements for
  	      // the body element.
  	      safeSelector = '.vdoc-body___.' + suffix + safeSelector.substring(4);
  	    } else {
  	      // Namespace the selector so that it only matches under
  	      // a node with suffix in its CLASS attribute.
  	      safeSelector = '.' + suffix + ' ' + safeSelector;
  	    }

  	    (historySensitive
  	     ? historySensitiveSelectors
  	     : historyInsensitiveSelectors).push(safeSelector);
  	  }

  	  return [historyInsensitiveSelectors, historySensitiveSelectors];
  	}

  	var sanitizeStylesheet = (function () {
  	  var allowed = {};
  	  var cssMediaTypeWhitelist = {
  	    'braille': allowed,
  	    'embossed': allowed,
  	    'handheld': allowed,
  	    'print': allowed,
  	    'projection': allowed,
  	    'screen': allowed,
  	    'speech': allowed,
  	    'tty': allowed,
  	    'tv': allowed
  	  };

  	  /**
  	   * Given a series of sanitized tokens, removes any properties that would
  	   * leak user history if allowed to style links differently depending on
  	   * whether the linked URL is in the user's browser history.
  	   * @param {Array.<string>} blockOfProperties
  	   */
  	  function sanitizeHistorySensitive(blockOfProperties) {
  	    var elide = false;
  	    for (var i = 0, n = blockOfProperties.length; i < n-1; ++i) {
  	      var token = blockOfProperties[i];
  	      if (':' === blockOfProperties[i+1]) {
  	        elide = !(cssSchema[token].cssPropBits & CSS_PROP_BIT_ALLOWED_IN_LINK);
  	      }
  	      if (elide) { blockOfProperties[i] = ''; }
  	      if (';' === token) { elide = false; }
  	    }
  	    return blockOfProperties.join('');
  	  }

  	  /**
  	   * @param {string} cssText a string containing a CSS stylesheet.
  	   * @param {string} suffix a suffix that is added to all IDs and which is
  	   *    used as a CLASS names so that the returned selectors will only match
  	   *    nodes under one with suffix as a class name.
  	   *    If suffix is {@code "sfx"}, the selector
  	   *    {@code ["a", "#foo", " ", "b", ".bar"]} will be namespaced to
  	   *    {@code [".sfx", " ", "a", "#foo-sfx", " ", "b", ".bar"]}.
  	   * @param {function(string, string)} opt_naiveUriRewriter maps URLs of media
  	   *    (images, sounds) that appear as CSS property values to sanitized
  	   *    URLs or null if the URL should not be allowed as an external media
  	   *    file in sanitized CSS.
  	   */
  	  return function /*sanitizeStylesheet*/(
  	       cssText, suffix, opt_naiveUriRewriter) {
  	    var safeCss = void 0;
  	    // A stack describing the { ... } regions.
  	    // Null elements indicate blocks that should not be emitted.
  	    var blockStack = [];
  	    // True when the content of the current block should be left off safeCss.
  	    var elide = false;
  	    parseCssStylesheet(
  	        cssText,
  	        {
  	          startStylesheet: function () {
  	            safeCss = [];
  	          },
  	          endStylesheet: function () {
  	          },
  	          startAtrule: function (atIdent, headerArray) {
  	            if (elide) {
  	              atIdent = null;
  	            } else if (atIdent === '@media') {
  	              headerArray = headerArray.filter(
  	                function (mediaType) {
  	                  return cssMediaTypeWhitelist[mediaType] == allowed;
  	                });
  	              if (headerArray.length) {
  	                safeCss.push(atIdent, headerArray.join(','), '{');
  	              } else {
  	                atIdent = null;
  	              }
  	            } else {
  	              if (atIdent === '@import') {
  	                // TODO: Use a logger instead.
  	                if (window.console) {
  	                  window.console.log(
  	                      '@import ' + headerArray.join(' ') + ' elided');
  	                }
  	              }
  	              atIdent = null;  // Elide the block.
  	            }
  	            elide = !atIdent;
  	            blockStack.push(atIdent);
  	          },
  	          endAtrule: function () {
  	            blockStack.pop();
  	            if (!elide) {
  	              safeCss.push(';');
  	            }
  	            checkElide();
  	          },
  	          startBlock: function () {
  	            // There are no bare blocks in CSS, so we do not change the
  	            // block stack here, but instead in the events that bracket
  	            // blocks.
  	            if (!elide) {
  	              safeCss.push('{');
  	            }
  	          },
  	          endBlock: function () {
  	            if (!elide) {
  	              safeCss.push('}');
  	              elide = true;  // skip any semicolon from endAtRule.
  	            }
  	          },
  	          startRuleset: function (selectorArray) {
  	            var historySensitiveSelectors = void 0;
  	            var removeHistoryInsensitiveSelectors = false;
  	            if (!elide) {
  	              var selectors = sanitizeCssSelectors(selectorArray, suffix);
  	              var historyInsensitiveSelectors = selectors[0];
  	              historySensitiveSelectors = selectors[1];
  	              if (!historyInsensitiveSelectors.length
  	                  && !historySensitiveSelectors.length) {
  	                elide = true;
  	              } else {
  	                var selector = historyInsensitiveSelectors.join(', ');
  	                if (!selector) {
  	                  // If we have only history sensitive selectors,
  	                  // use an impossible rule so that we can capture the content
  	                  // for later processing by
  	                  // history insenstive content for use below.
  	                  selector = 'head > html';
  	                  removeHistoryInsensitiveSelectors = true;
  	                }
  	                safeCss.push(selector, '{');
  	              }
  	            }
  	            blockStack.push(
  	                elide
  	                ? null
  	                // Sometimes a single list of selectors is split in two,
  	                //   div, a:visited
  	                // because we want to allow some properties for DIV that
  	                // we don't want to allow for A:VISITED to avoid leaking
  	                // user history.
  	                // Store the history sensitive selectors and the position
  	                // where the block starts so we can later create a copy
  	                // of the permissive tokens, and filter it to handle the
  	                // history sensitive case.
  	                : {
  	                    historySensitiveSelectors: historySensitiveSelectors,
  	                    endOfSelectors: safeCss.length - 1,  // 1 is open curly
  	                    removeHistoryInsensitiveSelectors:
  	                       removeHistoryInsensitiveSelectors
  	                  });
  	          },
  	          endRuleset: function () {
  	            var rules = blockStack.pop();
  	            var propertiesEnd = safeCss.length;
  	            if (!elide) {
  	              safeCss.push('}');
  	              if (rules) {
  	                var extraSelectors = rules.historySensitiveSelectors;
  	                if (extraSelectors.length) {
  	                  var propertyGroupTokens = safeCss.slice(rules.endOfSelectors);
  	                  safeCss.push(extraSelectors.join(', '),
  	                               sanitizeHistorySensitive(propertyGroupTokens));
  	                }
  	              }
  	            }
  	            if (rules && rules.removeHistoryInsensitiveSelectors) {
  	              safeCss.splice(
  	                // -1 and +1 account for curly braces.
  	                rules.endOfSelectors - 1, propertiesEnd + 1);
  	            }
  	            checkElide();
  	          },
  	          declaration: function (property, valueArray) {
  	            if (!elide) {
  	              var schema = cssSchema[property];
  	              if (schema) {
  	                sanitizeCssProperty(property, schema, valueArray, opt_naiveUriRewriter);
  	                if (valueArray.length) {
  	                  safeCss.push(property, ':', valueArray.join(' '), ';');
  	                }
  	              }
  	            }
  	          }
  	        });
  	    function checkElide() {
  	      elide = blockStack.length !== 0
  	          && blockStack[blockStack.length-1] !== null;
  	    }
  	    return safeCss.join('');
  	  };
  	})();

  	// Exports for closure compiler.
  	if (typeof window !== 'undefined') {
  	  window['sanitizeCssProperty'] = sanitizeCssProperty;
  	  window['sanitizeCssSelectors'] = sanitizeCssSelectors;
  	  window['sanitizeStylesheet'] = sanitizeStylesheet;
  	}
  	// Copyright (C) 2010 Google Inc.
  	//
  	// Licensed under the Apache License, Version 2.0 (the "License");
  	// you may not use this file except in compliance with the License.
  	// You may obtain a copy of the License at
  	//
  	//      http://www.apache.org/licenses/LICENSE-2.0
  	//
  	// Unless required by applicable law or agreed to in writing, software
  	// distributed under the License is distributed on an "AS IS" BASIS,
  	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  	// See the License for the specific language governing permissions and
  	// limitations under the License.

  	/**
  	 * @fileoverview
  	 * Utilities for dealing with CSS source code.
  	 *
  	 * @author mikesamuel@gmail.com
  	 * \@requires lexCss
  	 * \@overrides window
  	 * \@provides parseCssStylesheet, parseCssDeclarations
  	 */

  	/**
  	 * parseCssStylesheet takes a chunk of CSS text and a handler object with
  	 * methods that it calls as below:
  	 * <pre>
  	 * // At the beginning of a stylesheet.
  	 * handler.startStylesheet();
  	 *
  	 * // For an @foo rule ended by a semicolon: @import "foo.css";
  	 * handler.startAtrule('@import', ['"foo.css"']);
  	 * handler.endAtrule();
  	 *
  	 * // For an @foo rule ended with a block. @media print { ... }
  	 * handler.startAtrule('@media', ['print']);
  	 * handler.startBlock();
  	 * // Calls to contents elided.  Probably selectors and declarations as below.
  	 * handler.endBlock();
  	 * handler.endAtrule();
  	 *
  	 * // For a ruleset: p.clazz q, s { color: blue; }
  	 * handler.startRuleset(['p', '.', 'clazz', ' ', 'q', ',', ' ', 's']);
  	 * handler.declaration('color', ['blue']);
  	 * handler.endRuleset();
  	 *
  	 * // At the end of a stylesheet.
  	 * handler.endStylesheet();
  	 * </pre>
  	 * When errors are encountered, the parser drops the useless tokens and
  	 * attempts to resume parsing.
  	 *
  	 * @param {string} cssText CSS3 content to parse as a stylesheet.
  	 * @param {Object} handler An object like <pre>{
  	 *   startStylesheet: function () { ... },
  	 *   endStylesheet: function () { ... },
  	 *   startAtrule: function (atIdent, headerArray) { ... },
  	 *   endAtrule: function () { ... },
  	 *   startBlock: function () { ... },
  	 *   endBlock: function () { ... },
  	 *   startRuleset: function (selectorArray) { ... },
  	 *   endRuleset: function () { ... },
  	 *   declaration: function (property, valueArray) { ... },
  	 * }</pre>
  	 */
  	var parseCssStylesheet;

  	/**
  	 * parseCssDeclarations parses a run of declaration productions as seen in the
  	 * body of the HTML5 {@code style} attribute.
  	 *
  	 * @param {string} cssText CSS3 content to parse as a run of declarations.
  	 * @param {Object} handler An object like <pre>{
  	 *   declaration: function (property, valueArray) { ... },
  	 * }</pre>
  	 */
  	var parseCssDeclarations;

  	(function () {
  	  // stylesheet  : [ CDO | CDC | S | statement ]*;
  	  parseCssStylesheet = function(cssText, handler) {
  	    var toks = lexCss(cssText);
  	    if (handler.startStylesheet) { handler.startStylesheet(); }
  	    for (var i = 0, n = toks.length; i < n;) {
  	      // CDO and CDC ("<!--" and "-->") are converted to space by the lexer.
  	      i = toks[i] === ' ' ? i+1 : statement(toks, i, n, handler);
  	    }
  	    if (handler.endStylesheet) { handler.endStylesheet(); }
  	  };

  	  // statement   : ruleset | at-rule;
  	  function statement(toks, i, n, handler) {
  	    if (i < n) {
  	      var tok = toks[i];
  	      if (tok.charAt(0) === '@') {
  	        return atrule(toks, i, n, handler, true);
  	      } else {
  	        return ruleset(toks, i, n, handler);
  	      }
  	    } else {
  	      return i;
  	    }
  	  }

  	  // at-rule     : ATKEYWORD S* any* [ block | ';' S* ];
  	  function atrule(toks, i, n, handler, blockok) {
  	    var start = i++;
  	    while (i < n && toks[i] !== '{' && toks[i] !== ';') {
  	      ++i;
  	    }
  	    if (i < n && (blockok || toks[i] === ';')) {
  	      var s = start+1, e = i;
  	      if (s < n && toks[s] === ' ') { ++s; }
  	      if (e > s && toks[e-1] === ' ') { --e; }
  	      if (handler.startAtrule) {
  	        handler.startAtrule(toks[start].toLowerCase(), toks.slice(s, e));
  	      }
  	      i = (toks[i] === '{')
  	          ? block(toks, i, n, handler)
  	          : i+1;  // Skip over ';'
  	      if (handler.endAtrule) {
  	        handler.endAtrule();
  	      }
  	    }
  	    // Else we reached end of input or are missing a semicolon.
  	    // Drop the rule on the floor.
  	    return i;
  	  }

  	  // block       : '{' S* [ any | block | ATKEYWORD S* | ';' S* ]* '}' S*;
  	   // Assumes the leading '{' has been verified by callers.
  	  function block(toks, i, n, handler) {
  	    ++i; //  skip over '{'
  	    if (handler.startBlock) { handler.startBlock(); }
  	    while (i < n) {
  	      var ch = toks[i].charAt(0);
  	      if (ch == '}') {
  	        ++i;
  	        break;
  	      }
  	      if (ch === ' ' || ch === ';') {
  	        i = i+1;
  	      } else if (ch === '@') {
  	        i = atrule(toks, i, n, handler, false);
  	      } else if (ch === '{') {
  	        i = block(toks, i, n, handler);
  	      } else {
  	        // Instead of using (any* block) to subsume ruleset we allow either
  	        // blocks or rulesets with a non-blank selector.
  	        // This is more restrictive but does not require atrule specific
  	        // parse tree fixup to realize that the contents of the block in
  	        //    @media print { ... }
  	        // is a ruleset.  We just don't care about any block carrying at-rules
  	        // whose body content is not ruleset content.
  	        i = ruleset(toks, i, n, handler);
  	      }
  	    }
  	    if (handler.endBlock) { handler.endBlock(); }
  	    return i;
  	  }

  	  // ruleset    : selector? '{' S* declaration? [ ';' S* declaration? ]* '}' S*;
  	  function ruleset(toks, i, n, handler) {
  	    // toks[s:e] are the selector tokens including internal whitespace.
  	    var s = i, e = selector(toks, i, n, true);
  	    if (e < 0) {
  	      // Skip malformed content per selector calling convention.
  	      e = ~e;
  	      // Make sure we skip at least one token.
  	      return i === e ? e+1 : e;
  	    }
  	    i = e;
  	    // Don't include any trailing space in the selector slice.
  	    if (e > s && toks[e-1] === ' ') { --e; }
  	    var tok = toks[i];
  	    ++i;  // Skip over '{'
  	    if (tok !== '{') {
  	      // Skips past the '{' when there is a malformed input.
  	      return i;
  	    }
  	    if (handler.startRuleset) {
  	      handler.startRuleset(toks.slice(s, e));
  	    }
  	    while (i < n) {
  	      tok = toks[i];
  	      if (tok === '}') {
  	        ++i;
  	        break;
  	      }
  	      if (tok === ' ') {
  	        i = i+1;
  	      } else {
  	        i = declaration(toks, i, n, handler);
  	      }
  	    }
  	    if (handler.endRuleset) {
  	      handler.endRuleset();
  	    }
  	    return i < n ? i+1 : i;
  	  }

  	  // selector    : any+;
  	  // any         : [ IDENT | NUMBER | PERCENTAGE | DIMENSION | STRING
  	  //               | DELIM | URI | HASH | UNICODE-RANGE | INCLUDES
  	  //               | FUNCTION S* any* ')' | DASHMATCH | '(' S* any* ')'
  	  //               | '[' S* any* ']' ] S*;
  	  // A negative return value, rv, indicates the selector was malformed and
  	  // the index at which we stopped is ~rv.
  	  function selector(toks, i, n, allowSemi) {
  	    // The definition of any above can be summed up as
  	    //   "any run of token except ('[', ']', '(', ')', ':', ';', '{', '}')
  	    //    or nested runs of parenthesized tokens or square bracketed tokens".
  	    // Spaces are significant in the selector.
  	    // Selector is used as (selector?) so the below looks for (any*) for
  	    // simplicity.
  	    var tok;
  	    // Keeping a stack pointer actually causes this to minify better since
  	    // ".length" and ".push" are a lo of chars.
  	    var brackets = [], stackLast = -1;
  	    for (;i < n; ++i) {
  	      tok = toks[i].charAt(0);
  	      if (tok === '[' || tok === '(') {
  	        brackets[++stackLast] = tok;
  	      } else if ((tok === ']' && brackets[stackLast] === '[') ||
  	                 (tok === ')' && brackets[stackLast] === '(')) {
  	        --stackLast;
  	      } else if (tok === '{' || tok === '}' || tok === ';' || tok === '@'
  	                 || (tok === ':' && !allowSemi)) {
  	        break;
  	      }
  	    }
  	    if (stackLast >= 0) {
  	      // Returns the bitwise inverse of i+1 to indicate an error in the
  	      // token stream so that clients can ignore it.
  	      i = ~(i+1);
  	    }
  	    return i;
  	  }

  	  var ident = /^-?[a-z]/i;

  	  // declaration : property ':' S* value;
  	  // property    : IDENT S*;
  	  // value       : [ any | block | ATKEYWORD S* ]+;
  	  function declaration(toks, i, n, handler) {
  	    var property = toks[i++];
  	    if (!ident.test(property)) {
  	      return i+1;  // skip one token.
  	    }
  	    var tok;
  	    if (i < n && toks[i] === ' ') { ++i; }
  	    if (i == n || toks[i] !== ':') {
  	      // skip tokens to next semi or close bracket.
  	      while (i < n && (tok = toks[i]) !== ';' && tok !== '}') { ++i; }
  	      return i;
  	    }
  	    ++i;
  	    if (i < n && toks[i] === ' ') { ++i; }

  	    // None of the rules we care about want atrules or blocks in value, so
  	    // we look for any+ but that is the same as selector but not zero-length.
  	    // This gets us the benefit of not emitting any value with mismatched
  	    // brackets.
  	    var s = i, e = selector(toks, i, n, false);
  	    if (e < 0) {
  	      // Skip malformed content per selector calling convention.
  	      e = ~e;
  	    } else {
  	      var value = [], valuelen = 0;
  	      for (var j = s; j < e; ++j) {
  	        tok = toks[j];
  	        if (tok !== ' ') {
  	          value[valuelen++] = tok;
  	        }
  	      }
  	      // One of the following is now true:
  	      // (1) e is flush with the end of the tokens as in <... style="x:y">.
  	      // (2) tok[e] points to a ';' in which case we need to consume the semi.
  	      // (3) tok[e] points to a '}' in which case we don't consume it.
  	      // (4) else there is bogus unparsed value content at toks[e:].
  	      // Allow declaration flush with end for style attr body.
  	      if (e < n) {  // 2, 3, or 4
  	        do {
  	          tok = toks[e];
  	          if (tok === ';' || tok === '}') { break; }
  	          // Don't emit the property if there is questionable trailing content.
  	          valuelen = 0;
  	        } while (++e < n);
  	        if (tok === ';') {
  	          ++e;
  	        }
  	      }
  	      if (valuelen && handler.declaration) {
  	        // TODO: coerce non-keyword ident tokens to quoted strings.
  	        handler.declaration(property.toLowerCase(), value);
  	      }
  	    }
  	    return e;
  	  }

  	  parseCssDeclarations = function(cssText, handler) {
  	    var toks = lexCss(cssText);
  	    for (var i = 0, n = toks.length; i < n;) {
  	      i = toks[i] !== ' ' ? declaration(toks, i, n, handler) : i+1;
  	    }
  	  };
  	})();

  	// Exports for closure compiler.
  	if (typeof window !== 'undefined') {
  	  window['parseCssStylesheet'] = parseCssStylesheet;
  	  window['parseCssDeclarations'] = parseCssDeclarations;
  	}
  	/*!
  	 * OpenUI5
  	 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
  	 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
  	 */
  	// Based on coding from the HTML4 Sanitizer by Google Inc.
  	// The HTML Attributes and ELements were reorganized according to the actual HTML5 specification
  	// from the W3C. All types and flags were reviewed again as accurately as possible with HTML4 only
  	// elements removed, you can still see them as comments. All rules which are new or changed from the
  	// old HTML4 file are also marked "new" within the comment. The comments also state which attributes
  	// and elements are assigned to respective types and flags. All rules which were not 100% clear were
  	// analyzed in a way of similarity, so for example "audio" and "video" content behaves like images etc.
  	// URIEFFECTS state if a URL is loaded inplace within a tag where the actual document is in control
  	// of what type of content is loaded like "image" or if a new document is loaded like with "a href".
  	// LOADERTYPES state if content is loaded as sandboxed which means it is loaded within a specific
  	// surroundig player like with video content for example or if it is loaded freely without restrictions.
  	// @overrides window
  	// @provides html4

  	var html4 = {};
  	html4.atype = {
  	  NONE: 0,
  	  URI: 1, //action, cite, data, href, icon, manifest, poster, src
  	  URI_FRAGMENT: 11, //usemap
  	  SCRIPT: 2, //all event handlers
  	  STYLE: 3, //style
  	  ID: 4, //id
  	  IDREF: 5, //for
  	  IDREFS: 6, //headers
  	  GLOBAL_NAME: 7, //name of form, iframe, img, map, meta
  	  LOCAL_NAME: 8, //name of button, fieldset, input, keygen, object, output, param, select, textarea
  	  CLASSES: 9, //class
  	  FRAME_TARGET: 10 //formtarget, srcdoc, target
  	};

  	html4.ATTRIBS = {
  		'*::accesskey': 0, //NONE
  		'*::class': 9, //CLASSES
  		'*::contenteditable': 0, //NONE new
  		'*::contextmenu': 0, //NONE new
  		'*::dir': 0, //NONE
  		'*::draggable': 0, //NONE new
  		'*::dropzone': 0, //NONE new
  		'*::hidden': 0, //NONE new
  		'*::id': 4, //ID
  		'*::lang': 0, //NONE
  		'*::onabort': 2, //SCRIPT new
  		'*::onblur': 2, //SCRIPT new
  		'*::oncanplay': 2, //SCRIPT new
  		'*::oncanplaythrough': 2, //SCRIPT new
  		'*::onchange': 2, //SCRIPT new
  		'*::onclick': 2, //SCRIPT
  		'*::oncontextmenu': 2, //SCRIPT new
  		'*::oncuechange': 2, //SCRIPT new
  		'*::ondblclick': 2, //SCRIPT
  		'*::ondrag': 2, //SCRIPT new
  		'*::ondragend': 2, //SCRIPT new
  		'*::ondragenter': 2, //SCRIPT new
  		'*::ondragleave': 2, //SCRIPT new
  		'*::ondragover': 2, //SCRIPT new
  		'*::ondragstart': 2, //SCRIPT new
  		'*::ondrop': 2, //SCRIPT new
  		'*::ondurationchange': 2, //SCRIPT new
  		'*::onemptied': 2, //SCRIPT new
  		'*::onended': 2, //SCRIPT new
  		'*::onerror': 2, //SCRIPT new
  		'*::onfocus': 2, //SCRIPT new
  		'*::oninput': 2, //SCRIPT new
  		'*::oninvalid':	 2, //SCRIPT new
  		'*::onkeydown': 2, //SCRIPT
  		'*::onkeypress': 2, //SCRIPT
  		'*::onkeyup': 2, //SCRIPT
  		'*::onload': 2, //SCRIPT
  		'*::onloadeddata': 2, //SCRIPT new
  		'*::onloadedmetadata': 2, //SCRIPT new
  		'*::onloadstart': 2, //SCRIPT new
  		'*::onmousedown': 2, //SCRIPT
  		'*::onmousemove': 2, //SCRIPT
  		'*::onmouseout': 2, //SCRIPT
  		'*::onmouseover': 2, //SCRIPT
  		'*::onmouseup': 2, //SCRIPT
  		'*::onmousewheel': 2, //SCRIPT new
  		'*::onpause': 2, //SCRIPT new
  		'*::onplay': 2, //SCRIPT new
  		'*::onplaying': 2, //SCRIPT new
  		'*::onprogress': 2, //SCRIPT new
  		'*::onratechange': 2, //SCRIPT new
  		'*::onreadystatechange': 2, //SCRIPT new
  		'*::onreset': 2, //SCRIPT new
  		'*::onscroll': 2, //SCRIPT new
  		'*::onseeked': 2, //SCRIPT new
  		'*::onseeking': 2, //SCRIPT new
  		'*::onselect': 2, //SCRIPT new
  		'*::onshow': 2, //SCRIPT new
  		'*::onstalled': 2, //SCRIPT new
  		'*::onsubmit': 2, //SCRIPT new
  		'*::onsuspend': 2, //SCRIPT new
  		'*::ontimeupdate': 2, //SCRIPT new
  		'*::onvolumechange': 2, //SCRIPT new
  		'*::onwaiting': 2, //SCRIPT new
  		'*::spellcheck': 0, //NONE new
  		'*::style': 3, //STYLE
  		'*::tabindex': 0, //NONE
  		'*::title': 0, //NONE
  	//---------------------  'a::accesskey': 0, moved to global
  	//---------------------  'a::coords': 0,
  		'a::href': 1, //URI
  		'a::hreflang': 0, //NONE
  		'a::media': 0, //NONE new
  	//---------------------  'a::name': 7,
  	//---------------------	 'a::onblur': 2, moved to global
  	//---------------------	 'a::onfocus': 2, moved to global
  		'a::rel': 0, //NONE
  	//---------------------  'a::rev': 0,
  	//---------------------  'a::shape': 0,
  	//---------------------  'a::tabindex': 0, moved to global
  		'a::target': 0, //changed to "0" because of CSN 1918585 2013, original value was 10 FRAME_TARGET but it seems uncritical
  		'a::type': 0, //NONE
  	//---------------------  'area::accesskey': 0, moved to global
  		'area::alt': 0, //NONE
  		'area::coords': 0, //NONE
  		'area::href': 1, //URI
  		'area::hreflang': 0, //NONE new
  		'area::media': 0, //NONE new
  	//---------------------  'area::nohref': 0,
  	//---------------------	 'area::onblur': 2, moved to global
  	//---------------------	 'area::onfocus': 2, moved to global
  		'area::rel': 0, //NONE new
  		'area::shape': 0, //NONE
  	//---------------------  'area::tabindex': 0, moved to global
  		'area::target': 10, //FRAME_TARGET
  		'area::type': 0, //NONE
  		'audio::autoplay': 0, //NONE new
  		'audio::controls': 0, //NONE new
  		'audio::loop': 0, //NONE new
  		'audio::mediagroup': 0, //NONE new
  		'audio::preload': 0, //NONE new
  		'audio::src': 1, //URI
  		'base::href': 1, //URI
  		'base::target': 10, //FRAME_TARGET
  	//---------------------  'bdo::dir': 0,
  		'blockquote::cite': 1, //URI
  		'body::onafterprint': 2, //SCRIPT new
  		'body::onbeforeprint': 2, //SCRIPT new
  		'body::onbeforeunload': 2, //SCRIPT new
  		'body::onblur': 2, //SCRIPT new
  		'body::onerror': 2, //SCRIPT new
  		'body::onfocus': 2, //SCRIPT new
  		'body::onhashchange': 2, //SCRIPT new
  		'body::onload': 2, //SCRIPT new
  		'body::onmessage': 2, //SCRIPT new
  		'body::onoffline': 2, //SCRIPT new
  		'body::ononline': 2, //SCRIPT new
  		'body::onpagehide': 2, //SCRIPT new
  		'body::onpageshow': 2, //SCRIPT new
  		'body::onpopstate': 2, //SCRIPT new
  		'body::onredo': 2, //SCRIPT new
  		'body::onresize': 2, //SCRIPT new
  		'body::onscroll': 2, //SCRIPT new
  		'body::onstorage': 2, //SCRIPT new
  		'body::onundo': 2, //SCRIPT new
  		'body::onunload': 2, //SCRIPT new
  	//---------------------  'br::clear': 0,
  	//---------------------  'button::accesskey': 0, moved to global
  		'button::autofocus': 0, //NONE new
  		'button::disabled': 0, //NONE
  		'button::form': 0, //NONE new
  		'button::formaction': 1, //URI new
  		'button::formenctype': 0, //NONE new
  		'button::formmethod': 0, //NONE new
  		'button::formnovalidate': 0, //NONE new
  		'button::formtarget': 10, //FRAME_TARGET new
  		'button::name': 8, //LOCAL_NAME
  	//---------------------	 'button::onblur': 2,
  	//---------------------	 'button::onfocus': 2,
  	//---------------------  'button::tabindex': 0, moved to global
  		'button::type': 0, //NONE
  		'button::value': 0, //NONE
  		'canvas::height': 0, //NONE
  		'canvas::width': 0, //NONE
  	//---------------------	 'caption::align': 0,
  	//---------------------  'col::align': 0,
  	//---------------------	 'col::char': 0,
  	//---------------------	 'col::charoff': 0,
  		'col::span': 0, //NONE
  	//---------------------	 'col::valign': 0,
  	//---------------------	 'col::width': 0,
  	//---------------------	 'colgroup::align': 0,
  	//---------------------	 'colgroup::char': 0,
  	//---------------------	 'colgroup::charoff': 0,
  		'colgroup::span': 0, //NONE
  	//---------------------	 'colgroup::valign': 0,
  	//---------------------	 'colgroup::width': 0,
  		'command::checked': 0, //NONE new
  		'command::disabled': 0, //NONE new
  		'command::icon': 1, //URI new
  		'command::label': 0, //NONE new
  		'command::radiogroup': 0, //NONE new
  		'command::type': 0, //NONE new
  		'del::cite': 1, //URI
  		'del::datetime': 0, //NONE
  		'details::open': 0, //NONE new
  	//---------------------	 'dir::compact': 0,
  	//---------------------	 'div::align': 0,
  	//---------------------	 'dl::compact': 0,
  		'embed::height': 0, //NONE new
  		'embed::src': 1, //URI new
  		'embed::type': 0, //NONE new
  		'embed::width': 0, //NONE new
  		'fieldset::disabled': 0, //NONE new
  		'fieldset::form': 0, //NONE new
  		'fieldset::name': 8, //LOCAL_NAME new
  	//---------------------	 'font::color': 0,
  	//---------------------	 'font::face': 0,
  	//---------------------	 'font::size': 0,
  	//---------------------	 'form::accept': 0,
  		'form::accept-charset': 0, //NONE
  		'form::action': 1, //URI
  		'form::autocomplete': 0, //NONE
  		'form::enctype': 0, //NONE
  		'form::method': 0, //NONE
  		'form::name': 7, //GLOBAL_NAME
  		'form::novalidate': 0, //NONE new
  	//---------------------	 'form::onreset': 2,
  	//---------------------	 'form::onsubmit': 2,
  		'form::target': 10, //FRAME_TARGET
  	//---------------------	 'h1::align': 0,
  	//---------------------	 'h2::align': 0,
  	//---------------------	 'h3::align': 0,
  	//---------------------	 'h4::align': 0,
  	//---------------------	 'h5::align': 0,
  	//---------------------	 'h6::align': 0,
  	//---------------------	 'hr::align': 0,
  	//---------------------	 'hr::noshade': 0,
  	//---------------------	 'hr::size': 0,
  	//---------------------	 'hr::width': 0,
  		'html:: manifest': 1, //URI new
  	//---------------------	 'iframe::align': 0,
  	//---------------------	'iframe::frameborder': 0,
  		'iframe::height': 0, //NONE
  	//---------------------	 'iframe::marginheight': 0,
  	//---------------------	 'iframe::marginwidth': 0,
  		'iframe::name': 7, //GLOBAL_NAME new
  		'iframe::sandbox': 0, //NONE new
  		'iframe::seamless': 0, //NONE new
  		'iframe::src': 1, //URI new
  		'iframe::srcdoc': 10, //FRAME_TARGET new
  		'iframe::width': 0, //NONE
  	//---------------------	 'img::align': 0,
  		'img::alt': 0, //NONE
  	//---------------------	 'img::border': 0,
  		'img::height': 0, //NONE
  	//---------------------	 'img::hspace': 0,
  		'img::ismap': 0, //NONE
  		'img::name': 7, //GLOBAL_NAME
  		'img::src': 1, //URI
  		'img::usemap': 11, //URI_FRAGMENT
  	//---------------------	'img::vspace': 0,
  		'img::width': 0, //NONE
  		'input::accept': 0, //NONE
  	//---------------------	 'input::accesskey': 0, moved to global
  	//---------------------	 'input::align': 0,
  		'input::alt': 0, //NONE
  		'input::autocomplete': 0, //NONE
  		'input::autofocus': 0, //NONE new
  		'input::checked': 0, //NONE
  		'input::dirname': 0, //NONE new
  		'input::disabled': 0, //NONE
  		'input::form': 0, //NONE new
  		'input::formaction': 1, //URI new
  		'input::formenctype': 0, //NONE new
  		'input::formmethod': 0, //NONE new
  		'input::formnovalidate': 0, //NONE new
  		'input::formtarget': 10, //FRAME_TARGET new
  		'input::height': 0, //NONE new
  	//---------------------	 'input::ismap': 0,
  		'input::list': 0, //NONE new
  		'input::max': 0, //NONE new
  		'input::maxlength': 0, //NONE
  		'input::min': 0, //NONE new
  		'input::multiple': 0, //NONE new
  		'input::name': 8, //LOCAL_NAME
  	//---------------------	 'input::onblur': 2,
  	//---------------------	 'input::onchange': 2,
  	//---------------------	 'input::onfocus': 2,
  	//---------------------	 'input::onselect': 2,
  		'input::pattern': 0, //NONE new
  		'input::placeholder': 0, //NONE new
  		'input::readonly': 0, //NONE
  		'input::required': 0, //NONE new
  		'input::step': 0, //NONE new
  		'input::size': 0, //NONE
  		'input::src': 1, //URI
  	//---------------------  'input::tabindex': 0, moved to global
  		'input::type': 0, //NONE
  	//---------------------	 'input::usemap': 11,
  		'input::value': 0, //NONE
  		'input::width': 0, //NONE new
  		'ins::cite': 1, //URI
  		'ins::datetime': 0, //NONE
  	//---------------------  'label::accesskey': 0, moved to global
  		'keygen::autofocus': 0, //NONE new
  		'keygen::challenge': 0, //NONE new
  		'keygen::disabled': 0, //NONE new
  		'keygen::form': 0, //NONE new
  		'keygen::keytype': 0, //NONE new
  		'keygen::name': 8, //LOCAL_NAME new
  		'label::for': 5, //IDREF
  		'label::form': 0, //NONE new
  	//---------------------	 'label::onblur': 2,
  	//---------------------	 'label::onfocus': 2,
  	//---------------------  'legend::accesskey': 0, moved to global
  	//---------------------  'legend::align': 0,
  	//---------------------  'li::type': 0,
  		'link::href': 1, //URI new
  		'link::hreflang': 0, //NONE new
  		'link::media': 0, //NONE new
  		'link::rel': 0, //NONE new
  		'link::sizes': 0, //NONE new
  		'link::type': 0, //NONE new
  		'li::value': 0, //NONE new
  		'map::name': 7, //GLOBAL_NAME
  	//---------------------  'menu::compact': 0,
  		'menu::label': 0, //NONE new
  		'menu::type': 0, //NONE new
  		'meta::charset': 0, //NONE new
  		'meta::content': 0, //NONE new
  		'meta::http-equiv': 0, //NONE new
  		'meta::name': 7, //GLOBAL_NAME new
  		'meter::form': 0, //NONE new
  		'meter::high': 0, //NONE new
  		'meter::low': 0, //NONE new
  		'meter::max': 0, //NONE new
  		'meter::min': 0, //NONE new
  		'meter::optimum': 0, //NONE new
  		'meter::value': 0, //NONE new
  		'object::data': 1, //URI new
  		'object::form': 0, //NONE new
  		'object::height': 0, //NONE new
  		'object::name': 8, //LOCAL_NAME new
  		'object::type': 0, //NONE new
  		'object::usemap': 11, //URI_FRAGMENT new
  		'object::width': 0, //NONE new
  	//---------------------  'ol::compact': 0,
  		'ol::reversed': 0, //NONE new
  		'ol::start': 0, //NONE
  	//---------------------  'ol::type': 0,
  		'optgroup::disabled': 0, //NONE
  		'optgroup::label': 0, //NONE
  		'option::disabled': 0, //NONE
  		'option::label': 0, //NONE
  		'option::selected': 0, //NONE
  		'option::value': 0, //NONE
  		'output::for': 5, //IDREF new
  		'output::form': 0, //NONE new
  		'output::name': 8, //LOCAL_NAME new
  	//---------------------  'p::align': 0,
  		'param::name': 8, //LOCAL_NAME new
  		'param::value': 0, //NONE new
  		'progress::form': 0, //NONE new
  		'progress::max': 0, //NONE new
  		'progress::value': 0, //NONE new
  	//---------------------  'pre::width': 0,
  		'q::cite': 1, //URI
  		'script::async': 0, //NONE new
  		'script::charset': 0, //NONE new
  		'script::defer': 0, //NONE new
  		'script::src': 1, //URI new
  		'script::type': 0, //NONE new
  		'select::autofocus': 0, //NONE new
  		'select::disabled': 0, //NONE
  		'select::form': 0, //NONE new
  		'select::multiple': 0, //NONE
  		'select::name': 8, //LOCAL_NAME
  	//---------------------	 'select::onblur': 2,
  	//---------------------	 'select::onchange': 2,
  	//---------------------	 'select::onfocus': 2,
  		'select::required': 0, //NONE new
  		'select::size': 0, //NONE
  	//---------------------  'select::tabindex': 0, moved to global
  		'source::media': 0, //NONE new
  		'source::src': 1, //URI new
  		'source::type': 0, //NONE new
  		'style::media': 0, //NONE new
  		'style::scoped': 0, //NONE new
  		'style::type': 0, //NONE new
  	//---------------------	 'table::align': 0,
  	//---------------------	 'table::bgcolor': 0,
  		'table::border': 0, //NONE
  	//---------------------	 'table::cellpadding': 0,
  	//---------------------	 'table::cellspacing': 0,
  	//---------------------	 'table::frame': 0,
  	//---------------------	 'table::rules': 0,
  	//---------------------	 'table::summary': 0,
  	//---------------------	 'table::width': 0,
  	//---------------------	 'tbody::align': 0,
  	//---------------------	 'tbody::char': 0,
  	//---------------------	 'tbody::charoff': 0,
  	//---------------------	 'tbody::valign': 0,
  	//---------------------	 'td::abbr': 0,
  	//---------------------	 'td::align': 0,
  	//---------------------	 'td::axis': 0,
  	//---------------------	 'td::bgcolor': 0,
  	//---------------------	 'td::char': 0,
  	//---------------------	 'td::charoff': 0,
  		'td::colspan': 0, //NONE
  		'td::headers': 6, //IDREFS
  	//---------------------	 'td::height': 0,
  	//---------------------	 'td::nowrap': 0,
  		'td::rowspan': 0, //NONE
  	//---------------------	 'td::scope': 0,
  	//---------------------  'td::valign': 0,
  	//---------------------	 'td::width': 0,
  	//---------------------  'textarea::accesskey': 0, moved to global
  		'textarea::autofocus': 0, //NONE new
  		'textarea::cols': 0, //NONE
  		'textarea::disabled': 0, //NONE
  		'textarea::form': 0, //NONE new
  		'textarea::maxlength': 0, //NONE new
  		'textarea::name': 8, //LOCAL_NAME
  	//---------------------	 'textarea::onblur': 2,
  	//---------------------	 'textarea::onchange': 2,
  	//---------------------	 'textarea::onfocus': 2,
  	//---------------------	 'textarea::onselect': 2,
  		'textarea::placeholder': 0, //NONE new
  		'textarea::readonly': 0, //NONE
  		'textarea::required': 0, //NONE new
  		'textarea::rows': 0, //NONE
  		'textarea::wrap': 0, //NONE new
  	//---------------------  'textarea::tabindex': 0, moved to global
  	//---------------------	 'tfoot::align': 0,
  	//---------------------	 'tfoot::char': 0,
  	//---------------------	 'tfoot::charoff': 0,
  	//---------------------	 'tfoot::valign': 0,
  	//---------------------	 'th::abbr': 0,
  	//---------------------	 'th::align': 0,
  	//---------------------	 'th::axis': 0,
  	//---------------------	 'th::bgcolor': 0,
  	//---------------------	 'th::char': 0,
  	//---------------------	 'th::charoff': 0,
  		'th::colspan': 0, //NONE
  		'th::headers': 6, //IDREFS
  	//---------------------	 'th::height': 0,
  	//---------------------	 'th::nowrap': 0,
  		'th::rowspan': 0, //NONE
  		'th::scope': 0, //NONE
  	//---------------------	 'th::valign': 0,
  	//---------------------	 'th::width': 0,
  	//---------------------	 'thead::align': 0,
  	//---------------------	 'thead::char': 0,
  	//---------------------	 'thead::charoff': 0,
  	//---------------------	 'thead::valign': 0,
  		'time::datetime': 0, //NONE new
  		'time::pubdate': 0, //NONE new
  	//---------------------	 'tr::align': 0,
  	//---------------------	 'tr::bgcolor': 0,
  	//---------------------	 'tr::char': 0,
  	//---------------------	 'tr::charoff': 0,
  	//---------------------	 'tr::valign': 0,
  		'track::default': 0, //NONE new
  		'track::kind': 0, //NONE new
  		'track::label': 0, //NONE new
  		'track::src': 1, //URI new
  		'track::srclang': 0, //NONE new
  	//---------------------	 'ul::compact': 0,
  	//---------------------	 'ul::type': 0
  		'video::autoplay': 0, //NONE new
  		'video::controls': 0, //NONE new
  		'video::height': 0, //NONE new
  		'video::loop': 0, //NONE new
  		'video::mediagroup': 0, //NONE new
  		'video::poster': 1, //URI new
  		'video::preload': 0, //NONE new
  		'video::src': 1, //URI new
  		'video::width': 0 //NONE new
  	};
  	html4.eflags = {
  		OPTIONAL_ENDTAG: 1,
  		EMPTY: 2,
  		CDATA: 4,
  		RCDATA: 8,
  		UNSAFE: 16,
  		FOLDABLE: 32,
  		SCRIPT: 64,
  		STYLE: 128
  	};
  	html4.ELEMENTS = {
  		'a': 0,
  		'abbr': 0,
  	//---------------------	 'acronym': 0,
  		'address': 0,
  	//---------------------	 'applet': 16,
  		'area': 2, //EMPTY
  		'article': 0, //new
  		'aside': 0, //new
  		'audio': 0, //new
  		'b': 0,
  		'base': 18, //EMPTY, UNSAFE
  	//---------------------	 'basefont': 18,
  		'bdi': 0, //new
  		'bdo': 0,
  	//---------------------	 'big': 0,
  		'blockquote': 0,
  		'body': 49, //OPTIONAL_ENDTAG, UNSAFE, FOLDABLE
  		'br': 2, //EMPTY
  		'button': 0,
  		'canvas': 0,
  		'caption': 0,
  	//---------------------	 'center': 0,
  		'cite': 0,
  		'code': 0,
  		'col': 2, //EMPTY
  		'colgroup': 1, //OPTIONAL_ENDTAG
  		'command': 2, //EMPTY new
  		'datalist': 0, //new
  		'dd': 1, //OPTIONAL_ENDTAG
  		'del': 0,
  		'details': 0, //new
  		'dfn': 0,
  	//---------------------	 'dir': 0,
  		'div': 0,
  		'dl': 0,
  		'dt': 1, //OPTIONAL_ENDTAG
  		'em': 0,
  		'embed': 18, //EMPTY, UNSAFE new
  		'fieldset': 0,
  		'figcaption': 0, //new
  		'figure': 0, //new
  	//---------------------	 'font': 0,
  		'footer': 0, //new
  		'form': 0,
  	//---------------------	 'frame': 18,
  	//---------------------	 'frameset': 16,
  		'h1': 0,
  		'h2': 0,
  		'h3': 0,
  		'h4': 0,
  		'h5': 0,
  		'h6': 0,
  		'head': 49, //OPTIONAL_ENDTAG, UNSAFE, FOLDABLE
  		'header': 0, //new
  		'hgroup': 0, //new
  		'hr': 2, //EMPTY
  		'html': 49, //OPTIONAL_ENDTAG, UNSAFE, FOLDABLE
  		'i': 0,
  		'iframe': 0, //new
  		'img': 2,//EMPTY
  		'input': 2, //EMPTY
  		'ins': 0,
  	//---------------------	 'isindex': 18,
  		'kbd': 0,
  		'keygen': 2, //EMPTY new
  		'label': 0,
  		'legend': 0,
  		'li': 1, //OPTIONAL_ENDTAG
  		'link': 18, //EMPTY, UNSAFE
  		'map': 0,
  		'mark': 0, //new
  		'menu': 0,
  		'meta': 18, //EMPTY, UNSAFE
  		'meter': 0, //new
  		'nav': 0,
  	//---------------------	 'nobr': 0,
  	//---------------------	 'noembed': 4,
  	//---------------------	 'noframes': 20,
  		'noscript': 20, //CDATA, UNSAFE
  		'object': 16, //UNSAFE
  		'ol': 0,
  		'optgroup': 1, //OPTIONAL_ENDTAG new !!!!vorher 0
  		'option': 1, //OPTIONAL_ENDTAG
  		'output': 0, //new
  		'p': 1, //OPTIONAL_ENDTAG
  		'param': 18, //EMPTY, UNSAFE
  		'pre': 0,
  		'progress': 0, //new
  		'q': 0,
  		'rp': 1, //OPTIONAL_ENDTAG new
  		'rt': 1, //OPTIONAL_ENDTAG new
  		'ruby': 0, //new
  		's': 0,
  		'samp': 0,
  		'script': 84, //CDATA, UNSAFE, SCRIPT
  		'section': 0, //new
  		'select': 0,
  		'small': 0,
  		'source': 2, //EMPTY new
  		'span': 0,
  	//---------------------	 'strike': 0,
  		'strong': 0,
  		'style': 148, //CDATA, UNSAFE, STYLE
  		'sub': 0,
  		'summary': 0, //new
  		'sup': 0,
  		'table': 0,
  		'tbody': 1, //OPTIONAL_ENDTAG
  		'td': 1, //OPTIONAL_ENDTAG
  		'textarea': 8, //RCDATA
  		'tfoot': 1, //OPTIONAL_ENDTAG
  		'th': 1, //OPTIONAL_ENDTAG
  		'thead': 1, //OPTIONAL_ENDTAG
  		'time': 0, //new
  		'title': 24, //RCDATA, UNSAFE
  		'tr': 1, //OPTIONAL_ENDTAG
  		'track': 2, //EMPTY new
  	//---------------------	 'tt': 0,
  		'u': 0,
  		'ul': 0,
  		'var': 0,
  		'video': 0, //new
  		'wbr': 2 //EMPTY new
  	};
  	html4.ueffects = {
  		NOT_LOADED: 0,
  		SAME_DOCUMENT: 1,
  		NEW_DOCUMENT: 2
  	};
  	html4.URIEFFECTS = {
  		'a::href': 2, //NEW_DOCUMENT
  		'area::href': 2, //NEW_DOCUMENT
  		'audio::src': 1, //SAME_DOCUMENT new
  		'base::href':2, //NEW_DOCUMENT new
  		'blockquote::cite': 0, //NOT_LOADED
  	//---------------------	 'body::background': 1,
  		'button::formaction': 2, //NEW_DOCUMENT new
  		'command::icon': 1, //SAME_DOCUMENT new
  		'del::cite': 0, //NOT_LOADED
  		'embed::src': 1, //SAME_DOCUMENT new
  		'form::action': 2, //NEW_DOCUMENT
  		'html:: manifest': 1, //SAME_DOCUMENT new
  		'iframe::src': 1, //SAME_DOCUMENT new
  		'img::src': 1, //SAME_DOCUMENT
  		'input::formaction': 2, //NEW_DOCUMENT new
  		'input::src': 1, //SAME_DOCUMENT
  		'ins::cite': 0, //NOT_LOADED
  		'link::href': 2, //NEW_DOCUMENT new
  		'object::data': 1, //SAME_DOCUMENT new
  		'q::cite': 0, //NOT_LOADED
  		'script::src': 1, //SAME_DOCUMENT new
  		'source::src': 1, //SAME_DOCUMENT new
  		'track::src': 1, //SAME_DOCUMENT new
  		'video::poster': 1, //SAME_DOCUMENT new
  		'video::src': 1 //SAME_DOCUMENT new
  	};
  	html4.ltypes = {
  		UNSANDBOXED: 2,
  		SANDBOXED: 1,
  		DATA: 0
  	};
  	html4.LOADERTYPES = {
  		'a::href': 2, //UNSANDBOXED
  		'area::href': 2, //UNSANDBOXED
  		'audio::src': 1, //SANDBOXED new
  		'base::href': 2, //UNSANDBOXED new
  		'blockquote::cite': 2, //UNSANDBOXED
  	//---------------------	 'body::background': 1,
  		'button::formaction': 2, //UNSANDBOXED new
  		'command::icon': 1, //SANDBOXED new
  		'del::cite': 2, //UNSANDBOXED
  		'embed::src': 1, //SANDBOXED new
  		'form::action': 2, //UNSANDBOXED
  		'html:: manifest': 1, //SANDBOXED new
  		'iframe::src': 1, //SANDBOXED new
  		'img::src': 1, //SANDBOXED
  		'input::formaction': 2, //UNSANDBOXED new
  		'input::src': 1, //SANDBOXED
  		'ins::cite': 2, //UNSANDBOXED
  		'link::href': 2, //UNSANDBOXED new
  		'object::data': 0, //DATA new
  		'q::cite': 2, //UNSANDBOXED
  		'script::src': 1, //SANDBOXED new
  		'source::src': 1, //SANDBOXED new
  		'track::src': 1, //SANDBOXED new
  		'video::poster': 1, //SANDBOXED new
  		'video::src': 1 //SANDBOXED new
  	};if (typeof window !== 'undefined') {
  		window['html4'] = html4;
  	}// Copyright (C) 2006 Google Inc.
  	//
  	// Licensed under the Apache License, Version 2.0 (the "License");
  	// you may not use this file except in compliance with the License.
  	// You may obtain a copy of the License at
  	//
  	//      http://www.apache.org/licenses/LICENSE-2.0
  	//
  	// Unless required by applicable law or agreed to in writing, software
  	// distributed under the License is distributed on an "AS IS" BASIS,
  	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  	// See the License for the specific language governing permissions and
  	// limitations under the License.

  	/**
  	 * @fileoverview
  	 * An HTML sanitizer that can satisfy a variety of security policies.
  	 *
  	 * <p>
  	 * The HTML sanitizer is built around a SAX parser and HTML element and
  	 * attributes schemas.
  	 *
  	 * If the cssparser is loaded, inline styles are sanitized using the
  	 * css property and value schemas.  Else they are remove during
  	 * sanitization.
  	 *
  	 * If it exists, uses parseCssDeclarations, sanitizeCssProperty,  cssSchema
  	 *
  	 * @author mikesamuel@gmail.com
  	 * @author jasvir@gmail.com
  	 * \@requires html4
  	 * \@overrides window
  	 * \@provides html, html_sanitize
  	 */

  	/**
  	 * \@namespace
  	 */
  	var html = (function(html4) {

  	  // For closure compiler
  	  var parseCssDeclarations, sanitizeCssProperty, cssSchema;
  	  if ('undefined' !== typeof window) {
  	    parseCssDeclarations = window['parseCssDeclarations'];
  	    sanitizeCssProperty = window['sanitizeCssProperty'];
  	    cssSchema = window['cssSchema'];
  	  }

  	  var lcase;
  	  // The below may not be true on browsers in the Turkish locale.
  	  if ('script' === 'SCRIPT'.toLowerCase()) {
  	    lcase = function(s) { return s.toLowerCase(); };
  	  } else {
  	    /**
  	     * {\@updoc
  	     * $ lcase('SCRIPT')
  	     * # 'script'
  	     * $ lcase('script')
  	     * # 'script'
  	     * }
  	     */
  	    lcase = function(s) {
  	      return s.replace(
  	          /[A-Z]/g,
  	          function(ch) {
  	            return String.fromCharCode(ch.charCodeAt(0) | 32);
  	          });
  	    };
  	  }

  	  // The keys of this object must be 'quoted' or JSCompiler will mangle them!
  	  var ENTITIES = {
  	    'lt': '<',
  	    'gt': '>',
  	    'amp': '&',
  	    'nbsp': '\xA0',
  	    'quot': '"',
  	    'apos': '\''
  	  };

  	  var decimalEscapeRe = /^#(\d+)$/;
  	  var hexEscapeRe = /^#x([0-9A-Fa-f]+)$/;
  	  /**
  	   * Decodes an HTML entity.
  	   *
  	   * {\@updoc
  	   * $ lookupEntity('lt')
  	   * # '<'
  	   * $ lookupEntity('GT')
  	   * # '>'
  	   * $ lookupEntity('amp')
  	   * # '&'
  	   * $ lookupEntity('nbsp')
  	   * # '\xA0'
  	   * $ lookupEntity('apos')
  	   * # "'"
  	   * $ lookupEntity('quot')
  	   * # '"'
  	   * $ lookupEntity('#xa')
  	   * # '\n'
  	   * $ lookupEntity('#10')
  	   * # '\n'
  	   * $ lookupEntity('#x0a')
  	   * # '\n'
  	   * $ lookupEntity('#010')
  	   * # '\n'
  	   * $ lookupEntity('#x00A')
  	   * # '\n'
  	   * $ lookupEntity('Pi')      // Known failure
  	   * # '\u03A0'
  	   * $ lookupEntity('pi')      // Known failure
  	   * # '\u03C0'
  	   * }
  	   *
  	   * @param {string} name the content between the '&' and the ';'.
  	   * @return {string} a single unicode code-point as a string.
  	   */
  	  function lookupEntity(name) {
  	    name = lcase(name);  // TODO: &pi; is different from &Pi;
  	    if (ENTITIES.hasOwnProperty(name)) { return ENTITIES[name]; }
  	    var m = name.match(decimalEscapeRe);
  	    if (m) {
  	      return String.fromCharCode(parseInt(m[1], 10));
  	    } else if (!!(m = name.match(hexEscapeRe))) {
  	      return String.fromCharCode(parseInt(m[1], 16));
  	    }
  	    return '';
  	  }

  	  function decodeOneEntity(_, name) {
  	    return lookupEntity(name);
  	  }

  	  var nulRe = /\0/g;
  	  function stripNULs(s) {
  	    return s.replace(nulRe, '');
  	  }

  	  var entityRe = /&(#\d+|#x[0-9A-Fa-f]+|\w+);/g;
  	  /**
  	   * The plain text of a chunk of HTML CDATA which possibly containing.
  	   *
  	   * {\@updoc
  	   * $ unescapeEntities('')
  	   * # ''
  	   * $ unescapeEntities('hello World!')
  	   * # 'hello World!'
  	   * $ unescapeEntities('1 &lt; 2 &amp;&AMP; 4 &gt; 3&#10;')
  	   * # '1 < 2 && 4 > 3\n'
  	   * $ unescapeEntities('&lt;&lt <- unfinished entity&gt;')
  	   * # '<&lt <- unfinished entity>'
  	   * $ unescapeEntities('/foo?bar=baz&copy=true')  // & often unescaped in URLS
  	   * # '/foo?bar=baz&copy=true'
  	   * $ unescapeEntities('pi=&pi;&#x3c0;, Pi=&Pi;\u03A0') // FIXME: known failure
  	   * # 'pi=\u03C0\u03c0, Pi=\u03A0\u03A0'
  	   * }
  	   *
  	   * @param {string} s a chunk of HTML CDATA.  It must not start or end inside
  	   *     an HTML entity.
  	   */
  	  function unescapeEntities(s) {
  	    return s.replace(entityRe, decodeOneEntity);
  	  }

  	  var ampRe = /&/g;
  	  var looseAmpRe = /&([^a-z#]|#(?:[^0-9x]|x(?:[^0-9a-f]|$)|$)|$)/gi;
  	  var ltRe = /[<]/g;
  	  var gtRe = />/g;
  	  var quotRe = /\"/g;

  	  /**
  	   * Escapes HTML special characters in attribute values.
  	   *
  	   * {\@updoc
  	   * $ escapeAttrib('')
  	   * # ''
  	   * $ escapeAttrib('"<<&==&>>"')  // Do not just escape the first occurrence.
  	   * # '&#34;&lt;&lt;&amp;&#61;&#61;&amp;&gt;&gt;&#34;'
  	   * $ escapeAttrib('Hello <World>!')
  	   * # 'Hello &lt;World&gt;!'
  	   * }
  	   */
  	  function escapeAttrib(s) {
  	    return ('' + s).replace(ampRe, '&amp;').replace(ltRe, '&lt;')
  	        .replace(gtRe, '&gt;').replace(quotRe, '&#34;');
  	  }

  	  /**
  	   * Escape entities in RCDATA that can be escaped without changing the meaning.
  	   * {\@updoc
  	   * $ normalizeRCData('1 < 2 &&amp; 3 > 4 &amp;& 5 &lt; 7&8')
  	   * # '1 &lt; 2 &amp;&amp; 3 &gt; 4 &amp;&amp; 5 &lt; 7&amp;8'
  	   * }
  	   */
  	  function normalizeRCData(rcdata) {
  	    return rcdata
  	        .replace(looseAmpRe, '&amp;$1')
  	        .replace(ltRe, '&lt;')
  	        .replace(gtRe, '&gt;');
  	  }

  	  // TODO(mikesamuel): validate sanitizer regexs against the HTML5 grammar at
  	  // http://www.whatwg.org/specs/web-apps/current-work/multipage/syntax.html
  	  // http://www.whatwg.org/specs/web-apps/current-work/multipage/parsing.html
  	  // http://www.whatwg.org/specs/web-apps/current-work/multipage/tokenization.html
  	  // http://www.whatwg.org/specs/web-apps/current-work/multipage/tree-construction.html

  	  // We initially split input so that potentially meaningful characters
  	  // like '<' and '>' are separate tokens, using a fast dumb process that
  	  // ignores quoting.  Then we walk that token stream, and when we see a
  	  // '<' that's the start of a tag, we use ATTR_RE to extract tag
  	  // attributes from the next token.  That token will never have a '>'
  	  // character.  However, it might have an unbalanced quote character, and
  	  // when we see that, we combine additional tokens to balance the quote.

  	  var ATTR_RE = new RegExp(
  	    '^\\s*' +
  	    '([a-z][a-z-]*)' +          // 1 = Attribute name
  	    '(?:' + (
  	      '\\s*(=)\\s*' +           // 2 = Is there a value?
  	      '(' + (                   // 3 = Attribute value
  	        // TODO(felix8a): maybe use backref to match quotes
  	        '(\")[^\"]*(\"|$)' +    // 4, 5 = Double-quoted string
  	        '|' +
  	        '(\')[^\']*(\'|$)' +    // 6, 7 = Single-quoted string
  	        '|' +
  	        // Positive lookahead to prevent interpretation of
  	        // <foo a= b=c> as <foo a='b=c'>
  	        // TODO(felix8a): might be able to drop this case
  	        '(?=[a-z][a-z-]*\\s*=)' +
  	        '|' +
  	        // Unquoted value that isn't an attribute name
  	        // (since we didn't match the positive lookahead above)
  	        '[^\"\'\\s]*' ) +
  	      ')' ) +
  	    ')?',
  	    'i');

  	  var ENTITY_RE = /^(#[0-9]+|#x[0-9a-f]+|\w+);/i;

  	  // false on IE<=8, true on most other browsers
  	  var splitWillCapture = ('a,b'.split(/(,)/).length === 3);

  	  // bitmask for tags with special parsing, like <script> and <textarea>
  	  var EFLAGS_TEXT = html4.eflags.CDATA | html4.eflags.RCDATA;

  	  /**
  	   * Given a SAX-like event handler, produce a function that feeds those
  	   * events and a parameter to the event handler.
  	   *
  	   * The event handler has the form:{@code
  	   * {
  	   *   // Name is an upper-case HTML tag name.  Attribs is an array of
  	   *   // alternating upper-case attribute names, and attribute values.  The
  	   *   // attribs array is reused by the parser.  Param is the value passed to
  	   *   // the saxParser.
  	   *   startTag: function (name, attribs, param) { ... },
  	   *   endTag:   function (name, param) { ... },
  	   *   pcdata:   function (text, param) { ... },
  	   *   rcdata:   function (text, param) { ... },
  	   *   cdata:    function (text, param) { ... },
  	   *   startDoc: function (param) { ... },
  	   *   endDoc:   function (param) { ... }
  	   * }}
  	   *
  	   * @param {Object} handler a record containing event handlers.
  	   * @return {function(string, Object)} A function that takes a chunk of HTML
  	   *     and a parameter.  The parameter is passed on to the handler methods.
  	   */
  	  function makeSaxParser(handler) {
  	    return function(htmlText, param) {
  	      return parse(htmlText, handler, param);
  	    };
  	  }

  	  // Parsing strategy is to split input into parts that might be lexically
  	  // meaningful (every ">" becomes a separate part), and then recombine
  	  // parts if we discover they're in a different context.

  	  // Note, html-sanitizer filters unknown tags here, even though they also
  	  // get filtered out by the sanitizer's handler.  This is back-compat
  	  // behavior; makeSaxParser is public.

  	  // TODO(felix8a): Significant performance regressions from -legacy,
  	  // tested on
  	  //    Chrome 18.0
  	  //    Firefox 11.0
  	  //    IE 6, 7, 8, 9
  	  //    Opera 11.61
  	  //    Safari 5.1.3
  	  // Many of these are unusual patterns that are linearly slower and still
  	  // pretty fast (eg 1ms to 5ms), so not necessarily worth fixing.

  	  // TODO(felix8a): "<script> && && && ... <\/script>" is slower on all
  	  // browsers.  The hotspot is htmlSplit.

  	  // TODO(felix8a): "<p title='>>>>...'><\/p>" is slower on all browsers.
  	  // This is partly htmlSplit, but the hotspot is parseTagAndAttrs.

  	  // TODO(felix8a): "<a><\/a><a><\/a>..." is slower on IE9.
  	  // "<a>1<\/a><a>1<\/a>..." is faster, "<a><\/a>2<a><\/a>2..." is faster.

  	  // TODO(felix8a): "<p<p<p..." is slower on IE[6-8]

  	  var continuationMarker = {};
  	  function parse(htmlText, handler, param) {
  	    var parts = htmlSplit(htmlText);
  	    var state = {
  	      noMoreGT: false,
  	      noMoreEndComments: false
  	    };
  	    parseCPS(handler, parts, 0, state, param);
  	  }

  	  function continuationMaker(h, parts, initial, state, param) {
  	    return function () {
  	      parseCPS(h, parts, initial, state, param);
  	    };
  	  }

  	  function parseCPS(h, parts, initial, state, param) {
  	    try {
  	      if (h.startDoc && initial == 0) { h.startDoc(param); }
  	      var m, p, tagName;
  	      for (var pos = initial, end = parts.length; pos < end;) {
  	        var current = parts[pos++];
  	        var next = parts[pos];
  	        switch (current) {
  	        case '&':
  	          if (ENTITY_RE.test(next)) {
  	            if (h.pcdata) {
  	              h.pcdata('&' + next, param, continuationMarker,
  	                continuationMaker(h, parts, pos, state, param));
  	            }
  	            pos++;
  	          } else {
  	            if (h.pcdata) { h.pcdata("&amp;", param, continuationMarker,
  	                continuationMaker(h, parts, pos, state, param));
  	            }
  	          }
  	          break;
  	        case '<\/':
  	          if (m = /^(\w+)[^\'\"]*/.exec(next)) {
  	            if (m[0].length === next.length && parts[pos + 1] === '>') {
  	              // fast case, no attribute parsing needed
  	              pos += 2;
  	              tagName = lcase(m[1]);
  	              if (html4.ELEMENTS.hasOwnProperty(tagName)) {
  	                if (h.endTag) {
  	                  h.endTag(tagName, param, continuationMarker,
  	                    continuationMaker(h, parts, pos, state, param));
  	                }
  	              }
  	            } else {
  	              // slow case, need to parse attributes
  	              // TODO(felix8a): do we really care about misparsing this?
  	              pos = parseEndTag(
  	                parts, pos, h, param, continuationMarker, state);
  	            }
  	          } else {
  	            if (h.pcdata) {
  	              h.pcdata('&lt;/', param, continuationMarker,
  	                continuationMaker(h, parts, pos, state, param));
  	            }
  	          }
  	          break;
  	        case '<':
  	          if (m = /^(\w+)\s*\/?/.exec(next)) {
  	            if (m[0].length === next.length && parts[pos + 1] === '>') {
  	              // fast case, no attribute parsing needed
  	              pos += 2;
  	              tagName = lcase(m[1]);
  	              if (html4.ELEMENTS.hasOwnProperty(tagName)) {
  	                if (h.startTag) {
  	                  h.startTag(tagName, [], param, continuationMarker,
  	                    continuationMaker(h, parts, pos, state, param));
  	                }
  	                // tags like <script> and <textarea> have special parsing
  	                var eflags = html4.ELEMENTS[tagName];
  	                if (eflags & EFLAGS_TEXT) {
  	                  var tag = { name: tagName, next: pos, eflags: eflags };
  	                  pos = parseText(
  	                    parts, tag, h, param, continuationMarker, state);
  	                }
  	              }
  	            } else {
  	              // slow case, need to parse attributes
  	              pos = parseStartTag(
  	                parts, pos, h, param, continuationMarker, state);
  	            }
  	          } else {
  	            if (h.pcdata) {
  	              h.pcdata('&lt;', param, continuationMarker,
  	                continuationMaker(h, parts, pos, state, param));
  	            }
  	          }
  	          break;
  	        case '<\!--':
  	          // The pathological case is n copies of '<\!--' without '-->', and
  	          // repeated failure to find '-->' is quadratic.  We avoid that by
  	          // remembering when search for '-->' fails.
  	          if (!state.noMoreEndComments) {
  	            // A comment <\!--x--> is split into three tokens:
  	            //   '<\!--', 'x--', '>'
  	            // We want to find the next '>' token that has a preceding '--'.
  	            // pos is at the 'x--'.
  	            for (p = pos + 1; p < end; p++) {
  	              if (parts[p] === '>' && /--$/.test(parts[p - 1])) { break; }
  	            }
  	            if (p < end) {
  	              pos = p + 1;
  	            } else {
  	              state.noMoreEndComments = true;
  	            }
  	          }
  	          if (state.noMoreEndComments) {
  	            if (h.pcdata) {
  	              h.pcdata('&lt;!--', param, continuationMarker,
  	                continuationMaker(h, parts, pos, state, param));
  	            }
  	          }
  	          break;
  	        case '<\!':
  	          if (!/^\w/.test(next)) {
  	            if (h.pcdata) {
  	              h.pcdata('&lt;!', param, continuationMarker,
  	                continuationMaker(h, parts, pos, state, param));
  	            }
  	          } else {
  	            // similar to noMoreEndComment logic
  	            if (!state.noMoreGT) {
  	              for (p = pos + 1; p < end; p++) {
  	                if (parts[p] === '>') { break; }
  	              }
  	              if (p < end) {
  	                pos = p + 1;
  	              } else {
  	                state.noMoreGT = true;
  	              }
  	            }
  	            if (state.noMoreGT) {
  	              if (h.pcdata) {
  	                h.pcdata('&lt;!', param, continuationMarker,
  	                  continuationMaker(h, parts, pos, state, param));
  	              }
  	            }
  	          }
  	          break;
  	        case '<?':
  	          // similar to noMoreEndComment logic
  	          if (!state.noMoreGT) {
  	            for (p = pos + 1; p < end; p++) {
  	              if (parts[p] === '>') { break; }
  	            }
  	            if (p < end) {
  	              pos = p + 1;
  	            } else {
  	              state.noMoreGT = true;
  	            }
  	          }
  	          if (state.noMoreGT) {
  	            if (h.pcdata) {
  	              h.pcdata('&lt;?', param, continuationMarker,
  	                continuationMaker(h, parts, pos, state, param));
  	            }
  	          }
  	          break;
  	        case '>':
  	          if (h.pcdata) {
  	            h.pcdata("&gt;", param, continuationMarker,
  	              continuationMaker(h, parts, pos, state, param));
  	          }
  	          break;
  	        case '':
  	          break;
  	        default:
  	          if (h.pcdata) {
  	            h.pcdata(current, param, continuationMarker,
  	              continuationMaker(h, parts, pos, state, param));
  	          }
  	          break;
  	        }
  	      }
  	      if (h.endDoc) { h.endDoc(param); }
  	    } catch (e) {
  	      if (e !== continuationMarker) { throw e; }
  	    }
  	  }

  	  // Split str into parts for the html parser.
  	  function htmlSplit(str) {
  	    // can't hoist this out of the function because of the re.exec loop.
  	    var re = /(<\/|<\!--|<[!?]|[&<>])/g;
  	    str += '';
  	    if (splitWillCapture) {
  	      return str.split(re);
  	    } else {
  	      var parts = [];
  	      var lastPos = 0;
  	      var m;
  	      while ((m = re.exec(str)) !== null) {
  	        parts.push(str.substring(lastPos, m.index));
  	        parts.push(m[0]);
  	        lastPos = m.index + m[0].length;
  	      }
  	      parts.push(str.substring(lastPos));
  	      return parts;
  	    }
  	  }

  	  function parseEndTag(parts, pos, h, param, continuationMarker, state) {
  	    var tag = parseTagAndAttrs(parts, pos);
  	    // drop unclosed tags
  	    if (!tag) { return parts.length; }
  	    if (tag.eflags !== void 0) {
  	      if (h.endTag) {
  	        h.endTag(tag.name, param, continuationMarker,
  	          continuationMaker(h, parts, pos, state, param));
  	      }
  	    }
  	    return tag.next;
  	  }

  	  function parseStartTag(parts, pos, h, param, continuationMarker, state) {
  	    var tag = parseTagAndAttrs(parts, pos);
  	    // drop unclosed tags
  	    if (!tag) { return parts.length; }
  	    if (tag.eflags !== void 0) {
  	      if (h.startTag) {
  	        h.startTag(tag.name, tag.attrs, param, continuationMarker,
  	          continuationMaker(h, parts, tag.next, state, param));
  	      }
  	      // tags like <script> and <textarea> have special parsing
  	      if (tag.eflags & EFLAGS_TEXT) {
  	        return parseText(parts, tag, h, param, continuationMarker, state);
  	      }
  	    }
  	    return tag.next;
  	  }

  	  var endTagRe = {};

  	  // Tags like <script> and <textarea> are flagged as CDATA or RCDATA,
  	  // which means everything is text until we see the correct closing tag.
  	  function parseText(parts, tag, h, param, continuationMarker, state) {
  	    var end = parts.length;
  	    if (!endTagRe.hasOwnProperty(tag.name)) {
  	      endTagRe[tag.name] = new RegExp('^' + tag.name + '(?:[\\s\\/]|$)', 'i');
  	    }
  	    var re = endTagRe[tag.name];
  	    var first = tag.next;
  	    var p = tag.next + 1;
  	    for (; p < end; p++) {
  	      if (parts[p - 1] === '<\/' && re.test(parts[p])) { break; }
  	    }
  	    if (p < end) { p -= 1; }
  	    var buf = parts.slice(first, p).join('');
  	    if (tag.eflags & html4.eflags.CDATA) {
  	      if (h.cdata) {
  	        h.cdata(buf, param, continuationMarker,
  	          continuationMaker(h, parts, p, state, param));
  	      }
  	    } else if (tag.eflags & html4.eflags.RCDATA) {
  	      if (h.rcdata) {
  	        h.rcdata(normalizeRCData(buf), param, continuationMarker,
  	          continuationMaker(h, parts, p, state, param));
  	      }
  	    } else {
  	      throw new Error('bug');
  	    }
  	    return p;
  	  }

  	  // at this point, parts[pos-1] is either "<" or "<\/".
  	  function parseTagAndAttrs(parts, pos) {
  	    var m = /^(\w+)/.exec(parts[pos]);
  	    var tag = { name: lcase(m[1]) };
  	    if (html4.ELEMENTS.hasOwnProperty(tag.name)) {
  	      tag.eflags = html4.ELEMENTS[tag.name];
  	    } else {
  	      tag.eflags = void 0;
  	    }
  	    var buf = parts[pos].substr(m[0].length);
  	    // Find the next '>'.  We optimistically assume this '>' is not in a
  	    // quoted context, and further down we fix things up if it turns out to
  	    // be quoted.
  	    var p = pos + 1;
  	    var end = parts.length;
  	    for (; p < end; p++) {
  	      if (parts[p] === '>') { break; }
  	      buf += parts[p];
  	    }
  	    if (end <= p) { return void 0; }
  	    var attrs = [];
  	    while (buf !== '') {
  	      m = ATTR_RE.exec(buf);
  	      if (!m) {
  	        // No attribute found: skip garbage
  	        buf = buf.replace(/^[\s\S][^a-z\s]*/, '');

  	      } else if ((m[4] && !m[5]) || (m[6] && !m[7])) {
  	        // Unterminated quote: slurp to the next unquoted '>'
  	        var quote = m[4] || m[6];
  	        var sawQuote = false;
  	        var abuf = [buf, parts[p++]];
  	        for (; p < end; p++) {
  	          if (sawQuote) {
  	            if (parts[p] === '>') { break; }
  	          } else if (0 <= parts[p].indexOf(quote)) {
  	            sawQuote = true;
  	          }
  	          abuf.push(parts[p]);
  	        }
  	        // Slurp failed: lose the garbage
  	        if (end <= p) { break; }
  	        // Otherwise retry attribute parsing
  	        buf = abuf.join('');
  	        continue;

  	      } else {
  	        // We have an attribute
  	        var aName = lcase(m[1]);
  	        var aValue = m[2] ? decodeValue(m[3]) : aName;
  	        attrs.push(aName, aValue);
  	        buf = buf.substr(m[0].length);
  	      }
  	    }
  	    tag.attrs = attrs;
  	    tag.next = p + 1;
  	    return tag;
  	  }

  	  function decodeValue(v) {
  	    var q = v.charCodeAt(0);
  	    if (q === 0x22 || q === 0x27) { // " or '
  	      v = v.substr(1, v.length - 2);
  	    }
  	    return unescapeEntities(stripNULs(v));
  	  }

  	  /**
  	   * Returns a function that strips unsafe tags and attributes from html.
  	   * @param {function(string, Array.<string>): ?Array.<string>} tagPolicy
  	   *     A function that takes (tagName, attribs[]), where tagName is a key in
  	   *     html4.ELEMENTS and attribs is an array of alternating attribute names
  	   *     and values.  It should return a sanitized attribute array, or null to
  	   *     delete the tag.  It's okay for tagPolicy to modify the attribs array,
  	   *     but the same array is reused, so it should not be held between calls.
  	   * @return {function(string, Array)} A function that sanitizes a string of
  	   *     HTML and appends result strings to the second argument, an array.
  	   */
  	  function makeHtmlSanitizer(tagPolicy) {
  	    var stack;
  	    var ignoring;
  	    var emit = function (text, out) {
  	      if (!ignoring) { out.push(text); }
  	    };
  	    return makeSaxParser({
  	      startDoc: function(_) {
  	        stack = [];
  	        ignoring = false;
  	      },
  	      startTag: function(tagName, attribs, out) {
  	        if (ignoring) { return; }
  	        if (!html4.ELEMENTS.hasOwnProperty(tagName)) { return; }
  	        var eflags = html4.ELEMENTS[tagName];
  	        if (eflags & html4.eflags.FOLDABLE) {
  	          return;
  	        }
  	        attribs = tagPolicy(tagName, attribs);
  	        if (!attribs) {
  	          ignoring = !(eflags & html4.eflags.EMPTY);
  	          return;
  	        }
  	        // TODO(mikesamuel): relying on tagPolicy not to insert unsafe
  	        // attribute names.
  	        if (!(eflags & html4.eflags.EMPTY)) {
  	          stack.push(tagName);
  	        }

  	        out.push('<', tagName);
  	        for (var i = 0, n = attribs.length; i < n; i += 2) {
  	          var attribName = attribs[i],
  	              value = attribs[i + 1];
  	          if (value !== null && value !== void 0) {
  	            out.push(' ', attribName, '="', escapeAttrib(value), '"');
  	          }
  	        }
  	        out.push('>');
  	      },
  	      endTag: function(tagName, out) {
  	        if (ignoring) {
  	          ignoring = false;
  	          return;
  	        }
  	        if (!html4.ELEMENTS.hasOwnProperty(tagName)) { return; }
  	        var eflags = html4.ELEMENTS[tagName];
  	        if (!(eflags & (html4.eflags.EMPTY | html4.eflags.FOLDABLE))) {
  	          var index;
  	          if (eflags & html4.eflags.OPTIONAL_ENDTAG) {
  	            for (index = stack.length; --index >= 0;) {
  	              var stackEl = stack[index];
  	              if (stackEl === tagName) { break; }
  	              if (!(html4.ELEMENTS[stackEl] &
  	                    html4.eflags.OPTIONAL_ENDTAG)) {
  	                // Don't pop non optional end tags looking for a match.
  	                return;
  	              }
  	            }
  	          } else {
  	            for (index = stack.length; --index >= 0;) {
  	              if (stack[index] === tagName) { break; }
  	            }
  	          }
  	          if (index < 0) { return; }  // Not opened.
  	          for (var i = stack.length; --i > index;) {
  	            var stackEl = stack[i];
  	            if (!(html4.ELEMENTS[stackEl] &
  	                  html4.eflags.OPTIONAL_ENDTAG)) {
  	              out.push('<\/', stackEl, '>');
  	            }
  	          }
  	          stack.length = index;
  	          out.push('<\/', tagName, '>');
  	        }
  	      },
  	      pcdata: emit,
  	      rcdata: emit,
  	      cdata: emit,
  	      endDoc: function(out) {
  	        for (; stack.length; stack.length--) {
  	          out.push('<\/', stack[stack.length - 1], '>');
  	        }
  	      }
  	    });
  	  }

  	  // From RFC3986
  	  var URI_SCHEME_RE = new RegExp(
  	      '^' +
  	      '(?:' +
  	        '([^:\/?# ]+)' +         // scheme
  	      ':)?'
  	  );

  	  var ALLOWED_URI_SCHEMES = /^(?:https?|mailto)$/i;

  	  function safeUri(uri, naiveUriRewriter) {
  	    if (!naiveUriRewriter) { return null; }
  	    var parsed = ('' + uri).match(URI_SCHEME_RE);
  	    if (parsed && (!parsed[1] || ALLOWED_URI_SCHEMES.test(parsed[1]))) {
  	      return naiveUriRewriter(uri);
  	    } else {
  	      return null;
  	    }
  	  }

  	  /**
  	   * Sanitizes attributes on an HTML tag.
  	   * @param {string} tagName An HTML tag name in lowercase.
  	   * @param {Array.<?string>} attribs An array of alternating names and values.
  	   * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
  	   *     apply to URI attributes; it can return a new string value, or null to
  	   *     delete the attribute.  If unspecified, URI attributes are deleted.
  	   * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
  	   *     to attributes containing HTML names, element IDs, and space-separated
  	   *     lists of classes; it can return a new string value, or null to delete
  	   *     the attribute.  If unspecified, these attributes are kept unchanged.
  	   * @return {Array.<?string>} The sanitized attributes as a list of alternating
  	   *     names and values, where a null value means to omit the attribute.
  	   */
  	  function sanitizeAttribs(
  	      tagName, attribs, opt_naiveUriRewriter, opt_nmTokenPolicy) {
  	    for (var i = 0; i < attribs.length; i += 2) {
  	      var attribName = attribs[i];
  	      var value = attribs[i + 1];
  	      var atype = null, attribKey;
  	      if ((attribKey = tagName + '::' + attribName,
  	           html4.ATTRIBS.hasOwnProperty(attribKey)) ||
  	          (attribKey = '*::' + attribName,
  	           html4.ATTRIBS.hasOwnProperty(attribKey))) {
  	        atype = html4.ATTRIBS[attribKey];
  	      }
  	      if (atype !== null) {
  	        switch (atype) {
  	          case html4.atype.NONE: break;
  	          case html4.atype.SCRIPT:
  	            value = null;
  	            break;
  	          case html4.atype.STYLE:
  	            if ('undefined' === typeof parseCssDeclarations) {
  	              value = null;
  	              break;
  	            }
  	            var sanitizedDeclarations = [];
  	            parseCssDeclarations(
  	                value,
  	                {
  	                  declaration: function (property, tokens) {
  	                    var normProp = property.toLowerCase();
  	                    var schema = cssSchema[normProp];
  	                    if (!schema) {
  	                      return;
  	                    }
  	                    sanitizeCssProperty(
  	                        normProp, schema, tokens,
  	                        opt_naiveUriRewriter);
  	                    sanitizedDeclarations.push(property + ': ' + tokens.join(' '));
  	                  }
  	                });
  	            value = sanitizedDeclarations.length > 0 ? sanitizedDeclarations.join(' ; ') : null;
  	            break;
  	          case html4.atype.ID:
  	          case html4.atype.IDREF:
  	          case html4.atype.IDREFS:
  	          case html4.atype.GLOBAL_NAME:
  	          case html4.atype.LOCAL_NAME:
  	          case html4.atype.CLASSES:
  	            value = opt_nmTokenPolicy ? opt_nmTokenPolicy(value) : value;
  	            break;
  	          case html4.atype.URI:
  	            value = safeUri(value, opt_naiveUriRewriter);
  	            break;
  	          case html4.atype.URI_FRAGMENT:
  	            if (value && '#' === value.charAt(0)) {
  	              value = value.substring(1);  // remove the leading '#'
  	              value = opt_nmTokenPolicy ? opt_nmTokenPolicy(value) : value;
  	              if (value !== null && value !== void 0) {
  	                value = '#' + value;  // restore the leading '#'
  	              }
  	            } else {
  	              value = null;
  	            }
  	            break;
  	          default:
  	            value = null;
  	            break;
  	        }
  	      } else {
  	        value = null;
  	      }
  	      attribs[i + 1] = value;
  	    }
  	    return attribs;
  	  }

  	  /**
  	   * Creates a tag policy that omits all tags marked UNSAFE in html4-defs.js
  	   * and applies the default attribute sanitizer with the supplied policy for
  	   * URI attributes and NMTOKEN attributes.
  	   * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
  	   *     apply to URI attributes.  If not given, URI attributes are deleted.
  	   * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
  	   *     to attributes containing HTML names, element IDs, and space-separated
  	   *     lists of classes.  If not given, such attributes are left unchanged.
  	   * @return {function(string, Array.<?string>)} A tagPolicy suitable for
  	   *     passing to html.sanitize.
  	   */
  	  function makeTagPolicy(opt_naiveUriRewriter, opt_nmTokenPolicy) {
  	    return function(tagName, attribs) {
  	      if (!(html4.ELEMENTS[tagName] & html4.eflags.UNSAFE)) {
  	        return sanitizeAttribs(
  	            tagName, attribs, opt_naiveUriRewriter, opt_nmTokenPolicy);
  	      }
  	    };
  	  }

  	  /**
  	   * Sanitizes HTML tags and attributes according to a given policy.
  	   * @param {string} inputHtml The HTML to sanitize.
  	   * @param {function(string, Array.<?string>)} tagPolicy A function that
  	   *     decides which tags to accept and sanitizes their attributes (see
  	   *     makeHtmlSanitizer above for details).
  	   * @return {string} The sanitized HTML.
  	   */
  	  function sanitizeWithPolicy(inputHtml, tagPolicy) {
  	    var outputArray = [];
  	    makeHtmlSanitizer(tagPolicy)(inputHtml, outputArray);
  	    return outputArray.join('');
  	  }

  	  /**
  	   * Strips unsafe tags and attributes from HTML.
  	   * @param {string} inputHtml The HTML to sanitize.
  	   * @param {?function(?string): ?string} opt_naiveUriRewriter A transform to
  	   *     apply to URI attributes.  If not given, URI attributes are deleted.
  	   * @param {function(?string): ?string} opt_nmTokenPolicy A transform to apply
  	   *     to attributes containing HTML names, element IDs, and space-separated
  	   *     lists of classes.  If not given, such attributes are left unchanged.
  	   */
  	  function sanitize(inputHtml, opt_naiveUriRewriter, opt_nmTokenPolicy) {
  	    var tagPolicy = makeTagPolicy(opt_naiveUriRewriter, opt_nmTokenPolicy);
  	    return sanitizeWithPolicy(inputHtml, tagPolicy);
  	  }

  	  return {
  	    escapeAttrib: escapeAttrib,
  	    makeHtmlSanitizer: makeHtmlSanitizer,
  	    makeSaxParser: makeSaxParser,
  	    makeTagPolicy: makeTagPolicy,
  	    normalizeRCData: normalizeRCData,
  	    sanitize: sanitize,
  	    sanitizeAttribs: sanitizeAttribs,
  	    sanitizeWithPolicy: sanitizeWithPolicy,
  	    unescapeEntities: unescapeEntities
  	  };
  	})(html4);

  	var html_sanitize = html.sanitize;

  	// Exports for closure compiler.  Note this file is also cajoled
  	// for domado and run in an environment without 'window'
  	if (typeof window !== 'undefined') {
  	  window['html'] = html;
  	  window['html_sanitize'] = html_sanitize;
  	}

  	}());
  	return cajaHtmlSanitizer;
  }

  requireCajaHtmlSanitizer();

  m$a("SVGIcons.registry",new Map);m$a("SVGIcons.promises",new Map);

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  var t$3;const i$2=window,s$2=i$2.trustedTypes,e$2=s$2?s$2.createPolicy("lit-html",{createHTML:t=>t}):void 0,o$3="$lit$",n$2=`lit$${(Math.random()+"").slice(9)}$`,l$2="?"+n$2,h$1=`<${l$2}>`,r$1=document,u$2=()=>r$1.createComment(""),d$1=t=>null===t||"object"!=typeof t&&"function"!=typeof t,c$2=Array.isArray,v$1=t=>c$2(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]),a$3="[ \t\n\f\r]",f$1=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_$1=/-->/g,m$1=/>/g,p$1=RegExp(`>|${a$3}(?:([^\\s"'>=/]+)(${a$3}*=${a$3}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g$1=/'/g,$$1=/"/g,y$1=/^(?:script|style|textarea|title)$/i,w$1=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x$1=w$1(1),b$1=w$1(2),T$1=Symbol.for("lit-noChange"),A$1=Symbol.for("lit-nothing"),E$1=new WeakMap,C$1=r$1.createTreeWalker(r$1,129,null,false);function P$1(t,i){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e$2?e$2.createHTML(i):i}const V$1=(t,i)=>{const s=t.length-1,e=[];let l,r=2===i?"<svg>":"",u=f$1;for(let i=0;i<s;i++){const s=t[i];let d,c,v=-1,a=0;for(;a<s.length&&(u.lastIndex=a,c=u.exec(s),null!==c);)a=u.lastIndex,u===f$1?"!--"===c[1]?u=_$1:void 0!==c[1]?u=m$1:void 0!==c[2]?(y$1.test(c[2])&&(l=RegExp("</"+c[2],"g")),u=p$1):void 0!==c[3]&&(u=p$1):u===p$1?">"===c[0]?(u=null!=l?l:f$1,v=-1):void 0===c[1]?v=-2:(v=u.lastIndex-c[2].length,d=c[1],u=void 0===c[3]?p$1:'"'===c[3]?$$1:g$1):u===$$1||u===g$1?u=p$1:u===_$1||u===m$1?u=f$1:(u=p$1,l=void 0);const w=u===p$1&&t[i+1].startsWith("/>")?" ":"";r+=u===f$1?s+h$1:v>=0?(e.push(d),s.slice(0,v)+o$3+s.slice(v)+n$2+w):s+n$2+(-2===v?(e.push(void 0),i):w);}return [P$1(t,r+(t[s]||"<?>")+(2===i?"</svg>":"")),e]};let N$1 = class N{constructor({strings:t,_$litType$:i},e){let h;this.parts=[];let r=0,d=0;const c=t.length-1,v=this.parts,[a,f]=V$1(t,i);if(this.el=N.createElement(a,e),C$1.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes);}for(;null!==(h=C$1.nextNode())&&v.length<c;){if(1===h.nodeType){if(h.hasAttributes()){const t=[];for(const i of h.getAttributeNames())if(i.endsWith(o$3)||i.startsWith(n$2)){const s=f[d++];if(t.push(i),void 0!==s){const t=h.getAttribute(s.toLowerCase()+o$3).split(n$2),i=/([.?@])?(.*)/.exec(s);v.push({type:1,index:r,name:i[2],strings:t,ctor:"."===i[1]?H$1:"?"===i[1]?L$1:"@"===i[1]?z$1:k$1});}else v.push({type:6,index:r});}for(const i of t)h.removeAttribute(i);}if(y$1.test(h.tagName)){const t=h.textContent.split(n$2),i=t.length-1;if(i>0){h.textContent=s$2?s$2.emptyScript:"";for(let s=0;s<i;s++)h.append(t[s],u$2()),C$1.nextNode(),v.push({type:2,index:++r});h.append(t[i],u$2());}}}else if(8===h.nodeType)if(h.data===l$2)v.push({type:2,index:r});else {let t=-1;for(;-1!==(t=h.data.indexOf(n$2,t+1));)v.push({type:7,index:r}),t+=n$2.length-1;}r++;}}static createElement(t,i){const s=r$1.createElement("template");return s.innerHTML=t,s}};function S$2(t,i,s=t,e){var o,n,l,h;if(i===T$1)return i;let r=void 0!==e?null===(o=s._$Co)||void 0===o?void 0:o[e]:s._$Cl;const u=d$1(i)?void 0:i._$litDirective$;return (null==r?void 0:r.constructor)!==u&&(null===(n=null==r?void 0:r._$AO)||void 0===n||n.call(r,false),void 0===u?r=void 0:(r=new u(t),r._$AT(t,s,e)),void 0!==e?(null!==(l=(h=s)._$Co)&&void 0!==l?l:h._$Co=[])[e]=r:s._$Cl=r),void 0!==r&&(i=S$2(t,r._$AS(t,i.values),r,e)),i}let M$1 = class M{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var i;const{el:{content:s},parts:e}=this._$AD,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:r$1).importNode(s,true);C$1.currentNode=o;let n=C$1.nextNode(),l=0,h=0,u=e[0];for(;void 0!==u;){if(l===u.index){let i;2===u.type?i=new R$1(n,n.nextSibling,this,t):1===u.type?i=new u.ctor(n,u.name,u.strings,this,t):6===u.type&&(i=new Z$1(n,this,t)),this._$AV.push(i),u=e[++h];}l!==(null==u?void 0:u.index)&&(n=C$1.nextNode(),l++);}return C$1.currentNode=r$1,o}v(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}};let R$1 = class R{constructor(t,i,s,e){var o;this.type=2,this._$AH=A$1,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cp=null===(o=null==e?void 0:e.isConnected)||void 0===o||o;}get _$AU(){var t,i;return null!==(i=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==i?i:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===(null==t?void 0:t.nodeType)&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=S$2(this,t,i),d$1(t)?t===A$1||null==t||""===t?(this._$AH!==A$1&&this._$AR(),this._$AH=A$1):t!==this._$AH&&t!==T$1&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):v$1(t)?this.T(t):this._(t);}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t));}_(t){this._$AH!==A$1&&d$1(this._$AH)?this._$AA.nextSibling.data=t:this.$(r$1.createTextNode(t)),this._$AH=t;}g(t){var i;const{values:s,_$litType$:e}=t,o="number"==typeof e?this._$AC(t):(void 0===e.el&&(e.el=N$1.createElement(P$1(e.h,e.h[0]),this.options)),e);if((null===(i=this._$AH)||void 0===i?void 0:i._$AD)===o)this._$AH.v(s);else {const t=new M$1(o,this),i=t.u(this.options);t.v(s),this.$(i),this._$AH=t;}}_$AC(t){let i=E$1.get(t.strings);return void 0===i&&E$1.set(t.strings,i=new N$1(t)),i}T(t){c$2(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const o of t)e===i.length?i.push(s=new R(this.k(u$2()),this.k(u$2()),this,this.options)):s=i[e],s._$AI(o),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){var s;for(null===(s=this._$AP)||void 0===s||s.call(this,false,true,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){var i;void 0===this._$AM&&(this._$Cp=t,null===(i=this._$AP)||void 0===i||i.call(this,t));}};let k$1 = class k{constructor(t,i,s,e,o){this.type=1,this._$AH=A$1,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A$1;}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,i=this,s,e){const o=this.strings;let n=false;if(void 0===o)t=S$2(this,t,i,0),n=!d$1(t)||t!==this._$AH&&t!==T$1,n&&(this._$AH=t);else {const e=t;let l,h;for(t=o[0],l=0;l<o.length-1;l++)h=S$2(this,e[s+l],i,l),h===T$1&&(h=this._$AH[l]),n||(n=!d$1(h)||h!==this._$AH[l]),h===A$1?t=A$1:t!==A$1&&(t+=(null!=h?h:"")+o[l+1]),this._$AH[l]=h;}n&&!e&&this.j(t);}j(t){t===A$1?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"");}};let H$1 = class H extends k$1{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A$1?void 0:t;}};const I$1=s$2?s$2.emptyScript:"";let L$1 = class L extends k$1{constructor(){super(...arguments),this.type=4;}j(t){t&&t!==A$1?this.element.setAttribute(this.name,I$1):this.element.removeAttribute(this.name);}};let z$1 = class z extends k$1{constructor(t,i,s,e,o){super(t,i,s,e,o),this.type=5;}_$AI(t,i=this){var s;if((t=null!==(s=S$2(this,t,i,0))&&void 0!==s?s:A$1)===T$1)return;const e=this._$AH,o=t===A$1&&e!==A$1||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==A$1&&(e===A$1||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){var i,s;"function"==typeof this._$AH?this._$AH.call(null!==(s=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==s?s:this.element,t):this._$AH.handleEvent(t);}};let Z$1 = class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){S$2(this,t);}};const B$1=i$2.litHtmlPolyfillSupport;null==B$1||B$1(N$1,R$1),(null!==(t$3=i$2.litHtmlVersions)&&void 0!==t$3?t$3:i$2.litHtmlVersions=[]).push("2.8.0");

  /**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const e$1=Symbol.for(""),l$1=t=>{if((null==t?void 0:t.r)===e$1)return null==t?void 0:t._$litStatic$},o$2=t=>({_$litStatic$:t,r:e$1}),s$1=new Map,a$2=t=>(r,...e)=>{const o=e.length;let i,a;const n=[],u=[];let c,$=0,f=false;for(;$<o;){for(c=r[$];$<o&&void 0!==(a=e[$],i=l$1(a));)c+=i+r[++$],f=true;$!==o&&u.push(a),n.push(c),$++;}if($===o&&n.push(r[o]),f){const t=n.join("$$lit$$");void 0===(r=s$1.get(t))&&(n.raw=n,s$1.set(t,r=n)),e=u;}return t(r,...e)},n$1=a$2(x$1),u$1=a$2(b$1);

  let t$2 = class t{static{this.html=n$1;}static{this.svg=u$1;}static{this.unsafeStatic=o$2;}};s$n("LitStatic",t$2);

  const a$1=new Map,t$1=new Map;t$1.set("S",[0,599]),t$1.set("M",[600,1023]),t$1.set("L",[1024,1439]),t$1.set("XL",[1440,1/0]);var S$1=(e=>(e.RANGE_4STEPS="4Step",e))(S$1||{});const o$1=(r,e)=>{a$1.set(r,e);},c$1=(r,e=window.innerWidth)=>{let n=a$1.get(r);n||(n=a$1.get("4Step"));let g;const s=Math.floor(e);return n.forEach((R,E)=>{s>=R[0]&&s<=R[1]&&(g=E);}),g||[...n.keys()][0]},i$1={RANGESETS:S$1,initRangeSet:o$1,getCurrentRange:c$1};i$1.initRangeSet(i$1.RANGESETS.RANGE_4STEPS,t$1);

  function t(){}function e(t){return t()}function n(){return Object.create(null)}function i(t){t.forEach(e);}function s(t){return "function"==typeof t}function o(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}let a,r;function c(t,e){return t===e||(a||(a=document.createElement("a")),a.href=e,t===a.href)}function l(t,e,n){const i=function(t){if(!t)return document;const e=t.getRootNode?t.getRootNode():t.ownerDocument;if(e&&e.host)return e;return t.ownerDocument}(t);if(!i.getElementById(e)){const t=h("style");t.id=e,t.textContent=n,function(t,e){((function(t,e){t.appendChild(e);}))(t.head||t,e),e.sheet;}(i,t);}}function u(t,e,n){t.insertBefore(e,n||null);}function d(t){t.parentNode&&t.parentNode.removeChild(t);}function h(t){return document.createElement(t)}function m(t){return document.createTextNode(t)}function E(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n);}function p(t){r=t;}function g(){if(!r)throw new Error("Function called outside component initialization");return r}function _(t){g().$$.on_mount.push(t);}const T=[],S=[];let $=[];const C=[],f=Promise.resolve();let R=false;function A(t){$.push(t);}const w=new Set;let b=0;function I(){if(0!==b)return;const t=r;do{try{for(;b<T.length;){const t=T[b];b++,p(t),O(t.$$);}}catch(t){throw T.length=0,b=0,t}for(p(null),T.length=0,b=0;S.length;)S.pop()();for(let t=0;t<$.length;t+=1){const e=$[t];w.has(e)||(w.add(e),e());}$.length=0;}while(T.length);for(;C.length;)C.pop()();R=false,w.clear(),p(t);}function O(t){if(null!==t.fragment){t.update(),i(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(A);}}const U=new Set;function v(t,e){const n=t.$$;null!==n.fragment&&(!function(t){const e=[],n=[];$.forEach((i=>-1===t.indexOf(i)?e.push(i):n.push(i))),n.forEach((t=>t())),$=e;}(n.after_update),i(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[]);}function y(t,e){ -1===t.$$.dirty[0]&&(T.push(t),R||(R=true,f.then(I)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31;}function N(o,a,c,l,u,h,m=null,E=[-1]){const g=r;p(o);const _=o.$$={fragment:null,ctx:[],props:h,update:t,not_equal:u,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(a.context||(g?g.$$.context:[])),callbacks:n(),dirty:E,skip_bound:false,root:a.target||g.$$.root};m&&m(_.root);let T=false;if(_.ctx=c?c(o,a.props||{},((t,e,...n)=>{const i=n.length?n[0]:e;return _.ctx&&u(_.ctx[t],_.ctx[t]=i)&&(!_.skip_bound&&_.bound[t]&&_.bound[t](i),T&&y(o,t)),e})):[],_.update(),T=true,i(_.before_update),_.fragment=!!l&&l(_.ctx),a.target){if(a.hydrate){const t=function(t){return Array.from(t.childNodes)}(a.target);_.fragment&&_.fragment.l(t),t.forEach(d);}else _.fragment&&_.fragment.c();a.intro&&((S=o.$$.fragment)&&S.i&&(U.delete(S),S.i($))),function(t,n,o){const{fragment:a,after_update:r}=t.$$;a&&a.m(n,o),A((()=>{const n=t.$$.on_mount.map(e).filter(s);t.$$.on_destroy?t.$$.on_destroy.push(...n):i(n),t.$$.on_mount=[];})),r.forEach(A);}(o,a.target,a.anchor),I();}var S,$;p(g);}let P;function L(t,e,n,i){const s=n[t]?.type;if(e="Boolean"===s&&"boolean"!=typeof e?null!=e:e,!i||!n[t])return e;if("toAttribute"===i)switch(s){case "Object":case "Array":return null==e?null:JSON.stringify(e);case "Boolean":return e?"":null;case "Number":return null==e?null:e;default:return e}else switch(s){case "Object":case "Array":return e&&JSON.parse(e);case "Boolean":default:return e;case "Number":return null!=e?+e:e}}function D(t,e,n,i,s,o){let a=class extends P{constructor(){super(t,n,s),this.$$p_d=e;}static get observedAttributes(){return Object.keys(e).map((t=>(e[t].attribute||t).toLowerCase()))}};return Object.keys(e).forEach((t=>{Object.defineProperty(a.prototype,t,{get(){return this.$$c&&t in this.$$c?this.$$c[t]:this.$$d[t]},set(n){n=L(t,n,e),this.$$d[t]=n,this.$$c?.$set({[t]:n});}});})),i.forEach((t=>{Object.defineProperty(a.prototype,t,{get(){return this.$$c?.[t]}});})),o&&(a=o(a)),t.element=a,a}"function"==typeof HTMLElement&&(P=class extends HTMLElement{$$ctor;$$s;$$c;$$cn=false;$$d={};$$r=false;$$p_d={};$$l={};$$l_u=new Map;constructor(t,e,n){super(),this.$$ctor=t,this.$$s=e,n&&this.attachShadow({mode:"open"});}addEventListener(t,e,n){if(this.$$l[t]=this.$$l[t]||[],this.$$l[t].push(e),this.$$c){const n=this.$$c.$on(t,e);this.$$l_u.set(e,n);}super.addEventListener(t,e,n);}removeEventListener(t,e,n){if(super.removeEventListener(t,e,n),this.$$c){const t=this.$$l_u.get(e);t&&(t(),this.$$l_u.delete(e));}}async connectedCallback(){if(this.$$cn=true,!this.$$c){if(await Promise.resolve(),!this.$$cn||this.$$c)return;function t(t){return ()=>{let e;return {c:function(){e=h("slot"),"default"!==t&&E(e,"name",t);},m:function(t,n){u(t,e,n);},d:function(t){t&&d(e);}}}}const e={},n=function(t){const e={};return t.childNodes.forEach((t=>{e[t.slot||"default"]=true;})),e}(this);for(const s of this.$$s)s in n&&(e[s]=[t(s)]);for(const o of this.attributes){const a=this.$$g_p(o.name);a in this.$$d||(this.$$d[a]=L(a,o.value,this.$$p_d,"toProp"));}for(const r in this.$$p_d)r in this.$$d||void 0===this[r]||(this.$$d[r]=this[r],delete this[r]);this.$$c=new this.$$ctor({target:this.shadowRoot||this,props:{...this.$$d,$$slots:e,$$scope:{ctx:[]}}});const i=()=>{this.$$r=true;for(const t in this.$$p_d)if(this.$$d[t]=this.$$c.$$.ctx[this.$$c.$$.props[t]],this.$$p_d[t].reflect){const e=L(t,this.$$d[t],this.$$p_d,"toAttribute");null==e?this.removeAttribute(this.$$p_d[t].attribute||t):this.setAttribute(this.$$p_d[t].attribute||t,e);}this.$$r=false;};this.$$c.$$.after_update.push(i),i();for(const c in this.$$l)for(const l of this.$$l[c]){const m=this.$$c.$on(c,l);this.$$l_u.set(l,m);}this.$$l={};}}attributeChangedCallback(t,e,n){this.$$r||(t=this.$$g_p(t),this.$$d[t]=L(t,n,this.$$p_d,"toProp"),this.$$c?.$set({[t]:this.$$d[t]}));}disconnectedCallback(){this.$$cn=false,Promise.resolve().then((()=>{!this.$$cn&&this.$$c&&(this.$$c.$destroy(),this.$$c=void 0);}));}$$g_p(t){return Object.keys(this.$$p_d).find((e=>this.$$p_d[e].attribute===t||!this.$$p_d[e].attribute&&e.toLowerCase()===t))||t}});class k{$$=void 0;$$set=void 0;$destroy(){v(this,1),this.$destroy=t;}$on(e,n){if(!s(n))return t;const i=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return i.push(n),()=>{const t=i.indexOf(n);-1!==t&&i.splice(t,1);}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=true,this.$$set(t),this.$$.skip_bound=false);}}var x,M;"undefined"!=typeof window&&(window.__svelte||(window.__svelte={v:new Set})).v.add("4"),function(t){t.CUSTOM_MESSAGE="custom",t.GET_CONTEXT="luigi.get-context",t.SEND_CONTEXT_HANDSHAKE="luigi.init",t.CONTEXT_RECEIVED="luigi.init.ok",t.NAVIGATION_REQUEST="luigi.navigation.open",t.ALERT_REQUEST="luigi.ux.alert.show",t.ALERT_CLOSED="luigi.ux.alert.hide",t.INITIALIZED="luigi.init.ok",t.ADD_SEARCH_PARAMS_REQUEST="luigi.addSearchParams",t.ADD_NODE_PARAMS_REQUEST="luigi.addNodeParams",t.SHOW_CONFIRMATION_MODAL_REQUEST="luigi.ux.confirmationModal.show",t.CONFIRMATION_MODAL_CLOSED="luigi.ux.confirmationModal.hide",t.SHOW_LOADING_INDICATOR_REQUEST="luigi.show-loading-indicator",t.HIDE_LOADING_INDICATOR_REQUEST="luigi.hide-loading-indicator",t.SET_CURRENT_LOCALE_REQUEST="luigi.ux.set-current-locale",t.LOCAL_STORAGE_SET_REQUEST="storage",t.RUNTIME_ERROR_HANDLING_REQUEST="luigi-runtime-error-handling",t.SET_ANCHOR_LINK_REQUEST="luigi.setAnchor",t.SET_THIRD_PARTY_COOKIES_REQUEST="luigi.third-party-cookie",t.BACK_NAVIGATION_REQUEST="luigi.navigation.back",t.GET_CURRENT_ROUTE_REQUEST="luigi.navigation.currentRoute",t.SEND_CURRENT_ROUTE_ANSWER="luigi.navigation.currentRoute.answer",t.SEND_CONTEXT_OBJECT="luigi.navigate",t.NAVIGATION_COMPLETED_REPORT="luigi.navigate.ok",t.UPDATE_MODAL_PATH_DATA_REQUEST="luigi.navigation.updateModalDataPath",t.UPDATE_MODAL_SETTINGS="luigi.navigation.updateModalSettings",t.CHECK_PATH_EXISTS_REQUEST="luigi.navigation.pathExists",t.SEND_PATH_EXISTS_ANSWER="luigi.navigation.pathExists.answer",t.SET_DIRTY_STATUS_REQUEST="luigi.set-page-dirty",t.AUTH_SET_TOKEN="luigi.auth.tokenIssued",t.ADD_BACKDROP_REQUEST="luigi.add-backdrop",t.REMOVE_BACKDROP_REQUEST="luigi.remove-backdrop",t.SET_VIEW_GROUP_DATA_REQUEST="luigi.setVGData";}(x||(x={})),function(t){t.CUSTOM_MESSAGE="custom-message",t.GET_CONTEXT_REQUEST="get-context-request",t.NAVIGATION_REQUEST="navigation-request",t.ALERT_REQUEST="show-alert-request",t.ALERT_CLOSED="close-alert-request",t.INITIALIZED="initialized",t.ADD_SEARCH_PARAMS_REQUEST="add-search-params-request",t.ADD_NODE_PARAMS_REQUEST="add-node-params-request",t.SHOW_CONFIRMATION_MODAL_REQUEST="show-confirmation-modal-request",t.SHOW_LOADING_INDICATOR_REQUEST="show-loading-indicator-request",t.HIDE_LOADING_INDICATOR_REQUEST="hide-loading-indicator-request",t.SET_CURRENT_LOCALE_REQUEST="set-current-locale-request",t.LOCAL_STORAGE_SET_REQUEST="set-storage-request",t.RUNTIME_ERROR_HANDLING_REQUEST="runtime-error-handling-request",t.SET_ANCHOR_LINK_REQUEST="set-anchor-request",t.SET_THIRD_PARTY_COOKIES_REQUEST="set-third-party-cookies-request",t.BACK_NAVIGATION_REQUEST="navigate-back-request",t.GET_CURRENT_ROUTE_REQUEST="get-current-route-request",t.NAVIGATION_COMPLETED_REPORT="report-navigation-completed-request",t.UPDATE_MODAL_PATH_DATA_REQUEST="update-modal-path-data-request",t.UPDATE_MODAL_SETTINGS_REQUEST="update-modal-settings-request",t.CHECK_PATH_EXISTS_REQUEST="check-path-exists-request",t.SET_DIRTY_STATUS_REQUEST="set-dirty-status-request",t.SET_VIEW_GROUP_DATA_REQUEST="set-viewgroup-data-request",t.SET_DOCUMENT_TITLE_REQUEST="set-document-title-request",t.OPEN_USER_SETTINGS_REQUEST="open-user-settings-request",t.CLOSE_USER_SETTINGS_REQUEST="close-user-settings-request",t.COLLAPSE_LEFT_NAV_REQUEST="collapse-leftnav-request",t.UPDATE_TOP_NAVIGATION_REQUEST="update-top-navigation-request",t.PATH_EXISTS_REQUEST="path-exists-request",t.GO_BACK_REQUEST="go-back-request",t.HAS_BACK_REQUEST="has-back-request",t.ADD_BACKDROP_REQUEST="add-backdrop-request",t.REMOVE_BACKDROP_REQUEST="remove-backdrop-request";}(M||(M={}));class Q extends Event{constructor(t,e,n,i){super(t),this.detail=e,this.payload=n||e||{},this.callbackFn=i;}callback(t){this.callbackFn&&this.callbackFn(t);}}class H{isVisible(t){return !!(t.offsetWidth||t.offsetHeight||t.getClientRects().length)}sendCustomMessageToIframe(t,e,n){const i=n||"custom";if(t?.iframe?.contentWindow){const n=new URL(t.iframe.src);"custom"===i?t.iframe.contentWindow.postMessage({msg:i,data:e},n.origin):t.iframe.contentWindow.postMessage({msg:i,...e},n.origin);}else console.error("Message target could not be resolved");}dispatchWithPayload(t,e,n,i,s){this.dispatch(t,e,n,s,i);}dispatch(t,e,n,i,s){const o=new Q(t,n,s,i);e.dispatchEvent(o);}getTargetContainer(t){let e;return globalThis.__luigi_container_manager.container.forEach((n=>{n.iframeHandle?.iframe&&n.iframeHandle.iframe.contentWindow===t.source&&(e=n);})),e}getContainerManager(){return globalThis.__luigi_container_manager||(globalThis.__luigi_container_manager={container:[],messageListener:t=>{const e=this.getTargetContainer(t),n=e?.iframeHandle?.iframe?.contentWindow;if(n&&n===t.source){switch(t.data.msg){case x.CUSTOM_MESSAGE:{const n=t.data.data,i=n.id;delete n.id,this.dispatch(M.CUSTOM_MESSAGE,e,{id:i,_metaData:{},data:n});}break;case x.GET_CONTEXT:n.postMessage({msg:x.SEND_CONTEXT_HANDSHAKE,context:e.context||{},internal:{thirdPartyCookieCheck:{disabled:"true"===e.skipCookieCheck},currentTheme:e.theme,currentLocale:e.locale,activeFeatureToggleList:e.activeFeatureToggleList||[],cssVariables:e.cssVariables||{},anchor:e.anchor||"",userSettings:e.userSettings||null,drawer:e.drawer||false,modal:e.modal||false,viewStackSize:e.viewStackSize||0,isNavigateBack:e.isNavigateBack||false},authData:e.authData||{},nodeParams:e.nodeParams||{},searchParams:e.searchParams||{},pathParams:e.pathParams||{}},t.origin);break;case x.NAVIGATION_REQUEST:this.dispatch(M.NAVIGATION_REQUEST,e,t.data.params);break;case x.ALERT_REQUEST:this.dispatchWithPayload(M.ALERT_REQUEST,e,t,t.data?.data?.settings,(n=>{e.notifyAlertClosed(t.data?.data?.settings?.id,n);}));break;case x.INITIALIZED:this.dispatch(M.INITIALIZED,e,t.data?.params||{});break;case x.ADD_SEARCH_PARAMS_REQUEST:this.dispatch(M.ADD_SEARCH_PARAMS_REQUEST,e,{data:t.data.data,keepBrowserHistory:t.data.keepBrowserHistory});break;case x.ADD_NODE_PARAMS_REQUEST:this.dispatch(M.ADD_NODE_PARAMS_REQUEST,e,{data:t.data.data,keepBrowserHistory:t.data.keepBrowserHistory});break;case x.SHOW_CONFIRMATION_MODAL_REQUEST:this.dispatchWithPayload(M.SHOW_CONFIRMATION_MODAL_REQUEST,e,t.data.data,t.data.data?.settings,(t=>{e.notifyConfirmationModalClosed(t);}));break;case x.SHOW_LOADING_INDICATOR_REQUEST:this.dispatch(M.SHOW_LOADING_INDICATOR_REQUEST,e,t);break;case x.HIDE_LOADING_INDICATOR_REQUEST:this.dispatch(M.HIDE_LOADING_INDICATOR_REQUEST,e,t);break;case x.SET_CURRENT_LOCALE_REQUEST:this.dispatchWithPayload(M.SET_CURRENT_LOCALE_REQUEST,e,t,t.data.data);break;case x.LOCAL_STORAGE_SET_REQUEST:this.dispatchWithPayload(M.LOCAL_STORAGE_SET_REQUEST,e,t,t.data.data?.params);break;case x.RUNTIME_ERROR_HANDLING_REQUEST:this.dispatch(M.RUNTIME_ERROR_HANDLING_REQUEST,e,t);break;case x.SET_ANCHOR_LINK_REQUEST:this.dispatchWithPayload(M.SET_ANCHOR_LINK_REQUEST,e,t,t.data.anchor);break;case x.SET_THIRD_PARTY_COOKIES_REQUEST:this.dispatch(M.SET_THIRD_PARTY_COOKIES_REQUEST,e,t);break;case x.BACK_NAVIGATION_REQUEST:{let n=t.data?.goBackContext||{};if("string"==typeof n)try{n=JSON.parse(n);}catch(t){console.warn(t);}this.dispatch(M.GO_BACK_REQUEST,e,n),this.dispatch(M.BACK_NAVIGATION_REQUEST,e,t);}break;case x.GET_CURRENT_ROUTE_REQUEST:this.dispatchWithPayload(M.GET_CURRENT_ROUTE_REQUEST,e,t,t.data.data,(e=>{n.postMessage({msg:x.SEND_CURRENT_ROUTE_ANSWER,data:{correlationId:t.data?.data?.id,route:e}},t.origin);}));break;case x.NAVIGATION_COMPLETED_REPORT:this.dispatch(M.NAVIGATION_COMPLETED_REPORT,e,t);break;case x.UPDATE_MODAL_PATH_DATA_REQUEST:this.dispatchWithPayload(M.UPDATE_MODAL_PATH_DATA_REQUEST,e,t,t.data.params);break;case x.UPDATE_MODAL_SETTINGS:this.dispatchWithPayload(M.UPDATE_MODAL_SETTINGS_REQUEST,e,t,{addHistoryEntry:t.data.addHistoryEntry,updatedModalSettings:t.data.updatedModalSettings});break;case x.CHECK_PATH_EXISTS_REQUEST:this.dispatchWithPayload(M.CHECK_PATH_EXISTS_REQUEST,e,t,t.data.data,(e=>{n.postMessage({msg:x.SEND_PATH_EXISTS_ANSWER,data:{correlationId:t.data?.data?.id,pathExists:e}},t.origin);}));break;case x.SET_DIRTY_STATUS_REQUEST:this.dispatchWithPayload(M.SET_DIRTY_STATUS_REQUEST,e,t,{dirty:t.data.dirty});break;case x.SET_VIEW_GROUP_DATA_REQUEST:this.dispatch(M.SET_VIEW_GROUP_DATA_REQUEST,e,t.data.data);break;case x.ADD_BACKDROP_REQUEST:this.dispatch(M.ADD_BACKDROP_REQUEST,e,t);break;case x.REMOVE_BACKDROP_REQUEST:this.dispatch(M.REMOVE_BACKDROP_REQUEST,e,t);}}}},window.addEventListener("message",globalThis.__luigi_container_manager.messageListener)),globalThis.__luigi_container_manager}registerContainer(t){this.getContainerManager().container.push(t);}}const W=new H;const B=new class{constructor(){this.updateContext=(t,e,n,i,s,o)=>{if(n){const a=e||{};W.sendCustomMessageToIframe(n,{context:t,nodeParams:i||{},pathParams:s||{},searchParams:o||{},internal:a,withoutSync:true},x.SEND_CONTEXT_OBJECT);}else console.warn("Attempting to update context on inexisting iframe");},this.updateViewUrl=(t,e,n,i)=>{if(i){const s=n||{};W.sendCustomMessageToIframe(i,{context:e,internal:s,withoutSync:false,viewUrl:t},x.SEND_CONTEXT_OBJECT);}else console.warn("Attempting to update route on inexisting iframe");},this.updateAuthData=(t,e)=>{t&&e?W.sendCustomMessageToIframe(t,{authData:e},x.AUTH_SET_TOKEN):console.warn("Attempting to update auth data on inexisting iframe or authData");},this.sendCustomMessage=(t,e,n,i,s)=>{if(n&&e._luigi_mfe_webcomponent)W.dispatch(t,e._luigi_mfe_webcomponent,s);else {const e={...s};e.id&&console.warn('Property "id" is reserved and can not be used in custom message data'),e.id=t,W.sendCustomMessageToIframe(i,e);}},this.notifyConfirmationModalClosed=(t,e)=>{const n={data:{confirmed:t}};W.sendCustomMessageToIframe(e,n,x.CONFIRMATION_MODAL_CLOSED);};}notifyAlertClosed(t,e,n){const i=e?{id:t,dismissKey:e}:{id:t};W.sendCustomMessageToIframe(n,i,x.ALERT_CLOSED);}},G=t=>{if(!t)return;const e=t;return e.forEach(((n,i)=>{e[i]=n+(-1!=n.indexOf(";")?"":";"),e[i]=t[i].replaceAll('"',"'");})),e.join(" ")};class V{constructor(t){t?(this.rendererObject=t,this.config=t.config||{}):this.config={};}createCompoundContainer(){return document.createElement("div")}createCompoundItemContainer(t){return document.createElement("div")}attachCompoundItem(t,e){t.appendChild(e);}}class j extends V{constructor(t){super(t||{use:{}}),t&&t.use&&t.use.extends&&(this.superRenderer=K({use:t.use.extends,config:t.config}));}createCompoundContainer(){return this.rendererObject.use.createCompoundContainer?this.rendererObject.use.createCompoundContainer(this.config,this.superRenderer):this.superRenderer?this.superRenderer.createCompoundContainer():super.createCompoundContainer()}createCompoundItemContainer(t){return this.rendererObject.use.createCompoundItemContainer?this.rendererObject.use.createCompoundItemContainer(t,this.config,this.superRenderer):this.superRenderer?this.superRenderer.createCompoundItemContainer(t):super.createCompoundItemContainer(t)}attachCompoundItem(t,e){this.rendererObject.use.attachCompoundItem?this.rendererObject.use.attachCompoundItem(t,e,this.superRenderer):this.superRenderer?this.superRenderer.attachCompoundItem(t,e):super.attachCompoundItem(t,e);}}class F extends V{createCompoundContainer(){const t="__lui_compound_"+(new Date).getTime(),e=document.createElement("div");e.classList.add(t);let n="";return this.config.layouts&&this.config.layouts.forEach((e=>{if(e.minWidth||e.maxWidth){let i="@media only screen ";null!=e.minWidth&&(i+=`and (min-width: ${e.minWidth}px) `),null!=e.maxWidth&&(i+=`and (max-width: ${e.maxWidth}px) `),i+=`{\n            .${t} {\n              grid-template-columns: ${e.columns||"auto"};\n              grid-template-rows: ${e.rows||"auto"};\n              grid-gap: ${e.gap||"0"};\n            }\n          }\n          `,n+=i;}})),e.innerHTML=`\n        <style scoped>\n          .${t} {\n            display: grid;\n            grid-template-columns: ${this.config.columns||"auto"};\n            grid-template-rows: ${this.config.rows||"auto"};\n            grid-gap: ${this.config.gap||"0"};\n            min-height: ${this.config.minHeight||"auto"};\n          }\n          ${n}\n        </style>\n    `,e}createCompoundItemContainer(t){const e=t||{},n=document.createElement("div");return n.setAttribute("style",`grid-row: ${e.row||"auto"}; grid-column: ${e.column||"auto"}`),n.classList.add("lui-compoundItemCnt"),n}}const K=t=>{const e=t.use;return e?"grid"===e?new F(t):e.createCompoundContainer||e.createCompoundItemContainer||e.attachCompoundItem?new j(t):new V(t):new V(t)},q=(t,e,n,i)=>{e?.eventListeners&&e.eventListeners.forEach((e=>{const s=e.source+"."+e.name,o=t[s],a={wcElementId:n,wcElement:i,action:e.action,converter:e.dataConverter};o?o.push(a):t[s]=[a];}));};function X(t){return String(t).replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("&quot;",'"').replaceAll("&#39;","'").replaceAll("&sol;","/")}class z{constructor(){this.alertResolvers={},this.alertIndex=0,this.containerService=new H;}dynamicImport(t){return Object.freeze(import(/* webpackIgnore: true */t))}processViewUrl(t,e){return t}attachWC(t,e,n,i,s,o,a){if(n&&n.contains(e)){const r=document.createElement(t);o&&r.setAttribute("nodeId",o),r.setAttribute("lui_web_component","true"),this.initWC(r,t,n,s,i,o,a),n.replaceChild(r,e),n._luigi_node&&(n._luigi_mfe_webcomponent=r),n.dispatchEvent(new Event("wc_ready"));}}dispatchLuigiEvent(t,e,n){this.containerService.dispatch(t,this.thisComponent,e,n);}createClientAPI(t,e,n,i,s){return {linkManager:()=>{let t=null,e=false,n=false,i=false,s={};const o={navigate:(o,a={})=>{const r={fromContext:t,fromClosestContext:e,fromVirtualTreeRoot:n,fromParent:i,nodeParams:s,...a};this.dispatchLuigiEvent(M.NAVIGATION_REQUEST,{link:o,...r});},navigateToIntent:(t,e={})=>{let n="#?intent=";if(n+=t,e&&Object.keys(e)?.length){const t=Object.entries(e);if(t.length>0){n+="?";for(const[e,i]of t)n+=e+"="+i+"&";n=n.slice(0,-1);}}o.navigate(n);},fromClosestContext:()=>(e=true,o),fromContext:e=>(t=e,o),fromVirtualTreeRoot:()=>(n=true,o),fromParent:()=>(i=true,o),getCurrentRoute:()=>{const o={fromContext:t,fromClosestContext:e,fromVirtualTreeRoot:n,fromParent:i,nodeParams:s};return new Promise(((t,e)=>{this.containerService.dispatch(M.GET_CURRENT_ROUTE_REQUEST,this.thisComponent,{...o},(n=>{n?t(n):e("No current route received.");}));}))},withParams:t=>(s=t,o),updateModalPathInternalNavigation:(o,a={},r=false)=>{if(!o)return void console.warn("Updating path of the modal upon internal navigation prevented. No path specified.");const c={fromClosestContext:e,fromContext:t,fromParent:i,fromVirtualTreeRoot:n,nodeParams:s};this.dispatchLuigiEvent(M.UPDATE_MODAL_PATH_DATA_REQUEST,Object.assign(c,{history:r,link:o,modal:a}));},updateTopNavigation:()=>{this.dispatchLuigiEvent(M.UPDATE_TOP_NAVIGATION_REQUEST,{});},pathExists:o=>{const a={fromContext:t,fromClosestContext:e,fromVirtualTreeRoot:n,fromParent:i,nodeParams:s};return new Promise(((t,e)=>{this.containerService.dispatch(M.CHECK_PATH_EXISTS_REQUEST,this.thisComponent,{...a,link:o},(n=>{n?t(true):e(false);})),this.containerService.dispatch(M.PATH_EXISTS_REQUEST,this.thisComponent,{...a,link:o},(n=>{n?t(true):e(false);}));}))},openAsDrawer:(t,e={})=>{o.navigate(t,{drawer:e});},openAsModal:(t,e={})=>{o.navigate(t,{modal:e});},openAsSplitView:(t,e={})=>{o.navigate(t,{splitView:e});},goBack:t=>{this.dispatchLuigiEvent(M.GO_BACK_REQUEST,t);},hasBack:()=>false,updateModalSettings:(t={},e=false)=>{this.dispatchLuigiEvent(M.UPDATE_MODAL_SETTINGS_REQUEST,{updatedModalSettings:t,addHistoryEntry:e});}};return o},uxManager:()=>({showAlert:t=>(t.id=this.alertIndex++,new Promise((e=>{this.alertResolvers[t.id]=e,this.dispatchLuigiEvent(M.ALERT_REQUEST,t,(e=>{this.resolveAlert(t.id,e);}));}))),showConfirmationModal:t=>new Promise(((e,n)=>{this.modalResolver={resolve:e,reject:n},this.containerService.dispatch(M.SHOW_CONFIRMATION_MODAL_REQUEST,this.thisComponent,t,(t=>{t?e():n();}));})),getCurrentTheme:()=>this.thisComponent.theme,closeUserSettings:()=>{this.dispatchLuigiEvent(M.CLOSE_USER_SETTINGS_REQUEST,this.thisComponent.userSettings);},openUserSettings:()=>{this.dispatchLuigiEvent(M.OPEN_USER_SETTINGS_REQUEST,this.thisComponent.userSettings);},collapseLeftSideNav:()=>{this.dispatchLuigiEvent(M.COLLAPSE_LEFT_NAV_REQUEST,{});},getDirtyStatus:()=>this.thisComponent.dirtyStatus||false,getDocumentTitle:()=>this.thisComponent.documentTitle,setDocumentTitle:t=>{this.dispatchLuigiEvent(M.SET_DOCUMENT_TITLE_REQUEST,t);},setDirtyStatus:t=>{this.dispatchLuigiEvent(M.SET_DIRTY_STATUS_REQUEST,{dirty:t});},setCurrentLocale:t=>{t&&this.dispatchLuigiEvent(M.SET_CURRENT_LOCALE_REQUEST,{currentLocale:t});},removeBackdrop:()=>{this.dispatchLuigiEvent(M.REMOVE_BACKDROP_REQUEST,{});},addBackdrop:()=>{this.dispatchLuigiEvent(M.ADD_BACKDROP_REQUEST,{});},hideAppLoadingIndicator:()=>{this.dispatchLuigiEvent(M.HIDE_LOADING_INDICATOR_REQUEST,{});}}),getCurrentLocale:()=>this.thisComponent.locale,getActiveFeatureToggles:()=>this.thisComponent.activeFeatureToggleList||[],publishEvent:s=>{t&&t.eventBus&&t.eventBus.onPublishEvent(s,e,n);const o={id:s.type,_metaData:{nodeId:e,wc_id:n,src:i},data:s.detail};this.dispatchLuigiEvent(M.CUSTOM_MESSAGE,o);},luigiClientInit:()=>{this.dispatchLuigiEvent(M.INITIALIZED,{});},addNodeParams:(t,e)=>{s||this.dispatchLuigiEvent(M.ADD_NODE_PARAMS_REQUEST,{params:t,data:t,keepBrowserHistory:e});},getNodeParams:t=>{return s?{}:t?(e=this.thisComponent.nodeParams,Object.entries(e).reduce(((t,e)=>(t[X(e[0])]=X(e[1]),t)),{})):this.thisComponent.nodeParams||{};var e;},setAnchor:t=>{s||this.dispatchLuigiEvent(M.SET_ANCHOR_LINK_REQUEST,t);},getAnchor:()=>this.thisComponent.anchor||"",getCoreSearchParams:()=>this.thisComponent.searchParams||{},getPathParams:()=>this.thisComponent.pathParams||{},getClientPermissions:()=>this.thisComponent.clientPermissions||{},addCoreSearchParams:(t={},e=true)=>{this.dispatchLuigiEvent(M.ADD_SEARCH_PARAMS_REQUEST,{data:t,keepBrowserHistory:e});},getUserSettings:()=>this.thisComponent.userSettings||{},setViewGroupData:t=>{this.dispatchLuigiEvent(M.SET_VIEW_GROUP_DATA_REQUEST,t);}}}initWC(t,e,n,i,s,o,a){const r=this.createClientAPI(n,o,e,t,a);if(t.__postProcess){const e=new URL(document.baseURI).origin===new URL(i,document.baseURI).origin?new URL("./",new URL(i,document.baseURI)):new URL("./",i);t.__postProcess(s,r,e.origin+e.pathname);}else t.context=s,t.LuigiClient=r;}generateWCId(t){let e="";const n=new URL(t,encodeURI(location.href)).href;for(let t=0;t<n.length;t++)e+=n.charCodeAt(t).toString(16);return "luigi-wc-"+e}registerWCFromUrl(t,e){const n=this.processViewUrl(t);return new Promise(((t,i)=>{if(this.checkWCUrl(n))this.dynamicImport(n).then((n=>{try{if(!window.customElements.get(e)){let t=n.default;if(!HTMLElement.isPrototypeOf(t)){const e=Object.keys(n);for(let i=0;i<e.length&&(t=n[e[i]],!HTMLElement.isPrototypeOf(t));i++);}window.customElements.define(e,t);}t(1);}catch(t){i(t);}})).catch((t=>{i(t);}));else {i(`Error: View URL '${n}' not allowed to be included`);}}))}includeSelfRegisteredWCFromUrl(t,e,n){if(this.checkWCUrl(e)){this.containerService.getContainerManager()._registerWebcomponent||(this.containerService.getContainerManager()._registerWebcomponent=(t,e)=>{window.customElements.define(this.generateWCId(t),e);}),window.Luigi||(window.Luigi={},window.Luigi._registerWebcomponent||(window.Luigi._registerWebcomponent=(t,e)=>{this.containerService.getContainerManager()._registerWebcomponent(t,e);}));const i=document.createElement("script");i.setAttribute("src",e),"module"===t.webcomponent.type&&i.setAttribute("type","module"),i.setAttribute("defer","true"),i.addEventListener("load",(()=>{n();})),document.body.appendChild(i);}else console.warn(`View URL '${e}' not allowed to be included`);}checkWCUrl(t){return  true}renderWebComponent(t,e,n,i,s,o){const a=this.processViewUrl(t,{context:n}),r=i?.webcomponent?.tagName||this.generateWCId(a),c=document.createElement("div");e.appendChild(c),e._luigi_node=i,window.customElements.get(r)?this.attachWC(r,c,e,n,a,s,o):window.luigiWCFn?window.luigiWCFn(a,r,c,(()=>{this.attachWC(r,c,e,n,a,s,o);})):i?.webcomponent?.selfRegistered?this.includeSelfRegisteredWCFromUrl(i,a,(()=>{this.attachWC(r,c,e,n,a,s,o);})):this.registerWCFromUrl(a,r).then((()=>{this.attachWC(r,c,e,n,a,s,o);})).catch((t=>{console.warn("ERROR =>",t),this.containerService.dispatch(M.RUNTIME_ERROR_HANDLING_REQUEST,this.thisComponent,t);}));}createCompoundContainerAsync(t,e,n){return new Promise(((i,s)=>{if(t.viewUrl)try{const s=n?.webcomponent?.tagName||this.generateWCId(t.viewUrl);n?.webcomponent?.selfRegistered?this.includeSelfRegisteredWCFromUrl(n,t.viewUrl,(()=>{const n=document.createElement(s);n.setAttribute("lui_web_component","true"),this.initWC(n,s,n,t.viewUrl,e,"_root"),i(n);})):this.registerWCFromUrl(t.viewUrl,s).then((()=>{const n=document.createElement(s);n.setAttribute("lui_web_component","true"),this.initWC(n,s,n,t.viewUrl,e,"_root"),i(n);})).catch((t=>{console.warn("Error: ",t),this.containerService.dispatch(M.RUNTIME_ERROR_HANDLING_REQUEST,this.thisComponent,t);}));}catch(t){s(t);}else i(t.createCompoundContainer());}))}renderWebComponentCompound(t,e,n){let i;return t.webcomponent&&t.viewUrl?(i=new V,i.viewUrl=this.processViewUrl(t.viewUrl,{context:n}),i.createCompoundItemContainer=t=>{const e=document.createElement("div");return t?.slot&&e.setAttribute("slot",t.slot),e}):t.compound?.renderer&&(i=K(t.compound.renderer)),i=i||new V,new Promise((s=>{this.createCompoundContainerAsync(i,n,t).then((o=>{e._luigi_mfe_webcomponent=o,e._luigi_node=t;const a={};o.eventBus={listeners:a,onPublishEvent:(t,e,n)=>{const i=a[e+"."+t.type]||[];i.push(...a["*."+t.type]||[]),i.forEach((e=>{const n=e.wcElement||o.querySelector("[nodeId="+e.wcElementId+"]");n?n.dispatchEvent(new CustomEvent(e.action,{detail:e.converter?e.converter(t.detail):t.detail})):console.debug("Could not find event target",e);}));}},t.compound?.children?.forEach(((t,e)=>{const s={...n,...t.context},r=i.createCompoundItemContainer(t.layoutConfig);r.eventBus=o.eventBus,i.attachCompoundItem(o,r);const c=t.id||"gen_"+e;this.renderWebComponent(t.viewUrl,r,s,t,c,true),q(a,t,c);})),e.appendChild(o),q(a,t.compound,"_root",o),s(o);})).catch((t=>{console.warn("Error: ",t),this.containerService.dispatch(M.RUNTIME_ERROR_HANDLING_REQUEST,this.thisComponent,t);}));}))}resolveAlert(t,e){this.alertResolvers[t]?(this.alertResolvers[t](void 0===e||e),this.alertResolvers[t]=void 0):console.log("Promise is not in the list.");}notifyConfirmationModalClosed(t){this.modalResolver?(t?this.modalResolver.resolve():this.modalResolver.reject(),this.modalResolver=void 0):console.log("Modal promise is not listed.");}}const J=new class{isFunction(t){return t&&"[object Function]"==={}.toString.call(t)}isObject(t){return !(!t||"object"!=typeof t||Array.isArray(t))}checkWebcomponentValue(t){return "string"==typeof t?JSON.parse(t):"boolean"==typeof t||"object"==typeof t?t:void console.warn("Webcomponent value has a wrong type.")}resolveContext(t){return t?"string"==typeof t?JSON.parse(t):t:{}}};function Y(t){let e,n=(!t[4]||"false"===t[4])&&Z(t);return {c(){n&&n.c(),e=m("");},m(t,i){n&&n.m(t,i),u(t,e,i);},p(t,i){t[4]&&"false"!==t[4]?n&&(n.d(1),n=null):n?n.p(t,i):(n=Z(t),n.c(),n.m(e.parentNode,e));},d(t){t&&d(e),n&&n.d(t);}}}function Z(t){let e,n,i,s,o,a;return {c(){e=h("style"),e.textContent="main.lui-isolated,\n        .lui-isolated iframe {\n          width: 100%;\n          height: 100%;\n          border: none;\n        }\n\n        main.lui-isolated {\n          line-height: 0;\n        }",n=m(" "),i=h("iframe"),c(i.src,s=t[3])||E(i,"src",s),E(i,"title",t[1]),E(i,"allow",o=G(t[0])),E(i,"sandbox",a=t[2]?t[2].join(" "):void 0);},m(s,o){u(s,e,o),u(s,n,o),u(s,i,o),t[28](i);},p(t,e){8&e[0]&&!c(i.src,s=t[3])&&E(i,"src",s),2&e[0]&&E(i,"title",t[1]),1&e[0]&&o!==(o=G(t[0]))&&E(i,"allow",o),4&e[0]&&a!==(a=t[2]?t[2].join(" "):void 0)&&E(i,"sandbox",a);},d(s){s&&(d(e),d(n),d(i)),t[28](null);}}}function tt(e){let n,i,s=e[5]&&Y(e);return {c(){n=h("main"),s&&s.c(),E(n,"class",i=e[4]?void 0:"lui-isolated");},m(t,i){u(t,n,i),s&&s.m(n,null),e[29](n);},p(t,e){t[5]?s?s.p(t,e):(s=Y(t),s.c(),s.m(n,null)):s&&(s.d(1),s=null),16&e[0]&&i!==(i=t[4]?void 0:"lui-isolated")&&E(n,"class",i);},i:t,o:t,d(t){t&&d(n),s&&s.d(),e[29](null);}}}function et(t,e,n){let{activeFeatureToggleList:i}=e,{allowRules:s}=e,{anchor:o}=e,{authData:a}=e,{clientPermissions:r}=e,{context:c}=e,{deferInit:l}=e,{dirtyStatus:u}=e,{documentTitle:d}=e,{hasBack:h}=e,{label:m}=e,{locale:E}=e,{noShadow:p}=e,{nodeParams:T}=e,{pathParams:$}=e,{sandboxRules:C}=e,{searchParams:f}=e,{skipCookieCheck:R}=e,{skipInitCheck:A}=e,{theme:w}=e,{userSettings:b}=e,{viewurl:I}=e,{webcomponent:O}=e;const U={};let v,y,N=false;const P=new z,L=t=>{if(!N){t.sendCustomMessage=(e,n)=>{B.sendCustomMessage(e,t.getNoShadow()?t:v,!!O,U,n);},t.updateContext=(e,i)=>{if(n(8,c=e),O)(t.getNoShadow()?t:v)._luigi_mfe_webcomponent.context=e;else {const n={...i||{},activeFeatureToggleList:t.activeFeatureToggleList||[],currentLocale:t.locale,currentTheme:t.theme,userSettings:t.userSettings||null,cssVariables:t.cssVariables||{},anchor:t.anchor||"",drawer:t.drawer||false,modal:t.modal||false,viewStackSize:t.viewStackSize||0,isNavigateBack:t.isNavigateBack||false};B.updateContext(e,n,U,T,$,f);}},t.closeAlert=(e,n)=>{t.notifyAlertClosed(e,n);},t.notifyAlertClosed=(e,n)=>{t.isConnected&&(O?P.resolveAlert(e,n):B.notifyAlertClosed(e,n,U));},t.notifyConfirmationModalClosed=e=>{t.isConnected&&(O?P.notifyConfirmationModalClosed(!!e):B.notifyConfirmationModalClosed(!!e,U));},W.registerContainer(t),P.thisComponent=t;const e=J.resolveContext(c);if(t.updateViewUrl=(t,e)=>{t?.length&&B.updateViewUrl(t,J.resolveContext(c),e,U);},O&&"false"!=O){if(t.getNoShadow())t.innerHTML="";else {n(7,v.innerHTML="",v);t.attachShadow({mode:"open"}).append(v);}const i=J.checkWebcomponentValue(O);P.renderWebComponent(I,t.getNoShadow()?t:v,e,"object"==typeof i?{webcomponent:i}:{});}else if(!t.getNoShadow()){t.innerHTML="";t.attachShadow({mode:"open"}).append(v);}A?(t.initialized=true,setTimeout((()=>{P.dispatchLuigiEvent(M.INITIALIZED,{});}))):O&&(t.getNoShadow()?t:v).addEventListener("wc_ready",(()=>{(t.getNoShadow()?t:v)._luigi_mfe_webcomponent?.deferLuigiClientWCInit||(t.initialized=true,P.dispatchLuigiEvent(M.INITIALIZED,{}));})),n(5,N=true),t.containerInitialized=true;}};var D;return _((async()=>{n(27,y=v.parentNode),n(27,y.iframeHandle=U,y),n(27,y.init=()=>{L(y);},y),!l&&I&&L(y);})),D=async()=>{},g().$$.on_destroy.push(D),t.$$set=t=>{"activeFeatureToggleList"in t&&n(9,i=t.activeFeatureToggleList),"allowRules"in t&&n(0,s=t.allowRules),"anchor"in t&&n(10,o=t.anchor),"authData"in t&&n(11,a=t.authData),"clientPermissions"in t&&n(12,r=t.clientPermissions),"context"in t&&n(8,c=t.context),"deferInit"in t&&n(13,l=t.deferInit),"dirtyStatus"in t&&n(14,u=t.dirtyStatus),"documentTitle"in t&&n(15,d=t.documentTitle),"hasBack"in t&&n(16,h=t.hasBack),"label"in t&&n(1,m=t.label),"locale"in t&&n(17,E=t.locale),"noShadow"in t&&n(18,p=t.noShadow),"nodeParams"in t&&n(19,T=t.nodeParams),"pathParams"in t&&n(20,$=t.pathParams),"sandboxRules"in t&&n(2,C=t.sandboxRules),"searchParams"in t&&n(21,f=t.searchParams),"skipCookieCheck"in t&&n(22,R=t.skipCookieCheck),"skipInitCheck"in t&&n(23,A=t.skipInitCheck),"theme"in t&&n(24,w=t.theme),"userSettings"in t&&n(25,b=t.userSettings),"viewurl"in t&&n(3,I=t.viewurl),"webcomponent"in t&&n(4,O=t.webcomponent);},t.$$.update=()=>{134225960&t.$$.dirty[0]&&!N&&I&&!l&&y&&L(y);},[s,m,C,I,O,N,U,v,c,i,o,a,r,l,u,d,h,E,p,T,$,f,R,A,w,b,()=>i&&s&&o&&a&&r&&u&&d&&h&&E&&p&&T&&$&&C&&f&&R&&A&&w&&b,y,function(t){S[t?"unshift":"push"]((()=>{U.iframe=t,n(6,U);}));},function(t){S[t?"unshift":"push"]((()=>{v=t,n(7,v);}));}]}class nt extends k{constructor(t){super(),N(this,t,et,tt,o,{activeFeatureToggleList:9,allowRules:0,anchor:10,authData:11,clientPermissions:12,context:8,deferInit:13,dirtyStatus:14,documentTitle:15,hasBack:16,label:1,locale:17,noShadow:18,nodeParams:19,pathParams:20,sandboxRules:2,searchParams:21,skipCookieCheck:22,skipInitCheck:23,theme:24,userSettings:25,viewurl:3,webcomponent:4,unwarn:26},null,[-1,-1]);}get activeFeatureToggleList(){return this.$$.ctx[9]}set activeFeatureToggleList(t){this.$$set({activeFeatureToggleList:t}),I();}get allowRules(){return this.$$.ctx[0]}set allowRules(t){this.$$set({allowRules:t}),I();}get anchor(){return this.$$.ctx[10]}set anchor(t){this.$$set({anchor:t}),I();}get authData(){return this.$$.ctx[11]}set authData(t){this.$$set({authData:t}),I();}get clientPermissions(){return this.$$.ctx[12]}set clientPermissions(t){this.$$set({clientPermissions:t}),I();}get context(){return this.$$.ctx[8]}set context(t){this.$$set({context:t}),I();}get deferInit(){return this.$$.ctx[13]}set deferInit(t){this.$$set({deferInit:t}),I();}get dirtyStatus(){return this.$$.ctx[14]}set dirtyStatus(t){this.$$set({dirtyStatus:t}),I();}get documentTitle(){return this.$$.ctx[15]}set documentTitle(t){this.$$set({documentTitle:t}),I();}get hasBack(){return this.$$.ctx[16]}set hasBack(t){this.$$set({hasBack:t}),I();}get label(){return this.$$.ctx[1]}set label(t){this.$$set({label:t}),I();}get locale(){return this.$$.ctx[17]}set locale(t){this.$$set({locale:t}),I();}get noShadow(){return this.$$.ctx[18]}set noShadow(t){this.$$set({noShadow:t}),I();}get nodeParams(){return this.$$.ctx[19]}set nodeParams(t){this.$$set({nodeParams:t}),I();}get pathParams(){return this.$$.ctx[20]}set pathParams(t){this.$$set({pathParams:t}),I();}get sandboxRules(){return this.$$.ctx[2]}set sandboxRules(t){this.$$set({sandboxRules:t}),I();}get searchParams(){return this.$$.ctx[21]}set searchParams(t){this.$$set({searchParams:t}),I();}get skipCookieCheck(){return this.$$.ctx[22]}set skipCookieCheck(t){this.$$set({skipCookieCheck:t}),I();}get skipInitCheck(){return this.$$.ctx[23]}set skipInitCheck(t){this.$$set({skipInitCheck:t}),I();}get theme(){return this.$$.ctx[24]}set theme(t){this.$$set({theme:t}),I();}get userSettings(){return this.$$.ctx[25]}set userSettings(t){this.$$set({userSettings:t}),I();}get viewurl(){return this.$$.ctx[3]}set viewurl(t){this.$$set({viewurl:t}),I();}get webcomponent(){return this.$$.ctx[4]}set webcomponent(t){this.$$set({webcomponent:t}),I();}get unwarn(){return this.$$.ctx[26]}}function it(t){l(t,"svelte-1buc46y","main.svelte-1buc46y{width:100%;height:100%;border:none}");}function st(e){let n;return {c(){n=h("main"),E(n,"class","svelte-1buc46y");},m(t,i){u(t,n,i),e[21](n);},p:t,i:t,o:t,d(t){t&&d(n),e[21](null);}}}function ot(t,e,n){let i,s,{activeFeatureToggleList:o}=e,{anchor:a}=e,{clientPermissions:r}=e,{compoundConfig:c}=e,{context:l}=e,{deferInit:u}=e,{dirtyStatus:d}=e,{documentTitle:h}=e,{hasBack:m}=e,{locale:E}=e,{noShadow:p}=e,{nodeParams:g}=e,{pathParams:T}=e,{searchParams:$}=e,{skipInitCheck:C}=e,{theme:f}=e,{userSettings:R}=e,{viewurl:A}=e,{webcomponent:w}=e,b=false;const I=new H,O=new z,U=t=>{if(!c||b)return;t.updateContext=(e,s)=>{const o=t.getNoShadow()?t:i;o._luigi_mfe_webcomponent.context=e,n(1,l=e);const a=o._luigi_mfe_webcomponent;if(a){const t=a.querySelectorAll("[lui_web_component]");t?.forEach((t=>{const n=t.context||{};t.context=Object.assign(n,e);}));}};const e=J.resolveContext(l);n(2,u=false),t.notifyAlertClosed=(e,n)=>{t.isConnected&&O.resolveAlert(e,n);},t.notifyConfirmationModalClosed=e=>{t.isConnected&&O.notifyConfirmationModalClosed(!!e);};const o={compound:c,viewUrl:A,webcomponent:J.checkWebcomponentValue(w)||true};if(t.getNoShadow())t.innerHTML="";else {n(0,i.innerHTML="",i);t.attachShadow({mode:"open"}).append(i);}O.renderWebComponentCompound(o,t.getNoShadow()?t:i,e).then((e=>{s=e,C||!o.viewUrl?(t.initialized=true,setTimeout((()=>{O.dispatchLuigiEvent(M.INITIALIZED,{});}))):s.LuigiClient&&!s.deferLuigiClientWCInit&&(t.initialized=true,O.dispatchLuigiEvent(M.INITIALIZED,{}));})),b=true,t.containerInitialized=true;};return _((async()=>{const t=i.getRootNode()===document?i.parentNode:i.getRootNode().host;t.init=()=>{U(t);},u||U(t),I.registerContainer(t),O.thisComponent=t;})),t.$$set=t=>{"activeFeatureToggleList"in t&&n(3,o=t.activeFeatureToggleList),"anchor"in t&&n(4,a=t.anchor),"clientPermissions"in t&&n(5,r=t.clientPermissions),"compoundConfig"in t&&n(6,c=t.compoundConfig),"context"in t&&n(1,l=t.context),"deferInit"in t&&n(2,u=t.deferInit),"dirtyStatus"in t&&n(7,d=t.dirtyStatus),"documentTitle"in t&&n(8,h=t.documentTitle),"hasBack"in t&&n(9,m=t.hasBack),"locale"in t&&n(10,E=t.locale),"noShadow"in t&&n(11,p=t.noShadow),"nodeParams"in t&&n(12,g=t.nodeParams),"pathParams"in t&&n(13,T=t.pathParams),"searchParams"in t&&n(14,$=t.searchParams),"skipInitCheck"in t&&n(15,C=t.skipInitCheck),"theme"in t&&n(16,f=t.theme),"userSettings"in t&&n(17,R=t.userSettings),"viewurl"in t&&n(18,A=t.viewurl),"webcomponent"in t&&n(19,w=t.webcomponent);},[i,l,u,o,a,r,c,d,h,m,E,p,g,T,$,C,f,R,A,w,()=>o&&a&&r&&d&&h&&m&&E&&p&&g&&T&&$&&C&&f&&R,function(t){S[t?"unshift":"push"]((()=>{i=t,n(0,i);}));}]}D(nt,{activeFeatureToggleList:{type:"Array",reflect:false,attribute:"active-feature-toggle-list"},allowRules:{type:"Array",reflect:false,attribute:"allow-rules"},anchor:{type:"String",reflect:false,attribute:"anchor"},authData:{type:"Object",reflect:false,attribute:"auth-data"},clientPermissions:{type:"Object",reflect:false,attribute:"client-permissions"},context:{type:"String",reflect:false,attribute:"context"},deferInit:{type:"Boolean",attribute:"defer-init"},dirtyStatus:{type:"Boolean",reflect:false,attribute:"dirty-status"},documentTitle:{type:"String",reflect:false,attribute:"document-title"},hasBack:{type:"Boolean",reflect:false,attribute:"has-back"},label:{type:"String",reflect:false,attribute:"label"},locale:{type:"String",reflect:false,attribute:"locale"},noShadow:{type:"Boolean",attribute:"no-shadow"},nodeParams:{type:"Object",reflect:false,attribute:"node-params"},pathParams:{type:"Object",reflect:false,attribute:"path-params"},sandboxRules:{type:"Array",reflect:false,attribute:"sandbox-rules"},searchParams:{type:"Object",reflect:false,attribute:"search-params"},skipCookieCheck:{type:"String",reflect:false,attribute:"skip-cookie-check"},skipInitCheck:{type:"Boolean",reflect:false,attribute:"skip-init-check"},theme:{type:"String",reflect:false,attribute:"theme"},userSettings:{type:"Object",reflect:false,attribute:"user-settings"},viewurl:{type:"String",reflect:false,attribute:"viewurl"},webcomponent:{type:"String",reflect:false,attribute:"webcomponent"}},[],["unwarn"],false,(t=>{let e=t=>()=>console.warn(t+" can't be called on luigi-container before its micro frontend is attached to the DOM.");return class extends t{sendCustomMessage=e("sendCustomMessage");updateContext=e("updateContext");updateViewUrl=e("updateViewUrl");closeAlert=e("closeAlert");notifyAlertClosed=e("notifyAlertClosed");notifyConfirmationModalClosed=e("notifyConfirmationModalClosed");attributeChangedCallback(t,e,n){try{super.attributeChangedCallback(t,e,n);}catch(t){console.error("Error in super.attributeChangedCallback",t);}this.containerInitialized&&("context"===t&&this.updateContext(JSON.parse(n)),"auth-data"===t&&B.updateAuthData(this.iframeHandle,JSON.parse(n)));}getNoShadow(){return this.hasAttribute("no-shadow")||this.noShadow}}}));class at extends k{constructor(t){super(),N(this,t,ot,st,o,{activeFeatureToggleList:3,anchor:4,clientPermissions:5,compoundConfig:6,context:1,deferInit:2,dirtyStatus:7,documentTitle:8,hasBack:9,locale:10,noShadow:11,nodeParams:12,pathParams:13,searchParams:14,skipInitCheck:15,theme:16,userSettings:17,viewurl:18,webcomponent:19,unwarn:20},it);}get activeFeatureToggleList(){return this.$$.ctx[3]}set activeFeatureToggleList(t){this.$$set({activeFeatureToggleList:t}),I();}get anchor(){return this.$$.ctx[4]}set anchor(t){this.$$set({anchor:t}),I();}get clientPermissions(){return this.$$.ctx[5]}set clientPermissions(t){this.$$set({clientPermissions:t}),I();}get compoundConfig(){return this.$$.ctx[6]}set compoundConfig(t){this.$$set({compoundConfig:t}),I();}get context(){return this.$$.ctx[1]}set context(t){this.$$set({context:t}),I();}get deferInit(){return this.$$.ctx[2]}set deferInit(t){this.$$set({deferInit:t}),I();}get dirtyStatus(){return this.$$.ctx[7]}set dirtyStatus(t){this.$$set({dirtyStatus:t}),I();}get documentTitle(){return this.$$.ctx[8]}set documentTitle(t){this.$$set({documentTitle:t}),I();}get hasBack(){return this.$$.ctx[9]}set hasBack(t){this.$$set({hasBack:t}),I();}get locale(){return this.$$.ctx[10]}set locale(t){this.$$set({locale:t}),I();}get noShadow(){return this.$$.ctx[11]}set noShadow(t){this.$$set({noShadow:t}),I();}get nodeParams(){return this.$$.ctx[12]}set nodeParams(t){this.$$set({nodeParams:t}),I();}get pathParams(){return this.$$.ctx[13]}set pathParams(t){this.$$set({pathParams:t}),I();}get searchParams(){return this.$$.ctx[14]}set searchParams(t){this.$$set({searchParams:t}),I();}get skipInitCheck(){return this.$$.ctx[15]}set skipInitCheck(t){this.$$set({skipInitCheck:t}),I();}get theme(){return this.$$.ctx[16]}set theme(t){this.$$set({theme:t}),I();}get userSettings(){return this.$$.ctx[17]}set userSettings(t){this.$$set({userSettings:t}),I();}get viewurl(){return this.$$.ctx[18]}set viewurl(t){this.$$set({viewurl:t}),I();}get webcomponent(){return this.$$.ctx[19]}set webcomponent(t){this.$$set({webcomponent:t}),I();}get unwarn(){return this.$$.ctx[20]}}D(at,{activeFeatureToggleList:{type:"Array",reflect:false,attribute:"active-feature-toggle-list"},anchor:{type:"String",reflect:false,attribute:"anchor"},clientPermissions:{type:"Object",reflect:false,attribute:"client-permissions"},compoundConfig:{type:"Object",reflect:false,attribute:"compound-config"},context:{type:"String",reflect:false,attribute:"context"},deferInit:{type:"Boolean",attribute:"defer-init"},dirtyStatus:{type:"Boolean",reflect:false,attribute:"dirty-status"},documentTitle:{type:"String",reflect:false,attribute:"document-title"},hasBack:{type:"Boolean",reflect:false,attribute:"has-back"},locale:{type:"String",reflect:false,attribute:"locale"},noShadow:{type:"Boolean",attribute:"no-shadow",reflect:false},nodeParams:{type:"Object",reflect:false,attribute:"node-params"},pathParams:{type:"Object",reflect:false,attribute:"path-params"},searchParams:{type:"Object",reflect:false,attribute:"search-params"},skipInitCheck:{type:"Boolean",reflect:false,attribute:"skip-init-check"},theme:{type:"String",reflect:false,attribute:"theme"},userSettings:{type:"Object",reflect:false,attribute:"user-settings"},viewurl:{type:"String",reflect:false,attribute:"viewurl"},webcomponent:{type:"String",reflect:false,attribute:"webcomponent"}},[],["unwarn"],false,(t=>{let e=t=>()=>console.warn(t+" can't be called on luigi-container before its micro frontend is attached to the DOM.");return class extends t{updateContext=e("updateContext");notifyAlertClosed=e("notifyAlertClosed");notifyConfirmationModalClosed=e("notifyConfirmationModalClosed");attributeChangedCallback(t,e,n){try{super.attributeChangedCallback(t,e,n);}catch(t){console.warn("Error in attributeChangedCallback",t);}this.containerInitialized&&"context"===t&&this.updateContext(JSON.parse(n));}getNoShadow(){return this.hasAttribute("no-shadow")||this.noShadow}}}));var rt=M;customElements.get("luigi-container")||customElements.define("luigi-container",nt.element),customElements.get("luigi-compound-container")||customElements.define("luigi-compound-container",at.element);

  var PackageModule = /*#__PURE__*/Object.freeze({
    __proto__: null,
    LuigiCompoundContainer: at,
    LuigiContainer: nt,
    get LuigiEvents () { return M; },
    default: rt
  });

  exports.PackageModule = PackageModule;
  exports.nt = nt;

}));
