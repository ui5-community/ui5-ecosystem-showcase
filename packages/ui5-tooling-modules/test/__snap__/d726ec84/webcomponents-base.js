sap.ui.define(['exports', 'sap/base/strings/hyphenate', 'sap/ui/core/webc/WebComponent', 'sap/ui/base/DataType'], (function (exports, hyphenate, WebComponent, DataType) { 'use strict';

	var c$8={},e$9=c$8.hasOwnProperty,a$c=c$8.toString,o$b=e$9.toString,l$a=o$b.call(Object),i$e=function(r){var t,n;return !r||a$c.call(r)!=="[object Object]"?false:(t=Object.getPrototypeOf(r),t?(n=e$9.call(t,"constructor")&&t.constructor,typeof n=="function"&&o$b.call(n)===l$a):true)};

	var c$7=Object.create(null),u$d=function(p,m,A,d){var n,t,e,a,o,i,r=arguments[2]||{},f=3,l=arguments.length,s=arguments[0]||false,y=arguments[1]?undefined:c$7;for(typeof r!="object"&&typeof r!="function"&&(r={});f<l;f++)if((o=arguments[f])!=null)for(a in o)n=r[a],e=o[a],!(a==="__proto__"||r===e)&&(s&&e&&(i$e(e)||(t=Array.isArray(e)))?(t?(t=false,i=n&&Array.isArray(n)?n:[]):i=n&&i$e(n)?n:{},r[a]=u$d(s,arguments[1],i,e)):e!==y&&(r[a]=e));return r};

	const e$8=function(n,t){return u$d(true,false,...arguments)};

	const e$7=new Map,s$d=(t,r)=>{e$7.set(t,r);},n$a=t=>e$7.get(t);

	const _$1={themes:{default:"sap_horizon",all:["sap_fiori_3","sap_fiori_3_dark","sap_fiori_3_hcb","sap_fiori_3_hcw","sap_horizon","sap_horizon_dark","sap_horizon_hcb","sap_horizon_hcw"]},languages:{default:"en"},locales:{default:"en",all:["ar","ar_EG","ar_SA","bg","ca","cnr","cs","da","de","de_AT","de_CH","el","el_CY","en","en_AU","en_GB","en_HK","en_IE","en_IN","en_NZ","en_PG","en_SG","en_ZA","es","es_AR","es_BO","es_CL","es_CO","es_MX","es_PE","es_UY","es_VE","et","fa","fi","fr","fr_BE","fr_CA","fr_CH","fr_LU","he","hi","hr","hu","id","it","it_CH","ja","kk","ko","lt","lv","ms","mk","nb","nl","nl_BE","pl","pt","pt_PT","ro","ru","ru_UA","sk","sl","sr","sr_Latn","sv","th","tr","uk","vi","zh_CN","zh_HK","zh_SG","zh_TW"]}},e$6=_$1.themes.default,s$c=_$1.themes.all,a$b=_$1.languages.default,r$9=_$1.locales.default,n$9=_$1.locales.all;

	const o$a=typeof document>"u",n$8={search(){return o$a?"":window.location.search}},s$b=()=>o$a?"":window.location.href,u$c=()=>n$8.search();

	const o$9=e=>{const t=document.querySelector(`META[name="${e}"]`);return t&&t.getAttribute("content")},s$a=e=>{const t=o$9("sap-allowedThemeOrigins");return t&&t.split(",").some(n=>n==="*"||e===n.trim())},a$a=(e,t)=>{const n=new URL(e).pathname;return new URL(n,t).toString()},g$4=e=>{let t;try{if(e.startsWith(".")||e.startsWith("/"))t=new URL(e,s$b()).toString();else {const n=new URL(e),r=n.origin;r&&s$a(r)?t=n.toString():t=a$a(n.toString(),s$b());}return t.endsWith("/")||(t=`${t}/`),`${t}UI5/`}catch{}};

	var u$b=(l=>(l.Full="full",l.Basic="basic",l.Minimal="minimal",l.None="none",l))(u$b||{});

	let i$d = class i{constructor(){this._eventRegistry=new Map;}attachEvent(t,r){const n=this._eventRegistry,e=n.get(t);if(!Array.isArray(e)){n.set(t,[r]);return}e.includes(r)||e.push(r);}detachEvent(t,r){const n=this._eventRegistry,e=n.get(t);if(!e)return;const s=e.indexOf(r);s!==-1&&e.splice(s,1),e.length===0&&n.delete(t);}fireEvent(t,r){const e=this._eventRegistry.get(t);return e?e.map(s=>s.call(this,r)):[]}fireEventAsync(t,r){return Promise.all(this.fireEvent(t,r))}isHandlerAttached(t,r){const e=this._eventRegistry.get(t);return e?e.includes(r):false}hasListeners(t){return !!this._eventRegistry.get(t)}};

	const e$5=new i$d,t$c="configurationReset",i$c=n=>{e$5.attachEvent(t$c,n);};

	let p$6=false,t$b={animationMode:u$b.Full,theme:e$6,themeRoot:undefined,rtl:undefined,language:undefined,timezone:undefined,calendarType:undefined,secondaryCalendarType:undefined,noConflict:false,formatSettings:{},fetchDefaultLanguage:false,defaultFontLoading:true,enableDefaultTooltips:true};const C$2=()=>(o$8(),t$b.animationMode),T$2=()=>(o$8(),t$b.theme),S$3=()=>(o$8(),t$b.themeRoot),L$1=()=>(o$8(),t$b.language),F=()=>(o$8(),t$b.fetchDefaultLanguage),U$2=()=>(o$8(),t$b.noConflict),b$3=()=>(o$8(),t$b.defaultFontLoading),D=()=>(o$8(),t$b.enableDefaultTooltips),M$1=()=>(o$8(),t$b.formatSettings),i$b=new Map;i$b.set("true",true),i$b.set("false",false);const z$1=()=>{const n=document.querySelector("[data-ui5-config]")||document.querySelector("[data-id='sap-ui-config']");let e;if(n){try{e=JSON.parse(n.innerHTML);}catch{console.warn("Incorrect data-sap-ui-config format. Please use JSON");}e&&(t$b=e$8(t$b,e));}},E$2=()=>{const n=new URLSearchParams(u$c());n.forEach((e,a)=>{const r=a.split("sap-").length;r===0||r===a.split("sap-ui-").length||u$a(a,e,"sap");}),n.forEach((e,a)=>{a.startsWith("sap-ui")&&u$a(a,e,"sap-ui");});},P$4=n=>{const e=n.split("@")[1];return g$4(e)},w$5=(n,e)=>n==="theme"&&e.includes("@")?e.split("@")[0]:e,u$a=(n,e,a)=>{const r=e.toLowerCase(),s=n.split(`${a}-`)[1];i$b.has(e)&&(e=i$b.get(r)),s==="theme"?(t$b.theme=w$5(s,e),e&&e.includes("@")&&(t$b.themeRoot=P$4(e))):t$b[s]=e;},j=()=>{const n=n$a("OpenUI5Support");if(!n||!n.isOpenUI5Detected())return;const e=n.getConfigurationSettingsObject();t$b=e$8(t$b,e);},o$8=()=>{typeof document>"u"||p$6||(g$3(),p$6=true);},g$3=n=>{z$1(),E$2(),j();};

	let l$9 = class l{constructor(){this.list=[],this.lookup=new Set;}add(t){this.lookup.has(t)||(this.list.push(t),this.lookup.add(t));}remove(t){this.lookup.has(t)&&(this.list=this.list.filter(e=>e!==t),this.lookup.delete(t));}shift(){const t=this.list.shift();if(t)return this.lookup.delete(t),t}isEmpty(){return this.list.length===0}isAdded(t){return this.lookup.has(t)}process(t){let e;const s=new Map;for(e=this.shift();e;){const i=s.get(e)||0;if(i>10)throw new Error("Web component processed too many times this task, max allowed is: 10");t(e),s.set(e,i+1),e=this.shift();}}};

	const o$7=(t,n=document.body,r)=>{let e=document.querySelector(t);return e||(e=r?r():document.createElement(t),n.insertBefore(e,n.firstChild))};

	const u$9=()=>{const t=document.createElement("meta");return t.setAttribute("name","ui5-shared-resources"),t.setAttribute("content",""),t},l$8=()=>typeof document>"u"?null:o$7('meta[name="ui5-shared-resources"]',document.head,u$9),m$7=(t,o)=>{const r=t.split(".");let e=l$8();if(!e)return o;for(let n=0;n<r.length;n++){const s=r[n],c=n===r.length-1;Object.prototype.hasOwnProperty.call(e,s)||(e[s]=c?o:{}),e=e[s];}return e};

	const e$4={version:"2.7.0",major:2,minor:7,patch:0,suffix:"",isNext:false,buildTime:1738589223};

	let o$6,t$a={include:[/^ui5-/],exclude:[]};const s$9=new Map,u$8=e=>{if(!e.match(/^[a-zA-Z0-9_-]+$/))throw new Error("Only alphanumeric characters and dashes allowed for the scoping suffix");o$6=e;},c$6=()=>o$6,m$6=()=>t$a,i$a=e=>{if(!s$9.has(e)){const r=t$a.include.some(n=>e.match(n))&&!t$a.exclude.some(n=>e.match(n));s$9.set(e,r);}return s$9.get(e)},p$5=e=>{if(i$a(e))return c$6()};

	let i$9,s$8="";const u$7=new Map,r$8=m$7("Runtimes",[]),x$1=()=>{if(i$9===undefined){i$9=r$8.length;const e=e$4;r$8.push({...e,get scopingSuffix(){return c$6()},get registeredTags(){return $$1()},get scopingRules(){return m$6()},alias:s$8,description:`Runtime ${i$9} - ver ${e.version}${""}`});}},I$3=()=>i$9,b$2=(e,m)=>{const o=`${e},${m}`;if(u$7.has(o))return u$7.get(o);const t=r$8[e],n=r$8[m];if(!t||!n)throw new Error("Invalid runtime index supplied");if(t.isNext||n.isNext)return t.buildTime-n.buildTime;const c=t.major-n.major;if(c)return c;const a=t.minor-n.minor;if(a)return a;const f=t.patch-n.patch;if(f)return f;const l=new Intl.Collator(undefined,{numeric:true,sensitivity:"base"}).compare(t.suffix,n.suffix);return u$7.set(o,l),l},$$2=()=>r$8;

	const m$5 = m$7("Tags", new Map()), d$8 = new Set();
	let s$7 = new Map(), c$5;
	const g$2 = -1, h$6 = e => {
	  (d$8.add(e), m$5.set(e, I$3()));
	}, w$4 = e => d$8.has(e), $$1 = () => [...d$8.values()], y$4 = e => {
	  let n = m$5.get(e);
	  (n === undefined && (n = g$2), s$7.has(n) || s$7.set(n, new Set()), s$7.get(n).add(e), c$5 || (c$5 = setTimeout(() => {
	    (R$2(), s$7 = new Map(), c$5 = undefined);
	  }, 1000)));
	}, R$2 = () => {
	  const e = $$2(), n = I$3(), l = e[n];
	  let t = "Multiple UI5 Web Components instances detected.";
	  (e.length > 1 && (t = `${t}
Loading order (versions before 1.1.0 not listed): ${e.map(i => `
${i.description}`).join("")}`), [...s$7.keys()].forEach(i => {
	    let o, r;
	    i === g$2 ? (o = 1, r = {
	      description: "Older unknown runtime"
	    }) : (o = b$2(n, i), r = e[i]);
	    let a;
	    (o > 0 ? a = "an older" : o < 0 ? a = "a newer" : a = "the same", t = `${t}

"${l.description}" failed to define ${s$7.get(i).size} tag(s) as they were defined by a runtime of ${a} version "${r.description}": ${[...s$7.get(i)].sort().join(", ")}.`, o > 0 ? t = `${t}
WARNING! If your code uses features of the above web components, unavailable in ${r.description}, it might not work as expected!` : t = `${t}
Since the above web components were defined by the same or newer version runtime, they should be compatible with your code.`);
	  }), t = `${t}

To prevent other runtimes from defining tags that you use, consider using scoping or have third-party libraries use scoping: https://github.com/SAP/ui5-webcomponents/blob/main/docs/2-advanced/06-scoping.md.`, console.warn(t));
	};

	const t$9=new Set,n$7=e=>{t$9.add(e);},r$7=e=>t$9.has(e);

	const s$6=new Set,d$7=new i$d,n$6=new l$9;let t$8,a$9,m$4,i$8;const l$7=async e=>{n$6.add(e),await P$3();},c$4=e=>{d$7.fireEvent("beforeComponentRender",e),s$6.add(e),e._render();},h$5=e=>{n$6.remove(e),s$6.delete(e);},P$3=async()=>{i$8||(i$8=new Promise(e=>{window.requestAnimationFrame(()=>{n$6.process(c$4),i$8=null,e(),m$4||(m$4=setTimeout(()=>{m$4=undefined,n$6.isEmpty()&&U$1();},200));});})),await i$8;},y$3=()=>t$8||(t$8=new Promise(e=>{a$9=e,window.requestAnimationFrame(()=>{n$6.isEmpty()&&(t$8=undefined,e());});}),t$8),I$2=()=>{const e=$$1().map(r=>customElements.whenDefined(r));return Promise.all(e)},f$3=async()=>{await I$2(),await y$3();},U$1=()=>{n$6.isEmpty()&&a$9&&(a$9(),a$9=undefined,t$8=undefined);},C$1=async e=>{s$6.forEach(r=>{const o=r.constructor,u=o.getMetadata().getTag(),w=r$7(o),p=o.getMetadata().isLanguageAware(),E=o.getMetadata().isThemeAware();(!e||e.tag===u||e.rtlAware&&w||e.languageAware&&p||e.themeAware&&E)&&l$7(r);}),await f$3();};

	const g$1=typeof document>"u",i$7=(e,t)=>t?`${e}|${t}`:e,l$6=e=>e===undefined?true:b$2(I$3(),parseInt(e))===1,c$3=(e,t,r="",s)=>{const d=I$3(),n=new CSSStyleSheet;n.replaceSync(e),n._ui5StyleId=i$7(t,r),s&&(n._ui5RuntimeIndex=d,n._ui5Theme=s),document.adoptedStyleSheets=[...document.adoptedStyleSheets,n];},y$2=(e,t,r="",s)=>{const d=I$3(),n=document.adoptedStyleSheets.find(o=>o._ui5StyleId===i$7(t,r));if(n)if(!s)n.replaceSync(e||"");else {const o=n._ui5RuntimeIndex;(n._ui5Theme!==s||l$6(o))&&(n.replaceSync(e||""),n._ui5RuntimeIndex=String(d),n._ui5Theme=s);}},S$2=(e,t="")=>g$1?true:!!document.adoptedStyleSheets.find(r=>r._ui5StyleId===i$7(e,t)),f$2=(e,t="")=>{document.adoptedStyleSheets=document.adoptedStyleSheets.filter(r=>r._ui5StyleId!==i$7(e,t));},R$1=(e,t,r="",s)=>{S$2(t,r)?y$2(e,t,r,s):c$3(e,t,r,s);},m$3=(e,t)=>e===undefined?t:t===undefined?e:`${e} ${t}`;

	const t$7=new i$d,r$6="themeRegistered",n$5=e=>{t$7.attachEvent(r$6,e);},s$5=e=>t$7.fireEvent(r$6,e);

	const l$5=new Map,h$4=new Map,u$6=new Map,T$1=new Set,i$6=new Set,p$4=(e,r,t)=>{h$4.set(`${e}/${r}`,t),T$1.add(e),i$6.add(r),s$5(r);},m$2=async(e,r,t)=>{const g=`${e}_${r}_${t||""}`,s=l$5.get(g);if(s!==undefined)return s;if(!i$6.has(r)){const $=[...i$6.values()].join(", ");return console.warn(`You have requested a non-registered theme ${r} - falling back to ${e$6}. Registered themes are: ${$}`),a$8(e,e$6)}const[n,d]=await Promise.all([a$8(e,r),t?a$8(e,t,true):undefined]),o=m$3(n,d);return o&&l$5.set(g,o),o},a$8=async(e,r,t=false)=>{const s=(t?u$6:h$4).get(`${e}/${r}`);if(!s){t||console.error(`Theme [${r}] not registered for package [${e}]`);return}let n;try{n=await s(r);}catch(d){console.error(e,d.message);return}return n},w$3=()=>T$1,P$2=e=>i$6.has(e);

	const r$5=new Set,s$4=()=>{let e=document.querySelector(".sapThemeMetaData-Base-baseLib")||document.querySelector(".sapThemeMetaData-UI5-sap-ui-core");if(e)return getComputedStyle(e).backgroundImage;e=document.createElement("span"),e.style.display="none",e.classList.add("sapThemeMetaData-Base-baseLib"),document.body.appendChild(e);let t=getComputedStyle(e).backgroundImage;return t==="none"&&(e.classList.add("sapThemeMetaData-UI5-sap-ui-core"),t=getComputedStyle(e).backgroundImage),document.body.removeChild(e),t},o$5=e=>{const t=/\(["']?data:text\/plain;utf-8,(.*?)['"]?\)$/i.exec(e);if(t&&t.length>=2){let a=t[1];if(a=a.replace(/\\"/g,'"'),a.charAt(0)!=="{"&&a.charAt(a.length-1)!=="}")try{a=decodeURIComponent(a);}catch{r$5.has("decode")||(console.warn("Malformed theme metadata string, unable to decodeURIComponent"),r$5.add("decode"));return}try{return JSON.parse(a)}catch{r$5.has("parse")||(console.warn("Malformed theme metadata string, unable to parse JSON"),r$5.add("parse"));}}},d$6=e=>{let t,a;try{const n=e.Path.split(".");t=n.length===4?n[2]:getComputedStyle(document.body).getPropertyValue("--sapSapThemeId"),a=e.Extends[0];}catch{r$5.has("object")||(console.warn("Malformed theme metadata Object",e),r$5.add("object"));return}return {themeName:t,baseThemeName:a}},m$1=()=>{const e=s$4();if(!e||e==="none")return;const t=o$5(e);if(t)return d$6(t)};

	const t$6=new i$d,d$5="themeLoaded",r$4=e=>t$6.fireEvent(d$5,e);

	const d$4=(r,n)=>{const e=document.createElement("link");return e.type="text/css",e.rel="stylesheet",n&&Object.entries(n).forEach(t=>e.setAttribute(...t)),e.href=r,document.head.appendChild(e),new Promise(t=>{e.addEventListener("load",t),e.addEventListener("error",t);})};

	let t$5;i$c(()=>{t$5=undefined;});const n$4=()=>(t$5===undefined&&(t$5=S$3()),t$5),u$5=e=>`${n$4()}Base/baseLib/${e}/css_variables.css`,i$5=async e=>{const o=document.querySelector(`[sap-ui-webcomponents-theme="${e}"]`);o&&document.head.removeChild(o),await d$4(u$5(e),{"sap-ui-webcomponents-theme":e});};

	const s$3="@ui5/webcomponents-theming",S$1=()=>w$3().has(s$3),P$1=async e=>{if(!S$1())return;const t=await m$2(s$3,e);t&&R$1(t,"data-ui5-theme-properties",s$3,e);},E$1=()=>{f$2("data-ui5-theme-properties",s$3);},U=async(e,t)=>{const o=[...w$3()].map(async a=>{if(a===s$3)return;const i=await m$2(a,e,t);i&&R$1(i,`data-ui5-component-properties-${I$3()}`,a);});return Promise.all(o)},w$2=async e=>{const t=m$1();if(t)return t;const r=n$a("OpenUI5Support");if(r&&r.isOpenUI5Detected()){if(r.cssVariablesLoaded())return {themeName:r.getConfigurationSettingsObject()?.theme,baseThemeName:""}}else if(n$4())return await i$5(e),m$1()},I$1=async e=>{const t=await w$2(e);!t||e!==t.themeName?await P$1(e):E$1();const r=P$2(e)?e:t&&t.baseThemeName;await U(r||e$6,t&&t.themeName===e?e:undefined),r$4(e);};

	const d$3=()=>new Promise(e=>{document.body?e():document.addEventListener("DOMContentLoaded",()=>{e();});});

	var a$7 = `@font-face{font-family:"72";font-style:normal;font-weight:400;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Regular.woff2?ui5-webcomponents) format("woff2"),local("72");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:"72full";font-style:normal;font-weight:400;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Regular-full.woff2?ui5-webcomponents) format("woff2"),local('72-full')}@font-face{font-family:"72";font-style:normal;font-weight:700;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Bold.woff2?ui5-webcomponents) format("woff2"),local('72-Bold');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:"72full";font-style:normal;font-weight:700;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Bold-full.woff2?ui5-webcomponents) format("woff2")}@font-face{font-family:'72-Bold';font-style:normal;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Bold.woff2?ui5-webcomponents) format("woff2"),local('72-Bold');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:'72-Boldfull';font-style:normal;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Bold-full.woff2?ui5-webcomponents) format("woff2")}@font-face{font-family:'72-Light';font-style:normal;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Light.woff2?ui5-webcomponents) format("woff2"),local('72-Light');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:'72-Lightfull';font-style:normal;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Light-full.woff2?ui5-webcomponents) format("woff2")}@font-face{font-family:'72Mono';src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72Mono-Regular.woff2?ui5-webcomponents) format('woff2'),local('72Mono');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:'72Monofull';src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72Mono-Regular-full.woff2?ui5-webcomponents) format('woff2')}@font-face{font-family:'72Mono-Bold';src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72Mono-Bold.woff2?ui5-webcomponents) format('woff2'),local('72Mono-Bold');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:'72Mono-Boldfull';src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72Mono-Bold-full.woff2?ui5-webcomponents) format('woff2')}@font-face{font-family:"72Black";font-style:bold;font-weight:900;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Black.woff2?ui5-webcomponents) format("woff2"),local('72Black');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:'72Blackfull';src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Black-full.woff2?ui5-webcomponents) format('woff2')}@font-face{font-family:"72-SemiboldDuplex";src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-SemiboldDuplex.woff2?ui5-webcomponents) format("woff2"),local('72-SemiboldDuplex');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}`;

	var n$3 = "@font-face{font-family:'72override';unicode-range:U+0102-0103,U+01A0-01A1,U+01AF-01B0,U+1EA0-1EB7,U+1EB8-1EC7,U+1EC8-1ECB,U+1ECC-1EE3,U+1EE4-1EF1,U+1EF4-1EF7;src:local('Arial'),local('Helvetica'),local('sans-serif')}";

	let o$4;i$c(()=>{o$4=undefined;});const a$6=()=>(o$4===undefined&&(o$4=b$3()),o$4);

	const i$4=()=>{const t=n$a("OpenUI5Support");(!t||!t.isOpenUI5Detected())&&p$3(),c$2();},p$3=()=>{const t=document.querySelector("head>style[data-ui5-font-face]");!a$6()||t||S$2("data-ui5-font-face")||c$3(a$7,"data-ui5-font-face");},c$2=()=>{S$2("data-ui5-font-face-override")||c$3(n$3,"data-ui5-font-face-override");};

	var a$5 = ":root{--_ui5_content_density:cozy}.sapUiSizeCompact,.ui5-content-density-compact,[data-ui5-compact-size]{--_ui5_content_density:compact}";

	const e$3=()=>{S$2("data-ui5-system-css-vars")||c$3(a$5,"data-ui5-system-css-vars");};

	const t$4=typeof document>"u",e$2={get userAgent(){return t$4?"":navigator.userAgent},get touch(){return t$4?false:"ontouchstart"in window||navigator.maxTouchPoints>0},get chrome(){return t$4?false:/(Chrome|CriOS)/.test(e$2.userAgent)},get firefox(){return t$4?false:/Firefox/.test(e$2.userAgent)},get safari(){return t$4?false:!e$2.chrome&&/(Version|PhantomJS)\/(\d+\.\d+).*Safari/.test(e$2.userAgent)},get webkit(){return t$4?false:/webkit/.test(e$2.userAgent)},get windows(){return t$4?false:navigator.platform.indexOf("Win")!==-1},get macOS(){return t$4?false:!!navigator.userAgent.match(/Macintosh|Mac OS X/i)},get iOS(){return t$4?false:!!navigator.platform.match(/iPhone|iPad|iPod/)||!!(e$2.userAgent.match(/Mac/)&&"ontouchend"in document)},get android(){return t$4?false:!e$2.windows&&/Android/.test(e$2.userAgent)},get androidPhone(){return t$4?false:e$2.android&&/(?=android)(?=.*mobile)/i.test(e$2.userAgent)},get ipad(){return t$4?false:/ipad/i.test(e$2.userAgent)||/Macintosh/i.test(e$2.userAgent)&&"ontouchend"in document},_isPhone(){return u$4(),e$2.touch&&!r$3}};let o$3,i$3,r$3;const s$2=()=>{if(t$4||!e$2.windows)return  false;if(o$3===undefined){const n=e$2.userAgent.match(/Windows NT (\d+).(\d)/);o$3=n?parseFloat(n[1]):0;}return o$3>=8},c$1=()=>{if(t$4||!e$2.webkit)return  false;if(i$3===undefined){const n=e$2.userAgent.match(/(webkit)[ /]([\w.]+)/);i$3=n?parseFloat(n[1]):0;}return i$3>=537.1},u$4=()=>{if(t$4)return  false;if(r$3===undefined){if(e$2.ipad){r$3=true;return}if(e$2.touch){if(s$2()){r$3=true;return}if(e$2.chrome&&e$2.android){r$3=!/Mobile Safari\/[.0-9]+/.test(e$2.userAgent);return}let n=window.devicePixelRatio?window.devicePixelRatio:1;e$2.android&&c$1()&&(n=1),r$3=Math.min(window.screen.width/n,window.screen.height/n)>=600;return}r$3=e$2.userAgent.indexOf("Touch")!==-1||e$2.android&&!e$2.androidPhone;}},h$3=()=>e$2.safari,a$4=()=>(u$4(),(e$2.touch||s$2())&&r$3),d$2=()=>e$2._isPhone(),f$1=()=>t$4?false:!a$4()&&!d$2()||s$2(),w$1=()=>e$2.iOS;

	let t$3=false;const i$2=()=>{h$3()&&w$1()&&!t$3&&(document.body.addEventListener("touchstart",()=>{}),t$3=true);};

	let o$2=false,r$2;const p$2=new i$d,h$2=()=>o$2,l$4=async()=>{if(r$2!==undefined)return r$2;const e=async n=>{if(x$1(),typeof document>"u"){n();return}n$5(b$1);const t=n$a("OpenUI5Support"),f=t?t.isOpenUI5Detected():false,s=n$a("F6Navigation");t&&await t.init(),s&&!f&&s.init(),await d$3(),await I$1(r$1()),t&&t.attachListeners(),i$4(),e$3(),i$2(),n(),o$2=true,p$2.fireEvent("boot");};return r$2=new Promise(e),r$2},b$1=e=>{o$2&&e===r$1()&&I$1(r$1());};

	let t$2;i$c(()=>{t$2=undefined;});const r$1=()=>(t$2===undefined&&(t$2=T$2()),t$2),u$3=async e=>{t$2!==e&&(t$2=e,h$2()&&(await I$1(t$2),await C$1({themeAware:true})));},n$2=()=>{const e=r$1();return l$3(e)?!e.startsWith("sap_horizon"):!m$1()?.baseThemeName?.startsWith("sap_horizon")},l$3=e=>s$c.includes(e);

	/**
	 * @license
	 * Copyright 2017 Google LLC
	 * SPDX-License-Identifier: BSD-3-Clause
	 */
	var t$1;const i$1=window,s$1=i$1.trustedTypes,e$1=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):undefined,o$1="$lit$",n$1=`lit$${(Math.random()+"").slice(9)}$`,l$2="?"+n$1,h$1=`<${l$2}>`,r=document,u$2=()=>r.createComment(""),d$1=t=>null===t||"object"!=typeof t&&"function"!=typeof t,c=Array.isArray,v$1=t=>c(t)||"function"==typeof(null==t?undefined:t[Symbol.iterator]),a$3="[ \t\n\f\r]",f=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p$1=RegExp(`>|${a$3}(?:([^\\s"'>=/]+)(${a$3}*=${a$3}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y$1=/^(?:script|style|textarea|title)$/i,w=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x=w(1),b=w(2),T=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),E=new WeakMap,C=r.createTreeWalker(r,129,null,false);function P(t,i){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return undefined!==e$1?e$1.createHTML(i):i}const V=(t,i)=>{const s=t.length-1,e=[];let l,r=2===i?"<svg>":"",u=f;for(let i=0;i<s;i++){const s=t[i];let d,c,v=-1,a=0;for(;a<s.length&&(u.lastIndex=a,c=u.exec(s),null!==c);)a=u.lastIndex,u===f?"!--"===c[1]?u=_:undefined!==c[1]?u=m:undefined!==c[2]?(y$1.test(c[2])&&(l=RegExp("</"+c[2],"g")),u=p$1):undefined!==c[3]&&(u=p$1):u===p$1?">"===c[0]?(u=null!=l?l:f,v=-1):undefined===c[1]?v=-2:(v=u.lastIndex-c[2].length,d=c[1],u=undefined===c[3]?p$1:'"'===c[3]?$:g):u===$||u===g?u=p$1:u===_||u===m?u=f:(u=p$1,l=undefined);const w=u===p$1&&t[i+1].startsWith("/>")?" ":"";r+=u===f?s+h$1:v>=0?(e.push(d),s.slice(0,v)+o$1+s.slice(v)+n$1+w):s+n$1+(-2===v?(e.push(undefined),i):w);}return [P(t,r+(t[s]||"<?>")+(2===i?"</svg>":"")),e]};class N{constructor({strings:t,_$litType$:i},e){let h;this.parts=[];let r=0,d=0;const c=t.length-1,v=this.parts,[a,f]=V(t,i);if(this.el=N.createElement(a,e),C.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes);}for(;null!==(h=C.nextNode())&&v.length<c;){if(1===h.nodeType){if(h.hasAttributes()){const t=[];for(const i of h.getAttributeNames())if(i.endsWith(o$1)||i.startsWith(n$1)){const s=f[d++];if(t.push(i),undefined!==s){const t=h.getAttribute(s.toLowerCase()+o$1).split(n$1),i=/([.?@])?(.*)/.exec(s);v.push({type:1,index:r,name:i[2],strings:t,ctor:"."===i[1]?H:"?"===i[1]?L:"@"===i[1]?z:k});}else v.push({type:6,index:r});}for(const i of t)h.removeAttribute(i);}if(y$1.test(h.tagName)){const t=h.textContent.split(n$1),i=t.length-1;if(i>0){h.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)h.append(t[s],u$2()),C.nextNode(),v.push({type:2,index:++r});h.append(t[i],u$2());}}}else if(8===h.nodeType)if(h.data===l$2)v.push({type:2,index:r});else {let t=-1;for(;-1!==(t=h.data.indexOf(n$1,t+1));)v.push({type:7,index:r}),t+=n$1.length-1;}r++;}}static createElement(t,i){const s=r.createElement("template");return s.innerHTML=t,s}}function S(t,i,s=t,e){var o,n,l,h;if(i===T)return i;let r=undefined!==e?null===(o=s._$Co)||undefined===o?undefined:o[e]:s._$Cl;const u=d$1(i)?undefined:i._$litDirective$;return (null==r?undefined:r.constructor)!==u&&(null===(n=null==r?undefined:r._$AO)||undefined===n||n.call(r,false),undefined===u?r=undefined:(r=new u(t),r._$AT(t,s,e)),undefined!==e?(null!==(l=(h=s)._$Co)&&undefined!==l?l:h._$Co=[])[e]=r:s._$Cl=r),undefined!==r&&(i=S(t,r._$AS(t,i.values),r,e)),i}class M{constructor(t,i){this._$AV=[],this._$AN=undefined,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var i;const{el:{content:s},parts:e}=this._$AD,o=(null!==(i=null==t?undefined:t.creationScope)&&undefined!==i?i:r).importNode(s,true);C.currentNode=o;let n=C.nextNode(),l=0,h=0,u=e[0];for(;undefined!==u;){if(l===u.index){let i;2===u.type?i=new R(n,n.nextSibling,this,t):1===u.type?i=new u.ctor(n,u.name,u.strings,this,t):6===u.type&&(i=new Z(n,this,t)),this._$AV.push(i),u=e[++h];}l!==(null==u?undefined:u.index)&&(n=C.nextNode(),l++);}return C.currentNode=r,o}v(t){let i=0;for(const s of this._$AV) undefined!==s&&(undefined!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class R{constructor(t,i,s,e){var o;this.type=2,this._$AH=A,this._$AN=undefined,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cp=null===(o=null==e?undefined:e.isConnected)||undefined===o||o;}get _$AU(){var t,i;return null!==(i=null===(t=this._$AM)||undefined===t?undefined:t._$AU)&&undefined!==i?i:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return undefined!==i&&11===(null==t?undefined:t.nodeType)&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=S(this,t,i),d$1(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==T&&this._(t):undefined!==t._$litType$?this.g(t):undefined!==t.nodeType?this.$(t):v$1(t)?this.T(t):this._(t);}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t));}_(t){this._$AH!==A&&d$1(this._$AH)?this._$AA.nextSibling.data=t:this.$(r.createTextNode(t)),this._$AH=t;}g(t){var i;const{values:s,_$litType$:e}=t,o="number"==typeof e?this._$AC(t):(undefined===e.el&&(e.el=N.createElement(P(e.h,e.h[0]),this.options)),e);if((null===(i=this._$AH)||undefined===i?undefined:i._$AD)===o)this._$AH.v(s);else {const t=new M(o,this),i=t.u(this.options);t.v(s),this.$(i),this._$AH=t;}}_$AC(t){let i=E.get(t.strings);return undefined===i&&E.set(t.strings,i=new N(t)),i}T(t){c(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const o of t)e===i.length?i.push(s=new R(this.k(u$2()),this.k(u$2()),this,this.options)):s=i[e],s._$AI(o),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){var s;for(null===(s=this._$AP)||undefined===s||s.call(this,false,true,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){var i;undefined===this._$AM&&(this._$Cp=t,null===(i=this._$AP)||undefined===i||i.call(this,t));}}class k{constructor(t,i,s,e,o){this.type=1,this._$AH=A,this._$AN=undefined,this.element=t,this.name=i,this._$AM=e,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,i=this,s,e){const o=this.strings;let n=false;if(undefined===o)t=S(this,t,i,0),n=!d$1(t)||t!==this._$AH&&t!==T,n&&(this._$AH=t);else {const e=t;let l,h;for(t=o[0],l=0;l<o.length-1;l++)h=S(this,e[s+l],i,l),h===T&&(h=this._$AH[l]),n||(n=!d$1(h)||h!==this._$AH[l]),h===A?t=A:t!==A&&(t+=(null!=h?h:"")+o[l+1]),this._$AH[l]=h;}n&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"");}}class H extends k{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?undefined:t;}}const I=s$1?s$1.emptyScript:"";class L extends k{constructor(){super(...arguments),this.type=4;}j(t){t&&t!==A?this.element.setAttribute(this.name,I):this.element.removeAttribute(this.name);}}class z extends k{constructor(t,i,s,e,o){super(t,i,s,e,o),this.type=5;}_$AI(t,i=this){var s;if((t=null!==(s=S(this,t,i,0))&&undefined!==s?s:A)===T)return;const e=this._$AH,o=t===A&&e!==A||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==A&&(e===A||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){var i,s;"function"==typeof this._$AH?this._$AH.call(null!==(s=null===(i=this.options)||undefined===i?undefined:i.host)&&undefined!==s?s:this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=undefined,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t);}}const B=i$1.litHtmlPolyfillSupport;null==B||B(N,R),(null!==(t$1=i$1.litHtmlVersions)&&undefined!==t$1?t$1:i$1.litHtmlVersions=[]).push("2.8.0");

	/**
	 * @license
	 * Copyright 2020 Google LLC
	 * SPDX-License-Identifier: BSD-3-Clause
	 */const e=Symbol.for(""),l$1=t=>{if((null==t?undefined:t.r)===e)return null==t?undefined:t._$litStatic$},o=t=>({_$litStatic$:t,r:e}),s=new Map,a$2=t=>(r,...e)=>{const o=e.length;let i,a;const n=[],u=[];let c,$=0,f=false;for(;$<o;){for(c=r[$];$<o&&undefined!==(a=e[$],i=l$1(a));)c+=i+r[++$],f=true;$!==o&&u.push(a),n.push(c),$++;}if($===o&&n.push(r[o]),f){const t=n.join("$$lit$$");undefined===(r=s.get(t))&&(n.raw=n,s.set(t,r=n)),e=u;}return t(r,...e)},n=a$2(x),u$1=a$2(b);

	class t{static{this.html=n;}static{this.svg=u$1;}static{this.unsafeStatic=o;}}s$d("LitStatic",t);

	const p=t=>{const e=t.prototype.openEnd;t.prototype.openEnd=function(){return this._mAttributes.popover&&delete this._mAttributes.popover,e.apply(this)};};

	const a$1=e=>{e.setAttribute("popover","manual"),e.showPopover();},l=e=>{e.hasAttribute("popover")&&(e.hidePopover(),e.removeAttribute("popover"));},i=(e=document)=>e.querySelector(":popover-open")?true:Array.from(e.querySelectorAll("*")).some(o=>{const p=o.shadowRoot;return p&&i(p)}),u=e=>{const o=e.prototype.open;e.prototype.open=function(...t){o.apply(this,t);const n=i();if(["OPENING","OPEN"].includes(this.getOpenState())&&n){const c=this.getContent();if(c){const r=c instanceof HTMLElement?c:c?.getDomRef();r&&a$1(r);}}};},y=e=>{const o=e.prototype._closed;e.prototype._closed=function(...t){const n=this.getContent(),s=n instanceof HTMLElement?n:n?.getDomRef();o.apply(this,t),s&&l(s);};},v=e=>{const o=e.prototype.onFocusEvent;e.prototype.onFocusEvent=function(t){const n=t.type==="focus"||t.type==="activate",s=t.target;(!n||!s.closest("[ui5-popover],[ui5-responsive-popover],[ui5-dialog]"))&&o.call(this,t);};},d=()=>{const e=new CSSStyleSheet;e.replaceSync(".sapMPopup-CTX:popover-open { inset: unset; }"),document.adoptedStyleSheets=[...document.adoptedStyleSheets,e];},h=e=>{u(e),y(e),d(),v(e);};

	class a{static isAtLeastVersion116(){if(!window.sap.ui.version)return  true;const e=window.sap.ui.version.split(".");return !e||e.length<2?false:parseInt(e[0])>1||parseInt(e[1])>=116}static isOpenUI5Detected(){return typeof window.sap?.ui?.require=="function"}static init(){return a.isOpenUI5Detected()?new Promise(t=>{window.sap.ui.require(["sap/ui/core/Core"],async e=>{const i=()=>{let n=["sap/ui/core/Popup","sap/ui/core/Patcher","sap/ui/core/LocaleData"];a.isAtLeastVersion116()&&(n=[...n,"sap/base/i18n/Formatting","sap/base/i18n/Localization","sap/ui/core/ControlBehavior","sap/ui/core/Theming","sap/ui/core/date/CalendarUtils"]),window.sap.ui.require(n,(o,r)=>{p(r),h(o),t();});};a.isAtLeastVersion116()?(await e.ready(),i()):e.attachInit(i);});}):Promise.resolve()}static getConfigurationSettingsObject(){if(!a.isOpenUI5Detected())return {};if(a.isAtLeastVersion116()){const n=window.sap.ui.require("sap/ui/core/ControlBehavior"),o=window.sap.ui.require("sap/base/i18n/Localization"),r=window.sap.ui.require("sap/ui/core/Theming"),s=window.sap.ui.require("sap/base/i18n/Formatting"),c=window.sap.ui.require("sap/ui/core/date/CalendarUtils");return {animationMode:n.getAnimationMode(),language:o.getLanguage(),theme:r.getTheme(),themeRoot:r.getThemeRoot(),rtl:o.getRTL(),timezone:o.getTimezone(),calendarType:s.getCalendarType(),formatSettings:{firstDayOfWeek:c.getWeekConfigurationValues().firstDayOfWeek,legacyDateCalendarCustomizing:s.getCustomIslamicCalendarData?.()??s.getLegacyDateCalendarCustomizing?.()}}}const e=window.sap.ui.require("sap/ui/core/Core").getConfiguration(),i=window.sap.ui.require("sap/ui/core/LocaleData");return {animationMode:e.getAnimationMode(),language:e.getLanguage(),theme:e.getTheme(),themeRoot:e.getThemeRoot(),rtl:e.getRTL(),timezone:e.getTimezone(),calendarType:e.getCalendarType(),formatSettings:{firstDayOfWeek:i?i.getInstance(e.getLocale()).getFirstDayOfWeek():undefined,legacyDateCalendarCustomizing:e.getFormatSettings().getLegacyDateCalendarCustomizing()}}}static getLocaleDataObject(){if(!a.isOpenUI5Detected())return;const t=window.sap.ui.require("sap/ui/core/LocaleData");if(a.isAtLeastVersion116()){const n=window.sap.ui.require("sap/base/i18n/Localization");return t.getInstance(n.getLanguageTag())._get()}const i=window.sap.ui.require("sap/ui/core/Core").getConfiguration();return t.getInstance(i.getLocale())._get()}static _listenForThemeChange(){if(a.isAtLeastVersion116()){const t=window.sap.ui.require("sap/ui/core/Theming");t.attachApplied(()=>{u$3(t.getTheme());});}else {const t=window.sap.ui.require("sap/ui/core/Core"),e=t.getConfiguration();t.attachThemeChanged(()=>{u$3(e.getTheme());});}}static attachListeners(){a.isOpenUI5Detected()&&a._listenForThemeChange();}static cssVariablesLoaded(){if(!a.isOpenUI5Detected())return;const t=[...document.head.children].find(e=>e.id==="sap-ui-theme-sap.ui.core");return t?!!t.href.match(/\/css(-|_)variables\.css/):false}}s$d("OpenUI5Support",a);

	// this file contains all imports which are shared between the Monkey Patch files


	// Fixed with https://github.com/SAP/openui5/commit/a4b5fe00b49e0e26e5fd845607a2b95db870d55a in UI5 1.133.0

	WebComponent.prototype.__attachCustomEventsListeners = function() {
		// ##### MODIFICATION START #####
		var oEvents = this.getMetadata().getAllEvents();
		// ##### MODIFICATION END #####
		for (var sEventName in oEvents) {
			var sCustomEventName = hyphenate(sEventName);
			this.getDomRef().addEventListener(sCustomEventName, this.__handleCustomEventBound);
		}
	};

	WebComponent.prototype.__detachCustomEventsListeners = function() {
		var oDomRef = this.getDomRef();
		if (!oDomRef) {
			return;
		}

		// ##### MODIFICATION START #####
		var oEvents = this.getMetadata().getAllEvents();
		// ##### MODIFICATION END #####
		for (var sEventName in oEvents) {
			if (oEvents.hasOwnProperty(sEventName)) {
				var sCustomEventName = hyphenate(sEventName);
				oDomRef.removeEventListener(sCustomEventName, this.__handleCustomEventBound);
			}
		}
	};

	// Fixed with https://github.com/SAP/openui5/commit/111c4bcd1660f90714ed567fa8cb57fbc448591f in UI5 1.133.0

	WebComponent.prototype._mapValueState ??= function(sValueState) {
		console.warn("ValueState mapping is not implemented for Web Components yet. Please use UI5 version 1.133.0 or higher.");
		return sValueState;
	};
	u$8("mYsCoPeSuFfIx");

	const pkg = {
		"_ui5metadata": {
	  "name": "@ui5/webcomponents-base",
	  "version": "2.7.0",
	  "dependencies": [
	    "sap.ui.core"
	  ],
	  "types": [
	    "@ui5/webcomponents-base.AnimationMode",
	    "@ui5/webcomponents-base.CalendarType",
	    "@ui5/webcomponents-base.ItemNavigationBehavior",
	    "@ui5/webcomponents-base.MovePlacement",
	    "@ui5/webcomponents-base.NavigationMode",
	    "@ui5/webcomponents-base.ValueState"
	  ],
	  "interfaces": [],
	  "controls": [],
	  "elements": []
	}
	};

	pkg["AnimationMode"] = {
		"Full": "Full",
		"Basic": "Basic",
		"Minimal": "Minimal",
		"None": "None",
	};
	DataType.registerEnum("@ui5/webcomponents-base.AnimationMode", pkg["AnimationMode"]);

	pkg["CalendarType"] = {
		"Gregorian": "Gregorian",
		"Islamic": "Islamic",
		"Japanese": "Japanese",
		"Buddhist": "Buddhist",
		"Persian": "Persian",
	};
	DataType.registerEnum("@ui5/webcomponents-base.CalendarType", pkg["CalendarType"]);

	pkg["ItemNavigationBehavior"] = {
		"Static": "Static",
		"Cyclic": "Cyclic",
	};
	DataType.registerEnum("@ui5/webcomponents-base.ItemNavigationBehavior", pkg["ItemNavigationBehavior"]);

	pkg["MovePlacement"] = {
		"On": "On",
		"Before": "Before",
		"After": "After",
	};
	DataType.registerEnum("@ui5/webcomponents-base.MovePlacement", pkg["MovePlacement"]);

	pkg["NavigationMode"] = {
		"Auto": "Auto",
		"Vertical": "Vertical",
		"Horizontal": "Horizontal",
		"Paging": "Paging",
	};
	DataType.registerEnum("@ui5/webcomponents-base.NavigationMode", pkg["NavigationMode"]);

	pkg["ValueState"] = {
		"None": "None",
		"Positive": "Positive",
		"Critical": "Critical",
		"Negative": "Negative",
		"Information": "Information",
	};
	DataType.registerEnum("@ui5/webcomponents-base.ValueState", pkg["ValueState"]);

	exports.C = C$2;
	exports.C$1 = C$1;
	exports.D = D;
	exports.F = F;
	exports.L = L$1;
	exports.M = M$1;
	exports.U = U$2;
	exports.a = a$b;
	exports.c = c$4;
	exports.e = e$8;
	exports.f = f$1;
	exports.h = h$5;
	exports.h$1 = h$6;
	exports.h$2 = h$3;
	exports.i = i$c;
	exports.i$1 = i$d;
	exports.i$2 = i$a;
	exports.l = l$4;
	exports.l$1 = l$7;
	exports.m = m$7;
	exports.n = n$a;
	exports.n$1 = n$2;
	exports.n$2 = n$9;
	exports.n$3 = n$7;
	exports.p = p$5;
	exports.p$1 = p$4;
	exports.pkg = pkg;
	exports.r = r$1;
	exports.r$1 = r$9;
	exports.s = s$d;
	exports.u = u$b;
	exports.w = w$4;
	exports.y = y$4;

}));
