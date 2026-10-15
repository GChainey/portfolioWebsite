/* Liquid brand — remix 10.
   Concept: the medium of the whole site is a real-time fluid simulation
   (fluid.js, stable fluids in raw WebGL2). EAI is mercury: the page itself is
   liquid metal that your cursor and your scroll stir. The client's app is a
   glass vessel in the middle. Name a client in the builder chat and their
   brand pours in as ink from their logo, swirls and settles — and the app's
   colours are read back from the settled liquid.

   Two chats, two liquids that never mix:
   - the maker's BUILDER CHAT (left, EAI mercury). Each instruction travels as a
     bead of mercury into the vessel and changes its structure (steps, brand,
     wiring);
   - the end user's IN-APP ASSISTANT (right, inside the vessel, in the client's
     brand). Asking it something only ripples the brand ink inside the app.
   Then the vessel divides like a cell into many, each with a client's liquid. */
import { Fluid, webgl2Available, hexToRgb } from './fluid.js';
import { BRANDS, MANY, esc, lookup, logoMask, inkFor, rgbOf, toHex } from './brands.js';

const $ = (id) => document.getElementById(id);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE = () => innerWidth <= 960;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const scale = (hex, k) => hexToRgb(hex).map((v) => v * k);

let GL = !REDUCED && webgl2Available();
const root = document.documentElement;
if (!GL) root.classList.add('no-gl');

/* ================= The loop ================= */
const fluids = new Set();
const tickers = new Set();
let running = false;
let last = 0;
function frame(t) {
  if (!running) return;
  const rdt = Math.min(Math.max((t - last) / 1000, 1 / 240), 0.25); // wall-clock
  const dt = Math.min(rdt, 1 / 30); // simulation step
  last = t;
  for (const fn of [...tickers]) fn(dt, t / 1000, rdt);
  for (const f of fluids) {
    if (!f.active) continue;
    f.step(dt);
    f.render();
  }
  requestAnimationFrame(frame);
}
function start() {
  if (running || document.hidden) return;
  running = true;
  last = performance.now();
  requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', () => { if (document.hidden) running = false; else start(); });

function makeFluid(canvas, opts, alwaysOn) {
  if (!GL) return null;
  try {
    const f = new Fluid(canvas, opts);
    fluids.add(f);
    if (!alwaysOn) {
      f.active = false;
      new IntersectionObserver((es) => { f.active = es[0].isIntersecting; }, { rootMargin: '80px' }).observe(canvas);
    }
    new ResizeObserver(() => f.resize()).observe(canvas);
    return f;
  } catch (e) {
    return null;
  }
}

/* ================= The page: mercury ================= */
const MERC = [0.36, 0.37, 0.4];
const page = makeFluid($('pageFluid'), { mode: 'mercury', simScale: 0.25, dyeScale: 0.5, velDiss: 0.7, dyeDiss: 0.5, curl: 9, gain: 3.2, base: '#000000' }, true);
if (GL && !page) { GL = false; root.classList.add('no-gl'); }

const ptr = { x: -1, y: -1, px: -1, py: -1, moved: false, down: false };
addEventListener('pointermove', (e) => {
  if (ptr.x < 0) { ptr.px = e.clientX; ptr.py = e.clientY; }
  ptr.x = e.clientX; ptr.y = e.clientY; ptr.moved = true;
}, { passive: true });
addEventListener('pointerdown', (e) => { ptr.down = true; burst(e.clientX, e.clientY, 0.6); }, { passive: true });
addEventListener('pointerup', () => { ptr.down = false; }, { passive: true });

function burst(x, y, amt = 1, r = 26) {
  if (!page) return;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rand(0, 0.4);
    page.splat(x + Math.cos(a) * 6, y + Math.sin(a) * 6, Math.cos(a) * 700 * amt, Math.sin(a) * 700 * amt, MERC.map((v) => v * 0.45 * amt), r);
  }
}

let lastScroll = scrollY;
let scrollAcc = 0;
addEventListener('scroll', () => { scrollAcc += scrollY - lastScroll; lastScroll = scrollY; }, { passive: true });

const stirTargets = []; // other fluids the cursor stirs: { f, el, colour() }
let ambientT = 0;
let introT = 0;
tickers.add((dt) => {
  // the cursor stirs everything it passes over
  if (ptr.moved) {
    ptr.moved = false;
    const vx = (ptr.x - ptr.px) / dt, vy = (ptr.y - ptr.py) / dt;
    const sp = Math.hypot(vx, vy);
    if (sp > 2) {
      const k = clamp(sp / 2400, 0.06, 0.55);
      if (page) page.splat(ptr.x, ptr.y, vx * 0.9, vy * 0.9, MERC.map((v) => v * k), MOBILE() ? 20 : 26);
      for (const s of stirTargets) {
        if (!s.f || !s.f.active) continue;
        const r = s.el.getBoundingClientRect();
        if (ptr.x < r.left || ptr.x > r.right || ptr.y < r.top || ptr.y > r.bottom) continue;
        const c = s.colour ? s.colour(k) : null;
        s.f.splat(ptr.x - r.left, ptr.y - r.top, vx * 0.8, vy * 0.8, c, 30);
      }
    }
    ptr.px = ptr.x; ptr.py = ptr.y;
  }
  if (!page) return;
  // scrolling pushes the liquid
  if (Math.abs(scrollAcc) > 0.5) {
    const v = clamp(-scrollAcc / dt, -2600, 2600) * 0.55;
    const W = innerWidth, Hh = innerHeight;
    page.splat(rand(0.02, 0.2) * W, rand(0.2, 0.9) * Hh, rand(-60, 60), v, MERC.map((x) => x * 0.16), 54);
    page.splat(rand(0.8, 0.98) * W, rand(0.2, 0.9) * Hh, rand(-60, 60), v, MERC.map((x) => x * 0.16), 54);
    if (Math.random() < 0.3) page.splat(rand(0.3, 0.7) * W, rand(0.1, 0.9) * Hh, rand(-100, 100), v * 0.6, MERC.map((x) => x * 0.08), 70);
    scrollAcc = 0;
  }
  // an intro pour, then slow ambient drips so a still page is still alive
  if (introT < 2.2) {
    introT += dt;
    const W = innerWidth, Hh = innerHeight;
    for (let s = 0; s < 2; s++) {
      const x = W * (s ? 0.975 : 0.025) + Math.sin(introT * 3 + s * 2) * W * 0.012;
      const y = Hh * (0.1 + introT * 0.38);
      page.splat(x, y, Math.sin(introT * 4 + s) * 180, 380, MERC.map((v) => v * 0.26), 46);
    }
  }
  ambientT -= dt;
  if (ambientT <= 0) {
    ambientT = rand(0.7, 1.6);
    const W = innerWidth, Hh = innerHeight;
    const edge = Math.random() < 0.5;
    const x = edge ? (Math.random() < 0.5 ? rand(0.02, 0.14) : rand(0.86, 0.98)) * W : rand(0.1, 0.9) * W;
    page.splat(x, rand(0.2, 0.98) * Hh, rand(-200, 200), rand(-200, 200), MERC.map((v) => v * 0.3), rand(34, 60));
  }
});

