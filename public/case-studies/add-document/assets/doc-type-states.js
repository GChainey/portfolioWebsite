/* Add document (AI Document Review) — state machine.

   Independent axes, so any document can be paired with any set of rules,
   focus and extras. Each combination renders the real dialog from
   admin-doc-type-dialog.js; changing an axis updates the open dialog in place. */
(() => {
  /* ---------------------------------------------------------------- data */
  const DOCS = {
    empty: { name: '', label: 'Empty',
      description: 'A document uploaded with the request, showing the person’s name and the date it was issued.',
      rules: {
        few: ['Name matches the applicant', 'Dated in the last 3 months', 'Signed by the applicant'],
        many: ['Name matches the applicant', 'Dated in the last 3 months', 'Signed by the applicant', 'Shows the details the request needs', 'Address matches the application', 'Every page is uploaded', 'Text is readable', 'Not a photocopy of a photocopy'],
      },
      unknown: 'Reference number matches the request', typing: 'Issued by a government agency' },
    license: { name: 'Driver’s license', label: 'Driver’s license',
      description: 'A current US driver’s license showing the holder’s name, photo, address, date of birth and expiration date.',
      rules: {
        few: ['Holder is 18 or over', 'License hasn’t expired', 'Name matches the applicant', 'Address matches the application'],
        many: ['Holder is 18 or over', 'License hasn’t expired', 'Name matches the applicant', 'Address matches the application', 'Photo is clear and shows the face', 'Signature is present', 'License number is present', 'License class is D'],
        twenty: [
          'Holder is 18 or over',
          'License hasn’t expired',
          'Name matches the applicant',
          'Address matches the application',
          'Photo is clear and shows the face',
          'Signature is present',
          'License number is present',
          'License class is D',
          'Issued by a US state or territory',
          'Date of birth matches the application',
          'Not a learner permit',
          'Expiration date is at least 30 days away',
          'Name matches the payroll record',
          'ZIP code is in New York State',
          'The person in the photo is the same person as in the selfie they uploaded during onboarding, allowing for changes in hair, glasses and age since the photo was taken',
          'Has no restrictions that would stop the person driving a company vehicle as part of their role, such as a daytime-only restriction or a requirement for an ignition interlock device',
          'If the card is marked “Not for federal identification”, flag it for HR, because we need a REAL ID–compliant license or a passport for federal contracts',
          'Both sides of the card are uploaded',
          'Image isn’t blurred or cropped',
          'Card hasn’t been altered',
        ],
      },
      unknown: 'Organ donor status is shown', typing: 'Photo is clear and shows the face' },
    note: { name: 'Doctor’s note', label: 'Doctor’s note',
      description: 'A note from a licensed doctor confirming the dates someone was unable to work, signed and dated by the doctor.',
      rules: {
        few: ['Covers the dates of leave requested', 'Signed by a licensed doctor', 'Name matches the employee'],
        many: ['Covers the dates of leave requested', 'Signed by a licensed doctor', 'Name matches the employee', 'Dated within 7 days of the leave', 'States the person couldn’t work', 'Clinic name and address are shown', 'Doctor’s NPI number is present', 'On clinic letterhead'],
        twenty: [
          'Covers the dates of leave requested',
          'Signed by a licensed doctor',
          'Name matches the employee',
          'Dated within 7 days of the leave',
          'States the person couldn’t work',
          'Clinic name and address are shown',
          'Doctor’s NPI number is present',
          'On clinic letterhead',
          'Return-to-work date is given',
          'Doesn’t name the diagnosis',
          'Date of birth matches the employee record',
          'If the leave is more than three consecutive days, the note must say the person was seen in person or by video, not just by phone, so it counts toward FMLA certification',
          'Visit date is on or before the first day of leave',
          'Any work restrictions on return, such as no lifting over 20 pounds or reduced hours, are listed so the manager can plan duties',
          'Clinic phone number is present',
          'Doctor’s name is printed, not only signed',
          'Not written by a family member of the employee',
          'If the note was issued by an urgent care clinic or telehealth provider rather than the employee’s regular doctor, flag it for review but don’t reject it',
          'Image isn’t blurred or cropped',
          'Document hasn’t been altered',
        ],
      },
      unknown: 'Insurance member ID is listed', typing: 'Dated within 7 days of the leave' },
    // Other has no name: you type your own, and the preview follows.
    other: { name: '', label: 'Other',
      description: 'A certificate of insurance showing the insured business, the policy dates and the general liability limits.',
      rules: {
        few: ['Name matches the applicant', 'Dated in the last 12 months', 'Covers general liability of at least $1 million'],
        many: ['Name matches the applicant', 'Dated in the last 12 months', 'Covers general liability of at least $1 million', 'Policy is current', 'Our company is listed as certificate holder', 'Insurer is named', 'Policy number is present', 'Signed by an authorized representative'],
        twenty: [
          'Name matches the applicant',
          'Dated in the last 12 months',
          'Covers general liability of at least $1 million',
          'Policy is current',
          'Our company is listed as certificate holder',
          'Insurer is named',
          'Policy number is present',
          'Signed by an authorized representative',
          'Includes workers’ compensation coverage',
          'Includes auto liability coverage',
          'Policy dates cover the whole contract period, from the start date on the purchase order to the end date, including any renewal options we might take up',
          'Our company is named as an additional insured on the general liability policy, with the endorsement number shown in the description of operations box',
          'Insurer has an A.M. Best rating of A- or better',
          'Umbrella or excess coverage of at least $5 million',
          'Producer contact details are present',
          'On the standard ACORD 25 form',
          'If any coverage ends before the contract does, flag it for procurement with the date it ends, so they can ask for a renewed certificate before work continues',
          'Waiver of subrogation is noted',
          'Image isn’t blurred or cropped',
          'Document hasn’t been altered',
        ],
      },
      unknown: 'Company matches our insurers', typing: 'Policy dates cover the contract period' },
  };
  DOCS.empty.rules.twenty = DOCS.other.rules.twenty;
  // The tour's Generate step changes a description; this puts them back after.
  const ORIGINAL_DESC = Object.fromEntries(Object.entries(DOCS).map(([id, d]) => [id, d.description]));

  /* ---------------------------------------------------------------- axes */
  const AXES = [
    { key: 'mode', label: 'Mode', options: [['add', 'Add'], ['edit', 'Edit']] },
    { key: 'doc', label: 'Document', options: Object.entries(DOCS).map(([id, d]) => [id, d.label]) },
    { key: 'desc', label: 'Description', options: [['empty', 'Empty'], ['filled', 'Filled']] },
    { key: 'rules', label: 'Rules', options: [['none', 'None'], ['few', 'A few'], ['many', 'Many'], ['twenty', '20']] },
    { key: 'focus', label: 'Focus', options: [['none', 'None'], ['name', 'Name'], ['first', 'First rule'], ['unknown', 'Not on sample'], ['typing', 'Typing a rule']] },
    { key: 'show', label: 'Show', multi: true, options: [['menu', 'Suggested rules'], ['errors', 'Errors']] },
  ];
  const DEFAULTS = { mode: 'add', doc: 'empty', desc: 'empty', rules: 'none', focus: 'none', show: [] };

  const params = new URLSearchParams(location.search);
  const state = {};
  AXES.forEach((a) => {
    const raw = params.get(a.key);
    if (a.multi) state[a.key] = raw ? raw.split(',').filter((v) => a.options.some(([id]) => id === v)) : [...DEFAULTS[a.key]];
    else state[a.key] = a.options.some(([id]) => id === raw) ? raw : DEFAULTS[a.key];
  });

  // What's typed into Document name while Other is picked, kept across the other axes.
  let typedName = '';
  /* What the dialog should look like for the current axes. */
  function preset() {
    const d = DOCS[state.doc];
    const rules = state.rules === 'none' ? [] : [...d.rules[state.rules]];
    const p = { name: d.name || (state.doc === 'other' ? typedName : ''), description: state.desc === 'filled' ? d.description : '', rules };
    if (state.focus === 'name') p.focus = 'name';
    if (state.focus === 'first' && rules.length) p.focus = 0;
    if (state.focus === 'unknown') { rules.push(d.unknown); p.focus = rules.length - 1; }
    if (state.focus === 'typing') { p.newText = d.typing; p.focus = 'new'; }
    if (state.rules === 'twenty' && state.focus !== 'first') p.scroll = true;
    if (state.show.includes('menu')) p.menu = true;
    // Errors only show when something's missing; a complete document would just save.
    if (state.show.includes('errors') && (!p.name || !p.description || !rules.length)) p.submit = true;
    return p;
  }

  /* ---------------------------------------------------------------- rail */
  const rail = document.getElementById('dts-rail');
  const stage = document.getElementById('dts-stage');
  const capName = document.getElementById('dts-capName');
  const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Radios for pick-one axes, checkboxes for Show; one option per line.
  rail.innerHTML = AXES.map((a) => `
    <fieldset class="dts-axis">
      <legend class="dts-axis-label">${esc(a.label)}</legend>
      ${a.options.map(([id, text]) => `<label class="dts-opt"><input type="${a.multi ? 'checkbox' : 'radio'}" name="dts-${a.key}" data-axis="${a.key}" value="${id}"><span>${esc(text)}</span></label>`).join('')}
    </fieldset>`).join('');

  function syncRail() {
    rail.querySelectorAll('[data-axis]').forEach((input) => {
      const v = state[input.dataset.axis];
      input.checked = Array.isArray(v) ? v.includes(input.value) : v === input.value;
    });
  }

  function caption() {
    const d = DOCS[state.doc];
    const rules = { none: 'no rules', few: 'a few rules', many: 'many rules', twenty: '20 rules' }[state.rules];
    const focus = { none: '', name: 'name focused', first: 'first rule focused', unknown: 'a rule not on the sample', typing: 'typing a rule' }[state.focus];
    const name = d.name || (state.doc === 'other' && typedName) || (state.doc === 'other' ? 'Other, no name yet' : 'No name yet');
    return [state.mode === 'edit' ? 'Editing' : null, name, state.desc === 'empty' ? 'no description' : null, rules, focus, ...state.show.map((s) => (s === 'menu' ? 'suggested rules open' : 'errors'))].filter(Boolean).join(' · ');
  }

  /* --------------------------------------------------------------- paint */
  function paint() {
    syncRail();
    const q = new URLSearchParams();
    AXES.forEach((a) => {
      const v = state[a.key];
      const def = DEFAULTS[a.key];
      if (Array.isArray(v) ? v.join(',') !== def.join(',') : v !== def) q.set(a.key, Array.isArray(v) ? v.join(',') : v);
    });
    history.replaceState(null, '', q.toString() ? `?${q}` : location.pathname);
    capName.textContent = caption();

    const p = preset();
    // Same mode already open: change it in place, so the sample doesn't reload.
    const open = stage.querySelector('dialog');
    if (open && open.adSetState && open.dataset.mode === state.mode) { open.adSetState(p); return; }
    stage.innerHTML = '';
    const dialog = window.adDocTypeDialog({
      mount: stage,
      existing: state.mode === 'edit' ? { name: p.name, description: p.description, rules: p.rules.map((description) => ({ description })) } : null,
      preset: p,
      // Saving or closing shows the state again.
      onSave: () => setTimeout(paint, 0),
    });
    dialog.dataset.mode = state.mode;
    dialog.addEventListener('close', () => setTimeout(() => { if (!stage.querySelector('dialog')) paint(); }, 0));
  }

  stage.addEventListener('input', (e) => {
    if (state.doc !== 'other' || !e.target.matches('[name="name"]')) return;
    typedName = e.target.value;
    capName.textContent = caption();
  });
  rail.addEventListener('change', (e) => {
    const input = e.target.closest('[data-axis]');
    if (!input) return;
    const axis = AXES.find((a) => a.key === input.dataset.axis);
    if (axis.key === 'doc') typedName = '';
    if (axis.multi) state[axis.key] = [...rail.querySelectorAll(`[data-axis="${axis.key}"]:checked`)].map((i) => i.value);
    else state[axis.key] = input.value;
    paint();
  });

  /* ---------------------------------------------------------------- demo
     Plays the showcase script in the real dialog, the same way every time,
     for screen recordings. The rail hides; captions are optional.
     ?demo=1 starts it on load; &captions=0 leaves captions off. */
  const DEMO = [
    { say: 'Every team checks the same documents by hand. Let’s teach AI to do it.', hold: 2200 },
    { say: 'Name the document. AI shows you what it’ll look at.', type: ['[name="name"]', 'Driver’s license'], hold: 1600 },
    { say: 'It writes the description for you.', click: '[data-generate]', hold: 2200 },
    { say: 'Pick the checks your team already does.', menu: ['Holder is 18 or over', 'License hasn’t expired', 'Name matches the applicant'], hold: 900 },
    { say: 'Click a rule and you see exactly where AI looks.', focus: '[data-rule-text="0"]', hold: 1800 },
    { focus: '[data-rule-text="1"]', hold: 1800 },
    { say: 'Or write your own, in plain English.', type: ['[data-rule-new]', 'Photo is clear and shows the face'], hold: 1400, enter: true },
    { say: 'Even when the sample doesn’t show it, AI knows to go and find it.', type: ['[data-rule-new]', 'Organ donor status is shown'], hold: 2200, enter: true },
    { say: 'Every upload checked. People only look at what’s flagged.', blur: true, hold: 3000 },
  ];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const captionEl = document.querySelector('[data-demo-caption]');
  const exitBtn = document.querySelector('[data-demo-exit]');
  const captionsBox = document.querySelector('[data-demo-captions]');
  let run = 0;

  async function typeInto(el, text, token) {
    el.focus();
    el.value = '';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    for (const ch of text) {
      if (token !== run) return;
      el.value += ch;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(55);
    }
  }

  async function playDemo() {
    const token = ++run;
    stopDemoView();
    Object.assign(state, { ...DEFAULTS, show: [] });
    paint();
    document.body.classList.add('dts-demo');
    exitBtn.hidden = false;
    const dialog = stage.querySelector('dialog');
    const $ = (sel) => dialog.querySelector(sel);
    dialog.adSetState({});
    await sleep(600);
    for (const step of DEMO) {
      if (token !== run) return;
      if (step.say) { captionEl.textContent = step.say; captionEl.hidden = !captionsBox.checked; }
      if (step.type) await typeInto($(step.type[0]), step.type[1], token);
      if (step.click) $(step.click).click();
      if (step.menu) {
        $('[data-suggest-toggle]').click();
        await sleep(700);
        for (const rule of step.menu) {
          if (token !== run) return;
          [...dialog.querySelectorAll('[data-suggest-check]')].find((i) => i.dataset.suggestCheck === rule)?.click();
          // Long enough to see the part of the license each rule lights up.
          await sleep(1200);
        }
        await sleep(400);
        $('[data-suggest-toggle]').click();
      }
      if (step.focus) $(step.focus)?.focus();
      if (step.blur) document.activeElement?.blur();
      await sleep(step.hold || 1000);
      if (step.enter) $('[data-rule-new]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    }
    if (token === run) captionEl.hidden = true;
  }

  /* State machine tour: a visible cursor clicks through the rail (and the
     dialog's Generate button), one option at a time, while the dialog
     updates in place. ?demo=states starts it on load. */
  const TOUR = [
    { say: 'One dialog. Every state it can be in.', hold: 1800 },
    { say: 'Every kind of document…', pick: ['doc', 'license'], hold: 1400 },
    { pick: ['doc', 'note'], hold: 1400 },
    { say: '…or type your own.', pick: ['doc', 'other'], hold: 600 },
    { typeName: 'Certificate of insurance', hold: 1400 },
    { say: 'Generate the description.', generate: true, hold: 600 },
    { say: 'Add a few rules.', pick: ['rules', 'few'], hold: 1600 },
    { say: 'A rule the sample can’t show gets its own field.', pick: ['focus', 'unknown'], hold: 3200 },
  ];
  const cursor = document.createElement('div');
  cursor.className = 'dts-cursor';
  cursor.hidden = true;
  cursor.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3l14 8-6 1.5L10 19z"/></svg><span class="dts-cursor-ring"></span>';
  document.body.append(cursor);
  const cursorTo = (x, y) => { cursor.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`; };
  async function clickWithCursor(el, token) {
    if (!el || token !== run) return;
    el.scrollIntoView({ block: 'nearest' });
    const r = el.getBoundingClientRect();
    cursorTo(r.left + Math.min(r.width / 2, 12), r.top + r.height / 2);
    await sleep(800);
    if (token !== run) return;
    cursor.classList.remove('is-click'); void cursor.offsetWidth; cursor.classList.add('is-click');
    await sleep(140);
    el.click();
  }
  async function playTour() {
    const token = ++run;
    stopDemoView();
    Object.assign(state, { ...DEFAULTS, show: [] });
    paint();
    document.body.classList.add('dts-touring');
    exitBtn.hidden = false;
    cursor.hidden = false;
    cursor.style.transition = 'none';
    cursorTo(window.innerWidth * 0.55, window.innerHeight * 0.6);
    void cursor.offsetWidth;
    cursor.style.transition = '';
    await sleep(600);
    for (const step of TOUR) {
      if (token !== run) return;
      if (step.say) { captionEl.textContent = step.say; captionEl.hidden = !captionsBox.checked; }
      if (step.pick) await clickWithCursor(rail.querySelector(`[data-axis="${step.pick[0]}"][value="${step.pick[1]}"]`), token);
      if (step.typeName) {
        const input = stage.querySelector('[name="name"]');
        await clickWithCursor(input, token);
        await typeInto(input, step.typeName, token);
      }
      if (step.generate) {
        const dialog = stage.querySelector('dialog');
        await clickWithCursor(dialog.querySelector('[data-generate]'), token);
        // Wait for it to finish writing, then keep that description as the state.
        const desc = dialog.querySelector('[name="description"]');
        let last = '';
        while (token === run && (dialog.querySelector('[data-generate]').disabled || desc.value !== last)) { last = desc.value; await sleep(200); }
        DOCS[state.doc].description = desc.value;
        state.desc = 'filled';
        syncRail();
        capName.textContent = caption();
      }
      await sleep(step.hold || 1200);
    }
    if (token === run) stopDemo();
  }
  function stopDemoView() {
    document.body.classList.remove('dts-demo', 'dts-touring');
  }

  function stopDemo() {
    run++;
    stopDemoView();
    cursor.hidden = true;
    Object.entries(ORIGINAL_DESC).forEach(([id, text]) => { DOCS[id].description = text; });
    captionEl.hidden = true;
    exitBtn.hidden = true;
  }

  document.querySelector('[data-demo-play]').addEventListener('click', playDemo);
  document.querySelector('[data-tour-play]').addEventListener('click', playTour);
  exitBtn.addEventListener('click', stopDemo);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && (document.body.classList.contains('dts-demo') || document.body.classList.contains('dts-touring'))) stopDemo(); });

  paint();
  // ?demo=1 plays the feature demo, ?demo=states the state machine tour.
  if (params.get('captions') === '0') captionsBox.checked = false;
  if (params.get('demo') === '1') playDemo();
  if (params.get('demo') === 'states') playTour();
})();
