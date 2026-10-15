/* EAI OS — "the marketing site is an operating system".

   The page boots into a fictional desktop OS. The maker's BUILDER CHAT lives
   on the left of the EAI Builder window, in EAI's own neutral styling:
   "Build a campaign email app for Nike" drops four step-pads into place
   (always four). "Publish for…" spawns a NEW window per client — the same
   app, fully branded, with that client's own IN-APP ASSISTANT on the right,
   used by a tiny end-user persona ("Maya · Nike marketing"). Windows cascade,
   brand-coloured patch cables run from the builder's OUT jack to every
   client, and a builder edit ("add an approval step") ripples down the
   cables into every open client window at once. Build once, sell to many —
   literally many windows.

   The rest of the pitch is delivered by the OS: notifications, sticky notes,
   a Read me, the Notes app, a revenue Calculator with knobs, a Phone with a
   QR, and a Trash full of things you won't need. It autoplays once (boot,
   build, publish to three clients, one edit); any click or key hands over.
   On phones it becomes a home screen where publishing installs client apps.

   ?fast     skip animation (also used for prefers-reduced-motion)
   ?noboot   skip the boot sequence
   ?manual   no autoplay */

import { BRANDS, curated, lookup, esc, assistantReply } from './brands.js';
import { ICONS, EAI_MARK, folderIcon, clientTile } from './icons.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
const params = new URLSearchParams(location.search);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FAST = REDUCED || params.has('fast');
const mq = matchMedia('(max-width: 760px)');
let MOBILE = mq.matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const wait = (ms) => (FAST ? Promise.resolve() : sleep(ms));
const titleCase = (s) => s.trim().replace(/\s+/g, ' ').replace(/(^|\s)\S/g, (c) => c.toUpperCase());
class Cancelled extends Error {}

const os = $('#os');
const desk = $('#desk');
const winsEl = $('#wins');
const DOCK_H = 92;
const STEPS = [['Brief', 'Form'], ['Assets', 'Data source'], ['Compose', 'AI writer'], ['Review', 'Checks']];
const APPROVER = { nike: ['Jordan Lee', 'JL'], apple: ['Chris Park', 'CP'], commbank: ['Dana Wills', 'DW'] };

const S = {
  auto: false, run: { cancelled: true },
  built: false, building: false, brand0: null,
  approval: false, warmer: false,
  clients: [],
  z: 20, focused: null,
  queue: Promise.resolve(),
  phoneClient: null,
};

/* ------------------------------------------------------------------ */
/* Sound (WebAudio, off by default)                                    */
/* ------------------------------------------------------------------ */
const SFX = {
  on: false, ac: null,
  ensure() {
    if (!this.ac) this.ac = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ac.state === 'suspended') this.ac.resume();
  },
  tone(f, d = 0.08, type = 'sine', v = 0.05, at = 0) {
    if (!this.on) return;
    this.ensure();
    const t = this.ac.currentTime + at;
    const o = this.ac.createOscillator(), g = this.ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(this.ac.destination);
    o.start(t);
    o.stop(t + d + 0.03);
  },
  click() { this.tone(1500, 0.03, 'square', 0.018); },
  pop() { this.tone(520, 0.09, 'triangle', 0.06); this.tone(780, 0.12, 'triangle', 0.05, 0.05); },
  drop(i) { this.tone([262, 330, 392, 523][i % 4], 0.18, 'triangle', 0.07); },
  chime() { this.tone(880, 0.25, 'sine', 0.035); this.tone(1320, 0.35, 'sine', 0.025, 0.09); },
  close() { this.tone(420, 0.08, 'triangle', 0.04); this.tone(280, 0.1, 'triangle', 0.04, 0.05); },
  ripple() { [0, 1, 2, 3, 4].forEach((i) => this.tone(330 * (1 + i * 0.25), 0.22, 'sine', 0.03, i * 0.07)); },
  nope() { this.tone(180, 0.14, 'square', 0.03); this.tone(150, 0.2, 'square', 0.03, 0.12); },
  boot() { [0, 1, 2, 3].forEach((i) => this.tone([392, 523, 659, 784][i], 0.3, 'triangle', 0.04, i * 0.11)); },
};
$('#mbSound').addEventListener('click', () => {
  SFX.on = !SFX.on;
  $('#mbSound').setAttribute('aria-pressed', SFX.on);
  $('#mbSound').title = `Sound effects (${SFX.on ? 'on' : 'off'})`;
  if (SFX.on) { SFX.ensure(); SFX.chime(); }
});

/* ------------------------------------------------------------------ */
/* Menubar clock, icons                                                */
/* ------------------------------------------------------------------ */
let lastMin = -1;
function tickClock() {
  const d = new Date();
  if (d.getMinutes() === lastMin) return;
  lastMin = d.getMinutes();
  const day = d.toLocaleDateString('en-AU', { weekday: 'short' }).toUpperCase().replace('.', '');
  const mon = d.toLocaleDateString('en-AU', { month: 'short' }).toUpperCase().replace('.', '');
  const hh = String(d.getHours()).padStart(2, '0'), mm = String(d.getMinutes()).padStart(2, '0');
  $('#mbClock').innerHTML = `<span class="ck-d">${day} ${d.getDate()} ${mon}</span><span class="ck-t">${hh}<i>:</i>${mm}</span>`;
}
tickClock();
setInterval(tickClock, 1000);
$$('[data-icon]').forEach((e) => { e.innerHTML = ICONS[e.dataset.icon]; });
$$('[data-mark]').forEach((e) => { e.innerHTML = EAI_MARK; });

/* ------------------------------------------------------------------ */
/* Window manager                                                      */
/* ------------------------------------------------------------------ */
const WINS = [];
const CTL = {
  min: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6h7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  max: '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2.5" y="2.5" width="7" height="7" rx="1.3" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
  close: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="m3 3 6 6m0-6-6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
};
const deskSize = () => ({ W: desk.clientWidth, H: desk.clientHeight });

function geomFor(kind, i = 0) {
  const { W, H } = deskSize();
  const avail = H - DOCK_H;
  const center = (w, h, dy = 0) => {
    w = Math.min(w, W - 20); h = Math.min(h, avail - 16);
    return { x: Math.round((W - w) / 2), y: Math.round(clamp((avail - h) / 2 + dy, 10, 9999)), w, h };
  };
  switch (kind) {
    case 'builder': {
      const w = clamp(Math.round(W * 0.45), 540, 680);
      const h = clamp(avail - 40, 400, 520);
      return { x: 22, y: 16, w, h };
    }
    case 'client': {
      const w = clamp(Math.round(W * 0.39), 460, 580);
      const h = clamp(Math.round(avail * 0.6), 360, 450);
      const k = i % 3, lap = Math.floor(i / 3) % 4;
      return { x: Math.max(10, W - 22 - w - (2 - k) * 64 - lap * 28), y: 20 + k * 54 + lap * 28, w, h };
    }
    case 'phone': { const h = clamp(avail - 24, 460, 650); return { x: W - 360, y: 12, w: 316, h }; }
    case 'calc': return { x: Math.round(W * 0.47), y: 40, w: 312, h: Math.min(456, avail - 30) };
    case 'clients': return center(600, 400, -40);
    case 'notes': return center(600, 400, -20);
    case 'readme': return center(580, 600, 0);
    case 'trash': return center(520, 380, 10);
    case 'about': return center(380, 340);
    case 'keys': return center(420, 350);
    case 'ask': return { x: W - 22 - 410, y: Math.max(20, H - 226 - 14), w: 410, h: 226 };
    default: return center(480, 360);
  }
}

function applyGeom(w) {
  const s = w.el.style;
  s.left = w.x + 'px'; s.top = w.y + 'px'; s.width = w.w + 'px'; s.height = w.h + 'px';
}
function setTitle(w, t) {
  $('.win-title', w.el).textContent = t;
  w.el.setAttribute('aria-label', t);
  w.title = t;
  if (w.chip) $('.dk-tip', w.chip).textContent = t;
}

function openWin(o) {
  const n = el('section', 'win ' + (o.cls || ''));
  n.setAttribute('role', 'dialog');
  n.innerHTML = `<header class="win-bar"><span class="win-ico">${o.icon || ''}</span><span class="win-title"></span><span class="win-tag" hidden></span><span class="win-grille" aria-hidden="true"></span>` +
    `<span class="win-ctl"><button type="button" class="wc wc-min" data-wc="min" aria-label="Minimise">${CTL.min}<span class="wc-home">Home</span></button><button type="button" class="wc wc-max" data-wc="max" aria-label="Zoom">${CTL.max}</button><button type="button" class="wc wc-x" data-wc="close" aria-label="Close">${CTL.close}</button></span></header>` +
    `<div class="win-body"></div>${o.jack ? `<span class="jack jack-${o.jack}" aria-hidden="true"><i></i></span>` : ''}<span class="win-rsz" aria-hidden="true"></span>`;
  const w = { id: o.id, kind: o.kind || o.id, el: n, bar: $('.win-bar', n), body: $('.win-body', n), minW: o.minW || 280, minH: o.minH || 200, min: false, max: false, jack: o.jack, onClose: o.onClose, x: 0, y: 0, w: 400, h: 300 };
  Object.assign(w, o.geom);
  applyGeom(w);
  setTitle(w, o.title);
  winsEl.appendChild(n);
  WINS.push(w);
  if (o.content) o.content(w);
  bindWin(w);
  if (o.background) {
    w.min = true;
    n.hidden = true;
  } else {
    focusWin(w);
    spawnAnim(w, o.from);
    SFX.pop();
  }
  syncDock();
  drawCables();
  return w;
}

function spawnAnim(w, from) {
  if (FAST) return;
  const r = w.el.getBoundingClientRect();
  if (from && from.width) {
    const dx = from.left - r.left, dy = from.top - r.top;
    w.el.animate([
      { transform: `translate(${dx}px,${dy}px) scale(${Math.max(0.04, from.width / r.width)},${Math.max(0.04, from.height / r.height)})`, opacity: 0.2, transformOrigin: '0 0' },
      { transform: 'none', opacity: 1, transformOrigin: '0 0' },
    ], { duration: 560, easing: 'cubic-bezier(.2,.85,.25,1.06)' });
  } else {
    w.el.animate([{ transform: 'translateY(14px) scale(.96)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }
}

function bindWin(w) {
  const { el: n, bar } = w;
  n.addEventListener('pointerdown', () => focusWin(w), true);
  bar.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('.wc') || MOBILE || w.max) return;
    e.preventDefault();
    const sx = e.clientX, sy = e.clientY, ox = w.x, oy = w.y;
    bar.setPointerCapture(e.pointerId);
    n.classList.add('dragging');
    const move = (ev) => {
      const { W, H } = deskSize();
      w.x = clamp(ox + ev.clientX - sx, -w.w + 90, W - 90);
      w.y = clamp(oy + ev.clientY - sy, 0, H - 44);
      applyGeom(w);
      drawCables();
    };
    const up = () => {
      bar.removeEventListener('pointermove', move);
      bar.removeEventListener('pointerup', up);
      bar.removeEventListener('pointercancel', up);
      n.classList.remove('dragging');
    };
    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', up);
    bar.addEventListener('pointercancel', up);
  });
  bar.addEventListener('dblclick', (e) => { if (!e.target.closest('.wc') && !MOBILE) toggleMax(w); });
  bar.addEventListener('contextmenu', (e) => { e.preventDefault(); showCtx(e.clientX, e.clientY, winMenu(w)); });
  const rsz = $('.win-rsz', n);
  rsz.addEventListener('pointerdown', (e) => {
    if (MOBILE) return;
    e.preventDefault();
    e.stopPropagation();
    const sx = e.clientX, sy = e.clientY, ow = w.w, oh = w.h;
    rsz.setPointerCapture(e.pointerId);
    n.classList.add('dragging');
    const move = (ev) => {
      w.w = Math.max(w.minW, ow + ev.clientX - sx);
      w.h = Math.max(w.minH, oh + ev.clientY - sy);
      w.max = false;
      applyGeom(w);
      drawCables();
    };
    const up = () => { rsz.removeEventListener('pointermove', move); rsz.removeEventListener('pointerup', up); n.classList.remove('dragging'); };
    rsz.addEventListener('pointermove', move);
    rsz.addEventListener('pointerup', up);
  });
  $$('.wc', n).forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    const a = b.dataset.wc;
    if (a === 'min') minimiseWin(w);
    else if (a === 'max') toggleMax(w);
    else closeWin(w);
  }));
}

