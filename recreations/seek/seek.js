// The SEEK courses module, every state of the case study behind ?v= (see index.html).
const V = new URLSearchParams(location.search).get('v') || 'final'
const app = document.getElementById('app')
const sheetRoot = document.getElementById('sheet-root')

// ---- Provider marks: simple stand-ins, not the real logos ----
const MARKS = {
  monarch: '<svg class="m-monarch" viewBox="0 0 28 18"><path d="M0 18 5 4l4 7 5-11 5 11 4-7 5 14z"/></svg>',
  swinburne: '<span class="mark dark" style="margin:0;width:100%;height:100%;display:grid;grid-template-columns:repeat(2,9px);gap:2px;place-content:center"><i style="width:9px;height:9px;background:#fff"></i><i style="width:9px;height:9px;background:#D0343A"></i><i style="width:9px;height:9px;background:#D0343A"></i><i style="width:9px;height:9px;background:#fff"></i></span>',
  rmit: '<span style="font:700 11px/1 Inter;letter-spacing:.02em;color:#E60028">RMIT</span>',
  torrens: '<span style="width:22px;height:22px;border-radius:50%;border:3px solid #1C2330;display:block"></span>',
  upskilled: '<span style="font:700 15px/1 Inter;color:#4B2C8F">U</span>',
  tafe: '<span style="font:700 10px/1 Inter;color:#B5121B">TAFE</span>',
  coder: '<span style="font:700 14px/1 ui-monospace,monospace;color:#1C2330">&lt;/&gt;</span>',
  wagon: '<span style="width:20px;height:14px;border-radius:3px;background:#E04C3B;display:block"></span>',
  cqu: '<span style="font:700 10px/1 Inter;color:#00788A">CQU</span>',
}

// ---- Courses, by qualification (the shipped module) ----
const QUALS = [
  { id: 'ug', name: 'Undergraduate', desc: 'The first university degree you can apply for after Year 12. Comprehensive skills and career training over several years.', courses: [
    { id: 'bcs', course: 'Bachelor of Computer Science', type: 'Bachelor degree', provider: 'Monarch Institute', partner: 'Monarch Institute Online', mark: 'monarch', facts: ['3 years full time', 'On campus (Melbourne), Online', 'Starts February 2025'], mode: 'On campus, Online', start: 'February 2025', dur: '3 years full time', about: 'Build essential programming, technical and problem-solving skills, and learn the tools software teams use to deliver for their users. Choose a major in Software Development or Data Science.', summary: 'Build programming, technical and problem-solving skills, and the tools software teams use every day.' },
    { id: 'bit', course: 'Bachelor of Information Technology', type: 'Bachelor degree', provider: 'Swinburne University', partner: 'Univ. of Swinburne Online', mark: 'swinburne', facts: ['3 years full time', 'Online', 'Starts February 2025'] },
    { id: 'bse', course: 'Bachelor of Software Engineering', type: 'Bachelor degree', provider: 'RMIT University', partner: 'RMIT Online', mark: 'rmit', facts: ['4 years full time', 'On campus (Melbourne)', 'Starts March 2025'] },
  ] },
  { id: 'vet', name: 'TAFE / VET', short: 'VET', desc: 'Practical, job-ready training from TAFE and private colleges, often in a year or two.', courses: [
    { id: 'dit', course: 'Diploma of Information Technology', type: 'Diploma', provider: 'Upskilled', partner: 'Upskilled Pty Ltd', mark: 'upskilled', facts: ['12 months part time', 'Online', 'Start any time'] },
    { id: 'c4p', course: 'Certificate IV in Programming', type: 'Certificate IV', provider: 'Torrens University', partner: 'In partnership with Ducere Global', mark: 'torrens', facts: ['6 months full time', 'Online', 'Starts March 2025'] },
    { id: 'dsd', course: 'Diploma of Software Development', type: 'Diploma', provider: 'TAFE NSW', partner: 'TAFE NSW Sydney', mark: 'tafe', facts: ['18 months full time', 'On campus (Sydney)', 'Starts February 2025'] },
  ] },
  { id: 'boot', name: 'Bootcamps', short: 'Short courses', desc: 'Short, intensive courses that build job-ready skills in weeks.', courses: [
    { id: 'seb', course: 'Software Engineering Bootcamp', type: 'Bootcamp', provider: 'Coder Academy', partner: 'Coder Academy Sydney', mark: 'coder', facts: ['24 weeks full time', 'On campus (Sydney), Online', 'Starts April 2025'] },
    { id: 'fsw', course: 'Full Stack Web Development', type: 'Bootcamp', provider: 'Le Wagon', partner: 'Le Wagon Melbourne', mark: 'wagon', facts: ['9 weeks full time', 'On campus (Melbourne)', 'Starts May 2025'] },
  ] },
  { id: 'pg', name: 'Postgraduate', desc: 'Graduate diplomas and masters, to go further or switch careers.', courses: [
    { id: 'mit', course: 'Master of Information Technology', type: 'Masters degree', provider: 'CQUniversity', partner: 'CQUniversity Australia', mark: 'cqu', facts: ['2 years full time', 'Online', 'Starts March 2025'] },
    { id: 'gdc', course: 'Graduate Diploma of Computing', type: 'Graduate diploma', provider: 'Monarch Institute', partner: 'Monarch Institute Online', mark: 'monarch', facts: ['1 year full time', 'Online', 'Starts July 2025'] },
  ] },
]

