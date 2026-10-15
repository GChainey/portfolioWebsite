/* Night — "Build once. Sell to many." as a dark, cinematic product reveal.

   Concept: the page is a dark stage lit by a cursor spotlight. The signature
   moment is THE BRAND SCAN. Two different chats, never blurred:
     - the BUILDER CHAT (left, EAI-neutral) is you, the maker, editing the
       app: "Make it right for Apple". The builder replies by reading the
       client's site right there in the thread;
     - the IN-APP ASSISTANT (inside the app, on the right, client-branded)
       is for the client's team using the app: "Three subject lines?".
   In the builder's reply a beam sweeps a stylised rendering of their website; the colours it finds lift
   off as glowing particles, pass through the EAI core and repaint the same
   four-step app; the logo drops into the app bar, the tone of voice lands as
   a label and the assistant greets you in their voice. It auto-plays once
   (Nike -> Apple), then the visitor can type any company: curated brands
   are hand-checked, anything else is read live (Clearbit -> Microlink,
   icon.horse fallback, name-hash fallback) — the same approach as sell.js.

   Every client scanned joins the rest of the page: the fanned deck
   (hover / drag / click), the glowing four-step wire, the in-brand
   assistant and the phone + QR share. The page's ambient glow takes on
   the current client's colour.
*/
(function () {
  'use strict';

  const STM = window.STM;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const STEPS = ['Brief', 'Assets', 'Compose', 'Review'];
  const SPARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" fill="currentColor"/></svg>';

  /* ---------------- Colour helpers ---------------- */
  function rgbOf(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function lum(hex) {
    const ch = rgbOf(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }
  const toHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
  const mixWhite = (hex, amt) => toHex(rgbOf(hex).map((v) => 255 - (255 - v) * amt));
  function hslHex(h, s, l) {
    s /= 100; l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return toHex([f(0) * 255, f(8) * 255, f(4) * 255]);
  }
  const inkFor = (hex) => (lum(hex) > 0.45 ? '#111111' : '#FFFFFF');
  // The colour the page glows in for a brand: its action colour, lifted if too dark.
  function glowFor(br) {
    const c = br.b;
    const L = lum(c);
    if (L < 0.04) return br.swatches.find((h) => lum(h) > 0.06 && lum(h) < 0.8) || '#7AA8FF';
    return c;
  }

  /* ---------------- Brands ---------------- */
  const B = STM.BRANDS;
  const CURATED = {
    nike: Object.assign({}, B.nike, {
      key: 'nike',
      greet: 'Hey — I’m your Nike campaign assistant. Let’s make this one fast.',
      subjects: ['Pegasus 41 is here. Go.', 'Your next PB starts now', 'Run Club members get first access'],
      short: 'Pegasus 41 is here. Lighter. Faster. Built for your next PB.',
      sms: 'Nike: Pegasus 41 just dropped. Run Club members get first access — tap to shop before it’s gone.',
      copy: { files: ['nike-brand-guide.pdf', 'tone-of-voice.docx', 'pegasus-41-shots.zip'], body: 'The Pegasus 41 is here — lighter, faster, ready for your next PB.', cta: 'Shop now' },
      site: { bg: '#FFFFFF', fg: '#111111', nav: '#FFFFFF', navfg: '#111111', hero: '#FA5400', herofg: '#111111', btn: '#111111', btnfg: '#FFFFFF', card: '#F5F5F5', orb: 'rgba(255,230,200,0.55)', kick: 'New · Nike Running', head: 'Pegasus 41. Your next PB starts now.', links: ['New', 'Men', 'Women', 'Kids', 'Sale'] },
    }),
    apple: Object.assign({}, B.apple, {
      key: 'apple',
      greet: 'Hello. I’m the Apple campaign assistant. Ask me anything.',
      subjects: ['Say hello to the new iPhone.', 'Pro. Beyond.', 'Available now at the Apple Store'],
      short: 'The new iPhone. Our best camera yet, in a design made to be held.',
      sms: 'Apple: The new iPhone is here. See what’s new and find your colour at apple.com.',
      copy: { files: ['apple-brand-guidelines.pdf', 'voice-and-tone.docx', 'iphone-product-shots.zip'], body: 'Introducing the new iPhone. Our most advanced camera yet.', cta: 'Learn more' },
      site: { bg: '#F5F5F7', fg: '#1D1D1F', nav: '#1D1D1F', navfg: '#F5F5F7', hero: '#FFFFFF', herofg: '#1D1D1F', btn: '#0071E3', btnfg: '#FFFFFF', card: '#FFFFFF', orb: 'rgba(0,113,227,0.18)', kick: 'iPhone', head: 'Say hello to the new iPhone.', links: ['Store', 'Mac', 'iPad', 'iPhone', 'Watch'] },
    }),
    commbank: Object.assign({}, B.commbank, {
      key: 'commbank',
      logo: '<img src="../../logos/commbank.svg" alt="" />',
      greet: 'Hi, I’m the CommBank campaign assistant. I’m here to help — ask me anything.',
      subjects: ['Your Yello rewards are here', 'More value from everyday banking', 'Unlock offers in the CommBank app'],
      short: 'Yello rewards are here. Real value on your everyday account — no sign-up needed.',
      sms: 'CommBank: Yello rewards are now live on your everyday account. Open the CommBank app to see your offers.',
      copy: { files: ['commbank-brand-guide.pdf', 'yello-offers.xlsx', 'app-screens.zip'], body: 'Earn Yello rewards on your everyday account — no sign-up needed.', cta: 'See my offers' },
      site: { bg: '#FFFFFF', fg: '#000000', nav: '#000000', navfg: '#FFFFFF', hero: '#FFCC00', herofg: '#000000', btn: '#000000', btnfg: '#FFFFFF', card: '#F7F7F7', orb: 'rgba(255,255,255,0.6)', kick: 'Yello · Everyday accounts', head: 'Rewards for the everyday. Meet Yello.', links: ['Banking', 'Home loans', 'Business', 'Help'] },
    }),
  };
  const ALIASES = { 'commonwealth bank': 'commbank', 'commonwealth bank of australia': 'commbank', cba: 'commbank', 'commbank.com.au': 'commbank', 'apple.com': 'apple', 'nike.com': 'nike' };
  function curated(raw) {
    const k = raw.trim().toLowerCase().replace(/\s+/g, ' ');
    return CURATED[k] || CURATED[ALIASES[k]] || null;
  }

  // Give a live (or guessed) brand the extras this page renders.
  function decorate(br) {
    const name = br.name;
    const p = br.b.toUpperCase();
    const second = (br.swatches || []).find((h) => h.toUpperCase() !== p && Math.abs(lum(h) - lum(p)) > 0.15);
    const about = (br.about || '').split(/[.!?]/)[0].trim();
    // Distinct colours only: drop near-duplicates, then round out with ink and surface.
    const dist = (x, y) => { const A = rgbOf(x), Bc = rgbOf(y); return Math.hypot(A[0] - Bc[0], A[1] - Bc[1], A[2] - Bc[2]); };
    const sw = [p];
    (br.swatches || []).concat(['#111111', br.surface || mixWhite(p, 0.05), '#FFFFFF']).forEach((h) => {
      if (/^#[0-9a-f]{6}$/i.test(h) && sw.length < 4 && sw.every((x) => dist(x, h) > 48)) sw.push(h.toUpperCase());
    });
    return Object.assign(br, {
      key: 'x-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      fresh: true,
      tone: br.tone === 'Read live from their site' ? `Read live from ${br.domain}` : br.tone,
      swatches: sw,
      greet: `Hi — I’m the ${name} campaign assistant. Ask me anything about this email.`,
      subjects: [`What’s new at ${name}`, `${name}: made for you`, `Don’t miss this from ${name}`],
      short: `Here’s what’s new at ${name} — picked for you.`,
      sms: `${name}: something new just landed. Tap to see what’s in store.`,
      copy: { files: [`${key(name)}-brand-guide.pdf`, 'tone-of-voice.docx', 'product-shots.zip'], body: `Here’s what’s new at ${name} this month — picked for ${name} customers.`, cta: 'Find out more' },
      site: {
        bg: '#FFFFFF', fg: '#111111', nav: '#FFFFFF', navfg: '#111111', hero: p, herofg: inkFor(p),
        btn: second || inkFor(p), btnfg: inkFor(second || inkFor(p)), card: mixWhite(p, 0.08), orb: 'rgba(255,255,255,0.35)',
        kick: br.domain, head: about && about.length < 70 ? about : `${name}. Made for you.`, links: ['Shop', 'About', 'Stories', 'Help'],
      },
    });
  }
  const key = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  /* ---------------- Live lookup (same approach as sell.js) ---------------- */
  function withTimeout(ms) { const c = new AbortController(); setTimeout(() => c.abort(), ms); return c.signal; }
  async function findDomain(name) {
    if (/\.[a-z]{2,}$/i.test(name)) return { name: name.replace(/^https?:\/\/(www\.)?/, '').replace(/\..*$/, '').replace(/^./, (c) => c.toUpperCase()), domain: name.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '') };
    try {
      const r = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(name)}`, { signal: withTimeout(4000) });
      const list = await r.json();
      if (list[0] && list[0].domain) return { name: list[0].name, domain: list[0].domain };
    } catch (e) { /* fall through */ }
    return { name, domain: name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com' };
  }
  async function viaMicrolink(found) {
    const url = `https://api.microlink.io/?url=${encodeURIComponent('https://' + found.domain)}&palette=true&prerender=false`;
    const json = await fetch(url, { signal: withTimeout(14000) }).then((r) => r.json());
    if (json.status !== 'success') throw new Error('lookup failed');
    const d = json.data;
    const logoPal = (d.logo && d.logo.palette) || [];
    const imagePal = (d.image && d.image.palette) || [];
    return STM.liveBrand(found, STM.pickPrimary(logoPal, imagePal), d.logo && d.logo.url, logoPal.concat(imagePal), d.description || d.title);
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
          res(STM.liveBrand(found, STM.pickPrimary(pal, []), src, pal, ''));
        } catch (e) { rej(e); }
      };
      img.src = src;
    });
  }
  async function readLive(name, found) {
    const full = viaMicrolink(found).catch(() => null);
    const icon = viaIcon(found).catch(() => null);
    const later = wait(6000).then(() => icon);
    let b = await Promise.race([full, later]);
    if (!b) b = (await full) || (await icon);
    if (!b) throw new Error('no brand');
    return b;
  }
  // Offline: a believable brand from a hash of the name.
  function guessBrand(raw, domain) {
    const name = raw.trim().replace(/\s+/g, ' ').replace(/^./, (c) => c.toUpperCase());
    let h = 0;
    for (const ch of name.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const hue = h % 360;
    const p = hslHex(hue, 64, 44);
    return {
      name, domain: domain || key(name).replace(/-/g, '') + '.com', logo: null,
      head: p, headOn: '#FFFFFF', b: p, on: '#FFFFFF', accent: p,
      surface: mixWhite(p, 0.05), border: mixWhite(p, 0.16), font: 'system-ui, -apple-system, sans-serif',
      swatches: [p, hslHex(hue, 28, 14), hslHex((hue + 150) % 360, 60, 55), mixWhite(p, 0.05)],
      tone: 'Best guess — couldn’t reach their site',
      goal: `Announce what’s new at ${name}…`, audience: `${name} customers`, date: '28 October',
    };
  }

  /* ---------------- Rendering the client's app ---------------- */
  const mono = (br) => `<span class="mono-mk">${esc(br.name[0].toUpperCase())}</span>`;
  const logoOf = (br) => br.logo || mono(br);
  function fixImgs(root, br) {
    root.querySelectorAll('.chip img').forEach((img) => {
      img.addEventListener('error', () => { const chip = img.closest('.chip'); if (chip) chip.outerHTML = mono(br); }, { once: true });
    });
  }
  function paintVars(el, br) {
    const s = el.style;
    s.setProperty('--head', br.head); s.setProperty('--head-on', br.headOn);
    s.setProperty('--b', br.b); s.setProperty('--on', br.on);
    s.setProperty('--surface', br.surface); s.setProperty('--border', br.border);
    s.setProperty('--font', br.font);
  }
  function stepView(br, i) {
    const c = br.copy;
    const next = ['Next: assets', 'Next: compose', 'Next: review', 'Approve and send'][i];
    const cta = `<button type="button" class="ap-cta" data-next>${next}</button>`;
    if (i === 1) {
      return `<div class="ap-h">Assets</div><div class="ap-s">Synced from SharePoint · Brand / Guidelines</div>` +
        c.files.map((f) => `<div class="ap-file"><i></i><span>${esc(f)}</span><small>2 min ago</small></div>`).join('') + cta;
    }
    if (i === 2) {
      const subj = br.subjects[0];
      return `<div class="ap-h">Compose</div><div class="ap-s">Drafted by AI in ${esc(br.name)}’s voice</div>` +
        `<div class="ap-mail"><div class="ap-mail-bar">${br.logo && !/chip/.test(br.logo) ? br.logo : esc(br.name)}</div><div class="ap-mail-b"><b>${esc(subj)}</b>${esc(c.body)}</div></div>` + cta;
    }
    if (i === 3) {
      return `<div class="ap-h">Review</div><div class="ap-s">One approval before it sends on ${esc(br.date)}</div>` +
        `<div class="ap-who"><u>JL</u><div>Jordan Lee<small>Marketing lead · approver</small></div><em>Waiting</em></div>` +
        ['Brand colours and logo', 'Tone of voice', 'Links and unsubscribe'].map((t) => `<div class="ap-chk"><span>✓</span>${t}</div>`).join('') + cta;
    }
    return `<div class="ap-h">Tell us about the campaign</div><div class="ap-s">Four fields. The rest is written for you.</div>` +
      `<div class="ap-f"><label>Campaign goal</label><div class="ap-in" data-f="goal">${esc(br.goal)}</div></div>` +
      `<div class="ap-row"><div class="ap-f"><label>Audience</label><div class="ap-in" data-f="audience">${esc(br.audience)}</div></div>` +
      `<div class="ap-f"><label>Send date</label><div class="ap-in" data-f="date">${esc(br.date)}</div></div></div>` + cta;
  }
  function stepsHTML(step) {
    return STEPS.map((s, i) => `<button type="button" class="${i === step ? 'on' : i < step ? 'done' : ''}" data-step="${i}"><i>${i < step ? '✓' : i + 1}</i>${s}</button>`).join('');
  }
  const teamBy = (br) => `<div class="ap-by"><u>JL</u>Jordan · ${esc(br.name)} marketing</div>`;
  function aiHeadHTML(br) {
    return `<div class="ap-ai-h"><span class="ap-ai-av">${logoOf(br)}</span><div><b>${esc(br.name)} assistant</b><small>For ${esc(br.name)}’s team</small></div></div>`;
  }
  function threadHTML(br) {
    return `<div class="ap-msg">${esc(br.greet)}</div>` + teamBy(br) +
      `<div class="ap-msg me">Three subject lines?</div>` +
      `<div class="ap-msg"><ul>${br.subjects.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`;
  }
  function renderApp(root, br, step = 0, opts = {}) {
    root.__br = br; root.__step = step;
    paintVars(root, br);
    root.innerHTML =
      `<div class="ap-bar"><span class="ap-logo ${br.logoClass || ''}">${logoOf(br)}</span><span class="ap-name">${esc(br.name)}</span>` +
      (opts.phone ? `<span class="ap-ask" title="${esc(br.name)} assistant">${SPARK}<span>Ask</span></span>` : '<span class="ap-sep">/</span><span class="ap-title">Campaign email</span><span class="ap-live">Live</span>') + '</div>' +
      `<div class="ap-body"><div class="ap-main"><div class="ap-steps">${stepsHTML(step)}</div>` +
      (opts.phone ? `<div class="ph-step-l">Step ${step + 1} of 4 · ${STEPS[step]}</div>` : '') +
      `<div class="ap-card">${stepView(br, step)}</div></div>` +
      `<aside class="ap-ai">${aiHeadHTML(br)}<div class="ap-thread">${opts.thread === false ? '' : threadHTML(br)}</div></aside></div>`;
    fixImgs(root, br);
  }
  function goStep(root, i, opts = {}) {
    const br = root.__br;
    root.__step = i;
    root.querySelector('.ap-steps').innerHTML = stepsHTML(i);
    const lab = root.querySelector('.ph-step-l');
    if (lab) lab.textContent = `Step ${i + 1} of 4 · ${STEPS[i]}`;
    const card = root.querySelector('.ap-card');
    card.innerHTML = stepView(br, i);
    card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap');
    fixImgs(card, br);
    if (opts.onStep) opts.onStep(i);
  }
  function bindApp(root, opts = {}) {
    root.addEventListener('click', (e) => {
      if (!root.__br || root.classList.contains('locked')) return;
      const s = e.target.closest('[data-step]');
      if (s) return goStep(root, +s.dataset.step, opts);
      if (e.target.closest('[data-next]')) {
        if (root.__step === 3 && opts.onDone) return opts.onDone();
        goStep(root, Math.min(3, root.__step + 1), opts);
      }
    });
  }

  /* ---------------- Their website (stylised) ---------------- */
  function siteHTML(br) {
    const s = br.site;
    const logo = br.logo ? br.logo : `<span class="mono-mk">${esc(br.name[0].toUpperCase())}</span>`;
    return `<div class="st" style="--st-bg:${s.bg};--st-fg:${s.fg};--st-nav:${s.nav};--st-navfg:${s.navfg};--st-hero:${s.hero};--st-herofg:${s.herofg};--st-btn:${s.btn};--st-btnfg:${s.btnfg};--st-card:${s.card};--st-orb:${s.orb};--st-font:${br.font}">` +
      `<div class="st-nav" data-hex="${s.nav}"><span class="st-logo ${br.logoClass || ''}">${logo}</span><span class="st-links">${s.links.map((l) => `<span>${esc(l)}</span>`).join('')}</span><span class="st-ico"></span></div>` +
      `<div class="st-hero" data-hex="${s.hero}"><span class="st-kick">${esc(s.kick)}</span><span class="st-head">${esc(s.head)}</span><span class="st-btn" data-hex="${s.btn}">${esc(br.copy.cta)}</span></div>` +
      `<div class="st-grid"><i></i><i></i><i></i></div></div>`;
  }

  /* ================= THE BRAND SCAN ================= */
  const app = $('app');
  // The site being read lives in a card inside the builder's latest reply.
  let siteWin = null, siteView = null, hits = null, beam = null;
  const bcThread = $('bcThread');
  const YOU = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="3.6" fill="currentColor"/><path d="M4.8 20c.9-3.6 3.8-5.6 7.2-5.6s6.3 2 7.2 5.6" fill="currentColor"/></svg>';
  function bcScroll() { bcThread.scrollTo({ top: bcThread.scrollHeight, behavior: reduced() ? 'auto' : 'smooth' }); }
  function youSay(text) {
    bcThread.insertAdjacentHTML('beforeend', `<div class="bm you"><span class="av av-you">${YOU}</span><div class="bm-b">${esc(text)}</div></div>`);
    bcScroll();
  }
  function eaiSay(html) {
    bcThread.insertAdjacentHTML('beforeend', `<div class="bm eai"><span class="av av-eai">${SPARK}</span><div class="bm-b">${html}</div></div>`);
    const m = bcThread.lastElementChild;
    bcScroll();
    return m;
  }
  // A builder reply that reads a client's site: text + the scan card.
  function scanReply(domain) {
    bcThread.querySelectorAll('.scard:not(.done)').forEach((c) => { c.classList.add('done'); const sm = c.querySelector('.scard-sum'); if (!sm.innerHTML) sm.textContent = 'Stopped'; });
    const m = eaiSay(`<span class="bm-t">Reading <b>${esc(domain)}</b> for their logo, colours and tone of voice…</span>` +
      `<div class="scard"><div class="scard-bar"><span class="url"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="11" width="12" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 11V8a3 3 0 0 1 6 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg><span class="su">${esc(domain)}</span><b class="url-load"></b></span><span class="win-tag">Their website</span></div>` +
      `<div class="scard-body"><div class="site-view"></div><div class="site-ghost"></div><div class="beam"><i></i></div><div class="hits"></div></div><div class="scard-sum"></div></div>`);
    siteWin = m.querySelector('.scard');
    siteView = m.querySelector('.site-view');
    hits = m.querySelector('.hits');
    beam = m.querySelector('.beam');
    return m;
  }
  function setUrl(t) { if (siteWin) siteWin.querySelector('.su').textContent = t; }
  function cardDone(br) {
    if (!siteWin) return;
    siteWin.querySelector('.scard-sum').innerHTML = `<span class="ok">✓</span>Read ${esc(br.domain)}` + br.swatches.slice(0, 4).map((h) => `<s style="background:${h}"></s>`).join('') + '<span class="dim">logo · tone</span>';
  }
  const core = $('core');
  const cmd = $('cmd');
  const input = $('cmdIn');
  const roText = $('roText');
  const roSw = $('roSw');
  const readout = $('readout');
  const tone = $('tone');
  let run = 0;
  let current = CURATED.nike;
  const clients = [CURATED.nike]; // live in the hero (scanned)
  const known = [CURATED.nike, CURATED.apple, CURATED.commbank]; // everything the page can show

  class Cancelled extends Error {}
  const sleep = (ms, id) => new Promise((res, rej) => setTimeout(() => (id === run ? res() : rej(new Cancelled())), ms));
  const say = (t) => { roText.textContent = t; };

  function setScan(pct) { siteWin.style.setProperty('--scan', pct + '%'); }
  function showSite(br, instant) {
    const old = siteView.querySelector('.st');
    siteView.insertAdjacentHTML('beforeend', siteHTML(br));
    const st = siteView.lastElementChild;
    fixImgs(st, br);
    if (old) {
      if (instant) old.remove();
      else { old.classList.add('out'); setTimeout(() => old.remove(), 520); }
    }
    return st;
  }
  function loadBar(ms) {
    const b = siteWin.querySelector('.url-load');
    b.getAnimations().forEach((a) => a.cancel());
    b.animate([{ width: '0%', opacity: 1 }, { width: '85%', offset: 0.7 }, { width: '100%', opacity: 0 }], { duration: ms, easing: 'ease-out' });
  }
  function center(el) { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r }; }

  // Scan targets on the rendered site: boxes with a label, in the order the beam meets them.
  function targetsOf(st, br) {
    const s = br.site;
    const list = [
      { el: st.querySelector('.st-logo'), label: 'Logo' },
      { el: st.querySelector('.st-head'), label: 'Tone of voice', pos: 'tr' },
      { el: st.querySelector('.st-btn'), hex: s.btn, pos: 'r' },
    ];
    if (s.nav.toUpperCase() !== s.bg.toUpperCase()) list.push({ el: st.querySelector('.st-links') || st.querySelector('.st-nav'), hex: s.nav, below: true });
    if (siteView.clientWidth > 420) list.push({ el: st.querySelector('.st-hero'), hex: s.hero, point: true });
    const base = siteView.getBoundingClientRect();
    return list.filter((t) => t.el).map((t) => {
      const r = t.el.getBoundingClientRect();
      const box = t.point
        ? { left: r.right - base.left - 58, top: r.top - base.top + 16, width: 40, height: 40 }
        : { left: r.left - base.left - 4, top: r.top - base.top - 3, width: r.width + 8, height: r.height + 6 };
      return Object.assign(t, { box, at: (box.left + box.width / 2) / base.width });
    }).sort((a, b) => a.at - b.at);
  }
  function drawHit(t) {
    const d = document.createElement('div');
    d.className = 'hit' + (t.below ? ' below' : '') + (t.pos ? ' ' + t.pos : '');
    Object.assign(d.style, { left: t.box.left + 'px', top: t.box.top + 'px', width: t.box.width + 'px', height: t.box.height + 'px' });
    if (t.point) d.style.borderRadius = '50%';
    d.innerHTML = `<b>${t.hex ? `<s style="background:${t.hex}"></s>${t.hex.toUpperCase()}` : t.label}</b>`;
    hits.appendChild(d);
    t.node = d;
  }
  function sweep(targets, id, ms) {
    return new Promise((res, rej) => {
      beam.classList.add('on');
      const t0 = performance.now();
      let k = 0;
      const tick = (now) => {
        if (id !== run) { beam.classList.remove('on'); return rej(new Cancelled()); }
        const p = Math.min(1, (now - t0) / ms);
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        setScan(e * 100);
        while (k < targets.length && targets[k].at <= e) drawHit(targets[k++]);
        if (p < 1) requestAnimationFrame(tick);
        else { while (k < targets.length) drawHit(targets[k++]); beam.classList.remove('on'); res(); }
      };
      requestAnimationFrame(tick);
    });
  }
  // Idle "reading" beam while a live lookup is in flight.
  let idleAnim = null;
  function idleBeam(on) {
    if (idleAnim) { idleAnim.cancel(); idleAnim = null; }
    beam.classList.toggle('on', on);
    if (on && !reduced()) {
      idleAnim = siteWin.animate([{ '--scan': '0%' }, { '--scan': '100%' }], { duration: 1400, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
    }
  }

  // A glowing particle along a curve that passes through the EAI core.
  function flyPath(from, to, via, lift) {
    const cx = 2 * via.x - (from.x + to.x) / 2;
    const cy = 2 * via.y - (from.y + to.y) / 2 + lift;
    const frames = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * cx + t * t * to.x;
      const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * cy + t * t * to.y;
      const sc = t < 0.15 ? 0.3 + t * 5 : t > 0.85 ? 1 - (t - 0.85) * 4 : 1;
      frames.push({ transform: `translate(${x}px, ${y}px) scale(${sc})`, offset: t });
    }
    return frames;
  }
  function particle(hex, frames, delay, trail) {
    const d = document.createElement('i');
    d.className = 'px' + (trail ? ' sm' : '');
    d.style.setProperty('--c', lum(hex) < 0.03 ? '#9DB8FF' : hex);
    d.style.background = hex;
    if (trail) { const k = 1 - trail / 9; d.style.width = d.style.height = (10 * k + 2) + 'px'; d.style.margin = -(5 * k + 1) + 'px 0 0 ' + -(5 * k + 1) + 'px'; d.style.opacity = String(k * 0.9); }
    d.style.transform = frames[0].transform;
    document.body.appendChild(d);
    const a = d.animate(frames, { duration: 1050, delay, easing: 'cubic-bezier(.55,.05,.35,1)', fill: 'both' });
    a.finished.then(() => d.remove(), () => d.remove());
    return a;
  }
  function ripple(x, y, hex) {
    const r = document.createElement('i');
    r.className = 'ripple';
    r.style.setProperty('--c', hex);
    r.style.left = x + 'px'; r.style.top = y + 'px';
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 750);
  }
  function applyVars(br, which) {
    const s = app.style;
    const map = { head: [['--head', br.head], ['--head-on', br.headOn]], b: [['--b', br.b], ['--on', br.on]], surface: [['--surface', br.surface], ['--border', br.border]] };
    (map[which] || []).forEach(([k, v]) => s.setProperty(k, v));
  }

  async function flights(br, targets, id) {
    const via = center(core);
    const pick = (hex) => {
      const t = targets.find((x) => x.hex && x.hex.toUpperCase() === hex.toUpperCase());
      const base = siteView.getBoundingClientRect();
      if (t) return { x: base.left + t.box.left + t.box.width / 2, y: base.top + t.box.top + t.box.height / 2 };
      return center(siteView.querySelector('.st-hero'));
    };
    const jobs = [
      { hex: br.head, to: '.ap-bar', vars: 'head' },
      { hex: br.b, to: '.ap-steps .on', vars: 'b' },
      { hex: br.surface, to: '.ap-main', vars: 'surface' },
    ];
    const extra = br.swatches.find((h) => ![br.head, br.b, br.surface].map((x) => x.toUpperCase()).includes(h.toUpperCase()));
    if (extra) jobs.push({ hex: extra, to: '.ap-ai-h' });
    const done = jobs.map((j, i) => {
      const from = pick(j.hex);
      const to = center(app.querySelector(j.to) || app);
      const frames = flyPath(from, to, via, (i - 1.5) * 34);
      ripple(from.x, from.y, '#FFFFFF');
      const a = particle(j.hex, frames, i * 170);
      for (let k = 1; k <= 7; k++) particle(j.hex, frames, i * 170 + k * 26, k);
      setTimeout(() => {
        if (id !== run) return;
        core.classList.remove('hot'); void core.offsetWidth; core.classList.add('hot');
      }, i * 170 + 480);
      return a.finished.then(() => {
        if (id !== run) return;
        ripple(to.x, to.y, j.hex);
        if (j.vars) applyVars(br, j.vars);
      }, () => {});
    });
    await Promise.all(done);
    if (id !== run) throw new Cancelled();
  }

  async function logoFlight(br, st, id) {
    const src = st.querySelector('.st-logo');
    const dst = app.querySelector('.ap-logo');
    const a = center(src), b = center(dst);
    const f = document.createElement('div');
    f.className = 'logo-fly';
    f.innerHTML = logoOf(br);
    document.body.appendChild(f);
    const w = f.offsetWidth, h = f.offsetHeight;
    const via = center(core);
    const frames = flyPath({ x: a.x - w / 2, y: a.y - h / 2 }, { x: b.x - w / 2, y: b.y - h / 2 }, { x: via.x - w / 2, y: via.y - h / 2 }, -60)
      .map((k, i, arr) => ({ transform: k.transform.replace(/scale\([^)]+\)/, `scale(${i === arr.length - 1 ? 0.7 : 1 + Math.sin((i / 20) * Math.PI) * 0.9})`), offset: k.offset }));
    const an = f.animate(frames, { duration: 900, easing: 'cubic-bezier(.55,.05,.35,1)', fill: 'both' });
    try { await an.finished; } catch (e) { /* cancelled */ }
    f.remove();
    if (id !== run) throw new Cancelled();
    const logo = app.querySelector('.ap-logo');
    logo.className = 'ap-logo land ' + (br.logoClass || '');
    logo.innerHTML = logoOf(br);
    fixImgs(logo, br);
    app.querySelector('.ap-name').textContent = br.name;
    const head = app.querySelector('.ap-ai-h');
    head.outerHTML = aiHeadHTML(br);
    fixImgs(app.querySelector('.ap-ai-h'), br);
    app.style.setProperty('--font', br.font);
    ripple(b.x, b.y, '#FFFFFF');
  }

  async function typeText(el, text, id, per = 18) {
    el.textContent = '';
    el.classList.add('ap-caret');
    for (let i = 1; i <= text.length; i++) {
      el.textContent = text.slice(0, i);
      await sleep(per, id);
    }
    el.classList.remove('ap-caret');
  }
  async function voice(br, id) {
    $('toneV').textContent = br.tone;
    tone.classList.add('on');
    const thread = app.querySelector('.ap-thread');
    thread.innerHTML = '';
    const g = document.createElement('div');
    g.className = 'ap-msg';
    thread.appendChild(g);
    await typeText(g, br.greet, id, 16);
    await sleep(250, id);
    thread.insertAdjacentHTML('beforeend', teamBy(br) + '<div class="ap-msg me">Three subject lines?</div>');
    await sleep(450, id);
    thread.insertAdjacentHTML('beforeend', `<div class="ap-msg"><ul>${br.subjects.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`);
  }
  async function fields(br, id) {
    if (app.__step !== 0) goStep(app, 0);
    for (const f of ['goal', 'audience', 'date']) {
      const el = app.querySelector(`[data-f="${f}"]`);
      if (el) await typeText(el, br[f], id, 14);
    }
  }
  function swatchesOut(br) {
    roSw.innerHTML = br.swatches.slice(0, 4).map((h, i) => `<span style="--c:${h};animation-delay:${i * 90}ms"><s></s>${h.toUpperCase()}</span>`).join('');
  }
  function renderClients() {
    const el = $('roClients');
    el.innerHTML = '<b>Live for</b>' + clients.map((c) => `<button type="button" data-k="${c.key}" class="${c === current ? 'on' : ''}" style="--c:${glowFor(c)}"><i></i>${esc(c.name)}</button>`).join('');
  }
  function cleanupFx() {
    document.querySelectorAll('.px, .logo-fly, .ripple').forEach((n) => n.remove());
    if (hits) hits.innerHTML = '';
    if (beam) idleBeam(false);
  }

  // Apply a brand instantly (reduced motion, or switching back to a client).
  function applyInstant(br) {
    run++;
    cleanupFx();
    if (!siteWin || siteWin.classList.contains('done')) scanReply(br.domain);
    siteView.innerHTML = '';
    showSite(br, true);
    setScan(100);
    setUrl(br.domain);
    cardDone(br);
    eaiSay(`Done. Same four steps, same wiring — now in ${esc(br.name)}’s brand. ${esc(br.name)}’s team gets the ${esc(br.name)} assistant.`);
    renderApp(app, br, 0);
    $('toneV').textContent = br.tone;
    tone.classList.add('on');
    swatchesOut(br);
    say(`Live for ${br.name} — same four steps, same wiring`);
    setBusy(false);
    setCurrent(br);
  }
  function setBusy(b) { cmd.classList.toggle('busy', b); readout.classList.toggle('busy', b); }

  async function scan(raw) {
    const q = raw.trim();
    if (!q) return;
    const id = ++run;
    cleanupFx();
    setBusy(true);
    tone.classList.remove('on');
    const t0 = performance.now();
    try {
      let br = curated(q);
      if (br && br === current && clients.includes(br) && app.__br === br) {
        // Scanning the current client again still plays: it is the show.
      }
      if (reduced()) {
        if (!br) {
          say(`Reading ${q}…`);
          eaiSay(`Reading ${esc(q)}…`);
          const found = await findDomain(q);
          try { br = decorate(await readLive(q, found)); } catch (e) { br = decorate(guessBrand(q, found.domain)); }
          if (id !== run) return;
        }
        addClient(br);
        applyInstant(br);
        return;
      }
      // 1. Open their site.
      let domain = br ? br.domain : q.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (!br && !/\./.test(domain)) domain = domain.replace(/[^a-z0-9]/g, '') + '.com';
      const reply = scanReply(domain);
      say(`Opening ${domain}…`);
      if (!br) {
        idleBeam(true);
        loadBar(3000);
        setScan(0);
        const found = await findDomain(q);
        if (id !== run) return;
        setUrl(found.domain);
        reply.querySelector('.bm-t').innerHTML = `Reading <b>${esc(found.domain)}</b> for their logo, colours and tone of voice…`;
        say(`Reading ${found.domain} — logo, colours, tone of voice…`);
        try {
          br = await Promise.race([readLive(q, found), wait(16000).then(() => { throw new Error('slow'); })]);
        } catch (e) { br = guessBrand(q, found.domain); }
        if (id !== run) return;
        br = decorate(br);
        idleBeam(false);
      } else {
        loadBar(700);
      }
      setScan(0);
      const st = showSite(br);
      await sleep(620, id);
      // 2. Sweep.
      say(`Scanning ${br.domain}`);
      const targets = targetsOf(st, br);
      await sweep(targets, id, 1500);
      swatchesOut(br);
      say(`Found ${br.swatches.length} colours, a logo and a tone of voice`);
      await sleep(250, id);
      // 3. Colours fly into the app.
      renderAppKeepLook(br);
      await flights(br, targets, id);
      // 4. Logo lands; 5. voice.
      await logoFlight(br, st, id);
      hits.classList.add('fade');
      setCurrent(br);
      addClient(br);
      cardDone(br);
      reply.querySelector('.bm-t').innerHTML = `Read <b>${esc(br.domain)}</b>: ${br.swatches.length} colours, the logo and a tone of voice — <i>${esc(br.tone)}</i>.`;
      eaiSay(`Done. Same four steps, same wiring — now in ${esc(br.name)}’s brand. ${esc(br.name)}’s team gets the ${esc(br.name)} assistant, in their voice.`);
      const secs = ((performance.now() - t0) / 1000).toFixed(1);
      say(`Live for ${br.name} — repainted in ${secs}s · same four steps, same wiring`);
      setBusy(false);
      await Promise.all([voice(br, id), fields(br, id)]);
      hits.classList.remove('fade');
      hits.innerHTML = '';
      if (id === run) siteWin.classList.add('settled');
    } catch (e) {
      if (!(e instanceof Cancelled)) { console.warn(e); setBusy(false); }
    }
  }
  // Swap the app's content to the new brand but keep the old look, so the
  // particles are what repaint it.
  function renderAppKeepLook(br) {
    const old = app.__br;
    const step = app.__step || 0;
    const keep = ['--head', '--head-on', '--b', '--on', '--surface', '--border', '--font'].map((k) => [k, app.style.getPropertyValue(k)]);
    const logo = app.querySelector('.ap-logo').outerHTML;
    const aiHead = app.querySelector('.ap-ai-h').outerHTML;
    const name = old ? old.name : br.name;
    const vals = [...app.querySelectorAll('[data-f]')].map((n) => [n.dataset.f, n.textContent]);
    renderApp(app, br, step, { thread: false });
    vals.forEach(([f, v]) => { const n = app.querySelector(`[data-f="${f}"]`); if (n) n.textContent = v; });
    keep.forEach(([k, v]) => app.style.setProperty(k, v));
    app.querySelector('.ap-logo').outerHTML = logo;
    app.querySelector('.ap-ai-h').outerHTML = aiHead;
    app.querySelector('.ap-name').textContent = name;
    app.querySelector('.ap-thread').innerHTML = old ? `<div class="ap-msg">${esc(old.greet)}</div>` : '';
  }

  // The maker talks to the builder. Client names rebrand; structure asks get a builder answer.
  function tell(text) {
    const t = text.trim();
    if (!t) return;
    youSay(t);
    input.value = '';
    if (/\bsteps?\b|approval|approver|sign-?off/i.test(t) && !/\bfor\b\s+\w/i.test(t.replace(/^.*?(approval|steps?)\b/i, ''))) {
      setTimeout(() => eaiSay(`It already has one — <b>Review</b> is the approval step (Jordan Lee signs off). Apps are exactly four steps: Brief → Assets → Compose → Review. That’s what makes them resell.`), reduced() ? 0 : 450);
      return;
    }
    if (/\b(tone|warmer|friendlier|formal|voice|playful)\b/i.test(t)) {
      const was = current.tone;
      current.tone = /warm|friend/i.test(t) ? was.replace(/,?\s*warmer$/, '') + ', warmer' : was;
      $('toneV').textContent = current.tone;
      setTimeout(() => eaiSay(`Done — the ${esc(current.name)} assistant now writes <i>${esc(current.tone.toLowerCase())}</i>. Same four steps.`), reduced() ? 0 : 450);
      return;
    }
    const name = t.replace(/^(ok(ay)?[,!]?\s+)?(please\s+)?(now\s+)?((make|rebrand|re-?skin|do|build|set up|turn)\s+(it|this|the app|one)?\s*(right\s+)?(for|as|into)\s+)?/i, '')
      .replace(/^(for|as)\s+/i, '').replace(/[.!?]+$/, '').trim();
    scan(name || t);
  }
  cmd.addEventListener('submit', (e) => { e.preventDefault(); stopAuto(); tell(input.value); input.blur(); });
  $('cmdChips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-say]');
    if (!b) return;
    stopAuto();
    tell(b.dataset.say);
  });
  $('roClients').addEventListener('click', (e) => {
    const b = e.target.closest('[data-k]');
    if (!b) return;
    const br = clients.find((c) => c.key === b.dataset.k);
    if (!br) return;
    stopAuto();
    youSay(`Switch back to ${br.name}`);
    applyInstant(br);
  });
  bindApp(app);

  // Auto-play once: Nike is live; type "Apple" and scan.
  let autoOn = true;
  function stopAuto() { autoOn = false; }
  input.addEventListener('focus', stopAuto);
  input.addEventListener('keydown', stopAuto);
  async function autoplay() {
    await wait(1700);
    if (!autoOn) return;
    const say1 = 'Make it right for Apple';
    if (reduced()) { youSay(say1); addClient(CURATED.apple); applyInstant(CURATED.apple); return; }
    for (let i = 1; i <= say1.length; i++) {
      if (!autoOn) return;
      input.value = say1.slice(0, i);
      await wait(55);
    }
    await wait(350);
    if (!autoOn) return;
    cmd.querySelector('.cmd-go kbd').animate([{ transform: 'scale(1)' }, { transform: 'scale(0.88)' }, { transform: 'scale(1)' }], { duration: 260 });
    tell(say1);
  }

  /* ================= DECK: one app, many clients ================= */
  const deckEl = $('deckEl');
  const inner = document.createElement('div');
  inner.className = 'deck-inner';
  deckEl.appendChild(inner);
  let order = []; // brand keys, [0] = top
  const cards = new Map();
  function deckScale() { return deckEl.clientWidth < 600 ? Math.min(0.6, (deckEl.clientWidth - 20) / 560) : 1; }
  function addCard(br) {
    if (cards.has(br.key)) return cards.get(br.key);
    const c = document.createElement('div');
    c.className = 'card' + (br.fresh ? ' fresh' : '');
    c.style.setProperty('--c', glowFor(br));
    c.setAttribute('role', 'button');
    c.tabIndex = 0;
    c.setAttribute('aria-label', `${br.name} — bring to front`);
    const a = document.createElement('div');
    a.className = 'app';
    c.appendChild(a);
    renderApp(a, br, 0);
    c.__br = br;
    inner.appendChild(c);
    cards.set(br.key, c);
    bindCard(c);
    return c;
  }
  function layoutDeck() {
    const fan = deckEl.classList.contains('fan');
    const n = order.length;
    inner.style.transform = `scale(${deckScale()})`;
    order.forEach((k, i) => {
      const c = cards.get(k);
      if (!c || c.classList.contains('drag')) return;
      c.classList.toggle('top', i === 0);
      c.style.zIndex = String(100 - i);
      let t;
      if (fan) {
        const side = i === 0 ? 0 : (i % 2 ? 1 : -1) * Math.ceil(i / 2);
        const spread = Math.min(1, 4 / Math.max(n - 1, 1));
        t = `translate3d(${side * 230 * spread}px, ${Math.abs(side) * 26}px, ${-Math.abs(side) * 40}px) rotate(${side * 7 * spread}deg)`;
      } else {
        const d = Math.min(i, 4);
        t = `translate3d(${d * 44}px, ${d * -22}px, ${-d * 80}px) rotate(${d * 3.2}deg)`;
      }
      c.style.transform = t;
      c.style.opacity = i > 5 ? '0' : '1';
    });
    const top = cards.get(order[0]).__br;
    $('deckNow').textContent = top.name;
    $('deckTone').textContent = top.tone;
    $('deckCount').textContent = `${order.length} clients · 1 app · 0 rebuilds`;
  }
  function toFront(k) { order = [k].concat(order.filter((x) => x !== k)); layoutDeck(); }
  function toBack(k) { order = order.filter((x) => x !== k).concat(k); layoutDeck(); }
  function bindCard(c) {
    let sx = 0, sy = 0, dx = 0, dy = 0, down = false, moved = false, pid = null;
    c.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      down = true; moved = false; sx = e.clientX; sy = e.clientY; dx = dy = 0; pid = e.pointerId;
    });
    c.addEventListener('pointermove', (e) => {
      if (!down || e.pointerId !== pid) return;
      dx = e.clientX - sx; dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) > 6 && order[0] === c.__br.key) {
        moved = true; c.setPointerCapture(pid); c.classList.add('drag');
      }
      if (moved) {
        const s = deckScale();
        c.style.transform = `translate3d(${dx / s}px, ${dy / s}px, 40px) rotate(${dx * 0.04}deg)`;
      }
    });
    const end = () => {
      if (!down) return;
      down = false;
      if (moved) {
        c.classList.remove('drag');
        if (Math.abs(dx) > 110) {
          const s = deckScale();
          c.style.transform = `translate3d(${(dx > 0 ? 1 : -1) * 620 / s}px, ${dy / s}px, 0) rotate(${dx > 0 ? 16 : -16}deg)`;
          c.style.zIndex = '1';
          setTimeout(() => toBack(c.__br.key), 260);
        } else layoutDeck();
      } else if (order[0] !== c.__br.key) {
        toFront(c.__br.key);
      }
    };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);
    c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); order[0] === c.__br.key ? toBack(c.__br.key) : toFront(c.__br.key); } });
  }
  deckEl.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { deckEl.classList.add('fan'); layoutDeck(); } });
  deckEl.addEventListener('pointerleave', () => { deckEl.classList.remove('fan'); layoutDeck(); });

  /* ================= FOUR STEPS: the wire ================= */
  const wire = $('wire');
  const nodes = [...wire.querySelectorAll('.node')];
  const wBase = $('wireBase'), wPulse = $('wirePulse'), wHead = $('wireHead');
  const sdApp = $('sdApp');
  let wireLen = 0, nodeAt = [], sel = 0, userSelUntil = 0, wireVisible = false;
  const SD = [
    ['Step 01 · Form', 'The brief', 'Four fields the client fills in — goal, audience, send date. Everything after this is written for them.'],
    ['Step 02 · Data source', 'The assets', 'Brand guides, product shots and offers, synced from where the client already keeps them. Every campaign reads what’s current.'],
    ['Step 03 · AI writer', 'The draft', 'The AI writer composes the email from the brief and the assets — in the client’s tone of voice, not yours.'],
    ['Step 04 · Approval', 'The sign-off', 'One named approver checks brand, tone and links. Nothing sends without them.'],
  ];
  function buildWire() {
    const wr = wire.getBoundingClientRect();
    const pts = nodes.map((n) => { const r = n.querySelector('.node-orb').getBoundingClientRect(); return { x: r.left - wr.left + r.width / 2, y: r.top - wr.top + r.height / 2 }; });
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const mx = (a.x + b.x) / 2;
      const wave = Math.abs(a.y - b.y) < 4 ? (i % 2 ? -26 : 26) : 0;
      if (Math.abs(a.y - b.y) < 4) d += ` C ${a.x + (b.x - a.x) * 0.35} ${a.y + wave}, ${a.x + (b.x - a.x) * 0.65} ${b.y + wave}, ${b.x} ${b.y}`;
      else d += ` C ${a.x} ${a.y + (b.y - a.y) * 0.8}, ${b.x} ${b.y - (b.y - a.y) * 0.8}, ${b.x} ${b.y}`;
      void mx;
    }
    wBase.setAttribute('d', d);
    wPulse.setAttribute('d', d);
    wireLen = wBase.getTotalLength();
    nodeAt = pts.map((p) => {
      let best = 0, bd = Infinity;
      for (let l = 0; l <= wireLen; l += 6) { const q = wBase.getPointAtLength(l); const dd = Math.hypot(q.x - p.x, q.y - p.y); if (dd < bd) { bd = dd; best = l; } }
      return best;
    });
    setPulse(reduced() ? wireLen : 0);
  }
  const SEG = 140;
  function setPulse(p) {
    wPulse.style.strokeDasharray = `${SEG} ${wireLen + SEG}`;
    wPulse.style.strokeDashoffset = String(SEG - p);
    const q = wBase.getPointAtLength(Math.max(0, Math.min(wireLen, p)));
    wHead.setAttribute('cx', q.x); wHead.setAttribute('cy', q.y);
    nodes.forEach((n, i) => n.classList.toggle('lit', Math.abs(p - nodeAt[i]) < 50));
  }
  function selectStep(i, fromUser) {
    if (fromUser) userSelUntil = performance.now() + 9000;
    if (i === sel && sdApp.__br === current && !fromUser) return;
    sel = i;
    nodes.forEach((n, k) => n.classList.toggle('on', k === i));
    $('sdK').textContent = SD[i][0];
    $('sdH').textContent = SD[i][1];
    $('sdP').textContent = SD[i][2];
    const copy = document.querySelector('.sd-copy');
    copy.classList.remove('fade'); void copy.offsetWidth; copy.classList.add('fade');
    if (sdApp.__br !== current) renderApp(sdApp, current, i);
    else goStep(sdApp, i);
  }
  nodes.forEach((n, i) => n.addEventListener('click', () => selectStep(i, true)));
  bindApp(sdApp, { onStep: (i) => { userSelUntil = performance.now() + 9000; sel = i; nodes.forEach((n, k) => n.classList.toggle('on', k === i)); $('sdK').textContent = SD[i][0]; $('sdH').textContent = SD[i][1]; $('sdP').textContent = SD[i][2]; }, onDone: () => selectStep(0, true) });
  let wireT0 = 0;
  function wireLoop(now) {
    if (!wireVisible || reduced()) return;
    if (!wireT0) wireT0 = now;
    const period = 4200;
    const t = ((now - wireT0) % period) / period;
    const p = Math.min(1, t / 0.8) * (wireLen + SEG * 0.3);
    setPulse(p);
    if (performance.now() > userSelUntil) {
      for (let i = nodeAt.length - 1; i >= 0; i--) { if (p >= nodeAt[i] - 10) { if (sel !== i) selectStep(i); break; } }
    }
    requestAnimationFrame(wireLoop);
  }

  /* ================= AI in every app ================= */
  const aiPanel = $('aiPanel'), aipThread = $('aipThread');
  let aiBr = null, aiBusy = 0;
  function pickerHTML(active) {
    return known.map((c) => `<button type="button" data-k="${c.key}" class="${c === active ? 'on' : ''}" style="--c:${glowFor(c)}"><i></i>${esc(c.name)}</button>`).join('');
  }
  function setAI(br) {
    aiBr = br;
    aiBusy++;
    const s = aiPanel.style;
    s.setProperty('--pb', br.b); s.setProperty('--pon', br.on); s.setProperty('--pfont', br.font);
    s.setProperty('--phead', br.head); s.setProperty('--pheadon', br.headOn);
    aiPanel.parentElement.style.setProperty('--pc', glowFor(br));
    $('aipLogo').innerHTML = logoOf(br);
    fixImgs($('aipLogo'), br);
    $('aipName').textContent = br.name;
    $('aipTeam').textContent = br.name;
    avFor($('whoAv'), br);
    $('whoName').textContent = `${br.name} assistant — ${br.name}’s team, using the app`;
    $('aipVoice').textContent = br.tone;
    aipThread.innerHTML = `<div class="aip-msg">${esc(br.greet)}</div>`;
    $('aiPick').innerHTML = pickerHTML(br);
    $('aipPrompts').querySelectorAll('button').forEach((b) => { b.disabled = false; });
  }
  $('aiPick').addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) setAI(known.find((c) => c.key === b.dataset.k)); });
  $('aipPrompts').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-p]');
    if (!b || !aiBr) return;
    const token = ++aiBusy;
    const br = aiBr;
    const btns = $('aipPrompts').querySelectorAll('button');
    btns.forEach((x) => { x.disabled = true; });
    while (aipThread.children.length > 4) aipThread.firstElementChild.remove();
    aipThread.insertAdjacentHTML('beforeend', `<div class="aip-by"><u>JL</u>Jordan · ${esc(br.name)} marketing</div><div class="aip-msg me">${esc(b.textContent)}</div>`);
    await wait(reduced() ? 0 : 500);
    if (token !== aiBusy) return;
    const m = document.createElement('div');
    m.className = 'aip-msg';
    aipThread.appendChild(m);
    const p = +b.dataset.p;
    if (p === 0) {
      m.innerHTML = `In ${esc(br.name)}’s voice — ${esc(br.tone.toLowerCase())}:<ul></ul>`;
      const ul = m.querySelector('ul');
      for (const s of br.subjects) { if (token !== aiBusy) return; ul.insertAdjacentHTML('beforeend', `<li>${esc(s)}</li>`); await wait(reduced() ? 0 : 260); }
    } else {
      const text = p === 1 ? br.short : br.sms + ' Reply STOP to opt out.';
      if (reduced()) m.textContent = text;
      else {
        m.classList.add('ap-caret');
        for (let i = 1; i <= text.length; i++) { if (token !== aiBusy) return; m.textContent = text.slice(0, i); await wait(14); }
        m.classList.remove('ap-caret');
      }
    }
    if (token === aiBusy) btns.forEach((x) => { x.disabled = false; });
  });

  /* ================= Phone + share ================= */
  const phScreen = $('phScreen');
  let phBr = null;
  function shareURL(br) {
    let q;
    if (CURATED[br.key]) q = `c=${br.key}`;
    else {
      const p = new URLSearchParams({ n: br.name, d: br.domain, p: br.b.replace('#', '') });
      const m = /src="([^"]+)"/.exec(br.logo || '');
      if (m) p.set('l', m[1].replace(/&amp;/g, '&'));
      q = p.toString();
    }
    return new URL('../../app.html?' + q, location.href).href;
  }
  function setPhone(br) {
    phBr = br;
    let a = phScreen.querySelector('.app');
    if (!a) { a = document.createElement('div'); a.className = 'app'; phScreen.appendChild(a); bindApp(a, { onDone: () => doneFlash(a) }); }
    renderApp(a, br, 0, { phone: true, thread: false });
    $('phoneStage').style.setProperty('--pc', glowFor(br));
    $('qrName').textContent = br.name;
    avFor($('phAv'), br);
    $('phWho').textContent = `${br.name}’s team, on their phone`;
    const url = shareURL(br);
    $('qrUrl').textContent = url.replace(/^.*\/(app\.html\?)/, '$1').slice(0, 26) + (url.length > 60 ? '…' : '');
    if (window.QRCode) window.QRCode.toCanvas($('qr'), url, { width: 112, margin: 0, errorCorrectionLevel: 'L' }, () => {});
    $('phPick').innerHTML = pickerHTML(br);
  }
  function doneFlash(a) {
    const card = a.querySelector('.ap-card');
    card.innerHTML = `<div class="ap-h">Sent ✓</div><div class="ap-s">Approved by Jordan Lee. Scheduled for ${esc(a.__br.date)}.</div><button type="button" class="ap-cta" data-step="0">Start another</button>`;
  }
  $('phPick').addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) setPhone(known.find((c) => c.key === b.dataset.k)); });
  $('qrCard').addEventListener('click', () => { if (phBr) window.open(shareURL(phBr), '_blank', 'noopener'); });
  const phoneStage = $('phoneStage'), phone = $('phone');
  phoneStage.addEventListener('pointermove', (e) => {
    if (reduced() || e.pointerType !== 'mouse') return;
    const r = phoneStage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    phone.style.setProperty('--ry', `${x * 22}deg`);
    phone.style.setProperty('--rx', `${-y * 14}deg`);
  });
  phoneStage.addEventListener('pointerleave', () => { phone.style.removeProperty('--ry'); phone.style.removeProperty('--rx'); });

  /* ================= Shared state ================= */
  function addClient(br) {
    // A live brand scanned twice keeps one entry.
    if (!clients.includes(br) && !clients.find((c) => c.key === br.key)) clients.push(br);
    if (!known.includes(br) && !known.find((c) => c.key === br.key)) known.push(br);
    addCard(br);
    renderClients();
  }
  function avFor(el, br) {
    el.textContent = br.name[0].toUpperCase();
    const c = glowFor(br);
    el.style.setProperty('--c', c);
    el.style.setProperty('--con', inkFor(c));
  }
  function setCurrent(br) {
    current = br;
    avFor($('capAv'), br);
    $('capWho').textContent = `${br.name}’s team, using the app`;
    $('capS').textContent = `Published app · ${br.name} assistant on the right`;
    document.documentElement.style.setProperty('--glow', glowFor(br));
    renderClients();
    if (!cards.has(br.key)) addCard(br);
    toFront(br.key);
    setAI(br);
    setPhone(br);
    renderApp(sdApp, br, sel);
  }

  /* ================= Atmosphere + reveals ================= */
  const root = document.documentElement;
  let mx = innerWidth / 2, my = innerHeight * 0.3, tx = mx, ty = my, spotRaf = 0;
  function spot() {
    mx += (tx - mx) * 0.14; my += (ty - my) * 0.14;
    root.style.setProperty('--mx', mx.toFixed(1) + 'px');
    root.style.setProperty('--my', my.toFixed(1) + 'px');
    spotRaf = Math.abs(tx - mx) + Math.abs(ty - my) > 0.5 ? requestAnimationFrame(spot) : 0;
  }
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    tx = e.clientX; ty = e.clientY;
    if (reduced()) { mx = tx; my = ty; root.style.setProperty('--mx', mx + 'px'); root.style.setProperty('--my', my + 'px'); return; }
    if (!spotRaf) spotRaf = requestAnimationFrame(spot);
  }, { passive: true });
  root.style.setProperty('--mx', mx + 'px'); root.style.setProperty('--my', my + 'px');

  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.sec .rv, .sec .rv-fade, .cta .rv, .cta .rv-fade').forEach((el) => io.observe(el));
  const wio = new IntersectionObserver((es) => es.forEach((e) => {
    wireVisible = e.isIntersecting;
    if (wireVisible && !reduced()) { wireT0 = 0; requestAnimationFrame(wireLoop); }
  }), { threshold: 0.2 });
  wio.observe(wire);
  // The assistant answers once on its own when it scrolls into view.
  let aiTouched = false;
  $('aipPrompts').addEventListener('pointerdown', () => { aiTouched = true; });
  const aio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    aio.disconnect();
    setTimeout(() => { if (!aiTouched) $('aipPrompts').querySelector('[data-p="0"]').click(); }, 700);
  }), { threshold: 0.5 });
  aio.observe(aiPanel);

  /* ================= Boot ================= */
  renderApp(app, CURATED.nike, 0);
  youSay('Build a campaign email app for Nike — a brief, their assets, an AI draft and an approval.');
  eaiSay('Built <b>Campaign email</b>: Brief → Assets → Compose → Review. Four steps, wired Form → Data source → AI writer → Approval.');
  scanReply('nike.com');
  showSite(CURATED.nike, true);
  setScan(100);
  cardDone(CURATED.nike);
  siteWin.classList.add('done');
  eaiSay('Nike’s brand is on, and Nike’s team gets the Nike assistant inside the app. Who’s next?');
  bcThread.scrollTop = bcThread.scrollHeight;
  swatchesOut(CURATED.nike);
  tone.classList.add('on');
  known.forEach(addCard);
  order = ['nike', 'apple', 'commbank'];
  setCurrent(CURATED.nike);
  $('aiPick').innerHTML = pickerHTML(CURATED.nike);
  selectStep(0);
  buildWire();
  window.addEventListener('resize', () => { buildWire(); layoutDeck(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { buildWire(); layoutDeck(); });

  // Hero reveal, staggered.
  const heroEls = document.querySelectorAll('.hero .rv, .hero .rv-fade');
  heroEls.forEach((el, i) => setTimeout(() => el.classList.add('in'), reduced() ? 0 : 120 + i * 140));
  autoplay();
})();
