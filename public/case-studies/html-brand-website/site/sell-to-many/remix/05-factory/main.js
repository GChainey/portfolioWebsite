/* THE BRAND FACTORY — page shell.
   Concept: "Build once. Sell to many." as a factory line. One blank
   four-step app is assembled, then copies ride a conveyor under brand
   presses that stamp each one with a client's colours, logo and voice.
   The visitor feeds the last press with any company name.

   This file owns scroll → S.t (a continuous chapter index), chapter copy,
   the rail, the feed-the-press form, share/QR, the preview modal and the
   synthesised press sounds. The 3D scene lives in factory.js and is only
   loaded when WebGL is available and motion is welcome; otherwise the page
   renders a static, readable version with the same app drawn as images. */

import { BRANDS, BLANK, EXTRAS, resolveBrand, prepareLogos, drawFlat, shareQuery, esc, fillAssistant } from './brands.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const S = { t: 0, reduced, tint: null, visitor: null };
window.__factory = S;

const secs = [...document.querySelectorAll('.ch')];
const N = secs.length;
const chaps = secs.map((s) => s.querySelector('.chap'));
const railBtns = [...document.querySelectorAll('.rail button')];
const giants = [...document.querySelectorAll('.gw')];

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) { return false; }
}

/* ---------- Sound: synthesised, off by default ---------- */
const Sound = {
  on: false, ctx: null, hum: null,
  ensure() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },
  toggle() {
    this.on = !this.on;
    const b = $('snd');
    b.setAttribute('aria-pressed', String(this.on));
    b.querySelector('.snd-t').textContent = this.on ? 'Sound on' : 'Sound off';
    b.classList.toggle('on', this.on);
    if (this.on) {
      const ctx = this.ensure();
      const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.value = 48;
      f.type = 'lowpass'; f.frequency.value = 140;
      g.gain.value = 0;
      g.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 1.2);
      o.connect(f).connect(g).connect(ctx.destination);
      o.start();
      this.hum = { o, g };
      this.play('tick');
    } else if (this.hum) {
      const { o, g } = this.hum;
      g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
      o.stop(this.ctx.currentTime + 0.35);
      this.hum = null;
    }
  },
  noise(ctx, dur) {
    const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = ctx.createBufferSource();
    s.buffer = b;
    return s;
  },
  play(kind, k = 0) {
    if (!this.on || !this.ctx) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.value = 0.8;
    out.connect(ctx.destination);
    if (kind === 'thunk') {
      // body: a pitched-down sine; crack: filtered noise; clank: short metallic ping
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.setValueAtTime(150 - k * 12, t);
      o.frequency.exponentialRampToValueAtTime(36, t + 0.28);
      g.gain.setValueAtTime(0.9, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
      o.connect(g).connect(out); o.start(t); o.stop(t + 0.45);
      const n = this.noise(ctx, 0.2), f = ctx.createBiquadFilter(), ng = ctx.createGain();
      f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.8;
      ng.gain.setValueAtTime(0.6, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      n.connect(f).connect(ng).connect(out); n.start(t);
      const c = ctx.createOscillator(), cg = ctx.createGain();
      c.type = 'square'; c.frequency.value = 520 + k * 60;
      cg.gain.setValueAtTime(0.08, t + 0.01); cg.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      c.connect(cg).connect(out); c.start(t); c.stop(t + 0.14);
      // hydraulic hiss as the head lifts
      const h = this.noise(ctx, 0.5), hf = ctx.createBiquadFilter(), hg = ctx.createGain();
      hf.type = 'highpass'; hf.frequency.value = 3000;
      hg.gain.setValueAtTime(0.0001, t + 0.2); hg.gain.linearRampToValueAtTime(0.08, t + 0.3); hg.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
      h.connect(hf).connect(hg).connect(out); h.start(t + 0.2);
    } else {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.setValueAtTime(1400, t); o.frequency.exponentialRampToValueAtTime(700, t + 0.06);
      g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      o.connect(g).connect(out); o.start(t); o.stop(t + 0.1);
    }
  },
};
$('snd').addEventListener('click', () => Sound.toggle());

/* ---------- Scroll → t ---------- */
let tops = [], hs = [];
function measure() {
  tops = secs.map((s) => s.getBoundingClientRect().top + window.scrollY);
  hs = secs.map((s) => s.offsetHeight);
}
function tFor(y) {
  // The last chapter completes as the footer starts to arrive.
  for (let i = N - 1; i >= 0; i--) {
    if (y < tops[i]) continue;
    const h = i === N - 1 ? Math.max(1, hs[i] - window.innerHeight) : hs[i];
    return Math.min(N, i + (y - tops[i]) / h);
  }
  return 0;
}
let current = -1;
function onScroll() {
  const y = window.scrollY;
  S.t = tFor(y);
  $('prog').style.transform = `scaleX(${Math.min(1, S.t / N)})`;
  const cur = Math.min(N - 1, Math.floor(S.t + 0.1));
  if (cur !== current) {
    current = cur;
    document.body.dataset.ch = String(cur);
    if (!document.documentElement.classList.contains('is-static')) {
      chaps.forEach((c, i) => c.classList.toggle('on', i === cur));
      giants.forEach((g) => g.classList.toggle('on', +g.dataset.g === cur));
    }
    railBtns.forEach((b, i) => b.classList.toggle('on', i === cur));
    if (cur === 5) updateShare();
  }
  document.body.classList.toggle('past', S.t > N - 0.01);
}
// Where each chapter's key moment sits (local 0..1) for rail jumps.
const JUMP = [0, 0.42, 0.64, 0.18, 0.42, 0.45, 0.62];
function goChapter(i) {
  stopAuto();
  const y = tops[i] + hs[i] * (document.documentElement.classList.contains('is-static') ? 0 : JUMP[i]);
  window.scrollTo({ top: y, behavior: 'smooth' });
}
railBtns.forEach((b, i) => b.addEventListener('click', () => goChapter(i)));
document.querySelectorAll('a[href^="#ch"], a[href="#top"]').forEach((a) => a.addEventListener('click', (e) => {
  const i = secs.findIndex((s) => '#' + s.id === a.getAttribute('href'));
  if (i >= 0) { e.preventDefault(); goChapter(i); }
}));

/* ---------- "Run the line": auto-scroll through the stamping ---------- */
let auto = null;
function stopAuto() { if (auto) { cancelAnimationFrame(auto.raf); auto = null; } }
function runLine() {
  stopAuto();
  const from = window.scrollY, to = tops[3] + hs[3] * 0.1;
  const dur = 9000, t0 = performance.now();
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
  auto = {};
  const step = () => {
    const k = Math.min(1, (performance.now() - t0) / dur);
    window.scrollTo(0, from + (to - from) * ease(k));
    if (k < 1 && auto) auto.raf = requestAnimationFrame(step); else auto = null;
  };
  auto.raf = requestAnimationFrame(step);
}
['wheel', 'touchstart', 'keydown'].forEach((ev) => window.addEventListener(ev, stopAuto, { passive: true }));
$('playLine').addEventListener('click', runLine);

/* ---------- Share + preview ---------- */
const appURL = (br) => new URL('../../app.html?' + shareQuery(br), location.href).href;
function qr(canvas, url, size) {
  if (window.QRCode) window.QRCode.toCanvas(canvas, url, { width: size, margin: 0, errorCorrectionLevel: 'L', color: { dark: '#0B0518', light: '#FFFFFF' } }, () => {});
}
const shareBrand = () => S.visitor || BRANDS.commbank;
let sharedFor = null;
function updateShare() {
  const br = shareBrand();
  if (sharedFor === br) return;
  sharedFor = br;
  $('shareName').textContent = `${br.name} · Campaign email`;
  qr($('qr'), appURL(br), 132);
}
async function copy(url, btn) {
  try { await navigator.clipboard.writeText(url); btn.textContent = 'Copied'; } catch (e) { btn.textContent = 'Copy failed'; }
  setTimeout(() => { btn.textContent = 'Copy link'; }, 1600);
}
$('shareOpen').addEventListener('click', () => openModal(shareBrand()));
$('shareCopy').addEventListener('click', (e) => copy(appURL(shareBrand()), e.currentTarget));

let factory = null;
let modalBrand = null;
function openModal(br) {
  modalBrand = br;
  const url = appURL(br);
  $('mTitle').textContent = br.name;
  $('mTone').textContent = br.tone ? `Voice: ${br.tone}` : '';
  $('mFrame').src = url;
  $('mOpen').href = url;
  qr($('mQr'), url, 140);
  $('modal').hidden = false;
  document.body.classList.add('modal-open');
  requestAnimationFrame(() => $('modal').classList.add('in'));
  $('modal').querySelector('.modal-x').focus();
}
function closeModal() {
  if ($('modal').hidden) return;
  $('modal').classList.remove('in');
  document.body.classList.remove('modal-open');
  setTimeout(() => { $('modal').hidden = true; $('mFrame').src = 'about:blank'; }, 250);
  if (factory) factory.unfocus();
}
$('modal').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
$('mCopy').addEventListener('click', (e) => copy(appURL(modalBrand), e.currentTarget));

/* ---------- Feed the press ---------- */
const stampsList = $('stamps');
function onStamp(br, k) {
  if (k < 3) {
    const li = stampsList.querySelector(`[data-k="${k}"]`);
    if (li) { li.classList.remove('hit'); void li.offsetWidth; li.classList.add('hit', 'done'); }
  }
  S.tint = br.b === '#FFFFFF' ? br.head : br.b;
  if (k === 3 && pending) {
    pending.innerHTML = `<b>Done.</b> ${esc(br.name)}’s app is off the press — their colours, logo and voice. Same four steps, same wiring.`;
    pending = null;
  }
}
/* The builder chat: the maker (you) instructing EAI. Neutral, EAI-styled —
   deliberately unlike the client-branded in-app assistant. */
let pending = null;
function bcMsg(cls, html) {
  const t = $('bcThread');
  const m = document.createElement('div');
  m.className = 'bc-m ' + cls;
  m.innerHTML = html;
  t.appendChild(m);
  while (t.children.length > 4) t.firstElementChild.remove();
  t.scrollTop = t.scrollHeight;
  return m;
}
let busy = false;
async function feed(name) {
  name = name.trim().slice(0, 40);
  if (!name || busy) return;
  busy = true;
  const form = $('feed');
  form.classList.add('busy');
  $('feedIn').value = '';
  bcMsg('bc-you', `Make it for ${esc(name)}`);
  const status = bcMsg('bc-ai', `Looking up ${esc(name)}…`);
  const br = await resolveBrand(name, (msg) => { status.textContent = msg; });
  form.classList.remove('busy');
  busy = false;
  S.visitor = br;
  sharedFor = null;
  if (factory) {
    status.textContent = `Read ${br.domain || br.name}: colours, logo, tone of voice. Stamping…`;
    pending = status;
    factory.stampVisitor(br);
    // Make sure the copy is under the press.
    const minY = tops[4] + hs[4] * 0.42;
    if (window.scrollY < minY - 4 || window.scrollY > tops[5]) window.scrollTo({ top: minY, behavior: 'smooth' });
  } else {
    renderStaticYours(br);
    status.innerHTML = `<b>Done.</b> ${esc(br.name)}’s app — their colours, logo and voice. Same four steps.`;
  }
}
$('feed').addEventListener('submit', (e) => { e.preventDefault(); feed($('feedIn').value); });
$('chips').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  feed(b.textContent);
});

