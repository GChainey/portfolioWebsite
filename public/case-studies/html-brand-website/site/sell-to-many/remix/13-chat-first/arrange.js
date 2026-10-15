/* Remix 13/14 — Arrange (prototype-only).
   Reorder and hide the page's top-level sections to test variations
   ("show the value first, then ask for the chat lower down"). The
   arrangement lives in the URL, so any variation is a shareable link:

     ?order=builder,phone,maths,…   the order of the sections (keys below)
     ?hide=cms,agents               sections to leave out
     ?layout=value-first            a named preset (Value first)

   Keys come from each section's data-section; names from data-label.
   The header, the closing CTA, the footer and the fixed pills never move.
   Runs before chat-first.js so everything else measures the final order.
   Fires `arrange:change` whenever the order or visibility changes. */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const page = document.querySelector('.ps-page');
  const anchor = $('cta'); // sections always sit before the closing CTA
  const sections = () => [...page.querySelectorAll(':scope > [data-section]')];
  const byKey = (k) => page.querySelector(`:scope > [data-section="${k}"]`);
  const labelOf = (k) => byKey(k).dataset.label;
  const DEFAULT = sections().map((s) => s.dataset.section);
  const PRESET_ORDER = {
    'value-first': ['builder', 'phone', 'maths', 'gofer', 'features', 'agents', 'enterprise', 'cms', 'chat'],
    /* User-test (light): build prompt → sugar hits → calculator → AI → enterprise → extend in Cursor/Codex. CMS hidden. */
    'ut-light': ['chat', 'builder', 'phone', 'maths', 'features', 'enterprise', 'agents'],
  };
  /* MVP (see the Notion page "Marketing site — MVP page structure"): enterprise
     grade with the build → brand your apps → mobile → calculator → Gofer →
     AI features → enterprise → extend with the CLI. CMS is parked. */
  PRESET_ORDER.mvp = ['chat', 'builder', 'phone', 'maths', 'gofer', 'features', 'enterprise', 'agents', 'cms'];
  // MVP with remix 03's multiplier wall right after "Brand your apps", the
  // calculator merged into it (remix 22).
  PRESET_ORDER['mvp-multi'] = ['chat', 'builder', 'multiplier', 'phone', 'maths', 'gofer', 'features', 'enterprise', 'agents', 'cms'];
  // V2 user testing (remix 23): the MVP page again, the one the retest edits.
  // Kept as its own name so the tested ?layout=mvp page stays as it was.
  // Adds "Control" (EAI Curate and Workflows) after the AI features.
  PRESET_ORDER.mvp2 = ['chat', 'builder', 'phone', 'maths', 'gofer', 'features', 'control', 'enterprise', 'agents', 'cms'];
  // V3 (remix 25): the V2 page with "Build in your CLI. Manage in EAI." after Control.
  // Runs as mvp2 (so every V2 change carries over) with data-v="3" on <html>.
  PRESET_ORDER.mvp3 = ['chat', 'builder', 'phone', 'maths', 'gofer', 'features', 'control', 'manage', 'enterprise', 'agents', 'cms'];
  // V4: the V3 page with the ending of the 60 second sizzle reel
  // (../../../sizzle/reel.js), which tells it more clearly. The reel has no CLI
  // beat: "Build with the AI you already pay for" carries that message. So that
  // section takes the place of "Build in your CLI. Manage in EAI.", ahead of the
  // controls, and the CLI section is not shown. "Build once. Sell to many." still
  // comes first (the reel opens on Gofer; the page does not). Runs as V3 in every
  // other way. The lean site's home page (remix 29) uses it.
  PRESET_ORDER.mvp4 = ['chat', 'builder', 'phone', 'maths', 'gofer', 'features', 'control', 'agents', 'enterprise', 'manage', 'cms'];
  const PRESET_HIDE = {
    // Gofer is new since this study started; keep it out so every participant sees the same page.
    'ut-light': ['cms', 'gofer'],
    mvp: ['cms'],
    mvp2: ['cms'],
    // V3: no phone preview (nobody has the app on their phone before the meeting).
    mvp3: ['cms', 'phone'],
    mvp4: ['cms', 'phone'],
    // The calculator lives inside the multiplier here (multiplier.js moves it), so its own section goes.
    'mvp-multi': ['cms', 'maths'],
  };
  // Optional sections stay hidden unless a layout asks for them.
  const OPTIONAL = ['multiplier', 'control', 'manage'];
  const PRESET_SHOW = { 'mvp-multi': ['multiplier'], mvp2: ['control'], mvp3: ['control', 'manage'], mvp4: ['control'] };
  const presetOrder = (name) => (PRESET_ORDER[name] ? PRESET_ORDER[name].slice() : DEFAULT.slice());
  const presetHide = (name) => {
    const h = PRESET_HIDE[name] ? PRESET_HIDE[name].slice() : [];
    OPTIONAL.forEach((k) => { if (!(PRESET_SHOW[name] || []).includes(k) && !h.includes(k)) h.push(k); });
    return h;
  };
  // A landing page (landing.js, ?lp=) brings its own arrangement: the sections
  // that carry its tagline, in its order, on top of the layout the link names.
  const LANDING = window.EAILanding ? {
    order: window.EAILanding.order.concat(DEFAULT.filter((k) => !window.EAILanding.order.includes(k))),
    hide: window.EAILanding.hide.filter((k) => DEFAULT.includes(k)),
  } : null;
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let open = false; // arrange mode

  /* ---------------- state <-> URL ---------------- */
  function parse() {
    const q = new URLSearchParams(location.search);
    const layout = q.get('layout');
    let order = q.get('order') ? q.get('order').split(',') : LANDING ? LANDING.order.slice() : presetOrder(layout);
    order = order.filter((k, i) => DEFAULT.includes(k) && order.indexOf(k) === i);
    DEFAULT.forEach((k) => { if (!order.includes(k)) order.push(k); });
    let hide;
    if (q.has('hide')) hide = (q.get('hide') || '').split(',').filter((k) => DEFAULT.includes(k));
    else hide = LANDING ? LANDING.hide.slice() : presetHide(layout).filter((k) => DEFAULT.includes(k));
    return { order, hide };
  }
  let state = parse();

  const same = (a, b) => a.join() === b.join();
  function paramsFor(u) {
    const current = u.searchParams.get('layout');
    ['order', 'hide', 'layout'].forEach((k) => u.searchParams.delete(k));
    if (LANDING && same(state.order, LANDING.order) && same(state.hide, LANDING.hide)) {
      if (current) u.searchParams.set('layout', current);
      return u;
    }
    if (same(state.order, DEFAULT) && same(state.hide, presetHide(null))) return u;
    // mvp and mvp2 share an arrangement; keep whichever the link named.
    const matches = (p) => same(presetOrder(p), state.order) && same(presetHide(p), state.hide);
    const preset = PRESET_ORDER[current] && matches(current) ? current : Object.keys(PRESET_ORDER).find(matches);
    if (preset) u.searchParams.set('layout', preset);
    else {
      u.searchParams.set('order', state.order.join(','));
      if (state.hide.length) u.searchParams.set('hide', state.hide.join(','));
    }
    return u;
  }
  function syncLayoutAttr() {
    const u = new URL(location.href);
    const named = u.searchParams.get('layout');
    const preset = named || Object.keys(PRESET_ORDER).find((p) => same(presetOrder(p), state.order) && same(presetHide(p), state.hide)) || '';
    // V3 is V2 plus its own changes: mvp2 for everything V2 does, data-v="3" for the rest.
    // V4 is V3 in another order, so it is marked the same way.
    const v3 = preset === 'mvp3' || preset === 'mvp4';
    root.dataset.layout = v3 ? 'mvp2' : preset;
    if (v3) root.dataset.v = '3';
    else delete root.dataset.v;
  }
  function applyUtCopy() {
    if (root.dataset.layout !== 'ut-light') return;
    const entH = document.getElementById('entH');
    const entSub = document.querySelector('#enterprise .sg-sub');
    const agentsH = document.getElementById('agentsH');
    const featSub = document.querySelector('#features .sg-sub');
    if (entH) entH.textContent = 'Make your app enterprise grade.';
    if (entSub) entSub.textContent = 'Your app passes the security review. We make sure of it. You don\u2019t build any of this; it comes with the platform.';
    if (featSub) featSub.textContent = 'Switch on AI after the platform has secured it. Each feature is a switch, not a project.';
    if (agentsH) agentsH.textContent = 'Extend with Claude Code, Codex or Cursor';
  }
  /* MVP copy: the hero leads with enterprise grade, the builder below it is
     the branding sugar hit, and the agents section is "extend with the CLI". */
  function applyMvpCopy() {
    if (root.dataset.layout !== 'mvp' && root.dataset.layout !== 'mvp2') return;
    const set = (sel, text) => { const el = document.querySelector(sel); if (el) el.textContent = text; };
    const h1 = document.querySelector('.hx-h1');
    if (h1 && !h1.dataset.mvp) {
      h1.dataset.mvp = '1';
      h1.innerHTML = ['Make', 'your', 'apps', 'enterprise', 'grade.'].map((w, i) => `<span class="w${i > 2 ? ' w2' : ''}" style="--i:${i}">${w}</span>`).join(' ');
    }
    set('.hx-sub', 'Describe it in a sentence. Enterprise AI builds it as a four-step app, with sign-in, permissions, hosting and security reviews already done.');
    set('.bstage-sub', 'Brand your apps. Build it for Nike, then name the next client and the same app wears their logo, colours and voice.');
    set('#agentsH', 'Extend and build with the CLI');
  }
  /* V2 user testing copy (remix 23), from the MVP message-accuracy study:
     AI features say what they're for, Gofer says what it is, the CLI says who it's for. */
  function applyV2Copy() {
    if (root.dataset.layout !== 'mvp2') return;
    const set = (sel, text) => { const el = document.querySelector(sel); if (el) el.textContent = text; };
    set('#phone .sg-sub', 'One click puts the app on a phone. Your client scans the code and has the app, already in their brand.');
    set('#featH', 'Improve your processes by switching on AI.');
    set('#features .sg-sub', 'Each feature is a switch, not a project. Switch one on and a step in your app gets faster and smarter, for every client this build serves.');
    const kicker = document.querySelector('#gofer .gf-kicker');
    if (kicker && kicker.lastChild) kicker.lastChild.textContent = 'Meet Gofer, our process agent';
    set('#gofH', 'Gofer turns messy work into four steps.');
    set('#gofer .sg-sub', 'Gofer is the Enterprise AI agent that maps how your client works today, across email, spreadsheets and phone calls. It cuts what isn’t needed and hands back a four-step app, ready to build.');
    set('#gofer .gf-try-k', 'Try it on a real process');
    // Bring your own AI: the benefit is the AI tool the company already pays for, not "for developers".
    set('#agents .ag-kicker', 'Bring your own AI');
    set('#agentsH', 'Build with the AI you already pay for.');
    const ag = document.querySelector('#agents .sg-sub');
    if (ag) ag.innerHTML = 'Your team may already have Claude, Codex or Cursor, and more people are building with them every day. Connect it to Enterprise AI, type <code>/eai</code> and describe the app. It lands in EAI as a four-step app, ready to sell.';
    const pts = document.querySelectorAll('#agents .ag-points li');
    ['Use the AI subscription your company already has', 'Sign-in, data, tenancy and hosting are handled for you', 'Move between your AI tool and EAI any time'].forEach((t, i) => { if (pts[i]) pts[i].textContent = t; });
  }
  /* V3 copy (remix 25): Gofer simplifies a workflow; it isn't about four steps. */
  function applyV3Copy() {
    if (root.dataset.v !== '3') return;
    const set = (sel, text) => { const el = document.querySelector(sel); if (el) el.textContent = text; };
    set('#gofH', 'Gofer turns messy work into a simple workflow.');
    set('#gofer .sg-sub', 'Gofer is the Enterprise AI agent that maps how your client works today, across email, spreadsheets and phone calls. It cuts what isn’t needed and distils a complex process into a simple workflow, ready to build.');
  }
  /* V4 copy (the lean site's home page): its clients have no names or logos
     (see UNNAMED in chat-first.js), so the builder's line doesn't name one. */
  function applyV4Copy() {
    const q = new URL(location.href).searchParams;
    if (q.get('layout') !== 'mvp4' || q.get('names') === '1') return;
    const sub = document.querySelector('.bstage-sub');
    if (sub) sub.textContent = 'Brand your apps. Build it for one client, then pick the next and the same app wears their colours and voice.';
  }
  function writeURL() { history.replaceState(history.state, '', paramsFor(new URL(location.href))); }
  // The link to share: in the shader theme, point at remix 14's own address.
  function shareURL() {
    const u = paramsFor(new URL(location.href));
    u.hash = '';
    if (u.searchParams.get('theme') === 'shader') {
      u.searchParams.delete('theme');
      u.pathname = u.pathname.replace(/13-chat-first\/(index\.html)?$/, '14-dark-shader/');
    }
    let own = { cfg: '20-configurator-brand/', refined: '21-refined/', brand: '24-v2-brand/' }[u.searchParams.get('theme')];
    if (own && u.searchParams.get('theme') === 'brand' && u.searchParams.get('layout') === 'mvp2') u.searchParams.delete('layout');
    if (own && u.searchParams.get('theme') === 'brand' && u.searchParams.get('layout') === 'mvp3') { own = '25-v3/'; u.searchParams.delete('layout'); }
    if (own) {
      u.searchParams.delete('theme');
      u.pathname = u.pathname.replace(/13-chat-first\/(index\.html)?$/, own);
    }
    if (u.searchParams.get('theme') === 'shape') {
      let dir = { brand: '18-shapeshifter-brand/', cyan: '19-shapeshifter-cyan/' }[u.searchParams.get('ss')] || '17-shapeshifter/';
      if (u.searchParams.get('ss') === 'cyan' && u.searchParams.get('layout') === 'mvp-multi') { dir = '22-shapeshifter-multiplier/'; u.searchParams.delete('layout'); }
      if (u.searchParams.get('ss') === 'cyan' && u.searchParams.get('layout') === 'mvp2') { dir = '23-v2-user-testing/'; u.searchParams.delete('layout'); }
      u.searchParams.delete('theme');
      u.searchParams.delete('ss');
      u.pathname = u.pathname.replace(/13-chat-first\/(index\.html)?$/, dir);
    }
    return u.toString();
  }

  /* ---------------- applying an arrangement ---------------- */
  function apply() {
    state.order.forEach((k) => page.insertBefore(byKey(k), anchor));
    let first = null;
    sections().forEach((s) => {
      s.hidden = state.hide.includes(s.dataset.section);
      s.classList.remove('is-first');
      if (!s.hidden && !first) first = s;
    });
    if (first) first.classList.add('is-first');
    root.dataset.first = first ? first.dataset.section : '';
    syncLayoutAttr();
    applyUtCopy();
    applyMvpCopy();
    applyV2Copy();
    applyV3Copy();
    applyV4Copy();
    // Links to a hidden section hide with it; links to a moved one still work (ids).
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const id = a.getAttribute('href').slice(1);
      const t = id && document.getElementById(id);
      if (t && t.matches('[data-section]')) a.hidden = t.hidden;
    });
    if (open) renderList();
    window.dispatchEvent(new CustomEvent('arrange:change', { detail: { order: state.order.slice(), hide: state.hide.slice() } }));
  }
  function commit(next, { flash } = {}) {
    state = next;
    apply();
    writeURL();
    if (flash) {
      const el = byKey(flash);
      el.classList.remove('ar-flash');
      void el.offsetWidth;
      el.classList.add('ar-flash');
    }
  }

  apply();
  // A #section in the URL was scrolled to before the reorder: go there again.
  if (location.hash && !root.classList.contains('intro-pending')) {
    addEventListener('load', () => {
      const t = document.getElementById(location.hash.slice(1));
      if (t) t.scrollIntoView();
    }, { once: true });
  }

  /* ---------------- arrange mode ---------------- */
  const btn = $('arrangeBtn');
  const panel = $('arPanel');
  const list = $('arList');
  const drop = $('arDrop');

  const GRIP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
  const UP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const DOWN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const EYE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
  const EYE_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 5.1A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.3 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  // A grab handle on every section (only shown in arrange mode).
  sections().forEach((s) => {
    const h = document.createElement('button');
    h.type = 'button';
    h.className = 'ar-handle';
    h.innerHTML = `${GRIP}<span>${s.dataset.label}</span>`;
    h.setAttribute('aria-label', `Move section: ${s.dataset.label}. Use the Arrange panel's up and down buttons to move it with the keyboard.`);
    h.addEventListener('pointerdown', (e) => startPageDrag(e, s));
    h.addEventListener('click', (e) => e.preventDefault());
    s.prepend(h);
  });

  function setOpen(on) {
    open = on;
    root.classList.toggle('arranging', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    panel.hidden = !on;
    if (on) { renderList(); panel.querySelector('.ar-close').focus({ preventScroll: true }); }
    else btn.focus({ preventScroll: true });
  }
  btn.addEventListener('click', () => setOpen(!open));
  $('arClose').addEventListener('click', () => setOpen(false));
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !open) return;
    if (drag) cancelPageDrag();
    else if (!document.querySelector('.modal:not([hidden]), .drawer:not([hidden])')) setOpen(false);
  });

  /* ---------------- the panel ---------------- */
  function renderList(focusSel) {
    list.innerHTML = state.order.map((k, i) => {
      const hidden = state.hide.includes(k);
      return `<li class="ar-item${hidden ? ' is-hidden' : ''}" data-k="${k}">` +
        `<span class="ar-grip" data-grip aria-hidden="true">${GRIP}</span>` +
        `<button type="button" class="ar-name" data-go title="Scroll to this section">${labelOf(k)}</button>` +
        `<span class="ar-btns">` +
        `<button type="button" data-up aria-label="Move ${labelOf(k)} up"${i === 0 ? ' disabled' : ''}>${UP}</button>` +
        `<button type="button" data-down aria-label="Move ${labelOf(k)} down"${i === state.order.length - 1 ? ' disabled' : ''}>${DOWN}</button>` +
        `<button type="button" data-eye aria-pressed="${!hidden}" aria-label="${hidden ? 'Show' : 'Hide'} ${labelOf(k)}">${hidden ? EYE_OFF : EYE}</button>` +
        `</span></li>`;
    }).join('');
    if (focusSel) {
      const f = list.querySelector(focusSel);
      if (f && !f.disabled) f.focus({ preventScroll: true });
      else list.querySelector(focusSel.replace(/\[data-(up|down)\]$/, '[data-eye]'))?.focus({ preventScroll: true });
    }
  }
  list.addEventListener('click', (e) => {
    const li = e.target.closest('.ar-item');
    if (!li) return;
    const k = li.dataset.k;
    const order = state.order.slice();
    const i = order.indexOf(k);
    if (e.target.closest('[data-up]') && i > 0) {
      order.splice(i, 1); order.splice(i - 1, 0, k);
      commit({ order, hide: state.hide }, { flash: k });
      renderList(`[data-k="${k}"] [data-up]`);
    } else if (e.target.closest('[data-down]') && i < order.length - 1) {
      order.splice(i, 1); order.splice(i + 1, 0, k);
      commit({ order, hide: state.hide }, { flash: k });
      renderList(`[data-k="${k}"] [data-down]`);
    } else if (e.target.closest('[data-eye]')) {
      const hide = state.hide.includes(k) ? state.hide.filter((x) => x !== k) : state.hide.concat(k);
      commit({ order, hide });
      renderList(`[data-k="${k}"] [data-eye]`);
    } else if (e.target.closest('[data-go]') && !state.hide.includes(k)) {
      byKey(k).scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    }
  });
  panel.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => {
    const name = b.dataset.preset;
    commit({ order: presetOrder(name), hide: presetHide(name) });
    scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
  }));
  $('arReset').addEventListener('click', () => {
    commit({ order: DEFAULT.slice(), hide: [] });
    scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
  });
  $('arCopy').addEventListener('click', async (e) => {
    const b = e.currentTarget;
    try { await navigator.clipboard.writeText(shareURL()); b.textContent = 'Copied'; } catch (err) { b.textContent = 'Copy failed'; }
    setTimeout(() => { b.textContent = 'Copy link'; }, 1600);
  });

  // Drag within the list (mouse or touch on the grip).
  list.addEventListener('pointerdown', (e) => {
    const grip = e.target.closest('[data-grip]');
    if (!grip || e.button) return;
    e.preventDefault();
    const li = grip.closest('.ar-item');
    li.classList.add('is-drag');
    grip.setPointerCapture(e.pointerId);
    const move = (ev) => {
      const items = [...list.children].filter((x) => x !== li);
      const before = items.find((x) => { const r = x.getBoundingClientRect(); return ev.clientY < r.top + r.height / 2; });
      if (before) { if (li.nextSibling !== before) list.insertBefore(li, before); }
      else if (list.lastElementChild !== li) list.appendChild(li);
    };
    const up = () => {
      grip.removeEventListener('pointermove', move);
      grip.removeEventListener('pointerup', up);
      grip.removeEventListener('pointercancel', up);
      li.classList.remove('is-drag');
      const order = [...list.children].map((x) => x.dataset.k);
      if (!same(order, state.order)) commit({ order, hide: state.hide }, { flash: li.dataset.k });
      else renderList();
    };
    grip.addEventListener('pointermove', move);
    grip.addEventListener('pointerup', up);
    grip.addEventListener('pointercancel', up);
  });

  /* ---------------- drag a section on the page ---------------- */
  let drag = null;
  function startPageDrag(e, sec) {
    if (e.button) return;
    e.preventDefault();
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    const ghost = document.createElement('div');
    ghost.className = 'ar-ghost';
    ghost.innerHTML = `${GRIP}<span>${sec.dataset.label}</span>`;
    document.body.appendChild(ghost);
    sec.classList.add('ar-dragging');
    drag = { sec, handle, ghost, x: e.clientX, y: e.clientY, target: undefined, raf: 0 };
    const move = (ev) => { drag.x = ev.clientX; drag.y = ev.clientY; place(); };
    const up = () => finish(true);
    drag.cleanup = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', drag.cancel);
    };
    drag.cancel = () => finish(false);
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', drag.cancel);
    place();
    autoScroll();
  }
  // Where would it land? Before the first visible section whose middle is below the pointer.
  function place() {
    const { sec, ghost, x, y } = drag;
    ghost.style.transform = `translate(${x + 14}px, ${y + 12}px)`;
    const others = sections().filter((s) => s !== sec && !s.hidden);
    const before = others.find((s) => { const r = s.getBoundingClientRect(); return y < r.top + r.height / 2; }) || null;
    drag.target = before;
    // Is that where it already is?
    const vis = sections().filter((s) => !s.hidden);
    const stays = (vis[vis.indexOf(sec) + 1] || null) === before;
    let top;
    if (stays) {
      top = sec.getBoundingClientRect().top - 28;
    } else if (before) {
      const r = before.getBoundingClientRect();
      const prev = others[others.indexOf(before) - 1];
      top = prev ? (prev.getBoundingClientRect().bottom + r.top) / 2 : r.top - 28;
    } else {
      const last = others[others.length - 1];
      top = last ? last.getBoundingClientRect().bottom + 28 : 120;
    }
    const col = page.getBoundingClientRect();
    drop.hidden = false;
    drop.style.top = `${top + scrollY}px`;
    drop.style.left = `${Math.max(12, col.left + (col.width - Math.min(1160, col.width - 32)) / 2)}px`;
    drop.style.width = `${Math.min(1160, col.width - 32)}px`;
    drop.dataset.label = stays ? 'Keep it here' : before ? `Drop above “${before.dataset.label}”` : 'Drop at the end';
  }
  function autoScroll() {
    if (!drag) return;
    const edge = 130; // the sticky header covers the top ~80px
    let dy = 0;
    if (drag.y < edge) dy = -Math.ceil((edge - drag.y) / 3);
    else if (drag.y > innerHeight - 90) dy = Math.ceil((drag.y - (innerHeight - 90)) / 3);
    if (dy) { scrollBy({ top: dy, behavior: 'instant' }); place(); }
    drag.raf = requestAnimationFrame(autoScroll);
  }
  function finish(ok) {
    if (!drag) return;
    const { sec, ghost, target, raf } = drag;
    cancelAnimationFrame(raf);
    drag.cleanup();
    ghost.remove();
    drop.hidden = true;
    sec.classList.remove('ar-dragging');
    const k = sec.dataset.section;
    drag = null;
    if (!ok) return;
    const order = state.order.filter((x) => x !== k);
    if (target) order.splice(order.indexOf(target.dataset.section), 0, k);
    else {
      // after the last visible section (hidden ones keep their slots)
      const lastVisible = [...order].reverse().find((x) => !state.hide.includes(x));
      order.splice(lastVisible ? order.indexOf(lastVisible) + 1 : order.length, 0, k);
    }
    if (!same(order, state.order)) commit({ order, hide: state.hide }, { flash: k });
  }
  function cancelPageDrag() { if (drag) drag.cancel(); }

  window.EAIArrange = { get state() { return { order: state.order.slice(), hide: state.hide.slice() }; }, shareURL, open: () => setOpen(true) };
})();
