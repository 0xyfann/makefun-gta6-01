import { createMission, createCashDrops } from './missions.js';
import { isBlocked } from './city.js';
const SLOT='sundown.port-aurelia.save.v1';
export function saveGame(state){
  const p=state.player;
  try{
    localStorage.setItem(SLOT,JSON.stringify({version:1,x:p.x,y:p.y,money:p.money,health:p.health,chapter:state.mission.index,completed:state.completed}));
    state.toast='SHIFT SAVED • your money, location and story are safe on this device.';
  }catch{state.toast='Storage unavailable. This shift can still be played normally.';}
}
export function loadGame(state){
  try{
    const raw=localStorage.getItem(SLOT);if(!raw){state.toast='No saved shift yet. Start a new one.';return false;}
    const data=JSON.parse(raw);
    if(data.version!==1||!Number.isFinite(data.x)||!Number.isFinite(data.y)||isBlocked(data.x,data.y,10)||!Number.isFinite(data.money)||!Number.isFinite(data.health)||!Number.isInteger(data.chapter)||data.chapter<0||data.chapter>4)throw new Error('invalid save');
    Object.assign(state.player,{x:data.x,y:data.y,money:Math.max(0,data.money),health:Math.max(1,Math.min(100,data.health)),car:null});
    state.mission=createMission(data.chapter);state.drops=createCashDrops();state.completed=data.completed||0;state.wanted=0;state.police=[];state.toast='Welcome back to Port Aurelia. Your contact is waiting.';return true;
  }catch{state.toast='Saved shift could not be loaded. Start a new shift.';return false;}
}