/* ================= Vessels (hero + phone) ================= */
class Vessel {
  constructor(canvas, fb, host, opts = {}) {
    this.canvas = canvas; this.fb = fb; this.host = host;
    this.f = makeFluid(canvas, Object.assign({ mode: 'ink', simScale: 0.25, dyeScale: 0.55, velDiss: 0.55, dyeDiss: 0.03, curl: 16, gain: 4, base: '#0b0b0d' }, opts));
    this.brand = null; this.effect = null; this.settle = 1; this.sampleT = 0; this.ambT = 0; this.veinT = 1;
    this.onColour = null;
    if (this.f) stirTargets.push({ f: this.f, el: canvas, colour: (k) => (this.brand ? scale(this.brand.inks[0], 0.05 * k) : null) });
    tickers.add((dt, now, rdt) => this.tick(dt, rdt));
  }
  tick(dt, rdt) {
    const f = this.f;
    if (!f || !f.active) return;
    // effects run on wall-clock time so they stay in step with the page;
    // per-frame ink is scaled by how many 60fps frames actually elapsed.
    if (this.effect && this.effect(rdt, clamp(rdt * 60, 0.5, 4), clamp(rdt * 60, 0.5, 15)) === false) this.effect = null;
    const W = f.cssW, H = f.cssH;
    if (this.brand && !this.effect) {
      this.ambT -= dt;
      if (this.ambT <= 0) {
        this.ambT = rand(0.25, 0.5);
        const ink = this.brand.inks[Math.floor(Math.random() * this.brand.inks.length)];
        f.splat(rand(0, W), rand(0, H), rand(-140, 140), rand(-140, 140), scale(ink, 0.1), Math.max(W, H) * rand(0.07, 0.11));
      }
      this.veinT -= dt;
      if (this.veinT <= 0) {
        this.veinT = rand(1.6, 3.2);
        const vn = this.brand.veins;
        if (vn) {
          const sgn = this.brand.veinSign || 1;
          const a = rand(0, Math.PI * 2);
          f.splat(rand(0.15, 0.85) * W, rand(0.15, 0.85) * H, Math.cos(a) * 420, Math.sin(a) * 420, scale(vn, (sgn < 0 ? 0.02 : 0.07) * sgn), Math.max(W, H) * (sgn < 0 ? 0.014 : 0.025));
        }
      }
    }
    // read the liquid's colour back to paint the app while it settles
    if (this.brand && this.settle < 1) {
      this.sampleT -= dt;
      if (this.sampleT <= 0) {
        this.sampleT = 0.1;
        const s = f.sample();
        const target = rgbOf(this.brand.b);
        const liq = s && s.cover > 0.05 ? s.rgb.map((v) => v * 255) : target;
        const k = ease(this.settle);
        const rgb = liq.map((v, i) => v + (target[i] - v) * k);
        if (this.onColour) this.onColour(toHex(rgb));
      }
    }
  }
  // Pour a brand in: drain the old ink, bloom the new from the logo, swirl, settle.
  async pour(br) {
    this.brand = br;
    this.settle = 0;
    const f = this.f;
    if (!f) {
      const h = this.host;
      h.style.setProperty('--ink1', br.inks[0]);
      h.style.setProperty('--ink2', br.inks[1]);
      h.style.setProperty('--ink3', br.inks[2]);
      await sleep(REDUCED ? 50 : 900);
      this.settle = 1;
      if (this.onColour) this.onColour(br.b);
      return;
    }
    const mask = await logoMask(br);
    if (this.tex) f.gl.deleteTexture(this.tex);
    const tex = (this.tex = f.logoTexture(mask.image));
    const W = f.cssW, H = f.cssH;
    const size = Math.min(W, H) * 0.46;
    const rect = { x: W / 2 - size / 2, y: H / 2 - size / 2, w: size, h: size };
    const inks = br.inks;
    let t = 0;
    return new Promise((res) => {
      this.effect = (rdt, k, frames) => {
        t += rdt;
        const chance = (p) => Math.random() < 1 - Math.pow(1 - p, k);
        const count = (p) => Math.floor(p * frames + Math.random()); // splats owed since last frame
        if (t < 0.8) { f.fade(Math.pow(0.9, frames)); f.fade(Math.pow(0.96, frames), 'vel'); }
        if (t > 0.42 && t < 1.3) {
          const kk = 1 - (t - 0.42) / 0.88;
          const ink = inks[Math.floor(t * 24) % inks.length];
          const early = t < 0.62;
          f.logoSplat(tex, rect, ink, (0.34 * kk + 0.04) * k, early ? 760 : 0, early ? 300 : 0);
        }
        if (t > 0.5 && t < 1.9) {
          const i = Math.floor(t * 30) % inks.length;
          const x = W * (0.5 + 0.34 * Math.sin(t * 4.1));
          f.splat(x, 2, rand(-240, 240), 1100, scale(inks[i], 0.32 * k), W * 0.03);
          f.splat(W * (0.5 - 0.3 * Math.sin(t * 3.3)), H - 2, rand(-200, 200), -800, scale(inks[(i + 1) % inks.length], 0.22 * k), W * 0.028);
        }
        if (t > 0.9 && t < 2.4 && chance(0.35)) {
          const a = rand(0, Math.PI * 2);
          f.splat(rand(0.1, 0.9) * W, rand(0.1, 0.9) * H, Math.cos(a) * 700, Math.sin(a) * 700, scale(inks[Math.floor(rand(0, 3))], 0.2), W * 0.05);
        }
        if (br.veins && t > 1.1 && t < 2.6 && chance(0.18)) {
          const a = rand(0, Math.PI * 2);
          f.splat(rand(0.2, 0.8) * W, rand(0.2, 0.8) * H, Math.cos(a) * 600, Math.sin(a) * 600, scale(br.veins, (br.veinSign === -1 ? 0.03 : 0.09) * (br.veinSign || 1)), W * (br.veinSign === -1 ? 0.012 : 0.02));
        }
        if (t > 1.5 && t < 3.6) {
          for (let n = count(0.6); n > 0; n--) {
            f.splat(rand(0, W), rand(0, H), rand(-90, 90), rand(-90, 90), scale(inks[Math.random() < 0.7 ? 0 : 1], 0.24), Math.max(W, H) * 0.13);
          }
        }
        if (t > 2.3) f.fade(Math.pow(0.985, frames), 'vel');
        this.settle = clamp((t - 1.5) / 2.3);
        if (t > 3.9) { this.settle = 1; if (this.onColour) this.onColour(br.b); res(); return false; }
        return true;
      };
    });
  }
  // The end user's ripple: brand ink only, inside this vessel only.
  ripple(x, y) {
    const f = this.f;
    if (!f || !this.brand) return;
    let t = 0, ring = 0;
    const inks = this.brand.inks;
    let prev = this.effect;
    this.effect = (rdt, k) => {
      if (prev && prev(rdt, k) === false) prev = null;
      t += rdt;
      if (ring < 3 && t > ring * 0.22) {
        const R = 10 + ring * 22;
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2 + ring;
          f.splat(x + Math.cos(a) * R, y + Math.sin(a) * R, Math.cos(a) * (1100 - ring * 250), Math.sin(a) * (1100 - ring * 250), scale(inks[(i + ring) % 3], 0.08), 18);
        }
        ring++;
      }
      return t < 0.8 || !!prev;
    };
  }
}

