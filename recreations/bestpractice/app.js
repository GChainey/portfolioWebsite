// Best Practice · New appointment, rebuilt in Fluent 2 as a working prototype. Each story state is a
// URL: ?v=final (default), repeat, injury, provider-dates, unavailable, before, steps, iter-grid,
// iter-tabs, toggles, bundling. One state object, rendered to HTML and patched into the page (morph)
// so nodes stay put and CSS transitions run. Dates are one coherent set in 2021.

// ---------- Icons (Fluent System Icons, 20 regular, redrawn as strokes) ----------
const I = {
  search: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8.5" cy="8.5" r="5.5"/><path d="M12.6 12.6 17 17" stroke-linecap="round"/></svg>',
  down: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 7.5 5 5 5-5"/></svg>',
  up: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 5-5 5 5"/></svg>',
  right: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.5 5.5 5.5-5.5 5.5"/></svg>',
  left: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="m12.5 4.5-5.5 5.5 5.5 5.5"/></svg>',
  sleft: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 5-5 5 5 5"/></svg>',
  sright: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m8 5 5 5-5 5"/></svg>',
  x: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="m5 5 10 10M15 5 5 15"/></svg>',
  xbig: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="m4.5 4.5 11 11M15.5 4.5l-11 11"/></svg>',
  cal: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="4" width="14" height="13" rx="2"/><path d="M3 8h14M7 2.5v3M13 2.5v3" stroke-linecap="round"/><path d="M7 11h.01M10 11h.01M13 11h.01M7 14h.01M10 14h.01" stroke-width="2" stroke-linecap="round"/></svg>',
  clock: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="10" cy="10" r="7"/><path d="M10 6v4l2.5 2" stroke-linecap="round"/></svg>',
  steth: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3H4v5a5 5 0 0 0 10 0V3h-1"/><path d="M9 13v2a5 5 0 0 0 10 0v-2"/><circle cx="19" cy="11" r="2"/></svg>',
  repeat: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 10a6.5 6.5 0 1 0 2-4.7"/><path d="M3.5 3v3.5H7"/><path d="M10 6.5V10l2.5 1.5"/></svg>',
  injury: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M5 2.5h7l3.5 3.5v11.5H5z"/><path d="M12 2.5V6h3.5" /><path d="M10.25 9v5M7.75 11.5h5" stroke-linecap="round"/></svg>',
  info: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="10" cy="10" r="7.5"/><path d="M10 9v5" stroke-linecap="round"/><circle cx="10" cy="6.5" r=".6" fill="currentColor"/></svg>',
  warn: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M10 3 2.5 16.5h15z"/><path d="M10 8v4" stroke-linecap="round"/><circle cx="10" cy="14.2" r=".6" fill="currentColor"/></svg>',
  check: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m2.5 6.2 2.3 2.3 4.7-5"/></svg>',
  checkmark: '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m4 10.5 4 4 8-9"/></svg>',
  back: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M16 10H4m5-5-5 5 5 5"/></svg>',
  cross: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 6 8 8M14 6l-8 8"/></svg>',
}

// ---------- Data ----------
const COLORS = [['var(--brand-bg2)', 'var(--brand)']] // one avatar colour: initials tell people apart (audit, 2026-11-16)
const PEOPLE = {
  CC: { name: 'Charlie Charmoose', c: 1, days: { 0: [], 1: [630, 660, 840, 900, 960, 1005], 2: [540, 570, 600, 900] } },
  DS: { name: 'Dominique Sat', c: 0, days: { 0: [540, 555, 570, 600, 630, 660, 690, 780, 840, 915, 960, 1005], 1: [570, 600, 810, 840, 900], 2: [540, 600, 660] } },
  EL: { name: 'Elliott Lock', c: 3, days: { 0: [600, 615, 645, 720, 900, 945], 1: [540, 600] } },
  SD: { name: 'Sam Darris', c: 4, days: { 0: [810, 840, 870], 1: [540, 555, 570] } },
  YO: { name: 'Yarn Oldrick', c: 2, days: { 0: [570, 600, 660, 720, 960, 990], 1: [600, 660, 720], 2: [540] } },
  AE: { name: 'Dr Alex Edmond', c: 5, days: { 0: [660] } },
}
const ORDER = ['CC', 'DS', 'EL', 'SD', 'YO']
const PATIENTS = [['Bobby Smith', '14/02/1987'], ['Bob Nguyen', '03/09/1962'], ['Roberta Bobbins', '22/11/1990'], ['Mona Kane', '08/06/1975']]
const INJURIES = [
  ['Fractured ankle, open reduction', '05/08/2020', 'AA04321'],
  ['Humeral avulsion of the glenohumeral ligament', '19/07/2020', 'AA03977'],
  ['Closed reduction of dislocated shoulder', '12/10/2020', 'AA04102'],
  ['Annular ligament displacement', '04/04/2021', 'AA04388'],
  ['Post concussion syndrome', '01/02/2021', 'AA04265'],
]
const TYPES = ['Short appointment', 'Long appointment', 'Immunisation', 'COVID-19 Vaccination', 'Check-up']
const UNITS = ['Days', 'Weeks', 'Months']
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const ENDS = ['After', 'On date', 'Never']

