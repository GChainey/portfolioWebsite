/* Remix 01 — "Refined".
   The polished evolution of the current site. One app component is rendered
   five times on the page (hero, story, who's-next, chat card, phone) and
   re-skinned by setting brand colours as registered CSS custom properties,
   so every client change is a smooth colour morph, never a hard cut.
   - Hero: "Sell to many." cycles many → Nike → Apple → CommBank; the accent
     and the live app beneath morph with it (auto-plays for passive visitors).
   - Story: a pinned, scroll-driven builder (GSAP ScrollTrigger). The four
     steps assemble (Form / Data source / AI writer / Approval), then the
     app is named for Nike and re-skinned for Apple and CommBank.
   - Who's next: type any company; hand-checked brands are instant, anything
     else is read live (Clearbit → Microlink, icon.horse fallback, hash guess).
   - Micro-interactions: magnetic buttons, cursor glow cards, frame tilt,
     odometer numbers. prefers-reduced-motion gets a static, clickable page. */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STM = window.STM || {};
  const esc = STM.esc || ((s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ------------------------------------------------------------------ *
   * Brands                                                              *
   * ------------------------------------------------------------------ */
  const SB = STM.BRANDS || {};
  const COPY = {
    nike: {
      slug: 'nike',
      s: ['Pegasus 41 is here. Go.', 'Your next PB starts now', 'Run Club members get first access'],
      files: ['nike-brand-guide.pdf', 'tone-of-voice.docx', 'pegasus-41-shots.zip'],
      body: 'The Pegasus 41 is here — lighter, faster, ready for your next PB. Run Club members get first access this week.',
      cta: 'Shop now',
    },
    apple: {
      slug: 'apple',
      s: ['Say hello to the new iPhone.', 'Pro. Beyond.', 'Available now at the Apple Store'],
      files: ['apple-brand-guidelines.pdf', 'voice-and-tone.docx', 'iphone-product-shots.zip'],
      body: 'Introducing the new iPhone. Our most advanced camera yet, in a design you’ll love to hold.',
      cta: 'Learn more',
    },
    commbank: {
      slug: 'commbank',
      s: ['Your Yello rewards are here', 'More value from everyday banking', 'Unlock offers in the CommBank app'],
      files: ['commbank-brand-guide.pdf', 'yello-offers.xlsx', 'app-screens.zip'],
      body: 'Earn Yello rewards on your everyday account. See your offers in the CommBank app — no sign-up needed.',
      cta: 'See my offers',
    },
  };
  const LOGOS = {
    nike: SB.nike ? SB.nike.logo : '<span class="mono">N</span>',
    apple: SB.apple ? SB.apple.logo : '<span class="mono">A</span>',
    commbank: '<img src="../../logos/commbank.svg" alt="" class="img-mark" />',
  };
  const FALLBACK = {
    nike: { name: 'Nike', domain: 'nike.com', head: '#FA5400', headOn: '#FFFFFF', b: '#FA5400', on: '#FFFFFF', surface: '#F5F5F5', border: '#E4DCD4', accent: '#FA5400', swatches: ['#FA5400', '#111111', '#FFFFFF', '#F5F5F5'], tone: 'Direct, urgent, athlete-first', goal: 'Launch the Pegasus 41…', audience: 'Nike Run Club members', date: '3 October' },
    apple: { name: 'Apple', domain: 'apple.com', head: '#1D1D1F', headOn: '#F5F5F7', b: '#0071E3', on: '#FFFFFF', surface: '#F5F5F7', border: '#E3E3E8', accent: '#0071E3', swatches: ['#1D1D1F', '#0071E3', '#F5F5F7', '#FFFFFF'], tone: 'Simple, confident, understated', goal: 'Introduce the new iPhone…', audience: 'Apple Store customers', date: '9 October' },
    commbank: { name: 'CommBank', domain: 'commbank.com.au', head: '#000000', headOn: '#FFFFFF', b: '#FFCC00', on: '#000000', surface: '#F7F7F7', border: '#E5E5E5', accent: '#D9A400', swatches: ['#FFCC00', '#000000', '#FFFFFF', '#F7F7F7'], tone: 'Clear, helpful, reassuring', goal: 'Launch Yello rewards for everyday accounts…', audience: 'CommBank app customers', date: '16 October' },
  };

  function makeBrand(key, src, copy, logo) {
    const aud = src.audience.replace(/…$/, '');
    return {
      key, name: src.name, domain: src.domain || '', slug: copy.slug, logo, logoClass: src.logoClass || '',
      head: src.head, headOn: src.headOn, b: src.b, on: src.on,
      surf: src.surface, bord: src.border, accent: src.accent,
      swatches: src.swatches || [src.b], tone: src.tone,
      goal: src.goal, audience: src.audience, date: src.date, when: src.when || src.date,
      f0: copy.files[0], f1: copy.files[1], f2: copy.files[2],
      s0: copy.s[0], s1: copy.s[1], s2: copy.s[2], body: copy.body, cta: copy.cta,
      whose: `${src.name}’s`,
      greet: `Hi — I’m the ${src.name} campaign assistant. Ask me anything about this email.`,
      prompt: `Suggest three subject lines for ${aud}`,
      hello: `Hi ${src.name} team — want three subject lines for this email?`,
    };
  }
  const B = {};
  ['nike', 'apple', 'commbank'].forEach((k) => {
    const src = Object.assign({}, FALLBACK[k], SB[k] || {});
    B[k] = makeBrand(k, src, COPY[k], LOGOS[k]);
  });
  B.apple.logoClass = 'apple';

  // Before the app is named for anyone.
  const NEUTRAL = {
    key: 'neutral', name: 'Your client', domain: '', slug: 'your-client', logo: '<span class="ph"></span>',
    head: '#F4F4F5', headOn: '#71717A', b: '#18181B', on: '#FFFFFF', surf: '#FAFAFA', bord: '#E7E7EA', accent: '#18181B',
    swatches: [], tone: 'from their site', goal: 'What’s the campaign?', audience: 'Who’s it for?', date: 'Send date', when: 'the chosen date',
    f0: 'brand-guide.pdf', f1: 'tone-of-voice.docx', f2: 'product-shots.zip',
    s0: 'Subject line, written by AI', s1: '', s2: '', body: 'Drafted from the brief and the assets, in the client’s voice.', cta: 'Call to action',
    greet: 'Hi — I’m the campaign assistant.', prompt: '', hello: '', whose: 'the client’s',
  };

  // A live-read (or guessed) brand, in the same shape.
  function genericBrand(src) {
    const name = src.name;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'client';
    const tone = src.about ? 'In their words: “' + src.about.slice(0, 80).replace(/\s+\S*$/, '') + '…”' : (src.tone || 'Read from their site');
    return makeBrand('live', {
      name, domain: src.domain, head: src.head, headOn: src.headOn, b: src.b, on: src.on,
      surface: src.surface, border: src.border, accent: src.accent, swatches: src.swatches,
      tone, goal: `Announce what’s new at ${name}…`, audience: `${name} customers`, date: '28 October',
    }, {
      slug,
      s: [`What’s new at ${name}`, `${name}: made for you`, `Don’t miss this from ${name}`],
      files: [`${slug}-brand-guide.pdf`, 'tone-of-voice.docx', 'product-shots.zip'],
      body: `Here’s what’s new at ${name} this month — picked for ${name} customers.`,
      cta: 'Find out more',
    }, src.logo || `<span class="mono">${esc(name[0].toUpperCase())}</span>`);
  }

  /* ------------------------------------------------------------------ *
   * The app component                                                   *
   * ------------------------------------------------------------------ */
  const SPARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
  const TICK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const STEPS = ['Brief', 'Assets', 'Compose', 'Review'];
  const NEXT = ['Next: assets', 'Next: compose', 'Next: review', 'Approve and send'];

  function appHTML() {
    const hd = (t, s) => `<div class="pc-hd"><div class="pc-t">${t}</div><div class="pc-s">${s}</div></div>`;
    const btn = (i) => `<button type="button" class="app-btn" data-next>${NEXT[i]}</button>`;
    return `
    <div class="app-head">
      <span class="app-logo" data-logo></span>
      <span class="app-name" data-t="name"></span>
      <span class="app-sp"></span>
      <span class="app-nav"><i>Campaigns</i><i>Library</i></span>
      <span class="app-av">JL</span>
    </div>
    <div class="app-body">
      <div class="app-main">
        <div class="app-title">Campaign email</div>
        <div class="app-steps">${STEPS.map((s, i) => `<button type="button" class="app-step" data-i="${i}"><b>${i + 1}</b><span>${s}</span></button>`).join('')}</div>
        <div class="app-card">
          <div class="pane" data-pane="0">
            ${hd('Tell us about the campaign', 'Four fields. The rest is written for you.')}
            <div class="fld"><span>Campaign goal</span><em data-t="goal"></em></div>
            <div class="fld-row"><div class="fld"><span>Audience</span><em data-t="audience"></em></div><div class="fld"><span>Send date</span><em data-t="date"></em></div></div>
            ${btn(0)}
          </div>
          <div class="pane" data-pane="1">
            ${hd('Assets', 'What this campaign draws on. From SharePoint · Brand / Guidelines.')}
            ${[0, 1, 2].map((n) => `<div class="file"><i></i><span data-t="f${n}"></span><small>Synced ${n + 2} min ago</small></div>`).join('')}
            ${btn(1)}
          </div>
          <div class="pane" data-pane="2">
            ${hd('Compose', 'Drafted by AI from the brief and assets, in <span data-t="whose"></span> voice.')}
            <div class="subj"><span>Subject</span><b data-t="s0"></b></div>
            <div class="mail">
              <div class="mail-bar"><span class="app-logo" data-logo></span></div>
              <div class="mail-body"><div class="mail-h" data-t="s0"></div><p data-t="body"></p><span class="mail-btn" data-t="cta"></span></div>
            </div>
            ${btn(2)}
          </div>
          <div class="pane" data-pane="3">
            ${hd('Review', 'One approval before it sends on <span data-t="when"></span>.')}
            <div class="who"><span class="who-av">JL</span><div><b>Jordan Lee</b><small>Marketing lead · approver</small></div><span class="who-st">Waiting</span></div>
            <div class="chk">${TICK}<span>Brand colours and logo</span></div>
            <div class="chk">${TICK}<span>Tone of voice — <span data-t="tone"></span></span></div>
            <div class="chk">${TICK}<span>Links and unsubscribe checked</span></div>
            ${btn(3)}
          </div>
        </div>
      </div>
      <aside class="app-assist" aria-label="Assistant">
        <div class="as-hd"><span class="as-ico">${SPARK}</span><div class="as-tt"><b><span data-t="name"></span> assistant</b><small>For <span data-t="name"></span>’s team</small></div></div>
        <div class="as-thread">
          <div class="m m-ai" data-t="greet"></div>
          <div class="m-meta"><span class="mm-av">JL</span><span>Jordan · <span data-t="name"></span>’s team</span></div>
          <div class="m m-me" data-t="prompt"></div>
          <div class="m m-ai">Here are three, in <span data-t="name"></span>’s voice:<ol><li data-t="s0"></li><li data-t="s1"></li><li data-t="s2"></li></ol></div>
        </div>
        <div class="as-in"><span>Ask about this campaign…</span><i>${'<svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'}</i></div>
      </aside>
    </div>
    <div class="app-bubble"><div class="ab-hd"><span class="as-ico">${SPARK}</span><b><span data-t="name"></span> assistant</b></div><span class="ab-t" data-t="hello"></span></div>
    <span class="app-fab">${SPARK}Ask AI</span>`;
  }

  const VARS = [['--b', 'b'], ['--b-on', 'on'], ['--head', 'head'], ['--head-on', 'headOn'], ['--surf', 'surf'], ['--bord', 'bord']];

  // Hex -> oklch(), so colour morphs interpolate perceptually (Oklab)
  // instead of through muddy sRGB midpoints.
  function oklch(c) {
    if (!/^#[0-9a-f]{6}$/i.test(c)) return c;
    const lin = [1, 3, 5].map((i) => { const v = parseInt(c.slice(i, i + 2), 16) / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    const [r, g, b] = lin;
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    const C = Math.sqrt(A * A + Bb * Bb);
    let H = Math.atan2(Bb, A) * 180 / Math.PI;
    if (H < 0) H += 360;
    return `oklch(${(L * 100).toFixed(2)}% ${C.toFixed(4)} ${C < 0.002 ? 0 : H.toFixed(2)})`;
  }

  function setText(el, txt, instant) {
    if (el.textContent === txt && !el._pending) return;
    el._tx = txt;
    if (instant || REDUCED) { el.textContent = txt; return; }
    if (el._pending) return;
    el._pending = true;
    el.classList.add('tx-out');
    setTimeout(() => {
      el.textContent = el._tx;
      el._pending = false;
      el.classList.remove('tx-out');
    }, 190);
  }
  function setLogo(el, br, instant) {
    if (el._key === br.key + br.name) return;
    el._key = br.key + br.name;
    const lg = document.createElement('span');
    lg.className = 'lg' + (br.logoClass ? ' ' + br.logoClass : '');
    lg.innerHTML = br.logo;
    const img = lg.querySelector('.chip img');
    if (img) img.onerror = () => { lg.innerHTML = `<span class="mono">${esc(br.name[0].toUpperCase())}</span>`; };
    const old = [...el.children];
    el.appendChild(lg);
    if (instant || REDUCED) { old.forEach((o) => o.remove()); return; }
    lg.classList.add('lg-in');
    requestAnimationFrame(() => requestAnimationFrame(() => lg.classList.remove('lg-in')));
    old.forEach((o) => { o.classList.add('lg-out'); setTimeout(() => o.remove(), 500); });
  }
  function skin(root, br, instant) {
    if (!root) return;
    if (instant) root.classList.add('no-tx');
    VARS.forEach(([v, k]) => root.style.setProperty(v, oklch(br[k])));
    root.dataset.brand = br.key;
    $$('[data-t]', root).forEach((el) => { const v = br[el.dataset.t]; if (v != null) setText(el, v, instant); });
    $$('[data-logo]', root).forEach((el) => setLogo(el, br, instant));
    if (instant) { void root.offsetWidth; requestAnimationFrame(() => root.classList.remove('no-tx')); }
    root.__brand = br;
  }
  function goStep(root, i) {
    root.dataset.step = i;
    $$('.app-step', root).forEach((s, n) => s.classList.toggle('on', n === i));
  }
  function mountApp(root, br, step, interactive, skinRoot) {
    root.innerHTML = appHTML();
    goStep(root, step);
    skin(skinRoot || root, br, true);
    if (!interactive) return;
    root.addEventListener('click', (e) => {
      const s = e.target.closest('.app-step');
      if (s) goStep(root, +s.dataset.i);
      if (e.target.closest('[data-next]')) goStep(root, ((+root.dataset.step || 0) + 1) % 4);
    });
  }

  /* ------------------------------------------------------------------ *
   * Fit fixed-size frames to their column                               *
   * ------------------------------------------------------------------ */
  const fits = $$('.fit');
  function fitAll() {
    fits.forEach((f) => {
      const inner = f.firstElementChild;
      const avail = f.parentElement.clientWidth;
      const small = avail < 640 && f.dataset.sw;
      const w = +(small ? f.dataset.sw : f.dataset.w);
      const h = +(small ? f.dataset.sh : f.dataset.h);
      f.classList.toggle('compact', !!small);
      const s = Math.min(1, avail / w);
      inner.style.width = w + 'px';
      inner.style.height = h + 'px';
      inner.style.transform = `scale(${s})`;
      f.style.height = h * s + 'px';
      f.style.width = w * s + 'px';
    });
  }
  fitAll();
  window.addEventListener('resize', fitAll);

  /* ------------------------------------------------------------------ *
   * Nav                                                                 *
   * ------------------------------------------------------------------ */
  const nav = $('#nav');
  const onScrollNav = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  /* ------------------------------------------------------------------ *
   * Hero: "Sell to many." cycles through clients                        *
   * ------------------------------------------------------------------ */
  const hero = $('#hero');
  const heroApp = $('#heroApp');
  const swap = $('#swap');
  const picker = $('#heroPicker');
  mountApp(heroApp, B.nike, 2, true);
  $$('[data-t="slug"]', hero).forEach((el) => setText(el, 'nike', true));

  const CYCLE = ['many', 'nike', 'apple', 'commbank'];
  const sizeSwap = () => { const w = $('.swap-w.is-on', swap); if (w) swap.style.width = w.getBoundingClientRect().width + 'px'; };
  sizeSwap();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeSwap);
  window.addEventListener('resize', sizeSwap);
  let cyc = 0, heroTimer = null, heroManual = false, heroVisible = true;

  function swapWord(text, instant) {
    const old = $('.swap-w.is-on', swap);
    if (old && old.textContent === text) return;
    const w = document.createElement('span');
    w.className = 'swap-w';
    w.textContent = text;
    swap.appendChild(w);
    const target = w.getBoundingClientRect().width;
    swap.style.width = (old ? old.getBoundingClientRect().width : target) + 'px';
    if (instant || REDUCED) {
      if (old) old.remove();
      w.classList.add('is-on');
      swap.style.width = target + 'px';
      return;
    }
    void swap.offsetWidth;
    swap.style.width = target + 'px';
    requestAnimationFrame(() => w.classList.add('is-on'));
    if (old) { old.classList.remove('is-on'); old.classList.add('is-out'); setTimeout(() => old.remove(), 700); }
  }
  function heroShow(k, instant) {
    if (k === 'many') {
      swapWord('many', instant);
      hero.style.setProperty('--accent', oklch('#0A0A0A'));
      picker.querySelectorAll('button').forEach((b) => b.classList.remove('on', 'run'));
      return;
    }
    const br = B[k];
    swapWord(br.name, instant);
    hero.style.setProperty('--accent', oklch(br.accent));
    hero.style.setProperty('--glow', oklch(br.b));
    skin(heroApp, br, instant);
    $$('[data-t="slug"]', hero).forEach((el) => setText(el, br.slug, instant));
    $$('.chrome [data-t="name"]', hero).forEach((el) => setText(el, br.name, instant));
    picker.querySelectorAll('button').forEach((b) => {
      const on = b.dataset.k === k;
      b.classList.toggle('on', on);
      b.classList.remove('run');
      if (on && !heroManual && !REDUCED) { void b.offsetWidth; b.classList.add('run'); }
    });
  }
  function heroTick() {
    clearTimeout(heroTimer);
    if (heroManual || REDUCED) return;
    if (!heroVisible) { heroTimer = setTimeout(heroTick, 800); return; }
    cyc = (cyc + 1) % CYCLE.length;
    heroShow(CYCLE[cyc]);
    heroTimer = setTimeout(heroTick, CYCLE[cyc] === 'many' ? 2000 : 3400);
  }
  picker.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    heroManual = true;
    clearTimeout(heroTimer);
    heroShow(b.dataset.k);
  });
  if (REDUCED) {
    $$('button', picker).forEach((b) => b.classList.toggle('on', b.dataset.k === 'nike'));
  } else {
    heroTimer = setTimeout(heroTick, 1900);
  }
  new IntersectionObserver((es) => { heroVisible = es[0].isIntersecting; }).observe(hero);

  // Tilt: the frame starts tipped back and flattens as you scroll; the
  // pointer adds a little parallax on top.
  const tilt = $('#heroTilt');
  if (!REDUCED) {
    let px = 0, py = 0, tx = 0, ty = 0, raf = 0;
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (fine) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        kick();
      });
      hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
    }
    window.addEventListener('scroll', () => { if (heroVisible) kick(); }, { passive: true });
    function loop() {
      px += (tx - px) * 0.08;
      py += (ty - py) * 0.08;
      const base = 9 * Math.max(0, 1 - window.scrollY / 420);
      tilt.style.transform = `perspective(2200px) rotateX(${(base - py * 1.6).toFixed(3)}deg) rotateY(${(px * 2.2).toFixed(3)}deg)`;
      if (Math.abs(tx - px) > 0.002 || Math.abs(ty - py) > 0.002) raf = requestAnimationFrame(loop);
      else raf = 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }
    kick();
  }

  /* ------------------------------------------------------------------ *
   * Story: pinned builder                                               *
   * ------------------------------------------------------------------ */
  const builder = $('#builder');
  const storyApp = $('#storyApp');
  mountApp(storyApp, NEUTRAL, 0, false);
  const PH = [
    { k: 'Step 1 · Form', t: 'Start with the brief.', p: 'Step one collects the brief — goal, audience, send date. Four fields, nothing more.' },
    { k: 'Step 2 · Data source', t: 'Connect the assets.', p: 'Step two pulls the brand guide and product shots from SharePoint. Always the current version.' },
    { k: 'Step 3 · AI writer', t: 'Let AI write it.', p: 'Step three drafts the email from the brief and the assets — in whichever voice the client speaks.' },
    { k: 'Step 4 · Approval', t: 'One sign-off, then send.', p: 'Step four routes it to an approver. Four steps, wired end to end. That’s the whole app.' },
    { k: 'Client 1 · nike.com', t: 'Name it for Nike.', p: 'You type one sentence into the builder chat. It reads nike.com for colours, logo and tone, and the app wears them.' },
    { k: 'Client 2 · apple.com', t: 'Now Apple.', p: 'Same four steps, same wiring. New logo, new colours, and copy in Apple’s voice.' },
    { k: 'Client 3 · commbank.com.au', t: 'Then CommBank.', p: 'Built once. Sold three times — and every client gets their own assistant, in their brand.' },
  ];
  const PB = [null, null, null, null, B.nike, B.apple, B.commbank];
  const flowLis = $$('#flow li');
  const railBtns = $$('#rail button');
  const clientBtns = $$('#bdClients button');
  clientBtns.forEach((b) => {
    const br = B[b.dataset.k];
    b.innerHTML = `<span class="lg${br.logoClass ? ' ' + br.logoClass : ''}">${br.logo}</span>`;
    b.style.setProperty('--head', br.head);
    b.style.setProperty('--head-on', br.headOn);
  });
  let phase = -1, phaseTok = 0;

  function typeSay(text, tok) {
    const el = $('#bdSayT');
    if (REDUCED) { el.textContent = text; return; }
    el.textContent = '';
    let n = 0;
    const step = () => {
      if (tok !== phaseTok) return;
      el.textContent = text.slice(0, ++n);
      if (n < text.length) setTimeout(step, 34);
    };
    step();
  }
  function storyCopy(i, instant) {
    const box = $('#storyCopy');
    const apply = () => { $('#scK').textContent = PH[i].k; $('#scT').textContent = PH[i].t; $('#scP').textContent = PH[i].p; };
    if (instant || REDUCED) { apply(); return; }
    box.classList.add('out');
    clearTimeout(box._t);
    box._t = setTimeout(() => { apply(); box.classList.remove('out'); }, 200);
  }
  function setPhase(i, instant) {
    if (i === phase) return;
    const prev = phase;
    phase = i;
    const tok = ++phaseTok;
    builder.dataset.phase = i;
    const built = Math.min(i + 1, 4);
    const step = i < 4 ? i : 2;
    storyApp.dataset.built = built;
    goStep(storyApp, step);
    flowLis.forEach((li, n) => { li.classList.toggle('in', n < built); li.classList.toggle('on', n === step); });
    $('#bdCount').textContent = `${built} of 4`;
    railBtns.forEach((b) => b.classList.toggle('on', +b.dataset.p === i));
    railBtns.forEach((b) => b.classList.toggle('past', +b.dataset.p < i));
    storyCopy(i, instant);
    clientBtns.forEach((b) => { b.classList.toggle('in', +b.dataset.p <= i); b.classList.toggle('on', +b.dataset.p === i); });

    const br = PB[i];
    setText($('#prevWho'), br ? br.name : 'your client', instant);
    $('#bdStatus').textContent = i < 4 ? 'Draft' : `Live · ${i - 3} client${i > 4 ? 's' : ''}`;
    $('#bdStatus').classList.toggle('live', i >= 4);
    $('#bdPub').textContent = i < 4 ? 'Publish' : 'Published';
    if (!br) {
      skin(storyApp, NEUTRAL, instant);
      $('#reading').classList.remove('on');
      return;
    }
    $('#bbDomain').textContent = br.domain;
    $('#bbTone').textContent = br.tone;
    $$('#bbSw i').forEach((s, n) => { s.style.background = br.swatches[n] || 'transparent'; });
    const going = prev >= 0 && prev < i; // only "read the site" on the way down
    if (instant || REDUCED || !going) {
      $('#bdSayT').textContent = `Make it for ${br.name}`;
      $('#reading').classList.remove('on');
      skin(storyApp, br, instant);
      return;
    }
    typeSay(`Make it for ${br.name}`, tok);
    $('#readingD').textContent = br.domain;
    const t0 = 34 * (12 + br.name.length);
    setTimeout(() => { if (tok === phaseTok) $('#reading').classList.add('on'); }, t0);
    setTimeout(() => {
      if (tok !== phaseTok) return;
      $('#reading').classList.remove('on');
      skin(storyApp, br);
    }, t0 + 750);
  }
  setPhase(0, true);

  let storyST = null;
  function goPhase(i) {
    if (storyST) {
      const y = storyST.start + (storyST.end - storyST.start) * (i / 6) + 1;
      window.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
    } else {
      setPhase(i);
    }
  }
  railBtns.forEach((b) => b.addEventListener('click', () => goPhase(+b.dataset.p)));
  clientBtns.forEach((b) => b.addEventListener('click', () => goPhase(+b.dataset.p)));

  const hasGSAP = window.gsap && window.ScrollTrigger;
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1000px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)', () => {
      document.documentElement.classList.add('pinned');
      storyST = ScrollTrigger.create({
        trigger: '#how',
        pin: '#storyPin',
        start: 'top top',
        end: () => '+=' + Math.round(window.innerHeight * 3.6),
        onUpdate: (self) => setPhase(Math.min(6, Math.round(self.progress * 6))),
        snap: { snapTo: 1 / 6, duration: { min: 0.25, max: 0.6 }, delay: 0.08, ease: 'power2.inOut' },
      });
      return () => { document.documentElement.classList.remove('pinned'); storyST = null; };
    });
    mm.add('(max-width: 999px), (max-height: 639px), (prefers-reduced-motion: reduce)', () => {
      setPhase(4, true);
    });
  } else {
    setPhase(4, true);
  }

  /* ------------------------------------------------------------------ *
   * Odometer numbers                                                    *
   * ------------------------------------------------------------------ */
  $$('.odo').forEach((o) => {
    const n = +o.dataset.n;
    o.setAttribute('aria-label', String(n));
    o.innerHTML = `<span class="reel" aria-hidden="true">${Array.from({ length: 20 }, (_, i) => `<span>${i % 10}</span>`).join('')}</span>`;
    const reel = o.firstChild;
    const target = 10 + n;
    if (REDUCED) { reel.style.transform = `translateY(${-target}em)`; return; }
    reel.style.transform = 'translateY(0)';
    new IntersectionObserver((es, ob) => {
      if (!es[0].isIntersecting) return;
      ob.disconnect();
      reel.classList.add('go');
      reel.style.transform = `translateY(${-target}em)`;
    }, { threshold: 0.6 }).observe(o);
  });

  /* ------------------------------------------------------------------ *
   * Who's next? — live lookup                                           *
   * ------------------------------------------------------------------ */
  const nextApp = $('#nextApp');
  const nextSec = $('#next');
  mountApp(nextApp, B.nike, 2, true);

  function withTimeout(ms) { const c = new AbortController(); setTimeout(() => c.abort(), ms); return c.signal; }
  async function findDomain(name) {
    if (/\.[a-z]{2,}$/i.test(name)) return { name: name.replace(/\.[a-z.]+$/i, ''), domain: name.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '') };
    try {
      const r = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(name)}`, { signal: withTimeout(3500) });
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
  async function readLive(found) {
    if (!STM.liveBrand) return null;
    const full = viaMicrolink(found).catch(() => null);
    const icon = viaIcon(found).catch(() => null);
    const later = wait(5500).then(() => icon);
    let b = await Promise.race([full, later]);
    if (!b) b = (await full) || (await icon);
    return b;
  }
  function guessBrand(raw, found) {
    const name = raw.trim().replace(/\s+/g, ' ');
    let h = 0;
    for (const ch of name.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const hue = h % 360;
    const b = `hsl(${hue} 62% 42%)`;
    return {
      name: name.charAt(0).toUpperCase() + name.slice(1), domain: (found && found.domain) || name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
      head: b, headOn: '#FFFFFF', b, on: '#FFFFFF', accent: b,
      surface: `hsl(${hue} 30% 97%)`, border: `hsl(${hue} 22% 88%)`,
      swatches: [b, `hsl(${hue} 25% 14%)`, `hsl(${hue} 30% 96%)`, `hsl(${(hue + 150) % 360} 60% 55%)`],
      tone: 'Best guess — couldn’t reach their site',
    };
  }

  const roSteps = $$('#roSteps li');
  const RO_LABELS = ['Found their site', 'Read colours and logo', 'Matched their tone of voice', 'Re-skinned all four steps'];
  function ro(i, state, label) {
    const li = roSteps[i];
    li.className = state;
    $('span', li).textContent = label || RO_LABELS[i];
  }
  function readout(br, badge) {
    const logo = $('#roLogo');
    logo.style.setProperty('--head', oklch(br.head));
    logo.style.setProperty('--head-on', oklch(br.headOn));
    setLogo(logo, br);
    setText($('#roName'), br.name);
    setText($('#roDomain'), br.domain);
    setText($('#roTone'), br.tone);
    $('#roBadge').textContent = badge;
    $('#roBadge').dataset.kind = badge === 'Hand-checked' ? 'ok' : badge === 'Read live' ? 'live' : 'guess';
    skin($('#legendApp'), br);
    $$('[data-lg-name]').forEach((el) => setText(el, br.name));
    $('#roSw').innerHTML = br.swatches.slice(0, 4).map((c) => `<span><i style="background:${esc(c)}"></i><code>${esc(/^#/.test(c) ? c.toUpperCase() : 'Guess')}</code></span>`).join('');
  }
  readout(B.nike, 'Hand-checked');

  let runTok = 0;
  async function reskin(raw) {
    const name = raw.trim().replace(/\s+/g, ' ').slice(0, 40);
    if (!name) return;
    const tok = ++runTok;
    const live = () => tok === runTok;
    const form = $('#sayForm');
    form.classList.add('busy');
    roSteps.forEach((_, i) => ro(i, ''));
    const pill = $('#nextReading');
    const reading = (d) => { $('#nextReadingD').textContent = d; pill.classList.add('on'); };
    const done = () => pill.classList.remove('on');
    setText($('#roName'), name.charAt(0).toUpperCase() + name.slice(1));
    setText($('#roDomain'), 'Looking up…');
    $('#roBadge').textContent = 'Reading…';
    $('#roBadge').dataset.kind = 'live';
    const curated = STM.curated ? STM.curated(name) : null;
    const key = curated ? Object.keys(SB).find((k) => SB[k] === curated) : null;
    const fast = REDUCED ? 0 : 1;
    try {
      if (key && B[key]) {
        const br = B[key];
        ro(0, 'run'); await wait(320 * fast); if (!live()) return;
        ro(0, 'done', `Found ${br.domain}`); ro(1, 'run'); reading(br.domain); await wait(520 * fast); if (!live()) return;
        ro(1, 'done'); ro(2, 'run'); await wait(320 * fast); if (!live()) return;
        ro(2, 'done'); ro(3, 'run');
        done(); skin(nextApp, br); setSlug(br);
        readout(br, 'Hand-checked');
        await wait(420 * fast); if (!live()) return;
        ro(3, 'done');
        return;
      }
      ro(0, 'run');
      const found = await findDomain(name);
      if (!live()) return;
      ro(0, 'done', `Found ${found.domain}`);
      ro(1, 'run', `Reading ${found.domain}…`);
      reading(found.domain);
      const got = await readLive(found).catch(() => null);
      if (!live()) return;
      let br, badge;
      if (got) {
        br = genericBrand(got);
        badge = 'Read live';
        ro(1, 'done');
      } else {
        br = genericBrand(guessBrand(name, found));
        badge = 'Best guess';
        ro(1, 'warn', 'Couldn’t reach their site — best guess');
      }
      ro(2, 'run'); await wait(300 * fast); if (!live()) return;
      ro(2, got ? 'done' : 'warn', got ? RO_LABELS[2] : 'Tone of voice — needs a check');
      ro(3, 'run');
      done(); skin(nextApp, br); setSlug(br);
      readout(br, badge);
      await wait(400 * fast); if (!live()) return;
      ro(3, 'done');
    } finally {
      if (live()) { form.classList.remove('busy'); done(); }
    }
  }
  function setSlug(br) { $$('[data-t="slug"]', nextSec).forEach((el) => setText(el, br.slug)); }
  $$('[data-t="slug"]', nextSec).forEach((el) => setText(el, 'nike', true));

  $('#sayForm').addEventListener('submit', (e) => {
    e.preventDefault();
    reskin($('#sayInput').value || $('#sayInput').placeholder);
  });
  $('#sayChips').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    $('#sayInput').value = b.textContent;
    reskin(b.textContent);
  });

  // Type a first name into the box once, so a passive visitor sees it work.
  let nextPlayed = false;
  new IntersectionObserver((es, ob) => {
    if (!es[0].isIntersecting || nextPlayed) return;
    nextPlayed = true;
    ob.disconnect();
    if (REDUCED) return;
    const inp = $('#sayInput');
    const word = 'Apple';
    let n = 0;
    const t = () => {
      if (document.activeElement === inp || inp.value.length > n) return; // the visitor took over
      inp.value = word.slice(0, ++n);
      if (n < word.length) setTimeout(t, 90);
      else setTimeout(() => { if (inp.value === word) reskin(word); }, 350);
    };
    setTimeout(t, 500);
  }, { threshold: 0.45 }).observe($('#sayForm'));

  /* ------------------------------------------------------------------ *
   * AI: chat card, voices, fabs                                         *
   * ------------------------------------------------------------------ */
  const chat = $('#chat');
  skin(chat, B.nike, true);
  skin($('#miniSay'), B.nike, true);
  skin($('#twoApp'), B.nike, true);
  let chatManual = false, chatI = 0, chatVisible = false;
  function chatShow(k) {
    skin(chat, B[k]);
    $$('#chatTabs button').forEach((b) => b.classList.toggle('on', b.dataset.k === k));
  }
  $('#chatTabs').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    chatManual = true;
    chatShow(b.dataset.k);
  });
  new IntersectionObserver((es) => { chatVisible = es[0].isIntersecting; }).observe(chat);
  if (!REDUCED) {
    setInterval(() => {
      if (chatManual || !chatVisible || document.hidden) return;
      chatI = (chatI + 1) % 3;
      chatShow(['nike', 'apple', 'commbank'][chatI]);
    }, 4200);
  }

  $('#voices').innerHTML = ['nike', 'apple', 'commbank'].map((k) => {
    const br = B[k];
    return `<li style="--head:${br.head};--head-on:${br.headOn};--b:${br.b}">
      <span class="v-logo"><span class="lg${br.logoClass ? ' ' + br.logoClass : ''}">${br.logo}</span></span>
      <div><b>${esc(br.s0)}</b><small>${esc(br.name)} · ${esc(br.tone)}</small></div></li>`;
  }).join('');
  $$('#fabs .fab').forEach((f) => {
    const br = B[f.dataset.k];
    f.style.setProperty('--b', br.b);
    f.style.setProperty('--b-on', br.on);
    f.querySelector('i').innerHTML = SPARK;
  });

  /* ------------------------------------------------------------------ *
   * Phone + QR share                                                    *
   * ------------------------------------------------------------------ */
  const phoneApp = $('#phoneApp');
  const phoneScr = $('.phone-scr');
  mountApp(phoneApp, B.nike, 0, true, phoneScr);
  let phoneKey = 'nike';
  function appUrl(k) { return new URL(`../../app.html?c=${k}`, location.href).href; }
  function drawQR(k) {
    const url = appUrl(k);
    $('#qrLink').href = url;
    $('#qrUrl').textContent = `eai.app/${B[k].slug}/campaign-email`;
    $$('[data-qr-name]').forEach((el) => setText(el, B[k].name));
    if (window.QRCode && QRCode.toCanvas) {
      QRCode.toCanvas($('#qr'), url, { width: 132, margin: 0, color: { dark: '#0A0A0A', light: '#FFFFFF' } }, () => {});
    }
  }
  function phoneShow(k) {
    phoneKey = k;
    skin(phoneScr, B[k]);
    drawQR(k);
    $$('#phoneSeg button').forEach((b) => b.classList.toggle('on', b.dataset.k === k));
  }
  drawQR('nike');
  $('#phoneSeg').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) phoneShow(b.dataset.k);
  });
  $('#qrCopy').addEventListener('click', async () => {
    const btn = $('#qrCopy');
    try { await navigator.clipboard.writeText(appUrl(phoneKey)); btn.textContent = 'Copied'; }
    catch (e) { btn.textContent = 'Copy failed'; }
    setTimeout(() => { btn.textContent = 'Copy'; }, 1600);
  });

  /* ------------------------------------------------------------------ *
   * Micro-interactions                                                  *
   * ------------------------------------------------------------------ */
  const FINE = window.matchMedia('(pointer: fine)').matches;
  if (!REDUCED && FINE) {
    // Magnetic buttons
    $$('.magnetic').forEach((el) => {
      const label = el.firstElementChild;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`;
        if (label) label.style.transform = `translate(${dx * 0.08}px, ${dy * 0.12}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
        if (label) label.style.transform = '';
      });
    });
    // Cursor-following glow on cards
    $$('.glow').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    // Phone tilt
    const stage = $('#phoneStage');
    const ph = $('#phone3d');
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      ph.style.transform = `perspective(1400px) rotateY(${(-8 + x * 10).toFixed(2)}deg) rotateX(${(y * -6).toFixed(2)}deg)`;
    });
    stage.addEventListener('pointerleave', () => { ph.style.transform = ''; });
  }

  // Reveal-on-scroll for section headings and cards.
  if (!REDUCED && 'IntersectionObserver' in window) {
    const els = $$('.sec-hd, .card, .num, .readout, .next-stage, .phone-copy, .phone-stage, .cta-in, .say, .say-chips');
    els.forEach((el) => el.classList.add('reveal'));
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('shown'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
  }
})();
