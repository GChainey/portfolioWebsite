/* A lo-fi picture of the document being set up in AI Document Review, shown
   beside the Add document form. It picks a driver’s license, a doctor’s
   note or a plain document from the name, and lights up the parts of
   it a rule talks about, so people can see what AI will look at.

   Illustration only: matching is by keywords in the rule's wording. Styles
   are the "Document preview" block in admin.css. */
(() => {
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // One field on the document: its region id, the label printed on it and a sample value.
  const f = (id, label, value) => `<div class="dp-field" data-dp-region="${id}"><span>${esc(label)}</span><b>${esc(value)}</b></div>`;

  const KINDS = {
    licence: {
      match: /licen[cs]e|driver|driving/,
      noun: 'driver’s license',
      describe: () => 'A current US driver’s license showing the holder’s name, photo, address, date of birth and expiration date.',
      // Regions, in the order they are named when a rule matches more than one.
      regions: {
        name: { label: 'Name', words: ['name', 'applicant', 'employee'] },
        dob: { label: 'Date of birth', words: ['birth', 'dob', 'age', '18', 'over', 'older', 'adult', 'minor'] },
        expiry: { label: 'Expiration date', words: ['expir', 'valid', 'current', 'in date', 'out of date'] },
        address: { label: 'Address', words: ['address', 'lives', 'resid', 'zip', 'city', 'state'] },
        number: { label: 'License number', words: ['number', 'license no', 'licence no', 'id'] },
        class: { label: 'License class', words: ['class', 'car', 'vehicle', 'heavy', 'rider', 'motorcycle'] },
        photo: { label: 'Photo', words: ['photo', 'picture', 'face'] },
        signature: { label: 'Signature', words: ['sign'] },
      },
      rulesFor: { name: 'Name matches the applicant', dob: 'Holder is 18 or over', expiry: 'License hasn’t expired', address: 'Address matches the application', photo: 'Photo is clear and shows the face', class: 'License class is D', number: 'License number is present', signature: 'Signature is present' },
      suggestions: ['Holder is 18 or over', 'License hasn’t expired', 'Name matches the applicant', 'Address matches the application'],
      html: () => `
        <div class="dp-doc dp-card">
          <div class="dp-card-hd"><span class="dp-crest" aria-hidden="true"></span><b>New York State</b><span class="dp-card-state">Driver License</span></div>
          <div class="dp-card-body">
            <div class="dp-photo" data-dp-region="photo" aria-hidden="true"><span></span><i></i></div>
            <div class="dp-card-fields">
              ${f('name', 'Name', 'Jane Doe')}
              ${f('address', 'Address', '123 Main St, Brooklyn, NY 11201')}
              <div class="dp-row">${f('dob', 'Date of birth', '03/14/1998')}${f('expiry', 'Expires', '03/14/2030')}</div>
              <div class="dp-row">${f('number', 'ID', '123 456 789')}${f('class', 'Class', 'D')}</div>
              <div class="dp-sign" data-dp-region="signature"><span>Signature</span><svg viewBox="0 0 80 16" aria-hidden="true"><path d="M2 12c6-10 10 2 16-4s8-6 12 0 10-6 14-2 8 4 12-2 10 2 18-2"/></svg></div>
            </div>
          </div>
        </div>`,
    },
    medical: {
      match: /medical|doctor|sick|physician|\bgp\b/,
      noun: 'doctor’s note',
      describe: () => 'A note from a licensed doctor confirming the dates someone was unable to work, signed and dated by the doctor.',
      regions: {
        name: { label: 'Patient name', words: ['name', 'patient', 'employee', 'applicant'] },
        dates: { label: 'Dates excused from work', words: ['cover', 'leave', 'time off', 'period', 'unable', 'unfit', 'excused', 'absence', 'absent', 'until', 'dates', 'return'] },
        issued: { label: 'Date seen', words: ['issued', 'examined', 'seen', 'visit', 'recent', 'within', 'dated'] },
        reason: { label: 'Reason', words: ['reason', 'condition', 'illness', 'diagnos'] },
        doctor: { label: 'Doctor', words: ['doctor', 'physician', 'practitioner', 'licensed', 'registered', 'provider', 'npi', 'md', 'clinic'] },
        signature: { label: 'Signature', words: ['sign'] },
      },
      rulesFor: { name: 'Name matches the employee', dates: 'Covers the dates of leave requested', issued: 'Dated within 7 days of the leave', reason: 'States the person couldn’t work', doctor: 'Signed by a licensed doctor', signature: 'Signed by a licensed doctor' },
      suggestions: ['Covers the dates of leave requested', 'Name matches the employee', 'Signed by a licensed doctor', 'Dated within 7 days of the leave'],
      html: () => `
        <div class="dp-doc dp-page">
          <div class="dp-page-hd" data-dp-region="doctor"><b>Brooklyn Family Medicine</b><span>Anna Nguyen, MD · NPI 1234567890</span></div>
          <h4 class="dp-page-title">Doctor’s note</h4>
          <p class="dp-line">To whom it may concern, this confirms that</p>
          ${f('name', 'Patient', 'Jane Doe')}
          <div data-dp-region="issued" class="dp-field"><span>Was seen in our office on</span><b>Sep 3, 2026</b></div>
          <div data-dp-region="dates" class="dp-field"><span>And is excused from work</span><b>Sep 3 to Sep 5, 2026</b></div>
          ${f('reason', 'Reason', 'Medical condition')}
          <div class="dp-sign" data-dp-region="signature"><span>Doctor’s signature</span><svg viewBox="0 0 80 16" aria-hidden="true"><path d="M2 10c8-8 12 4 18-2s10-4 14 2 8-8 14-4 10 6 16 0 8 2 14-2"/></svg></div>
        </div>`,
    },
    other: {
      match: /.*/,
      noun: 'document',
      describe: (name) => `A ${String(name || 'document').trim().toLowerCase()} uploaded with the request, showing the person’s name and the date it was issued.`,
      regions: {
        name: { label: 'Name', words: ['name', 'applicant', 'employee'] },
        date: { label: 'Date', words: ['date', 'dated', 'expir', 'valid', 'current', 'recent', 'within'] },
        body: { label: 'Details', words: ['detail', 'amount', 'address', 'reason', 'content', 'include', 'show', 'state'] },
        signature: { label: 'Signature', words: ['sign'] },
      },
      rulesFor: { name: 'Name matches the applicant', date: 'Dated in the last 3 months', body: 'Shows the details the request needs', signature: 'Signed by the applicant' },
      suggestions: ['Name matches the applicant', 'Dated in the last 3 months', 'Signed by the applicant'],
      html: (title) => `
        <div class="dp-doc dp-page">
          <h4 class="dp-page-title">${esc(title || 'Document')}</h4>
          ${f('name', 'Name', 'Jane Doe')}
          ${f('date', 'Date', 'Sep 3, 2026')}
          <div class="dp-lines" data-dp-region="body" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
          <div class="dp-sign" data-dp-region="signature"><span>Signature</span><svg viewBox="0 0 80 16" aria-hidden="true"><path d="M2 12c6-10 10 2 16-4s8-6 12 0 10-6 14-2 8 4 12-2 10 2 18-2"/></svg></div>
        </div>`,
    },
  };

  const kindFor = (name) => {
    const n = String(name || '').toLowerCase();
    if (KINDS.licence.match.test(n)) return 'licence';
    if (KINDS.medical.match.test(n)) return 'medical';
    return 'other';
  };

  // The regions a rule talks about, from the words in it. Words match at the
  // start of a word, so "id" doesn't fire on "valid".
  const startsWord = (t, w) => new RegExp(`(^|[^a-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(t);
  const regionsFor = (kind, text) => {
    const t = String(text || '').toLowerCase();
    if (!t.trim()) return [];
    return Object.entries(KINDS[kind].regions).filter(([, r]) => r.words.some((w) => startsWord(t, w))).map(([id]) => id);
  };

  window.adDocPreview = {
    kindFor,
    regionsFor,
    noun: (kind) => KINDS[kind].noun,
    label: (kind, id) => KINDS[kind].regions[id]?.label || id,
    suggestions: (kind) => KINDS[kind].suggestions,
    describe: (kind, name) => KINDS[kind].describe(name),
    // A shimmering placeholder page, shown until the document has a name.
    skeleton: () => `
      <div class="dp-doc dp-page dp-skeleton" role="img" aria-label="Add a document name to see a sample">
        <i class="dp-sk dp-sk-title"></i>
        <i class="dp-sk dp-sk-label"></i><i class="dp-sk dp-sk-value"></i>
        <i class="dp-sk dp-sk-label"></i><i class="dp-sk dp-sk-value"></i>
        <i class="dp-sk dp-sk-line"></i><i class="dp-sk dp-sk-line is-short"></i><i class="dp-sk dp-sk-line"></i>
        <i class="dp-sk dp-sk-label"></i><i class="dp-sk dp-sk-value"></i>
        <i class="dp-sk dp-sk-line"></i><i class="dp-sk dp-sk-line"></i><i class="dp-sk dp-sk-line is-short"></i>
        <i class="dp-sk-gap"></i>
        <i class="dp-sk dp-sk-label"></i><i class="dp-sk dp-sk-sign"></i>
      </div>`,
    // Rules for the parts of the document a description mentions; the common
    // rules if it mentions none.
    rulesFrom: (kind, description) => {
      const hits = regionsFor(kind, description).map((id) => KINDS[kind].rulesFor[id]).filter(Boolean);
      return [...new Set(hits.length ? hits : KINDS[kind].suggestions)];
    },
    html: (kind, title) => KINDS[kind].html(title),
  };
})();