function focusWin(w) {
  if (!w || w.min) return;
  if (S.focused !== w) {
    w.el.style.zIndex = ++S.z;
    S.focused = w;
    WINS.forEach((x) => x.el.classList.toggle('focused', x === w));
  }
  if (w.kind === 'client' && w.client) S.phoneClient = w.client;
}
function focusTop() {
  const vis = WINS.filter((w) => !w.min).sort((a, b) => +b.el.style.zIndex - +a.el.style.zIndex);
  S.focused = null;
  if (vis[0]) focusWin(vis[0]);
  else WINS.forEach((x) => x.el.classList.remove('focused'));
}
function closeWin(w) {
  if (w.closing) return;
  w.closing = true;
  SFX.close();
  const done = () => {
    w.el.remove();
    WINS.splice(WINS.indexOf(w), 1);
    if (w.chip) { w.chip.remove(); w.chip = null; }
    if (S.focused === w) S.focused = null;
    if (w.onClose) w.onClose();
    syncDock();
    drawCables();
    focusTop();
  };
  if (FAST || w.min) done();
  else w.el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.95)' }], { duration: 170, easing: 'ease-in' }).onfinish = done;
}
function minimiseWin(w, quiet) {
  if (w.min) return;
  w.min = true;
  if (S.focused === w) S.focused = null;
  drawCables();
  if (MOBILE) {
    const fin = () => { w.el.hidden = true; };
    if (FAST || quiet) fin();
    else w.el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.9)' }], { duration: 220, easing: 'ease-in' }).onfinish = fin;
    focusTop();
    return;
  }
  const chip = trayChip(w);
  const r = w.el.getBoundingClientRect(), t = chip.getBoundingClientRect();
  const fin = () => { w.el.hidden = true; };
  if (FAST || quiet) fin();
  else {
    w.el.animate([
      { transform: 'none', opacity: 1, transformOrigin: '0 0' },
      { transform: `translate(${t.left - r.left}px,${t.top - r.top}px) scale(${t.width / r.width},${t.height / r.height})`, opacity: 0.25, transformOrigin: '0 0' },
    ], { duration: 380, easing: 'cubic-bezier(.55,0,.8,.2)' }).onfinish = fin;
  }
  SFX.click();
  focusTop();
}
function restoreWin(w) {
  if (!w.min) { focusWin(w); return; }
  const from = w.chip ? w.chip.getBoundingClientRect() : null;
  if (w.chip) { w.chip.remove(); w.chip = null; }
  w.min = false;
  w.el.hidden = false;
  focusWin(w);
  spawnAnim(w, from);
  drawCables();
}
function trayChip(w) {
  const c = el('button', 'dk tray-chip');
  c.type = 'button';
  const br = w.client && w.client.brand;
  c.innerHTML = `<span class="dk-img">${br && br.head ? clientTile(br) : ($('.win-ico', w.el).innerHTML)}</span><span class="dk-tip"></span>`;
  $('.dk-tip', c).textContent = w.title;
  c.setAttribute('aria-label', 'Restore ' + w.title);
  c.addEventListener('click', () => restoreWin(w));
  $('#tray').appendChild(c);
  w.chip = c;
  if (!FAST) c.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'cubic-bezier(.3,1.4,.5,1)' });
  return c;
}
function tween(w, g, ms = 380) {
  const from = { x: w.x, y: w.y, w: w.w, h: w.h };
  if (FAST) { Object.assign(w, g); applyGeom(w); drawCables(); return; }
  const t0 = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t0) / ms), e = 1 - (1 - k) ** 3;
    for (const p of ['x', 'y', 'w', 'h']) w[p] = from[p] + (g[p] - from[p]) * e;
    applyGeom(w);
    drawCables();
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function toggleMax(w) {
  if (MOBILE) return;
  if (w.max) { w.max = false; tween(w, w.prev); return; }
  const { W, H } = deskSize();
  w.prev = { x: w.x, y: w.y, w: w.w, h: w.h };
  w.max = true;
  focusWin(w);
  tween(w, { x: 8, y: 8, w: W - 16, h: H - DOCK_H - 12 });
}
function visibleWins() {
  const rank = (w) => (w.kind === 'builder' ? 0 : w.kind === 'client' ? 1 + w.client.idx : 100 + +w.el.style.zIndex);
  return WINS.filter((w) => !w.min).sort((a, b) => rank(a) - rank(b));
}
function tile() {
  if (MOBILE) return;
  const vis = visibleWins();
  if (!vis.length) return;
  const { W, H } = deskSize();
  const n = vis.length, cols = n <= 1 ? 1 : n <= 4 ? 2 : 3, rows = Math.ceil(n / cols);
  const gap = 12, top = 10, left = 10, bw = W - 20, bh = H - DOCK_H - 22;
  const cw = (bw - gap * (cols - 1)) / cols, ch = (bh - gap * (rows - 1)) / rows;
  vis.forEach((w, i) => {
    w.max = false;
    tween(w, { x: left + (i % cols) * (cw + gap), y: top + Math.floor(i / cols) * (ch + gap), w: cw, h: ch }, 460);
  });
  notifyOnce('tile', { icon: 'about', title: 'Tiled', body: 'One builder, every client, side by side. <kbd>⌥C</kbd> to cascade again.' });
}
function cascade() {
  if (MOBILE) return;
  let other = 0;
  visibleWins().forEach((w) => {
    w.max = false;
    if (w.kind === 'builder') tween(w, geomFor('builder'), 460);
    else if (w.kind === 'client') tween(w, geomFor('client', w.client.idx), 460);
    else { const g = geomFor(w.kind); tween(w, { ...g, x: g.x + other * 26, y: g.y + other * 26 }, 460); other++; }
  });
}
function winMenu(w) {
  const items = [
    { label: w.min ? 'Restore' : 'Minimise', kbd: '⌥M', fn: () => (w.min ? restoreWin(w) : minimiseWin(w)) },
    { label: w.max ? 'Un-zoom' : 'Zoom', fn: () => toggleMax(w) },
  ];
  if (w.kind === 'client') items.push('-', { label: 'Share to phone…', fn: () => { S.phoneClient = w.client; openApp('phone'); } }, { label: 'Ask the builder to change it…', fn: () => { openApp('builder'); BLD.input && BLD.input.focus(); } });
  items.push('-', { label: 'Tile all windows', kbd: '⌥T', fn: tile }, { label: 'Close', kbd: '⌥W', fn: () => closeWin(w) });
  return items;
}

/* ------------------------------------------------------------------ */
/* Dock + desktop icons                                                */
/* ------------------------------------------------------------------ */
function syncDock() {
  $$('.dock .dk[data-open]').forEach((b) => b.classList.toggle('on', WINS.some((w) => w.kind === b.dataset.open)));
  const n = S.clients.length, badge = $('#clientBadge');
  badge.hidden = !n;
  badge.textContent = n;
}
function openApp(kind, opts = {}) {
  const ex = WINS.find((w) => w.kind === kind);
  if (ex) {
    if (ex.min) restoreWin(ex);
    else { focusWin(ex); if (!FAST) ex.el.animate([{ transform: 'none' }, { transform: 'translateY(-6px)' }, { transform: 'none' }], { duration: 260 }); }
    if (APPS[kind] && APPS[kind].refresh) APPS[kind].refresh(ex, opts);
    return ex;
  }
  return APPS[kind](opts);
}
$$('.dock .dk[data-open]').forEach((b) => b.addEventListener('click', () => {
  SFX.click();
  if (!FAST) b.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-14px)' }, { transform: 'translateY(0)' }], { duration: 420, easing: 'cubic-bezier(.3,1.5,.5,1)' });
  openApp(b.dataset.open, { from: $('.dk-img', b).getBoundingClientRect() });
}));

let hinted = false;
$('#icons').addEventListener('click', (e) => {
  const b = e.target.closest('.dicon');
  if (!b) return;
  $$('.dicon.sel').forEach((x) => x.classList.remove('sel'));
  b.classList.add('sel');
  if (MOBILE || e.detail === 0) openIcon(b);
  else if (!hinted) { hinted = true; notify({ icon: 'about', title: 'Double-click to open', body: 'It’s an OS. Old habits. (Or press Enter.)', ttl: 3200 }); }
});
$('#icons').addEventListener('dblclick', (e) => { const b = e.target.closest('.dicon'); if (b && !MOBILE) openIcon(b); });
$('#icons').addEventListener('contextmenu', (e) => {
  const b = e.target.closest('.dicon');
  if (!b) return;
  e.preventDefault();
  e.stopPropagation();
  const items = [{ label: 'Open', fn: () => openIcon(b) }];
  if (b.dataset.open === 'trash') items.push({ label: 'Empty Trash', fn: emptyTrash });
  items.push({ label: 'Get info', fn: () => notify({ icon: b.dataset.open || 'about', title: $('.dicon-l', b).textContent, body: INFO[b.dataset.open] || 'Part of EAI OS.' }) });
  showCtx(e.clientX, e.clientY, items);
});
const INFO = {
  readme: 'Plain text. The whole pitch in thirty seconds.',
  clients: 'Every client you’ve sold the app to. One build inside.',
  notes: 'Kind: rule. Size: exactly four steps.',
  trash: 'Rebuilds, five-step drafts and other things you won’t need.',
};
function openIcon(b) {
  const from = $('.dicon-img', b).getBoundingClientRect();
  if (b.dataset.client != null) { const c = S.clients[+b.dataset.client]; if (c) showClient(c, from); return; }
  openApp(b.dataset.open, { from });
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */
const toasts = $('#toasts');
const onceSeen = new Set();
function notifyOnce(key, o) { if (onceSeen.has(key)) return; onceSeen.add(key); notify(o); }
function notify({ icon = 'about', app = 'EAI OS', title, body = '', action, ttl = 5600, brand }) {
  const t = el('div', 'toast');
  t.setAttribute('role', 'status');
  t.innerHTML = `<span class="t-ico">${brand ? clientTile(brand) : ICONS[icon] || ICONS.about}</span><div class="t-tx"><small>${esc(app)} · now</small><b>${title}</b>${body ? `<p>${body}</p>` : ''}</div>` +
    `${action ? `<button type="button" class="t-act">${esc(action.label)}</button>` : ''}<button type="button" class="t-x" aria-label="Dismiss">${CTL.close}</button>`;
  toasts.prepend(t);
  while (toasts.children.length > 2) toasts.lastElementChild.remove();
  let timer;
  const kill = () => {
    clearTimeout(timer);
    if (!t.isConnected) return;
    if (FAST) { t.remove(); return; }
    t.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(24px)' }], { duration: 220, easing: 'ease-in' }).onfinish = () => t.remove();
  };
  const arm = () => { timer = setTimeout(kill, ttl); };
  t.addEventListener('mouseenter', () => clearTimeout(timer));
  t.addEventListener('mouseleave', arm);
  $('.t-x', t).addEventListener('click', kill);
  if (action) $('.t-act', t).addEventListener('click', () => { kill(); action.fn(); });
  arm();
  if (!FAST) t.animate([{ opacity: 0, transform: 'translateX(30px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 340, easing: 'cubic-bezier(.2,.9,.3,1.1)' });
  SFX.chime();
  return t;
}

/* ------------------------------------------------------------------ */
/* Context menus + menubar                                             */
/* ------------------------------------------------------------------ */
const ctx = $('#ctx');
let ctxOwner = null;
function showCtx(x, y, items, owner) {
  ctx.innerHTML = items.map((it, i) => (it === '-' ? '<hr />' :
    `<button type="button" role="menuitem" data-i="${i}"${it.disabled ? ' disabled' : ''}><span class="ck">${it.check ? '✓' : ''}</span><span class="cl">${esc(it.label)}</span>${it.kbd ? `<kbd>${it.kbd}</kbd>` : ''}</button>`)).join('');
  ctx.hidden = false;
  const r = ctx.getBoundingClientRect();
  ctx.style.left = clamp(x, 6, innerWidth - r.width - 6) + 'px';
  ctx.style.top = clamp(y, 6, innerHeight - r.height - 6) + 'px';
  ctx.onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const it = items[+b.dataset.i];
    hideCtx();
    SFX.click();
    if (it && it.fn) it.fn();
  };
  if (ctxOwner) ctxOwner.classList.remove('open');
  ctxOwner = owner || null;
  if (owner) owner.classList.add('open');
  const first = $('button:not([disabled])', ctx);
  if (first && owner) first.focus({ preventScroll: true });
}
function hideCtx() {
  ctx.hidden = true;
  if (ctxOwner) ctxOwner.classList.remove('open');
  ctxOwner = null;
}
document.addEventListener('pointerdown', (e) => {
  if (!ctx.hidden && !ctx.contains(e.target) && !e.target.closest('[data-menu]')) hideCtx();
});
ctx.addEventListener('keydown', (e) => {
  const bs = $$('button:not([disabled])', ctx);
  const i = bs.indexOf(document.activeElement);
  if (e.key === 'ArrowDown') { e.preventDefault(); bs[(i + 1) % bs.length].focus(); }
  if (e.key === 'ArrowUp') { e.preventDefault(); bs[(i - 1 + bs.length) % bs.length].focus(); }
});

const MENUS = {
  eai: () => [
    { label: 'About EAI OS', fn: () => openApp('about') },
    { label: 'Replay the demo', fn: replay },
    { label: 'Restart…', fn: restart },
    '-',
    { label: 'Sound effects', check: SFX.on, fn: () => $('#mbSound').click() },
    { label: 'Change wallpaper', fn: cycleWall },
  ],
  file: () => [
    { label: 'New client window…', kbd: '⌘K', fn: () => openSpot() },
    ...['nike', 'apple', 'commbank'].map((k) => ({ label: `Publish for ${BRANDS[k].name}`, disabled: S.clients.some((c) => c.brand === BRANDS[k]), fn: () => enqueue(() => publish(BRANDS[k].name)) })),
    '-',
    { label: 'Share to phone…', fn: () => openApp('phone') },
    { label: 'Close window', kbd: '⌥W', disabled: !S.focused, fn: () => S.focused && closeWin(S.focused) },
  ],
  window: () => [
    { label: 'Tile windows', kbd: '⌥T', fn: tile },
    { label: 'Cascade windows', kbd: '⌥C', fn: cascade },
    { label: 'Minimise all', fn: () => WINS.forEach((w) => minimiseWin(w)) },
    { label: 'Bring all to front', fn: () => WINS.filter((w) => w.min).forEach(restoreWin) },
    ...(WINS.length ? ['-'] : []),
    ...WINS.map((w) => ({ label: w.title, check: w === S.focused, fn: () => (w.min ? restoreWin(w) : focusWin(w)) })),
  ],
  help: () => [
    { label: 'Read me', fn: () => openApp('readme') },
    { label: 'The four-step rule', fn: () => openApp('notes') },
    { label: 'Keyboard shortcuts', kbd: '?', fn: () => openApp('keys') },
    '-',
    { label: 'Skip to classic page', fn: () => $('#classic').scrollIntoView({ behavior: FAST ? 'auto' : 'smooth' }) },
  ],
};
$$('[data-menu]').forEach((b) => {
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    if (ctxOwner === b) { hideCtx(); return; }
    const r = b.getBoundingClientRect();
    showCtx(r.left, r.bottom + 4, MENUS[b.dataset.menu](), b);
  });
  b.addEventListener('mouseenter', () => {
    if (ctxOwner && ctxOwner !== b && ctxOwner.dataset.menu) { const r = b.getBoundingClientRect(); showCtx(r.left, r.bottom + 4, MENUS[b.dataset.menu](), b); }
  });
});

desk.addEventListener('contextmenu', (e) => {
  if (e.target.closest('.win, .dock, input, textarea, [contenteditable="true"], .toast')) return;
  e.preventDefault();
  showCtx(e.clientX, e.clientY, [
    { label: 'New client window…', kbd: '⌘K', fn: () => openSpot() },
    { label: 'Tile windows', kbd: '⌥T', fn: tile },
    { label: 'Cascade windows', kbd: '⌥C', fn: cascade },
    '-',
    { label: 'Add sticky note', fn: () => addSticky(e.clientX, e.clientY) },
    { label: 'Change wallpaper', fn: cycleWall },
    '-',
    { label: 'Read me', fn: () => openApp('readme') },
    { label: 'Skip to classic page', fn: () => $('#classic').scrollIntoView({ behavior: FAST ? 'auto' : 'smooth' }) },
  ]);
});

const WALLS = ['putty', 'graphite', 'signal'];
function cycleWall() {
  const i = (WALLS.indexOf(os.dataset.wall) + 1) % WALLS.length;
  os.dataset.wall = WALLS[i];
}

/* ------------------------------------------------------------------ */
/* Stickies + rubber-band selection                                    */
/* ------------------------------------------------------------------ */
function bindSticky(s) {
  s.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || MOBILE) return;
    const sx = e.clientX, sy = e.clientY;
    let drag = false, ox = 0, oy = 0;
    const move = (ev) => {
      if (!drag) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 5) return;
        drag = true;
        const r = s.getBoundingClientRect(), d = desk.getBoundingClientRect();
        ox = r.left - d.left; oy = r.top - d.top;
        if (s.parentNode !== desk) { desk.insertBefore(s, $('#cables')); }
        s.style.right = 'auto'; s.style.bottom = 'auto';
        s.style.left = ox + 'px'; s.style.top = oy + 'px';
        s.classList.add('lift');
        s.setPointerCapture(ev.pointerId);
        getSelection().removeAllRanges();
        document.activeElement && document.activeElement.blur();
      }
      s.style.left = ox + ev.clientX - sx + 'px';
      s.style.top = oy + ev.clientY - sy + 'px';
    };
    const up = () => { s.classList.remove('lift'); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  });
}
$$('[data-sticky]').forEach(bindSticky);
function addSticky(x, y) {
  const d = desk.getBoundingClientRect();
  const s = el('div', 'sticky s-new', '<span class="tape" aria-hidden="true"></span><div class="sticky-t" contenteditable="true" spellcheck="false"><b>Note</b>Who else would buy this?</div>');
  s.dataset.sticky = '';
  s.style.left = x - d.left - 80 + 'px';
  s.style.top = y - d.top - 20 + 'px';
  s.style.setProperty('--rot', `${(Math.random() * 6 - 3).toFixed(1)}deg`);
  desk.insertBefore(s, $('#cables'));
  bindSticky(s);
  const t = $('.sticky-t', s);
  t.focus();
  getSelection().selectAllChildren(t);
}
function wiggle(node) {
  if (!node || FAST) return;
  node.animate([{ transform: 'rotate(var(--rot,0deg))' }, { transform: 'rotate(-5deg) scale(1.06)' }, { transform: 'rotate(5deg) scale(1.06)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(var(--rot,0deg))' }], { duration: 620 });
}

