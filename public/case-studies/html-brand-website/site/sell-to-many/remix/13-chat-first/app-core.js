/* Remix 13 — the client's app, shared by the marketing page (index.html)
   and the phone view (phone.html).

   Four templates, each exactly four steps. A brand (from ../../app-view.js,
   a live lookup, or a best guess from the name) is painted onto whichever
   template was built. compose.js adds to them: it reads any prompt and puts
   together a four-step app for it from the same pieces (the `ui` helpers
   below), so a typed prompt isn't limited to these four. The app carries its own in-app assistant, in the
   client's brand, for the client's staff. It never edits the app — that is
   the builder chat's job, on the marketing page. */
(function () {
  'use strict';

  const STM = window.STM;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const poss = (name) => name + (/s$/i.test(name) ? '’' : '’s');
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // The CommBank logo path in app-view.js is relative to sell-to-many/.
  if (STM && STM.BRANDS.commbank) STM.BRANDS.commbank.logo = '<img src="../../logos/commbank.svg" alt="" class="img-mark" />';

  // Two more hand-checked clients for the re-skin chips, so the most-clicked
  // options never depend on the live lookup. (Logo images come from their
  // site icon; if that fails the app falls back to a monogram.)
  const siteIcon = (d) => `<span class="chip"><img src="https://icon.horse/icon/${d}" alt="" referrerpolicy="no-referrer" /></span>`;
  if (STM && !STM.BRANDS.qantas) {
    STM.BRANDS.qantas = {
      name: 'Qantas', domain: 'qantas.com', logo: siteIcon('qantas.com'),
      head: '#E40000', headOn: '#FFFFFF', b: '#E40000', on: '#FFFFFF',
      surface: '#FBF6F6', border: '#F0DCDC', accent: '#E40000',
      font: 'system-ui, -apple-system, sans-serif',
      swatches: ['#E40000', '#8C0000', '#FFFFFF', '#FBF6F6'],
      tone: 'Warm, proud, Australian',
      goal: 'Launch the new Sydney–Dallas route…', audience: 'Frequent Flyer members', date: '6 October',
    };
    STM.BRANDS.canva = {
      name: 'Canva', domain: 'canva.com', logo: siteIcon('canva.com'),
      head: '#7D2AE8', headOn: '#FFFFFF', b: '#7D2AE8', on: '#FFFFFF',
      surface: '#F8F5FE', border: '#E6DBFA', accent: '#7D2AE8',
      font: 'system-ui, -apple-system, sans-serif',
      swatches: ['#7D2AE8', '#00C4CC', '#FFFFFF', '#F8F5FE'],
      tone: 'Playful, empowering, simple',
      goal: 'Introduce Canva Docs to every team…', audience: 'Canva Teams customers', date: '14 October',
    };
  }

  /* ================================================================
     Brands
     ================================================================ */
  const BRANDS = STM.BRANDS;
  const brandKey = (br) => Object.keys(BRANDS).find((k) => BRANDS[k] === br) || null;
  const VOICE = {
    nike: { hello: 'Let’s get moving.', short: 'Pegasus 41. Lighter. Faster. Yours first.' },
    apple: { hello: 'We’re glad you’re here.', short: 'The new iPhone. Our best camera yet.' },
    commbank: { hello: 'We’re here to help, every step of the way.', short: 'Yello rewards are here. See your offers in the app.' },
  };
  // A brand can carry its own voice, copy and subjects (the sizzle reel's do).
  const voiceOf = (br) => br.voice || VOICE[brandKey(br)] || { hello: 'We’re glad to have you.', short: `${br.name}: what’s new this month, picked for you.` };

  /* A client with no name or logo: "Client B", a letter chip and the brand's
     own colours (as the sizzle reel's clients are). The home page shows its
     clients this way, so the demo never borrows a real company's name. A, B
     and C have their own neutral copy; any other letter gets the general one. */
  const UNNAMED = {
    A: { tone: 'Direct, upbeat, energetic', goal: 'Launch the spring range…', audience: 'Loyalty members', date: '3 October',
      copy: { files: ['brand-guide.pdf', 'tone-of-voice.docx', 'spring-range-shots.zip'], body: 'The spring range is here. Loyalty members get first access this week.', cta: 'Shop now' },
      subjects: ['The spring range is here', 'Members get first access', 'New this week, yours first'],
      voice: { hello: 'Let’s get moving.', short: 'The spring range. Here now. Yours first.' } },
    B: { tone: 'Warm, proud, welcoming', goal: 'Announce the summer sale…', audience: 'Newsletter subscribers', date: '6 October',
      copy: { files: ['brand-guide.pdf', 'tone-of-voice.docx', 'summer-sale-shots.zip'], body: 'The summer sale starts 6 October. Subscribers get first access this week.', cta: 'See the sale' },
      subjects: ['The summer sale starts 6 October', 'Subscribers get in first', 'Your early access is waiting'],
      voice: { hello: 'We’re glad you’re here.', short: 'Summer sale, 6 October. You’re in first.' } },
    C: { tone: 'Clear, helpful, reassuring', goal: 'Launch member rewards…', audience: 'App customers', date: '16 October',
      copy: { files: ['brand-guide.pdf', 'rewards-offers.xlsx', 'app-screens.zip'], body: 'Rewards are here. See your offers in the app — no sign-up needed.', cta: 'See my offers' },
      subjects: ['Your rewards are here', 'More value, every day', 'Unlock your offers in the app'],
      voice: { hello: 'We’re here to help, every step of the way.', short: 'Rewards are here. See your offers in the app.' } },
  };
  function unnamed(br, k) {
    return Object.assign({}, br, {
      name: 'Client ' + k, domain: `client-${k.toLowerCase()}.example`, logo: `<span class="mono">${k}</span>`, logoClass: '',
      unnamed: k, of: brandKey(br),
      tone: 'Clear, friendly, helpful', goal: 'Announce what’s new this month…', audience: 'Newsletter subscribers', date: '28 October',
      copy: { files: ['brand-guide.pdf', 'tone-of-voice.docx', 'product-shots.zip'], body: 'Here’s what’s new this month, picked for you.', cta: 'Find out more' },
      subjects: ['Here’s what’s new', 'Made for you', 'Don’t miss this'],
      voice: { hello: 'We’re glad to have you.', short: 'What’s new this month, picked for you.' },
    }, UNNAMED[k]);
  }

  // Offline fallback: a believable brand from a hash of the name (as sell.js).
  const FONTS = ['system-ui, -apple-system, sans-serif', 'Georgia, serif', '"Helvetica Neue", Arial, sans-serif'];
  function guessBrand(raw) {
    const name = raw.trim().replace(/\s+/g, ' ');
    const key = name.toLowerCase();
    let h = 0;
    for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const hue = h % 360;
    const hsl = (s, l) => {
      // hsl -> hex so every colour helper downstream can read it
      const a = s * Math.min(l, 1 - l);
      const f = (n) => { const k = (n + hue / 30) % 12; const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(c * 255).toString(16).padStart(2, '0'); };
      return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
    };
    const b = hsl(0.62, 0.42);
    return {
      name, domain: key.replace(/[^a-z0-9]/g, '') + '.com', guessed: true,
      head: b, headOn: '#FFFFFF', b, on: '#FFFFFF', accent: b,
      surface: hsl(0.3, 0.965), border: hsl(0.22, 0.87),
      font: FONTS[h % FONTS.length],
      swatches: [b, hsl(0.3, 0.965), hsl(0.25, 0.14)],
      tone: 'Best guess — couldn’t reach their site',
      goal: `Announce what’s new at ${name}…`, audience: `${name} customers`, date: '28 October',
    };
  }

  // Live lookup, same approach as sell.js: Clearbit (name -> domain), then
  // Microlink (logo + palette), icon.horse as the quick fallback.
  function withTimeout(ms) { const c = new AbortController(); setTimeout(() => c.abort(), ms); return c.signal; }
  async function findDomain(name) {
    if (/\.[a-z]{2,}$/i.test(name)) return { name, domain: name.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '') };
    try {
      const r = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(name)}`, { signal: withTimeout(4000) });
      const list = await r.json();
      if (list[0] && list[0].domain) return { name: list[0].name, domain: list[0].domain };
    } catch (e) { /* fall through */ }
    return { name, domain: name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com' };
  }
  async function viaMicrolink(found) {
    const url = `https://api.microlink.io/?url=${encodeURIComponent('https://' + found.domain)}&palette=true&prerender=false`;
    const json = await fetch(url, { signal: withTimeout(9000) }).then((r) => r.json());
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
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* Never rejects and never hangs: hand-checked brand, else the live read
     (up to ~8s), else a best guess from the name. */
  async function resolveBrand(raw, onStep = () => {}) {
    const hit = STM.curated(raw);
    if (hit) return hit;
    const name = raw.trim().replace(/\s+/g, ' ');
    const attempt = (async () => {
      const found = await findDomain(name);
      onStep('found', found.domain);
      const full = viaMicrolink(found).catch(() => null);
      const icon = viaIcon(found).catch(() => null);
      let b = await Promise.race([full, sleep(5000).then(() => icon)]);
      if (!b) b = (await full) || (await icon);
      return b;
    })().catch(() => null);
    const br = await Promise.race([attempt, sleep(8000).then(() => null)]);
    if (br) {
      // Keep the name the visitor typed if the lookup's is very different.
      if (br.name.toLowerCase().indexOf(name.toLowerCase().split(' ')[0]) === -1) br.name = name;
      return br;
    }
    return guessBrand(name);
  }

  /* ================================================================
     Templates — every one exactly four steps
     ================================================================ */
  const TICK = '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="m5 13 4 4L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const WARN = '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M12 8v5m0 3.5v.01" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
  const DOC = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  const SPARK = '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9z" fill="currentColor"/></svg>';

  const hd = (t, s) => `<div class="ac-hd"><div class="ac-t">${esc(t)}</div><div class="ac-s">${esc(s)}</div></div>`;
  const field = (label, value) => `<div class="af"><span class="af-l">${esc(label)}</span><span class="af-v"><span class="tv">${esc(value)}</span></span></div>`;
  const row = (...f) => `<div class="af-row">${f.join('')}</div>`;
  const file = (name, meta, wait) => `<div class="afile${wait ? ' wait' : ''}"><i>${DOC}</i><span>${esc(name)}</span><small>${esc(meta)}</small></div>`;
  const check = (t, warn) => `<div class="acheck${warn ? ' warn' : ''}"><span>${warn ? WARN : TICK}</span>${esc(t)}</div>`;
  const initials = (n) => n.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const approver = (name, role, state) => `<div class="aappr"><span class="aappr-av">${initials(name)}</span><div><b>${esc(name)}</b><small>${esc(role)}</small></div><span class="aappr-st">${esc(state)}</span></div>`;
  function approvers(m, list) {
    const n = m.approvers === 2 ? 2 : 1;
    return list.slice(0, n).map(([a, r], i) => approver(a, r, i === 0 ? 'Waiting' : 'Then')).join('');
  }
  const block = (kind, title, inner) => `<div class="ablock ablock-${kind}"><div class="ablock-hd">${SPARK}<span>${esc(title)}</span></div>${inner}</div>`;
  const kv = (pairs) => `<div class="akv">${pairs.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>`;
  const cl = (items) => items.map(([t, ok]) => `<div class="acheck${ok ? '' : ' warn'}"><span>${ok ? TICK : WARN}</span>${esc(t)}</div>`).join('');

  const TEMPLATES = {
    campaign: {
      id: 'campaign', name: 'Campaign email', noun: 'campaign',
      steps: [['Brief', 'Form'], ['Assets', 'Data source'], ['Compose', 'AI writer'], ['Review', 'Approval']],
      cta: ['Next: assets', 'Next: compose', 'Next: review', 'Approve and send'],
      featureStep: { checklist: 1, extract: 1 },
      render(br, m, i) {
        const c = copyFor(br);
        if (i === 0) return hd('Tell us about the campaign', 'Three fields. The rest is written for you.') +
          field('Campaign goal', br.goal) + row(field('Audience', br.audience), field('Send date', br.date));
        if (i === 1) return hd('Assets', 'What this campaign draws on, synced from SharePoint.') +
          c.files.map((f) => file(f, 'Synced 2 min ago')).join('');
        if (i === 2) {
          const subj = subjectsFor(br)[0];
          return hd('Compose', `Drafted by AI from the brief and assets, in ${poss(br.name)} voice.`) +
            `<div class="amail-subj"><span>Subject</span><b class="tv">${esc(subj)}</b></div>` +
            `<div class="amail"><div class="amail-bar">${logoHTML(br)}</div><div class="amail-body"><div class="amail-h">${esc(subj)}</div><p class="tv">${esc(c.body)}</p><span class="amail-btn">${esc(c.cta)}</span></div></div>`;
        }
        return hd('Review', `${m.approvers === 2 ? 'Two approvals' : 'One approval'} before it sends on ${br.date}.`) +
          approvers(m, [['Jordan Lee', 'Marketing lead'], ['Priya Shah', 'Brand manager']]) +
          check('Brand colours and logo') + check(`Tone of voice — ${br.tone}`) + check('Links and unsubscribe checked');
      },
      features: {
        checklist: (br) => block('checklist', 'Asset checklist · 3 of 4 ready', cl([['Brand guide', 1], ['Tone of voice', 1], ['Product shots', 1], ['Legal disclaimer — waiting on legal', 0]])),
        extract: (br) => block('extract', 'Pulled from the brand guide', kv([['Primary colour', br.b], ['Voice', br.tone], ['Legal line', `T&Cs apply. See ${br.domain}/terms`]])),
      },
      docs: (br) => copyFor(br).files.slice(0, 2),
      asks: ['Suggest three subject lines', 'Make the intro shorter', 'What’s our tone of voice?'],
      answer(br, q, m) {
        if (q === 0) return `Here are three, in ${poss(br.name)} voice:<ul>${subjectsFor(br).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`;
        if (q === 1) return `Shorter, and still sounds like ${esc(br.name)}:<blockquote>${esc(voiceOf(br).short)}</blockquote>`;
        return `From ${poss(br.name)} brand guide: <b>“${esc(br.tone)}.”</b> Keep sentences short and lead with what’s in it for the reader.`;
      },
      submissions: ['Spring launch', 'Members’ early access', 'End of season sale'],
    },

    onboarding: {
      id: 'onboarding', name: 'Client onboarding', noun: 'onboarding',
      steps: [['Details', 'Form'], ['Documents', 'Document upload'], ['Checks', 'AI checklist'], ['Approve', 'Approval']],
      cta: ['Next: documents', 'Next: checks', 'Next: approve', 'Approve and welcome'],
      featureStep: { checklist: 1, extract: 1 },
      render(br, m, i) {
        if (i === 0) return hd('New client details', `Who’s joining ${br.name}, and when.`) +
          field('Client', 'Harbour & Co') + row(field('Main contact', 'Sam Rivera'), field('Start date', br.date));
        if (i === 1) return hd('Documents', `Uploaded by the client through ${poss(br.name)} portal.`) +
          file('photo-id.pdf', 'Received') + file('signed-engagement-letter.pdf', 'Received') + file('direct-debit-form.pdf', 'Waiting', true);
        if (i === 2) return hd('AI checks', `Checked against ${poss(br.name)} onboarding policy.`) +
          check('Photo ID matches the client name') + check('Engagement letter signed and dated') + check('Direct debit form still missing', true);
        return hd('Approve', `${m.approvers === 2 ? 'Two approvals' : 'One approval'}, then the welcome email goes out in ${poss(br.name)} voice.`) +
          approvers(m, [['Alex Chen', 'Client services lead'], ['Morgan Blake', 'Compliance']]) +
          check('All checks reviewed') + check(`Welcome email drafted — ${br.tone}`);
      },
      features: {
        checklist: () => block('checklist', 'Document checklist · 2 of 3 received', cl([['Photo ID', 1], ['Signed engagement letter', 1], ['Direct debit form', 0]])),
        extract: () => block('extract', 'Read from the photo ID', kv([['Name', 'Sam Rivera'], ['Date of birth', '14/03/1988'], ['Address', '12 Bay St, Sydney']])),
      },
      docs: (br) => [`${slug(br.name)}-onboarding-policy.pdf`, 'kyc-checklist.docx'],
      asks: ['What’s still missing?', 'Draft the welcome email', 'What does our onboarding policy need?'],
      answer(br, q) {
        if (q === 0) return 'Just one thing: the <b>direct debit form</b>. Want me to send Sam a friendly reminder?';
        if (q === 1) return `Here’s a start, in ${poss(br.name)} voice:<blockquote>Welcome to ${esc(br.name)}, Sam. ${esc(voiceOf(br).hello)}</blockquote>`;
        return 'The policy needs <b>photo ID</b>, a <b>signed engagement letter</b> and a <b>direct debit form</b> before day one. You have two of the three.';
      },
      submissions: ['Harbour & Co', 'Ridgeway Partners', 'Blue Gum Studio'],
    },

    claims: {
      id: 'claims', name: 'Insurance claim', noun: 'claim',
      steps: [['Incident', 'Form'], ['Evidence', 'Document upload'], ['Assess', 'AI assessor'], ['Decision', 'Approval']],
      cta: ['Next: evidence', 'Next: assess', 'Next: decision', 'Approve payout'],
      featureStep: { checklist: 1, extract: 1 },
      render(br, m, i) {
        if (i === 0) return hd('What happened?', `Tell ${br.name} about the claim.`) +
          field('Policy number', 'POL-4471-208') + row(field('What happened', 'Burst pipe in the kitchen'), field('Date', '12 September'));
        if (i === 1) return hd('Evidence', 'Photos and invoices, straight from the customer’s phone.') +
          file('kitchen-photos.zip', '6 photos') + file('plumber-invoice.pdf', '1 page') + file('policy-schedule.pdf', 'From the policy');
        if (i === 2) return hd('AI assessment', `Read against ${poss(br.name)} policy wording.`) +
          check('Invoice total $2,340 matches the photos') + check('Covered under section 4.2 — escape of liquid') + check('Excess of $500 applies', true) +
          `<div class="arec">Recommendation <b>Approve $1,840</b></div>`;
        return hd('Decision', `${m.approvers === 2 ? 'Two approvals' : 'One approval'} before the payout.`) +
          approvers(m, [['Riley Nguyen', 'Claims officer'], ['Dana Ortiz', 'Claims manager']]) +
          check('Assessment reviewed') + check(`Customer letter drafted — ${br.tone}`);
      },
      features: {
        checklist: () => block('checklist', 'Evidence checklist · 3 of 4', cl([['Photos of the damage', 1], ['Repair invoice', 1], ['Policy schedule', 1], ['Plumber’s report', 0]])),
        extract: () => block('extract', 'Read from the invoice', kv([['Supplier', 'Flowright Plumbing'], ['Total', '$2,340.00'], ['Date', '13 September']])),
      },
      docs: (br) => [`${slug(br.name)}-home-policy-wording.pdf`, 'claims-handbook.pdf'],
      asks: ['Summarise this claim', 'Draft a note to the customer', 'What does the policy say about burst pipes?'],
      answer(br, q) {
        if (q === 0) return 'Burst pipe in the kitchen on 12 September. Invoice of <b>$2,340</b> matches the photos. Covered, less the $500 excess: <b>$1,840</b>.';
        if (q === 1) return `In ${poss(br.name)} voice:<blockquote>Good news, Sam — your claim is approved. ${esc(voiceOf(br).hello)}</blockquote>`;
        return 'Section 4.2 covers a <b>sudden escape of liquid</b>, like a burst pipe. Slow leaks over time aren’t covered. A $500 excess applies.';
      },
      submissions: ['CLM-20481 · Burst pipe', 'CLM-20477 · Storm damage', 'CLM-20470 · Theft'],
    },

    docreview: {
      id: 'docreview', name: 'Document review', noun: 'review',
      steps: [['Upload', 'Document upload'], ['Extract', 'Extraction'], ['Check', 'AI checklist'], ['Sign-off', 'Approval']],
      cta: ['Next: extract', 'Next: check', 'Next: sign-off', 'Sign off'],
      featureStep: { checklist: 0, extract: 0 },
      render(br, m, i) {
        if (i === 0) return hd('Upload the document', `For ${br.name}. Drop in a contract and pick the matter.`) +
          file('master-services-agreement.pdf', '42 pages') + row(field('Matter', 'MAT-3093 · Harbour & Co'), field('Due', 'Friday'));
        if (i === 1) return hd('Key terms', 'Pulled from the document automatically.') +
          row(field('Parties', `${br.name} and Harbour & Co`), field('Term', '3 years, auto-renews')) +
          row(field('Governing law', 'New South Wales'), field('Liability cap', 'Uncapped (cl. 9.1)'));
        if (i === 2) return hd('Checked against the playbook', `${poss(br.name)} positions, clause by clause.`) +
          check('Governing law: New South Wales') + check('Auto-renews with 90 days’ notice (cl. 14.2)', true) + check('Uncapped indemnity (cl. 9.1)', true);
        return hd('Sign-off', `${m.approvers === 2 ? 'Two sign-offs' : 'One sign-off'} before it goes back to the other side.`) +
          approvers(m, [['Chris Taylor', 'Senior associate'], ['Jo Park', 'Partner']]) +
          check('Two clauses flagged for negotiation', true) + check('Mark-up ready to send');
      },
      features: {
        checklist: () => block('checklist', 'Required documents · 2 of 3', cl([['Master services agreement', 1], ['Schedule A — pricing', 1], ['Signed cover letter', 0]])),
        extract: () => block('extract', 'Read on upload', kv([['Clauses found', '38'], ['Defined terms', '21'], ['Schedules', '2']])),
      },
      docs: (br) => [`${slug(br.name)}-contract-playbook.docx`, 'liability-positions.pdf'],
      asks: ['Flag the risky clauses', 'Summarise for the partner', 'What’s our position on liability caps?'],
      answer(br, q) {
        if (q === 0) return 'Two to look at: <b>auto-renewal</b> with 90 days’ notice (cl. 14.2), and an <b>uncapped indemnity</b> (cl. 9.1).';
        if (q === 1) return '<blockquote>Three-year MSA with Harbour & Co, NSW law. Push back on cl. 9.1 and 14.2; everything else is within the playbook.</blockquote>';
        return `${poss(br.name)} playbook caps liability at <b>12 months’ fees</b>. An uncapped indemnity needs partner sign-off.`;
      },
      submissions: ['MSA · Harbour & Co', 'NDA · Kestrel Surf', 'Lease · 50 Carrington St'],
    },
  };

  // Campaign copy, per brand (from app-view.js's stepHTML data where we can).
  const COPY = {
    nike: { files: ['nike-brand-guide.pdf', 'tone-of-voice.docx', 'pegasus-41-shots.zip'], body: 'The Pegasus 41 is here — lighter, faster, ready for your next PB. Run Club members get first access this week.', cta: 'Shop now' },
    apple: { files: ['apple-brand-guidelines.pdf', 'voice-and-tone.docx', 'iphone-product-shots.zip'], body: 'Introducing the new iPhone. Our most advanced camera yet, in a design you’ll love to hold.', cta: 'Learn more' },
    commbank: { files: ['commbank-brand-guide.pdf', 'yello-offers.xlsx', 'app-screens.zip'], body: 'Earn Yello rewards on your everyday account. See your offers in the CommBank app — no sign-up needed.', cta: 'See my offers' },
    qantas: { files: ['qantas-brand-guide.pdf', 'tone-of-voice.docx', 'sydney-dallas-shots.zip'], body: 'Sydney to Dallas, non-stop from 6 October. Frequent Flyer members get first access to fares this week.', cta: 'See fares' },
  };
  function copyFor(br) {
    if (br.copy) return br.copy;
    const k = brandKey(br);
    if (k && COPY[k]) return COPY[k];
    const s = slug(br.name);
    return { files: [`${s}-brand-guide.pdf`, 'tone-of-voice.docx', 'product-shots.zip'], body: `Here’s what’s new at ${br.name} this month — picked for ${br.audience.replace(/…$/, '').toLowerCase()}.`, cta: 'Find out more' };
  }
  const SUBJECTS = {
    nike: ['Pegasus 41 is here. Go.', 'Your next PB starts now', 'Run Club members get first access'],
    apple: ['Say hello to the new iPhone.', 'Pro. Beyond.', 'Available now at the Apple Store'],
    commbank: ['Your Yello rewards are here', 'More value from everyday banking', 'Unlock offers in the CommBank app'],
    qantas: ['Sydney to Dallas, non-stop', 'Frequent Flyers fly first', 'Your next flight is waiting'],
  };
  const subjectsFor = (br) => br.subjects || SUBJECTS[brandKey(br)] || [`What’s new at ${br.name}`, `${br.name}: made for you`, `Don’t miss this from ${br.name}`];

  /* ---------- reading a prompt ---------- */
  const MATCH = [
    ['campaign', /campaign|e-?mail|newsletter|marketing|edm|promo/i],
    ['claims', /claim|insur/i],
    ['onboarding', /onboard|intake|new client|new customer|new starter|kyc|sign[- ]?up/i],
    ['docreview', /document|contract|legal|\blaw\b|lawyer|clause|review/i],
  ];
  function templateFor(text) {
    for (const [id, re] of MATCH) if (re.test(text)) return { id, matched: true };
    return { id: 'campaign', matched: false };
  }
  const STOP = /^(a|an|the|my|our|your|me|us|them|it|this|that|law|small|local|big|every|each|all|clients?|customers?|staff|team|people|free|now|hr|it|finance|sales|marketing|legal|operations|payroll|procurement|employees|managers|suppliers|contractors|tenants|students|patients|councils?)$/i;
  function clientFrom(text, loose) {
    const known = /\b(nike|apple|commbank|commonwealth bank|cba|qantas|canva)\b/i.exec(text);
    if (known) return known[1];
    let m = /\bfor\s+((?:[A-Z0-9][\w&'.+-]*)(?:\s+(?:[A-Z0-9&][\w&'.+-]*|of|and|&))*)/.exec(text);
    if (m && !STOP.test(m[1].split(' ')[0])) return m[1].replace(/[.,!?]+$/, '');
    if (loose) {
      m = /\bfor\s+(.+)$/i.exec(text);
      if (m) {
        const n = m[1].replace(/\b(please|instead|too|now|next|as well)\b/gi, '').replace(/[.,!?]+$/, '').trim();
        if (n && !STOP.test(n.split(' ')[0]) && n.split(/\s+/).length <= 5) return n;
      }
    }
    return null;
  }

  /* ================================================================
     Rendering the app
     ================================================================ */
  const ICON_AI = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9z M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" fill="currentColor"/></svg>';
  const SEND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function logoHTML(br) {
    const mono = `<span class="mono">${esc(br.name[0].toUpperCase())}</span>`;
    return `<span class="app-logo${br.logoClass ? ' ' + br.logoClass : ''}">${br.logo || mono}</span>`;
  }
  function fixLogos(root, br) {
    root.querySelectorAll('.app-logo .chip img').forEach((img) => {
      img.addEventListener('error', () => { img.closest('.app-logo').innerHTML = `<span class="mono">${esc(br.name[0].toUpperCase())}</span>`; }, { once: true });
    });
  }
  function paintVars(el, br) {
    const s = el.style;
    s.setProperty('--b', br.b);
    s.setProperty('--b-on', br.on);
    s.setProperty('--b-head', br.head);
    s.setProperty('--b-head-on', br.headOn);
    s.setProperty('--b-surface', br.surface);
    s.setProperty('--b-border', br.border);
    s.setProperty('--b-font', br.font);
  }

  /* model: { tpl, brand, approvers, features:{rag,checklist,extract} }
     opts:  { mode: 'builder'|'published'|'compact', onStep(n), onAsk(text) } */
  function mount(root, opts = {}) {
    root.classList.add('app');
    root.dataset.mode = opts.mode || 'published';
    root.innerHTML =
      '<div class="app-head"><span class="app-head-logo"></span><span class="app-head-name"></span><span class="app-head-sep" aria-hidden="true">/</span><span class="app-head-title"></span></div>' +
      '<div class="app-body">' +
        '<div class="app-main"><ol class="app-steps"></ol><div class="app-card"></div></div>' +
        '<aside class="app-assist" aria-label="In-app assistant">' +
          '<div class="pa-hd"><span class="pa-av"></span><div class="pa-who"><b class="pa-name"></b><small class="pa-for"></small></div><button type="button" class="pa-close" aria-label="Close the assistant">&times;</button></div>' +
          '<div class="pa-ground" hidden></div>' +
          '<div class="pa-thread" aria-live="polite"></div>' +
          '<div class="pa-asks"></div>' +
          '<form class="pa-form" autocomplete="off"><label class="sr-only">Ask the assistant</label><input type="text" /><button type="submit" aria-label="Send">' + SEND + '</button></form>' +
        '</aside>' +
      '</div>' +
      '<button type="button" class="app-fab">' + ICON_AI + '<span></span></button>';
    const q = (s) => root.querySelector(s);
    const id = 'pa' + Math.random().toString(36).slice(2, 8);
    q('.pa-form input').id = id;
    q('.pa-form label').setAttribute('for', id);
    root.__opts = opts;

    q('.app-steps').addEventListener('click', (e) => {
      const b = e.target.closest('[data-step]');
      if (b && !root.classList.contains('is-skel')) go(root, +b.dataset.step);
    });
    q('.app-card').addEventListener('click', (e) => {
      if (e.target.closest('[data-next]')) {
        const s = root.__step || 0;
        if (s < 3) go(root, s + 1);
        else doneFlash(root);
      }
      if (e.target.closest('[data-back]')) go(root, Math.max(0, (root.__step || 0) - 1));
    });
    q('.pa-asks').addEventListener('click', (e) => {
      const b = e.target.closest('[data-ask]');
      if (b) ask(root, +b.dataset.ask);
    });
    q('.pa-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const inp = q('.pa-form input');
      const v = inp.value.trim();
      if (!v) return;
      inp.value = '';
      askFree(root, v);
    });
    q('.app-fab').addEventListener('click', () => root.classList.add('assist-open'));
    q('.pa-close').addEventListener('click', () => root.classList.remove('assist-open'));
    return root;
  }

  function sigOf(model) { return model.tpl + '|' + model.brand.name + '|' + model.brand.b; }

  function update(root, model, { keepThread = false } = {}) {
    const q = (s) => root.querySelector(s);
    const t = TEMPLATES[model.tpl];
    const br = model.brand;
    root.__model = model;
    paintVars(root, br);
    q('.app-head-logo').innerHTML = logoHTML(br);
    q('.app-head-name').textContent = br.name;
    q('.app-head-title').textContent = t.name;
    fixLogos(q('.app-head-logo'), br);
    const f = model.features || {};
    q('.app-steps').innerHTML = t.steps.map(([label, wire], i) => {
      const tags = [];
      if (f.checklist && t.featureStep.checklist === i) tags.push('Checklist');
      if (f.extract && t.featureStep.extract === i) tags.push('Extraction');
      if (model.approvers === 2 && i === 3) tags.push('2 approvers');
      return `<li class="app-step" style="--k:${i}"><button type="button" data-step="${i}"><span class="as-n">${i + 1}</span><span class="as-l">${esc(label)}</span><span class="as-w">${esc(wire)}${tags.map((x) => ` <em>+ ${esc(x)}</em>`).join('')}</span></button></li>`;
    }).join('');
    // Assistant
    q('.pa-av').innerHTML = logoHTML(br);
    fixLogos(q('.pa-av'), br);
    q('.pa-name').textContent = `${br.name} assistant`;
    q('.pa-for').textContent = `For ${poss(br.name)} team, using the app`;
    q('.pa-form input').placeholder = `Ask the ${br.name} assistant…`;
    q('.app-fab span').textContent = `Ask ${br.name}`;
    const g = q('.pa-ground');
    g.hidden = !f.rag;
    g.innerHTML = f.rag ? `${DOC}<span>Answers from ${poss(br.name)} documents</span>` : '';
    q('.pa-asks').innerHTML = t.asks.map((a, i) => `<button type="button" data-ask="${i}">${esc(a)}</button>`).join('');
    const sig = sigOf(model);
    if (!keepThread || root.__sig !== sig) {
      q('.pa-thread').innerHTML = `<div class="pa-msg pa-ai">Hi — I’m the ${esc(br.name)} ${esc(t.noun)} assistant. I help ${esc(poss(br.name))} team get this done, in ${esc(poss(br.name))} voice. Ask me anything.</div>`;
    }
    root.__sig = sig;
    go(root, Math.min(3, root.__step || 0), { quiet: true });
  }

  function cardHTML(model, i) {
    const t = TEMPLATES[model.tpl];
    const br = model.brand;
    const f = model.features || {};
    let html = t.render(br, model, i);
    if (f.checklist && t.featureStep.checklist === i) html += t.features.checklist(br);
    if (f.extract && t.featureStep.extract === i) html += t.features.extract(br);
    html += `<div class="ac-foot">${i > 0 ? '<button type="button" class="ac-back" data-back>Back</button>' : '<span></span>'}<button type="button" class="ac-cta" data-next>${esc(t.cta[i])}</button></div>`;
    return html;
  }

  function go(root, i, { quiet = false } = {}) {
    const model = root.__model;
    if (!model) return;
    root.__step = i;
    root.querySelectorAll('.app-step').forEach((s, n) => {
      s.classList.toggle('on', n === i);
      s.classList.toggle('done', n < i);
      s.querySelector('button').setAttribute('aria-current', n === i ? 'step' : 'false');
    });
    const card = root.querySelector('.app-card');
    card.innerHTML = cardHTML(model, i);
    fixLogos(card, model.brand);
    if (!quiet) { card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap'); }
    if (root.__opts.onStep) root.__opts.onStep(i);
  }

  function doneFlash(root) {
    const card = root.querySelector('.app-card');
    const t = TEMPLATES[root.__model.tpl];
    let n = card.querySelector('.ac-done');
    if (!n) {
      n = document.createElement('div');
      n.className = 'ac-done';
      card.appendChild(n);
    }
    n.innerHTML = `${TICK}<span>Done. In the real app this ${esc(t.noun)} would now move on.</span><button type="button" data-restart>Start again</button>`;
    n.querySelector('[data-restart]').addEventListener('click', () => go(root, 0));
  }

  function addMsg(root, cls, html) {
    const th = root.querySelector('.pa-thread');
    const m = document.createElement('div');
    m.className = 'pa-msg ' + cls;
    m.innerHTML = html;
    th.appendChild(m);
    th.scrollTop = th.scrollHeight;
    return m;
  }
  function reply(root, html, sources) {
    const typing = addMsg(root, 'pa-ai pa-typing', '<i></i><i></i><i></i>');
    setTimeout(() => {
      typing.classList.remove('pa-typing');
      typing.innerHTML = html + (sources && sources.length ? `<div class="pa-src">${sources.map((s) => `<span>${DOC}${esc(s)}</span>`).join('')}</div>` : '');
      const th = root.querySelector('.pa-thread');
      th.scrollTop = th.scrollHeight;
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650);
  }
  function ask(root, qi) {
    const m = root.__model;
    const t = TEMPLATES[m.tpl];
    addMsg(root, 'pa-user', esc(t.asks[qi]));
    const rag = m.features && m.features.rag;
    if (qi === 2 && !rag) {
      reply(root, `I can’t see ${esc(poss(m.brand.name))} documents yet, so I’d only be guessing. Turn on <b>document grounding (RAG)</b> and I’ll answer from them, with sources.`);
      return;
    }
    reply(root, t.answer(m.brand, qi, m), rag ? t.docs(m.brand) : null);
  }
  const STRUCTURE = /\b(add|remove|delete|insert|new|another|fifth|extra)\b.*\bstep|\bsteps?\b.*\b(add|remove|five|5)\b|\brebrand|make (it|this) for|change the (app|steps|brand|logo|colou?rs?)|\bpublish/i;
  function askFree(root, text) {
    const m = root.__model;
    const t = TEMPLATES[m.tpl];
    addMsg(root, 'pa-user', esc(text));
    if (STRUCTURE.test(text)) {
      reply(root, `I help ${esc(poss(m.brand.name))} team <i>use</i> this app, so I can’t change how it’s built. Whoever built it can do that in the EAI builder.`);
      return;
    }
    // Map free text onto the nearest canned answer, else a helpful nudge.
    const words = text.toLowerCase();
    const idx = t.asks.findIndex((a) => a.toLowerCase().split(/\W+/).filter((w) => w.length > 4).some((w) => words.includes(w)));
    if (idx >= 0) { root.querySelector('.pa-thread').lastChild.remove(); ask(root, idx); return; }
    const step = t.steps[root.__step || 0][0];
    reply(root, `Happy to help with that. I’m set up for this ${esc(t.noun)}: I can see the <b>${esc(step)}</b> step and write in ${esc(poss(m.brand.name))} voice. Try “${esc(t.asks[0])}”.`);
  }

  /* ---------- links for the phone view ---------- */
  function shareQuery(model) {
    const p = new URLSearchParams();
    p.set('t', model.tpl);
    // A composed app (compose.js) is rebuilt from the prompt it came from.
    if (TEMPLATES[model.tpl] && TEMPLATES[model.tpl].prompt) p.set('q', TEMPLATES[model.tpl].prompt);
    const key = brandKey(model.brand) || model.brand.of;
    if (model.brand.unnamed) p.set('u', model.brand.unnamed);
    if (key) p.set('c', key);
    else {
      p.set('n', model.brand.name);
      if (model.brand.domain) p.set('d', model.brand.domain);
      p.set('p', model.brand.b.replace('#', ''));
      const m = /src="([^"]+)"/.exec(model.brand.logo || '');
      if (m && /^https?:/.test(m[1])) p.set('l', m[1].replace(/&amp;/g, '&'));
    }
    if (model.approvers === 2) p.set('a', '2');
    const f = Object.keys(model.features || {}).filter((k) => model.features[k]);
    if (f.length) p.set('f', f.join(','));
    return p.toString();
  }
  function fromQuery(search) {
    const p = new URLSearchParams(search);
    let tpl = TEMPLATES[p.get('t')] ? p.get('t') : 'campaign';
    if (p.get('q') && api.compose) tpl = api.compose(p.get('q')).id;
    let brand = BRANDS.nike;
    if (p.get('c') && BRANDS[p.get('c')]) brand = BRANDS[p.get('c')];
    else if (p.get('n')) {
      brand = STM.liveBrand({ name: p.get('n'), domain: p.get('d') || '' }, '#' + (p.get('p') || '1D1D1F'), p.get('l'), [], '');
      brand.tone = 'Read from their site';
    }
    if (/^[A-Z]$/.test(p.get('u') || '')) brand = unnamed(brand, p.get('u'));
    const features = {};
    (p.get('f') || '').split(',').filter(Boolean).forEach((k) => { features[k] = true; });
    return { tpl, brand, approvers: p.get('a') === '2' ? 2 : 1, features };
  }

  const api = {
    TEMPLATES, BRANDS, brandKey, resolveBrand, guessBrand, templateFor, clientFrom,
    mount, update, go, shareQuery, fromQuery, logoHTML, paintVars, esc, poss, slug, copyFor, voiceOf, unnamed,
    // What a step is made of, for compose.js.
    ui: { hd, field, row, file, check, approvers, block, kv, cl },
  };
  window.EAIApp = api;
})();
