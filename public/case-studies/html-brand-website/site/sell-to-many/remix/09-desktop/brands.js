/* EAI OS — brand data, live brand lookup and the in-app assistant's voice.
   Nike, Apple and CommBank are hand-checked. Anything else is looked up
   live (Clearbit autocomplete -> Microlink palette/logo, icon.horse as a
   quick read) and falls back to a believable brand hashed from the name. */

export function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

const SWOOSH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 7.8 6.442 15.276c-1.456.616-2.679.925-3.668.925-1.11 0-1.922-.392-2.437-1.177-.317-.503-.4-1.152-.25-1.947.152-.795.532-1.643 1.14-2.543.505-.75 1.371-1.708 2.6-2.874-.365.615-.766 1.395-1.084 2.155-.55 1.32-.68 2.4-.394 3.24.13.375.365.65.68.83.36.2.83.29 1.41.29.44 0 .93-.06 1.47-.18L24 7.8Z" fill="currentColor"/></svg>';
const APPLE = '<svg viewBox="150 100 500 560" aria-hidden="true"><path fill="currentColor" d="M584.8426,276.8632c-2.3411,1.4432-53.8358,31.4239-53.251,93.7952c0.6472,74.6027,65.3989,99.4457,66.1427,99.7276c-0.58,1.7759-10.3524,35.3838-34.1321,70.0925c-20.5507,30.0693-41.8387,59.968-75.4384,60.5922c-33.0098,0.6046-43.6489-19.5858-81.3589-19.5858c-37.7331,0-49.5436,18.9615-80.7596,20.1904c-32.4307,1.227-57.1214-32.4709-77.8236-62.3746c-42.3212-61.1983-74.679-172.9508-31.23-248.3679c21.5705-37.4546,60.1253-61.1835,101.9581-61.7964c31.8589-0.6021,61.9044,21.4174,81.3918,21.4174c19.209,0,53.636-25.6686,94.2163-22.6665C510.4626,229.066,555.6122,233.8129,584.8426,276.8632z M469.5186,187.488c17.2347-20.8293,28.8305-49.8377,25.6375-78.6904c-24.8053,0.9837-54.8058,16.5229-72.5975,37.339c-15.9324,18.4398-29.925,47.9732-26.1259,76.237C424.0806,224.5099,452.2985,208.3302,469.5186,187.488z"/></svg>';
const CBA = '<img src="../../logos/commbank.svg" alt="" class="img-mark" />';

export const BRANDS = {
  nike: {
    key: 'nike', name: 'Nike', domain: 'nike.com', logo: SWOOSH,
    head: '#FA5400', headOn: '#FFFFFF', b: '#FA5400', on: '#FFFFFF',
    surface: '#F5F5F5', border: '#E4DCD4', accent: '#FA5400',
    font: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    swatches: ['#FA5400', '#111111', '#FFFFFF', '#F5F5F5'],
    tone: 'Direct, urgent, athlete-first',
    goal: 'Launch the Pegasus 41…', audience: 'Nike Run Club members', date: '3 October',
    persona: { name: 'Maya', role: 'Nike marketing', initials: 'MA' },
    subjects: ['Pegasus 41 is here. Go.', 'Your next PB starts now', 'Run Club members: you’re first'],
    body: 'The Pegasus 41 is here — lighter, faster, ready for your next PB. Run Club members get first access this week.',
    short: 'Pegasus 41. Lighter. Faster. Yours first, this week.',
    warm: 'The Pegasus 41 is here, and we made it for you — lighter, faster, ready when you are. Run Club gets it first.',
    toneNote: 'Checked against Nike’s voice — direct, urgent, athlete-first. Cut “we’re excited to”. Athletes don’t wait.',
    cta: 'Shop now',
    files: ['nike-brand-guide.pdf', 'tone-of-voice.docx', 'pegasus-41-shots.zip'],
  },
  apple: {
    key: 'apple', name: 'Apple', domain: 'apple.com', logo: APPLE, logoClass: 'apple',
    head: '#1D1D1F', headOn: '#F5F5F7', b: '#0071E3', on: '#FFFFFF',
    surface: '#F5F5F7', border: '#E3E3E8', accent: '#0071E3',
    font: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif',
    swatches: ['#1D1D1F', '#0071E3', '#F5F5F7', '#FFFFFF'],
    tone: 'Simple, confident, understated',
    goal: 'Introduce the new iPhone…', audience: 'Apple Store customers', date: '9 October',
    persona: { name: 'Sam', role: 'Apple marketing', initials: 'SK' },
    subjects: ['Say hello to the new iPhone.', 'Pro. Beyond.', 'Available now at the Apple Store.'],
    body: 'Introducing the new iPhone. Our most advanced camera yet, in a design you’ll love to hold.',
    short: 'The new iPhone. Our best camera yet.',
    warm: 'Meet the new iPhone. Our most advanced camera yet — made for the moments you care about.',
    toneNote: 'Simple, confident, understated. Removed two exclamation marks and one “revolutionary”.',
    cta: 'Learn more',
    files: ['apple-brand-guidelines.pdf', 'voice-and-tone.docx', 'iphone-product-shots.zip'],
  },
  commbank: {
    key: 'commbank', name: 'CommBank', domain: 'commbank.com.au', logo: CBA,
    head: '#000000', headOn: '#FFFFFF', b: '#FFCC00', on: '#000000',
    surface: '#F7F7F7', border: '#E5E5E5', accent: '#D9A400',
    font: 'system-ui, -apple-system, sans-serif',
    swatches: ['#FFCC00', '#000000', '#FFFFFF', '#F7F7F7'],
    tone: 'Clear, helpful, reassuring',
    goal: 'Launch Yello rewards for everyday accounts…', audience: 'CommBank app customers', date: '16 October',
    persona: { name: 'Priya', role: 'CommBank digital', initials: 'PN' },
    subjects: ['Your Yello rewards are here', 'More value from everyday banking', 'See your offers in the CommBank app'],
    body: 'Earn Yello rewards on your everyday account. See your offers in the CommBank app — no sign-up needed.',
    short: 'Yello rewards are here. Find your offers in the app.',
    warm: 'Good news — your everyday account now earns Yello rewards. Your offers are waiting in the CommBank app.',
    toneNote: 'Clear, helpful, reassuring. Swapped “leverage” for “use” and added what happens next.',
    cta: 'See my offers',
    files: ['commbank-brand-guide.pdf', 'yello-offers.xlsx', 'app-screens.zip'],
  },
};
const ALIASES = {
  'commonwealth bank': 'commbank', 'commonwealth bank of australia': 'commbank', cba: 'commbank',
  'commbank.com.au': 'commbank', 'apple.com': 'apple', 'nike.com': 'nike', 'comm bank': 'commbank',
};

