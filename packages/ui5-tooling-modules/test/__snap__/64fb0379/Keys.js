sap.ui.define(['exports'], (function (exports) { 'use strict';

	const m=(a={})=>e=>{if(Object.prototype.hasOwnProperty.call(e,"metadata")||(e.metadata={}),typeof a=="string"){e.metadata.tag=a;return}const{tag:i,languageAware:o,themeAware:r,cldr:s,fastNavigation:l,formAssociated:n,shadowRootOptions:d}=a;e.metadata.tag=i,o&&(e.metadata.languageAware=o),s&&(e.metadata.cldr=s),r&&(e.metadata.themeAware=r),l&&(e.metadata.fastNavigation=l),n&&(e.metadata.formAssociated=n),d&&(e.metadata.shadowRootOptions=d),["renderer","template","styles","dependencies"].forEach(t=>{a[t]&&Object.defineProperty(e,t,{get:()=>a[t]});});};

	const s=o=>(p,r)=>{const t=p.constructor;Object.prototype.hasOwnProperty.call(t,"metadata")||(t.metadata={});const e=t.metadata;e.properties||(e.properties={});const a=e.properties;a[r]||(a[r]=o??{});};

	const d=e=>(l,a)=>{const r=l.constructor;Object.prototype.hasOwnProperty.call(r,"metadata")||(r.metadata={});const o=r.metadata;o.slots||(o.slots={});const t=o.slots;if(e&&e.default&&t.default)throw new Error("Only one slot can be the default slot.");const n=e&&e.default?"default":a;e=e||{type:HTMLElement},e.type||(e.type=HTMLElement),t[n]||(t[n]=e),e.default&&(delete t.default.default,t.default.propertyName=a),r.metadata.managedSlots=true;};

	const y={ENTER:13,SHIFT:16,ESCAPE:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,ARROW_LEFT:37,ARROW_UP:38,ARROW_RIGHT:39,ARROW_DOWN:40},b=o=>(o.key?o.key==="Enter":o.keyCode===y.ENTER)&&!a(o),i=o=>(o.key?o.key==="Spacebar"||o.key===" ":o.keyCode===y.SPACE)&&!a(o),K=o=>(o.key?o.key==="ArrowLeft"||o.key==="Left":o.keyCode===y.ARROW_LEFT)&&!a(o),c=o=>(o.key?o.key==="ArrowRight"||o.key==="Right":o.keyCode===y.ARROW_RIGHT)&&!a(o),D=o=>(o.key?o.key==="ArrowUp"||o.key==="Up":o.keyCode===y.ARROW_UP)&&!a(o),P=o=>(o.key?o.key==="ArrowDown"||o.key==="Down":o.keyCode===y.ARROW_DOWN)&&!a(o),F=o=>(o.key?o.key==="Home":o.keyCode===y.HOME)&&!a(o),W=o=>(o.key?o.key==="End":o.keyCode===y.END)&&!a(o),H=o=>(o.key?o.key==="Escape"||o.key==="Esc":o.keyCode===y.ESCAPE)&&!a(o),Y=o=>(o.key?o.key==="PageUp":o.keyCode===y.PAGE_UP)&&!a(o),Z=o=>(o.key?o.key==="PageDown":o.keyCode===y.PAGE_DOWN)&&!a(o),io=o=>o.key==="Shift"||o.keyCode===y.SHIFT,a=o=>o.shiftKey||o.altKey||k(o),k=o=>!!(o.metaKey||o.ctrlKey);

	exports.D = D;
	exports.F = F;
	exports.H = H;
	exports.K = K;
	exports.P = P;
	exports.W = W;
	exports.Y = Y;
	exports.Z = Z;
	exports.b = b;
	exports.c = c;
	exports.d = d;
	exports.i = i;
	exports.io = io;
	exports.m = m;
	exports.s = s;

}));