/* ================= Hero: builder chat + vessel ================= */
const vesselEl = $('vessel');
const hero = new Vessel($('vFluid'), vesselEl.querySelector('.v-fallback'), vesselEl);
hero.onColour = (hex) => paintBrand(vesselEl, hex);
function paintBrand(el, hex) {
  el.style.setProperty('--brand', hex);
  el.style.setProperty('--brand-on', inkFor(hex));
}
BRANDS.nike.veinSign = 1;
BRANDS.apple.veinSign = 1;
BRANDS.commbank.veinSign = -1;
BRANDS.nike.drop = '#FA5400';
BRANDS.apple.drop = '#F5F5F7';

const NEUTRAL = {
  name: 'Campaign email', subjects: ['Your subject line'], body: 'The AI writer drafts this from the brief — in the client’s voice, once you name one.',
  cta: 'Call to action', goal: 'What is this email for?', audience: 'Who is it for?', date: 'When does it send?', tone: 'Set by the client’s brand',
  files: ['brand-guide.pdf', 'tone-of-voice.docx', 'product-shots.zip'],
};
const S = { built: false, brand: null, step: 2, subj: '', body: '', tone: '', approver: 'the marketing lead', rewired: false };
const logoHTML = (br) => br.logo || `<span class="letter">${esc(br.name[0].toUpperCase())}</span>`;

const stepsEl = $('steps');
const stepLis = [...stepsEl.children];
const view = $('view');
stepLis.forEach((li) => li.classList.add('slot'));
stepLis.forEach((li, i) => li.addEventListener('click', () => { if (S.built) goStep(i); }));

function goStep(i) {
  S.step = i;
  stepLis.forEach((li, j) => li.classList.toggle('cur', j === i));
  const b = S.brand || NEUTRAL;
  let h = '';
  if (i === 0) {
    h = `<div class="v-grid">
      <div class="v-field"><p class="fl">Goal</p><p>${esc(b.goal)}</p></div>
      <div class="v-field"><p class="fl">Audience</p><p>${esc(b.audience)}</p></div>
      <div class="v-field"><p class="fl">Send date</p><p>${esc(b.date)}</p></div>
      <div class="v-field"><p class="fl">Tone of voice</p><p>${esc(S.tone || b.tone)}</p></div></div>`;
  } else if (i === 1) {
    const sizes = ['2.4 MB', '48 KB', '186 MB'];
    h = `<p class="fl">Their files</p><ul class="v-files">${b.files.map((f, j) => `<li><i></i>${esc(f)}<span>${sizes[j]}</span></li>`).join('')}</ul>`;
  } else if (i === 2) {
    h = `<p class="fl">Subject</p><p class="v-subj">${esc(S.subj || b.subjects[0])}</p>
      <p class="fl">Body</p><p class="v-body" id="vBody">${esc(S.body || b.body)}</p>
      <span class="v-cta">${esc(b.cta)}</span>`;
  } else {
    h = `<div class="v-review"><p class="fl">Ready for approval</p><p class="v-subj">${esc(S.subj || b.subjects[0])}</p><p class="v-body">${esc(S.body || b.body)}</p></div>
      <div class="v-approve"><span class="v-cta">Approve</span>Needs: ${esc(S.approver)}</div>`;
  }
  view.innerHTML = `<div class="v-anim">${h}</div>`;
}