desk.addEventListener('pointerdown', (e) => {
  if (e.button !== 0 || MOBILE) return;
  if (e.target !== desk && !e.target.closest('.wall') && e.target !== $('#icons')) return;
  $$('.dicon.sel').forEach((x) => x.classList.remove('sel'));
  const d = desk.getBoundingClientRect();
  const sx = e.clientX, sy = e.clientY;
  const band = el('div', 'band');
  let on = false;
  const move = (ev) => {
    if (!on) { if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 4) return; on = true; desk.appendChild(band); }
    const x = Math.min(sx, ev.clientX), y = Math.min(sy, ev.clientY), w = Math.abs(ev.clientX - sx), h = Math.abs(ev.clientY - sy);
    Object.assign(band.style, { left: x - d.left + 'px', top: y - d.top + 'px', width: w + 'px', height: h + 'px' });
    $$('#icons .dicon').forEach((ic) => {
      const r = ic.getBoundingClientRect();
      ic.classList.toggle('sel', r.right > x && r.left < x + w && r.bottom > y && r.top < y + h);
    });
  };
  const up = () => { band.remove(); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
});

/* ------------------------------------------------------------------ */
/* Spotlight (⌘K)                                                      */
/* ------------------------------------------------------------------ */
const spot = $('#spot'), spotInput = $('#spotInput'), spotList = $('#spotList');
let spotItemsCur = [], spotIdx = 0;
const APP_LIST = [['builder', 'Builder', 'Build and change apps'], ['clients', 'Clients', 'Every client, one app'], ['phone', 'Phone', 'Share · QR code'], ['calc', 'Calculator', 'Revenue from one build'], ['notes', 'Notes', 'The four-step rule'], ['readme', 'Read me.txt', 'The pitch in thirty seconds'], ['trash', 'Trash', 'Things you won’t need']];
function spotItems(q) {
  const t = q.trim(), lc = t.toLowerCase(), items = [];
  if (t) {
    const cur = curated(t);
    const running = S.clients.find((c) => c.brand.name.toLowerCase() === lc || (cur && c.brand === cur));
    if (running) items.push({ icon: clientTile(running.brand), label: `Switch to ${running.brand.name}’s app`, sub: 'Already published — same app, their brand', fn: () => showClient(running) });
    else items.push({ icon: ICONS.builder, label: `Publish Campaign email for “${cur ? cur.name : titleCase(t)}”`, sub: S.built ? 'Re-skinned from their website. Same four steps.' : 'Builds it first — four steps — then publishes', fn: () => enqueue(() => publish(t)) });
    Object.values(BRANDS).filter((b) => b.name.toLowerCase().startsWith(lc) && b !== cur && !S.clients.some((c) => c.brand === b))
      .forEach((b) => items.push({ icon: clientTile(b), label: `Publish for ${b.name}`, sub: b.tone, fn: () => enqueue(() => publish(b.name)) }));
    APP_LIST.filter((a) => a[1].toLowerCase().includes(lc)).forEach((a) => items.push({ icon: ICONS[a[0]], label: `Open ${a[1]}`, sub: a[2], fn: () => openApp(a[0]) }));
  } else {
    ['nike', 'apple', 'commbank'].map((k) => BRANDS[k]).filter((b) => !S.clients.some((c) => c.brand === b))
      .forEach((b) => items.push({ icon: clientTile(b), label: `Publish for ${b.name}`, sub: b.tone, fn: () => enqueue(() => publish(b.name)) }));
    ['Qantas', 'Aesop', 'Spotify'].filter((n) => !S.clients.some((c) => c.brand.name === n))
      .forEach((n) => items.push({ icon: ICONS.builder, label: `Publish for ${n}`, sub: 'Read live from their website', fn: () => enqueue(() => publish(n)) }));
    items.push({ icon: ICONS.calc, label: 'Open Calculator', sub: 'Revenue from one build', fn: () => openApp('calc') });
  }
  return items.slice(0, 7);
}
function renderSpot() {
  spotItemsCur = spotItems(spotInput.value);
  spotIdx = clamp(spotIdx, 0, Math.max(0, spotItemsCur.length - 1));
  spotList.innerHTML = spotItemsCur.map((it, i) => `<li role="option" aria-selected="${i === spotIdx}" data-i="${i}" class="${i === spotIdx ? 'on' : ''}"><span class="sp-ico">${it.icon}</span><span class="sp-tx"><b>${esc(it.label)}</b><small>${esc(it.sub)}</small></span><kbd>↵</kbd></li>`).join('');
}
function openSpot(prefill = '') {
  hideCtx();
  spot.hidden = false;
  spotInput.value = prefill;
  spotIdx = 0;
  renderSpot();
  spotInput.focus();
  if (!FAST) $('.spot-box').animate([{ opacity: 0, transform: 'translateY(-10px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: 'cubic-bezier(.2,.9,.3,1)' });
}
function closeSpot() { spot.hidden = true; }
function runSpot(i) {
  const it = spotItemsCur[i];
  closeSpot();
  if (it) it.fn();
}
spotInput.addEventListener('input', () => { spotIdx = 0; renderSpot(); });
spotInput.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') { e.preventDefault(); spotIdx = (spotIdx + 1) % spotItemsCur.length; renderSpot(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); spotIdx = (spotIdx - 1 + spotItemsCur.length) % spotItemsCur.length; renderSpot(); }
  else if (e.key === 'Enter') { e.preventDefault(); runSpot(spotIdx); }
});
spotList.addEventListener('click', (e) => { const li = e.target.closest('li'); if (li) runSpot(+li.dataset.i); });
spot.addEventListener('pointerdown', (e) => { if (e.target === spot) closeSpot(); });
$('#mbSpot').addEventListener('click', () => (spot.hidden ? openSpot() : closeSpot()));

/* ------------------------------------------------------------------ */
/* The Builder — the MAKER's chat, left, EAI-neutral                    */
/* ------------------------------------------------------------------ */
const BLD = { w: null, root: null, thread: null, input: null, autoTyping: false };
const ARROW_UP = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 15V5m-5 5 5-5 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function builderRoot() {
  if (BLD.root) return BLD.root;
  const r = el('div', 'bld');
  r.innerHTML = `
  <aside class="bc" aria-label="Builder chat — you, building">
    <div class="bc-hd"><span class="bc-mark">${EAI_MARK}</span><div class="bc-ht"><b>Builder chat</b><small>You, building the app</small></div><span class="bc-pill">Maker</span></div>
    <div class="bc-thread" role="log" aria-live="polite"></div>
    <div class="bc-sugs"></div>
    <form class="bc-comp"><input type="text" placeholder="Tell the builder what to make or change…" aria-label="Message the builder" autocomplete="off" spellcheck="false" /><button type="submit" aria-label="Send">${ARROW_UP}</button></form>
  </aside>
  <section class="cv" aria-label="The app being built">
    <div class="cv-hd">
      <div class="cv-t"><small>App</small><b class="cv-name">Untitled app</b></div>
      <div class="cv-count" aria-label="Steps"><span class="cv-n">0</span><span class="cv-of">/4</span><small>steps<br />exactly four</small></div>
    </div>
    <div class="pads">${STEPS.map((s, i) => `<div class="pad" data-i="${i}"><span class="pad-slot">0${i + 1}</span><div class="pad-key"><span class="pad-led"></span><span class="pad-n">0${i + 1}</span><b>${s[0]}</b><small class="pad-w">${s[1]}</small></div></div>`).join('')}</div>
    <div class="cv-brand"><small class="cv-lbl">Brand source</small><div class="cvb"><span class="cvb-logo"></span><div class="cvb-tx"><b class="cvb-name">No client yet</b><small class="cvb-tone">Name a client and I’ll read their website.</small></div><span class="cvb-sw"></span></div></div>
    <div class="cv-pub"><small class="cv-lbl">Publish for… <em>one window per client</em></small><div class="pub"></div></div>
    <div class="cv-runs"><small class="cv-lbl">Running at <em>the same app, many brands</em></small><ul class="runs"></ul></div>
    <div class="cv-foot"><span><b>1</b> build</span><span><b class="cv-inst">0</b> installs</span><span><b>0</b> rebuilds</span><span class="cv-out">Out</span></div>
  </section>`;
  BLD.root = r;
  BLD.thread = $('.bc-thread', r);
  BLD.input = $('.bc-comp input', r);
  $('.bc-comp', r).addEventListener('submit', (e) => {
    e.preventDefault();
    const v = BLD.input.value.trim();
    if (!v || BLD.autoTyping) return;
    BLD.input.value = '';
    enqueue(() => handleCmd(v));
  });
  $('.bc-sugs', r).addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) enqueue(() => handleCmd(b.textContent));
  });
  $('.pub', r).addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.any != null) { openSpot(); return; }
    const c = S.clients.find((x) => x.brand.key === b.dataset.c);
    if (c) { showClient(c); return; }
    enqueue(() => publish(BRANDS[b.dataset.c].name, { fromEl: b }));
  });
  $('.pads', r).addEventListener('click', (e) => {
    if (e.target.closest('.pad') && S.built) ruleOfFour(true);
  });
  renderPub();
  renderSugs();
  return r;
}
function appBuilder(o = {}) {
  const w = openWin({
    id: 'builder', kind: 'builder', title: 'EAI Builder — Campaign email', icon: ICONS.builder, cls: 'w-builder', jack: 'out',
    geom: geomFor('builder'), minW: 520, minH: 380, from: o.from,
    content: (w) => w.body.appendChild(builderRoot()),
    onClose: () => { BLD.w = null; drawCables(); },
  });
  BLD.w = w;
  if (!BLD.thread.children.length) bMsg('eai', 'Hi — I’m the builder. Tell me what to make. Every app here is exactly four steps.');
  return w;
}
function renderPub() {
  if (!BLD.root) return;
  const known = ['nike', 'apple', 'commbank'].map((k) => BRANDS[k]);
  $('.pub', BLD.root).innerHTML = known.map((b) => {
    const live = S.clients.some((c) => c.brand === b);
    return `<button type="button" class="pc${live ? ' live' : ''}" data-c="${b.key}" style="--cb:${b.b}"${S.built ? '' : ' disabled'}><i></i>${b.name}${live ? '<em>live</em>' : ''}</button>`;
  }).join('') + S.clients.filter((c) => !known.includes(c.brand)).map((c) => `<span class="pc live" style="--cb:${c.brand.b || '#888'}"><i></i>${esc(c.brand.name)}<em>live</em></span>`).join('') +
    `<button type="button" class="pc pc-any" data-any${S.built ? '' : ' disabled'}>+ Any client <kbd>⌘K</kbd></button>`;
  $('.cv-inst', BLD.root).textContent = S.clients.length;
  renderRuns();
}
function renderRuns() {
  if (!BLD.root) return;
  const list = S.clients;
  $('.runs', BLD.root).innerHTML = list.length
    ? list.map((c) => `<li style="--cb:${c.brand.b || '#999'}"><i></i><b>${esc(c.brand.name)}</b><span>${c.brand.loading ? 'reading their site…' : `${esc(c.brand.persona.name)} · on ${STEPS[c.step][0]}`}</span><em>${c.brand.loading ? '…' : 'live'}</em></li>`).join('')
    : '<li class="runs-none">Nowhere yet. Publish it for someone.</li>';
}
function renderSugs() {
  if (!BLD.root) return;
  let s;
  if (!S.built) s = ['Build a campaign email app for Nike'];
  else if (S.clients.length < 3) s = ['Publish for Apple', 'Publish for CommBank', 'Publish for Qantas'].filter((x) => !S.clients.some((c) => x.endsWith(c.brand.name)));
  else if (!S.approval) s = ['Add an approval step', 'Make the tone warmer'];
  else s = [S.warmer ? 'Publish for Aesop' : 'Make the tone warmer', 'Add a fifth step', 'Share it to my phone'];
  $('.bc-sugs', BLD.root).innerHTML = s.slice(0, 3).map((x) => `<button type="button">${esc(x)}</button>`).join('');
}
function bScroll() { BLD.thread.scrollTop = BLD.thread.scrollHeight; }
function bMsg(who, html) {
  builderRoot();
  const m = el('div', 'bm ' + who);
  m.innerHTML = who === 'you'
    ? `<span class="bm-av">You</span><div class="bm-b"><span class="bm-who">You, building</span><p>${html}</p></div>`
    : `<span class="bm-av">${EAI_MARK}</span><div class="bm-b"><span class="bm-who">EAI Builder</span><p>${html}</p></div>`;
  BLD.thread.appendChild(m);
  bScroll();
  return m;
}
async function bSay(html, think = 620) {
  const m = bMsg('eai typing', '<span class="dots"><i></i><i></i><i></i></span>');
  await wait(think);
  m.classList.remove('typing');
  $('p', m).innerHTML = html;
  bScroll();
  SFX.click();
  return m;
}
function enqueue(fn) {
  S.queue = S.queue.then(fn).catch((e) => { if (!(e instanceof Cancelled)) setTimeout(() => { throw e; }); });
  return S.queue;
}