// The first release grouped a qualification's courses under the course name, a card per provider
const RELEASE = {
  ug: [
    { course: 'Bachelor of Information Technology', desc: 'Develops your computer science knowledge for a career in computer engineering or software development.', cards: [['Monash University', 'Univ. of Swinburne Online'], ['Torrens University', 'In partnership with Ducere Global'], ['RMIT University', 'RMIT Online']] },
    { course: 'Bachelor of Computer Science', desc: 'Programming, algorithms and systems, for a career building software.', cards: [['Monarch Institute', 'Monarch Institute Online'], ['Swinburne University', 'Univ. of Swinburne Online']] },
  ],
  vet: [
    { course: 'Diploma of Information Technology', desc: 'Practical skills in networking, support and programming, ready for an IT role.', cards: [['Upskilled', 'Upskilled Pty Ltd'], ['TAFE NSW', 'TAFE NSW Sydney']] },
    { course: 'Certificate IV in Programming', desc: 'The basics of writing software, in about six months.', cards: [['Torrens University', 'In partnership with Ducere Global'], ['Open Colleges', 'Open Colleges Online']] },
  ],
  boot: [
    { course: 'Software Engineering Bootcamp', desc: 'An intensive course to change careers into software.', cards: [['Coder Academy', 'Coder Academy Sydney'], ['Le Wagon', 'Le Wagon Melbourne']] },
  ],
  pg: [
    { course: 'Master of Information Technology', desc: 'Advanced study for graduates moving into technology.', cards: [['CQUniversity', 'CQUniversity Australia'], ['Monarch Institute', 'Monarch Institute Online']] },
  ],
}
const RELEASE_FACTS = [['2 years full time (part time available)', 'On campus (Melbourne), Online', 'Starts January 2025'], ['3 years full time', 'Online', 'Starts February 2025'], ['4 years full time', 'On campus (Melbourne)', 'Starts March 2025']]

// Fade an element in: add it hidden, then let it transition on the next frame
const enter = (root, delay = 0) => {
  root.classList.add('fade', 'pre')
  setTimeout(() => requestAnimationFrame(() => root.classList.remove('pre')), 16 + delay)
}
// A fresh sheet body, so the new content fades in on its own node
const freshBody = (fade) => {
  const old = document.getElementById('sheet-body')
  const body = document.createElement('div')
  body.id = 'sheet-body'
  body.className = 'sheet-body'
  if (fade) enter(body)
  old.replaceWith(body)
  return body
}
const enterAll = (els) => els.forEach((el, i) => enter(el, i * 40))

