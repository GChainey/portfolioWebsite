/* The brand factory — brand data, live lookup and the 2D drawing of the
   Campaign email app. Everything the 3D scene (and the static fallback)
   paints onto a phone screen comes from here, so a brand is one object and
   one pair of canvases: the "base" (chrome, stepper, empty sockets) and the
   "cards" (the four steps that snap into the sockets). */

export const STEPS = [
  ['Brief', 'Form'],
  ['Assets', 'Data source'],
  ['Compose', 'AI writer'],
  ['Review', 'Approval'],
];

const SWOOSH_D = 'M24 7.8 6.442 15.276c-1.456.616-2.679.925-3.668.925-1.11 0-1.922-.392-2.437-1.177-.317-.503-.4-1.152-.25-1.947.152-.795.532-1.643 1.14-2.543.505-.75 1.371-1.708 2.6-2.874-.365.615-.766 1.395-1.084 2.155-.55 1.32-.68 2.4-.394 3.24.13.375.365.65.68.83.36.2.83.29 1.41.29.44 0 .93-.06 1.47-.18L24 7.8Z';
const APPLE_D = 'M584.8426,276.8632c-2.3411,1.4432-53.8358,31.4239-53.251,93.7952c0.6472,74.6027,65.3989,99.4457,66.1427,99.7276c-0.58,1.7759-10.3524,35.3838-34.1321,70.0925c-20.5507,30.0693-41.8387,59.968-75.4384,60.5922c-33.0098,0.6046-43.6489-19.5858-81.3589-19.5858c-37.7331,0-49.5436,18.9615-80.7596,20.1904c-32.4307,1.227-57.1214-32.4709-77.8236-62.3746c-42.3212-61.1983-74.679-172.9508-31.23-248.3679c21.5705-37.4546,60.1253-61.1835,101.9581-61.7964c31.8589-0.6021,61.9044,21.4174,81.3918,21.4174c19.209,0,53.636-25.6686,94.2163-22.6665C510.4626,229.066,555.6122,233.8129,584.8426,276.8632z M469.5186,187.488c17.2347-20.8293,28.8305-49.8377,25.6375-78.6904c-24.8053,0.9837-54.8058,16.5229-72.5975,37.339c-15.9324,18.4398-29.925,47.9732-26.1259,76.237C424.0806,224.5099,452.2985,208.3302,469.5186,187.488z';

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/* ---- Colour helpers ---- */
function rgbOf(hex) {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const toHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
function hslOf(hex) {
  const [r, g, b] = rgbOf(hex).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { s, l };
}
function lum(hex) {
  const ch = rgbOf(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
export const inkFor = (hex) => (lum(hex) > 0.45 ? '#111111' : '#FFFFFF');
export const mix = (hex, amt) => toHex(rgbOf(hex).map((v) => 255 - (255 - v) * amt));
export const darken = (hex, amt) => toHex(rgbOf(hex).map((v) => v * (1 - amt)));
function hslHex(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return toHex([f(0) * 255, f(8) * 255, f(4) * 255]);
}
function pickPrimary(logoPal, imagePal) {
  const ok = (hex) => { const { s, l } = hslOf(hex); return s > 0.35 && l > 0.18 && l < 0.72; };
  const bySat = (a, b) => hslOf(b).s - hslOf(a).s;
  const fromLogo = logoPal.filter(ok).sort(bySat)[0];
  if (fromLogo) return fromLogo;
  const dark = logoPal.filter((h) => hslOf(h).l < 0.3).sort((a, b) => hslOf(a).l - hslOf(b).l)[0];
  if (dark) return dark;
  return imagePal.filter(ok).sort(bySat)[0] || '#1D1D1F';
}

/* ---- Brands ---- */
export const BRANDS = {
  nike: {
    key: 'nike', name: 'Nike', domain: 'nike.com', logoKind: 'swoosh',
    head: '#FA5400', headOn: '#FFFFFF', b: '#FA5400', on: '#FFFFFF', surface: '#F5F5F5', ink: '#111111',
    font: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    tone: 'Direct, urgent, athlete-first',
    goal: 'Launch the Pegasus 41…', audience: 'Nike Run Club members', date: '3 October',
    files: ['nike-brand-guide.pdf', 'tone-of-voice.docx', 'pegasus-41-shots.zip'],
    subjects: ['Pegasus 41 is here. Go.', 'Your next PB starts now', 'Run Club gets first access'],
    cta: 'Shop now',
  },
  apple: {
    key: 'apple', name: 'Apple', domain: 'apple.com', logoKind: 'apple',
    head: '#1D1D1F', headOn: '#F5F5F7', b: '#0071E3', on: '#FFFFFF', surface: '#F5F5F7', ink: '#1D1D1F',
    font: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif',
    tone: 'Simple, confident, understated',
    goal: 'Introduce the new iPhone…', audience: 'Apple Store customers', date: '9 October',
    files: ['apple-brand-guidelines.pdf', 'voice-and-tone.docx', 'iphone-product-shots.zip'],
    subjects: ['Say hello to the new iPhone.', 'Pro. Beyond.', 'Available now at the Apple Store'],
    cta: 'Learn more',
  },
  commbank: {
    key: 'commbank', name: 'CommBank', domain: 'commbank.com.au', logoKind: 'img',
    head: '#000000', headOn: '#FFFFFF', b: '#FFCC00', on: '#000000', surface: '#F7F7F7', ink: '#111111',
    font: 'system-ui, -apple-system, sans-serif',
    tone: 'Clear, helpful, reassuring',
    goal: 'Launch Yello rewards for everyday accounts…', audience: 'CommBank app customers', date: '16 October',
    files: ['commbank-brand-guide.pdf', 'yello-offers.xlsx', 'app-screens.zip'],
    subjects: ['Your Yello rewards are here', 'More value from everyday banking', 'Unlock offers in the CommBank app'],
    cta: 'See my offers',
  },
};
const ALIASES = { 'commonwealth bank': 'commbank', 'commonwealth bank of australia': 'commbank', cba: 'commbank', 'commbank.com.au': 'commbank', 'apple.com': 'apple', 'nike.com': 'nike' };

export const BLANK = {
  key: 'blank', blank: true, name: 'Campaign email', domain: '', logoKind: 'blank',
  head: '#241046', headOn: '#D4FF3A', b: '#D4FF3A', on: '#16121F', surface: '#EFEBF7', ink: '#241046',
  font: 'Geist, system-ui, sans-serif', tone: 'Not stamped yet',
};

// A brand from a name and a primary colour (live lookups, the hash fallback
// and the extra clients in the finale all come through here).
export function makeBrand(name, primary, extra = {}) {
  primary = primary.toUpperCase();
  const short = name.replace(/\s+(of|pty|ltd|inc|limited|group|corporation|corp)\b.*$/i, '').trim() || name;
  const slug = short.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return Object.assign({
    key: 'x-' + slug, name: short, domain: slug.replace(/-/g, '') + '.com', logoKind: 'mono',
    head: primary, headOn: inkFor(primary), b: primary, on: inkFor(primary),
    surface: mix(primary, 0.05), ink: '#16141C',
    font: 'system-ui, -apple-system, sans-serif',
    tone: 'Read live from their site',
    goal: `Announce what’s new at ${short}…`, audience: `${short} customers`, date: '28 October',
    files: [`${slug}-brand-guide.pdf`, 'tone-of-voice.docx', 'product-shots.zip'],
    subjects: [`What’s new at ${short}`, `${short}: made for you`, `Don’t miss this from ${short}`],
    cta: 'Find out more',
  }, extra);
}

// Offline fallback: a believable brand from a hash of the name.
export function hashBrand(raw) {
  const name = raw.trim().replace(/\s+/g, ' ');
  let h = 0;
  for (const ch of name.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const b = makeBrand(name, hslHex(h % 360, 64, 44));
  b.tone = 'Best guess — couldn’t reach their site';
  b.font = ['system-ui, sans-serif', 'Georgia, serif', '"Helvetica Neue", Arial, sans-serif'][h % 3];
  return b;
}

// More clients for the finale — fictional, so nobody mistakes them for customers.
const TONES = ['Warm, reassuring, local', 'Plain-spoken and practical', 'Precise, calm, expert', 'Bright, sunny, casual', 'Bold, clear, forward-looking', 'Friendly and upbeat', 'Honest, hearty, down-to-earth', 'Polished and aspirational'];
export const EXTRAS = [
  ['Harbour Health', '#0E7C86'], ['Koala Freight', '#E4572E'], ['Northline Legal', '#2F3A8F'],
  ['Bondi Surf Co', '#00A6D6'], ['Tasman Energy', '#16A34A'], ['Brightside Dental', '#7C3AED'],
  ['Paddock Foods', '#B45309'], ['Mosaic Realty', '#DB2777'], ['Kestrel Air', '#0F172A'],
  ['Redgum Wines', '#9F1239'], ['Summit Gyms', '#F59E0B'], ['Lumen Insurance', '#2563EB'],
  ['Wattle Schools', '#CA8A04'], ['Ferro Build', '#475569'], ['Coral Travel', '#F43F5E'],
  ['Opal Credit Union', '#0D9488'],
].map(([n, c], i) => makeBrand(n, c, { tone: TONES[i % TONES.length] }));

export function curated(raw) {
  const key = raw.trim().toLowerCase().replace(/\s+/g, ' ');
  return BRANDS[key] || BRANDS[ALIASES[key]] || null;
}

/* ---- Live lookup (same approach as sell.js): Clearbit autocomplete for the
   domain, then Microlink for logo + palette, with icon.horse as the quick
   read. Logos must load CORS-clean because they're drawn into WebGL
   textures; anything that won't falls back to a monogram. ---- */
function withTimeout(ms) {
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}
async function findDomain(name) {
  if (/\.[a-z]{2,}$/i.test(name)) return { name: name.replace(/\..*$/, ''), domain: name.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '') };
  try {
    const r = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(name)}`, { signal: withTimeout(4500) });
    const list = await r.json();
    if (list[0] && list[0].domain) return { name: list[0].name, domain: list[0].domain };
  } catch (e) { /* fall through */ }
  return { name, domain: name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com' };
}
export function loadImg(src, cors = true) {
  return new Promise((res, rej) => {
    const img = new Image();
    if (cors) img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.onload = () => (img.naturalWidth ? res(img) : rej(new Error('empty')));
    img.onerror = rej;
    img.src = src;
  });
}
function paletteOf(img) {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const x = c.getContext('2d');
  x.drawImage(img, 0, 0, 32, 32);
  const px = x.getImageData(0, 0, 32, 32).data;
  const counts = {};
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 200) continue;
    const hex = toHex([px[i] & 0xf0, px[i + 1] & 0xf0, px[i + 2] & 0xf0]);
    counts[hex] = (counts[hex] || 0) + 1;
  }
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 8);
}
async function viaMicrolink(found) {
  const url = `https://api.microlink.io/?url=${encodeURIComponent('https://' + found.domain)}&palette=true&prerender=false`;
  const json = await fetch(url, { signal: withTimeout(9000) }).then((r) => r.json());
  if (json.status !== 'success') throw new Error('lookup failed');
  const d = json.data;
  const logoPal = (d.logo && d.logo.palette) || [];
  const imagePal = (d.image && d.image.palette) || [];
  // Palette only: arbitrary logo hosts aren't CORS-clean, so the drawable
  // logo always comes from icon.horse (below).
  return { primary: pickPrimary(logoPal, imagePal), logoImg: null };
}
async function viaIcon(found) {
  const img = await loadImg(`https://icon.horse/icon/${found.domain}`);
  return { primary: pickPrimary(paletteOf(img), []), logoImg: img };
}

// Name -> brand. Curated brands resolve instantly; anything else is read live
// with a hard ceiling so the press never hangs. onStep narrates progress.
export async function resolveBrand(raw, onStep = () => {}) {
  const c = curated(raw);
  if (c) { onStep(`Hand-checked: ${c.domain}`); return c; }
  const live = (async () => {
    const found = await findDomain(raw);
    onStep(`Reading ${found.domain}…`);
    const full = viaMicrolink(found).catch(() => null);
    const icon = viaIcon(found).catch(() => null);
    let r = await Promise.race([full, new Promise((res) => setTimeout(res, 4500)).then(() => icon)]);
    if (!r) r = (await full) || (await icon);
    if (!r) throw new Error('no brand');
    if (!r.logoImg) { const ic = await icon; if (ic) r.logoImg = ic.logoImg; }
    return makeBrand(found.name, r.primary, {
      domain: found.domain, logoKind: r.logoImg ? 'img' : 'mono', logoImg: r.logoImg || null, live: true,
    });
  })();
  const ceiling = new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), 10000));
  try { return await Promise.race([live, ceiling]); } catch (e) { onStep('Couldn’t reach their site — best guess'); return hashBrand(raw); }
}