async function handleCmd(raw) {
  const text = raw.trim();
  if (!text) return;
  if (!BLD.w) openApp('builder');
  bMsg('you', esc(text));
  const t = text.toLowerCase();
  const names = (s) => s.replace(/[.!?]+$/, '').split(/\s*(?:,|&|\band\b|\bplus\b)\s*/i).map((x) => x.replace(/^(the|a|an)\s+/i, '').trim()).filter(Boolean);
  if ((/\b(add|another|extra|fifth|5th|new|more|sixth)\b.*\bsteps?\b/.test(t) && !/approv|sign.?off/.test(t)) || /\b(five|5|six|6|three|3|two|2)\s+steps?\b/.test(t)) return ruleOfFour();
  if (/approv|sign.?off/.test(t)) return editApproval();
  if (/warm|friendl|softer|kinder|tone/.test(t)) return editWarmer();
  if (/\b(share|phone|qr|mobile)\b/.test(t)) { await bSay('Opening Phone. Scan the QR to try the app on yours — same four steps.'); openApp('phone'); return; }
  if (/\b(tile|tidy|arrange)\b/.test(t)) { await bSay('Tidied. One builder, every client.'); tile(); return; }
  const mb = /\b(?:build|make|create)\b(?!\s+it\b).*?\bfor\s+(.+)$/i.exec(text);
  const mp = /\b(?:publish|sell|ship|install|rebrand|re-?skin|make it|do it|now|give it|send it)\b.*?\b(?:for|to)\s+(.+)$/i.exec(text);
  if (mp || mb) {
    const list = names((mp || mb)[1]);
    if (!list.length) return;
    if (!S.built) {
      await build(list[0]);
      if (mb && !mp && list.length === 1) return;
    }
    for (const n of list) await publish(n);
    return;
  }
  if (/\b(build|make|create)\b/.test(t)) {
    if (S.built) await bSay('It’s built — four steps. Now sell it: try “publish for Qantas”.');
    else await build('Nike');
    return;
  }
  if (!/^(hi|hello|hey|help|thanks|thank you|ok|okay|yes|no|what|how|why)\b/.test(t) && text.split(/\s+/).length <= 3 && /^[\w&.'’ -]+$/.test(text)) {
    if (!S.built) await build(text);
    await publish(text);
    return;
  }
  await bSay('I build and change apps. Try “publish for Qantas”, “add an approval step” or “make the tone warmer”. For help <em>inside</em> an app, ask that app’s own assistant — on the right of its window.');
}

async function ruleOfFour(fromPad) {
  SFX.nope();
  const pads = BLD.root && $('.pads', BLD.root);
  if (pads && !FAST) pads.animate([{ transform: 'none' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-3px)' }, { transform: 'none' }], { duration: 380 });
  wiggle($('.s-rule'));
  if (fromPad) { notifyOnce('pad', { icon: 'notes', app: 'Builder', title: 'Four pads. Always four.', body: 'You can change what a step does. You can’t add a fifth.' }); return; }
  await bSay('Four steps. That’s the rule, not a setting — it’s why every client learns the app in a minute. I can change what a step <em>does</em>, though: try “add an approval step”.');
  renderSugs();
}

async function build(name) {
  if (S.built || S.building) return;
  S.building = true;
  builderRoot();
  const cur = curated(name);
  const nm = cur ? cur.name : titleCase(name);
  await bSay(`On it — a campaign email app for ${esc(nm)}. Four steps. Always four.`, 700);
  $('.cv-name', BLD.root).textContent = 'Campaign email';
  for (let i = 0; i < 4; i++) { dropPad(i); await wait(430); }
  const card = $('.cv-brand', BLD.root);
  card.classList.add('reading');
  $('.cvb-name', BLD.root).textContent = `Reading ${cur ? cur.domain : nm.toLowerCase().replace(/[^a-z0-9]+/g, '') + '.com'}…`;
  $('.cvb-tone', BLD.root).textContent = 'Colours, logo, tone of voice';
  const br = cur || (await lookup(nm));
  if (cur) await wait(800);
  paintBrandCard(br);
  card.classList.remove('reading');
  S.brand0 = br;
  S.built = true;
  S.building = false;
  await bSay(`Read ${esc(br.domain)}: <span class="sw" style="--c:${br.b}"></span>${esc(br.b)}, their logo, and a voice that’s ${esc(br.live ? 'straight from their site copy' : br.tone.toLowerCase())}.`, 500);
  renderPub();
  renderSugs();
  await bSay('Built — one app, wired once. Now <b>Publish for…</b> anyone. Each client gets their own window.', 500);
  notify({ icon: 'builder', app: 'Builder', title: 'Campaign email is built', body: '4 of 4 steps. Brief → Assets → Compose → Review.' });
}
function dropPad(i) {
  const pad = $$('.pad', BLD.root)[i];
  pad.classList.add('on');
  $('.cv-n', BLD.root).textContent = i + 1;
  SFX.drop(i);
  if (!FAST) $('.pad-key', pad).animate([{ transform: 'translateY(-70px) rotate(-6deg)', opacity: 0 }, { transform: 'translateY(4px)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], { duration: 460, easing: 'cubic-bezier(.3,.7,.3,1)' });
}
function paintBrandCard(br) {
  const r = BLD.root;
  const logo = $('.cvb-logo', r);
  logo.style.setProperty('--cb', br.head);
  logo.style.setProperty('--co', br.headOn);
  logo.className = 'cvb-logo filled' + (br.logoClass ? ' ' + br.logoClass : '');
  logo.innerHTML = br.logo || `<b>${esc(br.name[0])}</b>`;
  const img = $('img', logo);
  if (img) img.onerror = () => { logo.innerHTML = `<b>${esc(br.name[0])}</b>`; };
  $('.cvb-name', r).textContent = `${br.name} · ${br.domain}`;
  $('.cvb-tone', r).textContent = br.tone;
  $('.cvb-sw', r).innerHTML = br.swatches.slice(0, 4).map((c) => `<i style="--c:${c}"></i>`).join('');
}

/* ---- Publish: one NEW window per client ---- */
async function publish(name, opts = {}) {
  if (!S.built) await build(name);
  const cur = curated(name);
  const nm = cur ? cur.name : titleCase(name);
  const existing = S.clients.find((c) => c.brand.name.toLowerCase() === nm.toLowerCase() || (cur && c.brand === cur));
  if (existing) { await bSay(`${esc(existing.brand.name)} already has it — bringing their window forward.`, 350); showClient(existing); return existing; }
  const c = { idx: S.clients.length, brand: cur || { name: nm, loading: true, persona: { name: '…', role: '', initials: '··' } }, step: 2, subject: 0, body: null, win: null, root: null, userTook: false, cable: null };
  S.clients.push(c);
  await bSay(`Re-skinning for ${esc(nm)}… same four steps, same wiring.`, 380);
  const from = opts.fromEl && opts.fromEl.isConnected ? opts.fromEl.getBoundingClientRect() : jackRect();
  openClient(c, { from, background: MOBILE });
  if (MOBILE) addHomeIcon(c);
  renderPub();
  if (!cur) {
    setLoading(c, `Reading ${nm}’s website…`);
    c.brand = await lookup(nm, (s) => setLoading(c, s));
    paintClient(c);
    renderPub();
    if (MOBILE) addHomeIcon(c);
  }
  onPublished(c);
  const p = c.brand.persona;
  bSay(`Live for ${esc(c.brand.name)}. ${esc(p.name)}’s team has it now — with its own ${esc(c.brand.name)} assistant, on the right of their app.`, 350);
  return c;
}
function onPublished(c) {
  syncDock();
  renderPub();
  renderSugs();
  renderFinder();
  renderPhone();
  if (CALC.synced) { CALC.clients = Math.max(1, S.clients.length); renderCalc(); }
  const n = S.clients.length;
  notify({ brand: c.brand, app: 'Clients', title: `Published for ${esc(c.brand.name)}`, body: n > 1 ? `${n} clients, 1 build, 0 rebuilds.` : `Same four steps in ${esc(c.brand.name)}’s brand. ${esc(c.brand.persona.name)} can use it now.` });
  personaRun(c);
}
function showClient(c, from) {
  if (!c.win) openClient(c, { from: from || jackRect() });
  else if (c.win.min) restoreWin(c.win);
  else {
    focusWin(c.win);
    if (!FAST) c.win.el.animate([{ transform: 'none' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'none' }], { duration: 300 });
  }
  renderFinder();
}
function jackRect() {
  const j = BLD.w && !BLD.w.min && $('.jack', BLD.w.el);
  if (j) return j.getBoundingClientRect();
  const d = $('.dock .dk[data-open="builder"] .dk-img');
  return d ? d.getBoundingClientRect() : null;
}

/* ------------------------------------------------------------------ */
/* Client windows — the published app, with its END USER's assistant   */
/* on the right, in the client's brand                                 */
/* ------------------------------------------------------------------ */
const SEND = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function openClient(c, o = {}) {
  c.win = openWin({
    id: 'client-' + c.idx, kind: 'client', title: `Campaign email — ${c.brand.name}`, icon: clientTile(c.brand), cls: 'w-client', jack: 'in',
    geom: geomFor('client', c.idx), minW: 400, minH: 320, from: o.from, background: o.background,
    content: (w) => { w.client = c; w.body.appendChild(clientRoot(c)); },
    onClose: () => { c.win = null; renderFinder(); },
  });
  c.win.el.style.setProperty('--cb', c.brand.b || '#999');
  const tag = $('.win-tag', c.win.el);
  tag.hidden = false;
  tag.textContent = 'Published';
  return c.win;
}
function clientRoot(c) {
  if (c.root) return c.root;
  const r = el('div', 'capp');
  r.innerHTML = `
  <header class="ca-head"><span class="ca-logo"></span><b class="ca-name"></b><span class="ca-app">Campaign email</span><span class="ca-user" title="The end user of this app"><i class="ca-uav"></i><span class="ca-ut"></span></span></header>
  <div class="ca-body">
    <div class="ca-main">
      <nav class="ca-steps" aria-label="Steps">${STEPS.map((s, i) => `<button type="button" data-s="${i}"><i>${i + 1}</i>${s[0]}</button>`).join('')}</nav>
      <div class="ca-card"></div>
      <div class="ca-made"></div>
      <div class="ca-upd" hidden><i></i><span></span></div>
    </div>
    <aside class="ca-as">
      <div class="as-hd"><span class="as-av"></span><div class="as-ht"><b class="as-name"></b><small class="as-sub"></small></div></div>
      <div class="as-thread" role="log" aria-live="polite"></div>
      <form class="as-comp"><input type="text" autocomplete="off" spellcheck="false" /><button type="submit" aria-label="Send">${SEND}</button></form>
    </aside>
  </div>
  <div class="ca-load"><span class="ld-ring"></span><b class="ld-t">Reading their website…</b><small class="ld-s">Colours · logo · tone of voice</small></div>`;
  c.root = r;
  $('.ca-steps', r).addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { c.step = +b.dataset.s; renderCard(c); SFX.click(); } });
  $('.ca-card', r).addEventListener('click', (e) => {
    if (e.target.closest('[data-next]')) { c.step = Math.min(3, c.step + 1); renderCard(c); SFX.click(); }
    if (e.target.closest('[data-send]')) {
      const who = APPROVER[c.brand.key] || ['Jordan Lee'];
      notify({ brand: c.brand, app: `${c.brand.name} · Campaign email`, title: S.approval ? `Sent to ${who[0]} for sign-off` : 'Scheduled', body: S.approval ? 'Nothing sends until they approve.' : `Sends on ${esc(c.brand.date)}.` });
    }
  });
  const input = $('.as-comp input', r);
  input.addEventListener('focus', () => { c.userTook = true; });
  $('.as-comp', r).addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v || c.personaTyping) return;
    c.userTook = true;
    input.value = '';
    assistantTurn(c, v, 'you');
  });
  $('.as-thread', r).addEventListener('click', (e) => {
    const b = e.target.closest('[data-subj]');
    if (!b) return;
    c.subject = +b.dataset.subj;
    c.step = 2;
    renderCard(c, true);
  });
  if (!c.brand.loading) paintClient(c);
  return r;
}
function setLoading(c, text) {
  if (!c.root) return;
  $('.ld-t', c.root).textContent = text;
}
function logoHTML(br) { return br.logo || `<b class="mono">${esc(br.name[0].toUpperCase())}</b>`; }
function paintClient(c) {
  const r = c.root, br = c.brand;
  if (!r || br.loading) return;
  const s = r.style;
  s.setProperty('--b', br.b);
  s.setProperty('--b-on', br.on);
  s.setProperty('--b-head', br.head);
  s.setProperty('--b-head-on', br.headOn);
  s.setProperty('--b-surface', br.surface);
  s.setProperty('--b-border', br.border);
  s.setProperty('--b-font', br.font);
  s.setProperty('--b-accent', br.accent);
  r.classList.add('ready');
  r.dataset.brand = br.key;
  const lg = $('.ca-logo', r);
  lg.className = 'ca-logo' + (br.logoClass ? ' ' + br.logoClass : '');
  lg.innerHTML = logoHTML(br);
  $$('img', r).forEach((img) => { img.onerror = () => { img.replaceWith(Object.assign(document.createElement('b'), { className: 'mono', textContent: br.name[0] })); }; });
  $('.ca-name', r).textContent = br.name;
  const p = br.persona;
  $('.ca-uav', r).textContent = p.initials;
  $('.ca-ut', r).textContent = `${p.name} is using this app`;
  const av = $('.as-av', r);
  av.className = 'as-av' + (br.logoClass ? ' ' + br.logoClass : '');
  av.innerHTML = logoHTML(br);
  $('.as-name', r).textContent = `${br.name} assistant`;
  $('.as-sub', r).textContent = `For ${br.name}’s team · inside the app`;
  $('.as-comp input', r).placeholder = `Ask the ${br.name} assistant…`;
  $('.as-comp input', r).setAttribute('aria-label', `Ask the ${br.name} assistant`);
  $('.as-comp', r).dataset.who = `${p.name} is typing…`;
  $('.ca-made', r).textContent = 'Published from EAI Builder · the same four steps every client gets';
  if (c.win) {
    setTitle(c.win, `Campaign email — ${br.name}`);
    $('.win-ico', c.win.el).innerHTML = clientTile(br);
    c.win.el.style.setProperty('--cb', br.b);
  }
  const th = $('.as-thread', r);
  if (!th.children.length) asMsg(c, 'ai', `Hi ${esc(p.name)} — I know this campaign and ${esc(br.name)}’s voice. Ask me for subject lines, a shorter intro or a tone check.`);
  renderCard(c);
  drawCables();
}
function cardHTML(c) {
  const br = c.brand, i = c.step;
  const subj = br.subjects[c.subject] || br.subjects[0];
  const body = c.body || (S.warmer ? br.warm : br.body);
  const next = (label) => `<button type="button" class="cc-next" data-next>${label}</button>`;
  if (i === 0) {
    return `<div class="cc-hd"><b>Tell us about the campaign</b><small>Three fields. The rest is written for you.</small></div>` +
      `<div class="cf"><span>Campaign goal</span><em>${esc(br.goal)}</em></div>` +
      `<div class="cf-row"><div class="cf"><span>Audience</span><em>${esc(br.audience)}</em></div><div class="cf"><span>Send date</span><em>${esc(br.date)}</em></div></div>` + next('Next: assets');
  }
  if (i === 1) {
    return `<div class="cc-hd"><b>Assets</b><small>Pulled from SharePoint · Brand / Guidelines</small></div>` +
      br.files.map((f) => `<div class="af"><i></i><span>${esc(f)}</span><small>Synced</small></div>`).join('') + next('Next: compose');
  }
  if (i === 2) {
    return `<div class="cc-hd"><b>Compose</b><small>Drafted by AI in ${esc(br.name)}’s voice${S.warmer ? ', a touch warmer' : ''}.</small></div>` +
      `<div class="cm-subj"><span>Subject</span><b>${esc(subj)}</b></div>` +
      `<div class="cm-mail"><div class="cm-bar">${logoHTML(br)}</div><div class="cm-bd"><b>${esc(subj)}</b><p>${esc(body)}</p><span class="cm-btn">${esc(br.cta)}</span></div></div>` + next('Next: review');
  }
  const who = APPROVER[br.key] || ['Jordan Lee', 'JL'];
  const checks = ['Brand colours and logo', `Tone — ${br.tone}`, 'Links and unsubscribe'];
  return `<div class="cc-hd"><b>Review</b><small>${S.approval ? `One sign-off before it sends on ${esc(br.date)}.` : `Final checks before it sends on ${esc(br.date)}.`}</small></div>` +
    (S.approval ? `<div class="rv-who"><i>${who[1]}</i><div><b>${who[0]}</b><small>Marketing lead · approver</small></div><span class="rv-st">Waiting</span></div>` : '') +
    checks.map((t) => `<div class="rv-ck"><i>✓</i>${esc(t)}</div>`).join('') +
    `<button type="button" class="cc-next" data-send>${S.approval ? 'Request approval' : 'Schedule send'}</button>`;
}
function renderCard(c, flash) {
  if (!c.root || c.brand.loading) return;
  renderRuns();
  const card = $('.ca-card', c.root);
  card.innerHTML = cardHTML(c);
  $$('.ca-steps button', c.root).forEach((b, n) => { b.classList.toggle('on', n === c.step); b.classList.toggle('done', n < c.step); });
  $$('img', card).forEach((img) => { img.onerror = () => img.remove(); });
  if (!FAST) card.animate([{ opacity: 0.2, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' });
  if (flash && !FAST) card.animate([{ boxShadow: '0 0 0 3px var(--b)' }, { boxShadow: '0 0 0 0 transparent' }], { duration: 900 });
}
function asMsg(c, who, html) {
  const br = c.brand, p = br.persona;
  const th = $('.as-thread', c.root);
  const m = el('div', 'am ' + who);
  if (who.startsWith('ai')) m.innerHTML = `<span class="am-av">${logoHTML(br)}</span><div class="am-b"><span class="am-who">${esc(br.name)} assistant</span><p>${html}</p></div>`;
  else if (who === 'you') m.innerHTML = `<span class="am-av">You</span><div class="am-b"><span class="am-who">You, as ${esc(br.name)}’s team</span><p>${html}</p></div>`;
  else m.innerHTML = `<span class="am-av">${esc(p.initials)}</span><div class="am-b"><span class="am-who">${esc(p.name)} · ${esc(p.role)}</span><p>${html}</p></div>`;
  $$('img', m).forEach((img) => { img.onerror = () => img.remove(); });
  th.appendChild(m);
  th.scrollTop = th.scrollHeight;
  return m;
}
async function assistantTurn(c, text, who) {
  asMsg(c, who, esc(text));
  const typing = asMsg(c, 'ai typing', '<span class="dots"><i></i><i></i><i></i></span>');
  await wait(850);
  const r = assistantReply(c.brand, text);
  typing.classList.remove('typing');
  $('p', typing).innerHTML = r.html;
  $('.as-thread', c.root).scrollTop = 1e6;
  const fx = r.effect || '';
  if (fx === 'short') c.body = c.brand.short;
  else if (fx === 'warm') c.body = c.brand.warm;
  else if (fx.startsWith('use')) c.subject = +fx.slice(3);
  if (/short|warm|use/.test(fx)) { c.step = 2; renderCard(c, true); }
  SFX.click();
}
const SCRIPTS = {
  nike: ['Suggest three subject lines', 'Use the second one'],
  apple: ['Make the intro shorter'],
  commbank: ['Check it against our tone'],
};
async function personaRun(c) {
  if (FAST) {
    for (const line of SCRIPTS[c.brand.key] || ['Suggest three subject lines']) await assistantTurn(c, line, 'persona');
    return;
  }
  await sleep(1100);
  for (const line of SCRIPTS[c.brand.key] || ['Suggest three subject lines']) {
    if (c.userTook || !c.root) return;
    const input = $('.as-comp input', c.root);
    c.personaTyping = true;
    c.root.classList.add('persona-typing');
    for (const ch of line) { if (c.userTook) break; input.value += ch; await sleep(34 + Math.random() * 30); }
    await sleep(220);
    input.value = '';
    c.personaTyping = false;
    c.root.classList.remove('persona-typing');
    if (c.userTook) return;
    await assistantTurn(c, line, 'persona');
    await sleep(1500);
  }
}

/* ---- Builder edits that propagate to every client ---- */
async function editApproval() {
  if (!S.built) { await bSay('Build something first — try “Build a campaign email app for Nike”.'); return; }
  if (S.approval) { await bSay('Review already has a sign-off. Still four steps.'); return; }
  await bSay('Apps here are exactly four steps, so approval goes <em>into</em> Review: a named approver signs off before anything sends.', 750);
  S.approval = true;
  STEPS[3][1] = 'Approval';
  const pad = $$('.pad', BLD.root)[3];
  $('.pad-w', pad).textContent = 'Approval';
  if (!FAST) $('.pad-key', pad).animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 400 });
  const n = S.clients.length;
  if (n) {
    await bSay(`Rolling it out to ${n} app${n > 1 ? 's' : ''}…`, 250);
    await propagate('approval', 'Review now needs sign-off');
    await bSay(`Done. 1 edit → ${n} app${n > 1 ? 's' : ''} updated. 0 rebuilds.`, 300);
    notify({ icon: 'builder', app: 'Builder', title: `Approval rolled out to ${n} app${n > 1 ? 's' : ''}`, body: 'Changed once in the builder. Every client has it now.' });
  } else await bSay('Done. Every client you publish to gets it.');
  renderSugs();
}
async function editWarmer() {
  if (!S.built) { await bSay('Build something first — try “Build a campaign email app for Nike”.'); return; }
  if (S.warmer) { await bSay('Already warmer. Any warmer and it’s a hug.'); return; }
  await bSay('Warmer, but still in each client’s own voice. Rolling out…', 600);
  S.warmer = true;
  S.clients.forEach((c) => { c.body = null; });
  if (S.clients.length) await propagate('warm', 'Tone is a touch warmer');
  await bSay(`Done. ${S.clients.length} app${S.clients.length === 1 ? '' : 's'} updated, each in its own brand’s voice.`, 300);
  renderSugs();
}
async function propagate(kind, label) {
  const { W, H } = deskSize();
  const j = jackPoint();
  SFX.ripple();
  const SPEED = 0.8; // px per ms — the ring and the window flashes travel together
  const dist = (c) => { const w = c.win && !c.win.min ? c.win : null; return j && w ? Math.hypot(w.x + 28 - j.x, w.y + w.h - j.y) : 200; };
  if (!FAST && j && !MOBILE) {
    const R = Math.max(500, ...S.clients.map(dist)) + 260;
    for (const [delay, cls] of [[280, 'ring'], [460, 'ring ring-2']]) {
      const ring = el('div', cls);
      ring.style.left = j.x + 'px';
      ring.style.top = j.y + 'px';
      $('#ripples').appendChild(ring);
      ring.animate([{ width: '0px', height: '0px', opacity: 1 }, { width: 2 * R + 'px', height: 2 * R + 'px', opacity: 0 }], { duration: R / SPEED, delay, easing: 'linear', fill: 'backwards' }).onfinish = () => ring.remove();
    }
  }
  await Promise.all(S.clients.map((c) => new Promise((res) => {
    const delay = FAST ? 0 : 280 + dist(c) / SPEED;
    pulseCable(c, delay);
    setTimeout(() => { applyUpdate(c, kind, label); res(); }, delay);
  })));
}
function applyUpdate(c, kind, label) {
  c.step = kind === 'approval' ? 3 : 2;
  renderCard(c, true);
  if (c.root) {
    const u = $('.ca-upd', c.root);
    $('span', u).textContent = `Updated by the builder · ${label}`;
    u.hidden = false;
    c.root.classList.add('updated');
    clearTimeout(c.updT);
    c.updT = setTimeout(() => { u.hidden = true; c.root.classList.remove('updated'); }, 6000);
  }
  if (c.win) {
    const w = c.win;
    const tag = $('.win-tag', w.el);
    tag.textContent = 'Updated';
    tag.classList.add('upd');
    setTimeout(() => { tag.textContent = 'Published'; tag.classList.remove('upd'); }, 5200);
    if (!FAST) w.el.animate([{ outline: '3px solid var(--cb)', outlineOffset: '0px' }, { outline: '3px solid transparent', outlineOffset: '14px' }], { duration: 900, easing: 'ease-out' });
  }
  const hi = $(`.dicon[data-client="${c.idx}"]`);
  if (hi) { hi.classList.add('upd'); setTimeout(() => hi.classList.remove('upd'), 6000); }
  SFX.pop();
}

/* ------------------------------------------------------------------ */
/* Patch cables: builder OUT -> each client IN                         */
/* ------------------------------------------------------------------ */
const cablesSvg = $('#cables');
let cablesQ = false;
function drawCables() {
  if (cablesQ) return;
  cablesQ = true;
  requestAnimationFrame(() => { cablesQ = false; renderCables(); });
}
function jackPoint() {
  const b = BLD.w;
  if (!b || b.min) return null;
  return { x: b.x + b.w - 56, y: b.y + b.h + 8 };
}
function renderCables() {
  const j = MOBILE ? null : jackPoint();
  S.clients.forEach((c) => {
    let k = c.cable;
    if (!k) {
      k = c.cable = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      k.innerHTML = '<path class="cb-sh"/><path class="cb"/><path class="cb-hi"/><path class="cb-pulse"/>';
      cablesSvg.appendChild(k);
    }
    const w = c.win;
    const vis = j && w && !w.min && !c.brand.loading;
    k.style.display = vis ? '' : 'none';
    if (!vis) return;
    const e = { x: w.x + 28, y: w.y + w.h + 8 };
    const sag = 60 + Math.abs(e.x - j.x) * 0.18 + Math.max(0, e.y - j.y) * 0.4;
    const low = Math.max(j.y, e.y) + sag;
    const d = `M${j.x.toFixed(1)},${j.y.toFixed(1)} C${j.x.toFixed(1)},${(low + 10).toFixed(1)} ${e.x.toFixed(1)},${(low - 10).toFixed(1)} ${e.x.toFixed(1)},${e.y.toFixed(1)}`;
    k.querySelectorAll('path').forEach((p) => p.setAttribute('d', d));
    k.style.setProperty('--cb', c.brand.b);
  });
}
function pulseCable(c, dur) {
  if (FAST || !c.cable || c.cable.style.display === 'none') return;
  const p = $('.cb-pulse', c.cable);
  const len = p.getTotalLength();
  p.style.strokeDasharray = `46 ${len + 60}`;
  p.animate([{ strokeDashoffset: 46, opacity: 1 }, { strokeDashoffset: -len, opacity: 1 }], { duration: Math.max(300, dur), easing: 'cubic-bezier(.4,0,.6,1)' });
}

/* ------------------------------------------------------------------ */
/* Clients (Finder)                                                    */
/* ------------------------------------------------------------------ */
function appClients(o = {}) {
  return openWin({
    id: 'clients', title: 'Clients', icon: ICONS.clients, cls: 'w-finder', geom: geomFor('clients'), from: o.from, minW: 420, minH: 300,
    content: (w) => {
      w.body.innerHTML = `<div class="fnd"><aside class="fnd-side"><small>EAI</small><button type="button" class="on">${ICONS.clients}Clients</button><button type="button" data-go="builder">${ICONS.builder}Builder</button><small>Apps</small><button type="button" data-go="builder"><i class="dotc"></i>Campaign email</button><small>Tags</small><span class="fnd-tag"><i style="--c:#FA5400"></i>Retail</span><span class="fnd-tag"><i style="--c:#FFCC00"></i>Finance</span></aside>` +
        `<div class="fnd-main"><div class="fnd-bar"><span class="fnd-path">EAI <b>›</b> Clients</span><button type="button" class="fnd-new">+ New client…</button></div><div class="fnd-grid" role="list"></div><div class="fnd-status"></div></div></div>`;
      const grid = $('.fnd-grid', w.body);
      grid.addEventListener('click', (e) => {
        const b = e.target.closest('.fold');
        if (!b) return;
        $$('.fold.sel', grid).forEach((x) => x.classList.remove('sel'));
        b.classList.add('sel');
        if (MOBILE || e.detail === 0) openFolder(b);
      });
      grid.addEventListener('dblclick', (e) => { const b = e.target.closest('.fold'); if (b) openFolder(b); });
      grid.addEventListener('contextmenu', (e) => {
        const b = e.target.closest('.fold');
        if (!b || b.dataset.new != null) return;
        e.preventDefault();
        const c = S.clients.find((x) => x.brand.name === b.dataset.name);
        showCtx(e.clientX, e.clientY, [
          { label: c ? 'Open their app' : `Publish for ${b.dataset.name}`, fn: () => openFolder(b) },
          { label: 'Share to phone…', disabled: !c, fn: () => { S.phoneClient = c; openApp('phone'); } },
          { label: 'Move to Trash', fn: () => notify({ icon: 'trash', app: 'Trash', title: 'Clients don’t go in the Trash', body: 'Rebuilds do. There aren’t any.' }) },
        ]);
      });
      $('.fnd-new', w.body).addEventListener('click', () => openSpot());
      $$('[data-go]', w.body).forEach((b) => b.addEventListener('click', () => openApp(b.dataset.go)));
      renderFinder();
    },
  });
}
function openFolder(b) {
  if (b.dataset.new != null) { openSpot(); return; }
  const c = S.clients.find((x) => x.brand.name === b.dataset.name);
  if (c) showClient(c, $('.fold-i', b).getBoundingClientRect());
  else enqueue(() => publish(b.dataset.name, { fromEl: $('.fold-i', b) }));
}
function renderFinder() {
  const w = WINS.find((x) => x.kind === 'clients');
  if (!w) return;
  const known = ['nike', 'apple', 'commbank'].map((k) => BRANDS[k]);
  const all = known.concat(S.clients.map((c) => c.brand).filter((b) => !known.includes(b) && !b.loading));
  $('.fnd-grid', w.body).innerHTML = all.map((b) => {
    const c = S.clients.find((x) => x.brand === b);
    return `<button type="button" class="fold${c ? ' live' : ''}" data-name="${esc(b.name)}" role="listitem"><span class="fold-i">${folderIcon(b)}<span class="fold-logo${b.logoClass ? ' ' + b.logoClass : ''}" style="--co:${b.headOn}">${logoHTML(b)}</span></span><b>${esc(b.name)}</b><small>${c ? (c.win && !c.win.min ? '● Running' : '● Published') : 'Not published yet'}</small></button>`;
  }).join('') + '<button type="button" class="fold fold-new" data-new role="listitem"><span class="fold-i plus">+</span><b>New client…</b><small>⌘K · any company</small></button>';
  $$('.fnd-grid img', w.body).forEach((img) => { img.onerror = () => img.remove(); });
  $('.fnd-status', w.body).textContent = `${S.clients.length} published · 1 app · 1 build · 0 rebuilds`;
}

/* ------------------------------------------------------------------ */
/* Phone — the client's app on a phone, and the QR to share it          */
/* ------------------------------------------------------------------ */
function shareParams(br) {
  if (BRANDS[br.key] === br) return `c=${br.key}`;
  const p = new URLSearchParams({ n: br.name, d: br.domain || '', p: (br.b || '#1D1D1F').replace('#', '') });
  const m = /src="([^"]+)"/.exec(br.logo || '');
  if (m) p.set('l', m[1].replace(/&amp;/g, '&'));
  return p.toString();
}
const shareUrl = (br) => new URL('../../app.html?' + shareParams(br), location.href).href;
function phoneBrand() {
  const c = S.phoneClient && S.clients.includes(S.phoneClient) ? S.phoneClient : S.clients.find((x) => !x.brand.loading);
  return c && !c.brand.loading ? c.brand : BRANDS.nike;
}
function appPhone(o = {}) {
  return openWin({
    id: 'phone', title: 'Phone', icon: ICONS.phone, cls: 'w-phone', geom: geomFor('phone'), from: o.from, minW: 316, minH: 460,
    content: (w) => {
      w.body.innerHTML = `<div class="ph"><div class="ph-screen"><div class="ph-status"><span>9:41</span><span class="ph-isl"></span><span>5G ▮▮▮</span></div>` +
        `<div class="ph-view ph-appv"><iframe title="The client’s app, on a phone" tabindex="-1"></iframe></div>` +
        `<div class="ph-view ph-share" hidden><small>Share · QR code</small><b class="ph-sn"></b><canvas class="ph-qr" width="360" height="360"></canvas><p>Point your phone’s camera here. Their app opens — same four steps, their brand.</p><div class="ph-url"></div><div class="ph-acts"><button type="button" class="ph-copy">Copy link</button><a class="ph-open" target="_blank" rel="noopener">Open ↗</a></div></div></div>` +
        `<div class="ph-tabs" role="tablist"><button type="button" data-t="app" class="on" role="tab">App</button><button type="button" data-t="share" role="tab">Share · QR</button></div>` +
        `<div class="ph-pick"></div></div>`;
      $('.ph-tabs', w.body).addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        $$('.ph-tabs button', w.body).forEach((x) => x.classList.toggle('on', x === b));
        $('.ph-appv', w.body).hidden = b.dataset.t !== 'app';
        $('.ph-share', w.body).hidden = b.dataset.t !== 'share';
      });
      $('.ph-pick', w.body).addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        S.phoneClient = S.clients[+b.dataset.i];
        renderPhone();
      });
      $('.ph-copy', w.body).addEventListener('click', async (e) => {
        try { await navigator.clipboard.writeText(shareUrl(phoneBrand())); e.target.textContent = 'Copied'; } catch (err) { e.target.textContent = 'Press ⌘C'; }
        setTimeout(() => { e.target.textContent = 'Copy link'; }, 1600);
      });
      new ResizeObserver(() => fitPhone(w)).observe($('.ph-screen', w.body));
      renderPhone(w);
      if (MOBILE) $('.ph-tabs [data-t="share"]', w.body).click();
    },
  });
}
function fitPhone(w) {
  const scr = $('.ph-appv', w.body), f = $('iframe', w.body);
  if (!scr || !f) return;
  const s = scr.clientWidth / 390;
  f.style.transform = `scale(${s})`;
  f.style.height = scr.clientHeight / s + 'px';
}
function renderPhone(w = WINS.find((x) => x.kind === 'phone')) {
  if (!w) return;
  const br = phoneBrand();
  const url = shareUrl(br);
  const f = $('iframe', w.body);
  if (f.dataset.src !== url) { f.dataset.src = url; f.src = url; }
  setTitle(w, `Phone — ${br.name}`);
  $('.ph-sn', w.body).textContent = `${br.name} · Campaign email`;
  $('.ph-url', w.body).textContent = url.replace(/^https?:\/\//, '');
  $('.ph-open', w.body).href = url;
  if (window.QRCode) window.QRCode.toCanvas($('.ph-qr', w.body), url, { width: 360, margin: 0, errorCorrectionLevel: 'L', color: { dark: '#1B1B19', light: '#F4F1EA' } }, () => {});
  const list = S.clients.filter((c) => !c.brand.loading);
  $('.ph-pick', w.body).innerHTML = list.length
    ? list.map((c) => `<button type="button" data-i="${c.idx}" class="${c.brand === br ? 'on' : ''}" style="--cb:${c.brand.b}"><i></i>${esc(c.brand.name)}</button>`).join('')
    : '<span>Publish for a client to put their app here.</span>';
  fitPhone(w);
}

/* ------------------------------------------------------------------ */
/* Calculator — revenue from one build                                 */
/* ------------------------------------------------------------------ */
const CALC = { clients: 3, price: 6000, hours: 40, synced: true };
const KNOBS = { clients: [1, 50, 1, 'Clients'], price: [500, 20000, 250, '$ / month'], hours: [8, 200, 4, 'Build hrs'] };
function appCalc(o = {}) {
  return openWin({
    id: 'calc', title: 'Calculator — one build', icon: ICONS.calc, cls: 'w-calc', geom: geomFor('calc'), from: o.from, minW: 300, minH: 420,
    content: (w) => {
      w.body.innerHTML = `<div class="calc"><div class="lcd"><div class="lcd-top"><span>One build · per year</span><i></i></div><div class="lcd-n"></div><div class="lcd-eq"></div></div>` +
        `<div class="knobs">${Object.entries(KNOBS).map(([k, [, , , l]]) => `<div class="knob" data-k="${k}" role="slider" tabindex="0" aria-label="${l}"><div class="kn-dial"><svg viewBox="0 0 64 64" aria-hidden="true"><path class="kn-track"/><path class="kn-arc"/></svg><span class="kn-cap"><i></i></span></div><small>${l}</small><b class="kn-v"></b></div>`).join('')}</div>` +
        `<div class="keys"><button type="button" data-a="sync">Sync</button><button type="button" data-a="x2">×2</button><button type="button" data-a="ac">AC</button><button type="button" data-a="rebuild" class="k-red">Rebuild</button></div>` +
        `<p class="calc-note"></p><span class="calc-brand">EAI · CALC-4</span></div>`;
      $$('.knob', w.body).forEach(bindKnob);
      $('.keys', w.body).addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        SFX.click();
        const a = b.dataset.a;
        if (a === 'sync') { CALC.synced = true; CALC.clients = Math.max(1, S.clients.length); }
        if (a === 'x2') { CALC.synced = false; CALC.clients = Math.min(50, CALC.clients * 2); }
        if (a === 'ac') { CALC.synced = false; Object.assign(CALC, { clients: 3, price: 6000, hours: 40 }); }
        if (a === 'rebuild') { SFX.nope(); notify({ icon: 'calc', app: 'Calculator', title: 'Nothing to rebuild', body: 'You re-skin it for the next client. In a sentence.' }); return; }
        renderCalc();
      });
      renderCalc(w);
    },
  });
}
function arc(a0, a1, r = 26) {
  const p = (a) => [32 + r * Math.cos((a - 90) * Math.PI / 180), 32 + r * Math.sin((a - 90) * Math.PI / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
}
function renderCalc(w = WINS.find((x) => x.kind === 'calc')) {
  if (!w) return;
  const yr = CALC.clients * CALC.price * 12;
  $('.lcd-n', w.body).textContent = '$' + yr.toLocaleString('en-AU');
  $('.lcd-eq', w.body).textContent = `1 build × ${CALC.clients} client${CALC.clients > 1 ? 's' : ''} × $${CALC.price.toLocaleString('en-AU')}/mo × 12`;
  $('.calc-note', w.body).innerHTML = `Rebuilding it per client: <b>${(CALC.clients * CALC.hours).toLocaleString('en-AU')} hrs</b>. With EAI: <b>${CALC.hours} hrs</b>, once.${CALC.synced ? ' <em>Synced to your clients.</em>' : ''}`;
  $$('.knob', w.body).forEach((k) => {
    const [lo, hi] = KNOBS[k.dataset.k];
    const v = CALC[k.dataset.k];
    const a = -135 + 270 * ((v - lo) / (hi - lo));
    $('.kn-track', k).setAttribute('d', arc(-135, 135));
    $('.kn-arc', k).setAttribute('d', arc(-135, Math.max(-134.5, a)));
    $('.kn-cap', k).style.transform = `rotate(${a}deg)`;
    $('.kn-v', k).textContent = k.dataset.k === 'price' ? '$' + v.toLocaleString('en-AU') : v;
    k.setAttribute('aria-valuenow', v);
    k.setAttribute('aria-valuemin', lo);
    k.setAttribute('aria-valuemax', hi);
  });
}
function setKnob(k, v) {
  const [lo, hi, st] = KNOBS[k];
  const nv = clamp(Math.round(v / st) * st, lo, hi);
  if (nv === CALC[k]) return;
  CALC[k] = nv;
  if (k === 'clients') CALC.synced = false;
  SFX.tone(600 + (nv - lo) / (hi - lo) * 900, 0.02, 'square', 0.012);
  renderCalc();
}
function bindKnob(k) {
  const key = k.dataset.k, [lo, hi, st] = KNOBS[key];
  k.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    k.focus();
    const sy = e.clientY, sx = e.clientX, v0 = CALC[key];
    k.setPointerCapture(e.pointerId);
    const move = (ev) => setKnob(key, v0 + ((sy - ev.clientY) + (ev.clientX - sx)) * (hi - lo) / 220);
    const up = () => { k.removeEventListener('pointermove', move); k.removeEventListener('pointerup', up); };
    k.addEventListener('pointermove', move);
    k.addEventListener('pointerup', up);
  });
  k.addEventListener('wheel', (e) => { e.preventDefault(); setKnob(key, CALC[key] + (e.deltaY < 0 ? st : -st)); }, { passive: false });
  k.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); setKnob(key, CALC[key] + st); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); setKnob(key, CALC[key] - st); }
  });
}

