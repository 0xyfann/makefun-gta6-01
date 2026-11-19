const SIZE = 3200;
const ROADS = [400, 1000, 1600, 2200, 2800];

export function drawMinimap(state = {}) {
  const canvas = document.querySelector('#minimap');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  const sx = w / SIZE;
  const sy = h / SIZE;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#26352e';
  ctx.fillRect(0, 0, w, h);

  // The eastern shoreline cuts across the city's warehouse district.
  ctx.fillStyle = '#426c70';
  ctx.fillRect(0.93 * w, 0, 0.07 * w, h);
  ctx.fillStyle = 'rgba(195, 217, 186, .18)';
  for (let y = 12; y < h; y += 23) {
    ctx.fillRect(w * 0.94, y, w * 0.05, 1);
  }

  // Compact blocks sit between the mapped avenue corridors.
  ctx.fillStyle = '#596451';
  const intervals = [[25, 335], [470, 930], [1070, 1530], [1670, 2130], [2270, 2740]];
  const gaps = new Set(['2:2', '1:1', '4:0', '4:1', '4:2', '4:3', '4:4']);
  for (let row = 0; row < intervals.length; row++) {
    for (let col = 0; col < intervals.length; col++) {
      if (gaps.has(`${col}:${row}`)) continue;
      const [x0, x1] = intervals[col];
      const [y0, y1] = intervals[row];
      const insetX = col === 0 ? 6 : 8;
      const insetY = row === 0 ? 6 : 8;
      ctx.fillRect(x0 * sx + insetX, y0 * sy + insetY, (x1 - x0) * sx - insetX * 2, (y1 - y0) * sy - insetY * 2);
    }
  }

  ctx.strokeStyle = '#a8aa8e';
  ctx.lineWidth = Math.max(2, w * 0.014);
  for (const coord of ROADS) {
    const p = coord * sx;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, coord * sy);
    ctx.lineTo(w, coord * sy);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(232, 236, 211, .38)';
  ctx.lineWidth = 1;
  for (const coord of ROADS) {
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(coord * sx, 0);
    ctx.lineTo(coord * sx, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, coord * sy);
    ctx.lineTo(w, coord * sy);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  const point = (x, y) => ({ x: Number(x) * sx, y: Number(y) * sy });
  const target = state.mission?.target;
  if (target && Number.isFinite(Number(target.x)) && Number.isFinite(Number(target.y))) {
    const p = point(target.x, target.y);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    ctx.strokeStyle = '#d7fa62';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#d7fa62';
    ctx.fill();
  }

  for (const officer of state.police || []) {
    if (!Number.isFinite(Number(officer?.x)) || !Number.isFinite(Number(officer?.y))) continue;
    const p = point(officer.x, officer.y);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#f07860';
    ctx.fill();
    ctx.strokeStyle = 'rgba(20, 24, 20, .8)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  const player = state.player;
  if (Number.isFinite(Number(player?.x)) && Number.isFinite(Number(player?.y))) {
    const p = point(player.x, player.y);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((Number(player.heading ?? player.angle) || 0) + Math.PI / 2);
    ctx.fillStyle = '#d7fa62';
    ctx.strokeStyle = '#111710';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5.5, 5);
    ctx.lineTo(0, 2.5);
    ctx.lineTo(-5.5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = 'rgba(238, 236, 220, .9)';
  ctx.font = '500 10px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('N', w - 8, 14);
  ctx.strokeStyle = '#d7fa62';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(w - 12, 26);
  ctx.lineTo(w - 8, 19);
  ctx.lineTo(w - 4, 26);
  ctx.stroke();
}
