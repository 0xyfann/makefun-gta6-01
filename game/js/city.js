export const WORLD = 3200;
export const roads = [400, 1000, 1600, 2200, 2800];

const ROAD_HALF = 71;
const SEA_X = 2980;
const blocks = [
  [0, 329], [471, 929], [1071, 1529], [1671, 2129], [2271, 2729], [2871, SEA_X],
];
const buildings = [];
const parks = [];
const pools = [];
const palms = [];
const rand = (() => { let s = 712031; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); })();

function addBuilding(x, y, w, h, name, kind = 'urban', color) {
  buildings.push({ x, y, w, h, name, kind, color: color || ['#e9b879', '#efc98e', '#d9a56c', '#f0d2a0', '#c98761'][Math.floor(rand() * 5)], height: 12 + Math.floor(rand() * 29), roof: rand() });
}

// The civic garden and landmark blocks sit behind the sidewalks, clear of the junction.
parks.push({ x: 1101, y: 1101, w: 398, h: 398, name: 'PALM COURT', kind: 'plaza' });
addBuilding(1095, 495, 400, 416, 'AURELIA HOTEL', 'landmark', '#f2d3a1');
addBuilding(1700, 495, 400, 416, 'CINEMA LUX', 'landmark', '#db9d6b');
addBuilding(1095, 1695, 400, 416, 'COSTA MARKET', 'shop', '#efc48b');
addBuilding(1700, 1695, 400, 416, 'THE MARINER', 'landmark', '#dca174');

for (let bi = 0; bi < blocks.length; bi++) {
  const [x0, x1] = blocks[bi];
  for (let bj = 0; bj < blocks.length; bj++) {
    const [y0, y1] = blocks[bj];
    if (bi >= 4) continue; // coastal promenade is open space
    if (bi === 2 && bj === 2) continue; // civic plaza above
    if ((bi === 2 || bi === 3) && (bj === 1 || bj === 3)) continue; // landmark blocks
    const w = x1 - x0, h = y1 - y0;
    if (bi === 1 && bj === 1) {
      parks.push({ x: x0 + 25, y: y0 + 25, w: w - 50, h: h - 50, name: 'MERCADO GARDENS', kind: 'park' });
      continue;
    }
    if ((bi + bj) % 4 === 2 && w > 380 && h > 380) {
      const px = x0 + 30, py = y0 + 30, pw = w - 60, ph = h - 60;
      parks.push({ x: px, y: py, w: pw, h: ph, name: ['CITRUS PARK', 'FOUNTAIN GARDEN', 'SUNSET GREEN'][Math.floor(rand() * 3)], kind: 'park' });
      continue;
    }
    const inset = 23;
    const split = rand() > 0.55;
    if (split) {
      const gap = 18, half = (w - inset * 2 - gap) / 2;
      addBuilding(x0 + inset, y0 + inset, half, h - inset * 2, '', 'urban');
      addBuilding(x0 + inset + half + gap, y0 + inset, half, h - inset * 2, '', 'urban');
    } else {
      addBuilding(x0 + inset, y0 + inset, w - inset * 2, h - inset * 2, '', 'urban');
    }
  }
}

// Waterfront hotels, marina sheds and roof pools.
addBuilding(2900, 350, 65, 350, 'HOTEL AZURE', 'coastal', '#f1d29e');
addBuilding(2900, 800, 65, 370, 'MARINA CLUB', 'coastal', '#dfa874');
addBuilding(2900, 1235, 65, 330, 'SALT HOUSE', 'coastal', '#f0c78d');
addBuilding(2900, 1730, 65, 420, 'LIGHTHOUSE INN', 'coastal', '#edcf9a');
addBuilding(2900, 2290, 65, 400, 'FERRY HOUSE', 'coastal', '#d99b6b');
pools.push({ x: 1800, y: 550, w: 140, h: 54 }, { x: 2910, y: 870, w: 42, h: 90 }, { x: 2910, y: 1800, w: 42, h: 110 });