/* ------------------------------------------------------------------ */
/* Notes, Read me, Trash, About, Keys, the "sell twice" dialog          */
/* ------------------------------------------------------------------ */
const NOTES = [
  ['The four-step rule', 'Pinned', `<h3>The four-step rule</h3><p>Every app on EAI is exactly four steps.</p><ol><li><b>Brief</b> — a form</li><li><b>Assets</b> — a data source</li><li><b>Compose</b> — an AI writer</li><li><b>Review</b> — approval</li></ol><p>Not three. Not five. Four is the product, not a default: a client learns it in a minute, and you can sell it again tomorrow.</p><p class="n-hand">Tried to add a fifth? It’s in the Trash.</p>`],
  ['Rebrand in a sentence', 'Today', `<h3>Rebrand in a sentence</h3><p>Tell the builder <q>make it for Apple</q>. EAI reads apple.com for colours, logo and tone of voice.</p><p>The same app wears their brand and writes in their voice. Same wiring underneath — nothing is rebuilt.</p><p class="n-hand">⌘K, then type any company.</p>`],
  ['Two chats', 'Today', `<h3>Two chats. Two people.</h3><p><b>Builder chat</b> — you, building. On the left of the EAI Builder, in EAI’s colours. It changes the app: steps, brand, wiring.</p><p><b>In-app assistant</b> — your client’s team, using the app. On the right of every published app, in <em>their</em> brand. It helps with the work: subject lines, shorter intros, tone checks. It never changes how the app is built.</p>`],
  ['AI in every app', 'Yesterday', `<h3>AI in every app</h3><p>Every app you publish ships with its own assistant — the Nike assistant for Nike’s team, the CommBank assistant for CommBank’s.</p><p>It knows the campaign and it writes in the client’s voice.</p>`],
  ['Phone & share', 'Yesterday', `<h3>On their phone</h3><p>Share gives your client a link or a QR code. Their app opens on their phone — same four steps, their brand.</p><p class="n-hand">Open Phone in the dock.</p>`],
];
function appNotes(o = {}) {
  return openWin({
    id: 'notes', title: 'Notes — The four-step rule', icon: ICONS.notes, cls: 'w-notes', geom: geomFor('notes'), from: o.from, minW: 420, minH: 280,
    content: (w) => {
      w.body.innerHTML = `<div class="notes"><aside class="nt-list">${NOTES.map((n, i) => `<button type="button" data-i="${i}" class="${i ? '' : 'on'}"><b>${n[0]}</b><small>${n[1]}</small></button>`).join('')}</aside><article class="nt-doc" contenteditable="true" spellcheck="false">${NOTES[0][2]}</article></div>`;
      $('.nt-list', w.body).addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        $$('.nt-list button', w.body).forEach((x) => x.classList.toggle('on', x === b));
        $('.nt-doc', w.body).innerHTML = NOTES[+b.dataset.i][2];
        setTitle(w, `Notes — ${NOTES[+b.dataset.i][0]}`);
      });
    },
  });
}
function appReadme(o = {}) {
  return openWin({
    id: 'readme', title: 'Read me.txt', icon: ICONS.readme, cls: 'w-readme', geom: geomFor('readme'), from: o.from, minW: 380, minH: 320,
    content: (w) => {
      w.body.innerHTML = `<div class="rm"><p class="rm-k">READ ME.TXT · 1 KB · plain text</p><h2>Build once.<br />Sell to many.</h2>
        <p>You’re looking at EAI OS. Everything on this desktop is the pitch: you build an app once for one client, then sell it to many.</p>
        <ol>
          <li><b>Four steps.</b> Every app is exactly four: Brief, Assets, Compose, Review. <button type="button" data-go="notes">Open Notes</button></li>
          <li><b>Rebrand in a sentence.</b> Tell the builder “make it for Apple”. It reads apple.com and the same app wears their brand. <button type="button" data-go="spot">⌘K</button></li>
          <li><b>AI in every app.</b> Each client window has its own assistant on the right — in their brand, for their team.</li>
          <li><b>On their phone.</b> Share a link or QR. <button type="button" data-go="phone">Open Phone</button></li>
        </ol>
        <div class="rm-two"><div class="rm-b"><i>◧</i><b>Builder chat</b><span>You, building. Left of the Builder. EAI’s colours.</span></div><div class="rm-a"><i>◨</i><b>In-app assistant</b><span>The client’s team, using the app. Right of every app. Their colours.</span></div></div>
        <div class="rm-cta"><b>What would you sell twice?</b><a href="#c-cta" class="rm-start">Start building</a></div></div>`;
      $$('[data-go]', w.body).forEach((b) => b.addEventListener('click', () => (b.dataset.go === 'spot' ? openSpot() : openApp(b.dataset.go))));
    },
  });
}
let TRASH = [
  ['five-step-app.draft', 'Apps have four steps. This one had five.', 'It’s staying in there. Four steps.'],
  ['rebuild-for-apple-FINAL.zip', 'You don’t rebuild for the next client. You re-skin.', 'Put back? You’d be rebuilding for no reason.'],
  ['brand-guidelines-v7-FINAL-final.pdf', 'EAI reads their website instead.', 'The website is more up to date anyway.'],
  ['one-chatbot-for-everyone.exe', 'Every app ships with its own assistant now.', 'Each client gets their own. In their brand.'],
  ['client-3-kickoff-deck.key', 'Client three got the same app, in their brand, in a sentence.', 'No kickoff needed. They’re already live.'],
];
function appTrash(o = {}) {
  return openWin({
    id: 'trash', title: 'Trash', icon: ICONS.trash, cls: 'w-trash', geom: geomFor('trash'), from: o.from, minW: 380, minH: 260,
    content: (w) => { renderTrash(w); },
  });
}
function renderTrash(w = WINS.find((x) => x.kind === 'trash')) {
  if (!w) return;
  w.body.innerHTML = `<div class="tr"><div class="tr-bar"><span>${TRASH.length} item${TRASH.length === 1 ? '' : 's'}</span><button type="button" class="tr-empty"${TRASH.length ? '' : ' disabled'}>Empty Trash</button></div>` +
    (TRASH.length ? `<ul class="tr-list">${TRASH.map((t, i) => `<li><span class="tr-f">${t[0].split('.').pop()}</span><div><b>${esc(t[0])}</b><small>${esc(t[1])}</small></div><button type="button" data-i="${i}">Put back</button></li>`).join('')}</ul>` : '<p class="tr-none">Empty. Zero rebuilds, zero regrets.</p>') + '</div>';
  $('.tr-empty', w.body).addEventListener('click', emptyTrash);
  $$('.tr-list button', w.body).forEach((b) => b.addEventListener('click', () => {
    SFX.nope();
    const t = TRASH[+b.dataset.i];
    notify({ icon: 'trash', app: 'Trash', title: 'Nope', body: esc(t[2]) });
    const li = b.closest('li');
    if (!FAST) li.animate([{ transform: 'none' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], { duration: 300 });
  }));
}
function emptyTrash() {
  if (!TRASH.length) return;
  TRASH = [];
  SFX.close();
  renderTrash();
  notify({ icon: 'trash', app: 'Trash', title: 'Trash emptied', body: 'The rebuilds are gone for good.' });
}
function appAbout(o = {}) {
  return openWin({
    id: 'about', title: 'About EAI OS', icon: ICONS.about, cls: 'w-about', geom: geomFor('about'), from: o.from, minW: 320, minH: 280,
    content: (w) => {
      w.body.innerHTML = `<div class="ab"><div class="ab-mark">${EAI_MARK}</div><h3>EAI OS</h3><p class="ab-v">Version 4.4 “Four Steps”</p>
      <dl><dt>Processor</dt><dd>One build</dd><dt>Memory</dt><dd>Every client’s brand</dd><dt>Assistants</dt><dd>One per app</dd><dt>Rebuilds</dt><dd>0</dd><dt>Serial</dt><dd>SELL-TO-MANY</dd></dl>
      <p class="ab-c">© 2026 Enterprise AI</p></div>`;
    },
  });
}
function appKeys(o = {}) {
  return openWin({
    id: 'keys', title: 'Keyboard shortcuts', icon: ICONS.keys, cls: 'w-keys', geom: geomFor('keys'), from: o.from, minW: 320, minH: 260,
    content: (w) => {
      const rows = [['⌘K', 'Spotlight — type a client to publish'], ['/', 'Spotlight, too'], ['⌥T', 'Tile windows'], ['⌥C', 'Cascade windows'], ['⌥M', 'Minimise window'], ['⌥W', 'Close window'], ['Esc', 'Close menus'], ['?', 'This window'], ['Right-click', 'Menus on the desktop, icons and title bars']];
      w.body.innerHTML = `<div class="ky">${rows.map(([k, d]) => `<div><kbd>${k}</kbd><span>${d}</span></div>`).join('')}</div>`;
    },
  });
}
function appAsk(o = {}) {
  return openWin({
    id: 'ask', title: 'EAI OS', icon: ICONS.about, cls: 'w-ask', geom: geomFor('ask'), from: o.from, minW: 360, minH: 210,
    content: (w) => {
      const n = S.clients.length;
      w.body.innerHTML = `<div class="ask"><span class="ask-i">${ICONS.builder}</span><div class="ask-tx"><b>What would you sell twice?</b><p>You built one app. It’s running for ${n || 'your'} client${n === 1 ? '' : 's'}. Name the next — any company.</p>` +
        `<form class="ask-f"><input type="text" placeholder="e.g. Qantas" aria-label="Next client" autocomplete="off" spellcheck="false" /><button type="submit">Publish</button></form>` +
        `<div class="ask-row"><a href="#c-cta" class="ask-start">Start building →</a><button type="button" class="ask-no">Not now</button></div></div></div>`;
      $('.ask-f', w.body).addEventListener('submit', (e) => {
        e.preventDefault();
        const v = $('input', w.body).value.trim();
        if (!v) { $('input', w.body).focus(); return; }
        closeWin(w);
        enqueue(() => publish(v));
      });
      $('.ask-no', w.body).addEventListener('click', () => closeWin(w));
    },
  });
}
const APPS = { builder: appBuilder, clients: appClients, phone: appPhone, calc: appCalc, notes: appNotes, readme: appReadme, trash: appTrash, about: appAbout, keys: appKeys, ask: appAsk };
APPS.phone.refresh = (w) => renderPhone(w);

/* ------------------------------------------------------------------ */
/* Mobile: a home screen; publishing installs client apps              */
/* ------------------------------------------------------------------ */
function addHomeIcon(c) {
  let b = $(`.dicon[data-client="${c.idx}"]`);
  const fresh = !b;
  if (!b) {
    b = el('button', 'dicon client-ico');
    b.type = 'button';
    b.dataset.client = c.idx;
    $('#icons').appendChild(b);
  }
  b.innerHTML = `<span class="dicon-img">${c.brand.loading ? '<span class="ct ct-load"></span>' : clientTile(c.brand)}</span><span class="dicon-l">${esc(c.brand.name)}</span>`;
  if (fresh && !FAST) b.animate([{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 1, offset: 0.7 }, { transform: 'scale(1)' }], { duration: 520, easing: 'ease-out' });
}
$('#mHome').addEventListener('click', goHome);
function goHome() { WINS.filter((w) => !w.min).forEach((w) => minimiseWin(w)); }
mq.addEventListener('change', () => {
  MOBILE = mq.matches;
  if (MOBILE) {
    WINS.forEach((w) => { if (w.chip) { w.chip.remove(); w.chip = null; } });
    S.clients.forEach(addHomeIcon);
  } else {
    WINS.filter((w) => w.min && !w.chip).forEach((w) => { w.min = false; minimiseWin(w, true); });
    WINS.forEach((w) => { w.x = clamp(w.x, 0, desk.clientWidth - 120); w.y = clamp(w.y, 0, desk.clientHeight - 120); applyGeom(w); });
  }
  drawCables();
});
addEventListener('resize', () => {
  if (MOBILE) return;
  const { W, H } = deskSize();
  WINS.forEach((w) => { w.x = clamp(w.x, -w.w + 90, W - 90); w.y = clamp(w.y, 0, H - 44); applyGeom(w); });
  drawCables();
});

/* ------------------------------------------------------------------ */
/* Keyboard                                                            */
/* ------------------------------------------------------------------ */
addEventListener('keydown', (e) => {
  const inField = e.target.closest && e.target.closest('input, textarea, [contenteditable="true"]');
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (spot.hidden) openSpot(); else closeSpot(); return; }
  if (e.key === 'Escape') { if (!spot.hidden) closeSpot(); else if (!ctx.hidden) hideCtx(); return; }
  if (inField) return;
  if (e.key === '/') { e.preventDefault(); openSpot(); return; }
  if (e.key === '?') { openApp('keys'); return; }
  if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('dicon')) { e.preventDefault(); openIcon(e.target); return; }
  if (e.altKey && !e.metaKey && !e.ctrlKey) {
    const f = S.focused;
    const act = { KeyT: tile, KeyC: cascade, KeyW: () => f && closeWin(f), KeyM: () => f && minimiseWin(f) }[e.code];
    if (act) { e.preventDefault(); act(); }
  }
});