/* ---- builder chat ---- */
const bThread = $('bThread');
const bInput = $('bInput');
let bLast = null;
function bAdd(kind, html, cls = '') {
  if (bLast !== kind) {
    const who = document.createElement('p');
    who.className = 'who' + (kind === 'me' ? ' r' : '');
    who.innerHTML = kind === 'me' ? 'You, building <span class="av me">Y</span>' : '<span class="av eai"></span>EAI Builder';
    bThread.appendChild(who);
    bLast = kind;
  }
  const m = document.createElement('div');
  m.className = `m ${kind} ${cls}`;
  m.innerHTML = html;
  bThread.appendChild(m);
  bThread.scrollTop = bThread.scrollHeight;
  return m;
}
const swatchRow = (br) => `<div class="sw-row">${br.swatches.map((c) => `<i style="background:${esc(c)}"></i>`).join('')}</div>`;

/* ---- mercury bead: an instruction travelling into the glass ---- */
function stream(fromEl, toEl, dur = 900) {
  if (REDUCED) return sleep(60);
  const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
  const p0 = { x: a.right - 14, y: a.top + a.height / 2 };
  const p2 = { x: b.left + b.width / 2, y: b.top + b.height / 2 };
  const p1 = { x: (p0.x + p2.x) / 2, y: Math.min(p0.y, p2.y) - 90 };
  const bead = document.createElement('div');
  bead.className = 'bead';
  bead.style.position = 'fixed'; bead.style.left = '0'; bead.style.top = '0';
  document.body.appendChild(bead);
  return new Promise((res) => {
    let t = 0, prev = p0;
    const tk = (sdt, now, dt) => {
      t += (dt * 1000) / dur;
      const e = ease(Math.min(t, 1)), u = 1 - e;
      const p = { x: u * u * p0.x + 2 * u * e * p1.x + e * e * p2.x, y: u * u * p0.y + 2 * u * e * p1.y + e * e * p2.y };
      bead.style.transform = `translate(${p.x}px, ${p.y}px) scale(${1.1 - 0.5 * e})`;
      if (page) page.splat(p.x, p.y, ((p.x - prev.x) / dt) * 0.8, ((p.y - prev.y) / dt) * 0.8, MERC.map((v) => v * 0.9), 13);
      prev = p;
      if (t >= 1) {
        tickers.delete(tk);
        bead.remove();
        vesselEl.classList.add('glint');
        setTimeout(() => vesselEl.classList.remove('glint'), 500);
        res();
      }
    };
    tickers.add(tk);
  });
}

/* ---- the vessel's app ---- */
const aLogo = $('aLogo'), aName = $('aName'), aFor = $('aFor');
const asLogo = $('asLogo'), asName = $('asName'), asFor = $('asFor');
const asThread = $('asThread'), asInput = $('asInput'), asForm = $('asForm');
const logoDrop = $('logoDrop');

async function buildApp(msgEl) {
  bAdd('eai', 'Four steps, as always:<div class="step-list"><span>Brief · Form</span><span>Assets · Data source</span><span>Compose · AI writer</span><span>Review · Approval</span></div>');
  vesselEl.classList.remove('empty');
  aFor.textContent = 'Four steps · no brand yet';
  view.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const done = stream(msgEl, stepLis[i], 700 + i * 90);
    await sleep(REDUCED ? 0 : 170);
    done.then(() => {
      stepLis[i].classList.remove('slot');
      stepLis[i].classList.add('condense');
      setTimeout(() => stepLis[i].classList.remove('condense'), 1100);
    });
  }
  await sleep(REDUCED ? 100 : 1250);
  S.built = true;
  goStep(2);
}

function applyBrand(br) {
  S.brand = br; S.subj = ''; S.body = ''; S.tone = '';
  aLogo.innerHTML = logoHTML(br);
  aName.textContent = br.name;
  aFor.textContent = 'Campaign email';
  asLogo.innerHTML = logoHTML(br);
  asName.textContent = `${br.name} assistant`;
  asFor.textContent = `${br.teamShort || br.name + ' team'}, using the app`;
  asInput.placeholder = `Ask the ${br.name} assistant…`;
  asInput.disabled = false;
  asForm.querySelector('button').disabled = false;
  vesselEl.style.setProperty('--afont', br.font);
  asThread.innerHTML = '';
  asLast = null;
  asAdd('a', `Hi — I’m the ${esc(br.name)} assistant. I help ${esc(br.team || 'the team')} write this email, in ${esc(br.name)}’s voice.`);
  const img = aLogo.querySelector('img');
  if (img) img.onerror = () => { aLogo.innerHTML = `<span class="letter">${esc(br.name[0])}</span>`; asLogo.innerHTML = aLogo.innerHTML; };
  goStep(S.step);
  $('legendInk').style.background = br.b;
  syncSections(br);
}

async function pourHero(br) {
  if (REDUCED || !GL) {
    const p = hero.pour(br);
    applyBrand(br);
    await p;
    return;
  }
  vesselEl.classList.add('pouring');
  logoDrop.className = 'logo-drop';
  logoDrop.innerHTML = logoHTML(br);
  logoDrop.style.setProperty('--drop', br.drop || br.b);
  requestAnimationFrame(() => logoDrop.classList.add('show'));
  const p = hero.pour(br);
  await sleep(700);
  logoDrop.classList.add('dissolve');
  await sleep(1250);
  applyBrand(br);
  await sleep(250);
  vesselEl.classList.remove('pouring');
  await p;
  logoDrop.className = 'logo-drop';
}

