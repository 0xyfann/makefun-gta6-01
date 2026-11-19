export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export function seeded(seed) {
  return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
}
export function label(ctx, text, x, y, color = '#fff', size = 12) {
  ctx.fillStyle = color; ctx.font = `700 ${size}px system-ui`; ctx.textAlign = 'center'; ctx.fillText(text, x, y);
}
export function circle(ctx, x, y, radius, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
}
export function moveBody(body, dx, dy, blocked, radius) {
  // Resolve X before Y so the body can slide when only one axis is blocked.
  const hitX = blocked(body.x + dx, body.y, radius);
  if (!hitX) body.x += dx;
  const hitY = blocked(body.x, body.y + dy, radius);
  if (!hitY) body.y += dy;
  return hitX || hitY;
}
