/* 08 · Infinite — scrolling is zooming, forever.

   A Droste / zoomquilt landing page. Every level is a full, live UI laid out
   at the size of the stage, and each one holds a "portal" with the next level
   inside it, scaled down:
     · a builder level (you, the maker, in the EAI builder — builder chat on
       the LEFT, EAI's neutral styling) has the app preview as its portal;
     · an app level (the client's team using the published app — their
       assistant on the RIGHT, in their brand) has the phone on its Share card
       as its portal, and on that phone the next client's builder is open.
   Nike → Apple → CommBank → your client → back to Nike, maker and end user
   alternating, so the two chats read as two levels of one story.

   Maths: a portal is a similarity P(z) = A·z + t (A = k·e^{iθ}: scale and
   tilt) mapping the child level into its parent. Between two levels the
   camera zooms about P's fixed point c = t / (1 − A), so at the next integer
   the portal exactly fills the stage and the child *is* the stage — a
   seamless loop. The only state is z: floor(z) is the level you're on and
   frac(z) how far into its portal you've zoomed. Wheel, trackpad, touch,
   keys, the depth gauge and the builder chat all just move z.
*/
(() => {
  'use strict';

  /* ------------------------------------------------------------------ utils */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const mod = (n, m) => ((n % m) + m) % m;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const params = new URLSearchParams(location.search);
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let REDUCED = motionQuery.matches || params.has('reduced');

  /* ----------------------------------------------------------------- brands */
  const SWOOSH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 7.8 6.442 15.276c-1.456.616-2.679.925-3.668.925-1.11 0-1.922-.392-2.437-1.177-.317-.503-.4-1.152-.25-1.947.152-.795.532-1.643 1.14-2.543.505-.75 1.371-1.708 2.6-2.874-.365.615-.766 1.395-1.084 2.155-.55 1.32-.68 2.4-.394 3.24.13.375.365.65.68.83.36.2.83.29 1.41.29.44 0 .93-.06 1.47-.18L24 7.8Z" fill="currentColor"/></svg>';
  const APPLE = '<svg viewBox="150 100 500 560" aria-hidden="true"><path fill="currentColor" d="M584.8426,276.8632c-2.3411,1.4432-53.8358,31.4239-53.251,93.7952c0.6472,74.6027,65.3989,99.4457,66.1427,99.7276c-0.58,1.7759-10.3524,35.3838-34.1321,70.0925c-20.5507,30.0693-41.8387,59.968-75.4384,60.5922c-33.0098,0.6046-43.6489-19.5858-81.3589-19.5858c-37.7331,0-49.5436,18.9615-80.7596,20.1904c-32.4307,1.227-57.1214-32.4709-77.8236-62.3746c-42.3212-61.1983-74.679-172.9508-31.23-248.3679c21.5705-37.4546,60.1253-61.1835,101.9581-61.7964c31.8589-0.6021,61.9044,21.4174,81.3918,21.4174c19.209,0,53.636-25.6686,94.2163-22.6665C510.4626,229.066,555.6122,233.8129,584.8426,276.8632z M469.5186,187.488c17.2347-20.8293,28.8305-49.8377,25.6375-78.6904c-24.8053,0.9837-54.8058,16.5229-72.5975,37.339c-15.9324,18.4398-29.925,47.9732-26.1259,76.237C424.0806,224.5099,452.2985,208.3302,469.5186,187.488z"/></svg>';
  const EAI_MARK = '<img src="../../../assets/logos/eai-mark-dark.svg" alt="" />';

  const BRANDS = {
    nike: {
      key: 'nike', name: 'Nike', domain: 'nike.com', logo: SWOOSH,
      head: '#FA5400', headOn: '#FFFFFF', b: '#FA5400', on: '#FFFFFF', surface: '#F5F5F5', border: '#EADFD5',
      font: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      swatches: ['#FA5400', '#111111', '#FFFFFF', '#F5F5F5'],
      tone: 'Direct, urgent, athlete-first',
      goal: 'Launch the Pegasus 41…', audience: 'Nike Run Club members', date: '3 October',
      person: { first: 'Sam', ini: 'SO', role: 'Nike marketing' },
      files: ['nike-brand-guide.pdf', 'tone-of-voice.docx', 'pegasus-41-shots.zip'],
      subjects: ['Pegasus 41 is here. Go.', 'Your next PB starts now', 'Run Club members get first access'],
      body: 'The Pegasus 41 is here — lighter, faster, ready for your next PB. Run Club members get first access this week.',
      shorter: 'Pegasus 41. Lighter. Faster. Run Club gets it first.',
      preview: 'Lighter. Faster. Yours first.',
      onbrand: 'On-brand. Short lines, active verbs, athlete first. One fix: lose “ready for” — just say “built for your next PB.”',
      hi: 'I’m the Nike assistant. I help you write this email — fast.',
      cta: 'Shop now',
    },
    apple: {
      key: 'apple', name: 'Apple', domain: 'apple.com', logo: APPLE, logoClass: 'apple',
      head: '#1D1D1F', headOn: '#F5F5F7', b: '#0071E3', on: '#FFFFFF', surface: '#F5F5F7', border: '#E3E3E8',
      font: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif',
      swatches: ['#1D1D1F', '#0071E3', '#F5F5F7', '#FFFFFF'],
      tone: 'Simple, confident, understated',
      goal: 'Introduce the new iPhone…', audience: 'Apple Store customers', date: '9 October',
      person: { first: 'Alex', ini: 'AC', role: 'Apple marketing' },
      files: ['apple-brand-guidelines.pdf', 'voice-and-tone.docx', 'iphone-product-shots.zip'],
      subjects: ['Say hello to the new iPhone.', 'Pro. Beyond.', 'Available now at the Apple Store'],
      body: 'Introducing the new iPhone. Our most advanced camera yet, in a design you’ll love to hold.',
      shorter: 'The new iPhone. Our most advanced camera yet.',
      preview: 'Beautifully simple. Seriously capable.',
      onbrand: 'Yes. Calm, precise, understated. Consider one fewer adjective in the second line.',
      hi: 'Hello. I’m the Apple assistant. I can help with the words in this email.',
      cta: 'Learn more',
    },
    commbank: {
      key: 'commbank', name: 'CommBank', domain: 'commbank.com.au', logo: '<img src="../../logos/commbank.svg" alt="" class="img-mark" />',
      head: '#000000', headOn: '#FFFFFF', b: '#FFCC00', on: '#000000', surface: '#F7F7F7', border: '#E5E5E5',
      font: 'system-ui, -apple-system, sans-serif',
      swatches: ['#FFCC00', '#000000', '#FFFFFF', '#F7F7F7'],
      tone: 'Clear, helpful, reassuring',
      goal: 'Launch Yello rewards for everyday accounts…', audience: 'CommBank app customers', date: '16 October',
      person: { first: 'Priya', ini: 'PN', role: 'CommBank marketing' },
      files: ['commbank-brand-guide.pdf', 'yello-offers.xlsx', 'app-screens.zip'],
      subjects: ['Your Yello rewards are here', 'More value from everyday banking', 'Unlock offers in the CommBank app'],
      body: 'Earn Yello rewards on your everyday account. See your offers in the CommBank app — no sign-up needed.',
      shorter: 'Earn Yello rewards on everyday spending. No sign-up needed.',
      preview: 'Rewards, already in your app.',
      onbrand: 'It reads clearly and reassures. Tip: move “no sign-up needed” up — it answers the first question people have.',
      hi: 'Hi Priya, I’m the CommBank assistant. Happy to help with this email.',
      cta: 'See my offers',
    },
  };
  const YOURS = {
    key: 'yours', name: 'Your client', domain: 'yourclient.com', placeholder: true,
    logo: '<span class="q-mark">?</span>',
    head: '#232326', headOn: '#FFFFFF', b: '#18181B', on: '#FFFFFF', surface: '#F4F4F5', border: '#E4E4E7',
    font: 'Geist, system-ui, sans-serif',
    swatches: ['#18181B', '#71717A', '#D4D4D8', '#FFFFFF'],
    tone: 'Read from their site',
    goal: 'Whatever they sell next…', audience: 'Their customers', date: 'Whenever you say',
    person: { first: 'Their team', ini: '··', role: 'your client' },
    files: ['their-brand-guide.pdf', 'tone-of-voice.docx', 'product-shots.zip'],
    subjects: ['Something they’d sell twice', 'Their news, in their voice', 'Made for their customers'],
    body: 'This is where your client’s campaign goes — written in their voice, in their colours. Name them in the builder to fill it in.',
    shorter: 'Their news. Their voice. One line.',
    preview: 'Name a client to find out.',
    onbrand: 'Name the client in the builder and I’ll check against their real tone of voice.',
    hi: 'I’ll be their assistant — in their brand, for their team. Name them in the builder first.',
    cta: 'Find out more',
  };
  const ALIASES = { 'commonwealth bank': 'commbank', 'commonwealth bank of australia': 'commbank', cba: 'commbank', 'commbank.com.au': 'commbank', 'apple.com': 'apple', 'nike.com': 'nike' };
  const curated = (raw) => { const k = raw.trim().toLowerCase().replace(/\s+/g, ' '); return BRANDS[k] || BRANDS[ALIASES[k]] || null; };

  /* colour helpers (same maths as the live site) */
  function rgbOf(hex) { const n = parseInt(hex.replace('#', '').slice(0, 6), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function hslOf(hex) {
    const [r, g, b] = rgbOf(hex).map((v) => v / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
    return { s: d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1)), l };
  }
  function lum(hex) {
    const ch = rgbOf(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }
  const inkFor = (hex) => (lum(hex) > 0.45 ? '#111111' : '#FFFFFF');
  const tint = (hex, amt) => '#' + rgbOf(hex).map((v) => Math.round(255 - (255 - v) * amt).toString(16).padStart(2, '0')).join('');
  function pickPrimary(logoPal, imagePal) {
    const ok = (hex) => { const { s, l } = hslOf(hex); return s > 0.35 && l > 0.18 && l < 0.72; };
    const bySat = (a, b) => hslOf(b).s - hslOf(a).s;
    const fromLogo = logoPal.filter(ok).sort(bySat)[0];
    if (fromLogo) return fromLogo;
    const dark = logoPal.filter((h) => hslOf(h).l < 0.3).sort((a, b) => hslOf(a).l - hslOf(b).l)[0];
    if (dark) return dark;
    return imagePal.filter(ok).sort(bySat)[0] || '#1D1D1F';
  }

  // Fill in the words a brand needs from its name alone.
  function wordsFor(name) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      goal: `Announce what’s new at ${name}…`, audience: `${name} customers`, date: '28 October',
      person: { first: 'Jo', ini: 'JM', role: `${name} marketing` },
      files: [`${slug}-brand-guide.pdf`, 'tone-of-voice.docx', 'product-shots.zip'],
      subjects: [`What’s new at ${name}`, `${name}: made for you`, `Don’t miss this from ${name}`],
      body: `Here’s what’s new at ${name} this month — picked for ${name} customers, in ${name}’s own words.`,
      shorter: `New at ${name}: picked for you.`,
      preview: `The latest from ${name}, in a minute.`,
      onbrand: `Matches ${name}’s colours and logo from their site. The tone reads like their homepage — keep the second line short.`,
      hi: `Hi, I’m the ${name} assistant. I help with this email, in ${name}’s voice.`,
      cta: 'Find out more',
    };
  }
  function liveBrand(found, primary, logoUrl, extra) {
    const short = found.name.replace(/\s+(of|pty|ltd|inc|limited|group|corporation|corp)\b.*$/i, '').trim() || found.name;
    primary = primary.toUpperCase();
    return Object.assign(wordsFor(short), {
      key: 'live-' + short.toLowerCase(), name: short, domain: found.domain, live: true,
      logo: logoUrl ? `<span class="chip-logo"><img src="${esc(logoUrl)}" alt="" referrerpolicy="no-referrer" /></span>` : null,
      head: primary, headOn: inkFor(primary), b: primary, on: inkFor(primary),
      surface: tint(primary, 0.05), border: tint(primary, 0.16),
      font: 'system-ui, -apple-system, sans-serif',
      swatches: [primary].concat(extra.map((h) => h.toUpperCase()).filter((h) => h !== primary).slice(0, 3)),
      tone: 'Read live from their site',
    });
  }
  function guessBrand(raw) {
    const name = raw.trim().replace(/\s+/g, ' ');
    let h = 0;
    for (const ch of name.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const hue = h % 360;
    const b = `hsl(${hue} 62% 42%)`;
    return Object.assign(wordsFor(name), {
      key: 'guess-' + name.toLowerCase(), name, domain: name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
      head: b, headOn: '#FFFFFF', b, on: '#FFFFFF', surface: `hsl(${hue} 30% 96%)`, border: `hsl(${hue} 22% 87%)`,
      font: 'system-ui, -apple-system, sans-serif',
      swatches: [b, `hsl(${hue} 30% 96%)`, `hsl(${hue} 25% 14%)`, `hsl(${(hue + 150) % 360} 60% 55%)`],
      tone: 'Best guess — couldn’t reach their site',
    });
  }

  /* Live lookup, as on the current site: Clearbit autocomplete (name → domain),
     then Microlink (logo + palette from the real site), icon.horse as a quick
     read, and a guess from the name if everything fails. */
  function withTimeout(ms) { const c = new AbortController(); setTimeout(() => c.abort(), ms); return c.signal; }
  async function findDomain(name) {
    if (/\.[a-z]{2,}$/i.test(name)) return { name: name.replace(/\.[a-z.]+$/i, ''), domain: name.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '') };
    try {
      const r = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(name)}`, { signal: withTimeout(5000) });
      const list = await r.json();
      if (list[0] && list[0].domain) return { name: list[0].name, domain: list[0].domain };
    } catch (e) { /* fall through */ }
    return { name, domain: name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com' };
  }
  async function viaMicrolink(found) {
    const url = `https://api.microlink.io/?url=${encodeURIComponent('https://' + found.domain)}&palette=true&prerender=false`;
    const json = await fetch(url, { signal: withTimeout(15000) }).then((r) => r.json());
    if (json.status !== 'success') throw new Error('lookup failed');
    const d = json.data;
    const logoPal = (d.logo && d.logo.palette) || [];
    const imagePal = (d.image && d.image.palette) || [];
    return liveBrand(found, pickPrimary(logoPal, imagePal), d.logo && d.logo.url, logoPal.concat(imagePal));
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
          res(liveBrand(found, pickPrimary(pal, []), src, pal));
        } catch (e) { rej(e); }
      };
      img.src = src;
    });
  }
  async function readLive(name, step) {
    const found = await findDomain(name);
    step(`Found ${found.domain}`);
    const full = viaMicrolink(found).catch(() => null);
    const icon = viaIcon(found).catch(() => null);
    const later = new Promise((r) => setTimeout(r, 6000)).then(() => icon);
    let b = await Promise.race([full, later]);
    if (!b) b = (await full) || (await icon);
    if (!b) throw new Error('no brand');
    return b;
  }
  async function lookup(name, step) {
    const c = curated(name);
    if (c) { step(`Found ${c.domain}`); await sleep(500); return c; }
    if (params.has('offline')) { step('Working offline — guessing from the name'); await sleep(400); return guessBrand(name); }
    try { return await readLive(name, step); } catch (e) { step('Couldn’t reach their site — best guess from the name'); return guessBrand(name); }
  }

  /* ------------------------------------------------------------- the loop */
  // A client is a pair of levels: you building their app, then their team using it.
  let uid = 0;
  const clients = [
    { id: uid++, brand: BRANDS.nike, kind: 'first' },
    { id: uid++, brand: BRANDS.apple, kind: 'rebrand' },
    { id: uid++, brand: BRANDS.commbank, kind: 'warm' },
    { id: uid++, brand: YOURS, kind: 'invite' },
  ];
  let levels = [];
  const teamOf = (br) => (br.placeholder ? 'their team' : `${br.name}’s team`);
  const logoOf = (br) => br.logo || `<span class="mono-mark">${esc(br.name[0])}</span>`;

  const stage = $('#stage');
  let W = 1200, H = 720, AR = W / H, narrow = false;

  function nextClient(c) { const i = clients.indexOf(c); return clients[(i + 1) % clients.length]; }

  /* ---- QR code: finder squares plus a pattern hashed from the link ---- */
  function qrSVG(seed, fg) {
    const N = 25;
    let h = 2166136261;
    for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
    const rnd = () => { h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
    let d = '';
    const finder = (x, y) => `M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5zM${x + 2} ${y + 2}h3v3h-3z`;
    const inF = (x, y) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!inF(x, y) && rnd() > 0.52) d += `M${x} ${y}h1v1h-1z`;
    d += finder(0, 0) + finder(N - 7, 0) + finder(0, N - 7);
    return `<svg viewBox="-1 -1 ${N + 2} ${N + 2}" shape-rendering="crispEdges" aria-hidden="true"><rect x="-1" y="-1" width="${N + 2}" height="${N + 2}" fill="#fff"/><path d="${d}" fill="${fg}" fill-rule="evenodd"/></svg>`;
  }

  /* ---------------------------------------------------- builder level (maker) */
  const WIRE = [['Brief', 'Form'], ['Assets', 'Data source'], ['Compose', 'AI writer'], ['Review', 'Approval']];
  const BUILDER_CHIPS = {
    first: ['Make it for Qantas', 'Make the tone warmer', 'Add a fifth step'],
    rebrand: ['Make it for Canva', 'Make the tone warmer', 'Share it'],
    warm: ['Make it for Atlassian', 'Add a fifth step', 'Share it'],
    invite: ['Qantas', 'Canva', 'Bunnings'],
    live: ['Make it for Telstra', 'Make the tone warmer', 'Share it'],
  };
  const youMsg = (t) => `<div class="bm bm-you"><span class="av av-you">You</span><div class="bm-in"><small>You, building</small><p>${t}</p></div></div>`;
  const eaiMsg = (t, extra = '') => `<div class="bm bm-eai"><span class="av av-eai">${EAI_MARK}</span><div class="bm-in"><small>Builder</small><p>${t}</p>${extra}</div></div>`;
  const wireChips = () => `<ol class="bm-wire">${WIRE.map(([s, w], i) => `<li><i>${i + 1}</i><b>${s}</b><span>${w}</span></li>`).join('')}</ol>`;
  const swatchRow = (br) => `<div class="bm-sw">${br.swatches.map((c) => `<i style="background:${c}"></i>`).join('')}<span>${esc(br.tone)}</span></div>`;

  function builderThread(c) {
    const br = c.brand;
    switch (c.kind) {
      case 'first':
        return youMsg('Build a campaign email app for Nike.') +
          eaiMsg('Built. Exactly four steps, wired end to end:', wireChips()) +
          eaiMsg(`Read nike.com for colours, logo and voice.`, swatchRow(br));
      case 'rebrand':
        return youMsg('Now make it for Apple.') +
          eaiMsg('Read apple.com. Same four steps, same wiring — only the skin and the voice changed.', swatchRow(br));
      case 'warm':
        return youMsg('Make it for CommBank. Keep the approval in Review.') +
          eaiMsg('Read commbank.com.au — black and yellow. Approval stays in Review; still four steps.', swatchRow(br)) +
          youMsg('Make the tone a bit warmer.') +
          eaiMsg('Warmer. The AI writer and CommBank’s assistant both pick it up.');
      case 'invite':
        return eaiMsg('Who’s next? Name any company. I’ll read their website for colours, logo and tone, and put them in the loop.') +
          eaiMsg('Try “Make it for Qantas” — or your own client.');
      default:
        return youMsg(`Make it for ${esc(br.name)}.`) +
          eaiMsg(`Read ${esc(br.domain)}. Same four steps, same wiring — ${esc(br.name)}’s colours, logo and voice.`, swatchRow(br));
    }
  }

  function builderHTML(c) {
    const br = c.brand;
    const ph = !!br.placeholder;
    return `
    <header class="b-top">
      <span class="b-back" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      <b class="b-title">Campaign email</b>
      <span class="b-for"><i style="background:${ph ? '#C4C4C8' : br.b}"></i>${ph ? 'Next client' : 'for ' + esc(br.name)}</span>
      <span class="b-role"><span class="b-role-dot"></span>Maker · you, building</span>
      <span class="b-sp"></span>
      <span class="b-tabs" aria-hidden="true"><span>Editor</span><span class="on">Preview</span></span>
      <button class="b-btn" type="button" data-share>Share</button>
      <button class="b-btn b-pub" type="button" data-publish>Publish</button>
      <div class="b-pop" data-pop hidden>
        <div class="b-pop-qr">${qrSVG('eai.app/' + br.name, '#111')}</div>
        <div><b>Open ${esc(br.name)}’s app on a phone</b><p>Scan, or send the link. Same four steps, in their pocket.</p><code>eai.app/${esc(br.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}/campaign</code></div>
      </div>
    </header>
    <div class="b-body">
      <aside class="b-chat" aria-label="Builder chat — you, building the app">
        <div class="b-chat-hd">
          <span class="av av-eai">${EAI_MARK}</span>
          <div><b>Builder</b><small>EAI · changes the app itself</small></div>
        </div>
        <div class="b-thread" data-thread>${builderThread(c)}</div>
        <div class="b-chips" data-chips>${BUILDER_CHIPS[c.kind].map((t) => `<button type="button" class="chip">${esc(t)}</button>`).join('')}</div>
        <form class="b-composer" data-form>
          <input type="text" name="q" autocomplete="off" aria-label="Message the builder" placeholder="${ph ? 'Make it for…' : 'Tell the builder what to change…'}" />
          <button type="submit" aria-label="Send to the builder"><svg viewBox="0 0 16 16"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        </form>
      </aside>
      <div class="b-canvas">
        <div class="b-cap"><span class="b-cap-l">Preview</span><span class="b-cap-m">What ${esc(teamOf(br))} will see</span><span class="b-cap-r">Click to zoom in ↘</span></div>
        <div class="b-cell" data-cell>
          <div class="b-frame"><button type="button" class="portal" data-portal aria-label="Zoom into ${esc(br.name)}’s app" style="--hole:${br.surface};--holeHead:${br.head}"></button></div>
        </div>
        <ol class="b-wiring" aria-label="How it's wired">${WIRE.map(([s, w], i) => `<li><i>${i + 1}</i><b>${s}</b><span>${w}</span></li>`).join('')}</ol>
      </div>
    </div>`;
  }

  /* ------------------------------------------------- app level (end user) */
  const STEPS = ['Brief', 'Assets', 'Compose', 'Review'];
  const TICK = '<svg viewBox="0 0 24 24" width="11" height="11"><path d="m5 13 4 4L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function stepHTML(lv) {
    const br = lv.client.brand;
    const i = lv.step;
    const next = ['Next: assets', 'Next: compose', 'Next: review', 'Approve and send'][i];
    const cta = `<button type="button" class="a-next" data-next>${next}</button>`;
    if (i === 0) {
      return `<div class="a-card-hd"><b>Tell us about the campaign</b><small>Four fields. The rest is written for you.</small></div>
        <label class="a-f"><span>Campaign goal</span><em>${esc(br.goal)}</em></label>
        <div class="a-row"><label class="a-f"><span>Audience</span><em>${esc(br.audience)}</em></label><label class="a-f"><span>Send date</span><em>${esc(br.date)}</em></label></div>
        <label class="a-f"><span>Tone</span><em>${esc(br.tone)}</em></label>` + cta;
    }
    if (i === 1) {
      return `<div class="a-card-hd"><b>Assets</b><small>What this campaign draws on. Synced from SharePoint.</small></div>` +
        br.files.map((f) => `<div class="a-file"><i></i><span>${esc(f)}</span><small>Synced 2 min ago</small></div>`).join('') +
        `<p class="a-note">Kept up to date automatically — the next campaign reads whatever is current.</p>` + cta;
    }
    if (i === 2) {
      return `<div class="a-card-hd"><b>Compose</b><small>Drafted by AI from the brief and assets, in ${esc(br.placeholder ? 'their' : br.name + '’s')} voice.</small></div>
        <div class="a-subj"><span>Subject</span><b data-subj>${esc(lv.subject)}</b></div>
        <div class="a-mail">
          <div class="a-mail-bar">${logoOf(br)}</div>
          <div class="a-mail-body"><b data-subj>${esc(lv.subject)}</b><p data-body>${esc(lv.body)}</p><span class="a-mail-btn">${esc(br.cta)}</span></div>
        </div>` + cta;
    }
    return `<div class="a-card-hd"><b>Review</b><small>One approval before it sends on ${esc(br.date)}.</small></div>
      <div class="a-who"><span class="a-av">JL</span><div><b>Jordan Lee</b><small>Marketing lead · approver</small></div><span class="a-state">Waiting</span></div>
      ${['Brand colours and logo', `Tone of voice — ${br.tone}`, 'Links and unsubscribe checked'].map((t) => `<div class="a-check"><span>${TICK}</span>${esc(t)}</div>`).join('')}` + cta;
  }

  function stepsHTML(lv) {
    return STEPS.map((s, n) => `<li class="${n === lv.step ? 'on' : n < lv.step ? 'done' : ''}"><button type="button" data-go="${n}"><i>${n < lv.step ? TICK : n + 1}</i><span>${s}</span></button></li>`).join('');
  }

  const ASSIST_CHIPS = ['Suggest three subject lines', 'Make the intro shorter', 'Is this on-brand?', 'Write the preview text'];
  const asMsg = (br, html) => `<div class="am am-ai"><span class="av av-brand">${logoOf(br)}</span><div class="am-in"><small>${esc(br.placeholder ? 'Their assistant' : br.name + ' assistant')}</small><div class="am-p">${html}</div></div></div>`;
  const userMsg = (br, t) => `<div class="am am-user"><div class="am-in"><small>${esc(br.person.first)} · ${esc(teamOf(br))}</small><div class="am-p">${esc(t)}</div></div><span class="av av-person">${esc(br.person.ini)}</span></div>`;

  function appHTML(lv) {
    const c = lv.client;
    const br = c.brand;
    const nx = nextClient(c).brand;
    return `
    <header class="a-bar">
      <span class="a-logo ${br.logoClass || ''}">${logoOf(br)}</span>
      <b class="a-name">${esc(br.placeholder ? 'Your client' : br.name)}</b><span class="a-app">Campaign email</span>
      <span class="a-role"><span class="a-role-dot"></span>End user · ${esc(teamOf(br))}, using the app</span>
      <span class="a-sp"></span>
      <span class="a-me"><span class="av av-person">${esc(br.person.ini)}</span>${esc(br.person.first)}<small>${esc(br.person.role)}</small></span>
    </header>
    <div class="a-body">
      <div class="a-main">
        <ol class="a-steps" data-steps>${stepsHTML(lv)}</ol>
        <div class="a-grid">
          <div class="a-card" data-card>${stepHTML(lv)}</div>
          <div class="a-share">
            <div class="a-share-hd"><b>Share</b><small>Open it on a phone</small></div>
            <div class="a-device"><span class="a-cam" aria-hidden="true"></span><button type="button" class="portal" data-portal aria-label="Zoom into the phone" style="--hole:#FAFAFA;--holeHead:#FFFFFF"></button></div>
            <div class="a-share-ft">
              <span class="a-qr">${qrSVG('eai.app/' + br.name, '#111')}</span>
              <div><b data-next-name>Shared with ${esc(nx.placeholder ? 'your next client' : nx.name)}</b><small data-next-sub>${esc(nx.placeholder ? 'Who wants one next?' : `${nx.name} wants one too →`)}</small></div>
            </div>
          </div>
        </div>
      </div>
      <aside class="a-assist" aria-label="${esc(br.placeholder ? 'Their' : br.name)} assistant — for ${esc(teamOf(br))}, inside the app">
        <div class="a-as-hd">
          <span class="av av-brand">${logoOf(br)}</span>
          <div><b>${esc(br.placeholder ? 'Their assistant' : br.name + ' assistant')}</b><small>For ${esc(teamOf(br))} · inside the app</small></div>
        </div>
        <div class="a-thread" data-athread>
          ${asMsg(br, esc(br.hi) + ' <span class="am-note">I help with the work — I don’t change how the app works.</span>')}
          ${userMsg(br, 'Suggest three subject lines')}
          ${asMsg(br, `Three, in ${esc(br.placeholder ? 'their' : br.name + '’s')} voice:<ul>${br.subjects.map((s) => `<li><button type="button" data-use="${esc(s)}">${esc(s)}</button></li>`).join('')}</ul>`)}
        </div>
        <div class="a-chips" data-achips>${ASSIST_CHIPS.slice(1).map((t) => `<button type="button" class="chip">${esc(t)}</button>`).join('')}</div>
        <form class="a-composer" data-aform>
          <input type="text" name="q" autocomplete="off" aria-label="Ask the ${esc(br.name)} assistant" placeholder="Ask the ${esc(br.placeholder ? 'assistant' : br.name + ' assistant')}…" />
          <button type="submit" aria-label="Send"><svg viewBox="0 0 16 16"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        </form>
      </aside>
    </div>`;
  }

  function brandVars(el, br) {
    const s = el.style;
    s.setProperty('--h', br.head); s.setProperty('--ho', br.headOn);
    s.setProperty('--b', br.b); s.setProperty('--on', br.on);
    s.setProperty('--s', br.surface); s.setProperty('--bd', br.border);
    s.setProperty('--font', br.font);
  }

  /* -------------------------------------------------- building the scenes */
  function makeLevel(client, type) {
    const el = document.createElement('section');
    el.className = `scene ${type}`;
    el.setAttribute('aria-hidden', 'true');
    const lv = { client, type, el, P: { a: 0.5, b: 0, tx: 0, ty: 0 }, k: 0.5, shown: false, step: 2, subject: '', body: '' };
    el.__lv = lv;
    renderLevel(lv);
    stage.insertBefore(el, $('#wash'));
    return lv;
  }
  function renderLevel(lv) {
    const br = lv.client.brand;
    lv.subject = br.subjects[0];
    lv.body = br.body;
    lv.greeted = lv.asked = false;
    lv.step = 2;
    lv.el.dataset.brand = br.key;
    if (lv.type === 'builder') lv.el.innerHTML = builderHTML(lv.client);
    else { brandVars(lv.el, br); lv.el.innerHTML = appHTML(lv); }
    lv.portal = $('[data-portal]', lv.el);
    lv.cell = $('[data-cell]', lv.el);
    lv.el.classList.toggle('is-placeholder', !!br.placeholder);
  }
  function rebuildLevels() {
    levels = [];
    for (const c of clients) {
      if (!c.b) c.b = makeLevel(c, 'builder');
      if (!c.a) c.a = makeLevel(c, 'app');
      levels.push(c.b, c.a);
    }
    // the Share card names whoever is next in the loop
    for (const c of clients) {
      const nx = nextClient(c).brand;
      const n = $('[data-next-name]', c.a.el), s = $('[data-next-sub]', c.a.el);
      if (n) n.textContent = `Shared with ${nx.placeholder ? 'your next client' : nx.name}`;
      if (s) s.textContent = nx.placeholder ? 'Who wants one next?' : `${nx.name} wants one too →`;
      c.a.portal.style.setProperty('--hole', '#FAFAFA');
      c.b.portal.style.setProperty('--hole', c.brand.surface);
      c.b.portal.style.setProperty('--holeHead', c.brand.head);
    }
    buildGauge();
  }

  /* ------------------------------------------------------ layout & portals */
  // Each portal is sized to the stage's aspect ratio, so the child level
  // (laid out at full stage size) fits it exactly.
  function layout() {
    const r = stage.getBoundingClientRect();
    W = Math.max(280, r.width); H = Math.max(280, r.height); AR = W / H;
    narrow = W < 760;
    stage.classList.toggle('narrow', narrow);
    const sr = stage.getBoundingClientRect();
    for (const lv of levels) {
      const s = lv.el.style;
      s.width = W + 'px'; s.height = H + 'px';
      s.transform = 'none';
      lv.el.classList.toggle('narrow', narrow);
    }
    // pass 1: size portals (builder portals fill their cell; phones are fixed)
    for (const lv of levels) {
      let pw;
      if (lv.type === 'builder') {
        const fp = narrow ? 6 : 8;
        const cw = lv.cell.clientWidth - 2 * fp, ch = lv.cell.clientHeight - 2 * fp;
        pw = Math.max(40, Math.min(cw, ch * AR, W * (narrow ? 0.7 : 0.64)));
      } else {
        pw = W * (narrow ? 0.34 : 0.26);
      }
      lv.pw = pw;
      lv.el.style.setProperty('--pw', pw + 'px');
      lv.el.style.setProperty('--ph', pw / AR + 'px');
      lv.el.style.setProperty('--rot', (lv.type === 'app' ? (narrow ? -5 : -7) : 0) + 'deg');
    }
    // pass 2: measure centres (bounding-box centre survives the device's tilt)
    for (const lv of levels) {
      const pr = lv.portal.getBoundingClientRect();
      const er = lv.el.getBoundingClientRect();
      const cx = pr.left + pr.width / 2 - er.left, cy = pr.top + pr.height / 2 - er.top;
      const k = lv.pw / W;
      const th = (lv.type === 'app' ? (narrow ? -5 : -7) : 0) * Math.PI / 180;
      const a = k * Math.cos(th), b = k * Math.sin(th);
      // P(z) = A z + t, with the child's centre landing on the portal's centre
      lv.P = { a, b, tx: cx - (a * W / 2 - b * H / 2), ty: cy - (b * W / 2 + a * H / 2) };
      lv.k = k;
      // corners: the portal's radius, seen from inside the child
      const rad = parseFloat(getComputedStyle(lv.portal).borderTopLeftRadius) || 0;
      lv.childRadius = rad / k;
    }
    for (const lv of levels) {
      const parent = levels[mod(levels.indexOf(lv) - 1, levels.length)];
      lv.el.style.borderRadius = parent.childRadius + 'px';
      lv.shown = false;
      lv.el.style.visibility = 'hidden';
    }
    void sr;
    // depth gauge rows
    gHoriz = matchMedia('(max-width: 760px)').matches;
    const track = $('.g-track');
    rowH = gHoriz ? clamp(track.clientWidth / levels.length, 12, 26) : clamp(track.clientHeight / levels.length, 18, 34);
    $('#gauge').style.setProperty('--row', rowH + 'px');
    logPerLoop = levels.reduce((s, lv) => s + Math.log(1 / lv.k), 0);
    render();
  }

  /* -------------------------------------------------------------- camera */
  const mul = (m, n) => ({ a: m.a * n.a - m.b * n.b, b: m.a * n.b + m.b * n.a, tx: m.a * n.tx - m.b * n.ty + m.tx, ty: m.b * n.tx + m.a * n.ty + m.ty });
  function camera(P, f) {
    const da = 1 - P.a, db = -P.b, den = da * da + db * db;
    const cx = (P.tx * da + P.ty * db) / den, cy = (P.ty * da - P.tx * db) / den;
    const k = Math.hypot(P.a, P.b), th = Math.atan2(P.b, P.a);
    const s = Math.pow(k, -f), ang = -th * f;
    const a = s * Math.cos(ang), b = s * Math.sin(ang);
    return { a, b, tx: cx - (a * cx - b * cy), ty: cy - (b * cx + a * cy), cx, cy };
  }

  let z = 0, zt = 0, tween = null, lastDir = 1, raf = 0, introReveal = 1;
  let logPerLoop = 1, rowH = 32, gHoriz = false;
  const DEPTH = 4;

  function render() {
    const L = levels.length;
    const n = Math.floor(z), f = z - n;
    const cam = camera(levels[mod(n, L)].P, f);
    let T = cam;
    const on = new Set();
    for (let j = 0; j < Math.min(DEPTH, L); j++) {
      const lv = levels[mod(n + j, L)];
      const s = Math.hypot(T.a, T.b);
      if (s * W < 8) break;
      // the parent is fully hidden behind its child once we've arrived
      if (!(j === 0 && f > 0.996)) {
        on.add(lv);
        const st = lv.el.style;
        st.transform = `matrix(${T.a},${T.b},${-T.b},${T.a},${T.tx},${T.ty})`;
        st.zIndex = String(10 + j);
        // monochrome in the distance; the client's colour floods in as it arrives
        const g = REDUCED ? 0 : 1 - smooth(0.3, 0.52, s);
        st.filter = g > 0.01 ? `grayscale(${g.toFixed(3)})` : '';
        let op = 1;
        if (j === 1 && mod(n, L) === 0 && z < 1 && introReveal < 1) op = introReveal;
        st.opacity = op < 1 ? op.toFixed(3) : '';
        if (!lv.shown) { st.visibility = 'visible'; lv.shown = true; }
      }
      T = mul(T, lv.P);
    }
    for (const lv of levels) if (lv.shown && !on.has(lv)) { lv.el.style.visibility = 'hidden'; lv.shown = false; }
    chrome(n, f, cam);
  }

  /* ---------------------------------------------------- chrome per frame */
  const gZoom = $('#gZoom'), gLabel = $('#gLabel'), gLoop = $('#gLoop'), gMarker = $('#gMarker'), gList = $('#gList');
  const tKick = $('#tKick'), tBig = $('#tBig'), tSub = $('#tSub'), transit = $('#transit'), wash = $('#wash');
  const cKick = $('#cKick'), cTitle = $('#cTitle'), cBody = $('#cBody');
  let currentIdx = -1, transitIdx = -1;

  function levelName(lv) { return lv.client.brand.placeholder ? 'Your client' : lv.client.brand.name; }
  function roleOf(lv) { return lv.type === 'builder' ? 'Maker' : 'End user'; }
  function fmtZoom(logz) {
    const v = Math.exp(logz);
    if (v < 10) return '×' + v.toFixed(v < 1 ? 2 : 1);
    if (v < 1e4) return '×' + Math.round(v).toLocaleString('en-AU');
    const units = [[1e18, 'Qn'], [1e15, 'Qd'], [1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K']];
    for (const [u, s] of units) if (v >= u) return '×' + (v / u).toFixed(v / u < 10 ? 1 : 0) + s;
    return '×' + v.toExponential(1);
  }

  function chrome(n, f, cam) {
    const L = levels.length;
    const loop = Math.floor(n / L);
    const base = mod(n, L);
    // cumulative magnification since level 0 of loop 1
    let logz = loop * logPerLoop;
    for (let i = 0; i < base; i++) logz += Math.log(1 / levels[i].k);
    logz += f * Math.log(1 / levels[base].k);
    gZoom.textContent = fmtZoom(logz);
    const pos = base + f;
    gMarker.style.transform = gHoriz ? `translateX(${pos * rowH}px)` : `translateY(${pos * rowH}px)`;

    const ri = mod(Math.round(z), L);
    if (ri !== currentIdx) setCurrent(ri, Math.floor(Math.round(z) / L));
    gLoop.textContent = `Loop ${Math.floor(Math.round(z) / L) + 1}`;

    // giant transit type: the level you're heading into
    const moving = tween || Math.abs(zt - z) > 0.002 || dragging;
    const dir = tween ? Math.sign(tween.to - tween.from) || lastDir : (Math.abs(zt - z) > 0.002 ? Math.sign(zt - z) : lastDir);
    const ti = mod(dir > 0 ? n + 1 : n, L);
    const tl = levels[ti];
    const amt = REDUCED || !moving || f < 0.0005 ? 0 : Math.pow(Math.sin(Math.PI * f), 0.7);
    if (ti !== transitIdx && tl) {
      transitIdx = ti;
      tKick.textContent = `Level ${ti} · ${roleOf(tl)}`;
      tBig.textContent = levelName(tl);
      tSub.textContent = tl.type === 'builder' ? 'You, building' : `${teamOf(tl.client.brand)}, using it`;
      transit.dataset.type = tl.type;
    }
    const pf = dir > 0 ? f : 1 - f;
    transit.style.opacity = amt.toFixed(3);
    transit.style.setProperty('--tf', pf.toFixed(4));
    tBig.style.fontVariationSettings = `"wdth" ${Math.round(62 + 63 * pf)}, "wght" 900`;

    // colour wash as an app level arrives
    const into = levels[mod(n + 1, L)];
    let wo = 0;
    if (!REDUCED && into.type === 'app' && !into.client.brand.placeholder) wo = smooth(0.4, 0.78, f) * (1 - smooth(0.8, 1, f)) * 0.8;
    if (wo > 0.002) {
      wash.style.background = `radial-gradient(circle at ${cam.cx.toFixed(0)}px ${cam.cy.toFixed(0)}px, ${into.client.brand.b} 0%, ${into.client.brand.b} 30%, transparent 90%)`;
    }
    wash.style.opacity = wo.toFixed(3);
  }

  /* --------------------------------------------------- the current level */
  const CAPTIONS = {
    first: {
      builder: { kick: 'Level 0 · You, building', title: 'Build once. Sell to many.', body: 'You’re the maker. The builder chat on the left changes the app. Scroll to zoom into what Nike’s team will see.' },
      app: { kick: '01 · Exactly four steps', title: 'Four steps. Every app.', body: 'Brief → Assets → Compose → Review, wired Form → Data source → AI writer → Approval. You’re Nike’s team now — their assistant is on the right.' },
    },
    rebrand: {
      builder: { kick: '02 · Rebrand in a sentence', title: '“Now make it for Apple.”', body: 'EAI reads apple.com for colours, logo and tone of voice. Same app, same wiring underneath. Type any client in the builder chat.' },
      app: { kick: '03 · AI in every app', title: 'Their team gets an assistant too.', body: 'Every app ships with its own assistant, in the client’s brand, for the people using it. It helps with the work; it never changes the app.' },
    },
    warm: {
      builder: { kick: 'Two chats, two people', title: 'Your chat builds. Theirs helps.', body: 'Left, in EAI’s colours: the builder chat, for you. Right, in their colours: the in-app assistant, for their team. Zoom in to switch sides.' },
      app: { kick: '04 · On their phone in a scan', title: 'Share → QR → their phone.', body: 'Same four steps, in their pocket. Look closely at that phone — someone else wants one.' },
    },
    invite: {
      builder: { kick: 'Your turn', title: 'Who’s next?', body: 'Name any company in the builder chat. We’ll read their site and put them in the loop.' },
      app: { kick: 'The loop', title: 'What would you sell twice?', body: 'One build. As many clients as you can name. Keep zooming — it goes round again.', cta: true },
    },
    live: {
      builder: (br) => ({ kick: 'Rebrand in a sentence', title: `“Make it for ${br.name}.”`, body: `Read ${br.domain} for colours, logo and tone. Same four steps, same wiring. Zoom in to meet ${br.name}’s team.` }),
      app: (br) => ({ kick: `${br.name}’s team, using it`, title: `${br.name}’s app. ${br.name}’s assistant.`, body: 'Their colours, their voice, their assistant on the right. You wrote one sentence.' }),
    },
  };
  function captionFor(lv) {
    const c = lv.client;
    const set = CAPTIONS[c.kind] || CAPTIONS.live;
    const v = set[lv.type];
    return typeof v === 'function' ? v(c.brand) : v;
  }

  let liveLevel = null;
  function setCurrent(idx, loop) {
    currentIdx = idx;
    const lv = levels[idx];
    for (const l of levels) {
      const live = l === lv;
      l.el.inert = !live;
      l.el.classList.toggle('live', live);
      l.el.setAttribute('aria-hidden', live ? 'false' : 'true');
    }
    liveLevel = lv;
    const cap = captionFor(lv);
    cKick.textContent = cap.kick;
    cTitle.textContent = cap.title;
    cBody.textContent = cap.body;
    const capEl = $('#caption');
    capEl.dataset.type = lv.type;
    capEl.style.setProperty('--brand', lv.type === 'app' && !lv.client.brand.placeholder ? lv.client.brand.b : '#FFFFFF');
    capEl.classList.remove('swap'); void capEl.offsetWidth; capEl.classList.add('swap');
    gLabel.textContent = `Level ${idx} · ${levelName(lv)} · ${roleOf(lv)}`;
    $$('li', gList).forEach((li, i) => li.classList.toggle('on', i === idx));
    document.documentElement.style.setProperty('--brand', lv.type === 'app' && !lv.client.brand.placeholder ? lv.client.brand.b : '#FFFFFF');
    document.body.dataset.side = lv.type;
    void loop;
  }

  /* -------------------------------------------------------- depth gauge */
  function buildGauge() {
    gList.innerHTML = levels.map((lv, i) => {
      const br = lv.client.brand;
      const col = lv.type === 'app' ? (br.placeholder ? '#71717A' : br.b) : 'transparent';
      return `<li data-type="${lv.type}"><button type="button" data-level="${i}" aria-label="Jump to level ${i}: ${esc(levelName(lv))}, ${roleOf(lv)}">
        <span class="g-n">${String(i).padStart(2, '0')}</span><span class="g-dot" style="--c:${col}"></span><span class="g-name">${esc(levelName(lv))}</span><span class="g-role">${roleOf(lv)}</span></button></li>`;
    }).join('');
    gList.style.setProperty('--count', levels.length);
    $('#gauge').style.setProperty('--count', levels.length);
    currentIdx = -1;
  }
  gList.addEventListener('click', (e) => {
    const b = e.target.closest('[data-level]');
    if (!b) return;
    jumpToLevel(+b.dataset.level);
  });
  function jumpToLevel(idx) {
    const L = levels.length;
    const cur = Math.round(tween ? tween.to : zt);
    const fwd = mod(idx - mod(cur, L), L);
    const d = fwd <= L - fwd ? fwd : fwd - L;
    if (d === 0) return;
    goTo(cur + d);
  }

  /* ------------------------------------------------------------- motion */
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  function goTo(target, dur, ease) {
    userBusy();
    if (REDUCED) { z = zt = target; tween = null; kick(); return; }
    const dist = Math.abs(target - z);
    dur = dur || clamp(650 + 520 * dist, 700, 3400);
    lastDir = Math.sign(target - z) || lastDir;
    tween = { from: z, to: target, t0: performance.now(), dur, ease: ease || easeInOut };
    kick();
  }
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }
  let lastT = 0;
  function tick(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - (lastT || now)) / 1000);
    lastT = now;
    if (tween) {
      const t = clamp((now - tween.t0) / tween.dur, 0, 1);
      z = zt = tween.from + (tween.to - tween.from) * tween.ease(t);
      if (t >= 1) { z = zt = tween.to; tween = null; settled(); }
    } else if (Math.abs(zt - z) > 0.0004) {
      z += (zt - z) * (1 - Math.exp(-dt * 10));
    } else if (z !== zt) {
      z = zt;
      if (!snapTimer && !dragging && Math.abs(z - Math.round(z)) < 1e-6) settled();
    }
    render();
    if (tween || z !== zt || dragging) raf = requestAnimationFrame(tick);
    else lastT = 0;
  }

  // After input stops, glide to the nearest level (biased the way you were going).
  let snapTimer = 0;
  function scheduleSnap(ms = 170) {
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => { snapTimer = 0; snap(); }, ms);
  }
  function snap() {
    const fl = Math.floor(zt), f = zt - fl;
    if (f < 1e-4 || f > 1 - 1e-4) { zt = Math.round(zt); kick(); return; }
    const target = lastDir > 0 ? (f > 0.14 ? fl + 1 : fl) : (f < 0.86 ? fl : fl + 1);
    goTo(target, clamp(420 + 900 * Math.abs(target - z), 420, 1100), easeOut);
  }

  let loopsCelebrated = 0;
  function settled() {
    const L = levels.length;
    const zi = Math.round(z);
    const loop = Math.floor(zi / L);
    if (mod(zi, L) === 0 && loop > loopsCelebrated && loop >= 1) {
      loopsCelebrated = loop;
      showFinale(loop);
    }
    // First arrival at an app level: the end user asks their assistant something.
    const lv = levels[mod(zi, L)];
    if (lv && lv.type === 'app' && !lv.greeted && !REDUCED) {
      lv.greeted = true;
      setTimeout(() => { if (liveLevel === lv && !lv.asked) askAssistant(lv, 'Make the intro shorter', true); }, 900);
    }
  }

  /* ---------------------------------------------------------- input */
  let userActed = false;
  function userBusy() { userActed = true; }
  const outside = $('#outside');
  const finale = $('#finale');
  const isOut = () => document.body.classList.contains('exited');

  let wheelAcc = 0, stepLock = 0;
  window.addEventListener('wheel', (e) => {
    if (isOut()) return;
    if (e.target.closest && e.target.closest('.fin-card')) return;
    e.preventDefault();
    let d = e.deltaY || e.deltaX;
    if (e.deltaMode === 1) d *= 18; else if (e.deltaMode === 2) d *= H;
    if (e.ctrlKey) d *= -4; // trackpad pinch: spreading your fingers goes deeper
    if (REDUCED) {
      wheelAcc += d;
      if (Math.abs(wheelAcc) > 90 && performance.now() > stepLock) { step(Math.sign(wheelAcc)); wheelAcc = 0; stepLock = performance.now() + 650; }
      clearTimeout(snapTimer); snapTimer = setTimeout(() => { snapTimer = 0; wheelAcc = 0; }, 200);
      return;
    }
    d = clamp(d, -160, 160);
    userBusy();
    finishIntro();
    tween = null;
    lastDir = Math.sign(d) || lastDir;
    zt += d / 560;
    kick();
    scheduleSnap(160);
  }, { passive: false });

  function step(d) {
    userBusy();
    finishIntro();
    const base = tween ? tween.to : Math.round(zt);
    goTo(base + d, REDUCED ? 0 : 1150);
  }

  const typing = (t) => t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!finale.hidden) { hideFinale(); return; }
      if (isOut()) { enterLoop(); return; }
    }
    if (isOut() || typing(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !(e.target.closest && e.target.closest('button,a')))) { e.preventDefault(); step(1); }
    else if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); step(-1); }
    else if (k === 'Home') { e.preventDefault(); const L = levels.length; goTo(Math.floor(Math.round(zt) / L) * L); }
  });

  // touch: drag up to go deeper
  let dragging = false, dragStart = null, dragSamples = [];
  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch' || isOut()) return;
    dragStart = { y: e.clientY, x: e.clientX, z: zt, id: e.pointerId, moved: false };
    dragSamples = [{ t: performance.now(), y: e.clientY }];
  });
  stage.addEventListener('pointermove', (e) => {
    if (!dragStart || e.pointerId !== dragStart.id) return;
    const dy = dragStart.y - e.clientY;
    if (!dragStart.moved && Math.abs(dy) < 10) return;
    if (!dragStart.moved) { dragStart.moved = true; dragging = true; tween = null; finishIntro(); userBusy(); try { stage.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ } }
    dragSamples.push({ t: performance.now(), y: e.clientY });
    if (dragSamples.length > 6) dragSamples.shift();
    if (REDUCED) return;
    zt = dragStart.z + dy / (H * 0.7);
    lastDir = Math.sign(dy) || lastDir;
    kick();
  });
  const endDrag = (e) => {
    if (!dragStart || e.pointerId !== dragStart.id) return;
    const moved = dragStart.moved;
    const dy = dragStart.y - e.clientY;
    dragStart = null;
    if (!moved) return;
    dragging = false;
    if (REDUCED) { if (Math.abs(dy) > 50) step(Math.sign(dy)); return; }
    const a = dragSamples[0], b = dragSamples[dragSamples.length - 1];
    const v = b && a && b.t > a.t ? (a.y - b.y) / (b.t - a.t) : 0; // px per ms, positive = up
    zt += clamp(v * 90 / (H * 0.7), -0.8, 0.8);
    lastDir = Math.sign(v || dy) || lastDir;
    snap();
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  /* --------------------------------------------- interactions per level */
  stage.addEventListener('click', (e) => {
    const lv = e.target.closest('.scene') && e.target.closest('.scene').__lv;
    if (!lv || lv !== liveLevel) return;
    const t = e.target;
    if (t.closest('[data-portal]')) { step(1); return; }
    if (lv.type === 'builder') {
      const chip = t.closest('.b-chips .chip');
      if (chip) { builderSay(lv, chip.textContent.trim()); return; }
      if (t.closest('[data-share]')) { const p = $('[data-pop]', lv.el); p.hidden = !p.hidden; return; }
      if (t.closest('[data-publish]')) { toast(lv, `Published — ${teamOf(lv.client.brand)} can use it now.`); return; }
      if (!t.closest('[data-pop]')) { const p = $('[data-pop]', lv.el); if (p) p.hidden = true; }
    } else {
      const go = t.closest('[data-go]');
      if (go) { setStep(lv, +go.dataset.go); return; }
      if (t.closest('[data-next]')) {
        if (lv.step === 3) { toast(lv, 'Sent to Jordan for approval.'); return; }
        setStep(lv, lv.step + 1); return;
      }
      const use = t.closest('[data-use]');
      if (use) { lv.subject = use.dataset.use; if (lv.step !== 2) setStep(lv, 2); else $$('[data-subj]', lv.el).forEach((n) => { n.textContent = lv.subject; flash(n); }); return; }
      const chip = t.closest('.a-chips .chip');
      if (chip) { askAssistant(lv, chip.textContent.trim()); return; }
    }
  });
  stage.addEventListener('submit', (e) => {
    e.preventDefault();
    const lv = e.target.closest('.scene') && e.target.closest('.scene').__lv;
    if (!lv) return;
    const input = $('input', e.target);
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    if (lv.type === 'builder') builderSay(lv, q);
    else askAssistant(lv, q);
  });

  function flash(n) { n.classList.remove('flash'); void n.offsetWidth; n.classList.add('flash'); }
  function toast(lv, text) {
    let t = $('.s-toast', lv.el);
    if (!t) { t = document.createElement('div'); t.className = 's-toast'; lv.el.appendChild(t); }
    t.textContent = text;
    t.classList.remove('on'); void t.offsetWidth; t.classList.add('on');
  }
  function setStep(lv, i) {
    lv.step = clamp(i, 0, 3);
    $('[data-steps]', lv.el).innerHTML = stepsHTML(lv);
    const card = $('[data-card]', lv.el);
    card.innerHTML = stepHTML(lv);
    flash(card);
  }

  function pushTo(thread, html, max = 7) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const nodes = [...tmp.children];
    nodes.forEach((n) => { n.classList.add('in'); thread.appendChild(n); });
    while (thread.children.length > max) thread.firstElementChild.remove();
    thread.scrollTop = thread.scrollHeight;
    return nodes[nodes.length - 1];
  }
  const dots = '<span class="dots"><i></i><i></i><i></i></span>';

  /* The in-app assistant: the end user's helper, in the client's voice.
     It helps with the work in the app; it never changes the app itself. */
  async function askAssistant(lv, q, auto) {
    const br = lv.client.brand;
    const th = $('[data-athread]', lv.el);
    lv.asked = true;
    pushTo(th, userMsg(br, q));
    const wait = pushTo(th, asMsg(br, dots));
    await sleep(auto ? 700 : 650);
    const ql = q.toLowerCase();
    let html;
    if (/subject/.test(ql)) {
      html = `Three, in ${esc(br.placeholder ? 'their' : br.name + '’s')} voice:<ul>${br.subjects.map((s) => `<li><button type="button" data-use="${esc(s)}">${esc(s)}</button></li>`).join('')}</ul>`;
    } else if (/short|trim|tight|intro|length|long/.test(ql)) {
      lv.body = br.shorter;
      html = `Done — tightened the intro:<blockquote>${esc(br.shorter)}</blockquote>`;
      if (lv.step !== 2) setStep(lv, 2);
      else { const b = $('[data-body]', lv.el); if (b) { b.textContent = lv.body; flash(b); } }
    } else if (/brand|tone|voice|check/.test(ql)) {
      html = esc(br.onbrand);
    } else if (/preview/.test(ql)) {
      html = `Preview text: <blockquote>${esc(br.preview)}</blockquote>`;
    } else if (/step|add|remove|rebrand|make it for|colour|color|logo|wiring|build/.test(ql)) {
      html = `I can’t change the app itself — that’s done in the EAI builder, by whoever built it. I can help with the words: subject lines, length, tone.`;
    } else {
      html = `${esc(br.placeholder ? 'Once they’re named' : 'Here’s a start')}: <blockquote>${esc(br.shorter)}</blockquote>Want it shorter, or three subject lines to go with it?`;
    }
    wait.querySelector('.am-p').innerHTML = html;
    th.scrollTop = th.scrollHeight;
  }

  /* The builder chat: the maker's tool. It changes the app — brand,
     tone, wiring — and naming a client puts them into the loop. */
  const busy = new WeakSet();
  async function builderSay(lv, raw) {
    if (busy.has(lv)) return;
    const br = lv.client.brand;
    const th = $('[data-thread]', lv.el);
    const q = raw.trim();
    const ql = q.toLowerCase();
    pushTo(th, youMsg(esc(q)));
    const wait = pushTo(th, eaiMsg(dots));
    const say = (h, extra = '') => { wait.querySelector('p').innerHTML = h; if (extra) wait.querySelector('.bm-in').insertAdjacentHTML('beforeend', extra); th.scrollTop = th.scrollHeight; };
    await sleep(600);
    let name = null;
    const m = q.match(/(?:make|build|do|rebrand|skin|sell)\b.*?\bfor\s+(.+)$/i) || q.match(/^(?:for|now)\s+(.+)$/i);
    if (m) name = m[1];
    else if (/tone|warmer|friendlier|formal|voice|playful/.test(ql)) {
      say(`Tone set ${/formal/.test(ql) ? 'more formal' : 'warmer'} for ${esc(br.placeholder ? 'this client' : br.name)}. The AI writer and ${esc(br.placeholder ? 'their' : br.name + '’s')} assistant both pick it up. Still four steps.`);
      return;
    } else if (/step|approval|add|remove|fifth|5/.test(ql)) {
      say('Apps are exactly four steps — that’s the point. Review already is the approval, so I’ve added Jordan as a second approver there instead.', wireChips());
      return;
    } else if (/share|phone|qr|link/.test(ql)) {
      say(`Share link ready. Scan the QR and ${esc(br.placeholder ? 'their' : br.name + '’s')} app opens on a phone — same four steps.`, `<div class="bm-qr">${qrSVG('eai.app/' + br.name, '#111')}</div>`);
      return;
    } else if (q.split(/\s+/).length <= 4 && !/\?$/.test(q) && !/^(hi|hello|hey|thanks|help|what|how|why)\b/i.test(q)) {
      name = q;
    } else {
      say('I change the app — its steps, its brand, its wiring. Try “Make it for Qantas” or “Make the tone warmer”.');
      return;
    }
    name = name.replace(/[.!?]+$/, '').replace(/^(the|a)\s+/i, '').trim().slice(0, 40);
    if (!name) { say('Which client? Try “Make it for Qantas”.'); return; }
    const known = curated(name);
    const ex = clients.find((c) => !c.brand.placeholder && (c.brand === known || c.brand.name.toLowerCase() === name.toLowerCase()));
    if (ex) {
      say(`${esc(ex.brand.name)} is already in the loop — same app, their brand. Taking you there.`);
      setTimeout(() => { const i = levels.indexOf(ex.b); if (i === mod(Math.round(zt), levels.length)) step(1); else jumpToLevel(i); }, 700);
      return;
    }
    busy.add(lv);
    say(`Looking up ${esc(name)}…`);
    const brand = await lookup(name, (s) => say(esc(s) + '…'));
    say(`Read ${esc(brand.domain)} for colours, logo and tone. Same four steps, same wiring.`, swatchRow(brand));
    await sleep(700);
    busy.delete(lv);
    addClient(lv.client, brand);
  }

  // Put a client into the loop, then dive to them.
  function addClient(from, brand) {
    const L0 = levels.length;
    const zi = Math.round(tween ? tween.to : zt);
    const loop = Math.floor(zi / L0);
    const curLv = levels[mod(zi, L0)];
    tween = null;
    let target;
    if (from.brand.placeholder) {
      // fill the "your client" slot in place; a fresh slot waits after it
      from.brand = brand; from.kind = 'live';
      renderLevel(from.b); renderLevel(from.a);
      $('[data-thread]', from.b.el).innerHTML = builderThread(from);
      const fresh = { id: uid++, brand: YOURS, kind: 'invite' };
      clients.splice(clients.indexOf(from) + 1, 0, fresh);
      rebuildLevels();
      layout();
      z = zt = loop * levels.length + levels.indexOf(curLv);
      target = loop * levels.length + levels.indexOf(from.a);
      if (target <= z) target += levels.length;
    } else {
      const c = { id: uid++, brand, kind: 'live' };
      clients.splice(clients.indexOf(from) + 1, 0, c);
      rebuildLevels();
      layout();
      z = zt = loop * levels.length + levels.indexOf(curLv);
      target = loop * levels.length + levels.indexOf(c.b);
      if (target <= z) target += levels.length;
    }
    currentIdx = -1;
    render();
    setTimeout(() => goTo(target, REDUCED ? 0 : clamp(1300 * (target - z), 1500, 3200)), 250);
  }

  /* --------------------------------------------------------- the finale */
  function showFinale(loop) {
    $('#finK').textContent = loop > 1 ? `Loop ${loop} complete · still one build` : `Loop complete · one build, ${clients.filter((c) => !c.brand.placeholder).length} clients and counting`;
    finale.hidden = false;
    requestAnimationFrame(() => finale.classList.add('on'));
  }
  function hideFinale() {
    finale.classList.remove('on');
    setTimeout(() => { finale.hidden = true; }, 300);
  }
  $('#finKeep').addEventListener('click', () => { hideFinale(); step(1); });
  $('#finForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#finInput').value.trim();
    if (!v) return;
    $('#finInput').value = '';
    hideFinale();
    const lv = levels[mod(Math.round(zt), levels.length)];
    const b = lv.type === 'builder' ? lv : lv.client.b;
    builderSay(b, `Make it for ${v}`);
  });

  /* ------------------------------------------------- exit / enter the loop */
  function exitLoop(focusCta) {
    hideFinale();
    outside.hidden = false;
    requestAnimationFrame(() => document.body.classList.add('exited'));
    setTimeout(() => { outside.focus({ preventScroll: true }); if (focusCta) { const c = $('.out-btn', outside); if (c) c.focus({ preventScroll: true }); } }, 60);
  }
  function enterLoop() {
    document.body.classList.remove('exited');
    setTimeout(() => { if (!isOut()) outside.hidden = true; }, 600);
    stage.focus({ preventScroll: true });
  }
  $$('[data-exit]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); exitLoop(b.hasAttribute('data-cta')); }));
  $('#outBack').addEventListener('click', enterLoop);
  $('[data-home]').addEventListener('click', (e) => { e.preventDefault(); if (isOut()) enterLoop(); const L = levels.length; goTo(Math.floor(Math.round(zt) / L) * L); });
  $$('[data-jump]').forEach((b) => b.addEventListener('click', () => {
    if (isOut()) enterLoop();
    const j = b.dataset.jump;
    const idx = j === 'invite' ? levels.findIndex((l) => l.client.brand.placeholder && l.type === 'builder') : 1;
    if (idx >= 0) jumpToLevel(idx);
  }));
  $$('#cSteps [data-step]').forEach((b) => b.addEventListener('click', () => step(+b.dataset.step)));

  /* ------------------------------------------------------------- intro */
  let introDone = false;
  let introTimer = 0;
  const heroT = $('#heroT');
  function hideHero() {
    if (heroT.hidden || heroT.classList.contains('out')) return;
    heroT.classList.add('out');
    setTimeout(() => { heroT.hidden = true; }, 1300);
  }
  function finishIntro() {
    hideHero();
    if (introDone) return;
    introDone = true;
    clearTimeout(introTimer);
    const lv = levels[0];
    $('[data-thread]', lv.el).innerHTML = builderThread(lv.client);
    $('[data-chips]', lv.el).classList.remove('pending');
    $('input', lv.el).value = '';
    introReveal = 1;
    render();
  }
  async function intro() {
    const lv = levels[0];
    const th = $('[data-thread]', lv.el);
    const input = $('input', lv.el);
    const chips = $('[data-chips]', lv.el);
    if (REDUCED || params.has('static')) { finishIntro(); return; }
    th.innerHTML = eaiMsg('What are we building, and who for?');
    chips.classList.add('pending');
    introReveal = 0;
    render();
    heroT.hidden = false;
    await sleep(1700);
    hideHero();
    await sleep(500);
    const text = 'Build a campaign email app for Nike.';
    for (let i = 1; i <= text.length; i++) {
      if (introDone) return;
      input.value = text.slice(0, i);
      await sleep(26);
    }
    await sleep(260);
    if (introDone) return;
    input.value = '';
    pushTo(th, youMsg(text));
    const w = pushTo(th, eaiMsg(dots));
    await sleep(900);
    if (introDone) return;
    w.querySelector('p').innerHTML = 'Built. Exactly four steps, wired end to end:';
    w.querySelector('.bm-in').insertAdjacentHTML('beforeend', wireChips());
    // the preview builds in
    const t0 = performance.now();
    await new Promise((res) => {
      const f = (now) => { introReveal = clamp((now - t0) / 700, 0, 1); render(); if (introReveal < 1 && !introDone) requestAnimationFrame(f); else res(); };
      requestAnimationFrame(f);
    });
    await sleep(500);
    if (introDone) return;
    pushTo(th, eaiMsg('Read nike.com for colours, logo and voice.', swatchRow(BRANDS.nike)));
    chips.classList.remove('pending');
    introDone = true;
    introTimer = setTimeout(() => { if (!userActed && Math.round(zt) === 0) goTo(1, 2800); }, 1500);
  }

  /* ---------------------------------------------------------------- boot */
  function setReduced(v) {
    REDUCED = v;
    document.body.classList.toggle('reduced', REDUCED);
    $('#cSteps').hidden = !REDUCED;
    $('#cHint').hidden = REDUCED;
    render();
  }
  motionQuery.addEventListener('change', (e) => setReduced(e.matches || params.has('reduced')));

  rebuildLevels();
  document.body.classList.toggle('reduced', REDUCED);
  $('#cSteps').hidden = !REDUCED;
  $('#cHint').hidden = REDUCED;
  const start = parseFloat(params.get('level'));
  if (!Number.isNaN(start)) { z = zt = start; }
  layout();
  let rsz = 0;
  window.addEventListener('resize', () => { cancelAnimationFrame(rsz); rsz = requestAnimationFrame(layout); });
  const boot = () => {
    layout();
    document.body.classList.add('ready');
    if (Number.isNaN(start)) intro(); else finishIntro();
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else boot();

  // For recordings and tests.
  window.__loop = { goTo, step, get z() { return z; }, levels: () => levels, addClient: (n) => builderSay(levels[mod(Math.round(zt), levels.length)].type === 'builder' ? levels[mod(Math.round(zt), levels.length)] : levels[mod(Math.round(zt), levels.length)].client.b, 'Make it for ' + n) };
})();
