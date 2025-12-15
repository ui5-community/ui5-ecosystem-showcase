sap.ui.define((function () { 'use strict';

    var c$f={},e$g=c$f.hasOwnProperty,a$e=c$f.toString,o$h=e$g.toString,l$i=o$h.call(Object),i$k=function(r){var t,n;return !r||a$e.call(r)!=="[object Object]"?false:(t=Object.getPrototypeOf(r),t?(n=e$g.call(t,"constructor")&&t.constructor,typeof n=="function"&&o$h.call(n)===l$i):true)};

    var c$e=Object.create(null),u$e=function(p,m,A,d){var n,t,e,a,o,i,r=arguments[2]||{},f=3,l=arguments.length,s=arguments[0]||false,y=arguments[1]?void 0:c$e;for(typeof r!="object"&&typeof r!="function"&&(r={});f<l;f++)if((o=arguments[f])!=null)for(a in o)n=r[a],e=o[a],!(a==="__proto__"||r===e)&&(s&&e&&(i$k(e)||(t=Array.isArray(e)))?(t?(t=false,i=n&&Array.isArray(n)?n:[]):i=n&&i$k(n)?n:{},r[a]=u$e(s,arguments[1],i,e)):e!==y&&(r[a]=e));return r};

    const e$f=function(n,t){return u$e(true,false,...arguments)};

    const d$b=()=>new Promise(e=>{document.body?e():document.addEventListener("DOMContentLoaded",()=>{e();});});

    let i$j = class i{constructor(){this._eventRegistry=new Map;}attachEvent(t,r){const n=this._eventRegistry,e=n.get(t);if(!Array.isArray(e)){n.set(t,[r]);return}e.includes(r)||e.push(r);}detachEvent(t,r){const n=this._eventRegistry,e=n.get(t);if(!e)return;const s=e.indexOf(r);s!==-1&&e.splice(s,1),e.length===0&&n.delete(t);}fireEvent(t,r){const e=this._eventRegistry.get(t);return e?e.map(s=>s.call(this,r)):[]}fireEventAsync(t,r){return Promise.all(this.fireEvent(t,r))}isHandlerAttached(t,r){const e=this._eventRegistry.get(t);return e?e.includes(r):false}hasListeners(t){return !!this._eventRegistry.get(t)}};

    const o$g=(t,n=document.body,r)=>{let e=document.querySelector(t);return e||(e=r?r():document.createElement(t),n.insertBefore(e,n.firstChild))};

    const u$d=()=>{const t=document.createElement("meta");return t.setAttribute("name","ui5-shared-resources"),t.setAttribute("content",""),t},l$h=()=>typeof document>"u"?null:o$g('meta[name="ui5-shared-resources"]',document.head,u$d),m$d=(t,o)=>{const r=t.split(".");let e=l$h();if(!e)return o;for(let n=0;n<r.length;n++){const s=r[n],c=n===r.length-1;Object.prototype.hasOwnProperty.call(e,s)||(e[s]=c?o:{}),e=e[s];}return e};

    const g$b=m$d("Tags",new Map),d$a=new Set;let i$i=new Map,c$d;const m$c=-1,h$6=e=>{d$a.add(e),g$b.set(e,I$3());},w$7=e=>d$a.has(e),T$3=()=>[...d$a.values()],$$2=e=>{let n=g$b.get(e);n===void 0&&(n=m$c),i$i.has(n)||i$i.set(n,new Set),i$i.get(n).add(e),c$d||(c$d=setTimeout(()=>{y$9(),i$i=new Map,c$d=void 0;},1e3));},y$9=()=>{const e=$$1(),n=I$3(),l=e[n];let t="Multiple UI5 Web Components instances detected.";e.length>1&&(t=`${t}
Loading order (versions before 1.1.0 not listed): ${e.map(s=>`
${s.description}`).join("")}`),[...i$i.keys()].forEach(s=>{let o,r;s===m$c?(o=1,r={description:"Older unknown runtime"}):(o=b$7(n,s),r=e[s]);let a;o>0?a="an older":o<0?a="a newer":a="the same",t=`${t}

"${l.description}" failed to define ${i$i.get(s).size} tag(s) as they were defined by a runtime of ${a} version "${r.description}": ${[...i$i.get(s)].sort().join(", ")}.`,o>0?t=`${t}
WARNING! If your code uses features of the above web components, unavailable in ${r.description}, it might not work as expected!`:t=`${t}
Since the above web components were defined by the same or newer version runtime, they should be compatible with your code.`;}),t=`${t}

To prevent other runtimes from defining tags that you use, consider using scoping or have third-party libraries use scoping: https://github.com/UI5/webcomponents/blob/main/docs/2-advanced/06-scoping.md.`,console.warn(t);};

    const e$e={version:"2.17.0",major:2,minor:17,patch:0,suffix:"",isNext:false,buildTime:1765979913};

    let s$o,t$l={include:[/^ui5-/],exclude:[]};const o$f=new Map,c$c=()=>s$o,m$b=()=>t$l,i$h=e=>{if(!o$f.has(e)){const n=t$l.include.some(r=>e.match(r))&&!t$l.exclude.some(r=>e.match(r));o$f.set(e,n);}return o$f.get(e)},g$a=e=>{if(i$h(e))return c$c()};

    let i$g,s$n="";const u$c=new Map,r$i=m$d("Runtimes",[]),x$2=()=>{if(i$g===void 0){i$g=r$i.length;const e=e$e;r$i.push({...e,get scopingSuffix(){return c$c()},get registeredTags(){return T$3()},get scopingRules(){return m$b()},alias:s$n,description:`Runtime ${i$g} - ver ${e.version}${""}`});}},I$3=()=>i$g,b$7=(e,m)=>{const o=`${e},${m}`;if(u$c.has(o))return u$c.get(o);const t=r$i[e],n=r$i[m];if(!t||!n)throw new Error("Invalid runtime index supplied");if(t.isNext||n.isNext)return t.buildTime-n.buildTime;const c=t.major-n.major;if(c)return c;const a=t.minor-n.minor;if(a)return a;const f=t.patch-n.patch;if(f)return f;const l=new Intl.Collator(void 0,{numeric:true,sensitivity:"base"}).compare(t.suffix,n.suffix);return u$c.set(o,l),l},$$1=()=>r$i;

    const g$9=typeof document>"u",i$f=(e,t)=>t?`${e}|${t}`:e,l$g=e=>e===void 0?true:b$7(I$3(),parseInt(e))===1,c$b=(e,t,r="",s)=>{const d=I$3(),n=new CSSStyleSheet;n.replaceSync(e),n._ui5StyleId=i$f(t,r),s&&(n._ui5RuntimeIndex=d,n._ui5Theme=s),document.adoptedStyleSheets=[...document.adoptedStyleSheets,n];},y$8=(e,t,r="",s)=>{const d=I$3(),n=document.adoptedStyleSheets.find(o=>o._ui5StyleId===i$f(t,r));if(n)if(!s)n.replaceSync(e||"");else {const o=n._ui5RuntimeIndex;(n._ui5Theme!==s||l$g(o))&&(n.replaceSync(e||""),n._ui5RuntimeIndex=String(d),n._ui5Theme=s);}},S$4=(e,t="")=>g$9?true:!!document.adoptedStyleSheets.find(r=>r._ui5StyleId===i$f(e,t)),f$b=(e,t="")=>{document.adoptedStyleSheets=document.adoptedStyleSheets.filter(r=>r._ui5StyleId!==i$f(e,t));},R$2=(e,t,r="",s)=>{S$4(t,r)?y$8(e,t,r,s):c$b(e,t,r,s);},m$a=(e,t)=>e===void 0?t:t===void 0?e:`${e} ${t}`;

    const e$d=new Map,n$n=t=>e$d.get(t);

    var n$m = `@font-face{font-family:"72";font-style:normal;font-weight:400;src:url(https://cdn.jsdelivr.net/npm/@sap-theming/theming-base-content@11.29.3/content/Base/baseLib/baseTheme/fonts/72-Regular.woff2) format("woff2"),local("72");unicode-range:U+00,U+0D,U+20-7E,U+A0-FF,U+131,U+152-153,U+161,U+178,U+17D-17E,U+192,U+237,U+2C6,U+2DC,U+3BC,U+1E9E,U+2013-2014,U+2018-201A,U+201C-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,U+2044,U+20AC,U+2122}
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

    const _$2={themes:{default:"sap_horizon",all:["sap_fiori_3","sap_fiori_3_dark","sap_fiori_3_hcb","sap_fiori_3_hcw","sap_horizon","sap_horizon_dark","sap_horizon_hcb","sap_horizon_hcw"]},languages:{default:"en"},locales:{default:"en",all:["ar","ar_EG","ar_SA","bg","ca","cnr","cs","da","de","de_AT","de_CH","el","el_CY","en","en_AU","en_GB","en_HK","en_IE","en_IN","en_NZ","en_PG","en_SG","en_ZA","es","es_AR","es_BO","es_CL","es_CO","es_MX","es_PE","es_UY","es_VE","et","fa","fi","fr","fr_BE","fr_CA","fr_CH","fr_LU","he","hi","hr","hu","id","it","it_CH","ja","kk","ko","lt","lv","ms","mk","nb","nl","nl_BE","pl","pt","pt_PT","ro","ru","ru_UA","sk","sl","sr","sr_Latn","sv","th","tr","uk","vi","zh_CN","zh_HK","zh_SG","zh_TW"]}},e$c=_$2.themes.default,s$m=_$2.themes.all,a$d=_$2.languages.default,r$h=_$2.locales.default,l$f=_$2.locales.all;

    const o$e=typeof document>"u",n$l={search(){return o$e?"":window.location.search}},s$l=()=>o$e?"":window.location.href,u$b=()=>n$l.search();

    const s$k=e=>{const t=document.querySelector(`META[name="${e}"]`);return t&&t.getAttribute("content")},o$d=e=>{const t=s$k("sap-allowed-theme-origins")??s$k("sap-allowedThemeOrigins");return t?t.split(",").some(n=>n==="*"||e===n.trim()):false},a$c=(e,t)=>{const n=new URL(e).pathname;return new URL(n,t).toString()},g$8=e=>{let t;try{if(e.startsWith(".")||e.startsWith("/"))t=new URL(e,s$l()).toString();else {const n=new URL(e),r=n.origin;r&&o$d(r)?t=n.toString():t=a$c(n.toString(),s$l());}return t.endsWith("/")||(t=`${t}/`),`${t}UI5/`}catch{}};

    var u$a=(l=>(l.Full="full",l.Basic="basic",l.Minimal="minimal",l.None="none",l))(u$a||{});

    const e$b=new i$j,t$k="configurationReset",i$e=n=>{e$b.attachEvent(t$k,n);};

    let p$5=false,t$j={animationMode:u$a.Full,theme:e$c,themeRoot:void 0,rtl:void 0,language:void 0,timezone:void 0,calendarType:void 0,secondaryCalendarType:void 0,noConflict:false,formatSettings:{},fetchDefaultLanguage:false,defaultFontLoading:true,enableDefaultTooltips:true};const C$3=()=>(o$c(),t$j.animationMode),T$2=()=>(o$c(),t$j.theme),S$3=()=>{if(o$c(),t$j.themeRoot!==void 0){if(!g$8(t$j.themeRoot)){console.warn(`The ${t$j.themeRoot} is not valid. Check the allowed origins as suggested in the "setThemeRoot" description.`);return}return t$j.themeRoot}},L$2=()=>(o$c(),t$j.language),R$1=()=>(o$c(),t$j.fetchDefaultLanguage),F$2=()=>(o$c(),t$j.noConflict),U$2=()=>(o$c(),t$j.defaultFontLoading),b$6=()=>(o$c(),t$j.enableDefaultTooltips),i$d=new Map;i$d.set("true",true),i$d.set("false",false);const w$6=()=>{const n=document.querySelector("[data-ui5-config]")||document.querySelector("[data-id='sap-ui-config']");let e;if(n){try{e=JSON.parse(n.innerHTML);}catch{console.warn("Incorrect data-sap-ui-config format. Please use JSON");}e&&(t$j=e$f(t$j,e));}},z$1=()=>{const n=new URLSearchParams(u$b());n.forEach((e,r)=>{const a=r.split("sap-").length;a===0||a===r.split("sap-ui-").length||g$7(r,e,"sap");}),n.forEach((e,r)=>{r.startsWith("sap-ui")&&g$7(r,e,"sap-ui");});},E$3=n=>{const e=n.split("@")[1];return g$8(e)},P$4=(n,e)=>n==="theme"&&e.includes("@")?e.split("@")[0]:e,g$7=(n,e,r)=>{const a=e.toLowerCase(),s=n.split(`${r}-`)[1];i$d.has(e)&&(e=i$d.get(a)),s==="theme"?(t$j.theme=P$4(s,e),e&&e.includes("@")&&(t$j.themeRoot=E$3(e))):t$j[s]=e;},j$1=()=>{const n=n$n("OpenUI5Support");if(!n||!n.isOpenUI5Detected())return;const e=n.getConfigurationSettingsObject();t$j=e$f(t$j,e);},o$c=()=>{typeof document>"u"||p$5||(l$e(),p$5=true);},l$e=n=>{w$6(),z$1(),j$1();};

    let o$b;i$e(()=>{o$b=void 0;});const a$b=()=>(o$b===void 0&&(o$b=U$2()),o$b);

    const a$a=()=>{const t=n$n("OpenUI5Support");(!t||!t.isOpenUI5Detected())&&f$a();},f$a=()=>{const t=document.querySelector("head>style[data-ui5-font-face]");!a$b()||t||S$4("data-ui5-font-face")||c$b(n$m,"data-ui5-font-face");};

    var a$9 = ":root{--_ui5_content_density:cozy}.sapUiSizeCompact,.ui5-content-density-compact,[data-ui5-compact-size]{--_ui5_content_density:compact}";

    const e$a=()=>{S$4("data-ui5-system-css-vars")||c$b(a$9,"data-ui5-system-css-vars");};

    var t$i = "html:not(.ui5-content-native-scrollbars){scrollbar-color:var(--sapScrollBar_FaceColor) var(--sapScrollBar_TrackColor)}";

    const s$j=()=>{S$4("data-ui5-scrollbar-styles")||c$b(t$i,"data-ui5-scrollbar-styles");};

    let l$d = class l{constructor(){this.list=[],this.lookup=new Set;}add(t){this.lookup.has(t)||(this.list.push(t),this.lookup.add(t));}remove(t){this.lookup.has(t)&&(this.list=this.list.filter(e=>e!==t),this.lookup.delete(t));}shift(){const t=this.list.shift();if(t)return this.lookup.delete(t),t}isEmpty(){return this.list.length===0}isAdded(t){return this.lookup.has(t)}process(t){let e;const s=new Map;for(e=this.shift();e;){const i=s.get(e)||0;if(i>10)throw new Error("Web component processed too many times this task, max allowed is: 10");t(e),s.set(e,i+1),e=this.shift();}}};

    const t$h=new Set,n$k=e=>{t$h.add(e);},r$g=e=>t$h.has(e);

    const s$i=new Set,d$9=new i$j,n$j=new l$d;let t$g,a$8,m$9,i$c;const l$c=async e=>{n$j.add(e),await P$3();},c$a=e=>{d$9.fireEvent("beforeComponentRender",e),s$i.add(e),e._render();},h$5=e=>{n$j.remove(e),s$i.delete(e);},P$3=async()=>{i$c||(i$c=new Promise(e=>{window.requestAnimationFrame(()=>{n$j.process(c$a),i$c=null,e(),m$9||(m$9=setTimeout(()=>{m$9=void 0,n$j.isEmpty()&&U$1();},200));});})),await i$c;},y$7=()=>t$g||(t$g=new Promise(e=>{a$8=e,window.requestAnimationFrame(()=>{n$j.isEmpty()&&(t$g=void 0,e());});}),t$g),I$2=()=>{const e=T$3().map(r=>customElements.whenDefined(r));return Promise.all(e)},f$9=async()=>{await I$2(),await y$7();},U$1=()=>{n$j.isEmpty()&&a$8&&(a$8(),a$8=void 0,t$g=void 0);},C$2=async e=>{s$i.forEach(r=>{const o=r.constructor,u=o.getMetadata().getTag(),w=r$g(o),p=o.getMetadata().isLanguageAware(),E=o.getMetadata().isThemeAware();(!e||e.tag===u||e.rtlAware&&w||e.languageAware&&p||e.themeAware&&E)&&l$c(r);}),await f$9();};

    const t$f=new i$j,r$f="themeRegistered",n$i=e=>{t$f.attachEvent(r$f,e);},s$h=e=>t$f.fireEvent(r$f,e);

    const l$b=new Map,h$4=new Map,u$9=new Map,T$1=new Set,i$b=new Set,p$4=(e,r,t)=>{h$4.set(`${e}/${r}`,t),T$1.add(e),i$b.add(r),s$h(r);},m$8=async(e,r,t)=>{const g=`${e}_${r}_${t||""}`,s=l$b.get(g);if(s!==void 0)return s;if(!i$b.has(r)){const $=[...i$b.values()].join(", ");return console.warn(`You have requested a non-registered theme ${r} - falling back to ${e$c}. Registered themes are: ${$}`),a$7(e,e$c)}const[n,d]=await Promise.all([a$7(e,r),t?a$7(e,t,true):void 0]),o=m$a(n,d);return o&&l$b.set(g,o),o},a$7=async(e,r,t=false)=>{const s=(t?u$9:h$4).get(`${e}/${r}`);if(!s){t||console.error(`Theme [${r}] not registered for package [${e}]`);return}let n;try{n=await s(r);}catch(d){console.error(e,d.message);return}return n},w$5=()=>T$1,P$2=e=>i$b.has(e);

    const r$e=new Set,s$g=()=>{let e=document.querySelector(".sapThemeMetaData-Base-baseLib")||document.querySelector(".sapThemeMetaData-UI5-sap-ui-core");if(e)return getComputedStyle(e).backgroundImage;e=document.createElement("span"),e.style.display="none",e.classList.add("sapThemeMetaData-Base-baseLib"),document.body.appendChild(e);let t=getComputedStyle(e).backgroundImage;return t==="none"&&(e.classList.add("sapThemeMetaData-UI5-sap-ui-core"),t=getComputedStyle(e).backgroundImage),document.body.removeChild(e),t},o$a=e=>{const t=/\(["']?data:text\/plain;utf-8,(.*?)['"]?\)$/i.exec(e);if(t&&t.length>=2){let a=t[1];if(a=a.replace(/\\"/g,'"'),a.charAt(0)!=="{"&&a.charAt(a.length-1)!=="}")try{a=decodeURIComponent(a);}catch{r$e.has("decode")||(console.warn("Malformed theme metadata string, unable to decodeURIComponent"),r$e.add("decode"));return}try{return JSON.parse(a)}catch{r$e.has("parse")||(console.warn("Malformed theme metadata string, unable to parse JSON"),r$e.add("parse"));}}},d$8=e=>{let t,a;try{const n=e.Path.split(".");t=n.length===4?n[2]:getComputedStyle(document.body).getPropertyValue("--sapSapThemeId"),a=e.Extends[0];}catch{r$e.has("object")||(console.warn("Malformed theme metadata Object",e),r$e.add("object"));return}return {themeName:t,baseThemeName:a}},m$7=()=>{const e=s$g();if(!e||e==="none")return;const t=o$a(e);if(t)return d$8(t)};

    const t$e=new i$j,d$7="themeLoaded",r$d=e=>t$e.fireEvent(d$7,e);

    const d$6=(r,n)=>{const e=document.createElement("link");return e.type="text/css",e.rel="stylesheet",n&&Object.entries(n).forEach(t=>e.setAttribute(...t)),e.href=r,document.head.appendChild(e),new Promise(t=>{e.addEventListener("load",t),e.addEventListener("error",t);})};

    let t$d;i$e(()=>{t$d=void 0;});const n$h=()=>(t$d===void 0&&(t$d=S$3()),t$d),u$8=e=>`${n$h()}Base/baseLib/${e}/css_variables.css`,i$a=async e=>{const o=document.querySelector(`[sap-ui-webcomponents-theme="${e}"]`);o&&document.head.removeChild(o),await d$6(u$8(e),{"sap-ui-webcomponents-theme":e});};

    let _lib="ui5",_package="webcomponents-theming";const s$f="@"+_lib+"/"+_package,S$2=()=>w$5().has(s$f),P$1=async e=>{if(!S$2())return;const t=await m$8(s$f,e);t&&R$2(t,"data-ui5-theme-properties",s$f,e);},E$2=()=>{f$b("data-ui5-theme-properties",s$f);},U=async(e,t)=>{const o=[...w$5()].map(async a=>{if(a===s$f)return;const i=await m$8(a,e,t);i&&R$2(i,`data-ui5-component-properties-${I$3()}`,a);});return Promise.all(o)},k$2=async e=>{const t=m$7();if(t)return t;const r=n$n("OpenUI5Support");if(r&&r.isOpenUI5Detected()){if(r.cssVariablesLoaded())return {themeName:r.getConfigurationSettingsObject()?.theme,baseThemeName:""}}else if(n$h())return await i$a(e),m$7()},w$4=async e=>{const t=await k$2(e);!t||e!==t.themeName?await P$1(e):E$2();const r=P$2(e)?e:t&&t.baseThemeName;await U(r||e$c,t&&t.themeName===e?e:void 0),r$d(e);};

    let t$c;i$e(()=>{t$c=void 0;});const r$c=()=>(t$c===void 0&&(t$c=T$2()),t$c),n$g=()=>{const e=r$c();return l$a(e)?!e.startsWith("sap_horizon"):!m$7()?.baseThemeName?.startsWith("sap_horizon")},l$a=e=>s$m.includes(e);

    const t$b=typeof document>"u",e$9={get userAgent(){return t$b?"":navigator.userAgent},get touch(){return t$b?false:"ontouchstart"in window||navigator.maxTouchPoints>0},get chrome(){return t$b?false:/(Chrome|CriOS)/.test(e$9.userAgent)},get firefox(){return t$b?false:/Firefox/.test(e$9.userAgent)},get safari(){return t$b?false:!e$9.chrome&&/(Version|PhantomJS)\/(\d+\.\d+).*Safari/.test(e$9.userAgent)},get webkit(){return t$b?false:/webkit/.test(e$9.userAgent)},get windows(){return t$b?false:navigator.platform.indexOf("Win")!==-1},get macOS(){return t$b?false:!!navigator.userAgent.match(/Macintosh|Mac OS X/i)},get iOS(){return t$b?false:!!navigator.platform.match(/iPhone|iPad|iPod/)||!!(e$9.userAgent.match(/Mac/)&&"ontouchend"in document)},get android(){return t$b?false:!e$9.windows&&/Android/.test(e$9.userAgent)},get androidPhone(){return t$b?false:e$9.android&&/(?=android)(?=.*mobile)/i.test(e$9.userAgent)},get ipad(){return t$b?false:/ipad/i.test(e$9.userAgent)||/Macintosh/i.test(e$9.userAgent)&&"ontouchend"in document},_isPhone(){return u$7(),e$9.touch&&!r$b}};let o$9,i$9,r$b;const s$e=()=>{if(t$b||!e$9.windows)return  false;if(o$9===void 0){const n=e$9.userAgent.match(/Windows NT (\d+).(\d)/);o$9=n?parseFloat(n[1]):0;}return o$9>=8},c$9=()=>{if(t$b||!e$9.webkit)return  false;if(i$9===void 0){const n=e$9.userAgent.match(/(webkit)[ /]([\w.]+)/);i$9=n?parseFloat(n[1]):0;}return i$9>=537.1},u$7=()=>{if(t$b)return  false;if(r$b===void 0){if(e$9.ipad){r$b=true;return}if(e$9.touch){if(s$e()){r$b=true;return}if(e$9.chrome&&e$9.android){r$b=!/Mobile Safari\/[.0-9]+/.test(e$9.userAgent);return}let n=window.devicePixelRatio?window.devicePixelRatio:1;e$9.android&&c$9()&&(n=1),r$b=Math.min(window.screen.width/n,window.screen.height/n)>=600;return}r$b=e$9.userAgent.indexOf("Touch")!==-1||e$9.android&&!e$9.androidPhone;}},h$3=()=>e$9.safari,a$6=()=>(u$7(),(e$9.touch||s$e())&&r$b),d$5=()=>e$9._isPhone(),f$8=()=>t$b?false:!a$6()&&!d$5()||s$e(),w$3=()=>e$9.iOS;

    let t$a=false;const i$8=()=>{h$3()&&w$3()&&!t$a&&(document.body.addEventListener("touchstart",()=>{}),t$a=true);};

    let o$8=false,r$a;const p$3=new i$j,b$5=async()=>{if(r$a!==void 0)return r$a;const t=async n=>{if(x$2(),typeof document>"u"){n();return}n$i(F$1);const e=n$n("OpenUI5Support"),f=e?e.isOpenUI5Detected():false,s=n$n("F6Navigation");e&&await e.init(),s&&!f&&s.init(),await d$b(),await w$4(r$c()),e&&e.attachListeners(),a$a(),e$a(),s$j(),i$8(),n(),o$8=true,p$3.fireEvent("boot");};return r$a=new Promise(t),r$a},F$1=t=>{o$8&&t===r$c()&&w$4(r$c());};

    const s$d=new Map,o$7=new Map,n$f=new Map,c$8=e=>{if(!s$d.has(e)){const a=b$4(e.split("-"));s$d.set(e,a);}return s$d.get(e)},l$9=e=>{if(!o$7.has(e)){const a=e.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();o$7.set(e,a);}return o$7.get(e)},p$2=e=>l$9(e),b$4=e=>e.map((a,t)=>t===0?a.toLowerCase():a.charAt(0).toUpperCase()+a.slice(1).toLowerCase()).join(""),C$1=e=>{const a=n$f.get(e);if(a)return a;const t=c$8(e),r=t.charAt(0).toUpperCase()+t.slice(1);return n$f.set(e,r),r};

    const o$6=t=>{if(!(t instanceof HTMLElement))return "default";const e=t.getAttribute("slot");if(e){const r=e.match(/^(.+?)-\d+$/);return r?r[1]:e}return "default"},n$e=t=>t instanceof HTMLSlotElement?t.assignedNodes({flatten:true}).filter(e=>e instanceof HTMLElement):[t],s$c=t=>t.reduce((e,r)=>e.concat(n$e(r)),[]);

    let u$6 = class u{constructor(t){this.metadata=t;}getInitialState(){if(Object.prototype.hasOwnProperty.call(this,"_initialState"))return this._initialState;const t={};if(this.slotsAreManaged()){const o=this.getSlots();for(const[e,s]of Object.entries(o)){const n=s.propertyName||e;t[n]=[],t[c$8(n)]=t[n];}}return this._initialState=t,t}static validateSlotValue(t,a){return g$6(t,a)}getPureTag(){return this.metadata.tag||""}getTag(){const t=this.metadata.tag;if(!t)return "";const a=g$a(t);return a?`${t}-${a}`:t}hasAttribute(t){const a=this.getProperties()[t];return a.type!==Object&&a.type!==Array&&!a.noAttribute}getPropertiesList(){return Object.keys(this.getProperties())}getAttributesList(){return this.getPropertiesList().filter(this.hasAttribute.bind(this)).map(l$9)}canSlotText(){return this.getSlots().default?.type===Node}hasSlots(){return !!Object.entries(this.getSlots()).length}hasIndividualSlots(){return this.slotsAreManaged()&&Object.values(this.getSlots()).some(t=>t.individualSlots)}slotsAreManaged(){return !!this.metadata.managedSlots}supportsF6FastNavigation(){return !!this.metadata.fastNavigation}getProperties(){return this.metadata.properties||(this.metadata.properties={}),this.metadata.properties}getEvents(){return this.metadata.events||(this.metadata.events={}),this.metadata.events}getSlots(){return this.metadata.slots||(this.metadata.slots={}),this.metadata.slots}isLanguageAware(){return !!this.metadata.languageAware}isThemeAware(){return !!this.metadata.themeAware}needsCLDR(){return !!this.metadata.cldr}getShadowRootOptions(){return this.metadata.shadowRootOptions||{}}isFormAssociated(){return !!this.metadata.formAssociated}shouldInvalidateOnChildChange(t,a,o){const e=this.getSlots()[t].invalidateOnChildChange;if(e===void 0)return  false;if(typeof e=="boolean")return e;if(typeof e=="object"){if(a==="property"){if(e.properties===void 0)return  false;if(typeof e.properties=="boolean")return e.properties;if(Array.isArray(e.properties))return e.properties.includes(o);throw new Error("Wrong format for invalidateOnChildChange.properties: boolean or array is expected")}if(a==="slot"){if(e.slots===void 0)return  false;if(typeof e.slots=="boolean")return e.slots;if(Array.isArray(e.slots))return e.slots.includes(o);throw new Error("Wrong format for invalidateOnChildChange.slots: boolean or array is expected")}}throw new Error("Wrong format for invalidateOnChildChange: boolean or object is expected")}getI18n(){return this.metadata.i18n||(this.metadata.i18n={}),this.metadata.i18n}};const g$6=(r,t)=>(r&&n$e(r).forEach(a=>{if(!(a instanceof t.type))throw new Error(`The element is not of type ${t.type.toString()}`)}),r);

    const r$9=()=>m$d("CustomStyle.eventProvider",new i$j),n$d="CustomCSSChange",i$7=t=>{r$9().attachEvent(n$d,t);},c$7=()=>m$d("CustomStyle.customCSSFor",{});i$7(t=>{C$2({tag:t});});const l$8=t=>{const e=c$7();return e[t]?e[t].join(""):""};

    const e$8=t=>Array.isArray(t)?t.filter(r=>!!r).flat(10).join(" "):t;

    const e$7=new Map;i$7(t=>{e$7.delete(`${t}_normal`);});const y$6=t=>{const o=t.getMetadata().getTag(),n=`${o}_normal`,s=n$n("OpenUI5Enablement");if(!e$7.has(n)){let l="";s&&(l=e$8(s.getBusyIndicatorStyles()));const a=l$8(o)||"",m=`${e$8(t.styles)} ${a} ${l}`;e$7.set(n,m);}return e$7.get(n)};

    const e$6=new Map;i$7(t=>{e$6.delete(`${t}_normal`);});const s$b=t=>{const n=`${t.getMetadata().getTag()}_normal`;if(!e$6.has(n)){const a=y$6(t),o=new CSSStyleSheet;o.replaceSync(a),e$6.set(n,[o]);}return e$6.get(n)};

    const s$a=o=>{const e=o.constructor,t=o.shadowRoot;if(!t){console.warn("There is no shadow root to update");return}t.adoptedStyleSheets=s$b(e),e.renderer(o,t);};

    const r$8=[],o$5=t=>r$8.some(s=>t.startsWith(s));

    const t$9=new WeakMap,n$c=(e,o,r)=>{const s=new MutationObserver(o);t$9.set(e,s),s.observe(e,r);},b$3=e=>{const o=t$9.get(e);o&&(o.disconnect(),t$9.delete(e));};

    const c$6=["value-changed","click"];let e$5;i$e(()=>{e$5=void 0;});const s$9=t=>c$6.includes(t),l$7=t=>{const n=o$4();return !(typeof n!="boolean"&&n.events&&n.events.includes&&n.events.includes(t))},o$4=()=>(e$5===void 0&&(e$5=F$2()),e$5),a$5=t=>{const n=o$4();return s$9(t)?false:n===true?true:!l$7(t)};

    const r$7=t=>t.matches(":dir(rtl)")?"rtl":"ltr";

    const s$8=["disabled","title","hidden","role","draggable"],r$6=e=>s$8.includes(e)||e.startsWith("aria")?true:![HTMLElement,Element,Node].some(t=>t.prototype.hasOwnProperty(e));

    const n$b=(t,r)=>{if(t.length!==r.length)return  false;for(let e=0;e<t.length;e++)if(t[e]!==r[e])return  false;return  true};

    const n$a=(e,t)=>e.call(t);

    const o$3=t=>{s$7(t)&&e$4(t);},e$4=t=>{if(t._internals?.form){if(n$9(t),!t.name){t._internals?.setFormValue(null);return}t._internals.setFormValue(t.formFormattedValue);}},n$9=async t=>{if(t._internals?.form)if(t.formValidity&&Object.keys(t.formValidity).some(r=>r)){const r=await t.formElementAnchor?.();t._internals.setValidity(t.formValidity,t.formValidityMessage,r);}else t._internals.setValidity({});},i$6=t=>{t._internals?.form?.requestSubmit();},m$6=t=>{t._internals?.form?.reset();},s$7=t=>"formFormattedValue"in t&&"name"in t;

    const t$8=typeof document>"u",o$2=()=>{if(t$8)return a$d;const a=navigator.languages,n=()=>navigator.language;return a&&a[0]||n()||a$d};

    const e$3=new i$j,n$8="languageChange",t$7=a=>{e$3.attachEvent(n$8,a);};

    let e$2,t$6;i$e(()=>{e$2=void 0,t$6=void 0;});let a$4=false;const s$6=()=>a$4,l$6=()=>(e$2===void 0&&(e$2=L$2()),e$2),h$2=()=>(t$6===void 0&&(t$6=R$1()),t$6);

    const n$7=/^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;let r$5 = class r{constructor(s){const t=n$7.exec(s.replace(/_/g,"-"));if(t===null)throw new Error(`The given language ${s} does not adhere to BCP-47.`);this.sLocaleId=s,this.sLanguage=t[1]||a$d,this.sScript=t[2]||"",this.sRegion=t[3]||"",this.sVariant=t[4]&&t[4].slice(1)||null,this.sExtension=t[5]&&t[5].slice(1)||null,this.sPrivateUse=t[6]||null,this.sLanguage&&(this.sLanguage=this.sLanguage.toLowerCase()),this.sScript&&(this.sScript=this.sScript.toLowerCase().replace(/^[a-z]/,i=>i.toUpperCase())),this.sRegion&&(this.sRegion=this.sRegion.toUpperCase());}getLanguage(){return this.sLanguage}getScript(){return this.sScript}getRegion(){return this.sRegion}getVariant(){return this.sVariant}getVariantSubtags(){return this.sVariant?this.sVariant.split("-"):[]}getExtension(){return this.sExtension}getExtensionSubtags(){return this.sExtension?this.sExtension.slice(2).split("-"):[]}getPrivateUse(){return this.sPrivateUse}getPrivateUseSubtags(){return this.sPrivateUse?this.sPrivateUse.slice(2).split("-"):[]}hasPrivateUseSubtag(s){return this.getPrivateUseSubtags().indexOf(s)>=0}toString(){const s=[this.sLanguage];return this.sScript&&s.push(this.sScript),this.sRegion&&s.push(this.sRegion),this.sVariant&&s.push(this.sVariant),this.sExtension&&s.push(this.sExtension),this.sPrivateUse&&s.push(this.sPrivateUse),s.join("-")}};

    const r$4=new Map,n$6=t=>(r$4.has(t)||r$4.set(t,new r$5(t)),r$4.get(t)),c$5=t=>{try{if(t&&typeof t=="string")return n$6(t)}catch{}return new r$5(r$h)},s$5=t=>{const e=l$6();return e?n$6(e):c$5(o$2())};

    const _$1=/^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i,c$4=/(?:^|-)(saptrc|sappsd)(?:-|$)/i,f$7={he:"iw",yi:"ji",nb:"no",sr:"sh"},p$1=i=>{let e;if(!i)return r$h;if(typeof i=="string"&&(e=_$1.exec(i.replace(/_/g,"-")))){let t=e[1].toLowerCase(),n=e[3]?e[3].toUpperCase():void 0;const s=e[2]?e[2].toLowerCase():void 0,r=e[4]?e[4].slice(1):void 0,o=e[6];return t=f$7[t]||t,o&&(e=c$4.exec(o))||r&&(e=c$4.exec(r))?`en_US_${e[1].toLowerCase()}`:(t==="zh"&&!n&&(s==="hans"?n="CN":s==="hant"&&(n="TW")),t+(n?"_"+n+(r?"_"+r.replace("-","_"):""):""))}return r$h};

    const r$3={zh_HK:"zh_TW",in:"id"},n$5=t=>{if(!t)return r$h;if(r$3[t])return r$3[t];const L=t.lastIndexOf("_");return L>=0?t.slice(0,L):t!==r$h?r$h:""};

    const d$4=new Set,m$5=new Set,g$5=new Map,l$5=new Map,u$5=new Map,f$6=(n,t)=>{g$5.set(n,t);},A$4=n=>g$5.get(n),h$1=(n,t)=>{const e=`${n}/${t}`;return u$5.has(e)},B$1=(n,t)=>{const e=`${n}/${t}`,r=u$5.get(e);return r&&!l$5.get(e)&&l$5.set(e,r(t)),l$5.get(e)},M$1=n=>{d$4.has(n)||(console.warn(`[${n}]: Message bundle assets are not configured. Falling back to English texts.`,` Add \`import "${n}/dist/Assets.js"\` in your bundle and make sure your build tool supports dynamic imports and JSON imports. See section "Assets" in the documentation for more information.`),d$4.add(n));},L$1=(n,t)=>t!==a$d&&!h$1(n,t),w$2=async n=>{const t=s$5().getLanguage(),e=s$5().getRegion(),r=s$5().getVariant();let s=t+(e?`-${e}`:"")+(r?`-${r}`:"");if(L$1(n,s))for(s=p$1(s);L$1(n,s);)s=n$5(s);const I=h$2();if(s===a$d&&!I){f$6(n,null);return}if(!h$1(n,s)){M$1(n);return}try{const o=await B$1(n,s);f$6(n,o);}catch(o){const a=o;m$5.has(a.message)||(m$5.add(a.message),console.error(a.message));}};t$7(n=>{const t=[...g$5.keys()];return Promise.all(t.map(w$2))});

    const g$4=/('')|'([^']+(?:''[^']*)*)(?:'|$)|\{([0-9]+(?:\s*,[^{}]*)?)\}|[{}]/g,i$5=(n,t)=>(t=t||[],n.replace(g$4,(p,s,e,r,o)=>{if(s)return "'";if(e)return e.replace(/''/g,"'");if(r){const a=typeof r=="string"?parseInt(r):r;return String(t[a])}throw new Error(`[i18n]: pattern syntax error at pos ${o}`)}));

    const r$2=new Map;let u$4 = class u{constructor(e){this.packageName=e;}getText(e,...i){if(typeof e=="string"&&(e={key:e,defaultText:e}),!e||!e.key)return "";const t=A$4(this.packageName);t&&!t[e.key]&&console.warn(`Key ${e.key} not found in the i18n bundle, the default text will be used`);const l=t&&t[e.key]?t[e.key]:e.defaultText||e.key;return i$5(l,i)}};const a$3=n=>{if(r$2.has(n))return r$2.get(n);const e=new u$4(n);return r$2.set(n,e),e},f$5=async n=>(await w$2(n),a$3(n));

    const f$4=new Map,s$4=new Map,i$4=new Map,L=new Set;let d$3=false;const O$2={iw:"he",ji:"yi",in:"id"},D$2=t=>{d$3||(console.warn(`[LocaleData] Supported locale "${t}" not configured, import the "Assets.js" module from the webcomponents package you are using.`),d$3=true);},y$5=(t,e,n)=>{t=t&&O$2[t]||t,t==="no"&&(t="nb"),t==="zh"&&!e&&(n==="Hans"?e="CN":n==="Hant"&&(e="TW")),(t==="sh"||t==="sr"&&n==="Latn")&&(t="sr",e="Latn");let o=`${t}_${e}`;return l$f.includes(o)?s$4.has(o)?o:(D$2(o),r$h):(o=t,l$f.includes(o)?s$4.has(o)?o:(D$2(o),r$h):r$h)},u$3=(t,e)=>{f$4.set(t,e);},S$1=t=>{if(!i$4.get(t)){const e=s$4.get(t);if(!e)throw new Error(`CLDR data for locale ${t} is not loaded!`);i$4.set(t,e(t));}return i$4.get(t)},g$3=async(t,e,n)=>{const o=y$5(t,e,n),p=n$n("OpenUI5Support");if(p){const r=p.getLocaleDataObject();if(r){u$3(o,r);return}}try{const r=await S$1(o);u$3(o,r);}catch(r){const c=r;L.has(c.message)||(L.add(c.message),console.error(c.message));}},m$4=(t,e)=>{s$4.set(t,e);};m$4("en",async()=>(console.warn('[LocaleData] Falling back to loading "en" locale data from CDN.','For production usage, please configure locale data loading via the "Assets.js" module of the webcomponents package you are using.'),(await fetch("https://cdn.jsdelivr.net/npm/@openui5/sap.ui.core@1.120.17/src/sap/ui/core/cldr/en.json")).json())),t$7(()=>{const t=s$5();return g$3(t.getLanguage(),t.getRegion(),t.getScript())});

    let it=0;const R=new Map,I$1=new Map,O$1={fromAttribute(c,f){return f===Boolean?c!==null:f===Number?c===null?void 0:parseFloat(c):c},toAttribute(c,f){return f===Boolean?c?"":null:f===Object||f===Array||c==null?null:String(c)}};function y$4(c){this._suppressInvalidation||this.constructor.getMetadata().isLanguageAware()&&s$6()||(this.onInvalidation(c),this._changedState.push(c),l$c(this),this._invalidationEventProvider.fireEvent("invalidate",{...c,target:this}));}function at(c,f){do{const t=Object.getOwnPropertyDescriptor(c,f);if(t)return t;c=Object.getPrototypeOf(c);}while(c&&c!==HTMLElement.prototype)}let b$2 = class b extends HTMLElement{constructor(){super();this.__shouldHydrate=false;this._rendered=false;const t=this.constructor;this._changedState=[],this._suppressInvalidation=true,this._inDOM=false,this._fullyConnected=false,this._childChangeListeners=new Map,this._slotChangeListeners=new Map,this._invalidationEventProvider=new i$j,this._componentStateFinalizedEventProvider=new i$j;let e;this._domRefReadyPromise=new Promise(n=>{e=n;}),this._domRefReadyPromise._deferredResolve=e,this._doNotSyncAttributes=new Set,this._slotsAssignedNodes=new WeakMap,this._state={...t.getMetadata().getInitialState()},this.initializedProperties=new Map,this.constructor.getMetadata().getPropertiesList().forEach(n=>{if(this.hasOwnProperty(n)){const o=this[n];this.initializedProperties.set(n,o);}}),this._internals=this.attachInternals(),this._initShadowRoot();}_initShadowRoot(){const t=this.constructor;if(t._needsShadowDOM()){const e={mode:"open"};this.shadowRoot?this.__shouldHydrate=true:this.attachShadow({...e,...t.getMetadata().getShadowRootOptions()}),t.getMetadata().slotsAreManaged()&&this.shadowRoot.addEventListener("slotchange",this._onShadowRootSlotChange.bind(this));}}_onShadowRootSlotChange(t){t.target?.getRootNode()===this.shadowRoot&&this._processChildren();}get _id(){return this.__id||(this.__id=`ui5wc_${++it}`),this.__id}render(){const t=this.constructor.template;return n$a(t,this)}async connectedCallback(){const t=this.constructor;this.setAttribute(t.getMetadata().getPureTag(),""),t.getMetadata().supportsF6FastNavigation()&&!this.hasAttribute("data-sap-ui-fastnavgroup")&&this.setAttribute("data-sap-ui-fastnavgroup","true");const e=t.getMetadata().slotsAreManaged();this._inDOM=true,e&&(this._startObservingDOMChildren(),await this._processChildren()),t.asyncFinished||await t.definePromise,this._inDOM&&(c$a(this),this._domRefReadyPromise._deferredResolve(),this._fullyConnected=true,this.onEnterDOM());}disconnectedCallback(){const e=this.constructor.getMetadata().slotsAreManaged();this._inDOM=false,e&&this._stopObservingDOMChildren(),this._fullyConnected&&(this.onExitDOM(),this._fullyConnected=false),this._domRefReadyPromise._deferredResolve(),h$5(this);}onBeforeRendering(){}onAfterRendering(){}onEnterDOM(){}onExitDOM(){}_startObservingDOMChildren(){const e=this.constructor.getMetadata();if(!e.hasSlots())return;const n=e.canSlotText(),o={childList:true,subtree:n,characterData:n};n$c(this,this._processChildren.bind(this),o);}_stopObservingDOMChildren(){b$3(this);}async _processChildren(){this.constructor.getMetadata().hasSlots()&&await this._updateSlots();}async _updateSlots(){const t=this.constructor,e=t.getMetadata().getSlots(),s=t.getMetadata().canSlotText(),n=Array.from(s?this.childNodes:this.children),o=new Map,a=new Map;for(const[l,u]of Object.entries(e)){const d=u.propertyName||l;a.set(d,l),o.set(d,[...this._state[d]]),this._clearSlot(l,u);}const r=new Map,i=new Map,h=n.map(async(l,u)=>{const d=o$6(l),g=e[d];if(g===void 0){if(d!=="default"){const p=Object.keys(e).join(", ");console.warn(`Unknown slotName: ${d}, ignoring`,l,`Valid values are: ${p}`);}return}if(g.individualSlots){const p=(r.get(d)||0)+1;r.set(d,p),l._individualSlot=`${d}-${p}`;}if(l instanceof HTMLElement){const p=l.localName;if(p.includes("-")&&!o$5(p)){if(!customElements.get(p)){const L=customElements.whenDefined(p);let E=R.get(p);E||(E=new Promise(U=>setTimeout(U,1e3)),R.set(p,E)),await Promise.race([L,E]);}customElements.upgrade(l);}}if(l=t.getMetadata().constructor.validateSlotValue(l,g),v$2(l)&&g.invalidateOnChildChange){const p=this._getChildChangeListener(d);l.attachInvalidate.call(l,p);}l instanceof HTMLSlotElement&&this._attachSlotChange(l,d,!!g.invalidateOnChildChange);const C=g.propertyName||d;i.has(C)?i.get(C).push({child:l,idx:u}):i.set(C,[{child:l,idx:u}]);});await Promise.all(h),i.forEach((l,u)=>{this._state[u]=l.sort((d,g)=>d.idx-g.idx).map(d=>d.child),this._state[c$8(u)]=this._state[u];});let _=false;for(const[l,u]of Object.entries(e)){const d=u.propertyName||l;n$b(o.get(d),this._state[d])||(y$4.call(this,{type:"slot",name:a.get(d),reason:"children"}),_=true,t.getMetadata().isFormAssociated()&&e$4(this));}_||y$4.call(this,{type:"slot",name:"default",reason:"textcontent"});}_clearSlot(t,e){const s=e.propertyName||t;this._state[s].forEach(o=>{if(v$2(o)){const a=this._getChildChangeListener(t);o.detachInvalidate.call(o,a);}o instanceof HTMLSlotElement&&this._detachSlotChange(o,t);}),this._state[s]=[],this._state[c$8(s)]=this._state[s];}attachInvalidate(t){this._invalidationEventProvider.attachEvent("invalidate",t);}detachInvalidate(t){this._invalidationEventProvider.detachEvent("invalidate",t);}_onChildChange(t,e){this.constructor.getMetadata().shouldInvalidateOnChildChange(t,e.type,e.name)&&y$4.call(this,{type:"slot",name:t,reason:"childchange",child:e.target});}attributeChangedCallback(t,e,s){let n;if(this._doNotSyncAttributes.has(t))return;const o=this.constructor.getMetadata().getProperties(),a=t.replace(/^ui5-/,""),r=c$8(a);if(o.hasOwnProperty(r)){const i=o[r];n=(i.converter??O$1).fromAttribute(s,i.type),this[r]=n;}}formAssociatedCallback(){this.constructor.getMetadata().isFormAssociated()&&o$3(this);}static get formAssociated(){return this.getMetadata().isFormAssociated()}_updateAttribute(t,e){const s=this.constructor;if(!s.getMetadata().hasAttribute(t))return;const o=s.getMetadata().getProperties()[t],a=l$9(t),i=(o.converter||O$1).toAttribute(e,o.type);this._doNotSyncAttributes.add(a),i==null?this.removeAttribute(a):this.setAttribute(a,i),this._doNotSyncAttributes.delete(a);}_getChildChangeListener(t){return this._childChangeListeners.has(t)||this._childChangeListeners.set(t,this._onChildChange.bind(this,t)),this._childChangeListeners.get(t)}_getSlotChangeListener(t){return this._slotChangeListeners.has(t)||this._slotChangeListeners.set(t,this._onSlotChange.bind(this,t)),this._slotChangeListeners.get(t)}_attachSlotChange(t,e,s){const n=this._getSlotChangeListener(e);t.addEventListener("slotchange",o=>{if(n.call(t,o),s){const a=this._slotsAssignedNodes.get(t);a&&a.forEach(i=>{if(v$2(i)){const h=this._getChildChangeListener(e);i.detachInvalidate.call(i,h);}});const r=s$c([t]);this._slotsAssignedNodes.set(t,r),r.forEach(i=>{if(v$2(i)){const h=this._getChildChangeListener(e);i.attachInvalidate.call(i,h);}});}});}_detachSlotChange(t,e){t.removeEventListener("slotchange",this._getSlotChangeListener(e));}_onSlotChange(t){y$4.call(this,{type:"slot",name:t,reason:"slotchange"});}onInvalidation(t){}updateAttributes(){const e=this.constructor.getMetadata().getProperties();for(const[s,n]of Object.entries(e))this._updateAttribute(s,this[s]);}_render(){const t=this.constructor,e=t.getMetadata().hasIndividualSlots();this.initializedProperties.size>0&&(Array.from(this.initializedProperties.entries()).forEach(([s,n])=>{delete this[s],this[s]=n;}),this.initializedProperties.clear()),this._suppressInvalidation=true;try{this.onBeforeRendering(),this._rendered||this.updateAttributes(),this._componentStateFinalizedEventProvider.fireEvent("componentStateFinalized");}finally{this._suppressInvalidation=false;}this._changedState=[],t._needsShadowDOM()&&s$a(this),this._rendered=true,e&&this._assignIndividualSlotsToChildren(),this.onAfterRendering();}_assignIndividualSlotsToChildren(){Array.from(this.children).forEach(e=>{e._individualSlot&&e.setAttribute("slot",e._individualSlot);});}_waitForDomRef(){return this._domRefReadyPromise}getDomRef(){if(typeof this._getRealDomRef=="function")return this._getRealDomRef();if(!(!this.shadowRoot||this.shadowRoot.children.length===0))return this.shadowRoot.children[0]}getFocusDomRef(){const t=this.getDomRef();if(t)return t.querySelector("[data-sap-focus-ref]")||t}async getFocusDomRefAsync(){return await this._waitForDomRef(),this.getFocusDomRef()}async focus(t){await this._waitForDomRef();const e=this.getFocusDomRef();e===this||!this.isConnected?HTMLElement.prototype.focus.call(this,t):e&&typeof e.focus=="function"&&e.focus(t);}fireEvent(t,e,s=false,n=true){const o=this._fireEvent(t,e,s,n),a=C$1(t);return a!==t?o&&this._fireEvent(a,e,s,n):o}fireDecoratorEvent(t,e){const s=this.getEventData(t),n=s?s.cancelable:false,o=s?s.bubbles:false,a=this._fireEvent(t,e,n,o),r=C$1(t);return r!==t?a&&this._fireEvent(r,e,n,o):a}_fireEvent(t,e,s=false,n=true){const o=new CustomEvent(`ui5-${t}`,{detail:e,composed:false,bubbles:n,cancelable:s}),a=this.dispatchEvent(o);if(a$5(t))return a;const r=new CustomEvent(t,{detail:e,composed:false,bubbles:n,cancelable:s});return this.dispatchEvent(r)&&a}getEventData(t){return this.constructor.getMetadata().getEvents()[t]}getSlottedNodes(t){return s$c(this[t])}attachComponentStateFinalized(t){this._componentStateFinalizedEventProvider.attachEvent("componentStateFinalized",t);}detachComponentStateFinalized(t){this._componentStateFinalizedEventProvider.detachEvent("componentStateFinalized",t);}get effectiveDir(){return n$k(this.constructor),r$7(this)}get isUI5Element(){return  true}get isUI5AbstractElement(){return !this.constructor._needsShadowDOM()}get classes(){return {}}get accessibilityInfo(){}static get observedAttributes(){return this.getMetadata().getAttributesList()}static get tagsToScope(){const t=this.getMetadata().getPureTag(),e=this.getUniqueDependencies().map(s=>s.getMetadata().getPureTag()).filter(i$h);return i$h(t)&&e.push(t),e}static _needsShadowDOM(){return !!this.template||Object.prototype.hasOwnProperty.call(this.prototype,"render")}static _generateAccessors(){const t=this.prototype,e=this.getMetadata().slotsAreManaged(),s=this.getMetadata().getProperties();for(const[n,o]of Object.entries(s)){r$6(n)||console.warn(`"${n}" is not a valid property name. Use a name that does not collide with DOM APIs`);const a=at(t,n);let r;a?.set&&(r=a.set);let i;a?.get&&(i=a.get),Object.defineProperty(t,n,{get(){return i?i.call(this):this._state[n]},set(h){const _=this.constructor,l=i?i.call(this):this._state[n];if(l!==h){if(r?r.call(this,h):this._state[n]=h,y$4.call(this,{type:"property",name:n,newValue:h,oldValue:l}),this._rendered){const d=i?i.call(this):this._state[n];this._updateAttribute(n,d);}_.getMetadata().isFormAssociated()&&e$4(this);}}});}if(e){const n=this.getMetadata().getSlots();for(const[o,a]of Object.entries(n)){r$6(o)||console.warn(`"${o}" is not a valid property name. Use a name that does not collide with DOM APIs`);const r=a.propertyName||o,i={get(){return this._state[r]!==void 0?this._state[r]:[]},set(){throw new Error("Cannot set slot content directly, use the DOM APIs (appendChild, removeChild, etc...)")}};Object.defineProperty(t,r,i),r!==c$8(r)&&Object.defineProperty(t,c$8(r),i);}}}static{this.metadata={};}static{this.styles="";}static get dependencies(){return []}static cacheUniqueDependencies(){const t=this.dependencies.filter((e,s,n)=>n.indexOf(e)===s);I$1.set(this,t);}static getUniqueDependencies(){return I$1.has(this)||this.cacheUniqueDependencies(),I$1.get(this)||[]}static async onDefine(){return Promise.resolve()}static fetchI18nBundles(){return Promise.all(Object.entries(this.getMetadata().getI18n()).map(t=>{const{bundleName:e}=t[1];return f$5(e)}))}static fetchCLDR(){return this.getMetadata().needsCLDR()?g$3(s$5().getLanguage(),s$5().getRegion(),s$5().getScript()):Promise.resolve()}static{this.i18nBundleStorage={};}static get i18nBundles(){return this.i18nBundleStorage}static define(){const t=async()=>{await b$5();const o=await Promise.all([this.fetchI18nBundles(),this.fetchCLDR(),this.onDefine()]),[a]=o;Object.entries(this.getMetadata().getI18n()).forEach((r,i)=>{const h=r[1].bundleName;this.i18nBundleStorage[h]=a[i];}),this.asyncFinished=true;};this.definePromise=t();const e=this.getMetadata().getTag(),s=w$7(e),n=customElements.get(e);return n&&!s?$$2(e):n||(this._generateAccessors(),h$6(e),customElements.define(e,this)),this}static getMetadata(){if(this.hasOwnProperty("_metadata"))return this._metadata;const t=[this.metadata];let e=this;for(;e!==b;)e=Object.getPrototypeOf(e),t.unshift(e.metadata);const s=e$f({},...t);return this._metadata=new u$6(s),this._metadata}get validity(){return this._internals.validity}get validationMessage(){return this._internals.validationMessage}checkValidity(){return this._internals.checkValidity()}reportValidity(){return this._internals.reportValidity()}};const v$2=c=>"isUI5Element"in c;

    const m$3=(a={})=>e=>{if(Object.prototype.hasOwnProperty.call(e,"metadata")||(e.metadata={}),typeof a=="string"){e.metadata.tag=a;return}const{tag:i,languageAware:o,themeAware:r,cldr:s,fastNavigation:l,formAssociated:n,shadowRootOptions:d}=a;e.metadata.tag=i,o&&(e.metadata.languageAware=o),s&&(e.metadata.cldr=s),r&&(e.metadata.themeAware=r),l&&(e.metadata.fastNavigation=l),n&&(e.metadata.formAssociated=n),d&&(e.metadata.shadowRootOptions=d),["renderer","template","styles","dependencies"].forEach(t=>{a[t]&&Object.defineProperty(e,t,{get:()=>a[t]});});};

    const l$4=(s,e={})=>t=>{Object.prototype.hasOwnProperty.call(t,"metadata")||(t.metadata={});const n=t.metadata;n.events||(n.events={});const a=n.events;a[s]||(e.bubbles=!!e.bubbles,e.cancelable=!!e.cancelable,a[s]=e);};

    const s$3=o=>(p,r)=>{const t=p.constructor;Object.prototype.hasOwnProperty.call(t,"metadata")||(t.metadata={});const e=t.metadata;e.properties||(e.properties={});const a=e.properties;a[r]||(a[r]=o??{});};

    const d$2=e=>(l,a)=>{const r=l.constructor;Object.prototype.hasOwnProperty.call(r,"metadata")||(r.metadata={});const o=r.metadata;o.slots||(o.slots={});const t=o.slots;if(e&&e.default&&t.default)throw new Error("Only one slot can be the default slot.");const n=e&&e.default?"default":a;e=e||{type:HTMLElement},e.type||(e.type=HTMLElement),t[n]||(t[n]=e),e.default&&(delete t.default.default,t.default.propertyName=a),r.metadata.managedSlots=true;};

    var n$4,l$3,t$5,i$3,o$1,r$1,e$1,f$3,c$3,s$2,a$2,h,p={},v$1=[],y$3=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,d$1=Array.isArray;function w$1(n,l){for(var t in l)n[t]=l[t];return n}function _(n){n&&n.parentNode&&n.parentNode.removeChild(n);}function g$2(l,t,u){var i,o,r,e={};for(r in t)"key"==r?i=t[r]:"ref"==r?o=t[r]:e[r]=t[r];if(arguments.length>2&&(e.children=arguments.length>3?n$4.call(arguments,2):u),"function"==typeof l&&null!=l.defaultProps)for(r in l.defaultProps) void 0===e[r]&&(e[r]=l.defaultProps[r]);return m$2(l,e,i,o,null)}function m$2(n,u,i,o,r){var e={type:n,props:u,key:i,ref:o,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:null==r?++t$5:r,__i:-1,__u:0};return null==r&&null!=l$3.vnode&&l$3.vnode(e),e}function k$1(n){return n.children}function x$1(n,l){this.props=n,this.context=l;}function C(n,l){if(null==l)return n.__?C(n.__,n.__i+1):null;for(var t;l<n.__k.length;l++)if(null!=(t=n.__k[l])&&null!=t.__e)return t.__e;return "function"==typeof n.type?C(n):null}function S(n){var l,t;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(t=n.__k[l])&&null!=t.__e){n.__e=n.__c.base=t.__e;break}return S(n)}}function M(n){(!n.__d&&(n.__d=true)&&i$3.push(n)&&!P.__r++||o$1!==l$3.debounceRendering)&&((o$1=l$3.debounceRendering)||r$1)(P);}function P(){var n,t,u,o,r,f,c,s;for(i$3.sort(e$1);n=i$3.shift();)n.__d&&(t=i$3.length,o=void 0,f=(r=(u=n).__v).__e,c=[],s=[],u.__P&&((o=w$1({},r)).__v=r.__v+1,l$3.vnode&&l$3.vnode(o),F(u.__P,o,r,u.__n,u.__P.namespaceURI,32&r.__u?[f]:null,c,null==f?C(r):f,!!(32&r.__u),s),o.__v=r.__v,o.__.__k[o.__i]=o,z(c,o,s),o.__e!=f&&S(o)),i$3.length>t&&i$3.sort(e$1));P.__r=0;}function $(n,l,t,u,i,o,r,e,f,c,s){var a,h,y,d,w,_,g=u&&u.__k||v$1,m=l.length;for(f=I(t,l,g,f),a=0;a<m;a++)null!=(y=t.__k[a])&&(h=-1===y.__i?p:g[y.__i]||p,y.__i=a,_=F(n,y,h,i,o,r,e,f,c,s),d=y.__e,y.ref&&h.ref!=y.ref&&(h.ref&&V(h.ref,null,y),s.push(y.ref,y.__c||d,y)),null==w&&null!=d&&(w=d),4&y.__u||h.__k===y.__k?f=H(y,f,n):"function"==typeof y.type&&void 0!==_?f=_:d&&(f=d.nextSibling),y.__u&=-7);return t.__e=w,f}function I(n,l,t,u){var i,o,r,e,f,c=l.length,s=t.length,a=s,h=0;for(n.__k=[],i=0;i<c;i++)null!=(o=l[i])&&"boolean"!=typeof o&&"function"!=typeof o?(e=i+h,(o=n.__k[i]="string"==typeof o||"number"==typeof o||"bigint"==typeof o||o.constructor==String?m$2(null,o,null,null,null):d$1(o)?m$2(k$1,{children:o},null,null,null):void 0===o.constructor&&o.__b>0?m$2(o.type,o.props,o.key,o.ref?o.ref:null,o.__v):o).__=n,o.__b=n.__b+1,r=null,-1!==(f=o.__i=O(o,t,e,a))&&(a--,(r=t[f])&&(r.__u|=2)),null==r||null===r.__v?(-1==f&&h--,"function"!=typeof o.type&&(o.__u|=4)):f!==e&&(f==e-1?h--:f==e+1?h++:(f>e?h--:h++,o.__u|=4))):o=n.__k[i]=null;if(a)for(i=0;i<s;i++)null!=(r=t[i])&&0==(2&r.__u)&&(r.__e==u&&(u=C(r)),q(r,r));return u}function H(n,l,t){var u,i;if("function"==typeof n.type){for(u=n.__k,i=0;u&&i<u.length;i++)u[i]&&(u[i].__=n,l=H(u[i],l,t));return l}n.__e!=l&&(l&&n.type&&!t.contains(l)&&(l=C(n)),t.insertBefore(n.__e,l||null),l=n.__e);do{l=l&&l.nextSibling;}while(null!=l&&8===l.nodeType);return l}function O(n,l,t,u){var i=n.key,o=n.type,r=t-1,e=t+1,f=l[t];if(null===f||f&&i==f.key&&o===f.type&&0==(2&f.__u))return t;if(("function"!=typeof o||o===k$1||i)&&u>(null!=f&&0==(2&f.__u)?1:0))for(;r>=0||e<l.length;){if(r>=0){if((f=l[r])&&0==(2&f.__u)&&i==f.key&&o===f.type)return r;r--;}if(e<l.length){if((f=l[e])&&0==(2&f.__u)&&i==f.key&&o===f.type)return e;e++;}}return  -1}function T(n,l,t){"-"===l[0]?n.setProperty(l,null==t?"":t):n[l]=null==t?"":"number"!=typeof t||y$3.test(l)?t:t+"px";}function j(n,l,t,u,i){var o,r;n:if("style"===l)if("string"==typeof t)n.style.cssText=t;else {if("string"==typeof u&&(n.style.cssText=u=""),u)for(l in u)t&&l in t||T(n.style,l,"");if(t)for(l in t)u&&t[l]===u[l]||T(n.style,l,t[l]);}else if("o"===l[0]&&"n"===l[1])o=l!==(l=l.replace(f$3,"$1")),l=l.toLowerCase()in n||"onFocusOut"===l||"onFocusIn"===l?l.toLowerCase().slice(2):l.slice(2),n.l||(n.l={}),n.l[l+o]=t,t?u?t.t=u.t:(t.t=c$3,n.addEventListener(l,o?a$2:s$2,o)):n.removeEventListener(l,o?a$2:s$2,o);else {if("http://www.w3.org/2000/svg"==i)l=l.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if("width"!=l&&"height"!=l&&"href"!=l&&"list"!=l&&"form"!=l&&"tabIndex"!=l&&"download"!=l&&"rowSpan"!=l&&"colSpan"!=l&&"role"!=l&&"popover"!=l&&l in n)try{r=n.tagName&&n.tagName.includes("-"),t!==u&&(n[l]=null!=t||r?t:"");break n}catch(n){}"function"==typeof t||(null==t||false===t&&"-"!==l[4]?n.removeAttribute(l):n.setAttribute(l,"popover"==l&&1==t?"":t));}}function A$3(n){return function(t){if(this.l){var u=this.l[t.type+n];if(null==t.u)t.u=c$3++;else if(t.u<u.t)return;return u(l$3.event?l$3.event(t):t)}}}function F(n,t,u,i,o,r,e,f,c,s){var a,h,p,v,y,g,m,b,C,S,M,P,I,H,L,O,T,j=t.type;if(void 0!==t.constructor)return null;128&u.__u&&(c=!!(32&u.__u),r=[f=t.__e=u.__e]),(a=l$3.__b)&&a(t);n:if("function"==typeof j)try{if(b=t.props,C="prototype"in j&&j.prototype.render,S=(a=j.contextType)&&i[a.__c],M=a?S?S.props.value:a.__:i,u.__c?m=(h=t.__c=u.__c).__=h.__E:(C?t.__c=h=new j(b,M):(t.__c=h=new x$1(b,M),h.constructor=j,h.render=B),S&&S.sub(h),h.props=b,h.state||(h.state={}),h.context=M,h.__n=i,p=h.__d=!0,h.__h=[],h._sb=[]),C&&null==h.__s&&(h.__s=h.state),C&&null!=j.getDerivedStateFromProps&&(h.__s==h.state&&(h.__s=w$1({},h.__s)),w$1(h.__s,j.getDerivedStateFromProps(b,h.__s))),v=h.props,y=h.state,h.__v=t,p)C&&null==j.getDerivedStateFromProps&&null!=h.componentWillMount&&h.componentWillMount(),C&&null!=h.componentDidMount&&h.__h.push(h.componentDidMount);else {if(C&&null==j.getDerivedStateFromProps&&b!==v&&null!=h.componentWillReceiveProps&&h.componentWillReceiveProps(b,M),!h.__e&&(null!=h.shouldComponentUpdate&&!1===h.shouldComponentUpdate(b,h.__s,M)||t.__v===u.__v)){for(t.__v!==u.__v&&(h.props=b,h.state=h.__s,h.__d=!1),t.__e=u.__e,t.__k=u.__k,t.__k.some(function(n){n&&(n.__=t);}),P=0;P<h._sb.length;P++)h.__h.push(h._sb[P]);h._sb=[],h.__h.length&&e.push(h);break n}null!=h.componentWillUpdate&&h.componentWillUpdate(b,h.__s,M),C&&null!=h.componentDidUpdate&&h.__h.push(function(){h.componentDidUpdate(v,y,g);});}if(h.context=M,h.props=b,h.__P=n,h.__e=!1,I=l$3.__r,H=0,C){for(h.state=h.__s,h.__d=!1,I&&I(t),a=h.render(h.props,h.state,h.context),L=0;L<h._sb.length;L++)h.__h.push(h._sb[L]);h._sb=[];}else do{h.__d=!1,I&&I(t),a=h.render(h.props,h.state,h.context),h.state=h.__s;}while(h.__d&&++H<25);h.state=h.__s,null!=h.getChildContext&&(i=w$1(w$1({},i),h.getChildContext())),C&&!p&&null!=h.getSnapshotBeforeUpdate&&(g=h.getSnapshotBeforeUpdate(v,y)),f=$(n,d$1(O=null!=a&&a.type===k$1&&null==a.key?a.props.children:a)?O:[O],t,u,i,o,r,e,f,c,s),h.base=t.__e,t.__u&=-161,h.__h.length&&e.push(h),m&&(h.__E=h.__=null);}catch(n){if(t.__v=null,c||null!=r)if(n.then){for(t.__u|=c?160:128;f&&8===f.nodeType&&f.nextSibling;)f=f.nextSibling;r[r.indexOf(f)]=null,t.__e=f;}else for(T=r.length;T--;)_(r[T]);else t.__e=u.__e,t.__k=u.__k;l$3.__e(n,t,u);}else null==r&&t.__v===u.__v?(t.__k=u.__k,t.__e=u.__e):f=t.__e=N$1(u.__e,t,u,i,o,r,e,c,s);return (a=l$3.diffed)&&a(t),128&t.__u?void 0:f}function z(n,t,u){for(var i=0;i<u.length;i++)V(u[i],u[++i],u[++i]);l$3.__c&&l$3.__c(t,n),n.some(function(t){try{n=t.__h,t.__h=[],n.some(function(n){n.call(t);});}catch(n){l$3.__e(n,t.__v);}});}function N$1(t,u,i,o,r,e,f,c,s){var a,h,v,y,w,g,m,b,k=i.props,x=u.props,S=u.type;if("svg"===S?r="http://www.w3.org/2000/svg":"math"===S?r="http://www.w3.org/1998/Math/MathML":r||(r="http://www.w3.org/1999/xhtml"),null!=e)for(a=0;a<e.length;a++)if((w=e[a])&&"setAttribute"in w==!!S&&(S?w.localName===S:3===w.nodeType)){t=w,e[a]=null;break}if(null==t){if(null===S)return document.createTextNode(x);t=document.createElementNS(r,S,x.is&&x),c&&(l$3.__m&&l$3.__m(u,e),c=false),e=null;}if(null===S)k===x||c&&t.data===x||(t.data=x);else {if(e=e&&n$4.call(t.childNodes),k=i.props||p,!c&&null!=e)for(k={},a=0;a<t.attributes.length;a++)k[(w=t.attributes[a]).name]=w.value;for(a in k)if(w=k[a],"children"==a);else if("dangerouslySetInnerHTML"==a)v=w;else if(!(a in x)){if("value"==a&&"defaultValue"in x||"checked"==a&&"defaultChecked"in x)continue;j(t,a,null,w,r);}for(a in x)w=x[a],"children"==a?y=w:"dangerouslySetInnerHTML"==a?h=w:"value"==a?g=w:"checked"==a?m=w:c&&"function"!=typeof w||k[a]===w||((a.startsWith("on")||"ref"===a&&"function"==typeof w)&&(b=o[Object.keys(o)[0]])&&(w=w.bind(b.props.value)),j(t,a,w,k[a],r));if(h)c||v&&(h.__html===v.__html||h.__html===t.innerHTML)||(t.innerHTML=h.__html),u.__k=[];else if(v&&(t.innerHTML=""),$(t,d$1(y)?y:[y],u,i,o,"foreignObject"===S?"http://www.w3.org/1999/xhtml":r,e,f,e?e[0]:i.__k&&C(i,0),c,s),null!=e)for(a=e.length;a--;)_(e[a]);c||(a="value","progress"===S&&null==g?t.removeAttribute("value"):void 0!==g&&(g!==t[a]||"progress"===S&&!g||"option"===S&&g!==k[a])&&j(t,a,g,k[a],r),a="checked",void 0!==m&&m!==t[a]&&j(t,a,m,k[a],r));}return t}function V(n,t,u){try{if("function"==typeof n){var i="function"==typeof n.__u;i&&n.__u(),i&&null==t||(n.__u=n(t));}else n.current=t;}catch(n){l$3.__e(n,u);}}function q(n,t,u){var i,o;if(l$3.unmount&&l$3.unmount(n),(i=n.ref)&&(i.current&&i.current!==n.__e||V(i,null,t)),null!=(i=n.__c)){if(i.componentWillUnmount)try{i.componentWillUnmount();}catch(n){l$3.__e(n,t);}i.base=i.__P=null;}if(i=n.__k)for(o=0;o<i.length;o++)i[o]&&q(i[o],t,u||"function"!=typeof n.type);u||_(n.__e),n.__c=n.__=n.__e=void 0;}function B(n,l,t){return this.constructor(n,t)}function D$1(t,u,i){var o,r,e,f;u===document&&(u=document.documentElement),l$3.__&&l$3.__(t,u),r=(o="function"==typeof i)?null:i&&i.__k||u.__k,e=[],f=[],F(u,t=(!o&&i||u).__k=g$2(k$1,null,[t]),r||p,p,u.namespaceURI,!o&&i?[i]:r?null:u.firstChild?n$4.call(u.childNodes):null,e,!o&&i?i:r?r.__e:u.firstChild,o,f),z(e,t,f);}function E$1(n,l){D$1(n,l,E$1);}function J(n,l){var t={__c:l="__cC"+h++,__:n,Consumer:function(n,l){return n.children(l)},Provider:function(n){var t,u;return this.getChildContext||(t=new Set,(u={})[l]=this,this.getChildContext=function(){return u},this.componentWillUnmount=function(){t=null;},this.shouldComponentUpdate=function(n){this.props.value!==n.value&&t.forEach(function(n){n.__e=true,M(n);});},this.sub=function(n){t.add(n);var l=n.componentWillUnmount;n.componentWillUnmount=function(){t&&t.delete(n),l&&l.call(n);};}),n.children}};return t.Provider.__=t.Consumer.contextType=t}n$4=v$1.slice,l$3={__e:function(n,l,t,u){for(var i,o,r;l=l.__;)if((i=l.__c)&&!i.__)try{if((o=i.constructor)&&null!=o.getDerivedStateFromError&&(i.setState(o.getDerivedStateFromError(n)),r=i.__d),null!=i.componentDidCatch&&(i.componentDidCatch(n,u||{}),r=i.__d),r)return i.__E=i}catch(l){n=l;}throw n}},t$5=0,x$1.prototype.setState=function(n,l){var t;t=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=w$1({},this.state),"function"==typeof n&&(n=n(w$1({},t),this.props)),n&&w$1(t,n),null!=n&&this.__v&&(l&&this._sb.push(l),M(this));},x$1.prototype.forceUpdate=function(n){this.__v&&(this.__e=true,n&&this.__h.push(n),M(this));},x$1.prototype.render=k$1,i$3=[],r$1="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,e$1=function(n,l){return n.__v.__b-l.__v.__b},P.__r=0,f$3=/(PointerCapture)$|Capture$/i,c$3=0,s$2=A$3(false),a$2=A$3(true),h=0;

    var f$2=0;function u$2(e,t,n,o,i,u){t||(t={});var a,c,l=t;"ref"in t&&(a=t.ref,delete t.ref);var p={type:e,props:l,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--f$2,__i:-1,__u:0,__source:i,__self:u};if("function"==typeof e&&(a=e.defaultProps))for(c in a) void 0===l[c]&&(l[c]=a[c]);return l$3.vnode&&l$3.vnode(p),p}

    const l$2=new WeakMap,y$2=(e,r)=>{let t=l$2.get(e);t||(t=J(e),l$2.set(e,t));const m=e.render(),o=u$2(t.Provider,{value:e,children:m});e.__shouldHydrate?(e.shadowRoot?.querySelectorAll("style").forEach(d=>d.remove()),E$1(o,r),e.__shouldHydrate=false):D$1(o,r);};

    const t$4=new WeakMap;let a$1 = class a{static get tasks(){return t$4}static enqueue(s,e){t$4.has(s)||t$4.set(s,[]),t$4.get(s).push(e);}static run(s,e){return t$4.has(s)||t$4.set(s,[]),e().then(()=>{const T=t$4.get(s);if(T.length>0)return a.run(s,T.shift());t$4.delete(s);})}static push(s,e){t$4.get(s)?a.enqueue(s,e):a.run(s,e);}};

    const f$1=e=>{let n=null,a=false,i,o,r;const m=new Promise((t,c)=>{r=u=>{n=n||u;const d=u-n,l=e.duration-d;if(d<=e.duration){const s=1-l/e.duration;e.advance(s),a||(i=requestAnimationFrame(r));}else e.advance(1),t();},o=()=>{a=true,cancelAnimationFrame(i),c(new Error("animation stopped"));};}).catch(t=>t);return a$1.push(e.element,()=>(typeof e.beforeStart=="function"&&e.beforeStart(),requestAnimationFrame(r),new Promise(t=>{m.then(()=>t());}))),{promise:()=>m,stop:()=>o}},v=400;

    const b$1=t=>{let o,a,d,r,s,p,g,y,n,l,h,T;const B=f$1({beforeStart:()=>{t.style.display="block",o=getComputedStyle(t),a=parseFloat(o.paddingTop),d=parseFloat(o.paddingBottom),r=parseFloat(o.marginTop),s=parseFloat(o.marginBottom),p=parseFloat(o.height),g=t.style.overflow,y=t.style.paddingTop,n=t.style.paddingBottom,l=t.style.marginTop,h=t.style.marginBottom,T=t.style.height,t.style.overflow="hidden",t.style.paddingTop="0",t.style.paddingBottom="0",t.style.marginTop="0",t.style.marginBottom="0",t.style.height="0";},duration:v,element:t,advance:i=>{t.style.display="block",t.style.paddingTop=`${a*i}px`,t.style.paddingBottom=`${d*i}px`,t.style.marginTop=`${r*i}px`,t.style.marginBottom=`${s*i}px`,t.style.height=`${p*i}px`;}});return B.promise().then(()=>{t.style.overflow=g,t.style.paddingTop=y,t.style.paddingBottom=n,t.style.marginTop=l,t.style.marginBottom=h,t.style.height=T;}),B};

    const u$1=o=>{let i,a,r,d,n,s,p,g,e,l,y,m;const h=f$1({beforeStart:()=>{const t=o;i=getComputedStyle(t),a=parseFloat(i.paddingTop),r=parseFloat(i.paddingBottom),d=parseFloat(i.marginTop),n=parseFloat(i.marginBottom),s=parseFloat(i.height),p=t.style.overflow,g=t.style.paddingTop,e=t.style.paddingBottom,l=t.style.marginTop,y=t.style.marginBottom,m=t.style.height,t.style.overflow="hidden";},duration:v,element:o,advance:t=>{o.style.paddingTop=`${a-a*t}px`,o.style.paddingBottom=`${r-r*t}px`,o.style.marginTop=`${d-d*t}px`,o.style.marginBottom=`${n-n*t}px`,o.style.height=`${s-s*t}px`;}});return h.promise().then(t=>{t instanceof Error||(o.style.overflow=p,o.style.paddingTop=g,o.style.paddingBottom=e,o.style.marginTop=l,o.style.marginBottom=y,o.style.height=m,o.style.display="none");}),h};

    const y$1={TAB:9,ENTER:13,SHIFT:16,ESCAPE:27,SPACE:32},b=o=>(o.key?o.key==="Enter":o.keyCode===y$1.ENTER)&&!a(o),A$2=o=>(o.key?o.key==="Spacebar"||o.key===" ":o.keyCode===y$1.SPACE)&&!a(o),m$1=o=>(o.key?o.key==="Escape"||o.key==="Esc":o.keyCode===y$1.ESCAPE)&&!a(o),x=o=>(o.key?o.key==="Tab":o.keyCode===y$1.TAB)&&!a(o),Ko=o=>o.key==="Shift"||o.keyCode===y$1.SHIFT,a=o=>o.shiftKey||o.altKey||k(o),k=o=>!!(o.metaKey||o.ctrlKey);

    let n$3;i$e(()=>{n$3=void 0;});const d=()=>(n$3===void 0&&(n$3=C$3()),n$3);

    const i$2=t=>(e,n)=>{e.metadata.i18n||(e.metadata.i18n={}),Object.defineProperty(e,n,{get(){return e.i18nBundles[t]},set(){}}),e.metadata.i18n[n]={bundleName:t,target:e};};

    function o(t){let r="";for(const n in t)t[n]&&(r&&(r+=" "),r+=n);return r}

    function g$1(e,t,o){const n=e.getMetadata().getEvents();Object.keys(t).forEach(s=>{if(s.startsWith("on")){const a=s.slice(2),c=p$2(a),l=a.charAt(0).toLowerCase()+a.slice(1);let i;c in n?i=c:l in n&&(i=l),i&&s!=="onClick"&&(t[`onui5-${i}`]=t[s],delete t[s]);}});}function isUI5ElementClass(e){return typeof e=="function"&&"getMetadata"in e}function preprocess(e,t,o$1){let n;return isUI5ElementClass(e)?(n=e.getMetadata().getTag(),g$1(e,t)):n=e,typeof t.class=="object"&&(t.class=o(t.class)),n}

    // eslint-disable-next-line import/extensions
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const old = l$3.vnode;
    l$3.vnode = vnode => {
        const props = vnode.props;
        if (props !== null && typeof props === "object") {
            if (props.class && typeof props.class === "object") ;
        }
        old && old(vnode);
    };
    function Fragment(props, context) {
        return k$1(props);
    }
    function jsx(type, props, key) {
        const tag = preprocess(type, props);
        return u$2(tag, props, key);
    }
    function jsxs(type, props, key) {
        const tag = preprocess(type, props);
        return u$2(tag, props, key);
    }

    const A$1=e=>{const t=e;return t.accessibleNameRef?E(e):t.accessibleName?t.accessibleName:void 0},E=e=>{const t=e.accessibleNameRef?.split(" ")??[];let s="";return t.forEach((n,c)=>{const l=m(e,n),a=`${l&&l.textContent?l.textContent:""}`;a&&(s+=a,c<t.length-1&&(s+=" "));}),s},m=(e,t)=>e.getRootNode().querySelector(`[id='${t}']`)||document.getElementById(t);

    var t$3=(s=>(s["SAP-icons"]="SAP-icons-v4",s.horizon="SAP-icons-v5",s["SAP-icons-TNT"]="tnt",s.BusinessSuiteInAppSymbols="business-suite",s))(t$3||{});const n$2=e=>t$3[e]?t$3[e]:e;

    var t$2=(o=>(o.SAPIconsV4="SAP-icons-v4",o.SAPIconsV5="SAP-icons-v5",o.SAPIconsTNTV2="tnt-v2",o.SAPIconsTNTV3="tnt-v3",o.SAPBSIconsV1="business-suite-v1",o.SAPBSIconsV2="business-suite-v2",o))(t$2||{});const s$1=new Map;s$1.set("SAP-icons",{legacy:"SAP-icons-v4",sap_horizon:"SAP-icons-v5"}),s$1.set("tnt",{legacy:"tnt-v2",sap_horizon:"tnt-v3"}),s$1.set("business-suite",{legacy:"business-suite-v1",sap_horizon:"business-suite-v2"});const c$2=(n,e)=>{if(s$1.has(n)){s$1.set(n,{...e,...s$1.get(n)});return}s$1.set(n,e);},r=n=>{const e=n$g()?"legacy":"sap_horizon";return s$1.has(n)?s$1.get(n)[e]:n};

    const t$1=new Map,c$1=n=>t$1.get(n);

    const i$1=o=>{const t=c$1(r$c());return !o&&t?n$2(t):o?r(o):r("SAP-icons")};

    const w="legacy",s=new Map,c=m$d("SVGIcons.registry",new Map),i=m$d("SVGIcons.promises",new Map),l$1="ICON_NOT_FOUND",N=async e=>{if(!i.has(e)){if(!s.has(e))throw new Error(`No loader registered for the ${e} icons collection. Probably you forgot to import the "AllIcons.js" module for the respective package.`);const t=s.get(e);i.set(e,t(e));}return i.get(e)},f=e=>{Object.keys(e.data).forEach(t=>{const a=e.data[t];y(t,{pathData:a.path||a.paths,ltr:a.ltr,accData:a.acc,collection:e.collection,packageName:e.packageName});});},y=(e,t)=>{const a=`${t.collection}/${e}`,o={collection:t.collection,packageName:t.packageName,pathData:t.pathData,viewBox:t.viewBox,ltr:t.ltr,accData:t.accData,customTemplate:t.customTemplate};c.set(a,o);},u=e=>{e.startsWith("sap-icon://")&&(e=e.replace("sap-icon://",""));let t;return [e,t]=e.split("/").reverse(),e=e.replace("icon-",""),t&&(t=n$2(t)),{name:e,collection:t}},D=e=>{const{name:t,collection:a}=u(e);return g(a,t)},n$1=async e=>{const{name:t,collection:a}=u(e);let o=l$1;try{o=await N(i$1(a));}catch(r){console.error(r.message);}if(o===l$1)return o;const p=g(a,t);return p||(Array.isArray(o)?o.forEach(r=>{f(r),c$2(a,{[r.themeFamily||w]:r.collection});}):f(o),g(a,t))},g=(e,t)=>{const a=`${i$1(e)}/${t}`;return c.get(a)},A=async e=>{if(!e)return;let t=D(e);if(t||(t=await n$1(e)),t&&t!==l$1&&t.accData)return t.packageName?(await f$5(t.packageName)).getText(t.accData):t.accData?.defaultText||""};

    const t=r=>Array.from(r).filter(e=>e.nodeType!==Node.COMMENT_NODE&&(e.nodeType!==Node.TEXT_NODE||(e.nodeValue||"").trim().length!==0)).length>0;

    let e;const l=()=>(e===void 0&&(e=b$6()),e);

    function n(e){return e.toLowerCase()}

    /**
     * Different Button designs.
     * @public
     */
    var ButtonDesign;
    (function (ButtonDesign) {
        /**
         * default type (no special styling)
         * @public
         */
        ButtonDesign["Default"] = "Default";
        /**
         * accept type (green button)
         * @public
         */
        ButtonDesign["Positive"] = "Positive";
        /**
         * reject style (red button)
         * @public
         */
        ButtonDesign["Negative"] = "Negative";
        /**
         * transparent type
         * @public
         */
        ButtonDesign["Transparent"] = "Transparent";
        /**
         * emphasized type
         * @public
         */
        ButtonDesign["Emphasized"] = "Emphasized";
        /**
         * attention type
         * @public
         */
        ButtonDesign["Attention"] = "Attention";
    })(ButtonDesign || (ButtonDesign = {}));
    var ButtonDesign$1 = ButtonDesign;

    /**
     * Determines if the button has special form-related functionality.
     * @public
     */
    var ButtonType;
    (function (ButtonType) {
        /**
         * The button does not do anything special when inside a form
         * @public
         */
        ButtonType["Button"] = "Button";
        /**
         * The button acts as a submit button (submits a form)
         * @public
         */
        ButtonType["Submit"] = "Submit";
        /**
         * The button acts as a reset button (resets a form)
         * @public
         */
        ButtonType["Reset"] = "Reset";
    })(ButtonType || (ButtonType = {}));
    var ButtonType$1 = ButtonType;

    /**
     * Determines where the badge will be placed and how it will be styled.
     * @since 2.7.0
     * @public
     */
    var ButtonBadgeDesign;
    (function (ButtonBadgeDesign) {
        /**
         * The badge is displayed after the text, inside the button.
         * @public
         */
        ButtonBadgeDesign["InlineText"] = "InlineText";
        /**
         * The badge is displayed at the top-end corner of the button.
         *
         * **Note:** According to design guidance, the OverlayText design mode is best used in cozy density to avoid potential visual issues in compact.
         * @public
         */
        ButtonBadgeDesign["OverlayText"] = "OverlayText";
        /**
         * The badge is displayed as an attention dot.
         * @public
         */
        ButtonBadgeDesign["AttentionDot"] = "AttentionDot";
    })(ButtonBadgeDesign || (ButtonBadgeDesign = {}));
    var ButtonBadgeDesign$1 = ButtonBadgeDesign;

    /**
     * Button accessible roles.
     *
     * @public
     * @since 1.23
     */
    var ButtonAccessibleRole;
    (function (ButtonAccessibleRole) {
        /**
         * Represents Default (button) ARIA role.
         * @public
         */
        ButtonAccessibleRole["Button"] = "Button";
        /**
         * Represents the ARIA role "link".
         * @public
         */
        ButtonAccessibleRole["Link"] = "Link";
    })(ButtonAccessibleRole || (ButtonAccessibleRole = {}));
    var ButtonAccessibleRole$1 = ButtonAccessibleRole;

    function IconTemplate() {
        return (jsxs("svg", { class: "ui5-icon-root", part: "root", tabindex: this._tabIndex, dir: this._dir, viewBox: this.viewBox, role: this.effectiveAccessibleRole, focusable: "false", preserveAspectRatio: "xMidYMid meet", "aria-label": this.effectiveAccessibleName, "aria-hidden": this.effectiveAriaHidden, xmlns: "http://www.w3.org/2000/svg", onKeyDown: this._onkeydown, onKeyUp: this._onkeyup, children: [this.hasIconTooltip &&
                    jsxs("title", { id: `${this._id}-tooltip`, children: [" ", this.effectiveAccessibleName, " "] }), jsx("g", { role: "presentation", children: content.call(this) })] }));
    }
    function content() {
        if (this.customTemplate) {
            return this.customTemplate;
        }
        if (this.customTemplateAsString) {
            return jsx("g", { dangerouslySetInnerHTML: { __html: this.customTemplateAsString } });
        }
        return this.pathData.map(path => (jsx("path", { d: path })));
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

    var defaultThemeBase = `:root {--sapThemeMetaData-Base-baseLib:{"Path": "Base.baseLib.sap_horizon.css_variables","PathPattern": "/%frameworkId%/%libId%/%themeId%/%fileId%.css","Extends": ["baseTheme"],"Tags": ["Fiori_3","LightColorScheme"],"FallbackThemeId": "sap_fiori_3","Engine":{"Name": "theming-engine","Version": "15.0.8"},"Version":{"Build": "11.29.3.20250417070835","Source": "11.29.3"}};--sapBrandColor: #0070f2;--sapHighlightColor: #0064d9;--sapBaseColor: #fff;--sapShellColor: #fff;--sapBackgroundColor: #f5f6f7;--sapFontFamily: "72", "72full", Arial, Helvetica, sans-serif;--sapFontSize: .875rem;--sapTextColor: #131e29;--sapLinkColor: #0064d9;--sapCompanyLogo: none;--sapFavicon: none;--sapBackgroundImage: none;--sapBackgroundImageOpacity: 1;--sapBackgroundImageRepeat: false;--sapSelectedColor: #0064d9;--sapHoverColor: #eaecee;--sapActiveColor: #dee2e5;--sapHighlightTextColor: #fff;--sapTitleColor: #131e29;--sapNegativeColor: #aa0808;--sapCriticalColor: #e76500;--sapPositiveColor: #256f3a;--sapInformativeColor: #0070f2;--sapNeutralColor: #788fa6;--sapNegativeElementColor: #f53232;--sapCriticalElementColor: #e76500;--sapPositiveElementColor: #30914c;--sapInformativeElementColor: #0070f2;--sapNeutralElementColor: #788fa6;--sapNegativeTextColor: #aa0808;--sapCriticalTextColor: #b44f00;--sapPositiveTextColor: #256f3a;--sapInformativeTextColor: #0064d9;--sapNeutralTextColor: #131e29;--sapErrorColor: #aa0808;--sapWarningColor: #e76500;--sapSuccessColor: #256f3a;--sapInformationColor: #0070f2;--sapErrorBackground: #ffeaf4;--sapWarningBackground: #fff8d6;--sapSuccessBackground: #f5fae5;--sapInformationBackground: #e1f4ff;--sapNeutralBackground: #eff1f2;--sapErrorBorderColor: #e90b0b;--sapWarningBorderColor: #dd6100;--sapSuccessBorderColor: #30914c;--sapInformationBorderColor: #0070f2;--sapNeutralBorderColor: #788fa6;--sapElement_LineHeight: 2.75rem;--sapElement_Height: 2.25rem;--sapElement_BorderWidth: .0625rem;--sapElement_BorderCornerRadius: .75rem;--sapElement_Compact_LineHeight: 2rem;--sapElement_Compact_Height: 1.625rem;--sapElement_Condensed_LineHeight: 1.5rem;--sapElement_Condensed_Height: 1.375rem;--sapContent_LineHeight: 1.5;--sapContent_IconHeight: 1rem;--sapContent_IconColor: #131e29;--sapContent_ContrastIconColor: #fff;--sapContent_NonInteractiveIconColor: #758ca4;--sapContent_MarkerIconColor: #5d36ff;--sapContent_MarkerTextColor: #046c7a;--sapContent_MeasureIndicatorColor: #556b81;--sapContent_Selected_MeasureIndicatorColor: #0064d9;--sapContent_Placeholderloading_Background: #ccc;--sapContent_Placeholderloading_Gradient: linear-gradient(to right, #ccc 0%, #ccc 20%, #999 50%, #ccc 80%, #ccc 100%);--sapContent_ImagePlaceholderBackground: #eaecee;--sapContent_ImagePlaceholderForegroundColor: #5b738b;--sapContent_RatedColor: #d27700;--sapContent_UnratedColor: #758ca4;--sapContent_BusyColor: #0064d9;--sapContent_FocusColor: #0032a5;--sapContent_FocusStyle: solid;--sapContent_FocusWidth: .125rem;--sapContent_ContrastFocusColor: #fff;--sapContent_ShadowColor: #223548;--sapContent_ContrastShadowColor: #fff;--sapContent_Shadow0: 0 0 .125rem 0 rgba(34,53,72,.2), 0 .125rem .25rem 0 rgba(34,53,72,.2);--sapContent_Shadow1: 0 0 0 .0625rem rgba(34,53,72,.48), 0 .125rem .5rem 0 rgba(34,53,72,.3);--sapContent_Shadow2: 0 0 0 .0625rem rgba(34,53,72,.48), 0 .625rem 1.875rem 0 rgba(34,53,72,.25);--sapContent_Shadow3: 0 0 0 .0625rem rgba(34,53,72,.48), 0 1.25rem 5rem 0 rgba(34,53,72,.25);--sapContent_TextShadow: 0 0 .125rem #fff;--sapContent_ContrastTextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapContent_HeaderShadow: 0 .125rem .125rem 0 rgba(34,53,72,.05), inset 0 -.0625rem 0 0 #d9d9d9;--sapContent_Interaction_Shadow: inset 0 0 0 .0625rem rgba(85,107,129,.25);--sapContent_Selected_Shadow: inset 0 0 0 .0625rem rgba(79,160,255,.5);--sapContent_Negative_Shadow: inset 0 0 0 .0625rem rgba(255,142,196,.45);--sapContent_Critical_Shadow: inset 0 0 0 .0625rem rgba(255,213,10,.4);--sapContent_Positive_Shadow: inset 0 0 0 .0625rem rgba(48,145,76,.18);--sapContent_Informative_Shadow: inset 0 0 0 .0625rem rgba(104,174,255,.5);--sapContent_Neutral_Shadow: inset 0 0 0 .0625rem rgba(120,143,166,.3);--sapContent_SearchHighlightColor: #dafdf5;--sapContent_HelpColor: #188918;--sapContent_LabelColor: #556b82;--sapContent_MonospaceFontFamily: "72Mono", "72Monofull", lucida console, monospace;--sapContent_MonospaceBoldFontFamily: "72Mono-Bold", "72Mono-Boldfull", lucida console, monospace;--sapContent_IconFontFamily: "SAP-icons";--sapContent_DisabledTextColor: rgba(19,30,41,.6);--sapContent_DisabledOpacity: .4;--sapContent_ContrastTextThreshold: .65;--sapContent_ContrastTextColor: #fff;--sapContent_ForegroundColor: #efefef;--sapContent_ForegroundBorderColor: #758ca4;--sapContent_ForegroundTextColor: #131e29;--sapContent_BadgeBackground: #aa0808;--sapContent_BadgeTextColor: #fff;--sapContent_BadgeBorderColor: #fff;--sapContent_DragAndDropActiveColor: #0064d9;--sapContent_Selected_TextColor: #0064d9;--sapContent_Selected_Background: #fff;--sapContent_Selected_Hover_Background: #e3f0ff;--sapContent_Selected_ForegroundColor: #0064d9;--sapContent_ForcedColorAdjust: none;--sapContent_Lite_Shadow: None;--sapContent_Illustrative_Color1: #9b015d;--sapContent_Illustrative_Color2: #56bdff;--sapContent_Illustrative_Color3: #ff7f4c;--sapContent_Illustrative_Color4: #00144a;--sapContent_Illustrative_Color5: #a9b4be;--sapContent_Illustrative_Color6: #d5dadd;--sapContent_Illustrative_Color7: #dbf1ff;--sapContent_Illustrative_Color8: #fff;--sapContent_Illustrative_Color9: #0899a7;--sapContent_Illustrative_Color10: #dbf1ff;--sapContent_Illustrative_Color11: #df1278;--sapContent_Illustrative_Color12: #00a800;--sapContent_Illustrative_Color13: #0070f2;--sapContent_Illustrative_Color14: #0040b0;--sapContent_Illustrative_Color15: #c35500;--sapContent_Illustrative_Color16: #8d2a00;--sapContent_Illustrative_Color17: #046c7c;--sapContent_Illustrative_Color18: #bce5ff;--sapContent_Illustrative_Color19: #a3dbff;--sapContent_Illustrative_Color20: #89d1ff;--sapContent_Illustrative_Color21: #1b90ff;--sapContent_Illustrative_Color22: #00144a;--sapContent_Illustrative_Color23: #d20a0a;--sapContent_Illustrative_Color24: #ffb2d2;--sapContent_Illustrative_Color25: #ffeaf4;--sapContent_Illustrative_Color26: #ffdf72;--sapContent_Illustrative_Color27: #fff8d6;--sapContent_Illustrative_Color28: #a93e00;--sapContent_Illustrative_Color29: #450b00;--sapContent_Illustrative_Color30: #340800;--sapContent_Illustrative_Color31: #ffab92;--sapContent_Space_S: 1rem;--sapContent_Space_M: 2rem;--sapContent_Space_L: 2rem;--sapContent_Space_XL: 3rem;--sapContent_Space_Tiny: .5rem;--sapContent_Space_Small: 1rem;--sapContent_Space_Medium: 2rem;--sapContent_Space_Large: 3rem;--sapContent_Margin_Tiny: 0 0 1rem;--sapContent_Margin_Small: 1rem;--sapContent_Margin_Medium: 1rem 2rem;--sapContent_Margin_Large: 1rem;--sapContent_Padding_S: 0rem;--sapContent_Padding_M: 2rem;--sapContent_Padding_L: 2rem;--sapContent_Padding_XL: 3rem;--sapContent_Gap: 1rem;--sapContent_Success_HeaderShadow: 0 .125rem .125rem 0 rgba(34,53,72,.05), inset 0 -.0625rem 0 0 #30914c;--sapContent_Warning_HeaderShadow: 0 .125rem .125rem 0 rgba(34,53,72,.05), inset 0 -.0625rem 0 0 #dd6100;--sapContent_Error_HeaderShadow: 0 .125rem .125rem 0 rgba(34,53,72,.05), inset 0 -.0625rem 0 0 #e90b0b;--sapContent_Information_HeaderShadow: 0 .125rem .125rem 0 rgba(34,53,72,.05), inset 0 -.0625rem 0 0 #0070f2;--sapFontLightFamily: "72-Light", "72-Lightfull", "72", "72full", Arial, Helvetica, sans-serif;--sapFontBoldFamily: "72-Bold", "72-Boldfull", "72", "72full", Arial, Helvetica, sans-serif;--sapFontSemiboldFamily: "72-Semibold", "72-Semiboldfull", "72", "72full", Arial, Helvetica, sans-serif;--sapFontSemiboldDuplexFamily: "72-SemiboldDuplex", "72-SemiboldDuplexfull", "72", "72full", Arial, Helvetica, sans-serif;--sapFontBlackFamily: "72Black", "72Blackfull","72", "72full", Arial, Helvetica, sans-serif;--sapFontHeaderFamily: "72-Bold", "72-Boldfull", "72", "72full", Arial, Helvetica, sans-serif;--sapFontSmallSize: .75rem;--sapFontLargeSize: 1rem;--sapFontHeader1Size: 3rem;--sapFontHeader2Size: 2rem;--sapFontHeader3Size: 1.5rem;--sapFontHeader4Size: 1.25rem;--sapFontHeader5Size: 1rem;--sapFontHeader6Size: .875rem;--sapLink_TextDecoration: none;--sapLink_Hover_Color: #0064d9;--sapLink_Hover_TextDecoration: underline;--sapLink_Active_Color: #0064d9;--sapLink_Active_TextDecoration: none;--sapLink_Visited_Color: #0064d9;--sapLink_InvertedColor: #a6cfff;--sapLink_SubtleColor: #131e29;--sapShell_Background: #eff1f2;--sapShell_BackgroundImage: linear-gradient(to bottom, #eff1f2, #eff1f2);--sapShell_BackgroundImageOpacity: 1;--sapShell_BackgroundImageRepeat: false;--sapShell_BorderColor: #fff;--sapShell_TextColor: #131e29;--sapShell_InteractiveBackground: #eff1f2;--sapShell_InteractiveTextColor: #131e29;--sapShell_InteractiveBorderColor: #556b81;--sapShell_GroupTitleTextColor: #131e29;--sapShell_GroupTitleTextShadow: 0 0 .125rem #fff;--sapShell_Hover_Background: #fff;--sapShell_Active_Background: #fff;--sapShell_Active_TextColor: #0070f2;--sapShell_Selected_Background: #fff;--sapShell_Selected_TextColor: #0070f2;--sapShell_Selected_Hover_Background: #fff;--sapShell_Favicon: none;--sapShell_Navigation_Background: #fff;--sapShell_Navigation_Hover_Background: #fff;--sapShell_Navigation_SelectedColor: #0064d9;--sapShell_Navigation_Selected_TextColor: #0064d9;--sapShell_Navigation_TextColor: #131e29;--sapShell_Navigation_Active_TextColor: #0064d9;--sapShell_Navigation_Active_Background: #fff;--sapShell_Shadow: 0 .125rem .125rem 0 rgba(34,53,72,.15), inset 0 -.0625rem 0 0 rgba(34,53,72,.2);--sapShell_NegativeColor: #aa0808;--sapShell_CriticalColor: #b44f00;--sapShell_PositiveColor: #256f3a;--sapShell_InformativeColor: #0064d9;--sapShell_NeutralColor: #131e29;--sapShell_Assistant_ForegroundColor: #5d36ff;--sapShell_SubBrand_TextColor: #003e87;--sapShell_Category_1_Background: #0057d2;--sapShell_Category_1_BorderColor: #0057d2;--sapShell_Category_1_TextColor: #fff;--sapShell_Category_1_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_2_Background: #df1278;--sapShell_Category_2_BorderColor: #df1278;--sapShell_Category_2_TextColor: #fff;--sapShell_Category_2_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_3_Background: #e76500;--sapShell_Category_3_BorderColor: #e76500;--sapShell_Category_3_TextColor: #fff;--sapShell_Category_3_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_4_Background: #7800a4;--sapShell_Category_4_BorderColor: #7800a4;--sapShell_Category_4_TextColor: #fff;--sapShell_Category_4_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_5_Background: #aa2608;--sapShell_Category_5_BorderColor: #aa2608;--sapShell_Category_5_TextColor: #fff;--sapShell_Category_5_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_6_Background: #07838f;--sapShell_Category_6_BorderColor: #07838f;--sapShell_Category_6_TextColor: #fff;--sapShell_Category_6_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_7_Background: #f31ded;--sapShell_Category_7_BorderColor: #f31ded;--sapShell_Category_7_TextColor: #fff;--sapShell_Category_7_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_8_Background: #188918;--sapShell_Category_8_BorderColor: #188918;--sapShell_Category_8_TextColor: #fff;--sapShell_Category_8_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_9_Background: #002a86;--sapShell_Category_9_BorderColor: #002a86;--sapShell_Category_9_TextColor: #fff;--sapShell_Category_9_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_10_Background: #5b738b;--sapShell_Category_10_BorderColor: #5b738b;--sapShell_Category_10_TextColor: #fff;--sapShell_Category_10_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_11_Background: #d20a0a;--sapShell_Category_11_BorderColor: #d20a0a;--sapShell_Category_11_TextColor: #fff;--sapShell_Category_11_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_12_Background: #7858ff;--sapShell_Category_12_BorderColor: #7858ff;--sapShell_Category_12_TextColor: #fff;--sapShell_Category_12_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_13_Background: #a00875;--sapShell_Category_13_BorderColor: #a00875;--sapShell_Category_13_TextColor: #fff;--sapShell_Category_13_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_14_Background: #14565b;--sapShell_Category_14_BorderColor: #14565b;--sapShell_Category_14_TextColor: #fff;--sapShell_Category_14_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_15_Background: #223548;--sapShell_Category_15_BorderColor: #223548;--sapShell_Category_15_TextColor: #fff;--sapShell_Category_15_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Category_16_Background: #1e592f;--sapShell_Category_16_BorderColor: #1e592f;--sapShell_Category_16_TextColor: #fff;--sapShell_Category_16_TextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapShell_Space_S: .5rem;--sapShell_Space_M: 2rem;--sapShell_Space_L: 2rem;--sapShell_Space_XL: 3rem;--sapShell_Gap_S: .5rem;--sapShell_Gap_M: 1rem;--sapShell_Gap_L: 1rem;--sapShell_Gap_XL: 1rem;--sapShell_GroupGap_S: 2rem;--sapShell_GroupGap_M: 3rem;--sapShell_GroupGap_L: 3rem;--sapShell_GroupGap_XL: 3rem;--sapAssistant_Color1: #5d36ff;--sapAssistant_Color2: #a100c2;--sapAssistant_BackgroundGradient: linear-gradient(#5d36ff, #a100c2);--sapAssistant_Background: #5d36ff;--sapAssistant_BorderColor: #5d36ff;--sapAssistant_TextColor: #fff;--sapAssistant_Hover_Background: #2800cf;--sapAssistant_Hover_BorderColor: #2800cf;--sapAssistant_Hover_TextColor: #fff;--sapAssistant_Active_Background: #fff;--sapAssistant_Active_BorderColor: #5d36ff;--sapAssistant_Active_TextColor: #5d36ff;--sapAssistant_Question_Background: #eae5ff;--sapAssistant_Question_BorderColor: #eae5ff;--sapAssistant_Question_TextColor: #131e29;--sapAssistant_Answer_Background: #eff1f2;--sapAssistant_Answer_BorderColor: #eff1f2;--sapAssistant_Answer_TextColor: #131e29;--sapAvatar_1_Background: #fff3b8;--sapAvatar_1_BorderColor: #fff3b8;--sapAvatar_1_TextColor: #a45d00;--sapAvatar_1_Hover_Background: #fff3b8;--sapAvatar_2_Background: #ffd0e7;--sapAvatar_2_BorderColor: #ffd0e7;--sapAvatar_2_TextColor: #aa0808;--sapAvatar_2_Hover_Background: #ffd0e7;--sapAvatar_3_Background: #ffdbe7;--sapAvatar_3_BorderColor: #ffdbe7;--sapAvatar_3_TextColor: #ba066c;--sapAvatar_3_Hover_Background: #ffdbe7;--sapAvatar_4_Background: #ffdcf3;--sapAvatar_4_BorderColor: #ffdcf3;--sapAvatar_4_TextColor: #a100c2;--sapAvatar_4_Hover_Background: #ffdcf3;--sapAvatar_5_Background: #ded3ff;--sapAvatar_5_BorderColor: #ded3ff;--sapAvatar_5_TextColor: #552cff;--sapAvatar_5_Hover_Background: #ded3ff;--sapAvatar_6_Background: #d1efff;--sapAvatar_6_BorderColor: #d1efff;--sapAvatar_6_TextColor: #0057d2;--sapAvatar_6_Hover_Background: #d1efff;--sapAvatar_7_Background: #c2fcee;--sapAvatar_7_BorderColor: #c2fcee;--sapAvatar_7_TextColor: #046c7a;--sapAvatar_7_Hover_Background: #c2fcee;--sapAvatar_8_Background: #ebf5cb;--sapAvatar_8_BorderColor: #ebf5cb;--sapAvatar_8_TextColor: #256f3a;--sapAvatar_8_Hover_Background: #ebf5cb;--sapAvatar_9_Background: #ddccf0;--sapAvatar_9_BorderColor: #ddccf0;--sapAvatar_9_TextColor: #6c32a9;--sapAvatar_9_Hover_Background: #ddccf0;--sapAvatar_10_Background: #eaecee;--sapAvatar_10_BorderColor: #eaecee;--sapAvatar_10_TextColor: #556b82;--sapAvatar_10_Hover_Background: #eaecee;--sapAvatar_Lite_BorderColor: transparent;--sapAvatar_Lite_Background: transparent;--sapAvatar_Hover_BorderColor: rgba(85,107,129,.25);--sapButton_Background: #fff;--sapButton_BorderColor: #bcc3ca;--sapButton_BorderWidth: .0625rem;--sapButton_BorderCornerRadius: .5rem;--sapButton_TextColor: #0064d9;--sapButton_FontFamily: "72-SemiboldDuplex", "72-SemiboldDuplexfull", "72", "72full", Arial, Helvetica, sans-serif;--sapButton_Hover_Background: #eaecee;--sapButton_Hover_BorderColor: #bcc3ca;--sapButton_Hover_TextColor: #0064d9;--sapButton_IconColor: #0064d9;--sapButton_Active_Background: #fff;--sapButton_Active_BorderColor: #0064d9;--sapButton_Active_TextColor: #0064d9;--sapButton_Emphasized_Background: #0070f2;--sapButton_Emphasized_BorderColor: #0070f2;--sapButton_Emphasized_BorderWidth: .0625rem;--sapButton_Emphasized_TextColor: #fff;--sapButton_Emphasized_FontFamily: "72-Bold", "72-Boldfull", "72", "72full", Arial, Helvetica, sans-serif;--sapButton_Emphasized_Hover_Background: #0064d9;--sapButton_Emphasized_Hover_BorderColor: #0064d9;--sapButton_Emphasized_Hover_TextColor: #fff;--sapButton_Emphasized_Active_Background: #fff;--sapButton_Emphasized_Active_BorderColor: #0064d9;--sapButton_Emphasized_Active_TextColor: #0064d9;--sapButton_Emphasized_TextShadow: transparent;--sapButton_Emphasized_FontWeight: bold;--sapButton_Reject_Background: #ffd6e9;--sapButton_Reject_BorderColor: #ffc2de;--sapButton_Reject_TextColor: #aa0808;--sapButton_Reject_Hover_Background: #ffbddb;--sapButton_Reject_Hover_BorderColor: #ffbddb;--sapButton_Reject_Hover_TextColor: #aa0808;--sapButton_Reject_Active_Background: #fff;--sapButton_Reject_Active_BorderColor: #e90b0b;--sapButton_Reject_Active_TextColor: #aa0808;--sapButton_Reject_Selected_Background: #fff;--sapButton_Reject_Selected_BorderColor: #e90b0b;--sapButton_Reject_Selected_TextColor: #aa0808;--sapButton_Reject_Selected_Hover_Background: #ffbddb;--sapButton_Reject_Selected_Hover_BorderColor: #e90b0b;--sapButton_Accept_Background: #ebf5cb;--sapButton_Accept_BorderColor: #dbeda0;--sapButton_Accept_TextColor: #256f3a;--sapButton_Accept_Hover_Background: #e3f1b6;--sapButton_Accept_Hover_BorderColor: #e3f1b6;--sapButton_Accept_Hover_TextColor: #256f3a;--sapButton_Accept_Active_Background: #fff;--sapButton_Accept_Active_BorderColor: #30914c;--sapButton_Accept_Active_TextColor: #256f3a;--sapButton_Accept_Selected_Background: #fff;--sapButton_Accept_Selected_BorderColor: #30914c;--sapButton_Accept_Selected_TextColor: #256f3a;--sapButton_Accept_Selected_Hover_Background: #e3f1b6;--sapButton_Accept_Selected_Hover_BorderColor: #30914c;--sapButton_Lite_Background: transparent;--sapButton_Lite_BorderColor: transparent;--sapButton_Lite_TextColor: #0064d9;--sapButton_Lite_Hover_Background: #eaecee;--sapButton_Lite_Hover_BorderColor: #bcc3ca;--sapButton_Lite_Hover_TextColor: #0064d9;--sapButton_Lite_Active_Background: #fff;--sapButton_Lite_Active_BorderColor: #0064d9;--sapButton_Selected_Background: #edf6ff;--sapButton_Selected_BorderColor: #0064d9;--sapButton_Selected_TextColor: #0064d9;--sapButton_Selected_Hover_Background: #d9ecff;--sapButton_Selected_Hover_BorderColor: #0064d9;--sapButton_Attention_Background: #fff3b7;--sapButton_Attention_BorderColor: #ffeb84;--sapButton_Attention_TextColor: #b44f00;--sapButton_Attention_Hover_Background: #ffef9e;--sapButton_Attention_Hover_BorderColor: #ffef9e;--sapButton_Attention_Hover_TextColor: #b44f00;--sapButton_Attention_Active_Background: #fff;--sapButton_Attention_Active_BorderColor: #dd6100;--sapButton_Attention_Active_TextColor: #b44f00;--sapButton_Attention_Selected_Background: #fff;--sapButton_Attention_Selected_BorderColor: #dd6100;--sapButton_Attention_Selected_TextColor: #b44f00;--sapButton_Attention_Selected_Hover_Background: #ffef9e;--sapButton_Attention_Selected_Hover_BorderColor: #dd6100;--sapButton_Negative_Background: #f53232;--sapButton_Negative_BorderColor: #f53232;--sapButton_Negative_TextColor: #fff;--sapButton_Negative_Hover_Background: #e90b0b;--sapButton_Negative_Hover_BorderColor: #e90b0b;--sapButton_Negative_Hover_TextColor: #fff;--sapButton_Negative_Active_Background: #fff;--sapButton_Negative_Active_BorderColor: #f53232;--sapButton_Negative_Active_TextColor: #aa0808;--sapButton_Critical_Background: #e76500;--sapButton_Critical_BorderColor: #e76500;--sapButton_Critical_TextColor: #fff;--sapButton_Critical_Hover_Background: #dd6100;--sapButton_Critical_Hover_BorderColor: #dd6100;--sapButton_Critical_Hover_TextColor: #fff;--sapButton_Critical_Active_Background: #fff;--sapButton_Critical_Active_BorderColor: #dd6100;--sapButton_Critical_Active_TextColor: #b44f00;--sapButton_Success_Background: #30914c;--sapButton_Success_BorderColor: #30914c;--sapButton_Success_TextColor: #fff;--sapButton_Success_Hover_Background: #2c8646;--sapButton_Success_Hover_BorderColor: #2c8646;--sapButton_Success_Hover_TextColor: #fff;--sapButton_Success_Active_Background: #fff;--sapButton_Success_Active_BorderColor: #30914c;--sapButton_Success_Active_TextColor: #256f3a;--sapButton_Information_Background: #e8f3ff;--sapButton_Information_BorderColor: #b5d8ff;--sapButton_Information_TextColor: #0064d9;--sapButton_Information_Hover_Background: #d4e8ff;--sapButton_Information_Hover_BorderColor: #b5d8ff;--sapButton_Information_Hover_TextColor: #0064d9;--sapButton_Information_Active_Background: #fff;--sapButton_Information_Active_BorderColor: #0064d9;--sapButton_Information_Active_TextColor: #0064d9;--sapButton_Neutral_Background: #e8f3ff;--sapButton_Neutral_BorderColor: #b5d8ff;--sapButton_Neutral_TextColor: #0064d9;--sapButton_Neutral_Hover_Background: #d4e8ff;--sapButton_Neutral_Hover_BorderColor: #b5d8ff;--sapButton_Neutral_Hover_TextColor: #0064d9;--sapButton_Neutral_Active_Background: #fff;--sapButton_Neutral_Active_BorderColor: #0064d9;--sapButton_Neutral_Active_TextColor: #0064d9;--sapButton_Track_Background: #788fa6;--sapButton_Track_BorderColor: #788fa6;--sapButton_Track_TextColor: #fff;--sapButton_Track_Hover_Background: #637d97;--sapButton_Track_Hover_BorderColor: #637d97;--sapButton_Track_Selected_Background: #0064d9;--sapButton_Track_Selected_BorderColor: #0064d9;--sapButton_Track_Selected_TextColor: #fff;--sapButton_Track_Selected_Hover_Background: #0058c0;--sapButton_Track_Selected_Hover_BorderColor: #0058c0;--sapButton_Handle_Background: #fff;--sapButton_Handle_BorderColor: #fff;--sapButton_Handle_TextColor: #131e29;--sapButton_Handle_Hover_Background: #fff;--sapButton_Handle_Hover_BorderColor: rgba(255,255,255,.5);--sapButton_Handle_Selected_Background: #edf6ff;--sapButton_Handle_Selected_BorderColor: #edf6ff;--sapButton_Handle_Selected_TextColor: #0064d9;--sapButton_Handle_Selected_Hover_Background: #edf6ff;--sapButton_Handle_Selected_Hover_BorderColor: rgba(237,246,255,.5);--sapButton_Track_Negative_Background: #f53232;--sapButton_Track_Negative_BorderColor: #f53232;--sapButton_Track_Negative_TextColor: #fff;--sapButton_Track_Negative_Hover_Background: #e90b0b;--sapButton_Track_Negative_Hover_BorderColor: #e90b0b;--sapButton_Handle_Negative_Background: #fff;--sapButton_Handle_Negative_BorderColor: #fff;--sapButton_Handle_Negative_TextColor: #aa0808;--sapButton_Handle_Negative_Hover_Background: #fff;--sapButton_Handle_Negative_Hover_BorderColor: rgba(255,255,255,.5);--sapButton_Track_Positive_Background: #30914c;--sapButton_Track_Positive_BorderColor: #30914c;--sapButton_Track_Positive_TextColor: #fff;--sapButton_Track_Positive_Hover_Background: #2c8646;--sapButton_Track_Positive_Hover_BorderColor: #2c8646;--sapButton_Handle_Positive_Background: #fff;--sapButton_Handle_Positive_BorderColor: #fff;--sapButton_Handle_Positive_TextColor: #256f3a;--sapButton_Handle_Positive_Hover_Background: #fff;--sapButton_Handle_Positive_Hover_BorderColor: rgba(255,255,255,.5);--sapButton_TokenBackground: #fff;--sapButton_TokenBorderColor: #bcc3ca;--sapButton_TokenBorderCornerRadius: .375rem;--sapButton_Selected_TokenBorderWidth: .125rem;--sapButton_ReadOnly_TokenBackground: #fff;--sapButton_Segment_BorderCornerRadius: .5rem;--sapField_Background: #fff;--sapField_BackgroundStyle: 0 100% / 100% .0625rem no-repeat linear-gradient(0deg, #556b81, #556b81) border-box;--sapField_TextColor: #131e29;--sapField_PlaceholderTextColor: #556b82;--sapField_BorderColor: #556b81;--sapField_HelpBackground: #fff;--sapField_BorderWidth: .0625rem;--sapField_BorderStyle: none;--sapField_BorderCornerRadius: .25rem;--sapField_Shadow: inset 0 0 0 .0625rem rgba(85,107,129,.25);--sapField_Hover_Background: #fff;--sapField_Hover_BackgroundStyle: 0 100% / 100% .0625rem no-repeat linear-gradient(0deg, #0064d9, #0064d9) border-box;--sapField_Hover_BorderColor: #0064d9;--sapField_Hover_HelpBackground: #fff;--sapField_Hover_Shadow: inset 0 0 0 .0625rem rgba(79,160,255,.5);--sapField_Hover_InvalidShadow: inset 0 0 0 .0625rem rgba(255,142,196,.45);--sapField_Hover_WarningShadow: inset 0 0 0 .0625rem rgba(255,213,10,.4);--sapField_Hover_SuccessShadow: inset 0 0 0 .0625rem rgba(48,145,76,.18);--sapField_Hover_InformationShadow: inset 0 0 0 .0625rem rgba(104,174,255,.5);--sapField_Active_BorderColor: #0064d9;--sapField_Focus_Background: #fff;--sapField_Focus_BorderColor: #0032a5;--sapField_Focus_HelpBackground: #fff;--sapField_ReadOnly_Background: #eaecee;--sapField_ReadOnly_BackgroundStyle: 0 100% / .375rem .0625rem repeat-x linear-gradient(90deg, #556b81 0, #556b81 .25rem, transparent .25rem) border-box;--sapField_ReadOnly_BorderColor: #556b81;--sapField_ReadOnly_BorderStyle: none;--sapField_ReadOnly_HelpBackground: #eaecee;--sapField_RequiredColor: #ba066c;--sapField_InvalidColor: #e90b0b;--sapField_InvalidBackground: #ffeaf4;--sapField_InvalidBackgroundStyle: 0 100% / 100% .125rem no-repeat linear-gradient(0deg, #e90b0b, #e90b0b) border-box;--sapField_InvalidBorderWidth: .125rem;--sapField_InvalidBorderStyle: none;--sapField_InvalidShadow: inset 0 0 0 .0625rem rgba(255,142,196,.45);--sapField_WarningColor: #dd6100;--sapField_WarningBackground: #fff8d6;--sapField_WarningBackgroundStyle: 0 100% / 100% .125rem no-repeat linear-gradient(0deg, #dd6100, #dd6100) border-box;--sapField_WarningBorderWidth: .125rem;--sapField_WarningBorderStyle: none;--sapField_WarningShadow: inset 0 0 0 .0625rem rgba(255,213,10,.4);--sapField_SuccessColor: #30914c;--sapField_SuccessBackground: #f5fae5;--sapField_SuccessBackgroundStyle: 0 100% / 100% .0625rem no-repeat linear-gradient(0deg, #30914c, #30914c) border-box;--sapField_SuccessBorderWidth: .0625rem;--sapField_SuccessBorderStyle: none;--sapField_SuccessShadow: inset 0 0 0 .0625rem rgba(48,145,76,.18);--sapField_InformationColor: #0070f2;--sapField_InformationBackground: #e1f4ff;--sapField_InformationBackgroundStyle: 0 100% / 100% .125rem no-repeat linear-gradient(0deg, #0070f2, #0070f2) border-box;--sapField_InformationBorderWidth: .125rem;--sapField_InformationBorderStyle: none;--sapField_InformationShadow: inset 0 0 0 .0625rem rgba(104,174,255,.5);--sapField_Selector_Hover_Background: #e3f0ff;--sapField_Selector_Hover_InvalidBackground: #fff;--sapField_Selector_Hover_WarningBackground: #fff;--sapField_Selector_Hover_SuccessBackground: #fff;--sapField_Selector_Hover_InformationBackground: #fff;--sapField_Picker_BorderColor: #556b81;--sapField_Picker_BorderWidth: .0625rem;--sapField_Selector_BorderStyle: solid;--sapField_Selector_ReadOnly_BorderStyle: dashed;--sapField_Selector_InvalidBorderStyle: solid;--sapField_Selector_WarningBorderStyle: solid;--sapField_Selector_SuccessBorderStyle: solid;--sapField_Selector_InformationBorderStyle: solid;--sapGroup_TitleBorderWidth: .0625rem;--sapGroup_TitleBackground: #fff;--sapGroup_TitleBorderColor: #a8b2bd;--sapGroup_TitleTextColor: #131e29;--sapGroup_Title_FontSize: 1rem;--sapGroup_ContentBackground: #fff;--sapGroup_ContentBorderColor: #d9d9d9;--sapGroup_BorderWidth: .0625rem;--sapGroup_BorderCornerRadius: .75rem;--sapGroup_FooterBackground: transparent;--sapToolbar_Background: #fff;--sapToolbar_SeparatorColor: #d9d9d9;--sapList_HeaderBackground: #fff;--sapList_HeaderBorderColor: #a8b2bd;--sapList_HeaderTextColor: #131e29;--sapList_BorderColor: #e5e5e5;--sapList_BorderWidth: .0625rem;--sapList_TextColor: #131e29;--sapList_Active_TextColor: #131e29;--sapList_Active_Background: #dee2e5;--sapList_SelectionBackgroundColor: #ebf8ff;--sapList_SelectionBorderColor: #0064d9;--sapList_Hover_SelectionBackground: #dcf3ff;--sapList_Background: #fff;--sapList_Hover_Background: #eaecee;--sapList_AlternatingBackground: #f5f6f7;--sapList_GroupHeaderBackground: #fff;--sapList_GroupHeaderBorderColor: #a8b2bd;--sapList_GroupHeaderTextColor: #131e29;--sapList_TableGroupHeaderBackground: #eff1f2;--sapList_TableGroupHeaderBorderColor: #a8b2bd;--sapList_TableGroupHeaderTextColor: #131e29;--sapList_FooterBackground: #fff;--sapList_FooterTextColor: #131e29;--sapList_TableFooterBorder: #a8b2bd;--sapList_TableFixedBorderColor: #8c8c8c;--sapList_TableFixedColumnBorderWidth: .0625rem;--sapList_TableFixedRowBorderWidth: .125rem;--sapMessage_BorderWidth: .0625rem;--sapMessage_ErrorBorderColor: #ff8ec4;--sapMessage_WarningBorderColor: #ffe770;--sapMessage_SuccessBorderColor: #cee67e;--sapMessage_InformationBorderColor: #7bcfff;--sapMessage_Button_Hover_Background: rgba(234,236,238,.2);--sapPopover_BorderCornerRadius: .5rem;--sapProgress_Background: #d5dadd;--sapProgress_BorderColor: #d5dadd;--sapProgress_TextColor: #131e29;--sapProgress_FontSize: .875rem;--sapProgress_NegativeBackground: #ffdbec;--sapProgress_NegativeBorderColor: #ffdbec;--sapProgress_NegativeTextColor: #131e29;--sapProgress_CriticalBackground: #fff4bd;--sapProgress_CriticalBorderColor: #fff4bd;--sapProgress_CriticalTextColor: #131e29;--sapProgress_PositiveBackground: #e5f2ba;--sapProgress_PositiveBorderColor: #e5f2ba;--sapProgress_PositiveTextColor: #131e29;--sapProgress_InformationBackground: #cdedff;--sapProgress_InformationBorderColor: #cdedff;--sapProgress_InformationTextColor: #131e29;--sapProgress_Value_Background: #617b94;--sapProgress_Value_BorderColor: #617b94;--sapProgress_Value_TextColor: #788fa6;--sapProgress_Value_NegativeBackground: #f53232;--sapProgress_Value_NegativeBorderColor: #f53232;--sapProgress_Value_NegativeTextColor: #f53232;--sapProgress_Value_CriticalBackground: #e76500;--sapProgress_Value_CriticalBorderColor: #e76500;--sapProgress_Value_CriticalTextColor: #e76500;--sapProgress_Value_PositiveBackground: #30914c;--sapProgress_Value_PositiveBorderColor: #30914c;--sapProgress_Value_PositiveTextColor: #30914c;--sapProgress_Value_InformationBackground: #0070f2;--sapProgress_Value_InformationBorderColor: #0070f2;--sapProgress_Value_InformationTextColor: #0070f2;--sapScrollBar_FaceColor: #7b91a8;--sapScrollBar_TrackColor: #fff;--sapScrollBar_BorderColor: #7b91a8;--sapScrollBar_SymbolColor: #0064d9;--sapScrollBar_Dimension: .75rem;--sapScrollBar_Hover_FaceColor: #5b728b;--sapSlider_Background: #d5dadd;--sapSlider_BorderColor: #d5dadd;--sapSlider_Selected_Background: #0064d9;--sapSlider_Selected_BorderColor: #0064d9;--sapSlider_Selected_Dimension: 111px;--sapSlider_HandleBackground: #fff;--sapSlider_HandleBorderColor: #b0d5ff;--sapSlider_RangeHandleBackground: #fff;--sapSlider_Hover_HandleBackground: #d9ecff;--sapSlider_Hover_HandleBorderColor: #b0d5ff;--sapSlider_Hover_RangeHandleBackground: #d9ecff;--sapSlider_Active_HandleBackground: #fff;--sapSlider_Active_HandleBorderColor: #0064d9;--sapSlider_Active_RangeHandleBackground: transparent;--sapPageHeader_Background: #fff;--sapPageHeader_BorderColor: #d9d9d9;--sapPageHeader_TextColor: #131e29;--sapPageFooter_Background: #fff;--sapPageFooter_BorderColor: #d9d9d9;--sapPageFooter_TextColor: #131e29;--sapInfobar_Background: #c2fcee;--sapInfobar_Hover_Background: #fff;--sapInfobar_Active_Background: #fff;--sapInfobar_NonInteractive_Background: #f5f6f7;--sapInfobar_TextColor: #046c7a;--sapObjectHeader_Background: #fff;--sapObjectHeader_Hover_Background: #eaecee;--sapObjectHeader_BorderColor: #d9d9d9;--sapObjectHeader_Title_TextColor: #131e29;--sapObjectHeader_Title_FontSize: 1.5rem;--sapObjectHeader_Title_SnappedFontSize: 1.25rem;--sapObjectHeader_Title_FontFamily: "72Black", "72Blackfull","72", "72full", Arial, Helvetica, sans-serif;--sapObjectHeader_Subtitle_TextColor: #556b82;--sapBlockLayer_Background: #000;--sapBlockLayer_Opacity: .2;--sapTab_TextColor: #131e29;--sapTab_ForegroundColor: #0064d9;--sapTab_IconColor: #0064d9;--sapTab_Background: #fff;--sapTab_Selected_TextColor: #0064d9;--sapTab_Selected_IconColor: #fff;--sapTab_Selected_Background: #0064d9;--sapTab_Selected_Indicator_Dimension: .1875rem;--sapTab_Positive_TextColor: #256f3a;--sapTab_Positive_ForegroundColor: #30914c;--sapTab_Positive_IconColor: #30914c;--sapTab_Positive_Selected_TextColor: #256f3a;--sapTab_Positive_Selected_IconColor: #fff;--sapTab_Positive_Selected_Background: #30914c;--sapTab_Negative_TextColor: #aa0808;--sapTab_Negative_ForegroundColor: #f53232;--sapTab_Negative_IconColor: #f53232;--sapTab_Negative_Selected_TextColor: #aa0808;--sapTab_Negative_Selected_IconColor: #fff;--sapTab_Negative_Selected_Background: #f53232;--sapTab_Critical_TextColor: #b44f00;--sapTab_Critical_ForegroundColor: #e76500;--sapTab_Critical_IconColor: #e76500;--sapTab_Critical_Selected_TextColor: #b44f00;--sapTab_Critical_Selected_IconColor: #fff;--sapTab_Critical_Selected_Background: #e76500;--sapTab_Neutral_TextColor: #131e29;--sapTab_Neutral_ForegroundColor: #788fa6;--sapTab_Neutral_IconColor: #788fa6;--sapTab_Neutral_Selected_TextColor: #131e29;--sapTab_Neutral_Selected_IconColor: #fff;--sapTab_Neutral_Selected_Background: #788fa6;--sapTile_Background: #fff;--sapTile_Hover_Background: #eaecee;--sapTile_Active_Background: #dee2e5;--sapTile_BorderColor: transparent;--sapTile_BorderCornerRadius: 1rem;--sapTile_TitleTextColor: #131e29;--sapTile_TextColor: #556b82;--sapTile_IconColor: #556b82;--sapTile_SeparatorColor: #ccc;--sapTile_Interactive_BorderColor: #b3b3b3;--sapTile_OverlayBackground: #fff;--sapTile_OverlayForegroundColor: #131e29;--sapTile_Hover_ContentBackground: #fff;--sapTile_Active_ContentBackground: #fff;--sapAccentColor1: #d27700;--sapAccentColor2: #aa0808;--sapAccentColor3: #ba066c;--sapAccentColor4: #a100c2;--sapAccentColor5: #5d36ff;--sapAccentColor6: #0057d2;--sapAccentColor7: #046c7a;--sapAccentColor8: #256f3a;--sapAccentColor9: #6c32a9;--sapAccentColor10: #5b738b;--sapAccentBackgroundColor1: #fff3b8;--sapAccentBackgroundColor2: #ffd0e7;--sapAccentBackgroundColor3: #ffdbe7;--sapAccentBackgroundColor4: #ffdcf3;--sapAccentBackgroundColor5: #ded3ff;--sapAccentBackgroundColor6: #d1efff;--sapAccentBackgroundColor7: #c2fcee;--sapAccentBackgroundColor8: #ebf5cb;--sapAccentBackgroundColor9: #ddccf0;--sapAccentBackgroundColor10: #eaecee;--sapIndicationColor_1: #840606;--sapIndicationColor_1_Background: #840606;--sapIndicationColor_1_BorderColor: #840606;--sapIndicationColor_1_TextColor: #fff;--sapIndicationColor_1_Hover_Background: #6c0505;--sapIndicationColor_1_Active_Background: #fff;--sapIndicationColor_1_Active_BorderColor: #fb9d9d;--sapIndicationColor_1_Active_TextColor: #840606;--sapIndicationColor_1_Selected_Background: #fff;--sapIndicationColor_1_Selected_BorderColor: #fb9d9d;--sapIndicationColor_1_Selected_TextColor: #840606;--sapIndicationColor_1b: #fb9d9d;--sapIndicationColor_1b_TextColor: #830707;--sapIndicationColor_1b_Background: #fb9d9d;--sapIndicationColor_1b_BorderColor: #fb9d9d;--sapIndicationColor_1b_Hover_Background: #fa8585;--sapIndicationColor_2: #aa0808;--sapIndicationColor_2_Background: #aa0808;--sapIndicationColor_2_BorderColor: #aa0808;--sapIndicationColor_2_TextColor: #fff;--sapIndicationColor_2_Hover_Background: #920707;--sapIndicationColor_2_Active_Background: #fff;--sapIndicationColor_2_Active_BorderColor: #fcc4c4;--sapIndicationColor_2_Active_TextColor: #aa0808;--sapIndicationColor_2_Selected_Background: #fff;--sapIndicationColor_2_Selected_BorderColor: #fcc4c4;--sapIndicationColor_2_Selected_TextColor: #aa0808;--sapIndicationColor_2b: #fcc4c4;--sapIndicationColor_2b_TextColor: #a90909;--sapIndicationColor_2b_Background: #fcc4c4;--sapIndicationColor_2b_BorderColor: #fcc4c4;--sapIndicationColor_2b_Hover_Background: #fbacac;--sapIndicationColor_3: #b95100;--sapIndicationColor_3_Background: #e76500;--sapIndicationColor_3_BorderColor: #e76500;--sapIndicationColor_3_TextColor: #fff;--sapIndicationColor_3_Hover_Background: #d85e00;--sapIndicationColor_3_Active_Background: #fff;--sapIndicationColor_3_Active_BorderColor: #ffdfc3;--sapIndicationColor_3_Active_TextColor: #b95100;--sapIndicationColor_3_Selected_Background: #fff;--sapIndicationColor_3_Selected_BorderColor: #ffdfc3;--sapIndicationColor_3_Selected_TextColor: #b95100;--sapIndicationColor_3b: #ffdfc3;--sapIndicationColor_3b_TextColor: #a44d00;--sapIndicationColor_3b_Background: #ffdfc3;--sapIndicationColor_3b_BorderColor: #ffdfc3;--sapIndicationColor_3b_Hover_Background: #ffd1a9;--sapIndicationColor_4: #256f3a;--sapIndicationColor_4_Background: #256f3a;--sapIndicationColor_4_BorderColor: #256f3a;--sapIndicationColor_4_TextColor: #fff;--sapIndicationColor_4_Hover_Background: #1f5c30;--sapIndicationColor_4_Active_Background: #fff;--sapIndicationColor_4_Active_BorderColor: #bae8bc;--sapIndicationColor_4_Active_TextColor: #256f3a;--sapIndicationColor_4_Selected_Background: #fff;--sapIndicationColor_4_Selected_BorderColor: #bae8bc;--sapIndicationColor_4_Selected_TextColor: #256f3a;--sapIndicationColor_4b: #bae8bc;--sapIndicationColor_4b_TextColor: #256f28;--sapIndicationColor_4b_Background: #bae8bc;--sapIndicationColor_4b_BorderColor: #bae8bc;--sapIndicationColor_4b_Hover_Background: #a7e2a9;--sapIndicationColor_5: #0070f2;--sapIndicationColor_5_Background: #0070f2;--sapIndicationColor_5_BorderColor: #0070f2;--sapIndicationColor_5_TextColor: #fff;--sapIndicationColor_5_Hover_Background: #0064d9;--sapIndicationColor_5_Active_Background: #fff;--sapIndicationColor_5_Active_BorderColor: #d9ebff;--sapIndicationColor_5_Active_TextColor: #0070f2;--sapIndicationColor_5_Selected_Background: #fff;--sapIndicationColor_5_Selected_BorderColor: #d9ebff;--sapIndicationColor_5_Selected_TextColor: #0070f2;--sapIndicationColor_5b: #d9ebff;--sapIndicationColor_5b_TextColor: #0067d9;--sapIndicationColor_5b_Background: #d9ebff;--sapIndicationColor_5b_BorderColor: #d9ebff;--sapIndicationColor_5b_Hover_Background: #c0deff;--sapIndicationColor_6: #046c7a;--sapIndicationColor_6_Background: #046c7a;--sapIndicationColor_6_BorderColor: #046c7a;--sapIndicationColor_6_TextColor: #fff;--sapIndicationColor_6_Hover_Background: #035661;--sapIndicationColor_6_Active_Background: #fff;--sapIndicationColor_6_Active_BorderColor: #cdf5ec;--sapIndicationColor_6_Active_TextColor: #046c7a;--sapIndicationColor_6_Selected_Background: #fff;--sapIndicationColor_6_Selected_BorderColor: #cdf5ec;--sapIndicationColor_6_Selected_TextColor: #046c7a;--sapIndicationColor_6b: #cdf5ec;--sapIndicationColor_6b_TextColor: #156b58;--sapIndicationColor_6b_Background: #cdf5ec;--sapIndicationColor_6b_BorderColor: #cdf5ec;--sapIndicationColor_6b_Hover_Background: #b8f1e4;--sapIndicationColor_7: #5d36ff;--sapIndicationColor_7_Background: #5d36ff;--sapIndicationColor_7_BorderColor: #5d36ff;--sapIndicationColor_7_TextColor: #fff;--sapIndicationColor_7_Hover_Background: #481cff;--sapIndicationColor_7_Active_Background: #fff;--sapIndicationColor_7_Active_BorderColor: #e2dbff;--sapIndicationColor_7_Active_TextColor: #5d36ff;--sapIndicationColor_7_Selected_Background: #fff;--sapIndicationColor_7_Selected_BorderColor: #e2dbff;--sapIndicationColor_7_Selected_TextColor: #5d36ff;--sapIndicationColor_7b: #e2dbff;--sapIndicationColor_7b_TextColor: #5f38ff;--sapIndicationColor_7b_Background: #e2dbff;--sapIndicationColor_7b_BorderColor: #e2dbff;--sapIndicationColor_7b_Hover_Background: #cdc2ff;--sapIndicationColor_8: #a100c2;--sapIndicationColor_8_Background: #a100c2;--sapIndicationColor_8_BorderColor: #a100c2;--sapIndicationColor_8_TextColor: #fff;--sapIndicationColor_8_Hover_Background: #8c00a9;--sapIndicationColor_8_Active_Background: #fff;--sapIndicationColor_8_Active_BorderColor: #f8d6ff;--sapIndicationColor_8_Active_TextColor: #a100c2;--sapIndicationColor_8_Selected_Background: #fff;--sapIndicationColor_8_Selected_BorderColor: #f8d6ff;--sapIndicationColor_8_Selected_TextColor: #a100c2;--sapIndicationColor_8b: #f8d6ff;--sapIndicationColor_8b_TextColor: #a100c2;--sapIndicationColor_8b_Background: #f8d6ff;--sapIndicationColor_8b_BorderColor: #f8d6ff;--sapIndicationColor_8b_Hover_Background: #f4bdff;--sapIndicationColor_9: #1d2d3e;--sapIndicationColor_9_Background: #1d2d3e;--sapIndicationColor_9_BorderColor: #1d2d3e;--sapIndicationColor_9_TextColor: #fff;--sapIndicationColor_9_Hover_Background: #15202d;--sapIndicationColor_9_Active_Background: #fff;--sapIndicationColor_9_Active_BorderColor: #d9d9d9;--sapIndicationColor_9_Active_TextColor: #1d2d3e;--sapIndicationColor_9_Selected_Background: #fff;--sapIndicationColor_9_Selected_BorderColor: #d9d9d9;--sapIndicationColor_9_Selected_TextColor: #1d2d3e;--sapIndicationColor_9b: #fff;--sapIndicationColor_9b_TextColor: #2e2e2e;--sapIndicationColor_9b_Background: #fff;--sapIndicationColor_9b_BorderColor: #d9d9d9;--sapIndicationColor_9b_Hover_Background: #f2f2f2;--sapIndicationColor_10: #45484a;--sapIndicationColor_10_Background: #83888b;--sapIndicationColor_10_BorderColor: #83888b;--sapIndicationColor_10_TextColor: #fff;--sapIndicationColor_10_Hover_Background: #767b7e;--sapIndicationColor_10_Active_Background: #fff;--sapIndicationColor_10_Active_BorderColor: #eaecee;--sapIndicationColor_10_Active_TextColor: #45484a;--sapIndicationColor_10_Selected_Background: #fff;--sapIndicationColor_10_Selected_BorderColor: #eaecee;--sapIndicationColor_10_Selected_TextColor: #45484a;--sapIndicationColor_10b: #eaecee;--sapIndicationColor_10b_TextColor: #464646;--sapIndicationColor_10b_Background: #eaecee;--sapIndicationColor_10b_BorderColor: #eaecee;--sapIndicationColor_10b_Hover_Background: #dcdfe3;--sapLegend_WorkingBackground: #fff;--sapLegend_NonWorkingBackground: #ebebeb;--sapLegend_CurrentDateTime: #a100c2;--sapLegendColor1: #c35500;--sapLegendColor2: #d23a0a;--sapLegendColor3: #df1278;--sapLegendColor4: #840606;--sapLegendColor5: #cc00dc;--sapLegendColor6: #0057d2;--sapLegendColor7: #07838f;--sapLegendColor8: #188918;--sapLegendColor9: #5b738b;--sapLegendColor10: #7800a4;--sapLegendColor11: #a93e00;--sapLegendColor12: #aa2608;--sapLegendColor13: #ba066c;--sapLegendColor14: #8d2a00;--sapLegendColor15: #4e247a;--sapLegendColor16: #002a86;--sapLegendColor17: #035663;--sapLegendColor18: #1e592f;--sapLegendColor19: #1a4796;--sapLegendColor20: #470ced;--sapLegendBackgroundColor1: #ffef9f;--sapLegendBackgroundColor2: #feeae1;--sapLegendBackgroundColor3: #fbf6f8;--sapLegendBackgroundColor4: #fbebeb;--sapLegendBackgroundColor5: #ffe5fe;--sapLegendBackgroundColor6: #d1efff;--sapLegendBackgroundColor7: #c2fcee;--sapLegendBackgroundColor8: #f5fae5;--sapLegendBackgroundColor9: #f5f6f7;--sapLegendBackgroundColor10: #fff0fa;--sapLegendBackgroundColor11: #fff8d6;--sapLegendBackgroundColor12: #fff6f6;--sapLegendBackgroundColor13: #f7ebef;--sapLegendBackgroundColor14: #f1ecd5;--sapLegendBackgroundColor15: #f0e7f8;--sapLegendBackgroundColor16: #ebf8ff;--sapLegendBackgroundColor17: #dafdf5;--sapLegendBackgroundColor18: #ebf5cb;--sapLegendBackgroundColor19: #fafdff;--sapLegendBackgroundColor20: #eceeff;--sapChart_Background: #fff;--sapChart_ContrastTextShadow: 0 0 .0625rem rgba(0,0,0,.7);--sapChart_ContrastShadowColor: #fff;--sapChart_ContrastLineColor: #fff;--sapChart_LineColor_1: #e1e6eb;--sapChart_LineColor_2: #768da4;--sapChart_LineColor_3: #000001;--sapChart_Choropleth_Background: #edf0f3;--sapChart_ChoroplethRegion_Background: #758ca4;--sapChart_ChoroplethRegion_BorderColor: #edf0f3;--sapChart_Data_TextColor: #000;--sapChart_Data_ContrastTextColor: #fff;--sapChart_Data_InteractiveColor: #000001;--sapChart_Data_Active_Background: #dee2e5;--sapChart_OrderedColor_1: #168eff;--sapChart_OrderedColor_2: #c87b00;--sapChart_OrderedColor_3: #75980b;--sapChart_OrderedColor_4: #df1278;--sapChart_OrderedColor_5: #8b47d7;--sapChart_OrderedColor_6: #049f9a;--sapChart_OrderedColor_7: #0070f2;--sapChart_OrderedColor_8: #cc00dc;--sapChart_OrderedColor_9: #798c77;--sapChart_OrderedColor_10: #da6c6c;--sapChart_OrderedColor_11: #5d36ff;--sapChart_OrderedColor_12: #a68a5b;--sapChart_Bad: #f53232;--sapChart_Critical: #e26300;--sapChart_Good: #30914c;--sapChart_Neutral: #758ca4;--sapChart_Sequence_1_Plus3: #96ccff;--sapChart_Sequence_1_Plus3_TextColor: #000;--sapChart_Sequence_1_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_1_Plus2: #3b9ffe;--sapChart_Sequence_1_Plus2_TextColor: #000;--sapChart_Sequence_1_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_1_Plus1: #3fa2ff;--sapChart_Sequence_1_Plus1_TextColor: #000;--sapChart_Sequence_1_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_1: #168eff;--sapChart_Sequence_1_TextColor: #000;--sapChart_Sequence_1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_1_BorderColor: #168eff;--sapChart_Sequence_1_Minus1: #077cea;--sapChart_Sequence_1_Minus1_TextColor: #fff;--sapChart_Sequence_1_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_1_Minus2: #077cea;--sapChart_Sequence_1_Minus2_TextColor: #fff;--sapChart_Sequence_1_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_1_Minus3: #06559e;--sapChart_Sequence_1_Minus3_TextColor: #fff;--sapChart_Sequence_1_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_1_Minus4: #054887;--sapChart_Sequence_1_Minus4_TextColor: #fff;--sapChart_Sequence_1_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_1_Minus5: #043b6e;--sapChart_Sequence_1_Minus5_TextColor: #fff;--sapChart_Sequence_1_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_2_Plus3: #efbf72;--sapChart_Sequence_2_Plus3_TextColor: #000;--sapChart_Sequence_2_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_2_Plus2: #eaaa44;--sapChart_Sequence_2_Plus2_TextColor: #000;--sapChart_Sequence_2_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_2_Plus1: #e29419;--sapChart_Sequence_2_Plus1_TextColor: #000;--sapChart_Sequence_2_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_2: #c87b00;--sapChart_Sequence_2_TextColor: #000;--sapChart_Sequence_2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_2_BorderColor: #9f6200;--sapChart_Sequence_2_Minus1: #9f6200;--sapChart_Sequence_2_Minus1_TextColor: #fff;--sapChart_Sequence_2_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_2_Minus2: #7c4c00;--sapChart_Sequence_2_Minus2_TextColor: #fff;--sapChart_Sequence_2_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_2_Minus3: #623c00;--sapChart_Sequence_2_Minus3_TextColor: #fff;--sapChart_Sequence_2_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_2_Minus4: #623c00;--sapChart_Sequence_2_Minus4_TextColor: #fff;--sapChart_Sequence_2_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_2_Minus5: #2f1d00;--sapChart_Sequence_2_Minus5_TextColor: #fff;--sapChart_Sequence_2_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_3_Plus3: #b9d369;--sapChart_Sequence_3_Plus3_TextColor: #000;--sapChart_Sequence_3_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_3_Plus2: #a6c742;--sapChart_Sequence_3_Plus2_TextColor: #000;--sapChart_Sequence_3_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_3_Plus1: #8fad33;--sapChart_Sequence_3_Plus1_TextColor: #000;--sapChart_Sequence_3_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_3: #75980b;--sapChart_Sequence_3_TextColor: #000;--sapChart_Sequence_3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_3_BorderColor: #587208;--sapChart_Sequence_3_Minus1: #587208;--sapChart_Sequence_3_Minus1_TextColor: #fff;--sapChart_Sequence_3_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_3_Minus2: #3e5106;--sapChart_Sequence_3_Minus2_TextColor: #fff;--sapChart_Sequence_3_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_3_Minus3: #2c3904;--sapChart_Sequence_3_Minus3_TextColor: #fff;--sapChart_Sequence_3_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_3_Minus4: #212b03;--sapChart_Sequence_3_Minus4_TextColor: #fff;--sapChart_Sequence_3_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_3_Minus5: #161c02;--sapChart_Sequence_3_Minus5_TextColor: #fff;--sapChart_Sequence_3_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_4_Plus3: #f473b3;--sapChart_Sequence_4_Plus3_TextColor: #000;--sapChart_Sequence_4_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_4_Plus2: #f14d9e;--sapChart_Sequence_4_Plus2_TextColor: #000;--sapChart_Sequence_4_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_4_Plus1: #ee278a;--sapChart_Sequence_4_Plus1_TextColor: #000;--sapChart_Sequence_4_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_4: #df1278;--sapChart_Sequence_4_TextColor: #fff;--sapChart_Sequence_4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_4_BorderColor: #df1278;--sapChart_Sequence_4_Minus1: #b90f64;--sapChart_Sequence_4_Minus1_TextColor: #fff;--sapChart_Sequence_4_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_4_Minus2: #930c4f;--sapChart_Sequence_4_Minus2_TextColor: #fff;--sapChart_Sequence_4_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_4_Minus3: #770a40;--sapChart_Sequence_4_Minus3_TextColor: #fff;--sapChart_Sequence_4_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_4_Minus4: #51072c;--sapChart_Sequence_4_Minus4_TextColor: #fff;--sapChart_Sequence_4_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_4_Minus5: #3a051f;--sapChart_Sequence_4_Minus5_TextColor: #fff;--sapChart_Sequence_4_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_5_Plus3: #d5bcf0;--sapChart_Sequence_5_Plus3_TextColor: #000;--sapChart_Sequence_5_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_5_Plus2: #b994e0;--sapChart_Sequence_5_Plus2_TextColor: #000;--sapChart_Sequence_5_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_5_Plus1: #a679d8;--sapChart_Sequence_5_Plus1_TextColor: #000;--sapChart_Sequence_5_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_5: #8b47d7;--sapChart_Sequence_5_TextColor: #fff;--sapChart_Sequence_5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_5_BorderColor: #8b47d7;--sapChart_Sequence_5_Minus1: #7236b5;--sapChart_Sequence_5_Minus1_TextColor: #fff;--sapChart_Sequence_5_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_5_Minus2: #5e2c96;--sapChart_Sequence_5_Minus2_TextColor: #fff;--sapChart_Sequence_5_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_5_Minus3: #522682;--sapChart_Sequence_5_Minus3_TextColor: #fff;--sapChart_Sequence_5_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_5_Minus4: #46216f;--sapChart_Sequence_5_Minus4_TextColor: #fff;--sapChart_Sequence_5_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_5_Minus5: #341358;--sapChart_Sequence_5_Minus5_TextColor: #fff;--sapChart_Sequence_5_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_6_Plus3: #64ede9;--sapChart_Sequence_6_Plus3_TextColor: #000;--sapChart_Sequence_6_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_6_Plus2: #2ee0da;--sapChart_Sequence_6_Plus2_TextColor: #000;--sapChart_Sequence_6_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_6_Plus1: #05c7c1;--sapChart_Sequence_6_Plus1_TextColor: #000;--sapChart_Sequence_6_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_6: #049f9a;--sapChart_Sequence_6_TextColor: #000;--sapChart_Sequence_6_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_6_BorderColor: #05c7c1;--sapChart_Sequence_6_Minus1: #02837f;--sapChart_Sequence_6_Minus1_TextColor: #fff;--sapChart_Sequence_6_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_6_Minus2: #006663;--sapChart_Sequence_6_Minus2_TextColor: #fff;--sapChart_Sequence_6_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_6_Minus3: #00514f;--sapChart_Sequence_6_Minus3_TextColor: #fff;--sapChart_Sequence_6_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_6_Minus4: #003d3b;--sapChart_Sequence_6_Minus4_TextColor: #fff;--sapChart_Sequence_6_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_6_Minus5: #002322;--sapChart_Sequence_6_Minus5_TextColor: #fff;--sapChart_Sequence_6_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_7_Plus3: #68aeff;--sapChart_Sequence_7_Plus3_TextColor: #000;--sapChart_Sequence_7_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_7_Plus2: #4098ff;--sapChart_Sequence_7_Plus2_TextColor: #000;--sapChart_Sequence_7_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_7_Plus1: #1c85ff;--sapChart_Sequence_7_Plus1_TextColor: #000;--sapChart_Sequence_7_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_7: #0070f2;--sapChart_Sequence_7_TextColor: #fff;--sapChart_Sequence_7_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_7_BorderColor: #0070f2;--sapChart_Sequence_7_Minus1: #0062d3;--sapChart_Sequence_7_Minus1_TextColor: #fff;--sapChart_Sequence_7_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_7_Minus2: #0054b5;--sapChart_Sequence_7_Minus2_TextColor: #fff;--sapChart_Sequence_7_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_7_Minus3: #00418c;--sapChart_Sequence_7_Minus3_TextColor: #fff;--sapChart_Sequence_7_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_7_Minus4: #00244f;--sapChart_Sequence_7_Minus4_TextColor: #fff;--sapChart_Sequence_7_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_7_Minus5: #001b3a;--sapChart_Sequence_7_Minus5_TextColor: #fff;--sapChart_Sequence_7_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_8_Plus3: #f462ff;--sapChart_Sequence_8_Plus3_TextColor: #000;--sapChart_Sequence_8_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_8_Plus2: #f034ff;--sapChart_Sequence_8_Plus2_TextColor: #000;--sapChart_Sequence_8_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_8_Plus1: #ed0bff;--sapChart_Sequence_8_Plus1_TextColor: #000;--sapChart_Sequence_8_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_8: #cc00dc;--sapChart_Sequence_8_TextColor: #fff;--sapChart_Sequence_8_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_8_BorderColor: #cc00dc;--sapChart_Sequence_8_Minus1: #a600b3;--sapChart_Sequence_8_Minus1_TextColor: #fff;--sapChart_Sequence_8_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_8_Minus2: #80008a;--sapChart_Sequence_8_Minus2_TextColor: #fff;--sapChart_Sequence_8_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_8_Minus3: #6d0076;--sapChart_Sequence_8_Minus3_TextColor: #fff;--sapChart_Sequence_8_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_8_Minus4: #56005d;--sapChart_Sequence_8_Minus4_TextColor: #fff;--sapChart_Sequence_8_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_8_Minus5: #350039;--sapChart_Sequence_8_Minus5_TextColor: #fff;--sapChart_Sequence_8_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_9_Plus3: #bdc6bc;--sapChart_Sequence_9_Plus3_TextColor: #000;--sapChart_Sequence_9_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_9_Plus2: #b5bfb4;--sapChart_Sequence_9_Plus2_TextColor: #000;--sapChart_Sequence_9_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_9_Plus1: #97a695;--sapChart_Sequence_9_Plus1_TextColor: #000;--sapChart_Sequence_9_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_9: #798c77;--sapChart_Sequence_9_TextColor: #000;--sapChart_Sequence_9_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_9_BorderColor: #798c77;--sapChart_Sequence_9_Minus1: #667664;--sapChart_Sequence_9_Minus1_TextColor: #fff;--sapChart_Sequence_9_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_9_Minus2: #536051;--sapChart_Sequence_9_Minus2_TextColor: #fff;--sapChart_Sequence_9_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_9_Minus3: #404a3f;--sapChart_Sequence_9_Minus3_TextColor: #fff;--sapChart_Sequence_9_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_9_Minus4: #2d342c;--sapChart_Sequence_9_Minus4_TextColor: #fff;--sapChart_Sequence_9_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_9_Minus5: #1e231e;--sapChart_Sequence_9_Minus5_TextColor: #fff;--sapChart_Sequence_9_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_10_Plus3: #f1c6c6;--sapChart_Sequence_10_Plus3_TextColor: #000;--sapChart_Sequence_10_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_10_Plus2: #eaadad;--sapChart_Sequence_10_Plus2_TextColor: #000;--sapChart_Sequence_10_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_10_Plus1: #e28d8d;--sapChart_Sequence_10_Plus1_TextColor: #000;--sapChart_Sequence_10_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_10: #da6c6c;--sapChart_Sequence_10_TextColor: #000;--sapChart_Sequence_10_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_10_BorderColor: #b75757;--sapChart_Sequence_10_Minus1: #b75757;--sapChart_Sequence_10_Minus1_TextColor: #000;--sapChart_Sequence_10_Minus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_10_Minus2: #9d4343;--sapChart_Sequence_10_Minus2_TextColor: #fff;--sapChart_Sequence_10_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_10_Minus3: #803737;--sapChart_Sequence_10_Minus3_TextColor: #fff;--sapChart_Sequence_10_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_10_Minus4: #672c2c;--sapChart_Sequence_10_Minus4_TextColor: #fff;--sapChart_Sequence_10_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_10_Minus5: #562424;--sapChart_Sequence_10_Minus5_TextColor: #fff;--sapChart_Sequence_10_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_11_Plus3: #c0b0ff;--sapChart_Sequence_11_Plus3_TextColor: #000;--sapChart_Sequence_11_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_11_Plus2: #9b83ff;--sapChart_Sequence_11_Plus2_TextColor: #000;--sapChart_Sequence_11_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_11_Plus1: #8669ff;--sapChart_Sequence_11_Plus1_TextColor: #000;--sapChart_Sequence_11_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_11: #5d36ff;--sapChart_Sequence_11_TextColor: #fff;--sapChart_Sequence_11_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_11_BorderColor: #5d36ff;--sapChart_Sequence_11_Minus1: #4b25e7;--sapChart_Sequence_11_Minus1_TextColor: #fff;--sapChart_Sequence_11_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_11_Minus2: #3a17cd;--sapChart_Sequence_11_Minus2_TextColor: #fff;--sapChart_Sequence_11_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_11_Minus3: #2f13a8;--sapChart_Sequence_11_Minus3_TextColor: #fff;--sapChart_Sequence_11_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_11_Minus4: #250f83;--sapChart_Sequence_11_Minus4_TextColor: #fff;--sapChart_Sequence_11_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_11_Minus5: #2f13a8;--sapChart_Sequence_11_Minus5_TextColor: #fff;--sapChart_Sequence_11_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_12_Plus3: #e4ddcf;--sapChart_Sequence_12_Plus3_TextColor: #000;--sapChart_Sequence_12_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_12_Plus2: #dacebb;--sapChart_Sequence_12_Plus2_TextColor: #000;--sapChart_Sequence_12_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_12_Plus1: #c4b293;--sapChart_Sequence_12_Plus1_TextColor: #000;--sapChart_Sequence_12_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_12: #a68a5b;--sapChart_Sequence_12_TextColor: #000;--sapChart_Sequence_12_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_12_BorderColor: #a68a5b;--sapChart_Sequence_12_Minus1: #8c744c;--sapChart_Sequence_12_Minus1_TextColor: #fff;--sapChart_Sequence_12_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_12_Minus2: #786441;--sapChart_Sequence_12_Minus2_TextColor: #fff;--sapChart_Sequence_12_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_12_Minus3: #5e4e33;--sapChart_Sequence_12_Minus3_TextColor: #fff;--sapChart_Sequence_12_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_12_Minus4: #433825;--sapChart_Sequence_12_Minus4_TextColor: #fff;--sapChart_Sequence_12_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_12_Minus5: #30271a;--sapChart_Sequence_12_Minus5_TextColor: #fff;--sapChart_Sequence_12_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Bad_Plus3: #fdcece;--sapChart_Sequence_Bad_Plus3_TextColor: #000;--sapChart_Sequence_Bad_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Bad_Plus2: #fa9d9d;--sapChart_Sequence_Bad_Plus2_TextColor: #000;--sapChart_Sequence_Bad_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Bad_Plus1: #f86c6c;--sapChart_Sequence_Bad_Plus1_TextColor: #000;--sapChart_Sequence_Bad_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Bad: #f53232;--sapChart_Sequence_Bad_TextColor: #000;--sapChart_Sequence_Bad_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Bad_BorderColor: #f53232;--sapChart_Sequence_Bad_Minus1: #d00a0a;--sapChart_Sequence_Bad_Minus1_TextColor: #fff;--sapChart_Sequence_Bad_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Bad_Minus2: #a90808;--sapChart_Sequence_Bad_Minus2_TextColor: #fff;--sapChart_Sequence_Bad_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Bad_Minus3: #830606;--sapChart_Sequence_Bad_Minus3_TextColor: #fff;--sapChart_Sequence_Bad_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Bad_Minus4: #570404;--sapChart_Sequence_Bad_Minus4_TextColor: #fff;--sapChart_Sequence_Bad_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Bad_Minus5: #320000;--sapChart_Sequence_Bad_Minus5_TextColor: #fff;--sapChart_Sequence_Bad_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Critical_Plus3: #ffb881;--sapChart_Sequence_Critical_Plus3_TextColor: #000;--sapChart_Sequence_Critical_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Critical_Plus2: #ff933f;--sapChart_Sequence_Critical_Plus2_TextColor: #000;--sapChart_Sequence_Critical_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Critical_Plus1: #ff760c;--sapChart_Sequence_Critical_Plus1_TextColor: #000;--sapChart_Sequence_Critical_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Critical: #e26300;--sapChart_Sequence_Critical_TextColor: #000;--sapChart_Sequence_Critical_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Critical_BorderColor: #e26300;--sapChart_Sequence_Critical_Minus1: #c35600;--sapChart_Sequence_Critical_Minus1_TextColor: #fff;--sapChart_Sequence_Critical_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Critical_Minus2: #aa4a00;--sapChart_Sequence_Critical_Minus2_TextColor: #fff;--sapChart_Sequence_Critical_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Critical_Minus3: #903f00;--sapChart_Sequence_Critical_Minus3_TextColor: #fff;--sapChart_Sequence_Critical_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Critical_Minus4: #6d3000;--sapChart_Sequence_Critical_Minus4_TextColor: #fff;--sapChart_Sequence_Critical_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Critical_Minus5: #492000;--sapChart_Sequence_Critical_Minus5_TextColor: #fff;--sapChart_Sequence_Critical_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Good_Plus3: #88d79f;--sapChart_Sequence_Good_Plus3_TextColor: #000;--sapChart_Sequence_Good_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Good_Plus2: #56c776;--sapChart_Sequence_Good_Plus2_TextColor: #000;--sapChart_Sequence_Good_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Good_Plus1: #3ab05c;--sapChart_Sequence_Good_Plus1_TextColor: #000;--sapChart_Sequence_Good_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Good: #30914c;--sapChart_Sequence_Good_TextColor: #000;--sapChart_Sequence_Good_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Good_BorderColor: #30914c;--sapChart_Sequence_Good_Minus1: #287a40;--sapChart_Sequence_Good_Minus1_TextColor: #fff;--sapChart_Sequence_Good_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Good_Minus2: #226736;--sapChart_Sequence_Good_Minus2_TextColor: #fff;--sapChart_Sequence_Good_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Good_Minus3: #1c542c;--sapChart_Sequence_Good_Minus3_TextColor: #fff;--sapChart_Sequence_Good_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Good_Minus4: #13391e;--sapChart_Sequence_Good_Minus4_TextColor: #fff;--sapChart_Sequence_Good_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Good_Minus5: #0a1e10;--sapChart_Sequence_Good_Minus5_TextColor: #fff;--sapChart_Sequence_Good_Minus5_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Neutral_Plus3: #edf0f3;--sapChart_Sequence_Neutral_Plus3_TextColor: #000;--sapChart_Sequence_Neutral_Plus3_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Neutral_Plus2: #c2ccd7;--sapChart_Sequence_Neutral_Plus2_TextColor: #000;--sapChart_Sequence_Neutral_Plus2_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Neutral_Plus1: #9aabbc;--sapChart_Sequence_Neutral_Plus1_TextColor: #000;--sapChart_Sequence_Neutral_Plus1_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Neutral: #758ca4;--sapChart_Sequence_Neutral_TextColor: #000;--sapChart_Sequence_Neutral_TextShadow: 0 0 .125rem #fff;--sapChart_Sequence_Neutral_BorderColor: #758ca4;--sapChart_Sequence_Neutral_Minus1: #5b728b;--sapChart_Sequence_Neutral_Minus1_TextColor: #fff;--sapChart_Sequence_Neutral_Minus1_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Neutral_Minus2: #495e74;--sapChart_Sequence_Neutral_Minus2_TextColor: #fff;--sapChart_Sequence_Neutral_Minus2_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Neutral_Minus3: #364a5f;--sapChart_Sequence_Neutral_Minus3_TextColor: #fff;--sapChart_Sequence_Neutral_Minus3_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Neutral_Minus4: #233649;--sapChart_Sequence_Neutral_Minus4_TextColor: #fff;--sapChart_Sequence_Neutral_Minus4_TextShadow: 0 0 .125rem #223548;--sapChart_Sequence_Neutral_Minus5: #1a2633;--sapChart_Sequence_Neutral_Minus5_TextColor: #fff;--sapChart_Sequence_Neutral_Minus5_TextShadow: 0 0 .125rem #223548;--sapSapThemeId: sap_horizon;--sapBreakpoint_S_Min: 0;--sapBreakpoint_M_Min: 600px;--sapBreakpoint_L_Min: 1024px;--sapBreakpoint_XL_Min: 1440px
}`;

    var defaultTheme = `:root{--ui5-v2-17-0-avatar-hover-box-shadow-offset: 0px 0px 0px .0625rem var();--ui5-v2-17-0-avatar-initials-color: var(--sapContent_ImagePlaceholderForegroundColor);--ui5-v2-17-0-avatar-border-radius-img-deduction: .0625rem;--ui5-v2-17-0-avatar-optional-border: .0625rem solid var(--sapGroup_ContentBorderColor);--ui5-v2-17-0-avatar-placeholder: var(--sapContent_ImagePlaceholderBackground);--ui5-v2-17-0-avatar-placeholder-color: var(--ui5-v2-17-0-avatar-initials-color);--_ui5-v2-17-0_avatar_outline: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);--_ui5-v2-17-0_avatar_overflow_button_focus_offset: .0625rem;--ui5-v2-17-0-avatar-hover-box-shadow-offset: 0px 0px 0px .0625rem var(--sapAvatar_Hover_BorderColor);--_ui5-v2-17-0_avatar_focus_offset: .1875rem;--ui5-v2-17-0-avatar-initials-border: .0625rem solid var(--sapAvatar_1_BorderColor);--ui5-v2-17-0-avatar-border-radius: var(--sapElement_BorderCornerRadius);--_ui5-v2-17-0_avatar_fontsize_XS: 1rem;--_ui5-v2-17-0_avatar_fontsize_S: 1.125rem;--_ui5-v2-17-0_avatar_fontsize_M: 1.5rem;--_ui5-v2-17-0_avatar_fontsize_L: 2.25rem;--_ui5-v2-17-0_avatar_fontsize_XL: 3rem;--ui5-v2-17-0-avatar-accent1: var(--sapAvatar_1_Background);--ui5-v2-17-0-avatar-accent2: var(--sapAvatar_2_Background);--ui5-v2-17-0-avatar-accent3: var(--sapAvatar_3_Background);--ui5-v2-17-0-avatar-accent4: var(--sapAvatar_4_Background);--ui5-v2-17-0-avatar-accent5: var(--sapAvatar_5_Background);--ui5-v2-17-0-avatar-accent6: var(--sapAvatar_6_Background);--ui5-v2-17-0-avatar-accent7: var(--sapAvatar_7_Background);--ui5-v2-17-0-avatar-accent8: var(--sapAvatar_8_Background);--ui5-v2-17-0-avatar-accent9: var(--sapAvatar_9_Background);--ui5-v2-17-0-avatar-accent10: var(--sapAvatar_10_Background);--ui5-v2-17-0-avatar-accent1-color: var(--sapAvatar_1_TextColor);--ui5-v2-17-0-avatar-accent2-color: var(--sapAvatar_2_TextColor);--ui5-v2-17-0-avatar-accent3-color: var(--sapAvatar_3_TextColor);--ui5-v2-17-0-avatar-accent4-color: var(--sapAvatar_4_TextColor);--ui5-v2-17-0-avatar-accent5-color: var(--sapAvatar_5_TextColor);--ui5-v2-17-0-avatar-accent6-color: var(--sapAvatar_6_TextColor);--ui5-v2-17-0-avatar-accent7-color: var(--sapAvatar_7_TextColor);--ui5-v2-17-0-avatar-accent8-color: var(--sapAvatar_8_TextColor);--ui5-v2-17-0-avatar-accent9-color: var(--sapAvatar_9_TextColor);--ui5-v2-17-0-avatar-accent10-color: var(--sapAvatar_10_TextColor);--ui5-v2-17-0-avatar-accent1-border-color: var(--sapAvatar_1_BorderColor);--ui5-v2-17-0-avatar-accent2-border-color: var(--sapAvatar_2_BorderColor);--ui5-v2-17-0-avatar-accent3-border-color: var(--sapAvatar_3_BorderColor);--ui5-v2-17-0-avatar-accent4-border-color: var(--sapAvatar_4_BorderColor);--ui5-v2-17-0-avatar-accent5-border-color: var(--sapAvatar_5_BorderColor);--ui5-v2-17-0-avatar-accent6-border-color: var(--sapAvatar_6_BorderColor);--ui5-v2-17-0-avatar-accent7-border-color: var(--sapAvatar_7_BorderColor);--ui5-v2-17-0-avatar-accent8-border-color: var(--sapAvatar_8_BorderColor);--ui5-v2-17-0-avatar-accent9-border-color: var(--sapAvatar_9_BorderColor);--ui5-v2-17-0-avatar-accent10-border-color: var(--sapAvatar_10_BorderColor);--_ui5-v2-17-0_avatar_icon_XS: var(--_ui5-v2-17-0_avatar_fontsize_XS);--_ui5-v2-17-0_avatar_icon_S: var(--_ui5-v2-17-0_avatar_fontsize_S);--_ui5-v2-17-0_avatar_icon_M: var(--_ui5-v2-17-0_avatar_fontsize_M);--_ui5-v2-17-0_avatar_icon_L: var(--_ui5-v2-17-0_avatar_fontsize_L);--_ui5-v2-17-0_avatar_icon_XL: var(--_ui5-v2-17-0_avatar_fontsize_XL);--_ui5-v2-17-0_avatar_group_button_focus_border: none;--_ui5-v2-17-0_avatar_group_padding: .3rem;--_ui5-v2-17-0_avatar_group_focus_border_radius: .375rem;--_ui5-v2-17-0-tag-height: 1rem;--_ui5-v2-17-0-tag-icon-width: .75rem;--ui5-v2-17-0-tag-text-shadow: var(--sapContent_TextShadow);--ui5-v2-17-0-tag-contrast-text-shadow: var(--sapContent_ContrastTextShadow);--ui5-v2-17-0-tag-information-text-shadow: var(--ui5-v2-17-0-tag-text-shadow);--ui5-v2-17-0-tag-set2-color-scheme-1-border: var(--sapIndicationColor_1b_BorderColor);--ui5-v2-17-0-tag-set2-color-scheme-1-hover-background: var(--sapIndicationColor_1b_Hover_Background);--ui5-v2-17-0-tag-set2-color-scheme-1-active-color: var(--sapIndicationColor_1_Active_TextColor);--ui5-v2-17-0-tag-set2-color-scheme-1-active-background: var(--sapIndicationColor_1_Active_Background);--ui5-v2-17-0-tag-set2-color-scheme-1-active-border: var(--sapIndicationColor_1_Active_BorderColor);--ui5-v2-17-0-tag-set2-color-scheme-2-border: var(--sapIndicationColor_2b_BorderColor);--ui5-v2-17-0-tag-set2-color-scheme-2-hover-background: var(--sapIndicationColor_2b_Hover_Background);--ui5-v2-17-0-tag-set2-color-scheme-2-active-color: var(--sapIndicationColor_2_Active_TextColor);--ui5-v2-17-0-tag-set2-color-scheme-2-active-background: var(--sapIndicationColor_2_Active_Background);--ui5-v2-17-0-tag-set2-color-scheme-2-active-border: var(--sapIndicationColor_2_Active_BorderColor);--ui5-v2-17-0-tag-set2-color-scheme-3-border: var(--sapIndicationColor_3b_BorderColor);--ui5-v2-17-0-tag-set2-color-scheme-3-hover-background: var(--sapIndicationColor_3b_Hover_Background);--ui5-v2-17-0-tag-set2-color-scheme-3-active-color: var(--sapIndicationColor_3_Active_TextColor);--ui5-v2-17-0-tag-set2-color-scheme-3-active-background: var(--sapIndicationColor_3_Active_Background);--ui5-v2-17-0-tag-set2-color-scheme-3-active-border: var(--sapIndicationColor_3_Active_BorderColor);--ui5-v2-17-0-tag-set2-color-scheme-4-border: var(--sapIndicationColor_4b_BorderColor);--ui5-v2-17-0-tag-set2-color-scheme-4-hover-background: var(--sapIndicationColor_4b_Hover_Background);--ui5-v2-17-0-tag-set2-color-scheme-4-active-color: var(--sapIndicationColor_4_Active_TextColor);--ui5-v2-17-0-tag-set2-color-scheme-4-active-background: var(--sapIndicationColor_4_Active_Background);--ui5-v2-17-0-tag-set2-color-scheme-4-active-border: var(--sapIndicationColor_4_Active_BorderColor);--ui5-v2-17-0-tag-set2-color-scheme-5-border: var(--sapIndicationColor_5b_BorderColor);--ui5-v2-17-0-tag-set2-color-scheme-5-hover-background: var(--sapIndicationColor_5b_Hover_Background);--ui5-v2-17-0-tag-set2-color-scheme-5-active-color: var(--sapIndicationColor_5_Active_TextColor);--ui5-v2-17-0-tag-set2-color-scheme-5-active-background: var(--sapIndicationColor_5_Active_Background);--ui5-v2-17-0-tag-set2-color-scheme-5-active-border: var(--sapIndicationColor_5_Active_BorderColor);--ui5-v2-17-0-tag-set2-color-scheme-6-border: var(--sapIndicationColor_6b_BorderColor);--ui5-v2-17-0-tag-set2-color-scheme-6-hover-background: var(--sapIndicationColor_6b_Hover_Background);--ui5-v2-17-0-tag-set2-color-scheme-6-active-color: var(--sapIndicationColor_6_Active_TextColor);--ui5-v2-17-0-tag-set2-color-scheme-6-active-background: var(--sapIndicationColor_6_Active_Background);--ui5-v2-17-0-tag-set2-color-scheme-6-active-border: var(--sapIndicationColor_6_Active_BorderColor);--ui5-v2-17-0-tag-set2-color-scheme-7-border: var(--sapIndicationColor_7b_BorderColor);--ui5-v2-17-0-tag-set2-color-scheme-7-hover-background: var(--sapIndicationColor_7b_Hover_Background);--ui5-v2-17-0-tag-set2-color-scheme-7-active-color: var(--sapIndicationColor_7_Active_TextColor);--ui5-v2-17-0-tag-set2-color-scheme-7-active-background: var(--sapIndicationColor_7_Active_Background);--ui5-v2-17-0-tag-set2-color-scheme-7-active-border: var(--sapIndicationColor_7_Active_BorderColor);--ui5-v2-17-0-tag-set2-color-scheme-8-border: var(--sapIndicationColor_8b_BorderColor);--ui5-v2-17-0-tag-set2-color-scheme-8-hover-background: var(--sapIndicationColor_8b_Hover_Background);--ui5-v2-17-0-tag-set2-color-scheme-8-active-color: var(--sapIndicationColor_8_Active_TextColor);--ui5-v2-17-0-tag-set2-color-scheme-8-active-background: var(--sapIndicationColor_8_Active_Background);--ui5-v2-17-0-tag-set2-color-scheme-8-active-border: var(--sapIndicationColor_8_Active_BorderColor);--ui5-v2-17-0-tag-set2-color-scheme-9-border: var(--sapIndicationColor_9b_BorderColor);--ui5-v2-17-0-tag-set2-color-scheme-9-hover-background: var(--sapIndicationColor_9b_Hover_Background);--ui5-v2-17-0-tag-set2-color-scheme-9-active-color: var(--sapIndicationColor_9_Active_TextColor);--ui5-v2-17-0-tag-set2-color-scheme-9-active-background: var(--sapIndicationColor_9_Active_Background);--ui5-v2-17-0-tag-set2-color-scheme-9-active-border: var(--sapIndicationColor_9_Active_BorderColor);--ui5-v2-17-0-tag-set2-color-scheme-10-border: var(--sapIndicationColor_10b_BorderColor);--ui5-v2-17-0-tag-set2-color-scheme-10-hover-background: var(--sapIndicationColor_10b_Hover_Background);--ui5-v2-17-0-tag-set2-color-scheme-10-active-color: var(--sapIndicationColor_10_Active_TextColor);--ui5-v2-17-0-tag-set2-color-scheme-10-active-background: var(--sapIndicationColor_10_Active_Background);--ui5-v2-17-0-tag-set2-color-scheme-10-active-border: var(--sapIndicationColor_10_Active_BorderColor);--_ui5-v2-17-0-tag-height_size_l: 1.5rem;--_ui5-v2-17-0-tag-min-width_size_l: 1.75rem;--_ui5-v2-17-0-tag-font-size_size_l: 1.25rem;--_ui5-v2-17-0-tag-icon_min_width_size_l: 1.25rem;--_ui5-v2-17-0-tag-icon_min_height_size_l:1.25rem;--_ui5-v2-17-0-tag-icon_height_size_l: 1.25rem;--_ui5-v2-17-0-tag-text_padding_size_l: .125rem .25rem;--_ui5-v2-17-0-tag-text-padding: .1875rem .25rem;--_ui5-v2-17-0-tag-padding-inline-icon-only: .313rem;--_ui5-v2-17-0-tag-text-transform: none;--_ui5-v2-17-0-tag-icon-gap: .25rem;--_ui5-v2-17-0-tag-font-weight: normal;--_ui5-v2-17-0-tag-letter-spacing: normal;--ui5-v2-17-0-tag-set2-color-scheme-1-color: var(--sapIndicationColor_1b_TextColor);--ui5-v2-17-0-tag-set2-color-scheme-1-background: var(--sapIndicationColor_1b_Background);--ui5-v2-17-0-tag-set2-color-scheme-2-color: var(--sapIndicationColor_2b_TextColor);--ui5-v2-17-0-tag-set2-color-scheme-2-background: var(--sapIndicationColor_2b_Background);--ui5-v2-17-0-tag-set2-color-scheme-3-color: var(--sapIndicationColor_3b_TextColor);--ui5-v2-17-0-tag-set2-color-scheme-3-background: var(--sapIndicationColor_3b_Background);--ui5-v2-17-0-tag-set2-color-scheme-4-color: var(--sapIndicationColor_4b_TextColor);--ui5-v2-17-0-tag-set2-color-scheme-4-background: var(--sapIndicationColor_4b_Background);--ui5-v2-17-0-tag-set2-color-scheme-5-color: var(--sapIndicationColor_5b_TextColor);--ui5-v2-17-0-tag-set2-color-scheme-5-background: var(--sapIndicationColor_5b_Background);--ui5-v2-17-0-tag-set2-color-scheme-6-color: var(--sapIndicationColor_6b_TextColor);--ui5-v2-17-0-tag-set2-color-scheme-6-background: var(--sapIndicationColor_6b_Background);--ui5-v2-17-0-tag-set2-color-scheme-7-color: var(--sapIndicationColor_7b_TextColor);--ui5-v2-17-0-tag-set2-color-scheme-7-background: var(--sapIndicationColor_7b_Background);--ui5-v2-17-0-tag-set2-color-scheme-8-color: var(--sapIndicationColor_8b_TextColor);--ui5-v2-17-0-tag-set2-color-scheme-8-background: var(--sapIndicationColor_8b_Background);--ui5-v2-17-0-tag-set2-color-scheme-9-color: var(--sapIndicationColor_9b_TextColor);--ui5-v2-17-0-tag-set2-color-scheme-9-background: var(--sapIndicationColor_9b_Background);--ui5-v2-17-0-tag-set2-color-scheme-10-color: var(--sapIndicationColor_10b_TextColor);--ui5-v2-17-0-tag-set2-color-scheme-10-background: var(--sapIndicationColor_10b_Background);--_ui5-v2-17-0_bar_base_height: 2.75rem;--_ui5-v2-17-0_bar_subheader_height: 3rem;--_ui5-v2-17-0_bar-start-container-padding-start: 1rem;--_ui5-v2-17-0_bar-mid-container-padding-start-end: .5rem;--_ui5-v2-17-0_bar-end-container-padding-end: 1rem;--_ui5-v2-17-0_bar_subheader_margin-top: -.0625rem;--_ui5-v2-17-0_breadcrumbs_margin: 0 0 .5rem 0;--_ui5-v2-17-0_busy_indicator_focus_outline: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);--_ui5-v2-17-0_busy_indicator_color: var(--sapContent_BusyColor);--_ui5-v2-17-0-button-badge-diameter: .75rem;--_ui5-v2-17-0-calendar-legend-root-padding: .75rem;--_ui5-v2-17-0-calendar-legend-root-width: 18.5rem;--_ui5-v2-17-0-calendar-legend-item-root-width: 7.75rem;--_ui5-v2-17-0-calendar-legend-item-root-focus-border: var(--sapContent_FocusWidth) solid var(--sapContent_FocusColor);--_ui5-v2-17-0-calendar-legend-item-box-dot-display: block;--_ui5-v2-17-0_card_box_shadow: var(--sapContent_Shadow0);--_ui5-v2-17-0_card_border-radius: var(--sapTile_BorderCornerRadius);--_ui5-v2-17-0_card_header_border_color: var(--sapTile_SeparatorColor);--_ui5-v2-17-0_card_header_focus_border: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);--_ui5-v2-17-0_card_header_focus_bottom_radius: 0px;--_ui5-v2-17-0_card_header_title_font_weight: normal;--_ui5-v2-17-0_card_header_subtitle_margin_top: .25rem;--_ui5-v2-17-0_card_hover_box_shadow: var(--sapContent_Shadow2);--_ui5-v2-17-0_card_header_focus_offset: 0px;--_ui5-v2-17-0_card_header_focus_radius: var(--_ui5-v2-17-0_card_border-radius);--_ui5-v2-17-0_card_header_title_font_family: var(--sapFontHeaderFamily);--_ui5-v2-17-0_card_header_title_font_size: var(--sapFontHeader6Size);--_ui5-v2-17-0_card_header_hover_bg: var(--sapTile_Hover_Background);--_ui5-v2-17-0_card_header_active_bg: var(--sapTile_Active_Background);--_ui5-v2-17-0_card_header_border: none;--_ui5-v2-17-0_card_header_padding: 1rem 1rem .75rem 1rem;--_ui5-v2-17-0_card_border: none;--ui5-v2-17-0_carousel_background_color_solid: var(--sapGroup_ContentBackground);--ui5-v2-17-0_carousel_background_color_translucent: var(--sapBackgroundColor);--ui5-v2-17-0_carousel_button_size: 2.25rem;--ui5-v2-17-0_carousel_inactive_dot_size: .25rem;--ui5-v2-17-0_carousel_inactive_dot_margin: 0 .375rem;--ui5-v2-17-0_carousel_inactive_dot_border: 1px solid var(--sapContent_ForegroundBorderColor);--ui5-v2-17-0_carousel_inactive_dot_background: var(--sapContent_ForegroundBorderColor);--ui5-v2-17-0_carousel_active_dot_border: 1px solid var(--sapContent_Selected_ForegroundColor);--ui5-v2-17-0_carousel_active_dot_background: var(--sapContent_Selected_ForegroundColor);--ui5-v2-17-0_carousel_navigation_button_active_box_shadow: none;--_ui5-v2-17-0_checkbox_transition: unset;--_ui5-v2-17-0_checkbox_border_radius: 0;--_ui5-v2-17-0_checkbox_focus_outline: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);--_ui5-v2-17-0_checkbox_outer_hover_background: transparent;--_ui5-v2-17-0_checkbox_inner_width_height: 1.375rem;--_ui5-v2-17-0_checkbox_inner_disabled_border_color: var(--sapField_BorderColor);--_ui5-v2-17-0_checkbox_inner_background: var(--sapField_Background);--_ui5-v2-17-0_checkbox_wrapped_focus_padding: .5rem;--_ui5-v2-17-0_checkbox_wrapped_focus_inset_block: var(--_ui5-v2-17-0_checkbox_focus_position);--_ui5-v2-17-0_checkbox_compact_wrapper_padding: .5rem;--_ui5-v2-17-0_checkbox_compact_width_height: 2rem;--_ui5-v2-17-0_checkbox_compact_inner_size: 1rem;--_ui5-v2-17-0_checkbox_compact_focus_position: .375rem;--_ui5-v2-17-0_checkbox_label_offset: var(--_ui5-v2-17-0_checkbox_wrapper_padding);--_ui5-v2-17-0_checkbox_disabled_label_color: var(--sapContent_LabelColor);--_ui5-v2-17-0_checkbox_default_focus_border: none;--_ui5-v2-17-0_checkbox_focus_outline_display: block;--_ui5-v2-17-0_checkbox_wrapper_padding: .6875rem;--_ui5-v2-17-0_checkbox_width_height: 2.75rem;--_ui5-v2-17-0_checkbox_label_color: var(--sapField_TextColor);--_ui5-v2-17-0_checkbox_inner_border: solid var(--sapField_BorderWidth) var(--sapField_BorderColor);--_ui5-v2-17-0_checkbox_inner_border_radius: var(--sapField_BorderCornerRadius);--_ui5-v2-17-0_checkbox_checkmark_color: var(--sapContent_Selected_ForegroundColor);--_ui5-v2-17-0_checkbox_hover_background: var(--sapContent_Selected_Hover_Background);--_ui5-v2-17-0_checkbox_inner_hover_border_color: var(--sapField_Hover_BorderColor);--_ui5-v2-17-0_checkbox_inner_hover_checked_border_color: var(--sapField_Hover_BorderColor);--_ui5-v2-17-0_checkbox_inner_selected_border_color: var(--sapField_BorderColor);--_ui5-v2-17-0_checkbox_inner_active_border_color: var(--sapField_Hover_BorderColor);--_ui5-v2-17-0_checkbox_active_background: var(--sapContent_Selected_Hover_Background);--_ui5-v2-17-0_checkbox_inner_readonly_border: var(--sapElement_BorderWidth) var(--sapField_ReadOnly_BorderColor) dashed;--_ui5-v2-17-0_checkbox_inner_error_border: var(--sapField_InvalidBorderWidth) solid var(--sapField_InvalidColor);--_ui5-v2-17-0_checkbox_inner_error_background_hover: var(--sapField_Hover_Background);--_ui5-v2-17-0_checkbox_inner_warning_border: var(--sapField_WarningBorderWidth) solid var(--sapField_WarningColor);--_ui5-v2-17-0_checkbox_inner_warning_color: var(--sapField_WarningColor);--_ui5-v2-17-0_checkbox_inner_warning_background_hover: var(--sapField_Hover_Background);--_ui5-v2-17-0_checkbox_checkmark_warning_color: var(--sapField_WarningColor);--_ui5-v2-17-0_checkbox_inner_success_border: var(--sapField_SuccessBorderWidth) solid var(--sapField_SuccessColor);--_ui5-v2-17-0_checkbox_inner_success_background_hover: var(--sapField_Hover_Background);--_ui5-v2-17-0_checkbox_inner_information_color: var(--sapField_InformationColor);--_ui5-v2-17-0_checkbox_inner_information_border: var(--sapField_InformationBorderWidth) solid var(--sapField_InformationColor);--_ui5-v2-17-0_checkbox_inner_information_background_hover: var(--sapField_Hover_Background);--_ui5-v2-17-0_checkbox_disabled_opacity: var(--sapContent_DisabledOpacity);--_ui5-v2-17-0_checkbox_focus_position: .3125rem;--_ui5-v2-17-0_checkbox_focus_border_radius: .5rem;--_ui5-v2-17-0_checkbox_right_focus_distance: .3125rem;--_ui5-v2-17-0_color-palette-item-after-focus-inset: .0625rem;--_ui5-v2-17-0_color-palette-item-outer-border-radius: .25rem;--_ui5-v2-17-0_color-palette-item-inner-border-radius: .1875rem;--_ui5-v2-17-0_color-palette-item-after-not-focus-color: .0625rem solid var(--sapGroup_ContentBackground);--_ui5-v2-17-0-color-palette-item-background-color: transparent;--_ui5-v2-17-0_color-palette-item-hover-margin: .0625rem;--_ui5-v2-17-0_color-palette-row-height: 9.5rem;--_ui5-v2-17-0_color-palette-button-height: 3rem;--_ui5-v2-17-0_color-palette-item-before-focus-color: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-17-0_color-palette-item-before-focus-inset: -.3125rem;--_ui5-v2-17-0_color-palette-item-before-focus-hover-inset: -.0625rem;--_ui5-v2-17-0_color-palette-item-after-focus-color: .0625rem solid var(--sapContent_ContrastFocusColor);--_ui5-v2-17-0_color-palette-item-after-focus-hover-inset: .0625rem;--_ui5-v2-17-0_color-palette-item-before-focus-border-radius: .4375rem;--_ui5-v2-17-0_color-palette-item-after-focus-border-radius: .3125rem;--_ui5-v2-17-0_color-palette-item-hover-outer-border-radius: .4375rem;--_ui5-v2-17-0_color-palette-item-hover-inner-border-radius: .375rem;--_ui5-v2-17-0_color-palette-item-selected-focused-border-before: -.0625rem;--_ui5-v2-17-0_color-palette-item-after-focus-not-selected-border: none;--_ui5-v2-17-0_color-palette-item-selected-focused-border: none;--_ui5-v2-17-0_color-palette-item-mobile-focus-sides-inset: -.375rem -.375rem;--_ui5-v2-17-0-color-palette-item-mobile-focus-inset: 0px;--_ui5-v2-17-0_color-palette-item-after-mobile-focus-border: none;--_ui5-v2-17-0_color_picker_slider_handle_box_shadow: inset 0 0 0 .125rem var(--sapContent_ContrastShadowColor);--_ui5-v2-17-0_color_picker_slider_handle_inner_border_color: #fff;--_ui5-v2-17-0_color_picker_circle_outer_border: .0625rem solid var(--sapContent_ContrastShadowColor);--_ui5-v2-17-0_color_picker_circle_inner_border: var(--sapField_Picker_BorderWidth) solid var(--sapField_BorderColor);--_ui5-v2-17-0_color_picker_circle_inner_circle_size: .5625rem;--_ui5-v2-17-0_color_picker_slider_handle_container_margin_top: none;--_ui5-v2-17-0_color_picker_slider_handle_border: .125rem solid var(--sapField_BorderColor);--_ui5-v2-17-0_color_picker_slider_handle_outline_hover: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-17-0_color_picker_slider_handle_outline_focus: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-17-0_color_picker_slider_handle_inline_focus: 1px solid var(--sapContent_ContrastFocusColor);--_ui5-v2-17-0-datepicker-hover-background: var(--sapField_Hover_Background);--_ui5-v2-17-0-datepicker_border_radius: .25rem;--_ui5-v2-17-0_daypicker_item_margin: 2px;--_ui5-v2-17-0_daypicker_item_border: none;--_ui5-v2-17-0_daypicker_item_selected_border_color: var(--sapList_Background);--_ui5-v2-17-0_daypicker_daynames_container_height: 2rem;--_ui5-v2-17-0_daypicker_weeknumbers_container_padding_top: 2rem;--_ui5-v2-17-0_daypicker_item_othermonth_background_color: var(--sapList_Background);--_ui5-v2-17-0_daypicker_item_othermonth_color: var(--sapContent_LabelColor);--_ui5-v2-17-0_daypicker_item_othermonth_hover_color: var(--sapContent_LabelColor);--_ui5-v2-17-0_daypicker_item_selected_background: transparent;--_ui5-v2-17-0_daypicker_item_selected_between_hover_background: var(--sapList_Hover_SelectionBackground);--_ui5-v2-17-0_daypicker_item_now_not_selected_inset: 0;--_ui5-v2-17-0_daypicker_item_now_border_color: var(--sapLegend_CurrentDateTime);--_ui5-v2-17-0_dp_two_calendar_item_secondary_text_border_radios: .25rem;--_ui5-v2-17-0_daypicker_special_day_top: 2.5rem;--_ui5-v2-17-0_daypicker_special_day_before_border_color: var(--sapList_Background);--_ui5-v2-17-0_daypicker_selected_item_now_special_day_border_bottom_radius: 0;--_ui5-v2-17-0_daypicker_twocalendar_item_special_day_after_border_width: .125rem;--_ui5-v2-17-0_daypicker_twocalendar_item_special_day_dot: .375rem;--_ui5-v2-17-0_daypicker_twocalendar_item_special_day_top: 2rem;--_ui5-v2-17-0_daypicker_twocalendar_item_special_day_right: 1.4375rem;--_ui5-v2-17-0_daypicker_item_border_radius: .4375rem;--_ui5-v2-17-0_daypicker_item_selected_border: .0625rem solid var(--sapList_SelectionBorderColor);--_ui5-v2-17-0_daypicker_item_not_selected_focus_border: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-17-0_daypicker_item_selected_focus_color: var(--sapContent_FocusColor);--_ui5-v2-17-0_daypicker_item_selected_focus_width: .125rem;--_ui5-v2-17-0_daypicker_item_no_selected_inset: .375rem;--_ui5-v2-17-0_daypicker_item_now_border_focus_after: .125rem solid var(--sapList_SelectionBorderColor);--_ui5-v2-17-0_daypicker_item_now_border_radius_focus_after: .3125rem;--_ui5-v2-17-0_day_picker_item_selected_now_border_focus: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-17-0_day_picker_item_selected_now_border_radius_focus: .1875rem;--_ui5-v2-17-0_daypicker_dayname_color: var(--sapContent_LabelColor);--_ui5-v2-17-0_daypicker_weekname_color: var(--sapContent_LabelColor);--_ui5-v2-17-0_daypicker_item_selected_daytext_hover_background: transparent;--_ui5-v2-17-0_daypicker_item_border_radius_item: .5rem;--_ui5-v2-17-0_daypicker_item_border_radius_focus_after: .1875rem;--_ui5-v2-17-0_daypicker_item_selected_between_border: .5rem;--_ui5-v2-17-0_daypicker_item_selected_between_background: var(--sapList_SelectionBackgroundColor);--_ui5-v2-17-0_daypicker_item_selected_between_text_font: var(--sapFontFamily);--_ui5-v2-17-0_daypicker_item_selected_text_font: var(--sapFontBoldFamily);--_ui5-v2-17-0_daypicker_item_now_box_shadow: inset 0 0 0 .35rem var(--sapList_Background);--_ui5-v2-17-0_daypicker_item_selected_text_outline: .0625rem solid var(--sapSelectedColor);--_ui5-v2-17-0_daypicker_item_now_selected_outline_offset: -.25rem;--_ui5-v2-17-0_daypicker_item_now_selected_between_inset: .25rem;--_ui5-v2-17-0_daypicker_item_now_selected_between_border: .0625rem solid var(--sapContent_Selected_ForegroundColor);--_ui5-v2-17-0_daypicker_item_now_selected_between_border_radius: .1875rem;--_ui5-v2-17-0_daypicker_item_select_between_border: 1px solid var(--sapContent_Selected_ForegroundColor);--_ui5-v2-17-0_daypicker_item_weeekend_filter: brightness(105%);--_ui5-v2-17-0_daypicker_item_selected_hover: var(--sapList_Hover_Background);--_ui5-v2-17-0_daypicker_item_now_inset: .3125rem;--_ui5-v2-17-0-dp-item_withsecondtype_border: .25rem;--_ui5-v2-17-0_daypicker_item_selected__secondary_type_text_outline: .0625rem solid var(--sapSelectedColor);--_ui5-v2-17-0_daypicker_two_calendar_item_now_day_text_content: "";--_ui5-v2-17-0_daypicker_two_calendar_item_now_selected_border_width: .125rem;--_ui5-v2-17-0_daypicker_two_calendar_item_border_radius: .5rem;--_ui5-v2-17-0_daypicker_two_calendar_item_border_focus_border_radius: .375rem;--_ui5-v2-17-0_daypicker_two_calendar_item_no_selected_inset: 0;--_ui5-v2-17-0_daypicker_two_calendar_item_selected_now_border_radius_focus: .1875rem;--_ui5-v2-17-0_daypicker_two_calendar_item_no_selected_focus_inset: .1875rem;--_ui5-v2-17-0_daypicker_two_calendar_item_no_select_focus_border_radius: .3125rem;--_ui5-v2-17-0_daypicker_two_calendar_item_now_inset: .3125rem;--_ui5-v2-17-0_daypicker_two_calendar_item_now_selected_border_inset: .125rem;--_ui5-v2-17-0_daypicker_selected_item_special_day_width: calc(100% - .125rem) ;--_ui5-v2-17-0_daypicker_special_day_border_bottom_radius: .5rem;--_ui5-v2-17-0-daypicker_item_selected_now_border_radius: .5rem;--_ui5-v2-17-0_daypicker_selected_item_now_special_day_width: calc(100% - .1875rem) ;--_ui5-v2-17-0_daypicker_selected_item_now_special_day_border_bottom_radius_alternate: .5rem;--_ui5-v2-17-0_daypicker_selected_item_now_special_day_top: 2.4375rem;--_ui5-v2-17-0_daypicker_two_calendar_item_margin_bottom: 0;--_ui5-v2-17-0_daypicker_twocalendar_item_special_day_now_inset: .3125rem;--_ui5-v2-17-0_daypicker_twocalendar_item_special_day_now_border_radius: .25rem;--_ui5-v2-17-0_daypicker_item_now_focus_margin: 0;--_ui5-v2-17-0_daypicker_special_day_border_top: none;--_ui5-v2-17-0_daypicker_special_day_selected_border_radius_bottom: .25rem;--_ui5-v2-17-0_daypicker_specialday_focused_top: 2.125rem;--_ui5-v2-17-0_daypicker_specialday_focused_width: calc(100% - .75rem) ;--_ui5-v2-17-0_daypicker_specialday_focused_border_bottom: 0;--_ui5-v2-17-0_daypicker_item_now_specialday_top: 2.3125rem;--_ui5-v2-17-0_daypicker_item_now_specialday_width: calc(100% - .5rem) ;--_ui5-v2-17-0_dialog_header_state_line_height: .0625rem;--_ui5-v2-17-0_dialog_header_focus_bottom_offset: 2px;--_ui5-v2-17-0_dialog_header_focus_top_offset: 1px;--_ui5-v2-17-0_dialog_header_focus_left_offset: 1px;--_ui5-v2-17-0_dialog_header_focus_right_offset: 1px;--_ui5-v2-17-0_dialog_header_border_radius: var(--sapElement_BorderCornerRadius);--_ui5-v2-17-0_file_uploader_display_input_width: calc(100% - var(--_ui5-v2-17-0_input_icon_width));--_ui5-v2-17-0_file_uploader_tokenizer_width: calc(100% - 2 * var(--_ui5-v2-17-0_input_icon_width) - var(--_ui5-v2-17-0_input_inner_space_to_tokenizer));--_ui5-v2-17-0_table_cell_valign: center;--_ui5-v2-17-0_table_cell_min_width: 2.75rem;--_ui5-v2-17-0_table_navigated_cell_width: .25rem;--_ui5-v2-17-0_first_table_cell_horizontal_padding: 1rem;--_ui5-v2-17-0_table_cell_horizontal_padding: .5rem;--_ui5-v2-17-0_table_cell_vertical_padding: .25rem;--_ui5-v2-17-0_table_row_actions_gap: .25rem;--_ui5-v2-17-0_table_row_alternating_background: var(--sapTableRow_AlternatingBackground, var(--sapList_AlternatingBackground));--_ui5-v2-17-0_table_row_alternating_hover_background: var(--sapTableRow_AlternatingHoverBackground, var(--sapList_Hover_Background));--_ui5-v2-17-0_table_row_alternating_selection_background: var(--sapTableRow_AlternatingSelectionBackground, var(--sapList_SelectionBackgroundColor));--_ui5-v2-17-0_table_row_alternating_selection_hover_background: var(--sapTableRow_AlternatingSelectionHoverBackground, var(--sapList_Hover_SelectionBackground));--ui5-v2-17-0-form-item-layout: 4fr 8fr 0fr;--ui5-v2-17-0-form-item-label-justify: end;--ui5-v2-17-0-form-item-label-justify-span12: start;--ui5-v2-17-0-form-item-label-padding: .125rem 0;--ui5-v2-17-0-form-item-label-padding-end: .85rem;--ui5-v2-17-0-form-item-label-padding-span12: .625rem .25rem 0 .25rem;--ui5-v2-17-0-group-header-listitem-background-color: var(--sapList_GroupHeaderBackground);--ui5-v2-17-0-icon-focus-border-radius: .25rem;--_ui5-v2-17-0_input_width: 13.125rem;--_ui5-v2-17-0_input_min_width: 2.75rem;--_ui5-v2-17-0_input_height: var(--sapElement_Height);--_ui5-v2-17-0_input_margin_top_bottom: .25rem;--_ui5-v2-17-0_input_value_state_error_hover_background: var(--sapField_Hover_Background);--_ui5-v2-17-0_input_background_color: var(--sapField_Background);--_ui5-v2-17-0_input_border_radius: var(--sapField_BorderCornerRadius);--_ui5-v2-17-0_input_placeholder_style: italic;--_ui5-v2-17-0_input_placeholder_color: var(--sapField_PlaceholderTextColor);--_ui5-v2-17-0_input_bottom_border_height: 0;--_ui5-v2-17-0_input_bottom_border_color: transparent;--_ui5-v2-17-0_input_focused_border_color: var(--sapField_Hover_BorderColor);--_ui5-v2-17-0_input_state_border_width: .125rem;--_ui5-v2-17-0_input_information_border_width: .125rem;--_ui5-v2-17-0_input_error_font_weight: normal;--_ui5-v2-17-0_input_warning_font_weight: normal;--_ui5-v2-17-0_input_focus_border_width: 1px;--_ui5-v2-17-0_input_error_warning_font_style: inherit;--_ui5-v2-17-0_input_error_warning_text_indent: 0;--_ui5-v2-17-0_input_disabled_border_color: var(--sapField_BorderColor);--_ui5-v2-17-0-input_disabled_background: var(--sapField_Background);--_ui5-v2-17-0_input_readonly_border: none;--_ui5-v2-17-0_input_readonly_border_color: var(--sapField_ReadOnly_BorderColor);--_ui5-v2-17-0_input_readonly_background: var(--sapField_ReadOnly_Background);--_ui5-v2-17-0_input_disabled_opacity: var(--sapContent_DisabledOpacity);--_ui5-v2-17-0_input_icon_min_width: 2.25rem;--_ui5-v2-17-0_input_compact_min_width: 2rem;--_ui5-v2-17-0_input_transition: none;--_ui5-v2-17-0-input-value-state-icon-display: none;--_ui5-v2-17-0_input_value_state_error_border_color: var(--sapField_InvalidColor);--_ui5-v2-17-0_input_focused_value_state_error_border_color: var(--sapField_InvalidColor);--_ui5-v2-17-0_input_value_state_warning_border_color: var(--sapField_WarningColor);--_ui5-v2-17-0_input_focused_value_state_warning_border_color: var(--sapField_WarningColor);--_ui5-v2-17-0_input_value_state_success_border_color: var(--sapField_SuccessColor);--_ui5-v2-17-0_input_focused_value_state_success_border_color: var(--sapField_SuccessColor);--_ui5-v2-17-0_input_value_state_success_border_width: 1px;--_ui5-v2-17-0_input_value_state_information_border_color: var(--sapField_InformationColor);--_ui5-v2-17-0_input_focused_value_state_information_border_color: var(--sapField_InformationColor);--ui5-v2-17-0_input_focus_pseudo_element_content: "";--_ui5-v2-17-0_input_value_state_error_warning_placeholder_font_weight: normal;--_ui5-v2-17-0-input_error_placeholder_color: var(--sapField_PlaceholderTextColor);--_ui5-v2-17-0_input_icon_width: 2.25rem;--_ui5-v2-17-0-input-icons-count: 0;--_ui5-v2-17-0_input_tokenizer_min_width: 3.25rem;--_ui5-v2-17-0-input-border: none;--_ui5-v2-17-0_input_hover_border: none;--_ui5-v2-17-0_input_focus_border_radius: .25rem;--_ui5-v2-17-0_input_readonly_focus_border_radius: .125rem;--_ui5-v2-17-0_input_error_warning_border_style: none;--_ui5-v2-17-0_input_focused_value_state_error_background: var(--sapField_Hover_Background);--_ui5-v2-17-0_input_focused_value_state_warning_background: var(--sapField_Hover_Background);--_ui5-v2-17-0_input_focused_value_state_success_background: var(--sapField_Hover_Background);--_ui5-v2-17-0_input_focused_value_state_information_background: var(--sapField_Hover_Background);--_ui5-v2-17-0_input_focused_value_state_error_focus_outline_color: var(--sapField_InvalidColor);--_ui5-v2-17-0_input_focused_value_state_warning_focus_outline_color: var(--sapField_WarningColor);--_ui5-v2-17-0_input_focused_value_state_success_focus_outline_color: var(--sapField_SuccessColor);--_ui5-v2-17-0_input_focus_offset: 0;--_ui5-v2-17-0_input_readonly_focus_offset: .125rem;--_ui5-v2-17-0_input_information_icon_padding: .625rem .625rem .5rem .625rem;--_ui5-v2-17-0_input_information_focused_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-17-0_input_error_warning_icon_padding: .625rem .625rem .5rem .625rem;--_ui5-v2-17-0_input_error_warning_focused_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-17-0_input_custom_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-17-0_input_error_warning_custom_icon_padding: .625rem .625rem .5rem .625rem;--_ui5-v2-17-0_input_error_warning_custom_focused_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-17-0_input_information_custom_icon_padding: .625rem .625rem .5rem .625rem;--_ui5-v2-17-0_input_information_custom_focused_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-17-0_input_focus_outline_color: var(--sapField_Active_BorderColor);--_ui5-v2-17-0_input_icon_wrapper_height: calc(100% - 1px) ;--_ui5-v2-17-0_input_icon_wrapper_state_height: calc(100% - 2px) ;--_ui5-v2-17-0_input_icon_wrapper_success_state_height: calc(100% - var(--_ui5-v2-17-0_input_value_state_success_border_width));--_ui5-v2-17-0_input_icon_color: var(--sapField_TextColor);--_ui5-v2-17-0_input_icon_pressed_bg: var(--sapField_Hover_Background);--_ui5-v2-17-0_input_icon_padding: .625rem .625rem .5625rem .625rem;--_ui5-v2-17-0_input_icon_hover_bg: var(--sapField_Focus_Background);--_ui5-v2-17-0_input_icon_pressed_color: var(--sapButton_Active_TextColor);--_ui5-v2-17-0_input_icon_border_radius: var(--sapField_BorderCornerRadius);--_ui5-v2-17-0_input_icon_box_shadow: var(--sapField_Hover_Shadow);--_ui5-v2-17-0_input_icon_border: none;--_ui5-v2-17-0_input_error_icon_box_shadow: var(--sapContent_Negative_Shadow);--_ui5-v2-17-0_input_warning_icon_box_shadow: var(--sapContent_Critical_Shadow);--_ui5-v2-17-0_input_information_icon_box_shadow: var(--sapContent_Informative_Shadow);--_ui5-v2-17-0_input_success_icon_box_shadow: var(--sapContent_Positive_Shadow);--_ui5-v2-17-0_input_icon_error_pressed_color: var(--sapButton_Reject_Selected_TextColor);--_ui5-v2-17-0_input_icon_warning_pressed_color: var(--sapButton_Attention_Selected_TextColor);--_ui5-v2-17-0_input_icon_information_pressed_color: var(--sapButton_Selected_TextColor);--_ui5-v2-17-0_input_icon_success_pressed_color: var(--sapButton_Accept_Selected_TextColor);--_ui5-v2-17-0_link_focus_text_decoration: underline;--_ui5-v2-17-0_link_text_decoration: var(--sapLink_TextDecoration);--_ui5-v2-17-0_link_hover_text_decoration: var(--sapLink_Hover_TextDecoration);--_ui5-v2-17-0_link_focused_hover_text_decoration: none;--_ui5-v2-17-0_link_focused_hover_text_color: var(--sapContent_ContrastTextColor);--_ui5-v2-17-0_link_active_text_decoration: var(--sapLink_Active_TextDecoration);--_ui5-v2-17-0_link_outline: none;--_ui5-v2-17-0_link_focus_border-radius: .125rem;--_ui5-v2-17-0_link_focus_background_color: var(--sapContent_FocusColor);--_ui5-v2-17-0_link_focus_color: var(--sapContent_ContrastTextColor);--_ui5-v2-17-0_link_subtle_text_decoration: underline;--_ui5-v2-17-0_link_subtle_text_decoration_hover: none;--_ui5-v2-17-0_link_large_interactive_area_height: 1.5rem;--ui5-v2-17-0_list_footer_text_color: var(--sapList_FooterTextColor);--ui5-v2-17-0-listitem-background-color: var(--sapList_Background);--ui5-v2-17-0-listitem-border-bottom: var(--sapList_BorderWidth) solid var(--sapList_BorderColor);--ui5-v2-17-0-listitem-selected-border-bottom: 1px solid var(--sapList_SelectionBorderColor);--ui5-v2-17-0-listitem-focused-selected-border-bottom: 1px solid var(--sapList_SelectionBorderColor);--_ui5-v2-17-0-listitembase_disabled_opacity: .5;--_ui5-v2-17-0_product_switch_item_border: none;--_ui5-v2-17-0_menu_item_padding: 0 1rem 0 .75rem;--_ui5-v2-17-0_menu_item_submenu_icon_right: 1rem;--_ui5-v2-17-0_menu_popover_border_radius: var(--sapPopover_BorderCornerRadius);--_ui5-v2-17-0_monthpicker_item_margin: .0625rem;--_ui5-v2-17-0_monthpicker_item_border: .0625rem solid var(--sapButton_Lite_BorderColor);--_ui5-v2-17-0_monthpicker_item_hover_border: .0625rem solid var(--sapButton_Lite_Hover_BorderColor);--_ui5-v2-17-0_monthpicker_item_active_border: .0625rem solid var(--sapButton_Lite_Active_BorderColor);--_ui5-v2-17-0_monthpicker_item_selected_border: .0625rem solid var(--sapButton_Selected_BorderColor);--_ui5-v2-17-0_monthpicker_item_selected_hover_border: .0625rem solid var(--sapButton_Selected_Hover_BorderColor);--_ui5-v2-17-0_monthpicker_item_border_radius: .5rem;--_ui5-v2-17-0_message_strip_padding: .4375rem 2.5rem .4375rem 2.5rem;--_ui5-v2-17-0_message_strip_padding_block_no_icon: .4375rem .4375rem;--_ui5-v2-17-0_message_strip_padding_inline_no_icon: 1rem 2.5rem;--_ui5-v2-17-0_message_strip_border_width: var(--sapMessage_BorderWidth);--_ui5-v2-17-0_message_strip_icon_top: .4375rem;--_ui5-v2-17-0_message_strip_close_button_top: .125rem;--_ui5-v2-17-0_message_strip_close_button_color_set_1_background: var(--sapMessage_Button_Hover_Background);--_ui5-v2-17-0_message_strip_close_button_color_set_2_background: var(--sapMessage_Button_Hover_Background);--_ui5-v2-17-0_message_strip_close_button_color_set_1_color: var(--sapContent_ContrastIconColor);--_ui5-v2-17-0_message_strip_scheme_1_set_2_background: var(--sapIndicationColor_1b);--_ui5-v2-17-0_message_strip_scheme_1_set_2_border_color: var(--sapIndicationColor_1b_BorderColor);--_ui5-v2-17-0_message_strip_scheme_2_set_2_background: var(--sapIndicationColor_2b);--_ui5-v2-17-0_message_strip_scheme_2_set_2_border_color: var(--sapIndicationColor_2b_BorderColor);--_ui5-v2-17-0_message_strip_scheme_3_set_2_background: var(--sapIndicationColor_3b);--_ui5-v2-17-0_message_strip_scheme_3_set_2_border_color: var(--sapIndicationColor_3b_BorderColor);--_ui5-v2-17-0_message_strip_scheme_4_set_2_background: var(--sapIndicationColor_4b);--_ui5-v2-17-0_message_strip_scheme_4_set_2_border_color: var(--sapIndicationColor_4b_BorderColor);--_ui5-v2-17-0_message_strip_scheme_5_set_2_background: var(--sapIndicationColor_5b);--_ui5-v2-17-0_message_strip_scheme_5_set_2_border_color: var(--sapIndicationColor_5b_BorderColor);--_ui5-v2-17-0_message_strip_scheme_6_set_2_background: var(--sapIndicationColor_6b);--_ui5-v2-17-0_message_strip_scheme_6_set_2_border_color: var(--sapIndicationColor_6b_BorderColor);--_ui5-v2-17-0_message_strip_scheme_7_set_2_background: var(--sapIndicationColor_7b);--_ui5-v2-17-0_message_strip_scheme_7_set_2_border_color: var(--sapIndicationColor_7b_BorderColor);--_ui5-v2-17-0_message_strip_scheme_8_set_2_background: var(--sapIndicationColor_8b);--_ui5-v2-17-0_message_strip_scheme_8_set_2_border_color: var(--sapIndicationColor_8b_BorderColor);--_ui5-v2-17-0_message_strip_scheme_9_set_2_background: var(--sapIndicationColor_9b);--_ui5-v2-17-0_message_strip_scheme_9_set_2_border_color: var(--sapIndicationColor_9b_BorderColor);--_ui5-v2-17-0_message_strip_scheme_10_set_2_background: var(--sapIndicationColor_10b);--_ui5-v2-17-0_message_strip_scheme_10_set_2_border_color: var(--sapIndicationColor_10b_BorderColor);--_ui5-v2-17-0_message_strip_close_button_right: .1875rem;--_ui5-v2-17-0_panel_focus_border: var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);--_ui5-v2-17-0_panel_header_height: 2.75rem;--_ui5-v2-17-0_panel_button_root_width: 2.75rem;--_ui5-v2-17-0_panel_button_root_height: 2.75rem;--_ui5-v2-17-0_panel_header_padding_right: .5rem;--_ui5-v2-17-0_panel_header_button_wrapper_padding: .25rem;--_ui5-v2-17-0_panel_border_radius: var(--sapGroup_BorderCornerRadius);--_ui5-v2-17-0_panel_border_bottom: none;--_ui5-v2-17-0_panel_default_header_border: .0625rem solid var(--sapGroup_TitleBorderColor);--_ui5-v2-17-0_panel_border_radius_expanded: var(--sapElement_BorderCornerRadius) var(--sapElement_BorderCornerRadius) 0 0;--_ui5-v2-17-0_panel_icon_color: var(--sapButton_Lite_TextColor);--_ui5-v2-17-0_panel_focus_offset: 0px;--_ui5-v2-17-0_panel_focus_bottom_offset: -1px;--_ui5-v2-17-0_panel_content_padding: .625rem 1rem;--_ui5-v2-17-0_panel_header_background_color: var(--sapGroup_TitleBackground);--_ui5-v2-17-0_popover_background: var(--sapGroup_ContentBackground);--_ui5-v2-17-0_popover_box_shadow: var(--sapContent_Shadow2);--_ui5-v2-17-0_popover_no_arrow_box_shadow: var(--sapContent_Shadow1);--_ui5-v2-17-0_popup_content_padding_s: 1rem;--_ui5-v2-17-0_popup_content_padding_m_l: 2rem;--_ui5-v2-17-0_popup_content_padding_xl: 3rem;--_ui5-v2-17-0_popup_header_footer_padding_s: 1rem;--_ui5-v2-17-0_popup_header_footer_padding_m_l: 2rem;--_ui5-v2-17-0_popup_header_footer_padding_xl: 3rem;--_ui5-v2-17-0_popup_viewport_margin: 10px;--_ui5-v2-17-0_popup_header_prop_header_text_alignment: flex-start;--_ui5-v2-17-0_popup_header_shadow: var(--sapContent_HeaderShadow);--_ui5-v2-17-0_popup_header_border: none;--_ui5-v2-17-0_popup_border_radius: .5rem;--_ui5-v2-17-0_popup_block_layer_background: var(--sapBlockLayer_Background);--_ui5-v2-17-0_popup_block_layer_opacity: .2;--_ui5-v2-17-0_progress_indicator_bar_border_max: none;--_ui5-v2-17-0_progress_indicator_icon_visibility: inline-block;--_ui5-v2-17-0_progress_indicator_side_points_visibility: block;--_ui5-v2-17-0_progress_indicator_padding: 1.25rem 0 .75rem 0;--_ui5-v2-17-0_progress_indicator_padding_novalue: .3125rem;--_ui5-v2-17-0_progress_indicator_padding_end: 1.25rem;--_ui5-v2-17-0_progress_indicator_host_height: unset;--_ui5-v2-17-0_progress_indicator_host_box_sizing: border-box;--_ui5-v2-17-0_progress_indicator_root_position: relative;--_ui5-v2-17-0_progress_indicator_root_border_radius: .25rem;--_ui5-v2-17-0_progress_indicator_root_height: .375rem;--_ui5-v2-17-0_progress_indicator_root_min_height: .375rem;--_ui5-v2-17-0_progress_indicator_root_overflow: visible;--_ui5-v2-17-0_progress_indicator_bar_height: .625rem;--_ui5-v2-17-0_progress_indicator_bar_border_radius: .5rem;--_ui5-v2-17-0_progress_indicator_remaining_bar_border_radius: .25rem;--_ui5-v2-17-0_progress_indicator_remaining_bar_position: absolute;--_ui5-v2-17-0_progress_indicator_remaining_bar_width: 100%;--_ui5-v2-17-0_progress_indicator_remaining_bar_overflow: visible;--_ui5-v2-17-0_progress_indicator_icon_position: absolute;--_ui5-v2-17-0_progress_indicator_icon_right_position: -1.25rem;--_ui5-v2-17-0_progress_indicator_value_margin: 0 0 .1875rem 0;--_ui5-v2-17-0_progress_indicator_value_position: absolute;--_ui5-v2-17-0_progress_indicator_value_top_position: -1.3125rem;--_ui5-v2-17-0_progress_indicator_value_left_position: 0;--_ui5-v2-17-0_progress_indicator_background_none: var(--sapProgress_Background);--_ui5-v2-17-0_progress_indicator_background_error: var(--sapProgress_NegativeBackground);--_ui5-v2-17-0_progress_indicator_background_warning: var(--sapProgress_CriticalBackground);--_ui5-v2-17-0_progress_indicator_background_success: var(--sapProgress_PositiveBackground);--_ui5-v2-17-0_progress_indicator_background_information: var(--sapProgress_InformationBackground);--_ui5-v2-17-0_progress_indicator_value_state_none: var(--sapProgress_Value_Background);--_ui5-v2-17-0_progress_indicator_value_state_error: var(--sapProgress_Value_NegativeBackground);--_ui5-v2-17-0_progress_indicator_value_state_warning: var(--sapProgress_Value_CriticalBackground);--_ui5-v2-17-0_progress_indicator_value_state_success: var(--sapProgress_Value_PositiveBackground);--_ui5-v2-17-0_progress_indicator_value_state_information: var(--sapProgress_Value_InformationBackground);--_ui5-v2-17-0_progress_indicator_value_state_error_icon_color: var(--sapProgress_Value_NegativeTextColor);--_ui5-v2-17-0_progress_indicator_value_state_warning_icon_color: var(--sapProgress_Value_CriticalTextColor);--_ui5-v2-17-0_progress_indicator_value_state_success_icon_color: var(--sapProgress_Value_PositiveTextColor);--_ui5-v2-17-0_progress_indicator_value_state_information_icon_color: var(--sapProgress_Value_InformationTextColor);--_ui5-v2-17-0_progress_indicator_border: none;--_ui5-v2-17-0_progress_indicator_border_color_error: var(--sapErrorBorderColor);--_ui5-v2-17-0_progress_indicator_border_color_warning: var(--sapWarningBorderColor);--_ui5-v2-17-0_progress_indicator_border_color_success: var(--sapSuccessBorderColor);--_ui5-v2-17-0_progress_indicator_border_color_information: var(--sapInformationBorderColor);--_ui5-v2-17-0_progress_indicator_color: var(--sapField_TextColor);--_ui5-v2-17-0_progress_indicator_bar_color: var(--sapProgress_TextColor);--_ui5-v2-17-0_progress_indicator_icon_size: var(--sapFontLargeSize);--_ui5-v2-17-0_rating_indicator_border_radius: .5rem;--_ui5-v2-17-0_rating_indicator_outline_offset: -.125rem;--_ui5-v2-17-0_rating_indicator_item_height: 1em;--_ui5-v2-17-0_rating_indicator_item_width: 1em;--_ui5-v2-17-0_rating_indicator_component_spacing: .5rem 0px;--_ui5-v2-17-0_rating_indicator_component_padding: .25rem;--_ui5-v2-17-0_rating_indicator_item_size_s: 1.375rem;--_ui5-v2-17-0_rating_indicator_item_size_l: 2rem;--_ui5-v2-17-0_rating_indicator_readonly_item_height: .75em;--_ui5-v2-17-0_rating_indicator_readonly_item_width: .75em;--_ui5-v2-17-0_rating_indicator_readonly_item_spacing: .1875rem .1875rem;--_ui5-v2-17-0_segmented_btn_background_color: var(--sapButton_Lite_Background);--_ui5-v2-17-0_segmented_btn_border_color: var(--sapButton_Lite_BorderColor);--_ui5-v2-17-0_segmented_btn_hover_box_shadow: none;--_ui5-v2-17-0_segmented_btn_item_border_left: .0625rem;--_ui5-v2-17-0_segmented_btn_item_border_right: .0625rem;--_ui5-v2-17-0_button_base_height: var(--sapElement_Height);--_ui5-v2-17-0_button_border_radius: var(--sapButton_BorderCornerRadius);--_ui5-v2-17-0_button_emphasized_focused_border_before: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-17-0_button_emphasized_focused_active_border_color: transparent;--_ui5-v2-17-0_button_focused_border: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-17-0_button_focused_border_radius: .375rem;--_ui5-v2-17-0_button_focused_inner_border_radius: .375rem;--_ui5-v2-17-0_button_base_min_width: 2.25rem;--_ui5-v2-17-0_button_base_padding: .5625rem;--_ui5-v2-17-0_button_base_icon_margin: .375rem;--_ui5-v2-17-0_button_text_shadow: none;--_ui5-v2-17-0_button_emphasized_border_width: .0625rem;--_ui5-v2-17-0_button_pressed_focused_border_color: var(--sapContent_FocusColor);--_ui5-v2-17-0_button_fontFamily: var(--sapButton_FontFamily);--_ui5-v2-17-0_button_emphasized_focused_border_color: var(--sapContent_ContrastFocusColor);--_ui5-v2-17-0_radio_button_min_width: 2.75rem;--_ui5-v2-17-0_radio_button_checked_fill: var(--sapSelectedColor);--_ui5-v2-17-0_radio_button_checked_error_fill: var(--sapField_InvalidColor);--_ui5-v2-17-0_radio_button_checked_success_fill: var(--sapField_SuccessColor);--_ui5-v2-17-0_radio_button_checked_information_fill: var(--sapField_InformationColor);--_ui5-v2-17-0_radio_button_warning_error_border_dash: 0;--_ui5-v2-17-0_radio_button_outer_ring_color: var(--sapField_BorderColor);--_ui5-v2-17-0_radio_button_outer_ring_width: var(--sapField_BorderWidth);--_ui5-v2-17-0_radio_button_outer_ring_bg: var(--sapField_Background);--_ui5-v2-17-0_radio_button_outer_ring_hover_color: var(--sapField_Hover_BorderColor);--_ui5-v2-17-0_radio_button_outer_ring_active_color: var(--sapField_Hover_BorderColor);--_ui5-v2-17-0_radio_button_outer_ring_checked_hover_color: var(--sapField_Hover_BorderColor);--_ui5-v2-17-0_radio_button_outer_ring_padding_with_label: 0 .6875rem;--_ui5-v2-17-0_radio_button_border: none;--_ui5-v2-17-0_radio_button_focus_outline: block;--_ui5-v2-17-0_radio_button_color: var(--sapField_BorderColor);--_ui5-v2-17-0_radio_button_label_offset: 1px;--_ui5-v2-17-0_radio_button_information_border_width: var(--sapField_InformationBorderWidth);--_ui5-v2-17-0_radio_button_hover_fill: var(--sapField_Selector_Hover_Background);--_ui5-v2-17-0_radio_button_hover_fill_error: var(--sapField_Selector_Hover_InvalidBackground);--_ui5-v2-17-0_radio_button_hover_fill_warning: var(--sapField_Selector_Hover_WarningBackground);--_ui5-v2-17-0_radio_button_hover_fill_success: var(--sapField_Selector_Hover_SuccessBackground);--_ui5-v2-17-0_radio_button_hover_fill_information: var(--sapField_Selector_Hover_InformationBackground);--_ui5-v2-17-0_radio_button_border_width: var(--sapContent_FocusWidth);--_ui5-v2-17-0_radio_button_border_radius: .5rem;--_ui5-v2-17-0_radio_button_label_color: var(--sapField_TextColor);--_ui5-v2-17-0_radio_button_inner_ring_radius: 27.5%;--_ui5-v2-17-0_radio_button_outer_ring_padding: 0 .6875rem;--_ui5-v2-17-0_radio_button_read_only_border_type: 4,2;--_ui5-v2-17-0_radio_button_inner_ring_color: var(--sapContent_Selected_ForegroundColor);--_ui5-v2-17-0_radio_button_checked_warning_fill: var(--sapField_WarningColor);--_ui5-v2-17-0_radio_button_read_only_inner_ring_color: var(--sapField_TextColor);--_ui5-v2-17-0_radio_button_read_only_border_width: var(--sapElement_BorderWidth);--_ui5-v2-17-0_radio_button_focus_dist: .375rem;--_ui5-v2-17-0_switch_height: 2.75rem;--_ui5-v2-17-0_switch_foucs_border_size: 1px;--_ui5-v2-17-0-switch-root-border-radius: 0;--_ui5-v2-17-0-switch-root-box-shadow: none;--_ui5-v2-17-0_switch_track_border_radius: .75rem;--_ui5-v2-17-0-switch-track-border: 1px solid;--_ui5-v2-17-0_switch_track_transition: none;--_ui5-v2-17-0_switch_handle_border_radius: 1rem;--_ui5-v2-17-0-switch-slider-texts-display: inline;--_ui5-v2-17-0_switch_width: 2.5rem;--_ui5-v2-17-0_switch_min_width: none;--_ui5-v2-17-0_switch_with_label_width: 2.875rem;--_ui5-v2-17-0_switch_focus_outline: none;--_ui5-v2-17-0_switch_root_after_outline: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-17-0_switch_root_after_boreder_radius: 1rem;--_ui5-v2-17-0_switch_root_outline_top: .5rem;--_ui5-v2-17-0_switch_root_outline_bottom: .5rem;--_ui5-v2-17-0_switch_root_outline_left: -.125rem;--_ui5-v2-17-0_switch_root_outline_right: -.125rem;--_ui5-v2-17-0_switch_disabled_opacity: var(--sapContent_DisabledOpacity);--_ui5-v2-17-0_switch_transform: translateX(100%) translateX(-1.625rem);--_ui5-v2-17-0_switch_transform_with_label: translateX(100%) translateX(-1.875rem);--_ui5-v2-17-0_switch_rtl_transform: translateX(-100%) translateX(1.625rem);--_ui5-v2-17-0_switch_rtl_transform_with_label: translateX(-100%) translateX(1.875rem);--_ui5-v2-17-0_switch_track_width: 2.5rem;--_ui5-v2-17-0_switch_track_height: 1.5rem;--_ui5-v2-17-0_switch_track_with_label_width: 2.875rem;--_ui5-v2-17-0_switch_track_with_label_height: 1.5rem;--_ui5-v2-17-0_switch_track_active_background_color: var(--sapButton_Track_Selected_Background);--_ui5-v2-17-0_switch_track_inactive_background_color: var(--sapButton_Track_Background);--_ui5-v2-17-0_switch_track_hover_active_background_color: var(--sapButton_Track_Selected_Hover_Background);--_ui5-v2-17-0_switch_track_hover_inactive_background_color: var(--sapButton_Track_Hover_Background);--_ui5-v2-17-0_switch_track_active_border_color: var(--sapButton_Track_Selected_BorderColor);--_ui5-v2-17-0_switch_track_inactive_border_color: var(--sapButton_Track_BorderColor);--_ui5-v2-17-0_switch_track_hover_active_border_color: var(--sapButton_Track_Selected_Hover_BorderColor);--_ui5-v2-17-0_switch_track_hover_inactive_border_color: var(--sapButton_Track_Hover_BorderColor);--_ui5-v2-17-0_switch_track_semantic_accept_background_color: var(--sapButton_Track_Positive_Background);--_ui5-v2-17-0_switch_track_semantic_reject_background_color: var(--sapButton_Track_Negative_Background);--_ui5-v2-17-0_switch_track_semantic_hover_accept_background_color: var(--sapButton_Track_Positive_Hover_Background);--_ui5-v2-17-0_switch_track_semantic_hover_reject_background_color: var(--sapButton_Track_Negative_Hover_Background);--_ui5-v2-17-0_switch_track_semantic_accept_border_color: var(--sapButton_Track_Positive_BorderColor);--_ui5-v2-17-0_switch_track_semantic_reject_border_color: var(--sapButton_Track_Negative_BorderColor);--_ui5-v2-17-0_switch_track_semantic_hover_accept_border_color: var(--sapButton_Track_Positive_Hover_BorderColor);--_ui5-v2-17-0_switch_track_semantic_hover_reject_border_color: var(--sapButton_Track_Negative_Hover_BorderColor);--_ui5-v2-17-0_switch_track_icon_display: inline-block;--_ui5-v2-17-0_switch_handle_width: 1.5rem;--_ui5-v2-17-0_switch_handle_height: 1.25rem;--_ui5-v2-17-0_switch_handle_with_label_width: 1.75rem;--_ui5-v2-17-0_switch_handle_with_label_height: 1.25rem;--_ui5-v2-17-0_switch_handle_border: var(--_ui5-v2-17-0_switch_handle_border_width) solid var(--sapButton_Handle_BorderColor);--_ui5-v2-17-0_switch_handle_border_width: .125rem;--_ui5-v2-17-0_switch_handle_active_background_color: var(--sapButton_Handle_Selected_Background);--_ui5-v2-17-0_switch_handle_inactive_background_color: var(--sapButton_Handle_Background);--_ui5-v2-17-0_switch_handle_hover_active_background_color: var(--sapButton_Handle_Selected_Hover_Background);--_ui5-v2-17-0_switch_handle_hover_inactive_background_color: var(--sapButton_Handle_Hover_Background);--_ui5-v2-17-0_switch_handle_active_border_color: var(--sapButton_Handle_Selected_BorderColor);--_ui5-v2-17-0_switch_handle_inactive_border_color: var(--sapButton_Handle_BorderColor);--_ui5-v2-17-0_switch_handle_hover_active_border_color: var(--sapButton_Handle_Selected_BorderColor);--_ui5-v2-17-0_switch_handle_hover_inactive_border_color: var(--sapButton_Handle_BorderColor);--_ui5-v2-17-0_switch_handle_semantic_accept_background_color: var(--sapButton_Handle_Positive_Background);--_ui5-v2-17-0_switch_handle_semantic_reject_background_color: var(--sapButton_Handle_Negative_Background);--_ui5-v2-17-0_switch_handle_semantic_hover_accept_background_color: var(--sapButton_Handle_Positive_Hover_Background);--_ui5-v2-17-0_switch_handle_semantic_hover_reject_background_color: var(--sapButton_Handle_Negative_Hover_Background);--_ui5-v2-17-0_switch_handle_semantic_accept_border_color: var(--sapButton_Handle_Positive_BorderColor);--_ui5-v2-17-0_switch_handle_semantic_reject_border_color: var(--sapButton_Handle_Negative_BorderColor);--_ui5-v2-17-0_switch_handle_semantic_hover_accept_border_color: var(--sapButton_Handle_Positive_BorderColor);--_ui5-v2-17-0_switch_handle_semantic_hover_reject_border_color: var(--sapButton_Handle_Negative_BorderColor);--_ui5-v2-17-0_switch_handle_on_hover_box_shadow: 0 0 0 .125rem var(--sapButton_Handle_Selected_Hover_BorderColor);--_ui5-v2-17-0_switch_handle_off_hover_box_shadow: 0 0 0 .125rem var(--sapButton_Handle_Hover_BorderColor);--_ui5-v2-17-0_switch_handle_semantic_on_hover_box_shadow: 0 0 0 .125rem var(--sapButton_Handle_Positive_Hover_BorderColor);--_ui5-v2-17-0_switch_handle_semantic_off_hover_box_shadow: 0 0 0 .125rem var(--sapButton_Handle_Negative_Hover_BorderColor);--_ui5-v2-17-0_switch_handle_left: .0625rem;--_ui5-v2-17-0_switch_text_font_family: var(--sapContent_IconFontFamily);--_ui5-v2-17-0_switch_text_font_size: var(--sapFontLargeSize);--_ui5-v2-17-0_switch_text_width: 1.25rem;--_ui5-v2-17-0_switch_text_with_label_font_family: "72-Condensed-Bold" , "72" , "72full" , Arial, Helvetica, sans-serif;--_ui5-v2-17-0_switch_text_with_label_font_size: var(--sapFontSmallSize);--_ui5-v2-17-0_switch_text_with_label_width: 1.75rem;--_ui5-v2-17-0_switch_text_inactive_left: .1875rem;--_ui5-v2-17-0_switch_text_inactive_left_alternate: .0625rem;--_ui5-v2-17-0_switch_text_inactive_right: auto;--_ui5-v2-17-0_switch_text_inactive_right_alternate: 0;--_ui5-v2-17-0_switch_text_active_left: .1875rem;--_ui5-v2-17-0_switch_text_active_left_alternate: .0625rem;--_ui5-v2-17-0_switch_text_active_color: var(--sapButton_Handle_Selected_TextColor);--_ui5-v2-17-0_switch_text_inactive_color: var(--sapButton_Handle_TextColor);--_ui5-v2-17-0_switch_text_semantic_accept_color: var(--sapButton_Handle_Positive_TextColor);--_ui5-v2-17-0_switch_text_semantic_reject_color: var(--sapButton_Handle_Negative_TextColor);--_ui5-v2-17-0_switch_text_overflow: hidden;--_ui5-v2-17-0_switch_text_z_index: 1;--_ui5-v2-17-0_switch_text_hidden: hidden;--_ui5-v2-17-0_switch_text_min_width: none;--_ui5-v2-17-0_switch_icon_width: 1rem;--_ui5-v2-17-0_switch_icon_height: 1rem;--_ui5-v2-17-0_select_label_color: var(--sapField_TextColor);--_ui5-v2-17-0_select_icon_width: 2.25rem;--_ui5-v2-17-0_select_hover_icon_left_border: none;--_ui5-v2-17-0_select_icon_wrapper_height: calc(100% - .0625rem) ;--_ui5-v2-17-0_select_icon_wrapper_state_height: calc(100% - .125rem) ;--_ui5-v2-17-0_split_button_host_transparent_hover_background: transparent;--_ui5-v2-17-0_split_button_transparent_disabled_background: transparent;--_ui5-v2-17-0_split_button_host_default_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_BorderColor);--_ui5-v2-17-0_split_button_host_attention_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_Attention_BorderColor);--_ui5-v2-17-0_split_button_host_emphasized_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_Emphasized_BorderColor);--_ui5-v2-17-0_split_button_host_positive_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_Accept_BorderColor);--_ui5-v2-17-0_split_button_host_negative_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_Reject_BorderColor);--_ui5-v2-17-0_split_button_host_transparent_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_Lite_BorderColor);--_ui5-v2-17-0_split_text_button_border_color: transparent;--_ui5-v2-17-0_split_text_button_background_color: transparent;--_ui5-v2-17-0_split_text_button_emphasized_border: var(--sapButton_BorderWidth) solid var(--sapButton_Emphasized_BorderColor);--_ui5-v2-17-0_split_text_button_emphasized_border_width: .0625rem;--_ui5-v2-17-0_split_text_button_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-17-0_split_text_button_positive_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Accept_BorderColor);--_ui5-v2-17-0_split_text_button_negative_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Reject_BorderColor);--_ui5-v2-17-0_split_text_button_attention_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Attention_BorderColor);--_ui5-v2-17-0_split_text_button_transparent_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-17-0_split_arrow_button_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-17-0_split_arrow_button_emphasized_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Emphasized_BorderColor);--_ui5-v2-17-0_split_arrow_button_positive_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Accept_BorderColor);--_ui5-v2-17-0_split_arrow_button_negative_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Reject_BorderColor);--_ui5-v2-17-0_split_arrow_button_attention_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_Attention_BorderColor);--_ui5-v2-17-0_split_arrow_button_transparent_hover_border: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-17-0_split_button_focused_border: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-17-0_split_button_focused_border_radius: .375rem;--_ui5-v2-17-0_split_button_middle_separator_left: -.0625rem;--_ui5-v2-17-0_split_button_middle_separator_hover_display: none;--_ui5-v2-17-0_split_button_text_button_right_border_width: .0625rem;--_ui5-v2-17-0_split_button_transparent_hover_background: var(--sapButton_Lite_Hover_Background);--_ui5-v2-17-0_split_button_transparent_hover_color: var(--sapButton_TextColor);--_ui5-v2-17-0_split_button_host_transparent_hover_box_shadow: inset 0 0 0 var(--sapButton_BorderWidth) var(--sapButton_BorderColor);--_ui5-v2-17-0_split_button_inner_focused_border_radius_inner: .375rem;--_ui5-v2-17-0_split_button_emphasized_separator_color: transparent;--_ui5-v2-17-0_split_button_positive_separator_color: transparent;--_ui5-v2-17-0_split_button_negative_separator_color: transparent;--_ui5-v2-17-0_split_button_attention_separator_color: transparent;--_ui5-v2-17-0_split_button_attention_separator_color_default: var(--sapButton_Attention_TextColor);--_ui5-v2-17-0_split_text_button_hover_border_right: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-17-0_split_text_button_positive_hover_border_right: var(--sapButton_BorderWidth) solid var(--sapButton_Accept_BorderColor);--_ui5-v2-17-0_split_text_button_negative_hover_border_right: var(--sapButton_BorderWidth) solid var(--sapButton_Reject_BorderColor);--_ui5-v2-17-0_split_text_button_attention_hover_border_right: var(--sapButton_BorderWidth) solid var(--sapButton_Attention_BorderColor);--_ui5-v2-17-0_split_text_button_transparent_hover_border_right: var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);--_ui5-v2-17-0_split_button_middle_separator_hover_display_emphasized: none;--_ui5-v2-17-0_tc_header_height: var(--_ui5-v2-17-0_tc_item_height);--_ui5-v2-17-0_tc_header_height_text_only: var(--_ui5-v2-17-0_tc_item_text_only_height);--_ui5-v2-17-0_tc_header_height_text_with_additional_text: var(--_ui5-v2-17-0_tc_item_text_only_with_additional_text_height);--_ui5-v2-17-0_tc_header_box_shadow: var(--sapContent_HeaderShadow);--_ui5-v2-17-0_tc_header_background: var(--sapObjectHeader_Background);--_ui5-v2-17-0_tc_header_background_translucent: var(--sapObjectHeader_Background);--_ui5-v2-17-0_tc_content_background: var(--sapBackgroundColor);--_ui5-v2-17-0_tc_content_background_translucent: var(--sapGroup_ContentBackground);--_ui5-v2-17-0_tc_headeritem_padding: 1rem;--_ui5-v2-17-0_tc_headerItem_additional_text_color: var(--sapContent_LabelColor);--_ui5-v2-17-0_tc_headerItem_text_selected_color: var(--sapTab_Selected_TextColor);--_ui5-v2-17-0_tc_headerItem_text_selected_hover_color: var(--sapSelectedColor);--_ui5-v2-17-0_tc_headeritem_text_font_weight: normal;--_ui5-v2-17-0_tc_headerItem_additional_text_font_weight: normal;--_ui5-v2-17-0_tc_headerItem_neutral_border_color: var(--sapTab_Neutral_ForegroundColor);--_ui5-v2-17-0_tc_headerItem_transition: none;--_ui5-v2-17-0_tc_headerItemContent_border_radius: .125rem .125rem 0 0;--_ui5-v2-17-0_tc_headerItemContent_border_bg: transparent;--_ui5-v2-17-0_tc_headerItem_neutral_border_bg: transparent;--_ui5-v2-17-0_tc_headerItem_positive_border_bg: transparent;--_ui5-v2-17-0_tc_headerItem_negative_border_bg: transparent;--_ui5-v2-17-0_tc_headerItem_critical_border_bg: transparent;--_ui5-v2-17-0_tc_headerItemContent_border_height: 0;--_ui5-v2-17-0_tc_headerItem_text_focus_border_offset_left: 0px;--_ui5-v2-17-0_tc_headerItem_text_focus_border_offset_right: 0px;--_ui5-v2-17-0_tc_headerItem_text_focus_border_offset_top: 0px;--_ui5-v2-17-0_tc_headerItem_text_focus_border_offset_bottom: 0px;--_ui5-v2-17-0_tc_headerItem_mixed_mode_focus_border_offset_left: .75rem;--_ui5-v2-17-0_tc_headerItem_mixed_mode_focus_border_offset_right: .625rem;--_ui5-v2-17-0_tc_headerItem_mixed_mode_focus_border_offset_top: .75rem;--_ui5-v2-17-0_tc_headerItem_mixed_mode_focus_border_offset_bottom: .75rem;--_ui5-v2-17-0_tc_headerItemContent_default_focus_border: none;--_ui5-v2-17-0_tc_headerItemContent_focus_border_radius: 0;--_ui5-v2-17-0_tc_headerItemSemanticIcon_display: none;--_ui5-v2-17-0_tc_headerItemSemanticIcon_size: .75rem;--_ui5-v2-17-0_tc_mixedMode_itemText_font_family: var(--sapFontFamily);--_ui5-v2-17-0_tc_mixedMode_itemText_font_size: var(--sapFontSmallSize);--_ui5-v2-17-0_tc_mixedMode_itemText_font_weight: normal;--_ui5-v2-17-0_tc_overflowItem_positive_color: var(--sapPositiveColor);--_ui5-v2-17-0_tc_overflowItem_negative_color: var(--sapNegativeColor);--_ui5-v2-17-0_tc_overflowItem_critical_color: var(--sapCriticalColor);--_ui5-v2-17-0_tc_overflowItem_focus_offset: .125rem;--_ui5-v2-17-0_tc_overflowItem_indent: .5rem;--_ui5-v2-17-0_tc_overflowItem_extra_indent: 0rem;--_ui5-v2-17-0_tc_headerItemIcon_semantic_selected_color: var(--sapGroup_ContentBackground);--_ui5-v2-17-0_tc_header_border_bottom: .0625rem solid var(--sapObjectHeader_Background);--_ui5-v2-17-0_tc_headerItem_color: var(--sapTab_TextColor);--_ui5-v2-17-0_tc_overflowItem_default_color: var(--sapTab_TextColor);--_ui5-v2-17-0_tc_overflowItem_current_color: CurrentColor;--_ui5-v2-17-0_tc_content_border_bottom: .0625rem solid var(--sapObjectHeader_BorderColor);--_ui5-v2-17-0_tc_headerItem_expand_button_margin_inline_start: 0rem;--_ui5-v2-17-0_tc_headerItem_single_click_expand_button_margin_inline_start: .25rem;--_ui5-v2-17-0_tc_headerItem_expand_button_border_radius: .25rem;--_ui5-v2-17-0_tc_headerItem_expand_button_separator_display: inline-block;--_ui5-v2-17-0_tc_headerItem_focus_border: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-17-0_tc_headerItem_focus_border_offset: -5px;--_ui5-v2-17-0_tc_headerItemIcon_focus_border_radius: 50%;--_ui5-v2-17-0_tc_headerItem_focus_border_radius: .375rem;--_ui5-v2-17-0_tc_headerItem_text_hover_color: var(--sapTab_Selected_TextColor);--_ui5-v2-17-0_tc_headerItemIcon_border: .125rem solid var(--sapTab_ForegroundColor);--_ui5-v2-17-0_tc_mixedMode_itemText_color: var(--sapTextColor);--_ui5-v2-17-0_tc_overflow_text_color: var(--sapTextColor);--_ui5-v2-17-0_text_max_lines: initial;--_ui5-v2-17-0_textarea_state_border_width: .125rem;--_ui5-v2-17-0_textarea_information_border_width: .125rem;--_ui5-v2-17-0_textarea_placeholder_font_style: italic;--_ui5-v2-17-0_textarea_value_state_error_warning_placeholder_font_weight: normal;--_ui5-v2-17-0_textarea_error_placeholder_font_style: italic;--_ui5-v2-17-0_textarea_error_placeholder_color: var(--sapField_PlaceholderTextColor);--_ui5-v2-17-0_textarea_error_hover_background_color: var(--sapField_Hover_Background);--_ui5-v2-17-0_textarea_disabled_opacity: .4;--_ui5-v2-17-0_textarea_focus_pseudo_element_content: "";--_ui5-v2-17-0_textarea_min_height: 2.25rem;--_ui5-v2-17-0_textarea_padding_right_and_left_readonly: .5625rem;--_ui5-v2-17-0_textarea_padding_top_readonly: .4375rem;--_ui5-v2-17-0_textarea_hover_border: none;--_ui5-v2-17-0_textarea_focus_border_radius: .25rem;--_ui5-v2-17-0_textarea_error_warning_border_style: none;--_ui5-v2-17-0_textarea_line_height: 1.5;--_ui5-v2-17-0_textarea_focused_value_state_error_background: var(--sapField_Hover_Background);--_ui5-v2-17-0_textarea_focused_value_state_warning_background: var(--sapField_Hover_Background);--_ui5-v2-17-0_textarea_focused_value_state_success_background: var(--sapField_Hover_Background);--_ui5-v2-17-0_textarea_focused_value_state_information_background: var(--sapField_Hover_Background);--_ui5-v2-17-0_textarea_focused_value_state_error_focus_outline_color: var(--sapField_InvalidColor);--_ui5-v2-17-0_textarea_focused_value_state_warning_focus_outline_color: var(--sapField_WarningColor);--_ui5-v2-17-0_textarea_focused_value_state_success_focus_outline_color: var(--sapField_SuccessColor);--_ui5-v2-17-0_textarea_focus_offset: 0;--_ui5-v2-17-0_textarea_readonly_focus_offset: 1px;--_ui5-v2-17-0_textarea_focus_outline_color: var(--sapField_Active_BorderColor);--_ui5-v2-17-0_textarea_value_state_focus_offset: 1px;--_ui5-v2-17-0_textarea_wrapper_padding: .0625rem;--_ui5-v2-17-0_textarea_success_wrapper_padding: .0625rem;--_ui5-v2-17-0_textarea_warning_error_wrapper_padding: .0625rem .0625rem .125rem .0625rem;--_ui5-v2-17-0_textarea_information_wrapper_padding: .0625rem .0625rem .125rem .0625rem;--_ui5-v2-17-0_textarea_inner_width: calc(100% - (2 * var(--_ui5-v2-17-0_textarea_wrapper_padding)));--_ui5-v2-17-0_textarea_padding_bottom_readonly: .375rem;--_ui5-v2-17-0_textarea_padding_top_error_warning: .5rem;--_ui5-v2-17-0_textarea_padding_bottom_error_warning: .4375rem;--_ui5-v2-17-0_textarea_padding_top_information: .5rem;--_ui5-v2-17-0_textarea_padding_bottom_information: .4375rem;--_ui5-v2-17-0_textarea_padding_right_and_left: .625rem;--_ui5-v2-17-0_textarea_padding_right_and_left_error_warning: .625rem;--_ui5-v2-17-0_textarea_padding_right_and_left_information: .625rem;--_ui5-v2-17-0_textarea_readonly_border_style: dashed;--_ui5-v2-17-0-time_picker_border_radius: .25rem;--_ui5-v2-17-0_toast_vertical_offset: 3rem;--_ui5-v2-17-0_toast_horizontal_offset: 2rem;--_ui5-v2-17-0_toast_background: var(--sapIndicationColor_9_Background);--_ui5-v2-17-0_toast_shadow: var(--sapContent_Lite_Shadow);--_ui5-v2-17-0_toast_offset_width: -.1875rem;--_ui5-v2-17-0_toggle_button_emphasized_text_shadow: none;--_ui5-v2-17-0_yearpicker_item_margin: .0625rem;--_ui5-v2-17-0_yearpicker_item_border: .0625rem solid var(--sapButton_Lite_BorderColor);--_ui5-v2-17-0_yearpicker_item_hover_border: .0625rem solid var(--sapButton_Lite_Hover_BorderColor);--_ui5-v2-17-0_yearpicker_item_selected_border: .0625rem solid var(--sapButton_Selected_BorderColor);--_ui5-v2-17-0_yearpicker_item_selected_hover_border: .0625rem solid var(--sapButton_Selected_Hover_BorderColor);--_ui5-v2-17-0_yearpicker_item_border_radius: .5rem;--_ui5-v2-17-0_calendar_header_middle_button_width: 6.25rem;--_ui5-v2-17-0_calendar_header_middle_button_flex: 1 1 auto;--_ui5-v2-17-0_calendar_header_middle_button_focus_after_display: block;--_ui5-v2-17-0_calendar_header_middle_button_focus_after_width: calc(100% - .375rem) ;--_ui5-v2-17-0_calendar_header_middle_button_focus_after_height: calc(100% - .375rem) ;--_ui5-v2-17-0_calendar_header_middle_button_focus_after_top_offset: .125rem;--_ui5-v2-17-0_calendar_header_middle_button_focus_after_left_offset: .125rem;--_ui5-v2-17-0_calendar_header_arrow_button_border: none;--_ui5-v2-17-0_calendar_header_arrow_button_border_radius: .5rem;--_ui5-v2-17-0_calendar_header_arrow_button_box_shadow: 0 0 .125rem 0 rgb(85 107 130 / 72%);--_ui5-v2-17-0_calendar_header_middle_button_focus_border_radius: .5rem;--_ui5-v2-17-0_calendar_header_middle_button_focus_border: none;--_ui5-v2-17-0_calendar_header_middle_button_focus_after_border: none;--_ui5-v2-17-0_calendar_header_middle_button_focus_background: transparent;--_ui5-v2-17-0_calendar_header_middle_button_focus_outline: .125rem solid var(--sapSelectedColor);--_ui5-v2-17-0_calendar_header_middle_button_focus_active_outline: .0625rem solid var(--sapSelectedColor);--_ui5-v2-17-0_calendar_header_middle_button_focus_active_background: transparent;--_ui5-v2-17-0_token_background: var(--sapButton_TokenBackground);--_ui5-v2-17-0_token_readonly_background: var(--sapButton_TokenBackground);--_ui5-v2-17-0_token_readonly_color: var(--sapContent_LabelColor);--_ui5-v2-17-0_token_right_margin: .3125rem;--_ui5-v2-17-0_token_left_padding: .3125rem;--_ui5-v2-17-0_token_focused_selected_border: 1px solid var(--sapButton_Selected_BorderColor);--_ui5-v2-17-0_token_focus_offset: -.25rem;--_ui5-v2-17-0_token_focus_outline_width: .0625rem;--_ui5-v2-17-0_token_selected_focus_outline: none;--_ui5-v2-17-0_token_focus_outline: none;--_ui5-v2-17-0_token_outline_offset: .125rem;--ui5-v2-17-0_token_focus_pseudo_element_content: "";--_ui5-v2-17-0_token_border_radius: .375rem;--_ui5-v2-17-0_token_focus_outline_border_radius: .5rem;--_ui5-v2-17-0_token_text_color: var(--sapTextColor);--_ui5-v2-17-0_token_selected_text_font_family: var(--sapFontSemiboldDuplexFamily);--_ui5-v2-17-0_token_selected_internal_border_bottom: .125rem solid var(--sapButton_Selected_BorderColor);--_ui5-v2-17-0_token_selected_internal_border_bottom_radius: .1875rem;--_ui5-v2-17-0_token_readonly_padding: .25rem .3125rem;--_ui5-v2-17-0_tokenizer_gap: .625rem .25rem;--_ui5-v2-17-0_tokenizer-popover_offset: .3125rem;--_ui5-v2-17-0_tokenizer_n_more_text_color: var(--sapLinkColor);--_ui5-v2-17-0_slider_progress_container_dot_background: var(--sapField_BorderColor);--_ui5-v2-17-0_slider_progress_border: solid .0625rem var(--sapSlider_BorderColor);--_ui5-v2-17-0_slider_padding: 1.406rem 1.0625rem;--_ui5-v2-17-0_slider_inner_height: .25rem;--_ui5-v2-17-0_slider_outer_height: 1.6875rem;--_ui5-v2-17-0_slider_progress_border_radius: .25rem;--_ui5-v2-17-0_slider_tickmark_bg: var(--sapField_BorderColor);--_ui5-v2-17-0_slider_handle_outline_offset: .075rem;--_ui5-v2-17-0_slider_progress_outline: .0625rem dotted var(--sapContent_FocusColor);--_ui5-v2-17-0_slider_progress_outline_offset: -.8125rem;--_ui5-v2-17-0_slider_disabled_opacity: .4;--_ui5-v2-17-0_slider_tooltip_border_color: var(--sapField_BorderColor);--_ui5-v2-17-0_range_slider_handle_background_focus: transparent;--_ui5-v2-17-0_slider_progress_box_sizing: border-box;--_ui5-v2-17-0_slider_active_progress_box_sizing: content-box;--_ui5-v2-17-0_range_slider_focus_outline_width: 100%;--_ui5-v2-17-0_slider_progress_outline_offset_left: 0;--_ui5-v2-17-0_range_slider_focus_outline_radius: 0;--_ui5-v2-17-0_slider_progress_container_top: 0;--_ui5-v2-17-0_slider_progress_height: 100%;--_ui5-v2-17-0_slider_active_progress_border: solid .0625rem var(--sapSlider_Selected_BorderColor);--_ui5-v2-17-0_slider_active_progress_left: 0;--_ui5-v2-17-0_slider_active_progress_top: 0;--_ui5-v2-17-0_slider_no_tickmarks_progress_container_top: var(--_ui5-v2-17-0_slider_progress_container_top);--_ui5-v2-17-0_slider_no_tickmarks_progress_height: var(--_ui5-v2-17-0_slider_progress_height);--_ui5-v2-17-0_slider_no_tickmarks_active_progress_border: var(--_ui5-v2-17-0_slider_active_progress_border);--_ui5-v2-17-0_slider_no_tickmarks_active_progress_left: var(--_ui5-v2-17-0_slider_active_progress_left);--_ui5-v2-17-0_slider_no_tickmarks_active_progress_top: var(--_ui5-v2-17-0_slider_active_progress_top);--_ui5-v2-17-0_slider_handle_focus_visibility: none;--_ui5-v2-17-0_slider_handle_icon_size: 1rem;--_ui5-v2-17-0_slider_progress_container_background: var(--sapSlider_Background);--_ui5-v2-17-0_slider_progress_container_dot_display: block;--_ui5-v2-17-0_slider_inner_min_width: 4rem;--_ui5-v2-17-0_slider_progress_background: var(--sapSlider_Selected_Background);--_ui5-v2-17-0_slider_progress_before_background: var(--sapSlider_Selected_Background);--_ui5-v2-17-0_slider_progress_after_background: var(--sapContent_MeasureIndicatorColor);--_ui5-v2-17-0_slider_handle_background: var(--sapSlider_HandleBackground);--_ui5-v2-17-0_slider_handle_icon_display: inline-block;--_ui5-v2-17-0_slider_handle_border: .0625rem solid var(--sapSlider_HandleBorderColor);--_ui5-v2-17-0_slider_handle_border_radius: .5rem;--_ui5-v2-17-0_slider_handle_height: 1.5rem;--_ui5-v2-17-0_slider_handle_width: 2rem;--_ui5-v2-17-0_slider_handle_top: -.625rem;--_ui5-v2-17-0_slider_handle_font_family: "SAP-icons";--_ui5-v2-17-0_slider_handle_hover_border: .0625rem solid var(--sapSlider_Hover_HandleBorderColor);--_ui5-v2-17-0_slider_handle_focus_border: .125rem solid var(--sapContent_FocusColor);--_ui5-v2-17-0_slider_handle_background_focus: var(--sapSlider_Active_RangeHandleBackground);--_ui5-v2-17-0_slider_handle_outline: none;--_ui5-v2-17-0_slider_handle_hover_background: var(--sapSlider_Hover_HandleBackground);--_ui5-v2-17-0_slider_tooltip_background: var(--sapField_Focus_Background);--_ui5-v2-17-0_slider_tooltip_border: none;--_ui5-v2-17-0_slider_tooltip_border_radius: .5rem;--_ui5-v2-17-0_slider_tooltip_box_shadow: var(--sapContent_Shadow1);--_ui5-v2-17-0_range_slider_legacy_progress_focus_display: none;--_ui5-v2-17-0_range_slider_progress_focus_display: block;--_ui5-v2-17-0_slider_tickmark_in_range_bg: var(--sapSlider_Selected_BorderColor);--_ui5-v2-17-0_slider_label_fontsize: var(--sapFontSmallSize);--_ui5-v2-17-0_slider_label_color: var(--sapContent_LabelColor);--_ui5-v2-17-0_slider_tooltip_min_width: 2rem;--_ui5-v2-17-0_slider_tooltip_padding: .25rem;--_ui5-v2-17-0_slider_tooltip_fontsize: var(--sapFontSmallSize);--_ui5-v2-17-0_slider_tooltip_color: var(--sapContent_LabelColor);--_ui5-v2-17-0_slider_tooltip_height: 1.375rem;--_ui5-v2-17-0_slider_handle_focus_width: 1px;--_ui5-v2-17-0_slider_start_end_point_size: .5rem;--_ui5-v2-17-0_slider_start_end_point_left: -.75rem;--_ui5-v2-17-0_slider_start_end_point_top: -.125rem;--_ui5-v2-17-0_slider_handle_focused_tooltip_distance: calc(var(--_ui5-v2-17-0_slider_tooltip_bottom) - var(--_ui5-v2-17-0_slider_handle_focus_width));--_ui5-v2-17-0_slider_tooltip_border_box: border-box;--_ui5-v2-17-0_range_slider_handle_active_background: var(--sapSlider_Active_RangeHandleBackground);--_ui5-v2-17-0_range_slider_active_handle_icon_display: none;--_ui5-v2-17-0_range_slider_progress_focus_top: -15px;--_ui5-v2-17-0_range_slider_progress_focus_left: calc(-1 * (var(--_ui5-v2-17-0_slider_handle_width) / 2) - 5px);--_ui5-v2-17-0_range_slider_progress_focus_padding: 0 1rem 0 1rem;--_ui5-v2-17-0_range_slider_progress_focus_width: calc(100% + var(--_ui5-v2-17-0_slider_handle_width) + 10px);--_ui5-v2-17-0_range_slider_progress_focus_height: calc(var(--_ui5-v2-17-0_slider_handle_height) + 10px);--_ui5-v2-17-0_range_slider_root_hover_handle_icon_display: inline-block;--_ui5-v2-17-0_range_slider_root_hover_handle_bg: var(--_ui5-v2-17-0_slider_handle_hover_background);--_ui5-v2-17-0_range_slider_root_active_handle_icon_display: none;--_ui5-v2-17-0_slider_tickmark_height: .5rem;--_ui5-v2-17-0_slider_tickmark_top: -2px;--_ui5-v2-17-0_slider_handle_box_sizing: border-box;--_ui5-v2-17-0_range_slider_handle_background: var(--sapSlider_RangeHandleBackground);--_ui5-v2-17-0_slider_tooltip_bottom: 2rem;--_ui5-v2-17-0_value_state_message_border: none;--_ui5-v2-17-0_value_state_header_border: none;--_ui5-v2-17-0_input_value_state_icon_offset: .5rem;--_ui5-v2-17-0_value_state_header_box_shadow_error: inset 0 -.0625rem var(--sapField_InvalidColor);--_ui5-v2-17-0_value_state_header_box_shadow_information: inset 0 -.0625rem var(--sapField_InformationColor);--_ui5-v2-17-0_value_state_header_box_shadow_success: inset 0 -.0625rem var(--sapField_SuccessColor);--_ui5-v2-17-0_value_state_header_box_shadow_warning: inset 0 -.0625rem var(--sapField_WarningColor);--_ui5-v2-17-0_value_state_message_popover_header_min_height: 2rem;--_ui5-v2-17-0_value_state_message_popover_header_min_width: 6rem;--_ui5-v2-17-0_value_state_message_popover_header_max_width: 22rem;--_ui5-v2-17-0_value_state_message_popover_header_width: auto;--_ui5-v2-17-0_value_state_message_icon_offset_phone: 1rem;--_ui5-v2-17-0_value_state_header_border_bottom: none;--_ui5-v2-17-0_input_value_state_icon_display: inline-block;--_ui5-v2-17-0_value_state_message_padding: .5rem .5rem .5rem 1.875rem;--_ui5-v2-17-0_value_state_header_padding: .5rem .5rem .5rem 1.875rem;--_ui5-v2-17-0_value_state_message_popover_box_shadow: var(--sapContent_Shadow1);--_ui5-v2-17-0_value_state_message_icon_width: 1rem;--_ui5-v2-17-0_value_state_message_icon_height: 1rem;--_ui5-v2-17-0_value_state_header_offset: -.25rem;--_ui5-v2-17-0_value_state_message_popover_border_radius: var(--sapPopover_BorderCornerRadius);--_ui5-v2-17-0_value_state_message_padding_phone: .5rem .5rem .5rem 2.375rem;--_ui5-v2-17-0_value_state_message_line_height: 1.125rem;--_ui5-v2-17-0-toolbar-padding-left: .5rem;--_ui5-v2-17-0-toolbar-padding-right: .5rem;--_ui5-v2-17-0-toolbar-item-margin-left: 0;--_ui5-v2-17-0-toolbar-item-margin-right: .25rem;--_ui5-v2-17-0_step_input_min_width: 7.25rem;--_ui5-v2-17-0_step_input_padding: 2.5rem;--_ui5-v2-17-0_step_input_input_error_background_color: inherit;--_ui5-v2-17-0-step_input_button_state_hover_background_color: var(--sapField_Hover_Background);--_ui5-v2-17-0_step_input_border_style: none;--_ui5-v2-17-0_step_input_border_style_hover: none;--_ui5-v2-17-0_step_input_button_background_color: transparent;--_ui5-v2-17-0_step_input_input_border: none;--_ui5-v2-17-0_step_input_input_margin_top: 0;--_ui5-v2-17-0_step_input_button_display: inline-flex;--_ui5-v2-17-0_step_input_button_left: 0;--_ui5-v2-17-0_step_input_button_right: 0;--_ui5-v2-17-0_step_input_input_border_focused_after: .125rem solid #0070f2;--_ui5-v2-17-0_step_input_input_border_top_bottom_focused_after: 0;--_ui5-v2-17-0_step_input_input_border_radius_focused_after: .25rem;--_ui5-v2-17-0_step_input_input_information_border_color_focused_after: var(--sapField_InformationColor);--_ui5-v2-17-0_step_input_input_warning_border_color_focused_after: var(--sapField_WarningColor);--_ui5-v2-17-0_step_input_input_success_border_color_focused_after: var(--sapField_SuccessColor);--_ui5-v2-17-0_step_input_input_error_border_color_focused_after: var(--sapField_InvalidColor);--_ui5-v2-17-0_step_input_disabled_button_background: none;--_ui5-v2-17-0_step_input_border_color_hover: none;--_ui5-v2-17-0_step_input_border_hover: none;--_ui5-v2-17-0_input_input_background_color: transparent;--_ui5-v2-17-0_load_more_padding: 0;--_ui5-v2-17-0_load_more_border: 1px top solid transparent;--_ui5-v2-17-0_load_more_border_radius: none;--_ui5-v2-17-0_load_more_outline_width: var(--sapContent_FocusWidth);--_ui5-v2-17-0_load_more_border-bottom: var(--sapList_BorderWidth) solid var(--sapList_BorderColor);--_ui5-v2-17-0_calendar_height: 24.5rem;--_ui5-v2-17-0_calendar_width: 20rem;--_ui5-v2-17-0_calendar_left_right_padding: .5rem;--_ui5-v2-17-0_calendar_top_bottom_padding: 1rem;--_ui5-v2-17-0_calendar_header_height: 3rem;--_ui5-v2-17-0_calendar_header_arrow_button_width: 2.5rem;--_ui5-v2-17-0_calendar_header_padding: .25rem 0;--_ui5-v2-17-0_checkbox_root_side_padding: .6875rem;--_ui5-v2-17-0_checkbox_icon_size: 1rem;--_ui5-v2-17-0_checkbox_partially_icon_size: .75rem;--_ui5-v2-17-0_custom_list_item_rb_min_width: 2.75rem;--_ui5-v2-17-0_day_picker_item_width: 2.25rem;--_ui5-v2-17-0_day_picker_item_height: 2.875rem;--_ui5-v2-17-0_day_picker_empty_height: 3rem;--_ui5-v2-17-0_day_picker_item_justify_content: space-between;--_ui5-v2-17-0_daypicker_item_now_selected_two_calendar_focus_special_day_top: 2rem;--_ui5-v2-17-0_daypicker_item_now_selected_two_calendar_focus_special_day_right: 1.4375rem;--_ui5-v2-17-0_dp_two_calendar_item_secondary_text_height: 1rem;--_ui5-v2-17-0_dp_two_calendar_item_text_padding_top: .4375rem;--_ui5-v2-17-0_daypicker_item_now_selected_two_calendar_focus_secondary_text_padding_block: 0 .5rem;--_ui5-v2-17-0-calendar-legend-item-root-focus-offset: -.125rem;--_ui5-v2-17-0-calendar-legend-item-box-margin: .25rem;--_ui5-v2-17-0-calendar-legend-item-box-inner-margin: .5rem;--_ui5-v2-17-0_color_picker_slider_progress_container_height: 1.625rem;--_ui5-v2-17-0_color_picker_slider_container_margin_top: -.5rem;--_ui5-v2-17-0_color_picker_slider_handle_height: 2rem;--_ui5-v2-17-0_color_picker_slider_handle_width: 1.0625rem;--_ui5-v2-17-0_color_picker_slider_handle_after_height: 1.75rem;--_ui5-v2-17-0_color_picker_slider_handle_focus_height: 2.125rem;--_ui5-v2-17-0_color_picker_colors_wrapper_height: 2.25rem;--_ui5-v2-17-0_color_picker_sliders_height: 3rem;--_ui5-v2-17-0_color_picker_main_color_margin_bottom: 1rem;--_ui5-v2-17-0_color_picker_slider_spacing: .9375rem;--_ui5-v2-17-0_color_channel_toggle_button_width: 1.625rem;--_ui5-v2-17-0_color_channel_toggle_button_margin-top: -.75rem;--_ui5-v2-17-0_color_channel_hex_input_width: 4.8125rem;--_ui5-v2-17-0-color_channel_margin_top: .25rem;--_ui5-v2-17-0_color-palette-swatch-container-padding: .3125rem .6875rem;--_ui5-v2-17-0_datetime_picker_width: 40.0625rem;--_ui5-v2-17-0_datetime_picker_height: 25rem;--_ui5-v2-17-0_datetime_timeview_width: 17rem;--_ui5-v2-17-0_datetime_timeview_phonemode_width: 19.5rem;--_ui5-v2-17-0_datetime_timeview_phonemode_clocks_width: 24.5rem;--_ui5-v2-17-0_datetime_dateview_phonemode_margin_bottom: 0;--_ui5-v2-17-0_dialog_content_min_height: 2.75rem;--_ui5-v2-17-0_dialog_footer_height: 2.75rem;--_ui5-v2-17-0_input_inner_padding: 0 .625rem;--_ui5-v2-17-0_input_inner_padding_with_icon: 0 .25rem 0 .625rem;--_ui5-v2-17-0_input_inner_space_to_tokenizer: .125rem;--_ui5-v2-17-0_input_inner_space_to_n_more_text: .1875rem;--_ui5-v2-17-0_list_no_data_height: 3rem;--_ui5-v2-17-0_list_item_cb_margin_right: 0;--_ui5-v2-17-0_list_item_title_size: var(--sapFontLargeSize);--_ui5-v2-17-0_list_no_data_font_size: var(--sapFontLargeSize);--_ui5-v2-17-0_list_item_img_size: 3rem;--_ui5-v2-17-0_list_item_img_top_margin: .5rem;--_ui5-v2-17-0_list_item_img_bottom_margin: .5rem;--_ui5-v2-17-0_list_item_img_hn_margin: .75rem;--_ui5-v2-17-0_list_item_dropdown_base_height: 2.5rem;--_ui5-v2-17-0_list_item_base_height: var(--sapElement_LineHeight);--_ui5-v2-17-0_list_item_base_padding: 0 1rem;--_ui5-v2-17-0_list_item_icon_size: 1.125rem;--_ui5-v2-17-0_list_item_icon_padding-inline-end: .75rem;--_ui5-v2-17-0_list_item_selection_btn_margin_top: calc(-1 * var(--_ui5-v2-17-0_checkbox_wrapper_padding));--_ui5-v2-17-0_list_item_content_vertical_offset: calc((var(--_ui5-v2-17-0_list_item_base_height) - var(--_ui5-v2-17-0_list_item_title_size)) / 2);--_ui5-v2-17-0_group_header_list_item_height: 2.75rem;--_ui5-v2-17-0_month_picker_item_height: 3rem;--_ui5-v2-17-0_list_buttons_left_space: .125rem;--_ui5-v2-17-0_form_item_min_height: 2.813rem;--_ui5-v2-17-0_form_item_padding: .65rem;--_ui5-v2-17-0-form-group-heading-height: 2.75rem;--_ui5-v2-17-0_popup_default_header_height: 2.75rem;--_ui5-v2-17-0_year_picker_item_height: 3rem;--_ui5-v2-17-0_tokenizer_padding: .25rem;--_ui5-v2-17-0_token_height: 1.625rem;--_ui5-v2-17-0_token_icon_size: .75rem;--_ui5-v2-17-0_token_icon_padding: .25rem .5rem;--_ui5-v2-17-0_tl_bubble_padding: 1rem;--_ui5-v2-17-0_tl_padding: 1rem 1rem 1rem .5rem;--_ui5-v2-17-0_tl_li_margin_bottom: 1.625rem;--_ui5-v2-17-0_tc_item_text: 3rem;--_ui5-v2-17-0_tc_item_height: 4.75rem;--_ui5-v2-17-0_tc_item_text_only_height: 2.75rem;--_ui5-v2-17-0_tc_item_text_only_with_additional_text_height: 3.75rem;--_ui5-v2-17-0_tc_item_text_line_height: 1.325rem;--_ui5-v2-17-0_tc_item_icon_circle_size: 2.75rem;--_ui5-v2-17-0_tc_item_icon_size: 1.25rem;--_ui5-v2-17-0_tc_item_add_text_margin_top: .375rem;--_ui5-v2-17-0_textarea_margin: .25rem 0;--_ui5-v2-17-0_radio_button_height: 2.75rem;--_ui5-v2-17-0_radio_button_label_side_padding: .875rem;--_ui5-v2-17-0_radio_button_inner_size: 2.75rem;--_ui5-v2-17-0_radio_button_svg_size: 1.375rem;--_ui5-v2-17-0-responsive_popover_header_height: 2.75rem;--_ui5-v2-17-0-tree-indent-step: 1.5rem;--_ui5-v2-17-0-tree-toggle-box-width: 2.75rem;--_ui5-v2-17-0-tree-toggle-box-height: 2.25rem;--_ui5-v2-17-0-tree-toggle-icon-size: 1.0625rem;--_ui5-v2-17-0_timeline_tli_indicator_before_bottom: -1.5rem;--_ui5-v2-17-0_timeline_tli_indicator_before_right: -1.625rem;--_ui5-v2-17-0_timeline_tli_indicator_before_without_icon_bottom: -1.875rem;--_ui5-v2-17-0_timeline_tli_indicator_before_without_icon_right: -1.9375rem;--_ui5-v2-17-0_timeline_tli_indicator_after_top: calc(-100% - 1rem) ;--_ui5-v2-17-0_timeline_tli_indicator_after_height: calc(100% + 1rem) ;--_ui5-v2-17-0_timeline_tli_indicator_before_height: 100%;--_ui5-v2-17-0_timeline_tli_horizontal_indicator_after_width: calc(100% + .25rem) ;--_ui5-v2-17-0_timeline_tli_horizontal_indicator_after_left: 1.9375rem;--_ui5-v2-17-0_timeline_tli_horizontal_without_icon_indicator_before_width: calc(100% + .5rem) ;--_ui5-v2-17-0_timeline_tli_horizontal_indicator_before_width: calc(100% + .5rem) ;--_ui5-v2-17-0_timeline_tli_icon_horizontal_indicator_after_width: calc(100% + .25rem) ;--_ui5-v2-17-0_timeline_tli_without_icon_horizontal_indicator_before_width: calc(100% + .375rem) ;--_ui5-v2-17-0_timeline_tli_horizontal_indicator_short_after_width: 100%;--_ui5-v2-17-0-toolbar-separator-height: 2rem;--_ui5-v2-17-0-toolbar-height: 2.75rem;--_ui5-v2-17-0_toolbar_overflow_padding: .25rem .5rem;--_ui5-v2-17-0_dynamic_page_title_actions_separator_height: var(--_ui5-v2-17-0-toolbar-separator-height);--_ui5-v2-17-0-shellbar-separator-height: 2rem;--_ui5-v2-17-0_split_button_middle_separator_top: .625rem;--_ui5-v2-17-0_split_button_middle_separator_height: 1rem;--_ui5-v2-17-0-calendar-legend-item-root-focus-border-radius: .25rem;--_ui5-v2-17-0_color-palette-item-height: 1.75rem;--_ui5-v2-17-0_color-palette-item-hover-height: 2.25rem;--_ui5-v2-17-0_color-palette-item-margin: calc(((var(--_ui5-v2-17-0_color-palette-item-hover-height) - var(--_ui5-v2-17-0_color-palette-item-height)) / 2) + .0625rem);--_ui5-v2-17-0_color-palette-row-width: 12rem;--_ui5-v2-17-0_textarea_padding_top: .5rem;--_ui5-v2-17-0_textarea_padding_bottom: .4375rem;--_ui5-v2-17-0_dp_two_calendar_item_secondary_text_padding_block: 0 .5rem;--_ui5-v2-17-0_dp_two_calendar_item_secondary_text_padding: 0 .5rem;--_ui5-v2-17-0_daypicker_two_calendar_item_selected_focus_margin_bottom: 0;--_ui5-v2-17-0_daypicker_two_calendar_item_selected_focus_padding_right: .5rem}[data-ui5-compact-size],.ui5-content-density-compact,.sapUiSizeCompact{--_ui5-v2-17-0_checkbox_label_offset: var(--_ui5-v2-17-0_checkbox_compact_wrapper_padding);--_ui5-v2-17-0_input_min_width: 2rem;--_ui5-v2-17-0_input_icon_width: 2rem;--_ui5-v2-17-0_input_margin_top_bottom: .1875rem;--_ui5-v2-17-0_input_information_icon_padding: .3125rem .5rem .1875rem .5rem;--_ui5-v2-17-0_input_information_focused_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-17-0_input_error_warning_icon_padding: .3125rem .5rem .1875rem .5rem;--_ui5-v2-17-0_input_error_warning_focused_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-17-0_input_custom_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-17-0_input_error_warning_custom_icon_padding: .3125rem .5rem .1875rem .5rem;--_ui5-v2-17-0_input_error_warning_custom_focused_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-17-0_input_information_custom_icon_padding: .3125rem .5rem .1875rem .5rem;--_ui5-v2-17-0_input_information_custom_focused_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-17-0_input_icon_padding: .3125rem .5rem .25rem .5rem;--_ui5-v2-17-0_panel_header_button_wrapper_padding: .1875rem .25rem;--_ui5-v2-17-0_rating_indicator_item_height: 1em;--_ui5-v2-17-0_rating_indicator_item_width: 1em;--_ui5-v2-17-0_rating_indicator_readonly_item_height: .75em;--_ui5-v2-17-0_rating_indicator_readonly_item_width: .75em;--_ui5-v2-17-0_rating_indicator_component_spacing: .5rem 0px;--_ui5-v2-17-0_radio_button_min_width: 2rem;--_ui5-v2-17-0_radio_button_outer_ring_padding_with_label: 0 .5rem;--_ui5-v2-17-0_radio_button_outer_ring_padding: 0 .5rem;--_ui5-v2-17-0_radio_button_focus_dist: .1875rem;--_ui5-v2-17-0_switch_height: 2rem;--_ui5-v2-17-0_switch_width: 2.75rem;--_ui5-v2-17-0_switch_min_width: none;--_ui5-v2-17-0_switch_with_label_width: 2.75rem;--_ui5-v2-17-0_switch_root_outline_top: .25rem;--_ui5-v2-17-0_switch_root_outline_bottom: .25rem;--_ui5-v2-17-0_switch_transform: translateX(100%) translateX(-1.375rem);--_ui5-v2-17-0_switch_transform_with_label: translateX(100%) translateX(-1.875rem);--_ui5-v2-17-0_switch_rtl_transform: translateX(1.375rem) translateX(-100%);--_ui5-v2-17-0_switch_rtl_transform_with_label: translateX(1.875rem) translateX(-100%);--_ui5-v2-17-0_switch_track_width: 2.75rem;--_ui5-v2-17-0_switch_track_height: 1.25rem;--_ui5-v2-17-0_switch_track_with_label_width: 2.75rem;--_ui5-v2-17-0_switch_track_with_label_height: 1.25rem;--_ui5-v2-17-0_switch_handle_width: 1.25rem;--_ui5-v2-17-0_switch_handle_height: 1rem;--_ui5-v2-17-0_switch_handle_with_label_width: 1.75rem;--_ui5-v2-17-0_switch_handle_with_label_height: 1rem;--_ui5-v2-17-0_switch_text_font_size: var(--sapFontSize);--_ui5-v2-17-0_switch_text_width: 1rem;--_ui5-v2-17-0_switch_text_active_left: .1875rem;--_ui5-v2-17-0_select_icon_width: 2rem;--_ui5-v2-17-0_textarea_padding_right_and_left_readonly: .4375rem;--_ui5-v2-17-0_textarea_padding_top_readonly: .125rem;--_ui5-v2-17-0_textarea_min_height: 1.625rem;--_ui5-v2-17-0_textarea_padding_bottom_readonly: .0625rem;--_ui5-v2-17-0_textarea_padding_top_error_warning: .1875rem;--_ui5-v2-17-0_textarea_padding_bottom_error_warning: .125rem;--_ui5-v2-17-0_textarea_padding_top_information: .1875rem;--_ui5-v2-17-0_textarea_padding_bottom_information: .125rem;--_ui5-v2-17-0_textarea_padding_right_and_left: .5rem;--_ui5-v2-17-0_textarea_padding_right_and_left_error_warning: .5rem;--_ui5-v2-17-0_textarea_padding_right_and_left_information: .5rem;--_ui5-v2-17-0_tokenizer_gap: .375em .25rem;--_ui5-v2-17-0_tokenizer-popover_offset: .1875rem;--_ui5-v2-17-0_slider_handle_icon_size: .875rem;--_ui5-v2-17-0_slider_padding: 1rem 1.0625rem;--_ui5-v2-17-0_range_slider_progress_focus_width: calc(100% + var(--_ui5-v2-17-0_slider_handle_width) + 10px);--_ui5-v2-17-0_range_slider_progress_focus_height: calc(var(--_ui5-v2-17-0_slider_handle_height) + 10px);--_ui5-v2-17-0_range_slider_progress_focus_top: -.8125rem;--_ui5-v2-17-0_slider_tooltip_bottom: 1.75rem;--_ui5-v2-17-0_slider_handle_focused_tooltip_distance: calc(var(--_ui5-v2-17-0_slider_tooltip_bottom) - var(--_ui5-v2-17-0_slider_handle_focus_width));--_ui5-v2-17-0_range_slider_progress_focus_left: calc(-1 * (var(--_ui5-v2-17-0_slider_handle_width) / 2) - 5px);--_ui5-v2-17-0_bar_base_height: 2.5rem;--_ui5-v2-17-0_bar_subheader_height: 2.25rem;--_ui5-v2-17-0_button_base_height: var(--sapElement_Compact_Height);--_ui5-v2-17-0_button_base_padding: .4375rem;--_ui5-v2-17-0_button_base_min_width: 2rem;--_ui5-v2-17-0-button-badge-diameter: .625rem;--_ui5-v2-17-0_calendar_height: 18rem;--_ui5-v2-17-0_calendar_width: 17.75rem;--_ui5-v2-17-0_calendar_left_right_padding: .25rem;--_ui5-v2-17-0_calendar_top_bottom_padding: .5rem;--_ui5-v2-17-0_calendar_header_height: 2rem;--_ui5-v2-17-0_calendar_header_arrow_button_width: 2rem;--_ui5-v2-17-0_calendar_header_padding: 0;--_ui5-v2-17-0-calendar-legend-root-padding: .5rem;--_ui5-v2-17-0-calendar-legend-root-width: 16.75rem;--_ui5-v2-17-0_checkbox_root_side_padding: var(--_ui5-v2-17-0_checkbox_wrapped_focus_padding);--_ui5-v2-17-0_checkbox_width_height: var(--_ui5-v2-17-0_checkbox_compact_width_height);--_ui5-v2-17-0_checkbox_wrapper_padding: var(--_ui5-v2-17-0_checkbox_compact_wrapper_padding);--_ui5-v2-17-0_checkbox_inner_width_height: var(--_ui5-v2-17-0_checkbox_compact_inner_size);--_ui5-v2-17-0_checkbox_icon_size: .75rem;--_ui5-v2-17-0_checkbox_partially_icon_size: .5rem;--_ui5-v2-17-0_color_picker_slider_progress_container_height: 1.125rem;--_ui5-v2-17-0_color_picker_slider_container_margin_top: -.375rem;--_ui5-v2-17-0_color_picker_slider_handle_height: 1.5rem;--_ui5-v2-17-0_color_picker_slider_handle_width: .9375rem;--_ui5-v2-17-0_color_picker_slider_handle_after_height: 1.25rem;--_ui5-v2-17-0_color_picker_slider_handle_focus_height: 1.625rem;--_ui5-v2-17-0_color_picker_colors_wrapper_height: 1.5rem;--_ui5-v2-17-0_color_picker_sliders_height: 2.25rem;--_ui5-v2-17-0_color_picker_main_color_margin_bottom: .75rem;--_ui5-v2-17-0_color_picker_slider_spacing: .8125rem;--_ui5-v2-17-0_color_channel_toggle_button_width: 1.375rem;--_ui5-v2-17-0_color_channel_toggle_button_margin-top: -.9375rem;--_ui5-v2-17-0_color_channel_hex_input_width: 4.625rem;--_ui5-v2-17-0-color_channel_margin_top: 0rem;--_ui5-v2-17-0_custom_list_item_rb_min_width: 2rem;--_ui5-v2-17-0_daypicker_weeknumbers_container_padding_top: 2rem;--_ui5-v2-17-0_day_picker_item_width: 2rem;--_ui5-v2-17-0_day_picker_item_height: 2rem;--_ui5-v2-17-0_day_picker_empty_height: 2.125rem;--_ui5-v2-17-0_day_picker_item_justify_content: flex-end;--_ui5-v2-17-0_dp_two_calendar_item_secondary_text_height: .75rem;--_ui5-v2-17-0_dp_two_calendar_item_text_padding_top: .5rem;--_ui5-v2-17-0_daypicker_special_day_top: 1.625rem;--_ui5-v2-17-0_daypicker_twocalendar_item_special_day_top: 1.25rem;--_ui5-v2-17-0_daypicker_twocalendar_item_special_day_right: 1.25rem;--_ui5-v2-17-0_daypicker_two_calendar_item_margin_bottom: 0;--_ui5-v2-17-0_daypicker_item_now_selected_two_calendar_focus_special_day_top: 1.125rem;--_ui5-v2-17-0_daypicker_item_now_selected_two_calendar_focus_special_day_right: 1.125rem;--_ui5-v2-17-0_daypicker_item_now_selected_two_calendar_focus_secondary_text_padding_block: 0 1rem;--_ui5-v2-17-0_datetime_picker_height: 20.5rem;--_ui5-v2-17-0_datetime_picker_width: 35.5rem;--_ui5-v2-17-0_datetime_timeview_width: 17rem;--_ui5-v2-17-0_datetime_timeview_phonemode_width: 18.5rem;--_ui5-v2-17-0_datetime_timeview_phonemode_clocks_width: 21.125rem;--_ui5-v2-17-0_datetime_dateview_phonemode_margin_bottom: 3.125rem;--_ui5-v2-17-0_dialog_content_min_height: 2.5rem;--_ui5-v2-17-0_dialog_footer_height: 2.5rem;--_ui5-v2-17-0_form_item_min_height: 2rem;--_ui5-v2-17-0_form_item_padding: .25rem;--_ui5-v2-17-0-form-group-heading-height: 2rem;--_ui5-v2-17-0_input_height: var(--sapElement_Compact_Height);--_ui5-v2-17-0_input_inner_padding: 0 .5rem;--_ui5-v2-17-0_input_inner_padding_with_icon: 0 .2rem 0 .5rem;--_ui5-v2-17-0_input_inner_space_to_tokenizer: .125rem;--_ui5-v2-17-0_input_inner_space_to_n_more_text: .125rem;--_ui5-v2-17-0_input_icon_min_width: var(--_ui5-v2-17-0_input_compact_min_width);--_ui5-v2-17-0_menu_item_padding: 0 .75rem 0 .5rem;--_ui5-v2-17-0_menu_item_submenu_icon_right: .75rem;--_ui5-v2-17-0_popup_default_header_height: 2.5rem;--_ui5-v2-17-0_textarea_margin: .1875rem 0;--_ui5-v2-17-0_list_no_data_height: 2rem;--_ui5-v2-17-0_list_item_cb_margin_right: .5rem;--_ui5-v2-17-0_list_item_title_size: var(--sapFontSize);--_ui5-v2-17-0_list_item_img_top_margin: .55rem;--_ui5-v2-17-0_list_no_data_font_size: var(--sapFontSize);--_ui5-v2-17-0_list_item_dropdown_base_height: 2rem;--_ui5-v2-17-0_list_item_base_height: 2rem;--_ui5-v2-17-0_list_item_base_padding: 0 1rem;--_ui5-v2-17-0_list_item_icon_size: 1rem;--_ui5-v2-17-0_list_item_selection_btn_margin_top: calc(-1 * var(--_ui5-v2-17-0_checkbox_wrapper_padding));--_ui5-v2-17-0_list_item_content_vertical_offset: calc((var(--_ui5-v2-17-0_list_item_base_height) - var(--_ui5-v2-17-0_list_item_title_size)) / 2);--_ui5-v2-17-0_list_buttons_left_space: .125rem;--_ui5-v2-17-0_month_picker_item_height: 2rem;--_ui5-v2-17-0_year_picker_item_height: 2rem;--_ui5-v2-17-0_panel_header_height: 2rem;--_ui5-v2-17-0_panel_button_root_height: 2rem;--_ui5-v2-17-0_panel_button_root_width: 2.75rem;--_ui5-v2-17-0_token_height: 1.25rem;--_ui5-v2-17-0_token_right_margin: .25rem;--_ui5-v2-17-0_token_left_padding: .25rem;--_ui5-v2-17-0_token_readonly_padding: .125rem .25rem;--_ui5-v2-17-0_token_focus_offset: -.125rem;--_ui5-v2-17-0_token_icon_size: .75rem;--_ui5-v2-17-0_token_icon_padding: .375rem .375rem;--_ui5-v2-17-0_token_outline_offset: -.125rem;--_ui5-v2-17-0_tl_bubble_padding: .5rem;--_ui5-v2-17-0_tl_padding: .5rem;--_ui5-v2-17-0_tl_li_margin_bottom: .5rem;--_ui5-v2-17-0_tc_item_text: 2rem;--_ui5-v2-17-0_tc_item_text_line_height: 1.325rem;--_ui5-v2-17-0_tc_item_add_text_margin_top: .3125rem;--_ui5-v2-17-0_tc_item_height: 4rem;--_ui5-v2-17-0_tc_header_height: var(--_ui5-v2-17-0_tc_item_height);--_ui5-v2-17-0_tc_item_icon_circle_size: 2rem;--_ui5-v2-17-0_tc_item_icon_size: 1rem;--_ui5-v2-17-0_radio_button_height: 2rem;--_ui5-v2-17-0_radio_button_label_side_padding: .5rem;--_ui5-v2-17-0_radio_button_inner_size: 2rem;--_ui5-v2-17-0_radio_button_svg_size: 1rem;--_ui5-v2-17-0-responsive_popover_header_height: 2.5rem;--_ui5-v2-17-0_slider_handle_height: 1.25rem;--_ui5-v2-17-0_slider_handle_width: 1.5rem;--_ui5-v2-17-0_slider_tooltip_padding: .25rem;--_ui5-v2-17-0_slider_progress_outline_offset: -.625rem;--_ui5-v2-17-0_slider_outer_height: 1.3125rem;--_ui5-v2-17-0_step_input_min_width: 6rem;--_ui5-v2-17-0_step_input_padding: 2rem;--_ui5-v2-17-0-tree-indent-step: .5rem;--_ui5-v2-17-0-tree-toggle-box-width: 2rem;--_ui5-v2-17-0-tree-toggle-box-height: 1.5rem;--_ui5-v2-17-0-tree-toggle-icon-size: .8125rem;--_ui5-v2-17-0_timeline_tli_indicator_before_bottom: -.75rem;--_ui5-v2-17-0_timeline_tli_indicator_before_right: -.5rem;--_ui5-v2-17-0_timeline_tli_indicator_before_without_icon_bottom: -1rem;--_ui5-v2-17-0_timeline_tli_indicator_before_without_icon_right: -.8125rem;--_ui5-v2-17-0_timeline_tli_indicator_before_height: calc(100% - 1.25rem) ;--_ui5-v2-17-0_timeline_tli_horizontal_without_icon_indicator_before_width: var(--_ui5-v2-17-0_timeline_tli_indicator_after_height);--_ui5-v2-17-0_timeline_tli_horizontal_indicator_after_width: var(--_ui5-v2-17-0_timeline_tli_indicator_after_height);--_ui5-v2-17-0_timeline_tli_horizontal_indicator_before_width: var(--_ui5-v2-17-0_timeline_tli_indicator_after_height);--_ui5-v2-17-0_timeline_tli_icon_horizontal_indicator_after_width: var(--_ui5-v2-17-0_timeline_tli_indicator_after_height);--_ui5-v2-17-0_timeline_tli_indicator_after_top: calc(-100% + .9375rem) ;--_ui5-v2-17-0_timeline_tli_indicator_after_height: calc(100% - .75rem) ;--_ui5-v2-17-0_timeline_tli_horizontal_indicator_after_left: 1.8625rem;--_ui5-v2-17-0_timeline_tli_horizontal_indicator_short_after_width: calc(100% - 1rem) ;--_ui5-v2-17-0_timeline_tli_without_icon_horizontal_indicator_before_width: calc(100% - .625rem) ;--_ui5-v2-17-0_timeline_tlgi_compact_icon_before_height: calc(100% + 1.5rem) ;--_ui5-v2-17-0_timeline_tlgi_horizontal_line_placeholder_before_width: var(--_ui5-v2-17-0_timeline_tlgi_compact_icon_before_height);--_ui5-v2-17-0_timeline_tlgi_horizontal_compact_root_margin_left: .5rem;--_ui5-v2-17-0_timeline_tlgi_compact_root_gap: .5rem;--_ui5-v2-17-0_timeline_tlgi_root_horizontal_height: 19.375rem;--_ui5-v2-17-0_vsd_header_container: 2.5rem;--_ui5-v2-17-0_vsd_sub_header_container_height: 2rem;--_ui5-v2-17-0_vsd_expand_content_height: 25.4375rem;--_ui5-v2-17-0-toolbar-separator-height: 1.5rem;--_ui5-v2-17-0-toolbar-height: 2rem;--_ui5-v2-17-0_toolbar_overflow_padding: .1875rem .375rem;--_ui5-v2-17-0_dynamic_page_title_actions_separator_height: var(--_ui5-v2-17-0-toolbar-separator-height);--_ui5-v2-17-0-shellbar-separator-height: 2rem;--_ui5-v2-17-0_textarea_padding_top: .1875rem;--_ui5-v2-17-0_textarea_padding_bottom: .125rem;--_ui5-v2-17-0_checkbox_focus_position: .125rem;--_ui5-v2-17-0_split_button_middle_separator_top: .3125rem;--_ui5-v2-17-0_split_button_middle_separator_height: 1rem;--_ui5-v2-17-0_slider_handle_top: -.5rem;--_ui5-v2-17-0_slider_tooltip_height: 1.375rem;--_ui5-v2-17-0_checkbox_wrapped_focus_inset_block: .125rem;--_ui5-v2-17-0_color-palette-item-height: 1.25rem;--_ui5-v2-17-0_color-palette-item-hover-height: 1.625rem;--_ui5-v2-17-0_color-palette-item-margin: calc(((var(--_ui5-v2-17-0_color-palette-item-hover-height) - var(--_ui5-v2-17-0_color-palette-item-height)) / 2) + .0625rem);--_ui5-v2-17-0_color-palette-row-width: 8.75rem;--_ui5-v2-17-0_color-palette-swatch-container-padding: .1875rem .5rem;--_ui5-v2-17-0_color-palette-item-hover-margin: .0625rem;--_ui5-v2-17-0_color-palette-row-height: 7.5rem;--_ui5-v2-17-0_color-palette-button-height: 2rem;--_ui5-v2-17-0_color-palette-item-before-focus-inset: -.25rem;--_ui5-v2-17-0_daypicker_selected_item_now_special_day_top: 1.5625rem;--_ui5-v2-17-0_daypicker_specialday_focused_top: 1.3125rem;--_ui5-v2-17-0_daypicker_selected_item_now_special_day_border_bottom_radius_alternate: .5rem;--_ui5-v2-17-0_daypicker_specialday_focused_border_bottom: .25rem;--_ui5-v2-17-0_daypicker_item_now_specialday_top: 1.4375rem;--_ui5-v2-17-0_dp_two_calendar_item_secondary_text_padding_block: 0 .375rem;--_ui5-v2-17-0_dp_two_calendar_item_secondary_text_padding: 0 .375rem;--_ui5-v2-17-0_daypicker_two_calendar_item_selected_focus_margin_bottom: -.25rem;--_ui5-v2-17-0_daypicker_two_calendar_item_selected_focus_padding_right: .4375rem}:root,:dir(ltr){--_ui5-v2-17-0_rotation_90deg: rotate(90deg);--_ui5-v2-17-0_rotation_minus_90deg: rotate(-90deg);--_ui5-v2-17-0_icon_transform_scale: none;--_ui5-v2-17-0_panel_toggle_btn_rotation: var(--_ui5-v2-17-0_rotation_90deg);--_ui5-v2-17-0_popover_upward_arrow_margin: .1875rem 0 0 .1875rem;--_ui5-v2-17-0_popover_right_arrow_margin: .1875rem 0 0 -.375rem;--_ui5-v2-17-0_popover_downward_arrow_margin: -.375rem 0 0 .125rem;--_ui5-v2-17-0_popover_left_arrow_margin: .125rem 0 0 .25rem;--_ui5-v2-17-0_dialog_resize_cursor: se-resize;--_ui5-v2-17-0_progress_indicator_bar_border_radius: .5rem 0 0 .5rem;--_ui5-v2-17-0_progress_indicator_remaining_bar_border_radius: 0 .5rem .5rem 0;--_ui5-v2-17-0_menu_submenu_margin_offset: -.25rem 0}:dir(rtl){--_ui5-v2-17-0_icon_transform_scale: scale(-1, 1);--_ui5-v2-17-0_panel_toggle_btn_rotation: var(--_ui5-v2-17-0_rotation_minus_90deg);--_ui5-v2-17-0_popover_upward_arrow_margin: .1875rem .125rem 0 0;--_ui5-v2-17-0_popover_right_arrow_margin: .1875rem .25rem 0 0;--_ui5-v2-17-0_popover_downward_arrow_margin: -.4375rem .125rem 0 0;--_ui5-v2-17-0_popover_left_arrow_margin: .1875rem -.375rem 0 0;--_ui5-v2-17-0_dialog_resize_cursor:sw-resize;--_ui5-v2-17-0_menu_submenu_margin_offset: 0 -.25rem;--_ui5-v2-17-0_segmented_btn_item_border_left: .0625rem;--_ui5-v2-17-0_segmented_btn_item_border_right: .0625rem;--_ui5-v2-17-0_progress_indicator_bar_border_radius: .5rem;--_ui5-v2-17-0_progress_indicator_remaining_bar_border_radius: .25rem}
`;

    p$4("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => defaultThemeBase);
    p$4("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => defaultTheme);
    var iconCss = `:host{-webkit-tap-highlight-color:rgba(0,0,0,0)}:host([hidden]){display:none}:host([invalid]){display:none}:host(:not([hidden]).ui5_hovered){opacity:.7}:host{display:inline-block;width:1rem;height:1rem;color:var(--sapContent_IconColor);fill:currentColor;outline:none}:host([design="Contrast"]){color:var(--sapContent_ContrastIconColor)}:host([design="Critical"]){color:var(--sapCriticalElementColor)}:host([design="Information"]){color:var(--sapInformativeElementColor)}:host([design="Negative"]){color:var(--sapNegativeElementColor)}:host([design="Neutral"]){color:var(--sapNeutralElementColor)}:host([design="NonInteractive"]){color:var(--sapContent_NonInteractiveIconColor)}:host([design="Positive"]){color:var(--sapPositiveElementColor)}:host([mode="Interactive"][desktop]) .ui5-icon-root:focus,:host([mode="Interactive"]) .ui5-icon-root:focus-visible{outline:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);border-radius:var(--ui5-v2-17-0-icon-focus-border-radius)}.ui5-icon-root{display:flex;height:100%;width:100%;outline:none;vertical-align:top}:host([mode="Interactive"]){cursor:pointer}.ui5-icon-root:not([dir=ltr])>g{transform:var(--_ui5-v2-17-0_icon_transform_scale);transform-origin:center}
`;

    var __decorate$4 = (this && this.__decorate) || function (decorators, target, key, desc) {
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
    let Icon = class Icon extends b$2 {
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
             * @default "Decorative"
             * @public
             * @since 2.0.0
             */
            this.mode = "Decorative";
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
            if (b(e)) {
                this.fireDecoratorEvent("click");
            }
            if (A$2(e)) {
                e.preventDefault(); // prevent scrolling
            }
        }
        _onkeyup(e) {
            if (this.mode === IconMode$1.Interactive && A$2(e)) {
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
                return;
            }
            let iconData = D(name);
            if (!iconData) {
                iconData = await n$1(name);
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
            if ("customTemplate" in iconData && iconData.customTemplate) {
                this.customTemplate = n$a(iconData.customTemplate, this);
            }
            if ("customTemplateAsString" in iconData) {
                this.customTemplateAsString = iconData.customTemplateAsString;
            }
            // in case a new valid name is set, show the icon
            this.invalid = false;
            if ("pathData" in iconData && iconData.pathData) {
                this.pathData = Array.isArray(iconData.pathData) ? iconData.pathData : [iconData.pathData];
            }
            this.accData = iconData.accData;
            this.ltr = iconData.ltr;
            this.packageName = iconData.packageName;
            if (this.accessibleName) {
                this.effectiveAccessibleName = this.accessibleName;
            }
            else if (this.accData) {
                if (this.packageName) {
                    const i18nBundle = await f$5(this.packageName);
                    this.effectiveAccessibleName = i18nBundle.getText(this.accData) || undefined;
                }
                else {
                    this.effectiveAccessibleName = this.accData?.defaultText || undefined;
                }
            }
            else {
                this.effectiveAccessibleName = undefined;
            }
        }
        get hasIconTooltip() {
            return this.showTooltip && this.effectiveAccessibleName;
        }
    };
    __decorate$4([
        s$3()
    ], Icon.prototype, "design", void 0);
    __decorate$4([
        s$3()
    ], Icon.prototype, "name", void 0);
    __decorate$4([
        s$3()
    ], Icon.prototype, "accessibleName", void 0);
    __decorate$4([
        s$3({ type: Boolean })
    ], Icon.prototype, "showTooltip", void 0);
    __decorate$4([
        s$3()
    ], Icon.prototype, "mode", void 0);
    __decorate$4([
        s$3({ type: Array })
    ], Icon.prototype, "pathData", void 0);
    __decorate$4([
        s$3({ type: Object, noAttribute: true })
    ], Icon.prototype, "accData", void 0);
    __decorate$4([
        s$3({ type: Boolean })
    ], Icon.prototype, "invalid", void 0);
    __decorate$4([
        s$3({ noAttribute: true })
    ], Icon.prototype, "effectiveAccessibleName", void 0);
    Icon = __decorate$4([
        m$3({
            tag: "ui5-icon",
            languageAware: true,
            themeAware: true,
            renderer: y$2,
            template: IconTemplate,
            styles: iconCss,
        })
        /**
         * Fired on mouseup, `SPACE` and `ENTER`.
         * - on mouse click, the icon fires native `click` event
         * - on `SPACE` and `ENTER`, the icon fires custom `click` event
         * @public
         * @since 2.11.0
         */
        ,
        l$4("click", {
            bubbles: true,
        })
    ], Icon);
    Icon.define();
    var Icon$1 = Icon;

    /**
     * Different BusyIndicator text placements.
     *
     * @public
     */
    var BusyIndicatorTextPlacement;
    (function (BusyIndicatorTextPlacement) {
        /**
         * The text will be displayed on top of the busy indicator.
         * @public
         */
        BusyIndicatorTextPlacement["Top"] = "Top";
        /**
         * The text will be displayed at the bottom of the busy indicator.
         * @public
         */
        BusyIndicatorTextPlacement["Bottom"] = "Bottom";
    })(BusyIndicatorTextPlacement || (BusyIndicatorTextPlacement = {}));
    var BusyIndicatorTextPlacement$1 = BusyIndicatorTextPlacement;

    const BUSY_INDICATOR_TITLE = { key: "BUSY_INDICATOR_TITLE", defaultText: "Please wait" };
    const BUTTON_ARIA_TYPE_ACCEPT = { key: "BUTTON_ARIA_TYPE_ACCEPT", defaultText: "Positive Action" };
    const BUTTON_ARIA_TYPE_REJECT = { key: "BUTTON_ARIA_TYPE_REJECT", defaultText: "Negative Action" };
    const BUTTON_ARIA_TYPE_EMPHASIZED = { key: "BUTTON_ARIA_TYPE_EMPHASIZED", defaultText: "Default Action" };
    const BUTTON_ARIA_TYPE_ATTENTION = { key: "BUTTON_ARIA_TYPE_ATTENTION", defaultText: "Warning" };
    const BUTTON_BADGE_ONE_ITEM = { key: "BUTTON_BADGE_ONE_ITEM", defaultText: "{0} item" };
    const BUTTON_BADGE_MANY_ITEMS = { key: "BUTTON_BADGE_MANY_ITEMS", defaultText: "{0} items" };
    const BUTTON_ROLE_DESCRIPTION = { key: "BUTTON_ROLE_DESCRIPTION", defaultText: "Button" };
    const LINK_ROLE_DESCRIPTION = { key: "LINK_ROLE_DESCRIPTION", defaultText: "Link" };
    const PANEL_ICON = { key: "PANEL_ICON", defaultText: "Expand/Collapse" };
    const LABEL_COLON = { key: "LABEL_COLON", defaultText: ":" };

    function LabelTemplate() {
        return (jsxs("label", { class: "ui5-label-root", onClick: this._onclick, children: [jsx("span", { class: "ui5-label-text-wrapper", children: jsx("slot", {}) }), jsx("span", { "aria-hidden": "true", class: "ui5-label-required-colon", "data-ui5-colon": this._colonSymbol })] }));
    }

    p$4("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => defaultThemeBase);
    p$4("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => defaultTheme);
    var labelCss = `:host(:not([hidden])){display:inline-flex}:host{max-width:100%;color:var(--sapContent_LabelColor);font-family:var(--sapFontFamily);font-size:var(--sapFontSize);font-weight:400;cursor:text}.ui5-label-root{width:100%;cursor:inherit}:host{white-space:normal}:host([wrapping-type="None"]){white-space:nowrap}:host([wrapping-type="None"]) .ui5-label-root{display:inline-flex}:host([wrapping-type="None"]) .ui5-label-text-wrapper{text-overflow:ellipsis;overflow:hidden;display:inline-block;vertical-align:top;flex:0 1 auto;min-width:0}:host([show-colon]) .ui5-label-required-colon:before{content:attr(data-ui5-colon)}:host([required]) .ui5-label-required-colon:after{content:"*";color:var(--sapField_RequiredColor);font-size:var(--sapFontLargeSize);font-weight:700;position:relative;font-style:normal;vertical-align:middle;line-height:0}.ui5-label-text-wrapper{padding-inline-end:.075rem}:host([required][show-colon]) .ui5-label-required-colon:after{margin-inline-start:.125rem}:host([show-colon]) .ui5-label-required-colon{margin-inline-start:-.05rem;white-space:pre}
`;

    var __decorate$3 = (this && this.__decorate) || function (decorators, target, key, desc) {
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
    let Label = Label_1 = class Label extends b$2 {
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
    __decorate$3([
        s$3()
    ], Label.prototype, "for", void 0);
    __decorate$3([
        s$3({ type: Boolean })
    ], Label.prototype, "showColon", void 0);
    __decorate$3([
        s$3({ type: Boolean })
    ], Label.prototype, "required", void 0);
    __decorate$3([
        s$3()
    ], Label.prototype, "wrappingType", void 0);
    __decorate$3([
        i$2("@ui5/webcomponents")
    ], Label, "i18nBundle", void 0);
    Label = Label_1 = __decorate$3([
        m$3({
            tag: "ui5-label",
            renderer: y$2,
            template: LabelTemplate,
            styles: labelCss,
            languageAware: true,
        })
    ], Label);
    Label.define();
    var Label$1 = Label;

    function BusyIndicatorTemplate() {
        return (jsxs("div", { class: "ui5-busy-indicator-root", children: [this._isBusy && (jsxs("div", { class: {
                        "ui5-busy-indicator-busy-area": true,
                        "ui5-busy-indicator-busy-area-over-content": this.hasContent,
                    }, title: this.ariaTitle, tabindex: 0, role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuetext": "Busy", "aria-labelledby": this.labelId, "data-sap-focus-ref": true, children: [this.textPosition.top && BusyIndicatorBusyText.call(this), jsxs("div", { class: "ui5-busy-indicator-circles-wrapper", children: [jsx("div", { class: "ui5-busy-indicator-circle circle-animation-0" }), jsx("div", { class: "ui5-busy-indicator-circle circle-animation-1" }), jsx("div", { class: "ui5-busy-indicator-circle circle-animation-2" })] }), this.textPosition.bottom && BusyIndicatorBusyText.call(this)] })), jsx("slot", {}), this._isBusy && (jsx("span", { "data-ui5-focus-redirect": true, tabindex: 0, role: "none", onFocusIn: this._redirectFocus }))] }));
    }
    function BusyIndicatorBusyText() {
        return (jsx(Fragment, { children: this.text && (jsx(Label$1, { id: `${this._id}-label`, class: "ui5-busy-indicator-text", children: this.text })) }));
    }

    p$4("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => defaultThemeBase);
    p$4("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => defaultTheme);
    var busyIndicatorCss = `:host(:not([hidden])){display:inline-block}:host([_is-busy]){color:var(--_ui5-v2-17-0_busy_indicator_color)}:host([size="S"]) .ui5-busy-indicator-root{min-width:1.625rem;min-height:.5rem}:host([size="S"][text]:not([text=""])) .ui5-busy-indicator-root{min-height:1.75rem}:host([size="S"]) .ui5-busy-indicator-circle{width:.5rem;height:.5rem}:host([size="S"]) .ui5-busy-indicator-circle:first-child,:host([size="S"]) .ui5-busy-indicator-circle:nth-child(2){margin-inline-end:.0625rem}:host(:not([size])) .ui5-busy-indicator-root,:host([size="M"]) .ui5-busy-indicator-root{min-width:3.375rem;min-height:1rem}:host([size="M"]) .ui5-busy-indicator-circle:first-child,:host([size="M"]) .ui5-busy-indicator-circle:nth-child(2){margin-inline-end:.1875rem}:host(:not([size])[text]:not([text=""])) .ui5-busy-indicator-root,:host([size="M"][text]:not([text=""])) .ui5-busy-indicator-root{min-height:2.25rem}:host(:not([size])) .ui5-busy-indicator-circle,:host([size="M"]) .ui5-busy-indicator-circle{width:1rem;height:1rem}:host([size="L"]) .ui5-busy-indicator-root{min-width:6.5rem;min-height:2rem}:host([size="L"]) .ui5-busy-indicator-circle:first-child,:host([size="L"]) .ui5-busy-indicator-circle:nth-child(2){margin-inline-end:.25rem}:host([size="L"][text]:not([text=""])) .ui5-busy-indicator-root{min-height:3.25rem}:host([size="L"]) .ui5-busy-indicator-circle{width:2rem;height:2rem}.ui5-busy-indicator-root{display:flex;justify-content:center;align-items:center;position:relative;background-color:inherit;height:inherit;border-radius:inherit}.ui5-busy-indicator-busy-area.ui5-busy-indicator-busy-area-over-content{position:absolute;inset:0;z-index:99}.ui5-busy-indicator-busy-area{display:flex;justify-content:center;align-items:center;background-color:inherit;flex-direction:column;border-radius:inherit}:host([active]) ::slotted(*){opacity:var(--sapContent_DisabledOpacity)}:host([desktop]) .ui5-busy-indicator-busy-area:focus,.ui5-busy-indicator-busy-area:focus-visible{outline:var(--_ui5-v2-17-0_busy_indicator_focus_outline);outline-offset:-2px}.ui5-busy-indicator-circles-wrapper{line-height:0}.ui5-busy-indicator-circle{display:inline-block;background-color:currentColor;border-radius:50%}.ui5-busy-indicator-circle:before{content:"";width:100%;height:100%;border-radius:100%}.circle-animation-0{animation:grow 1.6s infinite cubic-bezier(.32,.06,.85,1.11)}.circle-animation-1{animation:grow 1.6s infinite cubic-bezier(.32,.06,.85,1.11);animation-delay:.2s}.circle-animation-2{animation:grow 1.6s infinite cubic-bezier(.32,.06,.85,1.11);animation-delay:.4s}.ui5-busy-indicator-text{width:100%;text-align:center}:host([text-placement="Top"]) .ui5-busy-indicator-text{margin-bottom:.5rem}:host(:not([text-placement])) .ui5-busy-indicator-text,:host([text-placement="Bottom"]) .ui5-busy-indicator-text{margin-top:.5rem}@keyframes grow{0%,50%,to{-webkit-transform:scale(.5);-moz-transform:scale(.5);transform:scale(.5)}25%{-webkit-transform:scale(1);-moz-transform:scale(1);transform:scale(1)}}
`;

    var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var BusyIndicator_1;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-busy-indicator` signals that some operation is going on and that the
     * user must wait. It does not block the current UI screen so other operations could be triggered in parallel.
     * It displays 3 dots and each dot expands and shrinks at a different rate, resulting in a cascading flow of animation.
     *
     * ### Usage
     * For the `ui5-busy-indicator` you can define the size, the text and whether it is shown or hidden.
     * In order to hide it, use the "active" property.
     *
     * In order to show busy state over an HTML element, simply nest the HTML element in a `ui5-busy-indicator` instance.
     *
     * **Note:** Since `ui5-busy-indicator` has `display: inline-block;` by default and no width of its own,
     * whenever you need to wrap a block-level element, you should set `display: block` to the busy indicator as well.
     *
     * #### When to use:
     *
     * - The user needs to be able to cancel the operation.
     * - Only part of the application or a particular component is affected.
     *
     * #### When not to use:
     *
     * - The operation takes less than one second.
     * - You need to block the screen and prevent the user from starting another activity.
     * - Do not show multiple busy indicators at once.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/BusyIndicator.js";`
     * @constructor
     * @extends UI5Element
     * @public
     * @slot {Array<Node>} default - Determines the content over which the component will appear.
     * @since 0.12.0
     */
    let BusyIndicator = BusyIndicator_1 = class BusyIndicator extends b$2 {
        constructor() {
            super();
            /**
             * Defines the size of the component.
             * @default "M"
             * @public
             */
            this.size = "M";
            /**
             * Defines if the busy indicator is visible on the screen. By default it is not.
             * @default false
             * @public
             */
            this.active = false;
            /**
             * Defines the delay in milliseconds, after which the busy indicator will be visible on the screen.
             * @default 1000
             * @public
             */
            this.delay = 1000;
            /**
             * Defines the placement of the text.
             *
             * @default "Bottom"
             * @public
             */
            this.textPlacement = "Bottom";
            /**
             * Defines if the component is currently in busy state.
             * @private
             */
            this._isBusy = false;
            this._keydownHandler = this._handleKeydown.bind(this);
            this._preventEventHandler = this._preventEvent.bind(this);
        }
        onEnterDOM() {
            this.addEventListener("keydown", this._keydownHandler, {
                capture: true,
            });
            this.addEventListener("keyup", this._preventEventHandler, {
                capture: true,
            });
            if (f$8()) {
                this.setAttribute("desktop", "");
            }
        }
        onExitDOM() {
            if (this._busyTimeoutId) {
                clearTimeout(this._busyTimeoutId);
                delete this._busyTimeoutId;
            }
            this.removeEventListener("keydown", this._keydownHandler, true);
            this.removeEventListener("keyup", this._preventEventHandler, true);
        }
        get ariaTitle() {
            return BusyIndicator_1.i18nBundle.getText(BUSY_INDICATOR_TITLE);
        }
        get labelId() {
            return this.text ? `${this._id}-label` : undefined;
        }
        get textPosition() {
            return {
                top: this.text && this.textPlacement === BusyIndicatorTextPlacement$1.Top,
                bottom: this.text && this.textPlacement === BusyIndicatorTextPlacement$1.Bottom,
            };
        }
        get hasContent() {
            return t(Array.from(this.children));
        }
        onBeforeRendering() {
            if (this.active) {
                if (!this._isBusy && !this._busyTimeoutId) {
                    this._busyTimeoutId = setTimeout(() => {
                        delete this._busyTimeoutId;
                        this._isBusy = true;
                    }, Math.max(0, this.delay));
                }
            }
            else {
                if (this._busyTimeoutId) {
                    clearTimeout(this._busyTimeoutId);
                    delete this._busyTimeoutId;
                }
                this._isBusy = false;
            }
        }
        _handleKeydown(e) {
            if (!this._isBusy) {
                return;
            }
            e.stopImmediatePropagation();
            // move the focus to the last element in this DOM and let TAB continue to the next focusable element
            if (x(e)) {
                this.focusForward = true;
                this.shadowRoot.querySelector("[data-ui5-focus-redirect]").focus();
                this.focusForward = false;
            }
        }
        _preventEvent(e) {
            if (this._isBusy) {
                e.stopImmediatePropagation();
            }
        }
        /**
         * Moves the focus to busy area when coming with SHIFT + TAB
         */
        _redirectFocus(e) {
            if (this.focusForward) {
                return;
            }
            e.preventDefault();
            this.shadowRoot.querySelector(".ui5-busy-indicator-busy-area").focus();
        }
    };
    __decorate$2([
        s$3()
    ], BusyIndicator.prototype, "text", void 0);
    __decorate$2([
        s$3()
    ], BusyIndicator.prototype, "size", void 0);
    __decorate$2([
        s$3({ type: Boolean })
    ], BusyIndicator.prototype, "active", void 0);
    __decorate$2([
        s$3({ type: Number })
    ], BusyIndicator.prototype, "delay", void 0);
    __decorate$2([
        s$3()
    ], BusyIndicator.prototype, "textPlacement", void 0);
    __decorate$2([
        s$3({ type: Boolean })
    ], BusyIndicator.prototype, "_isBusy", void 0);
    __decorate$2([
        i$2("@ui5/webcomponents")
    ], BusyIndicator, "i18nBundle", void 0);
    BusyIndicator = BusyIndicator_1 = __decorate$2([
        m$3({
            tag: "ui5-busy-indicator",
            languageAware: true,
            styles: busyIndicatorCss,
            renderer: y$2,
            template: BusyIndicatorTemplate,
        })
    ], BusyIndicator);
    BusyIndicator.define();
    var BusyIndicator$1 = BusyIndicator;

    /**
     * Different BusyIndicator sizes.
     * @public
     */
    var BusyIndicatorSize;
    (function (BusyIndicatorSize) {
        /**
         * small size
         * @public
         */
        BusyIndicatorSize["S"] = "S";
        /**
         * medium size
         * @public
         */
        BusyIndicatorSize["M"] = "M";
        /**
         * large size
         * @public
         */
        BusyIndicatorSize["L"] = "L";
    })(BusyIndicatorSize || (BusyIndicatorSize = {}));
    var BusyIndicatorSize$1 = BusyIndicatorSize;

    function ButtonTemplate(injectedProps) {
        return (jsxs(Fragment, { children: [jsxs("button", { type: "button", class: {
                        "ui5-button-root": true,
                        "ui5-button-badge-placement-end": this.badge[0]?.design === "InlineText",
                        "ui5-button-badge-placement-end-top": this.badge[0]?.design === "OverlayText",
                        "ui5-button-badge-dot": this.badge[0]?.design === "AttentionDot"
                    }, disabled: this.disabled, "data-sap-focus-ref": true, "aria-pressed": injectedProps?.ariaPressed, "aria-valuemin": injectedProps?.ariaValueMin, "aria-valuemax": injectedProps?.ariaValueMax, "aria-valuenow": injectedProps?.ariaValueNow, "aria-valuetext": injectedProps?.ariaValueText, onFocusOut: this._onfocusout, onClick: this._onclick, onMouseDown: this._onmousedown, onKeyDown: this._onkeydown, onKeyUp: this._onkeyup, onTouchStart: this._ontouchstart, onTouchEnd: this._ontouchend, tabindex: this.tabIndexValue, "aria-expanded": this._computedAccessibilityAttributes?.expanded, "aria-controls": this._computedAccessibilityAttributes?.controls, "aria-haspopup": this._computedAccessibilityAttributes?.hasPopup, "aria-label": this._computedAccessibilityAttributes?.ariaLabel, "aria-keyshortcuts": this._computedAccessibilityAttributes?.ariaKeyShortcuts, "aria-description": this.ariaDescriptionText, "aria-busy": this.loading ? "true" : undefined, title: this.buttonTitle, part: "button", role: this.effectiveAccRole, children: [this.icon &&
                            jsx(Icon$1, { class: "ui5-button-icon", name: this.icon, mode: "Decorative", part: "icon" }), jsx("span", { id: `${this._id}-content`, class: "ui5-button-text", children: jsx("bdi", { children: jsx("slot", {}) }) }), this.endIcon &&
                            jsx(Icon$1, { class: "ui5-button-end-icon", name: this.endIcon, mode: "Decorative", part: "endIcon" }), this.shouldRenderBadge &&
                            jsx("slot", { name: "badge" })] }), this.loading &&
                    jsx(BusyIndicator$1, { id: `${this._id}-button-busy-indicator`, class: "ui5-button-busy-indicator", size: this.iconOnly ? BusyIndicatorSize$1.S : BusyIndicatorSize$1.M, active: true, delay: this.loadingDelay, inert: this.loading })] }));
    }

    p$4("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => defaultThemeBase);
    p$4("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => defaultTheme);
    var buttonCss = `:host{vertical-align:middle}.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:inline-block}:host{min-width:var(--_ui5-v2-17-0_button_base_min_width);height:var(--_ui5-v2-17-0_button_base_height);line-height:normal;font-family:var(--_ui5-v2-17-0_button_fontFamily);font-size:var(--sapFontSize);text-shadow:var(--_ui5-v2-17-0_button_text_shadow);border-radius:var(--_ui5-v2-17-0_button_border_radius);cursor:pointer;background-color:var(--sapButton_Background);border:var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);color:var(--sapButton_TextColor);box-sizing:border-box;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;-webkit-tap-highlight-color:transparent}.ui5-button-root{min-width:inherit;cursor:inherit;height:100%;width:100%;box-sizing:border-box;display:flex;justify-content:center;align-items:center;outline:none;padding:0 var(--_ui5-v2-17-0_button_base_padding);position:relative;background:transparent;border:none;color:inherit;text-shadow:inherit;font:inherit;white-space:inherit;overflow:inherit;text-overflow:inherit;letter-spacing:inherit;word-spacing:inherit;line-height:inherit;-webkit-user-select:none;-moz-user-select:none;user-select:none}:host(:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host(:not([hidden]):not([disabled]).ui5_hovered){background:var(--sapButton_Hover_Background);border:1px solid var(--sapButton_Hover_BorderColor);color:var(--sapButton_Hover_TextColor)}.ui5-button-icon,.ui5-button-end-icon{color:inherit;flex-shrink:0}.ui5-button-end-icon{margin-inline-start:var(--_ui5-v2-17-0_button_base_icon_margin)}:host([icon-only]:not([has-end-icon])) .ui5-button-root{min-width:auto;padding:0}:host([icon-only]) .ui5-button-text{display:none}.ui5-button-text{outline:none;position:relative;white-space:inherit;overflow:inherit;text-overflow:inherit}:host([has-icon]:not(:empty)) .ui5-button-text{margin-inline-start:var(--_ui5-v2-17-0_button_base_icon_margin)}:host([has-end-icon]:not([has-icon]):empty) .ui5-button-end-icon{margin-inline-start:0}:host([disabled]){opacity:var(--sapContent_DisabledOpacity);pointer-events:unset;cursor:default}:host([has-icon]:not([icon-only]):not([has-end-icon])) .ui5-button-text{min-width:calc(var(--_ui5-v2-17-0_button_base_min_width) - var(--_ui5-v2-17-0_button_base_icon_margin) - 1rem)}:host([disabled]:active){pointer-events:none}:host([desktop]:not([loading])) .ui5-button-root:focus-within:after,:host(:not([active])) .ui5-button-root:focus-visible:after,:host([desktop][active][design="Emphasized"]) .ui5-button-root:focus-within:after,:host([active][design="Emphasized"]) .ui5-button-root:focus-visible:after,:host([desktop][active]) .ui5-button-root:focus-within:before,:host([active]) .ui5-button-root:focus-visible:before{content:"";position:absolute;box-sizing:border-box;pointer-events:none;inset:.0625rem;border:var(--_ui5-v2-17-0_button_focused_border);border-radius:var(--_ui5-v2-17-0_button_focused_border_radius)}:host([desktop][active]) .ui5-button-root:focus-within:before,:host([active]) .ui5-button-root:focus-visible:before{border-color:var(--_ui5-v2-17-0_button_pressed_focused_border_color)}:host([design="Emphasized"][desktop]) .ui5-button-root:focus-within:after,:host([design="Emphasized"]) .ui5-button-root:focus-visible:after{border-color:var(--_ui5-v2-17-0_button_emphasized_focused_border_color)}:host([design="Emphasized"][desktop]) .ui5-button-root:focus-within:before,:host([design="Emphasized"]) .ui5-button-root:focus-visible:before{content:"";position:absolute;box-sizing:border-box;inset:.0625rem;border:var(--_ui5-v2-17-0_button_emphasized_focused_border_before);border-radius:var(--_ui5-v2-17-0_button_focused_border_radius)}.ui5-button-root::-moz-focus-inner{border:0}bdi{display:block;white-space:inherit;overflow:inherit;text-overflow:inherit}:host([ui5-button][active]:not([disabled]):not([non-interactive])){background-image:none;background-color:var(--sapButton_Active_Background);border-color:var(--sapButton_Active_BorderColor);color:var(--sapButton_Active_TextColor)}:host([design="Positive"]){background-color:var(--sapButton_Accept_Background);border-color:var(--sapButton_Accept_BorderColor);color:var(--sapButton_Accept_TextColor)}:host([design="Positive"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Positive"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Accept_Hover_Background);border-color:var(--sapButton_Accept_Hover_BorderColor);color:var(--sapButton_Accept_Hover_TextColor)}:host([ui5-button][design="Positive"][active]:not([non-interactive])){background-color:var(--sapButton_Accept_Active_Background);border-color:var(--sapButton_Accept_Active_BorderColor);color:var(--sapButton_Accept_Active_TextColor)}:host([design="Negative"]){background-color:var(--sapButton_Reject_Background);border-color:var(--sapButton_Reject_BorderColor);color:var(--sapButton_Reject_TextColor)}:host([design="Negative"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Negative"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Reject_Hover_Background);border-color:var(--sapButton_Reject_Hover_BorderColor);color:var(--sapButton_Reject_Hover_TextColor)}:host([ui5-button][design="Negative"][active]:not([non-interactive])){background-color:var(--sapButton_Reject_Active_Background);border-color:var(--sapButton_Reject_Active_BorderColor);color:var(--sapButton_Reject_Active_TextColor)}:host([design="Attention"]){background-color:var(--sapButton_Attention_Background);border-color:var(--sapButton_Attention_BorderColor);color:var(--sapButton_Attention_TextColor)}:host([design="Attention"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Attention"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Attention_Hover_Background);border-color:var(--sapButton_Attention_Hover_BorderColor);color:var(--sapButton_Attention_Hover_TextColor)}:host([ui5-button][design="Attention"][active]:not([non-interactive])){background-color:var(--sapButton_Attention_Active_Background);border-color:var(--sapButton_Attention_Active_BorderColor);color:var(--sapButton_Attention_Active_TextColor)}:host([design="Emphasized"]){background-color:var(--sapButton_Emphasized_Background);border-color:var(--sapButton_Emphasized_BorderColor);border-width:var(--_ui5-v2-17-0_button_emphasized_border_width);color:var(--sapButton_Emphasized_TextColor);font-family:var(--sapButton_Emphasized_FontFamily)}:host([design="Emphasized"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Emphasized"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Emphasized_Hover_Background);border-color:var(--sapButton_Emphasized_Hover_BorderColor);border-width:var(--_ui5-v2-17-0_button_emphasized_border_width);color:var(--sapButton_Emphasized_Hover_TextColor)}:host([ui5-button][design="Empasized"][active]:not([non-interactive])){background-color:var(--sapButton_Emphasized_Active_Background);border-color:var(--sapButton_Emphasized_Active_BorderColor);color:var(--sapButton_Emphasized_Active_TextColor)}:host([design="Emphasized"][desktop]) .ui5-button-root:focus-within:after,:host([design="Emphasized"]) .ui5-button-root:focus-visible:after{border-color:var(--_ui5-v2-17-0_button_emphasized_focused_border_color);outline:none}:host([design="Emphasized"][desktop][active]:not([non-interactive])) .ui5-button-root:focus-within:after,:host([design="Emphasized"][active]:not([non-interactive])) .ui5-button-root:focus-visible:after{border-color:var(--_ui5-v2-17-0_button_emphasized_focused_active_border_color)}:host([design="Transparent"]){background-color:var(--sapButton_Lite_Background);color:var(--sapButton_Lite_TextColor);border-color:var(--sapButton_Lite_BorderColor)}:host([design="Transparent"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Transparent"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Lite_Hover_Background);border-color:var(--sapButton_Lite_Hover_BorderColor);color:var(--sapButton_Lite_Hover_TextColor)}:host([ui5-button][design="Transparent"][active]:not([non-interactive])){background-color:var(--sapButton_Lite_Active_Background);border-color:var(--sapButton_Lite_Active_BorderColor);color:var(--sapButton_Active_TextColor)}:host([ui5-segmented-button-item][active][desktop]) .ui5-button-root:focus-within:after,:host([ui5-segmented-button-item][active]) .ui5-button-root:focus-visible:after,:host([pressed][desktop]) .ui5-button-root:focus-within:after,:host([pressed]) .ui5-button-root:focus-visible:after{border-color:var(--_ui5-v2-17-0_button_pressed_focused_border_color);outline:none}:host([ui5-segmented-button-item][desktop]:not(:last-child)) .ui5-button-root:focus-within:after,:host([ui5-segmented-button-item]:not(:last-child)) .ui5-button-root:focus-visible:after{border-top-right-radius:var(--_ui5-v2-17-0_button_focused_inner_border_radius);border-bottom-right-radius:var(--_ui5-v2-17-0_button_focused_inner_border_radius)}:host([ui5-segmented-button-item][desktop]:not(:first-child)) .ui5-button-root:focus-within:after,:host([ui5-segmented-button-item]:not(:first-child)) .ui5-button-root:focus-visible:after{border-top-left-radius:var(--_ui5-v2-17-0_button_focused_inner_border_radius);border-bottom-left-radius:var(--_ui5-v2-17-0_button_focused_inner_border_radius)}::slotted([slot="badge"][design="InlineText"]){pointer-events:initial;font-family:var(--sapButton_FontFamily);font-size:var(--sapFontSmallSize);padding-inline-start:.25rem;--_ui5-v2-17-0-tag-height: .625rem}::slotted([slot="badge"][design="OverlayText"]){pointer-events:initial;position:absolute;top:0;inset-inline-end:0;margin:-.5rem;z-index:1;font-family:var(--sapButton_FontFamily);font-size:var(--sapFontSmallSize);--_ui5-v2-17-0-tag-height: .625rem}::slotted([slot="badge"][design="AttentionDot"]){pointer-events:initial;content:"";position:absolute;top:0;inset-inline-end:0;margin:-.25rem;z-index:1}:host(:state(has-overlay-badge)){overflow:visible;margin-inline-end:.3125rem}:host([loading]){position:relative;pointer-events:unset}:host([loading]) .ui5-button-root{opacity:var(--sapContent_DisabledOpacity)}:host([loading][design="Emphasized"]){background-color:inherit;border:inherit}:host([design="Emphasized"][loading]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Emphasized"][loading]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:inherit;border:inherit}:host([design="Emphasized"][loading]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover) .ui5-button-root,:host([design="Emphasized"][loading]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered) .ui5-button-root{background-color:var(--sapButton_Emphasized_Hover_Background)}:host([loading][design="Emphasized"]) .ui5-button-root{background-color:var(--sapButton_Emphasized_Background);border-color:var(--sapButton_Emphasized_BorderColor)}.ui5-button-busy-indicator{position:absolute;height:100%;width:100%;top:0}:host([has-end-icon]) .ui5-button-root{justify-content:flex-start}:host([icon-only]) .ui5-button-root{justify-content:center}:host([has-end-icon]) .ui5-button-end-icon{margin-left:auto}
`;

    var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Button_1;
    let isGlobalHandlerAttached = false;
    let activeButton = null;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-button` component represents a simple push button.
     * It enables users to trigger actions by clicking or tapping the `ui5-button`, or by pressing
     * certain keyboard keys, such as Enter.
     *
     * ### Usage
     *
     * For the `ui5-button` UI, you can define text, icon, or both. You can also specify
     * whether the text or the icon is displayed first.
     *
     * You can choose from a set of predefined types that offer different
     * styling to correspond to the triggered action.
     *
     * You can set the `ui5-button` as enabled or disabled. An enabled
     * `ui5-button` can be pressed by clicking or tapping it. The button changes
     * its style to provide visual feedback to the user that it is pressed or hovered over with
     * the mouse cursor. A disabled `ui5-button` appears inactive and cannot be pressed.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Button.js";`
     * @csspart button - Used to style the native button element
     * @csspart icon - Used to style the icon in the native button element
     * @csspart endIcon - Used to style the end icon in the native button element
     * @constructor
     * @extends UI5Element
     * @implements { IButton }
     * @public
     */
    let Button = Button_1 = class Button extends b$2 {
        constructor() {
            super();
            /**
             * Defines the component design.
             * @default "Default"
             * @public
             */
            this.design = "Default";
            /**
             * Defines whether the component is disabled.
             * A disabled component can't be pressed or
             * focused, and it is not in the tab chain.
             * @default false
             * @public
             */
            this.disabled = false;
            /**
             * When set to `true`, the component will
             * automatically submit the nearest HTML form element on `press`.
             *
             * **Note:** This property is only applicable within the context of an HTML Form element.`
             * @default false
             * @public
             * @deprecated Set the "type" property to "Submit" to achieve the same result. The "submits" property is ignored if "type" is set to any value other than "Button".
             */
            this.submits = false;
            /**
             * Defines the additional accessibility attributes that will be applied to the component.
             * The following fields are supported:
             *
             * - **expanded**: Indicates whether the button, or another grouping element it controls, is currently expanded or collapsed.
             * Accepts the following string values: `true` or `false`
             *
             * - **hasPopup**: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the button.
             * Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`.
             *
             * - **ariaLabel**: Defines the accessible ARIA name of the component.
             * Accepts any string value.
             *
             *  - **ariaKeyShortcuts**: Defines keyboard shortcuts that activate or give focus to the button.
             *
             * - **controls**: Identifies the element (or elements) whose contents or presence are controlled by the button element.
             * Accepts a lowercase string value.
             *
             * @public
             * @since 1.2.0
             * @default {}
             */
            this.accessibilityAttributes = {};
            /**
             * Defines whether the button has special form-related functionality.
             *
             * **Note:** This property is only applicable within the context of an HTML Form element.
             * @default "Button"
             * @public
             * @since 1.15.0
             */
            this.type = "Button";
            /**
             * Describes the accessibility role of the button.
             *
             * **Note:** Use <code>ButtonAccessibleRole.Link</code> role only with a press handler, which performs a navigation. In all other scenarios the default button semantics are recommended.
             *
             * @default "Button"
             * @public
             * @since 1.23
             */
            this.accessibleRole = "Button";
            /**
             * Used to switch the active state (pressed or not) of the component.
             * @private
             */
            this.active = false;
            /**
             * Defines if a content has been added to the default slot
             * @private
             */
            this.iconOnly = false;
            /**
             * Indicates if the elements has a slotted icon
             * @private
             */
            this.hasIcon = false;
            /**
             * Indicates if the elements has a slotted end icon
             * @private
             */
            this.hasEndIcon = false;
            /**
             * Indicates if the element is focusable
             * @private
             */
            this.nonInteractive = false;
            /**
             * Defines whether the button shows a loading indicator.
             *
             * **Note:** If set to `true`, a busy indicator component will be displayed on the related button.
             * @default false
             * @public
             * @since 2.13.0
             */
            this.loading = false;
            /**
             * Specifies the delay in milliseconds before the loading indicator appears within the associated button.
             * @default 1000
             * @public
             * @since 2.13.0
             */
            this.loadingDelay = 1000;
            /**
             * @private
             */
            this._iconSettings = {};
            /**
             * Defines the tabIndex of the component.
             * @private
             */
            this.forcedTabIndex = "0";
            /**
             * @since 1.0.0-rc.13
             * @private
             */
            this._isTouch = false;
            this._cancelAction = false;
            this._clickHandlerAttached = false;
            this._deactivate = () => {
                if (activeButton) {
                    activeButton._setActiveState(false);
                }
            };
            this._onclickBound = e => {
                if (e instanceof CustomEvent) {
                    return;
                }
                this._onclick(e);
            };
            if (!this._clickHandlerAttached) {
                this.addEventListener("click", this._onclickBound);
                this._clickHandlerAttached = true;
            }
            if (!isGlobalHandlerAttached) {
                document.addEventListener("mouseup", this._deactivate);
                isGlobalHandlerAttached = true;
            }
        }
        _ontouchstart() {
            if (this.nonInteractive) {
                return;
            }
            this._setActiveState(true);
        }
        onEnterDOM() {
            if (f$8()) {
                this.setAttribute("desktop", "");
            }
            if (!this._clickHandlerAttached) {
                this.addEventListener("click", this._onclickBound);
                this._clickHandlerAttached = true;
            }
        }
        onExitDOM() {
            if (this._clickHandlerAttached) {
                this.removeEventListener("click", this._onclickBound);
                this._clickHandlerAttached = false;
            }
            if (activeButton === this) {
                activeButton = null;
            }
        }
        async onBeforeRendering() {
            this._setBadgeOverlayStyle();
            this.hasIcon = !!this.icon;
            this.hasEndIcon = !!this.endIcon;
            this.iconOnly = this.isIconOnly;
            const defaultTooltip = await this.getDefaultTooltip();
            this.buttonTitle = this.iconOnly ? this.tooltip ?? defaultTooltip : this.tooltip;
        }
        _setBadgeOverlayStyle() {
            const needsOverflowVisible = this.badge.length && (this.badge[0].design === ButtonBadgeDesign$1.AttentionDot || this.badge[0].design === ButtonBadgeDesign$1.OverlayText);
            if (needsOverflowVisible) {
                this._internals.states.add("has-overlay-badge");
            }
            else {
                this._internals.states.delete("has-overlay-badge");
            }
        }
        _onclick(e) {
            e.stopImmediatePropagation();
            if (this.nonInteractive) {
                return;
            }
            if (this.loading) {
                e.preventDefault();
                return;
            }
            const { altKey, ctrlKey, metaKey, shiftKey, } = e;
            const prevented = !this.fireDecoratorEvent("click", {
                originalEvent: e,
                altKey,
                ctrlKey,
                metaKey,
                shiftKey,
            });
            if (prevented) {
                e.preventDefault();
                return;
            }
            if (this._isSubmit) {
                i$6(this);
            }
            if (this._isReset) {
                m$6(this);
            }
            if (h$3()) {
                this.getDomRef()?.focus();
            }
        }
        _onmousedown() {
            if (this.nonInteractive) {
                return;
            }
            this._setActiveState(true);
            activeButton = this; // eslint-disable-line
        }
        _ontouchend(e) {
            if (this.disabled || this.loading) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (this.active) {
                this._setActiveState(false);
            }
            if (activeButton) {
                activeButton._setActiveState(false);
            }
        }
        _onkeydown(e) {
            this._cancelAction = Ko(e) || m$1(e);
            if (A$2(e) || b(e)) {
                this._setActiveState(true);
            }
            else if (this._cancelAction) {
                this._setActiveState(false);
            }
        }
        _onkeyup(e) {
            if (this._cancelAction) {
                e.preventDefault();
            }
            if (A$2(e) || b(e)) {
                if (this.active) {
                    this._setActiveState(false);
                }
            }
        }
        _onfocusout() {
            if (this.nonInteractive) {
                return;
            }
            if (this.active) {
                this._setActiveState(false);
            }
        }
        _setActiveState(active) {
            const eventPrevented = !this.fireDecoratorEvent("active-state-change");
            if (eventPrevented || this.loading) {
                return;
            }
            this.active = active;
        }
        get hasButtonType() {
            return this.design !== ButtonDesign$1.Default && this.design !== ButtonDesign$1.Transparent;
        }
        get isIconOnly() {
            return !t(this.text);
        }
        static typeTextMappings() {
            return {
                "Positive": BUTTON_ARIA_TYPE_ACCEPT,
                "Negative": BUTTON_ARIA_TYPE_REJECT,
                "Emphasized": BUTTON_ARIA_TYPE_EMPHASIZED,
                "Attention": BUTTON_ARIA_TYPE_ATTENTION,
            };
        }
        getDefaultTooltip() {
            if (!l()) {
                return;
            }
            return A(this.icon);
        }
        get buttonTypeText() {
            return Button_1.i18nBundle.getText(Button_1.typeTextMappings()[this.design]);
        }
        get effectiveAccRole() {
            return n(this.accessibleRole);
        }
        get tabIndexValue() {
            if (this.disabled) {
                return;
            }
            const tabindex = this.getAttribute("tabindex");
            if (tabindex) {
                return Number.parseInt(tabindex);
            }
            return this.nonInteractive ? -1 : Number.parseInt(this.forcedTabIndex);
        }
        get ariaLabelText() {
            const effectiveAriaLabelText = A$1(this) || "";
            const textContent = this.textContent || "";
            const internalLabelText = this.effectiveBadgeDescriptionText || "";
            // Use either the effective aria label text (if accessibleName is provided) or the button's text content
            const mainLabelText = effectiveAriaLabelText || textContent;
            const labelParts = [mainLabelText, internalLabelText].filter(part => part);
            return labelParts.join(" ");
        }
        get ariaDescriptionText() {
            const accessibleDescription = this.accessibleDescription === "" ? undefined : this.accessibleDescription;
            const typeLabelText = this.hasButtonType ? this.buttonTypeText : "";
            const descriptionParts = [accessibleDescription, typeLabelText].filter(part => part);
            return descriptionParts.length > 0 ? descriptionParts.join(" ") : undefined;
        }
        get _computedAccessibilityAttributes() {
            return {
                expanded: this.accessibilityAttributes.expanded,
                hasPopup: this.accessibilityAttributes.hasPopup,
                controls: this.accessibilityAttributes.controls,
                ariaKeyShortcuts: this.accessibilityAttributes.ariaKeyShortcuts,
                ariaLabel: this.accessibilityAttributes.ariaLabel || this.ariaLabelText,
            };
        }
        get accessibilityInfo() {
            return {
                description: this.ariaDescriptionText,
                role: this.effectiveAccRole,
                disabled: this.disabled,
                children: this.text,
                type: this.effectiveAccRoleTranslation,
            };
        }
        get effectiveAccRoleTranslation() {
            if (this.role === ButtonAccessibleRole$1.Button) {
                return Button_1.i18nBundle.getText(BUTTON_ROLE_DESCRIPTION);
            }
            if (this.role === ButtonAccessibleRole$1.Link) {
                return Button_1.i18nBundle.getText(LINK_ROLE_DESCRIPTION);
            }
            return "";
        }
        get effectiveBadgeDescriptionText() {
            if (!this.shouldRenderBadge) {
                return "";
            }
            const badgeEffectiveText = this.badge[0].effectiveText;
            // Use distinct i18n keys for singular and plural badge values to ensure proper localization.
            // Some languages have different grammatical rules for singular and plural forms,
            // so separate keys (BUTTON_BADGE_ONE_ITEM and BUTTON_BADGE_MANY_ITEMS) are necessary.
            switch (badgeEffectiveText) {
                case "":
                    return badgeEffectiveText;
                case "1":
                    return Button_1.i18nBundle.getText(BUTTON_BADGE_ONE_ITEM, badgeEffectiveText);
                default:
                    return Button_1.i18nBundle.getText(BUTTON_BADGE_MANY_ITEMS, badgeEffectiveText);
            }
        }
        get _isSubmit() {
            return this.type === ButtonType$1.Submit || this.submits;
        }
        get _isReset() {
            return this.type === ButtonType$1.Reset;
        }
        get shouldRenderBadge() {
            return !!this.badge.length && (!!this.badge[0].text.length || this.badge[0].design === ButtonBadgeDesign$1.AttentionDot);
        }
    };
    __decorate$1([
        s$3()
    ], Button.prototype, "design", void 0);
    __decorate$1([
        s$3({ type: Boolean })
    ], Button.prototype, "disabled", void 0);
    __decorate$1([
        s$3()
    ], Button.prototype, "icon", void 0);
    __decorate$1([
        s$3()
    ], Button.prototype, "endIcon", void 0);
    __decorate$1([
        s$3({ type: Boolean })
    ], Button.prototype, "submits", void 0);
    __decorate$1([
        s$3()
    ], Button.prototype, "tooltip", void 0);
    __decorate$1([
        s$3()
    ], Button.prototype, "accessibleName", void 0);
    __decorate$1([
        s$3()
    ], Button.prototype, "accessibleNameRef", void 0);
    __decorate$1([
        s$3({ type: Object })
    ], Button.prototype, "accessibilityAttributes", void 0);
    __decorate$1([
        s$3()
    ], Button.prototype, "accessibleDescription", void 0);
    __decorate$1([
        s$3()
    ], Button.prototype, "type", void 0);
    __decorate$1([
        s$3()
    ], Button.prototype, "accessibleRole", void 0);
    __decorate$1([
        s$3({ type: Boolean })
    ], Button.prototype, "active", void 0);
    __decorate$1([
        s$3({ type: Boolean })
    ], Button.prototype, "iconOnly", void 0);
    __decorate$1([
        s$3({ type: Boolean })
    ], Button.prototype, "hasIcon", void 0);
    __decorate$1([
        s$3({ type: Boolean })
    ], Button.prototype, "hasEndIcon", void 0);
    __decorate$1([
        s$3({ type: Boolean })
    ], Button.prototype, "nonInteractive", void 0);
    __decorate$1([
        s$3({ type: Boolean })
    ], Button.prototype, "loading", void 0);
    __decorate$1([
        s$3({ type: Number })
    ], Button.prototype, "loadingDelay", void 0);
    __decorate$1([
        s$3({ noAttribute: true })
    ], Button.prototype, "buttonTitle", void 0);
    __decorate$1([
        s$3({ type: Object })
    ], Button.prototype, "_iconSettings", void 0);
    __decorate$1([
        s$3({ noAttribute: true })
    ], Button.prototype, "forcedTabIndex", void 0);
    __decorate$1([
        s$3({ type: Boolean })
    ], Button.prototype, "_isTouch", void 0);
    __decorate$1([
        s$3({ type: Boolean, noAttribute: true })
    ], Button.prototype, "_cancelAction", void 0);
    __decorate$1([
        d$2({ type: Node, "default": true })
    ], Button.prototype, "text", void 0);
    __decorate$1([
        d$2({ type: HTMLElement, invalidateOnChildChange: true })
    ], Button.prototype, "badge", void 0);
    __decorate$1([
        i$2("@ui5/webcomponents")
    ], Button, "i18nBundle", void 0);
    Button = Button_1 = __decorate$1([
        m$3({
            tag: "ui5-button",
            formAssociated: true,
            languageAware: true,
            renderer: y$2,
            template: ButtonTemplate,
            styles: buttonCss,
            shadowRootOptions: { delegatesFocus: true },
        })
        /**
         * Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.
         *
         * **Note:** The event will not be fired if the `disabled` property is set to `true`.
         *
         * @since 2.10.0
         * @public
         * @param {Event} originalEvent Returns original event that comes from user's **click** interaction
         * @param {boolean} altKey Returns whether the "ALT" key was pressed when the event was triggered.
         * @param {boolean} ctrlKey Returns whether the "CTRL" key was pressed when the event was triggered.
         * @param {boolean} metaKey Returns whether the "META" key was pressed when the event was triggered.
         * @param {boolean} shiftKey Returns whether the "SHIFT" key was pressed when the event was triggered.
         */
        ,
        l$4("click", {
            bubbles: true,
            cancelable: true,
        })
        /**
         * Fired whenever the active state of the component changes.
         * @private
         */
        ,
        l$4("active-state-change", {
            bubbles: true,
            cancelable: true,
        })
    ], Button);
    Button.define();
    var Button$1 = Button;

    const name$1 = "slim-arrow-right";
    const pathData$1 = "M357.5 233q10 10 10 23t-10 23l-165 165q-12 11-23 0t0-23l160-159q6-6 0-12l-159-159q-5-5-5-11t5-11 11-5 11 5z";
    const ltr$1 = false;
    const collection$1 = "SAP-icons-v4";
    const packageName$1 = "@ui5/webcomponents-icons";

    y(name$1, { pathData: pathData$1, ltr: ltr$1, collection: collection$1, packageName: packageName$1 });

    const name = "slim-arrow-right";
    const pathData = "M186 416q-11 0-18.5-7.5T160 390q0-10 8-18l121-116-121-116q-8-8-8-18 0-11 7.5-18.5T186 96q10 0 17 7l141 134q8 8 8 19 0 12-8 18L203 409q-7 7-17 7z";
    const ltr = false;
    const collection = "SAP-icons-v5";
    const packageName = "@ui5/webcomponents-icons";

    y(name, { pathData, ltr, collection, packageName });

    var slimArrowRight = "slim-arrow-right";

    function PanelTemplate() {
        return (jsx(Fragment, { children: jsxs("div", { class: "ui5-panel-root", role: this.accRole, "aria-label": this.effectiveAccessibleName, "aria-labelledby": this.fixedPanelAriaLabelledbyReference, children: [this.hasHeaderOrHeaderText &&
                        // header: either header or h1 with header text
                        jsx("div", { class: {
                                "ui5-panel-heading-wrapper": true,
                                "ui5-panel-heading-wrapper-sticky": this.stickyHeader,
                            }, role: this.headingWrapperRole, "aria-level": this.headingWrapperAriaLevel, children: jsxs("div", { onClick: this._headerClick, onKeyDown: this._headerKeyDown, onKeyUp: this._headerKeyUp, class: "ui5-panel-header", tabindex: this.headerTabIndex, role: this.accInfo.role, "aria-expanded": this.accInfo.ariaExpanded, "aria-controls": this.accInfo.ariaControls, "aria-labelledby": this.accInfo.ariaLabelledby, part: "header", children: [!this.fixed &&
                                        jsx("div", { class: "ui5-panel-header-button-root", children: this._hasHeader ?
                                                jsx(Button$1, { design: "Transparent", class: "ui5-panel-header-button ui5-panel-header-button-with-icon", onClick: this._toggleButtonClick, accessibilityAttributes: this.accInfo.button.accessibilityAttributes, tooltip: this.accInfo.button.title, accessibleName: this.accInfo.button.ariaLabelButton, children: jsx("div", { class: "ui5-panel-header-icon-wrapper", children: jsx(Icon$1, { class: {
                                                                "ui5-panel-header-icon": true,
                                                                "ui5-panel-header-button-animated": !this.shouldNotAnimate,
                                                            }, name: slimArrowRight }) }) })
                                                : // else
                                                    jsx(Icon$1, { class: {
                                                            "ui5-panel-header-button": true,
                                                            "ui5-panel-header-icon": true,
                                                            "ui5-panel-header-button-animated": !this.shouldNotAnimate,
                                                        }, name: slimArrowRight, showTooltip: true, accessibleName: this.toggleButtonTitle }) }), this._hasHeader ?
                                        jsx("slot", { name: "header" })
                                        : // else
                                            jsx("div", { id: `${this._id}-header-title`, class: "ui5-panel-header-title", children: this.headerText })] }) }), jsx("div", { class: "ui5-panel-content", id: `${this._id}-content`, tabindex: -1, style: {
                            display: this._contentExpanded ? "block" : "none",
                        }, part: "content", children: jsx("slot", {}) })] }) }));
    }

    p$4("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => defaultThemeBase);
    p$4("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => defaultTheme);
    var panelCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:block}:host{font-family:var(--sapFontFamily);background-color:var(--sapGroup_TitleBackground);border-radius:var(--_ui5-v2-17-0_panel_border_radius)}:host(:not([collapsed])){border-bottom:var(--_ui5-v2-17-0_panel_border_bottom)}:host([fixed]) .ui5-panel-header{padding-left:1rem}.ui5-panel-header{min-height:var(--_ui5-v2-17-0_panel_header_height);width:100%;position:relative;display:flex;justify-content:flex-start;align-items:center;outline:none;box-sizing:border-box;padding-right:var(--_ui5-v2-17-0_panel_header_padding_right);font-family:var(--sapFontHeaderFamily);font-size:var(--sapGroup_Title_FontSize);font-weight:400;color:var(--sapGroup_TitleTextColor)}.ui5-panel-header-icon{color:var(--_ui5-v2-17-0_panel_icon_color)}.ui5-panel-header-button-animated{transition:transform .4s ease-out}:host(:not([_has-header]):not([fixed])) .ui5-panel-header{cursor:pointer}:host(:not([_has-header]):not([fixed])) .ui5-panel-header:focus:after{content:"";position:absolute;pointer-events:none;z-index:2;border:var(--_ui5-v2-17-0_panel_focus_border);border-radius:var(--_ui5-v2-17-0_panel_border_radius);top:var(--_ui5-v2-17-0_panel_focus_offset);bottom:var(--_ui5-v2-17-0_panel_focus_bottom_offset);left:var(--_ui5-v2-17-0_panel_focus_offset);right:var(--_ui5-v2-17-0_panel_focus_offset)}:host(:not([collapsed]):not([_has-header]):not([fixed])) .ui5-panel-header:focus:after{border-radius:var(--_ui5-v2-17-0_panel_border_radius_expanded)}:host(:not([collapsed])) .ui5-panel-header-button:not(.ui5-panel-header-button-with-icon),:host(:not([collapsed])) .ui5-panel-header-icon-wrapper [ui5-icon]{transform:var(--_ui5-v2-17-0_panel_toggle_btn_rotation)}:host([fixed]) .ui5-panel-header-title{width:100%}.ui5-panel-heading-wrapper.ui5-panel-heading-wrapper-sticky{position:sticky;top:0;background-color:var(--_ui5-v2-17-0_panel_header_background_color);z-index:100;border-radius:var(--_ui5-v2-17-0_panel_border_radius)}.ui5-panel-header-title{width:calc(100% - var(--_ui5-v2-17-0_panel_button_root_width));overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ui5-panel-content{padding:var(--_ui5-v2-17-0_panel_content_padding);background-color:var(--sapGroup_ContentBackground);outline:none;border-bottom-left-radius:var(--_ui5-v2-17-0_panel_border_radius);border-bottom-right-radius:var(--_ui5-v2-17-0_panel_border_radius);overflow:auto}.ui5-panel-header-button-root{display:flex;justify-content:center;align-items:center;flex-shrink:0;width:var(--_ui5-v2-17-0_panel_button_root_width);height:var(--_ui5-v2-17-0_panel_button_root_height);padding:var(--_ui5-v2-17-0_panel_header_button_wrapper_padding);box-sizing:border-box}:host([fixed]:not([collapsed]):not([_has-header])) .ui5-panel-header,:host([collapsed]) .ui5-panel-header{border-bottom:.0625rem solid var(--sapGroup_TitleBorderColor)}:host([collapsed]) .ui5-panel-header{border-bottom-left-radius:var(--_ui5-v2-17-0_panel_border_radius);border-bottom-right-radius:var(--_ui5-v2-17-0_panel_border_radius)}:host(:not([fixed]):not([collapsed])) .ui5-panel-header{border-bottom:var(--_ui5-v2-17-0_panel_default_header_border)}[ui5-button].ui5-panel-header-button{display:flex;justify-content:center;align-items:center;min-width:initial;height:100%;width:100%}.ui5-panel-header-icon-wrapper{display:flex;justify-content:center;align-items:center}.ui5-panel-header-icon-wrapper,.ui5-panel-header-icon-wrapper .ui5-panel-header-icon{color:inherit}.ui5-panel-header-icon-wrapper,[ui5-button].ui5-panel-header-button-with-icon [ui5-icon]{pointer-events:none}.ui5-panel-root{height:100%;display:flex;flex-direction:column}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Panel_1;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-panel` component is a container which has a header and a
     * content area and is used
     * for grouping and displaying information. It can be collapsed to save space on the screen.
     *
     * ### Guidelines:
     *
     * - Nesting two or more panels is not recommended.
     * - Do not stack too many panels on one page.
     *
     * ### Structure
     * The panel's header area consists of a title bar with a header text or custom header.
     *
     * The header is clickable and can be used to toggle between the expanded and collapsed state. It includes an icon which rotates depending on the state.
     *
     * The custom header can be set through the `header` slot and it may contain arbitraray content, such as: title, buttons or any other HTML elements.
     *
     * The content area can contain an arbitrary set of controls.
     *
     * **Note:** The custom header is not clickable out of the box, but in this case the icon is interactive and allows to show/hide the content area.
     *
     * ### Responsive Behavior
     *
     * - If the width of the panel is set to 100% (default), the panel and its children are
     * resized responsively,
     * depending on its parent container.
     * - If the panel has a fixed height, it will take up the space even if the panel is
     * collapsed.
     * - When the panel is expandable (the `fixed` property is set to `false`),
     * an arrow icon (pointing to the right) appears in front of the header.
     * - When the animation is activated, expand/collapse uses a smooth animation to open or
     * close the content area.
     * - When the panel expands/collapses, the arrow icon rotates 90 degrees
     * clockwise/counter-clockwise.
     *
     * ### Keyboard Handling
     *
     * #### Fast Navigation
     * This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
     * In order to use this functionality, you need to import the following module:
     * `import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/Panel.js";`
     * @constructor
     * @extends UI5Element
     * @public
     * @slot {Array<Node>} default - Defines the content of the component. The content is visible only when the component is expanded.
     * @csspart header - Used to style the wrapper of the header.
     * @csspart content - Used to style the wrapper of the content.
     */
    let Panel$1 = Panel_1 = class Panel extends b$2 {
        constructor() {
            super(...arguments);
            /**
             * Determines whether the component is in a fixed state that is not
             * expandable/collapsible by user interaction.
             * @default false
             * @public
             */
            this.fixed = false;
            /**
             * Indicates whether the component is collapsed and only the header is displayed.
             * @default false
             * @public
             */
            this.collapsed = false;
            /**
             * Indicates whether the transition between the expanded and the collapsed state of the component is animated. By default the animation is enabled.
             * @default false
             * @public
             * @since 1.0.0-rc.16
             */
            this.noAnimation = false;
            /**
             * Sets the accessible ARIA role of the component.
             * Depending on the usage, you can change the role from the default `Form`
             * to `Region` or `Complementary`.
             * @default "Form"
             * @public
             */
            this.accessibleRole = "Form";
            /**
             * Defines the "aria-level" of component heading,
             * set by the `headerText`.
             * @default "H2"
             * @public
            */
            this.headerLevel = "H2";
            /**
             * Indicates whether the Panel header is sticky or not.
             * If stickyHeader is set to true, then whenever you scroll the content or
             * the application, the header of the panel will be always visible and
             * a solid color will be used for its design.
             * @default false
             * @public
             * @since 1.16.0-rc.1
             */
            this.stickyHeader = false;
            /**
             * When set to `true`, the `accessibleName` property will be
             * applied not only on the panel root itself, but on its toggle button too.
             * **Note:** This property only has effect if `accessibleName` is set and a header slot is provided.
             * @default false
             * @private
              */
            this.useAccessibleNameForToggleButton = false;
            /**
             * @private
             */
            this._hasHeader = false;
            this._contentExpanded = false;
            this._animationRunning = false;
        }
        onBeforeRendering() {
            // If the animation is running, it will set the content expanded state at the end
            if (!this._animationRunning) {
                this._contentExpanded = !this.collapsed;
            }
            this._hasHeader = !!this.header.length;
        }
        shouldToggle(element) {
            const customContent = this.header.length;
            if (customContent) {
                return element.classList.contains("ui5-panel-header-button");
            }
            return true;
        }
        get shouldNotAnimate() {
            return this.noAnimation || d() === u$a.None;
        }
        _headerClick(e) {
            if (!this.shouldToggle(e.target)) {
                return;
            }
            this._toggleOpen();
        }
        _toggleButtonClick(e) {
            if (e.detail.originalEvent.x === 0 && e.detail.originalEvent.y === 0) {
                e.stopImmediatePropagation();
            }
        }
        _headerKeyDown(e) {
            if (!this.shouldToggle(e.target)) {
                return;
            }
            if (b(e)) {
                e.preventDefault();
            }
            if (A$2(e)) {
                e.preventDefault();
            }
        }
        _headerKeyUp(e) {
            if (!this.shouldToggle(e.target)) {
                return;
            }
            if (b(e)) {
                this._toggleOpen();
            }
            if (A$2(e)) {
                this._toggleOpen();
            }
        }
        _toggleOpen() {
            if (this.fixed) {
                return;
            }
            this.collapsed = !this.collapsed;
            if (this.shouldNotAnimate) {
                this.fireDecoratorEvent("toggle");
                return;
            }
            this._animationRunning = true;
            const elements = this.getDomRef().querySelectorAll(".ui5-panel-content");
            const animations = [];
            [].forEach.call(elements, oElement => {
                if (this.collapsed) {
                    animations.push(u$1(oElement).promise());
                }
                else {
                    animations.push(b$1(oElement).promise());
                }
            });
            Promise.all(animations).then(() => {
                this._animationRunning = false;
                this._contentExpanded = !this.collapsed;
                this.fireDecoratorEvent("toggle");
            });
        }
        _headerOnTarget(target) {
            return target.classList.contains("sapMPanelWrappingDiv");
        }
        get toggleButtonTitle() {
            return Panel_1.i18nBundle.getText(PANEL_ICON);
        }
        get expanded() {
            return !this.collapsed;
        }
        get accRole() {
            return this.accessibleRole.toLowerCase();
        }
        get effectiveAccessibleName() {
            return typeof this.accessibleName === "string" && this.accessibleName.length ? this.accessibleName : undefined;
        }
        get accInfo() {
            return {
                "button": {
                    "accessibilityAttributes": {
                        "expanded": this.expanded,
                    },
                    "title": this.toggleButtonTitle,
                    "ariaLabelButton": !this.nonFocusableButton && this.useAccessibleNameForToggleButton ? this.effectiveAccessibleName : undefined,
                },
                "ariaExpanded": this.nonFixedInternalHeader ? this.expanded : undefined,
                "ariaControls": this.nonFixedInternalHeader ? `${this._id}-content` : undefined,
                "ariaLabelledby": this.nonFocusableButton ? this.ariaLabelledbyReference : undefined,
                "role": this.nonFixedInternalHeader ? "button" : undefined,
            };
        }
        get ariaLabelledbyReference() {
            return (this.nonFocusableButton && this.headerText && !this.fixed) ? `${this._id}-header-title` : undefined;
        }
        get fixedPanelAriaLabelledbyReference() {
            return this.fixed && !this.effectiveAccessibleName ? `${this._id}-header-title` : undefined;
        }
        get headerAriaLevel() {
            return Number.parseInt(this.headerLevel.slice(1));
        }
        get headerTabIndex() {
            return (this.header.length || this.fixed) ? -1 : 0;
        }
        get headingWrapperAriaLevel() {
            return !this._hasHeader ? this.headerAriaLevel : undefined;
        }
        get headingWrapperRole() {
            return !this._hasHeader ? "heading" : undefined;
        }
        get nonFixedInternalHeader() {
            return !this._hasHeader && !this.fixed;
        }
        get hasHeaderOrHeaderText() {
            return this._hasHeader || this.headerText;
        }
        get nonFocusableButton() {
            return !this.header.length;
        }
    };
    __decorate([
        s$3()
    ], Panel$1.prototype, "headerText", void 0);
    __decorate([
        s$3({ type: Boolean })
    ], Panel$1.prototype, "fixed", void 0);
    __decorate([
        s$3({ type: Boolean })
    ], Panel$1.prototype, "collapsed", void 0);
    __decorate([
        s$3({ type: Boolean })
    ], Panel$1.prototype, "noAnimation", void 0);
    __decorate([
        s$3()
    ], Panel$1.prototype, "accessibleRole", void 0);
    __decorate([
        s$3()
    ], Panel$1.prototype, "headerLevel", void 0);
    __decorate([
        s$3()
    ], Panel$1.prototype, "accessibleName", void 0);
    __decorate([
        s$3({ type: Boolean })
    ], Panel$1.prototype, "stickyHeader", void 0);
    __decorate([
        s$3({ type: Boolean })
    ], Panel$1.prototype, "useAccessibleNameForToggleButton", void 0);
    __decorate([
        s$3({ type: Boolean })
    ], Panel$1.prototype, "_hasHeader", void 0);
    __decorate([
        s$3({ type: Boolean, noAttribute: true })
    ], Panel$1.prototype, "_contentExpanded", void 0);
    __decorate([
        s$3({ type: Boolean, noAttribute: true })
    ], Panel$1.prototype, "_animationRunning", void 0);
    __decorate([
        d$2()
    ], Panel$1.prototype, "header", void 0);
    __decorate([
        i$2("@ui5/webcomponents")
    ], Panel$1, "i18nBundle", void 0);
    Panel$1 = Panel_1 = __decorate([
        m$3({
            tag: "ui5-panel",
            fastNavigation: true,
            languageAware: true,
            renderer: y$2,
            template: PanelTemplate,
            styles: panelCss,
        })
        /**
         * Fired when the component is expanded/collapsed by user interaction.
         * @public
         */
        ,
        l$4("toggle", {
            bubbles: true,
        })
    ], Panel$1);
    Panel$1.define();
    var defExp = Panel$1;

    var namedExports = /*#__PURE__*/Object.freeze({
        __proto__: null,
        default: defExp
    });

    const defaultExports = Object.isFrozen(defExp) ? Object.assign({}, defExp?.default || defExp || { __emptyModule: true }) : defExp;
    Object.keys(namedExports || {}).filter((key) => !defaultExports[key]).forEach((key) => defaultExports[key] = namedExports[key]);
    Object.defineProperty(defaultExports, "__" + "esModule", { value: true });
    var Panel = Object.isFrozen(defExp) ? Object.freeze(defaultExports) : defaultExports;

    return Panel;

}));
