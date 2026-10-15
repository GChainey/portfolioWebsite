/* Remix 23/24 — "See use cases" under the AI features (?layout=mvp2).

   The twelve scenarios from the Add to apps work (PR #150,
   workspace-ai-demo/assets/admin-ai-capabilities.js): each AI feature told
   as a real problem our customers have, what it does about it, and what the
   team set up. The data, the before/after illustrations and the setup lists
   are copied from there as-is, so the marketing page and the product tell
   the same stories. A dialog with a tab per feature opens on the feature
   that's selected; a card opens its case study: before and after, what they
   set up, and a way to start building. */
(function () {
  'use strict';
  const sec = document.getElementById('features');
  if (!sec || document.documentElement.dataset.layout !== 'mvp2') return;
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // The product's feature ids, with the names this page uses.
  const FEATURES = {
    'ai-chatbot': { title: 'AI Chatbot', site: 'chatbot' },
    'document-checklist': { title: 'Document Checklist', site: 'checklist' },
    'content-understanding': { title: 'Document Validation', site: 'validation' },
    'document-creation': { title: 'Document Creation', site: 'creation' },
  };
  const ORDER = Object.keys(FEATURES);

  /* ---- Illustrations, scenarios and setups: copied from admin-ai-capabilities.js ---- */
  const T = (x, y, s, cls = 'ca-t', size = 9, anchor = '') => `<text x="${x}" y="${y}" class="${cls}" font-size="${size}"${anchor ? ` text-anchor="${anchor}"` : ''}>${esc(s)}</text>`;
  const bars = (x, y, w, n, gap = 9) => Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * gap}" width="${Math.max(12, w - (i % 3) * 10)}" height="4" rx="2" class="ca-bar"/>`).join('');
  const rot = (deg, cx, cy, body) => (deg ? `<g transform="rotate(${deg} ${cx} ${cy})">${body}</g>` : body);
  const paper = (x, y, w, h, n = 4, deg = 0) => rot(deg, x + w / 2, y + h / 2, `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" class="ca-card"/>${bars(x + 8, y + 10, w - 16, n)}`);
  const idCard = (x, y, w = 92, h = 58, deg = 0) => rot(deg, x + w / 2, y + h / 2, `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" class="ca-card"/><rect x="${x}" y="${y}" width="${w}" height="12" rx="6" class="ca-soft"/><rect x="${x}" y="${y + 6}" width="${w}" height="6" class="ca-soft"/><circle cx="${x + 20}" cy="${y + 28}" r="7" class="ca-face"/><path d="M${x + 9} ${y + 48}c0-7 5-11 11-11s11 4 11 11z" class="ca-face"/>${bars(x + 38, y + 22, w - 48, 3, 8)}`);
  const badge = (cx, cy, kind = 'ok', r = 7) => {
    const mark = kind === 'ok' ? `<path d="M${cx - 3.2} ${cy}l2.2 2.2 4.2-4.4" class="ca-mark"/>`
      : kind === 'bad' ? `<path d="M${cx - 2.6} ${cy - 2.6}l5.2 5.2M${cx + 2.6} ${cy - 2.6}l-5.2 5.2" class="ca-mark"/>`
        : kind === 'ask' ? T(cx, cy + 3.2, '?', 'ca-t ca-t-white', 9, 'middle')
          : `<path d="M${cx} ${cy - 3.4}v3.6M${cx} ${cy + 2.6}v.4" class="ca-mark"/>`;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" class="ca-${kind === 'ask' ? 'ink' : kind}"/>${mark}`;
  };
  const pill = (x, y, text, kind = 'ok', mark = true) => {
    const w = Math.round(text.length * 4.6 + (mark ? 26 : 16));
    return `<rect x="${x}" y="${y}" width="${w}" height="18" rx="9" class="ca-${kind}-wash"/>${mark ? badge(x + 10, y + 9, kind, 5.5) : ''}${T(x + (mark ? 20 : 8), y + 12.5, text, `ca-t ca-t-${kind}`, 8.5)}`;
  };
  const clock = (cx, cy, r = 14) => `<circle cx="${cx}" cy="${cy}" r="${r}" class="ca-card"/><path d="M${cx} ${cy}V${cy - r + 5}M${cx} ${cy}h${r - 6}" class="ca-hand"/>`;
  const arrow = (x1, y, x2) => `<path d="M${x1} ${y}H${x2}" class="ca-line"/><path d="M${x2 - 5} ${y - 4}l5 4-5 4" class="ca-line"/>`;
  const bot = (cx, cy, r = 14) => `<circle cx="${cx}" cy="${cy}" r="${r}" class="ca-ink"/><path d="M${cx} ${cy - r * 0.5}l${r * 0.14} ${r * 0.34} ${r * 0.34} ${r * 0.14}-${r * 0.34} ${r * 0.14}-${r * 0.14} ${r * 0.34}-${r * 0.14}-${r * 0.34}-${r * 0.34}-${r * 0.14} ${r * 0.34}-${r * 0.14}z" class="ca-white"/>`;
  const envelope = (x, y, w = 52, h = 34) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" class="ca-card"/><path d="M${x + 2} ${y + 3}l${w / 2 - 2} ${h / 2 - 2} ${w / 2 - 2}-${h / 2 - 2}" class="ca-line-soft"/>`;
  const slot = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" class="ca-dash"/>`;
  const bubble = (x, y, w, text, dark = false) => `<rect x="${x}" y="${y}" width="${w}" height="22" rx="11" class="${dark ? 'ca-ink' : 'ca-card'}"/>${T(x + 11, y + 14.5, text, dark ? 'ca-t ca-t-white' : 'ca-t', 9)}`;
  const source = (x, y, text) => `<rect x="${x}" y="${y}" width="${Math.round(text.length * 4.6 + 18)}" height="16" rx="8" class="ca-blue-wash"/>${T(x + 9, y + 11, text, 'ca-t ca-t-blue', 8.5)}`;
  const blank = (x, y, key, w = 70) => `${T(x, y + 9, key, 'ca-t ca-t-mute', 8)}<path d="M${x + 40} ${y + 11}h${w}" class="ca-dash"/>`;
  const magnifier = (cx, cy, r = 14) => `<circle cx="${cx}" cy="${cy}" r="${r}" class="ca-lens"/><path d="M${cx + r * 0.7} ${cy + r * 0.7}l${r * 0.6} ${r * 0.6}" class="ca-handle"/>`;
  const svg = (body) => `<svg viewBox="0 0 240 136" aria-hidden="true">${body}</svg>`;

  const ART = {
    'kyc-identity': {
      before: svg(`${idCard(18, 50, 92, 58, -10)}${idCard(30, 40, 92, 58, 6)}${idCard(44, 30, 92, 58, -3)}${clock(176, 42)}${T(176, 72, '12 min each', 'ca-t ca-t-mute', 9, 'middle')}${pill(146, 90, '214 waiting', 'warn')}`),
      after: svg(`${idCard(14, 36, 100, 64)}${pill(126, 26, 'Name matches')}${pill(126, 56, 'Not expired')}${pill(126, 86, 'Photo present')}`),
    },
    'insurance-compliance': {
      before: svg(`<rect x="30" y="10" width="96" height="116" rx="4" class="ca-card"/>${T(40, 26, 'Certificate', 'ca-t', 9)}${bars(40, 36, 76, 9, 9)}${magnifier(124, 78, 18)}${pill(150, 22, 'Expired?', 'warn')}${pill(150, 46, 'Cover?', 'warn')}`),
      after: svg(`<rect x="16" y="10" width="72" height="116" rx="4" class="ca-card"/>${T(26, 26, 'Certificate', 'ca-t', 9)}${bars(26, 36, 52, 8, 10)}${pill(100, 22, 'Cover $20m')}${pill(100, 50, 'Named insured')}${pill(100, 78, 'Expires in 12 days', 'warn')}`),
    },
    'permit-credentials': {
      before: svg(`${idCard(10, 38, 88, 58)}${T(54, 112, 'LIC 48213', 'ca-t', 9, 'middle')}<rect x="142" y="30" width="88" height="74" rx="6" class="ca-card"/>${T(152, 46, 'User record', 'ca-t', 9)}${bars(152, 56, 66, 3, 9)}${T(186, 118, 'LIC 48231', 'ca-t', 9, 'middle')}<path d="M100 67h40" class="ca-dash"/>${badge(120, 67, 'ask', 9)}`),
      after: svg(`${idCard(10, 30, 88, 58)}<rect x="142" y="30" width="88" height="58" rx="6" class="ca-card"/>${T(152, 46, 'User record', 'ca-t', 9)}${bars(152, 56, 66, 3, 9)}${arrow(102, 59, 138)}${pill(36, 102, 'Licence number doesn’t match', 'bad')}`),
    },
    'complete-first-time': {
      before: svg(`<rect x="16" y="18" width="104" height="100" rx="6" class="ca-card"/>${T(26, 34, 'Application', 'ca-t', 9)}${paper(26, 44, 26, 32, 2)}${slot(58, 44, 26, 32)}${slot(90, 44, 22, 32)}${envelope(150, 20, 48, 30)}${envelope(158, 42, 48, 30)}${envelope(166, 64, 48, 30)}${pill(140, 104, '3 follow-up emails', 'warn')}`),
      after: svg(`<rect x="36" y="10" width="168" height="116" rx="6" class="ca-card"/>${['Photo ID', 'Proof of address', 'Signed form'].map((t, i) => `${badge(54, 32 + i * 24)}${T(68, 35 + i * 24, t, 'ca-t', 9)}`).join('')}<rect x="130" y="98" width="62" height="20" rx="6" class="ca-ink"/>${T(161, 111, 'Submit', 'ca-t ca-t-white', 9, 'middle')}`),
    },
    'kyc-by-segment': {
      before: svg(`<rect x="24" y="8" width="112" height="120" rx="6" class="ca-card"/>${Array.from({ length: 8 }, (_, i) => `<rect x="34" y="${18 + i * 13}" width="7" height="7" rx="2" class="ca-dash"/><rect x="46" y="${19 + i * 13}" width="${70 - (i % 3) * 12}" height="4" rx="2" class="ca-bar"/>`).join('')}${badge(168, 40, 'ask', 12)}${T(168, 74, 'Which apply', 'ca-t ca-t-mute', 9, 'middle')}${T(168, 86, 'to me?', 'ca-t ca-t-mute', 9, 'middle')}`),
      after: svg(`${['Individual', 'Company', 'Trust'].map((t, i) => `<rect x="${10 + i * 76}" y="18" width="68" height="100" rx="6" class="${i === 1 ? 'ca-card-on' : 'ca-card'}"/>${T(44 + i * 76, 36, t, 'ca-t', 9, 'middle')}${Array.from({ length: 2 + i }, (_, j) => `<rect x="${20 + i * 76}" y="${48 + j * 16}" width="7" height="7" rx="2" class="ca-card"/><rect x="${31 + i * 76}" y="${49.5 + j * 16}" width="${30 - (j % 2) * 8}" height="4" rx="2" class="ca-bar"/>`).join('')}`).join('')}`),
    },
    'grants-programs': {
      before: svg(`${paper(22, 30, 64, 84, 6, -8)}${paper(34, 24, 64, 84, 6, 4)}${paper(46, 20, 64, 84, 6, 0)}${slot(140, 26, 60, 76)}${T(170, 68, 'Annex B', 'ca-t ca-t-mute', 9, 'middle')}${pill(128, 108, 'Annex B missing', 'bad')}`),
      after: svg(`${paper(16, 20, 72, 96, 7)}${arrow(96, 68, 124)}${['Budget', 'Letters of support', 'Annex B'].map((t, i) => pill(132, 34 + i * 26, t)).join('')}`),
    },
    'applicant-guidance': {
      before: svg(`<rect x="34" y="16" width="56" height="104" rx="10" class="ca-card"/><rect x="42" y="28" width="40" height="72" rx="4" class="ca-soft"/><circle cx="62" cy="110" r="4" class="ca-soft"/><path d="M98 44c8 6 8 18 0 24M106 36c14 10 14 30 0 40" class="ca-line"/>${pill(128, 40, 'On hold · 24 min', 'warn')}${pill(128, 68, 'Form abandoned', 'bad')}`),
      after: svg(`${bubble(84, 14, 140, 'Do I need a site plan?', true)}${bot(26, 64, 12)}<rect x="46" y="46" width="164" height="36" rx="10" class="ca-card"/>${T(58, 61, 'Yes, for new builds over 20m².', 'ca-t', 9)}${T(58, 73, 'Upload it at step 3.', 'ca-t', 9)}${source(46, 90, 'User guide · section 2')}`),
    },
    'internal-policy': {
      before: svg(`${[0, 1, 2].map((r) => [0, 1, 2].map((c) => paper(20 + c * 38, 12 + r * 40, 30, 34, 2)).join('')).join('')}${magnifier(160, 60, 20)}${T(160, 64, '?', 'ca-t', 16, 'middle')}${pill(132, 102, 'Which version?', 'warn')}`),
      after: svg(`${bubble(96, 14, 128, 'How much carer’s leave?', true)}${bot(26, 64, 12)}<rect x="46" y="46" width="150" height="26" rx="10" class="ca-card"/>${T(58, 63, '10 days a year, paid.', 'ca-t', 9)}${source(46, 80, 'HR leave policy · p.4')}`),
    },
    'supplier-onboarding': {
      before: svg(`${['Re: insurance?', 'Re: Re: which cert?', 'Re: Re: Re: still need…'].map((t, i) => `${envelope(18 + i * 10, 14 + i * 34, 44, 28)}${T(74 + i * 10, 32 + i * 34, t, 'ca-t ca-t-mute', 9)}`).join('')}`),
      after: svg(`<rect x="12" y="14" width="96" height="108" rx="6" class="ca-card"/>${['Company', 'Insurance', 'Bank'].map((t, i) => `${i < 1 ? badge(28, 34 + i * 26) : `<circle cx="28" cy="${34 + i * 26}" r="7" class="${i === 1 ? 'ca-blue-wash' : 'ca-card'}"/>`}${T(42, 37 + i * 26, t, i === 1 ? 'ca-t' : 'ca-t ca-t-mute', 9)}`).join('')}${bot(128, 40, 11)}<rect x="116" y="58" width="114" height="36" rx="10" class="ca-card"/>${T(126, 73, 'Public liability', 'ca-t', 9)}${T(126, 85, 'of at least $10m.', 'ca-t', 9)}${source(116, 102, 'Supplier policy')}`),
    },
    'decision-letters': {
      before: svg(`<rect x="44" y="8" width="96" height="120" rx="4" class="ca-card"/>${T(56, 30, 'Dear', 'ca-t', 9)}<path d="M80 22v11" class="ca-cursor"/>${bars(56, 44, 64, 1)}${slot(56, 56, 72, 40)}${clock(182, 44)}${T(182, 74, '40 min each', 'ca-t ca-t-mute', 9, 'middle')}`),
      after: svg(`<rect x="44" y="8" width="112" height="120" rx="4" class="ca-card"/>${T(56, 28, 'Dear', 'ca-t', 9)}<rect x="80" y="19" width="58" height="13" rx="3" class="ca-blue-wash"/>${T(85, 28.5, 'Jane Citizen', 'ca-t ca-t-blue', 8)}${bars(56, 42, 88, 3)}<rect x="56" y="72" width="40" height="13" rx="3" class="ca-blue-wash"/>${T(61, 81.5, 'PA-2291', 'ca-t ca-t-blue', 8)}${bars(56, 92, 70, 2)}<circle cx="178" cy="92" r="24" class="ca-stamp"/>${T(178, 95, 'Approved', 'ca-t ca-t-ok', 9, 'middle')}`),
    },
    'regulator-forms': {
      before: svg(`<rect x="12" y="16" width="80" height="104" rx="4" class="ca-card"/>${T(22, 32, 'Your app', 'ca-t', 9)}${bars(22, 42, 60, 6, 11)}${arrow(98, 68, 136)}${T(117, 58, 'retype', 'ca-t ca-t-mute', 8, 'middle')}<rect x="144" y="16" width="84" height="104" rx="4" class="ca-card"/>${T(154, 32, 'Agency form', 'ca-t', 9)}${[0, 1, 2, 3].map((i) => blank(154, 42 + i * 18, 'Field', 30)).join('')}`),
      after: svg(`<rect x="12" y="30" width="60" height="76" rx="4" class="ca-card"/>${bars(20, 42, 44, 5, 11)}${arrow(78, 68, 96)}${bot(112, 68, 12)}${arrow(128, 68, 142)}<rect x="146" y="12" width="84" height="112" rx="4" class="ca-card"/>${T(154, 28, 'Agency form', 'ca-t', 9)}${['ABN', 'Name', 'Date', 'Total'].map((k, i) => `${T(154, 48 + i * 20, k, 'ca-t ca-t-mute', 8)}<rect x="178" y="${39 + i * 20}" width="${44 - (i % 2) * 10}" height="13" rx="3" class="ca-blue-wash"/>`).join('')}`),
    },
    'agreement-drafts': {
      before: svg(`${paper(14, 22, 54, 72, 5, -6)}${paper(40, 16, 54, 72, 5, 4)}${arrow(100, 58, 128)}<rect x="136" y="12" width="88" height="112" rx="4" class="ca-card"/>${bars(146, 24, 68, 2)}<rect x="146" y="44" width="68" height="14" rx="3" class="ca-warn-wash"/>${T(151, 54, 'Old clause 7.2', 'ca-t ca-t-warn', 8)}${bars(146, 66, 68, 2)}<rect x="146" y="86" width="60" height="14" rx="3" class="ca-warn-wash"/>${T(151, 96, 'Wrong party', 'ca-t ca-t-warn', 8)}`),
      after: svg(`<rect x="52" y="8" width="112" height="120" rx="4" class="ca-card"/>${T(62, 24, 'Services agreement', 'ca-t', 9)}${bars(62, 34, 92, 2)}<rect x="62" y="54" width="64" height="13" rx="3" class="ca-blue-wash"/>${T(67, 63.5, 'Acme Pty Ltd', 'ca-t ca-t-blue', 8)}${bars(62, 74, 92, 2)}<rect x="62" y="94" width="48" height="13" rx="3" class="ca-blue-wash"/>${T(67, 103.5, '12 months', 'ca-t ca-t-blue', 8)}${pill(128, 108, 'Ready for legal')}`),
    },
  };

  const SCENARIOS = [
    { id: 'kyc-identity', win: 'Staff only review [the exceptions]', bad: 'Every passport and licence is checked [by hand].', good: 'AI checks each ID on upload and flags [only the exceptions].', featureId: 'content-understanding', title: 'Know your customer — identity checks',
      quote: 'Every passport and licence gets checked by hand.',
      problem: 'Staff check every passport and licence by hand, so identity checks queue for days.',
      fix: 'AI reads each ID as it’s uploaded, checks it against your rules and flags only the ones that need a person.',
      outcome: 'Staff only review the exceptions', audience: 'Financial services · identity programs' },
    { id: 'insurance-compliance', win: 'Expired or short cover [caught at upload]', bad: 'Assessors open every certificate [to find one date].', good: 'AI pulls out cover and expiry, and [checks your minimums].', featureId: 'content-understanding', title: 'Insurance and certificate compliance',
      quote: 'We open every certificate to find the expiry date.',
      problem: 'Assessors open every certificate to find the expiry date and the amount of cover.',
      fix: 'AI pulls out dates, cover and the named insured, then checks them against your minimums.',
      outcome: 'Expired or short cover caught at upload', audience: 'Insurance · licensing · accreditation' },
    { id: 'permit-credentials', win: 'Mismatches [flagged before approval]', bad: 'Licence numbers are [compared by eye].', good: 'AI [matches every licence] to the user’s record.', featureId: 'content-understanding', title: 'Permits, licences and trade credentials',
      quote: 'Licence numbers get compared by eye, and mistakes slip through.',
      problem: 'Licence numbers are retyped and compared by eye, and mismatches slip through.',
      fix: 'AI extracts the number and expiry and compares them with the user’s record.',
      outcome: 'Mismatches flagged before approval', audience: 'Councils · workforce compliance · permits' },
    { id: 'complete-first-time', win: 'No more [chasing missing documents]', bad: 'Half of applications arrive [missing a document].', good: 'People [can’t submit] until the pack is complete.', featureId: 'document-checklist', title: 'Complete applications, first time',
      quote: 'Half our applications arrive missing a document.',
      problem: 'Applications arrive missing documents, and staff spend days chasing them.',
      fix: 'People see exactly what to upload and can’t submit until the pack is complete.',
      outcome: 'No more chasing missing documents', audience: 'High-volume citizen and customer services' },
    { id: 'kyc-by-segment', win: 'The right evidence [up front]', bad: 'Companies and trusts upload [the wrong evidence].', good: 'Each customer type gets [its own checklist].', featureId: 'document-checklist', title: 'The right evidence for each customer type',
      quote: 'Companies and trusts keep uploading the wrong evidence.',
      problem: 'One long document list confuses people, so companies and trusts upload the wrong evidence.',
      fix: 'Each customer type gets its own checklist, so people only see what applies to them.',
      outcome: 'The right evidence up front', audience: 'KYC · onboarding · regulated intake' },
    { id: 'grants-programs', win: 'Assessors spend their time [on merit]', bad: 'Applications get rejected for [a missing annex].', good: 'Every program’s annexes are [checked before submit].', featureId: 'document-checklist', title: 'Grants and program eligibility',
      quote: 'Assessors reject applications for a missing annex.',
      problem: 'Assessors lose time on applications that are missing a mandatory annex.',
      fix: 'The checklist matches each program to its required annexes before anyone can submit.',
      outcome: 'Assessors spend their time on merit', audience: 'Grants · programs · case management' },
    { id: 'applicant-guidance', win: '[Fewer calls] and abandoned forms', bad: 'People get stuck, then [call you or give up].', good: 'A chatbot [answers at every step], from your guides.', featureId: 'ai-chatbot', title: 'Help people through long forms',
      quote: 'People get stuck halfway through, then call us or give up.',
      problem: 'People get stuck on long forms and call you, or give up.',
      fix: 'A chatbot answers questions at each step, using your guides and policies.',
      outcome: 'Fewer calls and abandoned forms', audience: 'Citizen services · customer onboarding' },
    { id: 'internal-policy', win: 'Answers in seconds, [with the source]', bad: 'Nobody can find [the current policy].', good: 'Staff ask, and get [the answer with its source].', featureId: 'ai-chatbot', title: 'An assistant for internal policy',
      quote: 'Nobody can find the current version of a policy.',
      problem: 'Staff dig through folders of PDFs to find a leave or procurement rule.',
      fix: 'Staff ask a question and get an answer that points to the exact policy.',
      outcome: 'Answers in seconds, with the source', audience: 'Shared services · HR · operations' },
    { id: 'supplier-onboarding', win: 'Suppliers onboard [without the back-and-forth]', bad: 'Suppliers [email five times] to ask what you need.', good: 'Each onboarding step [explains what’s needed].', featureId: 'ai-chatbot', title: 'Supplier onboarding without the email chain',
      quote: 'Suppliers email us five times to ask what we need.',
      problem: 'Suppliers email back and forth to find out which documents and insurance you need.',
      fix: 'A chatbot at each onboarding step explains what’s needed and why.',
      outcome: 'Suppliers onboard without the back-and-forth', audience: 'Procurement · vendor management' },
    { id: 'decision-letters', win: 'Consistent letters [in minutes]', bad: 'Every outcome letter is [written from scratch].', good: 'AI fills your letter [from the case data].', featureId: 'document-creation', title: 'Decision and outcome letters',
      quote: 'Every outcome letter is written from scratch.',
      problem: 'Officers write each outcome letter from scratch, and the wording drifts.',
      fix: 'AI fills your letter template from the case data, ready to review and send.',
      outcome: 'Consistent letters in minutes', audience: 'Determinations · regulatory decisions' },
    { id: 'regulator-forms', win: 'No more [retyping]', bad: 'Answers get [retyped into agency forms].', good: 'AI [fills the agency form] from the app.', featureId: 'document-creation', title: 'Regulator and agency forms',
      quote: 'We retype answers we already have into agency forms.',
      problem: 'Answers already in your app get retyped into agency forms.',
      fix: 'AI fills the agency’s form template from the application answers.',
      outcome: 'No more retyping', audience: 'Compliance reporting · statutory returns' },
    { id: 'agreement-drafts', win: 'A clean first draft [for legal]', bad: 'Drafts are [stitched from old contracts].', good: 'AI drafts from intake, [on your current template].', featureId: 'document-creation', title: 'First drafts of agreements',
      quote: 'Drafts get stitched together from old contracts.',
      problem: 'Drafts are stitched together from old contracts and miss the latest clauses.',
      fix: 'AI drafts the agreement from intake answers using your current house template.',
      outcome: 'A clean first draft for legal', audience: 'Commercial · legal ops · partnerships' },
  ];
  const CASE_SETUP = {
    'kyc-identity': [{ label: 'Document types', items: ['Passport', 'Driver’s licence'] }, { label: 'Rules', items: ['Name matches the person', 'Not expired', 'Photo is clear'] }, { label: 'Pulled out', items: ['Full name', 'Date of birth', 'Document number', 'Expiry'] }],
    'insurance-compliance': [{ label: 'Document types', items: ['Certificate of currency'] }, { label: 'Rules', items: ['Cover of at least $10m', 'Not expired', 'Named insured matches the business'] }, { label: 'Pulled out', items: ['Insurer', 'Policy number', 'Cover amount', 'Expiry'] }],
    'permit-credentials': [{ label: 'Document types', items: ['Trade licence'] }, { label: 'Rules', items: ['Licence number matches the register', 'Not expired', 'Class covers the work'] }, { label: 'Pulled out', items: ['Licence number', 'Class', 'Expiry'] }],
    'complete-first-time': [{ label: 'Checklists', items: ['Standard application'] }, { label: 'Applies when', items: ['Every application'] }, { label: 'Required documents', items: ['Photo ID', 'Proof of address', 'Signed form'] }],
    'kyc-by-segment': [{ label: 'Checklists', items: ['Individual', 'Company', 'Trust'] }, { label: 'Applies when', items: ['Customer type'] }, { label: 'Required documents', items: ['Photo ID', 'Proof of address', 'Company extract', 'Director ID', 'Trust deed'] }],
    'grants-programs': [{ label: 'Checklists', items: ['Community grant', 'Capital works'] }, { label: 'Applies when', items: ['Program chosen'] }, { label: 'Required documents', items: ['Budget', 'Letters of support', 'Annex B'] }],
    'applicant-guidance': [{ label: 'Documents', items: ['User guide', 'Fees and charges', 'Planning policy'] }, { label: 'Instructions', items: ['Answer in plain language', 'Point to the section used', 'Hand over to staff when unsure'] }],
    'internal-policy': [{ label: 'Documents', items: ['HR leave policy', 'Procurement policy', 'Travel policy'] }, { label: 'Instructions', items: ['Answer for staff, not the public', 'Always give the policy and page'] }],
    'supplier-onboarding': [{ label: 'Documents', items: ['Supplier policy', 'Insurance requirements'] }, { label: 'Instructions', items: ['Explain what each step needs and why', 'Hand over to procurement when unsure'] }],
    'decision-letters': [{ label: 'Template', items: ['Outcome letter (Word)'] }, { label: 'Filled from answers', items: ['Full name', 'Reference number', 'Decision', 'Reasons', 'Date'] }, { label: 'Instructions', items: ['Use the approved wording for each decision'] }],
    'regulator-forms': [{ label: 'Template', items: ['Agency form (Word)'] }, { label: 'Filled from answers', items: ['ABN', 'Business name', 'Period', 'Totals'] }, { label: 'Instructions', items: ['Map each answer to its form field'] }],
    'agreement-drafts': [{ label: 'Template', items: ['Services agreement'] }, { label: 'Filled from answers', items: ['Parties', 'Term', 'Fees', 'Special conditions'] }, { label: 'Instructions', items: ['Use the current clause library'] }],
  };
  const PLACEMENT = {
    'content-understanding': 'Runs when documents are uploaded, before anyone assesses them.',
    'document-checklist': 'Shown on the upload step, and holds the submit until the pack is complete.',
    'ai-chatbot': 'Available on every step of the workflow, answering in context.',
    'document-creation': 'Runs after a decision is made, before anything is sent.',
  };

  /* Who Enterprise AI built each one for. PLACEHOLDER pairings for the retest:
     confirm which customer each story belongs to before this goes further. */
  const USED_BY = {
    'kyc-identity': 'Gadali', 'insurance-compliance': 'Gadali', 'kyc-by-segment': 'Gadali', 'regulator-forms': 'Gadali',
    'internal-policy': 'Adaptovate', 'supplier-onboarding': 'Adaptovate', 'agreement-drafts': 'Adaptovate',
    'permit-credentials': 'Councils', 'complete-first-time': 'Councils', 'grants-programs': 'Councils',
    'applicant-guidance': 'Councils', 'decision-letters': 'Councils',
  };
  // Off for now: who each one was built for isn't confirmed. Set to true to show it.
  const SHOW_USED_BY = false;
  const usedBy = (s) => !SHOW_USED_BY ? '' : `<span class="uc-used"><i aria-hidden="true">${esc(USED_BY[s.id][0])}</i>Built by Enterprise AI for ${esc(USED_BY[s.id])}</span>`;

  /* ---- The dialog: PR #150's case study cards and dialog, on the marketing page ---- */
  const art = (id, side) => `<div class="uc-art${side === 'after' ? ' is-after' : ''}">${ART[id]?.[side] || ''}</div>`;
  const count = (fid) => SCENARIOS.filter((s) => s.featureId === fid).length;
  let dialog = null;
  let tab = 'all';

  function listHtml() {
    const list = SCENARIOS.filter((s) => tab === 'all' || s.featureId === tab);
    return `
      <div class="uc-tabs" role="tablist" aria-label="AI feature">
        <button type="button" role="tab" data-uc-tab="all" aria-selected="${tab === 'all'}">All features</button>
        ${ORDER.map((f) => `<button type="button" role="tab" data-uc-tab="${f}" aria-selected="${tab === f}">${esc(FEATURES[f].title)}</button>`).join('')}
      </div>
      <ul class="uc-grid">${list.map((s) => `
        <li><button type="button" class="uc-card" data-uc-open="${esc(s.id)}">
          ${art(s.id, 'after')}
          <span class="uc-card-copy">
            <span class="uc-tag">${esc(FEATURES[s.featureId].title)}</span>
            <b>${esc(s.title)}</b>
            <span class="uc-fix">${esc(s.fix)}</span>
            ${usedBy(s)}
          </span>
        </button></li>`).join('')}
      </ul>`;
  }

  function caseHtml(s) {
    const f = FEATURES[s.featureId];
    return `
      <section class="uc-sec">
        <h4>Before and after</h4>
        <div class="uc-ba">
          <figure>${art(s.id, 'before')}<figcaption><b>Before</b>${esc(s.problem)}</figcaption></figure>
          <span class="uc-ba-arrow" aria-hidden="true">→</span>
          <figure>${art(s.id, 'after')}<figcaption><b>After</b>${esc(s.fix)}</figcaption></figure>
        </div>
      </section>
      <section class="uc-sec">
        <h4>How it’s set up</h4>
        <p class="uc-sec-sub">The ${esc(f.title)} setup behind it. The result: ${esc(s.outcome.charAt(0).toLowerCase() + s.outcome.slice(1))}.</p>
        <dl class="uc-config">${(CASE_SETUP[s.id] || []).map((r) => `<div><dt>${esc(r.label)}</dt><dd>${r.items.map((i) => `<span>${esc(i)}</span>`).join('')}</dd></div>`).join('')}
          <div><dt>Where it runs</dt><dd class="is-text">${esc(PLACEMENT[s.featureId])}</dd></div></dl>
      </section>`;
  }

  function render(view) {
    const hd = dialog.querySelector('.uc-hd-copy');
    const ft = dialog.querySelector('.uc-ft');
    if (view) {
      hd.innerHTML = `<button type="button" class="uc-back" data-uc-back>‹ All use cases</button>
        <span class="uc-tag">${esc(FEATURES[view.featureId].title)}</span><h2 id="ucTitle">${esc(view.title)}</h2>${usedBy(view)}`;
      ft.hidden = false;
      ft.innerHTML = `<button type="button" class="uc-go" data-uc-start>Build an app with ${esc(FEATURES[view.featureId].title)}</button>`;
    } else {
      hd.innerHTML = `<h2 id="ucTitle">Use cases</h2><p>Real jobs people hand to AI. Open one to see how it works.</p>`;
      ft.hidden = true;
    }
    dialog.querySelector('.uc-bd').innerHTML = view ? caseHtml(view) : listHtml();
    dialog.querySelector('.uc-bd').scrollTop = 0;
  }

  function open(featureSite) {
    const fid = ORDER.find((f) => FEATURES[f].site === featureSite);
    tab = fid || 'all';
    dialog = document.createElement('dialog');
    dialog.className = 'uc-dialog';
    dialog.setAttribute('aria-labelledby', 'ucTitle');
    dialog.innerHTML = `
      <header class="uc-hd">
        <div class="uc-hd-copy"></div>
        <button type="button" class="uc-x" data-uc-close aria-label="Close">×</button>
      </header>
      <div class="uc-bd"></div>
      <footer class="uc-ft" hidden></footer>`;
    document.body.append(dialog);
    render(null);
    dialog.addEventListener('click', (e) => {
      const t = e.target;
      if (t === dialog || t.closest('[data-uc-close]')) { dialog.close(); return; }
      const tb = t.closest('[data-uc-tab]');
      if (tb) { tab = tb.dataset.ucTab; render(null); return; }
      const card = t.closest('[data-uc-open]');
      if (card) { render(SCENARIOS.find((s) => s.id === card.dataset.ucOpen)); return; }
      if (t.closest('[data-uc-back]')) { render(null); return; }
      if (t.closest('[data-uc-start]')) {
        dialog.close();
        document.querySelector('.nav-cta[data-action="start"]')?.click();
      }
    });
    dialog.addEventListener('close', () => { dialog.remove(); dialog = null; });
    dialog.showModal();
  }

  /* ---- The CTA under the feature list and the app ---- */
  const cta = document.createElement('div');
  cta.className = 'uc-cta';
  cta.innerHTML = `
    <div><b>See it fix real problems.</b><p>${SCENARIOS.length} real problems, and the AI feature that fixes each one.</p></div>
    <button type="button" class="uc-open" data-uc-launch>See use cases</button>`;
  sec.querySelector('.feat').after(cta);
  cta.querySelector('[data-uc-launch]').addEventListener('click', () => {
    const on = sec.querySelector('.feat-item.on');
    open(on ? on.dataset.feature : null);
  });
  /* Another way in: a "See use cases" button elsewhere on the page (the lean
     site's "who it's for" section) opens the whole list. */
  document.addEventListener('click', (e) => { if (e.target.closest('[data-uc-all]')) open(null); });
})();