/* ---------- Static fallback: the same app, drawn as images ---------- */
function phoneCanvas(br, w = 240, caption) {
  const wrap = document.createElement('div');
  wrap.className = 'sp';
  const c = document.createElement('canvas');
  c.width = w * 2; c.height = w * 4;
  drawFlat(c, br);
  wrap.appendChild(c);
  if (!br.blank) {
    wrap.tabIndex = 0;
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('aria-label', `Preview ${br.name} on a phone`);
    wrap.addEventListener('click', () => openModal(br));
    wrap.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(br); } });
  }
  const cap = document.createElement('span');
  cap.className = 'sp-cap';
  cap.textContent = caption || (br.blank ? 'Master · built once' : br.name);
  wrap.appendChild(cap);
  return wrap;
}
function fig(name) { return document.querySelector(`.static-fig[data-fig="${name}"]`); }
function renderStaticYours(br) {
  const f = fig('yours');
  f.innerHTML = '';
  f.appendChild(phoneCanvas(br, 220, br.blank ? 'Your client · waiting for a name' : ''));
}
function renderStatic() {
  document.documentElement.classList.add('is-static');
  chaps.forEach((c) => c.classList.add('on'));
  stampsList.querySelectorAll('li').forEach((li) => li.classList.add('done'));
  fig('hero').appendChild(phoneCanvas(BLANK, 260));
  fig('steps').appendChild(phoneCanvas(BLANK, 220));
  [BRANDS.nike, BRANDS.apple, BRANDS.commbank].forEach((b) => fig('line').appendChild(phoneCanvas(b, 200)));
  const ai = fig('ai');
  ai.appendChild(phoneCanvas(BRANDS.nike, 200));
  const bub = $('bubble').cloneNode(true);
  bub.removeAttribute('id');
  bub.className = 'bubble on static';
  fillAssistant(bub, BRANDS.nike);
  ai.appendChild(bub);
  renderStaticYours(BLANK);
  fig('share').appendChild(phoneCanvas(BRANDS.commbank, 200));
  const fin = fig('final');
  [BRANDS.nike, BRANDS.apple, BRANDS.commbank, ...EXTRAS.slice(0, 9)].forEach((b) => fin.appendChild(phoneCanvas(b, 110)));
  updateShare();
}

/* ---------- Boot ---------- */
async function boot() {
  const ldN = $('ldN');
  let shown = 0;
  const tick = setInterval(() => { shown = Math.min(99, shown + 7 + Math.random() * 9); ldN.textContent = String(Math.floor(shown)).padStart(2, '0'); }, 60);
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]);
  await Promise.race([prepareLogos('../../'), new Promise((r) => setTimeout(r, 2000))]);
  measure();
  onScroll();
  const want3D = !reduced && hasWebGL() && !params.has('static');
  let ok = false;
  if (want3D) {
    try {
      const [{ start }, { startBg }] = await Promise.all([import('./factory.js'), import('./bg.js')]);
      startBg($('bg'), S);
      factory = start(S, {
        sound: (kind, k) => Sound.play(kind, k),
        onStamp,
        onPick: (br) => openModal(br),
        shareBrand,
        frame: () => {},
      });
      ok = true;
    } catch (e) {
      console.warn('3D unavailable, showing the static page', e);
    }
  }
  if (!ok) renderStatic();
  clearInterval(tick);
  ldN.textContent = '100';
  document.body.classList.add('ready');
  setTimeout(() => $('loader').remove(), 900);
  measure();
  onScroll();
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => { measure(); onScroll(); });
boot();
