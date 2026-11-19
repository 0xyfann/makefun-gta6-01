import { distance, circle } from './utils.js';
// A shot starts its cooldown and adds both the projectile and muzzle flash.
export function fireWeapon(state,aim) {
  if(state.fireCooldown>0)return;
  state.fireCooldown=.22;state.wanted=Math.min(5,Math.max(2,state.wanted));state.heat=23;
  const p=state.player,a=Math.atan2(aim.y-p.y,aim.x-p.x);
  state.bullets.push({x:p.x+Math.cos(a)*24,y:p.y+Math.sin(a)*24,vx:Math.cos(a)*900,vy:Math.sin(a)*900,life:.65});
  state.particles.push({x:p.x+Math.cos(a)*25,y:p.y+Math.sin(a)*25,life:.12,size:12,color:'#fff0a0'});
}
export function updateCombat(state,dt){
  state.fireCooldown=Math.max(0,state.fireCooldown-dt);
  for(const b of state.bullets){
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
    for(const c of state.police)if(b.life>0&&distance(b,c)<28){c.health--;b.life=0;if(c.health<=0){state.player.money+=75;state.particles.push({x:c.x,y:c.y,life:1,size:32,color:'#e99556'});}}
    for(const p of state.people)if(b.life>0&&p.down<=0&&distance(b,p)<12){p.down=15;b.life=0;state.wanted=Math.min(5,state.wanted+1);}
  }
  state.police=state.police.filter(c=>c.health>0);
  state.bullets=state.bullets.filter(b=>b.life>0);
  for(const p of state.particles)p.life-=dt;
  state.particles=state.particles.filter(p=>p.life>0);
}
export function drawCombat(ctx,state){
  for(const b of state.bullets){ctx.strokeStyle='#fff0af';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*.024,b.y-b.vy*.024);ctx.stroke();}
  for(const p of state.particles){ctx.globalAlpha=Math.min(1,p.life*2);circle(ctx,p.x,p.y,p.size*(1.3-p.life*.3),p.color);}
  ctx.globalAlpha=1;
}
