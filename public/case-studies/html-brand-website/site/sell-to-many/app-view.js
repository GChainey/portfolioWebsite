/* Build once. Sell to many. — shared between the builder (index.html) and
   the phone view (app.html): the brands, colour helpers and how a brand is
   painted onto the client's app. */
(function () {
  'use strict';

  function esc(s) { return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }

  const SWOOSH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 7.8 6.442 15.276c-1.456.616-2.679.925-3.668.925-1.11 0-1.922-.392-2.437-1.177-.317-.503-.4-1.152-.25-1.947.152-.795.532-1.643 1.14-2.543.505-.75 1.371-1.708 2.6-2.874-.365.615-.766 1.395-1.084 2.155-.55 1.32-.68 2.4-.394 3.24.13.375.365.65.68.83.36.2.83.29 1.41.29.44 0 .93-.06 1.47-.18L24 7.8Z" fill="currentColor"/></svg>';

  const APPLE = '<svg viewBox="150 100 500 560" aria-hidden="true"><path fill="currentColor" d="M584.8426,276.8632c-2.3411,1.4432-53.8358,31.4239-53.251,93.7952c0.6472,74.6027,65.3989,99.4457,66.1427,99.7276c-0.58,1.7759-10.3524,35.3838-34.1321,70.0925c-20.5507,30.0693-41.8387,59.968-75.4384,60.5922c-33.0098,0.6046-43.6489-19.5858-81.3589-19.5858c-37.7331,0-49.5436,18.9615-80.7596,20.1904c-32.4307,1.227-57.1214-32.4709-77.8236-62.3746c-42.3212-61.1983-74.679-172.9508-31.23-248.3679c21.5705-37.4546,60.1253-61.1835,101.9581-61.7964c31.8589-0.6021,61.9044,21.4174,81.3918,21.4174c19.209,0,53.636-25.6686,94.2163-22.6665C510.4626,229.066,555.6122,233.8129,584.8426,276.8632z M469.5186,187.488c17.2347-20.8293,28.8305-49.8377,25.6375-78.6904c-24.8053,0.9837-54.8058,16.5229-72.5975,37.339c-15.9324,18.4398-29.925,47.9732-26.1259,76.237C424.0806,224.5099,452.2985,208.3302,469.5186,187.488z"/></svg>';

  /* Brands with hand-checked logos and colours. head is the app bar, b is
     the action colour (active step, buttons), accent tints the hero line. */
  const BRANDS = {
    nike: {
      name: 'Nike', domain: 'nike.com', logo: SWOOSH,
      head: '#FA5400', headOn: '#FFFFFF', b: '#FA5400', on: '#FFFFFF',
      surface: '#F5F5F5', border: '#E4DCD4', accent: '#FA5400',
      font: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      swatches: ['#FA5400', '#111111', '#FFFFFF', '#F5F5F5'],
      tone: 'Direct, urgent, athlete-first',
      goal: 'Launch the Pegasus 41…', audience: 'Nike Run Club members', date: '3 October',
    },
    apple: {
      name: 'Apple', domain: 'apple.com', logo: APPLE, logoClass: 'apple',
      head: '#1D1D1F', headOn: '#F5F5F7', b: '#0071E3', on: '#FFFFFF',
      surface: '#F5F5F7', border: '#E3E3E8', accent: '#0071E3',
      font: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif',
      swatches: ['#1D1D1F', '#0071E3', '#F5F5F7', '#FFFFFF'],
      tone: 'Simple, confident, understated',
      goal: 'Introduce the new iPhone…', audience: 'Apple Store customers', date: '9 October',
    },
    commbank: {
      name: 'CommBank', domain: 'commbank.com.au', logo: '<img src="logos/commbank.svg" alt="" class="img-mark" />',
      head: '#000000', headOn: '#FFFFFF', b: '#FFCC00', on: '#000000',
      surface: '#F7F7F7', border: '#E5E5E5', accent: '#D9A400',
      font: 'system-ui, -apple-system, sans-serif',
      swatches: ['#FFCC00', '#000000', '#FFFFFF', '#F7F7F7'],
      tone: 'Clear, helpful, reassuring',
      goal: 'Launch Yello rewards for everyday accounts…', audience: 'CommBank app customers', date: '16 October',
    },
  };
  const ALIASES = { 'commonwealth bank': 'commbank', 'commonwealth bank of australia': 'commbank', cba: 'commbank', 'commbank.com.au': 'commbank', 'apple.com': 'apple', 'nike.com': 'nike' };

  function curated(raw) {
    const key = raw.trim().toLowerCase().replace(/\s+/g, ' ');
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
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    return { s, l };
  }
  function lum(hex) {
    const ch = rgbOf(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }
  const inkFor = (hex) => (lum(hex) > 0.45 ? '#111111' : '#FFFFFF');
  function mix(hex, amt) { // mix hex into white
    const c = rgbOf(hex).map((v) => Math.round(255 - (255 - v) * amt));
    return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  }
  function darken(hex, amt) {
    const c = rgbOf(hex).map((v) => Math.round(v * (1 - amt)));
    return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  }
  // The brand colour: the most saturated mid-tone in the logo, else the image,
  // else the darkest logo colour (for monochrome brands).
  function pickPrimary(logoPal, imagePal) {
    const ok = (hex) => { const { s, l } = hslOf(hex); return s > 0.35 && l > 0.18 && l < 0.72; };
    const bySat = (a, b) => hslOf(b).s - hslOf(a).s;
    const fromLogo = logoPal.filter(ok).sort(bySat)[0];
    if (fromLogo) return fromLogo;
    const dark = logoPal.filter((h) => hslOf(h).l < 0.3).sort((a, b) => hslOf(a).l - hslOf(b).l)[0];
    if (dark) return dark;
    return imagePal.filter(ok).sort(bySat)[0] || '#1D1D1F';
  }

  /* ---- Live lookup: name -> domain -> logo + palette from the real site ---- */
  function liveBrand(found, primary, logoUrl, extra, about) {
    const short = found.name.replace(/\s+(of|pty|ltd|inc|limited|group|corporation|corp)\b.*$/i, '').trim();
    primary = primary.toUpperCase();
    return {
      name: short, domain: found.domain, live: true,
      logo: logoUrl ? `<span class="chip"><img src="${esc(logoUrl)}" alt="" referrerpolicy="no-referrer" /></span>` : null,
      head: primary, headOn: inkFor(primary), b: primary, on: inkFor(primary),
      surface: mix(primary, 0.05), border: mix(primary, 0.16),
      accent: lum(primary) > 0.35 ? darken(primary, 0.25) : primary,
      font: 'system-ui, -apple-system, sans-serif',
      swatches: [primary].concat(extra.map((h) => h.toUpperCase()).filter((h) => h !== primary).slice(0, 3)),
      about: (about || '').replace(/\s+/g, ' ').trim(),
      tone: 'Read live from their site',
      goal: `Announce what's new at ${short}…`, audience: `${short} customers`, date: '28 October',
    };
  }

  // Full read: real logo, palette and description from the site.
  // What the in-app assistant shows for a brand.
  const SUBJECTS = {
    nike: ['Pegasus 41 is here. Go.', 'Your next PB starts now', 'Run Club members get first access'],
    apple: ['Say hello to the new iPhone.', 'Pro. Beyond.', 'Available now at the Apple Store'],
    commbank: ['Your Yello rewards are here', 'More value from everyday banking', 'Unlock offers in the CommBank app'],
  };
  function subjectsFor(br) {
    const key = Object.keys(BRANDS).find((k) => BRANDS[k] === br);
    if (key && SUBJECTS[key]) return SUBJECTS[key];
    return [`What’s new at ${br.name}`, `${br.name}: made for you`, `Don’t miss this from ${br.name}`];
  }
  function assistHTML(br) {
    const items = subjectsFor(br).map((t) => `<li>${esc(t)}</li>`).join('');
    return `<div class="pa-ai">Hi — I’m the ${esc(br.name)} campaign assistant. Ask me anything about this email.</div>` +
      `<div class="pa-user">Suggest three subject lines for ${esc(br.audience.replace(/…$/, ''))}</div>` +
      `<div class="pa-ai">Here are three, in ${esc(br.name)}’s voice:<ul class="pa-list">${items}</ul></div>`;
  }

  /* ---- The four steps: what the client's app shows at each one ---- */
  const COPY = {
    nike: {
      files: ['nike-brand-guide.pdf', 'tone-of-voice.docx', 'pegasus-41-shots.zip'],
      body: 'The Pegasus 41 is here — lighter, faster, ready for your next PB. Run Club members get first access this week.',
      cta: 'Shop now',
    },
    apple: {
      files: ['apple-brand-guidelines.pdf', 'voice-and-tone.docx', 'iphone-product-shots.zip'],
      body: 'Introducing the new iPhone. Our most advanced camera yet, in a design you’ll love to hold.',
      cta: 'Learn more',
    },
    commbank: {
      files: ['commbank-brand-guide.pdf', 'yello-offers.xlsx', 'app-screens.zip'],
      body: 'Earn Yello rewards on your everyday account. See your offers in the CommBank app — no sign-up needed.',
      cta: 'See my offers',
    },
  };
  function copyFor(br) {
    const key = Object.keys(BRANDS).find((k) => BRANDS[k] === br);
    if (key && COPY[key]) return COPY[key];
    const slug = br.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      files: [`${slug}-brand-guide.pdf`, 'tone-of-voice.docx', 'product-shots.zip'],
      body: `Here’s what’s new at ${br.name} this month — picked for ${br.audience.replace(/…$/, '').toLowerCase()}.`,
      cta: 'Find out more',
    };
  }
  const TICK = '<svg viewBox="0 0 24 24" width="12" height="12"><path d="m5 13 4 4L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const NEXT = ['Next: assets', 'Next: compose', 'Next: review', 'Approve and send'];

  function stepHTML(br, i) {
    const c = i === 1 || i === 2 ? copyFor(br) : null;
    const cta = `<button type="button" class="p-cta" data-next>${NEXT[i]}</button>`;
    if (i === 1) {
      return `<div class="p-card-hd"><div class="p-card-title">Assets</div><div class="p-card-sub">What this campaign draws on. Pulled from SharePoint · Brand / Guidelines.</div></div>` +
        c.files.map((f) => `<div class="pf-row"><i></i><span>${esc(f)}</span><small>Synced 2 min ago</small></div>`).join('') +
        `<div class="pf-note">Kept up to date automatically — the next campaign reads whatever is current.</div>` + cta;
    }
    if (i === 2) {
      const subj = subjectsFor(br)[0];
      return `<div class="p-card-hd"><div class="p-card-title">Compose</div><div class="p-card-sub">Drafted by AI from the brief and assets, in ${esc(br.name)}’s voice.</div></div>` +
        `<div class="pm-subj"><span>Subject</span>${esc(subj)}</div>` +
        `<div class="pm-mail"><div class="pm-bar">${br.logo || `<span class="mono">${esc(br.name[0])}</span>`}</div>` +
        `<div class="pm-body"><div class="pm-h">${esc(subj)}</div><p>${esc(c.body)}</p><span class="pm-btn">${esc(c.cta)}</span></div></div>` + cta;
    }
    if (i === 3) {
      const checks = ['Brand colours and logo', `Tone of voice — ${br.tone || 'from their site'}`, 'Links and unsubscribe checked'];
      return `<div class="p-card-hd"><div class="p-card-title">Review</div><div class="p-card-sub">One approval before it sends on ${esc(br.date)}.</div></div>` +
        `<div class="pr-who"><span class="pr-av">JL</span><div><b>Jordan Lee</b><small>Marketing lead · approver</small></div><span class="pr-state">Waiting</span></div>` +
        checks.map((t) => `<div class="pr-check"><span>${TICK}</span>${esc(t)}</div>`).join('') +
        `<div class="pr-acts">${cta}<button type="button" class="pr-alt">Request changes</button></div>`;
    }
    return `<div class="p-card-hd"><div class="p-card-title">Tell us about the campaign</div><div class="p-card-sub">Four fields. The rest is written for you.</div></div>` +
      `<div class="p-field"><span class="p-label">Campaign goal</span><span class="p-input" data-f="goal">${esc(br.goal)}</span></div>` +
      `<div class="p-row"><div class="p-field"><span class="p-label">Audience</span><span class="p-input" data-f="audience">${esc(br.audience)}</span></div>` +
      `<div class="p-field"><span class="p-label">Send date</span><span class="p-input" data-f="date">${esc(br.date)}</span></div></div>` + cta;
  }

  // Show step i. The brand is read from the root so steps follow rebrands.
  function goStep(root, i) {
    const br = root.__brand;
    if (!br) return;
    root.dataset.step = i;
    root.querySelectorAll('.p-step').forEach((s, n) => s.classList.toggle('on', n === i));
    const card = root.querySelector('.p-card');
    card.innerHTML = stepHTML(br, i);
    card.classList.remove('swap');
    void card.offsetWidth;
    card.classList.add('swap');
  }
  // Steps and the Next button are clickable once the app is built.
  function bindSteps(root) {
    root.querySelectorAll('.p-step').forEach((s, n) => {
      s.setAttribute('role', 'button');
      s.tabIndex = 0;
      s.addEventListener('click', () => { if (root.dataset.state !== 'empty') goStep(root, n); });
    });
    root.querySelector('.p-card').addEventListener('click', (e) => {
      if (e.target.closest('[data-next]')) goStep(root, Math.min(3, (+root.dataset.step || 0) + 1));
    });
  }

  // Paint a brand onto an app root. Fields are optional so the builder can type them.
  function paint(root, br, opts) {
    const q = (sel) => root.querySelector(sel);
    const s = root.style;
    s.setProperty('--b', br.b);
    s.setProperty('--b-on', br.on);
    s.setProperty('--b-head', br.head);
    s.setProperty('--b-head-on', br.headOn);
    s.setProperty('--b-surface', br.surface);
    s.setProperty('--b-border', br.border);
    s.setProperty('--b-font', br.font);
    const logo = q('.p-logo');
    const mono = `<span class="mono">${esc(br.name[0].toUpperCase())}</span>`;
    logo.className = 'p-logo' + (br.logoClass ? ' ' + br.logoClass : '');
    logo.innerHTML = br.logo || mono;
    const img = logo.querySelector('.chip img');
    if (img) img.onerror = () => { logo.innerHTML = mono; };
    q('.p-name').textContent = br.name;
    root.__brand = br;
    const thread = q('.pa-thread');
    if (thread) thread.innerHTML = assistHTML(br);
    const step = +root.dataset.step || 0;
    if (step || !opts || opts.fields !== false) goStep(root, step);
  }

  // A short, QR-friendly link to the phone view for a brand.
  function shareParams(br) {
    const key = Object.keys(BRANDS).find((k) => BRANDS[k] === br);
    if (key) return `c=${key}`;
    const p = new URLSearchParams({ n: br.name, d: br.domain, p: br.b.replace('#', '') });
    const m = /src="([^"]+)"/.exec(br.logo || '');
    if (m) p.set('l', m[1].replace(/&amp;/g, '&'));
    return p.toString();
  }
  function fromParams(search) {
    const p = new URLSearchParams(search);
    if (p.get('c') && BRANDS[p.get('c')]) return BRANDS[p.get('c')];
    if (p.get('n')) {
      return liveBrand({ name: p.get('n'), domain: p.get('d') || '' }, '#' + (p.get('p') || '1D1D1F'), p.get('l'), [], '');
    }
    return BRANDS.nike;
  }

  window.STM = { stepHTML, goStep, bindSteps, BRANDS, ALIASES, curated, pickPrimary, liveBrand, inkFor, esc, paint, assistHTML, shareParams, fromParams };
})();
