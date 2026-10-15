/* Remix 25 (V3) — "Build in your CLI. Manage in EAI."

   Changes typed in the CLI (Claude Code) land in the EAI web app. The web
   app fills the width: EAI's view of Campaign email, four steps, the AI and
   data on each, and an activity list of what changed and where it came from.
   A small light terminal (.term, as in "Build with the AI you already pay
   for") floats over its left side, so you watch one drive the other.

   Plays once when it scrolls into view; the terminal's replay button plays it
   again; a click on the demo jumps to the end. Reduced motion: the end state.
   Only shown by ?layout=mvp3 (arrange.js). */
(function () {
  'use strict';

  const sec = document.getElementById('manage');
  const demo = document.getElementById('mgDemo');
  if (!sec || !demo) return;
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const SPARK = svg('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>');
  const CODE = svg('<path d="M9 8l-4 4 4 4M15 8l4 4-4 4"/>');
  const icon = (d) => `<svg class="mg-ic" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const RAIL = [
    ['Overview', icon('<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>')],
    ['Workflows', icon('<rect x="3" y="4" width="7" height="6" rx="1.5"/><rect x="14" y="14" width="7" height="6" rx="1.5"/><path d="M6.5 10v4a3 3 0 0 0 3 3H14"/>'), true],
    ['EAI Curate', icon('<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>')],
    ['Clients', icon('<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .8 3 2.8 3 6"/>')],
  ];
  const REPLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* The app before any edit. Chips: [kind, text]; kind is ai | data | rule | code. */
  const BASE = () => [
    { n: 'Brief', chips: [['data', 'Run Club members.csv']] },
    { n: 'Assets', chips: [['data', 'nike-brand-guide.pdf']] },
    { n: 'Compose', chips: [['ai', 'Document Creation']] },
    { n: 'Review', chips: [['rule', '1 approver']] },
  ];

  /* Each edit: what's typed, what the CLI does, and what changes in the app. */
  const EDITS = [
    { ask: '/eai make Review need two approvers',
      work: ['Updating step 4, Review'],
      step: 3, swap: ['rule', '2 approvers'], log: 'Review needs two approvers' },
    { ask: '/eai connect Compose to our Salesforce campaign history',
      work: ['Writing connectors/salesforce-campaigns.ts', 'Wiring it into step 3, Compose'],
      step: 2, add: ['data', 'Salesforce · campaigns'], also: ['code', 'Custom code'], log: 'Salesforce connector on Compose' },
    { ask: '/eai let the team ask the brand guide questions in Assets',
      work: ['Switching on AI Chatbot for step 2, Assets'],
      step: 1, add: ['ai', 'AI Chatbot'], log: 'AI Chatbot on Assets' },
  ];

  const S = { steps: BASE(), log: [], lines: [], typing: '', sync: 'idle', hot: -1, newChip: null };
  let timers = [];
  let playing = false;
  let played = false;
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const stop = () => { timers.forEach(clearTimeout); timers = []; playing = false; };
  const push = (k, t) => S.lines.push({ k, t, fresh: true });
  const START = [['dim', 'Claude Code · ~/work/nike-campaign'], ['ok', '✓ Connected to Enterprise AI · Your agency']];

  function reset() {
    S.steps = BASE(); S.log = []; S.typing = ''; S.sync = 'idle'; S.hot = -1; S.newChip = null;
    S.lines = START.map(([k, t]) => ({ k, t }));
  }
  function apply(e) {
    const st = S.steps[e.step];
    if (e.swap) st.chips = st.chips.map((c) => (c[0] === e.swap[0] ? e.swap : c));
    if (e.add) st.chips.push(e.add);
    if (e.also) st.chips.push(e.also);
    S.log.unshift({ text: e.log, fresh: true });
    S.hot = e.step;
    S.newChip = (e.swap || e.add)[1];
  }

  /* ---------------- drawing ---------------- */
  const LINE = {
    dim: (t) => esc(t),
    cmd: (t) => `<span class="tl-p">&gt;</span> ${esc(t)}`,
    work: (t) => `◇ ${esc(t)}`,
    ok: (t) => esc(t),
    link: (t) => esc(t),
  };
  const CLS = { dim: 'tl-dim', cmd: 'tl-cmd', work: 'tl-head', ok: 'tl-ok', link: 'tl-link' };
  function term() {
    const body = S.lines.map((l) => `<div class="tl ${CLS[l.k]}${l.fresh ? ' is-new' : ''}">${LINE[l.k](l.t)}</div>`).join('');
    return `
      <div class="term mg-term">
        <div class="term-bar">
          <span class="term-dots" aria-hidden="true"><i></i><i></i><i></i></span>
          <div class="term-tabs"><button type="button" aria-selected="true" tabindex="-1">Claude Code</button></div>
          <button type="button" class="term-replay" id="mgReplay" aria-label="Replay">${REPLAY}</button>
        </div>
        <div class="term-body" aria-live="polite">${body}<div class="tl tl-cmd mg-in"><span class="tl-p">&gt;</span> <span class="mg-typed">${esc(S.typing)}</span><span class="tl-cur"></span></div></div>
      </div>`;
  }
  function chip([k, text]) {
    const icon = k === 'ai' ? SPARK : k === 'code' ? CODE : '';
    return `<li class="mg-chip mg-chip-${k}${text === S.newChip ? ' is-new' : ''}">${icon}<span>${esc(text)}</span></li>`;
  }
  function web() {
    const sync = S.sync === 'busy'
      ? '<span class="mg-sync is-busy"><i></i>Syncing from Claude Code…</span>'
      : S.log.length ? '<span class="mg-sync is-done"><i></i>Updated from Claude Code</span>' : '<span class="mg-sync"><i></i>Up to date</span>';
    const steps = S.steps.map((st, i) => `
      <li class="mg-step${i === S.hot ? ' is-hot' : ''}">
        <span class="mg-num">${i + 1}</span>
        <span class="mg-nt"><b>${st.n}</b></span>
        <ul class="mg-chips">${st.chips.map(chip).join('')}</ul>
      </li>`).join('');
    const log = S.log.length
      ? S.log.map((x, i) => `<li${x.fresh ? ' class="is-new"' : ''}><span>${esc(x.text)}</span><small>Claude Code · ${i === 0 ? 'just now' : i === 1 ? '1 min ago' : `${i} min ago`}</small></li>`).join('')
      : '<li class="mg-log-empty"><span>No changes yet</span></li>';
    return `
      <div class="mg-web">
        <div class="ct-ws"><span class="ct-ws-logo" aria-hidden="true">A</span><b>Your agency</b>${sync}</div>
        <div class="mg-panel">
          <header class="mg-bar"><span>App settings</span></header>
          <div class="mg-body">
            <nav class="mg-rail" aria-hidden="true">${RAIL.map(([l, ic, on]) => `<span class="mg-tab${on ? ' on' : ''}">${ic}${l}</span>`).join('')}</nav>
            <div class="mg-main">
              <div class="ct-page-hd"><h3>Workflows</h3><p>Campaign email: four steps, the AI on each and the data it reads.</p></div>
              <ol class="mg-steps">${steps}</ol>
              <section class="mg-log"><b>Activity</b><ul>${log}</ul></section>
            </div>
          </div>
        </div>
      </div>`;
  }
  function render() {
    demo.innerHTML = `<div class="mg-stage">${web()}${term()}</div>`;
    const body = demo.querySelector('.term-body');
    if (body) body.scrollTop = body.scrollHeight;
    // Entrance animations play once, on the render that adds the line.
    S.lines.forEach((l) => { l.fresh = false; });
    S.log.forEach((x) => { x.fresh = false; });
  }
  // Typing only touches the prompt, so nothing else re-animates.
  function type(text) {
    S.typing = text;
    const el = demo.querySelector('.mg-typed');
    if (el) el.textContent = text;
  }

  /* ---------------- playing ---------------- */
  const SYNCED = '→ Synced to EAI: Campaign email · Nike';
  function finish() {
    reset();
    EDITS.forEach((e) => {
      S.lines.push({ k: 'cmd', t: e.ask });
      e.work.forEach((w) => S.lines.push({ k: 'work', t: w }));
      S.lines.push({ k: 'link', t: SYNCED });
      apply(e);
    });
    S.hot = -1; S.newChip = null;
    S.log.forEach((x) => { x.fresh = false; });
  }
  function play() {
    stop();
    reset();
    if (REDUCED) { finish(); render(); return; }
    playing = true;
    render();
    let t = 700;
    EDITS.forEach((e) => {
      for (let i = 1; i <= e.ask.length; i++) later(() => type(e.ask.slice(0, i)), t += 32);
      later(() => { S.typing = ''; push('cmd', e.ask); render(); }, t += 300);
      e.work.forEach((w) => later(() => { push('work', w); render(); }, t += 550));
      later(() => { S.sync = 'busy'; render(); }, t += 450);
      later(() => { S.sync = 'idle'; push('link', SYNCED); apply(e); render(); }, t += 700);
      later(() => { S.hot = -1; S.newChip = null; render(); }, t += 1800);
    });
    later(() => { playing = false; }, t);
  }

  demo.addEventListener('click', (e) => {
    if (e.target.closest('#mgReplay')) { play(); return; }
    if (playing) { stop(); finish(); render(); }
  });

  reset();
  render();
  new IntersectionObserver((es) => {
    if (played || !es.some((x) => x.isIntersecting)) return;
    played = true;
    play();
  }, { threshold: 0.4 }).observe(demo);
})();