/* ---- the end user's assistant ---- */
let asLast = null;
function asAdd(kind, html, cls = '') {
  const br = S.brand;
  if (asLast !== kind && br) {
    const who = document.createElement('p');
    who.className = 'who' + (kind === 'u' ? ' r' : '');
    who.innerHTML = kind === 'u'
      ? `${esc(br.teamShort || br.name + ' team')}, using the app <span class="av team">${esc(br.initials || br.name.slice(0, 2).toUpperCase())}</span>`
      : `<span class="av bot">${logoHTML(br)}</span>${esc(br.name)} assistant`;
    asThread.appendChild(who);
    asLast = kind;
  }
  const m = document.createElement('div');
  m.className = `am ${kind} ${cls}`;
  m.innerHTML = html;
  asThread.appendChild(m);
  asThread.scrollTop = asThread.scrollHeight;
  return m;
}
let asking = false;
async function ask(q) {
  const br = S.brand;
  if (!br || asking) return;
  asking = true;
  asAdd('u', esc(q));
  // ripple the brand ink — inside the vessel only
  const vr = vesselEl.getBoundingClientRect();
  const sr = asForm.getBoundingClientRect();
  const x = sr.left + sr.width * 0.6 - vr.left, y = sr.top + sr.height / 2 - vr.top;
  hero.ripple(x, y);
  if (!REDUCED) {
    const ring = document.createElement('i');
    ring.className = 'ring';
    ring.style.left = x + 'px'; ring.style.top = y + 'px';
    vesselEl.appendChild(ring);
    setTimeout(() => ring.remove(), 1200);
  }
  const th = asAdd('a', 'Writing', 'think');
  await sleep(REDUCED ? 200 : 900);
  const ql = q.toLowerCase();
  if (/subject/.test(ql)) {
    th.className = 'am a';
    th.innerHTML = `Three, in ${esc(br.name)}’s voice:<ul>${br.subjects.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`;
    S.subj = br.subjects[0];
  } else if (/short|trim|tighten|intro|brief/.test(ql)) {
    th.className = 'am a';
    th.innerHTML = `Shorter: “${esc(br.short)}” — I’ve put it in the body.`;
    S.body = br.short;
    if (S.step !== 2) goStep(2); else goStep(2);
    const vb = $('vBody');
    if (vb) { vb.classList.add('fresh'); setTimeout(() => vb.classList.remove('fresh'), 1400); }
  } else if (/step|brand|colou?r|logo|wiring|rebuild|add|remove/.test(ql)) {
    th.className = 'am a';
    th.innerHTML = `I help with the work inside this app — the email, the words. Changes to the app itself come from whoever built it.`;
  } else {
    th.className = 'am a';
    th.innerHTML = `On it — in ${esc(br.name)}’s voice (${esc(br.tone.toLowerCase())}): “${esc(br.subjects[1])}.”`;
  }
  asThread.scrollTop = asThread.scrollHeight;
  asking = false;
}
asForm.addEventListener('submit', (e) => {
  e.preventDefault();
  cancelAuto();
  const q = asInput.value.trim();
  if (!q) return;
  asInput.value = '';
  ask(q);
});
$('asChips').addEventListener('click', (e) => {
  const b = e.target.closest('[data-ask]');
  if (!b || !S.brand) return;
  cancelAuto();
  ask(b.dataset.ask);
});

/* ---- builder commands ---- */
let chain = Promise.resolve();
const queue = (fn) => (chain = chain.then(fn).catch(() => {}));

function handle(text) {
  const t = text.trim();
  if (!t) return chain;
  const msg = bAdd('me', esc(t));
  return queue(async () => {
    if (!S.built) await buildApp(msg);
    const m = t.match(/\bfor\s+(.+?)[.!?]*$/i);
    if (m && !/\b(step|approv)/i.test(m[1])) return rebrand(m[1], msg);
    if (/(add|new|another|extra|fifth|more).{0,12}step/i.test(t)) { bAdd('eai', 'Four steps. That’s the rule — it’s what makes the app resellable. I can change what a step does instead: try “Make Review need two approvers”.'); return; }
    if (/approv|step/i.test(t)) return approval(msg);
    if (/tone|warm|friendl|formal|playful|voice|casual/i.test(t)) return tone(t, msg);
    if (t.split(/\s+/).length <= 3 && !/^(hi|hello|hey|help)\b/i.test(t)) return rebrand(t.replace(/^(make it|now)\s+/i, ''), msg);
    bAdd('eai', 'I change the app itself — its steps, its brand, its wiring. Try “Make it for Qantas”, or “Make Review need two approvers”.');
  });
}

async function rebrand(name, msg) {
  const clean = name.replace(/^(the|a)\s+/i, '').trim();
  const th = bAdd('eai', `Reading ${esc(clean)}`, 'think');
  const br = await lookup(clean, (s) => { th.textContent = `${s} — colours, logo, tone`; });
  await stream(msg, $('app').querySelector('.app-bar'), 800);
  th.className = 'm eai';
  th.innerHTML = `Pouring in ${esc(br.name)}’s brand…`;
  bThread.scrollTop = bThread.scrollHeight;
  await pourHero(br);
  th.innerHTML = `Done. ${esc(br.name)}’s colours, logo and voice — <i>${esc(br.tone)}</i>. Same four steps underneath.${swatchRow(br)}`;
  bThread.scrollTop = bThread.scrollHeight;
}

async function approval(msg) {
  const th = bAdd('eai', 'Rewiring', 'think');
  await stream(msg, stepLis[3], 800);
  S.approver = 'two approvers';
  const li = stepLis[3];
  li.querySelector('small').textContent = '→ 2 approvers';
  li.classList.add('condense', 'rewired');
  setTimeout(() => li.classList.remove('condense'), 1100);
  goStep(3);
  th.className = 'm eai';
  th.innerHTML = `Still four steps — apps always are. Review now needs two approvers before anything sends.`;
  bThread.scrollTop = bThread.scrollHeight;
}

async function tone(t, msg) {
  const th = bAdd('eai', 'Adjusting the tone', 'think');
  await stream(msg, stepLis[0], 800);
  const word = (t.match(/\b(warmer|friendlier|more formal|formal|playful|casual|bolder)\b/i) || [0, 'warmer'])[1].toLowerCase();
  const b = S.brand || NEUTRAL;
  S.tone = S.brand ? `${b.tone}, ${word}` : word[0].toUpperCase() + word.slice(1);
  stepLis[0].classList.add('condense');
  setTimeout(() => stepLis[0].classList.remove('condense'), 1100);
  goStep(0);
  th.className = 'm eai';
  th.innerHTML = `Tone set: <i>${esc(S.tone)}</i>. The AI writer and the ${esc(S.brand ? S.brand.name + ' assistant' : 'in-app assistant')} both use it.`;
  bThread.scrollTop = bThread.scrollHeight;
}

