import { isBlocked } from './city.js';
import { clamp, distance, moveBody } from './utils.js';
export function createPlayer() {return {x:1510,y:1079,angle:-Math.PI/2,health:100,money:1250,car:null,phase:0};}
export function enterOrExitCar(state) {
  const p=state.player;
  if(p.car){
    const c=p.car;
    // Test both exit points perpendicular to the car's heading.
    for(const side of [-1,1]) {
      const x=c.x-Math.sin(c.angle)*43*side,y=c.y+Math.cos(c.angle)*43*side;
      if(!isBlocked(x,y,10)) {p.x=x;p.y=y;c.parked=true;c.occupied=false;c.speed=0;p.car=null;state.toast='Back on foot.';return;}
    }
    state.toast='Door blocked. Move the car first.';return;
  }
  const c=state.cars.filter(c=>!c.disabled&&distance(c,p)<80).sort((a,b)=>distance(a,p)-distance(b,p))[0];
  if(!c){state.toast='Get closer to a vehicle to take the wheel.';return;}
  if(c.occupied){state.wanted=Math.max(1,state.wanted);state.heat=18;state.toast='Vehicle reported stolen. Leave the area.';}
  else state.toast='AUREL SPRINT • keys are in the ignition';
  c.speed=0;c.occupied=true;c.parked=false;p.car=c;p.x=c.x;p.y=c.y;p.angle=c.angle;
}
export function updatePlayer(state,input,dt) {
  const p=state.player;
  const axisX=Number(input.has('KeyD')||input.has('ArrowRight'))-Number(input.has('KeyA')||input.has('ArrowLeft'));
  const axisY=Number(input.has('KeyS')||input.has('ArrowDown'))-Number(input.has('KeyW')||input.has('ArrowUp'));
  const shift=input.has('ShiftLeft')||input.has('ShiftRight');
  if(p.car){
    const c=p.car,throttle=-axisY;
    c.speed=clamp(c.speed+throttle*235*dt,-105,340);
    c.speed*=Math.exp(-(shift?3.8:throttle?0.25:1.05)*dt);
    if(Math.abs(c.speed)>4)c.angle+=axisX*2.3*dt*clamp(c.speed/110,-1,1)*(shift?1.4:1);
    const impact=moveBody(c,Math.cos(c.angle)*c.speed*dt,Math.sin(c.angle)*c.speed*dt,isBlocked,21);
    if(impact){if(Math.abs(c.speed)>90){p.health-=Math.abs(c.speed)*.035;state.shake=7;}c.speed*=-.25;}
    for(const o of state.cars){
      if(o===c||distance(o,c)>46)continue;
      if(Math.abs(c.speed)>75){state.wanted=Math.max(1,state.wanted);state.heat=20;state.shake=5;}
      c.speed*=-.35;
      const a=Math.atan2(c.y-o.y,c.x-o.x);moveBody(c,Math.cos(a)*10,Math.sin(a)*10,isBlocked,21);
    }
    for(const ped of state.people)if(ped.down<=0&&distance(ped,c)<24&&Math.abs(c.speed)>50){ped.down=12;state.wanted=clamp(state.wanted+1,1,5);state.heat=25;p.health-=2;}
    p.x=c.x;p.y=c.y;p.angle=c.angle;
    if(shift&&Math.abs(c.speed)>70)state.particles.push({x:c.x,y:c.y,life:.65,color:'#e7d8bb',size:9});
  } else {
    const norm=Math.hypot(axisX,axisY)||1,speed=shift?175:108;
    moveBody(p,axisX/norm*speed*dt,axisY/norm*speed*dt,isBlocked,10);
    if(axisX||axisY){p.angle=Math.atan2(axisY,axisX);p.phase+=dt*(shift?18:10);}
  }
  p.health=clamp(p.health,0,100);
  if(p.health<=0){
    p.car=null;p.x=1510;p.y=1079;p.health=100;p.money=Math.max(0,p.money-250);state.wanted=0;state.heat=0;state.police=[];
    state.toast='Recovered at Paloma Clinic. Medical fee −$250. Your contact is still waiting.';
  }
}