const initials = (n) => n.replace(/^Dr /, '').split(' ').map((w) => w[0]).join('').slice(0, 2)
const day = (d) => new Date(2021, 4, 25 + d)
const pad = (n) => String(n).padStart(2, '0')
const short = (d) => { const x = day(d); return `${pad(x.getDate())}/${pad(x.getMonth() + 1)}/${x.getFullYear()}` }
const ord = (n) => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th')
const long = (d) => { const x = day(d); return `${ord(x.getDate())} ${x.toLocaleString('en-AU', { month: 'long' })} ${x.getFullYear()}` }
const hm = (m) => { const h = Math.floor(m / 60), mm = m % 60; return `${h % 12 || 12}:${pad(mm)} ${h < 12 ? 'am' : 'pm'}` }
const times = (id, d) => PEOPLE[id].days[d] ?? []
const nextAvail = (id, d) => { for (let k = d + 1; k < d + 14; k++) if (times(id, k).length) return [k, times(id, k)[0]]; return null }
// Providers have headshots (avatars/, from Unsplash, free licence). Patients get initials: a practice
// often won't have their photo (Gareth, 2026-11-16)
const PHOTOS = new Set(['alex-edmond', 'charlie-charmoose', 'dominique-sat', 'elliott-lock', 'john-garner', 'sam-darris', 'yarn-oldrick'])
const photo = (name) => { const f = name.replace(/^Dr /, '').toLowerCase().replace(/[^a-z]+/g, '-'); return PHOTOS.has(f) ? `avatars/${f}.jpg` : null }
const avName = (name, size = 's24') => { const src = photo(name); if (src) return `<img class="av ${size}" src="${src}" alt="">`; const [bg, fg] = COLORS[0]; return `<span class="av ${size}" style="background:${bg};color:${fg}">${initials(name)}</span>` }
const av = (id, size = 's28') => avName(PEOPLE[id].name, size)
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

// ---------- State ----------
const V = new URLSearchParams(location.search).get('v') || 'final'
// The two panels are told apart by tone alone (Gareth, 2026-11-16); ?divider=1 brings the line back
if (new URLSearchParams(location.search).get('divider') !== '1') document.documentElement.classList.add('no-divider')
const S = {
  patient: null, query: '', open: null, // open: which popover ('patient' | 'type' | 'providers' | 'unit' | 'on' | 'end')
  type: 'Short appointment', duration: 15,
  mode: null, panel: null, // panel: 'details' | 'repeat' | 'injury'
  date: 0, providers: [], pdate: {}, expanded: {}, picked: null, booked: null,
  rep: { every: 1, unit: null, on: null, end: 'After', total: null }, repeatSet: null,
  inj: { related: false, kind: 'Existing', pick: null }, injurySet: null,
  old: { urgent: false, waiting: false, repeat: false, prio: 2, any: false }, tab: 0,
}
const preset = {
  repeat: () => Object.assign(S, { patient: 'Bobby Smith' }),
  injury: () => Object.assign(S, { patient: 'Mona Kane', type: 'COVID-19 Vaccination', duration: 30, booked: { id: 'AE', d: 0, t: 660 } }),
  'provider-dates': () => Object.assign(S, { patient: 'Bobby Smith', panel: 'details', providers: ['DS', 'YO', 'CC'], expanded: { DS: true } }),
  unavailable: () => Object.assign(S, { patient: 'Bobby Smith', panel: 'details', providers: ['DS', 'YO', 'CC'] }),
  before: () => Object.assign(S, { patient: 'Bobby Smith', type: 'Immunisation' }),
}
preset[V]?.()