$('bForm').addEventListener('submit', (e) => {
  e.preventDefault();
  cancelAuto();
  const t = bInput.value;
  bInput.value = '';
  handle(t);
});
$('bChips').addEventListener('click', (e) => {
  const b = e.target.closest('[data-say]');
  if (!b) return;
  cancelAuto();
  handle(b.dataset.say);
});
bInput.addEventListener('focus', cancelAuto);
asInput.addEventListener('focus', cancelAuto);

/* ---- voice: say "Make it for Qantas" ---- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = $('bMic');
if (SR) {
  mic.hidden = false;
  let rec = null, micT = 0;
  const micTick = (dt) => {
    micT += dt;
    if (micT > 0.12 && page) {
      micT = 0;
      const r = mic.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 0.35, 16);
    }
  };
  mic.addEventListener('click', () => {
    cancelAuto();
    if (rec) { rec.stop(); return; }
    try {
      rec = new SR();
      rec.lang = 'en-AU';
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      let finalText = '';
      rec.onresult = (ev) => {
        let s = '';
        for (const r of ev.results) { s += r[0].transcript; if (r.isFinal) finalText = s; }
        bInput.value = s;
      };
      rec.onerror = () => { bInput.placeholder = 'Mic unavailable — type instead'; };
      rec.onend = () => {
        mic.classList.remove('on');
        tickers.delete(micTick);
        rec = null;
        const t = (finalText || bInput.value).trim();
        bInput.value = '';
        if (t) handle(t);
      };
      mic.classList.add('on');
      tickers.add(micTick);
      bInput.value = '';
      bInput.placeholder = 'Listening… say “Make it for Qantas”';
      rec.start();
    } catch (err) {
      rec = null;
      mic.classList.remove('on');
    }
  });
}

/* ---- auto-play once: Nike → Apple → CommBank ---- */
let runId = 0;
let autoOn = false;
class Cancelled extends Error {}
function cancelAuto() {
  if (!autoOn) return;
  autoOn = false;
  runId++;
  bInput.value = '';
  asInput.value = '';
}
async function typeInto(input, text, id) {
  input.value = '';
  for (const ch of text) {
    if (id !== runId) throw new Cancelled();
    input.value += ch;
    await sleep(REDUCED ? 0 : 34 + Math.random() * 30);
  }
  await sleep(REDUCED ? 0 : 260);
  if (id !== runId) throw new Cancelled();
  input.value = '';
}
async function autoplay() {
  autoOn = true;
  const id = ++runId;
  const chk = () => { if (id !== runId) throw new Cancelled(); };
  try {
    await sleep(1100); chk();
    await typeInto(bInput, 'Build a campaign email app for Nike', id);
    await handle('Build a campaign email app for Nike'); chk();
    await sleep(900); chk();
    await typeInto(asInput, 'Suggest three subject lines', id);
    await ask('Suggest three subject lines'); chk();
    await sleep(1700); chk();
    await typeInto(bInput, 'Make it for Apple', id);
    await handle('Make it for Apple'); chk();
    await sleep(1500); chk();
    await typeInto(bInput, 'Make it for CommBank', id);
    await handle('Make it for CommBank'); chk();
    await sleep(900); chk();
    await typeInto(asInput, 'Make the intro shorter', id);
    await ask('Make the intro shorter');
  } catch (e) { /* the visitor took over */ }
  autoOn = false;
}

/* ================= Rebrand in a sentence ================= */
const rbWord = $('rbWord');
function setRb(br) {
  rbWord.textContent = br.name;
  rbWord.style.setProperty('--w1', br.inks[0]);
  rbWord.style.setProperty('--w2', br.inks[1]);
  rbWord.style.setProperty('--w3', br.veinSign === -1 ? '#8a6d00' : br.inks[2]);
  $('rbSw').innerHTML = br.swatches.map((c, i) => `<i style="background:${esc(c)};animation-delay:${i * 70}ms"></i>`).join('');
  const lg = $('rbLogo');
  lg.innerHTML = logoHTML(br);
  lg.style.color = br.drop || br.b;
  $('rbTone').textContent = br.tone;
  $('rbLine').textContent = `“${br.subjects[0]}” — ${br.body}`;
  document.querySelectorAll('#rbChips button').forEach((b) => b.classList.toggle('on', b.dataset.rb === br.key));
  const r = rbWord.getBoundingClientRect();
  if (r.bottom > 0 && r.top < innerHeight) burst(r.left + r.width / 2, r.top + r.height / 2, 0.8, 30);
}
$('rbChips').addEventListener('click', (e) => {
  const b = e.target.closest('[data-rb]');
  if (b) setRb(BRANDS[b.dataset.rb]);
});

/* ================= Two chats card ================= */
function setClientCard(br) {
  const c = $('ccClient');
  c.style.setProperty('--cc', br.b);
  c.style.setProperty('--cc-on', inkFor(br.b));
  $('ccLogo').innerHTML = logoHTML(br);
  $('ccName').textContent = `${br.name} assistant`;
  $('ccFor').textContent = `${br.teamShort || br.name + ' team'}, using the app`;
  const team = esc(br.teamShort || br.name + ' team');
  $('ccThread').innerHTML = `
    <p class="who r">${team}, using the app</p><div class="bub u">Suggest three subject lines</div>
    <p class="who"><span class="av bot">${logoHTML(br)}</span>${esc(br.name)} assistant</p><div class="bub a">Three, in ${esc(br.name)}’s voice:<ul>${br.subjects.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>
    <p class="who r">${team}, using the app</p><div class="bub u">Make the intro shorter</div>
    <p class="who"><span class="av bot">${logoHTML(br)}</span>${esc(br.name)} assistant</p><div class="bub a">“${esc(br.short)}”</div>`;
}
function syncSections(br) {
  setClientCard(br);
  if (br.key) setRb(br);
}

