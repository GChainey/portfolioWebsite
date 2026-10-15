/* Build once. Sell to many.
   Plays the build of a four-step app for Nike, then waits for the visitor
   to name another client and re-skins the same app for them.

   Apple and CommBank are hand-checked. Any other name is looked up live:
   Clearbit autocomplete (name -> domain), then Microlink (logo + palette
   from the real site). Both are keyless and CORS-open; if either fails the
   brand falls back to a guess from the name.

   ?client=Apple   skip the wait and use that name (for recordings)
   ?manual=1       wait for a real click / typed client name (no demo cursor)
*/
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const F = (name) => document.querySelector(`#pApp [data-f="${name}"]`);
  const params = new URLSearchParams(location.search);
  const AUTO = !params.has('manual');
  const REDUCED = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const { BRANDS, curated, pickPrimary, liveBrand, esc } = window.STM;
  const SUGGESTIONS = ['apple', 'commbank'];
  const FONTS = ['system-ui, -apple-system, sans-serif', 'Georgia, serif', '"Helvetica Neue", Arial, sans-serif'];

  function withTimeout(ms) {
    const c = new AbortController();
    setTimeout(() => c.abort(), ms);
    return c.signal;
  }
  async function findDomain(name) {
    if (/\.[a-z]{2,}$/i.test(name)) return { name, domain: name.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '') };
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
    return liveBrand(found, pickPrimary(logoPal, imagePal), d.logo && d.logo.url, logoPal.concat(imagePal), d.description || d.title);
  }

  // Quick read: the site's icon, and its colours sampled on a canvas.
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

  // Prefer the full read; if it's slow (a cold site can take 10s+), settle
  // for the icon read after 6s. Rejects only if both fail.
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

  // Offline fallback: a believable brand from a hash of the name.
  function brandFor(raw) {
    const name = raw.trim().replace(/\s+/g, ' ');
    const key = name.toLowerCase();
    let h = 0;
    for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const hue = h % 360;
    const b = `hsl(${hue} 62% 42%)`;
    return {
      name,
      domain: key.replace(/[^a-z0-9]/g, '') + '.com',
      head: b, headOn: '#FFFFFF', b, on: '#FFFFFF', accent: b,
      surface: `hsl(${hue} 30% 96%)`, border: `hsl(${hue} 22% 87%)`,
      font: FONTS[h % FONTS.length],
      swatches: [b, `hsl(${hue} 30% 96%)`, `hsl(${hue} 25% 14%)`, `hsl(${(hue + 150) % 360} 60% 55%)`],
      tone: 'Best guess — couldn’t reach their site',
      goal: `Announce what's new at ${name}…`, audience: `${name} customers`, date: '28 October',
    };
  }

  const STEPS = [
    ['Brief', 'Form'],
    ['Assets', 'Data source'],
    ['Compose', 'AI writer'],
    ['Review', 'Approval'],
  ];

  const app = $('pApp');
  const thread = $('bThread');
  const input = $('bInput');
  const send = $('bSend');
  const composer = $('bComposer');
  const steps = [...document.querySelectorAll('.p-step')];

  let run = 0;
  let clients = [];
  let waiting = null; // resolves with the client name

  class Cancelled extends Error {}
  function sleep(ms, id) {
    return new Promise((res, rej) => setTimeout(() => (id === run ? res() : rej(new Cancelled())), ms));
  }

  function scrollThread() { thread.scrollTop = thread.scrollHeight; }
  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function add(node) { thread.appendChild(node); scrollThread(); return node; }

  async function ai(html, id, think = 700) {
    const dots = add(el('div', 'm m-typing', '<i></i><i></i><i></i>'));
    await sleep(think, id);
    dots.remove();
    return add(el('div', 'm m-ai', html));
  }
  function user(text) { return add(el('div', 'm m-user', esc(text))); }

  async function typeInto(text, id) {
    input.value = '';
    for (const ch of text) {
      input.value += ch;
      await sleep(26, id);
    }
    await sleep(250, id);
    input.value = '';
    user(text);
  }

  async function typeField(node, text, id) {
    node.textContent = '';
    for (const ch of text) {
      node.textContent += ch;
      await sleep(14, id);
    }
  }

  let current = null; // the brand the preview is wearing

  function applyBrand(br) {
    current = br;
    STM.paint(app, br, { fields: false });
    if (+app.dataset.step) STM.goStep(app, 0); // back to the brief so the fields can be typed
    document.body.style.setProperty('--stm-accent', br.accent);
  }

  function renderClients(active) {
    const box = $('bClients');
    box.innerHTML = clients.length > 1 ? '<span class="b-clients-k">Clients</span>' : '';
    clients.forEach((br) => {
      const b = el('button', 'b-client' + (br === active ? ' on' : ''), `<i style="--c:${br.b}"></i>${esc(br.name)}`);
      b.type = 'button';
      b.addEventListener('click', () => { // same step, other brand
        current = br;
        STM.paint(app, br);
        document.body.style.setProperty('--stm-accent', br.accent);
        renderClients(br);
      });
      box.appendChild(b);
    });
  }

  function brandCard(br) {
    const sw = br.swatches.map((c) => `<span class="sw" style="background:${c}"></span>`).join('');
    return el('div', 'm m-card',
      `<div class="m-meta">${br.live ? '<span class="m-live">Live</span> ' : ''}Read from ${esc(br.domain)}</div>` +
      `<div class="m-brand">${sw}${br.live && br.logo ? br.logo : ''}</div>` +
      (br.about
        ? `<div class="m-about">“${esc(br.about.length > 110 ? br.about.slice(0, 108) + '…' : br.about)}”</div>`
        : `<div class="m-meta">Tone of voice <b>${esc(br.tone)}</b></div>`));
  }

  function doneCard(title, sub) {
    return el('div', 'm m-done',
      '<span class="tick"><svg viewBox="0 0 24 24" width="12" height="12"><path d="m5 13 4 4L19 7" fill="none" stroke="#1f7a45" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      `<span>${title}<small>${sub}</small></span>`);
  }

  // Show the reading overlay while the brand resolves (min 1.2s so it reads).
  async function readSite(label, brandP, id) {
    $('pReadingT').textContent = `Reading ${label}…`;
    app.classList.add('is-reading');
    const [br] = await Promise.all([brandP, sleep(1200, id)]);
    if (id !== run) throw new Cancelled();
    applyBrand(br);
    await sleep(350, id);
    app.classList.remove('is-reading');
    return br;
  }

  function ask(id) {
    composer.classList.add('ask');
    input.disabled = false;
    send.disabled = false;
    input.placeholder = 'Type your client’s name…';
    input.focus({ preventScroll: true });
    return new Promise((res, rej) => {
      waiting = (name) => { waiting = null; id === run ? res(name) : rej(new Cancelled()); };
    });
  }
  function closeAsk() {
    composer.classList.remove('ask');
    input.disabled = true;
    send.disabled = true;
    input.placeholder = 'Ask the assistant…';
  }

  const cursor = $('stmCursor');

  function targetCenter(el) {
    const root = $('stmApp');
    const er = el.getBoundingClientRect();
    const rr = root.getBoundingClientRect();
    const scale = rr.width / 1280;
    return {
      x: (er.left + er.width / 2 - rr.left) / scale,
      y: (er.top + er.height / 2 - rr.top) / scale,
    };
  }
  function moveCursor(x, y, animate) {
    cursor.hidden = false;
    cursor.style.setProperty('--cx', `${x}px`);
    cursor.style.setProperty('--cy', `${y}px`);
    if (!animate) cursor.style.transition = 'none';
    else cursor.style.removeProperty('transition');
  }
  async function demoTap(id) {
    cursor.classList.add('is-down');
    await sleep(100, id);
    cursor.classList.remove('is-down');
    await sleep(160, id);
  }
  async function demoPointAt(el, id) {
    const { x, y } = targetCenter(el);
    if (REDUCED()) {
      moveCursor(x, y, false);
      return;
    }
    moveCursor(x, y, true);
    await sleep(520, id);
  }
  async function demoActivate(el, id, activate) {
    if (!AUTO || params.has('manual')) {
      activate();
      return;
    }
    await demoPointAt(el, id);
    await demoTap(id);
    activate();
  }
  function hideCursor() {
    cursor.hidden = true;
  }

  composer.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v || !waiting) return;
    input.value = '';
    waiting(v);
  });

  function reset() {
    run++;
    waiting = null;
    clients = [];
    thread.innerHTML = '';
    closeAsk();
    input.value = '';
    app.dataset.state = 'empty';
    app.classList.remove('is-reading');
    app.removeAttribute('style');
    steps.forEach((s) => s.classList.remove('in', 'on'));
    current = null;
    app.classList.remove('chat-open');
    $('pLogo').innerHTML = '';
    $('pName').textContent = '';
    $('paThread').innerHTML = '';
    closeShare();
    $('bShare').hidden = true;
    app.__brand = null;
    app.dataset.step = 0;
    app.querySelector('.p-card').innerHTML = STM.stepHTML({ goal: '', audience: '', date: '' }, 0);
    $('bStatus').textContent = 'Draft';
    $('bStatus').classList.remove('live');
    $('bSaved').textContent = 'Draft — not saved';
    $('bPublish').textContent = 'Publish';
    $('bPublish').classList.remove('ready');
    $('bClients').innerHTML = '';
    document.body.classList.remove('is-sold');
    document.body.style.removeProperty('--stm-accent');
    hideCursor();
    return run;
  }

  async function play() {
    const id = reset();
    try {
      await sleep(300, id);

      // 1 — Build it once, for Nike.
      await typeInto('Build a campaign email app for Nike — brief, assets, compose, review.', id);
      await ai('Starting from the EDM campaign template. Four steps, already wired — I’ll fit each one to Nike.', id);

      const card = add(el('div', 'm m-card', '<div class="m-card-t">Four steps</div><div class="m-steps"></div>'));
      const list = card.querySelector('.m-steps');
      const lines = STEPS.map(([name, kind], i) =>
        list.appendChild(el('div', 'm-stepline', `<span class="n">${i + 1}</span>${name}<span class="k">${kind}</span>`)));
      scrollThread();

      for (let i = 0; i < 4; i++) {
        lines[i].classList.add('doing');
        await sleep(480, id);
        steps[i].classList.add('in');
        lines[i].classList.replace('doing', 'done');
        await sleep(220, id);
      }

      const nike = BRANDS.nike;
      await ai('Now the look. Everything this app renders will wear it.', id, 500);
      await readSite(nike.domain, nike, id);
      app.dataset.state = 'built';
      steps[0].classList.add('on');
      add(brandCard(nike));
      await Promise.all([
        typeField(F('goal'), nike.goal, id),
        typeField(F('audience'), nike.audience, id),
        typeField(F('date'), nike.date, id),
      ]);

      $('bStatus').textContent = 'Live';
      $('bStatus').classList.add('live');
      $('bSaved').textContent = 'Saved';
      $('bPublish').textContent = 'Published';
      $('bPublish').classList.add('ready');
      clients.push(nike);
      renderClients(nike);
      $('bShare').hidden = false;
      add(doneCard('Campaign email is live for Nike', '4 steps · brand read from nike.com'));

      // 2 — Sell it to many.
      await sleep(1600, id);
      await typeInto('Great. Now make this right for my other client.', id);
      await askForClient(id);
    } catch (e) {
      if (!(e instanceof Cancelled)) throw e;
    }
  }

  function nextSuggestion() {
    const key = SUGGESTIONS.find((k) => !clients.includes(BRANDS[k]));
    return key ? BRANDS[key] : null;
  }

  async function demoSwitchClients(id) {
    const tabs = [...$('bClients').querySelectorAll('.b-client')];
    if (tabs.length < 2) return;
    await sleep(1400, id);
    for (const tab of tabs) {
      if (tab.classList.contains('on')) continue;
      await demoActivate(tab, id, () => tab.click());
      await sleep(1100, id);
    }
    hideCursor();
  }

  async function askForClient(id) {
    const first = clients.length === 1;
    await ai(first
      ? 'Same app, new client. Who’s it for? Type any company — I’ll read their site live and re-skin it. The four steps stay exactly as they are.'
      : 'Who’s next? Try any company.', id);

    const chips = el('div', 'm m-chips');
    const chipBtns = {};
    SUGGESTIONS.forEach((key) => {
      const br = BRANDS[key];
      const c = el('button', 'm-chip', `<i style="--c:${br.b === '#FFCC00' ? br.b : br.head}"></i>${esc(br.name)}`);
      c.type = 'button';
      c.disabled = clients.includes(br);
      c.addEventListener('click', () => waiting && waiting(br.name));
      chipBtns[key] = c;
      chips.appendChild(c);
    });
    chips.appendChild(el('span', 'm-chips-k', 'or type any company'));
    add(chips);

    let name;
    const preset = params.get('client');
    const suggested = nextSuggestion();
    if (preset && first) {
      await sleep(900, id);
      name = preset;
    } else if (AUTO && suggested) {
      await sleep(first ? 1100 : 800, id);
      const key = SUGGESTIONS.find((k) => BRANDS[k] === suggested);
      const chip = chipBtns[key];
      await demoActivate(chip, id, () => { name = suggested.name; });
    } else if (AUTO && !suggested) {
      closeAsk();
      await demoSwitchClients(id);
      return;
    } else {
      name = await ask(id);
    }
    closeAsk();
    chips.querySelectorAll('button').forEach((b) => (b.disabled = true));
    user(name);

    let br = curated(name);
    if (br) {
      await ai(`Reading ${esc(br.domain)} for colours, logo and tone of voice…`, id, 500);
      br = await readSite(br.domain, br, id);
    } else {
      await ai(`Looking up ${esc(name)} and reading their site…`, id, 400);
      const step = (t) => { if (id === run) $('pReadingT').textContent = t + ' — reading logo and colours…'; };
      const live = readLive(name, step).catch(() => null);
      br = await readSite(name, live.then((b) => b || brandFor(name)), id);
    }
    add(brandCard(br));
    await Promise.all([
      typeField(F('goal'), br.goal, id),
      typeField(F('audience'), br.audience, id),
      typeField(F('date'), br.date, id),
    ]);

    if (!clients.includes(br)) clients.push(br);
    renderClients(br);
    document.body.classList.add('is-sold');
    add(doneCard(`${esc(br.name)}’s version is live`, `Same 4 steps, same wiring · ${clients.length} clients, 1 app`));

    await sleep(900, id);
    if (AUTO && nextSuggestion()) return askForClient(id);
    if (AUTO) {
      await demoSwitchClients(id);
      return;
    }
    return askForClient(id);
  }

  /* ---- Device preview: desktop / tablet / phone ---- */
  const device = $('bDevice');
  document.querySelectorAll('[data-device]').forEach((btn) => {
    btn.addEventListener('click', () => {
      device.dataset.mode = btn.dataset.device;
      document.querySelectorAll('[data-device]').forEach((b) => b.classList.toggle('on', b === btn));
      app.classList.remove('chat-open');
    });
  });
  STM.bindSteps(app);
  app.querySelector('.p-fab').addEventListener('click', () => app.classList.add('chat-open'));
  app.querySelector('.pa-close').addEventListener('click', () => app.classList.remove('chat-open'));

  /* ---- Share: QR for the real phone, or open it in a phone frame here ---- */
  const pop = $('bSharePop');
  function shareUrl() {
    return new URL('app.html?' + STM.shareParams(current || BRANDS.nike), location.href).href;
  }
  function openShare() {
    const url = shareUrl();
    $('bShareUrl').textContent = url.replace(/^https?:\/\//, '');
    $('bShareName').textContent = (current || BRANDS.nike).name;
    const canvas = $('bQr');
    if (window.QRCode) window.QRCode.toCanvas(canvas, url, { width: 168, margin: 0, errorCorrectionLevel: 'L' }, () => {});
    pop.hidden = false;
  }
  function closeShare() { pop.hidden = true; }
  $('bShare').addEventListener('click', (e) => { e.stopPropagation(); pop.hidden ? openShare() : closeShare(); });
  pop.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', closeShare);
  $('bCopy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(shareUrl()); $('bCopy').textContent = 'Copied'; setTimeout(() => ($('bCopy').textContent = 'Copy'), 1600); } catch (e) { /* noop */ }
  });

  const phone = $('stmPhone');
  function openPhone() {
    closeShare();
    $('stmPhoneFrame').src = shareUrl();
    $('stmPhoneName').textContent = (current || BRANDS.nike).name;
    phone.hidden = false;
    requestAnimationFrame(() => phone.classList.add('in'));
  }
  function closePhone() {
    phone.classList.remove('in');
    setTimeout(() => { phone.hidden = true; $('stmPhoneFrame').src = 'about:blank'; }, 350);
  }
  $('bQrOpen').addEventListener('click', openPhone);
  $('bOpenPhone').addEventListener('click', openPhone);
  $('stmPhoneClose').addEventListener('click', closePhone);
  phone.addEventListener('click', (e) => { if (e.target === phone) closePhone(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !phone.hidden) closePhone(); });

  // Scale the 1280×760 builder to the stage width.
  const fit = $('stmFit');
  const stage = $('stmApp');
  function scale() {
    const s = Math.min(1, fit.clientWidth / 1280);
    stage.style.transform = `scale(${s})`;
    fit.style.height = `${760 * s}px`;
  }
  new ResizeObserver(scale).observe(fit);
  scale();

  $('stmReplay').addEventListener('click', play);

  // Start once the page entrance has finished and the builder is in view.
  let started = false;
  const entered = new Promise((r) => {
    const stageEl = document.querySelector('.stm-stage');
    stageEl.addEventListener('animationend', r, { once: true });
    setTimeout(r, 1400); // reduced motion, or no animation
  });
  new IntersectionObserver((entries, obs) => {
    if (!started && entries.some((e) => e.isIntersecting)) {
      started = true;
      obs.disconnect();
      entered.then(() => setTimeout(play, 150));
    }
  }, { threshold: 0.35 }).observe(fit);
})();
