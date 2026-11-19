import { distance, circle, label } from './utils.js';
const chapters=[
  {title:'01 / THE PAPER TRAIL',objective:'Meet Inez at the Marigold kiosk',target:{x:1510,y:1084},reward:450,kind:'pickup',voice:'INEZ: The harbor books are cooked. Get this ledger to my source. Quietly.'},
  {title:'02 / PRECIOUS CARGO',objective:'Deliver the harbor ledger to Salt House',target:{x:2855,y:1300},reward:700,kind:'delivery',voice:'INEZ: Salt House. East on Sunline. The courier before you never made it.'},
  {title:'03 / LOOSE ENDS',objective:'Lose your wanted level. Stay out of sight.',target:null,reward:900,kind:'escape',voice:'INEZ: Someone tipped them off. Lose the patrols. Do not lead them home.'},
  {title:'04 / THE RAINY DAY FUND',objective:'Collect three syndicate cash drops',target:{x:2200,y:1510},reward:1200,kind:'cash',voice:'INEZ: Their slush fund pays for this whole operation. Time for a withdrawal.'},
  {title:'05 / LAST LIGHT',objective:'Bring the evidence to the lighthouse',target:{x:2895,y:1600},reward:2000,kind:'final',voice:'INEZ: The broadcast goes live at sundown. Meet me by the water. This ends tonight.'}
];
export function createMission(index=0){return {...chapters[index%chapters.length],index,stage:0,collected:0};}
export function createCashDrops(){return [{x:2200,y:1510},{x:1000,y:1697},{x:2200,y:2300}].map(p=>({...p,taken:false}));}
export function interactMission(state){
  const m=state.mission;
  if(!m.target||distance(state.player,m.target)>90){state.toast='Follow the yellow waypoint. Get within the ring and press F.';return;}
  if(m.kind==='cash'){state.toast='Collect the three green cash cases marked on the map.';return;}
  completeChapter(state);
}
export function completeChapter(state){
  const m=state.mission;
  state.player.money+=m.reward;state.completed++;
  const next=(m.index+1)%chapters.length;
  state.mission=createMission(next);state.toast=`+$${m.reward} • ${state.mission.voice}`;state.toastLife=13;
  if(next===2){state.wanted=Math.max(2,state.wanted);state.heat=18;}
  if(next===0){state.toast='THE CITY HEARD YOU. Harbor corruption exposed. New shift unlocked • all jobs replayable.';state.player.health=100;}
}
export function updateMissions(state,dt){
  const m=state.mission;
  if(m.kind==='escape'&&state.wanted===0)completeChapter(state);
  for(const drop of state.drops){
    if(drop.taken||distance(state.player,drop)>33)continue;
    drop.taken=true;state.player.money+=150;state.toast='Syndicate stash +$150';
    if(m.kind==='cash'){m.collected++;m.objective=`Collect syndicate cash drops • ${m.collected} / 3`;
      const next=state.drops.find(d=>!d.taken);m.target=next||null;if(m.collected>=3)completeChapter(state);}
  }
  // Replenish drops if earlier pickups left too few for the active cash chapter.
  if(m.kind==='cash'&&state.drops.every(d=>d.taken)&&m.collected<3){state.drops=createCashDrops();m.target=state.drops[0];}
  const clinic={x:1488,y:1280};
  if(state.player.health<100&&distance(state.player,clinic)<45){state.player.health=Math.min(100,state.player.health+dt*12);}
}
export function drawMissionMarkers(ctx,state){
  const m=state.mission,t=state.time;
  if(m.target){
    const {x,y}=m.target,pulse=Math.sin(t*3)*5;
    circle(ctx,x,y,43+pulse,'#f3d56a22');ctx.strokeStyle='#f5d260';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(x,y,31+pulse,0,Math.PI*2);ctx.stroke();
    ctx.save();ctx.translate(x,y-38+Math.sin(t*2)*5);ctx.rotate(Math.PI/4);ctx.fillStyle='#f9df77';ctx.fillRect(-9,-9,18,18);ctx.restore();
    label(ctx,m.kind==='pickup'?'INEZ / CONTACT':'OBJECTIVE',x,y-64,'#fff3be',11);
  }
  for(const d of state.drops)if(!d.taken){circle(ctx,d.x,d.y,20,'#b8ed7b25');ctx.fillStyle='#bbe892';ctx.fillRect(d.x-8,d.y-5,16,10);label(ctx,'$',d.x,d.y+4,'#245849',11);}
  circle(ctx,1488,1280,21,'#ffffff45');label(ctx,'+',1488,1287,'#fff1d1',27);
}