// CommBank's logo is an SVG without intrinsic size; give it one so it draws cleanly.
export async function prepareLogos(base) {
  try {
    const txt = await fetch(base + 'logos/commbank.svg').then((r) => r.text());
    const sized = txt.replace('<svg ', '<svg width="256" height="256" ');
    const url = URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml' }));
    BRANDS.commbank.logoImg = await loadImg(url, false);
  } catch (e) { BRANDS.commbank.logoKind = 'mono'; }
}

/* ---- Sharing: the same link format as the live site's phone view ---- */
export function shareQuery(br) {
  if (BRANDS[br.key]) return `c=${br.key}`;
  const p = new URLSearchParams({ n: br.name, d: br.domain || '', p: br.b.replace('#', '') });
  if (br.logoImg && /^https?:/.test(br.logoImg.src)) p.set('l', br.logoImg.src);
  return p.toString();
}

/* ---- Drawing the app. Coordinates are in a 640 × 1280 design space. ---- */
export const SW = 640, SH = 1280;
export const CARD = (i) => ({ x: 24, y: 290 + i * 234, w: 592, h: 218 });

function rr(x, y, w, h, r) {
  const p = new Path2D();
  p.roundRect(x, y, w, h, r);
  return p;
}
function fit(ctx, text, max) {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + '…').width > max) t = t.slice(0, -1);
  return t.replace(/\s+$/, '') + '…';
}