// ---------- Pieces ----------
const label = (t, req) => `<span class="label">${t}${req ? '<span class="req">*</span>' : ''}</span>`
const dropdown = (key, value, placeholder, options, { width } = {}) => `
  <div class="field" style="${width ? `width:${width}px` : ''}">
    <div class="input select ${S.open === key ? 'focus' : ''}" data-act="open:${key}" role="combobox" aria-label="${key}" aria-expanded="${S.open === key}">
      <span class="${value == null ? 'ph' : 'val'}">${value ?? placeholder}</span><span class="ico">${I.down}</span>
    </div>
    ${S.open === key ? `<div class="listbox" role="listbox">${options.map((o) => `<button class="option" role="option" data-act="set:${key}:${esc(o)}"><span class="tick">${o === value ? I.checkmark : ''}</span>${o}</button>`).join('')}</div>` : ''}
  </div>`
const spin = (key, value, w = 120) => `
  <div class="input spin" style="width:${w}px"><input aria-label="${key}" data-input="${key}" value="${value ?? ''}" inputmode="numeric">
    <span class="arrows"><button aria-label="${key} up" data-act="inc:${key}:1">${I.up.replace(/16/g, '12')}</button><button aria-label="${key} down" data-act="inc:${key}:-1">${I.down.replace(/16/g, '12')}</button></span></div>`
const msg = (kind, html) => `<div class="msg ${kind}"><span class="mico">${kind === 'warning' ? I.warn : I.info}</span><div>${html}</div></div>`
const sw = (key, on, text) => `<button class="switch ${on ? 'on' : ''}" data-act="toggle:${key}" role="switch" aria-checked="${on}" aria-label="${key}"><span class="track"><span class="thumb"></span></span>${text ?? ''}</button>`

function patientField() {
  if (S.patient) return `<div class="field">${label('Patient', true)}
    <div class="input"><span class="tag">${avName(S.patient, 's20', S.patient === 'Mona Kane' ? 3 : 0)}<span class="val">${S.patient}</span></span><button class="dismiss" aria-label="Clear patient" data-act="clearPatient">${I.x}</button></div></div>`
  const hits = S.query ? PATIENTS.filter(([n]) => n.toLowerCase().includes(S.query.toLowerCase())) : []
  return `<div class="field">${label('Patient', true)}
    <div style="display:flex;gap:8px"><div class="input" style="flex:1"><span class="ico">${I.search}</span><input placeholder="Search" aria-label="Search patients" data-input="query" value="${esc(S.query)}"></div>
    <button class="btn">New patient</button></div>
    ${hits.length ? `<div class="listbox" role="listbox" style="right:auto;width:calc(100% - 115px);top:60px">${hits.map(([n, dob], k) => `<button class="option" role="option" data-act="pickPatient:${n}">${avName(n, 's24', k)}${n}<span class="meta">${dob}</span></button>`).join('')}</div>` : ''}
    <div><button class="link">Add patient from waiting list</button></div></div>`
}

function detailsCard() {
  const on = S.panel === 'details', b = S.booked
  const glyph = b ? av(b.id, 's40') : `<span class="glyph">${I.steth}</span>`
  const lines = b
    ? `<b>${PEOPLE[b.id].name}</b><span>${long(b.d)}</span><span>${hm(b.t)} – ${hm(b.t + S.duration)}</span>`
    : `<b>No provider selected</b><span>${long(S.date)}</span><span>No time selected</span>`
  return `<div class="field">${label('Appointment details', true)}
    <button class="card ${on ? 'on' : ''}" data-act="panel:details" aria-label="Appointment details">${glyph}<span class="lines">${lines}</span><span class="chev">${on ? I.left : I.right}</span></button></div>`
}

function repeatCard() {
  if (S.mode !== 'repeat') return ''
  const on = S.panel === 'repeat', r = S.repeatSet
  const text = r ? `Repeats every ${r.every > 1 ? `${r.every} ${r.unit.toLowerCase()}` : r.unit.toLowerCase().replace(/s$/, '')} on ${r.on} · ${r.total} occurrences` : 'This appointment does not repeat'
  return `<div style="animation:rise 200ms var(--decel)"><button class="card slim ${on ? 'on' : ''}" data-act="panel:repeat" aria-label="Repeat appointment"><span class="glyph" style="color:var(--fg2)">${I.repeat}</span><span class="lines"><span style="color:var(--fg1)">${text}</span>${r ? `<span style="font-size:12px;line-height:16px;color:var(--fg3)">Next ${short(14)} · Final ${short(14 * (r.total - 1))}</span>` : ''}</span><span class="chev">${on ? I.left : I.right}</span></button></div>`
}