/* ------------------------------------------------------------------ */
/* Boot, autoplay, takeover                                            */
/* ------------------------------------------------------------------ */
const BOOT_LINES = [
  ['EAI OS 4.4 “Four Steps”', ''],
  ['checking four-step rule', 'enforced'],
  ['mounting /Clients', '3 found'],
  ['reading brand kits', 'nike · apple · commbank'],
  ['starting builder chat', 'you, building'],
  ['starting in-app assistants', 'one per app'],
  ['rebuilds scheduled', 'none'],
];
async function boot() {
  const b = $('#boot');
  if (!b) return;
  if (FAST || params.has('noboot')) { b.remove(); return; }
  let skip = false;
  const sk = () => { skip = true; };
  b.addEventListener('pointerdown', sk);
  addEventListener('keydown', sk, { once: true });
  const log = $('#bootLog'), bar = $('#bootBar');
  await sleep(350);
  SFX.boot();
  for (let i = 0; i < BOOT_LINES.length && !skip; i++) {
    const [a, v] = BOOT_LINES[i];
    log.appendChild(el('li', i ? '' : 'first', `<span>${a}</span>${v ? `<i></i><b>${v}</b>` : ''}`));
    bar.style.width = ((i + 1) / BOOT_LINES.length) * 100 + '%';
    await sleep(i ? 190 : 360);
  }
  bar.style.width = '100%';
  if (!skip) await sleep(320);
  removeEventListener('keydown', sk);
  b.classList.add('off');
  await sleep(560);
  b.remove();
}

