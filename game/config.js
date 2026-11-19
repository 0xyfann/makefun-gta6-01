export const WORLD={width:2400,height:1800,roadW:74,block:270,origin:170};
export const COLORS={sky:'#102632',water:'#092c3a',road:'#1b2b33',roadEdge:'#30474a',lane:'#d0b86d',building:'#243943',building2:'#2d4750',window:'#58d9c0',park:'#174338',sand:'#9d7651',amber:'#ffc857',cyan:'#57f2d1',rose:'#ff5d73'};
export const BLOCKS=[
 {x:160,y:194,w:230,h:205,name:'Lumen Row',accent:'#e9a96d'}, {x:480,y:194,w:230,h:205,name:'Cinder Court',accent:'#70b8c4'}, {x:800,y:194,w:230,h:205,name:'Atlas Lofts',accent:'#d26e86'}, {x:1120,y:194,w:230,h:205,name:'Dawn Arcade',accent:'#e0c15d'}, {x:1440,y:194,w:230,h:205,name:'Northline',accent:'#76d4ac'},
 {x:160,y:484,w:230,h:205,name:'Marrow Plaza',accent:'#d87c61'}, {x:480,y:484,w:230,h:205,name:'Mercury Mart',accent:'#e4bd62'}, {x:800,y:484,w:230,h:205,name:'Glassworks',accent:'#63c5d8'}, {x:1120,y:484,w:230,h:205,name:'Solace Hotel',accent:'#bd7dd5'}, {x:1440,y:484,w:230,h:205,name:'Kite District',accent:'#df7a7a'},
 {x:160,y:774,w:230,h:205,name:'Lowlight',accent:'#62b58c'}, {x:480,y:774,w:230,h:205,name:'Beryl Yard',accent:'#d5ae62'}, {x:800,y:774,w:230,h:205,name:'Neon Market',accent:'#ef6c98'}, {x:1120,y:774,w:230,h:205,name:'Southbank',accent:'#62c5bc'}, {x:1440,y:774,w:230,h:205,name:'Foundry',accent:'#d47550'},
 {x:160,y:1064,w:230,h:205,name:'Signal Hill',accent:'#d5c05b'}, {x:480,y:1064,w:230,h:205,name:'Canal House',accent:'#6ec1d1'}, {x:800,y:1064,w:230,h:205,name:'Harbor Gate',accent:'#e07e5e'}, {x:1120,y:1064,w:230,h:205,name:'Anchor Point',accent:'#65b58d'}, {x:1440,y:1064,w:230,h:205,name:'Drift Terminal',accent:'#d092d6'}
];
export const LANDMARKS=[{x:750,y:730,label:'NEON MARKET',kind:'shop'},{x:1068,y:1300,label:'HARBOR GATE',kind:'dock'},{x:430,y:1300,label:'CANAL HOUSE',kind:'safe'},{x:1690,y:550,label:'SKYBRIDGE',kind:'tower'}];
export function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
export function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
export function roadAt(x,y){const gx=((x-72)%320+320)%320,gy=((y-112)%290+290)%290;return gx<74||gy<74;}
export function nearestRoad(p){const x=Math.round((p.x-109)/320)*320+109,y=Math.round((p.y-149)/290)*290+149;return {x:clamp(x,60,WORLD.width-60),y:clamp(y,60,WORLD.height-60)};}
export function cameraFor(p,w,h){return {x:clamp(p.x-w/2,0,WORLD.width-w),y:clamp(p.y-h/2,0,WORLD.height-h)};}
