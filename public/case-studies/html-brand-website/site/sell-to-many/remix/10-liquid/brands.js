/* brands.js — hand-checked clients (from sell-to-many/app-view.js), the live
   lookup (from sell.js: Clearbit -> Microlink palette/logo, icon.horse, then a
   hash fallback), and the ink each brand pours into a vessel. */

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const SWOOSH_PATH = 'M24 7.8 6.442 15.276c-1.456.616-2.679.925-3.668.925-1.11 0-1.922-.392-2.437-1.177-.317-.503-.4-1.152-.25-1.947.152-.795.532-1.643 1.14-2.543.505-.75 1.371-1.708 2.6-2.874-.365.615-.766 1.395-1.084 2.155-.55 1.32-.68 2.4-.394 3.24.13.375.365.65.68.83.36.2.83.29 1.41.29.44 0 .93-.06 1.47-.18L24 7.8Z';
const APPLE_PATH = 'M584.8426,276.8632c-2.3411,1.4432-53.8358,31.4239-53.251,93.7952c0.6472,74.6027,65.3989,99.4457,66.1427,99.7276c-0.58,1.7759-10.3524,35.3838-34.1321,70.0925c-20.5507,30.0693-41.8387,59.968-75.4384,60.5922c-33.0098,0.6046-43.6489-19.5858-81.3589-19.5858c-37.7331,0-49.5436,18.9615-80.7596,20.1904c-32.4307,1.227-57.1214-32.4709-77.8236-62.3746c-42.3212-61.1983-74.679-172.9508-31.23-248.3679c21.5705-37.4546,60.1253-61.1835,101.9581-61.7964c31.8589-0.6021,61.9044,21.4174,81.3918,21.4174c19.209,0,53.636-25.6686,94.2163-22.6665C510.4626,229.066,555.6122,233.8129,584.8426,276.8632z M469.5186,187.488c17.2347-20.8293,28.8305-49.8377,25.6375-78.6904c-24.8053,0.9837-54.8058,16.5229-72.5975,37.339c-15.9324,18.4398-29.925,47.9732-26.1259,76.237C424.0806,224.5099,452.2985,208.3302,469.5186,187.488z';