const find = (id) => QUALS.flatMap((q) => q.courses).find((c) => c.id === id)
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
const chev = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 5 4 4 4-4"/></svg>'
const pin = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 16s5.5-4.6 5.5-9A5.5 5.5 0 0 0 3.5 7c0 4.4 5.5 9 5.5 9z"/><circle cx="9" cy="7" r="2"/></svg>'
const backArrow = '<svg width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2 2 8l6 6"/></svg>'

// ---- Cards ----
const oldCard = (title, partner, facts, id = '') => `
  <button class="card" data-course="${id}">
    <div class="old-title">${esc(title)}</div>
    <div class="partner">${esc(partner)}</div>
    <div class="facts">${facts.map((f) => `<span>${esc(f)}</span>`).join('')}</div>
  </button>`
const newCard = (c) => `
  <button class="card" data-course="${c.id}">
    <div class="mark">${MARKS[c.mark]}</div>
    <h3>${esc(c.course)}</h3>
    <div class="by">${esc(c.provider)}</div>
    <div class="facts">${c.facts.map((f) => `<span>${esc(f)}</span>`).join('')}</div>
  </button>`
const rail = (cards) => `<div class="rail">${cards.join('')}</div><div class="dots">${cards.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>`

const location_ = `<label class="field-label">Location</label><div class="select">${pin}<span>Australia</span><span class="chev">${chev}</span></div>`

// ---- The module ----
function module_({ tabs, selected, body }) {
  return `<section class="module">
    <h1>Software developer courses with in-demand skills</h1>
    <div class="tabs" role="tablist">${tabs.map((t) => `<button class="tab" role="tab" data-tab="${t.id}" aria-selected="${t.id === selected}">${t.label}</button>`).join('')}</div>
    ${location_}
    <div id="groups">${body}</div>
  </section>`
}

// The first release: one qualification at a time, course-name headings, provider cards
function releaseGroups(q) {
  return RELEASE[q].map((g) => `<div class="group">
    <h2>${esc(g.course)}</h2><p>${esc(g.desc)}</p>
    ${rail(g.cards.map(([t, p], i) => oldCard(t, p, RELEASE_FACTS[i % 3])))}
  </div>`).join('')
}

// Every qualification on one scroll; old or new cards
function allGroups(style) {
  return QUALS.map((q) => `<div class="group" id="g-${q.id}">
    <h2 class="under">${esc(q.name)}</h2><p>${esc(q.desc)}</p>
    ${rail(q.courses.map((c) => style === 'old' ? oldCard(c.provider, c.partner, c.facts, c.id) : newCard(c)))}
  </div>`).join('')
}

function render() {
  document.body.classList.remove('locked')
  if (V === 'release') {
    const tabs = [{ id: 'ug', label: 'Undergraduate' }, { id: 'vet', label: 'VET' }, { id: 'boot', label: 'Short courses' }, { id: 'pg', label: 'Postgraduate' }]
    app.innerHTML = module_({ tabs, selected: 'ug', body: releaseGroups('ug') })
    app.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => {
      app.querySelectorAll('.tab').forEach((x) => x.setAttribute('aria-selected', String(x === t)))
      document.getElementById('groups').innerHTML = releaseGroups(t.dataset.tab)
      enterAll([...document.querySelectorAll('#groups .group')])
      bindRails()
    }))
  } else {
    const tabs = [{ id: 'all', label: 'All' }, ...QUALS.map((q) => ({ id: q.id, label: q.name }))]
    const style = V === 'all' || V === 'cards' ? 'old' : 'new'
    app.innerHTML = module_({ tabs, selected: 'all', body: allGroups(style) })
    // The tabs stay as shortcuts: jump to that qualification
    app.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => {
      app.querySelectorAll('.tab').forEach((x) => x.setAttribute('aria-selected', String(x === t)))
      const target = t.dataset.tab === 'all' ? app : document.getElementById(`g-${t.dataset.tab}`)
      const y = t.dataset.tab === 'all' ? 0 : target.getBoundingClientRect().top + scrollY - 12
      scrollTo({ top: y, behavior: 'smooth' })
    }))
    app.querySelectorAll('.card').forEach((c) => c.addEventListener('click', () => {
      if (V === 'before') coursePage(c.dataset.course)
      else if (V === 'after' || V === 'final') openSheet(c.dataset.course)
    }))
  }
  bindRails()
}