function setPill(state) {
  const p = $('#mbAuto'), t = $('#mbAutoText');
  p.dataset.state = state;
  t.textContent = state === 'auto' ? 'Autoplay · click anywhere to take over' : state === 'you' ? 'You’re driving · ⌘K publishes for any client' : 'Your turn · ⌘K publishes for any client';
}
$('#mbAuto').addEventListener('click', () => { if (!S.auto) replay(); });
function takeover(e) {
  if (!S.auto) return;
  if (e && e.target && e.target.closest && e.target.closest('.mb-classic, #mbSound, .mb-auto')) return;
  S.run.cancelled = true;
  S.auto = false;
  if (BLD.autoTyping) { BLD.input.value = ''; BLD.autoTyping = false; BLD.root.classList.remove('auto-typing'); }
  setPill('you');
}
os.addEventListener('pointerdown', takeover, true);
addEventListener('keydown', (e) => { if (!['Shift', 'Meta', 'Control', 'Alt', 'CapsLock'].includes(e.key) && S.booted) takeover(e); }, true);

async function autoType(text, r) {
  if (FAST) { await handleCmd(text); return; }
  const inp = BLD.input;
  BLD.autoTyping = true;
  BLD.root.classList.add('auto-typing');
  inp.value = '';
  for (const ch of text) {
    if (r.cancelled) throw new Cancelled();
    inp.value += ch;
    inp.scrollLeft = inp.scrollWidth;
    await sleep(34 + Math.random() * 34);
  }
  await sleep(300);
  if (r.cancelled) throw new Cancelled();
  inp.value = '';
  BLD.autoTyping = false;
  BLD.root.classList.remove('auto-typing');
  const btn = $('.bc-comp button', BLD.root);
  btn.classList.add('pressed');
  setTimeout(() => btn.classList.remove('pressed'), 200);
  await enqueue(() => handleCmd(text));
}
async function autoplay() {
  const r = S.run = { cancelled: false };
  S.auto = true;
  setPill('auto');
  const A = async (ms) => { await wait(ms); if (r.cancelled) throw new Cancelled(); };
  try {
    await A(300);
    notify({ icon: 'about', title: 'Welcome to EAI OS', body: 'This whole desktop is the pitch. Watch — or click anything to take over.', ttl: 6500 });
    await A(700);
    if (!BLD.w) openApp('builder', { from: $('.dock .dk[data-open="builder"] .dk-img').getBoundingClientRect() });
    await A(900);
    await autoType('Build a campaign email app for Nike', r);
    await A(900);
    const chip = BLD.root && $('.pc[data-c="nike"]', BLD.root);
    if (chip && !S.clients.some((c) => c.brand === BRANDS.nike)) {
      chip.classList.add('pressed');
      await A(260);
      chip.classList.remove('pressed');
      await enqueue(() => publish('Nike', { fromEl: chip }));
    }
    await A(4200);
    await autoType('Now sell it to Apple and CommBank', r);
    await A(3800);
    await autoType('Add an approval step', r);
    await A(1800);
    if (MOBILE) {
      goHome();
      notify({ icon: 'clients', app: 'Clients', title: `${S.clients.length} client apps installed`, body: 'One build. Tap one to use it — its assistant is inside.' });
    } else {
      notify({ icon: 'phone', app: 'Phone', title: 'Try it on your phone', body: 'Scan a QR and the client’s app opens — same four steps.', action: { label: 'Open', fn: () => openApp('phone') }, ttl: 9000 });
      await A(1200);
      openApp('ask', { from: $('.dock .dk[data-open="builder"] .dk-img').getBoundingClientRect() });
    }
    S.auto = false;
    setPill('done');
  } catch (e) {
    if (!(e instanceof Cancelled)) throw e;
  }
}

