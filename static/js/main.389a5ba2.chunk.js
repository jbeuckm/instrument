(this["webpackJsonpinstrument-dashboard"]=this["webpackJsonpinstrument-dashboard"]||[]).push([[0],{302:function(t,e){},325:function(t,e){},327:function(t,e){},449:function(t,e,n){"use strict";n.r(e);var a=n(2),o=n.n(a),c=n(243),r=n.n(c),i=n(260),s=n(32),u=n(463),d=n(466),l=n(467),f=n(468),b=n(470),j=n(245),h=n(17),x=function(t){var e=t.annotations,n=t.scale,o=Object(a.useState)({x:10,y:10,dy:50,dx:50}),c=Object(s.a)(o,2),r=c[0],i=c[1];return e.map((function(t,e){return Object(h.jsx)(j.AnnotationLabel,{x:n.x(t._x),y:n.y(t._y),dx:r.dx,dy:r.dy,color:"#333",editMode:!0,note:{title:"Annotations :)",label:"Longer text to show text wrapping",align:"middle",orientation:"topBottom",bgPadding:10,padding:10,titleColor:"#666"},onDrag:function(t){return i(t)}},e)}))},O=n(462),m=n(465),p=n(469),g=n(158),v=n.n(g),y=n(246),k=n.n(y),w=n(247),C=n.n(w),D=new k.a({clientId:"readings",host:"https://if2574leol.execute-api.us-east-2.amazonaws.com/dev",resources:{Readings:{list:{path:"/readings",headers:{"x-api-key":"esHC6lRZzJ2R2dnKXVI6157bY5wirAkh6uznnGaU"},middleware:[function(){return{response:function(t){return t().then((function(t){return C()(t.data(),{columns:!0,cast:function(t,e){switch(e.column){case"timestamp":return parseInt(t);case"reading":return parseFloat(t);default:return t}}})}))}}}]}}}}),P=function(t,e){var n=[];return t.forEach((function(t){var e=Object(s.a)(t,2),a=e[0],o=e[1];n.push({x:a,source:"a",status:!0}),n.push({x:o,source:"a",status:!1})})),e.forEach((function(t){var e=Object(s.a)(t,2),a=e[0],o=e[1];n.push({x:a,source:"b",status:!0}),n.push({x:o,source:"b",status:!1})})),n.sort((function(t,e){return t.x-e.x}))},S=function(t,e){var n,a=!1,o=[],c={a:!1,b:!1};return t.forEach((function(t){var r=t.x,i=t.source,s=t.status;c[i]=s;var u=e(c.a,c.b);a!==u&&(u?n=r:o.push([n,r]),a=u)})),o},E=["#9e6864","#3f0f63","#35868c","#f24b3f","#6d9c49"],I=Object(u.a)("zoom","voronoi"),z=new Date("1/26/2021"),A=new Date,M=function(){var t=Object(a.useState)(),e=Object(s.a)(t,2),n=e[0],o=e[1],c=Object(a.useState)([]),r=Object(s.a)(c,2),u=r[0],j=r[1],g=Object(a.useState)(),y=Object(s.a)(g,2),k=y[0],w=y[1],C=Object(a.useState)({}),M=Object(s.a)(C,2),F=M[0],L=M[1],R=Object(a.useState)([]),W=Object(s.a)(R,2),B=W[0],J=W[1],Z=function(t,e){if(t&&e){var a=function(t,e){var n=P(t,e);return S(n,(function(t,e){return t&&!e}))}([[t,e]],B)[0];a&&D.Readings.list({from:a[0],to:a[1]}).then((function(t){var e=Object(O.a)(Object(m.a)("source"))(t),c=Object(i.a)({},F);Object.keys(e).forEach((function(t,e){F[t]||(c[t]=E[e%E.length])})),L(c),n&&Object.keys(n).forEach((function(t){e[t]?e[t]=e[t].concat(n[t]).sort(Object(p.a)(Object(m.a)("timestamp"))):e[t]=n[t]})),o(e),J(function(t,e){var n=P(t,e);return S(n,(function(t,e){return t||e}))}(B,[a]))})).catch((function(t){return console.error(t)}))}},H=[A.valueOf()-2592e5,A.valueOf()];Object(a.useEffect)((function(){Z(H[0],H[1])}),[]);var T=Object(a.useCallback)((function(t){console.log(t)}),[]),_=Object(a.useCallback)((function(){console.log(j(k))}),[k]);return Object(h.jsxs)("div",{className:"App",children:[n&&Object.keys(n).map((function(t){return Object(h.jsxs)("span",{onClick:function(){return T(t)},style:{padding:5},children:[Object(h.jsx)("span",{style:{backgroundColor:F[t],display:"inline-block",width:20,height:20}})," ",t]})})),Object(h.jsxs)(d.a,{padding:25,height:window.innerHeight-100,width:window.innerWidth,scale:{x:"time"},minDomain:{x:z,y:-30},maxDomain:{x:A,y:55},containerComponent:Object(h.jsx)(I,{zoomDimension:"x",zoomDomain:{x:H},responsive:!1,onZoomDomainChange:function(t){Z(t.x[0].valueOf(),t.x[1].valueOf())},allowPan:!0,allowZoom:!0,labels:function(t){var e=t.datum;return e.reading||e.y},onActivated:function(t){return w(t)},events:{onClick:_}}),children:[Object(h.jsx)(l.a,{samples:500,style:{data:{fill:"#ffee99"}},y:function(t){return Math.max(0,180*v.a.getPosition(t.x,45.060879,-93.2219807).altitude/Math.PI)}}),Object(h.jsx)(l.a,{samples:500,style:{data:{fill:"#78c"}},y:function(t){return Math.min(0,180*v.a.getPosition(t.x,45.060879,-93.2219807).altitude/Math.PI)}}),n&&Object.keys(n).map((function(t){var e=n[t];return Object(h.jsx)(f.a,{name:t,style:{data:{strokeWidth:1,stroke:F[t]},parent:{border:"1px solid #666"}},data:e,x:"timestamp",y:"reading"},t)})),Object(h.jsx)(b.a,{style:{grid:{stroke:"#818e99",strokeWidth:.5}}}),Object(h.jsx)(b.a,{dependentAxis:!0,style:{grid:{stroke:"#818e99",strokeWidth:.5}}}),Object(h.jsx)(x,{annotations:u})]})]})},F=function(t){t&&t instanceof Function&&n.e(3).then(n.bind(null,471)).then((function(e){var n=e.getCLS,a=e.getFID,o=e.getFCP,c=e.getLCP,r=e.getTTFB;n(t),a(t),o(t),c(t),r(t)}))};r.a.render(Object(h.jsx)(o.a.StrictMode,{children:Object(h.jsx)(M,{})}),document.getElementById("root")),F()}},[[449,1,2]]]);
//# sourceMappingURL=main.389a5ba2.chunk.js.map