export function curated(raw) {
  const key = String(raw).trim().toLowerCase().replace(/\s+/g, ' ');
  return BRANDS[key] || BRANDS[ALIASES[key]] || null;
}

/* ---- Colour helpers ---- */
function rgbOf(hex) {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function hslOf(hex) {
  const [r, g, b] = rgbOf(hex).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  const d = max - min;
  return { s: d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1)), l };
}
function lum(hex) {
  const ch = rgbOf(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
export const inkFor = (hex) => (lum(hex) > 0.45 ? '#111111' : '#FFFFFF');
function mix(hex, amt) {
  const c = rgbOf(hex).map((v) => Math.round(255 - (255 - v) * amt));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}
function darken(hex, amt) {
  const c = rgbOf(hex).map((v) => Math.round(v * (1 - amt)));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
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

const PEOPLE = [['Alex', 'AL'], ['Jess', 'JS'], ['Tom', 'TO'], ['Nina', 'NI'], ['Leo', 'LE'], ['Ruby', 'RU']];
function hashOf(s) { let h = 0; for (const ch of s.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }

function generic(name, domain, primary, logo, tone, about) {
  const h = hashOf(name);
  const [pn, pi] = PEOPLE[h % PEOPLE.length];
  const light = /^#/.test(primary) ? mix(primary, 0.06) : `hsl(${h % 360} 30% 96%)`;
  const border = /^#/.test(primary) ? mix(primary, 0.18) : `hsl(${h % 360} 22% 87%)`;
  const on = /^#/.test(primary) ? inkFor(primary) : '#FFFFFF';
  return {
    key: 'x-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name, domain, logo, live: true,
    head: primary, headOn: on, b: primary, on,
    surface: light, border,
    accent: /^#/.test(primary) && lum(primary) > 0.35 ? darken(primary, 0.25) : primary,
    font: 'system-ui, -apple-system, sans-serif',
    swatches: [primary, light, '#111111', '#FFFFFF'],
    tone, about: about || '',
    goal: `Announce what’s new at ${name}…`, audience: `${name} customers`, date: '28 October',
    persona: { name: pn, role: `${name} marketing`, initials: pi },
    subjects: [`What’s new at ${name}`, `${name}: made for you`, `Don’t miss this from ${name}`],
    body: `Here’s what’s new at ${name} this month — picked for ${name} customers.`,
    short: `New at ${name}. Picked for you.`,
    warm: `We’ve been busy at ${name}, and we think you’ll love what’s new this month.`,
    toneNote: `Checked against ${name}’s site copy. Shorter sentences, fewer adjectives, same meaning.`,
    cta: 'Find out more',
    files: [`${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-brand-guide.pdf`, 'tone-of-voice.docx', 'product-shots.zip'],
  };
}

// Offline fallback: a believable brand from a hash of the name.
export function hashBrand(raw) {
  const name = raw.trim().replace(/\s+/g, ' ').replace(/^./, (c) => c.toUpperCase());
  const hue = hashOf(name) % 360;
  const primary = hslToHex(hue, 0.62, 0.42);
  return generic(name, name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com', primary, null, 'Best guess — couldn’t reach their site');
}
function hslToHex(h, s, l) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return '#' + [f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/* ---- Live lookup (same approach as sell.js) ---- */
function withTimeout(ms) { const c = new AbortController(); setTimeout(() => c.abort(), ms); return c.signal; }
async function findDomain(name) {
  if (/\.[a-z]{2,}$/i.test(name)) return { name: name.replace(/\..*$/, ''), domain: name.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '') };
  try {
    const r = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(name)}`, { signal: withTimeout(4000) });
    const list = await r.json();
    if (list[0] && list[0].domain) return { name: list[0].name, domain: list[0].domain };
  } catch (e) { /* fall through */ }
  return { name, domain: name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com' };
}
const shortName = (n) => n.replace(/\s+(of|pty|ltd|inc|limited|group|corporation|corp)\b.*$/i, '').trim();
const chip = (url) => `<span class="chip"><img src="${esc(url)}" alt="" referrerpolicy="no-referrer" /></span>`;
async function viaMicrolink(found) {
  const url = `https://api.microlink.io/?url=${encodeURIComponent('https://' + found.domain)}&palette=true&prerender=false`;
  const json = await fetch(url, { signal: withTimeout(12000) }).then((r) => r.json());
  if (json.status !== 'success') throw new Error('lookup failed');
  const d = json.data;
  const logoPal = (d.logo && d.logo.palette) || [];
  const imagePal = (d.image && d.image.palette) || [];
  const p = pickPrimary(logoPal, imagePal).toUpperCase();
  return generic(shortName(found.name), found.domain, p, d.logo && d.logo.url ? chip(d.logo.url) : null, 'Read live from their site', (d.description || d.title || '').replace(/\s+/g, ' ').trim());
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
        res(generic(shortName(found.name), found.domain, pickPrimary(pal, []).toUpperCase(), chip(src), 'Read live from their site', ''));
      } catch (e) { rej(e); }
    };
    img.src = src;
  });
}

/* Resolve any name to a brand. Never rejects: curated -> live -> hashed. */
export async function lookup(raw, step = () => {}) {
  const c = curated(raw);
  if (c) return c;
  const name = raw.trim().replace(/\s+/g, ' ');
  try {
    const found = await findDomain(name);
    step(`Found ${found.domain}`);
    const full = viaMicrolink(found).catch(() => null);
    const icon = viaIcon(found).catch(() => null);
    const later = new Promise((r) => setTimeout(r, 5000)).then(() => icon);
    let b = await Promise.race([full, later]);
    if (!b) b = (await full) || (await icon);
    if (b) return b;
  } catch (e) { /* fall through */ }
  return hashBrand(name);
}

/* ---- The in-app assistant (the END USER's chat, inside the client's app).
   It helps with the work; it never edits the app's structure. ---- */
export function assistantReply(br, text) {
  const t = text.toLowerCase();
  if (/(add|remove|delete|new|another|fifth).*(step|field)|change the app|rebuild|restructure/.test(t)) {
    return { html: `I help you use this app — I can’t change how it’s built. Ask whoever built it for ${esc(br.name)}; they’ll change it once and it updates everywhere.` };
  }
  const pick = /^(use|pick|go with|take|choose|i like)\b.*\b(first|1st|second|2nd|third|3rd|one|two|three|1|2|3)\b/.exec(t);
  if (pick) {
    const n = /second|2nd|two|2/.test(pick[2]) ? 1 : /third|3rd|three|3/.test(pick[2]) ? 2 : 0;
    return { html: `Done — “${esc(br.subjects[n])}” is in the draft.`, effect: 'use' + n };
  }
  if (/subject|headline|title/.test(t)) {
    return { html: `Three, in ${esc(br.name)}’s voice:<ol class="a-list">${br.subjects.map((s, i) => `<li><button type="button" data-subj="${i}">${esc(s)}</button></li>`).join('')}</ol>`, effect: 'subjects' };
  }
  if (/short|trim|tight|cut|intro/.test(t)) return { html: `Shorter:<q>${esc(br.short)}</q>I’ve put it in the draft.`, effect: 'short' };
  if (/warm|friend|kind|soft/.test(t)) return { html: `Warmer, still ${esc(br.name)}:<q>${esc(br.warm)}</q>Updated the draft.`, effect: 'warm' };
  if (/tone|voice|brand|check/.test(t)) return { html: esc(br.toneNote), effect: 'tone' };
  if (/button|cta|call to action/.test(t)) return { html: `Keep “${esc(br.cta)}”. It’s what ${esc(br.name)} uses on their site, so it tests well with ${esc(br.audience)}.` };
  if (/\b(hi|hello|hey)\b/.test(t)) return { html: `Hi! I know this campaign and ${esc(br.name)}’s voice. Try “suggest three subject lines”.` };
  return { html: `I can suggest subject lines, make the intro shorter, or check the draft against ${esc(br.name)}’s tone.` };
}