function resetAll() {
  S.run.cancelled = true;
  S.auto = false;
  [...WINS].forEach((w) => { w.closing = true; w.el.remove(); if (w.chip) w.chip.remove(); });
  WINS.length = 0;
  S.clients.forEach((c) => c.cable && c.cable.remove());
  S.clients = [];
  $$('.client-ico').forEach((x) => x.remove());
  Object.assign(S, { built: false, building: false, brand0: null, approval: false, warmer: false, focused: null, queue: Promise.resolve(), phoneClient: null });
  STEPS[3][1] = 'Checks';
  BLD.root = null; BLD.w = null; BLD.autoTyping = false;
  CALC.synced = true; CALC.clients = 3;
  toasts.innerHTML = '';
  syncDock();
}
function replay() { resetAll(); autoplay(); }
async function restart() {
  resetAll();
  const b = el('div', 'boot', `<div class="boot-in"><div class="boot-mark"><i></i><i></i><i></i><i></i></div><div class="boot-name">EAI&nbsp;OS</div><ol class="boot-log" id="bootLog"></ol><div class="boot-bar"><span id="bootBar"></span></div><div class="boot-skip">click or press any key to skip</div></div>`);
  b.id = 'boot';
  desk.appendChild(b);
  S.booted = false;
  await boot();
  S.booted = true;
  autoplay();
}

/* ------------------------------------------------------------------ */
/* Classic page hooks                                                  */
/* ------------------------------------------------------------------ */
$('#classicForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = $('#classicInput').value.trim();
  if (!v) { $('#classicInput').focus(); return; }
  $('#classicInput').value = '';
  scrollTo({ top: 0, behavior: FAST ? 'auto' : 'smooth' });
  takeover();
  setTimeout(() => enqueue(() => publish(v)), FAST ? 0 : 600);
});
$$('[data-to-desk]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: FAST ? 'auto' : 'smooth' }); }));

/* ------------------------------------------------------------------ */
/* Go                                                                  */
/* ------------------------------------------------------------------ */
(async () => {
  await boot();
  S.booted = true;
  if (params.has('manual')) { openApp('builder'); setPill('done'); return; }
  autoplay();
})();
