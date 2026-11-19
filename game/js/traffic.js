import { roads, WORLD, isBlocked } from './city.js';
import { seeded, circle } from './utils.js';
const random = seeded(418);
const colors = ['#ecb94f', '#e57f64', '#4b9998', '#e8dfc6', '#758bad', '#903c43'];
export function createTraffic() {
  const cars = [];
  for (let i = 0; i < 62; i++) {
    const vertical = i % 2 === 0, dir = i % 4 < 2 ? 1 : -1;
    const road = roads[i % roads.length];
    const lane = dir * 28;
    cars.push({ x: vertical ? road - lane : random() * 2700 + 150,
      y: vertical ? random() * 2850 + 150 : road + lane,
      angle: vertical ? dir * Math.PI / 2 : dir === 1 ? 0 : Math.PI,
      vertical, dir, road, speed: 58 + random() * 48, color: colors[i % colors.length], model: i % 4, occupied: true });
  }
  cars.push({x:1537,y:1135,angle:-Math.PI/2,speed:0,color:'#e7b943',model:0,occupied:false,parked:true});
  return cars;
}
export function updateTraffic(state, dt) {
  for (const c of state.cars) {
    if (c === state.player.car || c.parked || c.disabled) continue;
    let stop = false;
    const along = c.vertical ? c.y : c.x;
    const signal = Math.floor(state.time / 7) % 2;
    for (const r of roads) if ((r - along) * c.dir > 65 && (r - along) * c.dir < 115 && signal === Number(c.vertical)) stop = true;
    for (const other of state.cars) {
      if (other === c) continue;
      const dx = other.x - c.x, dy = other.y - c.y;
      if (Math.hypot(dx,dy) < 74 && dx * Math.cos(c.angle) + dy * Math.sin(c.angle) > 0) stop = true;
    }
    if (!stop) {
      c.x += Math.cos(c.angle) * c.speed * dt;
      c.y += Math.sin(c.angle) * c.speed * dt;
    }
    if (c.x > 2870) c.x = 130;
    if (c.x < 130) c.x = 2870;
    if (c.y > WORLD - 130) c.y = 130;
    if (c.y < 130) c.y = WORLD - 130;
  }
}
export function createPedestrians() {
  const people = [];
  for (let i=0; i<100; i++) {
    const vertical = i%2===0, road = roads[i%5], side = i%4<2?1:-1;
    const p = {x:vertical?road+side*91:150+random()*2750,y:vertical?150+random()*2750:road+side*91,
      vertical,dir:side,speed:15+random()*18,color:colors[i%6],phase:random()*6,down:0};
    if (!isBlocked(p.x,p.y,8)) people.push(p);
  }
  return people;
}
export function updatePedestrians(state, dt) {
  for (const p of state.people) {
    if (p.down>0) {p.down-=dt;continue;}
    const panic = state.wanted > 0 && Math.hypot(p.x-state.player.x,p.y-state.player.y)<240;
    const step=p.speed*(panic?2.8:1)*dt*p.dir;
    const nx=p.x+(p.vertical?0:step),ny=p.y+(p.vertical?step:0);
    if (isBlocked(nx,ny,8)||nx<100||ny<100||nx>2940||ny>3060) p.dir*=-1;
    else {p.x=nx;p.y=ny;}
    p.phase+=dt*8;
  }
}
export function drawPerson(ctx,p,time,player=false) {
  ctx.save();ctx.translate(p.x,p.y);
  if(p.down>0)ctx.rotate(1.3);
  ctx.fillStyle='#172e303d';ctx.beginPath();ctx.ellipse(5,8,8,5,0,0,7);ctx.fill();
  ctx.strokeStyle='#273135';ctx.lineWidth=4;
  const stride=Math.sin(p.phase||time*8)*3;
  ctx.beginPath();ctx.moveTo(-3,3);ctx.lineTo(-4,9+stride);ctx.moveTo(3,3);ctx.lineTo(4,9-stride);ctx.stroke();
  circle(ctx,0,0,7,player?'#f2edcf':p.color);circle(ctx,0,-5,4,'#c68d65');
  if(player){ctx.fillStyle='#263f41';ctx.fillRect(-4,-1,8,5);ctx.strokeStyle='#f4d88a';ctx.lineWidth=2;ctx.strokeRect(-4,-1,8,5);}
  ctx.restore();
}
export function drawCar(ctx,c,time=0) {
  ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.angle);
  ctx.fillStyle='#15262e40';ctx.fillRect(-24+8,-13+9,51,28);
  ctx.fillStyle='#172d32';ctx.fillRect(-17,-16,11,5);ctx.fillRect(10,-16,11,5);ctx.fillRect(-17,11,11,5);ctx.fillRect(10,11,11,5);
  ctx.fillStyle=c.police?'#ede8d4':c.color;
  ctx.beginPath();ctx.roundRect(-27,-13,54,26,5);ctx.fill();
  ctx.fillStyle='#203e48';ctx.fillRect(-10,-11,24,22);
  ctx.fillStyle=c.police?'#293b40':c.color;ctx.fillRect(-7,-10,15,20);
  ctx.fillStyle='#73949a';ctx.fillRect(9,-9,4,18);ctx.fillRect(-12,-9,3,18);
  ctx.fillStyle='#f8edbb';ctx.fillRect(23,-10,3,5);ctx.fillRect(23,5,3,5);
  ctx.fillStyle='#b63e39';ctx.fillRect(-27,-10,3,5);ctx.fillRect(-27,5,3,5);
  ctx.strokeStyle='#ffffff39';ctx.lineWidth=1;ctx.strokeRect(-23,-11,44,22);
  if(c.police){ctx.fillStyle='#21363b';ctx.fillRect(-3,-12,11,24);ctx.fillStyle=Math.sin(time*16)>0?'#fb5e55':'#69cbff';ctx.fillRect(0,-11,5,22);
    ctx.globalAlpha=.16;circle(ctx,2,-12,30,Math.sin(time*16)>0?'#ff5544':'#7edaff');}
  ctx.restore();
}
