/* Remix 03 — The multiplier.
   Concept: make the economics of "sell to many" physical. One app card sits
   alone in the hero, then divides — 2, 4, 8 … 64 — and every copy flies out
   into a pannable, zoomable wall and "stamps" itself in a different client's
   brand. A ticker counts clients and dollars as they land. Below, a
   calculator turns the same idea into numbers (rolling digits, live wall of
   tiles), a sentence drops a new client into the wall (live brand lookup,
   same approach as sell.js), the four steps light up across every copy at
   once, three assistants answer in three voices, and a phone shows the share.
*/
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const fmt = (n) => Math.round(n).toLocaleString('en-AU');
  if (REDUCED) document.body.classList.add('no-roll');

  /* =====================================================================
     Brands
     ===================================================================== */
  const FONT = {
    grot: "'Bricolage Grotesque', system-ui, sans-serif",
    serif: "'Fraunces', Georgia, serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
    sys: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    helv: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  };
  const SWOOSH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 7.8 6.442 15.276c-1.456.616-2.679.925-3.668.925-1.11 0-1.922-.392-2.437-1.177-.317-.503-.4-1.152-.25-1.947.152-.795.532-1.643 1.14-2.543.505-.75 1.371-1.708 2.6-2.874-.365.615-.766 1.395-1.084 2.155-.55 1.32-.68 2.4-.394 3.24.13.375.365.65.68.83.36.2.83.29 1.41.29.44 0 .93-.06 1.47-.18L24 7.8Z" fill="currentColor"/></svg>';
  const APPLE = '<svg viewBox="150 100 500 560" aria-hidden="true"><path fill="currentColor" d="M584.8426,276.8632c-2.3411,1.4432-53.8358,31.4239-53.251,93.7952c0.6472,74.6027,65.3989,99.4457,66.1427,99.7276c-0.58,1.7759-10.3524,35.3838-34.1321,70.0925c-20.5507,30.0693-41.8387,59.968-75.4384,60.5922c-33.0098,0.6046-43.6489-19.5858-81.3589-19.5858c-37.7331,0-49.5436,18.9615-80.7596,20.1904c-32.4307,1.227-57.1214-32.4709-77.8236-62.3746c-42.3212-61.1983-74.679-172.9508-31.23-248.3679c21.5705-37.4546,60.1253-61.1835,101.9581-61.7964c31.8589-0.6021,61.9044,21.4174,81.3918,21.4174c19.209,0,53.636-25.6686,94.2163-22.6665C510.4626,229.066,555.6122,233.8129,584.8426,276.8632z M469.5186,187.488c17.2347-20.8293,28.8305-49.8377,25.6375-78.6904c-24.8053,0.9837-54.8058,16.5229-72.5975,37.339c-15.9324,18.4398-29.925,47.9732-26.1259,76.237C424.0806,224.5099,452.2985,208.3302,469.5186,187.488z"/></svg>';
  const CBA = '<img src="../../logos/commbank.svg" alt="" />';

  function rgbOf(hex) {
    const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function lum(hex) {
    const ch = rgbOf(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }
  function hslOf(hex) {
    const [r, g, b] = rgbOf(hex).map((v) => v / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
    return { s: d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1)), l };
  }
  const inkFor = (hex) => (lum(hex) > 0.42 ? '#16130F' : '#FFFFFF');
  function mix(hex, amt) {
    const c = rgbOf(hex).map((v) => Math.round(255 - (255 - v) * amt));
    return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  }
  function hash(s) { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }
  const mg = (letters, style) => `<span class="mg m-${style}"><span>${esc(letters)}</span></span>`;
  const initials = (name) => name.replace(/&/g, ' ').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  function make(o) {
    const b = o.b || o.h;
    return Object.assign({
      ho: inkFor(o.h), b, bo: inkFor(b), f: FONT[o.font || 'grot'],
      s: mix(b, 0.08), bd: mix(b, 0.28),
      mark: mg(o.mono || initials(o.name), o.style || 'circle'),
      audience: `${o.name} customers`, date: '28 October',
    }, o, { b, f: FONT[o.font || 'grot'] });
  }

  // Hand-checked brands (colours and voice from the brief).
  const NIKE = make({
    key: 'nike', name: 'Nike', domain: 'nike.com', h: '#FA5400', b: '#FA5400', font: 'helv', mark: SWOOSH,
    line: 'Pegasus 41 is here. Go.', tone: 'Direct, urgent, athlete-first',
    goal: 'Launch the Pegasus 41…', audience: 'Nike Run Club members', date: '3 October',
    body: 'The Pegasus 41 is here — lighter, faster, ready for your next PB. Run Club members get first access this week.', cta: 'Shop now',
    files: ['nike-brand-guide.pdf', 'tone-of-voice.docx', 'pegasus-41-shots.zip'],
  });
  const APPLE_B = make({
    key: 'apple', name: 'Apple', domain: 'apple.com', h: '#1D1D1F', b: '#0071E3', font: 'sys', mark: APPLE,
    line: 'Say hello to the new iPhone.', tone: 'Simple, confident, understated',
    goal: 'Introduce the new iPhone…', audience: 'Apple Store customers', date: '9 October',
    body: 'Introducing the new iPhone. Our most advanced camera yet, in a design you’ll love to hold.', cta: 'Learn more',
    files: ['apple-brand-guidelines.pdf', 'voice-and-tone.docx', 'iphone-product-shots.zip'],
  });
  const CBA_B = make({
    key: 'commbank', name: 'CommBank', domain: 'commbank.com.au', h: '#000000', b: '#FFCC00', font: 'sys', mark: CBA,
    line: 'Your Yello rewards are here.', tone: 'Clear, helpful, reassuring',
    goal: 'Launch Yello rewards for everyday accounts…', audience: 'CommBank app customers', date: '16 October',
    body: 'Earn Yello rewards on your everyday account. See your offers in the CommBank app — no sign-up needed.', cta: 'See my offers',
    files: ['commbank-brand-guide.pdf', 'yello-offers.xlsx', 'app-screens.zip'],
  });
  const CURATED = { nike: NIKE, apple: APPLE_B, commbank: CBA_B };
  const ALIASES = { 'commonwealth bank': 'commbank', 'commonwealth bank of australia': 'commbank', cba: 'commbank', 'commbank.com.au': 'commbank', 'apple.com': 'apple', 'nike.com': 'nike' };
  const curated = (raw) => { const k = raw.trim().toLowerCase().replace(/\s+/g, ' '); return CURATED[k] || CURATED[ALIASES[k]] || null; };

  // Invented clients — the kind an agency actually sells to.
  const HAND = [
    ['Saltbush Coffee', '#6B3E26', 'serif', 'circle', 'Your first flat white of spring is on us.', 'Warm, local, unhurried'],
    ['Harbour Line Dental', '#0E7C86', 'grot', 'ring', 'Six months since your last clean. Book in.', 'Calm, clear, reassuring'],
    ['Kestrel Surf', '#00A6D6', 'grot', 'slab', 'Swell’s up this weekend. So is the sale.', 'Loose, sunny, stoked'],
    ['Ironbark Legal', '#1F3A2E', 'serif', 'square', 'Buying your first home? Here’s what to check.', 'Measured, expert, plain'],
    ['Pip & Pantry', '#F2B8C6', 'grot', 'circle', 'Lunchboxes, sorted for the whole term.', 'Cheerful, practical'],
    ['Northgate Realty', '#C8102E', 'sys', 'square', 'Three new listings in your street this week.', 'Confident, local, quick'],
    ['Moonah Pilates', '#9A8CFF', 'serif', 'circle', 'Your reformer spot is saved for Thursday.', 'Gentle, encouraging'],
    ['Copperline Electrical', '#D9731F', 'mono', 'diamond', 'Solar rebates close 30 June. Let’s get you in.', 'Straight-talking, handy'],
    ['Blue Heeler Vets', '#2350A5', 'grot', 'circle', 'Tick season is here. Is Max protected?', 'Caring, practical'],
    ['Fern & Fig', '#2F7D4F', 'serif', 'ring', 'Mother’s Day orders close Thursday.', 'Soft, seasonal, warm'],
    ['Rowdy Brewing', '#FFB000', 'grot', 'slab', 'New hazy IPA. Tap room, Friday.', 'Loud, cheeky, fun'],
    ['Southerly Air', '#5B2C83', 'sys', 'diamond', 'Fly south for winter. Hobart from $89.', 'Bright, breezy, clear'],
    ['Lumen Optometry', '#00B2A9', 'grot', 'ring', 'Your eyes called. They’d like a check-up.', 'Friendly, witty'],
    ['Grove Grocer', '#7AB800', 'grot', 'circle', 'Seasonal box: mandarins, leeks and more.', 'Fresh, homely'],
    ['Nimbus Super', '#3C1E73', 'sys', 'square', 'Your super, explained on one page.', 'Clear, calm, trustworthy'],
    ['Paperbark Books', '#B5462E', 'serif', 'slab', 'Our staff picks for the long weekend.', 'Bookish, warm, curious'],
    ['Brightside Physio', '#FF7AA2', 'grot', 'circle', 'Sore back after gardening? We have a spot.', 'Upbeat, caring'],
    ['Cinder Pizza', '#D7261E', 'grot', 'slab', 'Two-for-one Tuesdays are back.', 'Hungry, playful'],
    ['Quokka Kids', '#FFC629', 'grot', 'circle', 'School holiday camps: 12 spots left.', 'Playful, reassuring'],
    ['Meridian Accounting', '#20394D', 'serif', 'square', 'Tax time, minus the shoebox of receipts.', 'Dry, clever, precise'],
    ['Velo Cycles', '#00C389', 'mono', 'ring', 'Service your bike before the spring rides.', 'Sporty, crisp'],
    ['Olive & Oak', '#6E7F3A', 'serif', 'circle', 'Winter textures for every room.', 'Considered, calm, premium'],
    ['Clearwater Pools', '#00A3E0', 'sys', 'circle', 'Summer’s close. Is your pool ready?', 'Helpful, sunny'],
    ['Summit Insurance', '#0033A0', 'sys', 'diamond', 'Storm season: check your cover in two minutes.', 'Steady, plain, protective'],
    ['Dusk Wine Bar', '#3B0D2E', 'serif', 'ring', 'New Barossa reds on the list.', 'Moody, relaxed'],
    ['Kiln Studio', '#E2725B', 'serif', 'square', 'Wheel classes for beginners. Six weeks.', 'Crafty, warm'],
    ['Coastal Credit Union', '#00857C', 'sys', 'square', 'A better rate on your savings, today.', 'Member-first, clear'],
    ['Sprout Childcare', '#62BB46', 'grot', 'circle', 'Enrolments open for 2027.', 'Nurturing, clear'],
  ].map(([name, h, font, style, line, tone]) => make({ name, h, font, style, line, tone }));

  const PREFIX = ['Granite', 'Banksia', 'Kookaburra', 'Silverleaf', 'Riverbend', 'Lantern', 'Blackwood', 'Coral', 'Juniper', 'Marlin', 'Sandstone', 'Wren', 'Harlow', 'Ember', 'Pinnacle', 'Mallee', 'Driftwood', 'Orchard', 'Hazel', 'Ridge', 'Lagoon', 'Mint', 'Sable', 'Aurora', 'Jarrah', 'Tern', 'Pelican', 'Bellbird', 'Magpie', 'Spinifex', 'Boab', 'Currawong', 'Yarra', 'Derwent', 'Fitzroy', 'Kingfisher', 'Parkline', 'Sunday', 'Goodwin', 'Arlo', 'Frankie', 'Tallow', 'Redgum', 'Hearth', 'Bondi', 'Wattle', 'Ledger', 'Tidewater', 'Atlas', 'Moss'];
  const IND = [
    ['Coffee', ['Cold brew is back from Monday.', 'Your tenth coffee is on us.']],
    ['Dental', ['Smile. Your check-up takes 30 minutes.', 'Book a clean before the holidays.']],
    ['Physio', ['New: rehab classes on Thursdays.', 'Back to running, the right way.']],
    ['Realty', ['What’s your home worth this spring?', 'Open homes this Saturday.']],
    ['Legal', ['Your will, sorted in one visit.', 'Your lease review, done by Friday.']],
    ['Fitness', ['Your first week is free. No lock-in.', 'New 6am class. Bring a friend.']],
    ['Brewing', ['Our winter stout is pouring now.', 'Trivia night is back.']],
    ['Florist', ['Native bunches, delivered today.', 'Wedding season: book a tasting.']],
    ['Bakery', ['Hot cross buns are back. Get in early.', 'Sourdough class this Saturday.']],
    ['Motors', ['Your service is due at 60,000 km.', 'Test drive the new hybrid this week.']],
    ['Accounting', ['BAS due soon. We’ve got it.', 'End of year, without the stress.']],
    ['Travel', ['Your Bali escape, sorted.', 'Early-bird Europe fares open today.']],
    ['Vets', ['Puppy school starts next month.', 'Vaccines due for Luna.']],
    ['Studio', ['New prints, just in.', 'Brand refresh? Let’s talk.']],
    ['Wines', ['Cellar door open late Fridays.', 'The 2024 shiraz has landed.']],
    ['Cycles', ['Group ride leaves 6am Sunday.', 'E-bikes: test one this week.']],
    ['Insurance', ['One policy for home and car.', 'Renew in under a minute.']],
    ['Solar', ['Halve your power bill this summer.', 'Add a battery, keep the lights on.']],
    ['Salon', ['Book your summer colour before the rush.', 'New stylist, same care.']],
    ['Plumbing', ['Hot water gone cold? Same-day fix.', 'Winter check for your pipes.']],
    ['Pilates', ['Intro pack: three classes, $49.', 'Mat classes now on Sundays.']],
    ['Books', ['Author night: Thursday, 7pm.', 'Gift cards for the book lover.']],
    ['Kids', ['Swim lessons: term four is open.', 'Birthday parties, handled.']],
    ['Interiors', ['Free design consult this month.', 'New linen, in six colours.']],
    ['Health', ['Flu shots are in. Book online.', 'Same-day appointments, every day.']],
    ['Tours', ['Sunrise tours are back.', 'Whale season starts in June.']],
  ];
  const PAL = ['#E4002B', '#0B3D91', '#00A6D6', '#1F3A2E', '#C8102E', '#9A8CFF', '#D9731F', '#2350A5', '#2F7D4F', '#FFB000', '#5B2C83', '#00B2A9', '#7AB800', '#F15A22', '#3C1E73', '#B5462E', '#FF7AA2', '#004E7C', '#FFC629', '#20394D', '#00C389', '#6E7F3A', '#8B1E1E', '#00A3E0', '#C0602B', '#F0A202', '#E2725B', '#0033A0', '#3B0D2E', '#62BB46', '#00857C', '#16130F', '#FF5CAA', '#14B8A6', '#A3E635', '#EA580C', '#7C3AED', '#0EA5E9'];
  const TONES = ['Warm, local, friendly', 'Calm, clear, expert', 'Bold, short, energetic', 'Friendly, plain, helpful', 'Crisp, confident, premium', 'Playful, upbeat, cheeky'];
  const STYLES = ['circle', 'square', 'ring', 'diamond', 'slab'];
  const FONTS = ['grot', 'grot', 'serif', 'sys', 'serif', 'mono', 'sys', 'grot'];

  const ORDER = [NIKE, APPLE_B, CBA_B].concat(HAND);
  const genCache = [];
  function brandAt(i) {
    if (i < ORDER.length) return ORDER[i];
    const j = i - ORDER.length;
    if (genCache[j]) return genCache[j];
    const P = PREFIX.length;
    const pre = PREFIX[j % P];
    const ind = IND[(j * 7 + Math.floor(j / P) * 3) % IND.length];
    const h = hash(pre + ind[0]);
    const b = make({
      name: `${pre} ${ind[0]}`, h: PAL[(j * 5 + (h % 7)) % PAL.length], font: FONTS[h % FONTS.length],
      style: STYLES[(h >>> 3) % STYLES.length], line: ind[1][(h >>> 5) % 2], tone: TONES[(h >>> 7) % TONES.length],
    });
    genCache[j] = b;
    return b;
  }

  function varsFor(br) {
    return `--h:${br.h};--ho:${br.ho};--b:${br.b};--bo:${br.bo};--f:${br.f};--s:${br.s};--bd:${br.bd}`;
  }
  const STEP_NAMES = ['Brief', 'Assets', 'Compose', 'Review'];
  const STEP_WIRES = ['Form', 'Data source', 'AI writer', 'Approval'];

  /* =====================================================================
     Rolling-digit odometers
     ===================================================================== */
  const STRIP = '<span class="od-s">' + '0123456789'.split('').map((d) => `<span>${d}</span>`).join('') + '</span>';
  function odo(el) {
    const prefix = el.dataset.prefix || '', suffix = el.dataset.suffix || '', pad = +el.dataset.pad || 0;
    let pattern = null, value = null;
    function set(v) {
      if (v === value) return;
      value = v;
      let num = fmt(Math.abs(v));
      if (pad) num = String(Math.round(Math.abs(v))).padStart(pad, '0');
      const str = (v < 0 ? '−' : '') + prefix + num + suffix;
      el.setAttribute('aria-label', str);
      const pat = str.replace(/\d/g, '9');
      if (pat !== pattern) {
        pattern = pat;
        el.innerHTML = str.split('').map((c) => (/\d/.test(c) ? `<span class="od-c" aria-hidden="true">${STRIP}</span>` : `<span class="od-x" aria-hidden="true">${esc(c)}</span>`)).join('');
        void el.offsetWidth;
      }
      const strips = el.querySelectorAll('.od-s');
      let k = 0;
      for (const c of str) {
        if (/\d/.test(c)) { strips[k].style.transform = `translateY(${-10 * +c}%)`; k++; }
      }
    }
    return { set };
  }

  /* =====================================================================
     Shared state (calculator drives the hero ticker too)
     ===================================================================== */
  const state = { hours: 60, clients: 24, price: 6000 };
  const RATE = 150, RESKIN = 1;

  /* =====================================================================
     1. Hero wall
     ===================================================================== */
  const vp = $('wallVp'), wall = $('wall'), par = $('wallPar'), hero = $('hero');
  const againBtn = $('againBtn');
  const PX = 232, PY = 162, MAX = 256;
  const SLOTS = [];
  for (let r = -16; r <= 16; r++) {
    for (let c = -22; c <= 22; c++) {
      const x = c * PX, y = r * PY;
      SLOTS.push({ x, y, d: (x / 1.45) ** 2 + y * y + (hash(`${r},${c}`) % 900) });
    }
  }
  SLOTS.sort((a, b) => a.d - b.d);

  const cards = [];
  const cam = { x: 0, y: 0, s: 1 }, tcam = { x: 0, y: 0, s: 1 };
  const mobile = () => window.innerWidth <= 720;

  function cardHTML(br, i) {
    const act = i === 0 ? 2 : hash(br.name) % 4;
    const steps = STEP_NAMES.map((n, k) => `<i class="${k === act ? 'on' : ''}">${n}</i>`).join('');
    return `<div class="c-in"><div class="c-face c-front">` +
      `<div class="c-hd"><span class="c-mark">${br.mark}</span><span class="c-name">${esc(br.name)}</span><span class="c-app">EMAIL</span></div>` +
      `<div class="c-bd"><div class="c-line">${esc(br.line)}</div><div class="c-steps">${steps}</div>` +
      `<div class="c-ai"><b>✦</b><span>Ask the ${esc(br.name)} assistant</span></div></div></div></div>`;
  }
  function backHTML(br) {
    return `<div class="c-face c-back"><span class="cb-t">SAME FOUR STEPS</span><ol>` +
      STEP_NAMES.map((n, k) => `<li><span>${k + 1}</span>${n}<small>${STEP_WIRES[k]}</small></li>`).join('') +
      `</ol><div class="cb-ai"><b>✦ ${esc(br.name)} assistant · for ${esc(br.name)}’s team</b>Want three more subject lines, in ${esc(br.name)}’s voice?</div></div>`;
  }
  function logoFallback(root, br) {
    root.querySelectorAll('.c-mark img').forEach((img) => {
      img.addEventListener('error', () => { const m = img.closest('.c-mark'); if (m) m.innerHTML = mg(initials(br.name), 'circle'); }, { once: true });
    });
  }
  function newCard(br, idx) {
    const el = document.createElement('div');
    el.className = 'card';
    el.style.cssText = varsFor(br);
    el.innerHTML = cardHTML(br, idx);
    logoFallback(el, br);
    const slot = SLOTS[idx];
    el.style.transform = `translate(${slot.x}px, ${slot.y}px)`;
    wall.appendChild(el);
    const c = { el, br, slot };
    el.__c = c;
    cards.push(c);
    return c;
  }

  // Camera
  function vpBox() {
    const W = vp.clientWidth, H = vp.clientHeight;
    if (mobile()) return { x0: 14, x1: W - 14, y0: 30, y1: H - 20 };
    const tk = document.querySelector('.ticker').offsetHeight;
    return { W, H, x0: W * 0.43, x1: W - 50, y0: 40, y1: H - tk - 40 };
  }
  function fitTo(count, instant) {
    const box = vpBox();
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < count; i++) {
      const s = SLOTS[i];
      minX = Math.min(minX, s.x - 104); maxX = Math.max(maxX, s.x + 108);
      minY = Math.min(minY, s.y - 92); maxY = Math.max(maxY, s.y + 74);
    }
    let x0 = box.x0, x1 = box.x1;
    // A big wall spills under the headline and off the edge: it should feel huge.
    if (!mobile() && count > 24) { const W = vp.clientWidth; x0 = W * 0.2; x1 = W * 1.06; }
    const bw = maxX - minX, bh = maxY - minY;
    let s = Math.min((x1 - x0) / bw, (box.y1 - box.y0) / bh, count === 1 ? 1.5 : 1.15);
    s = Math.max(s, mobile() ? 0.3 : 0.5);
    tcam.s = s;
    tcam.x = (x0 + x1) / 2 - ((minX + maxX) / 2) * s;
    tcam.y = (box.y0 + box.y1) / 2 - ((minY + maxY) / 2) * s;
    if (instant) Object.assign(cam, tcam);
    kick();
  }

  let dragging = false, userMoved = false;
  let parX = 0, parY = 0, tparX = 0, tparY = 0;
  let raf = 0;
  function frame() {
    raf = 0;
    let moving = false;
    if (!dragging) {
      for (const k of ['x', 'y', 's']) {
        const d = tcam[k] - cam[k];
        if (Math.abs(d) > (k === 's' ? 0.0005 : 0.2)) { cam[k] += d * 0.1; moving = true; } else cam[k] = tcam[k];
      }
    }
    const dx = tparX - parX, dy = tparY - parY;
    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) { parX += dx * 0.08; parY += dy * 0.08; moving = true; }
    applyCam();
    if (moving) kick();
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  function applyCam() {
    wall.style.transform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.s})`;
    const sy = mobile() ? 0 : Math.min(window.scrollY, 1000) * 0.18;
    par.style.transform = `translate(${parX}px, ${parY + sy}px)`;
    vp.style.backgroundPosition = `${cam.x + parX}px ${cam.y + parY + sy}px`;
    vp.style.backgroundSize = `${26 * cam.s}px ${26 * cam.s}px`;
  }
  function zoomAt(px, py, factor) {
    const s2 = Math.max(0.22, Math.min(2.4, tcam.s * factor));
    const wx = (px - tcam.x) / tcam.s, wy = (py - tcam.y) / tcam.s;
    tcam.s = s2; tcam.x = px - wx * s2; tcam.y = py - wy * s2;
    userMoved = true;
    kick();
  }

  // Drag to pan, pinch to zoom
  const ptrs = new Map();
  let pinch0 = 0, pinchS = 1;
  vp.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    vp.setPointerCapture(e.pointerId);
    if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()];
      pinch0 = Math.hypot(a.x - b.x, a.y - b.y); pinchS = cam.s;
    }
  });
  vp.addEventListener('pointermove', (e) => {
    const p = ptrs.get(e.pointerId);
    const r = vp.getBoundingClientRect();
    if (!mobile() && e.pointerType === 'mouse') {
      tparX = -((e.clientX - r.left) / r.width - 0.5) * 30;
      tparY = -((e.clientY - r.top) / r.height - 0.5) * 20;
      kick();
    }
    if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    if (ptrs.size === 2) {
      p.x = e.clientX; p.y = e.clientY;
      const [a, b] = [...ptrs.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch0) {
        const cx = (a.x + b.x) / 2 - r.left, cy = (a.y + b.y) / 2 - r.top;
        zoomAt(cx, cy, (pinchS * d / pinch0) / tcam.s);
        Object.assign(cam, tcam);
      }
      return;
    }
    if (!dragging && Math.hypot(dx, dy) < 4) return;
    if (!dragging) { dragging = true; vp.classList.add('dragging'); unflipAll(); }
    p.x = e.clientX; p.y = e.clientY;
    cam.x += dx; cam.y += dy; tcam.x = cam.x; tcam.y = cam.y; tcam.s = cam.s;
    userMoved = true;
    applyCam();
  });
  function endPtr(e) {
    ptrs.delete(e.pointerId);
    if (ptrs.size < 2) pinch0 = 0;
    if (!ptrs.size) { dragging = false; vp.classList.remove('dragging'); }
  }
  vp.addEventListener('pointerup', endPtr);
  vp.addEventListener('pointercancel', endPtr);
  vp.addEventListener('pointerleave', () => { tparX = 0; tparY = 0; kick(); });
  vp.addEventListener('wheel', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    const r = vp.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.01));
  }, { passive: false });
  $('zoomIn').addEventListener('click', () => zoomAt(vp.clientWidth * 0.66, vp.clientHeight * 0.42, 1.3));
  $('zoomOut').addEventListener('click', () => zoomAt(vp.clientWidth * 0.66, vp.clientHeight * 0.42, 1 / 1.3));
  $('zoomFit').addEventListener('click', () => { userMoved = false; fitTo(cards.length); });
  window.addEventListener('scroll', () => { if (window.scrollY < 1200) kick(); }, { passive: true });
  window.addEventListener('resize', () => { if (!userMoved) fitTo(cards.length, true); });

  // Hover a card to flip it (back face built on first flip).
  function flip(c, on) {
    if (on && !c.el.querySelector('.c-back')) { c.el.querySelector('.c-in').insertAdjacentHTML('beforeend', backHTML(c.br)); }
    c.el.classList.toggle('flip', on);
  }
  function unflipAll() { wall.querySelectorAll('.card.flip').forEach((el) => el.classList.remove('flip')); }
  wall.addEventListener('pointerover', (e) => {
    if (dragging || e.pointerType === 'touch') return;
    const el = e.target.closest('.card');
    if (el && !el.contains(e.relatedTarget)) flip(el.__c, true);
  });
  wall.addEventListener('pointerout', (e) => {
    const el = e.target.closest('.card');
    if (el && !el.contains(e.relatedTarget)) flip(el.__c, false);
  });
  wall.addEventListener('click', (e) => {
    const el = e.target.closest('.card');
    if (el && !dragging) flip(el.__c, !el.classList.contains('flip'));
  });

  // Ticker
  const oClients = odo($('odoClients')), oMoney = odo($('odoMoney')), oScratch = odo($('odoScratch'));
  let landed = 1;
  function ticker() {
    oClients.set(landed);
    oMoney.set(landed * state.price);
    oScratch.set(landed * state.hours);
    $('tkOnce').textContent = fmt(state.hours + (landed - 1) * RESKIN);
    $('tkAt').textContent = `at $${fmt(state.price)} each`;
  }

  // Mitosis: every card divides; the copy flies to its slot and stamps its brand.
  let busy = false;
  async function multiply() {
    if (busy) return;
    const n = cards.length;
    const total = Math.min(n * 2, MAX);
    if (total === n) return;
    busy = true;
    if (!userMoved) fitTo(total);
    const births = [];
    for (let k = n; k < total; k++) {
      const parent = cards[k - n];
      const c = newCard(brandAt(k), k);
      if (REDUCED) { landed++; continue; }
      c.el.classList.add('blank');
      c.el.style.zIndex = 0;
      const delay = ((k - n) / Math.max(1, total - n)) * 380 + Math.random() * 60;
      const from = `translate(${parent.slot.x}px, ${parent.slot.y}px) scale(.92)`;
      const to = `translate(${c.slot.x}px, ${c.slot.y}px)`;
      const a = c.el.animate([{ transform: from }, { transform: to }], { duration: 620, delay, easing: 'cubic-bezier(.2,.9,.25,1.12)', fill: 'backwards' });
      parent.el.animate([{ transform: `translate(${parent.slot.x}px, ${parent.slot.y}px) scale(1)` }, { transform: `translate(${parent.slot.x}px, ${parent.slot.y}px) scale(1.07)` }, { transform: `translate(${parent.slot.x}px, ${parent.slot.y}px) scale(1)` }], { duration: 360, delay: Math.max(0, delay - 60), easing: 'ease-out' });
      births.push(a.finished.then(() => {
        c.el.style.zIndex = '';
        c.el.classList.remove('blank');
        c.el.classList.add('stamp');
        landed++;
        ticker();
      }).catch(() => {}));
    }
    ticker();
    await Promise.all(births);
    busy = false;
    syncAgain();
  }
  function syncAgain() {
    const n = cards.length;
    if (n >= MAX) againBtn.innerHTML = 'Start over <span class="x mono">↺</span>';
    else againBtn.innerHTML = `Sell it again <span class="x mono">×2</span>`;
  }
  async function startOver() {
    busy = true;
    const origin = cards[0];
    const gone = cards.splice(1);
    const outs = gone.map((c, i) => {
      if (REDUCED) { c.el.remove(); return Promise.resolve(); }
      const a = c.el.animate([
        { transform: `translate(${c.slot.x}px, ${c.slot.y}px)`, opacity: 1 },
        { transform: `translate(${origin.slot.x}px, ${origin.slot.y}px) scale(.6)`, opacity: 0 },
      ], { duration: 520, delay: (1 - i / gone.length) * 260, easing: 'cubic-bezier(.6,0,.8,.4)', fill: 'forwards' });
      return a.finished.then(() => c.el.remove()).catch(() => c.el.remove());
    });
    landed = 1;
    userMoved = false;
    fitTo(1);
    ticker();
    await Promise.all(outs);
    busy = false;
    syncAgain();
    await sleep(350);
    for (let g = 0; g < 6; g++) { await multiply(); await sleep(120); }
  }
  againBtn.addEventListener('click', () => {
    if (busy) return;
    if (cards.length >= MAX) startOver();
    else multiply();
  });

  // Add a single named client to the wall (from the rebrand section).
  function addToWall(br) {
    if (cards.length >= MAX) return;
    const k = cards.length;
    const c = newCard(br, k);
    c.el.classList.add('fresh');
    landed++;
    ticker();
    if (!userMoved) fitTo(cards.length);
    syncAgain();
  }

  async function intro() {
    newCard(NIKE, 0).el.classList.add('origin');
    fitTo(1, true);
    ticker();
    applyCam();
    if (REDUCED) {
      for (let g = 0; g < 6; g++) await multiply();
      fitTo(cards.length, true);
      return;
    }
    await sleep(900);
    for (let g = 0; g < 6; g++) { await multiply(); await sleep(140); }
  }

  /* =====================================================================
     2. The maths
     ===================================================================== */
  const sH = $('sHours'), sC = $('sClients'), sP = $('sPrice');
  const oRev = odo($('odoRev')), oSaved = odo($('odoSaved')), oMargin = odo($('odoMargin')), oPct = odo($('odoPct'));
  const mini = $('miniWall');
  const tiles = [];
  for (let i = 0; i < 200; i++) {
    const br = brandAt(i);
    const t = document.createElement('span');
    t.className = 'mt' + (i === 0 ? ' first' : '');
    t.style.cssText = varsFor(br);
    t.textContent = br.name[0];
    t.title = br.name;
    mini.appendChild(t);
    tiles.push(t);
  }
  let shownTiles = 0;
  function calc() {
    state.hours = +sH.value; state.clients = +sC.value; state.price = +sP.value;
    for (const s of [sH, sC, sP]) s.style.setProperty('--p', ((s.value - s.min) / (s.max - s.min)) * 100 + '%');
    $('vHours').textContent = `${state.hours} hrs`;
    $('vClients').textContent = state.clients;
    $('vPrice').textContent = `$${fmt(state.price)}`;
    const rev = state.clients * state.price;
    const scratch = state.clients * state.hours;
    const once = state.hours + (state.clients - 1) * RESKIN;
    oRev.set(rev);
    $('vScratch').textContent = `${fmt(scratch)} hrs`;
    $('vOnce').textContent = `${fmt(once)} hrs`;
    const mx = Math.max(scratch, once);
    $('barScratch').style.width = (scratch / mx) * 100 + '%';
    $('barOnce').style.width = Math.max(1.5, (once / mx) * 100) + '%';
    oSaved.set(Math.max(0, scratch - once));
    oMargin.set(rev - once * RATE);
    oPct.set(Math.round(((rev - once * RATE) / rev) * 100));
    const scratchPct = Math.round(((rev - scratch * RATE) / rev) * 100);
    document.querySelector('#odoPct + .delta-l').textContent = `margin — from scratch, ${scratchPct < 0 ? '−' : ''}${Math.abs(scratchPct)}%`;
    const n = state.clients;
    tiles.forEach((t, i) => {
      const on = i < n;
      if (on !== t.classList.contains('on')) {
        t.style.transitionDelay = REDUCED ? '0ms' : Math.min(400, Math.abs(i - (on ? shownTiles : n)) * 6) + 'ms';
        t.classList.toggle('on', on);
      }
    });
    shownTiles = n;
    ticker();
  }
  [sH, sC, sP].forEach((s) => s.addEventListener('input', calc));

  /* =====================================================================
     3. Rebrand in a sentence (live lookup, same approach as sell.js)
     ===================================================================== */
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
  function pickPrimary(logoPal, imagePal) {
    const ok = (hex) => { const { s, l } = hslOf(hex); return s > 0.35 && l > 0.18 && l < 0.72; };
    const bySat = (a, b) => hslOf(b).s - hslOf(a).s;
    const fromLogo = logoPal.filter(ok).sort(bySat)[0];
    if (fromLogo) return fromLogo;
    const dark = logoPal.filter((h) => hslOf(h).l < 0.3).sort((a, b) => hslOf(a).l - hslOf(b).l)[0];
    if (dark) return dark;
    return imagePal.filter(ok).sort(bySat)[0] || '#1D1D1F';
  }
  function liveBrand(found, primary, logoUrl, about) {
    const short = found.name.replace(/\s+(of|pty|ltd|inc|limited|group|corporation|corp)\b.*$/i, '').trim();
    primary = primary.toUpperCase();
    const tone = (about || '').replace(/\s+/g, ' ').trim();
    const o = {
      name: short, domain: found.domain, h: primary, font: 'sys', live: true, logoUrl,
      line: `What’s new at ${short}, picked for you.`,
      tone: tone ? (tone.length > 60 ? tone.slice(0, 58).replace(/\s+\S*$/, '') + '…' : tone) : 'Read live from their site',
      goal: `Announce what’s new at ${short}…`,
    };
    if (logoUrl) o.mark = `<span class="chip"><img src="${esc(logoUrl)}" alt="" referrerpolicy="no-referrer" /></span>`;
    return make(o);
  }
  async function viaMicrolink(found) {
    const url = `https://api.microlink.io/?url=${encodeURIComponent('https://' + found.domain)}&palette=true&prerender=false`;
    const json = await fetch(url, { signal: withTimeout(12000) }).then((r) => r.json());
    if (json.status !== 'success') throw new Error('lookup failed');
    const d = json.data;
    const logoPal = (d.logo && d.logo.palette) || [];
    const imagePal = (d.image && d.image.palette) || [];
    return liveBrand(found, pickPrimary(logoPal, imagePal), d.logo && d.logo.url, d.description || d.title);
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
          res(liveBrand(found, pickPrimary(pal, []), src, ''));
        } catch (e) { rej(e); }
      };
      img.src = src;
    });
  }
  function guessBrand(raw) {
    const name = raw.trim().replace(/\s+/g, ' ');
    const h = hash(name.toLowerCase());
    return make({
      name, domain: name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com', h: PAL[h % PAL.length],
      font: FONTS[h % FONTS.length], style: STYLES[h % STYLES.length],
      line: `What’s new at ${name}, picked for you.`, tone: 'Best guess — couldn’t reach their site',
      goal: `Announce what’s new at ${name}…`,
    });
  }
  async function readLive(name, onSite) {
    const found = await findDomain(name);
    onSite(found.domain);
    const full = viaMicrolink(found).catch(() => null);
    const icon = viaIcon(found).catch(() => null);
    const later = sleep(6000).then(() => icon);
    let b = await Promise.race([full, later]);
    if (!b) b = (await full) || (await icon);
    if (!b) throw new Error('no brand');
    return b;
  }

  const rbStage = $('rbStage'), rbGhost = $('rbGhost'), rbThread = $('rbThread'), rbShelf = $('rbShelf');
  let rbRead = null;
  const BUILDER_AV = '<span class="bm-av"><img src="../../../assets/logos/eai-mark-dark.svg" alt="" /></span>';
  function bMsg(who, html) {
    const d = document.createElement('div');
    d.className = 'bm ' + (who === 'you' ? 'bm-you' : 'bm-eai');
    d.innerHTML = who === 'you'
      ? `<div class="bm-body"><span class="bm-n mono">You</span>${html}</div><span class="bm-av bm-av-you">You</span>`
      : `${BUILDER_AV}<div class="bm-body"><span class="bm-n mono">Builder</span>${html}</div>`;
    rbThread.appendChild(d);
    while (rbThread.children.length > 14) rbThread.firstChild.remove();
    rbThread.scrollTop = rbThread.scrollHeight;
    return d;
  }
  function readList() {
    return '<ol class="rb-read mono">' + [['site', 'Their website'], ['colour', 'Colours'], ['logo', 'Logo'], ['tone', 'Tone of voice']]
      .map(([k, l]) => `<li data-k="${k}"><i></i><span>${l}</span><em>—</em></li>`).join('') + '</ol>';
  }
  const rbInput = $('rbInput');
  let big = null, rbBusy = false, sold = 1;
  function swatches(br) {
    const cols = [br.h, br.b].filter((c, i, a) => a.indexOf(c) === i);
    return cols.map((c) => `<span class="sw" style="background:${c}"></span>`).join('') + esc(cols[cols.length - 1].toUpperCase());
  }
  function readRow(k, cls, html) {
    const li = rbRead && rbRead.querySelector(`[data-k="${k}"]`);
    if (!li) return;
    li.className = cls || '';
    if (html != null) li.querySelector('em').innerHTML = html;
  }
  function bigHTML(br) {
    const c = copyFor(br);
    const tabs = STEP_NAMES.map((n, k) => `<span class="${k === 2 ? 'on' : ''}">${k + 1} ${n}</span>`).join('');
    const subjects = answersFor(br)[0].list;
    return `<div class="c-in"><div class="c-face c-front">` +
      `<div class="c-hd"><span class="c-mark">${br.mark}</span><span class="c-name">${esc(br.name)}</span><span class="c-app">CAMPAIGN EMAIL</span></div>` +
      `<div class="bc-tabs">${tabs}</div>` +
      `<div class="bc-bd"><div class="bc-mail"><span class="bc-subj">Subject — drafted in their voice</span><div class="bc-h">${esc(br.line)}</div><p class="bc-p">${esc(c.body)}</p><span class="bc-btn">${esc(c.cta)}</span></div>` +
      `<div class="bc-ai"><span class="bc-ai-h"><b>✦</b>${esc(br.name.toUpperCase())} ASSISTANT</span><div class="bc-bub">Hi — I’m here to help ${esc(br.name)}’s team write this email. Three more subject lines?</div></div></div>` +
      `</div><div class="c-face c-back"><span class="cb-t">THE SAME FOUR STEPS — ${esc(br.name.toUpperCase())}</span><ol>` +
      STEP_NAMES.map((n, k) => `<li><span>0${k + 1}</span>${n}<small>${STEP_WIRES[k]}</small></li>`).join('') +
      `</ol><div class="cb-ai"><b>✦ ${esc(br.name.toUpperCase())} ASSISTANT · FOR ${esc(br.name.toUpperCase())}’S TEAM, IN THE APP</b><ul>${subjects.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div></div></div>`;
  }
  function shelfTile(br, pop) {
    const t = document.createElement('span');
    t.className = 'mt' + (pop ? '' : ' on');
    t.style.cssText = varsFor(br);
    t.textContent = br.name[0];
    t.title = br.name;
    rbShelf.appendChild(t);
    if (pop) requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('on')));
  }
  function placeBig(br, drop) {
    const el = document.createElement('div');
    el.className = 'bc';
    el.style.cssText = varsFor(br);
    el.innerHTML = bigHTML(br);
    logoFallback(el, br);
    el.addEventListener('click', () => el.classList.toggle('flip'));
    rbStage.appendChild(el);
    big = el;
    if (!drop || REDUCED) return Promise.resolve();
    const floor = rbStage.querySelector('.rb-floor');
    floor.animate([{ transform: 'scale(.3)', opacity: 0.2 }, { transform: 'scale(1.1)', opacity: 1, offset: 0.55 }, { transform: 'scale(.8)', opacity: 0.7, offset: 0.72 }, { transform: 'scale(1)', opacity: 1 }], { duration: 1150 });
    setTimeout(() => burst(br), 600);
    return el.animate([
      { transform: 'translateY(-760px) rotate(-12deg)', easing: 'cubic-bezier(.55,0,.95,.45)' },
      { transform: 'translateY(0) rotate(1.5deg) scale(1.05, .9)', offset: 0.52, easing: 'cubic-bezier(.2,.7,.4,1)' },
      { transform: 'translateY(-70px) rotate(-1deg) scale(.98, 1.03)', offset: 0.7, easing: 'cubic-bezier(.6,0,.9,.5)' },
      { transform: 'translateY(0) scale(1.03, .95)', offset: 0.84 },
      { transform: 'none' },
    ], { duration: 1150 }).finished.catch(() => {});
  }
  function burst(br) {
    const r = rbStage.getBoundingClientRect();
    const cx = r.width / 2, cy = r.height / 2 + (mobile() ? 110 : 150);
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('i');
      const size = 6 + Math.random() * 8;
      p.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;background:${i % 3 ? br.b : '#16130F'};border-radius:${i % 2 ? '50%' : '2px'};pointer-events:none;z-index:3`;
      rbStage.appendChild(p);
      const ang = Math.PI + Math.random() * Math.PI;
      const dist = 120 + Math.random() * 200;
      p.animate([
        { transform: 'translate(-50%,-50%)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(ang) * dist}px), calc(-50% + ${Math.sin(ang) * dist * 0.5}px)) rotate(${Math.random() * 360}deg)`, opacity: 0 },
      ], { duration: 700 + Math.random() * 300, easing: 'cubic-bezier(.1,.8,.3,1)' }).finished.then(() => p.remove()).catch(() => p.remove());
    }
  }
  async function rebrand(raw) {
    const name = raw.trim();
    if (!name || rbBusy) return;
    rbBusy = true;
    rbInput.value = '';
    bMsg('you', `Make it for ${esc(name)}`);
    await sleep(REDUCED ? 0 : 250);
    const reply = bMsg('eai', `Reading their website for the re-skin…${readList()}`);
    rbRead = reply.querySelector('.rb-read');
    readRow('site', 'busy', 'looking…');
    if (big) { const old = big; old.classList.add('leave'); setTimeout(() => old.remove(), 520); big = null; }
    rbGhost.classList.add('on');
    let br = curated(name);
    const pace = (ms) => sleep(REDUCED ? 0 : ms);
    if (br) {
      await pace(350); readRow('site', 'ok', br.domain);
    } else {
      try {
        br = await Promise.race([
          readLive(name, (d) => readRow('site', 'ok', esc(d))),
          sleep(10000).then(() => { throw new Error('slow'); }),
        ]);
      } catch (e) {
        br = guessBrand(name);
        readRow('site', 'ok', 'couldn’t reach — best guess');
      }
    }
    readRow('colour', 'busy'); await pace(260);
    readRow('colour', 'ok', swatches(br));
    readRow('logo', 'busy'); await pace(260);
    readRow('logo', 'ok', br.live && br.logoUrl ? 'found on their site' : br.key ? 'hand-checked' : 'monogram');
    readRow('tone', 'busy'); await pace(260);
    readRow('tone', 'ok', esc(br.tone));
    rbGhost.classList.remove('on');
    $('rbWho').textContent = br.name;
    await placeBig(br, true);
    bMsg('eai', `Done. Same four steps, same wiring — now in ${esc(br.name)}’s brand and voice. Added to your wall as client ${sold + 1}.`);
    sold++;
    $('rbCount').textContent = sold;
    shelfTile(br, true);
    addToWall(br);
    addSharePick(br);
    rbBusy = false;
  }
  $('rbForm').addEventListener('submit', (e) => { e.preventDefault(); rebrand(rbInput.value || rbInput.placeholder); });
  $('rbChips').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) rebrand(b.dataset.n); });

  /* =====================================================================
     4. Four steps, lit across every copy
     ===================================================================== */
  const stWall = $('stWall'), stList = $('stList');
  const COLS = () => (window.innerWidth <= 720 ? 4 : window.innerWidth <= 900 ? 6 : 8);
  const stCards = [];
  for (let i = 0; i < 48; i++) {
    const br = brandAt(i);
    const d = document.createElement('div');
    d.className = 'sm';
    d.style.cssText = varsFor(br);
    d.innerHTML = `<div class="sm-h"><i></i>${esc(br.name)}</div><div class="sm-s">${[1, 2, 3, 4].map((n) => `<b data-i="${n - 1}">${n}</b>`).join('')}</div>`;
    stWall.appendChild(d);
    stCards.push(d);
  }
  let litStep = -1, stAuto = null, stHover = false;
  function light(i, originIdx) {
    if (i === litStep) return;
    litStep = i;
    stList.querySelectorAll('li').forEach((li) => li.classList.toggle('on', +li.dataset.i === i));
    stWall.classList.toggle('lit', i >= 0);
    const cols = COLS();
    const o = originIdx == null ? 0 : originIdx;
    const ox = o % cols, oy = Math.floor(o / cols);
    stCards.forEach((d, k) => {
      const dist = Math.hypot((k % cols) - ox, Math.floor(k / cols) - oy);
      d.querySelectorAll('b').forEach((b, n) => {
        b.style.transitionDelay = REDUCED ? '0ms' : dist * 28 + 'ms';
        b.classList.toggle('on', n === i);
      });
    });
  }
  stList.querySelectorAll('li').forEach((li) => {
    li.addEventListener('pointerenter', () => { stHover = true; light(+li.dataset.i, 0); });
    li.addEventListener('click', () => { stHover = true; light(+li.dataset.i, 0); });
  });
  stList.addEventListener('pointerleave', () => { stHover = false; });
  stWall.addEventListener('pointerover', (e) => {
    const b = e.target.closest('.sm-s b');
    if (!b) return;
    stHover = true;
    const idx = stCards.indexOf(b.closest('.sm'));
    litStep = -1;
    light(+b.dataset.i, idx);
  });
  stWall.addEventListener('pointerleave', () => { stHover = false; });
  function stCycle(on) {
    clearInterval(stAuto);
    if (!on || REDUCED) { if (litStep < 0) light(2, 0); return; }
    if (litStep < 0) light(0, 0);
    stAuto = setInterval(() => { if (!stHover) light((litStep + 1) % 4, 0); }, 1900);
  }

  /* =====================================================================
     5. AI in every app — same question, three voices
     ===================================================================== */
  const ASK = ['Suggest three subject lines', 'Make the intro shorter', 'Who is this for?'];
  const ANS = {
    nike: [
      { list: ['Pegasus 41 is here. Go.', 'Your next PB starts now.', 'Run Club gets first access.'] },
      { text: 'Pegasus 41. Lighter. Faster. Run Club, you’re first.' },
      { text: 'Nike Run Club members who’ve logged a run this month. Lead with first access — they earned it.' },
    ],
    apple: [
      { list: ['Say hello to the new iPhone.', 'Pro. Beyond.', 'Available now at the Apple Store.'] },
      { text: 'The new iPhone. Our best camera yet.' },
      { text: 'Apple Store customers due for an upgrade. One product, one reason. Keep it simple.' },
    ],
    commbank: [
      { list: ['Your Yello rewards are here', 'More value from everyday banking', 'See your offers in the CommBank app'] },
      { text: 'Earn Yello rewards on your everyday account — no sign-up needed.' },
      { text: 'Everyday account customers who use the CommBank app. Reassure them there’s nothing to sign up for.' },
    ],
  };
  function answersFor(br) {
    if (br.key && ANS[br.key]) return ANS[br.key];
    return [
      { list: [br.line, `${br.name}: made for you`, `Don’t miss this from ${br.name}`] },
      { text: br.line },
      { text: `${br.audience}. Keep it ${br.tone.toLowerCase().split(',')[0]}.` },
    ];
  }
  function copyFor(br) {
    const slug = br.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      body: br.body || `Here’s what’s new at ${br.name} this month — picked for ${br.audience.toLowerCase()}.`,
      cta: br.cta || 'Find out more',
      files: br.files || [`${slug}-brand-guide.pdf`, 'tone-of-voice.docx', 'product-shots.zip'],
    };
  }
  const aiGrid = $('aiGrid');
  const AI_BRANDS = [NIKE, APPLE_B, CBA_B];
  const chats = AI_BRANDS.map((br) => {
    const c = document.createElement('div');
    c.className = 'chat';
    c.style.cssText = varsFor(br);
    c.innerHTML = `<div class="chat-h"><span class="c-mark">${br.mark}</span><div><b>${esc(br.name)} assistant</b><small>FOR ${esc(br.name.toUpperCase())}’S TEAM · IN THE APP</small></div></div><div class="chat-b"></div><div class="chat-f"><span>Ask the ${esc(br.name)} assistant…</span><b>✦</b></div>`;
    aiGrid.appendChild(c);
    return { c, br, body: c.querySelector('.chat-b') };
  });
  let aiRun = 0;
  const cuHTML = (br, q) => `<div class="cu-wrap"><span class="cu-n mono">${esc(br.name)}’s team, using the app</span><div class="cu">${esc(q)}</div></div>`;
  async function ask(q) {
    const id = ++aiRun;
    $('aiAsks').querySelectorAll('button').forEach((b) => { const on = +b.dataset.q === q; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    chats.forEach(({ body, br }) => { body.innerHTML = `${cuHTML(br, ASK[q])}<div class="ca"><span class="typing"><i></i><i></i><i></i></span></div>`; });
    await Promise.all(chats.map(async ({ body, br }, k) => {
      await sleep(REDUCED ? 0 : 600 + k * 350);
      if (id !== aiRun) return;
      const a = answersFor(br)[q];
      const inner = a.list ? `Three, in ${esc(br.name)}’s voice:<ul>${a.list.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : esc(a.text);
      body.querySelector('.ca').innerHTML = `${inner}<span class="tone">Voice · ${esc(br.tone)}</span>`;
    }));
  }
  $('aiAsks').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) ask(+b.dataset.q); });

  /* =====================================================================
     6. Share — the phone and a real QR code
     ===================================================================== */
  const shPick = $('shPick'), phScreen = $('phScreen');
  const picks = [NIKE, APPLE_B, CBA_B];
  let phBrand = NIKE, phStep = 0, phAuto = null, phTouched = false;
  function renderPicks() {
    shPick.innerHTML = picks.map((br, i) => `<button type="button" role="tab" aria-selected="${br === phBrand}" class="${br === phBrand ? 'on' : ''}" data-i="${i}" style="${varsFor(br)}"><i></i>${esc(br.name)}</button>`).join('');
  }
  function addSharePick(br) {
    if (picks.includes(br)) return;
    picks.push(br);
    if (picks.length > 6) picks.splice(3, 1);
    renderPicks();
  }
  function shareUrl(br) {
    if (br.key) return new URL(`../../app.html?c=${br.key}`, location.href).href;
    const p = new URLSearchParams({ n: br.name, d: br.domain || '', p: br.h.replace('#', '') });
    if (br.logoUrl) p.set('l', br.logoUrl);
    return new URL(`../../app.html?${p}`, location.href).href;
  }
  function phStepHTML(br, i) {
    const c = copyFor(br);
    const next = ['Next: assets', 'Next: compose', 'Next: review', 'Approve and send'][i];
    if (i === 1) return `<h4>Assets</h4><p>Pulled from SharePoint · Brand / Guidelines.</p>${c.files.map((f) => `<div class="ph-row"><i></i>${esc(f)}</div>`).join('')}<button class="ph-cta" type="button">${next}</button>`;
    if (i === 2) return `<h4>Compose</h4><p>Drafted by AI, in ${esc(br.name)}’s voice.</p><div class="ph-mail"><div></div><div><b>${esc(br.line)}</b>${esc(c.body)}</div></div><button class="ph-cta" type="button">${next}</button>`;
    if (i === 3) return `<h4>Review</h4><p>One approval before it sends on ${esc(br.date)}.</p><div class="ph-row"><i></i>Brand colours and logo</div><div class="ph-row"><i></i>Tone — ${esc(br.tone)}</div><div class="ph-row"><i></i>Links and unsubscribe checked</div><button class="ph-cta" type="button">${next}</button>`;
    return `<h4>Tell us about the campaign</h4><div class="ph-f"><span>Campaign goal</span><div>${esc(br.goal || `Announce what’s new at ${br.name}…`)}</div></div><div class="ph-f"><span>Audience</span><div>${esc(br.audience)}</div></div><div class="ph-f"><span>Send date</span><div>${esc(br.date)}</div></div><button class="ph-cta" type="button">${next}</button>`;
  }
  function renderPhone() {
    const br = phBrand;
    phScreen.style.cssText = varsFor(br);
    phScreen.innerHTML = `<div class="ph-bar"><span class="c-mark">${br.mark}</span><b>${esc(br.name)}</b></div>` +
      `<div class="ph-title">Campaign email</div>` +
      `<div class="ph-steps">${STEP_NAMES.map((n, k) => `<button type="button" class="${k === phStep ? 'on' : ''}" data-s="${k}">${n}</button>`).join('')}</div>` +
      `<div class="ph-card">${phStepHTML(br, phStep)}</div><span class="ph-ai" aria-hidden="true">✦</span>`;
    logoFallback(phScreen, br);
    const url = shareUrl(br);
    $('shLink').href = url;
    $('shLinkName').textContent = br.name;
    if (window.QRCode && QRCode.toCanvas) {
      QRCode.toCanvas($('shQr'), url, { width: 132, margin: 0, color: { dark: '#16130F', light: '#FFFFFF' } }, () => {});
    }
  }
  shPick.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    phBrand = picks[+b.dataset.i]; phStep = 0; phTouched = true;
    renderPicks(); renderPhone();
  });
  phScreen.addEventListener('click', (e) => {
    const s = e.target.closest('[data-s]');
    phTouched = true;
    if (s) { phStep = +s.dataset.s; renderPhone(); return; }
    if (e.target.closest('.ph-cta')) { phStep = (phStep + 1) % 4; renderPhone(); }
  });
  function phCycle(on) {
    clearInterval(phAuto);
    if (!on || REDUCED) return;
    phAuto = setInterval(() => {
      if (phTouched) return;
      phStep = (phStep + 1) % 4;
      if (phStep === 0) { phBrand = picks[(picks.indexOf(phBrand) + 1) % picks.length]; renderPicks(); }
      renderPhone();
    }, 2200);
  }

  /* =====================================================================
     7. Close
     ===================================================================== */
  const mq = $('mq');
  const mults = [2, 4, 8, 16, 32, 64, 128, 256].map((n) => `<span>×${n}</span>`).join('');
  mq.innerHTML = mults + mults;
  $('closeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('closeInput').value.trim() || 'Campaign email';
    $('closeNote').textContent = `“${v}” — build it once for one client. Then sell it to the next ${state.clients}. That’s $${fmt(state.clients * state.price)}.`;
  });

  /* =====================================================================
     Scroll reveals and in-view triggers
     ===================================================================== */
  document.querySelectorAll('.sec-head, .calc, .rb, .st, .ai-grid, .sh, .close-in').forEach((el) => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) en.target.classList.add('in');
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  let aiDone = false;
  const trig = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const id = en.target.id;
      if (id === 'steps') stCycle(en.isIntersecting);
      if (id === 'share') phCycle(en.isIntersecting);
      if (id === 'ai' && en.isIntersecting && !aiDone) { aiDone = true; ask(0); }
    });
  }, { threshold: 0.25 });
  ['steps', 'share', 'ai'].forEach((id) => trig.observe($(id)));

  /* ---------- Boot ---------- */
  if (window.matchMedia('(hover: none)').matches) $('rbTip').textContent = 'Tap the card to flip it';
  calc();
  shelfTile(NIKE, false);
  placeBig(NIKE, false);
  bMsg('you', 'Build a campaign email app for Nike');
  bMsg('eai', 'Built: Brief → Assets → Compose → Review, in Nike’s brand, with a Nike assistant for their team. Who’s next? Name a client and I’ll re-skin it.');
  renderPicks();
  renderPhone();
  light(0, 0);
  chats.forEach(({ body, br }) => { body.innerHTML = cuHTML(br, ASK[0]); });
  const params = new URLSearchParams(location.search);
  if (params.get('client')) setTimeout(() => rebrand(params.get('client')), 300);
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(intro);
})();
