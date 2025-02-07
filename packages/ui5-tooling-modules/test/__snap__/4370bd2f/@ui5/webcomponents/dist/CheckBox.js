sap.ui.define(['ui5/ecosystem/demo/app/resources/@ui5/webcomponents', 'sap/ui/core/webc/WebComponent', 'sap/ui/core/EnabledPropagator', 'ui5/ecosystem/demo/app/resources/@ui5/webcomponents-base', 'sap/base/strings/hyphenate', 'sap/ui/base/DataType'], (function (_ui5_webcomponents, WebComponent, EnabledPropagator, _ui5_webcomponentsBase, hyphenate, DataType) { 'use strict';

  var c$j={},e$i=c$j.hasOwnProperty,a$g=c$j.toString,o$l=e$i.toString,l$j=o$l.call(Object),i$n=function(r){var t,n;return !r||a$g.call(r)!=="[object Object]"?false:(t=Object.getPrototypeOf(r),t?(n=e$i.call(t,"constructor")&&t.constructor,typeof n=="function"&&o$l.call(n)===l$j):true)};

  var c$i=Object.create(null),u$g=function(p,m,A,d){var n,t,e,a,o,i,r=arguments[2]||{},f=3,l=arguments.length,s=arguments[0]||false,y=arguments[1]?undefined:c$i;for(typeof r!="object"&&typeof r!="function"&&(r={});f<l;f++)if((o=arguments[f])!=null)for(a in o)n=r[a],e=o[a],!(a==="__proto__"||r===e)&&(s&&e&&(i$n(e)||(t=Array.isArray(e)))?(t?(t=false,i=n&&Array.isArray(n)?n:[]):i=n&&i$n(n)?n:{},r[a]=u$g(s,arguments[1],i,e)):e!==y&&(r[a]=e));return r};

  const e$h=function(n,t){return u$g(true,false,...arguments)};

  const e$g=new Map,s$r=(t,r)=>{e$g.set(t,r);},n$o=t=>e$g.get(t);

  const _$4={themes:{default:"sap_horizon",all:["sap_fiori_3","sap_fiori_3_dark","sap_fiori_3_hcb","sap_fiori_3_hcw","sap_horizon","sap_horizon_dark","sap_horizon_hcb","sap_horizon_hcw"]},languages:{default:"en"},locales:{default:"en",all:["ar","ar_EG","ar_SA","bg","ca","cnr","cs","da","de","de_AT","de_CH","el","el_CY","en","en_AU","en_GB","en_HK","en_IE","en_IN","en_NZ","en_PG","en_SG","en_ZA","es","es_AR","es_BO","es_CL","es_CO","es_MX","es_PE","es_UY","es_VE","et","fa","fi","fr","fr_BE","fr_CA","fr_CH","fr_LU","he","hi","hr","hu","id","it","it_CH","ja","kk","ko","lt","lv","ms","mk","nb","nl","nl_BE","pl","pt","pt_PT","ro","ru","ru_UA","sk","sl","sr","sr_Latn","sv","th","tr","uk","vi","zh_CN","zh_HK","zh_SG","zh_TW"]}},e$f=_$4.themes.default,s$q=_$4.themes.all,a$f=_$4.languages.default,r$k=_$4.locales.default,n$n=_$4.locales.all;

  const o$k=typeof document>"u",n$m={search(){return o$k?"":window.location.search}},s$p=()=>o$k?"":window.location.href,u$f=()=>n$m.search();

  const o$j=e=>{const t=document.querySelector(`META[name="${e}"]`);return t&&t.getAttribute("content")},s$o=e=>{const t=o$j("sap-allowedThemeOrigins");return t&&t.split(",").some(n=>n==="*"||e===n.trim())},a$e=(e,t)=>{const n=new URL(e).pathname;return new URL(n,t).toString()},g$9=e=>{let t;try{if(e.startsWith(".")||e.startsWith("/"))t=new URL(e,s$p()).toString();else {const n=new URL(e),r=n.origin;r&&s$o(r)?t=n.toString():t=a$e(n.toString(),s$p());}return t.endsWith("/")||(t=`${t}/`),`${t}UI5/`}catch{}};

  var u$e=(l=>(l.Full="full",l.Basic="basic",l.Minimal="minimal",l.None="none",l))(u$e||{});

  let i$m = class i{constructor(){this._eventRegistry=new Map;}attachEvent(t,r){const n=this._eventRegistry,e=n.get(t);if(!Array.isArray(e)){n.set(t,[r]);return}e.includes(r)||e.push(r);}detachEvent(t,r){const n=this._eventRegistry,e=n.get(t);if(!e)return;const s=e.indexOf(r);s!==-1&&e.splice(s,1),e.length===0&&n.delete(t);}fireEvent(t,r){const e=this._eventRegistry.get(t);return e?e.map(s=>s.call(this,r)):[]}fireEventAsync(t,r){return Promise.all(this.fireEvent(t,r))}isHandlerAttached(t,r){const e=this._eventRegistry.get(t);return e?e.includes(r):false}hasListeners(t){return !!this._eventRegistry.get(t)}};

  const e$e=new i$m,t$k="configurationReset",i$l=n=>{e$e.attachEvent(t$k,n);};

  let p$9=false,t$j={animationMode:u$e.Full,theme:e$f,themeRoot:undefined,rtl:undefined,language:undefined,timezone:undefined,calendarType:undefined,secondaryCalendarType:undefined,noConflict:false,formatSettings:{},fetchDefaultLanguage:false,defaultFontLoading:true,enableDefaultTooltips:true};const T$4=()=>(o$i(),t$j.theme),S$6=()=>(o$i(),t$j.themeRoot),L$2=()=>(o$i(),t$j.language),F$1=()=>(o$i(),t$j.fetchDefaultLanguage),U$2=()=>(o$i(),t$j.noConflict),b$6=()=>(o$i(),t$j.defaultFontLoading),M$3=()=>(o$i(),t$j.formatSettings),i$k=new Map;i$k.set("true",true),i$k.set("false",false);const z$2=()=>{const n=document.querySelector("[data-ui5-config]")||document.querySelector("[data-id='sap-ui-config']");let e;if(n){try{e=JSON.parse(n.innerHTML);}catch{console.warn("Incorrect data-sap-ui-config format. Please use JSON");}e&&(t$j=e$h(t$j,e));}},E$3=()=>{const n=new URLSearchParams(u$f());n.forEach((e,a)=>{const r=a.split("sap-").length;r===0||r===a.split("sap-ui-").length||u$d(a,e,"sap");}),n.forEach((e,a)=>{a.startsWith("sap-ui")&&u$d(a,e,"sap-ui");});},P$5=n=>{const e=n.split("@")[1];return g$9(e)},w$8=(n,e)=>n==="theme"&&e.includes("@")?e.split("@")[0]:e,u$d=(n,e,a)=>{const r=e.toLowerCase(),s=n.split(`${a}-`)[1];i$k.has(e)&&(e=i$k.get(r)),s==="theme"?(t$j.theme=w$8(s,e),e&&e.includes("@")&&(t$j.themeRoot=P$5(e))):t$j[s]=e;},j$1=()=>{const n=n$o("OpenUI5Support");if(!n||!n.isOpenUI5Detected())return;const e=n.getConfigurationSettingsObject();t$j=e$h(t$j,e);},o$i=()=>{typeof document>"u"||p$9||(g$8(),p$9=true);},g$8=n=>{z$2(),E$3(),j$1();};

  i$l(()=>{});

  var s$n=(i=>(i.Gregorian="Gregorian",i.Islamic="Islamic",i.Japanese="Japanese",i.Buddhist="Buddhist",i.Persian="Persian",i))(s$n||{});

  i$l(()=>{});

  let t$i;let a$d = class a{static getLegacyDateCalendarCustomizing(){return t$i===undefined&&(t$i=M$3()),t$i.legacyDateCalendarCustomizing||[]}};s$r("LegacyDateFormats",a$d);

  i$l(()=>{});const i$j=n$o("LegacyDateFormats");i$j?a$d.getLegacyDateCalendarCustomizing:()=>[];

  const t$h=new Map,c$h=n=>t$h.get(n);

  let l$i = class l{constructor(){this.list=[],this.lookup=new Set;}add(t){this.lookup.has(t)||(this.list.push(t),this.lookup.add(t));}remove(t){this.lookup.has(t)&&(this.list=this.list.filter(e=>e!==t),this.lookup.delete(t));}shift(){const t=this.list.shift();if(t)return this.lookup.delete(t),t}isEmpty(){return this.list.length===0}isAdded(t){return this.lookup.has(t)}process(t){let e;const s=new Map;for(e=this.shift();e;){const i=s.get(e)||0;if(i>10)throw new Error("Web component processed too many times this task, max allowed is: 10");t(e),s.set(e,i+1),e=this.shift();}}};

  const o$h=(t,n=document.body,r)=>{let e=document.querySelector(t);return e||(e=r?r():document.createElement(t),n.insertBefore(e,n.firstChild))};

  const u$c=()=>{const t=document.createElement("meta");return t.setAttribute("name","ui5-shared-resources"),t.setAttribute("content",""),t},l$h=()=>typeof document>"u"?null:o$h('meta[name="ui5-shared-resources"]',document.head,u$c),m$c=(t,o)=>{const r=t.split(".");let e=l$h();if(!e)return o;for(let n=0;n<r.length;n++){const s=r[n],c=n===r.length-1;Object.prototype.hasOwnProperty.call(e,s)||(e[s]=c?o:{}),e=e[s];}return e};

  const e$d={version:"2.7.0",major:2,minor:7,patch:0,suffix:"",isNext:false,buildTime:1738589223};

  let o$g,t$g={include:[/^ui5-/],exclude:[]};const s$m=new Map,c$g=()=>o$g,m$b=()=>t$g,i$i=e=>{if(!s$m.has(e)){const r=t$g.include.some(n=>e.match(n))&&!t$g.exclude.some(n=>e.match(n));s$m.set(e,r);}return s$m.get(e)},p$8=e=>{if(i$i(e))return c$g()};

  let i$h,s$l="";const u$b=new Map,r$j=m$c("Runtimes",[]),x$2=()=>{if(i$h===undefined){i$h=r$j.length;const e=e$d;r$j.push({...e,get scopingSuffix(){return c$g()},get registeredTags(){return $$2()},get scopingRules(){return m$b()},alias:s$l,description:`Runtime ${i$h} - ver ${e.version}${""}`});}},I$6=()=>i$h,b$5=(e,m)=>{const o=`${e},${m}`;if(u$b.has(o))return u$b.get(o);const t=r$j[e],n=r$j[m];if(!t||!n)throw new Error("Invalid runtime index supplied");if(t.isNext||n.isNext)return t.buildTime-n.buildTime;const c=t.major-n.major;if(c)return c;const a=t.minor-n.minor;if(a)return a;const f=t.patch-n.patch;if(f)return f;const l=new Intl.Collator(undefined,{numeric:true,sensitivity:"base"}).compare(t.suffix,n.suffix);return u$b.set(o,l),l},$$3=()=>r$j;

  const m$a=m$c("Tags",new Map),d$d=new Set;let s$k=new Map,c$f;const g$7=-1,h$6=e=>{d$d.add(e),m$a.set(e,I$6());},w$7=e=>d$d.has(e),$$2=()=>[...d$d.values()],y$7=e=>{let n=m$a.get(e);n===undefined&&(n=g$7),s$k.has(n)||s$k.set(n,new Set),s$k.get(n).add(e),c$f||(c$f=setTimeout(()=>{R$3(),s$k=new Map,c$f=undefined;},1e3));},R$3=()=>{const e=$$3(),n=I$6(),l=e[n];let t="Multiple UI5 Web Components instances detected.";e.length>1&&(t=`${t}
Loading order (versions before 1.1.0 not listed): ${e.map(i=>`
${i.description}`).join("")}`),[...s$k.keys()].forEach(i=>{let o,r;i===g$7?(o=1,r={description:"Older unknown runtime"}):(o=b$5(n,i),r=e[i]);let a;o>0?a="an older":o<0?a="a newer":a="the same",t=`${t}

"${l.description}" failed to define ${s$k.get(i).size} tag(s) as they were defined by a runtime of ${a} version "${r.description}": ${[...s$k.get(i)].sort().join(", ")}.`,o>0?t=`${t}
WARNING! If your code uses features of the above web components, unavailable in ${r.description}, it might not work as expected!`:t=`${t}
Since the above web components were defined by the same or newer version runtime, they should be compatible with your code.`;}),t=`${t}

To prevent other runtimes from defining tags that you use, consider using scoping or have third-party libraries use scoping: https://github.com/SAP/ui5-webcomponents/blob/main/docs/2-advanced/06-scoping.md.`,console.warn(t);};

  const t$f=new Set,n$l=e=>{t$f.add(e);},r$i=e=>t$f.has(e);

  const s$j=new Set,d$c=new i$m,n$k=new l$i;let t$e,a$c,m$9,i$g;const l$g=async e=>{n$k.add(e),await P$4();},c$e=e=>{d$c.fireEvent("beforeComponentRender",e),s$j.add(e),e._render();},h$5=e=>{n$k.remove(e),s$j.delete(e);},P$4=async()=>{i$g||(i$g=new Promise(e=>{window.requestAnimationFrame(()=>{n$k.process(c$e),i$g=null,e(),m$9||(m$9=setTimeout(()=>{m$9=undefined,n$k.isEmpty()&&U$1();},200));});})),await i$g;},y$6=()=>t$e||(t$e=new Promise(e=>{a$c=e,window.requestAnimationFrame(()=>{n$k.isEmpty()&&(t$e=undefined,e());});}),t$e),I$5=()=>{const e=$$2().map(r=>customElements.whenDefined(r));return Promise.all(e)},f$a=async()=>{await I$5(),await y$6();},U$1=()=>{n$k.isEmpty()&&a$c&&(a$c(),a$c=undefined,t$e=undefined);},C$4=async e=>{s$j.forEach(r=>{const o=r.constructor,u=o.getMetadata().getTag(),w=r$i(o),p=o.getMetadata().isLanguageAware(),E=o.getMetadata().isThemeAware();(!e||e.tag===u||e.rtlAware&&w||e.languageAware&&p||e.themeAware&&E)&&l$g(r);}),await f$a();};

  const g$6=typeof document>"u",i$f=(e,t)=>t?`${e}|${t}`:e,l$f=e=>e===undefined?true:b$5(I$6(),parseInt(e))===1,c$d=(e,t,r="",s)=>{const d=I$6(),n=new CSSStyleSheet;n.replaceSync(e),n._ui5StyleId=i$f(t,r),s&&(n._ui5RuntimeIndex=d,n._ui5Theme=s),document.adoptedStyleSheets=[...document.adoptedStyleSheets,n];},y$5=(e,t,r="",s)=>{const d=I$6(),n=document.adoptedStyleSheets.find(o=>o._ui5StyleId===i$f(t,r));if(n)if(!s)n.replaceSync(e||"");else {const o=n._ui5RuntimeIndex;(n._ui5Theme!==s||l$f(o))&&(n.replaceSync(e||""),n._ui5RuntimeIndex=String(d),n._ui5Theme=s);}},S$5=(e,t="")=>g$6?true:!!document.adoptedStyleSheets.find(r=>r._ui5StyleId===i$f(e,t)),f$9=(e,t="")=>{document.adoptedStyleSheets=document.adoptedStyleSheets.filter(r=>r._ui5StyleId!==i$f(e,t));},R$2=(e,t,r="",s)=>{S$5(t,r)?y$5(e,t,r,s):c$d(e,t,r,s);},m$8=(e,t)=>e===undefined?t:t===undefined?e:`${e} ${t}`;

  const t$d=new i$m,r$h="themeRegistered",n$j=e=>{t$d.attachEvent(r$h,e);},s$i=e=>t$d.fireEvent(r$h,e);

  const l$e=new Map,h$4=new Map,u$a=new Map,T$3=new Set,i$e=new Set,p$7=(e,r,t)=>{h$4.set(`${e}/${r}`,t),T$3.add(e),i$e.add(r),s$i(r);},m$7=async(e,r,t)=>{const g=`${e}_${r}_${t||""}`,s=l$e.get(g);if(s!==undefined)return s;if(!i$e.has(r)){const $=[...i$e.values()].join(", ");return console.warn(`You have requested a non-registered theme ${r} - falling back to ${e$f}. Registered themes are: ${$}`),a$b(e,e$f)}const[n,d]=await Promise.all([a$b(e,r),t?a$b(e,t,true):undefined]),o=m$8(n,d);return o&&l$e.set(g,o),o},a$b=async(e,r,t=false)=>{const s=(t?u$a:h$4).get(`${e}/${r}`);if(!s){t||console.error(`Theme [${r}] not registered for package [${e}]`);return}let n;try{n=await s(r);}catch(d){console.error(e,d.message);return}return n},w$6=()=>T$3,P$3=e=>i$e.has(e);

  const r$g=new Set,s$h=()=>{let e=document.querySelector(".sapThemeMetaData-Base-baseLib")||document.querySelector(".sapThemeMetaData-UI5-sap-ui-core");if(e)return getComputedStyle(e).backgroundImage;e=document.createElement("span"),e.style.display="none",e.classList.add("sapThemeMetaData-Base-baseLib"),document.body.appendChild(e);let t=getComputedStyle(e).backgroundImage;return t==="none"&&(e.classList.add("sapThemeMetaData-UI5-sap-ui-core"),t=getComputedStyle(e).backgroundImage),document.body.removeChild(e),t},o$f=e=>{const t=/\(["']?data:text\/plain;utf-8,(.*?)['"]?\)$/i.exec(e);if(t&&t.length>=2){let a=t[1];if(a=a.replace(/\\"/g,'"'),a.charAt(0)!=="{"&&a.charAt(a.length-1)!=="}")try{a=decodeURIComponent(a);}catch{r$g.has("decode")||(console.warn("Malformed theme metadata string, unable to decodeURIComponent"),r$g.add("decode"));return}try{return JSON.parse(a)}catch{r$g.has("parse")||(console.warn("Malformed theme metadata string, unable to parse JSON"),r$g.add("parse"));}}},d$b=e=>{let t,a;try{const n=e.Path.split(".");t=n.length===4?n[2]:getComputedStyle(document.body).getPropertyValue("--sapSapThemeId"),a=e.Extends[0];}catch{r$g.has("object")||(console.warn("Malformed theme metadata Object",e),r$g.add("object"));return}return {themeName:t,baseThemeName:a}},m$6=()=>{const e=s$h();if(!e||e==="none")return;const t=o$f(e);if(t)return d$b(t)};

  const t$c=new i$m,d$a="themeLoaded",r$f=e=>t$c.fireEvent(d$a,e);

  const d$9=(r,n)=>{const e=document.createElement("link");return e.type="text/css",e.rel="stylesheet",n&&Object.entries(n).forEach(t=>e.setAttribute(...t)),e.href=r,document.head.appendChild(e),new Promise(t=>{e.addEventListener("load",t),e.addEventListener("error",t);})};

  let t$b;i$l(()=>{t$b=undefined;});const n$i=()=>(t$b===undefined&&(t$b=S$6()),t$b),u$9=e=>`${n$i()}Base/baseLib/${e}/css_variables.css`,i$d=async e=>{const o=document.querySelector(`[sap-ui-webcomponents-theme="${e}"]`);o&&document.head.removeChild(o),await d$9(u$9(e),{"sap-ui-webcomponents-theme":e});};

  const s$g="@ui5/webcomponents-theming",S$4=()=>w$6().has(s$g),P$2=async e=>{if(!S$4())return;const t=await m$7(s$g,e);t&&R$2(t,"data-ui5-theme-properties",s$g,e);},E$2=()=>{f$9("data-ui5-theme-properties",s$g);},U=async(e,t)=>{const o=[...w$6()].map(async a=>{if(a===s$g)return;const i=await m$7(a,e,t);i&&R$2(i,`data-ui5-component-properties-${I$6()}`,a);});return Promise.all(o)},w$5=async e=>{const t=m$6();if(t)return t;const r=n$o("OpenUI5Support");if(r&&r.isOpenUI5Detected()){if(r.cssVariablesLoaded())return {themeName:r.getConfigurationSettingsObject()?.theme,baseThemeName:""}}else if(n$i())return await i$d(e),m$6()},I$4=async e=>{const t=await w$5(e);!t||e!==t.themeName?await P$2(e):E$2();const r=P$3(e)?e:t&&t.baseThemeName;await U(r||e$f,t&&t.themeName===e?e:undefined),r$f(e);};

  const d$8=()=>new Promise(e=>{document.body?e():document.addEventListener("DOMContentLoaded",()=>{e();});});

  var a$a = `@font-face{font-family:"72";font-style:normal;font-weight:400;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Regular.woff2?ui5-webcomponents) format("woff2"),local("72");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:"72full";font-style:normal;font-weight:400;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Regular-full.woff2?ui5-webcomponents) format("woff2"),local('72-full')}@font-face{font-family:"72";font-style:normal;font-weight:700;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Bold.woff2?ui5-webcomponents) format("woff2"),local('72-Bold');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:"72full";font-style:normal;font-weight:700;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Bold-full.woff2?ui5-webcomponents) format("woff2")}@font-face{font-family:'72-Bold';font-style:normal;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Bold.woff2?ui5-webcomponents) format("woff2"),local('72-Bold');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:'72-Boldfull';font-style:normal;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Bold-full.woff2?ui5-webcomponents) format("woff2")}@font-face{font-family:'72-Light';font-style:normal;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Light.woff2?ui5-webcomponents) format("woff2"),local('72-Light');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:'72-Lightfull';font-style:normal;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Light-full.woff2?ui5-webcomponents) format("woff2")}@font-face{font-family:'72Mono';src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72Mono-Regular.woff2?ui5-webcomponents) format('woff2'),local('72Mono');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:'72Monofull';src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72Mono-Regular-full.woff2?ui5-webcomponents) format('woff2')}@font-face{font-family:'72Mono-Bold';src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72Mono-Bold.woff2?ui5-webcomponents) format('woff2'),local('72Mono-Bold');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:'72Mono-Boldfull';src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72Mono-Bold-full.woff2?ui5-webcomponents) format('woff2')}@font-face{font-family:"72Black";font-style:bold;font-weight:900;src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Black.woff2?ui5-webcomponents) format("woff2"),local('72Black');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}@font-face{font-family:'72Blackfull';src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-Black-full.woff2?ui5-webcomponents) format('woff2')}@font-face{font-family:"72-SemiboldDuplex";src:url(https://sdk.openui5.org/resources/sap/ui/core/themes/sap_horizon/fonts/72-SemiboldDuplex.woff2?ui5-webcomponents) format("woff2"),local('72-SemiboldDuplex');unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}`;

  var n$h = "@font-face{font-family:'72override';unicode-range:U+0102-0103,U+01A0-01A1,U+01AF-01B0,U+1EA0-1EB7,U+1EB8-1EC7,U+1EC8-1ECB,U+1ECC-1EE3,U+1EE4-1EF1,U+1EF4-1EF7;src:local('Arial'),local('Helvetica'),local('sans-serif')}";

  let o$e;i$l(()=>{o$e=undefined;});const a$9=()=>(o$e===undefined&&(o$e=b$6()),o$e);

  const i$c=()=>{const t=n$o("OpenUI5Support");(!t||!t.isOpenUI5Detected())&&p$6(),c$c();},p$6=()=>{const t=document.querySelector("head>style[data-ui5-font-face]");!a$9()||t||S$5("data-ui5-font-face")||c$d(a$a,"data-ui5-font-face");},c$c=()=>{S$5("data-ui5-font-face-override")||c$d(n$h,"data-ui5-font-face-override");};

  var a$8 = ":root{--_ui5_content_density:cozy}.sapUiSizeCompact,.ui5-content-density-compact,[data-ui5-compact-size]{--_ui5_content_density:compact}";

  const e$c=()=>{S$5("data-ui5-system-css-vars")||c$d(a$8,"data-ui5-system-css-vars");};

  const t$a=typeof document>"u",e$b={get userAgent(){return t$a?"":navigator.userAgent},get touch(){return t$a?false:"ontouchstart"in window||navigator.maxTouchPoints>0},get chrome(){return t$a?false:/(Chrome|CriOS)/.test(e$b.userAgent)},get firefox(){return t$a?false:/Firefox/.test(e$b.userAgent)},get safari(){return t$a?false:!e$b.chrome&&/(Version|PhantomJS)\/(\d+\.\d+).*Safari/.test(e$b.userAgent)},get webkit(){return t$a?false:/webkit/.test(e$b.userAgent)},get windows(){return t$a?false:navigator.platform.indexOf("Win")!==-1},get macOS(){return t$a?false:!!navigator.userAgent.match(/Macintosh|Mac OS X/i)},get iOS(){return t$a?false:!!navigator.platform.match(/iPhone|iPad|iPod/)||!!(e$b.userAgent.match(/Mac/)&&"ontouchend"in document)},get android(){return t$a?false:!e$b.windows&&/Android/.test(e$b.userAgent)},get androidPhone(){return t$a?false:e$b.android&&/(?=android)(?=.*mobile)/i.test(e$b.userAgent)},get ipad(){return t$a?false:/ipad/i.test(e$b.userAgent)||/Macintosh/i.test(e$b.userAgent)&&"ontouchend"in document},_isPhone(){return u$8(),e$b.touch&&!r$e}};let o$d,i$b,r$e;const s$f=()=>{if(t$a||!e$b.windows)return  false;if(o$d===undefined){const n=e$b.userAgent.match(/Windows NT (\d+).(\d)/);o$d=n?parseFloat(n[1]):0;}return o$d>=8},c$b=()=>{if(t$a||!e$b.webkit)return  false;if(i$b===undefined){const n=e$b.userAgent.match(/(webkit)[ /]([\w.]+)/);i$b=n?parseFloat(n[1]):0;}return i$b>=537.1},u$8=()=>{if(t$a)return  false;if(r$e===undefined){if(e$b.ipad){r$e=true;return}if(e$b.touch){if(s$f()){r$e=true;return}if(e$b.chrome&&e$b.android){r$e=!/Mobile Safari\/[.0-9]+/.test(e$b.userAgent);return}let n=window.devicePixelRatio?window.devicePixelRatio:1;e$b.android&&c$b()&&(n=1),r$e=Math.min(window.screen.width/n,window.screen.height/n)>=600;return}r$e=e$b.userAgent.indexOf("Touch")!==-1||e$b.android&&!e$b.androidPhone;}},h$3=()=>e$b.safari,a$7=()=>(u$8(),(e$b.touch||s$f())&&r$e),d$7=()=>e$b._isPhone(),f$8=()=>t$a?false:!a$7()&&!d$7()||s$f(),w$4=()=>e$b.iOS;

  let t$9=false;const i$a=()=>{h$3()&&w$4()&&!t$9&&(document.body.addEventListener("touchstart",()=>{}),t$9=true);};

  let o$c=false,r$d;const p$5=new i$m,l$d=async()=>{if(r$d!==undefined)return r$d;const e=async n=>{if(x$2(),typeof document>"u"){n();return}n$j(b$4);const t=n$o("OpenUI5Support"),f=t?t.isOpenUI5Detected():false,s=n$o("F6Navigation");t&&await t.init(),s&&!f&&s.init(),await d$8(),await I$4(r$c()),t&&t.attachListeners(),i$c(),e$c(),i$a(),n(),o$c=true,p$5.fireEvent("boot");};return r$d=new Promise(e),r$d},b$4=e=>{o$c&&e===r$c()&&I$4(r$c());};

  let t$8;i$l(()=>{t$8=undefined;});const r$c=()=>(t$8===undefined&&(t$8=T$4()),t$8),n$g=()=>{const e=r$c();return l$c(e)?!e.startsWith("sap_horizon"):!m$6()?.baseThemeName?.startsWith("sap_horizon")},l$c=e=>s$q.includes(e);

  var t$7=(o=>(o.SAPIconsV4="SAP-icons-v4",o.SAPIconsV5="SAP-icons-v5",o.SAPIconsTNTV2="tnt-v2",o.SAPIconsTNTV3="tnt-v3",o.SAPBSIconsV1="business-suite-v1",o.SAPBSIconsV2="business-suite-v2",o))(t$7||{});const s$e=new Map;s$e.set("SAP-icons",{legacy:"SAP-icons-v4",sap_horizon:"SAP-icons-v5"}),s$e.set("tnt",{legacy:"tnt-v2",sap_horizon:"tnt-v3"}),s$e.set("business-suite",{legacy:"business-suite-v1",sap_horizon:"business-suite-v2"});const c$a=(n,e)=>{if(s$e.has(n)){s$e.set(n,{...e,...s$e.get(n)});return}s$e.set(n,e);},r$b=n=>{const e=n$g()?"legacy":"sap_horizon";return s$e.has(n)?s$e.get(n)[e]:n};

  var t$6=(s=>(s["SAP-icons"]="SAP-icons-v4",s.horizon="SAP-icons-v5",s["SAP-icons-TNT"]="tnt",s.BusinessSuiteInAppSymbols="business-suite",s))(t$6||{});const n$f=e=>t$6[e]?t$6[e]:e;

  const i$9=o=>{const t=c$h(r$c());return !o&&t?n$f(t):o?r$b(o):r$b("SAP-icons")};

  const e$a=new i$m,n$e="languageChange",t$5=a=>{e$a.attachEvent(n$e,a);};

  let e$9,n$d;i$l(()=>{e$9=undefined,n$d=undefined;});const d$6=()=>(e$9===undefined&&(e$9=L$2()),e$9),c$9=()=>(n$d===undefined&&(n$d=F$1()),n$d);

  const c$8=["value-changed","click"];let e$8;i$l(()=>{e$8=undefined;});const s$d=t=>c$8.includes(t),l$b=t=>{const n=o$b();return !(typeof n!="boolean"&&n.events&&n.events.includes&&n.events.includes(t))},o$b=()=>(e$8===undefined&&(e$8=U$2()),e$8),a$6=t=>{const n=o$b();return s$d(t)?false:n===true?true:!l$b(t)};

  const m$5=(a={})=>e=>{if(Object.prototype.hasOwnProperty.call(e,"metadata")||(e.metadata={}),typeof a=="string"){e.metadata.tag=a;return}const{tag:i,languageAware:o,themeAware:r,cldr:s,fastNavigation:l,formAssociated:n,shadowRootOptions:d}=a;e.metadata.tag=i,o&&(e.metadata.languageAware=o),s&&(e.metadata.cldr=s),r&&(e.metadata.themeAware=r),l&&(e.metadata.fastNavigation=l),n&&(e.metadata.formAssociated=n),d&&(e.metadata.shadowRootOptions=d),["renderer","template","styles","dependencies"].forEach(t=>{a[t]&&Object.defineProperty(e,t,{get:()=>a[t]});});};

  const s$c=o=>(p,r)=>{const t=p.constructor;Object.prototype.hasOwnProperty.call(t,"metadata")||(t.metadata={});const e=t.metadata;e.properties||(e.properties={});const a=e.properties;a[r]||(a[r]=o??{});};

  const y$4={ENTER:13,SPACE:32},b$3=o=>(o.key?o.key==="Enter":o.keyCode===y$4.ENTER)&&!a$5(o),i$8=o=>(o.key?o.key==="Spacebar"||o.key===" ":o.keyCode===y$4.SPACE)&&!a$5(o),a$5=o=>o.shiftKey||o.altKey||k$2(o),k$2=o=>!!(o.metaKey||o.ctrlKey);

  var r$a=(l=>(l.Auto="Auto",l.Vertical="Vertical",l.Horizontal="Horizontal",l.Paging="Paging",l))(r$a||{});

  var l$a=(c=>(c.Static="Static",c.Cyclic="Cyclic",c))(l$a||{});

  const s$b=new Map,o$a=new Map,n$c=new Map,c$7=e=>{if(!s$b.has(e)){const a=b$2(e.split("-"));s$b.set(e,a);}return s$b.get(e)},l$9=e=>{if(!o$a.has(e)){const a=e.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();o$a.set(e,a);}return o$a.get(e)},p$4=e=>l$9(e),b$2=e=>e.map((a,t)=>t===0?a.toLowerCase():a.charAt(0).toUpperCase()+a.slice(1).toLowerCase()).join(""),C$3=e=>{const a=n$c.get(e);if(a)return a;const t=c$7(e),r=t.charAt(0).toUpperCase()+t.slice(1);return n$c.set(e,r),r};

  const o$9=t=>{if(!(t instanceof HTMLElement))return "default";const e=t.getAttribute("slot");if(e){const r=e.match(/^(.+?)-\d+$/);return r?r[1]:e}return "default"},n$b=t=>t instanceof HTMLSlotElement?t.assignedNodes({flatten:true}).filter(e=>e instanceof HTMLElement):[t],s$a=t=>t.reduce((e,r)=>e.concat(n$b(r)),[]);

  let p$3 = class p{constructor(t){this.metadata=t;}getInitialState(){if(Object.prototype.hasOwnProperty.call(this,"_initialState"))return this._initialState;const t={};if(this.slotsAreManaged()){const o=this.getSlots();for(const[e,s]of Object.entries(o)){const n=s.propertyName||e;t[n]=[],t[c$7(n)]=t[n];}}return this._initialState=t,t}static validateSlotValue(t,a){return g$5(t,a)}getPureTag(){return this.metadata.tag||""}getTag(){const t=this.metadata.tag;if(!t)return "";const a=p$8(t);return a?`${t}-${a}`:t}hasAttribute(t){const a=this.getProperties()[t];return a.type!==Object&&a.type!==Array&&!a.noAttribute}getPropertiesList(){return Object.keys(this.getProperties())}getAttributesList(){return this.getPropertiesList().filter(this.hasAttribute.bind(this)).map(l$9)}canSlotText(){return this.getSlots().default?.type===Node}hasSlots(){return !!Object.entries(this.getSlots()).length}hasIndividualSlots(){return this.slotsAreManaged()&&Object.values(this.getSlots()).some(t=>t.individualSlots)}slotsAreManaged(){return !!this.metadata.managedSlots}supportsF6FastNavigation(){return !!this.metadata.fastNavigation}getProperties(){return this.metadata.properties||(this.metadata.properties={}),this.metadata.properties}getEvents(){return this.metadata.events||(this.metadata.events={}),this.metadata.events}getSlots(){return this.metadata.slots||(this.metadata.slots={}),this.metadata.slots}isLanguageAware(){return !!this.metadata.languageAware}isThemeAware(){return !!this.metadata.themeAware}needsCLDR(){return !!this.metadata.cldr}getShadowRootOptions(){return this.metadata.shadowRootOptions||{}}isFormAssociated(){return !!this.metadata.formAssociated}shouldInvalidateOnChildChange(t,a,o){const e=this.getSlots()[t].invalidateOnChildChange;if(e===undefined)return  false;if(typeof e=="boolean")return e;if(typeof e=="object"){if(a==="property"){if(e.properties===undefined)return  false;if(typeof e.properties=="boolean")return e.properties;if(Array.isArray(e.properties))return e.properties.includes(o);throw new Error("Wrong format for invalidateOnChildChange.properties: boolean or array is expected")}if(a==="slot"){if(e.slots===undefined)return  false;if(typeof e.slots=="boolean")return e.slots;if(Array.isArray(e.slots))return e.slots.includes(o);throw new Error("Wrong format for invalidateOnChildChange.slots: boolean or array is expected")}}throw new Error("Wrong format for invalidateOnChildChange: boolean or object is expected")}getI18n(){return this.metadata.i18n||(this.metadata.i18n={}),this.metadata.i18n}};const g$5=(r,t)=>(r&&n$b(r).forEach(a=>{if(!(a instanceof t.type))throw new Error(`The element is not of type ${t.type.toString()}`)}),r);

  const r$9=()=>m$c("CustomStyle.eventProvider",new i$m),n$a="CustomCSSChange",i$7=t=>{r$9().attachEvent(n$a,t);},c$6=()=>m$c("CustomStyle.customCSSFor",{});i$7(t=>{C$4({tag:t});});const l$8=t=>{const e=c$6();return e[t]?e[t].join(""):""};

  const e$7=t=>Array.isArray(t)?t.filter(r=>!!r).flat(10).join(" "):t;

  const e$6=new Map;i$7(t=>{e$6.delete(`${t}_normal`);});const y$3=t=>{const o=t.getMetadata().getTag(),n=`${o}_normal`,s=n$o("OpenUI5Enablement");if(!e$6.has(n)){let l="";s&&(l=e$7(s.getBusyIndicatorStyles()));const a=l$8(o)||"",m=`${e$7(t.styles)} ${a} ${l}`;e$6.set(n,m);}return e$6.get(n)};

  const e$5=new Map;i$7(t=>{e$5.delete(`${t}_normal`);});const s$9=t=>{const n=`${t.getMetadata().getTag()}_normal`;if(!e$5.has(n)){const a=y$3(t),o=new CSSStyleSheet;o.replaceSync(a),e$5.set(n,[o]);}return e$5.get(n)};

  const s$8=o=>{const e=o.constructor,t=o.shadowRoot;if(!t){console.warn("There is no shadow root to update");return}t.adoptedStyleSheets=s$9(e),e.renderer(o,t);};

  const r$8=[],o$8=t=>r$8.some(s=>t.startsWith(s));

  const t$4=new WeakMap,n$9=(e,o,r)=>{const s=new MutationObserver(o);t$4.set(e,s),s.observe(e,r);},b$1=e=>{const o=t$4.get(e);o&&(o.disconnect(),t$4.delete(e));};

  const r$7=t=>t.matches(":dir(rtl)")?"rtl":"ltr";

  const s$7=["disabled","title","hidden","role","draggable"],r$6=e=>s$7.includes(e)||e.startsWith("aria")?true:![HTMLElement,Element,Node].some(t=>t.prototype.hasOwnProperty(e));

  const n$8=(t,r)=>{if(t.length!==r.length)return  false;for(let e=0;e<t.length;e++)if(t[e]!==r[e])return  false;return  true};

  const n$7=(e,t)=>e.call(t);

  const o$7=t=>{s$6(t)&&e$4(t);},e$4=t=>{if(t._internals?.form){if(n$6(t),!t.name){t._internals?.setFormValue(null);return}t._internals.setFormValue(t.formFormattedValue);}},n$6=async t=>{if(t._internals?.form)if(t.formValidity&&Object.keys(t.formValidity).some(r=>r)){const r=await t.formElementAnchor?.();t._internals.setValidity(t.formValidity,t.formValidityMessage,r);}else t._internals.setValidity({});},s$6=t=>"formFormattedValue"in t&&"name"in t;

  const t$3=typeof document>"u",o$6=()=>{if(t$3)return a$f;const a=navigator.languages,n=()=>navigator.language;return a&&a[0]||n()||a$f};

  const n$5=/^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;let r$5 = class r{constructor(s){const t=n$5.exec(s.replace(/_/g,"-"));if(t===null)throw new Error(`The given language ${s} does not adhere to BCP-47.`);this.sLocaleId=s,this.sLanguage=t[1]||a$f,this.sScript=t[2]||"",this.sRegion=t[3]||"",this.sVariant=t[4]&&t[4].slice(1)||null,this.sExtension=t[5]&&t[5].slice(1)||null,this.sPrivateUse=t[6]||null,this.sLanguage&&(this.sLanguage=this.sLanguage.toLowerCase()),this.sScript&&(this.sScript=this.sScript.toLowerCase().replace(/^[a-z]/,i=>i.toUpperCase())),this.sRegion&&(this.sRegion=this.sRegion.toUpperCase());}getLanguage(){return this.sLanguage}getScript(){return this.sScript}getRegion(){return this.sRegion}getVariant(){return this.sVariant}getVariantSubtags(){return this.sVariant?this.sVariant.split("-"):[]}getExtension(){return this.sExtension}getExtensionSubtags(){return this.sExtension?this.sExtension.slice(2).split("-"):[]}getPrivateUse(){return this.sPrivateUse}getPrivateUseSubtags(){return this.sPrivateUse?this.sPrivateUse.slice(2).split("-"):[]}hasPrivateUseSubtag(s){return this.getPrivateUseSubtags().indexOf(s)>=0}toString(){const s=[this.sLanguage];return this.sScript&&s.push(this.sScript),this.sRegion&&s.push(this.sRegion),this.sVariant&&s.push(this.sVariant),this.sExtension&&s.push(this.sExtension),this.sPrivateUse&&s.push(this.sPrivateUse),s.join("-")}};

  const r$4=new Map,n$4=t=>(r$4.has(t)||r$4.set(t,new r$5(t)),r$4.get(t)),c$5=t=>{try{if(t&&typeof t=="string")return n$4(t)}catch{}return new r$5(r$k)},s$5=t=>{const e=d$6();return e?n$4(e):c$5(o$6())};

  const _$3=/^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i,c$4=/(?:^|-)(saptrc|sappsd)(?:-|$)/i,f$7={he:"iw",yi:"ji",nb:"no",sr:"sh"},p$2=i=>{let e;if(!i)return r$k;if(typeof i=="string"&&(e=_$3.exec(i.replace(/_/g,"-")))){let t=e[1].toLowerCase(),n=e[3]?e[3].toUpperCase():undefined;const s=e[2]?e[2].toLowerCase():undefined,r=e[4]?e[4].slice(1):undefined,o=e[6];return t=f$7[t]||t,o&&(e=c$4.exec(o))||r&&(e=c$4.exec(r))?`en_US_${e[1].toLowerCase()}`:(t==="zh"&&!n&&(s==="hans"?n="CN":s==="hant"&&(n="TW")),t+(n?"_"+n+(r?"_"+r.replace("-","_"):""):""))}return r$k};

  const e$3=r=>{if(!r)return r$k;if(r==="zh_HK")return "zh_TW";const n=r.lastIndexOf("_");return n>=0?r.slice(0,n):r!==r$k?r$k:""};

  const d$5=new Set,m$4=new Set,g$4=new Map,l$7=new Map,u$7=new Map,f$6=(n,t)=>{g$4.set(n,t);},A$3=n=>g$4.get(n),h$2=(n,t)=>{const e=`${n}/${t}`;return u$7.has(e)},B$2=(n,t)=>{const e=`${n}/${t}`,r=u$7.get(e);return r&&!l$7.get(e)&&l$7.set(e,r(t)),l$7.get(e)},M$2=n=>{d$5.has(n)||(console.warn(`[${n}]: Message bundle assets are not configured. Falling back to English texts.`,` Add \`import "${n}/dist/Assets.js"\` in your bundle and make sure your build tool supports dynamic imports and JSON imports. See section "Assets" in the documentation for more information.`),d$5.add(n));},L$1=(n,t)=>t!==a$f&&!h$2(n,t),w$3=async n=>{const t=s$5().getLanguage(),e=s$5().getRegion(),r=s$5().getVariant();let s=t+(e?`-${e}`:"")+(r?`-${r}`:"");if(L$1(n,s))for(s=p$2(s);L$1(n,s);)s=e$3(s);const I=c$9();if(s===a$f&&!I){f$6(n,null);return}if(!h$2(n,s)){M$2(n);return}try{const o=await B$2(n,s);f$6(n,o);}catch(o){const a=o;m$4.has(a.message)||(m$4.add(a.message),console.error(a.message));}};t$5(n=>{const t=[...g$4.keys()];return Promise.all(t.map(w$3))});

  const g$3=/('')|'([^']+(?:''[^']*)*)(?:'|$)|\{([0-9]+(?:\s*,[^{}]*)?)\}|[{}]/g,i$6=(n,t)=>(t=t||[],n.replace(g$3,(p,s,e,r,o)=>{if(s)return "'";if(e)return e.replace(/''/g,"'");if(r){const a=typeof r=="string"?parseInt(r):r;return String(t[a])}throw new Error(`[i18n]: pattern syntax error at pos ${o}`)}));

  const r$3=new Map;let u$6 = class u{constructor(e){this.packageName=e;}getText(e,...i){if(typeof e=="string"&&(e={key:e,defaultText:e}),!e||!e.key)return "";const t=A$3(this.packageName);t&&!t[e.key]&&console.warn(`Key ${e.key} not found in the i18n bundle, the default text will be used`);const l=t&&t[e.key]?t[e.key]:e.defaultText||e.key;return i$6(l,i)}};const a$4=n=>{if(r$3.has(n))return r$3.get(n);const e=new u$6(n);return r$3.set(n,e),e},f$5=async n=>(await w$3(n),a$4(n));

  const f$4=new Map,s$4=new Map,i$5=new Map,D$1=new Set;let d$4=false;const O$2={iw:"he",ji:"yi",in:"id"},l$6=t=>{d$4||(console.warn(`[LocaleData] Supported locale "${t}" not configured, import the "Assets.js" module from the webcomponents package you are using.`),d$4=true);},R$1=(t,e,n)=>{t=t&&O$2[t]||t,t==="no"&&(t="nb"),t==="zh"&&!e&&(n==="Hans"?e="CN":n==="Hant"&&(e="TW")),(t==="sh"||t==="sr"&&n==="Latn")&&(t="sr",e="Latn");let r=`${t}_${e}`;return n$n.includes(r)?s$4.has(r)?r:(l$6(r),r$k):(r=t,n$n.includes(r)?s$4.has(r)?r:(l$6(r),r$k):r$k)},m$3=(t,e)=>{f$4.set(t,e);},_$2=t=>{if(!i$5.get(t)){const e=s$4.get(t);if(!e)throw new Error(`CLDR data for locale ${t} is not loaded!`);i$5.set(t,e(t));}return i$5.get(t)},u$5=async(t,e,n)=>{const r=R$1(t,e,n),p=n$o("OpenUI5Support");if(p){const o=p.getLocaleDataObject();if(o){m$3(r,o);return}}try{const o=await _$2(r);m$3(r,o);}catch(o){const c=o;D$1.has(c.message)||(D$1.add(c.message),console.error(c.message));}},C$2=(t,e)=>{s$4.set(t,e);};C$2("en",async()=>(await fetch("https://sdk.openui5.org/1.120.17/resources/sap/ui/core/cldr/en.json")).json()),t$5(()=>{const t=s$5();return u$5(t.getLanguage(),t.getRegion(),t.getScript())});

  let ot=0;const T$2=new Map,I$3=new Map,O$1={fromAttribute(d,f){return f===Boolean?d!==null:f===Number?d===null?undefined:parseFloat(d):d},toAttribute(d,f){return f===Boolean?d?"":null:f===Object||f===Array||d==null?null:String(d)}};function y$2(d){this._suppressInvalidation||(this.onInvalidation(d),this._changedState.push(d),l$g(this),this._invalidationEventProvider.fireEvent("invalidate",{...d,target:this}));}function it(d,f){do{const t=Object.getOwnPropertyDescriptor(d,f);if(t)return t;d=Object.getPrototypeOf(d);}while(d&&d!==HTMLElement.prototype)}let S$3 = class S extends HTMLElement{constructor(){super();this._rendered=false;const t=this.constructor;this._changedState=[],this._suppressInvalidation=true,this._inDOM=false,this._fullyConnected=false,this._childChangeListeners=new Map,this._slotChangeListeners=new Map,this._invalidationEventProvider=new i$m,this._componentStateFinalizedEventProvider=new i$m;let e;this._domRefReadyPromise=new Promise(n=>{e=n;}),this._domRefReadyPromise._deferredResolve=e,this._doNotSyncAttributes=new Set,this._slotsAssignedNodes=new WeakMap,this._state={...t.getMetadata().getInitialState()},this.initializedProperties=new Map,this.constructor.getMetadata().getPropertiesList().forEach(n=>{if(this.hasOwnProperty(n)){const o=this[n];this.initializedProperties.set(n,o);}}),this._internals=this.attachInternals(),this._initShadowRoot();}_initShadowRoot(){const t=this.constructor;if(t._needsShadowDOM()){const e={mode:"open"};this.attachShadow({...e,...t.getMetadata().getShadowRootOptions()}),t.getMetadata().slotsAreManaged()&&this.shadowRoot.addEventListener("slotchange",this._onShadowRootSlotChange.bind(this));}}_onShadowRootSlotChange(t){t.target?.getRootNode()===this.shadowRoot&&this._processChildren();}get _id(){return this.__id||(this.__id=`ui5wc_${++ot}`),this.__id}render(){const t=this.constructor.template;return n$7(t,this)}async connectedCallback(){const t=this.constructor;this.setAttribute(t.getMetadata().getPureTag(),""),t.getMetadata().supportsF6FastNavigation()&&this.setAttribute("data-sap-ui-fastnavgroup","true");const e=t.getMetadata().slotsAreManaged();this._inDOM=true,e&&(this._startObservingDOMChildren(),await this._processChildren()),this._inDOM&&(t.asyncFinished||await t.definePromise,c$e(this),this._domRefReadyPromise._deferredResolve(),this._fullyConnected=true,this.onEnterDOM());}disconnectedCallback(){const e=this.constructor.getMetadata().slotsAreManaged();this._inDOM=false,e&&this._stopObservingDOMChildren(),this._fullyConnected&&(this.onExitDOM(),this._fullyConnected=false),this._domRefReadyPromise._deferredResolve(),h$5(this);}onBeforeRendering(){}onAfterRendering(){}onEnterDOM(){}onExitDOM(){}_startObservingDOMChildren(){const e=this.constructor.getMetadata();if(!e.hasSlots())return;const n=e.canSlotText(),o={childList:true,subtree:n,characterData:n};n$9(this,this._processChildren.bind(this),o);}_stopObservingDOMChildren(){b$1(this);}async _processChildren(){this.constructor.getMetadata().hasSlots()&&await this._updateSlots();}async _updateSlots(){const t=this.constructor,e=t.getMetadata().getSlots(),s=t.getMetadata().canSlotText(),n=Array.from(s?this.childNodes:this.children),o=new Map,i=new Map;for(const[l,u]of Object.entries(e)){const c=u.propertyName||l;i.set(c,l),o.set(c,[...this._state[c]]),this._clearSlot(l,u);}const r=new Map,a=new Map,h=n.map(async(l,u)=>{const c=o$9(l),m=e[c];if(m===undefined){if(c!=="default"){const p=Object.keys(e).join(", ");console.warn(`Unknown slotName: ${c}, ignoring`,l,`Valid values are: ${p}`);}return}if(m.individualSlots){const p=(r.get(c)||0)+1;r.set(c,p),l._individualSlot=`${c}-${p}`;}if(l instanceof HTMLElement){const p=l.localName;if(p.includes("-")&&!o$8(p)){if(!customElements.get(p)){const L=customElements.whenDefined(p);let E=T$2.get(p);E||(E=new Promise(U=>setTimeout(U,1e3)),T$2.set(p,E)),await Promise.race([L,E]);}customElements.upgrade(l);}}if(l=t.getMetadata().constructor.validateSlotValue(l,m),v$2(l)&&m.invalidateOnChildChange){const p=this._getChildChangeListener(c);l.attachInvalidate.call(l,p);}l instanceof HTMLSlotElement&&this._attachSlotChange(l,c,!!m.invalidateOnChildChange);const C=m.propertyName||c;a.has(C)?a.get(C).push({child:l,idx:u}):a.set(C,[{child:l,idx:u}]);});await Promise.all(h),a.forEach((l,u)=>{this._state[u]=l.sort((c,m)=>c.idx-m.idx).map(c=>c.child),this._state[c$7(u)]=this._state[u];});let _=false;for(const[l,u]of Object.entries(e)){const c=u.propertyName||l;n$8(o.get(c),this._state[c])||(y$2.call(this,{type:"slot",name:i.get(c),reason:"children"}),_=true,t.getMetadata().isFormAssociated()&&e$4(this));}_||y$2.call(this,{type:"slot",name:"default",reason:"textcontent"});}_clearSlot(t,e){const s=e.propertyName||t;this._state[s].forEach(o=>{if(v$2(o)){const i=this._getChildChangeListener(t);o.detachInvalidate.call(o,i);}o instanceof HTMLSlotElement&&this._detachSlotChange(o,t);}),this._state[s]=[],this._state[c$7(s)]=this._state[s];}attachInvalidate(t){this._invalidationEventProvider.attachEvent("invalidate",t);}detachInvalidate(t){this._invalidationEventProvider.detachEvent("invalidate",t);}_onChildChange(t,e){this.constructor.getMetadata().shouldInvalidateOnChildChange(t,e.type,e.name)&&y$2.call(this,{type:"slot",name:t,reason:"childchange",child:e.target});}attributeChangedCallback(t,e,s){let n;if(this._doNotSyncAttributes.has(t))return;const o=this.constructor.getMetadata().getProperties(),i=t.replace(/^ui5-/,""),r=c$7(i);if(o.hasOwnProperty(r)){const a=o[r];n=(a.converter??O$1).fromAttribute(s,a.type),this[r]=n;}}formAssociatedCallback(){this.constructor.getMetadata().isFormAssociated()&&o$7(this);}static get formAssociated(){return this.getMetadata().isFormAssociated()}_updateAttribute(t,e){const s=this.constructor;if(!s.getMetadata().hasAttribute(t))return;const o=s.getMetadata().getProperties()[t],i=l$9(t),a=(o.converter||O$1).toAttribute(e,o.type);this._doNotSyncAttributes.add(i),a==null?this.removeAttribute(i):this.setAttribute(i,a),this._doNotSyncAttributes.delete(i);}_getChildChangeListener(t){return this._childChangeListeners.has(t)||this._childChangeListeners.set(t,this._onChildChange.bind(this,t)),this._childChangeListeners.get(t)}_getSlotChangeListener(t){return this._slotChangeListeners.has(t)||this._slotChangeListeners.set(t,this._onSlotChange.bind(this,t)),this._slotChangeListeners.get(t)}_attachSlotChange(t,e,s){const n=this._getSlotChangeListener(e);t.addEventListener("slotchange",o=>{if(n.call(t,o),s){const i=this._slotsAssignedNodes.get(t);i&&i.forEach(a=>{if(v$2(a)){const h=this._getChildChangeListener(e);a.detachInvalidate.call(a,h);}});const r=s$a([t]);this._slotsAssignedNodes.set(t,r),r.forEach(a=>{if(v$2(a)){const h=this._getChildChangeListener(e);a.attachInvalidate.call(a,h);}});}});}_detachSlotChange(t,e){t.removeEventListener("slotchange",this._getSlotChangeListener(e));}_onSlotChange(t){y$2.call(this,{type:"slot",name:t,reason:"slotchange"});}onInvalidation(t){}updateAttributes(){const e=this.constructor.getMetadata().getProperties();for(const[s,n]of Object.entries(e))this._updateAttribute(s,this[s]);}_render(){const t=this.constructor,e=t.getMetadata().hasIndividualSlots();this.initializedProperties.size>0&&(Array.from(this.initializedProperties.entries()).forEach(([s,n])=>{delete this[s],this[s]=n;}),this.initializedProperties.clear()),this._suppressInvalidation=true;try{this.onBeforeRendering(),this._rendered||this.updateAttributes(),this._componentStateFinalizedEventProvider.fireEvent("componentStateFinalized");}finally{this._suppressInvalidation=false;}this._changedState=[],t._needsShadowDOM()&&s$8(this),this._rendered=true,e&&this._assignIndividualSlotsToChildren(),this.onAfterRendering();}_assignIndividualSlotsToChildren(){Array.from(this.children).forEach(e=>{e._individualSlot&&e.setAttribute("slot",e._individualSlot);});}_waitForDomRef(){return this._domRefReadyPromise}getDomRef(){if(typeof this._getRealDomRef=="function")return this._getRealDomRef();if(!(!this.shadowRoot||this.shadowRoot.children.length===0))return this.shadowRoot.children[0]}getFocusDomRef(){const t=this.getDomRef();if(t)return t.querySelector("[data-sap-focus-ref]")||t}async getFocusDomRefAsync(){return await this._waitForDomRef(),this.getFocusDomRef()}async focus(t){await this._waitForDomRef();const e=this.getFocusDomRef();e===this?HTMLElement.prototype.focus.call(this,t):e&&typeof e.focus=="function"&&e.focus(t);}fireEvent(t,e,s=false,n=true){const o=this._fireEvent(t,e,s,n),i=C$3(t);return i!==t?o&&this._fireEvent(i,e,s,n):o}fireDecoratorEvent(t,e){const s=this.getEventData(t),n=s?s.cancelable:false,o=s?s.bubbles:false,i=this._fireEvent(t,e,n,o),r=C$3(t);return r!==t?i&&this._fireEvent(r,e,n,o):i}_fireEvent(t,e,s=false,n=true){const o=new CustomEvent(`ui5-${t}`,{detail:e,composed:false,bubbles:n,cancelable:s}),i=this.dispatchEvent(o);if(a$6(t))return i;const r=new CustomEvent(t,{detail:e,composed:false,bubbles:n,cancelable:s});return this.dispatchEvent(r)&&i}getEventData(t){return this.constructor.getMetadata().getEvents()[t]}getSlottedNodes(t){return s$a(this[t])}attachComponentStateFinalized(t){this._componentStateFinalizedEventProvider.attachEvent("componentStateFinalized",t);}detachComponentStateFinalized(t){this._componentStateFinalizedEventProvider.detachEvent("componentStateFinalized",t);}get effectiveDir(){return n$l(this.constructor),r$7(this)}get isUI5Element(){return  true}get isUI5AbstractElement(){return !this.constructor._needsShadowDOM()}get classes(){return {}}get accessibilityInfo(){return {}}static get observedAttributes(){return this.getMetadata().getAttributesList()}static get tagsToScope(){const t=this.getMetadata().getPureTag(),e=this.getUniqueDependencies().map(s=>s.getMetadata().getPureTag()).filter(i$i);return i$i(t)&&e.push(t),e}static _needsShadowDOM(){return !!this.template||Object.prototype.hasOwnProperty.call(this.prototype,"render")}static _generateAccessors(){const t=this.prototype,e=this.getMetadata().slotsAreManaged(),s=this.getMetadata().getProperties();for(const[n,o]of Object.entries(s)){r$6(n)||console.warn(`"${n}" is not a valid property name. Use a name that does not collide with DOM APIs`);const i=it(t,n);let r;i?.set&&(r=i.set);let a;i?.get&&(a=i.get),Object.defineProperty(t,n,{get(){return a?a.call(this):this._state[n]},set(h){const _=this.constructor,l=a?a.call(this):this._state[n];l!==h&&(r?r.call(this,h):this._state[n]=h,y$2.call(this,{type:"property",name:n,newValue:h,oldValue:l}),this._rendered&&this._updateAttribute(n,h),_.getMetadata().isFormAssociated()&&e$4(this));}});}if(e){const n=this.getMetadata().getSlots();for(const[o,i]of Object.entries(n)){r$6(o)||console.warn(`"${o}" is not a valid property name. Use a name that does not collide with DOM APIs`);const r=i.propertyName||o,a={get(){return this._state[r]!==undefined?this._state[r]:[]},set(){throw new Error("Cannot set slot content directly, use the DOM APIs (appendChild, removeChild, etc...)")}};Object.defineProperty(t,r,a),r!==c$7(r)&&Object.defineProperty(t,c$7(r),a);}}}static{this.metadata={};}static{this.styles="";}static get dependencies(){return []}static cacheUniqueDependencies(){const t=this.dependencies.filter((e,s,n)=>n.indexOf(e)===s);I$3.set(this,t);}static getUniqueDependencies(){return I$3.has(this)||this.cacheUniqueDependencies(),I$3.get(this)||[]}static async onDefine(){return Promise.resolve()}static fetchI18nBundles(){return Promise.all(Object.entries(this.getMetadata().getI18n()).map(t=>{const{bundleName:e}=t[1];return f$5(e)}))}static fetchCLDR(){return this.getMetadata().needsCLDR()?u$5(s$5().getLanguage(),s$5().getRegion(),s$5().getScript()):Promise.resolve()}static{this.i18nBundleStorage={};}static get i18nBundles(){return this.i18nBundleStorage}static define(){const t=async()=>{await l$d();const o=await Promise.all([this.fetchI18nBundles(),this.fetchCLDR(),this.onDefine()]),[i]=o;Object.entries(this.getMetadata().getI18n()).forEach((r,a)=>{const h=r[0];this.i18nBundleStorage[h]=i[a];}),this.asyncFinished=true;};this.definePromise=t();const e=this.getMetadata().getTag(),s=w$7(e),n=customElements.get(e);return n&&!s?y$7(e):n||(this._generateAccessors(),h$6(e),customElements.define(e,this)),this}static getMetadata(){if(this.hasOwnProperty("_metadata"))return this._metadata;const t=[this.metadata];let e=this;for(;e!==S;)e=Object.getPrototypeOf(e),t.unshift(e.metadata);const s=e$h({},...t);return this._metadata=new p$3(s),this._metadata}get validity(){return this._internals.validity}get validationMessage(){return this._internals.validationMessage}checkValidity(){return this._internals.checkValidity()}reportValidity(){return this._internals.reportValidity()}};const v$2=d=>"isUI5Element"in d;

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
  	    var safeCss = undefined;
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
  	            var historySensitiveSelectors = undefined;
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
  	    if (tag.eflags !== undefined) {
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
  	    if (tag.eflags !== undefined) {
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
  	      tag.eflags = undefined;
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
  	    if (end <= p) { return undefined; }
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
  	          if (value !== null && value !== undefined) {
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
  	              if (value !== null && value !== undefined) {
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

  const w$2="legacy",c$3=new Map,s$3=m$c("SVGIcons.registry",new Map),i$4=m$c("SVGIcons.promises",new Map),l$5="ICON_NOT_FOUND",N$2=async e=>{if(!i$4.has(e)){if(!c$3.has(e))throw new Error(`No loader registered for the ${e} icons collection. Probably you forgot to import the "AllIcons.js" module for the respective package.`);const t=c$3.get(e);i$4.set(e,t(e));}return i$4.get(e)},I$2=e=>{Object.keys(e.data).forEach(t=>{const o=e.data[t];f$3(t,{pathData:o.path||o.paths,ltr:o.ltr,accData:o.acc,collection:e.collection,packageName:e.packageName});});},f$3=(e,t)=>{const o=`${t.collection}/${e}`;s$3.set(o,{pathData:t.pathData,ltr:t.ltr,accData:t.accData,packageName:t.packageName,customTemplate:t.customTemplate,viewBox:t.viewBox,collection:t.collection});},d$3=e=>{e.startsWith("sap-icon://")&&(e=e.replace("sap-icon://",""));let t;return [e,t]=e.split("/").reverse(),e=e.replace("icon-",""),t&&(t=n$f(t)),{name:e,collection:t}},u$4=e=>{const{name:t,collection:o}=d$3(e);return g$2(o,t)},n$3=async e=>{const{name:t,collection:o}=d$3(e);let r=l$5;try{r=await N$2(i$9(o));}catch(a){console.error(a.message);}if(r===l$5)return r;const p=g$2(o,t);return p||(Array.isArray(r)?r.forEach(a=>{I$2(a),c$a(o,{[a.themeFamily||w$2]:a.collection});}):I$2(r),g$2(o,t))},g$2=(e,t)=>{const o=`${i$9(e)}/${t}`;return s$3.get(o)};

  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  var t$2;const i$3=window,s$2=i$3.trustedTypes,e$2=s$2?s$2.createPolicy("lit-html",{createHTML:t=>t}):undefined,o$5="$lit$",n$2=`lit$${(Math.random()+"").slice(9)}$`,l$4="?"+n$2,h$1=`<${l$4}>`,r$2=document,u$3=()=>r$2.createComment(""),d$2=t=>null===t||"object"!=typeof t&&"function"!=typeof t,c$2=Array.isArray,v$1=t=>c$2(t)||"function"==typeof(null==t?undefined:t[Symbol.iterator]),a$3="[ \t\n\f\r]",f$2=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_$1=/-->/g,m$2=/>/g,p$1=RegExp(`>|${a$3}(?:([^\\s"'>=/]+)(${a$3}*=${a$3}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g$1=/'/g,$$1=/"/g,y$1=/^(?:script|style|textarea|title)$/i,w$1=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x$1=w$1(1),b=w$1(2),T$1=Symbol.for("lit-noChange"),A$2=Symbol.for("lit-nothing"),E$1=new WeakMap,C$1=r$2.createTreeWalker(r$2,129,null,false);function P$1(t,i){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return undefined!==e$2?e$2.createHTML(i):i}const V$1=(t,i)=>{const s=t.length-1,e=[];let l,r=2===i?"<svg>":"",u=f$2;for(let i=0;i<s;i++){const s=t[i];let d,c,v=-1,a=0;for(;a<s.length&&(u.lastIndex=a,c=u.exec(s),null!==c);)a=u.lastIndex,u===f$2?"!--"===c[1]?u=_$1:undefined!==c[1]?u=m$2:undefined!==c[2]?(y$1.test(c[2])&&(l=RegExp("</"+c[2],"g")),u=p$1):undefined!==c[3]&&(u=p$1):u===p$1?">"===c[0]?(u=null!=l?l:f$2,v=-1):undefined===c[1]?v=-2:(v=u.lastIndex-c[2].length,d=c[1],u=undefined===c[3]?p$1:'"'===c[3]?$$1:g$1):u===$$1||u===g$1?u=p$1:u===_$1||u===m$2?u=f$2:(u=p$1,l=undefined);const w=u===p$1&&t[i+1].startsWith("/>")?" ":"";r+=u===f$2?s+h$1:v>=0?(e.push(d),s.slice(0,v)+o$5+s.slice(v)+n$2+w):s+n$2+(-2===v?(e.push(undefined),i):w);}return [P$1(t,r+(t[s]||"<?>")+(2===i?"</svg>":"")),e]};let N$1 = class N{constructor({strings:t,_$litType$:i},e){let h;this.parts=[];let r=0,d=0;const c=t.length-1,v=this.parts,[a,f]=V$1(t,i);if(this.el=N.createElement(a,e),C$1.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes);}for(;null!==(h=C$1.nextNode())&&v.length<c;){if(1===h.nodeType){if(h.hasAttributes()){const t=[];for(const i of h.getAttributeNames())if(i.endsWith(o$5)||i.startsWith(n$2)){const s=f[d++];if(t.push(i),undefined!==s){const t=h.getAttribute(s.toLowerCase()+o$5).split(n$2),i=/([.?@])?(.*)/.exec(s);v.push({type:1,index:r,name:i[2],strings:t,ctor:"."===i[1]?H$1:"?"===i[1]?L:"@"===i[1]?z$1:k$1});}else v.push({type:6,index:r});}for(const i of t)h.removeAttribute(i);}if(y$1.test(h.tagName)){const t=h.textContent.split(n$2),i=t.length-1;if(i>0){h.textContent=s$2?s$2.emptyScript:"";for(let s=0;s<i;s++)h.append(t[s],u$3()),C$1.nextNode(),v.push({type:2,index:++r});h.append(t[i],u$3());}}}else if(8===h.nodeType)if(h.data===l$4)v.push({type:2,index:r});else {let t=-1;for(;-1!==(t=h.data.indexOf(n$2,t+1));)v.push({type:7,index:r}),t+=n$2.length-1;}r++;}}static createElement(t,i){const s=r$2.createElement("template");return s.innerHTML=t,s}};function S$2(t,i,s=t,e){var o,n,l,h;if(i===T$1)return i;let r=undefined!==e?null===(o=s._$Co)||undefined===o?undefined:o[e]:s._$Cl;const u=d$2(i)?undefined:i._$litDirective$;return (null==r?undefined:r.constructor)!==u&&(null===(n=null==r?undefined:r._$AO)||undefined===n||n.call(r,false),undefined===u?r=undefined:(r=new u(t),r._$AT(t,s,e)),undefined!==e?(null!==(l=(h=s)._$Co)&&undefined!==l?l:h._$Co=[])[e]=r:s._$Cl=r),undefined!==r&&(i=S$2(t,r._$AS(t,i.values),r,e)),i}let M$1 = class M{constructor(t,i){this._$AV=[],this._$AN=undefined,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var i;const{el:{content:s},parts:e}=this._$AD,o=(null!==(i=null==t?undefined:t.creationScope)&&undefined!==i?i:r$2).importNode(s,true);C$1.currentNode=o;let n=C$1.nextNode(),l=0,h=0,u=e[0];for(;undefined!==u;){if(l===u.index){let i;2===u.type?i=new R(n,n.nextSibling,this,t):1===u.type?i=new u.ctor(n,u.name,u.strings,this,t):6===u.type&&(i=new Z(n,this,t)),this._$AV.push(i),u=e[++h];}l!==(null==u?undefined:u.index)&&(n=C$1.nextNode(),l++);}return C$1.currentNode=r$2,o}v(t){let i=0;for(const s of this._$AV) undefined!==s&&(undefined!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}};class R{constructor(t,i,s,e){var o;this.type=2,this._$AH=A$2,this._$AN=undefined,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cp=null===(o=null==e?undefined:e.isConnected)||undefined===o||o;}get _$AU(){var t,i;return null!==(i=null===(t=this._$AM)||undefined===t?undefined:t._$AU)&&undefined!==i?i:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return undefined!==i&&11===(null==t?undefined:t.nodeType)&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=S$2(this,t,i),d$2(t)?t===A$2||null==t||""===t?(this._$AH!==A$2&&this._$AR(),this._$AH=A$2):t!==this._$AH&&t!==T$1&&this._(t):undefined!==t._$litType$?this.g(t):undefined!==t.nodeType?this.$(t):v$1(t)?this.T(t):this._(t);}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t));}_(t){this._$AH!==A$2&&d$2(this._$AH)?this._$AA.nextSibling.data=t:this.$(r$2.createTextNode(t)),this._$AH=t;}g(t){var i;const{values:s,_$litType$:e}=t,o="number"==typeof e?this._$AC(t):(undefined===e.el&&(e.el=N$1.createElement(P$1(e.h,e.h[0]),this.options)),e);if((null===(i=this._$AH)||undefined===i?undefined:i._$AD)===o)this._$AH.v(s);else {const t=new M$1(o,this),i=t.u(this.options);t.v(s),this.$(i),this._$AH=t;}}_$AC(t){let i=E$1.get(t.strings);return undefined===i&&E$1.set(t.strings,i=new N$1(t)),i}T(t){c$2(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const o of t)e===i.length?i.push(s=new R(this.k(u$3()),this.k(u$3()),this,this.options)):s=i[e],s._$AI(o),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){var s;for(null===(s=this._$AP)||undefined===s||s.call(this,false,true,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){var i;undefined===this._$AM&&(this._$Cp=t,null===(i=this._$AP)||undefined===i||i.call(this,t));}}let k$1 = class k{constructor(t,i,s,e,o){this.type=1,this._$AH=A$2,this._$AN=undefined,this.element=t,this.name=i,this._$AM=e,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A$2;}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,i=this,s,e){const o=this.strings;let n=false;if(undefined===o)t=S$2(this,t,i,0),n=!d$2(t)||t!==this._$AH&&t!==T$1,n&&(this._$AH=t);else {const e=t;let l,h;for(t=o[0],l=0;l<o.length-1;l++)h=S$2(this,e[s+l],i,l),h===T$1&&(h=this._$AH[l]),n||(n=!d$2(h)||h!==this._$AH[l]),h===A$2?t=A$2:t!==A$2&&(t+=(null!=h?h:"")+o[l+1]),this._$AH[l]=h;}n&&!e&&this.j(t);}j(t){t===A$2?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"");}};let H$1 = class H extends k$1{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A$2?undefined:t;}};const I$1=s$2?s$2.emptyScript:"";class L extends k$1{constructor(){super(...arguments),this.type=4;}j(t){t&&t!==A$2?this.element.setAttribute(this.name,I$1):this.element.removeAttribute(this.name);}}let z$1 = class z extends k$1{constructor(t,i,s,e,o){super(t,i,s,e,o),this.type=5;}_$AI(t,i=this){var s;if((t=null!==(s=S$2(this,t,i,0))&&undefined!==s?s:A$2)===T$1)return;const e=this._$AH,o=t===A$2&&e!==A$2||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==A$2&&(e===A$2||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){var i,s;"function"==typeof this._$AH?this._$AH.call(null!==(s=null===(i=this.options)||undefined===i?undefined:i.host)&&undefined!==s?s:this.element,t):this._$AH.handleEvent(t);}};class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=undefined,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){S$2(this,t);}}const B$1=i$3.litHtmlPolyfillSupport;null==B$1||B$1(N$1,R),(null!==(t$2=i$3.litHtmlVersions)&&undefined!==t$2?t$2:i$3.litHtmlVersions=[]).push("2.8.0");

  /**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */const e$1=Symbol.for(""),l$3=t=>{if((null==t?undefined:t.r)===e$1)return null==t?undefined:t._$litStatic$},o$4=t=>({_$litStatic$:t,r:e$1}),s$1=new Map,a$2=t=>(r,...e)=>{const o=e.length;let i,a;const n=[],u=[];let c,$=0,f=false;for(;$<o;){for(c=r[$];$<o&&undefined!==(a=e[$],i=l$3(a));)c+=i+r[++$],f=true;$!==o&&u.push(a),n.push(c),$++;}if($===o&&n.push(r[o]),f){const t=n.join("$$lit$$");undefined===(r=s$1.get(t))&&(n.raw=n,s$1.set(t,r=n)),e=u;}return t(r,...e)},n$1=a$2(x$1),u$2=a$2(b);

  let t$1 = class t{static{this.html=n$1;}static{this.svg=u$2;}static{this.unsafeStatic=o$4;}};s$r("LitStatic",t$1);

  const a$1=new Map,t=new Map;t.set("S",[0,599]),t.set("M",[600,1023]),t.set("L",[1024,1439]),t.set("XL",[1440,1/0]);var S$1=(e=>(e.RANGE_4STEPS="4Step",e))(S$1||{});const o$3=(r,e)=>{a$1.set(r,e);},c$1=(r,e=window.innerWidth)=>{let n=a$1.get(r);n||(n=a$1.get("4Step"));let g;const s=Math.floor(e);return n.forEach((R,E)=>{s>=R[0]&&s<=R[1]&&(g=E);}),g||[...n.keys()][0]},i$2={RANGESETS:S$1,initRangeSet:o$3,getCurrentRange:c$1};i$2.initRangeSet(i$2.RANGESETS.RANGE_4STEPS,t);

  const l$2=(s,e={})=>t=>{Object.prototype.hasOwnProperty.call(t,"metadata")||(t.metadata={});const n=t.metadata;n.events||(n.events={});const a=n.events;a[s]||(e.bubbles=!!e.bubbles,e.cancelable=!!e.cancelable,a[s]=e);};

  var n,l$1,u$1,i$1,o$2,r$1,e,f$1,c,s,a,h,p={},v=[],y=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,d$1=Array.isArray;function w(n,l){for(var u in l)n[u]=l[u];return n}function _(n){n&&n.parentNode&&n.parentNode.removeChild(n);}function g(l,u,t){var i,o,r,e={};for(r in u)"key"==r?i=u[r]:"ref"==r?o=u[r]:e[r]=u[r];if(arguments.length>2&&(e.children=arguments.length>3?n.call(arguments,2):t),"function"==typeof l&&null!=l.defaultProps)for(r in l.defaultProps) undefined===e[r]&&(e[r]=l.defaultProps[r]);return m$1(l,e,i,o,null)}function m$1(n,t,i,o,r){var e={type:n,props:t,key:i,ref:o,__k:null,__:null,__b:0,__e:null,__c:null,constructor:undefined,__v:null==r?++u$1:r,__i:-1,__u:0};return null==r&&null!=l$1.vnode&&l$1.vnode(e),e}function k(n){return n.children}function x(n,l){this.props=n,this.context=l;}function C(n,l){if(null==l)return n.__?C(n.__,n.__i+1):null;for(var u;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e)return u.__e;return "function"==typeof n.type?C(n):null}function S(n){var l,u;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e){n.__e=n.__c.base=u.__e;break}return S(n)}}function M(n){(!n.__d&&(n.__d=true)&&i$1.push(n)&&!P.__r++||o$2!==l$1.debounceRendering)&&((o$2=l$1.debounceRendering)||r$1)(P);}function P(){var n,u,t,o,r,f,c,s;for(i$1.sort(e);n=i$1.shift();)n.__d&&(u=i$1.length,o=undefined,f=(r=(t=n).__v).__e,c=[],s=[],t.__P&&((o=w({},r)).__v=r.__v+1,l$1.vnode&&l$1.vnode(o),F(t.__P,o,r,t.__n,t.__P.namespaceURI,32&r.__u?[f]:null,c,null==f?C(r):f,!!(32&r.__u),s),o.__v=r.__v,o.__.__k[o.__i]=o,z(c,o,s),o.__e!=f&&S(o)),i$1.length>u&&i$1.sort(e));P.__r=0;}function $(n,l,u,t,i,o,r,e,f,c,s){var a,h,y,d,w,_,g=t&&t.__k||v,m=l.length;for(f=I(u,l,g,f),a=0;a<m;a++)null!=(y=u.__k[a])&&(h=-1===y.__i?p:g[y.__i]||p,y.__i=a,_=F(n,y,h,i,o,r,e,f,c,s),d=y.__e,y.ref&&h.ref!=y.ref&&(h.ref&&V(h.ref,null,y),s.push(y.ref,y.__c||d,y)),null==w&&null!=d&&(w=d),4&y.__u||h.__k===y.__k?f=H(y,f,n):"function"==typeof y.type&&undefined!==_?f=_:d&&(f=d.nextSibling),y.__u&=-7);return u.__e=w,f}function I(n,l,u,t){var i,o,r,e,f,c=l.length,s=u.length,a=s,h=0;for(n.__k=[],i=0;i<c;i++)null!=(o=l[i])&&"boolean"!=typeof o&&"function"!=typeof o?(e=i+h,(o=n.__k[i]="string"==typeof o||"number"==typeof o||"bigint"==typeof o||o.constructor==String?m$1(null,o,null,null,null):d$1(o)?m$1(k,{children:o},null,null,null):undefined===o.constructor&&o.__b>0?m$1(o.type,o.props,o.key,o.ref?o.ref:null,o.__v):o).__=n,o.__b=n.__b+1,r=null,-1!==(f=o.__i=O(o,u,e,a))&&(a--,(r=u[f])&&(r.__u|=2)),null==r||null===r.__v?(-1==f&&h--,"function"!=typeof o.type&&(o.__u|=4)):f!==e&&(f==e-1?h--:f==e+1?h++:(f>e?h--:h++,o.__u|=4))):o=n.__k[i]=null;if(a)for(i=0;i<s;i++)null!=(r=u[i])&&0==(2&r.__u)&&(r.__e==t&&(t=C(r)),q(r,r));return t}function H(n,l,u){var t,i;if("function"==typeof n.type){for(t=n.__k,i=0;t&&i<t.length;i++)t[i]&&(t[i].__=n,l=H(t[i],l,u));return l}n.__e!=l&&(l&&n.type&&!u.contains(l)&&(l=C(n)),u.insertBefore(n.__e,l||null),l=n.__e);do{l=l&&l.nextSibling;}while(null!=l&&8===l.nodeType);return l}function O(n,l,u,t){var i=n.key,o=n.type,r=u-1,e=u+1,f=l[u];if(null===f||f&&i==f.key&&o===f.type&&0==(2&f.__u))return u;if(("function"!=typeof o||o===k||i)&&t>(null!=f&&0==(2&f.__u)?1:0))for(;r>=0||e<l.length;){if(r>=0){if((f=l[r])&&0==(2&f.__u)&&i==f.key&&o===f.type)return r;r--;}if(e<l.length){if((f=l[e])&&0==(2&f.__u)&&i==f.key&&o===f.type)return e;e++;}}return  -1}function T(n,l,u){"-"===l[0]?n.setProperty(l,null==u?"":u):n[l]=null==u?"":"number"!=typeof u||y.test(l)?u:u+"px";}function j(n,l,u,t,i){var o,r;n:if("style"===l)if("string"==typeof u)n.style.cssText=u;else {if("string"==typeof t&&(n.style.cssText=t=""),t)for(l in t)u&&l in u||T(n.style,l,"");if(u)for(l in u)t&&u[l]===t[l]||T(n.style,l,u[l]);}else if("o"===l[0]&&"n"===l[1])o=l!==(l=l.replace(f$1,"$1")),l=l.toLowerCase()in n||"onFocusOut"===l||"onFocusIn"===l?l.toLowerCase().slice(2):l.slice(2),n.l||(n.l={}),n.l[l+o]=u,u?t?u.u=t.u:(u.u=c,n.addEventListener(l,o?a:s,o)):n.removeEventListener(l,o?a:s,o);else {if("http://www.w3.org/2000/svg"==i)l=l.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if("width"!=l&&"height"!=l&&"href"!=l&&"list"!=l&&"form"!=l&&"tabIndex"!=l&&"download"!=l&&"rowSpan"!=l&&"colSpan"!=l&&"role"!=l&&"popover"!=l&&l in n)try{r=n.tagName&&n.tagName.includes("-"),u!==t&&(n[l]=null!=u||r?u:"");break n}catch(n){}"function"==typeof u||(null==u||false===u&&"-"!==l[4]?n.removeAttribute(l):n.setAttribute(l,"popover"==l&&1==u?"":u));}}function A$1(n){return function(u){if(this.l){var t=this.l[u.type+n];if(null==u.t)u.t=c++;else if(u.t<t.u)return;return t(l$1.event?l$1.event(u):u)}}}function F(n,u,t,i,o,r,e,f,c,s){var a,h,p,v,y,g,m,b,C,S,M,P,I,H,L,O,T,j=u.type;if(undefined!==u.constructor)return null;128&t.__u&&(c=!!(32&t.__u),r=[f=u.__e=t.__e]),(a=l$1.__b)&&a(u);n:if("function"==typeof j)try{if(b=u.props,C="prototype"in j&&j.prototype.render,S=(a=j.contextType)&&i[a.__c],M=a?S?S.props.value:a.__:i,t.__c?m=(h=u.__c=t.__c).__=h.__E:(C?u.__c=h=new j(b,M):(u.__c=h=new x(b,M),h.constructor=j,h.render=B),S&&S.sub(h),h.props=b,h.state||(h.state={}),h.context=M,h.__n=i,p=h.__d=!0,h.__h=[],h._sb=[]),C&&null==h.__s&&(h.__s=h.state),C&&null!=j.getDerivedStateFromProps&&(h.__s==h.state&&(h.__s=w({},h.__s)),w(h.__s,j.getDerivedStateFromProps(b,h.__s))),v=h.props,y=h.state,h.__v=u,p)C&&null==j.getDerivedStateFromProps&&null!=h.componentWillMount&&h.componentWillMount(),C&&null!=h.componentDidMount&&h.__h.push(h.componentDidMount);else {if(C&&null==j.getDerivedStateFromProps&&b!==v&&null!=h.componentWillReceiveProps&&h.componentWillReceiveProps(b,M),!h.__e&&(null!=h.shouldComponentUpdate&&!1===h.shouldComponentUpdate(b,h.__s,M)||u.__v===t.__v)){for(u.__v!==t.__v&&(h.props=b,h.state=h.__s,h.__d=!1),u.__e=t.__e,u.__k=t.__k,u.__k.some(function(n){n&&(n.__=u);}),P=0;P<h._sb.length;P++)h.__h.push(h._sb[P]);h._sb=[],h.__h.length&&e.push(h);break n}null!=h.componentWillUpdate&&h.componentWillUpdate(b,h.__s,M),C&&null!=h.componentDidUpdate&&h.__h.push(function(){h.componentDidUpdate(v,y,g);});}if(h.context=M,h.props=b,h.__P=n,h.__e=!1,I=l$1.__r,H=0,C){for(h.state=h.__s,h.__d=!1,I&&I(u),a=h.render(h.props,h.state,h.context),L=0;L<h._sb.length;L++)h.__h.push(h._sb[L]);h._sb=[];}else do{h.__d=!1,I&&I(u),a=h.render(h.props,h.state,h.context),h.state=h.__s;}while(h.__d&&++H<25);h.state=h.__s,null!=h.getChildContext&&(i=w(w({},i),h.getChildContext())),C&&!p&&null!=h.getSnapshotBeforeUpdate&&(g=h.getSnapshotBeforeUpdate(v,y)),f=$(n,d$1(O=null!=a&&a.type===k&&null==a.key?a.props.children:a)?O:[O],u,t,i,o,r,e,f,c,s),h.base=u.__e,u.__u&=-161,h.__h.length&&e.push(h),m&&(h.__E=h.__=null);}catch(n){if(u.__v=null,c||null!=r)if(n.then){for(u.__u|=c?160:128;f&&8===f.nodeType&&f.nextSibling;)f=f.nextSibling;r[r.indexOf(f)]=null,u.__e=f;}else for(T=r.length;T--;)_(r[T]);else u.__e=t.__e,u.__k=t.__k;l$1.__e(n,u,t);}else null==r&&u.__v===t.__v?(u.__k=t.__k,u.__e=t.__e):f=u.__e=N(t.__e,u,t,i,o,r,e,c,s);return (a=l$1.diffed)&&a(u),128&u.__u?undefined:f}function z(n,u,t){for(var i=0;i<t.length;i++)V(t[i],t[++i],t[++i]);l$1.__c&&l$1.__c(u,n),n.some(function(u){try{n=u.__h,u.__h=[],n.some(function(n){n.call(u);});}catch(n){l$1.__e(n,u.__v);}});}function N(u,t,i,o,r,e,f,c,s){var a,h,v,y,w,g,m,b,k=i.props,x=t.props,S=t.type;if("svg"===S?r="http://www.w3.org/2000/svg":"math"===S?r="http://www.w3.org/1998/Math/MathML":r||(r="http://www.w3.org/1999/xhtml"),null!=e)for(a=0;a<e.length;a++)if((w=e[a])&&"setAttribute"in w==!!S&&(S?w.localName===S:3===w.nodeType)){u=w,e[a]=null;break}if(null==u){if(null===S)return document.createTextNode(x);u=document.createElementNS(r,S,x.is&&x),c&&(l$1.__m&&l$1.__m(t,e),c=false),e=null;}if(null===S)k===x||c&&u.data===x||(u.data=x);else {if(e=e&&n.call(u.childNodes),k=i.props||p,!c&&null!=e)for(k={},a=0;a<u.attributes.length;a++)k[(w=u.attributes[a]).name]=w.value;for(a in k)if(w=k[a],"children"==a);else if("dangerouslySetInnerHTML"==a)v=w;else if(!(a in x)){if("value"==a&&"defaultValue"in x||"checked"==a&&"defaultChecked"in x)continue;j(u,a,null,w,r);}for(a in x)w=x[a],"children"==a?y=w:"dangerouslySetInnerHTML"==a?h=w:"value"==a?g=w:"checked"==a?m=w:c&&"function"!=typeof w||k[a]===w||(a.startsWith("on")&&(b=o[Object.keys(o)[0]].props.value,w=w.bind(b)),j(u,a,w,k[a],r));if(h)c||v&&(h.__html===v.__html||h.__html===u.innerHTML)||(u.innerHTML=h.__html),t.__k=[];else if(v&&(u.innerHTML=""),$(u,d$1(y)?y:[y],t,i,o,"foreignObject"===S?"http://www.w3.org/1999/xhtml":r,e,f,e?e[0]:i.__k&&C(i,0),c,s),null!=e)for(a=e.length;a--;)_(e[a]);c||(a="value","progress"===S&&null==g?u.removeAttribute("value"):undefined!==g&&(g!==u[a]||"progress"===S&&!g||"option"===S&&g!==k[a])&&j(u,a,g,k[a],r),a="checked",undefined!==m&&m!==u[a]&&j(u,a,m,k[a],r));}return u}function V(n,u,t){try{if("function"==typeof n){var i="function"==typeof n.__u;i&&n.__u(),i&&null==u||(n.__u=n(u));}else n.current=u;}catch(n){l$1.__e(n,t);}}function q(n,u,t){var i,o;if(l$1.unmount&&l$1.unmount(n),(i=n.ref)&&(i.current&&i.current!==n.__e||V(i,null,u)),null!=(i=n.__c)){if(i.componentWillUnmount)try{i.componentWillUnmount();}catch(n){l$1.__e(n,u);}i.base=i.__P=null;}if(i=n.__k)for(o=0;o<i.length;o++)i[o]&&q(i[o],u,t||"function"!=typeof n.type);t||_(n.__e),n.__c=n.__=n.__e=undefined;}function B(n,l,u){return this.constructor(n,u)}function D(u,t,i){var o,r,e,f;t===document&&(t=document.documentElement),l$1.__&&l$1.__(u,t),r=(o="function"=="undefined")?null:t.__k,e=[],f=[],F(t,u=(t).__k=g(k,null,[u]),r||p,p,t.namespaceURI,r?null:t.firstChild?n.call(t.childNodes):null,e,r?r.__e:t.firstChild,o,f),z(e,u,f);}function J(n,l){var u={__c:l="__cC"+h++,__:n,Consumer:function(n,l){return n.children(l)},Provider:function(n){var u,t;return this.getChildContext||(u=new Set,(t={})[l]=this,this.getChildContext=function(){return t},this.componentWillUnmount=function(){u=null;},this.shouldComponentUpdate=function(n){this.props.value!==n.value&&u.forEach(function(n){n.__e=true,M(n);});},this.sub=function(n){u.add(n);var l=n.componentWillUnmount;n.componentWillUnmount=function(){u&&u.delete(n),l&&l.call(n);};}),n.children}};return u.Provider.__=u.Consumer.contextType=u}n=v.slice,l$1={__e:function(n,l,u,t){for(var i,o,r;l=l.__;)if((i=l.__c)&&!i.__)try{if((o=i.constructor)&&null!=o.getDerivedStateFromError&&(i.setState(o.getDerivedStateFromError(n)),r=i.__d),null!=i.componentDidCatch&&(i.componentDidCatch(n,t||{}),r=i.__d),r)return i.__E=i}catch(l){n=l;}throw n}},u$1=0,x.prototype.setState=function(n,l){var u;u=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=w({},this.state),"function"==typeof n&&(n=n(w({},u),this.props)),n&&w(u,n),null!=n&&this.__v&&(l&&this._sb.push(l),M(this));},x.prototype.forceUpdate=function(n){this.__v&&(this.__e=true,n&&this.__h.push(n),M(this));},x.prototype.render=k,i$1=[],r$1="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,e=function(n,l){return n.__v.__b-l.__v.__b},P.__r=0,f$1=/(PointerCapture)$|Capture$/i,c=0,s=A$1(false),a=A$1(true),h=0;

  var f=0;function u(e,t,n,o,i,u){t||(t={});var a,c,l=t;"ref"in t&&(a=t.ref,delete t.ref);var p={type:e,props:l,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:undefined,__v:--f,__i:-1,__u:0,__source:i,__self:u};if("function"==typeof e&&(a=e.defaultProps))for(c in a) undefined===l[c]&&(l[c]=a[c]);return l$1.vnode&&l$1.vnode(p),p}

  const r=new WeakMap,d=(e,o)=>{let t=r.get(e);t||(t=J(e),r.set(e,t));const m=e.render();D(u(t.Provider,{value:e,children:m}),o);};

  const i=n=>(e,t)=>{e.metadata.i18n||(e.metadata.i18n={}),Object.defineProperty(e,t,{get(){return e.i18nBundles[t]},set(){}}),e.metadata.i18n[t]={bundleName:n,target:e};};

  var o$1=(i=>(i.None="None",i.Positive="Positive",i.Critical="Critical",i.Negative="Negative",i.Information="Information",i))(o$1||{});

  const A=e=>{const t=e;return t.accessibleNameRef?E(e):t.accessibleName?t.accessibleName:undefined},E=e=>{const t=e.accessibleNameRef?.split(" ")??[];let s="";return t.forEach((n,c)=>{const l=m(e,n),a=`${l&&l.textContent?l.textContent:""}`;a&&(s+=a,c<t.length-1&&(s+=" "));}),s},m=(e,t)=>e.getRootNode().querySelector(`[id='${t}']`)||document.getElementById(t);

  const VALUE_STATE_ERROR = { key: "VALUE_STATE_ERROR", defaultText: "Invalid entry" };
  const VALUE_STATE_WARNING = { key: "VALUE_STATE_WARNING", defaultText: "Warning issued" };
  const VALUE_STATE_SUCCESS = { key: "VALUE_STATE_SUCCESS", defaultText: "Entry successfully validated" };
  const LABEL_COLON = { key: "LABEL_COLON", defaultText: ":" };
  const FORM_CHECKABLE_REQUIRED = { key: "FORM_CHECKABLE_REQUIRED", defaultText: "Please tick this box if you want to proceed." };

  var defaultThemeBase = `:root{--sapThemeMetaData-Base-baseLib:{"Path": "Base.baseLib.sap_horizon.css_variables","PathPattern": "/%frameworkId%/%libId%/%themeId%/%fileId%.css","Extends": ["baseTheme"],"Tags": ["Fiori_3","LightColorScheme"],"FallbackThemeId": "sap_fiori_3","Engine":{"Name": "theming-engine","Version": "14.2.8"},"Version":{"Build": "11.24.0.20241212104249","Source": "11.24.0"}};--sapBrandColor: #0070f2;--sapHighlightColor: #0064d9;--sapBaseColor: #fff;--sapShellColor: #fff;--sapBackgroundColor: #f5f6f7;--sapFontFamily: "72", "72full", Arial, Helvetica, sans-serif;--sapFontSize: .875rem;--sapTextColor: #1d2d3e;--sapLinkColor: #0064d9;--sapCompanyLogo: none;--sapBackgroundImage: none;--sapBackgroundImageOpacity: 1;--sapBackgroundImageRepeat: false;--sapSelectedColor: #0064d9;--sapHoverColor: #eaecee;--sapActiveColor: #dee2e5;--sapHighlightTextColor: #fff;--sapTitleColor: #1d2d3e;--sapNegativeColor: #aa0808;--sapCriticalColor: #e76500;--sapPositiveColor: #256f3a;--sapInformativeColor: #0070f2;--sapNeutralColor: #788fa6;--sapNegativeElementColor: #f53232;--sapCriticalElementColor: #e76500;--sapPositiveElementColor: #30914c;--sapInformativeElementColor: #0070f2;--sapNeutralElementColor: #788fa6;--sapNegativeTextColor: #aa0808;--sapCriticalTextColor: #b44f00;--sapPositiveTextColor: #256f3a;--sapInformativeTextColor: #0064d9;--sapNeutralTextColor: #1d2d3e;--sapErrorColor: #aa0808;--sapWarningColor: #e76500;--sapSuccessColor: #256f3a;--sapInformationColor: #0070f2;--sapErrorBackground: #ffeaf4;--sapWarningBackground: #fff8d6;--sapSuccessBackground: #f5fae5;--sapInformationBackground: #e1f4ff;--sapNeutralBackground: #eff1f2;--sapErrorBorderColor: #e90b0b;--sapWarningBorderColor: #dd6100;--sapSuccessBorderColor: #30914c;--sapInformationBorderColor: #0070f2;--sapNeutralBorderColor: #788fa6;--sapElement_LineHeight: 2.75rem;--sapElement_Height: 2.25rem;--sapElement_BorderWidth: .0625rem;--sapElement_BorderCornerRadius: .75rem;--sapElement_Compact_LineHeight: 2rem;--sapElement_Compact_Height: 1.625rem;--sapElement_Condensed_LineHeight: 1.5rem;--sapElement_Condensed_Height: 1.375rem;--sapContent_LineHeight: 1.5;--sapContent_IconHeight: 1rem;--sapContent_IconColor: #1d2d3e;--sapContent_ContrastIconColor: #fff;--sapContent_NonInteractiveIconColor: #758ca4;--sapContent_MarkerIconColor: #5d36ff;--sapContent_MarkerTextColor: #046c7a;--sapContent_MeasureIndicatorColor: #556b81;--sapContent_Selected_MeasureIndicatorColor: #0064d9;--sapContent_Placeholderloading_Background: #ccc;--sapContent_Placeholderloading_Gradient: linear-gradient(to right, #ccc 0%, #ccc 20%, #999 50%, #ccc 80%, #ccc 100%);--sapContent_ImagePlaceholderBackground: #eaecee;--sapContent_ImagePlaceholderForegroundColor: #5b738b;--sapContent_RatedColor: #d27700;--sapContent_UnratedColor: #758ca4;--sapContent_BusyColor: #0064d9;--sapContent_FocusColor: #0032a5;--sapContent_FocusStyle: solid;--sapContent_FocusWidth: .125rem;--sapContent_ContrastFocusColor: #fff;--sapContent_ShadowColor: #223548;--sapContent_ContrastShadowColor: #fff;--sapContent_Shadow0: 0 0 .125rem 0 rgba(34,53,72,.2), 0 .125rem .25rem 0 rgba(34,53,72,.2);--sapContent_Shadow1: 0 0 0 .0625rem rgba(34,53,72,.48), 0 .125rem .5rem 0 rgba(34,53,72,.3);--sapContent_Shadow2: 0 0 0 .0625rem rgba(34,53,72,.48), 0 .625rem 1.875rem 0 rgba(34,53,72,.25);--sapContent_Shadow3: 0 0 0 .0625rem rgba(34,53,72,.48), 0 1.25rem 5rem 0 rgba(34,53,72,.25);--sapContent_TextShadow: 0 0 .125rem #fff;--sapContent_ContrastTextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapContent_HeaderShadow: 0 .125rem .125rem 0 rgba(34,53,72,.05), inset 0 -.0625rem 0 0 #d9d9d9;--sapContent_Interaction_Shadow: inset 0 0 0 .0625rem rgba(85,107,129,.25);--sapContent_Selected_Shadow: inset 0 0 0 .0625rem rgba(79,160,255,.5);--sapContent_Negative_Shadow: inset 0 0 0 .0625rem rgba(255,142,196,.45);--sapContent_Critical_Shadow: inset 0 0 0 .0625rem rgba(255,213,10,.4);--sapContent_Positive_Shadow: inset 0 0 0 .0625rem rgba(48,145,76,.18);--sapContent_Informative_Shadow: inset 0 0 0 .0625rem rgba(104,174,255,.5);--sapContent_Neutral_Shadow: inset 0 0 0 .0625rem rgba(120,143,166,.3);--sapContent_SearchHighlightColor: #dafdf5;--sapContent_HelpColor: #188918;--sapContent_LabelColor: #556b82;--sapContent_MonospaceFontFamily: "72Mono", "72Monofull", lucida console, monospace;--sapContent_MonospaceBoldFontFamily: "72Mono-Bold", "72Mono-Boldfull", lucida console, monospace;--sapContent_IconFontFamily: "SAP-icons";--sapContent_DisabledTextColor: rgba(29,45,62,.6);--sapContent_DisabledOpacity: .4;--sapContent_ContrastTextThreshold: .65;--sapContent_ContrastTextColor: #fff;--sapContent_ForegroundColor: #efefef;--sapContent_ForegroundBorderColor: #758ca4;--sapContent_ForegroundTextColor: #1d2d3e;--sapContent_BadgeBackground: #aa0808;--sapContent_BadgeTextColor: #fff;--sapContent_BadgeBorderColor: #fff;--sapContent_DragAndDropActiveColor: #0064d9;--sapContent_Selected_TextColor: #0064d9;--sapContent_Selected_Background: #fff;--sapContent_Selected_Hover_Background: #e3f0ff;--sapContent_Selected_ForegroundColor: #0064d9;--sapContent_ForcedColorAdjust: none;--sapContent_Lite_Shadow: None;--sapContent_Illustrative_Color1: #9b015d;--sapContent_Illustrative_Color2: #56bdff;--sapContent_Illustrative_Color3: #ff7f4c;--sapContent_Illustrative_Color4: #00144a;--sapContent_Illustrative_Color5: #a9b4be;--sapContent_Illustrative_Color6: #d5dadd;--sapContent_Illustrative_Color7: #dbf1ff;--sapContent_Illustrative_Color8: #fff;--sapContent_Illustrative_Color9: #0899a7;--sapContent_Illustrative_Color10: #dbf1ff;--sapContent_Illustrative_Color11: #df1278;--sapContent_Illustrative_Color12: #00a800;--sapContent_Illustrative_Color13: #0070f2;--sapContent_Illustrative_Color14: #0040b0;--sapContent_Illustrative_Color15: #c35500;--sapContent_Illustrative_Color16: #8d2a00;--sapContent_Illustrative_Color17: #046c7c;--sapContent_Illustrative_Color18: #bce5ff;--sapContent_Illustrative_Color19: #a3dbff;--sapContent_Illustrative_Color20: #89d1ff;--sapContent_Illustrative_Color21: #1b90ff;--sapContent_Illustrative_Color22: #00144a;--sapContent_Illustrative_Color23: #d20a0a;--sapContent_Illustrative_Color24: #ffb2d2;--sapContent_Illustrative_Color25: #ffeaf4;--sapContent_Illustrative_Color26: #ffdf72;--sapContent_Illustrative_Color27: #fff8d6;--sapContent_Illustrative_Color28: #a93e00;--sapContent_Illustrative_Color29: #450b00;--sapContent_Illustrative_Color30: #340800;--sapContent_Illustrative_Color31: #ffab92;--sapContent_Space_S: 1rem;--sapContent_Space_M: 2rem;--sapContent_Space_L: 2rem;--sapContent_Space_XL: 3rem;--sapContent_Space_Tiny: 2rem;--sapContent_Space_Small: 1rem;--sapContent_Space_Medium: 2rem;--sapContent_Space_Large: 3rem;--sapContent_Margin_Tiny: 0 0 1rem;--sapContent_Margin_Small: 1rem;--sapContent_Margin_Medium: 1rem 2rem;--sapContent_Margin_Large: 1rem;--sapContent_Padding_S: 0rem;--sapContent_Padding_M: 2rem;--sapContent_Padding_L: 2rem;--sapContent_Padding_XL: 3rem;--sapContent_Gap: 1rem;--sapContent_Success_HeaderShadow: 0 .125rem .125rem 0 rgba(34,53,72,.05), inset 0 -.0625rem 0 0 #30914c;--sapContent_Warning_HeaderShadow: 0 .125rem .125rem 0 rgba(34,53,72,.05), inset 0 -.0625rem 0 0 #dd6100;--sapContent_Error_HeaderShadow: 0 .125rem .125rem 0 rgba(34,53,72,.05), inset 0 -.0625rem 0 0 #e90b0b;--sapContent_Information_HeaderShadow: 0 .125rem .125rem 0 rgba(34,53,72,.05), inset 0 -.0625rem 0 0 #0070f2;--sapFontLightFamily: "72-Light", "72-Lightfull", "72", "72full", Arial, Helvetica, sans-serif;--sapFontBoldFamily: "72-Bold", "72-Boldfull", "72", "72full", Arial, Helvetica, sans-serif;--sapFontSemiboldFamily: "72-Semibold", "72-Semiboldfull", "72", "72full", Arial, Helvetica, sans-serif;--sapFontSemiboldDuplexFamily: "72-SemiboldDuplex", "72-SemiboldDuplexfull", "72", "72full", Arial, Helvetica, sans-serif;--sapFontBlackFamily: "72Black", "72Blackfull","72", "72full", Arial, Helvetica, sans-serif;--sapFontHeaderFamily: "72-Bold", "72-Boldfull", "72", "72full", Arial, Helvetica, sans-serif;--sapFontSmallSize: .75rem;--sapFontLargeSize: 1rem;--sapFontHeader1Size: 3rem;--sapFontHeader2Size: 2rem;--sapFontHeader3Size: 1.5rem;--sapFontHeader4Size: 1.25rem;--sapFontHeader5Size: 1rem;--sapFontHeader6Size: .875rem;--sapLink_TextDecoration: none;--sapLink_Hover_Color: #0064d9;--sapLink_Hover_TextDecoration: underline;--sapLink_Active_Color: #0064d9;--sapLink_Active_TextDecoration: none;--sapLink_Visited_Color: #0064d9;--sapLink_InvertedColor: #a6cfff;--sapLink_SubtleColor: #1d2d3e;--sapShell_Background: #eff1f2;--sapShell_BackgroundImage: linear-gradient(to bottom, #eff1f2, #eff1f2);--sapShell_BackgroundImageOpacity: 1;--sapShell_BackgroundImageRepeat: false;--sapShell_BorderColor: #fff;--sapShell_TextColor: #1d2d3e;--sapShell_InteractiveBackground: #eff1f2;--sapShell_InteractiveTextColor: #1d2d3e;--sapShell_InteractiveBorderColor: #556b81;--sapShell_GroupTitleTextColor: #1d2d3e;--sapShell_GroupTitleTextShadow: 0 0 .125rem #fff;--sapShell_Hover_Background: #fff;--sapShell_Active_Background: #fff;--sapShell_Active_TextColor: #0070f2;--sapShell_Selected_Background: #fff;--sapShell_Selected_TextColor: #0070f2;--sapShell_Selected_Hover_Background: #fff;--sapShell_Favicon: none;--sapShell_Navigation_Background: #fff;--sapShell_Navigation_Hover_Background: #fff;--sapShell_Navigation_SelectedColor: #0064d9;--sapShell_Navigation_Selected_TextColor: #0064d9;--sapShell_Navigation_TextColor: #1d2d3e;--sapShell_Navigation_Active_TextColor: #0064d9;--sapShell_Navigation_Active_Background: #fff;--sapShell_Shadow: 0 .125rem .125rem 0 rgba(34,53,72,.15), inset 0 -.0625rem 0 0 rgba(34,53,72,.2);--sapShell_NegativeColor: #aa0808;--sapShell_CriticalColor: #b44f00;--sapShell_PositiveColor: #256f3a;--sapShell_InformativeColor: #0064d9;--sapShell_NeutralColor: #1d2d3e;--sapShell_Assistant_ForegroundColor: #5d36ff;--sapShell_SubBrand_TextColor: #003e87;--sapShell_Category_1_Background: #0057d2;--sapShell_Category_1_BorderColor: #0057d2;--sapShell_Category_1_TextColor: #fff;--sapShell_Category_1_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_2_Background: #df1278;--sapShell_Category_2_BorderColor: #df1278;--sapShell_Category_2_TextColor: #fff;--sapShell_Category_2_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_3_Background: #e76500;--sapShell_Category_3_BorderColor: #e76500;--sapShell_Category_3_TextColor: #fff;--sapShell_Category_3_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_4_Background: #7800a4;--sapShell_Category_4_BorderColor: #7800a4;--sapShell_Category_4_TextColor: #fff;--sapShell_Category_4_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_5_Background: #aa2608;--sapShell_Category_5_BorderColor: #aa2608;--sapShell_Category_5_TextColor: #fff;--sapShell_Category_5_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_6_Background: #07838f;--sapShell_Category_6_BorderColor: #07838f;--sapShell_Category_6_TextColor: #fff;--sapShell_Category_6_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_7_Background: #f31ded;--sapShell_Category_7_BorderColor: #f31ded;--sapShell_Category_7_TextColor: #fff;--sapShell_Category_7_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_8_Background: #188918;--sapShell_Category_8_BorderColor: #188918;--sapShell_Category_8_TextColor: #fff;--sapShell_Category_8_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_9_Background: #002a86;--sapShell_Category_9_BorderColor: #002a86;--sapShell_Category_9_TextColor: #fff;--sapShell_Category_9_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_10_Background: #5b738b;--sapShell_Category_10_BorderColor: #5b738b;--sapShell_Category_10_TextColor: #fff;--sapShell_Category_10_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_11_Background: #d20a0a;--sapShell_Category_11_BorderColor: #d20a0a;--sapShell_Category_11_TextColor: #fff;--sapShell_Category_11_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_12_Background: #7858ff;--sapShell_Category_12_BorderColor: #7858ff;--sapShell_Category_12_TextColor: #fff;--sapShell_Category_12_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_13_Background: #a00875;--sapShell_Category_13_BorderColor: #a00875;--sapShell_Category_13_TextColor: #fff;--sapShell_Category_13_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_14_Background: #14565b;--sapShell_Category_14_BorderColor: #14565b;--sapShell_Category_14_TextColor: #fff;--sapShell_Category_14_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_15_Background: #223548;--sapShell_Category_15_BorderColor: #223548;--sapShell_Category_15_TextColor: #fff;--sapShell_Category_15_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_16_Background: #1e592f;--sapShell_Category_16_BorderColor: #1e592f;--sapShell_Category_16_TextColor: #fff;--sapShell_Category_16_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Space_S: .5rem;--sapShell_Space_M: 2rem;--sapShell_Space_L: 2rem;--sapShell_Space_XL: 3rem;--sapShell_Gap_S: .5rem;--sapShell_Gap_M: 1rem;--sapShell_Gap_L: 1rem;--sapShell_Gap_XL: 1rem;--sapShell_GroupGap_S: 2rem;--sapShell_GroupGap_M: 3rem;--sapShell_GroupGap_L: 3rem;--sapShell_GroupGap_XL: 3rem;--sapAssistant_Color1: #5d36ff;--sapAssistant_Color2: #a100c2;--sapAssistant_BackgroundGradient: linear-gradient(#5d36ff, #a100c2);--sapAssistant_Background: #5d36ff;--sapAssistant_BorderColor: #5d36ff;--sapAssistant_TextColor: #fff;--sapAssistant_Hover_Background: #2800cf;--sapAssistant_Hover_BorderColor: #2800cf;--sapAssistant_Hover_TextColor: #fff;--sapAssistant_Active_Background: #fff;--sapAssistant_Active_BorderColor: #5d36ff;--sapAssistant_Active_TextColor: #5d36ff;--sapAssistant_Question_Background: #eae5ff;--sapAssistant_Question_BorderColor: #eae5ff;--sapAssistant_Question_TextColor: #1d2d3e;--sapAssistant_Answer_Background: #eff1f2;--sapAssistant_Answer_BorderColor: #eff1f2;--sapAssistant_Answer_TextColor: #1d2d3e;--sapAvatar_1_Background: #fff3b8;--sapAvatar_1_BorderColor: #fff3b8;--sapAvatar_1_TextColor: #a45d00;--sapAvatar_1_Hover_Background: #fff3b8;--sapAvatar_2_Background: #ffd0e7;--sapAvatar_2_BorderColor: #ffd0e7;--sapAvatar_2_TextColor: #aa0808;--sapAvatar_2_Hover_Background: #ffd0e7;--sapAvatar_3_Background: #ffdbe7;--sapAvatar_3_BorderColor: #ffdbe7;--sapAvatar_3_TextColor: #ba066c;--sapAvatar_3_Hover_Background: #ffdbe7;--sapAvatar_4_Background: #ffdcf3;--sapAvatar_4_BorderColor: #ffdcf3;--sapAvatar_4_TextColor: #a100c2;--sapAvatar_4_Hover_Background: #ffdcf3;--sapAvatar_5_Background: #ded3ff;--sapAvatar_5_BorderColor: #ded3ff;--sapAvatar_5_TextColor: #552cff;--sapAvatar_5_Hover_Background: #ded3ff;--sapAvatar_6_Background: #d1efff;--sapAvatar_6_BorderColor: #d1efff;--sapAvatar_6_TextColor: #0057d2;--sapAvatar_6_Hover_Background: #d1efff;--sapAvatar_7_Background: #c2fcee;--sapAvatar_7_BorderColor: #c2fcee;--sapAvatar_7_TextColor: #046c7a;--sapAvatar_7_Hover_Background: #c2fcee;--sapAvatar_8_Background: #ebf5cb;--sapAvatar_8_BorderColor: #ebf5cb;--sapAvatar_8_TextColor: #256f3a;--sapAvatar_8_Hover_Background: #ebf5cb;--sapAvatar_9_Background: #ddccf0;--sapAvatar_9_BorderColor: #ddccf0;--sapAvatar_9_TextColor: #6c32a9;--sapAvatar_9_Hover_Background: #ddccf0;--sapAvatar_10_Background: #eaecee;--sapAvatar_10_BorderColor: #eaecee;--sapAvatar_10_TextColor: #556b82;--sapAvatar_10_Hover_Background: #eaecee;--sapAvatar_Lite_BorderColor: transparent;--sapAvatar_Lite_Background: transparent;--sapAvatar_Hover_BorderColor: rgba(85,107,129,.25);--sapButton_Background: #fff;--sapButton_BorderColor: #bcc3ca;--sapButton_BorderWidth: .0625rem;--sapButton_BorderCornerRadius: .5rem;--sapButton_TextColor: #0064d9;--sapButton_FontFamily: "72-SemiboldDuplex", "72-SemiboldDuplexfull", "72", "72full", Arial, Helvetica, sans-serif;--sapButton_Hover_Background: #eaecee;--sapButton_Hover_BorderColor: #bcc3ca;--sapButton_Hover_TextColor: #0064d9;--sapButton_IconColor: #0064d9;--sapButton_Active_Background: #fff;--sapButton_Active_BorderColor: #0064d9;--sapButton_Active_TextColor: #0064d9;--sapButton_Emphasized_Background: #0070f2;--sapButton_Emphasized_BorderColor: #0070f2;--sapButton_Emphasized_BorderWidth: .0625rem;--sapButton_Emphasized_TextColor: #fff;--sapButton_Emphasized_FontFamily: "72-Bold", "72-Boldfull", "72", "72full", Arial, Helvetica, sans-serif;--sapButton_Emphasized_Hover_Background: #0064d9;--sapButton_Emphasized_Hover_BorderColor: #0064d9;--sapButton_Emphasized_Hover_TextColor: #fff;--sapButton_Emphasized_Active_Background: #fff;--sapButton_Emphasized_Active_BorderColor: #0064d9;--sapButton_Emphasized_Active_TextColor: #0064d9;--sapButton_Emphasized_TextShadow: transparent;--sapButton_Emphasized_FontWeight: bold;--sapButton_Reject_Background: #ffd6e9;--sapButton_Reject_BorderColor: #ffc2de;--sapButton_Reject_TextColor: #aa0808;--sapButton_Reject_Hover_Background: #ffbddb;--sapButton_Reject_Hover_BorderColor: #ffbddb;--sapButton_Reject_Hover_TextColor: #aa0808;--sapButton_Reject_Active_Background: #fff;--sapButton_Reject_Active_BorderColor: #e90b0b;--sapButton_Reject_Active_TextColor: #aa0808;--sapButton_Reject_Selected_Background: #fff;--sapButton_Reject_Selected_BorderColor: #e90b0b;--sapButton_Reject_Selected_TextColor: #aa0808;--sapButton_Reject_Selected_Hover_Background: #ffbddb;--sapButton_Reject_Selected_Hover_BorderColor: #e90b0b;--sapButton_Accept_Background: #ebf5cb;--sapButton_Accept_BorderColor: #dbeda0;--sapButton_Accept_TextColor: #256f3a;--sapButton_Accept_Hover_Background: #e3f1b6;--sapButton_Accept_Hover_BorderColor: #e3f1b6;--sapButton_Accept_Hover_TextColor: #256f3a;--sapButton_Accept_Active_Background: #fff;--sapButton_Accept_Active_BorderColor: #30914c;--sapButton_Accept_Active_TextColor: #256f3a;--sapButton_Accept_Selected_Background: #fff;--sapButton_Accept_Selected_BorderColor: #30914c;--sapButton_Accept_Selected_TextColor: #256f3a;--sapButton_Accept_Selected_Hover_Background: #e3f1b6;--sapButton_Accept_Selected_Hover_BorderColor: #30914c;--sapButton_Lite_Background: transparent;--sapButton_Lite_BorderColor: transparent;--sapButton_Lite_TextColor: #0064d9;--sapButton_Lite_Hover_Background: #eaecee;--sapButton_Lite_Hover_BorderColor: #bcc3ca;--sapButton_Lite_Hover_TextColor: #0064d9;--sapButton_Lite_Active_Background: #fff;--sapButton_Lite_Active_BorderColor: #0064d9;--sapButton_Selected_Background: #edf6ff;--sapButton_Selected_BorderColor: #0064d9;--sapButton_Selected_TextColor: #0064d9;--sapButton_Selected_Hover_Background: #d9ecff;--sapButton_Selected_Hover_BorderColor: #0064d9;--sapButton_Attention_Background: #fff3b7;--sapButton_Attention_BorderColor: #ffeb84;--sapButton_Attention_TextColor: #b44f00;--sapButton_Attention_Hover_Background: #ffef9e;--sapButton_Attention_Hover_BorderColor: #ffef9e;--sapButton_Attention_Hover_TextColor: #b44f00;--sapButton_Attention_Active_Background: #fff;--sapButton_Attention_Active_BorderColor: #dd6100;--sapButton_Attention_Active_TextColor: #b44f00;--sapButton_Attention_Selected_Background: #fff;--sapButton_Attention_Selected_BorderColor: #dd6100;--sapButton_Attention_Selected_TextColor: #b44f00;--sapButton_Attention_Selected_Hover_Background: #ffef9e;--sapButton_Attention_Selected_Hover_BorderColor: #dd6100;--sapButton_Negative_Background: #f53232;--sapButton_Negative_BorderColor: #f53232;--sapButton_Negative_TextColor: #fff;--sapButton_Negative_Hover_Background: #e90b0b;--sapButton_Negative_Hover_BorderColor: #e90b0b;--sapButton_Negative_Hover_TextColor: #fff;--sapButton_Negative_Active_Background: #fff;--sapButton_Negative_Active_BorderColor: #f53232;--sapButton_Negative_Active_TextColor: #aa0808;--sapButton_Critical_Background: #e76500;--sapButton_Critical_BorderColor: #e76500;--sapButton_Critical_TextColor: #fff;--sapButton_Critical_Hover_Background: #dd6100;--sapButton_Critical_Hover_BorderColor: #dd6100;--sapButton_Critical_Hover_TextColor: #fff;--sapButton_Critical_Active_Background: #fff;--sapButton_Critical_Active_BorderColor: #dd6100;--sapButton_Critical_Active_TextColor: #b44f00;--sapButton_Success_Background: #30914c;--sapButton_Success_BorderColor: #30914c;--sapButton_Success_TextColor: #fff;--sapButton_Success_Hover_Background: #2c8646;--sapButton_Success_Hover_BorderColor: #2c8646;--sapButton_Success_Hover_TextColor: #fff;--sapButton_Success_Active_Background: #fff;--sapButton_Success_Active_BorderColor: #30914c;--sapButton_Success_Active_TextColor: #256f3a;--sapButton_Information_Background: #e8f3ff;--sapButton_Information_BorderColor: #b5d8ff;--sapButton_Information_TextColor: #0064d9;--sapButton_Information_Hover_Background: #d4e8ff;--sapButton_Information_Hover_BorderColor: #b5d8ff;--sapButton_Information_Hover_TextColor: #0064d9;--sapButton_Information_Active_Background: #fff;--sapButton_Information_Active_BorderColor: #0064d9;--sapButton_Information_Active_TextColor: #0064d9;--sapButton_Neutral_Background: #e8f3ff;--sapButton_Neutral_BorderColor: #b5d8ff;--sapButton_Neutral_TextColor: #0064d9;--sapButton_Neutral_Hover_Background: #d4e8ff;--sapButton_Neutral_Hover_BorderColor: #b5d8ff;--sapButton_Neutral_Hover_TextColor: #0064d9;--sapButton_Neutral_Active_Background: #fff;--sapButton_Neutral_Active_BorderColor: #0064d9;--sapButton_Neutral_Active_TextColor: #0064d9;--sapButton_Track_Background: #788fa6;--sapButton_Track_BorderColor: #788fa6;--sapButton_Track_TextColor: #fff;--sapButton_Track_Hover_Background: #637d97;--sapButton_Track_Hover_BorderColor: #637d97;--sapButton_Track_Selected_Background: #0064d9;--sapButton_Track_Selected_BorderColor: #0064d9;--sapButton_Track_Selected_TextColor: #fff;--sapButton_Track_Selected_Hover_Background: #0058c0;--sapButton_Track_Selected_Hover_BorderColor: #0058c0;--sapButton_Handle_Background: #fff;--sapButton_Handle_BorderColor: #fff;--sapButton_Handle_TextColor: #1d2d3e;--sapButton_Handle_Hover_Background: #fff;--sapButton_Handle_Hover_BorderColor: rgba(255,255,255,.5);--sapButton_Handle_Selected_Background: #edf6ff;--sapButton_Handle_Selected_BorderColor: #edf6ff;--sapButton_Handle_Selected_TextColor: #0064d9;--sapButton_Handle_Selected_Hover_Background: #edf6ff;--sapButton_Handle_Selected_Hover_BorderColor: rgba(237,246,255,.5);--sapButton_Track_Negative_Background: #f53232;--sapButton_Track_Negative_BorderColor: #f53232;--sapButton_Track_Negative_TextColor: #fff;--sapButton_Track_Negative_Hover_Background: #e90b0b;--sapButton_Track_Negative_Hover_BorderColor: #e90b0b;--sapButton_Handle_Negative_Background: #fff;--sapButton_Handle_Negative_BorderColor: #fff;--sapButton_Handle_Negative_TextColor: #aa0808;--sapButton_Handle_Negative_Hover_Background: #fff;--sapButton_Handle_Negative_Hover_BorderColor: rgba(255,255,255,.5);--sapButton_Track_Positive_Background: #30914c;--sapButton_Track_Positive_BorderColor: #30914c;--sapButton_Track_Positive_TextColor: #fff;--sapButton_Track_Positive_Hover_Background: #2c8646;--sapButton_Track_Positive_Hover_BorderColor: #2c8646;--sapButton_Handle_Positive_Background: #fff;--sapButton_Handle_Positive_BorderColor: #fff;--sapButton_Handle_Positive_TextColor: #256f3a;--sapButton_Handle_Positive_Hover_Background: #fff;--sapButton_Handle_Positive_Hover_BorderColor: rgba(255,255,255,.5);--sapButton_TokenBackground: #fff;--sapButton_TokenBorderColor: #bcc3ca;--sapButton_TokenBorderCornerRadius: .375rem;--sapButton_Selected_TokenBorderWidth: .125rem;--sapButton_ReadOnly_TokenBackground: #fff;--sapButton_Segment_BorderCornerRadius: .5rem;--sapField_Background: #fff;--sapField_BackgroundStyle: 0 100% / 100% .0625rem no-repeat linear-gradient(0deg, #556b81, #556b81) border-box;--sapField_TextColor: #131e29;--sapField_PlaceholderTextColor: #556b82;--sapField_BorderColor: #556b81;--sapField_HelpBackground: #fff;--sapField_BorderWidth: .0625rem;--sapField_BorderStyle: none;--sapField_BorderCornerRadius: .25rem;--sapField_Shadow: inset 0 0 0 .0625rem rgba(85,107,129,.25);--sapField_Hover_Background: #fff;--sapField_Hover_BackgroundStyle: 0 100% / 100% .0625rem no-repeat linear-gradient(0deg, #0064d9, #0064d9) border-box;--sapField_Hover_BorderColor: #0064d9;--sapField_Hover_HelpBackground: #fff;--sapField_Hover_Shadow: inset 0 0 0 .0625rem rgba(79,160,255,.5);--sapField_Hover_InvalidShadow: inset 0 0 0 .0625rem rgba(255,142,196,.45);--sapField_Hover_WarningShadow: inset 0 0 0 .0625rem rgba(255,213,10,.4);--sapField_Hover_SuccessShadow: inset 0 0 0 .0625rem rgba(48,145,76,.18);--sapField_Hover_InformationShadow: inset 0 0 0 .0625rem rgba(104,174,255,.5);--sapField_Active_BorderColor: #0064d9;--sapField_Focus_Background: #fff;--sapField_Focus_BorderColor: #0032a5;--sapField_Focus_HelpBackground: #fff;--sapField_ReadOnly_Background: #eaecee;--sapField_ReadOnly_BackgroundStyle: 0 100% / .375rem .0625rem repeat-x linear-gradient(90deg, #556b81 0, #556b81 .25rem, transparent .25rem) border-box;--sapField_ReadOnly_BorderColor: #556b81;--sapField_ReadOnly_BorderStyle: none;--sapField_ReadOnly_HelpBackground: #eaecee;--sapField_RequiredColor: #ba066c;--sapField_InvalidColor: #e90b0b;--sapField_InvalidBackground: #ffeaf4;--sapField_InvalidBackgroundStyle: 0 100% / 100% .125rem no-repeat linear-gradient(0deg, #e90b0b, #e90b0b) border-box;--sapField_InvalidBorderWidth: .125rem;--sapField_InvalidBorderStyle: none;--sapField_InvalidShadow: inset 0 0 0 .0625rem rgba(255,142,196,.45);--sapField_WarningColor: #dd6100;--sapField_WarningBackground: #fff8d6;--sapField_WarningBackgroundStyle: 0 100% / 100% .125rem no-repeat linear-gradient(0deg, #dd6100, #dd6100) border-box;--sapField_WarningBorderWidth: .125rem;--sapField_WarningBorderStyle: none;--sapField_WarningShadow: inset 0 0 0 .0625rem rgba(255,213,10,.4);--sapField_SuccessColor: #30914c;--sapField_SuccessBackground: #f5fae5;--sapField_SuccessBackgroundStyle: 0 100% / 100% .0625rem no-repeat linear-gradient(0deg, #30914c, #30914c) border-box;--sapField_SuccessBorderWidth: .0625rem;--sapField_SuccessBorderStyle: none;--sapField_SuccessShadow: inset 0 0 0 .0625rem rgba(48,145,76,.18);--sapField_InformationColor: #0070f2;--sapField_InformationBackground: #e1f4ff;--sapField_InformationBackgroundStyle: 0 100% / 100% .125rem no-repeat linear-gradient(0deg, #0070f2, #0070f2) border-box;--sapField_InformationBorderWidth: .125rem;--sapField_InformationBorderStyle: none;--sapField_InformationShadow: inset 0 0 0 .0625rem rgba(104,174,255,.5);--sapField_Selector_Hover_Background: #e3f0ff;--sapField_Selector_Hover_InvalidBackground: #fff;--sapField_Selector_Hover_WarningBackground: #fff;--sapField_Selector_Hover_SuccessBackground: #fff;--sapField_Selector_Hover_InformationBackground: #fff;--sapField_Picker_BorderColor: #556b81;--sapField_Picker_BorderWidth: .0625rem;--sapField_Selector_BorderStyle: solid;--sapField_Selector_ReadOnly_BorderStyle: dashed;--sapField_Selector_InvalidBorderStyle: solid;--sapField_Selector_WarningBorderStyle: solid;--sapField_Selector_SuccessBorderStyle: solid;--sapField_Selector_InformationBorderStyle: solid;--sapGroup_TitleBorderWidth: .0625rem;--sapGroup_TitleBackground: #fff;--sapGroup_TitleBorderColor: #a8b2bd;--sapGroup_TitleTextColor: #1d2d3e;--sapGroup_Title_FontSize: 1rem;--sapGroup_ContentBackground: #fff;--sapGroup_ContentBorderColor: #d9d9d9;--sapGroup_BorderWidth: .0625rem;--sapGroup_BorderCornerRadius: .75rem;--sapGroup_FooterBackground: transparent;--sapToolbar_Background: #fff;--sapToolbar_SeparatorColor: #d9d9d9;--sapList_HeaderBackground: #fff;--sapList_HeaderBorderColor: #a8b2bd;--sapList_HeaderTextColor: #1d2d3e;--sapList_BorderColor: #e5e5e5;--sapList_BorderWidth: .0625rem;--sapList_TextColor: #1d2d3e;--sapList_Active_TextColor: #1d2d3e;--sapList_Active_Background: #dee2e5;--sapList_SelectionBackgroundColor: #ebf8ff;--sapList_SelectionBorderColor: #0064d9;--sapList_Hover_SelectionBackground: #dcf3ff;--sapList_Background: #fff;--sapList_Hover_Background: #eaecee;--sapList_AlternatingBackground: #f5f6f7;--sapList_GroupHeaderBackground: #fff;--sapList_GroupHeaderBorderColor: #a8b2bd;--sapList_GroupHeaderTextColor: #1d2d3e;--sapList_TableGroupHeaderBackground: #eff1f2;--sapList_TableGroupHeaderBorderColor: #a8b2bd;--sapList_TableGroupHeaderTextColor: #1d2d3e;--sapList_FooterBackground: #fff;--sapList_FooterTextColor: #1d2d3e;--sapList_TableFooterBorder: #a8b2bd;--sapList_TableFixedBorderColor: #8c8c8c;--sapList_TableFixedColumnBorderWidth: .0625rem;--sapList_TableFixedRowBorderWidth: .125rem;--sapMessage_BorderWidth: .0625rem;--sapMessage_ErrorBorderColor: #ff8ec4;--sapMessage_WarningBorderColor: #ffe770;--sapMessage_SuccessBorderColor: #cee67e;--sapMessage_InformationBorderColor: #7bcfff;--sapMessage_Button_Hover_Background: rgba(234,236,238,.2);--sapPopover_BorderCornerRadius: .5rem;--sapProgress_Background: #d5dadd;--sapProgress_BorderColor: #d5dadd;--sapProgress_TextColor: #1d2d3e;--sapProgress_FontSize: .875rem;--sapProgress_NegativeBackground: #ffdbec;--sapProgress_NegativeBorderColor: #ffdbec;--sapProgress_NegativeTextColor: #1d2d3e;--sapProgress_CriticalBackground: #fff4bd;--sapProgress_CriticalBorderColor: #fff4bd;--sapProgress_CriticalTextColor: #1d2d3e;--sapProgress_PositiveBackground: #e5f2ba;--sapProgress_PositiveBorderColor: #e5f2ba;--sapProgress_PositiveTextColor: #1d2d3e;--sapProgress_InformationBackground: #cdedff;--sapProgress_InformationBorderColor: #cdedff;--sapProgress_InformationTextColor: #1d2d3e;--sapProgress_Value_Background: #617b94;--sapProgress_Value_BorderColor: #617b94;--sapProgress_Value_TextColor: #788fa6;--sapProgress_Value_NegativeBackground: #f53232;--sapProgress_Value_NegativeBorderColor: #f53232;--sapProgress_Value_NegativeTextColor: #f53232;--sapProgress_Value_CriticalBackground: #e76500;--sapProgress_Value_CriticalBorderColor: #e76500;--sapProgress_Value_CriticalTextColor: #e76500;--sapProgress_Value_PositiveBackground: #30914c;--sapProgress_Value_PositiveBorderColor: #30914c;--sapProgress_Value_PositiveTextColor: #30914c;--sapProgress_Value_InformationBackground: #0070f2;--sapProgress_Value_InformationBorderColor: #0070f2;--sapProgress_Value_InformationTextColor: #0070f2;--sapScrollBar_FaceColor: #7b91a8;--sapScrollBar_TrackColor: #fff;--sapScrollBar_BorderColor: #7b91a8;--sapScrollBar_SymbolColor: #0064d9;--sapScrollBar_Dimension: .75rem;--sapScrollBar_Hover_FaceColor: #5b728b;--sapSlider_Background: #d5dadd;--sapSlider_BorderColor: #d5dadd;--sapSlider_Selected_Background: #0064d9;--sapSlider_Selected_BorderColor: #0064d9;--sapSlider_Selected_Dimension: 111px;--sapSlider_HandleBackground: #fff;--sapSlider_HandleBorderColor: #b0d5ff;--sapSlider_RangeHandleBackground: #fff;--sapSlider_Hover_HandleBackground: #d9ecff;--sapSlider_Hover_HandleBorderColor: #b0d5ff;--sapSlider_Hover_RangeHandleBackground: #d9ecff;--sapSlider_Active_HandleBackground: #fff;--sapSlider_Active_HandleBorderColor: #0064d9;--sapSlider_Active_RangeHandleBackground: transparent;--sapPageHeader_Background: #fff;--sapPageHeader_BorderColor: #d9d9d9;--sapPageHeader_TextColor: #1d2d3e;--sapPageFooter_Background: #fff;--sapPageFooter_BorderColor: #d9d9d9;--sapPageFooter_TextColor: #1d2d3e;--sapInfobar_Background: #c2fcee;--sapInfobar_Hover_Background: #fff;--sapInfobar_Active_Background: #fff;--sapInfobar_NonInteractive_Background: #f5f6f7;--sapInfobar_TextColor: #046c7a;--sapObjectHeader_Background: #fff;--sapObjectHeader_Hover_Background: #eaecee;--sapObjectHeader_BorderColor: #d9d9d9;--sapObjectHeader_Title_TextColor: #1d2d3e;--sapObjectHeader_Title_FontSize: 1.5rem;--sapObjectHeader_Title_SnappedFontSize: 1.25rem;--sapObjectHeader_Title_FontFamily: "72Black", "72Blackfull","72", "72full", Arial, Helvetica, sans-serif;--sapObjectHeader_Subtitle_TextColor: #556b82;--sapBlockLayer_Background: #000;--sapBlockLayer_Opacity: .2;--sapTab_TextColor: #1d2d3e;--sapTab_ForegroundColor: #0064d9;--sapTab_IconColor: #0064d9;--sapTab_Background: #fff;--sapTab_Selected_TextColor: #0064d9;--sapTab_Selected_IconColor: #fff;--sapTab_Selected_Background: #0064d9;--sapTab_Selected_Indicator_Dimension: .1875rem;--sapTab_Positive_TextColor: #256f3a;--sapTab_Positive_ForegroundColor: #30914c;--sapTab_Positive_IconColor: #30914c;--sapTab_Positive_Selected_TextColor: #256f3a;--sapTab_Positive_Selected_IconColor: #fff;--sapTab_Positive_Selected_Background: #30914c;--sapTab_Negative_TextColor: #aa0808;--sapTab_Negative_ForegroundColor: #f53232;--sapTab_Negative_IconColor: #f53232;--sapTab_Negative_Selected_TextColor: #aa0808;--sapTab_Negative_Selected_IconColor: #fff;--sapTab_Negative_Selected_Background: #f53232;--sapTab_Critical_TextColor: #b44f00;--sapTab_Critical_ForegroundColor: #e76500;--sapTab_Critical_IconColor: #e76500;--sapTab_Critical_Selected_TextColor: #b44f00;--sapTab_Critical_Selected_IconColor: #fff;--sapTab_Critical_Selected_Background: #e76500;--sapTile_Background: #fff;--sapTile_Hover_Background: #eaecee;--sapTile_Active_Background: #dee2e5;--sapTile_BorderColor: transparent;--sapTile_BorderCornerRadius: 1rem;--sapTile_TitleTextColor: #1d2d3e;--sapTile_TextColor: #556b82;--sapTile_IconColor: #556b82;--sapTile_SeparatorColor: #ccc;--sapTile_Interactive_BorderColor: #b3b3b3;--sapTile_OverlayBackground: #fff;--sapTile_OverlayForegroundColor: #1d2d3e;--sapTile_Hover_ContentBackground: #fff;--sapTile_Active_ContentBackground: #fff;--sapAccentColor1: #d27700;--sapAccentColor2: #aa0808;--sapAccentColor3: #ba066c;--sapAccentColor4: #a100c2;--sapAccentColor5: #5d36ff;--sapAccentColor6: #0057d2;--sapAccentColor7: #046c7a;--sapAccentColor8: #256f3a;--sapAccentColor9: #6c32a9;--sapAccentColor10: #5b738b;--sapAccentBackgroundColor1: #fff3b8;--sapAccentBackgroundColor2: #ffd0e7;--sapAccentBackgroundColor3: #ffdbe7;--sapAccentBackgroundColor4: #ffdcf3;--sapAccentBackgroundColor5: #ded3ff;--sapAccentBackgroundColor6: #d1efff;--sapAccentBackgroundColor7: #c2fcee;--sapAccentBackgroundColor8: #ebf5cb;--sapAccentBackgroundColor9: #ddccf0;--sapAccentBackgroundColor10: #eaecee;--sapIndicationColor_1: #840606;--sapIndicationColor_1_Background: #840606;--sapIndicationColor_1_BorderColor: #840606;--sapIndicationColor_1_TextColor: #fff;--sapIndicationColor_1_Hover_Background: #6c0505;--sapIndicationColor_1_Active_Background: #fff;--sapIndicationColor_1_Active_BorderColor: #fb9d9d;--sapIndicationColor_1_Active_TextColor: #840606;--sapIndicationColor_1_Selected_Background: #fff;--sapIndicationColor_1_Selected_BorderColor: #fb9d9d;--sapIndicationColor_1_Selected_TextColor: #840606;--sapIndicationColor_1b: #fb9d9d;--sapIndicationColor_1b_TextColor: #840606;--sapIndicationColor_1b_Background: #fb9d9d;--sapIndicationColor_1b_BorderColor: #fb9d9d;--sapIndicationColor_1b_Hover_Background: #fa8585;--sapIndicationColor_2: #aa0808;--sapIndicationColor_2_Background: #aa0808;--sapIndicationColor_2_BorderColor: #aa0808;--sapIndicationColor_2_TextColor: #fff;--sapIndicationColor_2_Hover_Background: #920707;--sapIndicationColor_2_Active_Background: #fff;--sapIndicationColor_2_Active_BorderColor: #fcc4c4;--sapIndicationColor_2_Active_TextColor: #aa0808;--sapIndicationColor_2_Selected_Background: #fff;--sapIndicationColor_2_Selected_BorderColor: #fcc4c4;--sapIndicationColor_2_Selected_TextColor: #aa0808;--sapIndicationColor_2b: #fcc4c4;--sapIndicationColor_2b_TextColor: #aa0808;--sapIndicationColor_2b_Background: #fcc4c4;--sapIndicationColor_2b_BorderColor: #fcc4c4;--sapIndicationColor_2b_Hover_Background: #fbacac;--sapIndicationColor_3: #b95100;--sapIndicationColor_3_Background: #e76500;--sapIndicationColor_3_BorderColor: #e76500;--sapIndicationColor_3_TextColor: #fff;--sapIndicationColor_3_Hover_Background: #d85e00;--sapIndicationColor_3_Active_Background: #fff;--sapIndicationColor_3_Active_BorderColor: #fff2c0;--sapIndicationColor_3_Active_TextColor: #b95100;--sapIndicationColor_3_Selected_Background: #fff;--sapIndicationColor_3_Selected_BorderColor: #fff2c0;--sapIndicationColor_3_Selected_TextColor: #b95100;--sapIndicationColor_3b: #fff2c0;--sapIndicationColor_3b_TextColor: #b95100;--sapIndicationColor_3b_Background: #fff2c0;--sapIndicationColor_3b_BorderColor: #fff2c0;--sapIndicationColor_3b_Hover_Background: #ffeda6;--sapIndicationColor_4: #256f3a;--sapIndicationColor_4_Background: #256f3a;--sapIndicationColor_4_BorderColor: #256f3a;--sapIndicationColor_4_TextColor: #fff;--sapIndicationColor_4_Hover_Background: #1f5c30;--sapIndicationColor_4_Active_Background: #fff;--sapIndicationColor_4_Active_BorderColor: #bae8bc;--sapIndicationColor_4_Active_TextColor: #256f3a;--sapIndicationColor_4_Selected_Background: #fff;--sapIndicationColor_4_Selected_BorderColor: #bae8bc;--sapIndicationColor_4_Selected_TextColor: #256f3a;--sapIndicationColor_4b: #bae8bc;--sapIndicationColor_4b_TextColor: #256f3a;--sapIndicationColor_4b_Background: #bae8bc;--sapIndicationColor_4b_BorderColor: #bae8bc;--sapIndicationColor_4b_Hover_Background: #a7e2a9;--sapIndicationColor_5: #0070f2;--sapIndicationColor_5_Background: #0070f2;--sapIndicationColor_5_BorderColor: #0070f2;--sapIndicationColor_5_TextColor: #fff;--sapIndicationColor_5_Hover_Background: #0064d9;--sapIndicationColor_5_Active_Background: #fff;--sapIndicationColor_5_Active_BorderColor: #d3effd;--sapIndicationColor_5_Active_TextColor: #0070f2;--sapIndicationColor_5_Selected_Background: #fff;--sapIndicationColor_5_Selected_BorderColor: #d3effd;--sapIndicationColor_5_Selected_TextColor: #0070f2;--sapIndicationColor_5b: #d3effd;--sapIndicationColor_5b_TextColor: #0070f2;--sapIndicationColor_5b_Background: #d3effd;--sapIndicationColor_5b_BorderColor: #d3effd;--sapIndicationColor_5b_Hover_Background: #bbe6fc;--sapIndicationColor_6: #046c7a;--sapIndicationColor_6_Background: #046c7a;--sapIndicationColor_6_BorderColor: #046c7a;--sapIndicationColor_6_TextColor: #fff;--sapIndicationColor_6_Hover_Background: #035661;--sapIndicationColor_6_Active_Background: #fff;--sapIndicationColor_6_Active_BorderColor: #cdf5ec;--sapIndicationColor_6_Active_TextColor: #046c7a;--sapIndicationColor_6_Selected_Background: #fff;--sapIndicationColor_6_Selected_BorderColor: #cdf5ec;--sapIndicationColor_6_Selected_TextColor: #046c7a;--sapIndicationColor_6b: #cdf5ec;--sapIndicationColor_6b_TextColor: #046c7a;--sapIndicationColor_6b_Background: #cdf5ec;--sapIndicationColor_6b_BorderColor: #cdf5ec;--sapIndicationColor_6b_Hover_Background: #b8f1e4;--sapIndicationColor_7: #5d36ff;--sapIndicationColor_7_Background: #5d36ff;--sapIndicationColor_7_BorderColor: #5d36ff;--sapIndicationColor_7_TextColor: #fff;--sapIndicationColor_7_Hover_Background: #481cff;--sapIndicationColor_7_Active_Background: #fff;--sapIndicationColor_7_Active_BorderColor: #e2dbff;--sapIndicationColor_7_Active_TextColor: #5d36ff;--sapIndicationColor_7_Selected_Background: #fff;--sapIndicationColor_7_Selected_BorderColor: #e2dbff;--sapIndicationColor_7_Selected_TextColor: #5d36ff;--sapIndicationColor_7b: #e2dbff;--sapIndicationColor_7b_TextColor: #5d36ff;--sapIndicationColor_7b_Background: #e2dbff;--sapIndicationColor_7b_BorderColor: #e2dbff;--sapIndicationColor_7b_Hover_Background: #cdc2ff;--sapIndicationColor_8: #a100c2;--sapIndicationColor_8_Background: #a100c2;--sapIndicationColor_8_BorderColor: #a100c2;--sapIndicationColor_8_TextColor: #fff;--sapIndicationColor_8_Hover_Background: #8c00a9;--sapIndicationColor_8_Active_Background: #fff;--sapIndicationColor_8_Active_BorderColor: #f8d6ff;--sapIndicationColor_8_Active_TextColor: #a100c2;--sapIndicationColor_8_Selected_Background: #fff;--sapIndicationColor_8_Selected_BorderColor: #f8d6ff;--sapIndicationColor_8_Selected_TextColor: #a100c2;--sapIndicationColor_8b: #f8d6ff;--sapIndicationColor_8b_TextColor: #a100c2;--sapIndicationColor_8b_Background: #f8d6ff;--sapIndicationColor_8b_BorderColor: #f8d6ff;--sapIndicationColor_8b_Hover_Background: #f4bdff;--sapIndicationColor_9: #1d2d3e;--sapIndicationColor_9_Background: #1d2d3e;--sapIndicationColor_9_BorderColor: #1d2d3e;--sapIndicationColor_9_TextColor: #fff;--sapIndicationColor_9_Hover_Background: #15202d;--sapIndicationColor_9_Active_Background: #fff;--sapIndicationColor_9_Active_BorderColor: #d9d9d9;--sapIndicationColor_9_Active_TextColor: #1d2d3e;--sapIndicationColor_9_Selected_Background: #fff;--sapIndicationColor_9_Selected_BorderColor: #d9d9d9;--sapIndicationColor_9_Selected_TextColor: #1d2d3e;--sapIndicationColor_9b: #fff;--sapIndicationColor_9b_TextColor: #1d2d3e;--sapIndicationColor_9b_Background: #fff;--sapIndicationColor_9b_BorderColor: #d9d9d9;--sapIndicationColor_9b_Hover_Background: #f2f2f2;--sapIndicationColor_10: #45484a;--sapIndicationColor_10_Background: #83888b;--sapIndicationColor_10_BorderColor: #83888b;--sapIndicationColor_10_TextColor: #fff;--sapIndicationColor_10_Hover_Background: #767b7e;--sapIndicationColor_10_Active_Background: #fff;--sapIndicationColor_10_Active_BorderColor: #eaecee;--sapIndicationColor_10_Active_TextColor: #45484a;--sapIndicationColor_10_Selected_Background: #fff;--sapIndicationColor_10_Selected_BorderColor: #eaecee;--sapIndicationColor_10_Selected_TextColor: #45484a;--sapIndicationColor_10b: #eaecee;--sapIndicationColor_10b_TextColor: #45484a;--sapIndicationColor_10b_Background: #eaecee;--sapIndicationColor_10b_BorderColor: #eaecee;--sapIndicationColor_10b_Hover_Background: #dcdfe3;--sapLegend_WorkingBackground: #fff;--sapLegend_NonWorkingBackground: #ebebeb;--sapLegend_CurrentDateTime: #a100c2;--sapLegendColor1: #c35500;--sapLegendColor2: #d23a0a;--sapLegendColor3: #df1278;--sapLegendColor4: #840606;--sapLegendColor5: #cc00dc;--sapLegendColor6: #0057d2;--sapLegendColor7: #07838f;--sapLegendColor8: #188918;--sapLegendColor9: #5b738b;--sapLegendColor10: #7800a4;--sapLegendColor11: #a93e00;--sapLegendColor12: #aa2608;--sapLegendColor13: #ba066c;--sapLegendColor14: #8d2a00;--sapLegendColor15: #4e247a;--sapLegendColor16: #002a86;--sapLegendColor17: #035663;--sapLegendColor18: #1e592f;--sapLegendColor19: #1a4796;--sapLegendColor20: #470ced;--sapLegendBackgroundColor1: #ffef9f;--sapLegendBackgroundColor2: #feeae1;--sapLegendBackgroundColor3: #fbf6f8;--sapLegendBackgroundColor4: #fbebeb;--sapLegendBackgroundColor5: #ffe5fe;--sapLegendBackgroundColor6: #d1efff;--sapLegendBackgroundColor7: #c2fcee;--sapLegendBackgroundColor8: #f5fae5;--sapLegendBackgroundColor9: #f5f6f7;--sapLegendBackgroundColor10: #fff0fa;--sapLegendBackgroundColor11: #fff8d6;--sapLegendBackgroundColor12: #fff6f6;--sapLegendBackgroundColor13: #f7ebef;--sapLegendBackgroundColor14: #f1ecd5;--sapLegendBackgroundColor15: #f0e7f8;--sapLegendBackgroundColor16: #ebf8ff;--sapLegendBackgroundColor17: #dafdf5;--sapLegendBackgroundColor18: #ebf5cb;--sapLegendBackgroundColor19: #fafdff;--sapLegendBackgroundColor20: #eceeff;--sapChart_Background: #fff;--sapChart_ContrastTextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapChart_ContrastShadowColor: #fff;--sapChart_ContrastLineColor: #fff;--sapChart_LineColor_1: #e1e6eb;--sapChart_LineColor_2: #768da4;--sapChart_LineColor_3: #000001;--sapChart_Choropleth_Background: #edf0f3;--sapChart_ChoroplethRegion_Background: #758ca4;--sapChart_ChoroplethRegion_BorderColor: #edf0f3;--sapChart_Data_TextColor: #000;--sapChart_Data_ContrastTextColor: #fff;--sapChart_Data_InteractiveColor: #000001;--sapChart_Data_Active_Background: #dee2e5;--sapChart_OrderedColor_1: #168eff;--sapChart_OrderedColor_2: #c87b00;--sapChart_OrderedColor_3: #75980b;--sapChart_OrderedColor_4: #df1278;--sapChart_OrderedColor_5: #8b47d7;--sapChart_OrderedColor_6: #049f9a;--sapChart_OrderedColor_7: #0070f2;--sapChart_OrderedColor_8: #cc00dc;--sapChart_OrderedColor_9: #798c77;--sapChart_OrderedColor_10: #da6c6c;--sapChart_OrderedColor_11: #5d36ff;--sapChart_OrderedColor_12: #a68a5b;--sapChart_Bad: #f53232;--sapChart_Critical: #e26300;--sapChart_Good: #30914c;--sapChart_Neutral: #758ca4;--sapChart_Sequence_1_Plus3: #96ccff;--sapChart_Sequence_1_Plus3_TextColor: #000;--sapChart_Sequence_1_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_1_Plus2: #3b9ffe;--sapChart_Sequence_1_Plus2_TextColor: #000;--sapChart_Sequence_1_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_1_Plus1: #3fa2ff;--sapChart_Sequence_1_Plus1_TextColor: #000;--sapChart_Sequence_1_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_1: #168eff;--sapChart_Sequence_1_TextColor: #000;--sapChart_Sequence_1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_1_BorderColor: #168eff;--sapChart_Sequence_1_Minus1: #077cea;--sapChart_Sequence_1_Minus1_TextColor: #fff;--sapChart_Sequence_1_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_1_Minus2: #077cea;--sapChart_Sequence_1_Minus2_TextColor: #fff;--sapChart_Sequence_1_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_1_Minus3: #06559e;--sapChart_Sequence_1_Minus3_TextColor: #fff;--sapChart_Sequence_1_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_1_Minus4: #054887;--sapChart_Sequence_1_Minus4_TextColor: #fff;--sapChart_Sequence_1_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_1_Minus5: #043b6e;--sapChart_Sequence_1_Minus5_TextColor: #fff;--sapChart_Sequence_1_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_2_Plus3: #efbf72;--sapChart_Sequence_2_Plus3_TextColor: #000;--sapChart_Sequence_2_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_2_Plus2: #eaaa44;--sapChart_Sequence_2_Plus2_TextColor: #000;--sapChart_Sequence_2_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_2_Plus1: #e29419;--sapChart_Sequence_2_Plus1_TextColor: #000;--sapChart_Sequence_2_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_2: #c87b00;--sapChart_Sequence_2_TextColor: #000;--sapChart_Sequence_2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_2_BorderColor: #9f6200;--sapChart_Sequence_2_Minus1: #9f6200;--sapChart_Sequence_2_Minus1_TextColor: #fff;--sapChart_Sequence_2_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_2_Minus2: #7c4c00;--sapChart_Sequence_2_Minus2_TextColor: #fff;--sapChart_Sequence_2_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_2_Minus3: #623c00;--sapChart_Sequence_2_Minus3_TextColor: #fff;--sapChart_Sequence_2_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_2_Minus4: #623c00;--sapChart_Sequence_2_Minus4_TextColor: #fff;--sapChart_Sequence_2_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_2_Minus5: #2f1d00;--sapChart_Sequence_2_Minus5_TextColor: #fff;--sapChart_Sequence_2_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_3_Plus3: #b9d369;--sapChart_Sequence_3_Plus3_TextColor: #000;--sapChart_Sequence_3_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_3_Plus2: #a6c742;--sapChart_Sequence_3_Plus2_TextColor: #000;--sapChart_Sequence_3_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_3_Plus1: #8fad33;--sapChart_Sequence_3_Plus1_TextColor: #000;--sapChart_Sequence_3_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_3: #75980b;--sapChart_Sequence_3_TextColor: #000;--sapChart_Sequence_3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_3_BorderColor: #587208;--sapChart_Sequence_3_Minus1: #587208;--sapChart_Sequence_3_Minus1_TextColor: #fff;--sapChart_Sequence_3_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_3_Minus2: #3e5106;--sapChart_Sequence_3_Minus2_TextColor: #fff;--sapChart_Sequence_3_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_3_Minus3: #2c3904;--sapChart_Sequence_3_Minus3_TextColor: #fff;--sapChart_Sequence_3_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_3_Minus4: #212b03;--sapChart_Sequence_3_Minus4_TextColor: #fff;--sapChart_Sequence_3_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_3_Minus5: #161c02;--sapChart_Sequence_3_Minus5_TextColor: #fff;--sapChart_Sequence_3_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_4_Plus3: #f473b3;--sapChart_Sequence_4_Plus3_TextColor: #000;--sapChart_Sequence_4_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_4_Plus2: #f14d9e;--sapChart_Sequence_4_Plus2_TextColor: #000;--sapChart_Sequence_4_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_4_Plus1: #ee278a;--sapChart_Sequence_4_Plus1_TextColor: #000;--sapChart_Sequence_4_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_4: #df1278;--sapChart_Sequence_4_TextColor: #fff;--sapChart_Sequence_4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_4_BorderColor: #df1278;--sapChart_Sequence_4_Minus1: #b90f64;--sapChart_Sequence_4_Minus1_TextColor: #fff;--sapChart_Sequence_4_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_4_Minus2: #930c4f;--sapChart_Sequence_4_Minus2_TextColor: #fff;--sapChart_Sequence_4_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_4_Minus3: #770a40;--sapChart_Sequence_4_Minus3_TextColor: #fff;--sapChart_Sequence_4_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_4_Minus4: #51072c;--sapChart_Sequence_4_Minus4_TextColor: #fff;--sapChart_Sequence_4_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_4_Minus5: #3a051f;--sapChart_Sequence_4_Minus5_TextColor: #fff;--sapChart_Sequence_4_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_5_Plus3: #d5bcf0;--sapChart_Sequence_5_Plus3_TextColor: #000;--sapChart_Sequence_5_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_5_Plus2: #b994e0;--sapChart_Sequence_5_Plus2_TextColor: #000;--sapChart_Sequence_5_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_5_Plus1: #a679d8;--sapChart_Sequence_5_Plus1_TextColor: #000;--sapChart_Sequence_5_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_5: #8b47d7;--sapChart_Sequence_5_TextColor: #fff;--sapChart_Sequence_5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_5_BorderColor: #8b47d7;--sapChart_Sequence_5_Minus1: #7236b5;--sapChart_Sequence_5_Minus1_TextColor: #fff;--sapChart_Sequence_5_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_5_Minus2: #5e2c96;--sapChart_Sequence_5_Minus2_TextColor: #fff;--sapChart_Sequence_5_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_5_Minus3: #522682;--sapChart_Sequence_5_Minus3_TextColor: #fff;--sapChart_Sequence_5_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_5_Minus4: #46216f;--sapChart_Sequence_5_Minus4_TextColor: #fff;--sapChart_Sequence_5_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_5_Minus5: #341358;--sapChart_Sequence_5_Minus5_TextColor: #fff;--sapChart_Sequence_5_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_6_Plus3: #64ede9;--sapChart_Sequence_6_Plus3_TextColor: #000;--sapChart_Sequence_6_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_6_Plus2: #2ee0da;--sapChart_Sequence_6_Plus2_TextColor: #000;--sapChart_Sequence_6_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_6_Plus1: #05c7c1;--sapChart_Sequence_6_Plus1_TextColor: #000;--sapChart_Sequence_6_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_6: #049f9a;--sapChart_Sequence_6_TextColor: #000;--sapChart_Sequence_6_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_6_BorderColor: #05c7c1;--sapChart_Sequence_6_Minus1: #02837f;--sapChart_Sequence_6_Minus1_TextColor: #fff;--sapChart_Sequence_6_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_6_Minus2: #006663;--sapChart_Sequence_6_Minus2_TextColor: #fff;--sapChart_Sequence_6_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_6_Minus3: #00514f;--sapChart_Sequence_6_Minus3_TextColor: #fff;--sapChart_Sequence_6_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_6_Minus4: #003d3b;--sapChart_Sequence_6_Minus4_TextColor: #fff;--sapChart_Sequence_6_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_6_Minus5: #002322;--sapChart_Sequence_6_Minus5_TextColor: #fff;--sapChart_Sequence_6_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_7_Plus3: #68aeff;--sapChart_Sequence_7_Plus3_TextColor: #000;--sapChart_Sequence_7_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_7_Plus2: #4098ff;--sapChart_Sequence_7_Plus2_TextColor: #000;--sapChart_Sequence_7_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_7_Plus1: #1c85ff;--sapChart_Sequence_7_Plus1_TextColor: #000;--sapChart_Sequence_7_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_7: #0070f2;--sapChart_Sequence_7_TextColor: #fff;--sapChart_Sequence_7_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_7_BorderColor: #0070f2;--sapChart_Sequence_7_Minus1: #0062d3;--sapChart_Sequence_7_Minus1_TextColor: #fff;--sapChart_Sequence_7_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_7_Minus2: #0054b5;--sapChart_Sequence_7_Minus2_TextColor: #fff;--sapChart_Sequence_7_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_7_Minus3: #00418c;--sapChart_Sequence_7_Minus3_TextColor: #fff;--sapChart_Sequence_7_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_7_Minus4: #00244f;--sapChart_Sequence_7_Minus4_TextColor: #fff;--sapChart_Sequence_7_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_7_Minus5: #001b3a;--sapChart_Sequence_7_Minus5_TextColor: #fff;--sapChart_Sequence_7_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_8_Plus3: #f462ff;--sapChart_Sequence_8_Plus3_TextColor: #000;--sapChart_Sequence_8_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_8_Plus2: #f034ff;--sapChart_Sequence_8_Plus2_TextColor: #000;--sapChart_Sequence_8_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_8_Plus1: #ed0bff;--sapChart_Sequence_8_Plus1_TextColor: #000;--sapChart_Sequence_8_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_8: #cc00dc;--sapChart_Sequence_8_TextColor: #fff;--sapChart_Sequence_8_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_8_BorderColor: #cc00dc;--sapChart_Sequence_8_Minus1: #a600b3;--sapChart_Sequence_8_Minus1_TextColor: #fff;--sapChart_Sequence_8_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_8_Minus2: #80008a;--sapChart_Sequence_8_Minus2_TextColor: #fff;--sapChart_Sequence_8_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_8_Minus3: #6d0076;--sapChart_Sequence_8_Minus3_TextColor: #fff;--sapChart_Sequence_8_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_8_Minus4: #56005d;--sapChart_Sequence_8_Minus4_TextColor: #fff;--sapChart_Sequence_8_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_8_Minus5: #350039;--sapChart_Sequence_8_Minus5_TextColor: #fff;--sapChart_Sequence_8_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_9_Plus3: #bdc6bc;--sapChart_Sequence_9_Plus3_TextColor: #000;--sapChart_Sequence_9_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_9_Plus2: #b5bfb4;--sapChart_Sequence_9_Plus2_TextColor: #000;--sapChart_Sequence_9_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_9_Plus1: #97a695;--sapChart_Sequence_9_Plus1_TextColor: #000;--sapChart_Sequence_9_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_9: #798c77;--sapChart_Sequence_9_TextColor: #000;--sapChart_Sequence_9_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_9_BorderColor: #798c77;--sapChart_Sequence_9_Minus1: #667664;--sapChart_Sequence_9_Minus1_TextColor: #fff;--sapChart_Sequence_9_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_9_Minus2: #536051;--sapChart_Sequence_9_Minus2_TextColor: #fff;--sapChart_Sequence_9_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_9_Minus3: #404a3f;--sapChart_Sequence_9_Minus3_TextColor: #fff;--sapChart_Sequence_9_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_9_Minus4: #2d342c;--sapChart_Sequence_9_Minus4_TextColor: #fff;--sapChart_Sequence_9_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_9_Minus5: #1e231e;--sapChart_Sequence_9_Minus5_TextColor: #fff;--sapChart_Sequence_9_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_10_Plus3: #f1c6c6;--sapChart_Sequence_10_Plus3_TextColor: #000;--sapChart_Sequence_10_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_10_Plus2: #eaadad;--sapChart_Sequence_10_Plus2_TextColor: #000;--sapChart_Sequence_10_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_10_Plus1: #e28d8d;--sapChart_Sequence_10_Plus1_TextColor: #000;--sapChart_Sequence_10_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_10: #da6c6c;--sapChart_Sequence_10_TextColor: #000;--sapChart_Sequence_10_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_10_BorderColor: #b75757;--sapChart_Sequence_10_Minus1: #b75757;--sapChart_Sequence_10_Minus1_TextColor: #000;--sapChart_Sequence_10_Minus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_10_Minus2: #9d4343;--sapChart_Sequence_10_Minus2_TextColor: #fff;--sapChart_Sequence_10_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_10_Minus3: #803737;--sapChart_Sequence_10_Minus3_TextColor: #fff;--sapChart_Sequence_10_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_10_Minus4: #672c2c;--sapChart_Sequence_10_Minus4_TextColor: #fff;--sapChart_Sequence_10_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_10_Minus5: #562424;--sapChart_Sequence_10_Minus5_TextColor: #fff;--sapChart_Sequence_10_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_11_Plus3: #c0b0ff;--sapChart_Sequence_11_Plus3_TextColor: #000;--sapChart_Sequence_11_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_11_Plus2: #9b83ff;--sapChart_Sequence_11_Plus2_TextColor: #000;--sapChart_Sequence_11_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_11_Plus1: #8669ff;--sapChart_Sequence_11_Plus1_TextColor: #000;--sapChart_Sequence_11_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_11: #5d36ff;--sapChart_Sequence_11_TextColor: #fff;--sapChart_Sequence_11_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_11_BorderColor: #5d36ff;--sapChart_Sequence_11_Minus1: #4b25e7;--sapChart_Sequence_11_Minus1_TextColor: #fff;--sapChart_Sequence_11_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_11_Minus2: #3a17cd;--sapChart_Sequence_11_Minus2_TextColor: #fff;--sapChart_Sequence_11_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_11_Minus3: #2f13a8;--sapChart_Sequence_11_Minus3_TextColor: #fff;--sapChart_Sequence_11_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_11_Minus4: #250f83;--sapChart_Sequence_11_Minus4_TextColor: #fff;--sapChart_Sequence_11_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_11_Minus5: #2f13a8;--sapChart_Sequence_11_Minus5_TextColor: #fff;--sapChart_Sequence_11_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_12_Plus3: #e4ddcf;--sapChart_Sequence_12_Plus3_TextColor: #000;--sapChart_Sequence_12_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_12_Plus2: #dacebb;--sapChart_Sequence_12_Plus2_TextColor: #000;--sapChart_Sequence_12_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_12_Plus1: #c4b293;--sapChart_Sequence_12_Plus1_TextColor: #000;--sapChart_Sequence_12_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_12: #a68a5b;--sapChart_Sequence_12_TextColor: #000;--sapChart_Sequence_12_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_12_BorderColor: #a68a5b;--sapChart_Sequence_12_Minus1: #8c744c;--sapChart_Sequence_12_Minus1_TextColor: #fff;--sapChart_Sequence_12_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_12_Minus2: #786441;--sapChart_Sequence_12_Minus2_TextColor: #fff;--sapChart_Sequence_12_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_12_Minus3: #5e4e33;--sapChart_Sequence_12_Minus3_TextColor: #fff;--sapChart_Sequence_12_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_12_Minus4: #433825;--sapChart_Sequence_12_Minus4_TextColor: #fff;--sapChart_Sequence_12_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_12_Minus5: #30271a;--sapChart_Sequence_12_Minus5_TextColor: #fff;--sapChart_Sequence_12_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Bad_Plus3: #fdcece;--sapChart_Sequence_Bad_Plus3_TextColor: #000;--sapChart_Sequence_Bad_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Bad_Plus2: #fa9d9d;--sapChart_Sequence_Bad_Plus2_TextColor: #000;--sapChart_Sequence_Bad_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Bad_Plus1: #f86c6c;--sapChart_Sequence_Bad_Plus1_TextColor: #000;--sapChart_Sequence_Bad_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Bad: #f53232;--sapChart_Sequence_Bad_TextColor: #000;--sapChart_Sequence_Bad_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Bad_BorderColor: #f53232;--sapChart_Sequence_Bad_Minus1: #d00a0a;--sapChart_Sequence_Bad_Minus1_TextColor: #fff;--sapChart_Sequence_Bad_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Bad_Minus2: #a90808;--sapChart_Sequence_Bad_Minus2_TextColor: #fff;--sapChart_Sequence_Bad_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Bad_Minus3: #830606;--sapChart_Sequence_Bad_Minus3_TextColor: #fff;--sapChart_Sequence_Bad_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Bad_Minus4: #570404;--sapChart_Sequence_Bad_Minus4_TextColor: #fff;--sapChart_Sequence_Bad_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Bad_Minus5: #320000;--sapChart_Sequence_Bad_Minus5_TextColor: #fff;--sapChart_Sequence_Bad_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Critical_Plus3: #ffb881;--sapChart_Sequence_Critical_Plus3_TextColor: #000;--sapChart_Sequence_Critical_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Critical_Plus2: #ff933f;--sapChart_Sequence_Critical_Plus2_TextColor: #000;--sapChart_Sequence_Critical_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Critical_Plus1: #ff760c;--sapChart_Sequence_Critical_Plus1_TextColor: #000;--sapChart_Sequence_Critical_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Critical: #e26300;--sapChart_Sequence_Critical_TextColor: #000;--sapChart_Sequence_Critical_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Critical_BorderColor: #e26300;--sapChart_Sequence_Critical_Minus1: #c35600;--sapChart_Sequence_Critical_Minus1_TextColor: #fff;--sapChart_Sequence_Critical_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Critical_Minus2: #aa4a00;--sapChart_Sequence_Critical_Minus2_TextColor: #fff;--sapChart_Sequence_Critical_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Critical_Minus3: #903f00;--sapChart_Sequence_Critical_Minus3_TextColor: #fff;--sapChart_Sequence_Critical_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Critical_Minus4: #6d3000;--sapChart_Sequence_Critical_Minus4_TextColor: #fff;--sapChart_Sequence_Critical_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Critical_Minus5: #492000;--sapChart_Sequence_Critical_Minus5_TextColor: #fff;--sapChart_Sequence_Critical_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Good_Plus3: #88d79f;--sapChart_Sequence_Good_Plus3_TextColor: #000;--sapChart_Sequence_Good_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Good_Plus2: #56c776;--sapChart_Sequence_Good_Plus2_TextColor: #000;--sapChart_Sequence_Good_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Good_Plus1: #3ab05c;--sapChart_Sequence_Good_Plus1_TextColor: #000;--sapChart_Sequence_Good_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Good: #30914c;--sapChart_Sequence_Good_TextColor: #000;--sapChart_Sequence_Good_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Good_BorderColor: #30914c;--sapChart_Sequence_Good_Minus1: #287a40;--sapChart_Sequence_Good_Minus1_TextColor: #fff;--sapChart_Sequence_Good_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Good_Minus2: #226736;--sapChart_Sequence_Good_Minus2_TextColor: #fff;--sapChart_Sequence_Good_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Good_Minus3: #1c542c;--sapChart_Sequence_Good_Minus3_TextColor: #fff;--sapChart_Sequence_Good_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Good_Minus4: #13391e;--sapChart_Sequence_Good_Minus4_TextColor: #fff;--sapChart_Sequence_Good_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Good_Minus5: #0a1e10;--sapChart_Sequence_Good_Minus5_TextColor: #fff;--sapChart_Sequence_Good_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Neutral_Plus3: #edf0f3;--sapChart_Sequence_Neutral_Plus3_TextColor: #000;--sapChart_Sequence_Neutral_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Neutral_Plus2: #c2ccd7;--sapChart_Sequence_Neutral_Plus2_TextColor: #000;--sapChart_Sequence_Neutral_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Neutral_Plus1: #9aabbc;--sapChart_Sequence_Neutral_Plus1_TextColor: #000;--sapChart_Sequence_Neutral_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Neutral: #758ca4;--sapChart_Sequence_Neutral_TextColor: #000;--sapChart_Sequence_Neutral_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Neutral_BorderColor: #758ca4;--sapChart_Sequence_Neutral_Minus1: #5b728b;--sapChart_Sequence_Neutral_Minus1_TextColor: #fff;--sapChart_Sequence_Neutral_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Neutral_Minus2: #495e74;--sapChart_Sequence_Neutral_Minus2_TextColor: #fff;--sapChart_Sequence_Neutral_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Neutral_Minus3: #364a5f;--sapChart_Sequence_Neutral_Minus3_TextColor: #fff;--sapChart_Sequence_Neutral_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Neutral_Minus4: #233649;--sapChart_Sequence_Neutral_Minus4_TextColor: #fff;--sapChart_Sequence_Neutral_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Neutral_Minus5: #1a2633;--sapChart_Sequence_Neutral_Minus5_TextColor: #fff;--sapChart_Sequence_Neutral_Minus5_TextShadow: 0 0 .125rem #223548;--sapSapThemeId: sap_horizon;--sapBreakpoint_S_Min: 0;--sapBreakpoint_M_Min: 600px;--sapBreakpoint_L_Min: 1024px;--sapBreakpoint_XL_Min: 1440px}
`;

  var defaultTheme = `:root{--ui5-v2-7-0-avatar-hover-box-shadow-offset: 0px 0px 0px .0625rem;--ui5-v2-7-0-avatar-initials-color: var(--sapContent_ImagePlaceholderForegroundColor);--ui5-v2-7-0-avatar-border-radius-img-deduction: .0625rem;--_ui5-v2-7-0_avatar_outline: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);--_ui5-v2-7-0_avatar_focus_width: .0625rem;--_ui5-v2-7-0_avatar_focus_color: var(--sapContent_FocusColor);--_ui5-v2-7-0_avatar_overflow_button_focus_offset: .0625rem;--_ui5-v2-7-0_avatar_focus_offset: .1875rem;--ui5-v2-7-0-avatar-initials-border: .0625rem solid var(--sapAvatar_1_BorderColor);--ui5-v2-7-0-avatar-border-radius: var(--sapElement_BorderCornerRadius);--_ui5-v2-7-0_avatar_fontsize_XS: 1rem;--_ui5-v2-7-0_avatar_fontsize_S: 1.125rem;--_ui5-v2-7-0_avatar_fontsize_M: 1.5rem;--_ui5-v2-7-0_avatar_fontsize_L: 2.25rem;--_ui5-v2-7-0_avatar_fontsize_XL: 3rem;--ui5-v2-7-0-avatar-accent1: var(--sapAvatar_1_Background);--ui5-v2-7-0-avatar-accent2: var(--sapAvatar_2_Background);--ui5-v2-7-0-avatar-accent3: var(--sapAvatar_3_Background);--ui5-v2-7-0-avatar-accent4: var(--sapAvatar_4_Background);--ui5-v2-7-0-avatar-accent5: var(--sapAvatar_5_Background);--ui5-v2-7-0-avatar-accent6: var(--sapAvatar_6_Background);--ui5-v2-7-0-avatar-accent7: var(--sapAvatar_7_Background);--ui5-v2-7-0-avatar-accent8: var(--sapAvatar_8_Background);--ui5-v2-7-0-avatar-accent9: var(--sapAvatar_9_Background);--ui5-v2-7-0-avatar-accent10: var(--sapAvatar_10_Background);--ui5-v2-7-0-avatar-placeholder: var(--sapContent_ImagePlaceholderBackground);--ui5-v2-7-0-avatar-accent1-color: var(--sapAvatar_1_TextColor);--ui5-v2-7-0-avatar-accent2-color: var(--sapAvatar_2_TextColor);--ui5-v2-7-0-avatar-accent3-color: var(--sapAvatar_3_TextColor);--ui5-v2-7-0-avatar-accent4-color: var(--sapAvatar_4_TextColor);--ui5-v2-7-0-avatar-accent5-color: var(--sapAvatar_5_TextColor);--ui5-v2-7-0-avatar-accent6-color: var(--sapAvatar_6_TextColor);--ui5-v2-7-0-avatar-accent7-color: var(--sapAvatar_7_TextColor);--ui5-v2-7-0-avatar-accent8-color: var(--sapAvatar_8_TextColor);--ui5-v2-7-0-avatar-accent9-color: var(--sapAvatar_9_TextColor);--ui5-v2-7-0-avatar-accent10-color: var(--sapAvatar_10_TextColor);--ui5-v2-7-0-avatar-placeholder-color: var(--sapContent_ImagePlaceholderForegroundColor);--ui5-v2-7-0-avatar-accent1-border-color: var(--sapAvatar_1_BorderColor);--ui5-v2-7-0-avatar-accent2-border-color: var(--sapAvatar_2_BorderColor);--ui5-v2-7-0-avatar-accent3-border-color: var(--sapAvatar_3_BorderColor);--ui5-v2-7-0-avatar-accent4-border-color: var(--sapAvatar_4_BorderColor);--ui5-v2-7-0-avatar-accent5-border-color: var(--sapAvatar_5_BorderColor);--ui5-v2-7-0-avatar-accent6-border-color: var(--sapAvatar_6_BorderColor);--ui5-v2-7-0-avatar-accent7-border-color: var(--sapAvatar_7_BorderColor);--ui5-v2-7-0-avatar-accent8-border-color: var(--sapAvatar_8_BorderColor);--ui5-v2-7-0-avatar-accent9-border-color: var(--sapAvatar_9_BorderColor);--ui5-v2-7-0-avatar-accent10-border-color: var(--sapAvatar_10_BorderColor);--ui5-v2-7-0-avatar-placeholder-border-color: var(--sapContent_ImagePlaceholderBackground);--_ui5-v2-7-0_avatar_icon_XS: var(--_ui5-v2-7-0_avatar_fontsize_XS);--_ui5-v2-7-0_avatar_icon_S: var(--_ui5-v2-7-0_avatar_fontsize_S);--_ui5-v2-7-0_avatar_icon_M: var(--_ui5-v2-7-0_avatar_fontsize_M);--_ui5-v2-7-0_avatar_icon_L: var(--_ui5-v2-7-0_avatar_fontsize_L);--_ui5-v2-7-0_avatar_icon_XL: var(--_ui5-v2-7-0_avatar_fontsize_XL);--_ui5-v2-7-0_avatar_group_button_focus_border: none;--_ui5-v2-7-0_avatar_group_focus_border_radius: .375rem;--_ui5-v2-7-0-tag-height: 1rem;--_ui5-v2-7-0-tag-icon-width: .75rem;--ui5-v2-7-0-tag-text-shadow: var(--sapContent_TextShadow);--ui5-v2-7-0-tag-contrast-text-shadow: var(--sapContent_ContrastTextShadow);--ui5-v2-7-0-tag-information-text-shadow: var(--ui5-v2-7-0-tag-text-shadow);--ui5-v2-7-0-tag-set2-color-scheme-1-color: var(--sapIndicationColor_1);--ui5-v2-7-0-tag-set2-color-scheme-1-background: var(--sapIndicationColor_1b);--ui5-v2-7-0-tag-set2-color-scheme-1-border: var(--sapIndicationColor_1b_BorderColor);--ui5-v2-7-0-tag-set2-color-scheme-1-hover-background: var(--sapIndicationColor_1b_Hover_Background);--ui5-v2-7-0-tag-set2-color-scheme-1-active-color: var(--sapIndicationColor_1_Active_TextColor);--ui5-v2-7-0-tag-set2-color-scheme-1-active-background: var(--sapIndicationColor_1_Active_Background);--ui5-v2-7-0-tag-set2-color-scheme-1-active-border: var(--sapIndicationColor_1_Active_BorderColor);--ui5-v2-7-0-tag-set2-color-scheme-2-color: var(--sapIndicationColor_2);--ui5-v2-7-0-tag-set2-color-scheme-2-background: var(--sapIndicationColor_2b);--ui5-v2-7-0-tag-set2-color-scheme-2-border: var(--sapIndicationColor_2b_BorderColor);--ui5-v2-7-0-tag-set2-color-scheme-2-hover-background: var(--sapIndicationColor_2b_Hover_Background);--ui5-v2-7-0-tag-set2-color-scheme-2-active-color: var(--sapIndicationColor_2_Active_TextColor);--ui5-v2-7-0-tag-set2-color-scheme-2-active-background: var(--sapIndicationColor_2_Active_Background);--ui5-v2-7-0-tag-set2-color-scheme-2-active-border: var(--sapIndicationColor_2_Active_BorderColor);--ui5-v2-7-0-tag-set2-color-scheme-3-color: var(--sapIndicationColor_3);--ui5-v2-7-0-tag-set2-color-scheme-3-background: var(--sapIndicationColor_3b);--ui5-v2-7-0-tag-set2-color-scheme-3-border: var(--sapIndicationColor_3b_BorderColor);--ui5-v2-7-0-tag-set2-color-scheme-3-hover-background: var(--sapIndicationColor_3b_Hover_Background);--ui5-v2-7-0-tag-set2-color-scheme-3-active-color: var(--sapIndicationColor_3_Active_TextColor);--ui5-v2-7-0-tag-set2-color-scheme-3-active-background: var(--sapIndicationColor_3_Active_Background);--ui5-v2-7-0-tag-set2-color-scheme-3-active-border: var(--sapIndicationColor_3_Active_BorderColor);--ui5-v2-7-0-tag-set2-color-scheme-4-color: var(--sapIndicationColor_4);--ui5-v2-7-0-tag-set2-color-scheme-4-background: var(--sapIndicationColor_4b);--ui5-v2-7-0-tag-set2-color-scheme-4-border: var(--sapIndicationColor_4b_BorderColor);--ui5-v2-7-0-tag-set2-color-scheme-4-hover-background: var(--sapIndicationColor_4b_Hover_Background);--ui5-v2-7-0-tag-set2-color-scheme-4-active-color: var(--sapIndicationColor_4_Active_TextColor);--ui5-v2-7-0-tag-set2-color-scheme-4-active-background: var(--sapIndicationColor_4_Active_Background);--ui5-v2-7-0-tag-set2-color-scheme-4-active-border: var(--sapIndicationColor_4_Active_BorderColor);--ui5-v2-7-0-tag-set2-color-scheme-5-color: var(--sapIndicationColor_5);--ui5-v2-7-0-tag-set2-color-scheme-5-background: var(--sapIndicationColor_5b);--ui5-v2-7-0-tag-set2-color-scheme-5-border: var(--sapIndicationColor_5b_BorderColor);--ui5-v2-7-0-tag-set2-color-scheme-5-hover-background: var(--sapIndicationColor_5b_Hover_Background);--ui5-v2-7-0-tag-set2-color-scheme-5-active-color: var(--sapIndicationColor_5_Active_TextColor);--ui5-v2-7-0-tag-set2-color-scheme-5-active-background: var(--sapIndicationColor_5_Active_Background);--ui5-v2-7-0-tag-set2-color-scheme-5-active-border: var(--sapIndicationColor_5_Active_BorderColor);--ui5-v2-7-0-tag-set2-color-scheme-6-color: var(--sapIndicationColor_6);--ui5-v2-7-0-tag-set2-color-scheme-6-background: var(--sapIndicationColor_6b);--ui5-v2-7-0-tag-set2-color-scheme-6-border: var(--sapIndicationColor_6b_BorderColor);--ui5-v2-7-0-tag-set2-color-scheme-6-hover-background: var(--sapIndicationColor_6b_Hover_Background);--ui5-v2-7-0-tag-set2-color-scheme-6-active-color: var(--sapIndicationColor_6_Active_TextColor);--ui5-v2-7-0-tag-set2-color-scheme-6-active-background: var(--sapIndicationColor_6_Active_Background);--ui5-v2-7-0-tag-set2-color-scheme-6-active-border: var(--sapIndicationColor_6_Active_BorderColor);--ui5-v2-7-0-tag-set2-color-scheme-7-color: var(--sapIndicationColor_7);--ui5-v2-7-0-tag-set2-color-scheme-7-background: var(--sapIndicationColor_7b);--ui5-v2-7-0-tag-set2-color-scheme-7-border: var(--sapIndicationColor_7b_BorderColor);--ui5-v2-7-0-tag-set2-color-scheme-7-hover-background: var(--sapIndicationColor_7b_Hover_Background);--ui5-v2-7-0-tag-set2-color-scheme-7-active-color: var(--sapIndicationColor_7_Active_TextColor);--ui5-v2-7-0-tag-set2-color-scheme-7-active-background: var(--sapIndicationColor_7_Active_Background);--ui5-v2-7-0-tag-set2-color-scheme-7-active-border: var(--sapIndicationColor_7_Active_BorderColor);--ui5-v2-7-0-tag-set2-color-scheme-8-color: var(--sapIndicationColor_8);--ui5-v2-7-0-tag-set2-color-scheme-8-background: var(--sapIndicationColor_8b);--ui5-v2-7-0-tag-set2-color-scheme-8-border: var(--sapIndicationColor_8b_BorderColor);--ui5-v2-7-0-tag-set2-color-scheme-8-hover-background: var(--sapIndicationColor_8b_Hover_Background);--ui5-v2-7-0-tag-set2-color-scheme-8-active-color: var(--sapIndicationColor_8_Active_TextColor);--ui5-v2-7-0-tag-set2-color-scheme-8-active-background: var(--sapIndicationColor_8_Active_Background);--ui5-v2-7-0-tag-set2-color-scheme-8-active-border: var(--sapIndicationColor_8_Active_BorderColor);--ui5-v2-7-0-tag-set2-color-scheme-9-color: var(--sapIndicationColor_9);--ui5-v2-7-0-tag-set2-color-scheme-9-background: var(--sapIndicationColor_9b);--ui5-v2-7-0-tag-set2-color-scheme-9-border: var(--sapIndicationColor_9b_BorderColor);--ui5-v2-7-0-tag-set2-color-scheme-9-hover-background: var(--sapIndicationColor_9b_Hover_Background);--ui5-v2-7-0-tag-set2-color-scheme-9-active-color: var(--sapIndicationColor_9_Active_TextColor);--ui5-v2-7-0-tag-set2-color-scheme-9-active-background: var(--sapIndicationColor_9_Active_Background);--ui5-v2-7-0-tag-set2-color-scheme-9-active-border: var(--sapIndicationColor_9_Active_BorderColor);--ui5-v2-7-0-tag-set2-color-scheme-10-color: var(--sapIndicationColor_10);--ui5-v2-7-0-tag-set2-color-scheme-10-background: var(--sapIndicationColor_10b);--ui5-v2-7-0-tag-set2-color-scheme-10-border: var(--sapIndicationColor_10b_BorderColor);--ui5-v2-7-0-tag-set2-color-scheme-10-hover-background: var(--sapIndicationColor_10b_Hover_Background);--ui5-v2-7-0-tag-set2-color-scheme-10-active-color: var(--sapIndicationColor_10_Active_TextColor);--ui5-v2-7-0-tag-set2-color-scheme-10-active-background: var(--sapIndicationColor_10_Active_Background);--ui5-v2-7-0-tag-set2-color-scheme-10-active-border: var(--sapIndicationColor_10_Active_BorderColor);--_ui5-v2-7-0-tag-height_size_l: 1.5rem;--_ui5-v2-7-0-tag-min-width_size_l: 1.75rem;--_ui5-v2-7-0-tag-font-size_size_l: 1.25rem;--_ui5-v2-7-0-tag-icon_min_width_size_l: 1.25rem;--_ui5-v2-7-0-tag-icon_min_height_size_l:1.25rem;--_ui5-v2-7-0-tag-icon_height_size_l: 1.25rem;--_ui5-v2-7-0-tag-text_padding_size_l: .125rem .25rem;--_ui5-v2-7-0-tag-text-height_size_l: 1.5rem;--_ui5-v2-7-0-tag-text-padding: .1875rem .25rem;--_ui5-v2-7-0-tag-padding-inline-icon-only: .313rem;--_ui5-v2-7-0-tag-text-transform: none;--_ui5-v2-7-0-tag-icon-gap: .25rem;--_ui5-v2-7-0-tag-font-size: var(--sapFontSize);--_ui5-v2-7-0-tag-font: var(--sapFontSemiboldDuplexFamily);--_ui5-v2-7-0-tag-font-weight: normal;--_ui5-v2-7-0-tag-letter-spacing: normal;--_ui5-v2-7-0_bar_base_height: 2.75rem;--_ui5-v2-7-0_bar_subheader_height: 3rem;--_ui5-v2-7-0_bar-start-container-padding-start: 2rem;--_ui5-v2-7-0_bar-mid-container-padding-start-end: .5rem;--_ui5-v2-7-0_bar-end-container-padding-end: 2rem;--_ui5-v2-7-0_bar-start-container-padding-start_S: 1rem;--_ui5-v2-7-0_bar-start-container-padding-start_XL: 3rem;--_ui5-v2-7-0_bar-end-container-padding-end_S: 1rem;--_ui5-v2-7-0_bar-end-container-padding-end_XL: 3rem;--_ui5-v2-7-0_bar_subheader_margin-top: -.0625rem;--_ui5-v2-7-0_breadcrumbs_margin: 0 0 .5rem 0;--_ui5-v2-7-0_busy_indicator_block_layer: color-mix(in oklch, transparent, var(--sapBlockLayer_Background) 20%);--_ui5-v2-7-0_busy_indicator_color: var(--sapContent_BusyColor);--_ui5-v2-7-0_busy_indicator_focus_outline: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);--_ui5-v2-7-0-button-badge-diameter: .75rem;--_ui5-v2-7-0-calendar-legend-root-padding: .75rem;--_ui5-v2-7-0-calendar-legend-root-width: 18.5rem;--_ui5-v2-7-0-calendar-legend-item-root-focus-margin: 0;--_ui5-v2-7-0-calendar-legend-item-root-width: 7.75rem;--_ui5-v2-7-0-calendar-legend-item-root-focus-border: var(--sapContent_FocusWidth) solid var(--sapContent_FocusColor);--_ui5-v2-7-0_card_box_shadow: var(--sapContent_Shadow0);--_ui5-v2-7-0_card_header_border_color: var(--sapTile_SeparatorColor);--_ui5-v2-7-0_card_header_focus_border: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);--_ui5-v2-7-0_card_header_focus_bottom_radius: 0px;--_ui5-v2-7-0_card_header_title_font_weight: normal;--_ui5-v2-7-0_card_header_subtitle_margin_top: .25rem;--_ui5-v2-7-0_card_hover_box_shadow: var(--sapContent_Shadow2);--_ui5-v2-7-0_card_header_focus_offset: 0px;--_ui5-v2-7-0_card_header_focus_radius: var(--_ui5-v2-7-0_card_border-radius);--_ui5-v2-7-0_card_header_title_font_family: var(--sapFontHeaderFamily);--_ui5-v2-7-0_card_header_title_font_size: var(--sapFontHeader6Size);--_ui5-v2-7-0_card_header_hover_bg: var(--sapTile_Hover_Background);--_ui5-v2-7-0_card_header_active_bg: var(--sapTile_Active_Background);--_ui5-v2-7-0_card_header_border: none;--_ui5-v2-7-0_card_border-radius: var(--sapTile_BorderCornerRadius);--_ui5-v2-7-0_card_header_padding: 1rem 1rem .75rem 1rem;--_ui5-v2-7-0_card_border: none;--ui5-v2-7-0_carousel_background_color_solid: var(--sapGroup_ContentBackground);--ui5-v2-7-0_carousel_background_color_translucent: var(--sapBackgroundColor);--ui5-v2-7-0_carousel_button_size: 2.5rem;--ui5-v2-7-0_carousel_inactive_dot_size: .25rem;--ui5-v2-7-0_carousel_inactive_dot_margin: 0 .375rem;--ui5-v2-7-0_carousel_inactive_dot_border: 1px solid var(--sapContent_ForegroundBorderColor);--ui5-v2-7-0_carousel_inactive_dot_background: var(--sapContent_ForegroundBorderColor);--ui5-v2-7-0_carousel_active_dot_border: 1px solid var(--sapContent_Selected_ForegroundColor);--ui5-v2-7-0_carousel_active_dot_background: var(--sapContent_Selected_ForegroundColor);--ui5-v2-7-0_carousel_navigation_button_active_box_shadow: none;--_ui5-v2-7-0_checkbox_box_shadow: none;--_ui5-v2-7-0_checkbox_transition: unset;--_ui5-v2-7-0_checkbox_focus_border: none;--_ui5-v2-7-0_checkbox_border_radius: 0;--_ui5-v2-7-0_checkbox_focus_outline: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);--_ui5-v2-7-0_checkbox_outer_hover_background: transparent;--_ui5-v2-7-0_checkbox_inner_width_height: 1.375rem;--_ui5-v2-7-0_checkbox_inner_disabled_border_color: var(--sapField_BorderColor);--_ui5-v2-7-0_checkbox_inner_information_box_shadow: none;--_ui5-v2-7-0_checkbox_inner_warning_box_shadow: none;--_ui5-v2-7-0_checkbox_inner_error_box_shadow: none;--_ui5-v2-7-0_checkbox_inner_success_box_shadow: none;--_ui5-v2-7-0_checkbox_inner_default_box_shadow: none;--_ui5-v2-7-0_checkbox_inner_background: var(--sapField_Background);--_ui5-v2-7-0_checkbox_wrapped_focus_padding: .375rem;--_ui5-v2-7-0_checkbox_wrapped_focus_inset_block: var(--_ui5-v2-7-0_checkbox_focus_position);--_ui5-v2-7-0_checkbox_compact_wrapper_padding: .5rem;--_ui5-v2-7-0_checkbox_compact_width_height: 2rem;--_ui5-v2-7-0_checkbox_compact_inner_size: 1rem;--_ui5-v2-7-0_checkbox_compact_focus_position: .375rem;--_ui5-v2-7-0_checkbox_label_offset: var(--_ui5-v2-7-0_checkbox_wrapper_padding);--_ui5-v2-7-0_checkbox_disabled_label_color: var(--sapContent_LabelColor);--_ui5-v2-7-0_checkbox_default_focus_border: none;--_ui5-v2-7-0_checkbox_focus_outline_display: block;--_ui5-v2-7-0_checkbox_wrapper_padding: .6875rem;--_ui5-v2-7-0_checkbox_width_height: 2.75rem;--_ui5-v2-7-0_checkbox_label_color: var(--sapField_TextColor);--_ui5-v2-7-0_checkbox_inner_border: solid var(--sapField_BorderWidth) var(--sapField_BorderColor);--_ui5-v2-7-0_checkbox_inner_border_radius: var(--sapField_BorderCornerRadius);--_ui5-v2-7-0_checkbox_checkmark_color: var(--sapContent_Selected_ForegroundColor);--_ui5-v2-7-0_checkbox_hover_background: var(--sapContent_Selected_Hover_Background);--_ui5-v2-7-0_checkbox_inner_hover_border_color: var(--sapField_Hover_BorderColor);--_ui5-v2-7-0_checkbox_inner_hover_checked_border_color: var(--sapField_Hover_BorderColor);--_ui5-v2-7-0_checkbox_inner_selected_border_color: var(--sapField_BorderColor);--_ui5-v2-7-0_checkbox_inner_active_border_color: var(--sapField_Hover_BorderColor);--_ui5-v2-7-0_checkbox_active_background: var(--sapContent_Selected_Hover_Background);--_ui5-v2-7-0_checkbox_inner_readonly_border: var(--sapElement_BorderWidth) var(--sapField_ReadOnly_BorderColor) dashed;--_ui5-v2-7-0_checkbox_inner_error_border: var(--sapField_InvalidBorderWidth) solid var(--sapField_InvalidColor);--_ui5-v2-7-0_checkbox_inner_error_background_hover: var(--sapField_Hover_Background);--_ui5-v2-7-0_checkbox_inner_warning_border: var(--sapField_WarningBorderWidth) solid var(--sapField_WarningColor);--_ui5-v2-7-0_checkbox_inner_warning_color: var(--sapField_WarningColor);--_ui5-v2-7-0_checkbox_inner_warning_background_hover: var(--sapField_Hover_Background);--_ui5-v2-7-0_checkbox_checkmark_warning_color: var(--sapField_WarningColor);--_ui5-v2-7-0_checkbox_inner_success_border: var(--sapField_SuccessBorderWidth) solid var(--sapField_SuccessColor);--_ui5-v2-7-0_checkbox_inner_success_background_hover: var(--sapField_Hover_Background);--_ui5-v2-7-0_checkbox_inner_information_color: var(--sapField_InformationColor);--_ui5-v2-7-0_checkbox_inner_information_border: var(--sapField_InformationBorderWidth) solid var(--sapField_InformationColor);--_ui5-v2-7-0_checkbox_inner_information_background_hover: var(--sapField_Hover_Background);--_ui5-v2-7-0_checkbox_disabled_opacity: var(--sapContent_DisabledOpacity);--_ui5-v2-7-0_checkbox_focus_position: .3125rem;--_ui5-v2-7-0_checkbox_focus_border_radius: .5rem;--_ui5-v2-7-0_checkbox_right_focus_distance: var(--_ui5-v2-7-0_checkbox_focus_position);--_ui5-v2-7-0_color-palette-item-after-focus-inset: .0625rem;--_ui5-v2-7-0_color-palette-item-outer-border-radius: .25rem;--_ui5-v2-7-0_color-palette-item-inner-border-radius: .1875rem;--_ui5-v2-7-0_color-palette-item-after-not-focus-color: .0625rem solid var(--sapGroup_ContentBackground);--_ui5-v2-7-0_color-palette-item-container-sides-padding: .3125rem;--_ui5-v2-7-0_color-palette-item-container-rows-padding: .6875rem;--_ui5-v2-7-0_color-palette-item-focus-height: 1.5rem;--_ui5-v2-7-0_color-palette-item-container-padding: var(--_ui5-v2-7-0_color-palette-item-container-sides-padding) var(--_ui5-v2-7-0_color-palette-item-container-rows-padding);--_ui5-v2-7-0_color-palette-item-hover-margin: .0625rem;--_ui5-v2-7-0_color-palette-row-height: 9.5rem;--_ui5-v2-7-0_color-palette-button-height: 3rem;--_ui5-v2-7-0_color-palette-item-before-focus-color: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-7-0_color-palette-item-before-focus-inset: -.3125rem;--_ui5-v2-7-0_color-palette-item-before-focus-hover-inset: -.0625rem;--_ui5-v2-7-0_color-palette-item-after-focus-color: .0625rem solid var(--sapContent_ContrastFocusColor);--_ui5-v2-7-0_color-palette-item-selected-focused-border-after: none;--_ui5-v2-7-0_color-palette-item-after-focus-hover-inset: .0625rem;--_ui5-v2-7-0_color-palette-item-before-focus-border-radius: .4375rem;--_ui5-v2-7-0_color-palette-item-after-focus-border-radius: .3125rem;--_ui5-v2-7-0_color-palette-item-hover-outer-border-radius: .4375rem;--_ui5-v2-7-0_color-palette-item-hover-inner-border-radius: .375rem;--_ui5-v2-7-0_color-palette-item-selected-focused-border-before: -.0625rem;--_ui5-v2-7-0_color-palette-item-after-focus-not-selected-border: none;--_ui5-v2-7-0_color-palette-item-selected-focused-border: none;--_ui5-v2-7-0_color-palette-item-mobile-focus-sides-inset: -.375rem -.375rem;--_ui5-v2-7-0-color-palette-item-mobile-focus-inset: 0px;--_ui5-v2-7-0_color-palette-item-after-mobile-focus-border: none;--_ui5-v2-7-0_color_picker_slider_handle_box_shadow: inset 0 0 0 .125rem var(--sapContent_ContrastShadowColor);--_ui5-v2-7-0_color_picker_slider_handle_margin_top: -.125rem;--_ui5-v2-7-0_color_picker_slider_handle_inner_border_color: #fff;--_ui5-v2-7-0_color_picker_circle_outer_border: .0625rem solid var(--sapContent_ContrastShadowColor);--_ui5-v2-7-0_color_picker_circle_inner_border: var(--sapField_Picker_BorderWidth) solid var(--sapField_BorderColor);--_ui5-v2-7-0_color_picker_circle_inner_circle_size: .5625rem;--_ui5-v2-7-0_color_picker_slider_handle_container_margin_top: none;--_ui5-v2-7-0_color_picker_slider_handle_border: .125rem solid var(--sapField_BorderColor);--_ui5-v2-7-0_color_picker_slider_handle_outline_hover: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-7-0_color_picker_slider_handle_outline_focus: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-7-0_color_picker_slider_handle_inline_focus: 1px solid var(--sapContent_ContrastFocusColor);--_ui5-v2-7-0_datepicker_icon_border: none;--_ui5-v2-7-0-datepicker-hover-background: var(--sapField_Hover_Background);--_ui5-v2-7-0-datepicker_border_radius: .25rem;--_ui5-v2-7-0-datepicker_icon_border_radius: .125rem;--_ui5-v2-7-0_daypicker_item_box_shadow: inset 0 0 0 .0625rem var(--sapContent_Selected_ForegroundColor);--_ui5-v2-7-0_daypicker_item_margin: 2px;--_ui5-v2-7-0_daypicker_item_border: none;--_ui5-v2-7-0_daypicker_item_selected_border_color: var(--sapList_Background);--_ui5-v2-7-0_daypicker_daynames_container_height: 2rem;--_ui5-v2-7-0_daypicker_weeknumbers_container_padding_top: 2rem;--_ui5-v2-7-0_daypicker_item_othermonth_background_color: var(--sapList_Background);--_ui5-v2-7-0_daypicker_item_othermonth_color: var(--sapContent_LabelColor);--_ui5-v2-7-0_daypicker_item_othermonth_hover_color: var(--sapContent_LabelColor);--_ui5-v2-7-0_daypicker_item_now_inner_border_radius: 0;--_ui5-v2-7-0_daypicker_item_outline_width: 1px;--_ui5-v2-7-0_daypicker_item_outline_offset: 1px;--_ui5-v2-7-0_daypicker_item_now_focus_after_width: calc(100% - .25rem) ;--_ui5-v2-7-0_daypicker_item_now_focus_after_height: calc(100% - .25rem) ;--_ui5-v2-7-0_daypicker_item_now_selected_focus_after_width: calc(100% - .375rem) ;--_ui5-v2-7-0_daypicker_item_now_selected_focus_after_height: calc(100% - .375rem) ;--_ui5-v2-7-0_daypicker_item_selected_background: transparent;--_ui5-v2-7-0_daypicker_item_outline_focus_after: none;--_ui5-v2-7-0_daypicker_item_border_focus_after: var(--_ui5-v2-7-0_daypicker_item_outline_width) dotted var(--sapContent_FocusColor);--_ui5-v2-7-0_daypicker_item_width_focus_after: calc(100% - .25rem) ;--_ui5-v2-7-0_daypicker_item_height_focus_after: calc(100% - .25rem) ;--_ui5-v2-7-0_daypicker_item_now_outline: none;--_ui5-v2-7-0_daypicker_item_now_outline_offset: none;--_ui5-v2-7-0_daypicker_item_now_outline_offset_focus_after: var(--_ui5-v2-7-0_daypicker_item_now_outline_offset);--_ui5-v2-7-0_daypicker_item_selected_between_hover_background: var(--sapList_Hover_SelectionBackground);--_ui5-v2-7-0_daypicker_item_now_not_selected_inset: 0;--_ui5-v2-7-0_daypicker_item_now_border_color: var(--sapLegend_CurrentDateTime);--_ui5-v2-7-0_dp_two_calendar_item_secondary_text_border_radios: .25rem;--_ui5-v2-7-0_daypicker_special_day_top: 2.5rem;--_ui5-v2-7-0_daypicker_special_day_before_border_color: var(--sapList_Background);--_ui5-v2-7-0_daypicker_selected_item_now_special_day_border_bottom_radius: 0;--_ui5-v2-7-0_daypicker_twocalendar_item_special_day_after_border_width: .125rem;--_ui5-v2-7-0_daypicker_twocalendar_item_special_day_dot: .375rem;--_ui5-v2-7-0_daypicker_twocalendar_item_special_day_top: 2rem;--_ui5-v2-7-0_daypicker_twocalendar_item_special_day_right: 1.4375rem;--_ui5-v2-7-0_daypicker_item_border_radius: .4375rem;--_ui5-v2-7-0_daypicker_item_focus_border: .0625rem dotted var(--sapContent_FocusColor);--_ui5-v2-7-0_daypicker_item_selected_border: .0625rem solid var(--sapList_SelectionBorderColor);--_ui5-v2-7-0_daypicker_item_not_selected_focus_border: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-7-0_daypicker_item_selected_focus_color: var(--sapContent_FocusColor);--_ui5-v2-7-0_daypicker_item_selected_focus_width: .125rem;--_ui5-v2-7-0_daypicker_item_no_selected_inset: .375rem;--_ui5-v2-7-0_daypicker_item_now_border_focus_after: .125rem solid var(--sapList_SelectionBorderColor);--_ui5-v2-7-0_daypicker_item_now_border_radius_focus_after: .3125rem;--_ui5-v2-7-0_day_picker_item_selected_now_border_focus: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-7-0_day_picker_item_selected_now_border_radius_focus: .1875rem;--ui5-v2-7-0-dp-item_withsecondtype_border: .375rem;--_ui5-v2-7-0_daypicker_item_now_border: .125rem solid var(--sapLegend_CurrentDateTime);--_ui5-v2-7-0_daypicker_dayname_color: var(--sapContent_LabelColor);--_ui5-v2-7-0_daypicker_weekname_color: var(--sapContent_LabelColor);--_ui5-v2-7-0_daypicker_item_selected_box_shadow: inset 0 0 0 .0625rem var(--sapContent_Selected_ForegroundColor);--_ui5-v2-7-0_daypicker_item_selected_daytext_hover_background: transparent;--_ui5-v2-7-0_daypicker_item_border_radius_item: .5rem;--_ui5-v2-7-0_daypicker_item_border_radius_focus_after: .1875rem;--_ui5-v2-7-0_daypicker_item_selected_between_border: .5rem;--_ui5-v2-7-0_daypicker_item_selected_between_background: var(--sapList_SelectionBackgroundColor);--_ui5-v2-7-0_daypicker_item_selected_between_text_background: transparent;--_ui5-v2-7-0_daypicker_item_selected_between_text_font: var(--sapFontFamily);--_ui5-v2-7-0_daypicker_item_selected_text_font: var(--sapFontBoldFamily);--_ui5-v2-7-0_daypicker_item_now_box_shadow: inset 0 0 0 .35rem var(--sapList_Background);--_ui5-v2-7-0_daypicker_item_selected_text_outline: .0625rem solid var(--sapSelectedColor);--_ui5-v2-7-0_daypicker_item_now_selected_outline_offset: -.25rem;--_ui5-v2-7-0_daypicker_item_now_selected_between_inset: .25rem;--_ui5-v2-7-0_daypicker_item_now_selected_between_border: .0625rem solid var(--sapContent_Selected_ForegroundColor);--_ui5-v2-7-0_daypicker_item_now_selected_between_border_radius: .1875rem;--_ui5-v2-7-0_daypicker_item_select_between_border: 1px solid var(--sapContent_Selected_ForegroundColor);--_ui5-v2-7-0_daypicker_item_weeekend_filter: brightness(105%);--_ui5-v2-7-0_daypicker_item_selected_hover: var(--sapList_Hover_Background);--_ui5-v2-7-0_daypicker_item_now_inset: .3125rem;--_ui5-v2-7-0-dp-item_withsecondtype_border: .25rem;--_ui5-v2-7-0_daypicker_item_selected__secondary_type_text_outline: .0625rem solid var(--sapSelectedColor);--_ui5-v2-7-0_daypicker_two_calendar_item_now_day_text_content: "";--_ui5-v2-7-0_daypicker_two_calendar_item_now_selected_border_width: .125rem;--_ui5-v2-7-0_daypicker_two_calendar_item_border_radius: .5rem;--_ui5-v2-7-0_daypicker_two_calendar_item_border_focus_border_radius: .375rem;--_ui5-v2-7-0_daypicker_two_calendar_item_no_selected_inset: 0;--_ui5-v2-7-0_daypicker_two_calendar_item_selected_now_border_radius_focus: .1875rem;--_ui5-v2-7-0_daypicker_two_calendar_item_no_selected_focus_inset: .1875rem;--_ui5-v2-7-0_daypicker_two_calendar_item_no_select_focus_border_radius: .3125rem;--_ui5-v2-7-0_daypicker_two_calendar_item_now_inset: .3125rem;--_ui5-v2-7-0_daypicker_two_calendar_item_now_selected_border_inset: .125rem;--_ui5-v2-7-0_daypicker_selected_item_special_day_width: calc(100% - .125rem) ;--_ui5-v2-7-0_daypicker_special_day_border_bottom_radius: .5rem;--_ui5-v2-7-0-daypicker_item_selected_now_border_radius: .5rem;--_ui5-v2-7-0_daypicker_selected_item_now_special_day_width: calc(100% - .1875rem) ;--_ui5-v2-7-0_daypicker_selected_item_now_special_day_border_bottom_radius_alternate: .5rem;--_ui5-v2-7-0_daypicker_selected_item_now_special_day_top: 2.4375rem;--_ui5-v2-7-0_daypicker_two_calendar_item_margin_bottom: 0;--_ui5-v2-7-0_daypicker_twocalendar_item_special_day_now_inset: .3125rem;--_ui5-v2-7-0_daypicker_twocalendar_item_special_day_now_border_radius: .25rem;--_ui5-v2-7-0_daypicker_item_now_focus_margin: 0;--_ui5-v2-7-0_daypicker_special_day_border_top: none;--_ui5-v2-7-0_daypicker_special_day_selected_border_radius_bottom: .25rem;--_ui5-v2-7-0_daypicker_specialday_focused_top: 2.125rem;--_ui5-v2-7-0_daypicker_specialday_focused_width: calc(100% - .75rem) ;--_ui5-v2-7-0_daypicker_specialday_focused_border_bottom: 0;--_ui5-v2-7-0_daypicker_item_now_specialday_top: 2.3125rem;--_ui5-v2-7-0_daypicker_item_now_specialday_width: calc(100% - .5rem) ;--_ui5-v2-7-0_dialog_header_error_state_icon_color: var(--sapNegativeElementColor);--_ui5-v2-7-0_dialog_header_information_state_icon_color: var(--sapInformativeElementColor);--_ui5-v2-7-0_dialog_header_success_state_icon_color: var(--sapPositiveElementColor);--_ui5-v2-7-0_dialog_header_warning_state_icon_color: var(--sapCriticalElementColor);--_ui5-v2-7-0_dialog_header_state_line_height: .0625rem;--_ui5-v2-7-0_dialog_header_focus_bottom_offset: 2px;--_ui5-v2-7-0_dialog_header_focus_top_offset: 1px;--_ui5-v2-7-0_dialog_header_focus_left_offset: 1px;--_ui5-v2-7-0_dialog_header_focus_right_offset: 1px;--_ui5-v2-7-0_dialog_header_border_radius: var(--sapElement_BorderCornerRadius);--_ui5-v2-7-0_file_uploader_value_state_error_hover_background_color: var(--sapField_Hover_Background);--_ui5-v2-7-0_file_uploader_hover_border: none;--_ui5-v2-7-0_table_cell_valign: center;--_ui5-v2-7-0_table_cell_min_width: 2.75rem;--_ui5-v2-7-0_table_navigated_cell_width: .25rem;--_ui5-v2-7-0_table_cell_horizontal_padding: .5rem;--_ui5-v2-7-0_table_cell_vertical_padding: .25rem;--_ui5-v2-7-0_table_row_actions_gap: .25rem;--ui5-v2-7-0-form-item-layout: 4fr 8fr 0fr;--ui5-v2-7-0-form-item-label-justify: end;--ui5-v2-7-0-form-item-label-justify-span12: start;--ui5-v2-7-0-form-item-label-padding: .125rem 0;--ui5-v2-7-0-form-item-label-padding-end: .85rem;--ui5-v2-7-0-form-item-label-padding-span12: .625rem .25rem 0 .25rem;--ui5-v2-7-0-group-header-listitem-background-color: var(--sapList_GroupHeaderBackground);--ui5-v2-7-0-icon-focus-border-radius: .25rem;--_ui5-v2-7-0_input_width: 13.125rem;--_ui5-v2-7-0_input_min_width: 2.75rem;--_ui5-v2-7-0_input_height: var(--sapElement_Height);--_ui5-v2-7-0_input_compact_height: 1.625rem;--_ui5-v2-7-0_input_value_state_error_hover_background: var(--sapField_Hover_Background);--_ui5-v2-7-0_input_background_color: var(--sapField_Background);--_ui5-v2-7-0_input_border_radius: var(--sapField_BorderCornerRadius);--_ui5-v2-7-0_input_placeholder_style: italic;--_ui5-v2-7-0_input_placeholder_color: var(--sapField_PlaceholderTextColor);--_ui5-v2-7-0_input_bottom_border_height: 0;--_ui5-v2-7-0_input_bottom_border_color: transparent;--_ui5-v2-7-0_input_focused_border_color: var(--sapField_Hover_BorderColor);--_ui5-v2-7-0_input_state_border_width: .125rem;--_ui5-v2-7-0_input_information_border_width: .125rem;--_ui5-v2-7-0_input_error_font_weight: normal;--_ui5-v2-7-0_input_warning_font_weight: normal;--_ui5-v2-7-0_input_focus_border_width: 1px;--_ui5-v2-7-0_input_error_warning_font_style: inherit;--_ui5-v2-7-0_input_error_warning_text_indent: 0;--_ui5-v2-7-0_input_disabled_color: var(--sapContent_DisabledTextColor);--_ui5-v2-7-0_input_disabled_font_weight: normal;--_ui5-v2-7-0_input_disabled_border_color: var(--sapField_BorderColor);--_ui5-v2-7-0-input_disabled_background: var(--sapField_Background);--_ui5-v2-7-0_input_readonly_border_color: var(--sapField_ReadOnly_BorderColor);--_ui5-v2-7-0_input_readonly_background: var(--sapField_ReadOnly_Background);--_ui5-v2-7-0_input_disabled_opacity: var(--sapContent_DisabledOpacity);--_ui5-v2-7-0_input_icon_min_width: 2.25rem;--_ui5-v2-7-0_input_compact_min_width: 2rem;--_ui5-v2-7-0_input_transition: none;--_ui5-v2-7-0-input-value-state-icon-display: none;--_ui5-v2-7-0_input_value_state_error_border_color: var(--sapField_InvalidColor);--_ui5-v2-7-0_input_focused_value_state_error_border_color: var(--sapField_InvalidColor);--_ui5-v2-7-0_input_value_state_warning_border_color: var(--sapField_WarningColor);--_ui5-v2-7-0_input_focused_value_state_warning_border_color: var(--sapField_WarningColor);--_ui5-v2-7-0_input_value_state_success_border_color: var(--sapField_SuccessColor);--_ui5-v2-7-0_input_focused_value_state_success_border_color: var(--sapField_SuccessColor);--_ui5-v2-7-0_input_value_state_success_border_width: 1px;--_ui5-v2-7-0_input_value_state_information_border_color: var(--sapField_InformationColor);--_ui5-v2-7-0_input_focused_value_state_information_border_color: var(--sapField_InformationColor);--_ui5-v2-7-0-input-value-state-information-border-width: 1px;--_ui5-v2-7-0-input-background-image: none;--ui5-v2-7-0_input_focus_pseudo_element_content: "";--_ui5-v2-7-0_input_value_state_error_warning_placeholder_font_weight: normal;--_ui5-v2-7-0-input_error_placeholder_color: var(--sapField_PlaceholderTextColor);--_ui5-v2-7-0_input_icon_width: 2.25rem;--_ui5-v2-7-0-input-icons-count: 0;--_ui5-v2-7-0_input_margin_top_bottom: .1875rem;--_ui5-v2-7-0_input_tokenizer_min_width: 3.25rem;--_ui5-v2-7-0-input-border: none;--_ui5-v2-7-0_input_hover_border: none;--_ui5-v2-7-0_input_focus_border_radius: .25rem;--_ui5-v2-7-0_input_readonly_focus_border_radius: .125rem;--_ui5-v2-7-0_input_error_warning_border_style: none;--_ui5-v2-7-0_input_focused_value_state_error_background: var(--sapField_Hover_Background);--_ui5-v2-7-0_input_focused_value_state_warning_background: var(--sapField_Hover_Background);--_ui5-v2-7-0_input_focused_value_state_success_background: var(--sapField_Hover_Background);--_ui5-v2-7-0_input_focused_value_state_information_background: var(--sapField_Hover_Background);--_ui5-v2-7-0_input_focused_value_state_error_focus_outline_color: var(--sapField_InvalidColor);--_ui5-v2-7-0_input_focused_value_state_warning_focus_outline_color: var(--sapField_WarningColor);--_ui5-v2-7-0_input_focused_value_state_success_focus_outline_color: var(--sapField_SuccessColor);--_ui5-v2-7-0_input_focus_offset: 0;--_ui5-v2-7-0_input_readonly_focus_offset: .125rem;--_ui5-v2-7-0_input_information_icon_padding: .625rem .625rem .5rem .625rem;--_ui5-v2-7-0_input_information_focused_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-7-0_input_error_warning_icon_padding: .625rem .625rem .5rem .625rem;--_ui5-v2-7-0_input_error_warning_focused_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-7-0_input_custom_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-7-0_input_error_warning_custom_icon_padding: .625rem .625rem .5rem .625rem;--_ui5-v2-7-0_input_error_warning_custom_focused_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-7-0_input_information_custom_icon_padding: .625rem .625rem .5rem .625rem;--_ui5-v2-7-0_input_information_custom_focused_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-7-0_input_focus_outline_color: var(--sapField_Active_BorderColor);--_ui5-v2-7-0_input_icon_wrapper_height: calc(100% - 1px) ;--_ui5-v2-7-0_input_icon_wrapper_state_height: calc(100% - 2px) ;--_ui5-v2-7-0_input_icon_wrapper_success_state_height: calc(100% - var(--_ui5-v2-7-0_input_value_state_success_border_width));--_ui5-v2-7-0_input_icon_color: var(--sapContent_IconColor);--_ui5-v2-7-0_input_icon_pressed_bg: var(--sapButton_Selected_Background);--_ui5-v2-7-0_input_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-7-0_input_icon_hover_bg: var(--sapField_Focus_Background);--_ui5-v2-7-0_input_icon_pressed_color: var(--sapButton_Active_TextColor);--_ui5-v2-7-0_input_icon_border_radius: .25rem;--_ui5-v2-7-0_input_icon_box_shadow: var(--sapField_Hover_Shadow);--_ui5-v2-7-0_input_icon_border: none;--_ui5-v2-7-0_input_error_icon_box_shadow: var(--sapContent_Negative_Shadow);--_ui5-v2-7-0_input_warning_icon_box_shadow: var(--sapContent_Critical_Shadow);--_ui5-v2-7-0_input_information_icon_box_shadow: var(--sapContent_Informative_Shadow);--_ui5-v2-7-0_input_success_icon_box_shadow: var(--sapContent_Positive_Shadow);--_ui5-v2-7-0_input_icon_error_pressed_color: var(--sapButton_Reject_Selected_TextColor);--_ui5-v2-7-0_input_icon_warning_pressed_color: var(--sapButton_Attention_Selected_TextColor);--_ui5-v2-7-0_input_icon_information_pressed_color: var(--sapButton_Selected_TextColor);--_ui5-v2-7-0_input_icon_success_pressed_color: var(--sapButton_Accept_Selected_TextColor);--_ui5-v2-7-0_link_focus_text_decoration: underline;--_ui5-v2-7-0_link_text_decoration: var(--sapLink_TextDecoration);--_ui5-v2-7-0_link_hover_text_decoration: var(--sapLink_Hover_TextDecoration);--_ui5-v2-7-0_link_focused_hover_text_decoration: none;--_ui5-v2-7-0_link_focused_hover_text_color: var(--sapContent_ContrastTextColor);--_ui5-v2-7-0_link_active_text_decoration: var(--sapLink_Active_TextDecoration);--_ui5-v2-7-0_link_outline: none;--_ui5-v2-7-0_link_focus_border-radius: .125rem;--_ui5-v2-7-0_link_focus_background_color: var(--sapContent_FocusColor);--_ui5-v2-7-0_link_focus_color: var(--sapContent_ContrastTextColor);--_ui5-v2-7-0_link_subtle_text_decoration: underline;--_ui5-v2-7-0_link_subtle_text_decoration_hover: none;--ui5-v2-7-0_list_footer_text_color: var(--sapList_FooterTextColor);--ui5-v2-7-0-listitem-background-color: var(--sapList_Background);--ui5-v2-7-0-listitem-border-bottom: var(--sapList_BorderWidth) solid var(--sapList_BorderColor);--ui5-v2-7-0-listitem-selected-border-bottom: 1px solid var(--sapList_SelectionBorderColor);--ui5-v2-7-0-listitem-focused-selected-border-bottom: 1px solid var(--sapList_SelectionBorderColor);--_ui5-v2-7-0_listitembase_focus_width: 1px;--_ui5-v2-7-0-listitembase_disabled_opacity: .5;--_ui5-v2-7-0_product_switch_item_border: none;--ui5-v2-7-0-listitem-active-border-color: var(--sapContent_FocusColor);--_ui5-v2-7-0_menu_item_padding: 0 1rem 0 .75rem;--_ui5-v2-7-0_menu_item_submenu_icon_right: 1rem;--_ui5-v2-7-0_menu_item_additional_text_start_margin: 1rem;--_ui5-v2-7-0_menu_popover_border_radius: var(--sapPopover_BorderCornerRadius);--_ui5-v2-7-0_monthpicker_item_margin: .0625rem;--_ui5-v2-7-0_monthpicker_item_border: .0625rem solid var(--sapButton_Lite_BorderColor);--_ui5-v2-7-0_monthpicker_item_hover_border: .0625rem solid var(--sapButton_Lite_Hover_BorderColor);--_ui5-v2-7-0_monthpicker_item_active_border: .0625rem solid var(--sapButton_Lite_Active_BorderColor);--_ui5-v2-7-0_monthpicker_item_selected_border: .0625rem solid var(--sapButton_Selected_BorderColor);--_ui5-v2-7-0_monthpicker_item_selected_hover_border: .0625rem solid var(--sapButton_Selected_Hover_BorderColor);--_ui5-v2-7-0_monthpicker_item_border_radius: .5rem;--_ui5-v2-7-0_message_strip_icon_width: 2.5rem;--_ui5-v2-7-0_message_strip_button_border_width: 0;--_ui5-v2-7-0_message_strip_button_border_style: none;--_ui5-v2-7-0_message_strip_button_border_color: transparent;--_ui5-v2-7-0_message_strip_button_border_radius: 0;--_ui5-v2-7-0_message_strip_padding: .4375rem 2.5rem .4375rem 2.5rem;--_ui5-v2-7-0_message_strip_padding_block_no_icon: .4375rem .4375rem;--_ui5-v2-7-0_message_strip_padding_inline_no_icon: 1rem 2.5rem;--_ui5-v2-7-0_message_strip_button_height: 1.625rem;--_ui5-v2-7-0_message_strip_border_width: 1px;--_ui5-v2-7-0_message_strip_close_button_border: none;--_ui5-v2-7-0_message_strip_icon_top: .4375rem;--_ui5-v2-7-0_message_strip_focus_width: 1px;--_ui5-v2-7-0_message_strip_focus_offset: -2px;--_ui5-v2-7-0_message_strip_close_button_top: .125rem;--_ui5-v2-7-0_message_strip_close_button_color_set_1_background: #eaecee4d;--_ui5-v2-7-0_message_strip_close_button_color_set_2_background: #eaecee80;--_ui5-v2-7-0_message_strip_close_button_color_set_1_color: var(--sapButton_Emphasized_TextColor);--_ui5-v2-7-0_message_strip_close_button_color_set_1_hover_color: var(--sapButton_Emphasized_TextColor);--_ui5-v2-7-0_message_strip_scheme_1_set_2_background: var(--sapIndicationColor_1b);--_ui5-v2-7-0_message_strip_scheme_1_set_2_border_color: var(--sapIndicationColor_1b_BorderColor);--_ui5-v2-7-0_message_strip_scheme_2_set_2_background: var(--sapIndicationColor_2b);--_ui5-v2-7-0_message_strip_scheme_2_set_2_border_color: var(--sapIndicationColor_2b_BorderColor);--_ui5-v2-7-0_message_strip_scheme_3_set_2_background: var(--sapIndicationColor_3b);--_ui5-v2-7-0_message_strip_scheme_3_set_2_border_color: var(--sapIndicationColor_3b_BorderColor);--_ui5-v2-7-0_message_strip_scheme_4_set_2_background: var(--sapIndicationColor_4b);--_ui5-v2-7-0_message_strip_scheme_4_set_2_border_color: var(--sapIndicationColor_4b_BorderColor);--_ui5-v2-7-0_message_strip_scheme_5_set_2_background: var(--sapIndicationColor_5b);--_ui5-v2-7-0_message_strip_scheme_5_set_2_border_color: var(--sapIndicationColor_5b_BorderColor);--_ui5-v2-7-0_message_strip_scheme_6_set_2_background: var(--sapIndicationColor_6b);--_ui5-v2-7-0_message_strip_scheme_6_set_2_border_color: var(--sapIndicationColor_6b_BorderColor);--_ui5-v2-7-0_message_strip_scheme_7_set_2_background: var(--sapIndicationColor_7b);--_ui5-v2-7-0_message_strip_scheme_7_set_2_border_color: var(--sapIndicationColor_7b_BorderColor);--_ui5-v2-7-0_message_strip_scheme_8_set_2_background: var(--sapIndicationColor_8b);--_ui5-v2-7-0_message_strip_scheme_8_set_2_border_color: var(--sapIndicationColor_8b_BorderColor);--_ui5-v2-7-0_message_strip_scheme_9_set_2_background: var(--sapIndicationColor_9b);--_ui5-v2-7-0_message_strip_scheme_9_set_2_border_color: var(--sapIndicationColor_9b_BorderColor);--_ui5-v2-7-0_message_strip_scheme_10_set_2_background: var(--sapIndicationColor_10b);--_ui5-v2-7-0_message_strip_scheme_10_set_2_border_color: var(--sapIndicationColor_10b_BorderColor);--_ui5-v2-7-0_message_strip_close_button_right: .1875rem;--_ui5-v2-7-0_panel_focus_border: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);--_ui5-v2-7-0_panel_header_height: 2.75rem;--_ui5-v2-7-0_panel_button_root_width: 2.75rem;--_ui5-v2-7-0_panel_button_root_height: 2.75rem;--_ui5-v2-7-0_panel_header_padding_right: .5rem;--_ui5-v2-7-0_panel_header_button_wrapper_padding: .25rem;--_ui5-v2-7-0_panel_border_radius: var(--sapGroup_BorderCornerRadius);--_ui5-v2-7-0_panel_border_bottom: none;--_ui5-v2-7-0_panel_default_header_border: .0625rem solid var(--sapGroup_TitleBorderColor);--_ui5-v2-7-0_panel_outline_offset: -.125rem;--_ui5-v2-7-0_panel_border_radius_expanded: var(--sapElement_BorderCornerRadius) var(--sapElement_BorderCornerRadius) 0 0;--_ui5-v2-7-0_panel_icon_color: var(--sapButton_Lite_TextColor);--_ui5-v2-7-0_panel_focus_offset: 0px;--_ui5-v2-7-0_panel_focus_bottom_offset: -1px;--_ui5-v2-7-0_panel_content_padding: .625rem 1rem;--_ui5-v2-7-0_panel_header_background_color: var(--sapGroup_TitleBackground);--_ui5-v2-7-0_popover_background: var(--sapGroup_ContentBackground);--_ui5-v2-7-0_popover_box_shadow: var(--sapContent_Shadow2);--_ui5-v2-7-0_popover_no_arrow_box_shadow: var(--sapContent_Shadow1);--_ui5-v2-7-0_popup_content_padding_s: 1rem;--_ui5-v2-7-0_popup_content_padding_m_l: 2rem;--_ui5-v2-7-0_popup_content_padding_xl: 3rem;--_ui5-v2-7-0_popup_header_footer_padding_s: 1rem;--_ui5-v2-7-0_popup_header_footer_padding_m_l: 2rem;--_ui5-v2-7-0_popup_header_footer_padding_xl: 3rem;--_ui5-v2-7-0_popup_viewport_margin: 10px;--_ui5-v2-7-0_popup_header_font_weight: 400;--_ui5-v2-7-0_popup_header_prop_header_text_alignment: flex-start;--_ui5-v2-7-0_popup_header_background: var(--sapPageHeader_Background);--_ui5-v2-7-0_popup_header_shadow: var(--sapContent_HeaderShadow);--_ui5-v2-7-0_popup_header_border: none;--_ui5-v2-7-0_popup_border_radius: .5rem;--_ui5-v2-7-0_popup_block_layer_background: var(--sapBlockLayer_Background);--_ui5-v2-7-0_popup_block_layer_opacity: .2;--_ui5-v2-7-0_progress_indicator_bar_border_max: none;--_ui5-v2-7-0_progress_indicator_icon_visibility: inline-block;--_ui5-v2-7-0_progress_indicator_side_points_visibility: block;--_ui5-v2-7-0_progress_indicator_padding: 1.25rem 0 .75rem 0;--_ui5-v2-7-0_progress_indicator_padding_novalue: .3125rem;--_ui5-v2-7-0_progress_indicator_padding_end: 1.25rem;--_ui5-v2-7-0_progress_indicator_host_height: unset;--_ui5-v2-7-0_progress_indicator_host_min_height: unset;--_ui5-v2-7-0_progress_indicator_host_box_sizing: border-box;--_ui5-v2-7-0_progress_indicator_root_position: relative;--_ui5-v2-7-0_progress_indicator_root_border_radius: .25rem;--_ui5-v2-7-0_progress_indicator_root_height: .375rem;--_ui5-v2-7-0_progress_indicator_root_min_height: .375rem;--_ui5-v2-7-0_progress_indicator_root_overflow: visible;--_ui5-v2-7-0_progress_indicator_bar_height: .625rem;--_ui5-v2-7-0_progress_indicator_bar_border_radius: .5rem;--_ui5-v2-7-0_progress_indicator_remaining_bar_border_radius: .25rem;--_ui5-v2-7-0_progress_indicator_remaining_bar_position: absolute;--_ui5-v2-7-0_progress_indicator_remaining_bar_width: 100%;--_ui5-v2-7-0_progress_indicator_remaining_bar_overflow: visible;--_ui5-v2-7-0_progress_indicator_icon_position: absolute;--_ui5-v2-7-0_progress_indicator_icon_right_position: -1.25rem;--_ui5-v2-7-0_progress_indicator_value_margin: 0 0 .1875rem 0;--_ui5-v2-7-0_progress_indicator_value_position: absolute;--_ui5-v2-7-0_progress_indicator_value_top_position: -1.3125rem;--_ui5-v2-7-0_progress_indicator_value_left_position: 0;--_ui5-v2-7-0_progress_indicator_background_none: var(--sapProgress_Background);--_ui5-v2-7-0_progress_indicator_background_error: var(--sapProgress_NegativeBackground);--_ui5-v2-7-0_progress_indicator_background_warning: var(--sapProgress_CriticalBackground);--_ui5-v2-7-0_progress_indicator_background_success: var(--sapProgress_PositiveBackground);--_ui5-v2-7-0_progress_indicator_background_information: var(--sapProgress_InformationBackground);--_ui5-v2-7-0_progress_indicator_value_state_none: var(--sapProgress_Value_Background);--_ui5-v2-7-0_progress_indicator_value_state_error: var(--sapProgress_Value_NegativeBackground);--_ui5-v2-7-0_progress_indicator_value_state_warning: var(--sapProgress_Value_CriticalBackground);--_ui5-v2-7-0_progress_indicator_value_state_success: var(--sapProgress_Value_PositiveBackground);--_ui5-v2-7-0_progress_indicator_value_state_information: var(--sapProgress_Value_InformationBackground);--_ui5-v2-7-0_progress_indicator_value_state_error_icon_color: var(--sapProgress_Value_NegativeTextColor);--_ui5-v2-7-0_progress_indicator_value_state_warning_icon_color: var(--sapProgress_Value_CriticalTextColor);--_ui5-v2-7-0_progress_indicator_value_state_success_icon_color: var(--sapProgress_Value_PositiveTextColor);--_ui5-v2-7-0_progress_indicator_value_state_information_icon_color: var(--sapProgress_Value_InformationTextColor);--_ui5-v2-7-0_progress_indicator_border: none;--_ui5-v2-7-0_progress_indicator_border_color_error: var(--sapErrorBorderColor);--_ui5-v2-7-0_progress_indicator_border_color_warning: var(--sapWarningBorderColor);--_ui5-v2-7-0_progress_indicator_border_color_success: var(--sapSuccessBorderColor);--_ui5-v2-7-0_progress_indicator_border_color_information: var(--sapInformationBorderColor);--_ui5-v2-7-0_progress_indicator_color: var(--sapField_TextColor);--_ui5-v2-7-0_progress_indicator_bar_color: var(--sapProgress_TextColor);--_ui5-v2-7-0_progress_indicator_icon_size: var(--sapFontLargeSize);--_ui5-v2-7-0_rating_indicator_border_radius: .5rem;--_ui5-v2-7-0_rating_indicator_outline_offset: -.125rem;--_ui5-v2-7-0_rating_indicator_item_height: 1em;--_ui5-v2-7-0_rating_indicator_item_width: 1em;--_ui5-v2-7-0_rating_indicator_component_spacing: .5rem 0px;--_ui5-v2-7-0_rating_indicator_component_padding: .25rem;--_ui5-v2-7-0_rating_indicator_item_size_s: 1.375rem;--_ui5-v2-7-0_rating_indicator_item_size_l: 2rem;--_ui5-v2-7-0_rating_indicator_readonly_item_height: .75em;--_ui5-v2-7-0_rating_indicator_readonly_item_width: .75em;--_ui5-v2-7-0_rating_indicator_readonly_item_spacing: .1875rem .1875rem;--_ui5-v2-7-0_segmented_btn_inner_border: .0625rem solid transparent;--_ui5-v2-7-0_segmented_btn_inner_border_odd_child: .0625rem solid transparent;--_ui5-v2-7-0_segmented_btn_inner_pressed_border_odd_child: .0625rem solid var(--sapButton_Selected_BorderColor);--_ui5-v2-7-0_segmented_btn_background_color: var(--sapButton_Lite_Background);--_ui5-v2-7-0_segmented_btn_border_color: var(--sapButton_Lite_BorderColor);--_ui5-v2-7-0_segmented_btn_hover_box_shadow: none;--_ui5-v2-7-0_segmented_btn_item_border_left: .0625rem;--_ui5-v2-7-0_segmented_btn_item_border_right: .0625rem;--_ui5-v2-7-0_button_base_min_compact_width: 2rem;--_ui5-v2-7-0_button_base_height: var(--sapElement_Height);--_ui5-v2-7-0_button_compact_height: 1.625rem;--_ui5-v2-7-0_button_border_radius: var(--sapButton_BorderCornerRadius);--_ui5-v2-7-0_button_compact_padding: .4375rem;--_ui5-v2-7-0_button_emphasized_outline: 1px dotted var(--sapContent_FocusColor);--_ui5-v2-7-0_button_focus_offset: 1px;--_ui5-v2-7-0_button_focus_width: 1px;--_ui5-v2-7-0_button_emphasized_focused_border_before: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-7-0_button_emphasized_focused_active_border_color: transparent;--_ui5-v2-7-0_button_focused_border: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-7-0_button_focused_border_radius: .375rem;--_ui5-v2-7-0_button_focused_inner_border_radius: .375rem;--_ui5-v2-7-0_button_base_min_width: 2.25rem;--_ui5-v2-7-0_button_base_padding: .5625rem;--_ui5-v2-7-0_button_base_icon_only_padding: .5625rem;--_ui5-v2-7-0_button_base_icon_margin: .375rem;--_ui5-v2-7-0_button_icon_font_size: 1rem;--_ui5-v2-7-0_button_text_shadow: none;--_ui5-v2-7-0_button_emphasized_border_width: .0625rem;--_ui5-v2-7-0_button_pressed_focused_border_color: var(--sapContent_FocusColor);--_ui5-v2-7-0_button_fontFamily: var(--sapFontSemiboldDuplexFamily);--_ui5-v2-7-0_button_emphasized_focused_border_color: var(--sapContent_ContrastFocusColor);--_ui5-v2-7-0_radio_button_min_width: 2.75rem;--_ui5-v2-7-0_radio_button_checked_fill: var(--sapSelectedColor);--_ui5-v2-7-0_radio_button_checked_error_fill: var(--sapField_InvalidColor);--_ui5-v2-7-0_radio_button_checked_success_fill: var(--sapField_SuccessColor);--_ui5-v2-7-0_radio_button_checked_information_fill: var(--sapField_InformationColor);--_ui5-v2-7-0_radio_button_warning_error_border_dash: 0;--_ui5-v2-7-0_radio_button_outer_ring_color: var(--sapField_BorderColor);--_ui5-v2-7-0_radio_button_outer_ring_width: var(--sapField_BorderWidth);--_ui5-v2-7-0_radio_button_outer_ring_bg: var(--sapField_Background);--_ui5-v2-7-0_radio_button_outer_ring_hover_color: var(--sapField_Hover_BorderColor);--_ui5-v2-7-0_radio_button_outer_ring_active_color: var(--sapField_Hover_BorderColor);--_ui5-v2-7-0_radio_button_outer_ring_checked_hover_color: var(--sapField_Hover_BorderColor);--_ui5-v2-7-0_radio_button_outer_ring_padding_with_label: 0 .6875rem;--_ui5-v2-7-0_radio_button_border: none;--_ui5-v2-7-0_radio_button_focus_outline: block;--_ui5-v2-7-0_radio_button_color: var(--sapField_BorderColor);--_ui5-v2-7-0_radio_button_label_offset: 1px;--_ui5-v2-7-0_radio_button_items_align: unset;--_ui5-v2-7-0_radio_button_information_border_width: var(--sapField_InformationBorderWidth);--_ui5-v2-7-0_radio_button_hover_fill: var(--sapField_Selector_Hover_Background);--_ui5-v2-7-0_radio_button_hover_fill_error: var(--sapField_Selector_Hover_InvalidBackground);--_ui5-v2-7-0_radio_button_hover_fill_warning: var(--sapField_Selector_Hover_WarningBackground);--_ui5-v2-7-0_radio_button_hover_fill_success: var(--sapField_Selector_Hover_SuccessBackground);--_ui5-v2-7-0_radio_button_hover_fill_information: var(--sapField_Selector_Hover_InformationBackground);--_ui5-v2-7-0_radio_button_border_width: var(--sapContent_FocusWidth);--_ui5-v2-7-0_radio_button_border_radius: .5rem;--_ui5-v2-7-0_radio_button_label_color: var(--sapField_TextColor);--_ui5-v2-7-0_radio_button_inner_ring_radius: 27.5%;--_ui5-v2-7-0_radio_button_outer_ring_padding: 0 .6875rem;--_ui5-v2-7-0_radio_button_read_only_border_type: 4,2;--_ui5-v2-7-0_radio_button_inner_ring_color: var(--sapContent_Selected_ForegroundColor);--_ui5-v2-7-0_radio_button_checked_warning_fill: var(--sapField_WarningColor);--_ui5-v2-7-0_radio_button_read_only_inner_ring_color: var(--sapField_TextColor);--_ui5-v2-7-0_radio_button_read_only_border_width: var(--sapElement_BorderWidth);--_ui5-v2-7-0_radio_button_focus_dist: .375rem;--_ui5-v2-7-0_switch_height: 2.75rem;--_ui5-v2-7-0_switch_foucs_border_size: 1px;--_ui5-v2-7-0-switch-root-border-radius: 0;--_ui5-v2-7-0-switch-root-box-shadow: none;--_ui5-v2-7-0-switch-focus: "";--_ui5-v2-7-0_switch_track_border_radius: .75rem;--_ui5-v2-7-0-switch-track-border: 1px solid;--_ui5-v2-7-0_switch_track_transition: none;--_ui5-v2-7-0_switch_handle_border_radius: 1rem;--_ui5-v2-7-0-switch-slider-texts-display: inline;--_ui5-v2-7-0_switch_width: 3.5rem;--_ui5-v2-7-0_switch_min_width: none;--_ui5-v2-7-0_switch_with_label_width: 3.875rem;--_ui5-v2-7-0_switch_focus_outline: none;--_ui5-v2-7-0_switch_root_after_outline: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-7-0_switch_root_after_boreder: none;--_ui5-v2-7-0_switch_root_after_boreder_radius: 1rem;--_ui5-v2-7-0_switch_root_outline_top: .5rem;--_ui5-v2-7-0_switch_root_outline_bottom: .5rem;--_ui5-v2-7-0_switch_root_outline_left: .375rem;--_ui5-v2-7-0_switch_root_outline_right: .375rem;--_ui5-v2-7-0_switch_disabled_opacity: var(--sapContent_DisabledOpacity);--_ui5-v2-7-0_switch_transform: translateX(100%) translateX(-1.625rem);--_ui5-v2-7-0_switch_transform_with_label: translateX(100%) translateX(-1.875rem);--_ui5-v2-7-0_switch_rtl_transform: translateX(-100%) translateX(1.625rem);--_ui5-v2-7-0_switch_rtl_transform_with_label: translateX(-100%) translateX(1.875rem);--_ui5-v2-7-0_switch_track_width: 2.5rem;--_ui5-v2-7-0_switch_track_height: 1.5rem;--_ui5-v2-7-0_switch_track_with_label_width: 2.875rem;--_ui5-v2-7-0_switch_track_with_label_height: 1.5rem;--_ui5-v2-7-0_switch_track_active_background_color: var(--sapButton_Track_Selected_Background);--_ui5-v2-7-0_switch_track_inactive_background_color: var(--sapButton_Track_Background);--_ui5-v2-7-0_switch_track_hover_active_background_color: var(--sapButton_Track_Selected_Hover_Background);--_ui5-v2-7-0_switch_track_hover_inactive_background_color: var(--sapButton_Track_Hover_Background);--_ui5-v2-7-0_switch_track_active_border_color: var(--sapButton_Track_Selected_BorderColor);--_ui5-v2-7-0_switch_track_inactive_border_color: var(--sapButton_Track_BorderColor);--_ui5-v2-7-0_switch_track_hover_active_border_color: var(--sapButton_Track_Selected_Hover_BorderColor);--_ui5-v2-7-0_switch_track_hover_inactive_border_color: var(--sapButton_Track_Hover_BorderColor);--_ui5-v2-7-0_switch_track_semantic_accept_background_color: var(--sapButton_Track_Positive_Background);--_ui5-v2-7-0_switch_track_semantic_reject_background_color: var(--sapButton_Track_Negative_Background);--_ui5-v2-7-0_switch_track_semantic_hover_accept_background_color: var(--sapButton_Track_Positive_Hover_Background);--_ui5-v2-7-0_switch_track_semantic_hover_reject_background_color: var(--sapButton_Track_Negative_Hover_Background);--_ui5-v2-7-0_switch_track_semantic_accept_border_color: var(--sapButton_Track_Positive_BorderColor);--_ui5-v2-7-0_switch_track_semantic_reject_border_color: var(--sapButton_Track_Negative_BorderColor);--_ui5-v2-7-0_switch_track_semantic_hover_accept_border_color: var(--sapButton_Track_Positive_Hover_BorderColor);--_ui5-v2-7-0_switch_track_semantic_hover_reject_border_color: var(--sapButton_Track_Negative_Hover_BorderColor);--_ui5-v2-7-0_switch_track_icon_display: inline-block;--_ui5-v2-7-0_switch_handle_width: 1.5rem;--_ui5-v2-7-0_switch_handle_height: 1.25rem;--_ui5-v2-7-0_switch_handle_with_label_width: 1.75rem;--_ui5-v2-7-0_switch_handle_with_label_height: 1.25rem;--_ui5-v2-7-0_switch_handle_border: var(--_ui5-v2-7-0_switch_handle_border_width) solid var(--sapButton_Handle_BorderColor);--_ui5-v2-7-0_switch_handle_border_width: .125rem;--_ui5-v2-7-0_switch_handle_active_background_color: var(--sapButton_Handle_Selected_Background);--_ui5-v2-7-0_switch_handle_inactive_background_color: var(--sapButton_Handle_Background);--_ui5-v2-7-0_switch_handle_hover_active_background_color: var(--sapButton_Handle_Selected_Hover_Background);--_ui5-v2-7-0_switch_handle_hover_inactive_background_color: var(--sapButton_Handle_Hover_Background);--_ui5-v2-7-0_switch_handle_active_border_color: var(--sapButton_Handle_Selected_BorderColor);--_ui5-v2-7-0_switch_handle_inactive_border_color: var(--sapButton_Handle_BorderColor);--_ui5-v2-7-0_switch_handle_hover_active_border_color: var(--sapButton_Handle_Selected_BorderColor);--_ui5-v2-7-0_switch_handle_hover_inactive_border_color: var(--sapButton_Handle_BorderColor);--_ui5-v2-7-0_switch_handle_semantic_accept_background_color: var(--sapButton_Handle_Positive_Background);--_ui5-v2-7-0_switch_handle_semantic_reject_background_color: var(--sapButton_Handle_Negative_Background);--_ui5-v2-7-0_switch_handle_semantic_hover_accept_background_color: var(--sapButton_Handle_Positive_Hover_Background);--_ui5-v2-7-0_switch_handle_semantic_hover_reject_background_color: var(--sapButton_Handle_Negative_Hover_Background);--_ui5-v2-7-0_switch_handle_semantic_accept_border_color: var(--sapButton_Handle_Positive_BorderColor);--_ui5-v2-7-0_switch_handle_semantic_reject_border_color: var(--sapButton_Handle_Negative_BorderColor);--_ui5-v2-7-0_switch_handle_semantic_hover_accept_border_color: var(--sapButton_Handle_Positive_BorderColor);--_ui5-v2-7-0_switch_handle_semantic_hover_reject_border_color: var(--sapButton_Handle_Negative_BorderColor);--_ui5-v2-7-0_switch_handle_on_hover_box_shadow: 0 0 0 .125rem var(--sapButton_Handle_Selected_Hover_BorderColor);--_ui5-v2-7-0_switch_handle_off_hover_box_shadow: 0 0 0 .125rem var(--sapButton_Handle_Hover_BorderColor);--_ui5-v2-7-0_switch_handle_semantic_on_hover_box_shadow: 0 0 0 .125rem var(--sapButton_Handle_Positive_Hover_BorderColor);--_ui5-v2-7-0_switch_handle_semantic_off_hover_box_shadow: 0 0 0 .125rem var(--sapButton_Handle_Negative_Hover_BorderColor);--_ui5-v2-7-0_switch_handle_left: .0625rem;--_ui5-v2-7-0_switch_text_font_family: var(--sapContent_IconFontFamily);--_ui5-v2-7-0_switch_text_font_size: var(--sapFontLargeSize);--_ui5-v2-7-0_switch_text_width: 1.25rem;--_ui5-v2-7-0_switch_text_with_label_font_family: "72-Condensed-Bold" , "72" , "72full" , Arial, Helvetica, sans-serif;--_ui5-v2-7-0_switch_text_with_label_font_size: var(--sapFontSmallSize);--_ui5-v2-7-0_switch_text_with_label_width: 1.75rem;--_ui5-v2-7-0_switch_text_inactive_left: .1875rem;--_ui5-v2-7-0_switch_text_inactive_left_alternate: .0625rem;--_ui5-v2-7-0_switch_text_inactive_right: auto;--_ui5-v2-7-0_switch_text_inactive_right_alternate: 0;--_ui5-v2-7-0_switch_text_active_left: .1875rem;--_ui5-v2-7-0_switch_text_active_left_alternate: .0625rem;--_ui5-v2-7-0_switch_text_active_right: auto;--_ui5-v2-7-0_switch_text_active_color: var(--sapButton_Handle_Selected_TextColor);--_ui5-v2-7-0_switch_text_inactive_color: var(--sapButton_Handle_TextColor);--_ui5-v2-7-0_switch_text_semantic_accept_color: var(--sapButton_Handle_Positive_TextColor);--_ui5-v2-7-0_switch_text_semantic_reject_color: var(--sapButton_Handle_Negative_TextColor);--_ui5-v2-7-0_switch_text_overflow: hidden;--_ui5-v2-7-0_switch_text_z_index: 1;--_ui5-v2-7-0_switch_text_hidden: hidden;--_ui5-v2-7-0_switch_text_min_width: none;--_ui5-v2-7-0_switch_icon_width: 1rem;--_ui5-v2-7-0_switch_icon_height: 1rem;--_ui5-v2-7-0_select_disabled_background: var(--sapField_Background);--_ui5-v2-7-0_select_disabled_border_color: var(--sapField_BorderColor);--_ui5-v2-7-0_select_state_error_warning_border_style: solid;--_ui5-v2-7-0_select_state_error_warning_border_width: .125rem;--_ui5-v2-7-0_select_focus_width: 1px;--_ui5-v2-7-0_select_label_color: var(--sapField_TextColor);--_ui5-v2-7-0_select_hover_icon_left_border: none;--_ui5-v2-7-0_select_option_focus_border_radius: var(--sapElement_BorderCornerRadius);--_ui5-v2-7-0_split_button_host_transparent_hover_background: transparent;--_ui5-v2-7-0_split_button_transparent_disabled_background: transparent;--_ui5-v2-7-0_split_button_host_default_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_BorderColor);--_ui5-v2-7-0_split_button_host_attention_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_Attention_BorderColor);--_ui5-v2-7-0_split_button_host_emphasized_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_Emphasized_BorderColor);--_ui5-v2-7-0_split_button_host_positive_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_Accept_BorderColor);--_ui5-v2-7-0_split_button_host_negative_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_Reject_BorderColor);--_ui5-v2-7-0_split_button_host_transparent_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_Lite_BorderColor);--_ui5-v2-7-0_split_text_button_border_color: transparent;--_ui5-v2-7-0_split_text_button_background_color: transparent;--_ui5-v2-7-0_split_text_button_emphasized_border: var(--sapButton_BorderWidth) solid var(--sapButton_Emphasized_BorderColor);--_ui5-v2-7-0_split_text_button_emphasized_border_width: .0625rem;--_ui5-v2-7-0_split_text_button_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-7-0_split_text_button_emphasized_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Emphasized_BorderColor);--_ui5-v2-7-0_split_text_button_positive_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Accept_BorderColor);--_ui5-v2-7-0_split_text_button_negative_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Reject_BorderColor);--_ui5-v2-7-0_split_text_button_attention_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Attention_BorderColor);--_ui5-v2-7-0_split_text_button_transparent_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-7-0_split_arrow_button_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-7-0_split_arrow_button_emphasized_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Emphasized_BorderColor);--_ui5-v2-7-0_split_arrow_button_emphasized_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_Emphasized_BorderColor);--_ui5-v2-7-0_split_arrow_button_positive_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Accept_BorderColor);--_ui5-v2-7-0_split_arrow_button_negative_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Reject_BorderColor);--_ui5-v2-7-0_split_arrow_button_attention_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Attention_BorderColor);--_ui5-v2-7-0_split_arrow_button_transparent_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-7-0_split_text_button_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-7-0_split_text_button_emphasized_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_Emphasized_BorderColor);--_ui5-v2-7-0_split_text_button_positive_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_Accept_BorderColor);--_ui5-v2-7-0_split_text_button_negative_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_Reject_BorderColor);--_ui5-v2-7-0_split_text_button_attention_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_Attention_BorderColor);--_ui5-v2-7-0_split_text_button_transparent_hover_border_left: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-7-0_split_button_focused_border: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-7-0_split_button_focused_border_radius: .375rem;--_ui5-v2-7-0_split_button_middle_separator_width: 0;--_ui5-v2-7-0_split_button_middle_separator_left: -.0625rem;--_ui5-v2-7-0_split_button_middle_separator_hover_display: none;--_ui5-v2-7-0_split_button_text_button_width: 2.375rem;--_ui5-v2-7-0_split_button_text_button_right_border_width: .0625rem;--_ui5-v2-7-0_split_button_transparent_hover_background: var(--sapButton_Lite_Hover_Background);--_ui5-v2-7-0_split_button_transparent_hover_color: var(--sapButton_TextColor);--_ui5-v2-7-0_split_button_host_transparent_hover_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_BorderColor);--_ui5-v2-7-0_split_button_inner_focused_border_radius_outer: .375rem;--_ui5-v2-7-0_split_button_inner_focused_border_radius_inner: .375rem;--_ui5-v2-7-0_split_button_emphasized_separator_color: transparent;--_ui5-v2-7-0_split_button_positive_separator_color: transparent;--_ui5-v2-7-0_split_button_negative_separator_color: transparent;--_ui5-v2-7-0_split_button_attention_separator_color: transparent;--_ui5-v2-7-0_split_button_attention_separator_color_default: var(--sapButton_Attention_TextColor);--_ui5-v2-7-0_split_text_button_hover_border_right: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-7-0_split_text_button_emphasized_hover_border_right: none;--_ui5-v2-7-0_split_text_button_positive_hover_border_right: var(--sapButton_BorderWidth) solid var(--sapButton_Accept_BorderColor);--_ui5-v2-7-0_split_text_button_negative_hover_border_right: var(--sapButton_BorderWidth) solid var(--sapButton_Reject_BorderColor);--_ui5-v2-7-0_split_text_button_attention_hover_border_right: var(--sapButton_BorderWidth) solid var(--sapButton_Attention_BorderColor);--_ui5-v2-7-0_split_text_button_transparent_hover_border_right: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-7-0_split_button_middle_separator_hover_display_emphasized: none;--_ui5-v2-7-0_tc_header_height: var(--_ui5-v2-7-0_tc_item_height);--_ui5-v2-7-0_tc_header_height_text_only: var(--_ui5-v2-7-0_tc_item_text_only_height);--_ui5-v2-7-0_tc_header_height_text_with_additional_text: var(--_ui5-v2-7-0_tc_item_text_only_with_additional_text_height);--_ui5-v2-7-0_tc_header_box_shadow: var(--sapContent_HeaderShadow);--_ui5-v2-7-0_tc_header_background: var(--sapObjectHeader_Background);--_ui5-v2-7-0_tc_header_background_translucent: var(--sapObjectHeader_Background);--_ui5-v2-7-0_tc_content_background: var(--sapBackgroundColor);--_ui5-v2-7-0_tc_content_background_translucent: var(--sapGroup_ContentBackground);--_ui5-v2-7-0_tc_headeritem_padding: 1rem;--_ui5-v2-7-0_tc_headerItem_additional_text_color: var(--sapContent_LabelColor);--_ui5-v2-7-0_tc_headerItem_text_selected_color: var(--sapSelectedColor);--_ui5-v2-7-0_tc_headerItem_text_selected_hover_color: var(--sapSelectedColor);--_ui5-v2-7-0_tc_headerItem_additional_text_font_weight: normal;--_ui5-v2-7-0_tc_headerItem_neutral_color: var(--sapNeutralTextColor);--_ui5-v2-7-0_tc_headerItem_positive_color: var(--sapPositiveTextColor);--_ui5-v2-7-0_tc_headerItem_negative_color: var(--sapNegativeTextColor);--_ui5-v2-7-0_tc_headerItem_critical_color: var(--sapCriticalTextColor);--_ui5-v2-7-0_tc_headerItem_neutral_border_color: var(--sapNeutralElementColor);--_ui5-v2-7-0_tc_headerItem_positive_border_color: var(--sapPositiveElementColor);--_ui5-v2-7-0_tc_headerItem_negative_border_color: var(--sapNegativeElementColor);--_ui5-v2-7-0_tc_headerItem_critical_border_color: var(--sapCriticalElementColor);--_ui5-v2-7-0_tc_headerItem_neutral_selected_border_color: var(--_ui5-v2-7-0_tc_headerItem_neutral_color);--_ui5-v2-7-0_tc_headerItem_positive_selected_border_color: var(--_ui5-v2-7-0_tc_headerItem_positive_color);--_ui5-v2-7-0_tc_headerItem_negative_selected_border_color: var(--_ui5-v2-7-0_tc_headerItem_negative_color);--_ui5-v2-7-0_tc_headerItem_critical_selected_border_color: var(--_ui5-v2-7-0_tc_headerItem_critical_color);--_ui5-v2-7-0_tc_headerItem_transition: none;--_ui5-v2-7-0_tc_headerItem_hover_border_visibility: hidden;--_ui5-v2-7-0_tc_headerItemContent_border_radius: .125rem .125rem 0 0;--_ui5-v2-7-0_tc_headerItemContent_border_bg: transparent;--_ui5-v2-7-0_tc_headerItem_neutral_border_bg: transparent;--_ui5-v2-7-0_tc_headerItem_positive_border_bg: transparent;--_ui5-v2-7-0_tc_headerItem_negative_border_bg: transparent;--_ui5-v2-7-0_tc_headerItem_critical_border_bg: transparent;--_ui5-v2-7-0_tc_headerItemContent_border_height: 0;--_ui5-v2-7-0_tc_headerItemContent_focus_offset: 1rem;--_ui5-v2-7-0_tc_headerItem_text_focus_border_offset_left: 0px;--_ui5-v2-7-0_tc_headerItem_text_focus_border_offset_right: 0px;--_ui5-v2-7-0_tc_headerItem_text_focus_border_offset_top: 0px;--_ui5-v2-7-0_tc_headerItem_text_focus_border_offset_bottom: 0px;--_ui5-v2-7-0_tc_headerItem_mixed_mode_focus_border_offset_left: .75rem;--_ui5-v2-7-0_tc_headerItem_mixed_mode_focus_border_offset_right: .625rem;--_ui5-v2-7-0_tc_headerItem_mixed_mode_focus_border_offset_top: .75rem;--_ui5-v2-7-0_tc_headerItem_mixed_mode_focus_border_offset_bottom: .75rem;--_ui5-v2-7-0_tc_headerItemContent_focus_border: none;--_ui5-v2-7-0_tc_headerItemContent_default_focus_border: none;--_ui5-v2-7-0_tc_headerItemContent_focus_border_radius: 0;--_ui5-v2-7-0_tc_headerItemSemanticIcon_display: none;--_ui5-v2-7-0_tc_headerItemSemanticIcon_size: .75rem;--_ui5-v2-7-0_tc_mixedMode_itemText_font_family: var(--sapFontFamily);--_ui5-v2-7-0_tc_mixedMode_itemText_font_size: var(--sapFontSmallSize);--_ui5-v2-7-0_tc_mixedMode_itemText_font_weight: normal;--_ui5-v2-7-0_tc_overflowItem_positive_color: var(--sapPositiveColor);--_ui5-v2-7-0_tc_overflowItem_negative_color: var(--sapNegativeColor);--_ui5-v2-7-0_tc_overflowItem_critical_color: var(--sapCriticalColor);--_ui5-v2-7-0_tc_overflowItem_focus_offset: .125rem;--_ui5-v2-7-0_tc_overflowItem_indent: .5rem;--_ui5-v2-7-0_tc_overflowItem_extra_indent: 0rem;--_ui5-v2-7-0_tc_headerItemIcon_positive_selected_background: var(--sapPositiveColor);--_ui5-v2-7-0_tc_headerItemIcon_negative_selected_background: var(--sapNegativeColor);--_ui5-v2-7-0_tc_headerItemIcon_critical_selected_background: var(--sapCriticalColor);--_ui5-v2-7-0_tc_headerItemIcon_neutral_selected_background: var(--sapNeutralColor);--_ui5-v2-7-0_tc_headerItemIcon_semantic_selected_color: var(--sapGroup_ContentBackground);--_ui5-v2-7-0_tc_header_border_bottom: .0625rem solid var(--sapObjectHeader_Background);--_ui5-v2-7-0_tc_headerItemContent_border_bottom: .1875rem solid var(--sapSelectedColor);--_ui5-v2-7-0_tc_headerItem_color: var(--sapTextColor);--_ui5-v2-7-0_tc_overflowItem_default_color: var(--sapTextColor);--_ui5-v2-7-0_tc_overflowItem_current_color: CurrentColor;--_ui5-v2-7-0_tc_content_border_bottom: .0625rem solid var(--sapObjectHeader_BorderColor);--_ui5-v2-7-0_tc_headerItem_expand_button_margin_inline_start: 0rem;--_ui5-v2-7-0_tc_headerItem_single_click_expand_button_margin_inline_start: .25rem;--_ui5-v2-7-0_tc_headerItem_expand_button_border_radius: .25rem;--_ui5-v2-7-0_tc_headerItem_expand_button_separator_display: inline-block;--_ui5-v2-7-0_tc_headerItem_focus_border: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-7-0_tc_headerItem_focus_border_offset: -5px;--_ui5-v2-7-0_tc_headerItemIcon_focus_border_radius: 50%;--_ui5-v2-7-0_tc_headerItem_focus_border_radius: .375rem;--_ui5-v2-7-0_tc_headeritem_text_font_weight: bold;--_ui5-v2-7-0_tc_headerItem_focus_offset: 1px;--_ui5-v2-7-0_tc_headerItem_text_hover_color: var(--sapContent_Selected_ForegroundColor);--_ui5-v2-7-0_tc_headerItemIcon_border: .125rem solid var(--sapContent_Selected_ForegroundColor);--_ui5-v2-7-0_tc_headerItemIcon_color: var(--sapContent_Selected_ForegroundColor);--_ui5-v2-7-0_tc_headerItemIcon_selected_background: var(--sapContent_Selected_ForegroundColor);--_ui5-v2-7-0_tc_headerItemIcon_background_color: var(--sapContent_Selected_Background);--_ui5-v2-7-0_tc_headerItemIcon_selected_color: var(--sapContent_ContrastIconColor);--_ui5-v2-7-0_tc_mixedMode_itemText_color: var(--sapTextColor);--_ui5-v2-7-0_tc_overflow_text_color: var(--sapTextColor);--_ui5-v2-7-0_text_max_lines: initial;--_ui5-v2-7-0_textarea_state_border_width: .125rem;--_ui5-v2-7-0_textarea_information_border_width: .125rem;--_ui5-v2-7-0_textarea_placeholder_font_style: italic;--_ui5-v2-7-0_textarea_value_state_error_warning_placeholder_font_weight: normal;--_ui5-v2-7-0_textarea_error_placeholder_font_style: italic;--_ui5-v2-7-0_textarea_error_placeholder_color: var(--sapField_PlaceholderTextColor);--_ui5-v2-7-0_textarea_error_hover_background_color: var(--sapField_Hover_Background);--_ui5-v2-7-0_textarea_disabled_opacity: .4;--_ui5-v2-7-0_textarea_focus_pseudo_element_content: "";--_ui5-v2-7-0_textarea_min_height: 2.25rem;--_ui5-v2-7-0_textarea_padding_right_and_left_readonly: .5625rem;--_ui5-v2-7-0_textarea_padding_top_readonly: .4375rem;--_ui5-v2-7-0_textarea_exceeded_text_height: 1rem;--_ui5-v2-7-0_textarea_hover_border: none;--_ui5-v2-7-0_textarea_focus_border_radius: .25rem;--_ui5-v2-7-0_textarea_error_warning_border_style: none;--_ui5-v2-7-0_textarea_line_height: 1.5;--_ui5-v2-7-0_textarea_focused_value_state_error_background: var(--sapField_Hover_Background);--_ui5-v2-7-0_textarea_focused_value_state_warning_background: var(--sapField_Hover_Background);--_ui5-v2-7-0_textarea_focused_value_state_success_background: var(--sapField_Hover_Background);--_ui5-v2-7-0_textarea_focused_value_state_information_background: var(--sapField_Hover_Background);--_ui5-v2-7-0_textarea_focused_value_state_error_focus_outline_color: var(--sapField_InvalidColor);--_ui5-v2-7-0_textarea_focused_value_state_warning_focus_outline_color: var(--sapField_WarningColor);--_ui5-v2-7-0_textarea_focused_value_state_success_focus_outline_color: var(--sapField_SuccessColor);--_ui5-v2-7-0_textarea_focus_offset: 0;--_ui5-v2-7-0_textarea_readonly_focus_offset: 1px;--_ui5-v2-7-0_textarea_focus_outline_color: var(--sapField_Active_BorderColor);--_ui5-v2-7-0_textarea_value_state_focus_offset: 1px;--_ui5-v2-7-0_textarea_wrapper_padding: .0625rem;--_ui5-v2-7-0_textarea_success_wrapper_padding: .0625rem;--_ui5-v2-7-0_textarea_warning_error_wrapper_padding: .0625rem .0625rem .125rem .0625rem;--_ui5-v2-7-0_textarea_information_wrapper_padding: .0625rem .0625rem .125rem .0625rem;--_ui5-v2-7-0_textarea_padding_bottom_readonly: .375rem;--_ui5-v2-7-0_textarea_padding_top_error_warning: .5rem;--_ui5-v2-7-0_textarea_padding_bottom_error_warning: .4375rem;--_ui5-v2-7-0_textarea_padding_top_information: .5rem;--_ui5-v2-7-0_textarea_padding_bottom_information: .4375rem;--_ui5-v2-7-0_textarea_padding_right_and_left: .625rem;--_ui5-v2-7-0_textarea_padding_right_and_left_error_warning: .625rem;--_ui5-v2-7-0_textarea_padding_right_and_left_information: .625rem;--_ui5-v2-7-0_textarea_readonly_border_style: dashed;--_ui5-v2-7-0_time_picker_border: .0625rem solid transparent;--_ui5-v2-7-0-time_picker_border_radius: .25rem;--_ui5-v2-7-0_toast_vertical_offset: 3rem;--_ui5-v2-7-0_toast_horizontal_offset: 2rem;--_ui5-v2-7-0_toast_background: var(--sapList_Background);--_ui5-v2-7-0_toast_shadow: var(--sapContent_Shadow2);--_ui5-v2-7-0_toast_offset_width: -.1875rem;--_ui5-v2-7-0_toggle_button_pressed_focussed: var(--sapButton_Selected_BorderColor);--_ui5-v2-7-0_toggle_button_pressed_focussed_hovered: var(--sapButton_Selected_BorderColor);--_ui5-v2-7-0_toggle_button_selected_positive_text_color: var(--sapButton_Selected_TextColor);--_ui5-v2-7-0_toggle_button_selected_negative_text_color: var(--sapButton_Selected_TextColor);--_ui5-v2-7-0_toggle_button_selected_attention_text_color: var(--sapButton_Selected_TextColor);--_ui5-v2-7-0_toggle_button_emphasized_pressed_focussed_hovered: var(--sapContent_FocusColor);--_ui5-v2-7-0_toggle_button_emphasized_text_shadow: none;--_ui5-v2-7-0_yearpicker_item_margin: .0625rem;--_ui5-v2-7-0_yearpicker_item_border: .0625rem solid var(--sapButton_Lite_BorderColor);--_ui5-v2-7-0_yearpicker_item_hover_border: .0625rem solid var(--sapButton_Lite_Hover_BorderColor);--_ui5-v2-7-0_yearpicker_item_active_border: .0625rem solid var(--sapButton_Lite_Active_BorderColor);--_ui5-v2-7-0_yearpicker_item_selected_border: .0625rem solid var(--sapButton_Selected_BorderColor);--_ui5-v2-7-0_yearpicker_item_selected_hover_border: .0625rem solid var(--sapButton_Selected_Hover_BorderColor);--_ui5-v2-7-0_yearpicker_item_border_radius: .5rem;--_ui5-v2-7-0_calendar_header_middle_button_width: 6.25rem;--_ui5-v2-7-0_calendar_header_middle_button_flex: 1 1 auto;--_ui5-v2-7-0_calendar_header_middle_button_focus_after_display: block;--_ui5-v2-7-0_calendar_header_middle_button_focus_after_width: calc(100% - .375rem) ;--_ui5-v2-7-0_calendar_header_middle_button_focus_after_height: calc(100% - .375rem) ;--_ui5-v2-7-0_calendar_header_middle_button_focus_after_top_offset: .125rem;--_ui5-v2-7-0_calendar_header_middle_button_focus_after_left_offset: .125rem;--_ui5-v2-7-0_calendar_header_arrow_button_border: none;--_ui5-v2-7-0_calendar_header_arrow_button_border_radius: .5rem;--_ui5-v2-7-0_calendar_header_button_background_color: var(--sapButton_Lite_Background);--_ui5-v2-7-0_calendar_header_arrow_button_box_shadow: 0 0 .125rem 0 rgb(85 107 130 / 72%);--_ui5-v2-7-0_calendar_header_middle_button_focus_border_radius: .5rem;--_ui5-v2-7-0_calendar_header_middle_button_focus_border: none;--_ui5-v2-7-0_calendar_header_middle_button_focus_after_border: none;--_ui5-v2-7-0_calendar_header_middle_button_focus_background: transparent;--_ui5-v2-7-0_calendar_header_middle_button_focus_outline: .125rem solid var(--sapSelectedColor);--_ui5-v2-7-0_calendar_header_middle_button_focus_active_outline: .0625rem solid var(--sapSelectedColor);--_ui5-v2-7-0_calendar_header_middle_button_focus_active_background: transparent;--_ui5-v2-7-0_token_background: var(--sapButton_TokenBackground);--_ui5-v2-7-0_token_readonly_background: var(--sapButton_TokenBackground);--_ui5-v2-7-0_token_readonly_color: var(--sapContent_LabelColor);--_ui5-v2-7-0_token_right_margin: .3125rem;--_ui5-v2-7-0_token_padding: .25rem 0;--_ui5-v2-7-0_token_left_padding: .3125rem;--_ui5-v2-7-0_token_focused_selected_border: 1px solid var(--sapButton_Selected_BorderColor);--_ui5-v2-7-0_token_focus_offset: -.25rem;--_ui5-v2-7-0_token_focus_outline_width: .0625rem;--_ui5-v2-7-0_token_hover_border_color: var(--sapButton_TokenBorderColor);--_ui5-v2-7-0_token_selected_focus_outline: none;--_ui5-v2-7-0_token_focus_outline: none;--_ui5-v2-7-0_token_outline_offset: .125rem;--_ui5-v2-7-0_token_selected_hover_border_color: var(--sapButton_Selected_BorderColor);--ui5-v2-7-0_token_focus_pseudo_element_content: "";--_ui5-v2-7-0_token_border_radius: .375rem;--_ui5-v2-7-0_token_focus_outline_border_radius: .5rem;--_ui5-v2-7-0_token_text_color: var(--sapTextColor);--_ui5-v2-7-0_token_selected_text_font_family: var(--sapFontSemiboldDuplexFamily);--_ui5-v2-7-0_token_selected_internal_border_bottom: .125rem solid var(--sapButton_Selected_BorderColor);--_ui5-v2-7-0_token_selected_internal_border_bottom_radius: .1875rem;--_ui5-v2-7-0_token_text_icon_top: .0625rem;--_ui5-v2-7-0_token_selected_focused_offset_bottom: -.375rem;--_ui5-v2-7-0_token_readonly_padding: .25rem .3125rem;--_ui5-v2-7-0_tokenizer_gap: .625rem .25rem;--_ui5-v2-7-0_tokenizer-popover_offset: .3125rem;--_ui5-v2-7-0_tokenizer_n_more_text_color: var(--sapLinkColor);--_ui5-v2-7-0-multi_combobox_token_margin_top: 1px;--_ui5-v2-7-0_slider_progress_container_dot_background: var(--sapField_BorderColor);--_ui5-v2-7-0_slider_progress_border: none;--_ui5-v2-7-0_slider_padding: 1.406rem 1.0625rem;--_ui5-v2-7-0_slider_inner_height: .25rem;--_ui5-v2-7-0_slider_outer_height: 1.6875rem;--_ui5-v2-7-0_slider_progress_border_radius: .25rem;--_ui5-v2-7-0_slider_tickmark_bg: var(--sapField_BorderColor);--_ui5-v2-7-0_slider_handle_margin_left: calc(-1 * (var(--_ui5-v2-7-0_slider_handle_width) / 2));--_ui5-v2-7-0_slider_handle_outline_offset: .075rem;--_ui5-v2-7-0_slider_progress_outline: .0625rem dotted var(--sapContent_FocusColor);--_ui5-v2-7-0_slider_progress_outline_offset: -.8125rem;--_ui5-v2-7-0_slider_disabled_opacity: .4;--_ui5-v2-7-0_slider_tooltip_border_color: var(--sapField_BorderColor);--_ui5-v2-7-0_range_slider_handle_background_focus: transparent;--_ui5-v2-7-0_slider_progress_box_sizing: content-box;--_ui5-v2-7-0_range_slider_focus_outline_width: 100%;--_ui5-v2-7-0_slider_progress_outline_offset_left: 0;--_ui5-v2-7-0_range_slider_focus_outline_radius: 0;--_ui5-v2-7-0_slider_progress_container_top: 0;--_ui5-v2-7-0_slider_progress_height: 100%;--_ui5-v2-7-0_slider_active_progress_border: none;--_ui5-v2-7-0_slider_active_progress_left: 0;--_ui5-v2-7-0_slider_active_progress_top: 0;--_ui5-v2-7-0_slider_no_tickmarks_progress_container_top: var(--_ui5-v2-7-0_slider_progress_container_top);--_ui5-v2-7-0_slider_no_tickmarks_progress_height: var(--_ui5-v2-7-0_slider_progress_height);--_ui5-v2-7-0_slider_no_tickmarks_active_progress_border: var(--_ui5-v2-7-0_slider_active_progress_border);--_ui5-v2-7-0_slider_no_tickmarks_active_progress_left: var(--_ui5-v2-7-0_slider_active_progress_left);--_ui5-v2-7-0_slider_no_tickmarks_active_progress_top: var(--_ui5-v2-7-0_slider_active_progress_top);--_ui5-v2-7-0_slider_handle_focus_visibility: none;--_ui5-v2-7-0_slider_handle_icon_size: 1rem;--_ui5-v2-7-0_slider_progress_container_background: var(--sapSlider_Background);--_ui5-v2-7-0_slider_progress_container_dot_display: block;--_ui5-v2-7-0_slider_inner_min_width: 4rem;--_ui5-v2-7-0_slider_progress_background: var(--sapSlider_Selected_Background);--_ui5-v2-7-0_slider_progress_before_background: var(--sapSlider_Selected_Background);--_ui5-v2-7-0_slider_progress_after_background: var(--sapContent_MeasureIndicatorColor);--_ui5-v2-7-0_slider_handle_background: var(--sapSlider_HandleBackground);--_ui5-v2-7-0_slider_handle_icon_display: inline-block;--_ui5-v2-7-0_slider_handle_border: .0625rem solid var(--sapSlider_HandleBorderColor);--_ui5-v2-7-0_slider_handle_border_radius: .5rem;--_ui5-v2-7-0_slider_handle_height: 1.5rem;--_ui5-v2-7-0_slider_handle_width: 2rem;--_ui5-v2-7-0_slider_handle_top: -.625rem;--_ui5-v2-7-0_slider_handle_font_family: "SAP-icons";--_ui5-v2-7-0_slider_handle_hover_border: .0625rem solid var(--sapSlider_Hover_HandleBorderColor);--_ui5-v2-7-0_slider_handle_focus_border: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-7-0_slider_handle_background_focus: var(--sapSlider_Active_RangeHandleBackground);--_ui5-v2-7-0_slider_handle_outline: none;--_ui5-v2-7-0_slider_handle_hover_background: var(--sapSlider_Hover_HandleBackground);--_ui5-v2-7-0_slider_tooltip_background: var(--sapField_Focus_Background);--_ui5-v2-7-0_slider_tooltip_border: none;--_ui5-v2-7-0_slider_tooltip_border_radius: .5rem;--_ui5-v2-7-0_slider_tooltip_box_shadow: var(--sapContent_Shadow1);--_ui5-v2-7-0_range_slider_legacy_progress_focus_display: none;--_ui5-v2-7-0_range_slider_progress_focus_display: block;--_ui5-v2-7-0_slider_tickmark_in_range_bg: var(--sapSlider_Selected_BorderColor);--_ui5-v2-7-0_slider_label_fontsize: var(--sapFontSmallSize);--_ui5-v2-7-0_slider_label_color: var(--sapContent_LabelColor);--_ui5-v2-7-0_slider_tooltip_min_width: 2rem;--_ui5-v2-7-0_slider_tooltip_padding: .25rem;--_ui5-v2-7-0_slider_tooltip_fontsize: var(--sapFontSmallSize);--_ui5-v2-7-0_slider_tooltip_color: var(--sapContent_LabelColor);--_ui5-v2-7-0_slider_tooltip_height: 1.375rem;--_ui5-v2-7-0_slider_handle_focus_width: 1px;--_ui5-v2-7-0_slider_start_end_point_size: .5rem;--_ui5-v2-7-0_slider_start_end_point_left: -.75rem;--_ui5-v2-7-0_slider_start_end_point_top: -.125rem;--_ui5-v2-7-0_slider_handle_focused_tooltip_distance: calc(var(--_ui5-v2-7-0_slider_tooltip_bottom) - var(--_ui5-v2-7-0_slider_handle_focus_width));--_ui5-v2-7-0_slider_tooltip_border_box: border-box;--_ui5-v2-7-0_range_slider_handle_active_background: var(--sapSlider_Active_RangeHandleBackground);--_ui5-v2-7-0_range_slider_active_handle_icon_display: none;--_ui5-v2-7-0_range_slider_progress_focus_top: -15px;--_ui5-v2-7-0_range_slider_progress_focus_left: calc(-1 * (var(--_ui5-v2-7-0_slider_handle_width) / 2) - 5px);--_ui5-v2-7-0_range_slider_progress_focus_padding: 0 1rem 0 1rem;--_ui5-v2-7-0_range_slider_progress_focus_width: calc(100% + var(--_ui5-v2-7-0_slider_handle_width) + 10px);--_ui5-v2-7-0_range_slider_progress_focus_height: calc(var(--_ui5-v2-7-0_slider_handle_height) + 10px);--_ui5-v2-7-0_range_slider_root_hover_handle_icon_display: inline-block;--_ui5-v2-7-0_range_slider_root_hover_handle_bg: var(--_ui5-v2-7-0_slider_handle_hover_background);--_ui5-v2-7-0_range_slider_root_active_handle_icon_display: none;--_ui5-v2-7-0_slider_tickmark_height: .5rem;--_ui5-v2-7-0_slider_tickmark_top: -2px;--_ui5-v2-7-0_slider_handle_box_sizing: border-box;--_ui5-v2-7-0_range_slider_handle_background: var(--sapSlider_RangeHandleBackground);--_ui5-v2-7-0_slider_tooltip_bottom: 2rem;--_ui5-v2-7-0_value_state_message_border: none;--_ui5-v2-7-0_value_state_header_border: none;--_ui5-v2-7-0_input_value_state_icon_offset: .5rem;--_ui5-v2-7-0_value_state_header_box_shadow_error: inset 0 -.0625rem var(--sapField_InvalidColor);--_ui5-v2-7-0_value_state_header_box_shadow_information: inset 0 -.0625rem var(--sapField_InformationColor);--_ui5-v2-7-0_value_state_header_box_shadow_success: inset 0 -.0625rem var(--sapField_SuccessColor);--_ui5-v2-7-0_value_state_header_box_shadow_warning: inset 0 -.0625rem var(--sapField_WarningColor);--_ui5-v2-7-0_value_state_message_icon_offset_phone: 1rem;--_ui5-v2-7-0_value_state_header_border_bottom: none;--_ui5-v2-7-0_input_value_state_icon_display: inline-block;--_ui5-v2-7-0_value_state_message_padding: .5rem .5rem .5rem 1.875rem;--_ui5-v2-7-0_value_state_header_padding: .5rem .5rem .5rem 1.875rem;--_ui5-v2-7-0_value_state_message_popover_box_shadow: var(--sapContent_Shadow1);--_ui5-v2-7-0_value_state_message_icon_width: 1rem;--_ui5-v2-7-0_value_state_message_icon_height: 1rem;--_ui5-v2-7-0_value_state_header_offset: -.25rem;--_ui5-v2-7-0_value_state_message_popover_border_radius: var(--sapPopover_BorderCornerRadius);--_ui5-v2-7-0_value_state_message_padding_phone: .5rem .5rem .5rem 2.375rem;--_ui5-v2-7-0_value_state_message_line_height: 1.125rem;--_ui5-v2-7-0-toolbar-padding-left: .5rem;--_ui5-v2-7-0-toolbar-padding-right: .5rem;--_ui5-v2-7-0-toolbar-item-margin-left: 0;--_ui5-v2-7-0-toolbar-item-margin-right: .25rem;--_ui5-v2-7-0_step_input_min_width: 7.25rem;--_ui5-v2-7-0_step_input_padding: 2.5rem;--_ui5-v2-7-0_step_input_input_error_background_color: inherit;--_ui5-v2-7-0-step_input_button_state_hover_background_color: var(--sapField_Hover_Background);--_ui5-v2-7-0_step_input_border_style: none;--_ui5-v2-7-0_step_input_border_style_hover: none;--_ui5-v2-7-0_step_input_button_background_color: transparent;--_ui5-v2-7-0_step_input_input_border: none;--_ui5-v2-7-0_step_input_input_margin_top: 0;--_ui5-v2-7-0_step_input_button_display: inline-flex;--_ui5-v2-7-0_step_input_button_left: 0;--_ui5-v2-7-0_step_input_button_right: 0;--_ui5-v2-7-0_step_input_input_border_focused_after: .125rem solid #0070f2;--_ui5-v2-7-0_step_input_input_border_top_bottom_focused_after: 0;--_ui5-v2-7-0_step_input_input_border_radius_focused_after: .25rem;--_ui5-v2-7-0_step_input_input_information_border_color_focused_after: var(--sapField_InformationColor);--_ui5-v2-7-0_step_input_input_warning_border_color_focused_after: var(--sapField_WarningColor);--_ui5-v2-7-0_step_input_input_success_border_color_focused_after: var(--sapField_SuccessColor);--_ui5-v2-7-0_step_input_input_error_border_color_focused_after: var(--sapField_InvalidColor);--_ui5-v2-7-0_step_input_disabled_button_background: none;--_ui5-v2-7-0_step_input_border_color_hover: none;--_ui5-v2-7-0_step_input_border_hover: none;--_ui5-v2-7-0_input_input_background_color: transparent;--_ui5-v2-7-0_load_more_padding: 0;--_ui5-v2-7-0_load_more_border: 1px top solid transparent;--_ui5-v2-7-0_load_more_border_radius: none;--_ui5-v2-7-0_load_more_outline_width: var(--sapContent_FocusWidth);--_ui5-v2-7-0_load_more_border-bottom: var(--sapList_BorderWidth) solid var(--sapList_BorderColor);--_ui5-v2-7-0_calendar_height: 24.5rem;--_ui5-v2-7-0_calendar_width: 20rem;--_ui5-v2-7-0_calendar_padding: 1rem;--_ui5-v2-7-0_calendar_left_right_padding: .5rem;--_ui5-v2-7-0_calendar_top_bottom_padding: 1rem;--_ui5-v2-7-0_calendar_header_height: 3rem;--_ui5-v2-7-0_calendar_header_arrow_button_width: 2.5rem;--_ui5-v2-7-0_calendar_header_padding: .25rem 0;--_ui5-v2-7-0_checkbox_root_side_padding: .6875rem;--_ui5-v2-7-0_checkbox_icon_size: 1rem;--_ui5-v2-7-0_checkbox_partially_icon_size: .75rem;--_ui5-v2-7-0_custom_list_item_rb_min_width: 2.75rem;--_ui5-v2-7-0_day_picker_item_width: 2.25rem;--_ui5-v2-7-0_day_picker_item_height: 2.875rem;--_ui5-v2-7-0_day_picker_empty_height: 3rem;--_ui5-v2-7-0_day_picker_item_justify_content: space-between;--_ui5-v2-7-0_dp_two_calendar_item_now_text_padding_top: .375rem;--_ui5-v2-7-0_daypicker_item_now_selected_two_calendar_focus_special_day_top: 2rem;--_ui5-v2-7-0_daypicker_item_now_selected_two_calendar_focus_special_day_right: 1.4375rem;--_ui5-v2-7-0_dp_two_calendar_item_primary_text_height: 1.8125rem;--_ui5-v2-7-0_dp_two_calendar_item_secondary_text_height: 1rem;--_ui5-v2-7-0_dp_two_calendar_item_text_padding_top: .4375rem;--_ui5-v2-7-0_daypicker_item_now_selected_two_calendar_focus_secondary_text_padding_block: 0 .5rem;--_ui5-v2-7-0-calendar-legend-item-root-focus-offset: -.125rem;--_ui5-v2-7-0-calendar-legend-item-box-margin: .25rem;--_ui5-v2-7-0-calendar-legend-item-box-inner-margin: .5rem;--_ui5-v2-7-0_color_picker_slider_progress_container_height: 1.625rem;--_ui5-v2-7-0_color_picker_slider_container_margin_top: -.5rem;--_ui5-v2-7-0_color_picker_slider_handle_height: 2rem;--_ui5-v2-7-0_color_picker_slider_handle_width: 1.0625rem;--_ui5-v2-7-0_color_picker_slider_handle_after_height: 1.75rem;--_ui5-v2-7-0_color_picker_slider_handle_focus_height: 2.125rem;--_ui5-v2-7-0_color_picker_colors_wrapper_height: 2.25rem;--_ui5-v2-7-0_color_picker_sliders_height: 3rem;--_ui5-v2-7-0_color_picker_main_color_margin_bottom: 1rem;--_ui5-v2-7-0_color_picker_slider_spacing: .9375rem;--_ui5-v2-7-0_color_channel_toggle_button_width: 1.625rem;--_ui5-v2-7-0_color_channel_toggle_button_margin-top: -.75rem;--_ui5-v2-7-0_color_channel_hex_input_width: 4.8125rem;--_ui5-v2-7-0-color_channel_margin_top: .25rem;--_ui5-v2-7-0_color-palette-swatch-container-padding: .3125rem .6875rem;--_ui5-v2-7-0_datetime_picker_width: 40.0625rem;--_ui5-v2-7-0_datetime_picker_height: 25rem;--_ui5-v2-7-0_datetime_timeview_width: 17rem;--_ui5-v2-7-0_datetime_timeview_phonemode_width: 19.5rem;--_ui5-v2-7-0_datetime_timeview_padding: 1rem;--_ui5-v2-7-0_datetime_timeview_phonemode_clocks_width: 24.5rem;--_ui5-v2-7-0_datetime_dateview_phonemode_margin_bottom: 0;--_ui5-v2-7-0_dialog_content_min_height: 2.75rem;--_ui5-v2-7-0_dialog_footer_height: 2.75rem;--_ui5-v2-7-0_input_inner_padding: 0 .625rem;--_ui5-v2-7-0_input_inner_padding_with_icon: 0 .25rem 0 .625rem;--_ui5-v2-7-0_input_inner_space_to_tokenizer: .125rem;--_ui5-v2-7-0_input_inner_space_to_n_more_text: .1875rem;--_ui5-v2-7-0_list_no_data_height: 3rem;--_ui5-v2-7-0_list_item_cb_margin_right: 0;--_ui5-v2-7-0_list_item_title_size: var(--sapFontLargeSize);--_ui5-v2-7-0_list_no_data_font_size: var(--sapFontLargeSize);--_ui5-v2-7-0_list_item_img_size: 3rem;--_ui5-v2-7-0_list_item_img_top_margin: .5rem;--_ui5-v2-7-0_list_item_img_bottom_margin: .5rem;--_ui5-v2-7-0_list_item_img_hn_margin: .75rem;--_ui5-v2-7-0_list_item_dropdown_base_height: 2.5rem;--_ui5-v2-7-0_list_item_base_height: var(--sapElement_LineHeight);--_ui5-v2-7-0_list_item_base_padding: 0 1rem;--_ui5-v2-7-0_list_item_icon_size: 1.125rem;--_ui5-v2-7-0_list_item_icon_padding-inline-end: .5rem;--_ui5-v2-7-0_list_item_selection_btn_margin_top: calc(-1 * var(--_ui5-v2-7-0_checkbox_wrapper_padding));--_ui5-v2-7-0_list_item_content_vertical_offset: calc((var(--_ui5-v2-7-0_list_item_base_height) - var(--_ui5-v2-7-0_list_item_title_size)) / 2);--_ui5-v2-7-0_group_header_list_item_height: 2.75rem;--_ui5-v2-7-0_list_busy_row_height: 3rem;--_ui5-v2-7-0_month_picker_item_height: 3rem;--_ui5-v2-7-0_list_buttons_left_space: .125rem;--_ui5-v2-7-0_form_item_min_height: 2.813rem;--_ui5-v2-7-0_form_item_padding: .65rem;--_ui5-v2-7-0-form-group-heading-height: 2.75rem;--_ui5-v2-7-0_popup_default_header_height: 2.75rem;--_ui5-v2-7-0_year_picker_item_height: 3rem;--_ui5-v2-7-0_tokenizer_padding: .25rem;--_ui5-v2-7-0_token_height: 1.625rem;--_ui5-v2-7-0_token_icon_size: .75rem;--_ui5-v2-7-0_token_icon_padding: .25rem .5rem;--_ui5-v2-7-0_token_wrapper_right_padding: .3125rem;--_ui5-v2-7-0_token_wrapper_left_padding: 0;--_ui5-v2-7-0_tl_bubble_padding: 1rem;--_ui5-v2-7-0_tl_indicator_before_bottom: -1.625rem;--_ui5-v2-7-0_tl_padding: 1rem 1rem 1rem .5rem;--_ui5-v2-7-0_tl_li_margin_bottom: 1.625rem;--_ui5-v2-7-0_tc_item_text: 3rem;--_ui5-v2-7-0_tc_item_height: 4.75rem;--_ui5-v2-7-0_tc_item_text_only_height: 2.75rem;--_ui5-v2-7-0_tc_item_text_only_with_additional_text_height: 3.75rem;--_ui5-v2-7-0_tc_item_text_line_height: 1.325rem;--_ui5-v2-7-0_tc_item_icon_circle_size: 2.75rem;--_ui5-v2-7-0_tc_item_icon_size: 1.25rem;--_ui5-v2-7-0_tc_item_add_text_margin_top: .375rem;--_ui5-v2-7-0_textarea_margin: .25rem 0;--_ui5-v2-7-0_radio_button_height: 2.75rem;--_ui5-v2-7-0_radio_button_label_side_padding: .875rem;--_ui5-v2-7-0_radio_button_inner_size: 2.75rem;--_ui5-v2-7-0_radio_button_svg_size: 1.375rem;--_ui5-v2-7-0-responsive_popover_header_height: 2.75rem;--ui5-v2-7-0_side_navigation_item_height: 2.75rem;--_ui5-v2-7-0-tree-indent-step: 1.5rem;--_ui5-v2-7-0-tree-toggle-box-width: 2.75rem;--_ui5-v2-7-0-tree-toggle-box-height: 2.25rem;--_ui5-v2-7-0-tree-toggle-icon-size: 1.0625rem;--_ui5-v2-7-0_timeline_tli_indicator_before_bottom: -1.5rem;--_ui5-v2-7-0_timeline_tli_indicator_before_right: -1.625rem;--_ui5-v2-7-0_timeline_tli_indicator_before_without_icon_bottom: -1.875rem;--_ui5-v2-7-0_timeline_tli_indicator_before_without_icon_right: -1.9375rem;--_ui5-v2-7-0_timeline_tli_indicator_after_top: calc(-100% - 1rem) ;--_ui5-v2-7-0_timeline_tli_indicator_after_height: calc(100% + 1rem) ;--_ui5-v2-7-0_timeline_tli_indicator_before_height: 100%;--_ui5-v2-7-0_timeline_tli_horizontal_indicator_after_width: calc(100% + .25rem) ;--_ui5-v2-7-0_timeline_tli_horizontal_indicator_after_left: 1.9375rem;--_ui5-v2-7-0_timeline_tli_horizontal_without_icon_indicator_before_width: calc(100% + .5rem) ;--_ui5-v2-7-0_timeline_tli_horizontal_indicator_before_width: calc(100% + .5rem) ;--_ui5-v2-7-0_timeline_tli_icon_horizontal_indicator_after_width: calc(100% + .25rem) ;--_ui5-v2-7-0_timeline_tli_without_icon_horizontal_indicator_before_width: calc(100% + .375rem) ;--_ui5-v2-7-0_timeline_tli_horizontal_indicator_short_after_width: 100%;--_ui5-v2-7-0_timeline_tli_last_child_vertical_indicator_before_height: calc(100% - 1.5rem) ;--_ui5-v2-7-0-toolbar-separator-height: 2rem;--_ui5-v2-7-0-toolbar-height: 2.75rem;--_ui5-v2-7-0_toolbar_overflow_padding: .25rem .5rem;--_ui5-v2-7-0_table_cell_padding: .25rem .5rem;--_ui5-v2-7-0_dynamic_page_title_actions_separator_height: var(--_ui5-v2-7-0-toolbar-separator-height);--_ui5-v2-7-0_split_button_middle_separator_top: .625rem;--_ui5-v2-7-0_split_button_middle_separator_height: 1rem;--_ui5-v2-7-0-calendar-legend-item-root-focus-border-radius: .25rem;--_ui5-v2-7-0_color-palette-item-height: 1.75rem;--_ui5-v2-7-0_color-palette-item-hover-height: 2.25rem;--_ui5-v2-7-0_color-palette-item-margin: calc(((var(--_ui5-v2-7-0_color-palette-item-hover-height) - var(--_ui5-v2-7-0_color-palette-item-height)) / 2) + .0625rem);--_ui5-v2-7-0_color-palette-row-width: 12rem;--_ui5-v2-7-0_textarea_padding_top: .5rem;--_ui5-v2-7-0_textarea_padding_bottom: .4375rem;--_ui5-v2-7-0_dp_two_calendar_item_secondary_text_padding_block: 0 .5rem;--_ui5-v2-7-0_dp_two_calendar_item_secondary_text_padding: 0 .5rem;--_ui5-v2-7-0_daypicker_two_calendar_item_selected_focus_margin_bottom: 0;--_ui5-v2-7-0_daypicker_two_calendar_item_selected_focus_padding_right: .5rem}[data-ui5-compact-size],.ui5-content-density-compact,.sapUiSizeCompact{--_ui5-v2-7-0_input_min_width: 2rem;--_ui5-v2-7-0_input_icon_width: 2rem;--_ui5-v2-7-0_input_information_icon_padding: .3125rem .5rem .1875rem .5rem;--_ui5-v2-7-0_input_information_focused_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-7-0_input_error_warning_icon_padding: .3125rem .5rem .1875rem .5rem;--_ui5-v2-7-0_input_error_warning_focused_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-7-0_input_custom_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-7-0_input_error_warning_custom_icon_padding: .3125rem .5rem .1875rem .5rem;--_ui5-v2-7-0_input_error_warning_custom_focused_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-7-0_input_information_custom_icon_padding: .3125rem .5rem .1875rem .5rem;--_ui5-v2-7-0_input_information_custom_focused_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-7-0_input_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-7-0_panel_header_button_wrapper_padding: .1875rem .25rem;--_ui5-v2-7-0_rating_indicator_item_height: 1em;--_ui5-v2-7-0_rating_indicator_item_width: 1em;--_ui5-v2-7-0_rating_indicator_readonly_item_height: .75em;--_ui5-v2-7-0_rating_indicator_readonly_item_width: .75em;--_ui5-v2-7-0_rating_indicator_component_spacing: .5rem 0px;--_ui5-v2-7-0_radio_button_min_width: 2rem;--_ui5-v2-7-0_radio_button_outer_ring_padding_with_label: 0 .5rem;--_ui5-v2-7-0_radio_button_outer_ring_padding: 0 .5rem;--_ui5-v2-7-0_radio_button_focus_dist: .1875rem;--_ui5-v2-7-0_switch_height: 2rem;--_ui5-v2-7-0_switch_width: 3rem;--_ui5-v2-7-0_switch_min_width: none;--_ui5-v2-7-0_switch_with_label_width: 3.75rem;--_ui5-v2-7-0_switch_root_outline_top: .25rem;--_ui5-v2-7-0_switch_root_outline_bottom: .25rem;--_ui5-v2-7-0_switch_transform: translateX(100%) translateX(-1.375rem);--_ui5-v2-7-0_switch_transform_with_label: translateX(100%) translateX(-1.875rem);--_ui5-v2-7-0_switch_rtl_transform: translateX(1.375rem) translateX(-100%);--_ui5-v2-7-0_switch_rtl_transform_with_label: translateX(1.875rem) translateX(-100%);--_ui5-v2-7-0_switch_track_width: 2rem;--_ui5-v2-7-0_switch_track_height: 1.25rem;--_ui5-v2-7-0_switch_track_with_label_width: 2.75rem;--_ui5-v2-7-0_switch_track_with_label_height: 1.25rem;--_ui5-v2-7-0_switch_handle_width: 1.25rem;--_ui5-v2-7-0_switch_handle_height: 1rem;--_ui5-v2-7-0_switch_handle_with_label_width: 1.75rem;--_ui5-v2-7-0_switch_handle_with_label_height: 1rem;--_ui5-v2-7-0_switch_text_font_size: var(--sapFontSize);--_ui5-v2-7-0_switch_text_width: 1rem;--_ui5-v2-7-0_switch_text_active_left: .1875rem;--_ui5-v2-7-0_textarea_padding_right_and_left_readonly: .4375rem;--_ui5-v2-7-0_textarea_padding_top_readonly: .125rem;--_ui5-v2-7-0_textarea_exceeded_text_height: .375rem;--_ui5-v2-7-0_textarea_min_height: 1.625rem;--_ui5-v2-7-0_textarea_padding_bottom_readonly: .0625rem;--_ui5-v2-7-0_textarea_padding_top_error_warning: .1875rem;--_ui5-v2-7-0_textarea_padding_bottom_error_warning: .125rem;--_ui5-v2-7-0_textarea_padding_top_information: .1875rem;--_ui5-v2-7-0_textarea_padding_bottom_information: .125rem;--_ui5-v2-7-0_textarea_padding_right_and_left: .5rem;--_ui5-v2-7-0_textarea_padding_right_and_left_error_warning: .5rem;--_ui5-v2-7-0_textarea_padding_right_and_left_information: .5rem;--_ui5-v2-7-0_token_selected_focused_offset_bottom: -.25rem;--_ui5-v2-7-0_tokenizer_gap: .375em .25rem;--_ui5-v2-7-0_tokenizer-popover_offset: .1875rem;--_ui5-v2-7-0_slider_handle_icon_size: .875rem;--_ui5-v2-7-0_slider_padding: 1rem 1.0625rem;--_ui5-v2-7-0_range_slider_progress_focus_width: calc(100% + var(--_ui5-v2-7-0_slider_handle_width) + 10px);--_ui5-v2-7-0_range_slider_progress_focus_height: calc(var(--_ui5-v2-7-0_slider_handle_height) + 10px);--_ui5-v2-7-0_range_slider_progress_focus_top: -.8125rem;--_ui5-v2-7-0_slider_tooltip_bottom: 1.75rem;--_ui5-v2-7-0_slider_handle_focused_tooltip_distance: calc(var(--_ui5-v2-7-0_slider_tooltip_bottom) - var(--_ui5-v2-7-0_slider_handle_focus_width));--_ui5-v2-7-0_range_slider_progress_focus_left: calc(-1 * (var(--_ui5-v2-7-0_slider_handle_width) / 2) - 5px);--_ui5-v2-7-0_bar_base_height: 2.5rem;--_ui5-v2-7-0_bar_subheader_height: 2.25rem;--_ui5-v2-7-0_button_base_height: var(--sapElement_Compact_Height);--_ui5-v2-7-0_button_base_padding: .4375rem;--_ui5-v2-7-0_button_base_min_width: 2rem;--_ui5-v2-7-0_button_icon_font_size: 1rem;--_ui5-v2-7-0-button-badge-diameter: .625rem;--_ui5-v2-7-0_calendar_height: 18rem;--_ui5-v2-7-0_calendar_width: 17.75rem;--_ui5-v2-7-0_calendar_left_right_padding: .25rem;--_ui5-v2-7-0_calendar_top_bottom_padding: .5rem;--_ui5-v2-7-0_calendar_header_height: 2rem;--_ui5-v2-7-0_calendar_header_arrow_button_width: 2rem;--_ui5-v2-7-0_calendar_header_padding: 0;--_ui5-v2-7-0-calendar-legend-root-padding: .5rem;--_ui5-v2-7-0-calendar-legend-root-width: 16.75rem;--_ui5-v2-7-0-calendar-legend-item-root-focus-margin: -.125rem;--_ui5-v2-7-0_checkbox_root_side_padding: var(--_ui5-v2-7-0_checkbox_wrapped_focus_padding);--_ui5-v2-7-0_checkbox_width_height: var(--_ui5-v2-7-0_checkbox_compact_width_height);--_ui5-v2-7-0_checkbox_wrapper_padding: var(--_ui5-v2-7-0_checkbox_compact_wrapper_padding);--_ui5-v2-7-0_checkbox_inner_width_height: var(--_ui5-v2-7-0_checkbox_compact_inner_size);--_ui5-v2-7-0_checkbox_icon_size: .75rem;--_ui5-v2-7-0_checkbox_partially_icon_size: .5rem;--_ui5-v2-7-0_color_picker_slider_progress_container_height: 1.125rem;--_ui5-v2-7-0_color_picker_slider_container_margin_top: -.375rem;--_ui5-v2-7-0_color_picker_slider_handle_height: 1.5rem;--_ui5-v2-7-0_color_picker_slider_handle_width: .9375rem;--_ui5-v2-7-0_color_picker_slider_handle_after_height: 1.25rem;--_ui5-v2-7-0_color_picker_slider_handle_focus_height: 1.625rem;--_ui5-v2-7-0_color_picker_colors_wrapper_height: 1.5rem;--_ui5-v2-7-0_color_picker_sliders_height: 2.25rem;--_ui5-v2-7-0_color_picker_main_color_margin_bottom: .75rem;--_ui5-v2-7-0_color_picker_slider_spacing: .8125rem;--_ui5-v2-7-0_color_channel_toggle_button_width: 1.375rem;--_ui5-v2-7-0_color_channel_toggle_button_margin-top: -.9375rem;--_ui5-v2-7-0_color_channel_hex_input_width: 4.625rem;--_ui5-v2-7-0-color_channel_margin_top: 0rem;--_ui5-v2-7-0_custom_list_item_rb_min_width: 2rem;--_ui5-v2-7-0_daypicker_weeknumbers_container_padding_top: 2rem;--_ui5-v2-7-0_day_picker_item_width: 2rem;--_ui5-v2-7-0_day_picker_item_height: 2rem;--_ui5-v2-7-0_day_picker_empty_height: 2.125rem;--_ui5-v2-7-0_day_picker_item_justify_content: flex-end;--_ui5-v2-7-0_dp_two_calendar_item_now_text_padding_top: .5rem;--_ui5-v2-7-0_dp_two_calendar_item_primary_text_height: 1rem;--_ui5-v2-7-0_dp_two_calendar_item_secondary_text_height: .75rem;--_ui5-v2-7-0_dp_two_calendar_item_text_padding_top: .5rem;--_ui5-v2-7-0_daypicker_special_day_top: 1.625rem;--_ui5-v2-7-0_daypicker_twocalendar_item_special_day_top: 1.25rem;--_ui5-v2-7-0_daypicker_twocalendar_item_special_day_right: 1.25rem;--_ui5-v2-7-0_daypicker_two_calendar_item_margin_bottom: 0;--_ui5-v2-7-0_daypicker_item_now_selected_two_calendar_focus_special_day_top: 1.125rem;--_ui5-v2-7-0_daypicker_item_now_selected_two_calendar_focus_special_day_right: 1.125rem;--_ui5-v2-7-0_daypicker_item_now_selected_two_calendar_focus_secondary_text_padding_block: 0 1rem;--_ui5-v2-7-0_datetime_picker_height: 20.5rem;--_ui5-v2-7-0_datetime_picker_width: 35.5rem;--_ui5-v2-7-0_datetime_timeview_width: 17rem;--_ui5-v2-7-0_datetime_timeview_phonemode_width: 18.5rem;--_ui5-v2-7-0_datetime_timeview_padding: .5rem;--_ui5-v2-7-0_datetime_timeview_phonemode_clocks_width: 21.125rem;--_ui5-v2-7-0_datetime_dateview_phonemode_margin_bottom: 3.125rem;--_ui5-v2-7-0_dialog_content_min_height: 2.5rem;--_ui5-v2-7-0_dialog_footer_height: 2.5rem;--_ui5-v2-7-0_form_item_min_height: 2rem;--_ui5-v2-7-0_form_item_padding: .25rem;--_ui5-v2-7-0-form-group-heading-height: 2rem;--_ui5-v2-7-0_input_height: var(--sapElement_Compact_Height);--_ui5-v2-7-0_input_inner_padding: 0 .5rem;--_ui5-v2-7-0_input_inner_padding_with_icon: 0 .2rem 0 .5rem;--_ui5-v2-7-0_input_inner_space_to_tokenizer: .125rem;--_ui5-v2-7-0_input_inner_space_to_n_more_text: .125rem;--_ui5-v2-7-0_input_icon_min_width: var(--_ui5-v2-7-0_input_compact_min_width);--_ui5-v2-7-0_menu_item_padding: 0 .75rem 0 .5rem;--_ui5-v2-7-0_menu_item_submenu_icon_right: .75rem;--_ui5-v2-7-0_popup_default_header_height: 2.5rem;--_ui5-v2-7-0_textarea_margin: .1875rem 0;--_ui5-v2-7-0_list_no_data_height: 2rem;--_ui5-v2-7-0_list_item_cb_margin_right: .5rem;--_ui5-v2-7-0_list_item_title_size: var(--sapFontSize);--_ui5-v2-7-0_list_item_img_top_margin: .55rem;--_ui5-v2-7-0_list_no_data_font_size: var(--sapFontSize);--_ui5-v2-7-0_list_item_dropdown_base_height: 2rem;--_ui5-v2-7-0_list_item_base_height: 2rem;--_ui5-v2-7-0_list_item_base_padding: 0 1rem;--_ui5-v2-7-0_list_item_icon_size: 1rem;--_ui5-v2-7-0_list_item_selection_btn_margin_top: calc(-1 * var(--_ui5-v2-7-0_checkbox_wrapper_padding));--_ui5-v2-7-0_list_item_content_vertical_offset: calc((var(--_ui5-v2-7-0_list_item_base_height) - var(--_ui5-v2-7-0_list_item_title_size)) / 2);--_ui5-v2-7-0_list_busy_row_height: 2rem;--_ui5-v2-7-0_list_buttons_left_space: .125rem;--_ui5-v2-7-0_month_picker_item_height: 2rem;--_ui5-v2-7-0_year_picker_item_height: 2rem;--_ui5-v2-7-0_panel_header_height: 2rem;--_ui5-v2-7-0_panel_button_root_height: 2rem;--_ui5-v2-7-0_panel_button_root_width: 2.5rem;--_ui5-v2-7-0_token_height: 1.25rem;--_ui5-v2-7-0_token_right_margin: .25rem;--_ui5-v2-7-0_token_left_padding: .25rem;--_ui5-v2-7-0_token_readonly_padding: .125rem .25rem;--_ui5-v2-7-0_token_focus_offset: -.125rem;--_ui5-v2-7-0_token_icon_size: .75rem;--_ui5-v2-7-0_token_icon_padding: .375rem .375rem;--_ui5-v2-7-0_token_wrapper_right_padding: .25rem;--_ui5-v2-7-0_token_wrapper_left_padding: 0;--_ui5-v2-7-0_token_outline_offset: -.125rem;--_ui5-v2-7-0_tl_bubble_padding: .5rem;--_ui5-v2-7-0_tl_indicator_before_bottom: -.5rem;--_ui5-v2-7-0_tl_padding: .5rem;--_ui5-v2-7-0_tl_li_margin_bottom: .5rem;--_ui5-v2-7-0_tc_item_text: 2rem;--_ui5-v2-7-0_tc_item_text_line_height: 1.325rem;--_ui5-v2-7-0_tc_item_add_text_margin_top: .3125rem;--_ui5-v2-7-0_tc_item_height: 4rem;--_ui5-v2-7-0_tc_header_height: var(--_ui5-v2-7-0_tc_item_height);--_ui5-v2-7-0_tc_item_icon_circle_size: 2rem;--_ui5-v2-7-0_tc_item_icon_size: 1rem;--_ui5-v2-7-0_radio_button_height: 2rem;--_ui5-v2-7-0_radio_button_label_side_padding: .5rem;--_ui5-v2-7-0_radio_button_inner_size: 2rem;--_ui5-v2-7-0_radio_button_svg_size: 1rem;--_ui5-v2-7-0-responsive_popover_header_height: 2.5rem;--_ui5-v2-7-0_slider_handle_height: 1.25rem;--_ui5-v2-7-0_slider_handle_width: 1.5rem;--_ui5-v2-7-0_slider_tooltip_padding: .25rem;--_ui5-v2-7-0_slider_progress_outline_offset: -.625rem;--_ui5-v2-7-0_slider_outer_height: 1.3125rem;--_ui5-v2-7-0_step_input_min_width: 6rem;--_ui5-v2-7-0_step_input_padding: 2rem;--_ui5-v2-7-0-tree-indent-step: .5rem;--_ui5-v2-7-0-tree-toggle-box-width: 2rem;--_ui5-v2-7-0-tree-toggle-box-height: 1.5rem;--_ui5-v2-7-0-tree-toggle-icon-size: .8125rem;--_ui5-v2-7-0_timeline_tli_indicator_before_bottom: -.75rem;--_ui5-v2-7-0_timeline_tli_indicator_before_right: -.5rem;--_ui5-v2-7-0_timeline_tli_indicator_before_without_icon_bottom: -1rem;--_ui5-v2-7-0_timeline_tli_indicator_before_without_icon_right: -.8125rem;--_ui5-v2-7-0_timeline_tli_indicator_before_height: calc(100% - 1.25rem) ;--_ui5-v2-7-0_timeline_tli_horizontal_without_icon_indicator_before_width: var(--_ui5-v2-7-0_timeline_tli_indicator_after_height);--_ui5-v2-7-0_timeline_tli_horizontal_indicator_after_width: var(--_ui5-v2-7-0_timeline_tli_indicator_after_height);--_ui5-v2-7-0_timeline_tli_horizontal_indicator_before_width: var(--_ui5-v2-7-0_timeline_tli_indicator_after_height);--_ui5-v2-7-0_timeline_tli_icon_horizontal_indicator_after_width: var(--_ui5-v2-7-0_timeline_tli_indicator_after_height);--_ui5-v2-7-0_timeline_tli_indicator_after_top: calc(-100% + .9375rem) ;--_ui5-v2-7-0_timeline_tli_indicator_after_height: calc(100% - .75rem) ;--_ui5-v2-7-0_timeline_tli_horizontal_indicator_after_left: 1.8625rem;--_ui5-v2-7-0_timeline_tli_horizontal_indicator_short_after_width: calc(100% - 1rem) ;--_ui5-v2-7-0_timeline_tli_without_icon_horizontal_indicator_before_width: calc(100% - .625rem) ;--_ui5-v2-7-0_timeline_tli_last_child_vertical_indicator_before_height: calc(100% - 2.5rem) ;--_ui5-v2-7-0_timeline_tlgi_compact_icon_before_height: calc(100% + 1.5rem) ;--_ui5-v2-7-0_timeline_tlgi_horizontal_line_placeholder_before_width: var(--_ui5-v2-7-0_timeline_tlgi_compact_icon_before_height);--_ui5-v2-7-0_timeline_tlgi_horizontal_compact_root_margin_left: .5rem;--_ui5-v2-7-0_timeline_tlgi_compact_root_gap: .5rem;--_ui5-v2-7-0_timeline_tlgi_root_horizontal_height: 19.375rem;--_ui5-v2-7-0_vsd_header_container: 2.5rem;--_ui5-v2-7-0_vsd_sub_header_container_height: 2rem;--_ui5-v2-7-0_vsd_header_height: 4rem;--_ui5-v2-7-0_vsd_expand_content_height: 25.4375rem;--_ui5-v2-7-0-toolbar-separator-height: 1.5rem;--_ui5-v2-7-0-toolbar-height: 2rem;--_ui5-v2-7-0_toolbar_overflow_padding: .1875rem .375rem;--_ui5-v2-7-0_dynamic_page_title_actions_separator_height: var(--_ui5-v2-7-0-toolbar-separator-height);--_ui5-v2-7-0_textarea_padding_top: .1875rem;--_ui5-v2-7-0_textarea_padding_bottom: .125rem;--_ui5-v2-7-0_checkbox_focus_position: .25rem;--_ui5-v2-7-0_split_button_middle_separator_top: .3125rem;--_ui5-v2-7-0_split_button_middle_separator_height: 1rem;--_ui5-v2-7-0_slider_handle_top: -.5rem;--_ui5-v2-7-0_slider_tooltip_height: 1.375rem;--_ui5-v2-7-0_checkbox_wrapped_focus_inset_block: .125rem;--_ui5-v2-7-0_color-palette-item-height: 1.25rem;--_ui5-v2-7-0_color-palette-item-focus-height: 1rem;--_ui5-v2-7-0_color-palette-item-container-sides-padding: .1875rem;--_ui5-v2-7-0_color-palette-item-container-rows-padding: .8125rem;--_ui5-v2-7-0_color-palette-item-hover-height: 1.625rem;--_ui5-v2-7-0_color-palette-item-margin: calc(((var(--_ui5-v2-7-0_color-palette-item-hover-height) - var(--_ui5-v2-7-0_color-palette-item-height)) / 2) + .0625rem);--_ui5-v2-7-0_color-palette-row-width: 8.75rem;--_ui5-v2-7-0_color-palette-swatch-container-padding: .1875rem .5rem;--_ui5-v2-7-0_color-palette-item-hover-margin: .0625rem;--_ui5-v2-7-0_color-palette-row-height: 7.5rem;--_ui5-v2-7-0_color-palette-button-height: 2rem;--_ui5-v2-7-0_color-palette-item-before-focus-inset: -.25rem;--_ui5-v2-7-0_daypicker_selected_item_now_special_day_top: 1.5625rem;--_ui5-v2-7-0_daypicker_specialday_focused_top: 1.3125rem;--_ui5-v2-7-0_daypicker_selected_item_now_special_day_border_bottom_radius_alternate: .5rem;--_ui5-v2-7-0_daypicker_specialday_focused_border_bottom: .25rem;--_ui5-v2-7-0_daypicker_item_now_specialday_top: 1.4375rem;--_ui5-v2-7-0_dp_two_calendar_item_secondary_text_padding_block: 0 .375rem;--_ui5-v2-7-0_dp_two_calendar_item_secondary_text_padding: 0 .375rem;--_ui5-v2-7-0_daypicker_two_calendar_item_selected_focus_margin_bottom: -.25rem;--_ui5-v2-7-0_daypicker_two_calendar_item_selected_focus_padding_right: .4375rem}:root,[dir=ltr]{--_ui5-v2-7-0_rotation_90deg: rotate(90deg);--_ui5-v2-7-0_rotation_minus_90deg: rotate(-90deg);--_ui5-v2-7-0_icon_transform_scale: none;--_ui5-v2-7-0_panel_toggle_btn_rotation: var(--_ui5-v2-7-0_rotation_90deg);--_ui5-v2-7-0_li_notification_group_toggle_btn_rotation: var(--_ui5-v2-7-0_rotation_90deg);--_ui5-v2-7-0_timeline_scroll_container_offset: .5rem;--_ui5-v2-7-0_popover_upward_arrow_margin: .1875rem 0 0 .1875rem;--_ui5-v2-7-0_popover_right_arrow_margin: .1875rem 0 0 -.375rem;--_ui5-v2-7-0_popover_downward_arrow_margin: -.375rem 0 0 .125rem;--_ui5-v2-7-0_popover_left_arrow_margin: .125rem 0 0 .25rem;--_ui5-v2-7-0_dialog_resize_cursor: se-resize;--_ui5-v2-7-0_progress_indicator_bar_border_radius: .5rem 0 0 .5rem;--_ui5-v2-7-0_progress_indicator_remaining_bar_border_radius: 0 .5rem .5rem 0;--_ui5-v2-7-0_menu_submenu_margin_offset: -.25rem 0;--_ui5-v2-7-0_menu_submenu_placement_type_left_margin_offset: .25rem 0;--_ui5-v2-7-0-menu_item_icon_float: right;--_ui5-v2-7-0-shellbar-notification-btn-count-offset: -.125rem}[dir=rtl],[dir=rtl] :host{--_ui5-v2-7-0_icon_transform_scale: scale(-1, 1);--_ui5-v2-7-0_panel_toggle_btn_rotation: var(--_ui5-v2-7-0_rotation_minus_90deg);--_ui5-v2-7-0_li_notification_group_toggle_btn_rotation: var(--_ui5-v2-7-0_rotation_minus_90deg);--_ui5-v2-7-0_timeline_scroll_container_offset: -.5rem;--_ui5-v2-7-0_popover_upward_arrow_margin: .1875rem .125rem 0 0;--_ui5-v2-7-0_popover_right_arrow_margin: .1875rem .25rem 0 0;--_ui5-v2-7-0_popover_downward_arrow_margin: -.4375rem .125rem 0 0;--_ui5-v2-7-0_popover_left_arrow_margin: .1875rem -.375rem 0 0;--_ui5-v2-7-0_dialog_resize_cursor:sw-resize;--_ui5-v2-7-0_progress_indicator_bar_border_radius: 0 .5rem .5rem 0;--_ui5-v2-7-0_progress_indicator_remaining_bar_border_radius: .5rem 0 0 .5rem;--_ui5-v2-7-0_menu_submenu_margin_offset: 0 -.25rem;--_ui5-v2-7-0_menu_submenu_placement_type_left_margin_offset: 0 .25rem;--_ui5-v2-7-0-menu_item_icon_float: left;--_ui5-v2-7-0_segmented_btn_item_border_left: .0625rem;--_ui5-v2-7-0_segmented_btn_item_border_right: 0px;--_ui5-v2-7-0-shellbar-notification-btn-count-offset: auto}[dir=rtl]{--_ui5-v2-7-0_segmented_btn_item_border_left: .0625rem;--_ui5-v2-7-0_segmented_btn_item_border_right: .0625rem;--_ui5-v2-7-0_progress_indicator_bar_border_radius: .5rem;--_ui5-v2-7-0_progress_indicator_remaining_bar_border_radius: .25rem}
`;

  p$7("@ui5/webcomponents-theming", "sap_horizon", async () => defaultThemeBase);
  p$7("@ui5/webcomponents", "sap_horizon", async () => defaultTheme);
  var checkboxCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host{-webkit-tap-highlight-color:rgba(0,0,0,0)}:host(:not([hidden])){display:inline-block}:host{overflow:hidden;max-width:100%;outline:none;border-radius:var(--_ui5-v2-7-0_checkbox_border_radius);transition:var(--_ui5-v2-7-0_checkbox_transition);cursor:pointer;user-select:none;-moz-user-select:none;-webkit-user-select:none;-ms-user-select:none}:host([disabled]){cursor:default}:host([disabled]) .ui5-checkbox-root{opacity:var(--_ui5-v2-7-0_checkbox_disabled_opacity)}:host([disabled]) .ui5-checkbox-inner{border-color:var(--_ui5-v2-7-0_checkbox_inner_disabled_border_color)}:host([disabled]) .ui5-checkbox-label{color:var(--_ui5-v2-7-0_checkbox_disabled_label_color)}:host([readonly]:not([value-state="Critical"]):not([value-state="Negative"])) .ui5-checkbox-inner{background:var(--sapField_ReadOnly_Background);border:var(--_ui5-v2-7-0_checkbox_inner_readonly_border);color:var(--sapField_TextColor)}:host(:not([wrapping-type="None"])[text]) .ui5-checkbox-root{min-height:auto;box-sizing:border-box;align-items:flex-start;padding-top:var(--_ui5-v2-7-0_checkbox_root_side_padding);padding-bottom:var(--_ui5-v2-7-0_checkbox_root_side_padding)}:host(:not([wrapping-type="None"])[text]) .ui5-checkbox-root .ui5-checkbox-label{overflow-wrap:break-word;align-self:center}:host([desktop][text]:not([wrapping-type="None"])) .ui5-checkbox-root:focus:before,.ui5-checkbox-root[text]:focus-visible:before{inset-block:var(--_ui5-v2-7-0_checkbox_wrapped_focus_inset_block)}:host([value-state="Negative"]) .ui5-checkbox-inner,:host([value-state="Negative"]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--sapField_InvalidBackground);border:var(--_ui5-v2-7-0_checkbox_inner_error_border);color:var(--sapField_InvalidColor)}:host([value-state="Negative"]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--_ui5-v2-7-0_checkbox_inner_error_background_hover)}:host([value-state="Critical"]) .ui5-checkbox-inner,:host([value-state="Critical"]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--sapField_WarningBackground);border:var(--_ui5-v2-7-0_checkbox_inner_warning_border);color:var(--_ui5-v2-7-0_checkbox_inner_warning_color)}:host([value-state="Critical"]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--_ui5-v2-7-0_checkbox_inner_warning_background_hover)}:host([value-state="Information"]) .ui5-checkbox-inner,:host([value-state="Information"]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--sapField_InformationBackground);border:var(--_ui5-v2-7-0_checkbox_inner_information_border);color:var(--_ui5-v2-7-0_checkbox_inner_information_color)}:host([value-state="Information"]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--_ui5-v2-7-0_checkbox_inner_information_background_hover)}:host([value-state="Positive"]) .ui5-checkbox-inner,:host([value-state="Positive"]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--sapField_SuccessBackground);border:var(--_ui5-v2-7-0_checkbox_inner_success_border);color:var(--sapField_SuccessColor)}:host([value-state="Positive"]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--_ui5-v2-7-0_checkbox_inner_success_background_hover)}:host([value-state="Critical"]) .ui5-checkbox-icon,:host([value-state="Critical"][indeterminate]) .ui5-checkbox-inner:after{color:var(--_ui5-v2-7-0_checkbox_checkmark_warning_color)}.ui5-checkbox-root{position:relative;display:inline-flex;align-items:center;width:100%;min-height:var(--_ui5-v2-7-0_checkbox_width_height);min-width:var(--_ui5-v2-7-0_checkbox_width_height);padding:0 var(--_ui5-v2-7-0_checkbox_wrapper_padding);outline:none;transition:var(--_ui5-v2-7-0_checkbox_transition);border:var(--_ui5-v2-7-0_checkbox_default_focus_border);border-radius:var(--_ui5-v2-7-0_checkbox_border_radius);box-sizing:border-box}:host([desktop]) .ui5-checkbox-root:focus:before,.ui5-checkbox-root:focus-visible:before{display:var(--_ui5-v2-7-0_checkbox_focus_outline_display);content:"";position:absolute;inset-inline:var(--_ui5-v2-7-0_checkbox_focus_position);inset-block:var(--_ui5-v2-7-0_checkbox_focus_position);border:var(--_ui5-v2-7-0_checkbox_focus_outline);border-radius:var(--_ui5-v2-7-0_checkbox_focus_border_radius)}:host([text]) .ui5-checkbox-root{padding-inline-end:var(--_ui5-v2-7-0_checkbox_right_focus_distance)}:host([text]) .ui5-checkbox-root:focus:before,:host([text]) .ui5-checkbox-root:focus-visible:before{inset-inline-end:0}:host(:hover:not([disabled])){background:var(--_ui5-v2-7-0_checkbox_outer_hover_background)}.ui5-checkbox--hoverable .ui5-checkbox-label:hover{color:var(--_ui5-v2-7-0_checkbox_label_color)}:host(:not([active]):not([checked]):not([value-state])) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner,:host(:not([active]):not([checked])[value-state="None"]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--_ui5-v2-7-0_checkbox_hover_background);border-color:var(--_ui5-v2-7-0_checkbox_inner_hover_border_color)}:host(:not([active])[checked]:not([value-state])) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner,:host(:not([active])[checked][value-state="None"]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--_ui5-v2-7-0_checkbox_hover_background);border-color:var(--_ui5-v2-7-0_checkbox_inner_hover_checked_border_color)}:host([checked]:not([value-state])) .ui5-checkbox-inner,:host([checked][value-state="None"]) .ui5-checkbox-inner{border-color:var(--_ui5-v2-7-0_checkbox_inner_selected_border_color)}:host([active]:not([checked]):not([value-state]):not([disabled])) .ui5-checkbox-inner,:host([active]:not([checked])[value-state="None"]:not([disabled])) .ui5-checkbox-inner{border-color:var(--_ui5-v2-7-0_checkbox_inner_active_border_color);background-color:var(--_ui5-v2-7-0_checkbox_active_background)}:host([active][checked]:not([value-state]):not([disabled])) .ui5-checkbox-inner,:host([active][checked][value-state="None"]:not([disabled])) .ui5-checkbox-inner{border-color:var(--_ui5-v2-7-0_checkbox_inner_selected_border_color);background-color:var(--_ui5-v2-7-0_checkbox_active_background)}.ui5-checkbox-inner{min-width:var(--_ui5-v2-7-0_checkbox_inner_width_height);max-width:var(--_ui5-v2-7-0_checkbox_inner_width_height);height:var(--_ui5-v2-7-0_checkbox_inner_width_height);max-height:var(--_ui5-v2-7-0_checkbox_inner_width_height);border:var(--_ui5-v2-7-0_checkbox_inner_border);border-radius:var(--_ui5-v2-7-0_checkbox_inner_border_radius);background:var(--_ui5-v2-7-0_checkbox_inner_background);color:var(--_ui5-v2-7-0_checkbox_checkmark_color);box-sizing:border-box;position:relative;cursor:inherit}:host([indeterminate][checked]) .ui5-checkbox-inner:after{content:"";background-color:currentColor;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:var(--_ui5-v2-7-0_checkbox_partially_icon_size);height:var(--_ui5-v2-7-0_checkbox_partially_icon_size)}:host input{-webkit-appearance:none;visibility:hidden;width:0;left:0;position:absolute;font-size:inherit}.ui5-checkbox-root .ui5-checkbox-label{margin-inline-start:var(--_ui5-v2-7-0_checkbox_label_offset);cursor:inherit;text-overflow:ellipsis;overflow:hidden;pointer-events:none;color:var(--_ui5-v2-7-0_checkbox_label_color)}.ui5-checkbox-icon{width:var(--_ui5-v2-7-0_checkbox_icon_size);height:var(--_ui5-v2-7-0_checkbox_icon_size);color:currentColor;cursor:inherit;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)}:host([display-only]){cursor:default}:host([display-only]) .ui5-checkbox-display-only-icon-inner [ui5-icon]{color:var(--sapTextColor)}:host([display-only]) .ui5-checkbox-display-only-icon-inner{min-width:var(--_ui5-v2-7-0_checkbox_inner_width_height);max-width:var(--_ui5-v2-7-0_checkbox_inner_width_height);height:var(--_ui5-v2-7-0_checkbox_inner_width_height);max-height:var(--_ui5-v2-7-0_checkbox_inner_width_height);display:flex;align-items:center;justify-content:center}
`;

  function o(t){let r="";for(const n in t)t[n]&&(r&&(r+=" "),r+=n);return r}

  function l(t,e,a){const n=t.getMetadata().getEvents();Object.keys(e).forEach(s=>{if(s.startsWith("on")){const o=s.slice(2),i=p$4(o);i in n&&s!=="onClick"&&(e[`onui5-${i}`]=e[s],delete e[s]);}});}function isUI5ElementClass(t){return typeof t=="function"&&"getMetadata"in t}function preprocess(t,e,a){let n;return isUI5ElementClass(t)?(n=t.getMetadata().getTag(),l(t,e)):n=t,typeof e.class=="object"&&(e.class=o(e.class)),n}

  // eslint-disable-next-line import/extensions
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const old = l$1.vnode;
  l$1.vnode = vnode => {
      const props = vnode.props;
      if (props !== null && typeof props === "object") {
          if (props.class && typeof props.class === "object") ;
      }
      old && old(vnode);
  };
  function jsx(type, props, key) {
      const tag = preprocess(type, props);
      return u(tag, props, key);
  }
  function jsxs(type, props, key) {
      const tag = preprocess(type, props);
      return u(tag, props, key);
  }

  function LabelTemplate() {
      return (jsxs("label", { class: "ui5-label-root", onClick: this._onclick, children: [jsx("span", { class: "ui5-label-text-wrapper", children: jsx("slot", {}) }), jsx("span", { "aria-hidden": "true", class: "ui5-label-required-colon", "data-ui5-colon": this._colonSymbol })] }));
  }

  p$7("@ui5/webcomponents-theming", "sap_horizon", async () => defaultThemeBase);
  p$7("@ui5/webcomponents", "sap_horizon", async () => defaultTheme);
  var labelCss = `:host(:not([hidden])){display:inline-flex}:host{max-width:100%;color:var(--sapContent_LabelColor);font-family:"72override",var(--sapFontFamily);font-size:var(--sapFontSize);font-weight:400;cursor:text}.ui5-label-root{width:100%;cursor:inherit}:host{white-space:normal}:host([wrapping-type="None"]){white-space:nowrap}:host([wrapping-type="None"]) .ui5-label-root{display:inline-flex}:host([wrapping-type="None"]) .ui5-label-text-wrapper{text-overflow:ellipsis;overflow:hidden;display:inline-block;vertical-align:top;flex:0 1 auto;min-width:0}:host([show-colon]) .ui5-label-required-colon:before{content:attr(data-ui5-colon)}:host([required]) .ui5-label-required-colon:after{content:"*";color:var(--sapField_RequiredColor);font-size:var(--sapFontLargeSize);font-weight:700;position:relative;font-style:normal;vertical-align:middle;line-height:0}.ui5-label-text-wrapper{padding-inline-end:.075rem}:host([required][show-colon]) .ui5-label-required-colon:after{margin-inline-start:.125rem}:host([show-colon]) .ui5-label-required-colon{margin-inline-start:-.05rem;white-space:pre}
`;

  var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Label_1;
  /**
   * @class
   *
   * ### Overview
   *
   * The `ui5-label` is a component used to represent a label for elements like input, textarea, select.
   * The `for` property of the `ui5-label` must be the same as the id attribute of the related input element.
   * Screen readers read out the label, when the user focuses the labelled control.
   *
   * The `ui5-label` appearance can be influenced by properties,
   * such as `required` and `wrappingType`.
   * The appearance of the Label can be configured in a limited way by using the design property.
   * For a broader choice of designs, you can use custom styles.
   *
   * ### ES6 Module Import
   *
   * `import "@ui5/webcomponents/dist/Label";`
   * @constructor
   * @extends UI5Element
   * @public
   * @slot {Array<Node>} default - Defines the text of the component.
   *
   * **Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
   */
  let Label = Label_1 = class Label extends S$3 {
      constructor() {
          super(...arguments);
          /**
           * Defines whether colon is added to the component text.
           *
           * **Note:** Usually used in forms.
           * @default false
           * @public
           */
          this.showColon = false;
          /**
           * Defines whether an asterisk character is added to the component text.
           *
           * **Note:** Usually indicates that user input (bound with the `for` property) is required.
           * In that case the `required` property of
           * the corresponding input should also be set.
           * @default false
           * @public
           */
          this.required = false;
          /**
           * Defines how the text of a component will be displayed when there is not enough space.
           *
           * **Note:** for option "Normal" the text will wrap and the words will not be broken based on hyphenation.
           * @default "Normal"
           * @public
           */
          this.wrappingType = "Normal";
      }
      _onclick() {
          if (!this.for) {
              return;
          }
          const elementToFocus = this.getRootNode().querySelector(`[id="${this.for}"]`);
          if (elementToFocus) {
              elementToFocus.focus();
          }
      }
      get _colonSymbol() {
          return Label_1.i18nBundle.getText(LABEL_COLON);
      }
  };
  __decorate$2([
      s$c()
  ], Label.prototype, "for", undefined);
  __decorate$2([
      s$c({ type: Boolean })
  ], Label.prototype, "showColon", undefined);
  __decorate$2([
      s$c({ type: Boolean })
  ], Label.prototype, "required", undefined);
  __decorate$2([
      s$c()
  ], Label.prototype, "wrappingType", undefined);
  __decorate$2([
      i("@ui5/webcomponents")
  ], Label, "i18nBundle", undefined);
  Label = Label_1 = __decorate$2([
      m$5({
          tag: "ui5-label",
          renderer: d,
          template: LabelTemplate,
          styles: labelCss,
          languageAware: true,
      })
  ], Label);
  Label.define();
  var Label$1 = Label;

  function IconTemplate() {
      return (jsxs("svg", { class: "ui5-icon-root", part: "root", tabindex: this._tabIndex, dir: this._dir, viewBox: this.viewBox, role: this.effectiveAccessibleRole, focusable: "false", preserveAspectRatio: "xMidYMid meet", "aria-label": this.effectiveAccessibleName, "aria-hidden": this.effectiveAriaHidden, xmlns: "http://www.w3.org/2000/svg", onKeyDown: this._onkeydown, onKeyUp: this._onkeyup, children: [this.hasIconTooltip &&
                  jsxs("title", { id: `${this._id}-tooltip`, children: [" ", this.effectiveAccessibleName, " "] }), jsxs("g", { role: "presentation", children: [this.customSvg &&
                          jsx("g", { dangerouslySetInnerHTML: { __html: this.customSvg.strings?.join("") ?? "" } }), this.pathData.map(path => (jsx("path", { d: path })))] })] }));
  }

  /**
   * Different Icon modes.
   * @public
   * @since 2.0.0
   */
  var IconMode;
  (function (IconMode) {
      /**
       * Image mode (by default).
       * Configures the component to internally render role="img".
       * @public
       */
      IconMode["Image"] = "Image";
      /**
       * Decorative mode.
       * Configures the component to internally render role="presentation" and aria-hidden="true",
       * making it purely decorative without semantic content or interactivity.
       * @public
       */
      IconMode["Decorative"] = "Decorative";
      /**
       * Interactive mode.
       * Configures the component to internally render role="button".
       * This mode also supports focus and press handling to enhance interactivity.
       * @public
      */
      IconMode["Interactive"] = "Interactive";
  })(IconMode || (IconMode = {}));
  var IconMode$1 = IconMode;

  p$7("@ui5/webcomponents-theming", "sap_horizon", async () => defaultThemeBase);
  p$7("@ui5/webcomponents", "sap_horizon", async () => defaultTheme);
  var iconCss = `:host{-webkit-tap-highlight-color:rgba(0,0,0,0)}:host([hidden]){display:none}:host([invalid]){display:none}:host(:not([hidden]).ui5_hovered){opacity:.7}:host{display:inline-block;width:1rem;height:1rem;color:var(--sapContent_IconColor);fill:currentColor;outline:none}:host([design="Contrast"]){color:var(--sapContent_ContrastIconColor)}:host([design="Critical"]){color:var(--sapCriticalElementColor)}:host([design="Information"]){color:var(--sapInformativeElementColor)}:host([design="Negative"]){color:var(--sapNegativeElementColor)}:host([design="Neutral"]){color:var(--sapNeutralElementColor)}:host([design="NonInteractive"]){color:var(--sapContent_NonInteractiveIconColor)}:host([design="Positive"]){color:var(--sapPositiveElementColor)}:host([mode="Interactive"][desktop]) .ui5-icon-root:focus,:host([mode="Interactive"]) .ui5-icon-root:focus-visible{outline:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);border-radius:var(--ui5-v2-7-0-icon-focus-border-radius)}.ui5-icon-root{display:flex;height:100%;width:100%;outline:none;vertical-align:top}:host([mode="Interactive"]){cursor:pointer}.ui5-icon-root:not([dir=ltr]){transform:var(--_ui5-v2-7-0_icon_transform_scale);transform-origin:center}
`;

  var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  const ICON_NOT_FOUND = "ICON_NOT_FOUND";
  /**
   * @class
   * ### Overview
   *
   * The `ui5-icon` component represents an SVG icon.
   * There are two main scenarios how the `ui5-icon` component is used:
   * as a purely decorative element,
   * or as an interactive element that can be focused and clicked.
   *
   * ### Usage
   *
   * 1. **Get familiar with the icons collections.**
   *
   * Before displaying an icon, you need to explore the icons collections to find and import the desired icon.
   *
   * Currently there are 3 icons collection, available as 3 npm packages:
   *
   * - [@ui5/webcomponents-icons](https://www.npmjs.com/package/@ui5/webcomponents-icons) represents the "SAP-icons" collection and includes the following
   * [icons](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/SAP-icons).
   * - [@ui5/webcomponents-icons-tnt](https://www.npmjs.com/package/@ui5/webcomponents-icons-tnt) represents the "tnt" collection and includes the following
   * [icons](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/SAP-icons-TNT).
   * - [@ui5/webcomponents-icons-business-suite](https://www.npmjs.com/package/@ui5/webcomponents-icons-business-suite) represents the "business-suite" collection and includes the following
   * [icons](https://ui5.sap.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/BusinessSuiteInAppSymbols).
   *
   * 2. **After exploring the icons collections, add one or more of the packages as dependencies to your project.**
   *
   * `npm i @ui5/webcomponents-icons`
   * `npm i @ui5/webcomponents-icons-tnt`
   * `npm i @ui5/webcomponents-icons-business-suite`
   *
   * 3. **Then, import the desired icon**.
   *
   * `import "@ui5/\{package_name\}/dist/\{icon_name\}.js";`
   *
   * **For Example**:
   *
   * For the standard "SAP-icons" icon collection, import an icon from the `@ui5/webcomponents-icons` package:
   *
   * `import "@ui5/webcomponents-icons/dist/employee.js";`
   *
   * For the "tnt" (SAP Fiori Tools) icon collection, import an icon from the `@ui5/webcomponents-icons-tnt` package:
   *
   * `import "@ui5/webcomponents-icons-tnt/dist/antenna.js";`
   *
   * For the "business-suite" (SAP Business Suite) icon collection, import an icon from the `@ui5/webcomponents-icons-business-suite` package:
   *
   * `import "@ui5/webcomponents-icons-business-suite/dist/ab-testing.js";`
   *
   * 4. **Display the icon using the `ui5-icon` web component.**
   * Set the icon collection ("SAP-icons", "tnt" or "business-suite" - "SAP-icons" is the default icon collection and can be skipped)
   * and the icon name to the `name` property.
   *
   * `<ui5-icon name="employee"></ui5-icon>`
   * `<ui5-icon name="tnt/antenna"></ui5-icon>`
   * `<ui5-icon name="business-suite/ab-testing"></ui5-icon>`
   *
   * ### Keyboard Handling
   *
   * - [Space] / [Enter] or [Return] - Fires the `click` event if the `mode` property is set to `Interactive`.
   * - [Shift] - If [Space] / [Enter] or [Return] is pressed, pressing [Shift] releases the ui5-icon without triggering the click event.
   *
   * ### ES6 Module Import
   *
   * `import "@ui5/webcomponents/dist/Icon.js";`
   * @csspart root - Used to style the outermost wrapper of the `ui5-icon`.
   * @constructor
   * @extends UI5Element
   * @implements {IIcon}
   * @public
   */
  let Icon = class Icon extends S$3 {
      constructor() {
          super(...arguments);
          /**
           * Defines the component semantic design.
           * @default "Default"
           * @public
           * @since 1.9.2
           */
          this.design = "Default";
          /**
           * Defines whether the component should have a tooltip.
           *
           * **Note:** The tooltip text should be provided via the `accessible-name` property.
           * @default false
           * @public
           */
          this.showTooltip = false;
          /**
           * Defines the mode of the component.
           * @default "Image"
           * @public
           * @since 2.0.0
           */
          this.mode = "Image";
          /**
           * @private
           */
          this.pathData = [];
          /**
          * @private
          */
          this.invalid = false;
      }
      _onkeydown(e) {
          if (this.mode !== IconMode$1.Interactive) {
              return;
          }
          if (b$3(e)) {
              this.fireDecoratorEvent("click");
          }
          if (i$8(e)) {
              e.preventDefault(); // prevent scrolling
          }
      }
      _onkeyup(e) {
          if (this.mode === IconMode$1.Interactive && i$8(e)) {
              this.fireDecoratorEvent("click");
          }
      }
      /**
      * Enforce "ltr" direction, based on the icons collection metadata.
      */
      get _dir() {
          return this.ltr ? "ltr" : undefined;
      }
      get effectiveAriaHidden() {
          return this.mode === IconMode$1.Decorative ? "true" : undefined;
      }
      get _tabIndex() {
          return this.mode === IconMode$1.Interactive ? 0 : undefined;
      }
      get effectiveAccessibleRole() {
          switch (this.mode) {
              case IconMode$1.Interactive:
                  return "button";
              case IconMode$1.Decorative:
                  return "presentation";
              default:
                  return "img";
          }
      }
      onEnterDOM() {
          if (f$8()) {
              this.setAttribute("desktop", "");
          }
      }
      async onBeforeRendering() {
          const name = this.name;
          if (!name) {
              /* eslint-disable-next-line */
              return console.warn("Icon name property is required", this);
          }
          let iconData = u$4(name);
          if (!iconData) {
              iconData = await n$3(name);
          }
          if (!iconData) {
              this.invalid = true;
              /* eslint-disable-next-line */
              return console.warn(`Required icon is not registered. Invalid icon name: ${this.name}`);
          }
          if (iconData === ICON_NOT_FOUND) {
              this.invalid = true;
              /* eslint-disable-next-line */
              return console.warn(`Required icon is not registered. You can either import the icon as a module in order to use it e.g. "@ui5/webcomponents-icons/dist/${name.replace("sap-icon://", "")}.js", or setup a JSON build step and import "@ui5/webcomponents-icons/dist/AllIcons.js".`);
          }
          this.viewBox = iconData.viewBox || "0 0 512 512";
          if (iconData.customTemplate) {
              iconData.pathData = [];
              this.customSvg = n$7(iconData.customTemplate, this);
          }
          // in case a new valid name is set, show the icon
          this.invalid = false;
          this.pathData = Array.isArray(iconData.pathData) ? iconData.pathData : [iconData.pathData];
          this.accData = iconData.accData;
          this.ltr = iconData.ltr;
          this.packageName = iconData.packageName;
          if (this.accessibleName) {
              this.effectiveAccessibleName = this.accessibleName;
          }
          else if (this.accData) {
              const i18nBundle = await f$5(this.packageName);
              this.effectiveAccessibleName = i18nBundle.getText(this.accData) || undefined;
          }
          else {
              this.effectiveAccessibleName = undefined;
          }
      }
      get hasIconTooltip() {
          return this.showTooltip && this.effectiveAccessibleName;
      }
  };
  __decorate$1([
      s$c()
  ], Icon.prototype, "design", undefined);
  __decorate$1([
      s$c()
  ], Icon.prototype, "name", undefined);
  __decorate$1([
      s$c()
  ], Icon.prototype, "accessibleName", undefined);
  __decorate$1([
      s$c({ type: Boolean })
  ], Icon.prototype, "showTooltip", undefined);
  __decorate$1([
      s$c()
  ], Icon.prototype, "mode", undefined);
  __decorate$1([
      s$c({ type: Array })
  ], Icon.prototype, "pathData", undefined);
  __decorate$1([
      s$c({ type: Object, noAttribute: true })
  ], Icon.prototype, "accData", undefined);
  __decorate$1([
      s$c({ type: Boolean })
  ], Icon.prototype, "invalid", undefined);
  __decorate$1([
      s$c({ noAttribute: true })
  ], Icon.prototype, "effectiveAccessibleName", undefined);
  Icon = __decorate$1([
      m$5({
          tag: "ui5-icon",
          languageAware: true,
          themeAware: true,
          renderer: d,
          template: IconTemplate,
          styles: iconCss,
      })
      /**
       * Fired on mouseup, `SPACE` and `ENTER`.
       * - on mouse click, the icon fires native `click` event
       * - on `SPACE` and `ENTER`, the icon fires custom `click` event
       * @private
       * @since 1.0.0-rc.8
       */
      ,
      l$2("click", {
          bubbles: true,
      })
  ], Icon);
  Icon.define();
  var Icon$1 = Icon;

  const name$7 = "accept";
  const pathData$7 = "M456 94q5 5 5 11 0 4-2 8L237 439q-4 8-8.5 8.5t-5.5.5q-7 0-12-5L60 276q-5-5-5-10l.5-3.5L61 254l25-25q6-6 12-6t11 6l96 96q5 5 12 5l4.5-.5 8.5-8.5L405 72q4-7 8.5-7.5t5.5-.5q6 0 11 4z";
  const ltr$7 = true;
  const collection$7 = "SAP-icons-v4";
  const packageName$7 = "@ui5/webcomponents-icons";

  f$3(name$7, { pathData: pathData$7, ltr: ltr$7, collection: collection$7, packageName: packageName$7 });

  const name$6 = "accept";
  const pathData$6 = "M187 416q-12 0-20-9L71 299q-7-7-7-17 0-11 7.5-18.5T90 256q12 0 19 9l77 87 217-247q8-9 19-9t18.5 7.5T448 122q0 10-6 16L206 407q-7 9-19 9z";
  const ltr$6 = true;
  const collection$6 = "SAP-icons-v5";
  const packageName$6 = "@ui5/webcomponents-icons";

  f$3(name$6, { pathData: pathData$6, ltr: ltr$6, collection: collection$6, packageName: packageName$6 });

  var accept = "accept";

  const name$5 = "complete";
  const pathData$5 = "M432 320h32v128q0 14-9.5 23t-22.5 9H48q-14 0-23-9t-9-23V64q0-13 9-22.5T48 32h128v32H48v384h384V320zm60-295q4 4 4 9 0 3-2 7L309 313q-3 6-7 6.5t-5 .5q-6 0-10-4L162 177q-4-5-4-9 0-5 4-9l21-21q5-5 10-5t9 5l80 80q4 4 9 4 1 0 5-.5t7-7.5L449 7q3-6 7-6.5t5-.5q5 0 9 4z";
  const ltr$5 = true;
  const collection$5 = "SAP-icons-v4";
  const packageName$5 = "@ui5/webcomponents-icons";

  f$3(name$5, { pathData: pathData$5, ltr: ltr$5, collection: collection$5, packageName: packageName$5 });

  const name$4 = "complete";
  const pathData$4 = "M438 224q11 0 18.5 7.5T464 250v140q0 38-26 64t-64 26H106q-38 0-64-26t-26-64V122q0-38 26-64t64-26h237q11 0 18 7.5t7 18.5-7 18-18 7H106q-16 0-27.5 11.5T67 122v268q0 16 11.5 27.5T106 429h268q16 0 27.5-11.5T413 390V250q0-11 7-18.5t18-7.5zm32-192q11 0 18.5 7.5T496 58t-7 17L257 312q-6 8-18 8-10 0-18-8l-70-71q-7-7-7-18t7.5-18 18.5-7 18 7l51 53L452 40q8-8 18-8z";
  const ltr$4 = true;
  const collection$4 = "SAP-icons-v5";
  const packageName$4 = "@ui5/webcomponents-icons";

  f$3(name$4, { pathData: pathData$4, ltr: ltr$4, collection: collection$4, packageName: packageName$4 });

  var complete = "complete";

  const name$3 = "border";
  const pathData$3 = "M448 32q13 0 22.5 9t9.5 23v384q0 14-9.5 23t-22.5 9H64q-14 0-23-9t-9-23V64q0-14 9-23t23-9h384zm0 32H64v384h384V64z";
  const ltr$3 = false;
  const collection$3 = "SAP-icons-v4";
  const packageName$3 = "@ui5/webcomponents-icons";

  f$3(name$3, { pathData: pathData$3, ltr: ltr$3, collection: collection$3, packageName: packageName$3 });

  const name$2 = "border";
  const pathData$2 = "M122 83q-17 0-28 11t-11 28v268q0 17 11 28t28 11h268q17 0 28-11t11-28V122q0-17-11-28t-28-11H122zm268 397H122q-38 0-64-26t-26-64V122q0-38 26-64t64-26h268q38 0 64 26t26 64v268q0 38-26 64t-64 26z";
  const ltr$2 = false;
  const collection$2 = "SAP-icons-v5";
  const packageName$2 = "@ui5/webcomponents-icons";

  f$3(name$2, { pathData: pathData$2, ltr: ltr$2, collection: collection$2, packageName: packageName$2 });

  var border = "border";

  const name$1 = "tri-state";
  const pathData$1 = "M448 32q13 0 22.5 9.5T480 64v384q0 14-9.5 23t-22.5 9H64q-14 0-23-9t-9-23V64q0-13 9-22.5T64 32h384zm0 32H64v384h384V64zM160 345V169q0-8 8-8h176q8 0 8 8v176q0 8-8 8H168q-8 0-8-8z";
  const ltr$1 = false;
  const collection$1 = "SAP-icons-v4";
  const packageName$1 = "@ui5/webcomponents-icons";

  f$3(name$1, { pathData: pathData$1, ltr: ltr$1, collection: collection$1, packageName: packageName$1 });

  const name = "tri-state";
  const pathData = "M390 32q38 0 64 26t26 64v268q0 38-26 64t-64 26H122q-38 0-64-26t-26-64V122q0-38 26-64t64-26h268zm-38 128v192H160V160h192zm77-38q0-17-11-28t-28-11H122q-17 0-28 11t-11 28v268q0 17 11 28t28 11h268q17 0 28-11t11-28V122z";
  const ltr = false;
  const collection = "SAP-icons-v5";
  const packageName = "@ui5/webcomponents-icons";

  f$3(name, { pathData, ltr, collection, packageName });

  var triState = "tri-state";

  function CheckBoxTemplate() {
      return (jsxs("div", { class: {
              "ui5-checkbox-root": true,
              "ui5-checkbox--hoverable": !this.disabled && !this.readonly && f$8(),
          }, role: "checkbox", part: "root", "aria-checked": this.effectiveAriaChecked, "aria-readonly": this.ariaReadonly, "aria-disabled": this.effectiveAriaDisabled, "aria-label": this.ariaLabelText, "aria-labelledby": this.ariaLabelledBy, "aria-describedby": this.ariaDescribedBy, "aria-required": this.required, tabindex: this.effectiveTabIndex, onMouseDown: this._onmousedown, onMouseUp: this._onmouseup, onKeyDown: this._onkeydown, onKeyUp: this._onkeyup, onClick: this._onclick, onFocusOut: this._onfocusout, children: [this.isDisplayOnly ?
                  jsx("div", { class: "ui5-checkbox-display-only-icon-inner", children: jsx(Icon$1, { "aria-hidden": "true", name: displayOnlyIcon.call(this), class: "ui5-checkbox-display-only-icon", part: "icon" }) })
                  :
                      jsx("div", { id: `${this._id}-CbBg`, class: "ui5-checkbox-inner", children: this.isCompletelyChecked &&
                              jsx(Icon$1, { "aria-hidden": "true", name: accept, class: "ui5-checkbox-icon", part: "icon" }) }), jsx("input", { id: `${this._id}-CB`, type: "checkbox", checked: this.checked, readonly: this.readonly, disabled: this.disabled, tabindex: -1, "aria-hidden": "true", "data-sap-no-tab-ref": true }), this.text &&
                  jsx(Label$1, { id: `${this._id}-label`, part: "label", class: "ui5-checkbox-label", wrappingType: this.wrappingType, children: this.text }), this.hasValueState &&
                  jsx("span", { id: `${this._id}-descr`, class: "ui5-hidden-text", children: this.valueStateText })] }));
  }
  function displayOnlyIcon() {
      if (this.isCompletelyChecked) {
          return complete;
      }
      if (this.checked && this.indeterminate) {
          return triState;
      }
      return border;
  }

  var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var CheckBox_1;
  let isGlobalHandlerAttached = false;
  let activeCb;
  /**
   * @class
   *
   * ### Overview
   *
   * Allows the user to set a binary value, such as true/false or yes/no for an item.
   *
   * The `ui5-checkbox` component consists of a box and a label that describes its purpose.
   * If it's checked, an indicator is displayed inside the box.
   * To check/uncheck the `ui5-checkbox`, the user has to click or tap the square
   * box or its label.
   *
   * The `ui5-checkbox` component only has 2 states - checked and unchecked.
   * Clicking or tapping toggles the `ui5-checkbox` between checked and unchecked state.
   *
   * ### Usage
   *
   * You can define the checkbox text with via the `text` property. If the text exceeds the available width, it is truncated by default.
   * In case you prefer text to truncate, set the `wrappingType` property to "None".
   * The touchable area for toggling the `ui5-checkbox` ends where the text ends.
   *
   * You can disable the `ui5-checkbox` by setting the `disabled` property to
   * `true`,
   * or use the `ui5-checkbox` in read-only mode by setting the `readonly`
   * property to `true`.
   *
   * ### Keyboard Handling
   *
   * The user can use the following keyboard shortcuts to toggle the checked state of the `ui5-checkbox`.
   *
   * - [Space],[Enter] - Toggles between different states: checked, not checked.
   *
   * ### ES6 Module Import
   *
   * `import "@ui5/webcomponents/dist/CheckBox.js";`
   * @constructor
   * @extends UI5Element
   * @public
   * @csspart root - Used to style the outermost wrapper of the `ui5-checkbox`
   * @csspart label - Used to style the label of the `ui5-checkbox`
   * @csspart icon - Used to style the icon of the `ui5-checkbox`
   */
  let CheckBox = CheckBox_1 = class CheckBox extends S$3 {
      get formValidityMessage() {
          return CheckBox_1.i18nBundle.getText(FORM_CHECKABLE_REQUIRED);
      }
      get formValidity() {
          return { valueMissing: this.required && !this.checked };
      }
      async formElementAnchor() {
          return this.getFocusDomRefAsync();
      }
      get formFormattedValue() {
          return this.checked ? "on" : null;
      }
      constructor() {
          super();
          /**
           * Defines whether the component is disabled.
           *
           * **Note:** A disabled component is completely noninteractive.
           * @default false
           * @public
           */
          this.disabled = false;
          /**
           * Defines whether the component is read-only.
           *
           * **Note:** A read-only component is not editable,
           * but still provides visual feedback upon user interaction.
           * @default false
           * @public
           */
          this.readonly = false;
          /**
           * Determines whether the `ui5-checkbox` is in display only state.
           *
           * When set to `true`, the `ui5-checkbox` is not interactive, not editable, not focusable
           * and not in the tab chain. This setting is used for forms in review mode.
           *
           * **Note:** When the property `disabled` is set to `true` this property has no effect.
           * @since 1.22.0
           * @public
           * @default false
           */
          this.displayOnly = false;
          /**
           * Defines whether the component is required.
           * @default false
           * @public
           * @since 1.3.0
           */
          this.required = false;
          /**
          * Defines whether the component is displayed as partially checked.
          *
          * **Note:** The indeterminate state can be set only programmatically and can’t be achieved by user
          * interaction and the resulting visual state depends on the values of the `indeterminate`
          * and `checked` properties:
          *
          * -  If the component is checked and indeterminate, it will be displayed as partially checked
          * -  If the component is checked and it is not indeterminate, it will be displayed as checked
          * -  If the component is not checked, it will be displayed as not checked regardless value of the indeterminate attribute
          * @default false
          * @public
          * @since 1.0.0-rc.15
          */
          this.indeterminate = false;
          /**
           * Defines if the component is checked.
           *
           * **Note:** The property can be changed with user interaction,
           * either by cliking/tapping on the component, or by
           * pressing the Enter or Space key.
           * @default false
           * @formEvents change
           * @formProperty
           * @public
           */
          this.checked = false;
          /**
           * Defines the value state of the component.
           * @default "None"
           * @public
           */
          this.valueState = "None";
          /**
           * Defines whether the component text wraps when there is not enough space.
           *
           * **Note:** for option "Normal" the text will wrap and the words will not be broken based on hyphenation.
           * **Note:** for option "None" the text will be truncated with an ellipsis.
           * @default "Normal"
           * @public
           */
          this.wrappingType = "Normal";
          /**
           * Defines the active state (pressed or not) of the component.
           * @private
           */
          this.active = false;
          this._deactivate = () => {
              if (activeCb) {
                  activeCb.active = false;
              }
          };
          if (!isGlobalHandlerAttached) {
              document.addEventListener("mouseup", this._deactivate);
              isGlobalHandlerAttached = true;
          }
      }
      onEnterDOM() {
          if (f$8()) {
              this.setAttribute("desktop", "");
          }
      }
      _onclick() {
          this.toggle();
      }
      _onmousedown() {
          if (this.readonly || this.disabled) {
              return;
          }
          this.active = true;
          activeCb = this; // eslint-disable-line
      }
      _onmouseup() {
          this.active = false;
      }
      _onfocusout() {
          this.active = false;
      }
      _onkeydown(e) {
          if (i$8(e)) {
              e.preventDefault();
          }
          if (this.readonly || this.disabled) {
              return;
          }
          if (b$3(e)) {
              this.toggle();
          }
          this.active = true;
      }
      _onkeyup(e) {
          if (i$8(e)) {
              this.toggle();
          }
          this.active = false;
      }
      toggle() {
          if (this.canToggle()) {
              const lastState = {
                  checked: this.checked,
                  indeterminate: this.indeterminate,
              };
              if (this.indeterminate) {
                  this.indeterminate = false;
                  this.checked = true;
              }
              else {
                  this.checked = !this.checked;
              }
              const changePrevented = !this.fireDecoratorEvent("change");
              // Angular two way data binding
              const valueChangePrevented = !this.fireDecoratorEvent("value-changed");
              if (changePrevented || valueChangePrevented) {
                  this.checked = lastState.checked;
                  this.indeterminate = lastState.indeterminate;
              }
          }
          return this;
      }
      canToggle() {
          return !(this.disabled || this.readonly || this.displayOnly);
      }
      valueStateTextMappings() {
          return {
              "Negative": CheckBox_1.i18nBundle.getText(VALUE_STATE_ERROR),
              "Critical": CheckBox_1.i18nBundle.getText(VALUE_STATE_WARNING),
              "Positive": CheckBox_1.i18nBundle.getText(VALUE_STATE_SUCCESS),
          };
      }
      get ariaLabelText() {
          return A(this);
      }
      get classes() {
          return {
              main: {
                  "ui5-checkbox--hoverable": !this.disabled && !this.readonly && f$8(),
              },
          };
      }
      get ariaReadonly() {
          return this.readonly || this.displayOnly ? "true" : undefined;
      }
      get effectiveAriaDisabled() {
          return this.disabled ? "true" : undefined;
      }
      get effectiveAriaChecked() {
          return this.indeterminate && this.checked ? "mixed" : this.checked;
      }
      get ariaLabelledBy() {
          if (!this.ariaLabelText) {
              return this.text ? `${this._id}-label` : undefined;
          }
          return undefined;
      }
      get ariaDescribedBy() {
          return this.hasValueState ? `${this._id}-descr` : undefined;
      }
      get hasValueState() {
          return this.valueState !== o$1.None;
      }
      get valueStateText() {
          if (this.valueState !== o$1.None && this.valueState !== o$1.Information) {
              return this.valueStateTextMappings()[this.valueState];
          }
      }
      get effectiveTabIndex() {
          const tabindex = this.getAttribute("tabindex");
          if (this.tabbable) {
              return tabindex ? parseInt(tabindex) : 0;
          }
      }
      get tabbable() {
          return !this.disabled && !this.displayOnly;
      }
      get isCompletelyChecked() {
          return this.checked && !this.indeterminate;
      }
      get isDisplayOnly() {
          return this.displayOnly && !this.disabled;
      }
  };
  __decorate([
      s$c()
  ], CheckBox.prototype, "accessibleNameRef", undefined);
  __decorate([
      s$c()
  ], CheckBox.prototype, "accessibleName", undefined);
  __decorate([
      s$c({ type: Boolean })
  ], CheckBox.prototype, "disabled", undefined);
  __decorate([
      s$c({ type: Boolean })
  ], CheckBox.prototype, "readonly", undefined);
  __decorate([
      s$c({ type: Boolean })
  ], CheckBox.prototype, "displayOnly", undefined);
  __decorate([
      s$c({ type: Boolean })
  ], CheckBox.prototype, "required", undefined);
  __decorate([
      s$c({ type: Boolean })
  ], CheckBox.prototype, "indeterminate", undefined);
  __decorate([
      s$c({ type: Boolean })
  ], CheckBox.prototype, "checked", undefined);
  __decorate([
      s$c()
  ], CheckBox.prototype, "text", undefined);
  __decorate([
      s$c()
  ], CheckBox.prototype, "valueState", undefined);
  __decorate([
      s$c()
  ], CheckBox.prototype, "wrappingType", undefined);
  __decorate([
      s$c()
  ], CheckBox.prototype, "name", undefined);
  __decorate([
      s$c({ type: Boolean })
  ], CheckBox.prototype, "active", undefined);
  __decorate([
      i("@ui5/webcomponents")
  ], CheckBox, "i18nBundle", undefined);
  CheckBox = CheckBox_1 = __decorate([
      m$5({
          tag: "ui5-checkbox",
          languageAware: true,
          formAssociated: true,
          renderer: d,
          template: CheckBoxTemplate,
          styles: checkboxCss,
      })
      /**
       * Fired when the component checked state changes.
       * @public
       */
      ,
      l$2("change", {
          bubbles: true,
          cancelable: true,
      })
      /**
       * Fired to make Angular two way data binding work properly.
       * @private
       */
      ,
      l$2("value-changed", {
          bubbles: true,
          cancelable: true,
      })
  ], CheckBox);
  CheckBox.define();

  const WrapperClass = WebComponent.extend("@ui5/webcomponents.CheckBox", {
    metadata: {
    "namespace": "@ui5/webcomponents",
    "tag": "ui5-checkbox",
    "interfaces": [
      "sap.ui.core.IFormContent"
    ],
    "properties": {
      "accessibleName": {
        "type": "string",
        "mapping": "property"
      },
      "enabled": {
        "type": "boolean",
        "defaultValue": "true",
        "mapping": {
          "type": "property",
          "to": "disabled",
          "formatter": "_mapEnabled"
        }
      },
      "readonly": {
        "type": "boolean",
        "mapping": "property",
        "defaultValue": false
      },
      "displayOnly": {
        "type": "boolean",
        "mapping": "property",
        "defaultValue": false
      },
      "required": {
        "type": "boolean",
        "mapping": "property",
        "defaultValue": false
      },
      "indeterminate": {
        "type": "boolean",
        "mapping": "property",
        "defaultValue": false
      },
      "checked": {
        "type": "boolean",
        "mapping": "property",
        "defaultValue": false
      },
      "text": {
        "type": "string",
        "mapping": "property"
      },
      "valueState": {
        "type": "@ui5/webcomponents-base.ValueState",
        "mapping": "property",
        "defaultValue": "None"
      },
      "wrappingType": {
        "type": "@ui5/webcomponents.WrappingType",
        "mapping": "property",
        "defaultValue": "Normal"
      },
      "name": {
        "type": "string",
        "mapping": "property"
      },
      "width": {
        "type": "sap.ui.core.CSSSize",
        "mapping": "style"
      },
      "height": {
        "type": "sap.ui.core.CSSSize",
        "mapping": "style"
      }
    },
    "aggregations": {},
    "associations": {
      "ariaLabelledBy": {
        "type": "sap.ui.core.Control",
        "multiple": true,
        "mapping": {
          "type": "property",
          "to": "accessibleNameRef",
          "formatter": "_getAriaLabelledByForRendering"
        }
      }
    },
    "events": {
      "change": {}
    },
    "getters": [],
    "methods": [],
    "library": "@ui5/webcomponents.library",
    "designtime": "@ui5/webcomponents/designtime/CheckBox.designtime"
  },
    // TODO: Quick solution to fix a conversion between "number" and "core.CSSSize".
    //       WebC attribute is a number and is written back to the Control wrapper via core.WebComponent base class.
    //       The control property is defined as a "sap.ui.core.CSSSize".
  	setProperty: function(sPropName, v, bSupressInvalidate) {
      if (sPropName === "width" || sPropName === "height") {
        if (!isNaN(v)) {
          v += "px";
        }
      }
      return WebComponent.prototype.setProperty.apply(this, [sPropName, v, bSupressInvalidate]);
    }
  });

  EnabledPropagator.call(WrapperClass.prototype);

  return WrapperClass;

}));
