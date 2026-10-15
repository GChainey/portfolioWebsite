/* Remix 13 — Chat first. (Built for user testing: clarity over spectacle.)

   Concept: the page asks one question — "What do you want to build today?"
   — and right underneath it the EAI builder is always on show: the builder
   chat on the left (the maker, "You, building", in EAI's neutral styling)
   and, on the right, a four-step app assembling live in the client's brand,
   with the client-branded in-app assistant inside it (for the client's
   staff). The builder auto-plays once it's in view: it builds a campaign
   email app for Nike, then the "next client" card re-skins the same app for
   Apple, and "Sell to many." lights up. The hero chat drives that same
   builder. One click puts the current client's app on a phone, with a real
   QR code. Below: phone preview, calculator, "bring your own agent", enterprise
   grade, AI features that switch on in a live copy of the app, and a CMS view.

   Every section can be moved or hidden (arrange.js, ?order= / ?hide= /
   ?layout=value-first); nothing here depends on the order.

   One page, two themes (see index.html): the light theme (remix 13) and
   ?theme=shader (remix 14, which redirects here). Every feature is in both;
   only theme-shader.css / theme-shader.js differ.

   ?theme=shader  the shader theme    ?intro=0  skip its intro    ?auto=0  no auto-play
   Reduced motion: no intro, and the builder opens already built (Nike + Apple). */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const A = window.EAIApp;
  const { esc, poss } = A;
  const params = new URLSearchParams(location.search);
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NO_AUTO = params.get('auto') === '0';
  const SHADER = document.documentElement.dataset.theme === 'shader';
  // Remix 23 (V2 user testing): built for Nike, then Qantas; no suggestion pills
  // after the build; the demo waits until it is fully in view; AI features animate in.
  const V2 = document.documentElement.dataset.layout === 'mvp2';
  // V4 (the lean site's home page): the demo's clients have no names or
  // logos. They are Client A, B, C… in the brand's own colours, as in the
  // sizzle reel, so the page never shows a real company. ?names=1 brings the
  // names back, ?names=0 hides them on any layout.
  const UNNAMED = params.get('names') !== '1' && (params.get('names') === '0' || params.get('layout') === 'mvp4');
  const LETTER = { nike: 'A', qantas: 'B', commbank: 'C', apple: 'D', canva: 'E' };
  const lettered = new Map(); // any other company the visitor names: F, G, H…
  const shown = new Map();    // one object per letter, so a client is the same client every time
  const isLetter = (name) => /^client ([a-z])$/i.exec(String(name).trim());
  // "Client B" -> the brand whose colours it wears; anything else as typed.
  function realName(name) {
    const m = UNNAMED && isLetter(name);
    const key = m && Object.keys(LETTER).find((k) => LETTER[k] === m[1].toUpperCase());
    return key ? A.BRANDS[key].name : name;
  }
  function letterFor(br, typed) {
    const m = isLetter(typed);
    if (LETTER[A.brandKey(br)]) return LETTER[A.brandKey(br)];
    if (m) return m[1].toUpperCase();
    const id = String(typed).trim().toLowerCase();
    if (!lettered.has(id)) lettered.set(id, String.fromCharCode(70 + (lettered.size % 21)));
    return lettered.get(id);
  }
  // The brand as the page shows it: itself, or its unnamed stand-in.
  function asShown(br, typed) {
    if (!UNNAMED || br.unnamed) return br;
    const k = letterFor(br, typed || br.name);
    if (!shown.has(k)) shown.set(k, A.unnamed(br, k));
    return shown.get(k);
  }
  // A client named in a prompt. "for Client B" counts when the clients are unnamed.
  function clientIn(text, loose) {
    const m = UNNAMED && /\bclient ([a-z])\b/i.exec(text);
    return m ? `Client ${m[1].toUpperCase()}` : A.clientFrom(text, loose);
  }
  const NEXT_CLIENT = UNNAMED ? 'Client B' : V2 ? 'Qantas' : 'Apple';
  // Remix 25 (V3): the chat is Claude Code, not an EAI builder (there isn't
  // one), on its own beside the app; no phone; no step categories (v3.css).
  const V3 = document.documentElement.dataset.v === '3';
  // V4 (the lean site's home page): a typed prompt gets an app of its own
  // (compose.js) instead of the closest of four templates. ?compose=1 turns it
  // on anywhere, ?compose=0 off. Every earlier remix reads prompts as it did.
  const COMPOSE = !!A.compose && params.get('compose') !== '0' && (params.get('compose') === '1' || params.get('layout') === 'mvp4');
  const readPrompt = (text) => (COMPOSE ? A.compose(text) : A.templateFor(text));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const utMilestone = (name, data) => { if (typeof window.mktUtLog === 'function') window.mktUtLog(name, data); };
  const fmt = (n) => Math.round(Math.abs(n)).toLocaleString('en-AU');
  const money = (n) => (n < 0 ? '−$' : '$') + fmt(n);
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

  /* ================================================================
     State
     ================================================================ */
  const NEUTRAL = {
    name: 'Your client', b: '#A1A1AA', on: '#FFFFFF', head: '#E4E4E7', headOn: '#71717A',
    surface: '#FAFAFA', border: '#E4E4E7', font: 'Inter, system-ui, sans-serif',
    tone: '', goal: '', audience: '', date: '', logo: null,
  };
  const S = {
    tpl: 'campaign',
    clients: [],             // every client this one build serves
    current: asShown(A.BRANDS.nike),  // the one on screen
    approvers: 1,
    features: { rag: false, checklist: false, extract: false },
    built: false,
    busy: false,
    published: false,
    awaiting: null,          // 'client' while the builder waits for a name, 'next' after a build
  };
  const TPL = () => A.TEMPLATES[S.tpl];
  const model = () => ({ tpl: S.tpl, brand: S.current, approvers: S.approvers, features: S.features });
  const pageClients = () => (S.clients.length ? S.clients : [S.current]);

  /* ---------- pacing: every wait can be skipped or cancelled ---------- */
  class Cancel extends Error {}
  let run = 0;
  let fast = REDUCED;
  const waiters = new Set();
  function wait(ms, id) {
    return new Promise((res, rej) => {
      const w = {
        done() {
          waiters.delete(w);
          clearTimeout(t);
          if (id !== undefined && id !== run) rej(new Cancel()); else res();
        },
      };
      waiters.add(w);
      const t = setTimeout(() => w.done(), fast ? 0 : ms);
    });
  }
  function skipAnim() { fast = true; [...waiters].forEach((w) => w.done()); }

  /* ================================================================
     Builder chat (the maker — EAI neutral, left)
     ================================================================ */
  const thread = $('bxThread');
  const input = $('bxInput');
  const appEl = $('bxApp');
  A.mount(appEl, { mode: 'builder' });

  function scrollThread() { thread.scrollTop = thread.scrollHeight; }
  function msg(cls, html) {
    const d = document.createElement('div');
    d.className = 'bm ' + cls;
    d.innerHTML = html;
    thread.appendChild(d);
    scrollThread();
    return d;
  }
  function you(text) { return msg('bm-you', `<div class="bm-bubble">${esc(text)}</div>`); }
  async function say(html, id, think = 450) {
    const t = msg('bm-eai bm-typing', '<i></i><i></i><i></i>');
    await wait(think, id);
    t.classList.remove('bm-typing');
    t.innerHTML = html;
    scrollThread();
    return t;
  }
  // A progress card: rows go wait -> run -> ok.
  function progress(labels) {
    const card = msg('bm-prog', labels.map((l) => `<div class="bp" data-s="wait"><span class="bp-ic" aria-hidden="true"></span><span class="bp-t">${l}</span></div>`).join(''));
    const rows = [...card.querySelectorAll('.bp')];
    return {
      run(i, html) { rows[i].dataset.s = 'run'; if (html) rows[i].querySelector('.bp-t').innerHTML = html; scrollThread(); },
      ok(i, html) { rows[i].dataset.s = 'ok'; if (html) rows[i].querySelector('.bp-t').innerHTML = html; scrollThread(); },
      text(i, html) { rows[i].querySelector('.bp-t').innerHTML = html; },
    };
  }
  const swatches = (br) => (br.swatches || [br.b]).slice(0, 4).map((c) => `<span class="sw" style="background:${esc(c)}"></span>`).join('');

  function suggest(list) {
    const box = $('bxSuggest');
    box.innerHTML = '';
    list.forEach((s) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = s.label;
      b.addEventListener('click', () => (s.action ? s.action() : send(s.value || s.label)));
      box.appendChild(b);
    });
    scrollThread();
  }

  function placeholder() {
    if (S.awaiting === 'client') return UNNAMED ? 'Pick a client, e.g. Client B' : 'Name the client, e.g. Qantas';
    if (S.awaiting === 'next') return 'Name your next client, or ask for a change…';
    if (!S.built) return UNNAMED ? 'Describe an app, e.g. a leave request app' : 'Describe an app, e.g. a claims app for Qantas';
    return V3 ? 'Tell Claude what to change…' : 'Tell the builder what to change…';
  }
  function setBusy(on) {
    S.busy = on;
    $('bx').classList.toggle('is-busy', on);
    input.disabled = on;
    $('bxSend').hidden = on;
    $('bxSkip').hidden = !on;
    input.placeholder = on ? 'Building… (Skip to see it finished)' : placeholder();
    if (on) suggest([]);
    updateTop();
  }

  /* ---------- the builder: always on the page ---------- */
  const PROMPTS = [UNNAMED ? 'A campaign email app for Client A' : 'A campaign email app for Nike', 'A client onboarding app', 'An insurance claims app', 'A document review app for a law firm'];
  const smooth = REDUCED ? 'auto' : 'smooth';
  // Bring the builder into view (wherever the arrangement put it), unless it's already there.
  function revealBuilder() {
    const r = $('build').getBoundingClientRect();
    if (r.top < 40 || r.top > innerHeight * 0.4) scrollTo({ top: scrollY + r.top - 76, behavior: smooth });
  }
  // The builder before anything is built: a welcome, four starters, an empty app.
  function idleBuilder() {
    run++;
    rejectClient();
    fast = REDUCED;
    thread.innerHTML = '';
    nextCard = null;
    S.tpl = 'campaign';
    S.built = false;
    S.clients = [];
    S.published = false;
    S.awaiting = null;
    setBusy(false);
    msg('bm-eai', V3
      ? 'Connected to Enterprise AI. Describe an app and I’ll build it in four steps, in your client’s brand. Or start from one of these:'
      : 'Hi. I’m the EAI builder. Describe an app and I’ll build it in four steps, in your client’s brand. Or start from one of these:');
    suggest(PROMPTS.map((p) => ({ label: p, value: p })));
    appEl.classList.add('is-skel');
    A.update(appEl, { tpl: 'campaign', brand: NEUTRAL, approvers: 1, features: S.features });
    updateTop();
    refreshPage();
  }

  function lightSlogan() {
    $('slA').classList.toggle('on', S.built);
    $('slB').classList.toggle('on', S.clients.length > 1);
  }

  /* V3: Claude Code's window instead of the EAI builder's header, and the
     client switch moves above the app (the builder's top bar is hidden). */
  if (V3) {
    document.querySelector('.bx-chat').setAttribute('aria-label', 'Claude Code');
    document.querySelector('.bx-chat-hd').innerHTML = '<span class="term-dots" aria-hidden="true"><i></i><i></i><i></i></span><b>Claude Code</b><small>~/work/campaign-email</small>';
    $('bxCanvasLabel').after($('bxClients'));
  }

  function updateTop() {
    const n = S.clients.length;
    $('bxTitle').textContent = S.built || S.busy ? TPL().name : 'New app';
    if (V3 && COMPOSE && (S.built || S.busy)) document.querySelector('.bx-chat-hd small').textContent = `~/work/${A.slug(TPL().name)}`;
    const st = $('bxStatus');
    st.textContent = S.published ? 'Live' : 'Draft';
    st.classList.toggle('live', S.published);
    $('bxPhone').disabled = !S.built || S.busy;
    $('bxPublish').disabled = !S.built || S.busy;
    $('hxCount').textContent = n ? `One build · ${plural(n, 'client')}` : 'One build';
    const lbl = $('bxCanvasLabel');
    lbl.querySelector('span').textContent = S.built || n
      ? `${poss(S.current.name)} app — what ${poss(S.current.name)} team sees`
      : 'Your client’s app — it builds here';
    lbl.querySelector('i').style.background = n ? S.current.b : '#D4D4D8';
    renderClients();
    lightSlogan();
  }

  function renderClients() {
    const box = $('bxClients');
    box.innerHTML = '';
    if (!S.clients.length) return;
    const k = document.createElement('span');
    k.className = 'bx-clients-k';
    k.textContent = S.clients.length > 1 ? 'Serving' : 'Client';
    box.appendChild(k);
    S.clients.forEach((br) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'bx-client' + (br === S.current ? ' on' : '');
      b.setAttribute('aria-pressed', br === S.current ? 'true' : 'false');
      b.innerHTML = `<i style="background:${esc(br.b)}"></i>${esc(br.name)}`;
      b.title = `Show ${poss(br.name)} version`;
      b.addEventListener('click', () => switchClient(br));
      box.appendChild(b);
    });
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'bx-client bx-add';
    add.innerHTML = '<span aria-hidden="true">+</span> Add client';
    add.addEventListener('click', () => {
      if (S.busy) return;
      input.value = 'Make it for ';
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    });
    box.appendChild(add);
  }

  function switchClient(br) {
    if (S.busy || br === S.current) return;
    S.current = br;
    A.update(appEl, model(), { keepThread: true });
    flashSteps();
    updateTop();
    refreshPage();
  }

  function flashSteps() {
    const steps = appEl.querySelector('.app-steps');
    steps.parentElement.classList.remove('flash-steps');
    void steps.offsetWidth;
    steps.parentElement.classList.add('flash-steps');
  }
  let toastT = 0;
  function toast(text) {
    const t = $('bxToast');
    t.textContent = text;
    t.hidden = false;
    t.classList.remove('show');
    void t.offsetWidth;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => { t.hidden = true; }, 2600);
  }
  function reading(on, text) {
    const r = $('bxReading');
    r.hidden = !on;
    if (text) $('bxReadingT').textContent = text;
  }

  async function typeFields(id) {
    const tvs = [...appEl.querySelectorAll('.app-card .tv')];
    const full = tvs.map((t) => t.textContent);
    if (fast) return;
    tvs.forEach((t) => { t.textContent = ''; });
    for (let i = 0; i < tvs.length; i++) {
      for (let c = 1; c <= full[i].length; c += 2) {
        if (fast) break;
        tvs[i].textContent = full[i].slice(0, c);
        await wait(16, id);
      }
      tvs[i].textContent = full[i];
    }
  }

  /* ---------- reading a brand ---------- */
  async function readBrand(name, id, prog, row) {
    const hit = window.STM.curated(realName(name));
    // "Client Z": a letter with no brand behind it gets colours of its own.
    const madeUp = UNNAMED && !hit && !!isLetter(name);
    const where = UNNAMED ? 'their brand' : hit ? hit.domain : `${name}’s website`;
    prog.run(row, `Reading ${esc(where)}…`);
    reading(true, `Reading ${where}…`);
    let br;
    if (hit || madeUp) {
      await wait(1100, id);
      br = hit || A.guessBrand(name);
    } else {
      br = await A.resolveBrand(name, (k, domain) => {
        if (UNNAMED) return;
        prog.text(row, `Reading ${esc(domain)}…`);
        reading(true, `Reading ${domain}…`);
      });
      if (id !== run) throw new Cancel();
    }
    reading(false);
    br = asShown(br, name);
    prog.ok(row, UNNAMED ? `Brand colours read ${swatches(br)}` : br.guessed
      ? `Couldn’t reach their site, so this is a best guess for <b>${esc(br.name)}</b> ${swatches(br)}`
      : `Brand read from ${esc(br.domain)} ${swatches(br)}`);
    return br;
  }

  /* ---------- waiting for a client name ---------- */
  let clientWaiter = null;
  function askClient() {
    return new Promise((res, rej) => { clientWaiter = { res, rej }; });
  }
  function rejectClient() {
    if (clientWaiter) { clientWaiter.rej(new Cancel()); clientWaiter = null; }
  }

  /* ================================================================
     1. The build
     ================================================================ */
  async function startBuild(prompt, { via, fallbackClient } = {}) {
    const id = ++run;
    rejectClient();
    fast = REDUCED;
    thread.innerHTML = '';
    nextCard = null;
    suggest([]);
    const t = readPrompt(prompt);
    S.tpl = t.id;
    S.built = false;
    S.clients = [];
    S.approvers = 1;
    S.published = false;
    S.awaiting = null;
    const tpl = TPL();
    if (via) msg('bm-via', `From ${esc(via)}`);
    you(prompt);
    setBusy(true);

    // Skeleton: neutral, no brand yet.
    const skelModel = { tpl: S.tpl, brand: NEUTRAL, approvers: 1, features: S.features };
    appEl.classList.add('is-skel');
    A.update(appEl, skelModel);
    appEl.querySelectorAll('.app-step').forEach((s) => s.classList.add('pending'));
    appEl.querySelector('.app-assist').classList.add('pending');
    updateTop();

    try {
      // An app compose.js put together: say how the prompt was read, so the
      // visitor can see why these four steps.
      const own = COMPOSE && !t.builtin;
      await say(own && t.matched ? `On it: <b>${esc(tpl.name)}</b>. I read that as ${t.say}: ${t.how}.`
        : own ? `That’s a new one for me, so I’ve shaped <b>${esc(tpl.name)}</b> as ${t.say}: ${t.how}. You can change what’s inside each step afterwards.`
          : t.matched ? `On it: ${/^[aeiou]/i.test(tpl.name) ? 'an' : 'a'} <b>${esc(tpl.name)}</b> app, in four steps.`
            : `I’ll start from <b>Campaign email</b>, the closest four-step app I have. You can change what’s inside each step afterwards.`, id);

      const p1 = progress(V3 ? ['Shaping it as four steps'] : ['Shaping it as four steps', 'Wiring the steps together']);
      p1.run(0);
      const steps = [...appEl.querySelectorAll('.app-step')];
      for (const s of steps) { await wait(300, id); s.classList.remove('pending'); }
      p1.ok(0, `Four steps: ${tpl.steps.map((s) => esc(s[0])).join(' → ')}`);
      if (!V3) {
        p1.run(1);
        await wait(700, id);
        p1.ok(1, `Wired: ${tpl.steps.map((s) => esc(s[1])).join(' → ')}`);
      }

      let name = clientIn(prompt, false) || fallbackClient;
      if (!name) {
        await say(UNNAMED ? `Who’s it for? Pick your first client and the app takes on their colours and tone of voice.`
          : `Who’s it for? Name your first client and I’ll read their website for their colours, logo and tone of voice.`, id);
        S.awaiting = 'client';
        setBusy(false);
        suggest((UNNAMED ? ['Client A', 'Client B', 'Client C'] : ['Nike', 'Apple', 'CommBank']).map((n) => ({ label: n, value: n })));
        name = await askClient();
        if (id !== run) throw new Cancel();
        setBusy(true);
      }
      S.awaiting = null;

      const p2 = progress(['Reading their brand', 'Adding their in-app assistant']);
      const br = await readBrand(name, id, p2, 0);
      S.current = br;
      S.clients = [br];

      // Paint: the same four steps put on the client's brand.
      A.update(appEl, model());
      appEl.querySelector('.app-assist').classList.add('pending');
      await wait(40, id);
      appEl.classList.remove('is-skel');
      updateTop();
      await typeFields(id);
      p2.run(1);
      await wait(500, id);
      appEl.querySelector('.app-assist').classList.remove('pending');
      p2.ok(1, `The ${esc(br.name)} assistant, in ${esc(poss(br.name))} voice`);

      S.built = true;
      utMilestone('builder_first_build', { client: br.name, template: tpl.name });
      updateTop();
      refreshPage();
      audit(`You built ${tpl.name} for ${br.name}`);
      await say(`Done. <b>${esc(tpl.name)}</b> for <b>${esc(br.name)}</b>, four steps. Click through it on the right, or ask the ${esc(br.name)} assistant something. That’s what ${esc(poss(br.name))} team will use.`, id);
      await wait(700, id);
      S.awaiting = 'next';
      setBusy(false);
      inviteNext();
      suggestNext();
    } catch (e) {
      if (!(e instanceof Cancel)) throw e;
    } finally {
      if (id === run) { fast = REDUCED; reading(false); }
    }
  }

  const HANDCHECKED = UNNAMED ? ['Client B', 'Client C', 'Client D', 'Client E', 'Client A']
    : V2 ? ['Qantas', 'Apple', 'CommBank', 'Canva', 'Nike'] : ['Apple', 'CommBank', 'Qantas', 'Canva', 'Nike'];
  function unusedClients() {
    return HANDCHECKED.filter((n) => !S.clients.some((c) => c.name.toLowerCase() === n.toLowerCase()));
  }
  function suggestNext() {
    if (V2) { suggest([]); return; }
    const t = TPL();
    suggest([
      { label: 'Preview on my phone', value: 'Preview on my phone' },
      { label: `Make ${t.steps[3][0]} need two approvers`, value: `Make ${t.steps[3][0]} need two approvers` },
    ]);
  }

  /* ---------- the re-skin invite: type any company ---------- */
  let nextCard = null;
  function inviteNext() {
    if (nextCard) nextCard.remove();
    const chips = unusedClients().slice(0, 4);
    const dot = (n) => { const b = window.STM.curated(realName(n)); return b ? b.b : '#A1A1AA'; };
    nextCard = msg('bm-next',
      `<b>${S.clients.length > 1 ? 'Sell it to another client' : 'Now make it for your next client'}</b>` +
      (UNNAMED ? `<p>Pick your next client. We’ll re-skin this same app in their colours and voice.</p>`
        : `<p>Type any company. We’ll read their website and re-skin this same app in their logo, colours and voice.</p>`) +
      `<form autocomplete="off"><label class="sr-only" for="nextIn">${UNNAMED ? 'Next client' : 'Any company'}</label><input id="nextIn" type="text" placeholder="${UNNAMED ? 'Next client, e.g. Client B' : 'Any company, e.g. Canva or Atlassian'}" /><button type="submit">Re-skin it</button></form>` +
      (chips.length ? `<div class="bm-next-chips">${chips.map((n) => `<button type="button" data-n="${esc(n)}"><i style="background:${esc(dot(n))}"></i>${esc(n)}</button>`).join('')}</div>` : ''));
    const card = nextCard;
    card.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = card.querySelector('input').value.trim();
      if (!v) { card.querySelector('input').focus(); return; }
      goNext(v.replace(/^(make it for|for)\s+/i, ''));
    });
    card.querySelectorAll('[data-n]').forEach((b) => b.addEventListener('click', () => goNext(b.dataset.n)));
  }
  function goNext(name) {
    if (S.busy || !S.built) return;
    if (nextCard) nextCard.classList.add('is-off');
    you(`Make it for ${name}`);
    rebrand(name, ++run);
  }
  function suggestAfter() {
    if (V2) { suggest([]); return; }
    const t = TPL();
    const list = [];
    list.push({ label: 'Preview on my phone', value: 'Preview on my phone' });
    if (S.approvers === 1) list.push({ label: `Make ${t.steps[3][0]} need two approvers`, value: `Make ${t.steps[3][0]} need two approvers` });
    if (!S.features.checklist) list.push({ label: 'Add a document checklist', value: 'Add a document checklist' });
    else if (!S.features.rag) list.push({ label: 'Add a RAG chatbot', value: 'Add a RAG chatbot' });
    if (!S.published) list.push({ label: 'Publish it', value: 'Publish it' });
    suggest(list.slice(0, 4));
  }

  /* ================================================================
     2. Sell to many: the same app, the next client
     ================================================================ */
  async function rebrand(name, id) {
    const hit = window.STM.curated(realName(name));
    const known = S.clients.find((c) => (hit && (c === hit || c.of === A.brandKey(hit))) || c.name.toLowerCase() === name.toLowerCase()
      || (c.unnamed && lettered.get(name.trim().toLowerCase()) === c.unnamed));
    if (known) {
      switchClient(known);
      await say(`${esc(known.name)} is already on this build, so I’ve switched to their version.`, id, 300);
      S.awaiting = 'next';
      inviteNext();
      suggestAfter();
      return;
    }
    setBusy(true);
    S.awaiting = null;
    try {
      await say(UNNAMED ? `Same app, new client. I’ll read their brand for its colours and voice.`
        : `Same app, new client. I’ll read ${esc(hit ? hit.domain : poss(name) + ' website')} for their colours, logo and voice.`, id, 350);
      const p = progress(['Reading their brand', 'Re-skinning the same four steps']);
      const br = await readBrand(name, id, p, 0);
      p.run(1);
      S.clients.push(br);
      S.current = br;
      A.update(appEl, model());
      flashSteps();
      toast('Same four steps · same wiring');
      updateTop();
      await typeFields(id);
      p.ok(1, `Same four steps and wiring, now in ${esc(poss(br.name))} brand`);
      refreshPage();
      audit(`You re-skinned it for ${br.name}`);
      const n = S.clients.length;
      utMilestone('builder_reskin', { client: br.name, clientCount: n });
      await say(`That’s <b>${esc(poss(br.name))}</b> app: same four steps, same wiring, written in ${esc(poss(br.name))} voice${br.tone && !br.guessed ? ` (“${esc(br.tone)}”)` : ''}. <b>One build, ${n} clients.</b>`, id);
      if (n === 2) await say(V3 ? `Switch between them any time with the clients above the app.` : `Switch between them any time with the clients at the top. Or see it on a phone.`, id, 300);
      S.awaiting = 'next';
      setBusy(false);
      inviteNext();
      suggestAfter();
    } catch (e) {
      if (!(e instanceof Cancel)) throw e;
    } finally {
      if (id === run) { fast = REDUCED; reading(false); }
    }
  }

  /* ================================================================
     Commands the builder understands after a build
     ================================================================ */
  function send(raw) {
    const text = (raw || '').trim();
    if (!text || S.busy) return;
    input.value = '';
    if (S.awaiting === 'client' && clientWaiter) {
      you(text);
      const name = clientIn(text, true) || text.replace(/^(it'?s|it is|for|make it for)\s+/i, '').replace(/[.!?]+$/, '').trim();
      const w = clientWaiter;
      clientWaiter = null;
      S.awaiting = null;
      w.res(name);
      return;
    }
    if (!S.built) { startBuild(text); return; }
    you(text);
    command(text);
  }

  async function command(text) {
    const id = ++run;
    const t = TPL();
    const last = t.steps[3][0];
    const lower = text.toLowerCase();
    const name = S.current.name;
    try {
      if (/phone|mobile|\bqr\b|scan/.test(lower)) {
        await say(`Here’s ${esc(poss(name))} app on a phone. Scan the code to try it on yours.`, id, 300);
        openPhone();
        suggestAfter();
        return;
      }
      if (/publish|go live|launch it|ship it/.test(lower)) {
        await say(`Published. Every client on this build gets their own link and their own branded app.`, id, 300);
        publish();
        suggestAfter();
        return;
      }
      if (/(two|2|second|another)\s+approv|approv\w*\s+(twice|x2)/.test(lower)) {
        setApprovers(2);
        await say(`Done: <b>${esc(last)}</b> now needs two approvers. I changed it once, so it’s changed for all ${plural(S.clients.length, 'client')}. Still four steps.`, id, 400);
        A.go(appEl, 3);
        suggestAfter();
        return;
      }
      if (/(one|1|single)\s+approv/.test(lower)) {
        setApprovers(1);
        await say(`Done: <b>${esc(last)}</b> is back to one approver, for every client.`, id, 400);
        A.go(appEl, 3);
        suggestAfter();
        return;
      }
      const feat = /\brag\b|chat ?bot|ground|knowledge/.test(lower) ? 'rag' : /checklist/.test(lower) ? 'checklist' : /extract/.test(lower) ? 'extract' : null;
      if (feat) {
        const on = !/remove|turn off|disable|without|take (it|out)/.test(lower);
        setFeature(feat, on);
        const label = { rag: 'RAG chatbot', checklist: 'document checklist', extract: 'document extraction' }[feat];
        const where = feat === 'rag' ? `the ${esc(name)} assistant now answers from ${esc(poss(name))} documents, with sources` : `it’s in the <b>${esc(t.steps[t.featureStep[feat]][0])}</b> step`;
        await say(on ? `Added a ${label}: ${where}. Every client on this build gets it.` : `Removed the ${label}, for every client.`, id, 400);
        if (feat !== 'rag') A.go(appEl, t.featureStep[feat]);
        else if (on) appEl.querySelector('.pa-asks [data-ask="2"]')?.click();
        suggestAfter();
        return;
      }
      if (/\bsteps?\b/.test(lower) && /(add|another|new|five|5|extra|remove|delete|three|3|more|fewer)/.test(lower)) {
        await say(`Apps in EAI are always exactly four steps. It keeps them quick to learn, and quick to sell again. I can put that <i>inside</i> a step instead. For example:`, id, 400);
        suggest([
          { label: `Make ${last} need two approvers`, value: `Make ${last} need two approvers` },
          { label: 'Add a document checklist', value: 'Add a document checklist' },
          { label: 'Add document extraction', value: 'Add document extraction' },
        ]);
        return;
      }
      if (/\b(tone|warmer|friendlier|formal|casual|voice|playful)\b/.test(lower)) {
        await say(`Noted. ${esc(poss(name))} drafts and assistant will follow that tone. The four steps don’t change. (In this demo the copy stays as it is.)`, id, 400);
        suggestAfter();
        return;
      }
      // With the composer on, naming a kind of app ("a sick leave approval app") is enough to start one.
      const nt = readPrompt(text);
      if (nt.matched && (/\b(build|create|new|start)\b/.test(lower) || (COMPOSE && /\b(app|tool|workflow|portal)\b/.test(lower))) && !/make it for/.test(lower)) {
        await say(`Starting a new app. I’ll keep ${esc(name)} as the client unless you name another.`, id, 300);
        startBuild(text, { fallbackClient: name });
        return;
      }
      let client = clientIn(text, true);
      // A bare name ("Qantas", "Bunnings Warehouse") after "name your next client" — not a sentence or a question.
      const VERB = /^(make|add|change|remove|delete|can|could|would|please|show|turn|set|use|give|what|how|why|where|who|put|try|do|is|are|let|help|undo|hi|hello|thanks|ok|yes|no)\b/i;
      if (!client && S.awaiting === 'next' && text.split(/\s+/).length <= 3 && !/\?$/.test(text) && !VERB.test(text)) client = text.replace(/[.!]+$/, '');
      if (client) { rebrand(client, id); return; }
      await say(`I can re-skin this app for another client, change what’s inside a step, add AI features, or put it on a phone. Try one of these:`, id, 400);
      suggestAfter();
    } catch (e) {
      if (!(e instanceof Cancel)) throw e;
    }
  }

  function setApprovers(n) {
    S.approvers = n;
    A.update(appEl, model(), { keepThread: true });
    refreshPage();
    syncFeatureButtons();
    audit(`You set ${TPL().steps[3][0]} to ${plural(n, 'approver')}`);
  }
  function setFeature(k, on) {
    if (k === 'approvals') { setApprovers(on ? 2 : 1); return; }
    S.features = Object.assign({}, S.features, { [k]: on });
    A.update(appEl, model(), { keepThread: true });
    refreshPage();
    syncFeatureButtons();
  }

  /* ---------- builder events ---------- */
  $('bxComposer').addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });
  $('bxSkip').addEventListener('click', skipAnim);
  $('bxNew').addEventListener('click', () => {
    idleBuilder();
    input.focus({ preventScroll: true });
  });
  $('bxPhone').addEventListener('click', openPhone);
  $('bxPublish').addEventListener('click', () => {
    if (!S.built) return;
    publish();
  });

  /* ---------- hero prompt ---------- */
  const hxInput = $('hxInput');
  function submitHero(text) {
    const v = (text || '').trim();
    if (!v) {
      const f = $('hxForm');
      f.classList.remove('nudge');
      void f.offsetWidth;
      f.classList.add('nudge');
      hxInput.placeholder = 'Type what you want to build, or pick a suggestion below.';
      hxInput.focus();
      return;
    }
    hxInput.value = '';
    auto.done = true;
    auto.running = false;
    clearTimeout(auto.timer);
    revealBuilder();
    startBuild(v);
  }
  $('hxForm').addEventListener('submit', (e) => { e.preventDefault(); submitHero(hxInput.value); });
  hxInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitHero(hxInput.value); }
  });
  document.querySelectorAll('.hx-chips [data-prompt]').forEach((b) => {
    b.addEventListener('click', () => submitHero(b.dataset.prompt));
  });

  /* ================================================================
     Auto-play once, when the builder is in view
     ================================================================ */
  // Starts when the builder is well in view, or after a short idle while it
  // peeks above the fold. Any click or key in the chat or the builder takes
  // over at once; scrolling doesn't stop it.
  const auto = { done: NO_AUTO || REDUCED, running: false, ready: false, timer: 0, ratio: 0 };
  function schedule() {
    clearTimeout(auto.timer);
    if (auto.done || !auto.ready || S.built || S.busy || $('build').hidden) return;
    if (V2) { if (fullyIn($('bx'))) auto.timer = setTimeout(autoGo, 700); return; }
    if (auto.ratio >= 0.3) auto.timer = setTimeout(autoGo, 700);
    else if (auto.ratio > 0) auto.timer = setTimeout(autoGo, 3200);
  }
  // "Fully in view": all of it, or, if it's taller than the window, the window is filled with it.
  function fullyIn(el) {
    const r = el.getBoundingClientRect();
    const vh = innerHeight;
    const seen = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    return seen >= Math.min(r.height, vh) * 0.95;
  }
  if (V2) addEventListener('scroll', () => { if (!auto.done) schedule(); }, { passive: true });
  const autoIO = new IntersectionObserver((es) => {
    auto.ratio = es[es.length - 1].intersectionRatio;
    schedule();
  }, { threshold: [0, 0.01, 0.3, 0.6] });
  autoIO.observe($('bx'));
  function armAuto() { auto.ready = true; schedule(); }
  addEventListener('arrange:change', schedule);

  async function typeInto(el, text, ms) {
    el.value = '';
    for (let c = 1; c <= text.length; c++) {
      if (!auto.running) return false;
      el.value = text.slice(0, c);
      await sleep(ms);
    }
    return auto.running;
  }
  async function autoGo() {
    if (auto.done || S.built || S.busy) return;
    auto.done = true;
    auto.running = true;
    const text = PROMPTS[0];
    if (!(await typeInto(input, text, 34))) { input.value = ''; return; }
    await sleep(420);
    if (!auto.running) { input.value = ''; return; }
    input.value = '';
    await startBuild(text);
    if (!auto.running) return;
    await sleep(2400);
    if (!auto.running || S.busy || !S.built) return;
    const nin = $('nextIn');
    if (!nin) return;
    scrollThread(); // only the chat thread scrolls; never the page under the visitor
    if (!(await typeInto(nin, NEXT_CLIENT, 110))) { nin.value = ''; return; }
    await sleep(450);
    if (!auto.running) { nin.value = ''; return; }
    auto.running = false;
    nin.form.requestSubmit();
  }
  function takeover(e) {
    const t = e.target;
    if (!t.closest || t.closest('.ar-handle') || !t.closest('#build, #chat')) return;
    if (!auto.running) { if (!auto.done) { auto.done = true; clearTimeout(auto.timer); } return; }
    auto.running = false;
    if (PROMPTS[0].startsWith(input.value)) input.value = '';
    if ($('nextIn') && NEXT_CLIENT.startsWith($('nextIn').value)) $('nextIn').value = '';
    if (S.busy) skipAnim(); // finish what's animating; the visitor is in charge now
  }
  ['pointerdown', 'keydown'].forEach((t) => addEventListener(t, takeover, { capture: true, passive: true }));

  /* ================================================================
     3. Preview on mobile — phone drawer, QR codes
     ================================================================ */
  const drawer = $('phoneDrawer');
  let lastFocus = null;
  const phoneURL = () => new URL('phone.html?' + A.shareQuery(model()), location.href).href;
  function drawQR(canvas, url, size) {
    const fb = canvas.closest('.sg-qr, .qr-tile').querySelector('.qr-fallback');
    const fail = () => { canvas.hidden = true; if (fb) fb.hidden = false; };
    if (!window.QRCode) return fail();
    try {
      window.QRCode.toCanvas(canvas, url, { width: size, margin: 0, errorCorrectionLevel: 'L', color: { dark: '#0D3857', light: '#FFFFFF' } }, (err) => { if (err) fail(); else { canvas.hidden = false; if (fb) fb.hidden = true; } });
    } catch (e) { fail(); }
  }
  function fillPhone() {
    const url = phoneURL();
    $('dwName').textContent = S.current.name;
    $('dwName2').textContent = S.current.name;
    $('dwUrl').textContent = url.replace(/^https?:\/\//, '');
    $('dwOpen').href = url;
    const f = $('dwFrame');
    if (f.dataset.src !== url) { f.dataset.src = url; f.src = url; }
    drawQR($('dwQr'), url, 176);
    const box = $('dwClients');
    box.innerHTML = '';
    pageClients().forEach((br) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'bx-client' + (br === S.current ? ' on' : '');
      b.innerHTML = `<i style="background:${esc(br.b)}"></i>${esc(br.name)}`;
      b.addEventListener('click', () => {
        if (S.busy) return;
        S.current = br;
        A.update(appEl, model(), { keepThread: true });
        updateTop();
        refreshPage();
      });
      box.appendChild(b);
    });
    if (pageClients().length < 2) {
      const n = document.createElement('span');
      n.className = 'dw-none';
      n.textContent = 'Add another client in the builder and switch between them here.';
      box.appendChild(n);
    }
  }
  function openPhone() {
    utMilestone('phone_preview_open', { client: S.current.name });
    lastFocus = document.activeElement;
    fillPhone();
    drawer.hidden = false;
    document.documentElement.classList.add('has-drawer');
    requestAnimationFrame(() => requestAnimationFrame(() => drawer.classList.add('open')));
    setTimeout(() => drawer.querySelector('.dw-close').focus({ preventScroll: true }), 50);
  }
  function closePhone() {
    if (drawer.hidden) return;
    drawer.classList.remove('open');
    document.documentElement.classList.remove('has-drawer');
    setTimeout(() => { drawer.hidden = true; }, REDUCED ? 0 : 320);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  drawer.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closePhone(); });
  $('dwCopy').addEventListener('click', () => copy(phoneURL(), $('dwCopy'), 'Copy link'));

  async function copy(text, btn, label) {
    try { await navigator.clipboard.writeText(text); btn.textContent = 'Copied'; } catch (e) { btn.textContent = 'Select and copy'; }
    setTimeout(() => { btn.textContent = label; }, 1600);
  }

  /* ---------- small modal ---------- */
  const modalEl = $('modal');
  function modal({ title, body, actions }) {
    lastFocus = document.activeElement;
    $('modalT').textContent = title;
    $('modalB').innerHTML = body;
    const acts = $('modalA');
    acts.innerHTML = '';
    (actions || [{ label: 'Close' }]).forEach((a) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = a.primary ? 'm-primary' : 'm-ghost';
      b.textContent = a.label;
      b.addEventListener('click', () => { closeModal(); if (a.action) a.action(); });
      acts.appendChild(b);
    });
    modalEl.hidden = false;
    requestAnimationFrame(() => modalEl.classList.add('open'));
    setTimeout(() => acts.querySelector('button').focus({ preventScroll: true }), 30);
  }
  function closeModal() {
    if (modalEl.hidden) return;
    modalEl.classList.remove('open');
    modalEl.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  modalEl.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!modalEl.hidden) closeModal();
    else if (!drawer.hidden) closePhone();
  });

  function publish() {
    S.published = true;
    utMilestone('published', { clientCount: S.clients.length });
    updateTop();
    const t = TPL();
    audit(`You published ${t.name}`);
    modal({
      title: `${t.name} is live`,
      body: `<p>Published for ${plural(S.clients.length, 'client')}. Each one gets their own link and their own branded app, from this one build.</p>` +
        `<ul class="pub-list">${S.clients.map((c) => `<li><i style="background:${esc(c.b)}"></i><b>${esc(c.name)}</b><code>${A.slug(t.name)}.${A.slug(c.name)}.eai.app</code></li>`).join('')}</ul>`,
      actions: [{ label: 'Preview on a phone', primary: true, action: openPhone }, { label: 'Close' }],
    });
  }

  /* ---------- page-level actions ---------- */
  function start() {
    closeModal();
    closePhone();
    // The chat, wherever the arrangement put it; the builder if the chat is hidden.
    const chat = !$('chat').hidden;
    const sec = chat ? $('chat') : $('build');
    scrollTo({ top: scrollY + sec.getBoundingClientRect().top - 76, behavior: smooth });
    const target = chat ? hxInput : input;
    setTimeout(() => { if (!target.disabled) target.focus({ preventScroll: true }); }, REDUCED ? 0 : 450);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    const act = a.dataset.action;
    if (act === 'start') start();
    if (act === 'phone') openPhone();
    if (act === 'signin') {
      modal({
        title: 'Sign in',
        body: '<p>This is a prototype, so there’s no account to sign in to. Everything on this page works without one.</p>',
        actions: [{ label: 'Start building', primary: true, action: start }, { label: 'Close' }],
      });
    }
    if (act === 'secpack') {
      modal({
        title: 'Security pack requested',
        body: '<p>We’d send your client our pen test summary, ISO 27001 certificate, SOC 2 report and Essential Eight statement, and fill in their questionnaire for you.</p><p class="m-note">Prototype: nothing is sent.</p>',
        actions: [{ label: 'Done', primary: true }],
      });
    }
  });

  /* ================================================================
     Keep every section in step with the build
     ================================================================ */
  function refreshPage() {
    const t = TPL();
    const br = S.current;
    // On their phone
    if (S.current !== sgLast) { sgClient = null; sgLast = S.current; }
    renderSg();
    if (!drawer.hidden) fillPhone();
    // CMS + enterprise bits
    renderCMS();
    $('hostDomain') && ($('hostDomain').textContent = `${A.slug(t.name)}.${A.slug(br.name)}.eai.app`);
  }

  /* ================================================================
     3b. On their phone — remix 12's section, following the build
     ================================================================ */
  let sgClient = null; // picked here; otherwise it follows the builder
  let sgLast = null;
  function sgClients() {
    const list = pageClients().slice();
    if (!UNNAMED) (V2 ? ['nike', 'qantas'] : ['nike', 'apple', 'commbank']).forEach((k) => { if (!list.includes(A.BRANDS[k])) list.push(A.BRANDS[k]); });
    return list;
  }
  function renderSg() {
    const t = TPL();
    const br = sgClient || S.current;
    const url = new URL('phone.html?' + A.shareQuery(Object.assign(model(), { brand: br })), location.href).href;
    $('sgSeg').innerHTML = sgClients().map((c, i) => `<button type="button" role="tab" data-i="${i}" class="${c === br ? 'on' : ''}" aria-selected="${c === br}">${esc(c.name)}</button>`).join('');
    const f = $('sgFrame');
    if (f.dataset.src !== url) { f.dataset.src = url; f.src = url; }
    $('sgQrLink').href = url;
    $('sgQrName').textContent = br.name;
    $('sgQrUrl').textContent = `eai.app/${A.slug(br.name)}/${A.slug(t.name)}`;
    $('sgQr').dataset.url = url;
    if ($('pbApp')) $('pbApp').textContent = t.name;
    drawQR($('sgQr'), url, 148);
  }
  $('sgSeg').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-i]');
    if (!b) return;
    sgClient = sgClients()[+b.dataset.i];
    renderSg();
  });
  $('sgCopy').addEventListener('click', () => copy($('sgQr').dataset.url || phoneURL(), $('sgCopy'), 'Copy'));
  // The phone leans toward the cursor (as in 12).
  (function tilt() {
    const stage = $('sgStage');
    const device = $('sgDevice');
    const REST = 'rotateY(-14deg) rotateX(4deg) rotateZ(1.5deg)';
    if (REDUCED || !matchMedia('(hover: hover) and (min-width: 761px)').matches) return;
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      device.style.transform = `rotateY(${-14 + x * 16}deg) rotateX(${4 - y * 10}deg) rotateZ(1.5deg)`;
    });
    stage.addEventListener('pointerleave', () => { device.style.transform = REST; });
  })();

  /* ================================================================
     4. The maths — remix 12's calculator
     ================================================================ */
  const RATE = 150;       // your time, $ per hour
  const PER_CLIENT = 1;   // hours to name, check and share each new client
  const rolled = new Map();
  function roll(el, to, f) {
    const from = rolled.has(el) ? rolled.get(el) : to;
    rolled.set(el, to);
    if (REDUCED || from === to) { el.textContent = f(to); return; }
    const t0 = performance.now(), d = 450;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / d);
      el.textContent = f(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1 && rolled.get(el) === to) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const calcInputs = ['ciHours', 'ciClients', 'ciPrice'].map($);
  function calc() {
    const hours = +$('ciHours').value;
    const clients = +$('ciClients').value;
    const price = +$('ciPrice').value;
    calcInputs.forEach((i) => i.style.setProperty('--p', `${((i.value - i.min) / (i.max - i.min)) * 100}%`));
    $('cvHours').textContent = `${hours} hrs`;
    $('cvClients').textContent = fmt(clients);
    $('cvPrice').textContent = money(price);
    const revenue = clients * price;
    const once = hours + clients * PER_CLIENT;   // build once, then an hour per client
    const scratch = clients * hours;             // rebuild it for every client
    const saved = Math.max(0, scratch - once);
    const profit = revenue - once * RATE;        // your time is a cost, so always less than revenue
    roll($('coRevenue'), revenue, money);
    $('coScratch').textContent = `${fmt(scratch)} hrs`;
    $('coOnce').textContent = `${fmt(once)} hrs`;
    const max = Math.max(scratch, once);
    $('cbScratch').style.width = `${(scratch / max) * 100}%`;
    $('cbOnce').style.width = `${Math.max(2, (once / max) * 100)}%`;
    roll($('coSaved'), saved, fmt);
    roll($('coProfit'), profit, money);
    roll($('coRate'), revenue / once, money);
  }
  calcInputs.forEach((i) => i.addEventListener('input', calc));
  calc();

  /* ================================================================
     5. Bring your own agent
     ================================================================ */
  const AGENTS = {
    claude: {
      name: 'Claude Code',
      lines: [
        ['cmd', '$', 'npx install eai'],
        ['ok', '✓ EAI connected to Claude Code (MCP server and the /eai command)'],
        ['cmd', '>', '/eai Build a campaign email app for Nike'],
        ['head', '◇ Enterprise AI · shaping it as four steps'],
        ['ok', '✓ Brief → Assets → Compose → Review'],
        ['ok', '✓ Wired: Form → Data source → AI writer → Approval'],
        ['ok', '✓ Brand read from nike.com'],
        ['ok', '✓ Nike assistant added'],
        ['link', '→ Ready in EAI: Campaign email · Nike'],
      ],
    },
    codex: {
      name: 'Codex',
      lines: [
        ['cmd', '$', 'npx install eai'],
        ['ok', '✓ EAI connected to Codex (MCP server and the /eai command)'],
        ['cmd', '›', '/eai Build a campaign email app for Nike'],
        ['head', '◇ Enterprise AI · shaping it as four steps'],
        ['ok', '✓ Brief → Assets → Compose → Review'],
        ['ok', '✓ Wired: Form → Data source → AI writer → Approval'],
        ['ok', '✓ Brand read from nike.com'],
        ['ok', '✓ Nike assistant added'],
        ['link', '→ Ready in EAI: Campaign email · Nike'],
      ],
    },
    cursor: {
      name: 'Cursor',
      lines: [
        ['dim', 'Settings › MCP › Add server: Enterprise AI'],
        ['ok', '✓ eai connected — build, rebrand, preview, publish'],
        ['cmd', '@', 'eai Build a campaign email app for Nike'],
        ['head', '◇ Enterprise AI · shaping it as four steps'],
        ['ok', '✓ Brief → Assets → Compose → Review'],
        ['ok', '✓ Wired: Form → Data source → AI writer → Approval'],
        ['ok', '✓ Brand read from nike.com'],
        ['ok', '✓ Nike assistant added'],
        ['link', '→ Ready in EAI: Campaign email · Nike'],
      ],
    },
  };
  let agent = 'claude';
  let termRun = 0;
  const termBody = $('termBody');
  async function playTerm() {
    const id = ++termRun;
    const lines = AGENTS[agent].lines;
    termBody.innerHTML = `<div class="tl tl-dim">${esc(AGENTS[agent].name)} · ~/work/agency-apps</div>`;
    $('agArrive').hidden = true;
    const alive = () => id === termRun;
    for (const [kind, a, b] of lines) {
      const d = document.createElement('div');
      d.className = 'tl tl-' + kind;
      termBody.appendChild(d);
      if (kind === 'cmd') {
        d.innerHTML = `<span class="tl-p">${esc(a)}</span> <span class="tl-c"></span><span class="tl-cur" aria-hidden="true"></span>`;
        const c = d.querySelector('.tl-c');
        if (REDUCED) c.textContent = b;
        else for (let i = 1; i <= b.length; i++) { if (!alive()) return; c.textContent = b.slice(0, i); await sleep(32); }
        d.querySelector('.tl-cur').remove();
        if (!REDUCED) await sleep(350);
      } else {
        d.textContent = a;
        if (!REDUCED) await sleep(kind === 'head' ? 500 : 280);
      }
      if (!alive()) return;
      termBody.scrollTop = termBody.scrollHeight;
    }
    $('agArrive').hidden = false;
  }
  document.querySelectorAll('.term-tabs [data-agent]').forEach((b) => {
    b.addEventListener('click', () => {
      agent = b.dataset.agent;
      document.querySelectorAll('.term-tabs [data-agent]').forEach((x) => x.setAttribute('aria-selected', x === b ? 'true' : 'false'));
      playTerm();
    });
  });
  $('termReplay').addEventListener('click', playTerm);
  $('agCopy').addEventListener('click', () => copy('npx install eai', $('agCopy'), 'Copy'));
  $('agOpen').addEventListener('click', () => {
    auto.done = true;
    auto.running = false;
    revealBuilder();
    const first = S.clients.find((c) => c === A.BRANDS.nike || c.of === 'nike');
    if (S.built && S.tpl === 'campaign' && first) {
      switchClient(first);
      return;
    }
    setTimeout(() => startBuild(UNNAMED ? 'Build a campaign email app for Client A' : 'Build a campaign email app for Nike', { via: AGENTS[agent].name }), REDUCED ? 0 : 400);
  });
  const termIO = new IntersectionObserver((es) => {
    if (es.some((e) => e.isIntersecting)) { termIO.disconnect(); playTerm(); }
  }, { threshold: 0.35 });
  termIO.observe($('term'));

  /* ================================================================
     6. Enterprise grade
     ================================================================ */
  const ROLES = {
    admin: [['Edit the app', 1], ['Approve', 1], ['See every submission', 1], ['Manage users', 1]],
    editor: [['Edit the app', 1], ['Approve', 0], ['See every submission', 1], ['Manage users', 0]],
    viewer: [['Edit the app', 0], ['Approve', 0], ['See every submission', 1], ['Manage users', 0]],
  };
  function showRole(r) {
    if (!$('rolesList')) return;
    document.querySelectorAll('.roles-tabs [data-role]').forEach((b) => b.setAttribute('aria-selected', b.dataset.role === r ? 'true' : 'false'));
    $('rolesList').innerHTML = ROLES[r].map(([t, ok]) => `<li class="${ok ? 'ok' : 'no'}"><span aria-hidden="true">${ok ? '✓' : '–'}</span>${esc(t)}<em class="sr-only">${ok ? 'allowed' : 'not allowed'}</em></li>`).join('');
  }
  document.querySelectorAll('.roles-tabs [data-role]').forEach((b) => b.addEventListener('click', () => showRole(b.dataset.role)));
  showRole('admin');

  let ssoT = 0;
  document.querySelector('[data-sso]').addEventListener('click', (e) => {
    const st = $('ssoState');
    const btn = e.currentTarget;
    clearTimeout(ssoT);
    btn.disabled = true;
    st.textContent = 'Signing in…';
    st.className = 'sso-state busy';
    ssoT = setTimeout(() => {
      st.textContent = `✓ Signed in as sam@${A.slug(S.current.name)}.com`;
      st.className = 'sso-state ok';
      ssoT = setTimeout(() => { st.textContent = 'Try it'; st.className = 'sso-state'; btn.disabled = false; }, 3200);
    }, REDUCED ? 0 : 900);
  });

  $('regionSel')?.addEventListener('change', (e) => {
    const where = e.target.value.replace(/\s*\(.*\)$/, '');
    $('regionNote').textContent = `Stored and processed in ${where === 'United States' ? 'the United States' : where === 'United Kingdom' ? 'the United Kingdom' : where === 'European Union' ? 'the European Union' : where}.`;
    audit(`Data residency set to ${e.target.value}`);
  });
  // Home region chips: pick one, and it shows up in "See who did what".
  document.querySelectorAll('.region-chips [data-region]').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.region-chips [data-region]').forEach((x) => x.setAttribute('aria-checked', x === b ? 'true' : 'false'));
    audit(`Home region set to ${b.dataset.region}`);
  }));
  const hostRow = document.querySelector('.host-row span:last-child');
  if (hostRow) hostRow.id = 'hostDomain';

  function audit(text) {
    const log = $('auditLog');
    if (!log) return;
    const d = new Date();
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const row = document.createElement('div');
    row.className = 'audit-row new';
    row.innerHTML = `<span class="audit-av" aria-hidden="true">Y</span><span class="audit-txt"><b>${esc(text)}</b><small>Today · ${time} · ${esc(S.current?.name || 'Client A')}</small></span><i aria-hidden="true">✓</i>`;
    log.prepend(row);
    while (log.children.length > 1) log.lastElementChild.remove();
  }

  /* ================================================================
     7. AI features — a live copy of the app
     ================================================================ */
  /* A stand-alone example app for the AI features: Enterprise AI's own new starter
     onboarding. Four steps, with the assistant alongside. Each feature card
     opens the step (or panel) it belongs to. Words kept to a minimum. */
  const featEl = $('featApp');
  const featSec = $('features');
  const FEAT_ORDER = ['chatbot', 'checklist', 'validation', 'creation'];
  const FEAT_STEP = { chatbot: 0, checklist: 1, validation: 2, creation: 3 };
  const OB_STEPS = ['Details', 'Documents', 'Check', 'Contract'];
  const OB_ASKS = [
    ['First payday?', 'Fortnightly, on Thursdays. Your first is 24 Oct.', 'Handbook · p.12'],
    ['What to bring?', 'Photo ID and your bank details. Laptop is provided.', 'Handbook · p.4'],
    ['Leave?', '20 days a year, building from your first day.', 'Handbook · p.18'],
  ];
  let featK = 'chatbot';
  let obStep = 0;
  let obChat = [];
  let obChatOpen = false;
  let obDoc = null;       // the document open in the check window
  let obChecked = 0;      // how many of its checks have ticked so far
  let obSigned = false;
  let obSubmitted = false;
  let obTimers = [];
  let obEnter = false;    // the next render is a feature coming in: animate it
  const clearOb = () => { obTimers.forEach(clearTimeout); obTimers = []; };
  const tick = '<i class="ob-ok" aria-label="Done">✓</i>';
  const warn = (t) => `<i class="ob-warn">${t}</i>`;
  // The uploaded documents and the rules AI checks each one against.
  const OB_DOCS = [
    { name: 'Photo ID', file: 'passport.jpg', rules: [['Name matches', 1], ['Not expired', 1]] },
    { name: 'Tax declaration', file: 'tax-declaration.pdf', rules: [['Signed', 1], ['Dated', 1]] },
    { name: 'Bank details', file: 'bank-details.pdf', rules: [['Account name matches', 1]] },
    { name: 'First aid certificate', file: 'first-aid.pdf', rules: [['Not expired', 0]] },
  ];
  function obDocArt(i) {
    if (i === 0) {
      return `<div class="ob-id"><div class="ob-id-photo" aria-hidden="true"></div><dl><div><dt>Name</dt><dd>SAM LEE</dd></div><div><dt>Born</dt><dd>02 · 05 · 1996</dd></div><div><dt>Expires</dt><dd>11 · 2031</dd></div></dl><span class="ob-id-mrz">P&lt;AUSLEE&lt;&lt;SAM&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</span></div>`;
    }
    const title = ['', 'Tax file declaration', 'Bank account details', 'First aid certificate'][i];
    const lines = [[], ['Name: Sam Lee', 'Signed: S. Lee', 'Date: 02 Oct 2026'], ['Account name: Sam Lee', 'BSB: 062-000', 'Account: •••• 4821'], ['Name: Sam Lee', 'Issued: 03 2023', 'Expires: 03 2026']][i];
    return `<div class="ob-paper"><b>${title}</b>${lines.map((l) => `<p>${l}</p>`).join('')}</div>`;
  }
  function obBody(i) {
    if (i === 0) {
      return `<dl class="ob-fields">${[['Name', 'Sam Lee'], ['Role', 'Operations coordinator'], ['Start', '14 Oct'], ['Manager', 'Priya Shah']].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
    }
    if (i === 1) {
      return `<ul class="ob-list" data-ob-zone="checklist">${[['Photo ID', 1], ['Tax declaration', 1], ['Bank details', 1], ['First aid certificate', 0]].map(([d, ok]) => `<li><span>${d}</span>${ok ? tick : `${warn('Missing')}<button type="button" class="ob-btn">Upload</button>`}</li>`).join('')}</ul>`;
    }
    if (i === 2) {
      return `<ul class="ob-docs" data-ob-zone="validation">${OB_DOCS.map((d, n) => `
        <li><button type="button" data-ob-doc="${n}">
          <span class="ob-docs-name"><b>${d.name}</b><small>${d.file}</small></span>
          <span class="ob-rules">${d.rules.map(([r, ok]) => `<span class="${ok ? 'ok' : 'bad'}">${ok ? '✓' : '!'} ${r}</span>`).join('')}</span>
        </button></li>`).join('')}</ul>`;
    }
    // Contract: a form the AI has filled in, signed, then submitted.
    if (obSubmitted) {
      return `<div class="ob-done" data-ob-zone="creation"><i class="ob-ok">✓</i><b>Contract submitted</b><small>Sent to Priya Shah</small></div>`;
    }
    return `<div class="ob-form" data-ob-zone="creation">
        ${[['Full name', 'Sam Lee'], ['Role', 'Operations coordinator'], ['Start date', '14 Oct 2026'], ['Hours', 'Full-time']].map(([k, v]) => `<label><span>${k}</span><input value="${v}" readonly class="ob-ai-filled"></label>`).join('')}
        <label class="ob-sign-wrap"><span>Signature</span><button type="button" class="ob-sign${obSigned ? ' signed' : ''}" data-ob-sign>${obSigned ? 'Sam Lee' : 'Tap to sign'}</button></label>
      </div>`;
  }
  function obHelperHtml() {
    const msgs = [`<div class="ob-msg">I’ve filled this in from Sam’s details.</div>`];
    if (!obSigned) msgs.push(`<div class="ob-msg">Sign, then I’ll submit it.</div>`);
    else if (!obSubmitted) msgs.push(`<div class="ob-msg">Signed. Submit to Priya?<button type="button" class="ob-btn ob-primary" data-ob-submit>Submit contract</button></div>`);
    else msgs.push(`<div class="ob-msg">Done. Priya has it.</div>`);
    return msgs.join('');
  }
  function obChatHtml() {
    return [`<div class="ob-msg">Hi Sam, ask me anything.</div>`]
      .concat(obChat.map(([q, a, src]) => `<div class="ob-msg ob-me">${q}</div><div class="ob-msg">${a}<span class="ob-src">${src}</span></div>`)).join('');
  }
  function obModalHtml() {
    if (obDoc == null) return '';
    const d = OB_DOCS[obDoc];
    return `<div class="ob-modal-back" data-ob-close>
      <div class="ob-modal" role="dialog" aria-label="${d.name} check" data-ob-zone="validation">
        <div class="ob-modal-hd"><b>${d.name}</b><button type="button" class="ob-x" data-ob-close aria-label="Close">×</button></div>
        <div class="ob-modal-body">
          <div class="ob-modal-doc">${obDocArt(obDoc)}</div>
          <ul class="ob-checks">${d.rules.map(([r, ok], n) => `<li class="${n < obChecked ? (ok ? 'ok' : 'bad') : n === obChecked ? 'run' : 'wait'}"><i aria-hidden="true">${n < obChecked ? (ok ? '✓' : '!') : ''}</i><span>${r}</span></li>`).join('')}</ul>
        </div>
      </div>
    </div>`;
  }
  function renderOnboarding() {
    const contract = obStep === 3;
    const enter = obEnter;
    obEnter = false;
    featEl.innerHTML = `
      <div class="ob${contract ? ' ob-with-helper' : ''}${enter ? ' ob-enter' : ''}" data-focus="${featK}">
        <div class="ob-main">
          <div class="ob-top"><span class="ob-logo">E</span><b>Enterprise AI</b><span>New starter</span></div>
          <ol class="ob-steps">${OB_STEPS.map((n, i) => `<li><button type="button" data-ob-step="${i}" class="${i === obStep ? 'on' : i < obStep ? 'done' : ''}"><span>${i + 1}</span>${n}</button></li>`).join('')}</ol>
          <div class="ob-card">
            <h4>${OB_STEPS[obStep]}</h4>
            ${obBody(obStep)}
            <div class="ob-nav">${obStep > 0 ? '<button type="button" class="ob-btn" data-ob-go="-1">Back</button>' : '<span></span>'}${obStep < 3 ? '<button type="button" class="ob-btn ob-primary" data-ob-go="1">Next</button>' : ''}</div>
          </div>
        </div>
        ${contract ? `<aside class="ob-helper" data-ob-zone="creation" aria-label="Contract assistant"><div class="ob-side-hd"><b>AI</b><span class="ob-chip">Contract</span></div><div class="ob-chat">${obHelperHtml()}</div></aside>` : ''}
        ${obModalHtml()}
        ${contract ? '' : `<button type="button" class="ob-bubble${obChatOpen ? ' open' : ''}" data-ob-bubble aria-label="${obChatOpen ? 'Close' : 'Open'} assistant">${obChatOpen ? '×' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>'}</button>`}
        ${!contract && obChatOpen ? `<aside class="ob-pop" data-ob-zone="chatbot" aria-label="Enterprise AI assistant">
          <div class="ob-side-hd"><b>Assistant</b><span class="ob-chip">Staff handbook</span></div>
          <div class="ob-chat" aria-live="polite">${obChatHtml()}</div>
          <div class="ob-asks">${OB_ASKS.map(([q], i) => `<button type="button" data-ob-ask="${i}">${q}</button>`).join('')}</div>
        </aside>` : ''}
      </div>`;
    featEl.querySelectorAll('.ob-chat').forEach((c) => { c.scrollTop = c.scrollHeight; });
  }
  // Open a document's check window and tick its rules one by one.
  function openDoc(n) {
    clearOb();
    obDoc = n;
    obChecked = 0;
    renderOnboarding();
    const total = OB_DOCS[n].rules.length;
    for (let k = 1; k <= total; k++) {
      obTimers.push(setTimeout(() => { if (obDoc !== n) return; obChecked = k; renderOnboarding(); }, REDUCED ? 0 : 700 * k));
    }
  }
  featEl.addEventListener('click', (e) => {
    const t = e.target;
    const step = t.closest('[data-ob-step]');
    const go = t.closest('[data-ob-go]');
    const ask = t.closest('[data-ob-ask]');
    const doc = t.closest('[data-ob-doc]');
    featSec.classList.add('feat-hold');
    if (t.closest('.ob-modal') && !t.closest('.ob-x')) return;
    if (t.closest('[data-ob-close]')) { clearOb(); obDoc = null; }
    else if (doc) { openDoc(Number(doc.dataset.obDoc)); return; }
    else if (t.closest('[data-ob-bubble]')) obChatOpen = !obChatOpen;
    else if (t.closest('[data-ob-sign]')) obSigned = true;
    else if (t.closest('[data-ob-submit]')) obSubmitted = true;
    else if (step) { obStep = Number(step.dataset.obStep); obChatOpen = false; }
    else if (go) { obStep = Math.max(0, Math.min(3, obStep + Number(go.dataset.obGo))); obChatOpen = false; }
    else if (ask) obChat = [...obChat, OB_ASKS[Number(ask.dataset.obAsk)]].slice(-2);
    else return;
    renderOnboarding();
  });
  function featCaption(k) {
    return {
      chatbot: 'Answers from the staff handbook, with sources.',
      checklist: 'Shows what’s in and what’s missing.',
      validation: 'Checks each document and flags problems.',
      creation: 'Drafts the contract from the answers.',
    }[k];
  }
  function showFeature(k) {
    featK = k;
    clearOb();
    obStep = FEAT_STEP[k];
    obDoc = null;
    obChatOpen = k === 'chatbot';
    if (k === 'chatbot' && !obChat.length) obChat = [OB_ASKS[0]];
    if (k === 'creation') { obSigned = false; obSubmitted = false; }
    obEnter = V2 && !REDUCED;
    renderOnboarding();
    // Play each feature a little: open the ID check, or sign and submit the contract.
    // (V2 waits for the feature to animate in first.)
    if (k === 'validation') obTimers.push(setTimeout(() => openDoc(0), REDUCED ? 0 : V2 ? 2000 : 900));
    if (k === 'creation' && !REDUCED) {
      obTimers.push(setTimeout(() => { obSigned = true; renderOnboarding(); }, V2 ? 2600 : 1600));
      obTimers.push(setTimeout(() => { obSubmitted = true; renderOnboarding(); }, V2 ? 5000 : 4000));
    }
    document.querySelectorAll('[data-feature]').forEach((b) => {
      const on = b.dataset.feature === k;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      const bar = b.querySelector('.feat-bar i');
      if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
    });
    $('featNote').textContent = featCaption(k);
    // On narrow screens the cards are a sideways strip: keep the active one in view.
    const list = featSec.querySelector('.feat-list');
    const card = list.querySelector(`[data-feature="${k}"]`);
    if (list.scrollWidth > list.clientWidth + 4) list.scrollTo({ left: card.offsetLeft - list.offsetLeft, behavior: REDUCED ? 'auto' : 'smooth' });
  }
  $('featLabel').innerHTML = '<i style="background:#1E3A5F"></i>Enterprise AI · New starter onboarding';
  // Kept for the builder chat, which still turns features on in the builder's own app.
  function syncFeatureButtons() {}

  let featPlaying = false;
  document.querySelectorAll('[data-feature]').forEach((b) => {
    b.addEventListener('click', () => showFeature(b.dataset.feature));
    // When a card's bar fills, move to the next card.
    b.querySelector('.feat-bar i')?.addEventListener('animationend', () => {
      if (!featPlaying || b.dataset.feature !== featK) return;
      showFeature(FEAT_ORDER[(FEAT_ORDER.indexOf(featK) + 1) % FEAT_ORDER.length]);
    });
  });
  // Hovering the section holds the current card.
  featSec.querySelector('.feat').addEventListener('pointerenter', () => featSec.classList.add('feat-hold'));
  featSec.querySelector('.feat').addEventListener('pointerleave', () => featSec.classList.remove('feat-hold'));
  if (REDUCED) {
    featSec.classList.add('feat-static');
    showFeature('chatbot');
  } else {
    showFeature('chatbot');
    new IntersectionObserver((entries) => {
      const vis = entries.some((e) => e.isIntersecting);
      featPlaying = vis;
      featSec.classList.toggle('feat-playing', vis);
      if (vis) showFeature(featK); // restart the current card's bar when it comes into view
    }, { threshold: 0.35 }).observe(featSec);
  }

  /* ================================================================
     8. CMS
     ================================================================ */
  let cmsTab = 'workflows';
  let cmsFilter = 'all';
  const paused = new Set();
  let openSub = null;
  const SUB_STATE = [[3, 'Waiting for approval', 'wait'], [1, 'In progress', 'prog'], [3, 'Approved', 'ok']];
  const SUB_TIME = ['12 min ago', '1 hr ago', 'Yesterday'];
  document.querySelectorAll('[data-cms]').forEach((b) => b.addEventListener('click', () => { cmsTab = b.dataset.cms; openSub = null; renderCMS(); }));

  function renderCMS() {
    const t = TPL();
    const clients = pageClients();
    $('cmsTitle').textContent = t.name;
    document.querySelectorAll('[data-cms]').forEach((b) => b.setAttribute('aria-selected', b.dataset.cms === cmsTab ? 'true' : 'false'));
    const docs = clients.flatMap((c) => t.docs(c).map((d) => ({ d, c })));
    $('cmsCountW').textContent = '4';
    $('cmsCountK').textContent = docs.length;
    $('cmsCountS').textContent = clients.length * 3;
    $('cmsClients').innerHTML = `<p>Clients on this build</p>` + clients.map((c) => `<div><i style="background:${esc(c.b)}"></i>${esc(c.name)}<span>${S.published ? 'Live' : 'Draft'}</span></div>`).join('');
    const main = $('cmsMain');

    if (cmsTab === 'workflows') {
      main.innerHTML =
        `<div class="cms-hd"><div><h3>Workflow</h3><p>Four steps, the same for every client. Change it once, it changes for all ${plural(clients.length, 'client')}.</p></div><button type="button" class="cms-btn" data-go="builder">Edit in the builder</button></div>` +
        `<ol class="cms-flow">${t.steps.map(([l, w], i) => {
          const tags = [];
          if (S.features.checklist && t.featureStep.checklist === i) tags.push('Checklist');
          if (S.features.extract && t.featureStep.extract === i) tags.push('Extraction');
          if (i === 3) tags.push(plural(S.approvers, 'approver'));
          if (i === 2 && S.features.rag) tags.push('RAG');
          return `<li><span class="cf-n">${i + 1}</span><div><b>${esc(l)}</b><small>${esc(w)}</small></div><span class="cf-tags">${tags.map((x) => `<em>${esc(x)}</em>`).join('')}</span></li>`;
        }).join('')}</ol>` +
        `<p class="cms-foot">Plus the in-app assistant, in each client’s brand${S.features.rag ? ', answering from their documents' : ''}.</p>`;
    } else if (cmsTab === 'knowledge') {
      main.innerHTML =
        `<div class="cms-hd"><div><h3>Documents feeding the AI</h3><p>What each client’s assistant reads. Pause a document and the AI stops using it.</p></div></div>` +
        (S.features.rag ? '' : `<div class="cms-banner"><span>These documents are ready, but the assistant isn’t using them yet.</span><button type="button" class="cms-btn" data-rag>Turn on the RAG chatbot</button></div>`) +
        `<div class="cms-table">${docs.map(({ d, c }) => {
          const key = c.name + '|' + d;
          const on = !paused.has(key);
          return `<div class="cms-row"><span class="cr-doc">${esc(d)}</span><span class="cr-client"><i style="background:${esc(c.b)}"></i>${esc(c.name)}</span><button type="button" class="cr-sw" role="switch" aria-checked="${on}" data-doc="${esc(key)}"><i></i><span>${on ? (S.features.rag ? 'Feeding the AI' : 'Ready') : 'Paused'}</span></button></div>`;
        }).join('')}</div>`;
    } else {
      const rows = [];
      clients.forEach((c, ci) => t.submissions.forEach((s, j) => {
        const [step, label, cls] = SUB_STATE[(j + ci) % 3];
        rows.push({ id: `${ci}-${j}`, s, c, step, label, cls, time: SUB_TIME[j] });
      }));
      const shown = rows.filter((r) => cmsFilter === 'all' || r.c.name === cmsFilter);
      main.innerHTML =
        `<div class="cms-hd"><div><h3>Submissions</h3><p>Every piece of work, from every client, and where it’s up to.</p></div></div>` +
        `<div class="cms-filter" role="group" aria-label="Filter by client">${['all'].concat(clients.map((c) => c.name)).map((n) => `<button type="button" data-filter="${esc(n)}" aria-pressed="${cmsFilter === n}">${n === 'all' ? 'All clients' : esc(n)}</button>`).join('')}</div>` +
        `<div class="cms-table">${shown.map((r) => `<button type="button" class="cms-row cms-sub${openSub === r.id ? ' open' : ''}" data-sub="${r.id}" aria-expanded="${openSub === r.id}"><span class="cr-doc">${esc(r.s)}</span><span class="cr-client"><i style="background:${esc(r.c.b)}"></i>${esc(r.c.name)}</span><span class="cr-step">${esc(t.steps[r.step][0])}</span><span class="cr-st ${r.cls}">${esc(r.label)}</span><span class="cr-time">${esc(r.time)}</span></button>` +
          (openSub === r.id ? `<div class="cms-detail"><span>At <b>${esc(t.steps[r.step][0])}</b> in ${esc(poss(r.c.name))} app. ${r.cls === 'wait' ? 'Waiting on the approver.' : r.cls === 'ok' ? 'Approved and done.' : 'Being filled in now.'}</span><button type="button" class="cms-btn" data-openapp="${esc(r.c.name)}">Open ${esc(poss(r.c.name))} app</button></div>` : '')).join('')}</div>`;
    }
  }
  $('cmsMain').addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('[data-go="builder"]')) { start(); return; }
    if (t.closest('[data-rag]')) { setFeature('rag', true); return; }
    const sw = t.closest('[data-doc]');
    if (sw) { const k = sw.dataset.doc; if (paused.has(k)) paused.delete(k); else paused.add(k); renderCMS(); return; }
    const f = t.closest('[data-filter]');
    if (f) { cmsFilter = f.dataset.filter; openSub = null; renderCMS(); return; }
    const oa = t.closest('[data-openapp]');
    if (oa) {
      const br = pageClients().find((c) => c.name === oa.dataset.openapp);
      if (br && br !== S.current && !S.busy) { S.current = br; A.update(appEl, model(), { keepThread: true }); updateTop(); refreshPage(); }
      openPhone();
      return;
    }
    const sub = t.closest('[data-sub]');
    if (sub) { openSub = openSub === sub.dataset.sub ? null : sub.dataset.sub; renderCMS(); }
  });

  /* ================================================================
     Boot
     ================================================================ */
  // Unnamed clients: the page's own words stop naming one, and stop promising a logo.
  if (UNNAMED) {
    const pill = document.querySelector('.hx-chips [data-prompt="A campaign email app for Nike"]');
    if (pill) { pill.dataset.prompt = 'A campaign email app'; pill.textContent = 'A campaign email app'; }
    const hint = document.querySelector('.hx-hint');
    if (hint) hint.textContent = 'Every app is four steps, in your client’s colours.';
    const rd = document.querySelector('#bxReading small');
    if (rd) rd.textContent = 'Colours and tone of voice';
  }
  idleBuilder();
  syncFeatureButtons();

  if (REDUCED) {
    // Finished states, no motion: built for Nike, re-skinned for the next client.
    (async () => {
      await startBuild(PROMPTS[0]);
      await rebrand(NEXT_CLIENT, ++run);
    })();
  } else if (!SHADER) {
    setTimeout(armAuto, 600); // let the first section rise in first
  } else {
    if (window.__introSettled) armAuto();
    else addEventListener('intro:settled', armAuto, { once: true });
  }
})();