function injuryCard() {
  if (V !== 'injury') return ''
  const on = S.panel === 'injury', j = S.injurySet
  // Set: two tight lines like the repeat row, the injury then the claim (it wrapped as a tag before)
  const text = j ? `<span style="color:var(--fg1)">${j[0]}</span><span style="font-size:12px;line-height:16px;color:var(--fg3)">Injury claim · ${j[2]}</span>` : `<span style="color:var(--fg1)">Not related to an injury</span>`
  return `<button class="card slim ${on ? 'on' : ''}" data-act="panel:injury" aria-label="Injury claim"><span class="glyph" style="color:var(--fg2)">${I.injury}</span><span class="lines">${text}</span><span class="chev">${on ? I.left : I.right}</span></button>`
}

function leftPanel() {
  const ready = S.patient && S.booked
  return `<div class="left">
    <h2 class="title">New appointment</h2>
    ${patientField()}
    <div class="row2"><div class="field">${label('Appointment type', true)}${dropdown('type', S.type, 'Select', TYPES)}</div><div class="field">${label('Duration (mins)', true)}${spin('duration', S.duration)}</div></div>
    ${detailsCard()}
    ${injuryCard()}
    <div class="group" role="group" aria-label="Appointment options">${[['urgent', 'Urgent'], ['repeat', 'Repeat'], ['waiting', 'Add to waiting list']].map(([k, t]) => `<button class="${S.mode === k ? 'on' : ''}" aria-pressed="${S.mode === k}" data-act="mode:${k}">${t}</button>`).join('')}</div>
    ${repeatCard()}
    <div class="field">${label('Comment')}<textarea class="area" rows="2" aria-label="Comment"></textarea></div>
    <div class="actions"><button class="btn primary" ${ready ? '' : 'disabled'}>Book appointment</button><button class="btn">Cancel</button></div>
  </div>`
}

function providerSummary() {
  if (!S.providers.length) return `<span class="ph">Select a provider</span>`
  return `<span class="badge">${S.providers.length}</span><span class="val">${S.providers.map((id) => PEOPLE[id].name).join(', ')}</span>`
}

function providerBlock(id) {
  const d = S.pdate[id] ?? S.date, list = times(id, d), open = !!S.expanded[id]
  const shown = open ? list : list.slice(0, 5)
  const more = list.length > 5 ? (open ? `Less ${I.up}` : `More (${list.length - 5}) ${I.down}`) : (list.length ? '' : (open ? `Less ${I.up}` : `Change date ${I.down}`))
  const na = !list.length && nextAvail(id, d)
  const t = (m) => `<button class="time ${S.picked && S.picked.id === id && S.picked.t === m && S.picked.d === d ? 'on' : ''}" data-act="time:${id}:${d}:${m}">${hm(m)}</button>`
  return `<div class="prov" data-key="${id}">
    <div class="prov-head">${av(id, 's24')}<span class="name">${PEOPLE[id].name}</span>${more ? `<button class="link" style="display:inline-flex;align-items:center;gap:4px" data-act="expand:${id}">${more}</button>` : ''}</div>
    ${open ? `<div class="stepper"><button class="btn subtle icon" aria-label="${PEOPLE[id].name} previous day" data-act="pday:${id}:-1">${I.sleft}</button><div class="input"><span class="val">${short(d)}</span><span class="ico">${I.cal}</span></div><button class="btn subtle icon" aria-label="${PEOPLE[id].name} next day" data-act="pday:${id}:1">${I.sright}</button></div>` : ''}
    ${shown.length ? `<div class="times">${shown.map(t).join('')}</div>` : ''}
    ${na ? `<div class="next">Next available appointment is <button class="link" data-act="jump:${id}:${na[0]}">${short(na[0])} at ${hm(na[1])}</button></div>` : ''}
  </div>`
}