const svg = (vb, path) => `<svg viewBox="${vb}" aria-hidden="true"><path fill="currentColor" d="${path}"/></svg>`;
const svgData = (vb, path) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="512" height="512"><path fill="#fff" d="${path}"/></svg>`);

export const COMMBANK_SRC = '../../logos/commbank.svg';

export const BRANDS = {
  nike: {
    key: 'nike', name: 'Nike', domain: 'nike.com',
    logo: svg('0 0 24 24', SWOOSH_PATH), mask: svgData('0 0 24 24', SWOOSH_PATH), maskAspect: 2.2,
    b: '#FA5400', on: '#FFFFFF', inks: ['#FA5400', '#FF8A3D', '#D93E00'], veins: '#FFD2B0',
    font: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    swatches: ['#FA5400', '#111111', '#FFFFFF', '#F5F5F5'],
    tone: 'Direct, urgent, athlete-first',
    goal: 'Launch the Pegasus 41…', audience: 'Nike Run Club members', date: '3 October',
    team: 'Nike’s marketing team', teamShort: 'Nike team', initials: 'NT',
    files: ['nike-brand-guide.pdf', 'tone-of-voice.docx', 'pegasus-41-shots.zip'],
    subjects: ['Pegasus 41 is here. Go.', 'Your next PB starts now', 'Run Club members get first access'],
    body: 'The Pegasus 41 is here — lighter, faster, ready for your next PB. Run Club members get first access this week.',
    short: 'Pegasus 41. Lighter. Faster. Yours first.',
    cta: 'Shop now',
  },
  apple: {
    key: 'apple', name: 'Apple', domain: 'apple.com',
    logo: svg('150 100 500 560', APPLE_PATH), mask: svgData('150 100 500 560', APPLE_PATH), maskAspect: 0.9,
    b: '#0071E3', on: '#FFFFFF', inks: ['#0071E3', '#2997FF', '#0A3D8F'], veins: '#E8E8ED',
    font: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif',
    swatches: ['#1D1D1F', '#0071E3', '#F5F5F7', '#FFFFFF'],
    tone: 'Simple, confident, understated',
    goal: 'Introduce the new iPhone…', audience: 'Apple Store customers', date: '9 October',
    team: 'Apple’s marketing team', teamShort: 'Apple team', initials: 'AT',
    files: ['apple-brand-guidelines.pdf', 'voice-and-tone.docx', 'iphone-product-shots.zip'],
    subjects: ['Say hello to the new iPhone.', 'Pro. Beyond.', 'Available now at the Apple Store'],
    body: 'Introducing the new iPhone. Our most advanced camera yet, in a design you’ll love to hold.',
    short: 'The new iPhone. Our best camera yet.',
    cta: 'Learn more',
  },
  commbank: {
    key: 'commbank', name: 'CommBank', domain: 'commbank.com.au',
    logo: `<img src="${COMMBANK_SRC}" alt="" class="img-mark" />`, mask: COMMBANK_SRC, maskAspect: 1,
    b: '#FFCC00', on: '#000000', inks: ['#FFCC00', '#FFE14D', '#F0B400'], veins: '#1A1A1A',
    font: 'system-ui, -apple-system, sans-serif',
    swatches: ['#FFCC00', '#000000', '#FFFFFF', '#F7F7F7'],
    tone: 'Clear, helpful, reassuring',
    goal: 'Launch Yello rewards for everyday accounts…', audience: 'CommBank app customers', date: '16 October',
    team: 'CommBank’s marketing team', teamShort: 'CommBank team', initials: 'CB',
    files: ['commbank-brand-guide.pdf', 'yello-offers.xlsx', 'app-screens.zip'],
    subjects: ['Your Yello rewards are here', 'More value from everyday banking', 'Unlock offers in the CommBank app'],
    body: 'Earn Yello rewards on your everyday account. See your offers in the CommBank app — no sign-up needed.',
    short: 'Yello rewards are here. See your offers in the app.',
    cta: 'See my offers',
  },
};
const ALIASES = { 'commonwealth bank': 'commbank', 'commonwealth bank of australia': 'commbank', cba: 'commbank', 'commbank.com.au': 'commbank', 'apple.com': 'apple', 'nike.com': 'nike' };

export function curated(raw) {
  const key = raw.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?]+$/, '');
  return BRANDS[key] || BRANDS[ALIASES[key]] || null;
}

/* The wall of clients for the "sell to many" beat. */
export const MANY = [
  ['Nike', '#FA5400'], ['Apple', '#0071E3'], ['CommBank', '#FFCC00'], ['Qantas', '#E40000'],
  ['Canva', '#8B3DFF'], ['Spotify', '#1ED760'], ['Airbnb', '#FF385C'], ['Afterpay', '#B2FCE4'],
  ['Tiffany & Co.', '#81D8D0'], ['Cadbury', '#7B2FBE'], ['Xbox', '#9BF00B'], ['T-Mobile', '#E20074'],
  ['IKEA', '#0058A3'], ['Aesop', '#E8DCC4'], ['Telstra', '#0099F8'], ['Hermès', '#F37021'],
];

/* ---- Colour helpers ---- */
export function rgbOf(hex) {
  if (hex.startsWith('hsl')) return hslToRgb(hex);
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function hslToRgb(str) {
  const [h, s, l] = str.match(/[\d.]+/g).map(Number);
  const S = s / 100, L = l / 100;
  const k = (n) => (n + h / 30) % 12;
  const a = S * Math.min(L, 1 - L);
  const f = (n) => L - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
}
export const toHex = (rgb) => '#' + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
export function lum(rgb) {
  const ch = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
export const inkFor = (hex) => (lum(rgbOf(hex)) > 0.42 ? '#111111' : '#FFFFFF');
export const mixHex = (a, b, t) => { const A = rgbOf(a), B = rgbOf(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
function hsl(hex) {
  const [r, g, b] = rgbOf(hex).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  return { s: d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1)), l };
}
function pickPrimary(logoPal, imagePal) {
  const ok = (hex) => { const { s, l } = hsl(hex); return s > 0.35 && l > 0.18 && l < 0.72; };
  const bySat = (a, b) => hsl(b).s - hsl(a).s;
  const fromLogo = logoPal.filter(ok).sort(bySat)[0];
  if (fromLogo) return fromLogo;
  const dark = logoPal.filter((h) => hsl(h).l < 0.3).sort((a, b) => hsl(a).l - hsl(b).l)[0];
  if (dark) return dark;
  return imagePal.filter(ok).sort(bySat)[0] || '#1D1D1F';
}

/* Ink must show additively on dark glass, so very dark brands pour a lifted tone. */
function inksFor(primary) {
  const L = lum(rgbOf(primary));
  const main = L < 0.04 ? mixHex(primary, '#9AA3B2', 0.55) : primary;
  return [main, mixHex(main, '#FFFFFF', 0.28), mixHex(main, '#000000', 0.22)];
}

function genericCopy(short) {
  return {
    subjects: [`What’s new at ${short}`, `${short}: made for you`, `Don’t miss this from ${short}`],
    body: `Something new is here from ${short}. Be the first to see it — and tell us what you think.`,
    short: `New from ${short}. See it first.`,
    cta: 'Take a look',
    files: [`${short.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-brand-guide.pdf`, 'tone-of-voice.docx', 'launch-assets.zip'],
    team: `${short}’s marketing team`, teamShort: `${short} team`, initials: (short[0] + (short[1] || '')).toUpperCase(),
    goal: `Announce what’s new at ${short}…`, audience: `${short} customers`, date: '28 October',
    font: 'system-ui, -apple-system, sans-serif',
  };
}

function liveBrand(found, primary, logoUrl, extra) {
  const short = found.name.replace(/\s+(of|pty|ltd|inc|limited|group|corporation|corp|airways)\b.*$/i, '').trim() || found.name;
  primary = primary.toUpperCase();
  return Object.assign(genericCopy(short), {
    key: null, name: short, domain: found.domain, live: true,
    logoUrl, logo: logoUrl ? `<img src="${esc(proxied(logoUrl, 128))}" alt="" class="img-mark chip" referrerpolicy="no-referrer" />` : null,
    b: primary, on: inkFor(primary), inks: inksFor(primary), veins: '#FFFFFF',
    swatches: [primary].concat(extra.map((h) => h.toUpperCase()).filter((h) => h !== primary)).slice(0, 4),
    tone: 'Read live from their site',
  });
}

/* Offline fallback: a believable brand from a hash of the name. */
export function hashBrand(raw) {
  const name = raw.trim().replace(/\s+/g, ' ');
  const key = name.toLowerCase();
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = h % 360;
  const primary = toHex(hslToRgb(`hsl(${hue} 70% 48%)`));
  return Object.assign(genericCopy(name), {
    key: null, name, domain: key.replace(/[^a-z0-9]/g, '') + '.com', live: false,
    logo: null, b: primary, on: inkFor(primary), inks: inksFor(primary), veins: '#FFFFFF',
    swatches: [primary, toHex(hslToRgb(`hsl(${hue} 30% 96%)`)), toHex(hslToRgb(`hsl(${hue} 25% 14%)`)), toHex(hslToRgb(`hsl(${(hue + 150) % 360} 60% 55%)`))],
    tone: 'Best guess — couldn’t reach their site',
  });
}

/* ---- Live lookup (same approach as sell.js) ---- */
function withTimeout(ms) { const c = new AbortController(); setTimeout(() => c.abort(), ms); return c.signal; }
async function findDomain(name) {
  if (/\.[a-z]{2,}$/i.test(name)) return { name: name.replace(/\.[a-z.]+$/i, ''), domain: name.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '') };
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
  if (!logoPal.length && !imagePal.length) throw new Error('no palette');
  return liveBrand(found, pickPrimary(logoPal, imagePal), d.logo && d.logo.url, logoPal.concat(imagePal));
}
// Remote logos go through a CORS-enabled image proxy so their pixels can be read.
export const proxied = (url, size = 256) => `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=${size}&h=${size}&fit=contain&output=png`;
function viaIcon(found) {
  const src = proxied(`https://icon.horse/icon/${found.domain}`, 64);
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
        if (!pal.length) throw new Error('blank icon');
        res(liveBrand(found, pickPrimary(pal, []), `https://icon.horse/icon/${found.domain}`, pal));
      } catch (e) { rej(e); }
    };
    img.src = src;
  });
}