export function drawLogo(ctx, br, cx, cy, size, color) {
  ctx.save();
  if (br.logoKind === 'swoosh') {
    ctx.translate(cx - size / 2, cy - size / 2);
    ctx.scale(size / 24, size / 24);
    ctx.fillStyle = color;
    ctx.fill(new Path2D(SWOOSH_D));
  } else if (br.logoKind === 'apple') {
    const s = size / 560;
    ctx.translate(cx - 400 * s, cy - 380 * s);
    ctx.scale(s, s);
    ctx.fillStyle = color;
    ctx.fill(new Path2D(APPLE_D));
  } else if (br.logoKind === 'img' && br.logoImg) {
    if (br.live) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fill(rr(cx - size / 2, cy - size / 2, size, size, size * 0.24));
      const inner = size * 0.72;
      ctx.drawImage(br.logoImg, cx - inner / 2, cy - inner / 2, inner, inner);
    } else {
      ctx.drawImage(br.logoImg, cx - size / 2, cy - size / 2, size, size);
    }
  } else if (br.logoKind === 'blank') {
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.stroke(rr(cx - size / 2, cy - size / 2, size, size, size * 0.24));
  } else {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = br.head;
    ctx.font = `700 ${size * 0.5}px ${br.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(br.name[0].toUpperCase(), cx, cy + size * 0.03);
  }
  ctx.restore();
}

function prep(canvas) {
  const ctx = canvas.getContext('2d');
  const k = canvas.width / SW;
  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.clearRect(0, 0, SW, SH);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  return ctx;
}

// Base: status bar, app bar in their colours, stepper, and four empty sockets.
export function drawBase(canvas, br) {
  const ctx = prep(canvas);
  const F = br.font;
  const blank = !!br.blank;
  ctx.fillStyle = br.surface;
  ctx.fillRect(0, 0, SW, SH);
  // status + app bar share the head colour
  ctx.fillStyle = br.head;
  ctx.fillRect(0, 0, SW, 196);
  ctx.fillStyle = br.headOn;
  ctx.font = `600 26px ${F}`;
  ctx.fillText('9:41', 44, 42);
  ctx.globalAlpha = 0.9;
  [0, 1, 2, 3].forEach((i) => ctx.fillRect(520 + i * 9, 36 - i * 5, 6, 6 + i * 5));
  ctx.fill(rr(566, 22, 44, 20, 6));
  ctx.globalAlpha = 1;
  drawLogo(ctx, br, 84, 128, 64, br.headOn);
  ctx.fillStyle = br.headOn;
  if (blank) {
    ctx.globalAlpha = 0.55;
    ctx.fill(rr(136, 100, 200, 26, 13));
    ctx.globalAlpha = 0.35;
    ctx.fill(rr(136, 138, 150, 18, 9));
    ctx.globalAlpha = 1;
  } else {
    ctx.font = `700 36px ${F}`;
    ctx.fillText(fit(ctx, br.name, 290), 136, 124);
    ctx.globalAlpha = 0.72;
    ctx.font = `500 22px ${F}`;
    ctx.fillText('Campaign email', 136, 156);
    ctx.globalAlpha = 1;
  }
  // "Ask AI" pill — every app ships with its assistant
  ctx.fillStyle = br.b === br.head ? 'rgba(255,255,255,0.2)' : br.b;
  ctx.fill(rr(478, 104, 132, 48, 24));
  ctx.fillStyle = br.b === br.head ? br.headOn : br.on;
  ctx.font = `600 21px ${F}`;
  sparkle(ctx, 504, 128, 11);
  ctx.fillText('Ask AI', 522, 136);
  // stepper
  STEPS.forEach(([s], i) => {
    const x = 24 + i * 150;
    ctx.fillStyle = i === 0 ? (blank ? '#8E6BF0' : br.b) : blank ? '#D6D0E2' : mix(br.b === '#FFFFFF' ? '#999999' : br.b, 0.22);
    ctx.fill(rr(x, 214, 142, 8, 4));
    ctx.fillStyle = i === 0 ? (blank ? '#8A83A0' : br.ink) : '#8B8698';
    ctx.font = `${i === 0 ? 700 : 500} 20px ${F}`;
    ctx.fillText(`${i + 1}  ${s}`, x, 256);
  });
  // sockets
  for (let i = 0; i < 4; i++) {
    const c = CARD(i);
    ctx.fillStyle = 'rgba(40,20,80,0.06)';
    ctx.fill(rr(c.x, c.y, c.w, c.h, 22));
    ctx.setLineDash([10, 9]);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(80,60,130,0.28)';
    ctx.stroke(rr(c.x + 1, c.y + 1, c.w - 2, c.h - 2, 22));
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(80,60,130,0.4)';
    ctx.font = '600 22px "Geist Mono", ui-monospace, monospace';
    ctx.fillText(`0${i + 1}  ${STEPS[i][0].toUpperCase()}`, c.x + 28, c.y + c.h / 2 + 8);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill(rr(SW / 2 - 90, SH - 30, 180, 8, 4));
}

function sparkle(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.quadraticCurveTo(cx, cy, cx + r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + r);
  ctx.quadraticCurveTo(cx, cy, cx - r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - r);
  ctx.fill();
}

// Cards: the four steps, filled in their voice (or skeletons when blank).
export function drawCards(canvas, br) {
  const ctx = prep(canvas);
  const F = br.font;
  const blank = !!br.blank;
  const sk = (x, y, w, h = 16) => { ctx.fillStyle = '#E4E0EC'; ctx.fill(rr(x, y, w, h, h / 2)); };
  const tint = blank ? '#EEEBF4' : mix(br.b === '#FFFFFF' ? '#888888' : br.b, 0.12);
  for (let i = 0; i < 4; i++) {
    const c = CARD(i);
    const X = c.x + 28, Y = c.y;
    ctx.save();
    ctx.shadowColor = 'rgba(30,10,60,0.12)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#FFFFFF';
    ctx.fill(rr(c.x, c.y, c.w, c.h, 22));
    ctx.restore();
    // header: number, step, what it's wired as
    ctx.fillStyle = blank ? '#6D4BD0' : br.b === '#FFFFFF' || br.b === '#FFCC00' ? darken(br.b, 0.35) : br.b;
    ctx.font = '700 20px "Geist Mono", ui-monospace, monospace';
    ctx.fillText(`0${i + 1}`, X, Y + 44);
    ctx.fillStyle = blank ? '#5A5470' : br.ink;
    ctx.font = `700 26px ${F}`;
    ctx.fillText(STEPS[i][0], X + 42, Y + 45);
    const tw = ctx.measureText(STEPS[i][0]).width;
    ctx.fillStyle = '#9A95A8';
    ctx.font = '500 18px "Geist Mono", ui-monospace, monospace';
    ctx.fillText(`· ${STEPS[i][1]}`, X + 52 + tw, Y + 44);
    const W = c.w - 56;
    if (i === 0) {
      // Brief: three fields
      const field = (x, y, w, label, val) => {
        ctx.fillStyle = '#8B8698';
        ctx.font = `500 17px ${F}`;
        ctx.fillText(label, x, y);
        ctx.fillStyle = tint;
        ctx.fill(rr(x, y + 10, w, 46, 10));
        if (blank) sk(x + 16, y + 25, w * 0.55);
        else {
          ctx.fillStyle = br.ink;
          ctx.font = `500 20px ${F}`;
          ctx.fillText(fit(ctx, val, w - 30), x + 16, y + 41);
        }
      };
      field(X, Y + 84, W, 'Campaign goal', br.goal);
      field(X, Y + 152, W * 0.58, 'Audience', br.audience);
      field(X + W * 0.62, Y + 152, W * 0.38, 'Send date', br.date);
    } else if (i === 1) {
      // Assets: files synced from their data source
      for (let r = 0; r < 3; r++) {
        const y = Y + 70 + r * 46;
        ctx.fillStyle = tint;
        ctx.fill(rr(X, y, 34, 34, 8));
        if (blank) { sk(X + 50, y + 9, 220 - r * 30); sk(X + W - 110, y + 11, 110, 12); continue; }
        ctx.fillStyle = br.ink;
        ctx.font = `500 20px ${F}`;
        ctx.fillText(fit(ctx, br.files[r], W - 200), X + 50, y + 25);
        ctx.fillStyle = '#16A34A';
        ctx.beginPath(); ctx.arc(X + W - 122, y + 18, 5, 0, 7); ctx.fill();
        ctx.fillStyle = '#8B8698';
        ctx.font = `500 16px ${F}`;
        ctx.fillText('Synced 2m ago', X + W - 110, y + 24);
      }
    } else if (i === 2) {
      // Compose: subject in their voice + a tiny email
      ctx.fillStyle = tint;
      ctx.fill(rr(X, Y + 66, W, 56, 12));
      if (blank) sk(X + 18, Y + 86, W * 0.6);
      else {
        ctx.fillStyle = '#8B8698';
        ctx.font = `500 16px ${F}`;
        ctx.fillText('Subject', X + 18, Y + 99);
        ctx.fillStyle = br.ink;
        ctx.font = `700 21px ${F}`;
        ctx.fillText(fit(ctx, br.subjects[0], W - 110), X + 96, Y + 100);
      }
      ctx.fillStyle = blank ? '#E4E0EC' : br.head;
      ctx.fill(rr(X, Y + 134, 70, 58, 10));
      if (!blank) drawLogo(ctx, br, X + 35, Y + 163, 30, br.headOn);
      sk(X + 86, Y + 138, W - 250, 13);
      sk(X + 86, Y + 162, W - 300, 13);
      ctx.fillStyle = blank ? '#D6D0E2' : br.b;
      ctx.fill(rr(X + W - 146, Y + 140, 146, 46, 23));
      if (!blank) {
        ctx.fillStyle = br.on;
        ctx.font = `700 18px ${F}`;
        ctx.textAlign = 'center';
        ctx.fillText(fit(ctx, br.cta, 130), X + W - 73, Y + 170);
        ctx.textAlign = 'left';
      }
    } else {
      // Review: one approver, one button
      ctx.fillStyle = blank ? '#E4E0EC' : mix(br.b === '#FFFFFF' ? '#888888' : br.b, 0.25);
      ctx.beginPath(); ctx.arc(X + 24, Y + 94, 24, 0, 7); ctx.fill();
      if (blank) { sk(X + 62, Y + 80, 150); sk(X + 62, Y + 104, 190, 12); }
      else {
        ctx.fillStyle = br.ink;
        ctx.font = `700 16px ${F}`;
        ctx.textAlign = 'center';
        ctx.fillText('JL', X + 24, Y + 100);
        ctx.textAlign = 'left';
        ctx.font = `700 20px ${F}`;
        ctx.fillText('Jordan Lee', X + 62, Y + 90);
        ctx.fillStyle = '#8B8698';
        ctx.font = `500 16px ${F}`;
        ctx.fillText('Marketing lead · approver', X + 62, Y + 114);
      }
      ctx.fillStyle = blank ? '#EEEBF4' : '#FEF3C7';
      ctx.fill(rr(X + W - 104, Y + 76, 104, 34, 17));
      ctx.fillStyle = blank ? '#A79FBC' : '#92400E';
      ctx.font = `600 16px ${F}`;
      ctx.textAlign = 'center';
      ctx.fillText(blank ? '—' : 'Waiting', X + W - 52, Y + 99);
      ctx.fillStyle = blank ? '#D6D0E2' : br.b;
      ctx.fill(rr(X, Y + 136, W, 54, 14));
      if (!blank) {
        ctx.fillStyle = br.on;
        ctx.font = `700 20px ${F}`;
        ctx.fillText('Approve and send', X + W / 2, Y + 170);
      }
      ctx.textAlign = 'left';
    }
  }
}

// Both layers flattened — used by the static fallback and preview thumbnails.
export function drawFlat(canvas, br) {
  const k = canvas.width / SW;
  const a = document.createElement('canvas');
  a.width = canvas.width; a.height = canvas.height;
  const b = document.createElement('canvas');
  b.width = canvas.width; b.height = canvas.height;
  drawBase(a, br);
  drawCards(b, br);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, canvas.width, canvas.height, 56 * k);
  ctx.clip();
  ctx.drawImage(a, 0, 0);
  ctx.drawImage(b, 0, 0);
  ctx.restore();
}

// The sign on each press: brand, logo and the tone of voice it reads.
export function drawPressSign(canvas, br, opts = {}) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#16121F';
  ctx.fillRect(0, 0, w, h);
  // hazard stripes along the top
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, w, h * 0.16); ctx.clip();
  ctx.fillStyle = '#D4FF3A';
  ctx.fillRect(0, 0, w, h * 0.16);
  ctx.fillStyle = '#16121F';
  for (let x = -h; x < w + h; x += 44) {
    ctx.beginPath();
    ctx.moveTo(x, 0); ctx.lineTo(x + 22, 0); ctx.lineTo(x + 22 - h * 0.16, h * 0.16); ctx.lineTo(x - h * 0.16, h * 0.16);
    ctx.fill();
  }
  ctx.restore();
  const cy = h * 0.52;
  if (opts.empty) {
    ctx.fillStyle = '#D4FF3A';
    ctx.font = `800 ${h * 0.2}px Unbounded, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText('YOUR CLIENT?', w * 0.07, cy);
  } else {
    const logoBg = br.head;
    ctx.fillStyle = logoBg;
    ctx.fill(rr(w * 0.06, cy - h * 0.2, h * 0.4, h * 0.4, h * 0.08));
    drawLogo(ctx, br, w * 0.06 + h * 0.2, cy, h * 0.26, br.headOn);
    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'middle';
    const label = br.name.toUpperCase();
    let fs = h * 0.22;
    ctx.font = `800 ${fs}px Unbounded, sans-serif`;
    const room = w * 0.88 - h * 0.52;
    const tw = ctx.measureText(label).width;
    if (tw > room) { fs = Math.max(h * 0.12, fs * room / tw); ctx.font = `800 ${fs}px Unbounded, sans-serif`; }
    ctx.fillText(fit(ctx, label, room), w * 0.06 + h * 0.52, cy - h * 0.02);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = `500 ${h * 0.1}px "Geist Mono", monospace`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(fit(ctx, (opts.empty ? 'Type a name to feed the press' : br.tone).toUpperCase(), w * 0.88), w * 0.07, h * 0.9);
}

