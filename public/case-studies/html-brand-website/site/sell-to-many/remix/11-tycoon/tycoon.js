/* Sell to many: the game  (remix 11, "Tycoon")

   The marketing site is a small isometric city you can play for two or three
   minutes. It teaches the pitch by making you do it:

   1. BUILD ONCE. Your studio sits in the middle of the island. In the builder
      chat on the left (EAI's own neutral chat, used by you, the maker) you
      drop in four blocks: Brief, Assets, Compose, Review. Exactly four; try a
      fifth and you get "Four steps. That's the rule." Each block lands on the
      studio as a new floor.
   2. SELL. Click an empty plot and name a client (Nike, Apple, CommBank, or
      any company, looked up live). A storefront rises in their colours and
      logo, running the same app.
   3. END USERS. The client's staff walk in and talk to the in-app assistant,
      which answers in the brand's voice. Click a storefront to open the app
      itself, with that brand's assistant on the right, and chat to it as the
      client's team would.
   4. ONE CHANGE, EVERY CLIENT. Tell the builder "make Review need two
      approvers" (still four steps) and a wave rolls out from the studio,
      updating every storefront at once.

   Two chats, never blurred: the builder chat (left, neutral, "You, building")
   changes the app. The in-app assistant (inside each app, on its right, in the
   client's brand, "Nike's team, using the app") helps with the work and never
   changes the app.

   Rendering is plain canvas 2D, isometric, drawn in code. "Just show me" plays
   the whole loop on load; any click hands control back. Reduced motion gets a
   finished, static city with working panels. */