for (let i = 0; i < 130; i++) {
  const x = 75 + (i * 173) % 2800;
  const y = 90 + (i * 317) % 3000;
  if (roads.some(r => Math.abs(r - x) < 95 || Math.abs(r - y) < 95)) continue;
  palms.push({ x, y, size: 7 + rand() * 4 });
}

export { buildings };

export function district(x, y) {
  if (x >= SEA_X) return 'PORT AURELIA WATERFRONT';
  if (x >= 2200) return 'OLD HARBOR';
  if (x >= 1600 && x <= 1812 && y >= 1388 && y <= 1812) return 'PALM COURT';
  if (x < 1000) return 'MERCADO';
  if (x < 1600) return 'CIVIC HEIGHTS';
  return 'SUNSET QUARTER';
}

export function isBlocked(x, y, r = 12) {
  if (x - r < 0 || y - r < 0 || x + r > WORLD || y + r > WORLD) return true;
  if (x + r > SEA_X) return true;
  for (const b of buildings) {
    const nx = Math.max(b.x, Math.min(x, b.x + b.w));
    const ny = Math.max(b.y, Math.min(y, b.y + b.h));
    if ((x - nx) ** 2 + (y - ny) ** 2 < r * r) return true;
  }
  return false;
}

const rect = (ctx, x, y, w, h, fill) => { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); };
function text(ctx, str, x, y, size, color = '#fff8e9') {
  ctx.font = `700 ${size}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(93,64,42,.58)'; ctx.strokeText(str, x, y); ctx.fillStyle = color; ctx.fillText(str, x, y);
}
function palm(ctx, x, y, s) {
  ctx.fillStyle = '#93613d'; ctx.beginPath(); ctx.ellipse(x + 2, y + 3, s * .34, s * .9, .1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#38845c';
  for (let i = 0; i < 7; i++) {
    const a = i * Math.PI * 2 / 7;
    ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * s * .8, y - s + Math.sin(a) * s * .55, s * .8, s * .24, a, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#8fb45e'; ctx.beginPath(); ctx.arc(x, y - s, s * .22, 0, Math.PI * 2); ctx.fill();
}
function building(ctx, b) {
  const { x, y, w, h } = b;
  const dep = Math.max(5, Math.min(13, b.height * .35));
  ctx.fillStyle = 'rgba(72,57,44,.24)'; ctx.fillRect(x + 11, y + 13, w, h);
  ctx.fillStyle = '#a96f4e'; ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + dep, y - dep * .65); ctx.lineTo(x + w + dep, y + h - dep * .65); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c48c5f'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dep, y - dep * .65); ctx.lineTo(x + w + dep, y - dep * .65); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  rect(ctx, x, y, w, h, b.color);
  rect(ctx, x + 5, y + 5, Math.max(2, w - 10), 4, 'rgba(255,241,207,.55)');
  const cols = Math.min(9, Math.max(2, Math.floor(w / 30))), rows = Math.min(9, Math.max(2, Math.floor(h / 30)));
  for (let c = 0; c < cols; c++) for (let rr = 0; rr < rows; rr++) {
    const wx = x + 10 + c * (w - 20) / cols, wy = y + 13 + rr * (h - 23) / rows;
    rect(ctx, wx, wy, Math.max(4, Math.min(12, (w - 30) / cols * .38)), 7, (c + rr) % 3 ? '#75a6a3' : '#f5d99c');
  }
  rect(ctx, x + 8, y + 8, w - 16, 3, '#f8e1b2');
  if (b.kind === 'landmark' || b.kind === 'coastal') {
    ctx.fillStyle = '#fff0c9'; ctx.fillRect(x + 5, y + h - 22, w - 10, 15);
    text(ctx, b.name, x + w / 2, y + h - 14, Math.min(10, Math.max(7, w / 16)), '#89543c');
  } else if (b.name) text(ctx, b.name, x + w / 2, y + h / 2, 9, '#89543c');
  // Rooftop equipment and vents.
  rect(ctx, x + w * .15, y + h * .12, Math.max(9, w * .18), 12, '#b9b4a5');
  rect(ctx, x + w * .58, y + h * .18, Math.max(8, w * .12), 9, '#9eaa9e');
  if (b.kind === 'landmark') {
    rect(ctx, x + w * .39, y + h * .2, w * .23, h * .43, '#54a9a5');
    ctx.strokeStyle = '#f8ead0'; ctx.lineWidth = 3; ctx.strokeRect(x + w * .39, y + h * .2, w * .23, h * .43);
  }
}
function crosswalk(ctx, cx, cy, horizontal) {
  ctx.fillStyle = '#f5e7ca';
  for (let i = -5; i <= 5; i++) {
    if (horizontal) ctx.fillRect(cx + i * 12 - 4, cy - 67, 8, 32);
    else ctx.fillRect(cx - 67, cy + i * 12 - 4, 32, 8);
  }
}

export function drawCity(ctx, time = 0) {
  rect(ctx, 0, 0, WORLD, WORLD, '#d9c59a');
  // Land blocks and warm sidewalk apron.
  for (const [x0, x1] of blocks) for (const [y0, y1] of blocks) rect(ctx, x0, y0, x1 - x0, y1 - y0, '#cbb991');
  for (const [x0, x1] of blocks) for (const r of roads) rect(ctx, x0, r - 83, x1 - x0, 166, '#d5c29c');
  for (const [y0, y1] of blocks) for (const r of roads) rect(ctx, r - 83, y0, 166, y1 - y0, '#d5c29c');
  // Water and waterfront timber boardwalk.
  rect(ctx, SEA_X, -1800, 2400, WORLD + 3600, '#55a8a5');
  for (let yy = 0; yy < WORLD; yy += 20) rect(ctx, SEA_X + 5, yy, 25, 2, 'rgba(221,239,207,.22)');
  rect(ctx, SEA_X - 34, 0, 34, WORLD, '#bd9365');
  rect(ctx, SEA_X - 30, 0, 3, WORLD, '#e4c18b');
  for (let yy = 0; yy < WORLD; yy += 18) rect(ctx, SEA_X - 25, yy, 22, 2, 'rgba(103,71,49,.26)');
  // Road asphalt and double center lines.
  for (const r of roads) {
    rect(ctx, 0, r - 71, SEA_X, 142, '#716f67');
    rect(ctx, 0, r - 73, SEA_X, 2, '#f4dfae'); rect(ctx, 0, r + 71, SEA_X, 2, '#f4dfae');
    for (let x = 24; x < SEA_X; x += 48) if (!roads.some(c => Math.abs(c - x) < 100)) rect(ctx, x, r - 2, 25, 4, '#e8d49d');
    rect(ctx, r - 71, 0, 142, WORLD, '#716f67');
    rect(ctx, r - 73, 0, 2, WORLD, '#f4dfae'); rect(ctx, r + 71, 0, 2, WORLD, '#f4dfae');
    for (let y = 24; y < WORLD; y += 48) if (!roads.some(c => Math.abs(c - y) < 100)) rect(ctx, r - 2, y, 4, 25, '#e8d49d');
  }
  // Crosswalks and stop bars at each street junction.
  for (const x of roads) for (const y of roads) {
    crosswalk(ctx, x, y, true); crosswalk(ctx, x, y, false);
    rect(ctx, x - 68, y - 87, 136, 4, '#f4e8ca'); rect(ctx, x - 68, y + 83, 136, 4, '#f4e8ca');
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      const lx = x + sx * 91, ly = y + sy * 91;
      ctx.fillStyle = '#373d38'; ctx.fillRect(lx - 3, ly - 17, 6, 30);
      const green = (Math.floor(time / 7) + (sx === sy ? 1 : 0)) % 2 === 0;
      ctx.fillStyle = green ? '#6ed9a2' : '#614d3c'; ctx.beginPath(); ctx.arc(lx, ly - 14, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = green ? '#614039' : '#f06d50'; ctx.beginPath(); ctx.arc(lx, ly - 6, 3, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Landscaped courtyards, fountains, planters.
  for (const p of parks) {
    rect(ctx, p.x - 7, p.y - 7, p.w + 14, p.h + 14, '#ddc99d');
    rect(ctx, p.x, p.y, p.w, p.h, p.kind === 'plaza' ? '#d3b989' : '#83a66f');
    ctx.strokeStyle = '#f1dfb8'; ctx.lineWidth = 5; ctx.strokeRect(p.x + 7, p.y + 7, p.w - 14, p.h - 14);
    for (let i = 0; i < 10; i++) {
      const px = p.x + 22 + ((i * 73) % Math.max(30, p.w - 44));
      const py = p.y + 24 + ((i * 97) % Math.max(30, p.h - 48));
      palm(ctx, px, py, 12);
      ctx.fillStyle = '#e9d09d'; ctx.beginPath(); ctx.arc(px, py + 8, 2, 0, Math.PI * 2); ctx.fill();
    }
    if (p.kind === 'plaza') {
      ctx.fillStyle = '#4da6a4'; ctx.beginPath(); ctx.arc(p.x + p.w / 2, p.y + p.h / 2, 38, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#efe0b6'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(p.x + p.w / 2, p.y + p.h / 2, 44, 0, Math.PI * 2); ctx.stroke();
      text(ctx, p.name, p.x + p.w / 2, p.y + 74, 14);
    } else text(ctx, p.name, p.x + p.w / 2, p.y + 20, 10);
  }
  for (const b of buildings) building(ctx, b);
  for (const p of pools) { rect(ctx, p.x - 4, p.y - 4, p.w + 8, p.h + 8, '#f1ddbb'); rect(ctx, p.x, p.y, p.w, p.h, '#51b9b4'); rect(ctx, p.x + 5, p.y + 5, p.w * .26, 3, 'rgba(255,255,255,.55)'); }
  for (const p of palms) palm(ctx, p.x, p.y, p.size);
  // Coastal marina slips and a small lighthouse landmark.
  for (let y = 120; y < WORLD; y += 240) {
    rect(ctx, SEA_X + 17, y, 72, 5, '#c8a375');
    for (let j = 0; j < 3; j++) rect(ctx, SEA_X + 53 + j * 19, y - 27, 4, 34, '#d2ad7d');
    ctx.fillStyle = '#f5efe0'; ctx.beginPath(); ctx.moveTo(SEA_X + 70, y - 20); ctx.lineTo(SEA_X + 84, y + 3); ctx.lineTo(SEA_X + 56, y + 3); ctx.fill();
    rect(ctx, SEA_X + 68, y - 25, 5, 7, '#d4775c');
  }
  ctx.fillStyle = '#f4e7c6'; ctx.beginPath(); ctx.arc(2934, 1600, 25, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#cf7559'; ctx.beginPath(); ctx.moveTo(2934, 1554); ctx.lineTo(2956, 1590); ctx.lineTo(2912, 1590); ctx.fill();
  rect(ctx, 2922, 1590, 24, 30, '#f0d4a4');
  // District names along the arterials.
  text(ctx, 'MERCADO', 190, 378, 15); text(ctx, 'CIVIC HEIGHTS', 1200, 978, 15);
  text(ctx, 'PALM COURT', 1600, 1572, 17); text(ctx, 'SUNSET QUARTER', 2390, 1570, 15);
  text(ctx, 'PORT AURELIA', 2928, 300, 15); text(ctx, 'BOARDWALK', 2940, 2780, 11);
  // Subtle sun flare pools keep the paving alive without obscuring navigation.
  ctx.globalAlpha = .06 + .02 * Math.sin(time * .001);
  rect(ctx, 0, 0, WORLD, WORLD, '#ffe4aa'); ctx.globalAlpha = 1;
}