function bindRails() {
  app.querySelectorAll('.rail').forEach((r) => {
    const dots = r.nextElementSibling.children
    r.addEventListener('scroll', () => {
      const i = Math.round(r.scrollLeft / 294)
      ;[...dots].forEach((d, k) => d.classList.toggle('on', k === Math.min(i, dots.length - 1)))
    }, { passive: true })
  })
}

// Leak 2: the same cards, swapped from text-only to logo and course name
window.swapCards = () => {
  app.querySelectorAll('.card').forEach((el, i) => {
    const c = find(el.dataset.course)
    if (!c) return
    const tmp = document.createElement('div')
    tmp.innerHTML = newCard(c).trim()
    const next = tmp.firstElementChild
    next.classList.add('pop')
    el.replaceWith(next)
    enter(next, (i % 3) * 60)
  })
}

// ---- Leak 3, before: off to a course page, then a form page ----
function coursePage(id) {
  const c = find(id)
  scrollTo(0, 0)
  app.innerHTML = `<section class="page">
    <a class="back" data-back>${backArrow}<span>SEEK Learning · Courses</span></a>
    <div class="mark">${MARKS[c.mark]}</div>
    <h1>${esc(c.course)}</h1><div class="by">${esc(c.provider)}</div>
    <dl class="facts-panel"><div><dt>Duration</dt><dd>${esc(c.dur || c.facts[0])}</dd></div><div><dt>Study mode</dt><dd>${esc(c.mode || c.facts[1])}</dd></div><div><dt>Starts</dt><dd>${esc(c.start || c.facts[2].replace('Starts ', ''))}</dd></div></dl>
    <h2>About this course</h2><p>${esc(c.about || c.summary || 'Build job-ready skills with a course that fits around you.')}</p>
  </section>
  <div class="dock btn-row"><button class="btn primary" data-enquire>Enquire</button><button class="btn secondary">Visit website</button></div>`
  enter(app.querySelector('.page')); app.querySelector('.page').classList.add('from-right')
  app.querySelector('[data-back]').addEventListener('click', render)
  app.querySelector('[data-enquire]').addEventListener('click', () => formPage(id))
}

function formPage(id) {
  const c = find(id)
  scrollTo(0, 0)
  app.innerHTML = `<section class="page">
    <a class="back" data-back>${backArrow}<span>${esc(c.course)}</span></a>
    <h1>Enquire about this course</h1>
    <p style="margin-top:8px">${esc(c.provider)} will be in touch about the ${esc(c.course)}.</p>
    <div class="form">
      <label>Email<input class="input" name="email" autocomplete="off"></label>
      <label>First name<input class="input" name="first" autocomplete="off"></label>
      <label>Last name<input class="input" name="last" autocomplete="off"></label>
      <label>Phone<input class="input" name="phone" autocomplete="off"></label>
      <label>Reason for enquiry<div class="select input"><span>Looking to get advice</span><span class="chev">${chev}</span></div></label>
    </div>
  </section>
  <div class="dock"><button class="btn primary" style="width:100%">Send enquiry</button></div>`
  enter(app.querySelector('.page')); app.querySelector('.page').classList.add('from-right')
  app.querySelector('[data-back]').addEventListener('click', () => coursePage(id))
}