function detailsPanel() {
  // Providers with times on the day first; the order holds while you step one provider's own date
  const ordered = [...S.providers].sort((a, b) => (times(b, S.date).length > 0) - (times(a, S.date).length > 0))
  return `<h2 class="title sub">Appointment details</h2>
    <div class="body">
      <div style="display:grid;grid-template-columns:140px 1fr;gap:12px">
        <div class="field">${label('Date')}<div class="input"><span class="val">${short(S.date)}</span><span class="ico">${I.cal}</span></div></div>
        <div class="field">${label('Provider', true)}
          <div class="input select ${S.open === 'providers' ? 'focus' : ''}" data-act="open:providers" role="combobox" aria-label="Provider">${providerSummary()}${S.providers.length ? `<button class="dismiss" data-act="clearProviders" aria-label="Clear providers">${I.x}</button>` : `<span class="ico">${I.down}</span>`}</div>
          ${S.open === 'providers' ? `<div class="listbox" role="listbox">${[['ALL', 'All providers'], ...ORDER.map((id) => [id, PEOPLE[id].name])].map(([id, n]) => {
            const on = id === 'ALL' ? S.providers.length === ORDER.length : S.providers.includes(id)
            return `<button class="option" role="option" aria-selected="${on}" data-act="prov:${id}"><span class="check ${on ? 'on' : ''}">${on ? I.check : ''}</span>${id === 'ALL' ? `<span class="av s24" style="background:var(--bg3);color:var(--fg3)">ALL</span>` : av(id, 's24')}${n}</button>`
          }).join('')}</div>` : ''}
        </div>
      </div>
      <div class="scroll">${S.providers.length ? ordered.map(providerBlock).join('') : `<div class="empty">Select provider and date to see available times</div>`}</div>
    </div>`
}

function repeatPanel() {
  const r = S.rep, done = r.unit && r.on && r.end && r.total
  return `<h2 class="title sub">Repeat appointment</h2>
    <div class="body">
      <div class="row2b">
        <div class="field">${label('Recur every', true)}<div style="display:flex;gap:12px">${spin('every', r.every, 80)}<div style="flex:1">${dropdown('unit', r.unit, 'Select', UNITS)}</div></div></div>
        ${`<div class="field">${label('On', true)}${dropdown('on', r.on, 'Select a day', WEEKDAYS)}</div>`}
      </div>
      <div class="row2b">
        <div class="field">${label('End schedule', true)}${dropdown('end', r.end, 'Select', ENDS)}</div>
        <div class="field">${label('Total occurrences', true)}${spin('total', r.total, 200)}</div>
      </div>
      ${done ? msg('warning', `There is a conflict on ${short(14)} at 11:00 am`) : ''}
      ${done ? msg('info', `Next appointment will be ${short(14)}<br>Final appointment will be on ${short(14 * (r.total - 1))}`) : ''}
      <div><button class="btn ${done ? 'primary' : ''}" ${done ? '' : 'disabled'} data-act="setRepeat">Set up repeat</button></div>
    </div>`
}

function injuryPanel() {
  const j = S.inj
  return `<h2 class="title sub">Injury claim<button class="btn subtle icon" aria-label="Back" data-act="panel:injury">${I.back}</button></h2>
    <div class="body">
      <div class="field">${label('Is this appointment related to an injury?')}<div>${sw('related', j.related, j.related ? 'Yes' : 'No')}</div></div>
      ${j.related ? `<div class="field" style="animation:rise 200ms var(--decel)">${label('Type of injury', true)}<div class="group">${['Existing', 'New', 'Referred'].map((k) => `<button class="${j.kind === k ? 'on' : ''}" data-act="kind:${k}">${k}</button>`).join('')}</div></div>
      <div class="field scroll" style="animation:rise 240ms var(--decel);margin:0 -24px;padding:0 24px">${label('Select an active injury', true)}<div class="radios">${INJURIES.map((x, k) => `<button class="radio ${j.pick === k ? 'on' : ''}" role="radio" aria-checked="${j.pick === k}" data-act="inj:${k}"><span class="dot"></span><span class="rl">${x[0]}</span><span class="rm">${x[1]}<br>${x[2]}</span></button>`).join('')}</div></div>` : ''}
      <div class="actions" style="padding-top:0"><button class="btn ${j.pick != null ? 'primary' : ''}" ${j.pick != null ? '' : 'disabled'} data-act="injDone">${I.checkmark} Done</button></div>
    </div>`
}

function rightPanel() {
  if (!S.panel) return ''
  const inner = S.panel === 'details' ? detailsPanel() : S.panel === 'repeat' ? repeatPanel() : injuryPanel()
  return `<div class="right" data-key="right-${S.panel}">${inner}</div>`
}

