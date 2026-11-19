import { drawCity, district } from './city.js';
import { createTraffic, updateTraffic, createPedestrians, updatePedestrians, drawCar, drawPerson } from './traffic.js';
import { createPlayer, updatePlayer, enterOrExitCar } from './player.js';
import { updatePolice, spawnPolice } from './police.js';
import { createMission, createCashDrops, updateMissions, interactMission, drawMissionMarkers } from './missions.js';
import { fireWeapon, updateCombat, drawCombat } from './combat.js';
import { drawHUD, showMenu } from './hud.js';
import { drawMinimap } from './minimap.js';
import { unlockAudio, toggleAudio, updateAudio, playTone } from './audio.js';
import { saveGame, loadGame } from './save.js';
import { distance, label } from './utils.js';
const canvas=document.getElementById('world'),ctx=canvas.getContext('2d',{alpha:false});
const keys=new Set(),mouse={x:0,y:0,down:false};
// Only the listed scene query values select a preset; other values open the title.
const validScenes=['foot','drive','chase','mission'];
const requested=new URLSearchParams(location.search).get('scene');
const scene=validScenes.includes(requested)?requested:'title';
export const state={player:createPlayer(),cars:createTraffic(),people:createPedestrians(),police:[],
  mission:createMission(),drops:createCashDrops(),wanted:0,heat:0,time:0,completed:0,
  toast:'INEZ: Find me at the Marigold kiosk. There is a city worth saving underneath all this money.',toastLife:12,
  particles:[],bullets:[],fireCooldown:0,shake:0,paused:scene==='title',scene,muted:false,district:'',prompt:''};