(function () {
  'use strict';

  /* ================================================================ Setup */
  const STM = window.STM;
  const { BRANDS, curated, pickPrimary, liveBrand, esc } = STM;
  // app-view.js paths are relative to /sell-to-many/; this page lives two levels down.
  BRANDS.commbank.logo = '<img src="../../logos/commbank.svg" alt="" class="img-mark" />';

  const params = new URLSearchParams(location.search);
  // STILL: reduced motion (or ?static) gets a finished, static city that only redraws on demand.
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches || params.has('static');
  const $ = (s, r = document) => r.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOutBack = (t) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const isMobile = () => innerWidth <= 820;
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---- colour ---- */
  const rgbCache = new Map();
  function rgb(hex) {
    let v = rgbCache.get(hex);
    if (v) return v;
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6), 16);
    v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    rgbCache.set(hex, v);
    return v;
  }
  const toHex = (c) => '#' + c.map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
  const mixHex = (a, b, t) => { const A = rgb(a), B = rgb(b); return toHex([lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)]); };
  const lumOf = (hex) => { const [r, g, b] = rgb(hex); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };

  // Global light: every surface colour passes through lit(), so day/night is one multiply.
  let AMB = [1, 1, 1], NIGHT = 0;
  const litCache = new Map();
  let litKey = '';
  function lit(hex, f) {
    const k = hex + (f || 1);
    let v = litCache.get(k);
    if (v) return v;
    const c = rgb(hex), m = f || 1;
    v = `rgb(${Math.round(clamp(c[0] * m * AMB[0], 0, 255))},${Math.round(clamp(c[1] * m * AMB[1], 0, 255))},${Math.round(clamp(c[2] * m * AMB[2], 0, 255))})`;
    litCache.set(k, v);
    return v;
  }
  // A surface that glows at night (windows, signs).
  function glow(hex, f, glowHex, k) {
    const c = rgb(hex), g = rgb(glowHex || '#FFD58A'), m = f || 1, n = clamp(NIGHT * (k == null ? 1 : k), 0, 1);
    return `rgb(${Math.round(lerp(c[0] * m * AMB[0], g[0], n))},${Math.round(lerp(c[1] * m * AMB[1], g[1], n))},${Math.round(lerp(c[2] * m * AMB[2], g[2], n))})`;
  }

  /* ---- sound (off by default) ---- */
  const Snd = {
    on: false, ctx: null,
    toggle() {
      this.on = !this.on;
      if (this.on && !this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.on = false; } }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      return this.on;
    },
    tone(freq, dur, type, vol, when) {
      if (!this.on || !this.ctx) return;
      const c = this.ctx, t = c.currentTime + (when || 0);
      const o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.06, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.15));
      o.connect(g).connect(c.destination);
      o.start(t); o.stop(t + (dur || 0.15) + 0.05);
    },
    place(i) { this.tone(330 * Math.pow(1.26, i), 0.18, 'triangle', 0.07); this.tone(90, 0.12, 'sine', 0.09, 0.02); },
    sale() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.25, 'triangle', 0.05, i * 0.07)); },
    chat() { this.tone(880 + Math.random() * 200, 0.06, 'sine', 0.018); },
    nope() { this.tone(180, 0.18, 'square', 0.03); this.tone(140, 0.22, 'square', 0.03, 0.12); },
    medal() { [784, 988, 1175].forEach((f, i) => this.tone(f, 0.3, 'sine', 0.04, i * 0.09)); },
    wave() {
      if (!this.on || !this.ctx) return;
      const c = this.ctx, t = c.currentTime;
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(620, t + 1.1);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t + 1.5);
    },
  };

  /* ================================================================ The app being built */
  const STEPS = [
    { id: 'brief', name: 'Brief', wire: 'Form', col: '#FF7A59', say: '<b>Brief</b>: a form their team fills in. Four fields, the rest is written for them.' },
    { id: 'assets', name: 'Assets', wire: 'Data source', col: '#20B08D', say: '<b>Assets</b>: reads the client’s brand files from SharePoint, always current.' },
    { id: 'compose', name: 'Compose', wire: 'AI writer', col: '#7B6CF6', say: '<b>Compose</b>: an AI writer drafts the email in the client’s voice.' },
    { id: 'review', name: 'Review', wire: 'Approval', col: '#F2AE2E', say: '<b>Review</b>: a person checks it before anything sends.' },
  ];
  const EXTRAS = [{ id: 'translate', name: 'Translate', wire: 'AI' }, { id: 'schedule', name: 'Schedule', wire: 'Timer' }];
  const STEP_BY_ID = Object.fromEntries(STEPS.map((s) => [s.id, s]));

  /* ---- brand voice: what the client's team asks, and what their assistant says ---- */
  const VOICE = {
    nike: {
      lines: [['Suggest three subject lines', 'Pegasus 41 is here. Go.'], ['Make the intro shorter', 'Lighter. Faster. Yours.'], ['Write the button', 'Shop now. Run first.'], ['Punchier sign-off?', 'See you out there.']],
      warm: [['Suggest a subject line', 'Your new favourite run is here.'], ['Make it friendlier', 'Made for every mile you love.']],
      short: 'Pegasus 41. Lighter, faster. Run Club gets it first.', cta: ['Shop now', 'Run first', 'Get yours'],
    },
    apple: {
      lines: [['Suggest a subject line', 'Say hello to the new iPhone.'], ['Make the intro shorter', 'Pro. Beyond.'], ['Write the button', 'Learn more'], ['Tighten the headline', 'Our best camera. Yet.']],
      warm: [['Suggest a subject line', 'Meet the iPhone you’ll love to hold.'], ['Make it friendlier', 'Hello, new iPhone. Good to see you.']],
      short: 'The new iPhone. Our most advanced camera yet.', cta: ['Learn more', 'Buy', 'Find a store'],
    },
    commbank: {
      lines: [['Suggest a subject line', 'Your Yello rewards are here'], ['Make the intro shorter', 'More value from everyday banking.'], ['Explain the offer simply', 'Earn rewards on what you already spend. No sign-up.'], ['Write the button', 'See my offers']],
      warm: [['Suggest a subject line', 'A little thank you, from us'], ['Make it friendlier', 'We’ve added rewards to your everyday account. Enjoy.']],
      short: 'Earn Yello rewards on your everyday account. No sign-up needed.', cta: ['See my offers', 'Open the app', 'Learn more'],
    },
  };
  function keyOf(br) { return Object.keys(BRANDS).find((k) => BRANDS[k] === br) || null; }
  function voiceOf(br) {
    const k = keyOf(br);
    if (k && VOICE[k]) return VOICE[k];
    const n = br.name;
    return {
      lines: [['Suggest a subject line', `What’s new at ${n}`], ['Make the intro shorter', `${n}: made for you.`], ['Write the button', 'Find out more'], ['Check the tone', `Sounds like ${n}. Good to go.`]],
      warm: [['Suggest a subject line', `Something new from all of us at ${n}`], ['Make it friendlier', `We think you’ll love this, from ${n}.`]],
      short: `Here’s what’s new at ${n} this month.`, cta: ['Find out more', 'See what’s new', 'Get started'],
    };
  }
  const teamOf = (br) => `${br.name}’s team`;

  /* ================================================================ The world */
  const N = 12, TW = 72, TH = 36, ZH = 38;
  const P = (x, y, z) => [(x - y) * TW / 2, (x + y) * TH / 2 - (z || 0) * ZH];
  const K = (x, y) => x + ',' + y;
  const R = rng(11);

  const tiles = [];
  const tileAt = (x, y) => (x >= 0 && y >= 0 && x < N && y < N ? tiles[y * N + x] : null);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) tiles.push({ x, y, type: 'grass', v: R() });
  const setT = (x, y, type) => { tileAt(x, y).type = type; };
  for (let i = 2; i <= 9; i++) { setT(i, 2, 'road'); setT(i, 9, 'road'); setT(2, i, 'road'); setT(9, i, 'road'); }
  [[0, 5], [1, 5], [6, 0], [6, 1], [10, 6], [11, 6], [5, 10], [5, 11]].forEach(([x, y]) => setT(x, y, 'road'));
  for (let y = 4; y <= 7; y++) for (let x = 4; x <= 7; x++) setT(x, y, 'plaza');
  [[10, 10], [11, 10], [10, 11], [11, 11]].forEach(([x, y]) => setT(x, y, 'water'));
  const isRoad = (x, y) => { const t = tileAt(x, y); return !!t && t.type === 'road'; };

  // Plots, in the order autoplay and "sell it to…" fill them. Each has a road on a visible side.
  const PLOT_DEF = [[8, 4, 9, 4], [4, 8, 4, 9], [7, 1, 7, 2], [1, 7, 2, 7], [8, 7, 9, 7], [7, 8, 7, 9], [1, 3, 2, 3], [3, 1, 3, 2]];
  const plots = PLOT_DEF.map(([x, y, dx, dy], i) => { setT(x, y, 'plot'); return { i, x, y, dx, dy, client: null, pending: null }; });

  // Decor: trees, houses, lamps.
  const decor = [];
  const TREE_COLS = ['#6FBF7E', '#58AE72', '#4FA293', '#86C77A'];
  for (const t of tiles) {
    if (t.type !== 'grass') continue;
    const { x, y } = t;
    const inner = x >= 3 && x <= 8 && y >= 3 && y <= 8;
    const back = x <= 1 || y <= 1;
    const r = R();
    if (inner) {
      if (r < 0.62) decor.push({ kind: 'tree', x: x + 0.5 + (R() - 0.5) * 0.3, y: y + 0.5 + (R() - 0.5) * 0.3, s: 0.8 + R() * 0.3, col: R() < 0.2 ? '#F2A5B8' : TREE_COLS[(R() * 4) | 0], cone: R() < 0.35, seed: R() * 9 });
      else t.flowers = true;
    } else if (back && r < 0.42 && !(x === 0 && y === 0)) {
      decor.push({ kind: 'house', x, y, wall: ['#FFF1DE', '#FFE2D4', '#E4EEFF', '#F3F0FF'][(R() * 4) | 0], roof: ['#E8836B', '#6F8FD8', '#EDB244', '#8C7CF0'][(R() * 4) | 0], h: 0.5 + R() * 0.25, seed: R() * 9 });
    } else if (r < 0.7) {
      const n = back ? 1 : 1 + (R() < 0.5 ? 1 : 0);
      for (let k = 0; k < n; k++) decor.push({ kind: 'tree', x: x + 0.3 + R() * 0.4, y: y + 0.3 + R() * 0.4, s: back ? 0.85 + R() * 0.3 : 0.55 + R() * 0.25, col: R() < 0.15 ? '#F2A5B8' : TREE_COLS[(R() * 4) | 0], cone: R() < 0.45, seed: R() * 9 });
    } else if (r < 0.85) t.flowers = true;
  }
  [[2, 2], [9, 2], [2, 9], [9, 9], [5.5, 9], [9, 5.5]].forEach(([x, y]) => decor.push({ kind: 'lamp', x: x + 0.12, y: y + 0.12 }));
  decor.push({ kind: 'bench', x: 4.5, y: 7.5 }, { kind: 'bench', x: 7.5, y: 4.5 });

  // Cars loop the ring road.
  const LOOP = [[2.5, 2.5], [9.5, 2.5], [9.5, 9.5], [2.5, 9.5]];
  const LOOP_LEN = 28;
  function loopPos(s) {
    s = ((s % LOOP_LEN) + LOOP_LEN) % LOOP_LEN;
    const seg = Math.floor(s / 7), f = (s - seg * 7) / 7;
    const a = LOOP[seg], b = LOOP[(seg + 1) % 4];
    const dx = Math.sign(b[0] - a[0]), dy = Math.sign(b[1] - a[1]);
    return { x: lerp(a[0], b[0], f) - dy * 0.2, y: lerp(a[1], b[1], f) + dx * 0.2, dx, dy };
  }
  const cars = [0, 7.5, 15, 21].map((s, i) => ({ s, v: 1.05 + i * 0.08, col: ['#E8604C', '#4F7FE8', '#F4C04A', '#FFFFFF'][i] }));

  const clouds = [0, 1, 2, 3].map((i) => ({ x: -4 + i * 5.2, y: 1 + ((i * 7) % 9), z: 5.2 + (i % 2) * 0.8, s: 0.8 + (i % 3) * 0.25, v: 0.16 + i * 0.03 }));
  const birds = { t: 6, list: [] };
  const rocks = [[-2.2, 13.5, -3.6, 0.5], [13.4, 4, -3.2, 0.4], [12.8, 13.8, -5.2, 0.32]];
  const SR = rng(4);
  const stars = Array.from({ length: 70 }, () => ({ x: SR(), y: SR() * 0.62, r: 0.5 + SR() * 1.2, p: SR() * 6 }));

  /* ---- roads graph for walking ---- */
  function bfs(from, to) {
    const q = [from], prev = new Map([[K(from[0], from[1]), null]]);
    while (q.length) {
      const [x, y] = q.shift();
      if (x === to[0] && y === to[1]) break;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = K(nx, ny);
        if (!prev.has(k) && isRoad(nx, ny)) { prev.set(k, [x, y]); q.push([nx, ny]); }
      }
    }
    const path = [];
    let c = to;
    while (c) { path.unshift(c); c = prev.get(K(c[0], c[1])); }
    return path[0] && path[0][0] === from[0] && path[0][1] === from[1] ? path : null;
  }
  const SPAWNS = [[0, 5], [6, 0], [11, 6], [5, 11]];

  /* ================================================================ Game state */
  let now = 0;
  const G = {
    blocks: [], floors: [], built: false, roofT: -99, approval: false, tone: 'default',
    revenue: 0, hours: 0, ach: new Set(), dayT: 0.16, updates: 0, gen: 0,
  };
  const citizens = [], particles = [], floaters = [];
  let wave = null;

  /* ================================================================ Canvas + camera */
  const cvs = $('#city');
  const ctx = cvs.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  const cam = { x: 0, y: 216, z: 1, tx: 0, ty: 216, tz: 1, base: 1, user: 1 };
  const focus = { x: 0, y: 0, tx: 0, ty: 0 };
  function freeArea() {
    const m = isMobile();
    const bd = $('#builder');
    const left = m ? 0 : bd.getBoundingClientRect().right;
    const right = document.body.classList.contains('app-open') && !m ? W - $('#appPanel').offsetWidth - 16 : W;
    const heroB = m ? 100 : $('#hero').getBoundingClientRect().bottom + 6;
    const top = document.body.classList.contains('app-open') ? 80 : heroB;
    const bottom = m ? (bd.classList.contains('min') ? H - 60 : bd.getBoundingClientRect().top) : H - 10;
    return { left, right, top, bottom };
  }
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = cvs.clientWidth; H = cvs.clientHeight;
    cvs.width = Math.round(W * DPR); cvs.height = Math.round(H * DPR);
    fit(true);
  }
  // Content box in iso space: x ±450, y from -130 (tall back buildings) to ~590 (bottom of the keel).
  function fit(snap) {
    const a = freeArea();
    const fw = Math.max(200, a.right - a.left), fh = Math.max(200, a.bottom - a.top);
    cam.base = clamp(Math.min(fw / (isMobile() ? 930 : 1060), fh / 760), 0.34, 1.3);
    document.documentElement.style.setProperty('--sheet', Math.max(0, H - a.bottom) + 'px');
    focus.tx = (a.left + a.right) / 2;
    focus.ty = a.top + fh * 0.5;
    cam.tz = cam.base * cam.user;
    if (snap) { focus.x = focus.tx; focus.y = focus.ty; cam.z = cam.tz; }
  }
  const HOME = () => [0, 254];
  function glide(wx, wy, zoomMul) {
    const [ix, iy] = P(wx, wy, 0);
    cam.tx = ix; cam.ty = iy;
    if (zoomMul) cam.user = zoomMul;
    cam.tz = cam.base * cam.user;
  }
  function home() { const [x, y] = HOME(); cam.tx = x; cam.ty = y; cam.user = 1; cam.tz = cam.base; }
  function S(x, y, z) { const [ix, iy] = P(x, y, z); return [focus.x + (ix - cam.x) * cam.z, focus.y + (iy - cam.y) * cam.z]; }
  function unproject(sx, sy) {
    const ix = (sx - focus.x) / cam.z + cam.x, iy = (sy - focus.y) / cam.z + cam.y;
    const a = ix / (TW / 2), b = iy / (TH / 2);
    return [(a + b) / 2, (b - a) / 2];
  }

  /* ---- drawing primitives (iso space) ---- */
  function poly(pts, fill) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }
  function box(x0, y0, x1, y1, z0, z1, top, left, right, edge) {
    const a = P(x0, y1, z0), b = P(x1, y1, z0), c = P(x1, y0, z0);
    const a2 = P(x0, y1, z1), b2 = P(x1, y1, z1), c2 = P(x1, y0, z1), d2 = P(x0, y0, z1);
    poly([a, b, b2, a2], left || lit(top, 0.86));
    poly([b, c, c2, b2], right || lit(top, 0.7));
    poly([d2, c2, b2, a2], lit(top, 1));
    if (edge !== false) {
      ctx.strokeStyle = `rgba(255,255,255,${0.45 * (1 - NIGHT * 0.7)})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(a2[0], a2[1]); ctx.lineTo(b2[0], b2[1]); ctx.lineTo(c2[0], c2[1]); ctx.stroke();
    }
  }
  // Rectangles painted on a box's two visible faces.
  const faceL = (y1, a, b, z0, z1, fill) => poly([P(a, y1, z0), P(b, y1, z0), P(b, y1, z1), P(a, y1, z1)], fill);
  const faceR = (x1, a, b, z0, z1, fill) => poly([P(x1, a, z0), P(x1, b, z0), P(x1, b, z1), P(x1, a, z1)], fill);
  function ellipse(x, y, rx, ry, fill) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); }
  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  /* ---- logos on canvas ---- */
  const SWOOSH = 'M24 7.8 6.442 15.276c-1.456.616-2.679.925-3.668.925-1.11 0-1.922-.392-2.437-1.177-.317-.503-.4-1.152-.25-1.947.152-.795.532-1.643 1.14-2.543.505-.75 1.371-1.708 2.6-2.874-.365.615-.766 1.395-1.084 2.155-.55 1.32-.68 2.4-.394 3.24.13.375.365.65.68.83.36.2.83.29 1.41.29.44 0 .93-.06 1.47-.18L24 7.8Z';
  const APPLE = 'M584.8426,276.8632c-2.3411,1.4432-53.8358,31.4239-53.251,93.7952c0.6472,74.6027,65.3989,99.4457,66.1427,99.7276c-0.58,1.7759-10.3524,35.3838-34.1321,70.0925c-20.5507,30.0693-41.8387,59.968-75.4384,60.5922c-33.0098,0.6046-43.6489-19.5858-81.3589-19.5858c-37.7331,0-49.5436,18.9615-80.7596,20.1904c-32.4307,1.227-57.1214-32.4709-77.8236-62.3746c-42.3212-61.1983-74.679-172.9508-31.23-248.3679c21.5705-37.4546,60.1253-61.1835,101.9581-61.7964c31.8589-0.6021,61.9044,21.4174,81.3918,21.4174c19.209,0,53.636-25.6686,94.2163-22.6665C510.4626,229.066,555.6122,233.8129,584.8426,276.8632z M469.5186,187.488c17.2347-20.8293,28.8305-49.8377,25.6375-78.6904c-24.8053,0.9837-54.8058,16.5229-72.5975,37.339c-15.9324,18.4398-29.925,47.9732-26.1259,76.237C424.0806,224.5099,452.2985,208.3302,469.5186,187.488z';
  const LOGOS = {
    nike: { path: new Path2D(SWOOSH), vb: [0, 6.5, 24, 11], w: 1.9 },
    apple: { path: new Path2D(APPLE), vb: [150, 100, 500, 560], w: 0.9 },
  };
  const cbImg = new Image();
  cbImg.src = '../../logos/commbank.svg';
  function logoSpec(br) {
    const k = keyOf(br);
    if (k && LOGOS[k]) return LOGOS[k];
    if (k === 'commbank') return { img: cbImg, w: 1 };
    if (!br._logoImg) {
      const m = /src="([^"]+)"/.exec(br.logo || '');
      if (m) { const im = new Image(); im.referrerPolicy = 'no-referrer'; im.src = m[1].replace(/&amp;/g, '&'); br._logoImg = im; } else br._logoImg = false;
    }
    return br._logoImg ? { img: br._logoImg, w: 1, chip: true } : null;
  }
  // Draws a logo into a box of height h, left edge at x, vertically centred on cy. Returns width used.
  function drawLogo(br, x, cy, h, colour) {
    const L = logoSpec(br);
    if (L && L.path) {
      const [vx, vy, vw, vh] = L.vb, w = h * L.w, s = Math.min(w / vw, h / vh);
      ctx.save();
      ctx.translate(x + (w - vw * s) / 2, cy - (vh * s) / 2);
      ctx.scale(s, s); ctx.translate(-vx, -vy);
      ctx.fillStyle = colour; ctx.fill(L.path);
      ctx.restore();
      return w;
    }
    if (L && L.img && L.img.complete && L.img.naturalWidth) {
      if (L.chip) { ctx.fillStyle = '#fff'; rrect(x - 1, cy - h / 2 - 1, h + 2, h + 2, 3); ctx.fill(); }
      try { ctx.drawImage(L.img, x, cy - h / 2, h, h); } catch (e) { /* broken image */ }
      return h;
    }
    ctx.fillStyle = colour;
    rrect(x, cy - h / 2, h, h, 3); ctx.fill();
    ctx.fillStyle = br.head;
    ctx.font = `800 ${Math.round(h * 0.7)}px ${br.font}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(br.name[0].toUpperCase(), x + h / 2, cy + 0.5);
    ctx.textAlign = 'left';
    return h;
  }

  /* ================================================================ Sky + light */
  // dayT: 0 sunrise … 0.45 dusk … 0.55–0.9 night … 1 sunrise. One full day is CYCLE seconds.
  const CYCLE = 150;
  const SKY = {
    day: ['#BFE3F2', '#FDF0DF'], dusk: ['#8C7ACF', '#FFB38A'], night: ['#12163A', '#2D2C62'], dawn: ['#A9B6E8', '#FFD2B0'],
  };
  const LIGHT = { day: [1, 1, 1], dusk: [1.03, 0.84, 0.8], night: [0.4, 0.45, 0.74], dawn: [0.96, 0.88, 0.9] };
  function phase(t) {
    // returns [fromKey, toKey, k]
    const keys = [[0, 'dawn'], [0.08, 'day'], [0.42, 'day'], [0.5, 'dusk'], [0.58, 'night'], [0.88, 'night'], [0.97, 'dawn'], [1.08, 'day']];
    for (let i = 0; i < keys.length - 1; i++) {
      if (t >= keys[i][0] && t < keys[i + 1][0]) return [keys[i][1], keys[i + 1][1], (t - keys[i][0]) / (keys[i + 1][0] - keys[i][0])];
    }
    return ['day', 'day', 0];
  }
  let skyTop = '#BFE3F2', skyBot = '#FDF0DF';
  function updateLight() {
    const [a, b, k] = phase(G.dayT);
    const e = k * k * (3 - 2 * k);
    const la = LIGHT[a], lb = LIGHT[b];
    const amb = [lerp(la[0], lb[0], e), lerp(la[1], lb[1], e), lerp(la[2], lb[2], e)].map((v) => Math.round(v * 60) / 60);
    const key = amb.join(',');
    if (key !== litKey) { litKey = key; AMB = amb; litCache.clear(); }
    skyTop = mixHex(SKY[a][0], SKY[b][0], e);
    skyBot = mixHex(SKY[a][1], SKY[b][1], e);
    const nf = (x) => (x === 'night' ? 1 : x === 'dusk' ? 0.35 : x === 'dawn' ? 0.25 : 0);
    NIGHT = lerp(nf(a), nf(b), e);
  }

  /* ================================================================ Render */
  const items = [];
  const add = (d, fn) => items.push({ d, fn });

  function render() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // sky
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, skyTop); g.addColorStop(1, skyBot);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (NIGHT > 0.05) {
      for (const s of stars) {
        ctx.globalAlpha = NIGHT * (0.5 + 0.5 * Math.sin(now * 1.6 + s.p));
        ellipse(s.x * W, s.y * H, s.r, s.r, '#FFFFFF');
      }
      ctx.globalAlpha = 1;
    }
    drawSunMoon();

    ctx.setTransform(DPR * cam.z, 0, 0, DPR * cam.z, DPR * (focus.x - cam.x * cam.z), DPR * (focus.y - cam.y * cam.z));

    // floating rocks + island underside
    for (const [x, y, z, s] of rocks) {
      const bob = Math.sin(now * 0.8 + x) * 0.12;
      drawRock(x, y, z + bob, s);
    }
    drawIsland();
    drawGround();
    drawShadows();
    if (wave) drawWave();

    items.length = 0;
    for (const d of decor) {
      if (d.kind === 'tree') add(d.x + d.y, () => drawTree(d));
      else if (d.kind === 'house') add(d.x + d.y + 1, () => drawHouse(d));
      else if (d.kind === 'lamp') add(d.x + d.y, () => drawLamp(d));
      else if (d.kind === 'bench') add(d.x + d.y, () => drawBench(d));
    }
    add(12.2, drawStudio);
    for (const p of plots) add(p.x + p.y + 1, () => drawPlot(p));
    for (const c of cars) { const q = loopPos(c.s); add(q.x + q.y, () => drawCar(c, q)); }
    for (const c of citizens) add(c.px + c.py + 0.05, () => drawCitizen(c));
    items.sort((a, b) => a.d - b.d);
    for (const it of items) it.fn();

    drawParticles();
    drawFloaters();
    if (NIGHT > 0.05) drawGlows();
    for (const c of clouds) drawCloud(c);
    drawBirds();
  }

  function drawSunMoon() {
    const t = G.dayT;
    // Sun rides 0 → 0.5, moon 0.5 → 1, arcing over the top right of the sky.
    const arc = (k) => [W * (0.72 + 0.24 * k), H * (0.4 - 0.24 * Math.sin(Math.PI * k))];
    if (t < 0.56) {
      const [x, y] = arc(clamp(t / 0.56, 0, 1));
      const gr = ctx.createRadialGradient(x, y, 0, x, y, 90);
      gr.addColorStop(0, 'rgba(255,236,190,.75)'); gr.addColorStop(1, 'rgba(255,236,190,0)');
      ctx.fillStyle = gr; ctx.fillRect(x - 90, y - 90, 180, 180);
      ellipse(x, y, 20, 20, t > 0.42 ? '#FFB36B' : '#FFE7A8');
    } else {
      const [x, y] = arc(clamp((t - 0.56) / 0.44, 0, 1));
      ctx.globalAlpha = clamp(NIGHT * 1.3, 0, 1);
      ellipse(x, y, 16, 16, '#F2EFFF');
      ellipse(x + 6, y - 4, 13, 13, skyTop);
      ctx.globalAlpha = 1;
    }
  }

  function drawRock(x, y, z, s) {
    const c = P(x, y, z);
    const w = 30 * s, h = 18 * s;
    poly([[c[0] - w, c[1]], [c[0], c[1] - h * 0.5], [c[0] + w, c[1]], [c[0] + w * 0.2, c[1] + h * 2.2]], lit('#B98260', 0.8));
    poly([[c[0] - w, c[1]], [c[0], c[1] - h * 0.5], [c[0] + w, c[1]], [c[0], c[1] + h * 0.5]], lit('#A9CF8E', 1));
  }

  function drawIsland() {
    const d1 = -0.2, d2 = -0.95, d3 = -1.7;
    // strata, front-left face (y = N) and front-right face (x = N)
    const band = (z0, z1, colL, colR) => {
      poly([P(0, N, z0), P(N, N, z0), P(N, N, z1), P(0, N, z1)], lit(colL, 0.86));
      poly([P(N, 0, z0), P(N, N, z0), P(N, N, z1), P(N, 0, z1)], lit(colR, 0.7));
    };
    band(0, d1, '#8DBF72', '#8DBF72');
    band(d1, d2, '#D9A06E', '#D9A06E');
    band(d2, d3, '#BF8660', '#BF8660');
    // tapered keel underneath
    const L = [P(0, N, d3), P(2, N, d3 - 0.5), P(4.5, N, d3 - 0.3), P(7, N, d3 - 0.9), P(9.5, N, d3 - 0.5), P(N, N, d3 - 0.8)];
    const Rr = [P(N, N, d3 - 0.8), P(N, 9.5, d3 - 0.4), P(N, 7, d3 - 0.9), P(N, 4.5, d3 - 0.3), P(N, 2, d3 - 0.6), P(N, 0, d3)];
    const apex = P(N - 1.2, N - 1.2, -6.2);
    poly([P(0, N, d3), P(N, N, d3), ...L.slice().reverse(), ...[]], lit('#9A6A4C', 0.86));
    poly([...L, apex], lit('#936347', 0.8));
    poly([P(N, N, d3), P(N, 0, d3), ...Rr.slice().reverse()], lit('#9A6A4C', 0.7));
    poly([...Rr, apex], lit('#7E5439', 0.72));
    // rock seams
    ctx.strokeStyle = lit('#6E4A33', 0.8); ctx.lineWidth = 1.2; ctx.globalAlpha = 0.35;
    ctx.beginPath();
    [[1.5, -1.1], [3.8, -0.6], [6.4, -1.3], [9.1, -0.8]].forEach(([x, z]) => { const a = P(x, N, z), b = P(x + 1.1, N, z - 0.25); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); });
    [[2.2, -1.2], [5.5, -0.7], [8.6, -1.35]].forEach(([y, z]) => { const a = P(N, y, z), b = P(N, y + 1.1, z - 0.2); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); });
    ctx.stroke(); ctx.globalAlpha = 1;
  }

  const sellable = () => G.built;
  let hover = null; // {kind:'plot'|'studio', p}
  function drawGround() {
    for (const t of tiles) {
      const { x, y } = t;
      const pts = [P(x, y), P(x + 1, y), P(x + 1, y + 1), P(x, y + 1)];
      let col;
      if (t.type === 'road') col = '#EFE2CF';
      else if (t.type === 'plaza') col = (x + y) % 2 ? '#F4ECE0' : '#F8F1E7';
      else if (t.type === 'water') col = '#86CDE0';
      else if (t.type === 'plot') {
        const p = plots.find((q) => q.x === x && q.y === y);
        col = p.client ? '#EDE5D8' : mixHex('#BFE3A0', '#A9D38A', t.v);
      } else col = mixHex('#C2E4A2', '#AFD690', t.v * 0.7 + ((x + y) % 2) * 0.18);
      poly(pts, lit(col, 1));
    }
    // road kerbs and dashes
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = lit('#C9B79E', 1);
    ctx.beginPath();
    for (const t of tiles) {
      if (t.type !== 'road') continue;
      const { x, y } = t;
      const e = [[0, -1, [x, y], [x + 1, y]], [1, 0, [x + 1, y], [x + 1, y + 1]], [0, 1, [x, y + 1], [x + 1, y + 1]], [-1, 0, [x, y], [x, y + 1]]];
      for (const [dx, dy, a, b] of e) {
        const n = tileAt(x + dx, y + dy);
        if (n && n.type !== 'road') { const A = P(a[0], a[1]), B = P(b[0], b[1]); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); }
      }
    }
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${0.85 - NIGHT * 0.4})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (const t of tiles) {
      if (t.type !== 'road') continue;
      const { x, y } = t;
      const h = isRoad(x - 1, y) && isRoad(x + 1, y) && !isRoad(x, y - 1) && !isRoad(x, y + 1);
      const v = isRoad(x, y - 1) && isRoad(x, y + 1) && !isRoad(x - 1, y) && !isRoad(x + 1, y);
      const edge = x === 0 || y === 0 || x === N - 1 || y === N - 1;
      if (h || (edge && (y === 5 || y === 6))) { const a = P(x + 0.32, y + 0.5), b = P(x + 0.68, y + 0.5); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      else if (v || edge) { const a = P(x + 0.5, y + 0.32), b = P(x + 0.5, y + 0.68); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    }
    ctx.stroke();
    // water shimmer
    ctx.strokeStyle = `rgba(255,255,255,${0.55 - NIGHT * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const s = (now * 0.25 + i * 0.37) % 1;
      const x = 10.2 + ((i * 0.53) % 1.5), y = 10.2 + s * 1.5;
      const a = P(x, y), b = P(x + 0.28, y);
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
    }
    ctx.stroke();
    // flowers
    for (const t of tiles) {
      if (!t.flowers) continue;
      for (let i = 0; i < 3; i++) {
        const a = P(t.x + 0.25 + ((t.v * 7 + i * 0.31) % 0.5), t.y + 0.25 + ((t.v * 3 + i * 0.43) % 0.5));
        ellipse(a[0], a[1], 1.8, 1.4, lit(['#FFFFFF', '#FFD166', '#FF8FA3'][(i + (t.v * 10 | 0)) % 3], 1));
      }
    }
    // plots: outline, and a pulse when they can be sold
    for (const p of plots) {
      if (p.client) continue;
      const pts = [P(p.x + 0.08, p.y + 0.08), P(p.x + 0.92, p.y + 0.08), P(p.x + 0.92, p.y + 0.92), P(p.x + 0.08, p.y + 0.92)];
      const hot = hover && hover.kind === 'plot' && hover.p === p;
      ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath();
      if (hot) { ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fill(); }
      ctx.setLineDash([5, 4]);
      ctx.lineDashOffset = -now * 12;
      ctx.lineWidth = hot ? 2.2 : 1.6;
      const pulse = sellable() ? 0.55 + 0.45 * Math.sin(now * 4 + p.i) : 0.35;
      ctx.strokeStyle = `rgba(255,255,255,${pulse})`;
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (hover && hover.kind === 'studio') {
      const pts = [P(4.9, 4.9), P(7.1, 4.9), P(7.1, 7.1), P(4.9, 7.1)];
      ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2; ctx.stroke();
    }
  }

  function drawShadows() {
    const a = 0.16 * (1 - NIGHT * 0.5);
    ctx.fillStyle = `rgba(40,60,50,${a})`;
    for (const d of decor) {
      if (d.kind === 'tree') { const c = P(d.x + 0.08, d.y - 0.02); ctx.beginPath(); ctx.ellipse(c[0], c[1], 13 * d.s, 6.5 * d.s, 0, 0, 6.3); ctx.fill(); }
      else if (d.kind === 'house') poly([P(d.x + 0.2, d.y + 0.15), P(d.x + 1.05, d.y + 0.15), P(d.x + 1.05, d.y + 0.85), P(d.x + 0.2, d.y + 0.85)], `rgba(40,60,50,${a})`);
    }
    for (const p of plots) {
      if (!p.client) continue;
      poly([P(p.x + 0.12, p.y + 0.05), P(p.x + 1.15, p.y + 0.05), P(p.x + 1.15, p.y + 0.88), P(p.x + 0.12, p.y + 0.88)], `rgba(40,50,60,${a})`);
    }
    poly([P(5, 4.95), P(7.3, 4.95), P(7.3, 7), P(5, 7)], `rgba(40,50,60,${a})`);
    // cloud shadows glide across the ground
    for (const c of clouds) {
      const q = P(c.x + 0.8, c.y + 0.8, 0);
      ellipse(q[0], q[1], 46 * c.s, 20 * c.s, `rgba(40,50,80,${0.07 * (1 - NIGHT)})`);
    }
  }

  function drawWave() {
    const r = wave.r;
    const c = P(6, 6, 0);
    const k = clamp(1 - r / 11, 0, 1);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const rr = Math.max(0.01, r - i * 0.35);
      ctx.beginPath();
      ctx.ellipse(c[0], c[1], rr * TW / Math.SQRT2, rr * TH / Math.SQRT2, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(190,170,255,${(0.75 - i * 0.22) * k})`;
      ctx.lineWidth = 6 - i * 1.5;
      ctx.stroke();
    }
    ctx.restore();
  }

  /* ---- decor ---- */
  function drawTree(d) {
    const s = d.s, sway = Math.sin(now * 1.2 + d.seed) * 0.8;
    const b = P(d.x, d.y, 0), t = P(d.x, d.y, 0.32 * s);
    ctx.strokeStyle = lit('#8E6448', 0.9); ctx.lineWidth = 2.6 * s;
    ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(t[0], t[1]); ctx.stroke();
    if (d.cone) {
      const base = P(d.x, d.y, 0.25 * s), apex = P(d.x, d.y, 1.35 * s);
      const w = 11 * s;
      poly([[base[0] - w, base[1]], [apex[0] + sway, apex[1]], [base[0], base[1] + 3 * s]], lit(d.col, 1));
      poly([[base[0], base[1] + 3 * s], [apex[0] + sway, apex[1]], [base[0] + w, base[1]]], lit(d.col, 0.76));
    } else {
      const c = P(d.x, d.y, 0.7 * s);
      const r = 12.5 * s;
      ellipse(c[0] + sway * 0.5, c[1], r, r, lit(d.col, 0.8));
      ellipse(c[0] - r * 0.22 + sway * 0.6, c[1] - r * 0.22, r * 0.72, r * 0.72, lit(d.col, 1));
      ellipse(c[0] - r * 0.4 + sway * 0.6, c[1] - r * 0.45, r * 0.25, r * 0.25, lit(mixHex(d.col, '#FFFFFF', 0.35), 1));
    }
  }
  function drawHouse(d) {
    const x0 = d.x + 0.2, x1 = d.x + 0.8, y0 = d.y + 0.2, y1 = d.y + 0.8, h = d.h;
    box(x0, y0, x1, y1, 0, h, d.wall);
    const cx = d.x + 0.5, cy = d.y + 0.5, apex = P(cx, cy, h + 0.4);
    poly([P(x0 - 0.05, y1 + 0.05, h), P(x1 + 0.05, y1 + 0.05, h), apex], lit(d.roof, 0.9));
    poly([P(x1 + 0.05, y1 + 0.05, h), P(x1 + 0.05, y0 - 0.05, h), apex], lit(d.roof, 0.7));
    faceL(y1, x0 + 0.1, x0 + 0.24, h * 0.4, h * 0.7, glow('#BFD9E6', 0.86));
    faceL(y1, x0 + 0.36, x0 + 0.5, h * 0.4, h * 0.7, glow('#BFD9E6', 0.86, null, (d.seed % 1) > 0.4 ? 1 : 0.2));
    faceR(x1, y0 + 0.2, y0 + 0.38, 0, h * 0.55, lit('#7B5A48', 0.8));
  }
  function drawLamp(d) {
    const b = P(d.x, d.y, 0), t = P(d.x, d.y, 0.85);
    ctx.strokeStyle = lit('#4A4658', 1); ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(t[0], t[1]); ctx.stroke();
    ellipse(t[0], t[1], 3, 3, NIGHT > 0.3 ? '#FFE7A6' : lit('#E8E2D6', 1));
  }
  function drawBench(d) {
    box(d.x - 0.2, d.y - 0.07, d.x + 0.2, d.y + 0.07, 0.08, 0.14, '#C58D62');
  }
  function drawCar(c, q) {
    const hx = q.dx ? 0.22 : 0.12, hy = q.dx ? 0.12 : 0.22;
    box(q.x - hx, q.y - hy, q.x + hx, q.y + hy, 0.03, 0.17, c.col);
    const cx = q.x - q.dx * 0.03, cy = q.y - q.dy * 0.03;
    box(cx - hx * 0.55, cy - hy * 0.7, cx + hx * 0.55, cy + hy * 0.7, 0.17, 0.27, mixHex(c.col, '#FFFFFF', 0.45), glow('#9BC3D9', 0.86, '#FFE0A0', 0.4), glow('#9BC3D9', 0.7, '#FFE0A0', 0.4), false);
    if (NIGHT > 0.3) {
      const f = P(q.x + q.dx * (hx + 0.02), q.y + q.dy * (hy + 0.02), 0.1);
      ellipse(f[0], f[1], 2.2, 2.2, '#FFF4C8');
    }
  }
  function drawCloud(c) {
    const p = P(c.x, c.y, c.z);
    const s = c.s;
    const col = NIGHT > 0.5 ? `rgba(200,205,255,${0.2 + (1 - NIGHT) * 0.5})` : `rgba(255,255,255,${0.9 - NIGHT * 0.4})`;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(p[0], p[1], 34 * s, 13 * s, 0, 0, 6.3);
    ctx.ellipse(p[0] - 16 * s, p[1] - 6 * s, 16 * s, 12 * s, 0, 0, 6.3);
    ctx.ellipse(p[0] + 10 * s, p[1] - 11 * s, 20 * s, 15 * s, 0, 0, 6.3);
    ctx.fill();
  }
  function drawBirds() {
    if (!birds.list.length) return;
    ctx.strokeStyle = NIGHT > 0.5 ? 'rgba(220,220,255,.5)' : 'rgba(40,40,70,.55)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (const b of birds.list) {
      const p = P(b.x, b.y, b.z);
      const f = Math.sin(now * 9 + b.p) * 3;
      ctx.moveTo(p[0] - 5, p[1] - f); ctx.quadraticCurveTo(p[0] - 2, p[1] - 1, p[0], p[1] + 1);
      ctx.quadraticCurveTo(p[0] + 2, p[1] - 1, p[0] + 5, p[1] - f);
    }
    ctx.stroke();
  }
  function drawGlows() {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const a = NIGHT;
    for (const d of decor) {
      if (d.kind !== 'lamp') continue;
      const t = P(d.x, d.y, 0.85), g0 = P(d.x, d.y, 0);
      const gr = ctx.createRadialGradient(t[0], t[1], 0, t[0], t[1], 26);
      gr.addColorStop(0, `rgba(255,220,140,${0.5 * a})`); gr.addColorStop(1, 'rgba(255,220,140,0)');
      ctx.fillStyle = gr; ctx.fillRect(t[0] - 26, t[1] - 26, 52, 52);
      ellipse(g0[0], g0[1], 26, 12, `rgba(255,210,130,${0.16 * a})`);
    }
    for (const p of plots) {
      if (!p.client || p.client.rise < 0.9) continue;
      const s = p.client.signAt;
      if (!s) continue;
      const gr = ctx.createRadialGradient(s[0], s[1], 0, s[0], s[1], 60);
      const [r, g, b] = rgb(p.client.br.b);
      gr.addColorStop(0, `rgba(${r},${g},${b},${0.35 * a})`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = gr; ctx.fillRect(s[0] - 60, s[1] - 60, 120, 120);
    }
    ctx.restore();
  }

  /* ---- the studio: one build, four floors ---- */
  const FH = 0.46;
  function floorAnim(f) {
    const dt = now - f.t0;
    if (dt < 0) return null;
    const tf = 0.34;
    if (dt < tf) return { off: (1 - (dt / tf) * (dt / tf)) * 4.2, sy: 1.08, sx: 0.94 };
    if (!f.landed) { f.landed = true; onFloorLanded(f); }
    const k = dt - tf;
    const q = Math.exp(-k * 6) * Math.cos(k * 20) * 0.3;
    return { off: 0, sy: 1 - q, sx: 1 + q * 0.45 };
  }
  function drawStudio() {
    const x0 = 5.06, y0 = 5.06, x1 = 6.94, y1 = 6.94;
    box(x0, y0, x1, y1, 0, 0.16, '#EFE8DC');
    let z = 0.16;
    // floors that have landed stack; unfilled capacity shows as a ghost wireframe (there's room for exactly four)
    const drawn = [];
    for (let i = 0; i < 4; i++) {
      const f = G.floors[i];
      const a = f && floorAnim(f);
      if (!a) {
        drawGhost(z, i);
        z += FH;
        continue;
      }
      const h = FH * a.sy, inset = 0.16 - (a.sx - 1) * 0.8;
      const fx0 = 5 + inset, fy0 = 5 + inset, fx1 = 7 - inset, fy1 = 7 - inset;
      const zb = z + a.off;
      box(fx0, fy0, fx1, fy1, zb, zb + h, '#FBF6EE');
      const bz0 = zb + h * 0.28, bz1 = zb + h * 0.74;
      const col = f.col;
      faceL(fy1, fx0 + 0.08, fx1 - 0.08, bz0, bz1, glow(col, 0.9, mixHex(col, '#FFF3C4', 0.5), 0.9));
      faceR(fx1, fy0 + 0.08, fy1 - 0.08, bz0, bz1, glow(col, 0.72, mixHex(col, '#FFE9A8', 0.35), 0.9));
      // mullions
      ctx.strokeStyle = lit('#FBF6EE', 0.8); ctx.lineWidth = 1.4; ctx.beginPath();
      for (let m = 1; m < 5; m++) {
        const xm = lerp(fx0 + 0.08, fx1 - 0.08, m / 5), a1 = P(xm, fy1, bz0), a2 = P(xm, fy1, bz1);
        ctx.moveTo(a1[0], a1[1]); ctx.lineTo(a2[0], a2[1]);
        const ym = lerp(fy0 + 0.08, fy1 - 0.08, m / 5), b1 = P(fx1, ym, bz0), b2 = P(fx1, ym, bz1);
        ctx.moveTo(b1[0], b1[1]); ctx.lineTo(b2[0], b2[1]);
      }
      ctx.stroke();
      drawn.push(i);
      z = zb + h;
    }
    // roof, sign and antenna once the app is built
    const rt = now - G.roofT;
    if (G.built && rt >= 0) {
      const k = clamp(rt / 0.5, 0, 1), e = easeOutBack(k);
      const zr = z + (1 - e) * 1.5;
      box(5.1, 5.1, 6.9, 6.9, zr, zr + 0.14, '#2A2733');
      const base = P(6.4, 6.4, zr + 0.14), top = P(6.4, 6.4, zr + 0.14 + 0.9 * e);
      ctx.strokeStyle = lit('#2A2733', 1); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.lineTo(top[0], top[1]); ctx.stroke();
      const blink = 0.5 + 0.5 * Math.sin(now * 4);
      ellipse(top[0], top[1], 3.2, 3.2, `rgba(255,107,74,${0.5 + blink * 0.5})`);
      // screen-aligned sign
      const sp = P(6, 6, zr + 0.3);
      drawStudioSign(sp[0], sp[1] - 16 * e, 'EAI studio', 'Build #1', e);
    } else {
      const sp = P(6, 6, z + 0.2);
      drawStudioSign(sp[0], sp[1] - 8, 'Your studio', G.blocks.length ? `${G.blocks.length} of 4` : 'empty', 1, true);
    }
    studioTopZ = z + 0.6;
  }
  let studioTopZ = 2;
  function drawGhost(z, i) {
    const x0 = 5.16, y0 = 5.16, x1 = 6.84, y1 = 6.84;
    const pts = [P(x0, y1, z), P(x1, y1, z), P(x1, y0, z), P(x1, y0, z + FH), P(x1, y1, z + FH), P(x0, y1, z + FH), P(x0, y1, z)];
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = `rgba(60,50,90,${0.28 + 0.1 * Math.sin(now * 3 + i)})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); pts.forEach((q, j) => (j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
    const t1 = P(x0, y0, z + FH), t2 = P(x1, y0, z + FH), t3 = P(x1, y1, z + FH);
    ctx.moveTo(pts[5][0], pts[5][1]); ctx.lineTo(t1[0], t1[1]); ctx.lineTo(t2[0], t2[1]);
    ctx.moveTo(t3[0], t3[1]); ctx.lineTo(P(x1, y1, z)[0], P(x1, y1, z)[1]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,.08)';
    poly([P(x0, y1, z), P(x1, y1, z), P(x1, y1, z + FH), P(x0, y1, z + FH)], 'rgba(255,255,255,.10)');
  }
  function drawStudioSign(x, y, title, sub, s, light) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.font = '800 11px "Bricolage Grotesque", Geist, sans-serif';
    const tw = ctx.measureText(title).width;
    ctx.font = '500 9px "Geist Mono", monospace';
    const sw = ctx.measureText(sub).width;
    const w = tw + sw + 26, h = 20;
    ctx.fillStyle = 'rgba(0,0,0,.18)'; rrect(-w / 2, -h + 2, w, h, 7); ctx.fill();
    ctx.fillStyle = light ? 'rgba(255,251,244,.94)' : '#17151F'; rrect(-w / 2, -h, w, h, 7); ctx.fill();
    ctx.textBaseline = 'middle';
    ctx.fillStyle = light ? '#17151F' : '#FFFBF4';
    ctx.font = '800 11px "Bricolage Grotesque", Geist, sans-serif';
    ctx.fillText(title, -w / 2 + 9, -h / 2 + 0.5);
    ctx.fillStyle = light ? '#8a8494' : '#FF8A6A';
    ctx.font = '500 9px "Geist Mono", monospace';
    ctx.fillText(sub, -w / 2 + 17 + tw, -h / 2 + 0.5);
    ctx.restore();
  }

  /* ---- plots and storefronts ---- */
  function drawPlot(p) {
    if (p.client) return drawShop(p);
    if (p.pending) return drawScaffold(p);
    // a little for-sale flag
    const b = P(p.x + 0.72, p.y + 0.72, 0), t = P(p.x + 0.72, p.y + 0.72, 0.62);
    ctx.strokeStyle = lit('#6B5E52', 1); ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(t[0], t[1]); ctx.stroke();
    const wv = Math.sin(now * 5 + p.i) * 1.5;
    poly([[t[0], t[1]], [t[0] + 13, t[1] + 3 + wv * 0.3], [t[0], t[1] + 8]], lit(G.built ? '#FF6B4A' : '#D8D0C4', 1));
  }
  function drawScaffold(p) {
    const k = ((now - p.pending.t0) * 0.8) % 1;
    const x0 = p.x + 0.14, x1 = p.x + 0.86, y0 = p.y + 0.14, y1 = p.y + 0.86;
    const h = 0.2 + 0.9 * easeOutCubic(Math.min(1, (now - p.pending.t0) / 1.5));
    ctx.strokeStyle = lit('#F2AE2E', 1); ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let z = 0; z <= h + 0.001; z += 0.3) {
      const a = P(x0, y1, z), b = P(x1, y1, z), c = P(x1, y0, z);
      ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]);
    }
    [[x0, y1], [x1, y1], [x1, y0]].forEach(([x, y]) => { const a = P(x, y, 0), b = P(x, y, h); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); });
    ctx.stroke();
    const sp = P(p.x + 0.5, p.y + 0.5, h + 0.4);
    ctx.fillStyle = 'rgba(23,21,31,.85)';
    rrect(sp[0] - 42, sp[1] - 11, 84, 20, 7); ctx.fill();
    ctx.fillStyle = '#FFFBF4'; ctx.font = '500 9.5px "Geist Mono", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('reading site' + '...'.slice(0, 1 + ((k * 3) | 0)), sp[0], sp[1] - 1);
    ctx.textAlign = 'left';
  }
  function drawShop(p) {
    const c = p.client, br = c.br;
    const k = clamp((now - c.t0) / 0.85, 0, 1);
    c.rise = k;
    if (k <= 0) return;
    let sy = easeOutBack(k), sx = 1 + (1 - k) * 0.3 * Math.sin(k * Math.PI);
    const bt = now - c.bounceT;
    if (bt >= 0 && bt < 1.2) { const q = Math.exp(-bt * 5) * Math.sin(bt * 18) * 0.22; sy *= 1 + q; sx *= 1 - q * 0.5; }
    const cx = p.x + 0.5, cy = p.y + 0.5, hw = 0.37 * sx, Hh = 1.02 * sy;
    const x0 = cx - hw, x1 = cx + hw, y0 = cy - hw, y1 = cy + hw;
    box(x0, y0, x1, y1, 0, Hh, c.wall);
    // left face: shop window + door
    faceL(y1, x0 + 0.06, cx - 0.02, 0.1 * sy, 0.46 * sy, glow('#CFE5EE', 0.86, mixHex(br.b, '#FFF1C8', 0.55), 0.95));
    faceL(y1, cx + 0.07, cx + 0.25, 0, 0.44 * sy, lit(mixHex(br.head, '#000000', 0.2), 0.86));
    // right face: four windows, one per step, lit while someone uses the app
    for (let i = 0; i < 4; i++) {
      const a = y0 + 0.07 + i * ((2 * hw - 0.14) / 4), b = a + (2 * hw - 0.14) / 4 - 0.035;
      const on = c.win[i];
      const base = on > 0.01 ? mixHex('#CFE5EE', STEPS[i].col, on) : '#CFE5EE';
      faceR(x1, a, b, 0.14 * sy, 0.44 * sy, glow(base, 0.72, mixHex(STEPS[i].col, '#FFF1C8', 0.5), 0.9));
    }
    // awnings: striped, sticking out a little
    const za = 0.5 * sy, zb = 0.64 * sy, n = 6;
    for (let i = 0; i < n; i++) {
      const a = lerp(x0, x1, i / n), b = lerp(x0, x1, (i + 1) / n);
      poly([P(a, y1 + 0.1, za), P(b, y1 + 0.1, za), P(b, y1, zb), P(a, y1, zb)], lit(i % 2 ? '#FFFFFF' : br.b, 0.92));
      const a2 = lerp(y0, y1, i / n), b2 = lerp(y0, y1, (i + 1) / n);
      poly([P(x1 + 0.1, a2, za), P(x1 + 0.1, b2, za), P(x1, b2, zb), P(x1, a2, zb)], lit(i % 2 ? '#FFFFFF' : br.b, 0.74));
    }
    // roof slab in the brand's head colour
    box(x0 - 0.04, y0 - 0.04, x1 + 0.04, y1 + 0.04, Hh, Hh + 0.1 * sy, br.head);
    // updated badge (after a wave passes)
    // billboard
    const s = P(cx, cy, Hh + 0.1 * sy);
    drawBillboard(c, s[0], s[1], Math.min(1, sy));
  }
  function drawBillboard(c, x, y, s) {
    const br = c.br;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const name = br.name.length > 14 ? br.name.slice(0, 13) + '…' : br.name;
    const font = `700 11.5px ${br.font}`;
    ctx.font = font;
    const tw = ctx.measureText(name).width;
    const lh = 14, w = 10 + lh * 1.5 + 5 + tw + 10, h = 24, top = -h - 12;
    ctx.strokeStyle = lit('#4A4658', 1); ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-8, top + h); ctx.moveTo(8, 0); ctx.lineTo(8, top + h); ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,.2)'; rrect(-w / 2, top + 2, w, h, 7); ctx.fill();
    ctx.fillStyle = br.head === '#FFFFFF' ? '#FFFFFF' : glow(br.head, 1, mixHex(br.head, '#FFFFFF', 0.15), 0.6);
    rrect(-w / 2, top, w, h, 7); ctx.fill();
    const lw = drawLogo(br, -w / 2 + 9, top + h / 2, lh, br.headOn);
    ctx.fillStyle = br.headOn; ctx.font = font; ctx.textBaseline = 'middle';
    ctx.fillText(name, -w / 2 + 9 + lw + 5, top + h / 2 + 0.5);
    if (c.updT && now - c.updT < 3.2) {
      const a = clamp(1 - (now - c.updT - 2.4) / 0.8, 0, 1);
      ctx.globalAlpha = a;
      ctx.fillStyle = '#B9A8FF'; rrect(w / 2 - 12, top - 8, 18, 14, 5); ctx.fill();
      ctx.strokeStyle = '#17151F'; ctx.lineWidth = 1.8; ctx.beginPath();
      ctx.moveTo(w / 2 - 7, top - 1); ctx.lineTo(w / 2 - 4, top + 2); ctx.lineTo(w / 2 + 1, top - 4); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (G.approval && (c.updT || REDUCED)) {
      ctx.font = '600 8.5px "Geist Mono", monospace';
      const t = '2 approvers', bw = ctx.measureText(t).width + 10;
      ctx.fillStyle = '#F2AE2E'; rrect(-bw / 2, top + h + 3, bw, 12, 6); ctx.fill();
      ctx.fillStyle = '#17151F'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(t, 0, top + h + 9.5); ctx.textAlign = 'left';
    }
    ctx.restore();
    // remember where the sign is (iso space) for glows and bubbles
    c.signAt = [x, y + top * s];
  }

  /* ---- citizens ---- */
  const SKIN = ['#F2C9A5', '#D9A57E', '#A8714E', '#7A4E34', '#F6D7BF'];
  function drawCitizen(c) {
    if (c.scale <= 0.02) return;
    const bob = c.state === 'walk' ? Math.abs(Math.sin(c.phase)) * 0.06 : 0;
    const p = P(c.px, c.py, bob);
    const g = P(c.px, c.py, 0);
    const s = c.scale;
    ellipse(g[0], g[1], 5 * s, 2.5 * s, 'rgba(30,30,50,.2)');
    const sq = c.state === 'walk' ? 1 + Math.sin(c.phase * 2) * 0.06 : 1;
    const bw = 7 * s / sq, bh = 11 * s * sq;
    ctx.fillStyle = lit(c.shirt, c.face);
    rrect(p[0] - bw / 2, p[1] - bh, bw, bh, 3.4 * s); ctx.fill();
    ellipse(p[0], p[1] - bh - 3 * s, 3.6 * s, 3.6 * s, lit(c.skin, 1));
    if (c.state === 'talk') {
      // a little phone glow in hand
      ellipse(p[0] + 3.5 * s, p[1] - bh * 0.55, 1.6 * s, 2.2 * s, NIGHT > 0.3 ? '#E8F2FF' : lit('#2A2733', 1));
    }
  }

  /* ---- particles & floaters ---- */
  function burst(x, y, z, n, kind, cols) {
    if (REDUCED) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = kind === 'dust' ? 0.6 + Math.random() * 0.6 : 1 + Math.random() * 2;
      particles.push({
        x, y, z, vx: Math.cos(a) * sp * (kind === 'dust' ? 1 : 0.6), vy: Math.sin(a) * sp * (kind === 'dust' ? 1 : 0.6), vz: kind === 'dust' ? 0.3 + Math.random() * 0.4 : 3 + Math.random() * 3,
        life: 0, max: kind === 'dust' ? 0.7 + Math.random() * 0.4 : 1.4 + Math.random() * 0.8, kind,
        col: cols ? cols[i % cols.length] : '#FFFFFF', r: Math.random() * 6, spin: (Math.random() - 0.5) * 12,
      });
    }
  }
  function drawParticles() {
    for (const q of particles) {
      const p = P(q.x, q.y, q.z), k = q.life / q.max;
      if (q.kind === 'dust') {
        ctx.globalAlpha = (1 - k) * 0.7;
        ellipse(p[0], p[1], 4 + k * 10, 3 + k * 6, lit('#F4EDE2', 1));
      } else if (q.kind === 'spark') {
        ctx.globalAlpha = 1 - k;
        ellipse(p[0], p[1], 2.2, 2.2, q.col);
      } else {
        ctx.globalAlpha = 1 - k * k;
        ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(q.r + q.life * q.spin);
        ctx.fillStyle = q.col; ctx.fillRect(-3, -1.6, 6, 3.2);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  }
  function floater(x, y, z, text, col) {
    if (REDUCED) return;
    const near = floaters.filter((f) => Math.abs(f.x - x) + Math.abs(f.y - y) < 1 && now - f.t0 < 0.9).length;
    floaters.push({ x, y, z: z + near * 0.55, text, col, t0: now });
  }
  function drawFloaters() {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `800 ${(15 / clamp(cam.z, 0.6, 1.2)).toFixed(1)}px "Bricolage Grotesque", Geist, sans-serif`;
    for (const f of floaters) {
      const k = (now - f.t0) / 1.8;
      const p = P(f.x, f.y, f.z + k * 1.1);
      ctx.globalAlpha = k < 0.15 ? k / 0.15 : 1 - Math.max(0, (k - 0.6) / 0.4);
      ctx.lineWidth = 3.2 / clamp(cam.z, 0.6, 1.2); ctx.strokeStyle = 'rgba(23,21,31,.6)'; ctx.lineJoin = 'round';
      ctx.strokeText(f.text, p[0], p[1]);
      ctx.fillStyle = f.col; ctx.fillText(f.text, p[0], p[1]);
    }
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
  }

  /* ================================================================ Update */
  let hudT = 0;
  function update(dt) {
    if (!REDUCED) G.dayT = (G.dayT + dt / CYCLE) % 1;
    updateLight();
    document.body.classList.toggle('night', NIGHT > 0.55);

    // camera
    const e = 1 - Math.exp(-dt * 3.2);
    cam.x = lerp(cam.x, cam.tx, e); cam.y = lerp(cam.y, cam.ty, e); cam.z = lerp(cam.z, cam.tz, e);
    focus.x = lerp(focus.x, focus.tx, e); focus.y = lerp(focus.y, focus.ty, e);
    if (REDUCED) { cam.x = cam.tx; cam.y = cam.ty; cam.z = cam.tz; focus.x = focus.tx; focus.y = focus.ty; }

    if (!REDUCED) {
      for (const c of cars) c.s += c.v * dt;
      for (const c of clouds) { c.x += c.v * dt; c.y -= c.v * 0.3 * dt; if (c.x > 17) { c.x = -6; c.y = 2 + Math.random() * 8; } }
      birds.t -= dt;
      if (birds.t < 0 && !birds.list.length) {
        birds.t = 18 + Math.random() * 10;
        const y0 = 2 + Math.random() * 6;
        for (let i = 0; i < 5; i++) birds.list.push({ x: -5 - i * 0.6 - (i % 2) * 0.3, y: y0 + i * 0.35, z: 3.5 + Math.random(), p: Math.random() * 6 });
      }
      for (const b of birds.list) { b.x += 1.6 * dt; b.y -= 0.5 * dt; }
      birds.list = birds.list.filter((b) => b.x < 18);
    }

    // particles
    for (const q of particles) {
      q.life += dt;
      q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt;
      if (q.kind !== 'dust') { q.vz -= 9 * dt; if (q.z < 0) { q.z = 0; q.vz *= -0.3; q.vx *= 0.6; q.vy *= 0.6; } }
    }
    for (let i = particles.length - 1; i >= 0; i--) if (particles[i].life > particles[i].max) particles.splice(i, 1);
    for (let i = floaters.length - 1; i >= 0; i--) if (now - floaters[i].t0 > 1.8) floaters.splice(i, 1);

    // storefront windows fade
    for (const p of plots) if (p.client) p.client.win = p.client.win.map((v) => Math.max(0, v - dt * 0.35));

    // wave
    if (wave) {
      wave.r += dt * 6.5;
      for (const p of plots) {
        if (!p.client || wave.hit.has(p) || !wave.targets.has(p)) continue;
        const d = Math.hypot(p.x + 0.5 - 6, p.y + 0.5 - 6);
        if (d < wave.r) {
          wave.hit.add(p);
          p.client.bounceT = now; p.client.updT = now;
          p.client.win = [1, 1, 1, 1];
          burst(p.x + 0.5, p.y + 0.5, 1.3, 14, 'spark', ['#B9A8FF', '#FFFFFF', p.client.br.b]);
          floater(p.x + 0.5, p.y + 0.5, 2.1, 'Updated', '#D9CFFF');
          Snd.tone(660 + wave.hit.size * 90, 0.12, 'sine', 0.04);
        }
      }
      if (wave.r > 12) { const n = wave.hit.size; wave = null; onWaveDone(n); }
    }

    // citizens
    if (!REDUCED) updateCitizens(dt);

    // money
    const clientsN = plots.filter((p) => p.client).length;
    G.revenue += clientsN * 80 * dt;
    hudT -= dt;
    if (hudT < 0 || REDUCED) { hudT = 0.1; renderHUD(); }

    if (NIGHT > 0.8 && clientsN > 0) achieve('night');
    placeBubbles();
    placePopover();
  }

  function updateCitizens(dt) {
    const open = plots.filter((p) => p.client && p.client.rise >= 1);
    for (const p of open) {
      const c = p.client;
      if (!c.visitor && now > c.nextSpawn && citizens.length < 14) spawnCitizen(p);
    }
    for (const c of citizens) {
      if (c.state === 'walk') {
        c.phase += dt * 11;
        c.scale = Math.min(1, c.scale + dt * 3);
        let move = c.speed * dt;
        while (move > 0 && c.seg < c.path.length - 1) {
          const a = c.path[c.seg], b = c.path[c.seg + 1];
          const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
          const left = (1 - c.f) * len;
          if (move < left) { c.f += move / len; move = 0; } else { move -= left; c.seg++; c.f = 0; }
        }
        const a = c.path[c.seg], b = c.path[Math.min(c.seg + 1, c.path.length - 1)];
        const dx = Math.sign(b[0] - a[0]), dy = Math.sign(b[1] - a[1]);
        const last = c.seg >= c.path.length - 2;
        const off = last ? 0 : c.lane;
        c.px = lerp(a[0], b[0], c.f) + 0.5 - dy * off;
        c.py = lerp(a[1], b[1], c.f) + 0.5 + dx * off;
        c.face = dx > 0 || dy < 0 ? 0.8 : 1;
        if (c.seg >= c.path.length - 1) {
          c.state = 'talk'; c.t = 0;
          const p = c.plot;
          c.px = p.dx + 0.5 + (p.x - p.dx) * 0.4; c.py = p.dy + 0.5 + (p.y - p.dy) * 0.4;
          startTalk(c);
        }
      } else if (c.state === 'talk') {
        c.t += dt;
        const w = c.plot.client.win;
        const stepI = Math.min(3, Math.floor(c.t / 1.3));
        w[stepI] = 1;
        if (c.t > 5.4) { c.state = 'enter'; c.t = 0; endTalk(c); }
      } else if (c.state === 'enter') {
        c.t += dt;
        c.scale = Math.max(0, 1 - c.t / 0.35);
        if (c.t > 0.4) c.done = true;
      }
    }
    for (let i = citizens.length - 1; i >= 0; i--) {
      if (citizens[i].done) {
        const c = citizens[i];
        if (c.plot.client) { c.plot.client.visitor = null; c.plot.client.nextSpawn = now + 0.8 + Math.random() * 1.8; }
        citizens.splice(i, 1);
      }
    }
  }
  function spawnCitizen(p) {
    const c = p.client;
    const from = SPAWNS[(Math.random() * SPAWNS.length) | 0];
    const path = bfs(from, [p.dx, p.dy]);
    if (!path) return;
    path.push([p.dx + (p.x - p.dx) * 0.4, p.dy + (p.y - p.dy) * 0.4]);
    // step out a few tiles from the door so there's nearly always a conversation going
    const start = Math.max(0, path.length - 5 - ((Math.random() * 3) | 0));
    const cz = {
      plot: p, path, seg: start, f: 0, speed: 1.5 + Math.random() * 0.4, lane: 0.28 * (Math.random() < 0.5 ? 1 : -1),
      px: path[start][0] + 0.5, py: path[start][1] + 0.5, state: 'walk', phase: Math.random() * 6, scale: 0, face: 1,
      shirt: Math.random() < 0.7 ? c.br.b : c.br.head, skin: SKIN[(Math.random() * SKIN.length) | 0],
    };
    citizens.push(cz);
    c.visitor = cz;
  }

  /* ---- speech bubbles: the client's team <-> the in-app assistant ---- */
  const bubLayer = $('#bubbles');
  const bubs = new Set();
  const SPARK = '<svg viewBox="0 0 24 24"><path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" fill="currentColor"/></svg>';
  function linesFor(c) {
    const v = voiceOf(c.br);
    let pool = G.tone === 'warm' ? v.warm.concat(v.lines.slice(2)) : v.lines;
    if (G.approval) pool = pool.concat([['Ready to send?', 'Jordan and Sam both approve it first.']]);
    c.li = ((c.li == null ? -1 : c.li) + 1) % pool.length;
    return pool[c.li];
  }
  function startTalk(cz) {
    const c = cz.plot.client;
    if (!c) return;
    const showing = [...bubs].filter((b) => !b.dying).length;
    const limit = isMobile() ? 1 : 3;
    if (showing >= limit) return;
    const [q, a] = linesFor(c);
    const br = c.br;
    const el = document.createElement('div');
    el.className = 'bub';
    el.style.setProperty('--b', br.b); el.style.setProperty('--on', br.on); el.style.setProperty('--bf', br.font);
    el.innerHTML = `<div class="q"><small><i></i>${esc(teamOf(br))}</small>${esc(q)}</div><div class="a"><small>${SPARK}${esc(br.name)} assistant</small>${esc(a)}</div>`;
    bubLayer.appendChild(el);
    const b = { el, plot: cz.plot, t0: now, dying: false };
    bubs.add(b);
    cz.bub = b;
    setTimeout(() => el.children[0].classList.add('in'), 30);
    setTimeout(() => { el.children[1].classList.add('in'); Snd.chat(); }, 1300);
  }
  function endTalk(cz) {
    const p = cz.plot;
    G.hours += 2.5;
    floater(p.x + 0.5, p.y + 0.5, 1.9, '+2.5h saved', '#B8F5D6');
    pop('#hHours');
    if (cz.bub) {
      const b = cz.bub;
      b.dying = true;
      b.el.classList.add('out');
      setTimeout(() => { b.el.remove(); bubs.delete(b); }, 400);
    }
  }
  function placeBubbles() {
    const a = freeArea();
    const list = [];
    for (const b of bubs) {
      const c = b.plot.client;
      if (!c) { b.el.remove(); bubs.delete(b); continue; }
      const [sx, sy] = S(b.plot.x + 0.5, b.plot.y + 0.5, 1.2);
      const s = clamp(cam.z, 0.7, 1.05);
      if (!b.h || now - b.t0 < 2) b.h = b.el.offsetHeight;
      const w = (isMobile() ? 150 : 196) * s, h = b.h * s;
      list.push({ b, s, w, h, x: clamp(sx, a.left + w / 2 + 6, a.right - w / 2 - 6), y: sy - 40 * cam.z });
    }
    // front-most first; later ones slide up so bubbles never cover each other
    list.sort((p, q) => q.y - p.y);
    const placed = [];
    for (const it of list) {
      let moved = true, guard = 0;
      while (moved && guard++ < 6) {
        moved = false;
        for (const o of placed) {
          if (Math.abs(it.x - o.x) < (it.w + o.w) / 2 + 4 && it.y > o.y - o.h - 4 && it.y - it.h < o.y + 4) { it.y = o.y - o.h - 6; moved = true; }
        }
      }
      placed.push(it);
      it.b.el.style.transform = `translate(${it.x.toFixed(1)}px, ${it.y.toFixed(1)}px) translateY(-100%) scale(${it.s.toFixed(3)})`;
    }
  }

  /* ================================================================ HUD, toasts, quest */
  let shown = { clients: -1, rev: -1, hours: -1, builds: -1 };
  function renderHUD() {
    const clientsN = plots.filter((p) => p.client).length;
    const b = G.built ? 1 : 0;
    if (b !== shown.builds) { $('#hBuilds').textContent = b; shown.builds = b; $('.stat-builds').classList.toggle('locked', !!b); }
    if (clientsN !== shown.clients) { $('#hClients').textContent = clientsN; shown.clients = clientsN; }
    const rev = Math.floor(G.revenue);
    if (rev !== shown.rev) { $('#hRev').textContent = '$' + rev.toLocaleString('en-AU'); shown.rev = rev; }
    const h = Math.round(G.hours * 10) / 10;
    if (h !== shown.hours) { $('#hHours').textContent = (h % 1 ? h.toFixed(1) : h) + 'h'; shown.hours = h; }
    // clock: dayT 0 = 06:00
    const mins = Math.floor(((G.dayT * 24 + 6) % 24) * 60);
    const hh = String(Math.floor(mins / 60)).padStart(2, '0'), mm = String(Math.floor((mins % 60) / 15) * 15).padStart(2, '0');
    $('#hClock span').textContent = `${hh}:${mm}`;
    $('#hClock i').className = NIGHT > 0.5 ? 'moon' : 'sun';
  }
  function pop(sel) {
    const el = $(sel);
    if (!el) return;
    const s = el.closest('.stat');
    s.classList.remove('pop'); void s.offsetWidth; s.classList.add('pop');
  }

  const MEDAL = '<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.3 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" fill="currentColor"/></svg>';
  const ACH = {
    build: ['Built once', 'Four steps. That’s the last build you’ll need.'],
    first: ['First sale', 'Your app is running in someone else’s brand.'],
    resale: ['First resale', 'Same app, new brand. Nothing rebuilt.'],
    rebrand: ['Rebranded in one sentence', 'You named a client. EAI read their site and did the rest.'],
    rule: ['Four steps. That’s the rule.', 'Apps are exactly four steps. It’s what makes them resellable.'],
    wave: ['One change, every client', 'Changed once in the builder. Every storefront updated.'],
    five: ['5 clients from one build', 'Builds: 1. Clients: 5.'],
    helper: ['Met the in-app assistant', 'That’s the client’s chat, in their brand. Not yours.'],
    night: ['Night shift', 'The apps keep working after hours.'],
    full: ['Tycoon', 'Every plot sold. Still one build.'],
  };
  const toastQ = [];
  let toasting = 0;
  function achieve(id, sub) {
    if (G.ach.has(id)) return;
    G.ach.add(id);
    const [t, d] = ACH[id];
    toast(t, sub || d, 'Achievement');
    Snd.medal();
    renderQuest();
  }
  function toast(title, body, kicker, info) {
    toastQ.push({ title, body, kicker, info });
    flushToasts();
  }
  function flushToasts() {
    const box = $('#toasts');
    while (toastQ.length && toasting < (isMobile() ? 1 : 2)) {
      const t = toastQ.shift();
      toasting++;
      const el = document.createElement('div');
      el.className = 'toast' + (t.info ? ' info' : '');
      el.innerHTML = `<span class="medal">${t.info ? SPARK : MEDAL}</span><span><span class="t-k">${esc(t.kicker || '')}</span><b>${esc(t.title)}</b><small>${esc(t.body)}</small></span>`;
      box.appendChild(el);
      setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); toasting--; flushToasts(); }, 360); }, REDUCED ? 5000 : 3600);
    }
  }

  function renderQuest() {
    const clientsN = plots.filter((p) => p.client).length;
    const goals = [
      { t: 'Build one app', m: `${G.blocks.length}/4 blocks`, done: G.built },
      { t: 'Sell it to three clients', m: `${Math.min(3, clientsN)}/3`, done: clientsN >= 3 },
      { t: 'Open a storefront and ask its assistant something', m: '', done: G.ach.has('helper') },
      { t: 'Push one change to every client', m: '', done: G.updates > 0 },
    ];
    const cur = goals.findIndex((g) => !g.done);
    const allDone = cur === -1;
    $('#quest').innerHTML = `<h4>${allDone ? 'Tycoon status' : 'Goals'} <small>${G.ach.size}/${Object.keys(ACH).length} achievements</small></h4>` +
      `<ol>${goals.map((g, i) => `<li class="${g.done ? 'done' : i === cur ? 'now' : ''}"><span class="ck"></span><span>${esc(g.t)} ${g.m && !g.done ? `<em>${g.m}</em>` : ''}</span></li>`).join('')}</ol>` +
      `<div class="q-foot"><span>${allDone ? `1 build, ${clientsN} clients. Keep selling.` : '1 build. As many clients as you like.'}</span><button type="button" id="qRestart">Restart</button></div>`;
    $('#qRestart').onclick = () => { stopAuto(true); resetGame(); intro(); };
  }

  /* ================================================================ Builder chat (the maker's) */
  const thread = $('#bThread');
  const EAI_AV = '<span class="av av-eai"><svg viewBox="0 0 24 24"><path d="M4 5h9M4 12h7M4 19h9M4 5v14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="18.5" cy="12" r="2.6" fill="currentColor"/></svg></span>';
  function msg(who, html, cls) {
    const el = document.createElement('div');
    el.className = 'msg ' + who + (cls ? ' ' + cls : '');
    el.innerHTML = who === 'you'
      ? `<span class="av av-you">You</span><div class="body"><span class="who">You, building</span><span class="txt">${html}</span></div>`
      : `${EAI_AV}<div class="body"><span class="who">Builder</span><span class="txt">${html}</span></div>`;
    thread.appendChild(el);
    while (thread.children.length > 30) thread.firstChild.remove();
    thread.scrollTop = thread.scrollHeight;
    return el;
  }
  function botSay(html, cls, delay) {
    const el = msg('bot', '', 'typing');
    setTimeout(() => { el.classList.remove('typing'); if (cls) el.classList.add(cls); el.querySelector('.txt').innerHTML = html; thread.scrollTop = thread.scrollHeight; }, REDUCED ? 0 : (delay == null ? 450 : delay));
  }

  // Blueprint slots + block tray
  function renderBlueprint() {
    const slots = $('#bpSlots');
    slots.innerHTML = STEPS.map((s) => {
      const on = G.blocks.includes(s.id);
      return `<li class="${on ? 'on' : ''}${on && s.id === 'review' && G.approval ? ' upd' : ''}" data-slot="${s.id}" style="--c:${s.col}"><b>${s.name}</b><small>${s.id === 'review' && G.approval ? '2 approvers' : s.wire}</small></li>`;
    }).join('');
    $('#bpCount').textContent = `${G.blocks.length} of 4 steps`;
    $('#bpCount').classList.toggle('full', G.blocks.length === 4);
    $('#bp').classList.toggle('built', G.built);
    let shipped = $('#bp .shipped');
    if (!shipped) { shipped = document.createElement('div'); shipped.className = 'shipped'; $('#bp').appendChild(shipped); }
    shipped.innerHTML = `Built once. Running in <b>${plots.filter((p) => p.client).length}</b> client brand${plots.filter((p) => p.client).length === 1 ? '' : 's'}.`;
  }
  function renderTray() {
    $('#tray').innerHTML = STEPS.map((s) => `<button type="button" class="blk${G.blocks.includes(s.id) ? ' used' : ''}" data-blk="${s.id}" style="--c:${s.col}"><i></i>${s.name}<small>${s.wire}</small></button>`).join('') +
      EXTRAS.map((s) => `<button type="button" class="blk extra" data-blk="${s.id}"><i></i>+ ${s.name}</button>`).join('');
  }
  function renderChips() {
    const clientsN = plots.filter((p) => p.client).length;
    let chips;
    if (!G.built) chips = G.blocks.length ? ['Finish the build', 'Add a fifth step'] : ['Build a campaign email app', 'Add a fifth step'];
    else if (!clientsN) chips = ['Sell it to Nike', 'Make it for Apple'];
    else {
      const next = ['nike', 'apple', 'commbank'].find((k) => !plots.some((p) => p.client && p.client.br === BRANDS[k]));
      chips = [next ? `Make it for ${BRANDS[next].name}` : 'Make it for Qantas'];
      if (!G.approval) chips.push('Make Review need two approvers');
      if (G.tone !== 'warm') chips.push('Make the tone warmer');
      chips.push('Add a fifth step');
    }
    $('#bChips').innerHTML = chips.map((c) => `<button type="button" class="chip-say${/fifth/.test(c) ? ' warn' : ''}">${esc(c)}</button>`).join('');
  }

  function placeBlock(id, quiet) {
    if (EXTRAS.some((e) => e.id === id)) return rule(id);
    if (G.built || G.blocks.length >= 4) return rule(id);
    if (G.blocks.includes(id)) { botSay(`${STEP_BY_ID[id].name}’s already in. One of each, four in all.`); return false; }
    const s = STEP_BY_ID[id];
    G.blocks.push(id);
    G.floors.push({ id, col: s.col, t0: now + (REDUCED ? -9 : 0), landed: REDUCED });
    renderBlueprint(); renderTray(); renderQuest();
    if (!quiet) botSay(`${s.say} <span style="color:var(--mute)">${G.blocks.length} of 4.</span>`, null, 250);
    if (G.blocks.length === 4) {
      const done = () => {
        G.built = true;
        G.roofT = now;
        renderBlueprint(); renderChips(); renderQuest();
        burst(6, 6, studioTopZ, 26, 'confetti', STEPS.map((x) => x.col));
        Snd.sale();
        achieve('build');
        pop('#hBuilds');
        botSay('Built. That’s your <b>one build</b>, and the counter stays at 1. Now sell it: click an empty plot and name a client.', null, 300);
        glide(6, 6.6, 1);
      };
      if (REDUCED) done(); else setTimeout(done, 700);
    }
    return true;
  }
  function onFloorLanded(f) {
    burst(6, 6, 0.2, 10, 'dust');
    Snd.place(G.floors.indexOf(f));
    shakeT = now;
  }
  let shakeT = -9;
  function rule(id) {
    const el = $('#bpRule');
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    $('#builder').classList.remove('shake'); void $('#builder').offsetWidth; $('#builder').classList.add('shake');
    const b = id && $(`[data-blk="${id}"]`);
    if (b) { b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); }
    Snd.nope();
    botSay('Four steps. That’s the rule.', 'rule', 200);
    setTimeout(() => botSay('It’s what makes the app resellable. Anything extra goes inside a step.', null, 300), 500);
    achieve('rule');
    return false;
  }
  let building = false;
  async function autoBuild() {
    if (building) return;
    building = true;
    const gen = G.gen;
    for (const s of STEPS) {
      if (G.built || gen !== G.gen) break;
      if (!G.blocks.includes(s.id)) { placeBlock(s.id); await sleep(REDUCED ? 0 : 850); }
    }
    building = false;
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function builderInput(text) {
    text = text.trim();
    if (!text) return;
    msg('you', esc(text));
    const t = text.toLowerCase();
    if (/(fifth|5th|sixth|another step|extra step|add a step|more steps|translate|schedule|step five|add (an? )?[a-z-]+ step)/.test(t)) return void rule();
    const sellM = /(?:make (?:it|one) for|sell (?:it )?to|rebrand (?:it )?(?:for|as)|for)\s+(.+?)[.!?]*$/i.exec(text);
    if (!G.built) {
      if (sellM) return void botSay('Build it first. Then you can sell it to as many clients as you like. Try “Build a campaign email app”.');
      if (/(build|campaign|email|app|make|start|finish|go|yes)/.test(t)) { botSay('Four blocks, in order. Watch the studio.', null, 250); setTimeout(autoBuild, REDUCED ? 0 : 600); return; }
      return void botSay('I build and change the app. Try “Build a campaign email app”, or drop the four blocks in above.');
    }
    if (/approver|sign[- ]?off|approv/.test(t)) return void pushUpdate('approval');
    if (/(warm|friendl|tone|casual|softer)/.test(t)) return void pushUpdate('warm');
    if (sellM) return void sellByName(sellM[1].trim(), true);
    if (/^(nike|apple|commbank)$/i.test(t)) return void sellByName(text, true);
    botSay('I change the app itself: try “Make it for Qantas”, “Make Review need two approvers” or “Make the tone warmer”. The writing help lives in each client’s app.');
  }

  /* ================================================================ Selling */
  function withTimeout(ms) { const c = new AbortController(); setTimeout(() => c.abort(), ms); return c.signal; }
  async function findDomain(name) {
    if (/\.[a-z]{2,}$/i.test(name)) return { name, domain: name.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '') };
    try {
      const r = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(name)}`, { signal: withTimeout(4000) });
      const list = await r.json();
      if (list[0] && list[0].domain) return { name: list[0].name, domain: list[0].domain };
    } catch (e) { /* fall through */ }
    return { name, domain: name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com' };
  }
  async function viaMicrolink(found) {
    const url = `https://api.microlink.io/?url=${encodeURIComponent('https://' + found.domain)}&palette=true&prerender=false`;
    const json = await fetch(url, { signal: withTimeout(12000) }).then((r) => r.json());
    if (json.status !== 'success') throw new Error('lookup failed');
    const d = json.data;
    const logoPal = (d.logo && d.logo.palette) || [];
    const imagePal = (d.image && d.image.palette) || [];
    return liveBrand(found, pickPrimary(logoPal, imagePal), d.logo && d.logo.url, logoPal.concat(imagePal), d.description || d.title);
  }
  function viaIcon(found) {
    const src = `https://icon.horse/icon/${found.domain}`;
    return new Promise((res, rej) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onerror = rej;
      img.onload = () => {
        try {
          const c = document.createElement('canvas');
          c.width = c.height = 32;
          const x = c.getContext('2d');
          x.drawImage(img, 0, 0, 32, 32);
          const px = x.getImageData(0, 0, 32, 32).data;
          const counts = {};
          for (let i = 0; i < px.length; i += 4) {
            if (px[i + 3] < 200) continue;
            const hex = '#' + [px[i], px[i + 1], px[i + 2]].map((v) => (v & 0xf0).toString(16).padStart(2, '0')).join('');
            counts[hex] = (counts[hex] || 0) + 1;
          }
          const pal = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 8);
          res(liveBrand(found, pickPrimary(pal, []), src, pal, ''));
        } catch (e) { rej(e); }
      };
      img.src = src;
    });
  }
  async function readLive(name, step) {
    const found = await findDomain(name);
    step && step(`Found ${found.domain}. Reading colours and logo…`);
    const full = viaMicrolink(found).catch(() => null);
    const icon = viaIcon(found).catch(() => null);
    const later = new Promise((r) => setTimeout(r, 5000)).then(() => icon);
    let b = await Promise.race([full, later]);
    if (!b) b = (await full) || (await icon);
    if (!b) throw new Error('no brand');
    return b;
  }
  function guessBrand(name) {
    let h = 0;
    for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const hue = h % 360;
    const hsl = (hh, s, l) => { s /= 100; l /= 100; const k = (n) => (n + hh / 30) % 12; const a = s * Math.min(l, 1 - l); const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return toHex([f(0) * 255, f(8) * 255, f(4) * 255]); };
    const nm = name.trim().replace(/^\w/, (c) => c.toUpperCase());
    const br = liveBrand({ name: nm, domain: nm.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com' }, hsl(hue, 70, 45), null, [], '');
    br.tone = 'A best guess from the name';
    return br;
  }

  async function sell(p, name, viaChat) {
    if (!G.built) { botSay('Build it first. The studio’s still empty.'); $('#builder').classList.remove('nudge'); void $('#builder').offsetWidth; $('#builder').classList.add('nudge'); return; }
    if (p.client || p.pending) return;
    name = name.trim().slice(0, 40);
    if (!name) return;
    if (!viaChat) msg('you', `Make it for ${esc(name)}.`);
    let br = curated(name);
    const was = plots.find((q) => q.client && br && q.client.br === br);
    if (was) { botSay(`${br.name} already has it. Try another client: same app, new brand.`); return; }
    p.pending = { t0: now, name };
    const gen = G.gen;
    closePopover();
    glide(p.x + 0.5, p.y + 0.5, 1.12);
    if (!br) {
      const note = botSayLive(`Looking up ${esc(name)}…`);
      try { br = await Promise.race([readLive(name, (s) => note(esc(s))), sleep(9000).then(() => { throw new Error('slow'); })]); }
      catch (e) { br = guessBrand(name); }
    } else if (!REDUCED) await sleep(900);
    if (gen !== G.gen) return;
    p.pending = null;
    openShop(p, br);
    if (!auto) setTimeout(() => { if (!current && popEl.hidden && !down) home(); }, 3200);
    const who = br.live ? br.domain : (keyOf(br) ? BRANDS[keyOf(br)].domain : '');
    const toneLine = br.tone && !/Read live|best guess/.test(br.tone) ? `, “${esc(br.tone.toLowerCase())}”` : '';
    botSay(`Read <b>${esc(who || br.name)}</b>: colours, logo${toneLine}. Same four steps, now in ${esc(br.name)}’s brand. Storefront open.`, null, 200);
    return br;
  }
  function botSayLive(html) {
    const el = msg('bot', html);
    return (h) => { el.querySelector('.txt').innerHTML = h; };
  }
  function sellByName(name, viaChat) {
    const p = plots.find((q) => !q.client && !q.pending);
    if (!p) return void botSay('Every plot’s sold. Still one build.');
    return sell(p, name, viaChat);
  }
  function openShop(p, br) {
    const first = !plots.some((q) => q.client);
    p.client = {
      br, t0: now + (REDUCED ? -9 : 0), rise: REDUCED ? 1 : 0, bounceT: -9, updT: 0, win: [0, 0, 0, 0],
      wall: mixHex(br.b, '#FFFFFF', lumOf(br.b) > 0.7 ? 0.72 : 0.84), nextSpawn: now + 1.2, visitor: null,
    };
    if (!REDUCED) setTimeout(() => {
      burst(p.x + 0.5, p.y + 0.5, 0.1, 12, 'dust');
      burst(p.x + 0.5, p.y + 0.5, 1.2, 28, 'confetti', [br.b, br.head, '#FFFFFF']);
      floater(p.x + 0.5, p.y + 0.5, 2.2, '+$2.4k/mo', '#FFE7A0');
    }, 350);
    Snd.sale();
    pop('#hClients');
    const n = plots.filter((q) => q.client).length;
    if (first) achieve('first', `${br.name} is running your app.`);
    else { achieve('resale', `${br.name}: same app, new brand. Nothing rebuilt.`); achieve('rebrand'); }
    if (n >= 5) achieve('five');
    if (n >= plots.length) achieve('full');
    G.revenue += 400;
    renderBlueprint(); renderChips(); renderQuest(); renderSellPicks();
    requestRender();
  }

  /* ---- sell popover ---- */
  const popEl = $('#sellPop');
  let popPlot = null;
  function renderSellPicks() {
    $('#sellPicks').innerHTML = ['nike', 'apple', 'commbank'].filter((k) => !plots.some((p) => p.client && p.client.br === BRANDS[k]))
      .map((k) => `<button type="button" data-pick="${k}"><i style="--c:${BRANDS[k].b}"></i>${BRANDS[k].name}</button>`).join('');
  }
  function openPopover(p) {
    popPlot = p;
    renderSellPicks();
    $('#sellInput').value = '';
    $('#sellNote').textContent = 'EAI reads their website for colours, logo and tone of voice.';
    $('#sellNote').classList.remove('busy');
    popEl.hidden = false;
    popEl.style.animation = 'none'; void popEl.offsetWidth; popEl.style.animation = '';
    placePopover();
    if (!isMobile() && !autoOn()) setTimeout(() => $('#sellInput').focus({ preventScroll: true }), 50);
  }
  function closePopover() { popEl.hidden = true; popPlot = null; }
  function placePopover() {
    if (!popPlot || popEl.hidden) return;
    const [sx, sy] = S(popPlot.x + 0.5, popPlot.y + 0.5, 0.3);
    const w = popEl.offsetWidth, h = popEl.offsetHeight;
    const x = clamp(sx - w / 2, 8, W - w - 8), y = clamp(sy - h - 18, 70, H - h - 8);
    popEl.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px)`;
    popEl.style.left = '0px'; popEl.style.top = '0px';
  }

  /* ================================================================ Pushing an update to every storefront */
  function pushUpdate(kind) {
    const n = plots.filter((p) => p.client).length;
    if (kind === 'approval') {
      if (G.approval) return void botSay('Review already needs two approvers in every app. Still four steps.');
      G.approval = true;
      botSay(`Same four steps. <b>Review</b> now needs two approvers, Jordan Lee and Sam Patel, before anything sends. Pushing to ${n ? `all ${n} storefront${n === 1 ? '' : 's'}` : 'the app'}…`, null, 300);
    } else {
      if (G.tone === 'warm') return void botSay('It’s already warmer everywhere. Same four steps.');
      G.tone = 'warm';
      botSay(`Warmer tone, same brand voices. Pushing to ${n ? `all ${n} storefront${n === 1 ? '' : 's'}` : 'the app'}…`, null, 300);
    }
    G.updates++;
    renderBlueprint(); renderChips(); renderQuest();
    if (current) paintApp(current);
    setTimeout(() => {
      if (REDUCED) { onWaveDone(n); return; }
      wave = { r: 0.2, hit: new Set(), targets: new Set(plots.filter((p) => p.client)) };
      Snd.wave();
      glide(6, 6.4, 0.92);
      burst(6, 6, studioTopZ, 18, 'spark', ['#B9A8FF', '#FFFFFF']);
    }, REDUCED ? 0 : 700);
  }
  function onWaveDone(n) {
    if (n) {
      botSay(`Done. <b>${n}</b> client${n === 1 ? '' : 's'} updated. You changed it once.`, null, 100);
      achieve('wave', `Updated ${n} storefront${n === 1 ? '' : 's'} at once.`);
    } else botSay('Done. Every client you sell to from now on gets it too.', null, 100);
    requestRender();
  }

  /* ================================================================ The client's app panel */
  const panel = $('#appPanel');
  const app = $('#pApp');
  let current = null;
  function openApp(p) {
    current = p;
    closePopover();
    paintApp(p);
    panel.hidden = false;
    document.body.classList.add('app-open');
    requestAnimationFrame(() => panel.classList.add('in'));
    fit();
    // zoom in on the storefront whatever the (now narrower) free area is
    glide(p.x + 0.5, p.y + 0.3, clamp(1.05 / cam.base, 1, 3));
    requestRender();
  }
  function closeApp() {
    current = null;
    panel.classList.remove('in');
    document.body.classList.remove('app-open');
    app.classList.remove('chat-open');
    setTimeout(() => { if (!current) panel.hidden = true; }, 350);
    fit();
    home();
    requestRender();
  }
  function paintApp(p) {
    const br = p.client.br;
    app.dataset.step = app.dataset.step || 0;
    STM.paint(app, br, { fields: true });
    goStep(+app.dataset.step || 0);
    $('#apTeam').textContent = teamOf(br);
    const av = $('#apAv');
    av.textContent = br.name[0].toUpperCase();
    av.style.setProperty('--b', br.b); av.style.setProperty('--on', br.on);
    $('#paName').textContent = `${br.name} assistant`;
    $('#paFor').textContent = `for ${teamOf(br)}`;
    $('#paInput').placeholder = `Ask the ${br.name} assistant…`;
    $('#phUpd').hidden = !(G.updates > 0);
    $('#phUpd').textContent = G.approval ? 'Updated: Review needs 2 approvers' : 'Updated by the builder';
    // the assistant thread (STM.paint fills it with a greeting + subject lines)
    const th = $('#paThread');
    th.innerHTML = STM.assistHTML(br).replace('campaign assistant', 'assistant');
    const v = voiceOf(br);
    $('#paChips').innerHTML = ['Make the intro shorter', 'Write the button', 'Can you add a step?'].map((c) => `<button type="button">${esc(c)}</button>`).join('');
    void v;
  }
  function goStep(i) {
    STM.goStep(app, i);
    const card = app.querySelector('.p-card');
    if (i === 3 && G.approval) {
      const who = card.querySelector('.pr-who');
      if (who) {
        const two = who.cloneNode(true);
        two.querySelector('.pr-av').textContent = 'SP';
        two.querySelector('b').textContent = 'Sam Patel';
        two.querySelector('small').textContent = 'Legal · approver';
        who.after(two);
      }
      const sub = card.querySelector('.p-card-sub');
      if (sub) sub.textContent = sub.textContent.replace('One approval', 'Two approvals');
      const tag = document.createElement('span');
      tag.className = 'pr-upd';
      tag.textContent = '2 approvers · pushed by the builder';
      card.querySelector('.p-card-hd').after(tag);
    }
    if (i === 2 && G.tone === 'warm' && current) {
      const b = card.querySelector('.pm-body p');
      if (b) b.textContent = voiceOf(current.client.br).warm[1][1] + ' ' + b.textContent;
    }
  }
  app.querySelectorAll('.p-step').forEach((s, n) => { s.setAttribute('role', 'button'); s.tabIndex = 0; s.addEventListener('click', () => goStep(n)); });
  app.querySelector('.p-card').addEventListener('click', (e) => { if (e.target.closest('[data-next]')) goStep(Math.min(3, (+app.dataset.step || 0) + 1)); });
  app.querySelector('.p-fab').addEventListener('click', () => app.classList.add('chat-open'));
  app.querySelector('.pa-close').addEventListener('click', () => app.classList.remove('chat-open'));

  // The in-app assistant: helps the client's team with the work, in the brand's voice. Never edits the app.
  function assistantReply(br, text) {
    const t = text.toLowerCase(), v = voiceOf(br);
    const warm = G.tone === 'warm';
    if (/(add|remove|delete|new|another|extra|fifth|more).{0,14}(step|approver)|change the app|rebuild|rebrand|restructure|edit the app|approval step|two approvers/.test(t)) {
      return { cls: 'no', html: `I can’t change how this app works. That’s up to whoever built it for ${esc(br.name)}. I can help you write this campaign, though.` };
    }
    if (/subject|headline|title/.test(t)) {
      const list = (warm ? [v.warm[0][1]] : []).concat(v.lines.map((l) => l[1])).slice(0, 3);
      return { html: `Three, in ${esc(br.name)}’s voice:<ul class="pa-list">${list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` };
    }
    if (/short|intro|trim|tight|cut/.test(t)) return { html: `Shorter:<ul class="pa-list"><li>${esc(warm ? v.warm[1][1] : v.short)}</li></ul>` };
    if (/button|cta|call to action/.test(t)) return { html: `Button options:<ul class="pa-list">${v.cta.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` };
    if (/tone|voice|sound/.test(t)) return { html: `We write like ${esc(br.name)}: ${esc((br.tone || 'on brand').toLowerCase())}${warm ? ', and a little warmer lately' : ''}.` };
    if (/send|approv|review/.test(t)) return { html: G.approval ? 'Once it’s ready, Jordan Lee and Sam Patel both approve it in Review, then it sends.' : 'Once it’s ready, Jordan Lee approves it in Review, then it sends.' };
    return { html: `Here’s a start, in ${esc(br.name)}’s voice:<ul class="pa-list"><li>${esc(warm ? v.warm[1][1] : v.lines[1][1])}</li></ul>` };
  }
  function askAssistant(text) {
    if (!current || !text.trim()) return;
    const br = current.client.br;
    const th = $('#paThread');
    const u = document.createElement('div'); u.className = 'pa-user'; u.textContent = text; th.appendChild(u);
    const a = document.createElement('div'); a.className = 'pa-ai typing'; th.appendChild(a);
    th.scrollTop = th.scrollHeight;
    const r = assistantReply(br, text);
    setTimeout(() => { a.classList.remove('typing'); if (r.cls) a.classList.add(r.cls); a.innerHTML = r.html; th.scrollTop = th.scrollHeight; Snd.chat(); }, REDUCED ? 0 : 600);
    // the storefront's windows flicker as the app is used
    current.client.win = [1, 1, 1, 1].map((v, i) => (i === 2 ? 1 : 0.4));
    achieve('helper', `That’s ${teamOf(br)}’s chat, in their brand. Not yours.`);
  }

  /* ================================================================ Input */
  let down = null;
  function hitTest(sx, sy) {
    // storefronts front-to-back by screen rectangle
    const shops = plots.filter((p) => p.client).sort((a, b) => b.x + b.y - (a.x + a.y));
    for (const p of shops) {
      const l = S(p.x + 0.05, p.y + 0.95, 0)[0], r = S(p.x + 0.95, p.y + 0.05, 0)[0];
      const top = S(p.x + 0.5, p.y + 0.5, 2.0)[1], bot = S(p.x + 1, p.y + 1, 0)[1];
      if (sx >= l && sx <= r && sy >= top && sy <= bot) return { kind: 'shop', p };
    }
    const sl = S(5, 7, 0)[0], sr = S(7, 5, 0)[0], st = S(6, 6, 2.6)[1], sb = S(7, 7, 0)[1];
    if (sx >= sl && sx <= sr && sy >= st && sy <= sb) {
      const [wx, wy] = unproject(sx, sy);
      if (wx > 4.7 && wy > 4.7) return { kind: 'studio' };
    }
    const [wx, wy] = unproject(sx, sy);
    const tx = Math.floor(wx), ty = Math.floor(wy);
    const p = plots.find((q) => q.x === tx && q.y === ty);
    if (p) return { kind: p.client ? 'shop' : 'plot', p };
    return null;
  }
  cvs.addEventListener('pointerdown', (e) => {
    down = { x: e.clientX, y: e.clientY, cx: cam.tx, cy: cam.ty, drag: false, id: e.pointerId };
  });
  cvs.addEventListener('pointermove', (e) => {
    const r = cvs.getBoundingClientRect();
    const sx = e.clientX - r.left, sy = e.clientY - r.top;
    if (down) {
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      if (!down.drag && Math.hypot(dx, dy) > 6) { down.drag = true; cvs.classList.add('dragging'); try { cvs.setPointerCapture(down.id); } catch (err) { /* noop */ } }
      if (down.drag) {
        cam.tx = clamp(down.cx - dx / cam.z, -520, 520);
        cam.ty = clamp(down.cy - dy / cam.z, -80, 560);
        if (REDUCED) requestRender();
        return;
      }
    }
    const h = hitTest(sx, sy);
    const nh = h && (h.kind === 'plot' ? { kind: 'plot', p: h.p } : h.kind === 'studio' ? { kind: 'studio' } : { kind: 'shop', p: h.p });
    const changed = (nh && nh.p) !== (hover && hover.p) || (nh && nh.kind) !== (hover && hover.kind);
    hover = nh;
    cvs.classList.toggle('pointer', !!nh);
    if (changed) requestRender();
  });
  const endDrag = (e) => {
    if (!down) return;
    const wasDrag = down.drag;
    down = null;
    cvs.classList.remove('dragging');
    if (wasDrag || e.type === 'pointercancel') return;
    const r = cvs.getBoundingClientRect();
    const h = hitTest(e.clientX - r.left, e.clientY - r.top);
    if (!h) { closePopover(); return; }
    if (h.kind === 'plot') {
      if (!G.built) { botSay('That plot’s for sale, but there’s nothing to sell yet. Build the app first: drop the four blocks in.'); $('#builder').classList.remove('nudge'); void $('#builder').offsetWidth; $('#builder').classList.add('nudge'); return; }
      if (h.p.pending) return;
      openPopover(h.p);
    } else if (h.kind === 'shop') openApp(h.p);
    else if (h.kind === 'studio') {
      closePopover();
      $('#builder').classList.remove('nudge'); void $('#builder').offsetWidth; $('#builder').classList.add('nudge');
      if (isMobile()) $('#builder').classList.remove('min');
      if (!G.built) $('#bInput').focus({ preventScroll: true });
    }
  };
  cvs.addEventListener('pointerup', endDrag);
  cvs.addEventListener('pointercancel', endDrag);
  cvs.addEventListener('pointerleave', () => { if (!down && hover) { hover = null; cvs.classList.remove('pointer'); requestRender(); } });

  $('#zoomCtl').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.z === 'in') cam.user = clamp(cam.user * 1.2, 0.6, 2.2);
    else if (b.dataset.z === 'out') cam.user = clamp(cam.user / 1.2, 0.6, 2.2);
    else return void (home(), requestRender());
    cam.tz = cam.base * cam.user;
    requestRender();
  });

  // Builder: blocks (click or drag onto the blueprint / studio)
  let drag = null;
  $('#tray').addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.blk');
    if (!b || b.classList.contains('used')) return;
    drag = { b, id: b.dataset.blk, x: e.clientX, y: e.clientY, ghost: null };
    e.preventDefault();
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (!drag.ghost && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) {
      drag.ghost = drag.b.cloneNode(true);
      drag.ghost.classList.add('ghost-blk');
      document.body.appendChild(drag.ghost);
    }
    if (drag.ghost) {
      drag.ghost.style.left = e.clientX + 'px'; drag.ghost.style.top = e.clientY + 'px';
      const over = document.elementFromPoint(e.clientX, e.clientY);
      document.querySelectorAll('.bp-slots li').forEach((li) => li.classList.toggle('drop', !!over && (over.closest('.bp-slots') === li.parentElement) && li.dataset.slot === drag.id));
    }
  });
  window.addEventListener('pointerup', (e) => {
    if (!drag) return;
    const d = drag;
    drag = null;
    document.querySelectorAll('.bp-slots li.drop').forEach((li) => li.classList.remove('drop'));
    if (d.ghost) {
      d.ghost.remove();
      const over = document.elementFromPoint(e.clientX, e.clientY);
      const onBp = over && (over.closest('#bp') || over === cvs);
      if (onBp) placeBlock(d.id);
    } else placeBlock(d.id);
  });

  $('#bChips').addEventListener('click', (e) => {
    const b = e.target.closest('.chip-say');
    if (b) builderInput(b.textContent);
  });
  $('#bForm').addEventListener('submit', (e) => { e.preventDefault(); const v = $('#bInput').value; $('#bInput').value = ''; builderInput(v); });
  $('#bdMin').addEventListener('click', () => { $('#builder').classList.toggle('min'); setTimeout(() => fit(), 30); });

  $('#sellForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#sellInput').value.trim();
    if (!v || !popPlot) return;
    if (!curated(v)) { $('#sellNote').textContent = `Reading ${v}’s website…`; $('#sellNote').classList.add('busy'); }
    sell(popPlot, v);
  });
  $('#sellPicks').addEventListener('click', (e) => { const b = e.target.closest('[data-pick]'); if (b && popPlot) sell(popPlot, BRANDS[b.dataset.pick].name); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closePopover(); if (current) closeApp(); } });

  $('#apClose').addEventListener('click', closeApp);
  $('#paForm').addEventListener('submit', (e) => { e.preventDefault(); const v = $('#paInput').value; $('#paInput').value = ''; askAssistant(v); });
  $('#paChips').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) askAssistant(b.textContent); });

  $('#bSound').addEventListener('click', () => {
    const on = Snd.toggle();
    $('#bSound').setAttribute('aria-pressed', on);
    $('#bSound .lbl').textContent = on ? 'Sound on' : 'Sound off';
    if (on) Snd.sale();
  });

  /* ================================================================ Autoplay: "Just show me" */
  let auto = null;
  const autoOn = () => !!auto;
  function setAutoUI() {
    const b = $('#bAuto');
    b.classList.toggle('playing', !!auto);
    $('#bAuto .lbl').textContent = auto ? 'Take control' : 'Just show me';
    $('#apBanner').hidden = !auto;
  }
  function stopAuto(silent) {
    if (!auto) return;
    auto.dead = true;
    auto = null;
    setAutoUI();
    const typing = $('#bInput');
    if (typing.dataset.auto) { typing.value = ''; delete typing.dataset.auto; }
    if (!silent) toast('You’re in control', G.built ? 'Click an empty plot and name any company.' : 'Drop the four blocks in, or tell the builder what to make.', 'Your turn', true);
  }
  async function runAuto(fresh) {
    stopAuto(true);
    if (fresh) resetGame();
    const tok = auto = { dead: false };
    setAutoUI();
    const w = (ms) => new Promise((res, rej) => setTimeout(() => (tok.dead ? rej(new Error('stop')) : res()), ms));
    const typeInto = async (input, text) => {
      input.dataset.auto = '1';
      input.value = '';
      for (const ch of text) { input.value += ch; await w(38); }
      delete input.dataset.auto;
    };
    try {
      await w(700);
      if (!G.built) {
        botSay('Hi. Let’s build one app, then sell it to the whole city.', null, 200);
        await w(1100);
        await typeInto($('#bInput'), 'Build a campaign email app');
        await w(200);
        $('#bInput').value = '';
        msg('you', 'Build a campaign email app');
        botSay('Four blocks, in order. Watch the studio.', null, 250);
        glide(6, 6.3, 1.25);
        await w(800);
        for (const s of STEPS) { if (!G.blocks.includes(s.id)) { placeBlock(s.id); await w(1000); } }
        await w(300);
        msg('you', 'Add a translate step too');
        rule('translate');
        await w(2300);
      }
      const want = ['Nike', 'Apple', 'CommBank'];
      for (let i = 0; i < want.length; i++) {
        const name = want[i];
        if (plots.some((p) => p.client && p.client.br.name === name)) continue;
        const p = plots.find((q) => !q.client && !q.pending);
        if (!p) break;
        if (i < 2) {
          glide(p.x + 0.5, p.y + 0.5, 1.05);
          await w(700);
          openPopover(p);
          await w(600);
          await typeInto($('#sellInput'), name);
          await w(350);
          sell(p, name);
        } else {
          home();
          await typeInto($('#bInput'), `Make it for ${name}`);
          await w(200);
          $('#bInput').value = '';
          builderInput(`Make it for ${name}`);
        }
        await w(2600);
      }
      home();
      await w(2600);
      // open a storefront and talk to its assistant as the client's team
      const nike = plots.find((p) => p.client && p.client.br === BRANDS.nike) || plots.find((p) => p.client);
      if (nike) {
        openApp(nike);
        await w(1400);
        goStep(2);
        await w(1200);
        await typeInto($('#paInput'), 'Make the intro shorter');
        await w(200);
        $('#paInput').value = '';
        askAssistant('Make the intro shorter');
        await w(2800);
        closeApp();
        await w(1200);
      }
      if (!G.approval) {
        await typeInto($('#bInput'), 'Make Review need two approvers');
        await w(200);
        $('#bInput').value = '';
        builderInput('Make Review need two approvers');
        await w(4200);
      }
      home();
      auto = null;
      setAutoUI();
      toast('Your turn', 'Click an empty plot and name any company. Or click a storefront.', 'That’s the loop', true);
      botSay('That’s the loop. Your turn: sell it to someone else. Any company works.', null, 400);
    } catch (e) { /* stopped by the visitor */ }
  }
  // Any real interaction with the game hands control back.
  $('.game').addEventListener('pointerdown', (e) => {
    if (!auto) return;
    if (e.target.closest('#bAuto')) return;
    stopAuto();
  }, true);
  document.addEventListener('keydown', (e) => { if (auto && !e.metaKey && !e.ctrlKey) stopAuto(); });
  $('#bAuto').addEventListener('click', () => { if (auto) stopAuto(); else runAuto(true); });
  $('#apTake').addEventListener('click', () => stopAuto());

  /* ================================================================ Reset / intro */
  function resetGame() {
    closePopover();
    if (current) closeApp();
    G.blocks = []; G.floors = []; G.built = false; G.roofT = -99; G.approval = false; G.tone = 'default';
    G.revenue = 0; G.hours = 0; G.ach = new Set(); G.updates = 0; G.gen++;
    for (const p of plots) { p.client = null; p.pending = null; }
    citizens.length = 0; particles.length = 0; floaters.length = 0; wave = null;
    for (const b of bubs) b.el.remove();
    bubs.clear();
    thread.innerHTML = '';
    shown = { clients: -1, rev: -1, hours: -1, builds: -1 };
    renderBlueprint(); renderTray(); renderChips(); renderQuest(); renderHUD();
    home();
  }
  function intro() {
    botSay('Hi. You’re the builder here. Make <b>one</b> app in your studio (drop in four blocks, or tell me) then sell it to everyone in town.', null, 200);
  }

  /* ================================================================ Loop */
  let last = performance.now(), running = true, rafPending = false;
  function frame(ts) {
    const dt = Math.min(0.05, (ts - last) / 1000);
    last = ts;
    if (!REDUCED) now += dt;
    update(dt);
    render();
    if (!REDUCED && running) requestAnimationFrame(frame);
    else rafPending = false;
  }
  function requestRender() {
    if (!REDUCED) return;
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame((ts) => { last = ts; frame(ts); });
  }
  // Pause when the game is off screen.
  const io = new IntersectionObserver(([en]) => {
    const vis = en.isIntersecting;
    if (vis && !running && !REDUCED) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    running = vis;
    if (!vis && auto) stopAuto(true);
  }, { threshold: 0.05 });
  io.observe($('.game'));

  window.addEventListener('resize', () => { resize(); requestRender(); });

  /* ================================================================ Summary: QR */
  function drawQr(key) {
    const url = new URL('../../app.html?c=' + key, location.href).href;
    $('#shOpen').href = url;
    $('#shName').textContent = BRANDS[key].name;
    if (window.QRCode) window.QRCode.toCanvas($('#shQr'), url, { width: 168, margin: 0, errorCorrectionLevel: 'L', color: { dark: '#17151f', light: '#ffffff' } }, () => {});
  }
  $('#shPicks').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    $('#shPicks').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    drawQr(b.dataset.c);
  });
  $('#bSkip').addEventListener('click', () => stopAuto(true));

  /* ================================================================ Boot */
  renderBlueprint(); renderTray(); renderChips(); renderQuest();
  resize();
  home(); cam.x = cam.tx; cam.y = cam.ty;
  drawQr('nike');

  if (REDUCED) {
    // A finished city: built once, sold three times, with the update applied.
    G.dayT = 0.2;
    ['brief', 'assets', 'compose', 'review'].forEach((id) => { G.blocks.push(id); G.floors.push({ id, col: STEP_BY_ID[id].col, t0: -9, landed: true }); });
    G.built = true; G.roofT = -9; G.approval = true; G.updates = 1;
    G.ach.add('build'); G.ach.add('first'); G.ach.add('resale'); G.ach.add('wave');
    [BRANDS.nike, BRANDS.apple, BRANDS.commbank].forEach((br, i) => {
      const p = plots[i];
      p.client = { br, t0: -9, rise: 1, bounceT: -9, updT: 0, win: [1, 1, 1, 1], wall: mixHex(br.b, '#FFFFFF', lumOf(br.b) > 0.7 ? 0.72 : 0.84), nextSpawn: 1e9, visitor: null };
      const cz = { plot: p, px: p.dx + 0.5 + (p.x - p.dx) * 0.4, py: p.dy + 0.5 + (p.y - p.dy) * 0.4, state: 'talk', phase: 0, scale: 1, face: 1, shirt: br.b, skin: SKIN[i] };
      citizens.push(cz);
    });
    G.revenue = 7200; G.hours = 7.5;
    msg('you', 'Build a campaign email app');
    msg('bot', 'Built. Four steps: Brief, Assets, Compose, Review. That’s your one build.');
    msg('you', 'Make it for Nike. Then Apple. Then CommBank.');
    msg('bot', 'Three storefronts open. Same four steps, three brands.');
    msg('you', 'Make Review need two approvers');
    msg('bot', 'Same four steps. <b>Review</b> now needs two approvers. Pushed to all 3 storefronts.');
    renderBlueprint(); renderChips(); renderQuest(); renderSellPicks();
    // static bubbles
    const bubLimit = isMobile() ? 1 : 3;
    citizens.slice(0, bubLimit).forEach((cz) => {
      startTalk(cz);
      cz.bub && cz.bub.el.querySelectorAll('div').forEach((d) => d.classList.add('in'));
    });
    requestRender();
    // no animation loop: redraw a few times a second so panel actions (sell, open, update) show up
    setInterval(requestRender, 400);
  } else {
    requestAnimationFrame((ts) => { last = ts; frame(ts); });
    if (params.has('manual')) intro();
    else setTimeout(() => runAuto(false), 600);
  }
  if (document.fonts) document.fonts.ready.then(() => { fit(); requestRender(); });

  // Handy for recordings / tests.
  window.__plotPos = (i, z) => { const p = plots[i]; const r = cvs.getBoundingClientRect(); const q = S(p.x + 0.5, p.y + 0.5, z || 0); return [q[0] + r.left, q[1] + r.top]; };
  window.TYCOON = { G, plots, sell: sellByName, placeBlock, pushUpdate, openApp: (i) => openApp(plots[i]), stopAuto, runAuto };
})();