/* ================= Phone vessel + share ================= */
const phoneEl = $('phone');
const ph = new Vessel($('phFluid'), phoneEl.querySelector('.ph-fb'), phoneEl.querySelector('.ph-screen'), { dyeScale: 0.6, simScale: 0.3 });
ph.onColour = (hex) => {
  phoneEl.style.setProperty('--ph', hex);
  phoneEl.style.setProperty('--ph-on', inkFor(hex));
};
let phBusy = false;
async function setPhone(br, pour = true) {
  $('phLogo').innerHTML = logoHTML(br);
  $('phAsLogo').innerHTML = logoHTML(br);
  $('phName').textContent = br.name;
  $('phSubj').textContent = br.subjects[0];
  $('phBody').textContent = br.body;
  $('phCta').textContent = br.cta;
  $('phAsk').textContent = `Ask the ${br.name} assistant…`;
  phoneEl.style.setProperty('--afont2', br.font);
  document.querySelectorAll('#phChips button').forEach((b) => b.classList.toggle('on', b.dataset.ph === br.key));
  const url = new URL(`../../app.html?c=${br.key}`, location.href).href;
  $('qrLink').href = url;
  const su = $('shareUrl');
  su.href = url;
  su.textContent = '…/sell-to-many/app.html?c=' + br.key;
  if (window.QRCode) window.QRCode.toCanvas($('qr'), url, { width: 132, margin: 0, errorCorrectionLevel: 'L' }, () => {});
  if (pour) {
    phBusy = true;
    await ph.pour(br);
    phBusy = false;
  }
}
$('phChips').addEventListener('click', (e) => {
  const b = e.target.closest('[data-ph]');
  if (b && !phBusy) setPhone(BRANDS[b.dataset.ph]);
});

/* ================= Sell to many: the vessel divides ================= */
const manyEl = $('many');
const manyCanvas = $('manyFluid');
const mf = makeFluid(manyCanvas, { mode: 'cells', alpha: true, simScale: 0.25, dyeScale: 0.5, velDiss: 0.4, dyeDiss: 0.02, curl: 9, gain: 5 });
if (mf) stirTargets.push({ f: mf, el: manyCanvas, colour: null });
const labelsEl = $('manyLabels');
const manySticky = manyEl.querySelector('.many-sticky');
const cells = [];
const U = { n: 1, k: 0.06, dyeAmt: 0.09, velAmt: 0.08, cells: new Float32Array(64), cols: new Float32Array(48), motion: new Float32Array(64) };
for (let i = 0; i < 16; i++) {
  const lab = document.createElement('span');
  lab.innerHTML = `<i style="background:${MANY[i][1]}"></i>${esc(MANY[i][0])}`;
  labelsEl.appendChild(lab);
  let fbDot = null;
  if (!mf) {
    fbDot = document.createElement('div');
    fbDot.style.cssText = 'position:absolute;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(255,255,255,.35), inset -10px -14px 30px rgba(0,0,0,.35), inset 8px 10px 24px rgba(255,255,255,.25);transition:background .8s';
    manyEl.querySelector('.many-fallback').appendChild(fbDot);
  }
  cells.push({
    x: 0, y: 0, vx: 0, vy: 0, r: 10, jx: rand(-0.6, 0.6), jy: rand(-0.6, 0.6),
    col: hexToRgb(MANY[0][1]), spin: (i % 2 ? 1 : -1) * rand(18, 34), ph: rand(0, 6.28), lab, fbDot,
  });
}
let L = 0, placed = false, manyT = 0;
function levelFor(p) { return p < 0.1 ? 0 : p < 0.27 ? 1 : p < 0.44 ? 2 : p < 0.61 ? 3 : 4; }
function physStep(dt, W, H, cx, cy, r) {
  const shift = 4 - L;
  const groups = {};
  for (let i = 0; i < 16; i++) {
    const g = i >> shift;
    (groups[g] = groups[g] || { x: 0, y: 0, n: 0 });
    groups[g].x += cells[i].x; groups[g].y += cells[i].y; groups[g].n++;
  }
  for (const g in groups) { groups[g].x /= groups[g].n; groups[g].y /= groups[g].n; }
  const pr = manySticky.getBoundingClientRect();
  const px = ptr.x - pr.left, py = ptr.y - pr.top;
  for (let i = 0; i < 16; i++) {
    const c = cells[i];
    c.r += (r - c.r) * Math.min(1, dt * 3);
    const g = groups[i >> shift];
    let fx = (g.x + c.jx - c.x) * 60, fy = (g.y + c.jy - c.y) * 60;
    fx += (cx - c.x) * 1.1; fy += (cy - c.y) * 1.1;
    const gi = i >> shift;
    fx += Math.sin(manyT * 0.4 + gi * 1.7) * 14; fy += Math.cos(manyT * 0.33 + gi * 2.3) * 14;
    const dx = c.x - px, dy = c.y - py, d = Math.hypot(dx, dy);
    if (d < c.r + 110 && d > 0.01) { const k = (c.r + 110 - d) * 22; fx += (dx / d) * k; fy += (dy / d) * k; }
    const m = 10;
    const left = MOBILE() ? 0 : W * 0.37;
    if (c.x < left + c.r + m) fx += (left + c.r + m - c.x) * 80;
    if (c.x > W - c.r - m) fx -= (c.x - (W - c.r - m)) * 80;
    const top = MOBILE() ? H * 0.34 : 76;
    if (c.y < c.r + top) fy += (c.r + top - c.y) * 80;
    if (c.y > H - c.r - 60) fy -= (c.y - (H - c.r - 60)) * 80;
    c.fx = fx; c.fy = fy;
  }
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      if (i >> shift === j >> shift) continue;
      const a = cells[i], b = cells[j];
      let dx = b.x - a.x, dy = b.y - a.y;
      let d = Math.hypot(dx, dy);
      const min = a.r + b.r + 24;
      if (d >= min) continue;
      if (d < 0.01) { const ang = (i * 2.39 + j * 1.3); dx = Math.cos(ang); dy = Math.sin(ang); d = 1; }
      const k = (min - d) * 55;
      a.fx -= (dx / d) * k; a.fy -= (dy / d) * k;
      b.fx += (dx / d) * k; b.fy += (dy / d) * k;
    }
  }
  const damp = Math.exp(-dt * 4.5);
  for (const c of cells) {
    c.vx = (c.vx + c.fx * dt) * damp; c.vy = (c.vy + c.fy * dt) * damp;
    c.x += c.vx * dt; c.y += c.vy * dt;
  }
}
tickers.add((dt) => {
  const rect = manyEl.getBoundingClientRect();
  if (rect.bottom < -50 || rect.top > innerHeight + 50) return;
  const W = manySticky.clientWidth, H = manySticky.clientHeight;
  const mob = MOBILE();
  const cx = mob ? W / 2 : W * 0.63, cy = mob ? H * 0.62 : H * 0.52;
  const p = clamp(-rect.top / (rect.height - innerHeight));
  const newL = levelFor(p);
  const R0 = Math.min(mob ? W * 0.8 : W * 0.5, mob ? H * 0.6 : H) * 0.31;
  const r = (R0 / Math.sqrt(2 ** newL)) * (newL ? 1 : 1);
  if (!placed) { for (const c of cells) { c.x = cx + c.jx; c.y = cy + c.jy; c.r = r; } placed = true; }
  if (newL !== L) {
    L = newL;
    $('manyN').textContent = String(2 ** L);
    $('manyL').textContent = L === 0 ? 'build · 1 client' : `clients · 1 build`;
    if (REDUCED) for (let k = 0; k < 400; k++) { manyT += 1 / 60; physStep(1 / 60, W, H, cx, cy, r); }
  }
  $('manyHint').style.opacity = p > 0.08 ? '0' : '1';
  if (!REDUCED) { manyT += dt; physStep(dt, W, H, cx, cy, r); }
  // colours: each group fills with its lead client's liquid; one vessel per group
  const shift = 4 - L, n = 1 << L;
  for (let i = 0; i < 16; i++) {
    const c = cells[i];
    const tgt = hexToRgb(MANY[(i >> shift) << shift][1]);
    const k = REDUCED ? 1 : Math.min(1, dt * 1.1);
    c.col = c.col.map((v, j) => v + (tgt[j] - v) * k);
    c.lab.style.opacity = '0';
    if (c.fbDot) c.fbDot.style.display = 'none';
  }
  const fl = mf ? mf.vel : null;
  const sx = fl ? fl.w / W : 0.25, sy = fl ? fl.h / H : 0.25;
  for (let g = 0; g < n; g++) {
    const lead = g << shift;
    let x = 0, y = 0, vx = 0, vy = 0;
    for (let i = lead; i < lead + (1 << shift); i++) { x += cells[i].x; y += cells[i].y; vx += cells[i].vx; vy += cells[i].vy; }
    const m = 1 << shift;
    x /= m; y /= m; vx /= m; vy /= m;
    const c = cells[lead];
    c.ph += (c.spin / Math.max(20, c.r)) * dt * 1.4;
    const ix = x + Math.cos(c.ph) * c.r * 0.4, iy = y + Math.sin(c.ph) * c.r * 0.4;
    const pulse = 0.28 * (0.5 + 0.5 * Math.sin(manyT * 1.3 + g * 1.9));
    U.cells.set([x / W, 1 - y / H, c.r / H, c.spin * 0.6], g * 4);
    U.motion.set([vx * sx, -vy * sy, ix / W, 1 - iy / H], g * 4);
    U.cols.set(c.col.map((v) => v + (1 - v) * pulse), g * 3);
    c.lab.style.opacity = '1';
    c.lab.style.transform = `translate(${x}px, ${y + c.r + 10}px) translate(-50%, 0)`;
    if (c.fbDot) {
      const d = c.fbDot;
      d.style.display = 'block';
      d.style.left = x - c.r + 'px'; d.style.top = y - c.r + 'px';
      d.style.width = d.style.height = c.r * 2 + 'px';
      d.style.background = `radial-gradient(circle at 35% 30%, rgba(255,255,255,.35), transparent 45%), ${toHex(c.col.map((v) => v * 255))}`;
    }
  }
  U.n = n;
  U.k = 0.04;
  if (mf) mf.setCells(U);
});
if (!mf) {
  const fb = manyEl.querySelector('.many-fallback');
  fb.style.display = 'block';
}