// ---------- "Before" and iteration screens (static or lightly interactive) ----------
function oldDialog({ provider = 'John Garner', grid = null, timesHtml = null, caption = '', title = 'New appointment', interactive = false } = {}) {
  const o = S.old
  const field = (l, inner, req) => `<div class="field">${label(l, req)}${inner}</div>`
  const tagInput = (n, c) => `<div class="input"><span class="tag">${avName(n, 's20', c)}<span class="val">${n}</span></span><button class="dismiss">${I.x}</button></div>`
  return `<div class="stillcol"><div class="dialog static old"><div class="left">
    <h2 class="title">${title}<button class="btn subtle icon" aria-label="Close">${I.xbig}</button></h2>
    ${field('Patient', tagInput('Bobby Smith', 0), true)}
    <div class="row2">${field('Type', `<div class="input select"><span class="val">${S.type}</span><span class="ico">${I.down}</span></div>`, true)}${field('Duration (mins)', `<div class="input"><span class="val">15</span></div>`, true)}</div>
    ${field('Provider', provider ? tagInput(provider, 2) : `<div class="input select"><span class="ph">Select a provider</span><span class="ico">${I.down}</span></div>`, true)}
    ${interactive ? `<div class="sw-field">${label('Urgent')}<div>${sw('o-urgent', o.urgent)}</div></div>` : ''}
    ${field('Date and time', timesHtml ?? `<div class="boxed" style="animation:none;flex-direction:row;gap:12px"><div class="field" style="flex:1">${label('Date')}<div class="input"><span class="val">${short(0)}</span><span class="ico">${I.cal}</span></div></div><div class="field" style="flex:1">${label('Time')}<div class="input"><span class="val">11:00 am</span><span class="ico">${I.clock}</span></div></div></div>`)}
    ${interactive ? `
      <div class="sw-field">${label('Add to waiting list')}<div>${sw('o-waiting', o.waiting)}</div></div>
      ${o.waiting ? `<div class="boxed"><div class="row2b"><div class="field">${label('Priority', true)}<div class="group" style="grid-template-columns:repeat(3,1fr)">${[1, 2, 3].map((p) => `<button class="${o.prio === p ? 'on' : ''}">${p}</button>`).join('')}</div></div><div class="field">${label('Date', true)}<div class="input"><span class="val">${short(7)}</span><span class="ico">${I.cal}</span></div></div></div><div style="display:flex;gap:8px;align-items:center"><span class="check"></span>Any provider</div></div>` : ''}
      <div class="sw-field">${label('Repeat appointment')}<div>${sw('o-repeat', o.repeat)}</div></div>
      ${o.repeat ? `<div class="boxed"><div class="row2b"><div class="field">${label('Recur every', true)}<div style="display:flex;gap:8px"><div class="input" style="width:64px"><span class="val">2</span></div><div class="input select" style="flex:1"><span class="val">Weeks</span><span class="ico">${I.down}</span></div></div></div><div class="field">${label('On', true)}<div class="input select"><span class="val">Tuesday</span><span class="ico">${I.down}</span></div></div></div>
        <div class="row2b"><div class="field">${label('End schedule', true)}<div class="input select"><span class="val">After</span><span class="ico">${I.down}</span></div></div><div class="field">${label('Total occurrences', true)}<div class="input"><span class="val">3</span></div><span class="hint">1 of 3 occurrences</span></div></div>
        ${o.waiting ? msg('warning', `There is a conflict on multiple dates: ${short(14)}, ${short(28)}`) : ''}
        ${msg('info', `Next appointment will be ${short(14)}<br>Final appointment will be on ${short(28)}`)}</div>` : ''}
    ` : `<div class="sw-field">${label('Repeat')}<div>${sw('x', false)}</div></div>`}
    <div class="field">${label('Comments')}<textarea class="area" rows="2"></textarea></div>
    <div class="actions"><button class="btn primary">Save</button><button class="btn">Cancel</button></div>
  </div></div>${caption ? `<div class="caption">${caption}</div>` : ''}</div>`
}

