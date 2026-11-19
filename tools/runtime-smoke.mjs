import assert from 'node:assert/strict';
import { BLOCKS, nearestRoad, roadAt } from '../game/config.js';
import { CONTRACTS, advanceMission, isNearTarget, missionState } from '../game/missions.js';
import { makeCarFromPlayer, seedPeds, seedTraffic, updateTraffic } from '../game/vehicles.js';

assert.equal(CONTRACTS.length,5);
assert.equal(missionState('mission'),2);
assert.equal(missionState('chase'),3);
const campaign={stage:0,complete:false,reward:0};
for(let i=0;i<5;i++){assert(advanceMission(campaign));assert.equal(campaign.complete,i===4)}
assert.equal(campaign.reward,5650,'all contract rewards should be accounted for');
assert(isNearTarget(CONTRACTS[0].target,CONTRACTS[0].target));
assert.equal(BLOCKS.length,20);
assert(roadAt(109,400));assert(roadAt(300,149));assert(!roadAt(250,250));
assert.deepEqual(nearestRoad({x:750,y:774}),{x:749,y:729});
const cars=seedTraffic(),people=seedPeds();assert.equal(cars.length,15);assert.equal(people.length,25);
for(const car of cars)assert(roadAt(car.x,car.y),'traffic should start on a road lane');
const before=cars.map(car=>[car.x,car.y]);updateTraffic(cars,100);
assert(cars.some((car,i)=>car.x!==before[i][0]||car.y!==before[i][1]),'traffic should move');
assert.equal(makeCarFromPlayer({x:750,y:774}).x,749);

class Element {
  constructor(id) {
    this.id=id; this.width=id==='#world'?1280:190; this.height=id==='#world'?720:150;
    this.style={}; this.textContent=''; this.listeners={}; this.classes=new Set();
    this.classList={add:(x)=>this.classes.add(x),remove:(x)=>this.classes.delete(x),toggle:(x,on)=>{if(on===undefined)on=!this.classes.has(x);on?this.classes.add(x):this.classes.delete(x);return on},contains:(x)=>this.classes.has(x)};
  }
  addEventListener(type,fn){this.listeners[type]=fn}
  getBoundingClientRect(){return {width:1280,height:720}}
  getContext(){if(!this.context)this.context=new Context(this);return this.context}
}
class Context {
  constructor(canvas){this.canvas=canvas;this.globalAlpha=1}
  measureText(text){return {width:String(text).length*6}}
  setLineDash(){}
  save(){} restore(){} translate(){} rotate(){} setTransform(){} clearRect(){} fillRect(){} strokeRect(){}
  beginPath(){} moveTo(){} lineTo(){} stroke(){} fill(){} arc(){} roundRect(){} fillText(){}
}
const elements=new Map();
globalThis.document={querySelector:(id)=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)}};
const windowListeners={};
globalThis.window={devicePixelRatio:1,addEventListener:(type,fn)=>{windowListeners[type]=fn}};
globalThis.devicePixelRatio=1;
globalThis.location={search:process.env.SCENE?`?scene=${process.env.SCENE}`:''};
globalThis.localStorage={values:new Map(),setItem(k,v){this.values.set(k,v)},getItem(k){return this.values.get(k)||null}};
let frame=null;globalThis.requestAnimationFrame=(fn)=>{frame=fn};
class Oscillator {constructor(){this.frequency={value:0};this.type='sine'}connect(){return this}start(){}stop(){}}
class Gain {constructor(){this.gain={setValueAtTime(){},exponentialRampToValueAtTime(){}}}connect(){return this}}
globalThis.AudioContext=class{constructor(){this.state='running';this.currentTime=0;this.destination={}}resume(){}createOscillator(){return new Oscillator()}createGain(){return new Gain()}};
await import('../game/game.js');
assert.equal(typeof frame,'function','game loop was not scheduled');
const fire=(type,event)=>{const fn=windowListeners[type];assert(fn,`missing ${type} handler`);fn({repeat:false,preventDefault(){},...event})};
const tick=()=>{const next=frame;frame=null;next?.(performance.now()+16);assert.equal(typeof frame,'function','next frame was not scheduled')};
tick();
const mode=document.querySelector('#mode-label');
const wanted=document.querySelector('#stars');
if(process.env.SCENE==='chase'){assert.equal(wanted.textContent,'★★★☆☆');assert.equal(document.querySelector('#mission-title').textContent,'Heat Check')}
if(process.env.SCENE==='mission'){assert.equal(document.querySelector('#mission-title').textContent,'Waterline Drop')}
fire('keydown',{key:'p'});assert(document.querySelector('#pause').classList.contains('hidden')===false,'pause did not open');
fire('keydown',{key:'p'});assert(document.querySelector('#pause').classList.contains('hidden'),'pause did not resume');
const initialMode=mode.textContent;
fire('keydown',{key:'e'});tick();assert.notEqual(mode.textContent,initialMode,'vehicle toggle did not change mode');
fire('keydown',{key:'e'});tick();assert.equal(mode.textContent,initialMode,'vehicle toggle did not return to original mode');
fire('keydown',{key:'F5'});assert(localStorage.getItem('nightline-save'),'save did not write local state');
fire('keydown',{key:'F9'});assert(document.querySelector('#toast').textContent.includes('RESTORED'),'load did not restore local state');
fire('keydown',{key:'q'});tick();
fire('keyup',{key:'q'});
console.log(`runtime smoke passed: ${process.env.SCENE||'start'} scene`);