/* Resolve any name to a brand. step(text) narrates progress. Never rejects. */
export async function lookup(raw, step = () => {}) {
  const c = curated(raw);
  if (c) { step(`Reading ${c.domain}`); return c; }
  try {
    const found = await findDomain(raw.trim());
    step(`Reading ${found.domain}`);
    const full = viaMicrolink(found).catch(() => null);
    const icon = viaIcon(found).catch(() => null);
    const later = new Promise((r) => setTimeout(r, 5000)).then(() => icon);
    let b = await Promise.race([full, later]);
    if (!b) b = (await full) || (await icon);
    if (b) return b;
  } catch (e) { /* fall through */ }
  return hashBrand(raw);
}

/* A white-on-transparent silhouette of the brand's logo, for ink to pour from.
   Resolves to { canvas, aspect }. Falls back to the brand's initial. */
export function logoMask(br) {
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const x = c.getContext('2d', { willReadFrequently: true });
  const done = (aspect) => ({ canvas: c, image: x.getImageData(0, 0, S, S), aspect });
  const initial = () => {
    x.clearRect(0, 0, S, S);
    x.fillStyle = '#fff';
    x.font = `italic 400 ${S * 0.82}px "Instrument Serif", Georgia, serif`;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(br.name[0].toUpperCase(), S / 2, S * 0.54);
    return done(1);
  };
  const remote = !br.mask && br.logoUrl;
  const src = br.mask || (remote ? proxied(br.logoUrl, 512) : null);
  if (!src) return Promise.resolve(initial());
  return new Promise((res) => {
    const img = new Image();
    if (remote) img.crossOrigin = 'anonymous';
    const t = setTimeout(() => res(initial()), 3500);
    img.onload = () => {
      clearTimeout(t);
      try {
        const w = img.naturalWidth || S, h = img.naturalHeight || S;
        const k = Math.min(S / w, S / h) * 0.92;
        x.clearRect(0, 0, S, S);
        x.drawImage(img, (S - w * k) / 2, (S - h * k) / 2, w * k, h * k);
        if (remote) {
          // Favicons often sit on a solid square: ink is whatever differs from the corner.
          const d = x.getImageData(0, 0, S, S);
          const px = d.data;
          const c0 = Math.round(S * 0.06) * S * 4 + Math.round(S * 0.06) * 4;
          const bg = [px[c0], px[c0 + 1], px[c0 + 2], px[c0 + 3]];
          if (bg[3] > 200) {
            for (let i = 0; i < px.length; i += 4) {
              const dist = Math.abs(px[i] - bg[0]) + Math.abs(px[i + 1] - bg[1]) + Math.abs(px[i + 2] - bg[2]);
              px[i + 3] = Math.min(px[i + 3], Math.max(0, Math.min(255, (dist - 40) * 3)));
            }
            x.putImageData(d, 0, 0);
          }
        }
        // Silhouette: anything opaque becomes white ink.
        x.globalCompositeOperation = 'source-in';
        x.fillStyle = '#fff';
        x.fillRect(0, 0, S, S);
        x.globalCompositeOperation = 'source-over';
        res(done(br.maskAspect || 1)); // getImageData throws if tainted
      } catch (e) { res(initial()); }
    };
    img.onerror = () => { clearTimeout(t); res(initial()); };
    img.src = src;
  });
}
