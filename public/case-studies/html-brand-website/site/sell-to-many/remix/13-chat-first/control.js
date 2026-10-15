/* Remix 23 — Control: "Don't get lost in the vibes."

   A small stand-in for EAI Curate and Workflows: the web app that shows what
   the AI built. Three views (Workflows, Data, Clients) and a client switcher,
   so one build is seen serving two clients, each with their own data.

   The example is the app from the builder above: Campaign email, four steps,
   for Nike and Qantas. The three stores (Tables, Records, Files) and the AI
   features on each step follow the Curate and Workflows prototypes.
   Only shown by ?layout=mvp2 (arrange.js). Plays once when it scrolls into
   view: the map draws in, then the second client is switched to. Any click
   takes over. Reduced motion: no animation, nothing switches by itself.

   V3 (?layout=mvp3, data-v="3"): Overview opens too, drawn like the
   signed-in workspace's App settings, and the bar drops the app name and the
   page title (simpler than the product, on purpose). Submissions is off the
   rail: it's a table in EAI Curate now (the view is kept, unlinked). */
(function () {
  'use strict';

  const sec = document.getElementById('control');
  const app = document.getElementById('ctApp');
  if (!sec || !app) return;
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const V3 = document.documentElement.dataset.v === '3';
  const poss = (n) => n + (/s$/i.test(n) ? '’' : '’s');
  const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const TENANTS = {
    nike: {
      name: 'Nike', color: '#E8622A', region: 'Sydney', users: '1,240', status: 'Live',
      tables: ['Product catalogue.xlsx', 'Run Club members.csv'],
      records: ['Past campaigns', 'Approvals log'],
      files: ['nike-brand-guide.pdf', 'tone-of-voice.docx', 'pegasus-41-shots.zip'],
      counts: { tables: 12, records: '2,430', files: 38 },
      url: 'campaign.nike.app', access: 'Anyone at Nike', submissions: '1,284',
      subs: [
        ['NKE-1284', 'Ava Thompson', 'ava.thompson@nike.com', '30 Sep, 09:12', 'progress', 3],
        ['NKE-1283', 'Marcus Bell', 'marcus.bell@nike.com', '30 Sep, 08:40', 'done', 4],
        ['NKE-1282', 'Priya Nair', 'priya.nair@nike.com', '29 Sep, 16:05', 'done', 4],
        ['NKE-1281', 'Leo Martin', 'leo.martin@nike.com', '29 Sep, 11:47', 'progress', 2],
        ['NKE-1280', 'Hana Sato', 'hana.sato@nike.com', '28 Sep, 15:20', 'stopped', 1],
        ['NKE-1279', 'Sam Okoro', 'sam.okoro@nike.com', '28 Sep, 10:02', 'done', 4],
      ],
    },
    qantas: {
      name: 'Qantas', color: '#E40000', region: 'Sydney', users: '860', status: 'Live',
      tables: ['Route schedule.xlsx', 'Frequent Flyer segments.csv'],
      records: ['Past campaigns', 'Approvals log'],
      files: ['qantas-brand-guide.pdf', 'tone-of-voice.docx', 'sydney-dallas-shots.zip'],
      counts: { tables: 9, records: '1,915', files: 27 },
      url: 'campaign.qantas.app', access: 'Anyone at Qantas', submissions: '962',
      subs: [
        ['QF-962', 'Olivia Hart', 'olivia.hart@qantas.com.au', '30 Sep, 10:31', 'done', 4],
        ['QF-961', 'Daniel Wu', 'daniel.wu@qantas.com.au', '30 Sep, 07:55', 'progress', 4],
        ['QF-960', 'Grace Kelly', 'grace.kelly@qantas.com.au', '29 Sep, 14:18', 'done', 4],
        ['QF-959', 'Tom Reid', 'tom.reid@qantas.com.au', '29 Sep, 09:36', 'stopped', 2],
        ['QF-958', 'Mia Rossi', 'mia.rossi@qantas.com.au', '28 Sep, 17:44', 'progress', 3],
        ['QF-957', 'Ethan Brooks', 'ethan.brooks@qantas.com.au', '28 Sep, 12:09', 'done', 4],
      ],
    },
  };
  const ORDER = ['nike', 'qantas'];

  /* Each step: what it is, the AI feature on it, and the data it reads or writes
     ([store, index into that store's list]). `why` is the line under the map. */
  const STEPS = [
    { n: 'Brief', kind: 'Form', ai: 'Document Checklist', links: [['tables', 1]],
      why: (t) => `<b>Brief.</b> A checklist makes sure nothing is missing before it starts, and the audience comes from <b>${esc(t.tables[1])}</b>.` },
    { n: 'Assets', kind: 'Data source', ai: 'AI Chatbot', links: [['files', 0], ['files', 2]],
      why: (t) => `<b>Assets.</b> The team asks the assistant and it answers from <b>${esc(t.files[0])}</b>, with the page it found it on.` },
    { n: 'Compose', kind: 'AI writer', ai: 'Document Creation', links: [['files', 1], ['records', 0]],
      why: (t) => `<b>Compose.</b> AI drafts the copy in ${esc(poss(t.name))} voice from <b>${esc(t.files[1])}</b> and their <b>${esc(t.records[0].toLowerCase())}</b>.` },
    { n: 'Review', kind: 'Approval', ai: 'Document Validation', links: [['records', 1]],
      why: (t) => `<b>Review.</b> Each draft is checked against the rules before it reaches an approver, and every decision lands in the <b>${esc(t.records[1].toLowerCase())}</b>.` },
  ];
  const STORES = [
    ['tables', 'T', 'Tables', 'spreadsheets and CSVs'],
    ['records', 'R', 'Records', 'JSON and form data'],
    ['files', 'F', 'Files', 'PDFs, Word, images'],
  ];
  const VIEWS = [['workflows', 'Workflows'], ['data', 'Data'], ['clients', 'Clients']];

  const S = { view: 'workflows', tenant: 'nike', step: 2 };
  let played = false;
  let auto = false;
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const stopAuto = () => { auto = false; timers.forEach(clearTimeout); timers = []; };

  const chip = (store, text, step) => {
    const letter = STORES.find((x) => x[0] === store)[1];
    return `<li class="ct-chip" data-store="${store}" data-for="${step}"><i aria-hidden="true">${letter}</i><span>${esc(text)}</span></li>`;
  };

  function workflows(t) {
    const steps = STEPS.map((st, i) => `
      <li class="ct-step${i === S.step ? ' on' : ''}" data-step="${i}">
        <button type="button" class="ct-node" data-node="${i}" aria-pressed="${i === S.step}">
          <span class="ct-num">${i + 1}</span><span class="ct-nt"><b>${st.n}</b>${V3 ? '' : `<small>${st.kind}</small>`}</span>
        </button>
        <span class="ct-ai">${ICON.spark}${st.ai}</span>
        <ul class="ct-data" aria-label="Data used by ${st.n}">${st.links.map(([s, k]) => chip(s, t[s][k], i)).join('')}</ul>
      </li>`).join('');
    return `
      <section class="ct-card">
        <div class="ct-card-hd"><b>Campaign email</b><span class="ct-live">Live</span></div>
        <ol class="ct-steps" data-sel="${S.step}">${steps}</ol>
      </section>
      <p class="ct-detail" aria-live="polite">${STEPS[S.step].why(t)}</p>`;
  }

  function data(t) {
    // V3: submissions are a table in Curate, not their own page.
    const list = (k) => (V3 && k === 'tables' ? ['Submissions', ...t.tables] : t[k]);
    const cols = STORES.map(([k, letter, name, types]) => `
      <section class="ct-store">
        <header><i aria-hidden="true">${letter}</i><div><b>${name}</b><small>${types}</small></div><span>${t.counts[k]}</span></header>
        <ul>${list(k).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      </section>`).join('');
    return `
      <div class="ct-stores">${cols}</div>
      <p class="ct-layer">${ICON.spark}One search layer over all three. The AI on each step reads from here.</p>`;
  }

  function clients() {
    const rows = ORDER.map((k) => {
      const t = TENANTS[k];
      return `<li class="ct-client${k === S.tenant ? ' on' : ''}"><button type="button" data-tenant="${k}">
        <i class="ct-dot" style="background:${t.color}"></i><b>${t.name}</b>
        <span>${t.users} people</span><span>${t.counts.files} files</span><span>${t.counts.records} records</span><span class="ct-live">${t.status}</span>
      </button></li>`;
    }).join('');
    return `
      <section class="ct-card ct-card-list">
        <ul class="ct-clients">${rows}<li class="ct-client ct-add"><span>+ Add a client</span></li></ul>
      </section>
      <p class="ct-layer">${ICON.spark}Same four steps for everyone. Their own data, users and brand. Change the workflow once and every client gets it.</p>`;
  }

  /* V3: Overview, like the signed-in workspace's (Build more with EAI, three
     stats, who can access, share), for the client that's switched on. */
  function overview(t) {
    return `
      <section class="ct-card ct-sect">
        <b class="ct-sect-t">Build more with EAI</b>
        <p>Connect your preferred AI coding tool to EAI to add custom logic, integrations and advanced features. Keep managing your app, access and deployment here.</p>
        <div class="ct-row"><span>${ICON.term}Claude Code</span><span class="ct-live">Connected</span></div>
      </section>
      <div class="ct-card ct-stats">
        <div><small>Edited in</small><b>Claude Code</b></div>
        <div><small>Status</small><b>${t.status}</b></div>
        <div><small>Submissions</small><b>${t.submissions}</b></div>
      </div>
      <div class="ct-pair">
        <section class="ct-card ct-sect">
          <b class="ct-sect-t">Who can access</b>
          <p>Control who can open and use this app.</p>
          <div class="ct-row"><span>App access</span><span class="ct-select">${esc(t.access)}${ICON.down}</span></div>
        </section>
        <section class="ct-card ct-sect">
          <b class="ct-sect-t">Share this app</b>
          <p>Send a link to people who should use it.</p>
          <div class="ct-row"><code>${esc(t.url)}</code><span class="ct-btn">Copy link</span></div>
        </section>
      </div>`;
  }

  /* V3: Submissions, like the signed-in workspace's table. "Reached" is the
     step each one got to. */
  const STATUS = { done: ['Completed', 'ok'], progress: ['In progress', 'warn'], stopped: ['Abandoned', 'bad'] };
  function submissions(t) {
    const rows = t.subs.map(([ref, who, mail, at, st, step]) => `
      <tr><td class="ct-ref">${ref}</td><td><b>${esc(who)}</b><small>${esc(mail)}</small></td><td>${at}</td>
        <td><span class="ct-pill ct-pill-${STATUS[st][1]}">${STATUS[st][0]}</span></td><td>${STEPS[step - 1].n}</td></tr>`).join('');
    return `
      <section class="ct-card ct-card-list ct-subs">
        <div class="ct-filters"><span class="ct-input">${ICON.search}Search by reference or person…</span><span class="ct-btn">All statuses${ICON.down}</span><span class="ct-btn">Last 30 days${ICON.down}</span></div>
        <table class="ct-table">
          <thead><tr><th>Reference</th><th>Person</th><th>Started</th><th>Status</th><th>Reached</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p class="ct-foot">Showing ${t.subs.length} of ${t.submissions} submissions</p>
      </section>`;
  }

  // Icons in the product's line style (16px, 1.5 stroke).
  const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const ICON = {
    home: svg('<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>'),
    flow: svg('<rect x="3" y="4" width="7" height="6" rx="1.5"/><rect x="14" y="14" width="7" height="6" rx="1.5"/><path d="M6.5 10v4a3 3 0 0 0 3 3H14"/>'),
    file: svg('<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/>'),
    db: svg('<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>'),
    users: svg('<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .8 3 2.8 3 6"/>'),
    search: svg('<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>'),
    spark: svg('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'),
    term: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M12 15h5"/>'),
    down: svg('<path d="M6 9l6 6 6-6"/>'),
  };
  // The app-settings rail: the three views are live, the rest are there so it reads as the product.
  const RAIL = V3
    ? [['home', 'Overview', 'overview'], ['flow', 'Workflows', 'workflows'], ['db', 'EAI Curate', 'data'], ['users', 'Clients', 'clients']]
    : [['home', 'Overview'], ['flow', 'Workflows', 'workflows'], ['file', 'Submissions'], ['db', 'EAI Curate', 'data'], ['users', 'Clients', 'clients']];
  const HEAD = {
    overview: ['Overview', (t) => `How Campaign email is running for ${esc(t.name)}.`],
    workflows: ['Workflows', 'The steps in Campaign email, the AI on each one and the data it reads.'],
    submissions: ['Submissions', (t) => `Every brief from ${esc(t.name)}, and how far it got.`],
    data: ['EAI Curate', null],
    clients: ['Clients', 'Every client on this build, each in their own space.'],
  };

  function render(kind) {
    const t = TENANTS[S.tenant];
    const body = { overview, workflows, submissions, data, clients }[S.view](t);
    const [title, lead] = HEAD[S.view];
    const sub = (typeof lead === 'function' ? lead(t) : lead) || `${esc(poss(t.name))} tables, records and files. Only ${esc(t.name)} sees them.`;
    app.innerHTML = `
      <div class="ct-ws"><span class="ct-ws-logo" aria-hidden="true">A</span><b>Your agency</b><span class="ct-ws-av" aria-hidden="true">YA</span></div>
      <div class="ct-panel">
        <header class="ct-bar">
          ${V3 ? '<span class="ct-crumb">App settings</span>' : `<span class="ct-crumb">App settings · <b>Campaign email</b></span>
          <b class="ct-bar-title">${title}</b>`}
          <div class="ct-tenants" role="group" aria-label="Client">
            ${ORDER.map((k) => `<button type="button" class="ct-tenant" data-tenant="${k}" aria-pressed="${k === S.tenant}"><i style="background:${TENANTS[k].color}"></i>${TENANTS[k].name}</button>`).join('')}
          </div>
        </header>
        <div class="ct-body">
          <nav class="ct-rail" aria-label="App settings">
            <span class="ct-search">${ICON.search}Search…</span>
            ${RAIL.map(([ic, l, v]) => v
              ? `<button type="button" class="ct-tab" data-view="${v}" aria-current="${v === S.view ? 'page' : 'false'}">${ICON[ic]}${l}</button>`
              : `<span class="ct-tab ct-tab-off">${ICON[ic]}${l}</span>`).join('')}
          </nav>
          <div class="ct-main">
            <div class="ct-col ct-view ${kind || ''}">
              <div class="ct-page-hd"><h3>${title}</h3><p>${sub}</p></div>
              ${body}
            </div>
          </div>
        </div>
      </div>`;
  }

  app.addEventListener('click', (e) => {
    const t = e.target;
    const tab = t.closest('[data-view]');
    const ten = t.closest('[data-tenant]');
    const node = t.closest('[data-node]');
    if (!tab && !ten && !node) return;
    stopAuto();
    if (tab) { S.view = tab.dataset.view; render('ct-enter'); }
    else if (ten) { S.tenant = ten.dataset.tenant; render('ct-swap'); }
    else { S.step = Number(node.dataset.node); render(''); }
  });

  // First time it is well in view: draw the map, then show it serving the second client.
  function play() {
    if (played) return;
    played = true;
    S.view = 'workflows'; S.tenant = 'nike'; S.step = 0;
    render('ct-enter');
    if (REDUCED) { S.step = 2; render(''); return; }
    auto = true;
    later(() => { if (auto) { S.step = 1; render(''); } }, 1600);
    later(() => { if (auto) { S.step = 2; render(''); } }, 3000);
    later(() => { if (auto) { S.tenant = 'qantas'; render('ct-swap'); } }, 4800);
  }

  render('');
  new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) play(); }, { threshold: 0.5 }).observe(app);
})();