const dayBox = (inner) => `<div class="boxed" style="animation:none;align-items:center"><div class="stepper"><button class="btn subtle icon">${I.sleft}</button><div class="input"><span class="val">Today</span><span class="ico">${I.cal}</span></div><button class="btn subtle icon">${I.sright}</button></div>${inner}</div>`
const staticViews = {
  before: () => oldDialog({ interactive: true }),
  steps: () => `<div class="compare">
    <div><span class="chip">Step 1</span>${oldDialog({ provider: null, timesHtml: dayBox(`<div class="empty" style="padding:24px 0;font-style:italic">Pick a provider to see available times</div>`), caption: 'You have to pick a provider to see times' })}</div>
    <div><span class="chip">Step 2</span>${oldDialog({ timesHtml: dayBox(`<div class="grid6" style="width:100%">${[540, 555, 570, 585, 600, 615, 660, 675, 690, 705, 720, 735, 780, 810, 840, 870, 900, 930].map((m) => `<button class="time">${hm(m)}</button>`).join('')}</div>`), caption: 'Once a provider is picked, you see their times' })}</div></div>`,
  'iter-grid': () => `<div class="compare">${oldDialog({ provider: 'Dominique Sat, Yarn Oldrick, Charlie Charmoose', timesHtml: dayBox(`<div class="times" style="width:100%;grid-template-columns:repeat(4,1fr)">${[['DS', 540], ['2+', 555], ['YO', 570], ['3+', 585], ['DS', 600], ['YO', 615], ['2+', 630], ['DS', 645], ['3+', 660], ['YO', 690], ['DS', 720], ['2+', 750]].map(([p, m], k) => `<button class="time" style="${k === 6 ? 'background:var(--brand-bg2);color:var(--brand)' : ''}"><span class="prefix">${p}</span>${hm(m)}</button>`).join('')}</div>`), caption: 'A mixed grid: every provider’s times in one, marked with who' })}</div>`,
  'iter-tabs': () => `<div class="compare">${oldDialog({ provider: 'Dominique Sat, Yarn Oldrick, Charlie Charmoose', timesHtml: dayBox(`<div class="tabs" style="width:100%">${['Dominique (12)', 'Yarn (6)', 'Charlie (0)'].map((t, k) => `<button class="${k === 0 ? 'on' : ''}">${t}</button>`).join('')}</div><div class="grid6" style="width:100%">${times('DS', 0).map((m) => `<button class="time">${hm(m)}</button>`).join('')}</div>`), caption: 'A tab per provider: easier to read, but you compare by clicking' })}</div>`,
  'iter-empty': () => `<div class="compare">${oldDialog({ provider: 'Dominique Sat, Yarn Oldrick, Charlie Charmoose', timesHtml: dayBox(`<div class="tabs" style="width:100%">${['Dominique (12)', 'Yarn (6)', 'Charlie (0)'].map((t, k) => `<button class="${k === 2 ? 'on' : ''}">${t}</button>`).join('')}</div><div class="empty" style="width:100%;font-style:italic">No available times today</div>`), caption: 'Nothing free today, and nowhere to go from here' })}</div>`,
  toggles: () => `<div class="compare" style="gap:48px">
    <div>
      ${[[true, true, false, false], [true, false, false, true]].map(([a, b, c, ok]) => `<div class="dialog static" style="width:auto;padding:16px 24px;display:flex;align-items:center;gap:24px"><span class="mark" style="background:${ok ? '#107C10' : 'var(--red)'}">${ok ? I.checkmark : I.cross}</span>${[['Repeat', a], ['Urgent', b], ['Add to waiting list', c]].map(([t, on]) => `<div class="sw-field">${label(t)}${sw('x', on)}</div>`).join('')}</div>`).join('')}</div>
    <div>
      ${[null, 'repeat'].map((m) => `<div class="dialog static" style="width:380px;padding:16px 24px"><div class="group" style="width:100%">${[['urgent', 'Urgent'], ['repeat', 'Repeat'], ['waiting', 'Add to waiting list']].map(([k, t]) => `<button class="${m === k ? 'on' : ''}">${t}</button>`).join('')}</div></div>`).join('')}</div></div>`,
  bundling: () => `<div class="compare" style="gap:48px">
    <div><div class="dialog static" style="width:400px;padding:20px;display:flex;flex-direction:column;gap:12px">
      <div class="field">${label('Provider', true)}<div class="input"><span class="tag">${av('YO', 's20')}<span class="val">Yarn Oldrick</span></span><button class="dismiss">${I.x}</button></div></div>
      <div class="field">${label('Date and time')}<div class="boxed" style="animation:none;flex-direction:row"><div class="field" style="flex:1">${label('Date')}<div class="input"><span class="val">${short(0)}</span><span class="ico">${I.cal}</span></div></div><div class="field" style="flex:1">${label('Time')}<div class="input"><span class="val">11:00 am</span><span class="ico">${I.clock}</span></div></div></div></div></div></div>
    <div><div class="dialog static" style="width:400px;padding:20px;display:flex;flex-direction:column">
      <div class="field">${label('Appointment details', true)}<button class="card">${av('YO', 's40')}<span class="lines"><b>Yarn Oldrick</b><span>${long(0)}</span><span>11:00 am – 11:15 am</span></span><span class="chev">${I.right}</span></button></div></div></div></div>`,
}