const camera={x:1600,y:1000,zoom:.85};
let width=1280,height=720,last=performance.now(),autosaveClock=0;
function resize(){width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;}
addEventListener('resize',resize);resize();
function applyPreset(){
  if(scene==='drive'||scene==='chase'||scene==='mission'){
    const c=state.cars.at(-1);c.x=1572;c.y=1050;c.angle=-Math.PI/2;c.speed=0;c.parked=false;c.occupied=true;state.player.car=c;state.player.x=c.x;state.player.y=c.y;
  }
  if(scene==='chase'){
    state.wanted=3;state.heat=26;state.mission=createMission(2);spawnPolice(state,4);
    state.police.forEach((c,i)=>{c.x=1572+(i%2)*56;c.y=1200+Math.floor(i/2)*110;c.angle=-Math.PI/2;});
    state.toast='DISPATCH: Gold coupe, Sunline Boulevard. All units respond.';
  }
  if(scene==='drive'){const c=state.player.car;c.x=1628;c.y=1540;c.angle=Math.PI/2;state.player.x=c.x;state.player.y=c.y;}
  if(scene==='mission'){const c=state.player.car;c.x=2828;c.y=1140;c.angle=Math.PI/2;state.player.x=c.x;state.player.y=c.y;state.mission=createMission(1);state.toast=state.mission.voice;}
  camera.x=state.player.x;camera.y=state.player.y;
}
applyPreset();
function openMenu(mode){
  showMenu(mode,()=>{resetShift();},()=>{resume();},()=>{saveGame(state);},()=>{if(loadGame(state))resume();});
}
function resume(){state.paused=false;state.scene='play';keys.clear();mouse.down=false;openMenu(null);unlockAudio();}
function resetShift(){
  Object.assign(state,{player:createPlayer(),cars:createTraffic(),people:createPedestrians(),police:[],mission:createMission(),drops:createCashDrops(),wanted:0,heat:0,completed:0,bullets:[],particles:[],toast:'INEZ: Meet me at the Marigold kiosk. The harbor ledger will change everything.'});
  resume();
}
function pause(){if(state.scene==='title')return;state.paused=!state.paused;keys.clear();mouse.down=false;openMenu(state.paused?'pause':null);}
openMenu(scene==='title'?'title':null);
addEventListener('keydown',event=>{
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Tab'].includes(event.code))event.preventDefault();
  if(event.repeat)return;
  if(event.code==='Escape'){pause();return;}
  unlockAudio();
  if(state.paused){if(event.code==='Enter')resetShift();return;}
  keys.add(event.code);
  if(event.code==='KeyE')enterOrExitCar(state);
  if(event.code==='KeyF'){interactMission(state);playTone(660,.15);}
  if(event.code==='KeyM')toggleAudio(state);
  if(event.code==='KeyP')saveGame(state);
});
addEventListener('keyup',event=>keys.delete(event.code));
addEventListener('blur',()=>{keys.clear();mouse.down=false;if(!state.paused&&state.scene!=='title')pause();});
canvas.addEventListener('pointermove',event=>{mouse.x=event.clientX;mouse.y=event.clientY;});
canvas.addEventListener('pointerdown',event=>{if(event.button===0){unlockAudio();mouse.down=true;}});
addEventListener('pointerup',()=>mouse.down=false);
canvas.addEventListener('contextmenu',event=>event.preventDefault());
function update(dt){
  state.time+=dt;
  if(!state.paused){
    updatePlayer(state,keys,dt);updatePolice(state,dt);updateMissions(state,dt);updateCombat(state,dt);
    if(mouse.down){fireWeapon(state,{x:(mouse.x-width/2)/camera.zoom+camera.x,y:(mouse.y-height/2)/camera.zoom+camera.y});playTone(80,.055);}
    autosaveClock+=dt;if(autosaveClock>45){saveGame(state);autosaveClock=0;}
  }
  if(!state.paused||state.scene==='title'){updateTraffic(state,dt);updatePedestrians(state,dt);}
  updateAudio(state,dt);
  const p=state.player;
  const look=p.car?Math.min(90,Math.abs(p.car.speed)*.25):0;
  const targetX=state.scene==='title'?1660:p.x+Math.cos(p.angle)*look;
  const targetY=state.scene==='title'?1170:p.y+Math.sin(p.angle)*look;
  camera.x+=(targetX-camera.x)*(1-Math.exp(-dt*5));camera.y+=(targetY-camera.y)*(1-Math.exp(-dt*5));
  camera.zoom+=(Math.max(.65,Math.min(1,width/1500))-(p.car?.speed>160?.07:0)-camera.zoom)*(1-Math.exp(-dt*3));
  state.district=district(p.x,p.y);state.shake*=Math.exp(-dt*10);
  const nearby=state.cars.some(c=>distance(c,p)<80&&c!==p.car);
  state.prompt=state.mission.target&&distance(p,state.mission.target)<90?'F / INTERACT WITH CONTACT':p.car?'E / EXIT VEHICLE':nearby?'E / TAKE THE WHEEL':'SHIFT / SPRINT';
}
function render(){
  const dpr=Math.min(devicePixelRatio||1,2);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#c4b99b';ctx.fillRect(0,0,width,height);
  ctx.save();ctx.translate(width/2+(Math.random()-.5)*state.shake,height/2+(Math.random()-.5)*state.shake);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-camera.x,-camera.y);
  drawCity(ctx,state.time);drawMissionMarkers(ctx,state);
  const entities=[...state.cars.map(c=>({y:c.y,draw:()=>drawCar(ctx,c,state.time)})),...state.police.map(c=>({y:c.y,draw:()=>drawCar(ctx,c,state.time)})),...state.people.map(p=>({y:p.y,draw:()=>drawPerson(ctx,p,state.time)}))];
  if(!state.player.car)entities.push({y:state.player.y,draw:()=>drawPerson(ctx,state.player,state.time,true)});
  entities.sort((a,b)=>a.y-b.y).forEach(e=>e.draw());
  drawCombat(ctx,state);
  const p=state.player;
  ctx.strokeStyle='#fbf4c8';ctx.lineWidth=2;ctx.setLineDash([3,5]);ctx.beginPath();ctx.arc(p.x,p.y,34,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#f9efb8';ctx.beginPath();ctx.moveTo(p.x+Math.cos(p.angle)*42,p.y+Math.sin(p.angle)*42);ctx.lineTo(p.x+Math.cos(p.angle+.18)*33,p.y+Math.sin(p.angle+.18)*33);ctx.lineTo(p.x+Math.cos(p.angle-.18)*33,p.y+Math.sin(p.angle-.18)*33);ctx.fill();
  label(ctx,p.car?'MARA / AUREL SPRINT':'MARA VENN',p.x,p.y-49,'#fff6d2',10);
  ctx.restore();
  const vignette=ctx.createRadialGradient(width/2,height/2,width*.15,width/2,height/2,width*.7);vignette.addColorStop(0,'#172b2900');vignette.addColorStop(1,'#10272845');ctx.fillStyle=vignette;ctx.fillRect(0,0,width,height);
  drawHUD(state);drawMinimap(state);
}
function frame(now){const dt=Math.min(.04,(now-last)/1000);last=now;update(dt);render();requestAnimationFrame(frame);}
requestAnimationFrame(frame);
// Read-only diagnostics are useful when checking presets in a real browser.
window.sundown={state,camera,save:()=>saveGame(state),load:()=>loadGame(state)};
