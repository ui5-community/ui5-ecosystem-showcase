sap.ui.define(['exports'], (function (exports) { 'use strict';

	const m$1=(a={})=>e=>{if(Object.prototype.hasOwnProperty.call(e,"metadata")||(e.metadata={}),typeof a=="string"){e.metadata.tag=a;return}const{tag:i,languageAware:o,themeAware:r,cldr:s,fastNavigation:l,formAssociated:n,shadowRootOptions:d}=a;e.metadata.tag=i,o&&(e.metadata.languageAware=o),s&&(e.metadata.cldr=s),r&&(e.metadata.themeAware=r),l&&(e.metadata.fastNavigation=l),n&&(e.metadata.formAssociated=n),d&&(e.metadata.shadowRootOptions=d),["renderer","template","styles","dependencies"].forEach(t=>{a[t]&&Object.defineProperty(e,t,{get:()=>a[t]});});};

	const s=o=>(p,r)=>{const t=p.constructor;Object.prototype.hasOwnProperty.call(t,"metadata")||(t.metadata={});const e=t.metadata;e.properties||(e.properties={});const a=e.properties;a[r]||(a[r]=o??{});};

	function d(t){return (r,a)=>{const n=r.constructor;Object.prototype.hasOwnProperty.call(n,"metadata")||(n.metadata={});const o=n.metadata;o.slots||(o.slots={});const e=o.slots;if(t&&t.default&&e.default)throw new Error("Only one slot can be the default slot.");const l=t&&t.default?"default":a;t=t||{type:HTMLElement},t.type||(t.type=HTMLElement),e[l]||(e[l]=t),t.default&&(delete e.default.default,e.default.propertyName=a),n.metadata.managedSlots=true;}}

	const y={TAB:9,ENTER:13,SHIFT:16,ESCAPE:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,ARROW_LEFT:37,ARROW_UP:38,ARROW_RIGHT:39,ARROW_DOWN:40},b=o=>(o.key?o.key==="Enter":o.keyCode===y.ENTER)&&!a(o),A=o=>(o.key?o.key==="Spacebar"||o.key===" ":o.keyCode===y.SPACE)&&!a(o),K=o=>(o.key?o.key==="Spacebar"||o.key===" ":o.keyCode===y.SPACE)&&e(o,false,false,true),D=o=>(o.key?o.key==="ArrowLeft"||o.key==="Left":o.keyCode===y.ARROW_LEFT)&&!a(o),R=o=>(o.key?o.key==="ArrowRight"||o.key==="Right":o.keyCode===y.ARROW_RIGHT)&&!a(o),P=o=>(o.key?o.key==="ArrowUp"||o.key==="Up":o.keyCode===y.ARROW_UP)&&!a(o),_=o=>(o.key?o.key==="ArrowDown"||o.key==="Down":o.keyCode===y.ARROW_DOWN)&&!a(o),M=o=>(o.key?o.key==="Home":o.keyCode===y.HOME)&&!a(o),n=o=>(o.key?o.key==="End":o.keyCode===y.END)&&!a(o),m=o=>(o.key?o.key==="Escape"||o.key==="Esc":o.keyCode===y.ESCAPE)&&!a(o),x=o=>(o.key?o.key==="Tab":o.keyCode===y.TAB)&&!a(o),j=o=>(o.key?o.key==="PageUp":o.keyCode===y.PAGE_UP)&&!a(o),q=o=>(o.key?o.key==="PageDown":o.keyCode===y.PAGE_DOWN)&&!a(o),Ko=o=>o.key==="Shift"||o.keyCode===y.SHIFT,a=o=>o.shiftKey||o.altKey||k(o),k=o=>!!(o.metaKey||o.ctrlKey),e=(o,r,l,E)=>o.shiftKey===E&&o.altKey===l&&k(o)===r;

	exports.A = A;
	exports.D = D;
	exports.K = K;
	exports.Ko = Ko;
	exports.M = M;
	exports.P = P;
	exports.R = R;
	exports._ = _;
	exports.b = b;
	exports.d = d;
	exports.j = j;
	exports.m = m$1;
	exports.m$1 = m;
	exports.n = n;
	exports.q = q;
	exports.s = s;
	exports.x = x;

}));