// ---------- Render (patch in place so transitions run) ----------
function morph(from, to) {
  if (from.nodeType !== to.nodeType || from.nodeName !== to.nodeName || (from.dataset && to.dataset && from.dataset.key !== to.dataset.key)) { from.replaceWith(to); return }
  if (from.nodeType === 3) { if (from.nodeValue !== to.nodeValue) from.nodeValue = to.nodeValue; return }
  if (from.nodeType !== 1) return
  for (const a of [...from.attributes]) if (!to.hasAttribute(a.name)) from.removeAttribute(a.name)
  for (const a of [...to.attributes]) if (from.getAttribute(a.name) !== a.value) from.setAttribute(a.name, a.value)
  if (from.tagName === 'INPUT' && document.activeElement !== from && from.value !== (to.getAttribute('value') ?? '')) from.value = to.getAttribute('value') ?? ''
  if (from.tagName === 'TEXTAREA') return
  const f = [...from.childNodes], t = [...to.childNodes]
  t.forEach((n, i) => { if (i < f.length) morph(f[i], n); else from.appendChild(n) })
  for (let i = t.length; i < f.length; i++) f[i].remove()
}

function view() {
  if (staticViews[V]) return `<div id="stage" class="tall" style="width:auto;display:inline-block;padding:40px">${staticViews[V]()}</div>`
  return `<div id="stage"><div class="dialog ${S.panel ? 'two' : ''}" role="dialog" aria-label="New appointment">${leftPanel()}${rightPanel()}</div></div>`
}
function render() {
  const tpl = document.createElement('template'); tpl.innerHTML = view().trim()
  const root = document.getElementById('app')
  if (!root.firstElementChild) root.appendChild(tpl.content.firstElementChild)
  else morph(root.firstElementChild, tpl.content.firstElementChild)
}

// ---------- Actions ----------
const A = {
  open: (k) => { S.open = S.open === k ? null : k },
  set: (k, v) => {
    S.open = null
    if (k === 'type') S.type = v
    else S.rep[k] = v
  },
  inc: (k, n) => {
    n = +n
    if (k === 'duration') S.duration = Math.max(5, S.duration + n * 5)
    else S.rep[k] = Math.max(1, (S.rep[k] ?? 0) + n)
  },
  clearPatient: () => { S.patient = null; S.query = '' },
  pickPatient: (n) => { S.patient = n; S.query = '' },
  panel: (p) => { S.open = null; S.panel = S.panel === p ? null : p },
  mode: (m) => { S.mode = S.mode === m ? null : m; if (S.mode !== 'repeat' && S.panel === 'repeat') S.panel = null },
  prov: (id) => {
    if (id === 'ALL') S.providers = S.providers.length === ORDER.length ? [] : [...ORDER]
    else S.providers = S.providers.includes(id) ? S.providers.filter((x) => x !== id) : [...S.providers, id]
  },
  clearProviders: () => { S.providers = []; S.open = null },
  expand: (id) => { S.expanded[id] = !S.expanded[id] },
  pday: (id, n) => { S.pdate[id] = Math.max(0, (S.pdate[id] ?? S.date) + +n) },
  jump: (id, d) => { S.pdate[id] = +d; S.expanded[id] = true },
  time: (id, d, t) => {
    S.picked = { id, d: +d, t: +t }; render()
    setTimeout(() => { S.booked = S.picked; S.picked = null; S.panel = null; render() }, 260)
    return true
  },
  setRepeat: () => { if (S.rep.unit && S.rep.on && S.rep.total) { S.repeatSet = { ...S.rep }; S.panel = null } },
  toggle: (k) => {
    if (k === 'related') S.inj.related = !S.inj.related
    else if (k.startsWith('o-')) S.old[k.slice(2)] = !S.old[k.slice(2)]
  },
  kind: (k) => { S.inj.kind = k },
  inj: (k) => { S.inj.pick = +k },
  injDone: () => { if (S.inj.pick != null) { S.injurySet = INJURIES[S.inj.pick]; S.panel = null } },
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]')
  if (!el) { if (S.open && !e.target.closest('.listbox')) { S.open = null; render() } return }
  e.stopPropagation()
  const [name, ...args] = el.dataset.act.split(':')
  // A click outside an open popover closes it first (Fluent dismisses on outside click)
  if (S.open && !el.closest('.listbox') && name !== 'open') S.open = null
  if (!A[name]?.(...args)) render()
})
document.addEventListener('input', (e) => {
  const k = e.target.dataset?.input
  if (!k) return
  if (k === 'query') S.query = e.target.value
  else if (k === 'duration') S.duration = +e.target.value || S.duration
  else S.rep[k] = +e.target.value || null
  render()
})
render()
