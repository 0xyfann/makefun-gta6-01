import { isBlocked, roads } from './city.js';
import { distance, moveBody, clamp, seeded } from './utils.js';
const random=seeded(69);
export function spawnPolice(state,count=1) {
  for(let i=0;i<count;i++){
    const p=state.player;
    const nearest=roads.reduce((a,b)=>Math.abs(a-p.x)<Math.abs(b-p.x)?a:b);
    let x=nearest+28,y=clamp(p.y+260+random()*220,180,3000);
    if(isBlocked(x,y,23)){x=nearest;y=roads.reduce((a,b)=>Math.abs(a-p.y)<Math.abs(b-p.y)?a:b);}
    state.police.push({x,y,angle:-Math.PI/2,speed:0,color:'#ede8d4',police:true,health:4,stuck:0});
  }
}
export function updatePolice(state,dt) {
  const p=state.player;
  if(state.wanted<=0){state.police=state.police.filter(c=>distance(c,p)<1100);return;}
  if(state.police.length<Math.min(6,state.wanted+1))spawnPolice(state);
  let seen=false;
  for(const c of state.police){
    const d=distance(c,p);
    if(d<330)seen=true;
    let tx=p.x,ty=p.y;
    if(isBlocked((c.x+p.x)/2,(c.y+p.y)/2,25)){
      const rx=roads.reduce((a,b)=>Math.abs(a-c.x)<Math.abs(b-c.x)?a:b);
      const ry=roads.reduce((a,b)=>Math.abs(a-c.y)<Math.abs(b-c.y)?a:b);
      if(Math.abs(c.x-rx)<Math.abs(c.y-ry)){tx=rx;ty=roads.reduce((a,b)=>Math.abs(a-p.y)<Math.abs(b-p.y)?a:b);}
      else {ty=ry;tx=roads.reduce((a,b)=>Math.abs(a-p.x)<Math.abs(b-p.x)?a:b);}
    }
    // Wrap the steering error so the patrol turns through the shorter angle.
    const desired=Math.atan2(ty-c.y,tx-c.x),diff=Math.atan2(Math.sin(desired-c.angle),Math.cos(desired-c.angle));
    c.angle+=clamp(diff,-2.6*dt,2.6*dt);
    c.speed=120+state.wanted*24;
    const hit=moveBody(c,Math.cos(c.angle)*c.speed*dt,Math.sin(c.angle)*c.speed*dt,isBlocked,21);
    c.stuck=hit?c.stuck+dt:0;
    if(c.stuck>1.2){c.angle+=Math.PI/2;c.stuck=0;}
    if(d<46){p.health-=dt*(p.car?5:12);state.shake=3; if(p.car)p.car.speed*=Math.exp(-dt*2);}
    if(d>1300){c.x=p.x;c.y=clamp(p.y+450,120,3020);if(isBlocked(c.x,c.y,24))c.x=roads.reduce((a,b)=>Math.abs(a-p.x)<Math.abs(b-p.x)?a:b);}
  }
  state.heat=Math.max(0,state.heat-dt*(seen?.12:1));
  if(state.heat<=0){state.wanted--;state.heat=state.wanted?12:0;if(!state.wanted){state.toast='CLEAR • Dispatch lost your trail. Keep a low profile.';state.player.money+=100;}}
}
