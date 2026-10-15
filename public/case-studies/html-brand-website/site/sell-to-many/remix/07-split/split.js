/* 07 · Split brain
   The page is two worlds happening at once, split by a live seam.
   LEFT — you, the maker, in EAI's builder: a blueprint sheet, neutral and
   precise. The builder chat changes the app itself (steps, brand, tone,
   fields). RIGHT — Nike's marketing team inside the published Campaign email
   app: their brand, a warm room, their own in-app assistant that helps them
   write and never changes how the app is built.
   When a builder instruction lands, particles carry it across the seam and
   the right world changes while its user keeps working. Drag the seam to give
   either world the screen. Scroll, and the one seam forks into six: one maker
   feeding six clients' teams, each chatting to their own branded assistant.
   ?manual=1 skips the autoplay. */
(function () {
  'use strict';

  const { BRANDS, esc, voiceOf } = window.SPLIT;
  const $ = (id) => document.getElementById(id);
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => RM.matches;
  const params = new URLSearchParams(location.search);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

  const stage = $('stage');
  const pin = $('pin');
  const userWorld = $('user');

  const STEPS = [
    { name: 'Brief', wire: 'Form', sub: 'Collects the brief' },
    { name: 'Assets', wire: 'Data source', sub: 'SharePoint · Brand' },
    { name: 'Compose', wire: 'AI writer', sub: 'Drafts in their voice' },
    { name: 'Review', wire: 'Approval', sub: 'One approver, then send' },
  ];

  /* M = what the maker has built (left). R = what is live in the app (right).
     A change lands on the left first, then crosses the seam into R. */
  const M = { brand: BRANDS.nike, tone: 'base', fields: [], approvers: 1 };
  const R = { brand: BRANDS.nike, tone: 'base', steps: 4, fields: [], approvers: 1, step: 2, subj: 0, short: false };
  const copies = new Set(['nike']);

  /* ---------------- brand painting ---------------- */
  function darken(hex, amt) {
    const n = parseInt(hex.slice(1, 7), 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * (1 - amt)));
    return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  }
  const accentOf = (br) => (window.SPLIT.inkFor(br.b) === '#111111' ? darken(br.b, 0.22) : br.b);
  const typeClass = (br) => (br.caps ? 'caps' : br.tight ? 'tight' : 'heavy');
  function paintVars(node, br) {
    const s = node.style;
    s.setProperty('--b', br.b);
    s.setProperty('--b-on', br.on);
    s.setProperty('--b-head', br.head);
    s.setProperty('--b-head-on', br.headOn);
    s.setProperty('--b-logo-on', br.logoOn || br.headOn);
    s.setProperty('--b-surface', br.surface);
    s.setProperty('--b-world', br.world);
    s.setProperty('--b-ink', br.ink);
    s.setProperty('--b-accent', accentOf(br));
    s.setProperty('--b-font', br.font);
    s.setProperty('--b-display', br.display);
  }
  function logoInto(node, br) {
    node.innerHTML = br.logoChip ? `<span class="chip-logo">${br.logo}</span>` : br.logo;
    const img = node.querySelector('img[data-fallback]');
    if (img) img.onerror = () => { node.innerHTML = `<span class="mono">${esc(img.dataset.fallback)}</span>`; };
  }
  const personLine = (br) => `${br.person.name}, ${br.person.team}`;
  const toneText = (br, tone) => (tone === 'warm' ? br.warmTone : br.tone);

  /* ---------------- LEFT: the wiring sheet ---------------- */
  function renderNodes(flashIdx) {
    const ol = $('nodes');
    ol.innerHTML = '';
    STEPS.forEach((s, i) => {
      const sub = i === 3 && M.approvers === 2 ? 'Two approvers, then send' : i === 0 && M.fields.length ? `Collects the brief + ${M.fields.join(', ').toLowerCase()}` : s.sub;
      const li = el('li', 'node' + (i === flashIdx ? ' flash' : ''),
        `<span class="n">0${i + 1}</span><div><b>${esc(s.wire)}</b><small>→ ${esc(s.name)} · ${esc(sub)}</small></div><span class="port"></span>`);
      li.dataset.i = i;
      ol.appendChild(li);
    });
    $('schemCount').textContent = '4 STEPS · ALWAYS';
  }
  function renderSpec(flash) {
    const br = M.brand;
    $('specClient').textContent = br.name;
    $('specHex').textContent = br.b.toUpperCase();
    $('specSw').style.setProperty('--spec-b', br.b);
    $('specTone').textContent = toneText(br, M.tone);
    $('specCopies').textContent = String(copies.size);
    if (flash) [flash].flat().forEach((id) => { const b = $(id).closest('b') || $(id); b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash'); });
  }

  /* ---------------- RIGHT: the published app ---------------- */
  /* One maker, one headline — until the seam forks. Then "Sell to many."
     keeps changing hands between the clients' brands. */
  let hlList = null, hlIdx = 0;
  function paintHeadline(br, anim) {
    const text = 'Sell to many<i>.</i>';
    $('hlUser').innerHTML = `<span class="hl-base ${typeClass(br)}" style="font-family:${esc(br.display)}">${text}</span>` +
      `<span class="hl-slice ${typeClass(br)}${anim ? ' in' : ''}" style="--hs-display:${esc(br.display)};--hs-ink:${br.ink};--hs-accent:${accentOf(br)}">${text}</span>`;
  }
  function renderHeadline(list) {
    hlList = list && list.length > 1 ? list : null;
    if (!hlList) paintHeadline(R.brand, false);
  }
  setInterval(() => {
    if (!hlList || reduced() || document.hidden) return;
    hlIdx = (hlIdx + 1) % hlList.length;
    paintHeadline(hlList[hlIdx], true);
  }, 1100);
  function renderPerson() {
    const br = R.brand;
    $('personAv').textContent = br.person.initials;
    $('personName').textContent = personLine(br);
    $('personSub').textContent = 'Their team · using the published app';
    $('curUserName').textContent = br.person.name;
  }
  function renderStepper(newIdx) {
    const ol = $('stepper');
    ol.innerHTML = '';
    for (let i = 0; i < R.steps; i++) {
      const li = el('li', (i < R.step ? 'done' : '') + (i === R.step ? ' on' : '') + (i === newIdx ? ' new' : ''),
        `<i>${i < R.step ? '✓' : i + 1}</i>${esc(STEPS[i].name)}${i === newIdx ? '<span class="badge">NEW</span>' : ''}`);
      li.dataset.i = i;
      li.tabIndex = 0;
      li.setAttribute('role', 'button');
      ol.appendChild(li);
    }
  }
  function body() { const v = voiceOf(R.brand, R.tone); return R.short ? v.short : v.body; }
  function subject() { const v = voiceOf(R.brand, R.tone); return R.customSubj || v.subjects[R.subj % v.subjects.length]; }
  function cardHTML() {
    const br = R.brand;
    const next = R.step < 3 ? `Next: ${STEPS[R.step + 1].name.toLowerCase()}` : 'Send for approval';
    const nextBtn = `<div class="c-next"><button type="button" class="btn-b" data-next>${esc(next)}</button></div>`;
    if (R.step === 0) {
      const extra = R.fields.map((f, i) => `<div class="c-field${i === R.fields.length - 1 && R.newField ? ' new' : ''}"><span>${esc(f)}</span><div>${f === 'Due date' ? '1 October' : f === 'Budget' ? '$40,000' : '—'}</div></div>`).join('');
      return `<div class="c-hd"><b>Tell us about the campaign</b><small>A few fields. The rest is written for you.</small></div>` +
        `<div class="c-field"><span>Campaign goal</span><div>${esc(br.goal)}</div></div>` +
        `<div class="c-row"><div class="c-field"><span>Audience</span><div>${esc(br.audience)}</div></div><div class="c-field"><span>Send date</span><div>${esc(br.date)}</div></div></div>` + extra + nextBtn;
    }
    if (R.step === 1) {
      return `<div class="c-hd"><b>Assets</b><small>Pulled from SharePoint · Brand / Guidelines</small></div>` +
        (br.files || []).map((f) => `<div class="c-file"><i></i>${esc(f)}<small>Synced 2 min ago</small></div>`).join('') + nextBtn;
    }
    if (R.step === 3) {
      return `<div class="c-hd"><b>Review</b><small>${R.approvers === 2 ? 'Two approvals' : 'One approval'} before it sends on ${esc(br.date)}.</small></div>` +
        `<div class="c-who"><span class="av sm">JL</span><div><b>Jordan Lee</b><br /><small>Marketing lead · approver</small></div><em>Waiting</em></div>` +
        (R.approvers === 2 ? `<div class="c-who${R.newApprover ? ' flash-text' : ''}"><span class="av sm">RC</span><div><b>Riley Chen</b><br /><small>Legal · second approver</small></div><em>Waiting</em></div>` : '') +
        `<div class="c-check">Brand colours and logo</div><div class="c-check">Tone — ${esc(toneText(br, R.tone))}</div><div class="c-check">Links and unsubscribe</div>` + nextBtn;
    }
    return `<div class="c-hd"><b>Compose</b><small>Drafted from the brief, in ${esc(br.name)}’s voice.</small></div>` +
      `<div class="c-subj" id="cSubj"><span>Subject</span>${esc(subject())}</div>` +
      `<div class="c-mail"><div class="c-mail-bar">${br.logo}</div><div class="c-mail-body"><h4 class="${typeClass(br)}" id="cHead">${esc(subject())}</h4><p id="cBody">${esc(body())}</p><span class="btn-b">${esc(br.cta)}</span></div></div>` + nextBtn;
  }
  function renderCard(anim) {
    const c = $('card');
    c.innerHTML = cardHTML();
    const img = c.querySelector('.c-mail-bar img');
    if (img) img.onerror = () => { img.remove(); };
    if (anim) { c.classList.remove('swap'); void c.offsetWidth; c.classList.add('swap'); }
    R.newField = false;
  }
  function renderApp() {
    const br = R.brand;
    paintVars(userWorld, br);
    paintVars($('curUser'), br);
    paintVars(document.querySelector('.seam'), br);
    paintVars(document.querySelector('.scrollcue'), br);
    logoInto($('appLogo'), br);
    logoInto($('assistLogo'), br);
    $('appName').textContent = br.name;
    $('appUrl').textContent = `campaigns.${br.domain}`;
    $('appTone').textContent = toneText(br, R.tone);
    $('assistName').textContent = `${br.name} assistant`;
    $('aInput').placeholder = `Ask the ${br.name} assistant…`;
    renderPerson();
    if (!stage.classList.contains('is-many')) renderHeadline();
    renderStepper();
    renderCard();
    renderAssistChips();
    syncSections();
  }

  function flash(node, cls = 'flash-ring') {
    if (!node) return;
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
  }
  let toastT = 0;
  function toast(text) {
    const t = $('toast');
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ---------------- chats ---------------- */
  function scroll(thread) { thread.scrollTop = thread.scrollHeight; }
  function add(thread, node) { thread.appendChild(node); scroll(thread); return node; }
  async function typing(thread, ms) {
    if (reduced()) return;
    const d = add(thread, el('div', 'm m-dots', '<i></i><i></i><i></i>'));
    await wait(ms);
    d.remove();
  }

  const bThread = $('bThread');
  const aThread = $('aThread');
  const bSay = (t) => add(bThread, el('div', 'm m-you', esc(t)));
  const bLog = (html) => add(bThread, el('div', 'm m-log', html));
  async function bReply(html, ms = 650) { await typing(bThread, ms); return add(bThread, el('div', 'm m-bot', html)); }
  const aSay = (t) => add(aThread, el('div', 'm m-user', esc(t)));
  const aNote = (t) => add(aThread, el('div', 'm m-note', esc(t)));
  async function aReply(html, ms = 700) { await typing(aThread, ms); return add(aThread, el('div', 'm m-ai', html)); }

  function greetAssistant() {
    aThread.innerHTML = '';
    const br = R.brand;
    add(aThread, el('div', 'm m-ai', `Hi ${esc(br.person.name)} — I’m the ${esc(br.name)} assistant. I can help you write this email.`));
  }

  /* ---- builder chips ---- */
  function renderBuilderChips() {
    const box = $('bChips');
    box.innerHTML = '';
    let list;
    if (stage.classList.contains('is-many')) list = ['Add a due date to the brief', 'Make the tone warmer', 'Make it for Spotify'];
    else {
      list = [];
      if (M.approvers < 2) list.push('Make Review need two approvers');
      list.push(M.brand.key === 'apple' ? 'Make it for CommBank' : 'Make it for Apple');
      list.push(M.tone === 'warm' ? 'Make it punchier' : 'Make the tone warmer');
      if (list.length < 3) list.push('Add a fifth step');
    }
    list.forEach((t) => {
      const b = el('button', 'chip', esc(t));
      b.type = 'button';
      b.addEventListener('click', (e) => { if (e.isTrusted) stopAuto(); sendBuilder(t); });
      box.appendChild(b);
    });
  }
  function renderAssistChips() {
    const box = $('aChips');
    box.innerHTML = '';
    ['Suggest three subject lines', R.short ? 'Make the intro longer' : 'Make the intro shorter'].forEach((t) => {
      const b = el('button', 'chip', esc(t));
      b.type = 'button';
      b.addEventListener('click', (e) => { if (e.isTrusted) stopAuto(); sendAssist(t); });
      box.appendChild(b);
    });
  }

  /* ---------------- the seam-crossing effect ---------------- */
  const fx = (function () {
    const cv = $('fx');
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, raf = 0;
    const items = [];
    const rings = [];
    function size() {
      const r = stage.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function anchor(node, dir) {
      const s = stage.getBoundingClientRect();
      if (!node || !node.getBoundingClientRect) return null;
      const r = node.getBoundingClientRect();
      if (!r.width && !r.height) return null;
      const v = stage.classList.contains('is-v');
      let x = r.left + r.width / 2 - s.left, y = r.top + r.height / 2 - s.top;
      if (dir === 'out') { if (v) y = r.bottom - s.top; else x = r.right - s.left; }
      if (dir === 'in') { if (v) y = r.top - s.top; else x = r.left - s.left; }
      return { x: clamp(x, 4, W - 4), y: clamp(y, 4, H - 4) };
    }
    const bez = (a, c, b, t) => ({ x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x, y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y });
    const rgb = (hex) => { const n = parseInt(hex.slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const CYAN = rgb('#6FE3FF');
    function fire(from, to, opts = {}) {
      size();
      const a = anchor(from, 'out') || { x: seamPx() - 80, y: H / 2 };
      const b = anchor(to, 'in') || { x: seamPx() + 80, y: H / 2 };
      if (reduced()) { ring(b.x, b.y, opts.color || '#FA5400', 1); return wait(120); }
      const v = stage.classList.contains('is-v');
      const c = v ? { x: (a.x + b.x) / 2 + 90, y: (a.y + b.y) / 2 } : { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 70 - Math.abs(a.y - b.y) * 0.15 };
      // where the path crosses the seam
      let tc = 0.5, best = 1e9;
      for (let i = 0; i <= 60; i++) {
        const p = bez(a, c, b, i / 60);
        const d = Math.abs((v ? p.y : p.x) - seamPx());
        if (d < best) { best = d; tc = i / 60; }
      }
      const dur = opts.dur || 950;
      const n = opts.n || 36;
      return new Promise((resolve) => {
        const parts = [];
        for (let i = 0; i < n; i++) parts.push({ d: (i / n) * dur * 0.45, j: (Math.random() - 0.5) * 26, r: 1.2 + Math.random() * 1.8, s: 0.85 + Math.random() * 0.3 });
        items.push({ a, b, c, tc, t0: performance.now(), dur, parts, col: rgb(opts.color || '#FA5400'), crossed: false, arrived: false, resolve, big: !!opts.big });
        start();
      });
    }
    function ring(x, y, color, big) { rings.push({ x, y, t0: performance.now(), col: typeof color === 'string' ? rgb(color) : color, big }); start(); }
    function start() { if (!raf) raf = requestAnimationFrame(frame); }
    function frame(now) {
      raf = 0;
      ctx.clearRect(0, 0, W, H);
      const sx = seamPx();
      const v = stage.classList.contains('is-v');
      for (let k = items.length - 1; k >= 0; k--) {
        const it = items[k];
        const el0 = now - it.t0;
        const total = it.dur + it.dur * 0.45 + 200;
        // the thread itself
        const life = clamp(el0 / total, 0, 1);
        const alpha = Math.sin(Math.PI * life) * 0.55;
        const g = ctx.createLinearGradient(it.a.x, it.a.y, it.b.x, it.b.y);
        g.addColorStop(0, `rgba(${CYAN},${alpha})`);
        g.addColorStop(clamp(it.tc, 0.01, 0.99), `rgba(255,255,255,${alpha})`);
        g.addColorStop(1, `rgba(${it.col},${alpha})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = it.big ? 1.6 : 1;
        ctx.beginPath();
        ctx.moveTo(it.a.x, it.a.y);
        ctx.quadraticCurveTo(it.c.x, it.c.y, it.b.x, it.b.y);
        ctx.stroke();
        let alive = false;
        for (const p of it.parts) {
          const t = ((el0 - p.d) / it.dur) * p.s;
          if (t < 0) { alive = true; continue; }
          if (t > 1) continue;
          alive = true;
          const pt = bez(it.a, it.c, it.b, t);
          const pt2 = bez(it.a, it.c, it.b, Math.max(0, t - 0.035));
          const wob = Math.sin(Math.PI * t) * p.j;
          const x = pt.x + (v ? wob : 0), y = pt.y + (v ? 0 : wob);
          const x2 = pt2.x + (v ? wob : 0), y2 = pt2.y + (v ? 0 : wob);
          const past = clamp(((v ? y : x) - sx + 24) / 48, 0, 1);
          const col = CYAN.map((cc, i) => Math.round(cc + (it.col[i] - cc) * past));
          ctx.strokeStyle = `rgba(${col},${0.5})`;
          ctx.lineWidth = p.r;
          ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x, y); ctx.stroke();
          ctx.fillStyle = `rgba(${col},1)`;
          ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI * 2); ctx.fill();
        }
        const lead = (el0 / it.dur) * 1.1;
        if (!it.crossed && lead >= it.tc) {
          it.crossed = true;
          const cp = bez(it.a, it.c, it.b, it.tc);
          ring(cp.x, cp.y, [255, 255, 255], it.big);
          const s = document.querySelector('.seam');
          s.classList.add('hit');
          setTimeout(() => s.classList.remove('hit'), 380);
        }
        if (!it.arrived && lead >= 1) {
          it.arrived = true;
          ring(it.b.x, it.b.y, it.col, it.big);
          it.resolve();
        }
        if (!alive && life >= 1) items.splice(k, 1);
      }
      for (let k = rings.length - 1; k >= 0; k--) {
        const r = rings[k];
        const t = (now - r.t0) / 700;
        if (t >= 1) { rings.splice(k, 1); continue; }
        const e = 1 - Math.pow(1 - t, 3);
        ctx.strokeStyle = `rgba(${r.col},${(1 - t) * 0.9})`;
        ctx.lineWidth = 2 * (1 - t) + 0.5;
        ctx.beginPath(); ctx.arc(r.x, r.y, 4 + e * (r.big ? 70 : 34), 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = `rgba(${r.col},${(1 - t) * 0.35})`;
        ctx.beginPath(); ctx.arc(r.x, r.y, 3 + e * 6, 0, Math.PI * 2); ctx.fill();
      }
      if (items.length || rings.length) raf = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, W, H);
    }
    window.addEventListener('resize', size);
    size();
    return { fire, ring, anchor, size };
  })();

  /* Carry a change across the seam, then apply it on arrival. */
  async function cross(from, to, apply, opts = {}) {
    await fx.fire(from, to, { color: (opts.brand || R.brand).b, ...opts });
    apply && apply();
  }
  const lastBot = () => [...bThread.querySelectorAll('.m-bot')].pop();

  /* ---------------- BUILDER intents ---------------- */
  let bBusy = Promise.resolve();
  function sendBuilder(text) {
    text = text.trim();
    if (!text) return bBusy;
    bSay(text);
    bBusy = bBusy.then(() => handleBuilder(text)).catch((e) => { console.warn(e); });
    return bBusy;
  }
  function clientFrom(t) {
    const m = t.match(/(?:make|build|do|switch|rebrand|change|turn|copy|sell)\b.*?\b(?:it|this|app)?\s*(?:for|to|into)\s+(.+)$/i) || t.match(/^(?:for|now for)\s+(.+)$/i);
    if (m) return m[1].replace(/[.!?]+$/, '').replace(/^(the\s+)/i, '').trim();
    if (window.SPLIT.curated(t)) return t;
    return null;
  }
  async function handleBuilder(t) {
    const low = t.toLowerCase();
    const many = stage.classList.contains('is-many');
    if (/subject|intro|headline|rewrite|shorter|copy for|suggest/.test(low) && !/step|field|tone/.test(low)) {
      await bReply(`That one’s for the <b>${esc(R.brand.name)} assistant</b> — it lives inside the app, for ${esc(R.brand.name)}’s team. This chat changes how the app works: steps, fields, brand and tone.`);
      $('aForm').classList.remove('nudge'); void $('aForm').offsetWidth; $('aForm').classList.add('nudge');
      return;
    }
    if (/(fifth|5th|another step|extra step|more steps|sixth|new step)/.test(low) || /add .*step/.test(low)) {
      await bReply('Apps here are exactly four steps — Brief, Assets, Compose, Review. That’s the shape your clients buy. I can change what a step does instead: try “Add a due date to the brief”.');
      return;
    }
    if (/(two|2|second|another|extra).*approv|approv.*(two|2)/.test(low)) { await setApprovers(2); return; }
    if (/(one|1|single).*approv/.test(low)) { await setApprovers(1); return; }
    if (/approv|review|sign.?off/.test(low)) {
      await bReply('Review is already step four — Jordan approves before it sends. I can make it need two approvers.');
      return;
    }
    if (/(remove|delete|drop|lose).*(step)/.test(low)) {
      await bReply('Four steps is the shape — I’ll keep all four. I can make a step simpler, or change what it asks for.');
      return;
    }
    const client = clientFrom(t);
    if (client) { await rebrand(client); return; }
    if (/warm|friend|soft|kind|gentle/.test(low)) { await setTone('warm'); return; }
    if (/punch|sharp|urgent|direct|formal|less warm|original|bolder|crisp/.test(low)) { await setTone('base'); return; }
    const fm = low.match(/(due date|deadline|budget|owner|region|channel|field)/);
    if (fm && /add|include|need|ask/.test(low)) {
      const label = { 'due date': 'Due date', deadline: 'Due date', budget: 'Budget', owner: 'Owner', region: 'Region', channel: 'Channel', field: 'Due date' }[fm[1]];
      await addField(label);
      return;
    }
    if (/logo|colou?r|brand|palette/.test(low)) {
      const msg = await bReply(`Re-read ${esc(M.brand.domain)}: colours and logo are current. I’ll keep checking before each send.`);
      await cross(msg, $('app').querySelector('.app-bar'), () => flash($('app').querySelector('.app-bar')));
      return;
    }
    if (/publish|share|phone|link/.test(low)) {
      await bReply(`It’s published — ${esc(R.brand.name)}’s team is using it on the right. Scroll down for the phone link.`);
      return;
    }
    if (/^(hi|hello|hey)\b/.test(low)) { await bReply('Hi — tell me what to change. Steps, fields, brand or tone.'); return; }
    await bReply(many
      ? 'I change the app itself — and every copy follows. Try “Add a due date to the brief”.'
      : 'I change how the app works: its steps, fields, brand and tone. Try “Make it for Apple” or “Make the tone warmer”.');
  }

  async function setApprovers(n) {
    if (M.approvers === n) { await bReply(n === 2 ? 'Review already needs two approvers.' : 'Review already needs one approver.'); return; }
    M.approvers = n;
    renderNodes(3);
    renderBuilderChips();
    const msg = await bReply(n === 2
      ? 'Review now needs <b>two approvers</b> — Jordan, then Legal. Still four steps; step four just got stricter.'
      : 'Back to <b>one approver</b> on Review. Still four steps.');
    await cross(document.querySelector('.node[data-i="3"] .port') || msg, $('stepper').children[3], () => {
      R.approvers = n;
      R.newApprover = n === 2;
      const li = $('stepper').children[3];
      if (li) {
        const old = li.querySelector('.badge');
        if (old) old.remove();
        if (n === 2) li.insertAdjacentHTML('beforeend', '<span class="badge">2 APPROVERS</span>');
        flash(li);
      }
      if (R.step === 3) renderCard();
      R.newApprover = false;
      toast(`App updated by its builder · Review needs ${n === 2 ? 'two approvers' : 'one approver'}`);
      aNote(`App updated · Review now needs ${n === 2 ? 'two approvers' : 'one approver'}`);
    });
    bLog('<b>crossed</b> → live in ' + esc(R.brand.name) + '’s app');
  }

  async function setTone(tone) {
    if (M.tone === tone) { await bReply(tone === 'warm' ? 'It’s already warm — any warmer and it stops sounding like them.' : 'It’s already in their usual voice.'); return; }
    M.tone = tone;
    renderSpec('specTone');
    renderBuilderChips();
    const msg = await bReply(tone === 'warm'
      ? `Warmer it is — still ${esc(M.brand.name)}, softer edges. Their assistant writes this way from now on.`
      : `Back to ${esc(M.brand.name)}’s usual voice: ${esc(M.brand.tone.toLowerCase())}.`);
    if (stage.classList.contains('is-many')) { await fanOut(msg, tone === 'warm' ? 'Tone: warmer' : 'Tone: punchier'); }
    await cross(msg, $('appTone'), () => {
      R.tone = tone;
      $('appTone').textContent = toneText(R.brand, R.tone);
      flash($('appTone'));
      if (R.step === 2) { renderCard(); flash($('cBody'), 'flash-text'); }
      toast(`App updated by its builder · tone is ${tone === 'warm' ? 'warmer' : 'punchier'}`);
      aNote(`Voice updated · ${toneText(R.brand, R.tone)}`);
      syncSections();
    });
  }

  async function addField(label) {
    if (M.fields.includes(label)) { await bReply(`The brief already asks for ${esc(label.toLowerCase())}.`); return; }
    M.fields.push(label);
    renderNodes(0);
    const many = stage.classList.contains('is-many');
    const msg = await bReply(`Added <b>${esc(label)}</b> to the Brief. Same four steps — ${many ? 'every copy gets it at once' : 'and every copy you sell gets it'}.`);
    if (many) await fanOut(msg, `+ ${label}`);
    await cross(document.querySelector('.node[data-i="0"] .port') || msg, $('stepper').firstElementChild, () => {
      R.fields.push(label);
      R.newField = true;
      if (R.step === 0) renderCard(); else {
        const li = $('stepper').firstElementChild;
        if (li && !li.querySelector('.badge')) li.insertAdjacentHTML('beforeend', '<span class="badge">+1</span>');
      }
      flash($('stepper').firstElementChild);
      toast(`App updated by its builder · “${label}” added to Brief`);
      aNote(`App updated · the brief now asks for ${label.toLowerCase()}`);
    });
  }

  async function rebrand(name) {
    const cur = window.SPLIT.curated(name);
    if (cur && cur === M.brand && !stage.classList.contains('is-many')) { await bReply(`It’s already ${esc(cur.name)}’s. Name another client — anyone.`); return; }
    const reading = await bReply(`Reading <b>${esc(cur ? cur.domain : name)}</b>…<ul class="m-steps"></ul>`, 450);
    const list = reading.querySelector('.m-steps');
    const step = (t) => { list.appendChild(el('li', null, esc(t))); scroll(bThread); };
    let br;
    if (cur) {
      br = cur;
      for (const t of [`Colours · ${br.b.toUpperCase()}`, 'Logo', `Voice · ${br.tone}`]) { await wait(reduced() ? 0 : 260); step(t); }
    } else {
      br = await window.SPLIT.resolve(name, step);
      step(br.guess ? 'Couldn’t reach their site — best guess' : `Colours · ${br.b.toUpperCase()}`);
      if (!br.guess) step('Logo');
    }
    if (stage.classList.contains('is-many')) { await addStrip(br, reading); return; }
    M.brand = br;
    copies.add(br.key);
    renderSpec(['specClient', 'specHex', 'specTone', 'specCopies']);
    renderBuilderChips();
    const done = await bReply(`${esc(br.name)}’s copy is live — same four steps, ${esc(br.name)}’s colours, logo and voice. ${esc(R.brand.name)} keeps theirs.`);
    const target = $('appwin');
    await cross(done, target, null, { brand: br, big: true, n: 60, dur: 1050 });
    await wipeTo(br);
    bLog(`<b>crossed</b> → now showing ${esc(br.name)}’s team`);
  }

  async function wipeTo(br) {
    const w = $('wipe');
    const s = stage.getBoundingClientRect();
    const u = $('userContent').getBoundingClientRect();
    const v = stage.classList.contains('is-v');
    const ox = v ? '50%' : `${seamPx()}px`;
    const oy = v ? `${seamPx()}px` : `${u.top - s.top + u.height / 2}px`;
    w.style.background = `radial-gradient(circle at ${ox} ${oy}, ${br.b}, ${br.world} 70%)`;
    const apply = () => {
      R.brand = br; R.subj = 0; R.short = false; R.customSubj = null; R.tone = M.tone;
      R.step = 2;
      renderApp();
      greetAssistant();
    };
    if (reduced() || !w.animate) { apply(); return; }
    w.style.opacity = 1;
    await w.animate([{ clipPath: `circle(0px at ${ox} ${oy})` }, { clipPath: `circle(150% at ${ox} ${oy})` }], { duration: 650, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'forwards' }).finished;
    apply();
    await w.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: 'ease-out', fill: 'forwards' }).finished;
    w.style.opacity = 0;
  }

  /* ---------------- ASSISTANT intents (end user) ---------------- */
  /* One brain for every in-app assistant on the page: returns html in the
     brand's voice. It helps with the work; it never changes the app. */
  function answer(br, tone, text, ctx) {
    const low = text.toLowerCase();
    const v = voiceOf(br, tone);
    if (/(add|remove|delete|new).*(step|field)|approval step|rebrand|make it for|logo|colou?r|wiring|brand it|change the app/.test(low)) {
      return { html: `I can’t change how this app is built — that’s up to whoever made it for ${esc(br.name)}. I can help with the email itself.` };
    }
    if (/subject|headline|title/.test(low)) {
      const items = v.subjects.slice(0, 3);
      if (ctx === 'app') return { html: `Three, in ${esc(br.name)}’s voice:<ul class="picks">${items.map((s, i) => `<li><button type="button" data-pick="${i}">${esc(s)}</button></li>`).join('')}</ul>`, kind: 'subjects' };
      return { html: `Three, in ${esc(br.name)}’s voice:<ol>${items.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`, kind: 'subjects' };
    }
    if (/short|trim|tighten|cut|brief|intro/.test(low) && !/long/.test(low)) return { html: `Shorter:<br /><b>“${esc(v.short || v.subjects[0])}”</b>`, kind: 'short' };
    if (/long|expand|more detail/.test(low)) return { html: `Here’s the fuller version:<br />“${esc(v.body || v.subjects[0])}”`, kind: 'long' };
    if (/cta|button|call to action/.test(low)) return { html: `Keep “${esc(br.cta)}”. It’s short and it sounds like ${esc(br.name)}.` };
    if (/tone|voice|on.?brand|check/.test(low)) return { html: `Reads as: ${esc(toneText(br, tone).toLowerCase())}. On brand.` };
    if (/^(hi|hello|hey)\b/.test(low)) return { html: `Hi! Want three subject lines, or a shorter intro?` };
    if (/thank/.test(low)) return { html: 'Any time. Send it when Jordan’s approved.' };
    return { html: `Happy to help with this email — ask me for subject lines, a shorter intro or a tone check.` };
  }

  let aBusy = Promise.resolve();
  function sendAssist(text) {
    text = text.trim();
    if (!text) return aBusy;
    aSay(text);
    aBusy = aBusy.then(() => handleAssist(text)).catch((e) => console.warn(e));
    return aBusy;
  }
  async function handleAssist(t) {
    const br = R.brand;
    const res = answer(br, R.tone, t, 'app');
    await aReply(res.html);
    if (res.kind === 'short' || res.kind === 'long') {
      R.short = res.kind === 'short';
      if (R.step !== 2) { R.step = 2; renderStepper(); renderCard(true); } else renderCard();
      flash($('cBody'), 'flash-text');
      renderAssistChips();
    }
  }
  aThread.addEventListener('click', (e) => {
    const b = e.target.closest('[data-pick]');
    if (!b) return;
    if (e.isTrusted) stopAuto();
    R.customSubj = b.textContent;
    if (R.step !== 2) { R.step = 2; renderStepper(); }
    renderCard();
    flash($('cSubj'), 'flash-text');
    flash($('cHead'), 'flash-text');
  });

  /* ---------------- app interactions (the end user working) ---------------- */
  $('stepper').addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    R.step = +li.dataset.i;
    renderStepper();
    renderCard(true);
  });
  $('stepper').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.target.click(); } });
  $('card').addEventListener('click', (e) => {
    if (!e.target.closest('[data-next]')) return;
    if (R.step < R.steps - 1) { R.step++; renderStepper(); renderCard(true); } else toast(R.approvers === 2 ? 'Sent to Jordan and Riley for approval' : 'Sent to Jordan for approval');
  });

  $('bForm').addEventListener('submit', (e) => { e.preventDefault(); stopAuto(); const v = $('bInput').value; $('bInput').value = ''; sendBuilder(v); });
  $('aForm').addEventListener('submit', (e) => { e.preventDefault(); stopAuto(); const v = $('aInput').value; $('aInput').value = ''; sendAssist(v); });
  ['bInput', 'aInput'].forEach((id) => $(id).addEventListener('keydown', (e) => { if (e.isTrusted) stopAuto(); }));

  /* ---------------- THE SEAM ---------------- */
  let frac = 0.5;
  const isV = () => stage.classList.contains('is-v');
  function seamPx() { const r = stage.getBoundingClientRect(); return frac * (isV() ? r.height : r.width); }
  function setSeam(f) {
    frac = clamp(f, 0, 1);
    const px = seamPx();
    stage.style.setProperty('--seam', `${px}px`);
    $('seamHandle').setAttribute('aria-valuenow', Math.round(frac * 100));
    stage.classList.toggle('only-maker', frac > 0.97);
    stage.classList.toggle('only-user', frac < 0.03);
    const mode = frac > 0.97 ? 'maker' : frac < 0.03 ? 'user' : Math.abs(frac - 0.5) < 0.02 ? 'both' : '';
    document.querySelectorAll('.modes button').forEach((b) => b.classList.toggle('on', b.dataset.mode === mode));
  }
  let tween = 0;
  function animateSeam(to) {
    cancelAnimationFrame(tween);
    if (reduced()) { setSeam(to); return; }
    const from = frac, t0 = performance.now(), d = 520;
    const step = (now) => {
      const t = clamp((now - t0) / d, 0, 1);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setSeam(from + (to - from) * e);
      if (t < 1) tween = requestAnimationFrame(step);
    };
    tween = requestAnimationFrame(step);
  }
  function orient() {
    stage.classList.toggle('is-v', window.innerWidth < 760);
    if (isV() && Math.abs(frac - 0.5) < 0.02) frac = 0.44;
    if (!isV() && Math.abs(frac - 0.44) < 0.02) frac = 0.5;
    setSeam(frac);
    fx.size();
  }
  (function drag() {
    let on = false;
    const move = (e) => {
      if (!on) return;
      const r = stage.getBoundingClientRect();
      setSeam(isV() ? (e.clientY - r.top) / r.height : (e.clientX - r.left) / r.width);
    };
    const down = (e) => {
      on = true;
      cancelAnimationFrame(tween);
      stage.classList.add('dragging');
      e.currentTarget.setPointerCapture(e.pointerId);
      e.preventDefault();
    };
    const up = () => {
      if (!on) return;
      on = false;
      stage.classList.remove('dragging');
      if (frac < 0.07) animateSeam(0);
      else if (frac > 0.93) animateSeam(1);
      else if (Math.abs(frac - 0.5) < 0.03) animateSeam(0.5);
    };
    [$('seamHandle'), document.querySelector('.seam-line')].forEach((n) => {
      n.addEventListener('pointerdown', down);
      n.addEventListener('pointermove', move);
      n.addEventListener('pointerup', up);
      n.addEventListener('pointercancel', up);
      n.addEventListener('dblclick', () => animateSeam(0.5));
    });
    $('seamHandle').addEventListener('keydown', (e) => {
      const k = e.key;
      const back = isV() ? 'ArrowUp' : 'ArrowLeft', fwd = isV() ? 'ArrowDown' : 'ArrowRight';
      if (k === back) animateSeam(clamp(frac - 0.1, 0, 1));
      else if (k === fwd) animateSeam(clamp(frac + 0.1, 0, 1));
      else if (k === 'Home') animateSeam(0);
      else if (k === 'End') animateSeam(1);
      else if (k === 'Enter' || k === ' ') animateSeam(0.5);
      else return;
      e.preventDefault();
    });
  })();
  document.querySelectorAll('.modes button').forEach((b) => b.addEventListener('click', () => {
    animateSeam({ maker: 1, both: 0.5, user: 0 }[b.dataset.mode]);
  }));

  // blueprint coordinates follow the pointer on the maker side
  let coordRaf = 0;
  stage.addEventListener('pointermove', (e) => {
    if (coordRaf) return;
    coordRaf = requestAnimationFrame(() => {
      coordRaf = 0;
      const r = stage.getBoundingClientRect();
      const x = Math.round(e.clientX - r.left), y = Math.round(e.clientY - r.top);
      $('coords').textContent = `x ${String(x).padStart(4, '0')} · y ${String(y).padStart(4, '0')}`;
    });
  });

  // a real clock in the end user's world
  function tick() {
    const d = new Date();
    $('clock').textContent = d.toLocaleDateString('en-AU', { weekday: 'short' }) + ' ' + d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }).replace(/\s?(am|pm)/i, (m) => m.trim().toLowerCase());
  }
  tick();
  setInterval(tick, 20000);

  /* ---------------- two cursors (autoplay only) ---------------- */
  function moveCursor(cur, target) {
    if (reduced() || !target) return;
    const s = stage.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    cur.style.transform = `translate(${r.left - s.left + Math.min(40, r.width * 0.3)}px, ${r.top - s.top + r.height * 0.55}px)`;
    cur.classList.add('show');
  }
  function hideCursors() { $('curYou').classList.remove('show'); $('curUser').classList.remove('show'); }

  /* ---------------- ONE MAKER, MANY CLIENTS ---------------- */
  const POOL = ['nike', 'apple', 'commbank', 'qantas', 'canva', 'atlassian'];
  let strips = [];
  let shown = 0;
  function stripHTML(br) {
    return `<span class="s-logo"></span>` +
      `<div class="s-name"><b class="${typeClass(br)}">${esc(br.name)}</b><small>${esc(personLine(br))} · using it</small></div>` +
      `<div class="s-steps">${STEPS.map((s, i) => `<i class="${i < 2 ? 'done' : i === 2 ? 'on' : ''}"></i>`).join('')}<span>Step 3 of 4 · <b>Compose</b></span></div>` +
      `<div class="s-chat"><span class="q">${esc(br.qa[0][0])}</span><span class="a">${esc(br.qa[0][1])}</span></div>` +
      `<span class="s-badge"></span>`;
  }
  function paintStrip(node, br) {
    node.style.setProperty('--sb', br.b);
    node.style.setProperty('--son', br.on);
    node.style.setProperty('--shead', br.head);
    node.style.setProperty('--slogo', br.logoOn || br.headOn);
    node.style.setProperty('--sf', br.font);
    node.style.setProperty('--sd', br.display);
    node.innerHTML = stripHTML(br);
    logoInto(node.querySelector('.s-logo'), br);
    node.__br = br;
    node.__qa = 0;
  }
  function buildStrips() {
    const box = $('many');
    box.innerHTML = '';
    const order = [R.brand].concat(POOL.map((k) => BRANDS[k]).filter((b) => b !== R.brand)).slice(0, 6);
    strips = order.map((br) => { const n = el('div', 'strip'); paintStrip(n, br); box.appendChild(n); return n; });
  }
  async function addStrip(br, fromMsg) {
    if (strips.some((s) => s.__br.key === br.key)) { await bReply(`${esc(br.name)} already has a copy — it’s in the stack.`); return; }
    const idx = Math.max(1, strips.length - 1);
    const target = strips[idx];
    copies.add(br.key);
    renderSpec('specCopies');
    const msg = await bReply(`Published <b>${esc(br.name)}</b>’s copy — same four steps, their brand and voice.`);
    await cross(msg || fromMsg, target, () => {
      paintStrip(target, br);
      target.classList.add('in');
      hitStrip(target, 'New client');
      renderHeadline(strips.slice(0, shown).map((s) => s.__br));
    }, { brand: br, big: true });
  }
  function hitStrip(s, label) {
    const b = s.querySelector('.s-badge');
    if (b) b.textContent = label;
    s.classList.remove('hit'); void s.offsetWidth; s.classList.add('hit');
    clearTimeout(s.__hitT);
    s.__hitT = setTimeout(() => s.classList.remove('hit'), 2400);
  }
  async function fanOut(fromMsg, label) {
    const vis = strips.filter((s, i) => i < shown);
    await Promise.all(vis.map((s, i) => wait(i * 70).then(() => fx.fire(fromMsg, s, { color: s.__br.b, n: 22, dur: 900 })).then(() => hitStrip(s, label))));
  }
  const logged = new Set();
  function setMany(n) {
    const was = stage.classList.contains('is-many');
    const on = n > 0;
    if (on && !was) { stopAuto(); buildStrips(); stage.classList.add('is-many'); renderBuilderChips(); }
    if (!on && was) { stage.classList.remove('is-many'); shown = 0; strips.forEach((s) => s.classList.remove('in')); renderHeadline(); renderPerson(); renderBuilderChips(); return; }
    if (!on) return;
    if (n === shown) return;
    const prev = shown;
    shown = n;
    strips.forEach((s, i) => s.classList.toggle('in', i < n));
    renderHeadline(strips.slice(0, n).map((s) => s.__br));
    $('personAv').textContent = String(n);
    $('personName').textContent = n === 1 ? personLine(strips[0].__br) : `${n} clients’ teams`;
    $('personSub').textContent = n === 1 ? 'Their team · using the published app' : 'Each using their own copy, in their own brand';
    strips.slice(0, n).forEach((s) => copies.add(s.__br.key));
    $('specCopies').textContent = String(Math.max(copies.size, n));
    for (let i = prev; i < n; i++) {
      const s = strips[i];
      if (i === 0) continue;
      if (!logged.has(s.__br.key)) { logged.add(s.__br.key); bLog(`<b>published</b> → ${esc(s.__br.name)}’s copy`); }
      if (!reduced()) fx.fire($('schem').offsetParent ? $('nodes') : $('bchat'), s, { color: s.__br.b, n: 18, dur: 800 });
    }
  }
  // each end user keeps chatting with their own assistant
  setInterval(() => {
    if (!stage.classList.contains('is-many') || !stageVisible || reduced() || document.hidden) return;
    const vis = strips.filter((s, i) => i < shown && !s.__busy);
    if (!vis.length) return;
    const s = vis[Math.floor(Math.random() * vis.length)];
    const br = s.__br;
    s.__qa = (s.__qa + 1) % br.qa.length;
    const [q, a] = br.qa[s.__qa];
    const qn = s.querySelector('.q'), an = s.querySelector('.a');
    if (!qn || !an) return;
    s.__busy = true;
    qn.textContent = q;
    an.textContent = '•••';
    an.classList.add('typing');
    setTimeout(() => { an.textContent = a; an.classList.remove('typing'); s.__busy = false; }, 900);
  }, 700);

  let fanned = false;
  let stageVisible = true;
  function onScroll() {
    const total = pin.offsetHeight - window.innerHeight;
    const top = -pin.getBoundingClientRect().top;
    const p = clamp(top / Math.max(1, total), 0, 1);
    const n = p < 0.1 ? 0 : Math.min(6, 1 + Math.floor((p - 0.1) / 0.1));
    setMany(n);
    if (n === 6 && p > 0.72 && !fanned && !M.fields.includes('Due date')) {
      fanned = true;
      stopAuto();
      sendBuilder('Add a due date to the brief');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  new IntersectionObserver((es) => { stageVisible = es[0].isIntersecting; }).observe(stage);

  /* ---------------- AUTOPLAY: both chats at once ---------------- */
  const auto = { stopped: params.has('manual') };
  function stopAuto() { if (!auto.stopped) { auto.stopped = true; hideCursors(); } }
  async function typeAndSend(input, text, send, cur) {
    if (auto.stopped) return false;
    moveCursor(cur, input);
    await wait(reduced() ? 0 : 550);
    if (!reduced()) {
      for (const ch of text) {
        if (auto.stopped) { input.value = ''; return false; }
        input.value += ch;
        await wait(34);
      }
      await wait(220);
    }
    if (auto.stopped) { input.value = ''; return false; }
    input.value = '';
    await send(text);
    return true;
  }
  async function autoplay() {
    if (auto.stopped) return;
    await wait(reduced() ? 0 : 1000);
    const left = (async () => {
      if (!(await typeAndSend($('bInput'), 'Make Review need two approvers', sendBuilder, $('curYou')))) return;
      await wait(2200);
      if (!(await typeAndSend($('bInput'), 'Make the tone warmer', sendBuilder, $('curYou')))) return;
      await wait(2600);
      await typeAndSend($('bInput'), 'Make it for Apple', sendBuilder, $('curYou'));
    })();
    const right = (async () => {
      await wait(reduced() ? 0 : 1700);
      if (!(await typeAndSend($('aInput'), 'Suggest three subject lines', sendAssist, $('curUser')))) return;
      await wait(1400);
      const pick = aThread.querySelector('[data-pick="1"]');
      if (pick && !auto.stopped) { moveCursor($('curUser'), pick); await wait(900); if (!auto.stopped) pick.click(); }
      await wait(2600);
      if (!(await typeAndSend($('aInput'), 'Make the intro shorter', sendAssist, $('curUser')))) return;
      // wait for the maker to hand this app to Apple, then Apple's team starts work
      for (let i = 0; i < 60 && R.brand.key !== 'apple' && !auto.stopped; i++) await wait(250);
      await wait(1300);
      await typeAndSend($('aInput'), 'Suggest three subject lines', sendAssist, $('curUser'));
    })();
    await Promise.all([left, right]);
    await wait(1200);
    hideCursors();
  }

  /* =================================================================
     SECTIONS BELOW THE STAGE
     ================================================================= */
  function syncSections() {
    const br = R.brand;
    const v = voiceOf(br, R.tone);
    // two chats
    const scR = $('scR');
    paintVars(scR, br);
    paintVars(document.querySelector('.sc-seam'), br);
    $('scAv').textContent = br.person.initials;
    $('scTitle').textContent = `The ${br.name} assistant`;
    $('scTitle').className = typeClass(br);
    $('scWho').textContent = `${br.name}’s team, using the app`;
    $('scAnswer').textContent = v.subjects[0];
    // four steps: right cells wear the live brand
    const rows = $('rows');
    paintVars(rows, br);
    rows.querySelectorAll('.row-r b').forEach((b) => { b.className = typeClass(br); });
    const minis = rows.querySelectorAll('.row-r .mini');
    if (minis.length === 4) {
      minis[0].innerHTML = `<i></i>${esc(br.goal)}`;
      minis[1].innerHTML = `<i></i>${esc((br.files || ['brand-guide.pdf'])[0])}`;
      minis[2].innerHTML = `<i></i>${esc(v.subjects[0])}`;
      minis[3].innerHTML = '<i></i>Waiting on Jordan';
    }
  }

  // ---- rebrand in a sentence ----
  function paintRebrand(br) {
    const r = $('rbR');
    r.style.setProperty('--rb-wipe', br.b);
    r.classList.remove('wiping'); void r.offsetWidth; r.classList.add('wiping');
    paintVars(r, br);
    const v = voiceOf(br, 'base');
    logoInto($('rbLogo'), br);
    logoInto($('rbAiLogo'), br);
    $('rbName').textContent = br.name;
    $('rbSubj').textContent = v.subjects[0];
    $('rbSubj').className = typeClass(br);
    $('rbBody').textContent = v.body || `Here’s what’s new at ${br.name} this month.`;
    $('rbCta').textContent = br.cta;
    $('rbGreet').textContent = `Hi ${br.person.name} — I’m the ${br.name} assistant. Want three subject lines?`;
    document.querySelectorAll('#rbChips button').forEach((b) => b.classList.toggle('on', b.dataset.k === br.key));
  }
  let rbRun = 0;
  async function rebrandSection(name) {
    const id = ++rbRun;
    const log = $('readlog');
    log.innerHTML = '';
    const line = (t, done) => { const li = el('li', done ? 'done' : '', esc(t)); log.appendChild(li); return li; };
    line(`Make it for ${name}`);
    const cur = window.SPLIT.curated(name);
    let br;
    if (cur) {
      await wait(reduced() ? 0 : 250);
      br = cur;
      line(`Found ${br.domain}`, true);
    } else {
      br = await window.SPLIT.resolve(name, (t) => { if (id === rbRun) line(t, true); });
    }
    if (id !== rbRun) return;
    line(br.guess ? 'Couldn’t reach their site — best guess from the name' : `Colours · ${br.b.toUpperCase()}   Logo · ✓`, true);
    await wait(reduced() ? 0 : 200);
    line(`Voice · ${br.tone}`, true);
    line('Same four steps. Same wiring underneath.', true);
    paintRebrand(br);
  }
  (function initRebrand() {
    const box = $('rbChips');
    ['nike', 'apple', 'commbank', 'qantas'].forEach((k) => {
      const br = BRANDS[k];
      const b = el('button', '', `<i style="background:${br.b}"></i>${esc(br.name)}`);
      b.type = 'button';
      b.dataset.k = k;
      b.addEventListener('click', () => rebrandSection(br.name));
      box.appendChild(b);
    });
    $('rbForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = $('rbInput').value.trim();
      if (v) rebrandSection(v);
    });
    paintRebrand(BRANDS.nike);
  })();

  // ---- AI in every app: ask all three ----
  const TRIO = ['nike', 'apple', 'commbank'].map((k) => BRANDS[k]);
  (function initTrio() {
    const box = $('trio');
    TRIO.forEach((br) => {
      const card = el('div', 'tri');
      paintVars(card, br);
      card.innerHTML = `<div class="tri-top"><div class="who"><span class="av av-person">${esc(br.person.initials)}</span>${esc(personLine(br))}, using the app</div><h3 class="${typeClass(br)}">Campaign email</h3></div>` +
        `<div class="tri-hd"><span class="assist-logo"></span>${esc(br.name)} assistant</div><div class="thread"></div>`;
      logoInto(card.querySelector('.assist-logo'), br);
      card.__br = br;
      box.appendChild(card);
    });
  })();
  let asked = false;
  async function askAll(q) {
    asked = true;
    const cards = [...document.querySelectorAll('.tri')];
    await Promise.all(cards.map(async (c, i) => {
      const th = c.querySelector('.thread');
      th.innerHTML = '';
      add(th, el('div', 'm m-user', esc(q)));
      await wait(reduced() ? 0 : 200 + i * 260);
      await typing(th, 700);
      add(th, el('div', 'm m-ai', answer(c.__br, 'base', q, 'tri').html));
    }));
  }
  $('askForm').addEventListener('submit', (e) => {
    e.preventDefault();
    askAll($('askInput').value.trim() || 'Suggest three subject lines');
    $('askInput').value = '';
  });

  // ---- share / phone ----
  let shareBrand = BRANDS.nike;
  let phStep = 0;
  function shareURL(br) {
    let q;
    if (['nike', 'apple', 'commbank'].includes(br.key)) q = `c=${br.key}`;
    else q = new URLSearchParams({ n: br.name, d: br.domain, p: br.b.replace('#', '') }).toString();
    return new URL(`../../app.html?${q}`, location.href).href;
  }
  function drawQR(url) {
    const box = $('qr');
    if (window.qrcode) {
      try {
        const qr = window.qrcode(0, 'M');
        qr.addData(url);
        qr.make();
        box.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
        return;
      } catch (e) { /* fall through */ }
    }
    // offline fallback: a QR-like pattern (not scannable), the link still works
    let h = 0;
    for (const ch of url) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    let cells = '';
    const N = 25;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const finder = (x < 7 && y < 7) || (x > N - 8 && y < 7) || (x < 7 && y > N - 8);
      h = (h * 1103515245 + 12345) >>> 0;
      if (finder ? (x % 6 === 0 || y % 6 === 0 || (x % 6 > 1 && x % 6 < 5 && y % 6 > 1 && y % 6 < 5)) : (h >> 16) & 1) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
    box.innerHTML = `<svg viewBox="0 0 ${N} ${N}">${cells}</svg>`;
  }
  function phoneCard() {
    const br = shareBrand;
    const v = voiceOf(br, 'base');
    const c = [
      `<b>Tell us about the campaign</b><div class="c-field"><span>Campaign goal</span><div>${esc(br.goal)}</div></div><div class="c-field"><span>Audience</span><div>${esc(br.audience)}</div></div><div class="c-field"><span>Send date</span><div>${esc(br.date)}</div></div>`,
      `<b>Assets</b>${(br.files || []).map((f) => `<div class="c-file"><i></i>${esc(f)}</div>`).join('')}`,
      `<b>Compose</b><div class="c-subj"><span>Subject</span>${esc(v.subjects[0])}</div><p style="line-height:1.5;color:#3b3834">${esc(v.body)}</p><span class="btn-b">${esc(br.cta)}</span>`,
      `<b>Review</b><div class="c-who"><span class="av sm">JL</span><div><b style="font-size:13px;margin:0">Jordan Lee</b><small>Approver</small></div><em>Waiting</em></div><div class="c-check">Brand colours and logo</div><div class="c-check">Tone of voice</div>`,
    ][phStep];
    const card = $('phCard');
    card.innerHTML = c;
    card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
    [...$('phSteps').children].forEach((li, i) => li.classList.toggle('on', i === phStep));
  }
  function setShare(br) {
    shareBrand = br;
    const url = shareURL(br);
    paintVars(document.querySelector('.sh-r'), br);
    logoInto($('phLogo'), br);
    logoInto($('phAiLogo'), br);
    $('phName').textContent = br.name;
    $('phAi').textContent = `Ask the ${br.name} assistant…`;
    $('shareClient').textContent = br.name;
    $('shareUrl').textContent = url.replace(/^https?:\/\//, '');
    $('shareOpen').href = url;
    drawQR(url);
    phoneCard();
    document.querySelectorAll('#shareChips button').forEach((b) => b.classList.toggle('on', b.dataset.k === br.key));
  }
  (function initShare() {
    const box = $('shareChips');
    ['nike', 'apple', 'commbank'].forEach((k) => {
      const br = BRANDS[k];
      const b = el('button', '', `<i style="background:${br.b}"></i>${esc(br.name)}`);
      b.type = 'button';
      b.dataset.k = k;
      b.addEventListener('click', () => setShare(br));
      box.appendChild(b);
    });
    [...$('phSteps').children].forEach((li, i) => li.addEventListener('click', () => { phStep = i; phoneCard(); }));
    $('copyBtn').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText($('shareOpen').href); $('copyBtn').textContent = 'Copied'; } catch (e) { $('copyBtn').textContent = 'Select it'; }
      setTimeout(() => { $('copyBtn').textContent = 'Copy'; }, 1600);
    });
    setShare(BRANDS.nike);
    // the phone walks through the four steps on its own until touched
    let walk = setInterval(() => { if (reduced() || document.hidden) return; phStep = (phStep + 1) % 4; phoneCard(); }, 2600);
    $('phone').addEventListener('pointerdown', () => clearInterval(walk), { once: true });
  })();
  // qrcode lib may arrive after us (defer order is fine, but guard anyway)
  window.addEventListener('load', () => setShare(shareBrand));

  // ---- CTA: the seam follows you; the right world keeps changing hands ----
  (function initCTA() {
    const st = $('ctaStage');
    const ring = POOL.map((k) => BRANDS[k]);
    let i = 0;
    const paint = () => {
      const br = ring[i % ring.length];
      paintVars(st, br);
      $('ctaSell').className = typeClass(br);
      i++;
    };
    paint();
    setInterval(() => { if (!reduced() && !document.hidden && ctaVisible) paint(); }, 2200);
    let target = 50, cur = 50, raf = 0, ctaVisible = false;
    const loop = () => {
      cur += (target - cur) * 0.12;
      st.style.setProperty('--cx', cur.toFixed(2) + '%');
      raf = Math.abs(target - cur) > 0.05 ? requestAnimationFrame(loop) : 0;
    };
    st.addEventListener('pointermove', (e) => {
      if (reduced()) return;
      const r = st.getBoundingClientRect();
      target = clamp(((e.clientX - r.left) / r.width) * 100, 18, 82);
      if (!raf) raf = requestAnimationFrame(loop);
    });
    st.addEventListener('pointerleave', () => { target = 50; if (!raf) raf = requestAnimationFrame(loop); });
    new IntersectionObserver((es) => { ctaVisible = es[0].isIntersecting; }).observe(st);
  })();

  // ---- reveals + first-view moments ----
  (function reveals() {
    const nodes = document.querySelectorAll('.sec-hd, .split-card, .rows, .rb-l, .rb-r, .askall, .trio, .sh-l, .sh-r');
    nodes.forEach((n) => n.classList.add('rv'));
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('on');
      io.unobserve(e.target);
      if (e.target.classList.contains('trio') && !asked) askAll('Suggest three subject lines');
      if (e.target.classList.contains('rows')) {
        [...e.target.children].forEach((row, i) => setTimeout(() => { row.classList.add('lit'); setTimeout(() => row.classList.remove('lit'), 1400); }, reduced() ? 0 : 400 + i * 380));
      }
    }), { threshold: 0.25 });
    nodes.forEach((n) => io.observe(n));
  })();

  /* ---------------- boot ---------------- */
  renderNodes();
  renderSpec();
  renderApp();
  greetAssistant();
  add(bThread, el('div', 'm m-bot', 'Campaign email for Nike — four steps, wired and live with Nike’s team. Tell me what to change.'));
  renderBuilderChips();
  orient();
  window.addEventListener('resize', () => { orient(); onScroll(); });
  onScroll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => fx.size());
  autoplay();
})();
