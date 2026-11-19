// Exercise live gameplay through Chromium DevTools without creating screenshots.
import assert from 'node:assert/strict';
const origin = ['http:', '', '127.0.0.1:8080'].join('/');
const debug = ['http:', '', '127.0.0.1:9222'].join('/');
const pages = await (await fetch(debug + '/json')).json();
const ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
await new Promise((resolve,reject) => {ws.onopen=resolve;ws.onerror=reject;});
let serial=0;const pending=new Map(),errors=[],requests=[];
ws.onmessage=event=>{
  const msg=JSON.parse(event.data);
  if(msg.id){const p=pending.get(msg.id);pending.delete(msg.id);msg.error?p.reject(new Error(msg.error.message)):p.resolve(msg.result);}
  if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params.exceptionDetails.text+': '+(msg.params.exceptionDetails.exception?.description||''));
  if(msg.method==='Network.requestWillBeSent')requests.push(msg.params.request.url);
};
function call(method,params={}){return new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
await call('Runtime.enable');await call('Network.enable');await call('Page.enable');
await call('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
async function frames(count=15){return evaluate(`new Promise(resolve=>{let n=${count};function step(){if(--n<=0)resolve(true);else requestAnimationFrame(step)}requestAnimationFrame(step)})`);}
async function open(scene){await call('Page.navigate',{url:origin+'/index.html'+(scene?'?scene='+scene:'')});await evaluate(`new Promise(resolve=>{const done=()=>{if(window.sundown)resolve(true);else if(performance.now()>15000)resolve(false);else setTimeout(done,25)};done()})`);await frames();}
async function key(code,key,type='keyDown'){await call('Input.dispatchKeyEvent',{type,code,key,windowsVirtualKeyCode:key.length===1?key.toUpperCase().charCodeAt(0):undefined});}
const results=[];
for(const scene of ['','foot','drive','chase','mission']){
  await open(scene);
  const info=await evaluate(`(()=>{const s=sundown.state,c=document.querySelector('#world'),g=c.getContext('2d'),pixels=g.getImageData(0,0,c.width,c.height).data;let varied=0;for(let i=0;i<pixels.length;i+=400)if(pixels[i]!==pixels[0])varied++;return {scene:s.scene,car:!!s.player.car,wanted:s.wanted,police:s.police.length,people:s.people.length,cars:s.cars.length,mission:s.mission.title,canvas:[c.width,c.height],varied,menu:!!document.querySelector('#menu.is-open'),hud:document.querySelector('#hud').innerText}})()`);
  assert(info.varied>500,'world must render varied pixels');assert(info.cars>40&&info.people>20);assert(info.canvas[0]===1280);
  assert.equal(info.menu,!scene);if(scene==='foot')assert.equal(info.car,false);if(['drive','chase','mission'].includes(scene))assert.equal(info.car,true);
  if(scene==='chase')assert(info.wanted===3&&info.police>=4&&info.hud.includes('★★★'));
  if(scene==='mission')assert(info.mission.includes('PRECIOUS CARGO'));
  results.push({preset:scene||'title',...info,hud:undefined});
}
await open('foot');
const y=await evaluate('sundown.state.player.y');await key('KeyW','w');await frames(22);await key('KeyW','w','keyUp');
assert((await evaluate('sundown.state.player.y'))<y-8,'W walks north');
await evaluate('sundown.state.player.x=1537;sundown.state.player.y=1135');await key('KeyE','e');await key('KeyE','e','keyUp');
assert(await evaluate('!!sundown.state.player.car'),'E enters nearby parked car');
const before=await evaluate('({x:sundown.state.player.x,y:sundown.state.player.y})');await key('KeyW','w');await frames(30);await key('KeyW','w','keyUp');const after=await evaluate('({x:sundown.state.player.x,y:sundown.state.player.y})');assert(Math.hypot(after.x-before.x,after.y-before.y)>10,'throttle moves car');
await key('KeyE','e');await key('KeyE','e','keyUp');assert.equal(await evaluate('!!sundown.state.player.car'),false);
await key('Escape','Escape');assert(await evaluate('sundown.state.paused'));await key('Escape','Escape');assert.equal(await evaluate('sundown.state.paused'),false);
await evaluate('sundown.state.player.x=1510;sundown.state.player.y=1084');await key('KeyF','f');await key('KeyF','f','keyUp');assert.equal(await evaluate('sundown.state.mission.index'),1);
await evaluate('sundown.state.player.x=2855;sundown.state.player.y=1300');await key('KeyF','f');await key('KeyF','f','keyUp');assert.equal(await evaluate('sundown.state.mission.index'),2);assert((await evaluate('sundown.state.wanted'))>=2);
await evaluate('sundown.state.wanted=0;sundown.state.police=[]');await frames(2);assert.equal(await evaluate('sundown.state.mission.index'),3);
for(let i=0;i<3;i++){await evaluate(`sundown.state.player.x=sundown.state.drops[${i}].x;sundown.state.player.y=sundown.state.drops[${i}].y`);await frames(2);}
assert.equal(await evaluate('sundown.state.mission.index'),4);
await evaluate('sundown.state.player.x=2895;sundown.state.player.y=1600');await key('KeyF','f');await key('KeyF','f','keyUp');assert.equal(await evaluate('sundown.state.completed'),5);
const money=await evaluate('sundown.state.player.money');await evaluate('sundown.save();sundown.state.player.money=0;sundown.load()');assert.equal(await evaluate('sundown.state.player.money'),money);
await call('Input.dispatchMouseEvent',{type:'mousePressed',x:700,y:300,button:'left',clickCount:1});await frames(3);await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:700,y:300,button:'left',clickCount:1});assert((await evaluate('sundown.state.wanted'))>=2);
await open('foot');await evaluate(`(()=>{const s=sundown.state,c=s.cars.find(c=>c.occupied);s.player.x=c.x;s.player.y=c.y})()`);await key('KeyE','e');await key('KeyE','e','keyUp');assert((await evaluate('sundown.state.wanted'))>=1,'theft raises wanted level');
await open('');await evaluate(`document.querySelector('[data-action="primary"]').click()`);assert.equal(await evaluate('sundown.state.paused'),false);
const external=requests.filter(url=>!url.startsWith(origin+'/')&&!url.startsWith('data:')&&url!=='about:blank');
assert.deepEqual(external,[],'game loads only its own files');assert.deepEqual(errors,[],'no uncaught browser errors');
console.log(JSON.stringify({presets:results,checks:['walking','enter and exit vehicle','driving','pause and resume','five mission chapters','cash collection','save and load','mouse combat','vehicle theft','title start','no external requests','no runtime exceptions'],requests:requests.length,errors},null,2));
ws.close();