// ---- Leak 3, fixed: a sheet over the page ----
const tick = '<svg viewBox="0 0 18 18"><path d="m3 9.5 4 4 8-9"/></svg>'
const info = '<svg viewBox="0 0 18 18"><circle cx="9" cy="9" r="7.5"/><path d="M9 5v5M9 12.5v.5"/></svg>'
const dollar = '<svg viewBox="0 0 18 18"><path d="M9 2v14M12.5 5.5C12 4.5 10.8 4 9 4 7 4 5.8 5 5.8 6.4c0 3.3 6.7 1.8 6.7 5.2C12.5 13 11 14 9 14c-2 0-3.3-.7-3.8-2"/></svg>'

function openSheet(id) {
  const c = find(id)
  sheetRoot.innerHTML = `<div class="scrim" data-close></div>
    <div class="sheet" role="dialog" aria-label="${esc(c.course)}">
      <div class="handle"></div>
      <div class="sheet-head">
        <div class="mark">${MARKS[c.mark]}</div>
        <div><div class="eyebrow">${esc(c.type)}</div><h2>${esc(c.course)}</h2><div class="by">${esc(c.provider)}</div></div>
        <button class="close" data-close aria-label="Close"><svg width="16" height="16" viewBox="0 0 16 16" stroke="#1C2330" stroke-width="2"><path d="m2 2 12 12M14 2 2 14"/></svg></button>
      </div>
      <div class="sheet-body" id="sheet-body"></div>
    </div>`
  document.body.classList.add('locked')
  sheetDetails(c)
  sheetRoot.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeSheet))
  requestAnimationFrame(() => requestAnimationFrame(() => sheetRoot.classList.add('open')))
}

function closeSheet() {
  sheetRoot.classList.remove('open')
  document.body.classList.remove('locked')
  setTimeout(() => { if (!sheetRoot.classList.contains('open')) sheetRoot.innerHTML = '' }, 420)
}

function sheetDetails(c, again = false) {
  const body = freshBody(again)
  body.innerHTML = `<p>${esc(c.summary || 'Build job-ready skills with a course that fits around you.')}</p>
    <ul class="ticks"><li>${tick}Nationally recognised</li><li>${info}Entry requirements apply</li><li>${dollar}Commonwealth supported places</li></ul>
    <div class="btn-row"><button class="btn primary" data-enquire>Enquire</button><button class="btn secondary"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 2h5v5M14 2 7 9M12 10v4H2V4h4"/></svg>Visit website</button></div>`
  body.querySelector('[data-enquire]').addEventListener('click', () => sheetForm(c))
}

function sheetForm(c) {
  let body = freshBody(true)
  body.innerHTML = `<a class="back" data-details>${backArrow}<span>Course details</span></a>
    <p style="margin-top:10px">Send an enquiry and ${esc(c.provider)} will be in touch.</p>
    <div class="form">
      <label>Email<input class="input" name="email" autocomplete="off"></label>
      <div class="pair"><label>First name<input class="input" name="first" autocomplete="off"></label><label>Last name<input class="input" name="last" autocomplete="off"></label></div>
      <label>Phone<input class="input" name="phone" autocomplete="off"></label>
    </div>
    <button class="btn primary send" data-send>Send enquiry</button>`
  body.querySelector('[data-details]').addEventListener('click', () => sheetDetails(c, true))
  body.querySelector('[data-send]').addEventListener('click', () => {
    const email = body.querySelector('[name=email]').value || 'you'
    body = freshBody(true)
    body.innerHTML = `<div class="sent"><div class="tick"><svg width="24" height="24" viewBox="0 0 18 18" fill="none" stroke="#1C2330" stroke-width="1.8"><path d="m3 9.5 4 4 8-9"/></svg></div>
      <h3>Enquiry sent</h3><p>${esc(c.provider)} will be in touch at ${esc(email)}.</p>
      <button class="btn secondary" data-done>Back to courses</button></div>`
    body.querySelector('[data-done]').addEventListener('click', closeSheet)
  })
}

render()
