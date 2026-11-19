let root;
let nodes;

const moneyText = value => `$${Math.max(0, Number(value) || 0).toLocaleString('en-US')}`;
const timeText = seconds => {
  const total = 18 * 3600 + 20 * 60 + Math.max(0, Math.floor((Number(seconds) || 0) * 12));
  const hours = Math.floor(total / 3600) % 24;
  const minutes = Math.floor(total / 60) % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

function ensureHUD() {
  if (nodes) return;
  root = document.querySelector('#hud');
  if (!root) throw new Error('Missing #hud element');
  root.innerHTML = `
    <div class="hud-brand"><div class="brand-mark">S</div><div class="brand-lockup"><div class="brand-name">SUNDOWN</div><div class="brand-place">Port Aurelia</div></div></div>
    <div class="hud-status">
      <section class="status-panel"><div class="micro-label">Cash</div><div class="wallet-value" data-field="money">$0</div></section>
      <section class="status-panel"><div class="micro-label">Condition</div><div class="health-track"><div class="health-fill" data-field="health"></div></div><div class="wanted" data-field="wanted" aria-label="Wanted level"></div></section>
    </div>
    <div class="hud-meta"><span data-field="time">18:40</span><span class="meta-separator">/</span><span data-field="district">Old Port</span></div>
    <div class="hud-map-wrap"><canvas id="minimap" width="320" height="320" aria-label="City minimap"></canvas></div>
    <div class="hud-lower">
      <div class="toast-panel" data-field="toast"></div>
      <div class="prompt-panel" data-field="prompt"></div>
      <section class="mission-panel"><div class="mission-kicker"><span>Current assignment</span><span data-field="stage"></span></div><h2 class="mission-title" data-field="title">No assignment</h2><div class="mission-objective" data-field="objective">Awaiting instructions.</div><div class="mission-reward" data-field="reward"></div></section>
    </div>
    <div class="speed-readout" data-field="speed"><span>0</span><small>KM/H</small></div>`;
  nodes = Object.fromEntries([...root.querySelectorAll('[data-field]')].map(el => [el.dataset.field, el]));
}

export function drawHUD(state = {}) {
  ensureHUD();
  const mission = state.mission || {};
  const car = state.player?.car;
  const health = Math.min(100, Math.max(0, Number(state.player?.health) || 0));
  nodes.money.textContent = moneyText(state.player?.money);
  nodes.health.style.width = `${health}%`;
  nodes.health.style.background = health < 30 ? '#f06f52' : '';
  nodes.wanted.textContent = '★'.repeat(Math.min(5, Math.max(0, Math.floor(Number(state.wanted) || 0)))) || '·';
  nodes.wanted.setAttribute('aria-label', `Wanted level ${Math.max(0, Number(state.wanted) || 0)} of 5`);
  nodes.time.textContent = timeText(state.time);
  nodes.district.textContent = state.district || state.scene || 'Port Aurelia';
  nodes.title.textContent = mission.title || 'No assignment';
  nodes.objective.textContent = mission.objective || 'Awaiting instructions.';
  nodes.reward.textContent = mission.reward == null ? '' : `PAYOUT  ${moneyText(mission.reward)}`;
  nodes.stage.textContent = `${(mission.index ?? 0) + 1} / 5`;
  nodes.prompt.textContent = state.prompt || '';
  nodes.prompt.style.display = state.prompt ? 'block' : 'none';
  nodes.toast.textContent = state.toast || '';
  nodes.toast.style.display = state.toast ? 'block' : 'none';
  nodes.speed.style.display = car ? 'block' : 'none';
  nodes.speed.firstElementChild.textContent = `${Math.round(Math.abs(Number(car?.speed) || 0))}`;
  root.classList.toggle('is-paused', Boolean(state.paused));
}

export function showMenu(mode, onStart, onResume, onSave, onLoad) {
  const menu = document.querySelector('#menu');
  if (!menu) throw new Error('Missing #menu element');
  if (mode !== 'title' && mode !== 'pause') {
    menu.className = '';
    menu.replaceChildren();
    return;
  }
  const titleMode = mode === 'title';
  menu.className = `is-open ${titleMode ? 'menu-title-mode' : 'menu-pause'}`;
  const title = titleMode ? 'SUNDOWN' : 'PAUSED';
  const subtitle = titleMode ? '<span>Port Aurelia</span>' : '<span>Port Aurelia, after dark</span>';
  const description = titleMode
    ? 'Harbor city, last light. Mara Venn takes a job from Inez to expose the syndicate that owns the waterfront, one delivery and one dirty ledger at a time.'
    : 'The waterfront can wait. Your shift is still yours.';
  const primaryLabel = titleMode ? 'New shift' : 'Resume shift';
  menu.innerHTML = `<section class="menu-sheet" role="dialog" aria-modal="true" aria-label="${title}">
    <div class="menu-overline">An original city crime story &nbsp; / &nbsp; GOLDEN HOUR</div>
    <h1 class="menu-title">${title}${subtitle}</h1><div class="menu-rule"></div>
    <p class="menu-copy">${description}</p>
    <div class="menu-actions">
      <button class="menu-button" data-action="primary">${primaryLabel}</button>
      ${titleMode ? '<button class="menu-button secondary" data-action="load">Continue saved</button>' : '<button class="menu-button secondary" data-action="save">Save shift</button><button class="menu-button secondary" data-action="title">Quit to title</button>'}
    </div>
    ${titleMode ? '<div class="menu-controls"><span><b>WASD / Arrows</b> Move</span><span><b>E</b> Enter / exit car</span><span><b>Shift</b> Sprint / handbrake</span><span><b>Mouse / Click</b> Aim / fire</span><span><b>F</b> Interact</span><span><b>Esc</b> Pause &nbsp; <b>M</b> Mute</span></div>' : ''}
  </section>`;
  menu.querySelector('[data-action="primary"]')?.addEventListener('click', () => titleMode ? onStart?.() : onResume?.());
  menu.querySelector('[data-action="load"]')?.addEventListener('click', () => onLoad?.());
  menu.querySelector('[data-action="save"]')?.addEventListener('click', () => onSave?.());
  menu.querySelector('[data-action="title"]')?.addEventListener('click', () => showMenu('title', onStart, onResume, onSave, onLoad));
}