/* ---- The in-app assistant bubble: the client's team talking to their
   own branded assistant inside the app. Never the builder. ---- */
const TEAM_USER = { nike: 'Jordan · Nike marketing', apple: 'Sam · Apple retail marketing', commbank: 'Priya · CommBank marketing' };
export function fillAssistant(el, br, typed = false) {
  const col = br.b === '#FFFFFF' ? br.head : br.b;
  el.style.setProperty('--bc', col);
  el.style.setProperty('--bcon', br.b === '#FFFFFF' ? br.headOn : br.on);
  el.style.setProperty('--bh', br.head);
  el.style.setProperty('--bhon', br.headOn);
  el.querySelector('.bb-team').textContent = `${br.name}’s team, using the app`;
  el.querySelector('.bb-name').textContent = `${br.name} assistant`;
  el.querySelector('.bb-u').textContent = TEAM_USER[br.key] || `Alex · ${br.name} marketing`;
  el.querySelector('.bb-qt').textContent = `Suggest three subject lines for ${br.audience}.`;
  el.querySelector('.bb-a').innerHTML = br.subjects.map((s) => `<li data-full="${esc(s)}">${typed ? '' : esc(s)}</li>`).join('');
  el.querySelector('.bb-voice').textContent = `In ${br.name}’s voice · ${br.tone}`;
  const av = el.querySelector('.bb-av');
  const ctx = av.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, av.width, av.height);
  ctx.fillStyle = br.head;
  ctx.beginPath(); ctx.roundRect(0, 0, av.width, av.height, 14); ctx.fill();
  drawLogo(ctx, br, av.width / 2, av.height / 2, av.width * 0.62, br.headOn);
}
