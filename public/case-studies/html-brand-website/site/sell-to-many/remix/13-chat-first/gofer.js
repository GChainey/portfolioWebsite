/* Remix 13 — Gofer: "We don't just build the process. We make it better."

   One chat, one idea. You paste in how a job gets done today (a long,
   messy list across email, spreadsheets and phone calls); Gofer replies
   with the same job as a four-step app, in the client's brand, says what
   it cut, and offers to build it.

   Plays once when it scrolls into view. The "Try it with" picks replay it
   with another workflow; the round arrow replays the current one.
   Reduced motion: the finished conversation, no typing. */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const section = $('gofer');
  if (!section) return;
  const A = window.EAIApp;
  const { esc } = A;
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* old: [what happens, tool, the new step it lands in (0-3) or -1 if cut] */
  const FLOWS = [
    {
      pick: 'Campaign email · Nike', brand: () => A.BRANDS.nike, tpl: 'campaign',
      ask: 'Here’s how we get a campaign email out for Nike today:',
      old: [
        ['Marketing emails the brief to the agency', 'Email', 0],
        ['Agency replies with questions', 'Email', 0],
        ['Brief rewritten into a Word template', 'Word', -1],
        ['Designer hunts for the brand guide and shots', 'Drive', 1],
        ['Asks on Teams for the latest product shots', 'Teams', 1],
        ['Copywriter drafts three subject lines', 'Word', 2],
        ['Draft pasted into the tracking sheet', 'Sheets', -1],
        ['Brand team reviews the copy', 'Email', 3],
        ['Legal reviews it, separately', 'Email', 3],
        ['Changes go back and forth, three rounds', 'Email', -1],
        ['Final sign-off chased by phone', 'Phone', 3],
        ['Copy keyed into the email platform', 'Sheets', -1],
      ],
      took: '9 days', takes: '2 days',
      why: ['The brief is one form, so nobody re-types it.', 'AI drafts the copy in Nike’s voice.', 'Brand and Legal approve together, in one step.'],
    },
    {
      pick: 'Client onboarding · CommBank', brand: () => A.BRANDS.commbank, tpl: 'onboarding',
      ask: 'This is how we onboard a new business customer at CommBank:',
      old: [
        ['Banker emails a PDF application form', 'Email', 0],
        ['Customer prints, signs and scans it back', 'Email', 0],
        ['Ops re-keys it into the core system', 'Sheets', -1],
        ['Chase missing ID and company documents', 'Email', 1],
        ['Documents saved to the shared drive', 'Drive', 1],
        ['Compliance checks ID against a list', 'Word', 2],
        ['KYC checklist filled in by hand', 'Word', 2],
        ['Manager approves the account', 'Email', 3],
        ['Second sign-off for higher-risk customers', 'Email', 3],
        ['Welcome letter posted', 'Word', -1],
      ],
      took: '3 weeks', takes: '3 days',
      why: ['They fill in and sign the form in the app. No printing, no re-keying.', 'The AI checklist checks ID and flags what’s missing.', 'One approval step, with a second approver when the risk is high.'],
    },
    {
      pick: 'Insurance claim', brand: () => A.guessBrand('Harbour Insurance'), tpl: 'claims',
      ask: 'Our claims process at Harbour Insurance, start to finish:',
      old: [
        ['Customer phones to report the claim', 'Phone', 0],
        ['Call notes retyped into an email', 'Email', 0],
        ['Claim form emailed to fill in again', 'Email', -1],
        ['Customer emails photos and receipts', 'Email', 1],
        ['Assessor saves them to the shared drive', 'Drive', -1],
        ['Assessor reads the policy to check cover', 'PDF', 2],
        ['Assessment written up in Word', 'Word', 2],
        ['Team leader approves claims over $5k', 'Email', 3],
        ['Customer phoned with the outcome', 'Phone', 3],
        ['Claim logged in the tracking sheet', 'Sheets', -1],
        ['Payment keyed into finance by hand', 'Sheets', 3],
      ],
      took: '12 days', takes: '3 days',
      why: ['The customer tells you once, in the app.', 'The AI assessor checks cover and drafts the write-up.', 'Approving the claim tells the customer and pays it.'],
    },
  ];

  const thread = $('gfThread');
  const draft = $('gfDraft');
  const picks = $('gfPicks');
  const DRAFT = draft.textContent;
  let cur = 0;
  let run = 0; // bumps on every (re)play so an older run stops quietly

  picks.innerHTML = FLOWS.map((f, i) => `<button type="button" data-i="${i}" aria-pressed="${i === 0}">${esc(f.pick)}</button>`).join('');

  const scroll = () => { thread.scrollTop = thread.scrollHeight; };
  function add(cls, html) {
    const el = document.createElement('div');
    el.className = `gm ${cls}`;
    el.innerHTML = html;
    thread.appendChild(el);
    scroll();
    return el;
  }
  const you = (f) => add('gm-you', `<div class="gm-bubble"><p>${esc(f.ask)}</p><ol class="gm-old">${f.old.map(([t, tool]) => `<li><span>${esc(t)}</span><i>${esc(tool)}</i></li>`).join('')}</ol></div>`);
  const gofer = (html) => add('gm-gofer', `<span class="gf-mark" aria-hidden="true">G</span><div class="gm-body">${html}</div>`);

  function appCard(f) {
    const br = f.brand();
    const t = A.TEMPLATES[f.tpl];
    const steps = t.steps.map(([name, kind], s) => {
      const n = f.old.filter((o) => o[2] === s).length;
      return `<li><span class="gs-n">${s + 1}</span><b>${esc(name)}</b><small>${esc(kind)}</small><em>replaces ${n}</em></li>`;
    }).join('');
    return `<div class="gm-app" style="--gb:${br.head};--gb-on:${br.headOn};--gb-step:${br.b};--gb-step-on:${br.on}">
      <div class="gm-app-hd">${A.logoHTML(br)}<b>${esc(br.name)}</b><span>${esc(t.name)} · 4 steps</span></div>
      <ol class="gm-steps">${steps}</ol>
    </div>`;
  }
  function summary(f) {
    const tools = new Set(f.old.map((o) => o[1])).size;
    const cut = f.old.filter((o) => o[2] < 0).length;
    return {
      lead: `That’s ${f.old.length} steps across ${tools} tools, and ${cut} of them are re-typing or chasing. Here’s the same job in four:`,
      stats: [[f.old.length, 4, 'steps'], [tools, 1, tools === 1 ? 'tool' : 'app'], [f.took, f.takes, '']],
    };
  }
  const statsHTML = (st) => `<div class="gm-stats">${st.map(([a, b, k]) => `<span><s>${esc(a)}</s> → <b>${esc(b)}</b> ${esc(k)}</span>`).join('')}</div>`;
  const whyHTML = (f) => `<ul class="gm-why">${f.why.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>`;
  const actsHTML = () => `<div class="gm-acts"><button type="button" class="gm-build" data-build>Build it</button><span>Same four steps, ready for the builder.</span></div>`;

  function finish(f) {
    thread.innerHTML = '';
    you(f);
    const s = summary(f);
    gofer(`<p>${esc(s.lead)}</p>${appCard(f)}${statsHTML(s.stats)}${whyHTML(f)}${actsHTML()}`);
    thread.querySelectorAll('.gm-steps li').forEach((li) => li.classList.add('in'));
    thread.scrollTop = 0;
  }

  async function play(i, { instant } = {}) {
    const my = ++run;
    const alive = () => my === run;
    cur = i;
    const f = FLOWS[i];
    [...picks.children].forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
    if (instant || REDUCED) { finish(f); return; }

    thread.innerHTML = '';
    // "paste" the old process into the composer, then send it
    draft.classList.add('typing');
    draft.textContent = f.ask;
    await sleep(700);
    if (!alive()) return;
    draft.classList.remove('typing');
    draft.textContent = DRAFT;
    const msg = you(f);
    msg.classList.add('pop');
    await sleep(1100);
    if (!alive()) return;

    const dots = gofer('<span class="gm-dots"><i></i><i></i><i></i></span>');
    await sleep(1200);
    if (!alive()) return;
    const s = summary(f);
    const body = dots.querySelector('.gm-body');
    body.innerHTML = `<p>${esc(s.lead)}</p>${appCard(f)}`;
    scroll();
    for (const li of body.querySelectorAll('.gm-steps li')) {
      await sleep(380);
      if (!alive()) return;
      li.classList.add('in');
      scroll();
    }
    await sleep(500);
    if (!alive()) return;
    body.insertAdjacentHTML('beforeend', statsHTML(s.stats) + whyHTML(f));
    scroll();
    await sleep(700);
    if (!alive()) return;
    body.insertAdjacentHTML('beforeend', actsHTML());
    scroll();
  }

  picks.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-i]');
    if (b) play(+b.dataset.i);
  });
  $('gfReplay').addEventListener('click', () => play(cur));

  /* "Build it": hand the four steps to the builder chat at the top */
  thread.addEventListener('click', (e) => {
    if (!e.target.closest('[data-build]')) return;
    const f = FLOWS[cur];
    const chat = $('chat');
    const input = $('hxInput');
    if (!chat || chat.hidden || !input) { document.querySelector('[data-action="start"]')?.click(); return; }
    chat.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
    input.value = `A ${A.TEMPLATES[f.tpl].name.toLowerCase()} app for ${f.brand().name}`;
    setTimeout(() => input.focus(), REDUCED ? 0 : 500);
  });

  // The finished conversation is there up front, so it reads without the
  // animation; it replays from the start the first time it's in view.
  play(0, { instant: true });
  if (!REDUCED) {
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { io.disconnect(); play(cur); }
    }, { threshold: 0.4 });
    io.observe($('gfChat'));
  }
})();