/* ================= Four steps: hover drips mercury ================= */
document.querySelectorAll('.four li').forEach((li) => {
  li.addEventListener('pointerenter', () => {
    const r = li.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + 40, 0.9, 28);
  });
});

/* ================= CTA ================= */
const ctaInput = $('ctaInput');
ctaInput.addEventListener('input', () => {
  if (!page) return;
  const r = ctaInput.getBoundingClientRect();
  const x = Math.min(r.right - 10, r.left + 18 + ctaInput.value.length * 8.2);
  page.splat(x, r.top + r.height / 2, rand(-200, 200), rand(-500, -200), MERC.map((v) => v * 0.5), 18);
});
$('ctaForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = ctaInput.value.trim();
  const r = e.currentTarget.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 1.6, 40);
  $('ctaNote').textContent = v
    ? `“${v}” — four steps, one build. Then every client after that is a sentence.`
    : 'Four steps. One build. Every client after that is a sentence.';
});

/* ================= Reveal on scroll ================= */
const revealables = document.querySelectorAll('.sec-head, .four li, .reads .read, .two > *, .share-copy, .phone, .cta h2, .cta-form');
if (!REDUCED) {
  revealables.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
  });
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
  revealables.forEach((el) => io.observe(el));
}

/* ================= Go ================= */
setRb(BRANDS.nike);
setClientCard(BRANDS.nike);
setPhone(BRANDS.nike, false);
start();
// Fill the phone once it's first seen, so its liquid is there when you arrive.
new IntersectionObserver((es, o) => {
  if (es[0].isIntersecting) { o.disconnect(); setPhone(BRANDS.nike); }
}, { rootMargin: '200px' }).observe(phoneEl);

const params = new URLSearchParams(location.search);
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
  if (!params.has('manual')) autoplay();
});
