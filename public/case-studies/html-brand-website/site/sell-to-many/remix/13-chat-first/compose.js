/* Remix 13 — the composer: any prompt in, a four-step app out. No model call.

   The four templates in app-core.js only cover what the suggestion pills ask
   for. Type anything else ("a sick leave approval app") and the builder used
   to fall back to Campaign email. This reads the prompt instead, in three
   passes, and stops at the first that lands:

   1. A pack: an app we know well (leave, expenses, invoices, inspections…),
      with its own fields, documents, checks and assistant answers.
   2. A kind: the shape of the work (an approval, an application, an
      assessment, a document review, an inspection, a draft, a booking), with
      general content and the visitor's own words as the app's name.
   3. Neither: the approval shape, and the builder says it's a first guess.

   Whatever it lands on is four steps, each one block (form, upload, source,
   extract, checks, draft, approve) drawn with app-core.js's own pieces, so it
   sits in the same shell, takes the client's brand and re-skins like the
   rest. The four templates still answer the prompts they always did.

   EAIApp.compose(prompt) -> { id, matched, builtin, kind, name, say, how }
   and the app is registered in EAIApp.TEMPLATES under that id. */
(function () {
  'use strict';
  const A = window.EAIApp;
  if (!A || !A.ui) return;
  const { esc, poss, slug } = A;
  const U = A.ui;

  /* ================================================================
     Kinds: the shape of the work, and how the builder describes it
     ================================================================ */
  const KINDS = {
    approve: { say: 'an approval app', how: 'someone asks, AI checks it against policy, then a person decides' },
    intake: { say: 'an application app', how: 'someone applies, adds their documents, AI checks them, then a person approves' },
    assess: { say: 'an assessment app', how: 'someone reports it, adds evidence, AI assesses it, then a person decides' },
    review: { say: 'a document review app', how: 'a document goes in, AI pulls out what matters and checks it, then a person signs off' },
    inspect: { say: 'an inspection app', how: 'someone works through a checklist, AI writes up what they found, then a person signs off' },
    write: { say: 'a drafting app', how: 'a short brief goes in, AI drafts it from your sources, then a person reviews it' },
    book: { say: 'a booking app', how: 'someone asks for a time, it checks what’s free, AI drafts the confirmation, then a person confirms' },
  };
  // Tried in order when no pack matches.
  const KIND_RE = [
    ['approve', /approv|sign[- ]?off|authori[sz]|\brequests?\b/i],
    ['intake', /appl(y|ication)|onboard|regist|intake|sign[- ]?up|admission|nominat/i],
    ['assess', /claim|assess|triage|lodg|\bcases?\b|appeal/i],
    ['review', /review|verif|validat|screen|extract/i],
    ['inspect', /inspect|audit|checklist/i],
    ['write', /writ|draft|generat|compos|letter|summar|notice|template/i],
    ['book', /\bbook|schedul|calendar/i],
  ];

  /* ================================================================
     Blocks: one per step. A step is [label, wire, block, ...what it shows].
     Text can carry tokens: {c} the client, {cs} the client's, {date}, {tone},
     {hello}, {slug}, {S} the app's name, {n} "One approval" / "Two approvals".
     ================================================================ */
  const form = (label, title, sub, fields) => [label, 'Form', 'form', title, sub, fields];
  const upload = (label, title, sub, files) => [label, 'Document upload', 'upload', title, sub, files];
  const source = (label, title, sub, files) => [label, 'Data source', 'source', title, sub, files];
  const extract = (label, title, sub, fields) => [label, 'Extraction', 'extract', title, sub, fields];
  const checks = (label, wire, title, sub, list, rec) => [label, wire, 'checks', title, sub, list, rec];
  const draft = (label, title, sub, heading, body, cta) => [label, 'AI writer', 'draft', title, sub, heading, body, cta];
  const approve = (label, sub, people, list) => [label, 'Approval', 'approve', label, sub, people, list];

  const BLOCKS = {
    form: (f, m, br, [title, sub, fields]) => U.hd(f(title), f(sub)) +
      U.field(f(fields[0][0]), f(fields[0][1])) + U.row(...fields.slice(1).map(([l, v]) => U.field(f(l), f(v)))),
    upload: (f, m, br, [title, sub, files]) => U.hd(f(title), f(sub)) + files.map(([n, meta, wait]) => U.file(f(n), f(meta), wait)).join(''),
    source: (f, m, br, [title, sub, files]) => U.hd(f(title), f(sub)) + files.map((n) => U.file(f(n), 'Synced 2 min ago')).join(''),
    extract: (f, m, br, [title, sub, fields]) => U.hd(f(title), f(sub)) +
      U.row(...fields.slice(0, 2).map(([l, v]) => U.field(f(l), f(v)))) + U.row(...fields.slice(2, 4).map(([l, v]) => U.field(f(l), f(v)))),
    checks: (f, m, br, [title, sub, list, rec]) => U.hd(f(title), f(sub)) + list.map(([t, ok]) => U.check(f(t), !ok)).join('') +
      (rec ? `<div class="arec">${esc(f(rec[0]))} <b>${esc(f(rec[1]))}</b></div>` : ''),
    draft: (f, m, br, [title, sub, heading, body, cta]) => U.hd(f(title), f(sub)) +
      `<div class="amail"><div class="amail-bar">${A.logoHTML(br)}</div><div class="amail-body"><div class="amail-h">${esc(f(heading))}</div><p class="tv">${esc(f(body))}</p>${cta ? `<span class="amail-btn">${esc(f(cta))}</span>` : ''}</div></div>`,
    approve: (f, m, br, [title, sub, people, list]) => U.hd(f(title), f(sub)) + U.approvers(m, people) + list.map(([t, ok]) => U.check(f(t), !ok)).join(''),
  };

  /* ================================================================
     Packs: the apps we know well. First match wins, so the specific ones
     come first ("expense claim" before "claim", "supplier onboarding" before
     "onboarding"). The four templates in app-core.js close the list.
     ================================================================ */
  const PACKS = [
    /* ---------- approve ---------- */
    {
      id: 'leave', kind: 'approve', re: /\bleave\b|time[- ]off|\bpto\b|absence|sick (day|note)|holiday request/i, name: 'Leave request', noun: 'leave request',
      vary(p) {
        const type = /parental/i.test(p) ? 'Parental leave' : /study/i.test(p) ? 'Study leave' : /carer/i.test(p) ? 'Carer’s leave' : 'Annual leave';
        if (/sick|unwell|medical|\bill\b/i.test(p)) {
          return { name: 'Sick leave request', type: 'Sick leave', dates: '14 to 15 October · 2 days', doc: 'medical-certificate.pdf', rule: 'Medical certificate covers both days', left: '8 days of sick leave',
            policy: 'A <b>medical certificate</b> is needed for more than one day in a row. Sam’s covers both days.' };
        }
        return { name: /annual|holiday|vacation|parental|study|carer/i.test(p) ? `${type} request` : 'Leave request', type, dates: '22 to 24 December · 3 days', doc: 'handover-note.docx', rule: 'Handover note attached', left: `11 days of ${type.toLowerCase()}`,
          policy: 'Leave of three days or more needs <b>two weeks’ notice</b> and a handover note. Sam has given both.' };
      },
      steps: [
        form('Request', 'Request leave', 'Three fields. {cs} leave policy does the rest.', [['Leave type', '{type}'], ['Employee', 'Sam Rivera'], ['Dates', '{dates}']]),
        upload('Evidence', 'Evidence', 'Sent from a phone, or pulled from payroll.', [['{doc}', '1 page'], ['leave-balance.csv', 'From payroll'], ['team-calendar.ics', 'From the team calendar']]),
        checks('Check', 'AI check', 'AI check', 'Checked against {cs} leave policy.', [['{rule}', 1], ['Leave balance covers it', 1], ['One other person in the team is away', 0]], ['Recommendation', 'Approve']),
        approve('Approve', '{n} before payroll is updated.', [['Priya Shah', 'Line manager'], ['Morgan Blake', 'People and culture']], [['Check reviewed', 1], ['Reply to Sam drafted — {tone}', 1]]),
      ],
      done: 'Approve leave',
      asks: ['How much leave does Sam have left?', 'Draft a reply to Sam', 'What does our leave policy say?'],
      answers: ['Sam has <b>{left}</b> left this year, before this request.', 'In {cs} voice:<blockquote>Your leave is approved, Sam. {hello}</blockquote>', '{policy}'],
      docs: ['{slug}-leave-policy.pdf', 'enterprise-agreement.pdf'],
      subs: ['Sam Rivera · {type}', 'Jordan Lee · Annual leave', 'Alex Chen · Carer’s leave'],
      kv: ['Read from the evidence', [['Employee', 'Sam Rivera'], ['Leave type', '{type}'], ['Dates', '{dates}']]],
    },
    {
      id: 'expenses', kind: 'approve', re: /expens|reimburs|receipt|petty cash|out[- ]of[- ]pocket|corporate card/i, name: 'Expense claim', noun: 'expense claim',
      steps: [
        form('Claim', 'New expense claim', 'Three fields. {cs} expense policy does the rest.', [['What it was for', 'Client dinner with Harbour & Co'], ['Claimed by', 'Sam Rivera'], ['Amount', '$184.50']]),
        upload('Receipts', 'Receipts', 'Photographed on a phone, straight after paying.', [['dinner-receipt.jpg', '1 photo'], ['taxi-receipt.pdf', '1 page'], ['attendee-list.docx', 'Waiting', 1]]),
        checks('Check', 'AI check', 'AI check', 'Read against {cs} expense policy.', [['Receipts add up to $184.50', 1], ['Within the limit for client meals', 1], ['Attendee list still missing', 0]], ['Recommendation', 'Approve $184.50']),
        approve('Approve', '{n} before it is paid.', [['Priya Shah', 'Line manager'], ['Dana Ortiz', 'Finance']], [['Coded to client entertainment', 1], ['Paid in the next pay run', 1]]),
      ],
      done: 'Approve and pay',
      asks: ['Is this within policy?', 'Summarise this claim', 'What’s our limit for client meals?'],
      answers: ['Yes. The total is under the client meal limit. One thing is missing: the <b>attendee list</b>.', 'Sam is claiming <b>$184.50</b> for a client dinner with Harbour &amp; Co, plus the taxi home. Both receipts are attached.', '{cs} expense policy allows <b>$75 a head</b> for client meals, with the names of everyone who came.'],
      docs: ['{slug}-expense-policy.pdf', 'delegations-of-authority.pdf'],
      subs: ['Sam Rivera · Client dinner', 'Jordan Lee · Conference travel', 'Alex Chen · Team lunch'],
      kv: ['Read from the receipt', [['Supplier', 'The Boathouse'], ['Total', '$162.00'], ['Date', '9 October']]],
    },
    {
      id: 'purchase', kind: 'approve', re: /purchas|procure|\bpos?\b|requisition|capex|spend approval|\bbuy(ing)?\b/i, name: 'Purchase request', noun: 'purchase request',
      steps: [
        form('Request', 'New purchase request', 'Three fields. {cs} buying rules do the rest.', [['What you need', '12 laptops for the new starters'], ['Requested by', 'Sam Rivera'], ['Cost', '$28,800']]),
        upload('Quotes', 'Quotes', 'From suppliers, forwarded by email.', [['quote-harbour-it.pdf', '$28,800'], ['quote-ridgeway-tech.pdf', '$31,200'], ['quote-blue-gum.pdf', 'Waiting', 1]]),
        checks('Check', 'AI check', 'AI check', 'Read against {cs} delegations of authority.', [['Cheapest quote is from a supplier on the panel', 1], ['Budget is available in this cost centre', 1], ['Over the limit for one approver', 0]], ['Recommendation', 'Approve, with a second approver']),
        approve('Approve', '{n} before the order is raised.', [['Priya Shah', 'Budget owner'], ['Dana Ortiz', 'Finance']], [['Quotes compared', 1], ['Purchase order drafted', 1]]),
      ],
      done: 'Approve and raise the order',
      asks: ['Which quote is cheapest?', 'Summarise this request', 'What’s our approval limit?'],
      answers: ['<b>Harbour IT</b>, at $28,800. Ridgeway Tech is $2,400 more for the same laptops.', 'Sam needs <b>12 laptops</b> for the new starters. Two of three quotes are in, and the budget covers it.', '{cs} delegations let one approver sign off up to <b>$20,000</b>. Above that, finance approves too.'],
      docs: ['{slug}-delegations-of-authority.pdf', 'supplier-panel.xlsx'],
      subs: ['12 laptops · $28,800', 'Office chairs · $4,200', 'Annual software renewal · $9,600'],
      kv: ['Read from the quote', [['Supplier', 'Harbour IT'], ['Total', '$28,800'], ['Valid until', '31 October']]],
    },
    {
      id: 'travel', kind: 'approve', re: /travel|\btrips?\b|\bflights?\b|itinerary/i, name: 'Travel request', noun: 'travel request',
      steps: [
        form('Trip', 'Plan a trip', 'Three fields. {cs} travel policy does the rest.', [['Reason', 'Client workshop with Harbour & Co'], ['Traveller', 'Sam Rivera'], ['Dates', '21 to 23 October']]),
        upload('Bookings', 'Flights and hotel', 'Picked from the options that fit the policy.', [['flight-syd-mel.pdf', '$412 return'], ['hotel-two-nights.pdf', '$520'], ['workshop-invite.pdf', 'From the client']]),
        checks('Check', 'AI check', 'AI check', 'Read against {cs} travel policy.', [['Economy fare, booked ahead', 1], ['Hotel is within the nightly rate', 1], ['No cost centre yet', 0]], ['Estimated cost', '$932']),
        approve('Approve', '{n} before anything is booked.', [['Priya Shah', 'Line manager'], ['Dana Ortiz', 'Finance']], [['Costs checked', 1], ['Itinerary sent to Sam', 1]]),
      ],
      done: 'Approve and book',
      asks: ['What will this trip cost?', 'Draft the itinerary for Sam', 'What does our travel policy allow?'],
      answers: ['About <b>$932</b>: $412 for flights and $520 for two nights.', '<blockquote>Sydney to Melbourne on the 21st, two nights near the client, home on the 23rd. {hello}</blockquote>', 'Economy for flights under four hours, and hotels up to <b>$280 a night</b> in capital cities.'],
      docs: ['{slug}-travel-policy.pdf', 'preferred-hotels.xlsx'],
      subs: ['Sam Rivera · Melbourne', 'Jordan Lee · Brisbane', 'Alex Chen · Auckland'],
      kv: ['Read from the booking', [['Route', 'Sydney to Melbourne'], ['Fare', '$412 return'], ['Nights', '2']]],
    },
    {
      id: 'timesheet', kind: 'approve', re: /time ?sheet|overtime|hours worked|log(ging)? (their |my |our )?hours|shift swap|roster/i, name: 'Timesheet approval', noun: 'timesheet',
      steps: [
        form('Hours', 'This week’s hours', 'Three fields. The rest comes from the roster.', [['Week ending', 'Friday 17 October'], ['Employee', 'Sam Rivera'], ['Hours', '41.5']]),
        source('Roster', 'Roster and jobs', 'What the hours are checked against, synced from the roster.', ['roster-week-42.xlsx', 'job-codes.csv', 'leave-calendar.ics']),
        checks('Check', 'AI check', 'AI check', 'Compared with the roster and {cs} award rules.', [['Hours match the roster', 1], ['Breaks taken on every shift', 1], ['3.5 hours of overtime to approve', 0]], ['Overtime', '3.5 hours']),
        approve('Approve', '{n} before it goes to payroll.', [['Priya Shah', 'Team leader'], ['Dana Ortiz', 'Payroll']], [['Overtime reviewed', 1], ['Coded to the right jobs', 1]]),
      ],
      done: 'Approve for payroll',
      asks: ['Why is there overtime?', 'Summarise this week', 'What does the award say about overtime?'],
      answers: ['Sam stayed back on <b>Tuesday and Thursday</b> to finish the Harbour &amp; Co job: 3.5 hours over the roster.', '41.5 hours across five shifts. Everything matches the roster except <b>3.5 hours of overtime</b>.', 'Overtime is paid at <b>time and a half</b> for the first two hours, then double time.'],
      docs: ['{slug}-enterprise-agreement.pdf', 'payroll-calendar.pdf'],
      subs: ['Sam Rivera · 41.5 hrs', 'Jordan Lee · 38 hrs', 'Alex Chen · 36 hrs'],
      kv: ['Read from the roster', [['Rostered', '38 hours'], ['Worked', '41.5 hours'], ['Overtime', '3.5 hours']]],
    },
    {
      id: 'refund', kind: 'approve', re: /refund|credit note|discount|price (override|exception)|write[- ]off|goodwill/i, name: 'Refund request', noun: 'refund request',
      steps: [
        form('Request', 'New refund request', 'Three fields. {cs} refund policy does the rest.', [['Reason', 'Order arrived damaged'], ['Customer', 'Harbour & Co'], ['Amount', '$320.00']]),
        upload('Evidence', 'Evidence', 'From the customer’s email or phone.', [['order-confirmation.pdf', 'Order 20481'], ['damage-photos.zip', '4 photos'], ['courier-report.pdf', 'Waiting', 1]]),
        checks('Check', 'AI check', 'AI check', 'Read against {cs} refund policy.', [['Order found and paid in full', 1], ['Reported within the returns window', 1], ['Courier report still missing', 0]], ['Recommendation', 'Refund $320.00']),
        approve('Approve', '{n} before the money goes back.', [['Riley Nguyen', 'Customer care lead'], ['Dana Ortiz', 'Finance']], [['Evidence reviewed', 1], ['Reply to the customer drafted — {tone}', 1]]),
      ],
      done: 'Approve refund',
      asks: ['Is this customer eligible?', 'Draft a reply to the customer', 'What’s our refund policy?'],
      answers: ['Yes. The order was paid in full and the damage was reported <b>two days</b> after delivery.', 'In {cs} voice:<blockquote>We’re sorry your order arrived damaged. Your refund is on its way. {hello}</blockquote>', 'Damaged orders are refunded in full if reported within <b>30 days</b>, with photos.'],
      docs: ['{slug}-refund-policy.pdf', 'returns-handbook.pdf'],
      subs: ['Order 20481 · Damaged', 'Order 20466 · Wrong item', 'Order 20390 · Late delivery'],
      kv: ['Read from the order', [['Order', '20481'], ['Paid', '$320.00'], ['Delivered', '7 October']]],
    },
    {
      id: 'access', kind: 'approve', re: /access request|system access|(software|equipment|laptop|hardware) request|permissions?\b|\bit request|new (laptop|phone|equipment)/i, name: 'Access request', noun: 'access request',
      steps: [
        form('Request', 'Request access', 'Three fields. The rest is checked for you.', [['System', 'Finance reporting'], ['Requested for', 'Sam Rivera'], ['Needed by', '{date}']]),
        source('Role', 'Role and training', 'What the request is checked against, synced from HR.', ['staff-directory.csv', 'training-records.xlsx', 'access-matrix.xlsx']),
        checks('Check', 'AI check', 'AI check', 'Compared with {cs} access rules.', [['Role is allowed this access', 1], ['Security training is up to date', 1], ['Gives access to payroll data', 0]], ['Recommendation', 'Approve, read only']),
        approve('Approve', '{n} before access is switched on.', [['Priya Shah', 'Line manager'], ['Chris Taylor', 'System owner']], [['Access level confirmed', 1], ['Review date set', 1]]),
      ],
      done: 'Approve access',
      asks: ['Why does Sam need this?', 'Summarise this request', 'What do our access rules say?'],
      answers: ['Sam moved into <b>operations</b> this month and now prepares the monthly finance report.', 'Read-only access to Finance reporting for Sam Rivera. Training is up to date; one flag for payroll data.', 'Access to payroll data needs the <b>system owner</b> to approve, and is reviewed every six months.'],
      docs: ['{slug}-access-policy.pdf', 'information-security-standard.pdf'],
      subs: ['Sam Rivera · Finance reporting', 'Jordan Lee · CRM admin', 'Alex Chen · Shared drive'],
      kv: ['Read from the staff directory', [['Role', 'Operations coordinator'], ['Team', 'Operations'], ['Manager', 'Priya Shah']]],
    },

    /* ---------- intake ---------- */
    {
      id: 'newstarter', kind: 'intake', re: /new (starter|hire|employee|staff)|(employee|staff|hr) onboarding|onboard(ing)? (new )?(employees|staff|hires|starters)|induction/i, name: 'New starter onboarding', noun: 'onboarding',
      steps: [
        form('Details', 'New starter details', 'Who’s joining {c}, and when.', [['Name', 'Sam Lee'], ['Role', 'Operations coordinator'], ['Start date', '{date}']]),
        upload('Documents', 'Documents', 'Uploaded by the new starter before day one.', [['photo-id.jpg', 'Received'], ['tax-declaration.pdf', 'Received'], ['bank-details.pdf', 'Waiting', 1]]),
        checks('Checks', 'AI checklist', 'AI checks', 'Checked against {cs} onboarding checklist.', [['Photo ID matches the name', 1], ['Tax declaration signed and dated', 1], ['Bank details still missing', 0]]),
        approve('Approve', '{n}, then the welcome email goes out in {cs} voice.', [['Priya Shah', 'Hiring manager'], ['Morgan Blake', 'People and culture']], [['All checks reviewed', 1], ['Welcome email drafted — {tone}', 1]]),
      ],
      done: 'Approve and welcome',
      asks: ['What’s still missing?', 'Draft the welcome email', 'What does a new starter need before day one?'],
      answers: ['Just one thing: Sam’s <b>bank details</b>. Want me to send a reminder?', 'In {cs} voice:<blockquote>Welcome to {c}, Sam. {hello}</blockquote>', '<b>Photo ID</b>, a <b>tax declaration</b> and <b>bank details</b> before day one. A laptop is ready on the first morning.'],
      docs: ['{slug}-staff-handbook.pdf', 'onboarding-checklist.docx'],
      subs: ['Sam Lee · Operations', 'Jordan Lee · Marketing', 'Alex Chen · Finance'],
      kv: ['Read from the photo ID', [['Name', 'Sam Lee'], ['Date of birth', '02/05/1996'], ['Expires', '11/2031']]],
    },
    {
      id: 'supplier', kind: 'intake', re: /supplier|vendor|subcontractor|contractor/i, name: 'Supplier onboarding', noun: 'supplier application',
      steps: [
        form('Details', 'Supplier details', 'Who wants to work with {c}.', [['Business', 'Harbour & Co'], ['ABN', '51 824 753 556'], ['Contact', 'Sam Rivera']]),
        upload('Documents', 'Documents', 'Uploaded by the supplier through {cs} portal.', [['certificate-of-currency.pdf', 'Received'], ['bank-details.pdf', 'Received'], ['safety-policy.pdf', 'Waiting', 1]]),
        checks('Checks', 'AI checklist', 'AI checks', 'Checked against {cs} supplier policy.', [['ABN is active and matches the business name', 1], ['Public liability cover of $20m', 1], ['Insurance expires in 12 days', 0]]),
        approve('Approve', '{n} before the supplier can be paid.', [['Alex Chen', 'Procurement lead'], ['Dana Ortiz', 'Finance']], [['All checks reviewed', 1], ['Welcome pack drafted — {tone}', 1]]),
      ],
      done: 'Approve supplier',
      asks: ['What’s still missing?', 'Draft a note to the supplier', 'What insurance do suppliers need?'],
      answers: ['The <b>safety policy</b>. Their insurance is also due to expire in 12 days.', 'In {cs} voice:<blockquote>Thanks, Sam. We need one more document before you’re set up: your safety policy. {hello}</blockquote>', 'Suppliers need <b>public liability of at least $10m</b> and a current certificate of currency.'],
      docs: ['{slug}-supplier-policy.pdf', 'insurance-requirements.pdf'],
      subs: ['Harbour & Co', 'Ridgeway Partners', 'Blue Gum Studio'],
      kv: ['Read from the certificate', [['Insurer', 'Southern Mutual'], ['Cover', '$20m'], ['Expires', '24 October']]],
    },
    {
      id: 'grant', kind: 'intake', re: /\bgrants?\b|funding (application|round|request)|scholarship|bursary|sponsorship/i, name: 'Grant application', noun: 'grant application',
      steps: [
        form('Project', 'About the project', 'Three fields to start an application to {c}.', [['Project', 'Riverbank community garden'], ['Applicant', 'Blue Gum Community Group'], ['Amount', '$18,000']]),
        upload('Documents', 'Documents', 'What the program asks every applicant for.', [['project-budget.xlsx', 'Received'], ['letters-of-support.pdf', '2 letters'], ['annex-b.pdf', 'Waiting', 1]]),
        checks('Checks', 'AI checklist', 'AI checks', 'Checked against the program guidelines.', [['Applicant is an eligible organisation', 1], ['Budget adds up to the amount asked for', 1], ['Annex B still missing', 0]]),
        approve('Decide', '{n} before the applicant hears back.', [['Jordan Lee', 'Grants officer'], ['Jo Park', 'Program manager']], [['Eligibility confirmed', 1], ['Outcome letter drafted — {tone}', 1]]),
      ],
      done: 'Approve grant',
      asks: ['Is this applicant eligible?', 'Summarise this application', 'What do the guidelines require?'],
      answers: ['Yes. They’re an <b>incorporated community group</b> in the program area.', '$18,000 for a community garden by the river, with two letters of support. <b>Annex B</b> is still to come.', 'Every application needs a <b>budget</b>, <b>letters of support</b> and <b>Annex B</b>.'],
      docs: ['{slug}-grant-guidelines.pdf', 'assessment-criteria.pdf'],
      subs: ['Riverbank community garden', 'Youth sports equipment', 'Library after-hours program'],
      kv: ['Read from the budget', [['Total', '$18,000'], ['Own contribution', '$4,500'], ['Line items', '9']]],
    },
    {
      id: 'loan', kind: 'intake', re: /\bloans?\b|credit (application|assessment|check)|mortgage|\blending|finance application/i, name: 'Loan application', noun: 'loan application',
      steps: [
        form('Details', 'About the loan', 'Three fields to start an application with {c}.', [['Purpose', 'Equipment for a new workshop'], ['Applicant', 'Harbour & Co'], ['Amount', '$85,000']]),
        upload('Documents', 'Documents', 'Uploaded by the applicant through {cs} portal.', [['financial-statements.pdf', '2 years'], ['bank-statements.pdf', '6 months'], ['directors-id.pdf', 'Waiting', 1]]),
        checks('Checks', 'AI assessor', 'AI checks', 'Read against {cs} lending policy.', [['Income covers the repayments', 1], ['Two years of trading history', 1], ['Director’s ID still missing', 0]], ['Recommendation', 'Approve $85,000']),
        approve('Decide', '{n} before the offer is sent.', [['Riley Nguyen', 'Lending officer'], ['Dana Ortiz', 'Credit manager']], [['Assessment reviewed', 1], ['Offer letter drafted — {tone}', 1]]),
      ],
      done: 'Approve loan',
      asks: ['Can they afford the repayments?', 'Summarise this application', 'What does our lending policy need?'],
      answers: ['Yes. Repayments sit <b>well inside</b> what the policy allows for their income.', 'Harbour &amp; Co want <b>$85,000</b> for workshop equipment. Two years of accounts are in; one ID is missing.', '<b>Two years of accounts</b>, six months of bank statements and ID for every director.'],
      docs: ['{slug}-lending-policy.pdf', 'credit-handbook.pdf'],
      subs: ['Harbour & Co · $85,000', 'Ridgeway Partners · $40,000', 'Blue Gum Studio · $12,500'],
      kv: ['Read from the accounts', [['Revenue', '$1.2m'], ['Net profit', '$148,000'], ['Years trading', '2']]],
    },
    {
      id: 'tenancy', kind: 'intake', re: /\btenan|\brental|rent(ing)? (application|a property)|leasing application/i, name: 'Rental application', noun: 'rental application',
      steps: [
        form('Details', 'About the applicant', 'Three fields to apply for a property with {c}.', [['Property', '12 Bay St, Sydney'], ['Applicant', 'Sam Rivera'], ['Move-in date', '{date}']]),
        upload('Documents', 'Documents', 'Uploaded from the applicant’s phone.', [['photo-id.jpg', 'Received'], ['payslips.pdf', '3 payslips'], ['rental-history.pdf', 'Waiting', 1]]),
        checks('Checks', 'AI checklist', 'AI checks', 'Checked against {cs} application rules.', [['Photo ID matches the applicant', 1], ['Income is more than three times the rent', 1], ['Rental history still missing', 0]]),
        approve('Approve', '{n} before the lease is offered.', [['Alex Chen', 'Property manager'], ['Jo Park', 'Owner']], [['References checked', 1], ['Lease drafted', 1]]),
      ],
      done: 'Approve application',
      asks: ['What’s still missing?', 'Summarise this applicant', 'What do we need from every applicant?'],
      answers: ['Sam’s <b>rental history</b>. Everything else is in.', 'Sam Rivera, for 12 Bay St. The ID checks out and the income covers the rent comfortably.', '<b>Photo ID</b>, three recent <b>payslips</b> and a <b>rental history</b> or two references.'],
      docs: ['{slug}-application-rules.pdf', 'tenancy-checklist.docx'],
      subs: ['12 Bay St · Sam Rivera', '4/88 Crown St · Jordan Lee', '7 Wattle Ave · Alex Chen'],
      kv: ['Read from the payslips', [['Employer', 'Harbour & Co'], ['Pay', 'Fortnightly'], ['Since', 'March 2023']]],
    },

    /* ---------- write, review ---------- */
    {
      id: 'jobad', kind: 'write', re: /job ad|position description|job description|vacanc|role description/i, name: 'Job ad', noun: 'job ad',
      steps: [
        form('Brief', 'About the role', 'Three fields. The rest is written for you.', [['Role', 'Operations coordinator'], ['Team', 'Operations'], ['Closing date', '{date}']]),
        source('Sources', 'Sources', 'What the ad draws on, synced from your drive.', ['position-description.docx', '{slug}-employer-brand.pdf', 'salary-bands.xlsx']),
        draft('Draft', 'Draft', 'Written by AI from the brief and sources, in {cs} voice.', 'Operations coordinator', 'Keep our projects moving. You’ll plan the week, look after our suppliers and make sure the team has what it needs.', 'Apply now'),
        approve('Review', '{n} before it is posted.', [['Priya Shah', 'Hiring manager'], ['Morgan Blake', 'People and culture']], [['Salary band shown', 1], ['Inclusive language checked', 1]]),
      ],
      done: 'Approve and post',
      asks: ['Make it shorter', 'Suggest three headlines', 'What’s our tone of voice?'],
      answers: ['<blockquote>Plan the week, look after suppliers, keep the team moving. Operations coordinator at {c}.</blockquote>', '<ul><li>Keep {c} moving</li><li>Operations coordinator: own the week</li><li>Join the team behind the work</li></ul>', 'From {cs} employer brand guide: <b>“{tone}.”</b>'],
      docs: ['{slug}-employer-brand.pdf', 'position-description.docx'],
      subs: ['Operations coordinator', 'Account manager', 'Finance analyst'],
      kv: ['Pulled from the position description', [['Reports to', 'Operations lead'], ['Hours', 'Full time'], ['Location', 'Sydney']]],
    },
    {
      id: 'cv', kind: 'review', re: /job application|recruit|hiring|candidate|applicant|\bcvs?\b|resum[eé]|résumé|shortlist/i, name: 'Candidate screening', noun: 'application',
      steps: [
        upload('Upload', 'Upload the application', 'For the Operations coordinator role at {c}.', [['sam-rivera-cv.pdf', '2 pages'], ['cover-letter.pdf', '1 page'], ['referees.docx', 'Waiting', 1]]),
        extract('Extract', 'Key details', 'Pulled from the CV automatically.', [['Candidate', 'Sam Rivera'], ['Experience', '6 years in operations'], ['Current role', 'Team coordinator'], ['Notice period', '4 weeks']]),
        checks('Check', 'AI checklist', 'Checked against the role', 'The must-haves from the position description.', [['Three or more years in operations', 1], ['Has managed suppliers', 1], ['No mention of the rostering system', 0]], ['Match', 'Strong']),
        approve('Shortlist', '{n} before the candidate hears back.', [['Priya Shah', 'Hiring manager'], ['Morgan Blake', 'People and culture']], [['Screening reviewed', 1], ['Interview invite drafted — {tone}', 1]]),
      ],
      done: 'Shortlist candidate',
      asks: ['Is Sam a good match?', 'Draft the interview invite', 'What are the must-haves for this role?'],
      answers: ['A <b>strong</b> match: six years in operations and supplier experience. One gap: the rostering system.', 'In {cs} voice:<blockquote>Hi Sam, we’d love to meet you. {hello}</blockquote>', '<b>Three years in operations</b>, supplier management, and experience with a rostering system.'],
      docs: ['position-description.docx', '{slug}-hiring-guide.pdf'],
      subs: ['Sam Rivera · Strong', 'Jordan Lee · Good', 'Alex Chen · Partial'],
      kv: ['Read on upload', [['Pages', '2'], ['Roles listed', '4'], ['Referees', '0']]],
    },
    {
      id: 'identity', kind: 'review', re: /identity|\bid (check|verification)|verify(ing)? (an? |their |the )?id\b|passport|proof of (identity|age)/i, name: 'Identity check', noun: 'identity check',
      steps: [
        upload('Upload', 'Upload the ID', 'A photo is enough. Taken on the customer’s phone.', [['passport.jpg', '1 photo'], ['proof-of-address.pdf', '1 page'], ['selfie.jpg', '1 photo']]),
        extract('Extract', 'Key details', 'Read from the ID automatically.', [['Full name', 'Sam Rivera'], ['Date of birth', '14/03/1988'], ['Document number', 'PA4471208'], ['Expires', '11/2031']]),
        checks('Check', 'AI checklist', 'Checked against the rules', '{cs} identity rules, one by one.', [['Name matches the customer record', 1], ['Not expired', 1], ['Proof of address is more than three months old', 0]]),
        approve('Sign-off', '{ns} before the account is opened.', [['Riley Nguyen', 'Onboarding officer'], ['Morgan Blake', 'Compliance']], [['Exceptions reviewed', 1], ['Record kept for audit', 1]]),
      ],
      done: 'Verify identity',
      asks: ['Does this ID pass?', 'Summarise the exceptions', 'What do our identity rules need?'],
      answers: ['Almost. The passport is fine; the <b>proof of address</b> is too old.', 'One exception: the proof of address is dated more than three months ago. Everything else passes.', 'A <b>current photo ID</b> and a <b>proof of address</b> from the last three months.'],
      docs: ['{slug}-identity-rules.pdf', 'aml-ctf-program.pdf'],
      subs: ['Sam Rivera · Passport', 'Jordan Lee · Driver licence', 'Alex Chen · Passport'],
      kv: ['Read on upload', [['Document', 'Passport'], ['Country', 'Australia'], ['Photo', 'Clear']]],
    },
    {
      id: 'permit', kind: 'intake', re: /permit|licen[cs]e|development application|\bda\b|planning (application|approval)|building approval|council/i, name: 'Permit application', noun: 'permit application',
      steps: [
        form('Details', 'About the application', 'Three fields to apply to {c}.', [['Work', 'New deck at the rear of the house'], ['Applicant', 'Sam Rivera'], ['Address', '12 Bay St, Sydney']]),
        upload('Documents', 'Documents', 'What every application of this type needs.', [['site-plan.pdf', 'Received'], ['owners-consent.pdf', 'Received'], ['structural-drawings.pdf', 'Waiting', 1]]),
        checks('Checks', 'AI checklist', 'AI checks', 'Checked against {cs} planning rules.', [['Site plan shows the boundaries', 1], ['Owner’s consent is signed', 1], ['Structural drawings still missing', 0]]),
        approve('Decide', '{n} before the applicant hears back.', [['Jordan Lee', 'Assessing officer'], ['Jo Park', 'Team leader']], [['Assessment reviewed', 1], ['Decision letter drafted — {tone}', 1]]),
      ],
      done: 'Approve permit',
      asks: ['What’s still missing?', 'Draft the decision letter', 'What do the rules say about decks?'],
      answers: ['The <b>structural drawings</b>. The site plan and owner’s consent are in.', 'In {cs} voice:<blockquote>Dear Sam, your application for a new deck at 12 Bay St has been approved. {hello}</blockquote>', 'A deck over <b>one metre high</b> needs structural drawings and must sit inside the boundary setbacks.'],
      docs: ['{slug}-planning-rules.pdf', 'fees-and-charges.pdf'],
      subs: ['12 Bay St · New deck', '4 Crown St · Carport', '7 Wattle Ave · Front fence'],
      kv: ['Read from the site plan', [['Lot size', '612 m²'], ['Deck area', '24 m²'], ['Setback', '1.5 m']]],
    },

    /* ---------- assess ---------- */
    {
      id: 'complaint', kind: 'assess', re: /complaint|grievance|dispute|escalation/i, name: 'Complaint handling', noun: 'complaint',
      steps: [
        form('Complaint', 'What went wrong?', 'Tell {c} about it in three fields.', [['What happened', 'Charged twice for one order'], ['Customer', 'Sam Rivera'], ['Date', '9 October']]),
        upload('Evidence', 'Evidence', 'From the customer’s email or phone.', [['bank-statement.pdf', '1 page'], ['order-confirmation.pdf', 'Order 20481'], ['chat-transcript.txt', 'From support']]),
        checks('Assess', 'AI assessor', 'AI assessment', 'Read against {cs} complaints policy.', [['Two charges found for one order', 1], ['Reported within the time limit', 1], ['Customer has complained before', 0]], ['Recommendation', 'Refund and apologise']),
        approve('Decision', '{n} before the customer hears back.', [['Riley Nguyen', 'Customer care lead'], ['Dana Ortiz', 'Customer care manager']], [['Assessment reviewed', 1], ['Reply drafted — {tone}', 1]]),
      ],
      done: 'Resolve complaint',
      asks: ['Summarise this complaint', 'Draft a reply to the customer', 'What does our complaints policy say?'],
      answers: ['Sam was charged <b>twice</b> for order 20481 on 9 October. The bank statement shows both charges.', 'In {cs} voice:<blockquote>We’re sorry, Sam. We charged you twice, and we’ve refunded the second payment. {hello}</blockquote>', 'Complaints get a reply within <b>five working days</b>, and billing errors are refunded in full.'],
      docs: ['{slug}-complaints-policy.pdf', 'customer-charter.pdf'],
      subs: ['Charged twice · Order 20481', 'Late delivery · Order 20466', 'Wrong item · Order 20390'],
      kv: ['Read from the statement', [['Charges', '2'], ['Each', '$160.00'], ['Date', '9 October']]],
    },
    {
      id: 'incident', kind: 'assess', re: /incident|hazard|near[- ]miss|accident|injur|\bwhs\b|\bohs\b|safety report/i, name: 'Incident report', noun: 'incident report',
      steps: [
        form('Incident', 'What happened?', 'Three fields, from a phone, on site.', [['What happened', 'Slipped on a wet floor in the loading dock'], ['Reported by', 'Sam Rivera'], ['When', '14 October, 7:40 am']]),
        upload('Evidence', 'Evidence', 'Photos and statements, straight from the site.', [['dock-photos.zip', '3 photos'], ['witness-statement.pdf', '1 page'], ['first-aid-record.pdf', 'Waiting', 1]]),
        checks('Assess', 'AI assessor', 'AI assessment', 'Read against {cs} safety procedures.', [['No time off work needed', 1], ['Spill kit was in place', 1], ['Third slip in this area this year', 0]], ['Risk rating', 'Medium']),
        approve('Sign-off', '{ns} before it is closed.', [['Chris Taylor', 'Site supervisor'], ['Morgan Blake', 'Safety manager']], [['Actions assigned', 1], ['Regulator does not need to be told', 1]]),
      ],
      done: 'Close incident',
      asks: ['Summarise this incident', 'What actions do you suggest?', 'What does our procedure say about slips?'],
      answers: ['Sam slipped on a wet floor in the loading dock at 7:40 am. <b>No injury</b>, but it’s the third slip there this year.', '<ul><li>Non-slip matting at the dock door</li><li>Check the drain after rain</li><li>Toolbox talk this week</li></ul>', 'Every slip is recorded, and <b>three in one area</b> triggers a review of the floor surface.'],
      docs: ['{slug}-safety-procedures.pdf', 'risk-matrix.pdf'],
      subs: ['Slip · Loading dock', 'Near miss · Forklift', 'Hazard · Blocked exit'],
      kv: ['Read from the statement', [['Location', 'Loading dock'], ['Injury', 'None'], ['Witnesses', '1']]],
    },
    {
      id: 'warranty', kind: 'assess', re: /warrant|faulty|\brma\b|product returns?|returns? (request|portal|form)/i, name: 'Warranty claim', noun: 'warranty claim',
      steps: [
        form('Problem', 'What’s wrong?', 'Tell {c} about the fault.', [['Fault', 'Battery no longer holds charge'], ['Customer', 'Sam Rivera'], ['Product', 'Cordless drill D-18']]),
        upload('Evidence', 'Evidence', 'From the customer’s phone.', [['receipt.pdf', 'Bought 2 March'], ['fault-video.mp4', '20 seconds'], ['serial-number.jpg', '1 photo']]),
        checks('Assess', 'AI assessor', 'AI assessment', 'Read against {cs} warranty terms.', [['Bought within the warranty period', 1], ['Serial number is genuine', 1], ['Batteries are covered for 12 months only', 0]], ['Recommendation', 'Replace the battery']),
        approve('Decision', '{n} before the replacement ships.', [['Riley Nguyen', 'Warranty officer'], ['Dana Ortiz', 'Service manager']], [['Assessment reviewed', 1], ['Customer note drafted — {tone}', 1]]),
      ],
      done: 'Approve claim',
      asks: ['Is this covered?', 'Draft a note to the customer', 'What do our warranty terms cover?'],
      answers: ['Yes. It was bought <b>seven months ago</b>, inside the 12 months that cover batteries.', 'In {cs} voice:<blockquote>Good news, Sam. A new battery is on its way. {hello}</blockquote>', 'Tools are covered for <b>three years</b>, batteries and chargers for <b>12 months</b>.'],
      docs: ['{slug}-warranty-terms.pdf', 'service-handbook.pdf'],
      subs: ['Cordless drill · Battery', 'Circular saw · Guard', 'Sander · Motor'],
      kv: ['Read from the receipt', [['Bought', '2 March'], ['Store', 'Bay St'], ['Price', '$189.00']]],
    },
    {
      id: 'maintenance', kind: 'assess', re: /maintenance|work orders?|\brepairs?\b|job card|service call|facilit|fault report|pothole|defect/i, name: 'Maintenance request', noun: 'maintenance request',
      steps: [
        form('Request', 'What needs fixing?', 'Three fields, from a phone.', [['Problem', 'Air conditioning not cooling on level 3'], ['Reported by', 'Sam Rivera'], ['Location', '12 Bay St, level 3']]),
        upload('Photos', 'Photos', 'Taken where the problem is.', [['thermostat.jpg', '1 photo'], ['ceiling-unit.jpg', '1 photo'], ['last-service-report.pdf', 'From the asset register']]),
        checks('Triage', 'AI assessor', 'AI triage', 'Read against {cs} asset register and service contracts.', [['Unit is under a service contract', 1], ['Last serviced in March', 1], ['Second fault on this unit this year', 0]], ['Priority', 'High']),
        approve('Approve', '{n} before the job is sent out.', [['Chris Taylor', 'Facilities lead'], ['Dana Ortiz', 'Finance']], [['Contractor chosen', 1], ['Work order drafted', 1]]),
      ],
      done: 'Approve work order',
      asks: ['How urgent is this?', 'Draft the work order', 'What does the service contract cover?'],
      answers: ['<b>High.</b> Level 3 is occupied and it’s the second fault on this unit this year.', '<blockquote>Attend 12 Bay St, level 3. Air conditioning not cooling. Unit last serviced in March.</blockquote>', 'The contract covers <b>call-outs and labour</b>. Parts over $500 need approval first.'],
      docs: ['asset-register.xlsx', '{slug}-service-contracts.pdf'],
      subs: ['Air conditioning · Level 3', 'Leaking tap · Kitchen', 'Broken lock · Side gate'],
      kv: ['Read from the asset register', [['Asset', 'AC-0312'], ['Installed', '2019'], ['Contractor', 'Coolwise']]],
    },

    /* ---------- review, inspect ---------- */
    {
      id: 'invoice', kind: 'review', re: /\binvoic|accounts payable|\bbills?\b|payables/i, name: 'Invoice approval', noun: 'invoice',
      steps: [
        upload('Upload', 'Upload the invoice', 'Forwarded from email, or dropped in here.', [['invoice-4471.pdf', '1 page'], ['purchase-order-208.pdf', 'From the finance system'], ['delivery-docket.pdf', 'Signed']]),
        extract('Extract', 'Key details', 'Read from the invoice automatically.', [['Supplier', 'Harbour & Co'], ['Invoice number', 'INV-4471'], ['Total', '$2,340.00'], ['Due', '31 October']]),
        checks('Check', 'AI checklist', 'Matched and checked', 'Against the purchase order and {cs} payment rules.', [['Total matches purchase order 208', 1], ['Goods were delivered and signed for', 1], ['Bank details changed since the last invoice', 0]]),
        approve('Approve', '{n} before it is paid.', [['Dana Ortiz', 'Accounts payable'], ['Priya Shah', 'Budget owner']], [['Coded to the right cost centre', 1], ['Scheduled for the next payment run', 1]]),
      ],
      done: 'Approve for payment',
      asks: ['Does this match the order?', 'Summarise this invoice', 'What do our payment rules say?'],
      answers: ['Yes: <b>$2,340.00</b> on both. One thing to check first: the supplier’s <b>bank details have changed</b>.', 'INV-4471 from Harbour &amp; Co for $2,340.00, due 31 October. It matches the order and the delivery docket.', 'Any <b>change of bank details</b> is confirmed by phone before payment. Invoices are paid within 30 days.'],
      docs: ['{slug}-payment-rules.pdf', 'delegations-of-authority.pdf'],
      subs: ['INV-4471 · Harbour & Co', 'INV-0932 · Ridgeway Partners', 'INV-2210 · Blue Gum Studio'],
      kv: ['Read on upload', [['Line items', '4'], ['GST', '$212.73'], ['Terms', '30 days']]],
    },
    {
      id: 'compliance', kind: 'review', re: /compliance|due diligence|risk assessment|policy review|attestation|controls? (test|review)/i, name: 'Compliance review', noun: 'review',
      steps: [
        upload('Upload', 'Upload the evidence', 'For this quarter’s review at {c}.', [['access-review-q3.xlsx', '3 sheets'], ['training-register.csv', 'From HR'], ['incident-log.pdf', 'Waiting', 1]]),
        extract('Extract', 'Key details', 'Pulled from the evidence automatically.', [['Period', 'July to September'], ['Control owner', 'Morgan Blake'], ['Training', 'Above target'], ['Access removed late', '3 accounts']]),
        checks('Check', 'AI checklist', 'Checked against the controls', '{cs} controls, one by one.', [['Access reviewed every quarter', 1], ['Training is above the target', 1], ['Three leavers kept access for more than a day', 0]]),
        approve('Sign-off', '{ns} before it goes to the committee.', [['Morgan Blake', 'Compliance lead'], ['Jo Park', 'Chief risk officer']], [['Exceptions explained', 1], ['Report drafted', 1]]),
      ],
      done: 'Sign off',
      asks: ['What are the exceptions?', 'Summarise for the committee', 'What does the control require?'],
      answers: ['One: <b>three leavers</b> kept system access for more than a day after they left.', '<blockquote>Two of three controls passed this quarter. One exception on leaver access, with a fix under way.</blockquote>', 'Access must be removed on a person’s <b>last day</b>, and reviewed every quarter.'],
      docs: ['{slug}-control-library.xlsx', 'information-security-standard.pdf'],
      subs: ['Q3 access review', 'Q3 training', 'Q2 access review'],
      kv: ['Read on upload', [['Files', '2'], ['Sheets', '3'], ['Period', 'Q3']]],
    },
    {
      id: 'inspection', kind: 'inspect', re: /inspect|site (visit|audit|check)|safety (check|walk|audit)|pre[- ]start|condition report|walk-?through|checklist|\baudits?\b/i, name: 'Site inspection', noun: 'inspection',
      steps: [
        form('Site', 'Where are you?', 'Three fields, on a phone, on site.', [['Site', '12 Bay St, Sydney'], ['Inspector', 'Sam Rivera'], ['Date', '{date}']]),
        checks('Checklist', 'Checklist', 'Checklist', '{cs} checklist, ticked off as you walk around.', [['Exits are clear and signed', 1], ['Fire extinguishers are in date', 1], ['Loose handrail on the level 2 stairs', 0]]),
        draft('Findings', 'Findings', 'Written up by AI from the checklist and photos.', 'Inspection of 12 Bay St', 'Two of three checks passed. One item needs fixing: the handrail on the level 2 stairs is loose.'),
        approve('Sign-off', '{ns} before the report is sent.', [['Chris Taylor', 'Site supervisor'], ['Morgan Blake', 'Safety manager']], [['Findings reviewed', 1], ['Fix assigned', 1]]),
      ],
      done: 'Sign off',
      asks: ['What needs fixing?', 'Summarise for the site manager', 'What does our standard say about handrails?'],
      answers: ['One thing: the <b>handrail on the level 2 stairs</b> is loose.', '<blockquote>12 Bay St passed two of three checks. The level 2 handrail needs fixing.</blockquote>', 'Handrails must be <b>fixed and continuous</b> on every stair. A loose one is fixed within seven days.'],
      docs: ['{slug}-inspection-standard.pdf', 'site-register.xlsx'],
      subs: ['12 Bay St · 1 to fix', '88 Crown St · Passed', '7 Wattle Ave · 2 to fix'],
      kv: ['Read from the photos', [['Photos', '6'], ['Items checked', '3'], ['To fix', '1']]],
    },

    /* ---------- write, book ---------- */
    {
      id: 'proposal', kind: 'write', re: /proposal|quot(e|es|ation)\b|estimate|tender|\bbids?\b|\brfp\b|statement of work|\bsow\b|pitch/i, name: 'Proposal', noun: 'proposal',
      steps: [
        form('Brief', 'About the job', 'Three fields. The rest is written for you.', [['What they need', 'A new booking website'], ['Client', 'Harbour & Co'], ['Due', '{date}']]),
        source('Sources', 'Sources', 'What the proposal draws on, synced from your drive.', ['rate-card.xlsx', 'case-studies.pdf', '{slug}-proposal-template.docx']),
        draft('Draft', 'Draft', 'Written by AI from the brief and sources, in {cs} voice.', 'A new booking website for Harbour & Co', 'We’ll design and build a booking website your customers can use on any device, in three stages: discover, build and launch.', 'See the price'),
        approve('Review', '{n} before it goes to the client.', [['Jordan Lee', 'Account lead'], ['Dana Ortiz', 'Finance']], [['Prices match the rate card', 1], ['Terms and conditions attached', 1]]),
      ],
      done: 'Approve and send',
      asks: ['Make the summary shorter', 'Suggest three titles', 'What’s on our rate card?'],
      answers: ['<blockquote>A booking website for Harbour &amp; Co, built in three stages.</blockquote>', '<ul><li>A new booking website for Harbour &amp; Co</li><li>Bookings made simple</li><li>From enquiry to booked</li></ul>', 'Design is <b>$1,400 a day</b> and build is <b>$1,600 a day</b>, from {cs} rate card.'],
      docs: ['rate-card.xlsx', '{slug}-proposal-template.docx'],
      subs: ['Harbour & Co · Booking website', 'Ridgeway Partners · Brand refresh', 'Blue Gum Studio · Online shop'],
      kv: ['Pulled from the rate card', [['Design', '$1,400 a day'], ['Build', '$1,600 a day'], ['Valid for', '30 days']]],
    },
    {
      id: 'support', kind: 'write', re: /support|help ?desk|\btickets?\b|service desk|enquir|inquir|customer service|\bfaqs?\b/i, name: 'Support request', noun: 'support request',
      steps: [
        form('Enquiry', 'What do they need?', 'Three fields, or forwarded straight from email.', [['Question', 'How do I change my delivery address?'], ['Customer', 'Sam Rivera'], ['Received', 'Today, 9:12 am']]),
        source('Context', 'Context', 'What the reply draws on, synced from your systems.', ['help-centre-articles.pdf', 'order-history.csv', '{slug}-tone-of-voice.docx']),
        draft('Reply', 'Reply', 'Drafted by AI from the help centre, in {cs} voice.', 'Changing your delivery address', 'Hi Sam. You can change the address any time before your order ships: open the order, choose Edit delivery and save. {hello}', 'Open my order'),
        approve('Review', '{n} before the reply is sent.', [['Riley Nguyen', 'Support lead'], ['Dana Ortiz', 'Customer care manager']], [['Answer matches the help centre', 1], ['Tone of voice — {tone}', 1]]),
      ],
      done: 'Approve and send',
      asks: ['Make the reply shorter', 'Has this customer asked before?', 'What does the help centre say?'],
      answers: ['<blockquote>Open your order, choose Edit delivery and save, any time before it ships.</blockquote>', 'Once, in March, about a late delivery. It was resolved the same day.', 'Addresses can be changed <b>until the order ships</b>. After that, the courier redirects it for a fee.'],
      docs: ['help-centre-articles.pdf', '{slug}-tone-of-voice.docx'],
      subs: ['Change delivery address', 'Where is my order?', 'Update my payment card'],
      kv: ['Pulled from the order history', [['Orders', '7'], ['Last order', '9 October'], ['Status', 'Packed']]],
    },
    {
      id: 'social', kind: 'write', re: /social|linkedin|\bblogs?\b|press release|media release|\barticles?\b|content calendar|\bposts?\b|announcement/i, name: 'Social post', noun: 'post',
      steps: [
        form('Brief', 'About the post', 'Three fields. The rest is written for you.', [['What to say', '{goal}'], ['Channel', 'LinkedIn'], ['Publish on', '{date}']]),
        source('Assets', 'Assets', 'What the post draws on, synced from your drive.', ['{slug}-brand-guide.pdf', 'tone-of-voice.docx', 'product-shots.zip']),
        draft('Draft', 'Draft', 'Written by AI from the brief and assets, in {cs} voice.', '{c} on LinkedIn', '{short}', 'Read more'),
        approve('Review', '{n} before it is published.', [['Jordan Lee', 'Marketing lead'], ['Priya Shah', 'Brand manager']], [['Brand colours and logo', 1], ['Tone of voice — {tone}', 1]]),
      ],
      done: 'Approve and publish',
      asks: ['Make it shorter', 'Suggest three hashtags', 'What’s our tone of voice?'],
      answers: ['<blockquote>{short}</blockquote>', '<ul><li>#{slug}</li><li>#whatsnew</li><li>#madeforyou</li></ul>', 'From {cs} brand guide: <b>“{tone}.”</b>'],
      docs: ['{slug}-brand-guide.pdf', 'tone-of-voice.docx'],
      subs: ['Launch announcement', 'Customer story', 'Hiring post'],
      kv: ['Pulled from the brand guide', [['Primary colour', '{b}'], ['Voice', '{tone}'], ['Hashtag', '#{slug}']]],
    },
    {
      id: 'booking', kind: 'book', re: /\bbook(ing|ings|s)?\b|reserv|appointment|schedul|\brsvp\b|\bevents?\b|room hire|\bvenue/i, name: 'Booking request', noun: 'booking',
      steps: [
        form('Request', 'What do you need?', 'Three fields. The rest is checked for you.', [['What', 'Meeting room for a client workshop'], ['Booked by', 'Sam Rivera'], ['When', '{date}, 10 am']]),
        source('Availability', 'What’s free', 'Checked against the calendars.', ['room-calendar.ics', 'staff-calendar.ics', 'catering-menu.pdf']),
        draft('Confirm', 'Confirmation', 'Drafted by AI, in {cs} voice.', 'You’re booked: the Harbour Room', 'The Harbour Room is yours on {date} from 10 am to 12 pm. It seats 12, and the screen is set up. {hello}', 'Add to calendar'),
        approve('Approve', '{n} before the confirmation is sent.', [['Alex Chen', 'Front of house'], ['Priya Shah', 'Office manager']], [['No clashes', 1], ['Catering ordered', 1]]),
      ],
      done: 'Confirm booking',
      asks: ['What else is free that day?', 'Is the afternoon free?', 'What are our booking rules?'],
      answers: ['The <b>Bay Room</b> all day, and the Harbour Room again from 2 pm.', 'Yes. The Harbour Room is free from <b>2 pm to 4 pm</b>.', 'Rooms can be booked up to <b>four weeks ahead</b>, and catering needs two days’ notice.'],
      docs: ['{slug}-booking-rules.pdf', 'room-guide.pdf'],
      subs: ['Harbour Room · Client workshop', 'Bay Room · Team meeting', 'Harbour Room · Board meeting'],
      kv: ['Pulled from the calendar', [['Room', 'Harbour Room'], ['Seats', '12'], ['Free', '10 am to 12 pm']]],
    },
    {
      id: 'enrol', kind: 'intake', re: /enrol|membership|member (sign|registration)|registration|admission/i, name: 'Enrolment', noun: 'enrolment',
      steps: [
        form('Details', 'About you', 'Three fields to join {c}.', [['Program', 'Evening course, term 4'], ['Name', 'Sam Rivera'], ['Start date', '{date}']]),
        upload('Documents', 'Documents', 'Uploaded from a phone.', [['photo-id.jpg', 'Received'], ['concession-card.jpg', 'Received'], ['prior-results.pdf', 'Waiting', 1]]),
        checks('Checks', 'AI checklist', 'AI checks', 'Checked against {cs} entry requirements.', [['Photo ID matches the name', 1], ['Concession card is current', 1], ['Prior results still missing', 0]]),
        approve('Approve', '{n}, then the welcome email goes out in {cs} voice.', [['Alex Chen', 'Admissions officer'], ['Jo Park', 'Program manager']], [['Place available', 1], ['Welcome email drafted — {tone}', 1]]),
      ],
      done: 'Approve and welcome',
      asks: ['What’s still missing?', 'Draft the welcome email', 'What are the entry requirements?'],
      answers: ['Sam’s <b>prior results</b>. Everything else is in.', 'In {cs} voice:<blockquote>Welcome, Sam. Your place is confirmed. {hello}</blockquote>', '<b>Photo ID</b>, and <b>prior results</b> for anyone asking for credit. Concession cards must be current.'],
      docs: ['{slug}-entry-requirements.pdf', 'fees-and-concessions.pdf'],
      subs: ['Sam Rivera · Term 4', 'Jordan Lee · Term 4', 'Alex Chen · Term 1'],
      kv: ['Read from the photo ID', [['Name', 'Sam Rivera'], ['Date of birth', '14/03/1988'], ['Expires', '11/2031']]],
    },
    {
      id: 'survey', kind: 'write', re: /survey|questionnaire|\bpolls?\b|feedback|\bnps\b/i, name: 'Survey', noun: 'survey',
      steps: [
        form('Questions', 'Tell us how we did', 'Three questions. It takes a minute.', [['How did we do?', 'Great, but delivery was slow'], ['Score', '8 out of 10'], ['Can we contact you?', 'Yes']]),
        source('Responses', 'Responses', 'Every answer so far, in one place.', ['responses-october.csv', 'responses-september.csv', 'customer-list.xlsx']),
        draft('Summary', 'Summary', 'Written by AI from every response.', 'What customers told us in October', 'Most people are happy with the product. The most common complaint is slow delivery.'),
        approve('Review', '{n} before the summary is shared.', [['Jordan Lee', 'Customer insights'], ['Priya Shah', 'Head of customer']], [['Quotes checked against the responses', 1], ['Names removed', 1]]),
      ],
      done: 'Approve and share',
      asks: ['What’s the top complaint?', 'Summarise in one line', 'What did we promise about feedback?'],
      answers: ['<b>Slow delivery.</b> It comes up more than anything else.', '<blockquote>Happy with the product, unhappy with delivery times.</blockquote>', '{cs} customer charter says every response is read, and themes are shared <b>every month</b>.'],
      docs: ['{slug}-customer-charter.pdf', 'survey-method.pdf'],
      subs: ['Sam Rivera · 8 out of 10', 'Jordan Lee · 10 out of 10', 'Alex Chen · 6 out of 10'],
      kv: ['Pulled from the responses', [['Average score', '8.1'], ['Top theme', 'Delivery'], ['Period', 'October']]],
    },
    {
      id: 'report', kind: 'write', re: /\breports?\b|reporting|board paper|briefing|minutes|status update|summar/i, name: 'Monthly report', noun: 'report',
      steps: [
        form('Brief', 'About the report', 'Three fields. The rest is written for you.', [['Report', 'Operations report, October'], ['For', 'The leadership team'], ['Due', '{date}']]),
        source('Data', 'Data', 'What the report draws on, synced from your systems.', ['october-figures.xlsx', 'project-status.csv', 'last-months-report.pdf']),
        draft('Draft', 'Draft', 'Written by AI from the brief and data, in {cs} voice.', 'Operations report, October', 'Work is on track. Two projects finished this month, and one is running late while it waits on a supplier.'),
        approve('Review', '{n} before it is sent.', [['Priya Shah', 'Operations lead'], ['Jo Park', 'General manager']], [['Figures match the source data', 1], ['Tone of voice — {tone}', 1]]),
      ],
      done: 'Approve and send',
      asks: ['Make the summary shorter', 'What changed since last month?', 'What’s our reporting standard?'],
      answers: ['<blockquote>On track. Two projects finished; one is running late.</blockquote>', 'Two projects moved to <b>done</b>, and one slipped while it waits on a supplier.', 'Reports lead with a <b>one-paragraph summary</b>, then the figures, then the risks.'],
      docs: ['{slug}-reporting-standard.pdf', 'last-months-report.pdf'],
      subs: ['Operations report · October', 'Operations report · September', 'Board paper · Q3'],
      kv: ['Pulled from the figures', [['Projects', '9'], ['Finished', '2'], ['Late', '1']]],
    },

    /* ---------- app-core.js's four templates, as they always matched ---------- */
    { builtin: 'campaign', re: /campaign|e-?mail|newsletter|marketing|edm|promo/i },
    { builtin: 'claims', re: /claim|insur/i },
    { builtin: 'onboarding', re: /onboard|intake|new client|new customer|kyc|sign[- ]?up/i },
    { builtin: 'docreview', re: /document|contract|legal|\blaw\b|lawyer|clause|review/i },
  ];

  /* ---------- a kind with nothing more specific: general content, the visitor's name ---------- */
  const GENERIC = {
    approve: {
      id: 'g-approve', kind: 'approve', name: 'Approval request', noun: 'request',
      steps: [
        form('Request', 'New request', 'Three fields. The rest is checked for you.', [['Request', '{S}'], ['Requested by', 'Sam Rivera'], ['Needed by', '{date}']]),
        upload('Evidence', 'Evidence', 'Whatever backs the request up, from a phone or a laptop.', [['supporting-document.pdf', 'Received'], ['reference.pdf', 'Received'], ['manager-note.docx', 'Waiting', 1]]),
        checks('Check', 'AI check', 'AI check', 'Checked against {cs} policy.', [['Everything the policy asks for is here', 1], ['Within the usual limits', 1], ['Manager’s note still missing', 0]], ['Recommendation', 'Approve']),
        approve('Approve', '{n} before it goes ahead.', [['Priya Shah', 'Line manager'], ['Morgan Blake', 'Operations']], [['Check reviewed', 1], ['Reply drafted — {tone}', 1]]),
      ],
      done: 'Approve',
      asks: ['What’s still missing?', 'Draft a reply to Sam', 'What does our policy say?'],
      answers: ['One thing: the <b>manager’s note</b>. Everything else is in.', 'In {cs} voice:<blockquote>Thanks, Sam. Your request is approved. {hello}</blockquote>', '{cs} policy asks for <b>a supporting document</b> and <b>a manager’s note</b> with every request.'],
      docs: ['{slug}-policy.pdf', 'delegations-of-authority.pdf'],
      subs: ['Sam Rivera · Waiting', 'Jordan Lee · In progress', 'Alex Chen · Approved'],
      kv: ['Read on upload', [['Requested by', 'Sam Rivera'], ['Needed by', '{date}'], ['Pages', '2']]],
    },
    intake: {
      id: 'g-intake', kind: 'intake', name: 'Application', noun: 'application',
      steps: [
        form('Details', '{S}', 'Three fields to get started with {c}.', [['Name', 'Sam Rivera'], ['Email', 'sam@harbourandco.com'], ['Start date', '{date}']]),
        upload('Documents', 'Documents', 'Uploaded through {cs} portal.', [['photo-id.pdf', 'Received'], ['signed-form.pdf', 'Received'], ['supporting-document.pdf', 'Waiting', 1]]),
        checks('Checks', 'AI checklist', 'AI checks', 'Checked against {cs} requirements.', [['Photo ID matches the name', 1], ['Form is signed and dated', 1], ['Supporting document still missing', 0]]),
        approve('Approve', '{n} before Sam hears back.', [['Alex Chen', 'Team lead'], ['Morgan Blake', 'Compliance']], [['All checks reviewed', 1], ['Reply drafted — {tone}', 1]]),
      ],
      done: 'Approve',
      asks: ['What’s still missing?', 'Draft a reply to Sam', 'What do we need from everyone?'],
      answers: ['Just the <b>supporting document</b>.', 'In {cs} voice:<blockquote>Thanks, Sam. You’re all set. {hello}</blockquote>', '<b>Photo ID</b>, a <b>signed form</b> and one <b>supporting document</b>.'],
      docs: ['{slug}-requirements.pdf', 'checklist.docx'],
      subs: ['Sam Rivera', 'Jordan Lee', 'Alex Chen'],
      kv: ['Read from the photo ID', [['Name', 'Sam Rivera'], ['Date of birth', '14/03/1988'], ['Expires', '11/2031']]],
    },
    assess: {
      id: 'g-assess', kind: 'assess', name: 'Case assessment', noun: 'case',
      steps: [
        form('Report', 'What happened?', 'Tell {c} about it in three fields.', [['About', '{S}'], ['Reported by', 'Sam Rivera'], ['Date', '{date}']]),
        upload('Evidence', 'Evidence', 'Photos and documents, from a phone.', [['photos.zip', '4 photos'], ['supporting-document.pdf', '1 page'], ['statement.pdf', 'Waiting', 1]]),
        checks('Assess', 'AI assessor', 'AI assessment', 'Read against {cs} policy.', [['Evidence supports what was reported', 1], ['Covered by the policy', 1], ['Statement still missing', 0]], ['Recommendation', 'Approve']),
        approve('Decision', '{n} before Sam hears back.', [['Riley Nguyen', 'Case officer'], ['Dana Ortiz', 'Manager']], [['Assessment reviewed', 1], ['Reply drafted — {tone}', 1]]),
      ],
      done: 'Decide',
      asks: ['Summarise this case', 'Draft a reply to Sam', 'What does our policy say?'],
      answers: ['Reported by Sam Rivera. The evidence supports it; one <b>statement</b> is still to come.', 'In {cs} voice:<blockquote>Thanks, Sam. We’ve looked into it, and here’s what happens next. {hello}</blockquote>', '{cs} policy needs <b>evidence</b> and a <b>signed statement</b> before a decision.'],
      docs: ['{slug}-policy.pdf', 'case-handbook.pdf'],
      subs: ['Case 20481 · Sam Rivera', 'Case 20477 · Jordan Lee', 'Case 20470 · Alex Chen'],
      kv: ['Read on upload', [['Reported by', 'Sam Rivera'], ['Photos', '4'], ['Pages', '1']]],
    },
    review: {
      id: 'g-review', kind: 'review', name: 'Document check', noun: 'review',
      steps: [
        upload('Upload', 'Upload the document', 'For {c}. Drop it in, or forward it from email.', [['document.pdf', '12 pages'], ['cover-note.docx', '1 page'], ['appendix.pdf', 'Waiting', 1]]),
        extract('Extract', 'Key details', 'Pulled from the document automatically.', [['For', '{S}'], ['From', 'Harbour & Co'], ['Dated', '9 October'], ['Pages', '12']]),
        checks('Check', 'AI checklist', 'Checked against your rules', '{cs} rules, one by one.', [['Everything required is filled in', 1], ['Dates and names are consistent', 1], ['One section needs a closer look', 0]]),
        approve('Sign-off', '{ns} before it goes back.', [['Chris Taylor', 'Reviewer'], ['Jo Park', 'Manager']], [['Flags reviewed', 1], ['Reply drafted — {tone}', 1]]),
      ],
      done: 'Sign off',
      asks: ['What needs a closer look?', 'Summarise this document', 'What do our rules require?'],
      answers: ['<b>Section 4.</b> The dates there don’t match the cover note.', '<blockquote>A 12-page document from Harbour &amp; Co, dated 9 October. One section to check.</blockquote>', '{cs} rules need every section <b>complete</b>, <b>dated</b> and <b>signed</b>.'],
      docs: ['{slug}-review-rules.pdf', 'checklist.docx'],
      subs: ['Harbour & Co · 9 October', 'Ridgeway Partners · 2 October', 'Blue Gum Studio · 28 September'],
      kv: ['Read on upload', [['Pages', '12'], ['Sections', '6'], ['Signatures', '2']]],
    },
    write: {
      id: 'g-write', kind: 'write', name: 'Draft', noun: 'draft',
      steps: [
        form('Brief', 'The brief', 'Three fields. The rest is written for you.', [['What to write', '{S}'], ['For', 'Harbour & Co'], ['Due', '{date}']]),
        source('Sources', 'Sources', 'What the draft draws on, synced from your drive.', ['{slug}-brand-guide.pdf', 'tone-of-voice.docx', 'reference-notes.docx']),
        draft('Draft', 'Draft', 'Written by AI from the brief and sources, in {cs} voice.', '{S}', 'A first draft, written from your brief and the documents you chose. {hello}'),
        approve('Review', '{n} before it is sent.', [['Jordan Lee', 'Editor'], ['Priya Shah', 'Brand manager']], [['Facts match the sources', 1], ['Tone of voice — {tone}', 1]]),
      ],
      done: 'Approve and send',
      asks: ['Make it shorter', 'Suggest three titles', 'What’s our tone of voice?'],
      answers: ['<blockquote>A shorter draft, same message. {hello}</blockquote>', '<ul><li>{S}</li><li>{S}, made simple</li><li>What you need to know</li></ul>', 'From {cs} brand guide: <b>“{tone}.”</b>'],
      docs: ['{slug}-brand-guide.pdf', 'tone-of-voice.docx'],
      subs: ['Harbour & Co · Draft', 'Ridgeway Partners · In review', 'Blue Gum Studio · Sent'],
      kv: ['Pulled from the brand guide', [['Primary colour', '{b}'], ['Voice', '{tone}'], ['Reading level', 'Plain English']]],
    },
  };
  GENERIC.inspect = PACKS.find((p) => p.id === 'inspection');
  GENERIC.book = PACKS.find((p) => p.id === 'booking');

  /* ================================================================
     Reading the prompt: what the visitor called the thing
     ================================================================ */
  const LEAD = /^(?:(?:hey|hi|hello|ok|okay|please)[,!. ]+)*(?:(?:can|could|would) you (?:please )?|i(?:['’]d| would)? (?:like|love|want|need)(?: you)?(?: to)? |we(?:['’]d| would)? (?:like|want|need)(?: you)?(?: to)? |let['’]?s |help me (?:to )?)?(?:(?:build|make|create|design|set up|generate|spin up|have|get)\s+)?(?:(?:me|us)\s+)?/i;
  const APP_WORD = /\b(?:web |mobile |little |simple |quick |basic |custom |internal )*(?:apps?|tools?|systems?|workflows?|portals?|platforms?|software|solutions?|trackers?|something|thing)\b/gi;
  // "an app to approve purchase orders" -> "purchase order approval"
  const VERB_NOUN = [['approv', 'approval'], ['request', 'request'], ['review', 'review'], ['manag', 'management'], ['track', 'tracking'], ['process', 'processing'],
    ['handl', 'handling'], ['book', 'booking'], ['check', 'check'], ['onboard', 'onboarding'], ['inspect', 'inspection'], ['assess', 'assessment'],
    ['screen', 'screening'], ['schedul', 'scheduling'], ['triag', 'triage'], ['log', 'log'], ['collect', 'collection'], ['verif', 'verification']];
  const NOT_A_NAME = /\b(i|we|they|you|their|his|her|is|are|can|should|will|want|need|lets?|my|our|to)\b/i;
  const TOO_PLAIN = /^(approvals?|requests?|forms?|applications?|reviews?|checks?|new|one)$/i;

  const ACRONYM = { cv: 'CV', cvs: 'CVs', hr: 'HR', nda: 'NDA', kyc: 'KYC', whs: 'WHS', crm: 'CRM', rfp: 'RFP', linkedin: 'LinkedIn' };

  function subjectOf(text) {
    let s = String(text).trim().replace(/[.!?]+$/, '').replace(LEAD, '').replace(/^(?:a|an|the|my|our|some|one)\s+/i, '');
    s = s.replace(APP_WORD, ' ').replace(/\s+/g, ' ').trim();
    const m = /^(?:for|to)\s+([a-z]+)\s+(.+)$/i.exec(s);
    if (m) {
      const vn = VERB_NOUN.find(([stem]) => m[1].toLowerCase().startsWith(stem));
      const rest = m[2].split(/\s+(?:for|that|which|where|who|when|so|with|and then)\s+|[,;:—–]/)[0];
      if (vn && rest) s = `${rest.replace(/([^s])s$/i, '$1')} ${vn[1]}`;
    }
    s = (' ' + s).split(/\s+(?:for|that|which|where|who|when|so|with|and then)\s+|[,;:—–]/)[0].trim();
    const words = s.split(/\s+/).filter(Boolean);
    if (!words.length || words.length > 5 || s.length > 40 || NOT_A_NAME.test(s) || TOO_PLAIN.test(s)) return '';
    // Sentence case, keeping what the visitor wrote in capitals (HR, IT, NDA).
    const out = words.map((w) => (w.length <= 5 && w === w.toUpperCase() && /[A-Z]/.test(w) ? w : ACRONYM[w.toLowerCase()] || w.toLowerCase())).join(' ');
    return out.charAt(0).toUpperCase() + out.slice(1);
  }

  /* ================================================================
     From a pack to a template app-core.js can draw
     ================================================================ */
  const swap = (str, x, safe) => String(str).replace(/\{(\w+)\}/g, (m, k) => (k in x ? (safe ? esc(x[k]) : x[k]) : m));

  function template(pack, id, name, text) {
    const vars = Object.assign({ S: name }, pack.vary ? pack.vary(text) : null);
    const ctx = (br, m) => {
      const v = A.voiceOf(br);
      const two = m && m.approvers === 2;
      return Object.assign({
        c: br.name, cs: poss(br.name), date: br.date, tone: br.tone, goal: br.goal, slug: slug(br.name), b: br.b, hello: v.hello, short: v.short,
        n: two ? 'Two approvals' : 'One approval', ns: two ? 'Two sign-offs' : 'One sign-off',
      }, vars);
    };
    // The step the Checklist and Extraction features attach to: where the
    // documents are, or the checklist itself when the app has none.
    const has = (...kinds) => pack.steps.findIndex((s) => kinds.includes(s[2]));
    const at = has('upload', 'source') >= 0 ? has('upload', 'source') : Math.max(0, has('checks'));
    const docStep = pack.steps[at];
    return {
      id, name, noun: pack.noun, kind: pack.kind, prompt: text,
      steps: pack.steps.map((s) => [s[0], s[1]]),
      cta: pack.steps.map((s, i) => (i < 3 ? `Next: ${pack.steps[i + 1][0].toLowerCase()}` : pack.done)),
      featureStep: { checklist: at, extract: at },
      render(br, m, i) {
        const x = ctx(br, m);
        const s = pack.steps[i];
        return BLOCKS[s[2]]((str) => swap(str, x), m, br, s.slice(3));
      },
      features: {
        checklist(br) {
          const x = ctx(br);
          const items = docStep[2] === 'upload' ? docStep[5].map(([n, , wait]) => [swap(n, x), !wait])
            : docStep[2] === 'source' ? docStep[5].map((n) => [swap(n, x), true])
              : pack.steps.find((s) => s[2] === 'checks')[5].map(([t, ok]) => [swap(t, x), !!ok]);
          return U.block('checklist', `Document checklist · ${items.filter((i) => i[1]).length} of ${items.length}`, U.cl(items));
        },
        extract(br) {
          const x = ctx(br);
          return U.block('extract', swap(pack.kv[0], x), U.kv(pack.kv[1].map(([k, v]) => [swap(k, x), swap(v, x)])));
        },
      },
      docs: (br) => pack.docs.map((d) => swap(d, ctx(br))),
      asks: pack.asks,
      answer: (br, q, m) => swap(pack.answers[q], ctx(br, m), true),
      submissions: pack.subs.map((s) => swap(s, vars)),
    };
  }

  function compose(prompt) {
    const text = String(prompt || '').trim();
    const hit = PACKS.find((p) => p.re.test(text));
    if (hit && hit.builtin) return { id: hit.builtin, matched: true, builtin: true, name: A.TEMPLATES[hit.builtin].name };
    const kindHit = hit ? null : KIND_RE.find(([, re]) => re.test(text));
    const pack = hit || GENERIC[kindHit ? kindHit[0] : 'approve'];
    const varied = pack.vary ? pack.vary(text) : null;
    // The visitor's own words name the app; failing that (or if they gave one
    // word the pack's name already has, "leave"), what the pack calls it.
    const packName = (varied && varied.name) || pack.name;
    const said = subjectOf(text);
    const name = said && !(said.indexOf(' ') < 0 && packName.toLowerCase().includes(said.toLowerCase())) ? said : packName;
    const id = 'x-' + (slug(text).slice(0, 48) || 'app');
    A.TEMPLATES[id] = template(pack, id, name, text);
    const k = KINDS[pack.kind];
    return { id, matched: !!(hit || kindHit), builtin: false, kind: pack.kind, pack: pack.id, name, say: k.say, how: k.how };
  }

  A.compose = compose;
})();
