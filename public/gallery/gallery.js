/* <gc-gallery> — a full-width column of work; click a tile to open the artefact (live HTML, video
   or image) in a large dialog. "device": "phone" frames "mobile" (a 390x763 phone screenshot) over
   "thumb" blurred, and the dialog then shows the live page in the same phone; "screen" is the page's
   ground, which the status bar and home indicator sit on. A live item can have a
   "clip" (a video of it being used) that plays in its tile, with "thumb" as the poster.
   Framework-free so the Next site and the static homepage variants share it.
   A video with no thumb plays in its tile; "preview" is a shorter cut to play there.

   Attributes: src (items JSON, default /gallery/items.json) · filters (show the sort switch)
               limit (cap the number of tiles) · deeplink (keep the open item in the URL hash)

   Add ?edit to the URL on localhost for a Share checkbox on every tile. Unticking one sets
   "hidden" on the item in items.json (through the dev-only /api/gallery route). */
(() => {
'use strict'
// Not in production yet: the gallery only runs on the local dev server. GALLERY_LIVE in
// src/components/Gallery.tsx is the matching switch for the Next site. Flip both to launch.
const LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname)
const LIVE = LOCAL
if (!LIVE || customElements.get('gc-gallery')) return

// A static page marks what depends on the gallery with [data-gallery] (hidden until it runs)
// and what the gallery replaces with [data-gallery-fallback]
document.querySelectorAll('[data-gallery]').forEach(el => { el.hidden = false })
document.querySelectorAll('[data-gallery-fallback]').forEach(el => { el.hidden = true })

const CSS = '/gallery/gallery.css'
// Only an interactive tile needs a badge: a video already plays in its tile
const KIND = { html: 'Interactive' }
// items.json is in curated order, best first. "Featured" keeps it; "Newest" goes by date.
const SORTS = ['Featured', 'Newest']
const MONTH = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' })
const when = d => d ? MONTH.format(new Date(`${d}T12:00`)) : ''
// Curating writes to the content file, which only the local dev server can do
const EDIT = LOCAL && new URLSearchParams(location.search).has('edit')
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`)
// A phone drawn the way the device draws it: the status bar (under the Dynamic Island) and the
// home indicator belong to the phone, so the page only gets the safe area between them, 390x763
// of the 390x844 screen. Without them a page's corner buttons run into the rounded screen edge.
const STATUS_ICONS = '<svg viewBox="0 0 70 13" aria-hidden="true"><path d="M1 9h3v3H1zM6 7h3v5H6zM11 4h3v8h-3zM16 1h3v11h-3z"/><path d="M31 3.5a9 9 0 0 1 12 0l-1.4 1.5a7 7 0 0 0-9.2 0zM33.6 6.3a5.2 5.2 0 0 1 6.8 0L39 7.8a3.2 3.2 0 0 0-4 0zM37 11.5l-1.6-1.8a2.3 2.3 0 0 1 3.2 0z"/><rect x="47.5" y=".5" width="19" height="11" rx="3" fill="none" stroke="currentColor" opacity=".4"/><rect x="49" y="2" width="16" height="8" rx="1.8"/><path d="M68 4v4c.8-.3 1.3-1 1.3-2s-.5-1.7-1.3-2z" opacity=".4"/></svg>'
const phone = (i, view) => `<span class="gal-device" style="--screen:${esc(i.screen || '#fff')}"><span class="gal-device-screen">
  <span class="gal-device-status"><b>9:41</b><i></i>${STATUS_ICONS}</span>${view}<span class="gal-device-home"></span></span></span>`

const styles = new Promise(done => {
  if (document.querySelector(`link[href="${CSS}"]`)) return done()
  const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: CSS, onload: done, onerror: done })
  document.head.appendChild(link)
})
const loads = {}
const load = url => loads[url] ||= fetch(url).then(r => r.json()).then(d => d.items)

class Gallery extends HTMLElement {
  async connectedCallback() {
    if (this.items) return
    try {
      const [items] = await Promise.all([load(this.getAttribute('src') || '/gallery/items.json'), styles])
      this.items = EDIT ? items : items.filter(i => !i.hidden)
    } catch { return }
    this.sort = 'Featured'
    this.render()
    if (this.hasAttribute('deeplink') && location.hash) this.open(decodeURIComponent(location.hash.slice(1)))
  }

  disconnectedCallback() { document.documentElement.style.overflow = '' }

  get visible() {
    const list = this.sort === 'Newest' ? [...this.items].sort((a, b) => (b.date || '').localeCompare(a.date || '')) : this.items
    const limit = +this.getAttribute('limit')
    return limit ? list.slice(0, limit) : list
  }

  render() {
    this.innerHTML = `
      ${this.hasAttribute('filters') ? `<div class="gal-filters" role="group" aria-label="Sort">${SORTS.map(s => `<button type="button" data-sort="${s}" aria-pressed="${s === this.sort}">${s}</button>`).join('')}</div>` : ''}
      ${EDIT ? '<p class="gal-editbar"></p>' : ''}
      <div class="gal-grid"></div>
      <dialog class="gal-dialog" aria-label="Artefact viewer">
        <div class="gal-bar">
          <div class="gal-title"></div><span class="gal-count"></span>
          <button type="button" data-act="prev" aria-label="Previous">←</button>
          <button type="button" data-act="next" aria-label="Next">→</button>
          <a data-act="live" target="_blank" rel="noopener">Open ↗</a>
          <button type="button" data-act="close" autofocus>Close</button>
        </div>
        <div class="gal-stage"></div>
      </dialog>`
    this.dialog = this.querySelector('dialog')
    this.renderGrid()

    this.addEventListener('click', this)
    this.addEventListener('change', this)
    this.dialog.addEventListener('close', this)
    this.dialog.addEventListener('keydown', this)
  }

  renderGrid() {
    this.querySelector('.gal-grid').innerHTML = this.visible.map(i => `
      <div class="gal-tile${i.hidden ? ' gal-off' : ''}" data-id="${esc(i.id)}">
        <button type="button" class="gal-open" aria-label="${esc(i.title)}">
        <span class="gal-media${i.device === 'phone' ? ' gal-on-phone' : ''}">
        ${i.clip ? `<video src="${esc(i.clip)}"${i.thumb ? ` poster="${esc(i.thumb)}"` : ''} autoplay loop muted playsinline></video>` : i.thumb ? `<img src="${esc(i.thumb)}" alt="" loading="lazy"${i.focus ? ` style="object-position:${esc(i.focus)}"` : ''} />` : i.type === 'video' ? `<video src="${esc(i.preview || i.src)}" autoplay loop muted playsinline></video>` : `<img src="${esc(i.src)}" alt="" loading="lazy" />`}
        ${i.device === 'phone' ? phone(i, `<img class="gal-device-view" src="${esc(i.mobile)}" alt="" loading="lazy" />`) : ''}
        ${KIND[i.type] ? `<span class="gal-kind">${KIND[i.type]}</span>` : ''}
        </span>
        <span class="gal-cap"><b>${esc(i.title)}</b><span>${esc([i.project || i.group, when(i.date)].filter(Boolean).join(' · '))}</span></span>
        </button>
        ${EDIT ? `<label class="gal-share"><input type="checkbox"${i.hidden ? '' : ' checked'} />Share</label>` : ''}
      </div>`).join('')
    if (EDIT) this.status()
  }

  status(error) {
    const shared = this.items.filter(i => !i.hidden).length
    this.querySelector('.gal-editbar').innerHTML = error
      ? `<span data-error>${esc(error)}</span>`
      : `<b>Editing.</b> Untick a tile to hide it everywhere. ${shared} of ${this.items.length} shared.`
  }

  async share(box) {
    const tile = box.closest('.gal-tile')
    const item = this.items.find(i => i.id === tile.dataset.id)
    const set = hidden => {
      item.hidden = hidden
      box.checked = !hidden
      tile.classList.toggle('gal-off', hidden)
    }
    set(!box.checked)
    this.status()
    try {
      const r = await fetch('/api/gallery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, hidden: item.hidden }) })
      if (!r.ok) throw new Error(r.status)
    } catch (err) {
      set(!item.hidden)
      this.status(`Couldn't save "${item.title}" (${err.message}). Is the dev server running?`)
    }
  }

  handleEvent(e) {
    if (e.type === 'close') return this.closed()
    if (e.type === 'change') return e.target.closest('.gal-share') && this.share(e.target)
    if (e.type === 'keydown') {
      if (e.key === 'ArrowRight') this.step(1)
      if (e.key === 'ArrowLeft') this.step(-1)
      return
    }
    const sort = e.target.closest('.gal-filters button')
    if (sort) {
      this.sort = sort.dataset.sort
      this.querySelectorAll('.gal-filters button').forEach(b => b.setAttribute('aria-pressed', b === sort))
      return this.renderGrid()
    }
    const tile = e.target.closest('.gal-open')
    if (tile) return this.open(tile.parentNode.dataset.id)
    const act = e.target.closest('[data-act]')?.dataset.act
    if (act === 'prev') this.step(-1)
    if (act === 'next') this.step(1)
    if (act === 'close' || e.target === this.dialog) this.dialog.close()
  }

  open(id) {
    // Arrows walk whatever the grid is showing; a deep link to a filtered-out item falls back to everything
    this.list = this.visible.some(i => i.id === id) ? this.visible : this.items
    this.index = this.list.findIndex(i => i.id === id)
    if (this.index < 0) return
    this.show()
    if (!this.dialog.open) this.dialog.showModal()
    document.documentElement.style.overflow = 'hidden'
  }

  step(d) {
    this.index = (this.index + d + this.list.length) % this.list.length
    this.show()
  }

  show() {
    const i = this.list[this.index]
    const q = s => this.dialog.querySelector(s)
    q('.gal-title').innerHTML = `${esc(i.title)}<span>${esc([i.project, when(i.date)].filter(Boolean).join(' · '))}</span>`
    q('.gal-count').textContent = `${this.index + 1} / ${this.list.length}`
    q('[data-act="live"]').hidden = i.type !== 'html'
    q('[data-act="live"]').href = i.src
    q('.gal-stage').classList.toggle('gal-phone-view', i.device === 'phone')
    q('.gal-stage').innerHTML =
      i.type === 'html' ? `${i.thumb ? `<img class="gal-poster" src="${esc(i.thumb)}" alt="" />` : ''}${(f => i.device === 'phone' ? phone(i, f) : f)(`<iframe src="${esc(i.src)}" title="${esc(i.title)}" allow="fullscreen"></iframe>`)}`
      : i.type === 'video' ? `<video src="${esc(i.src)}"${i.thumb ? ` poster="${esc(i.thumb)}"` : ''} controls autoplay playsinline></video>`
      : `<img src="${esc(i.src)}" alt="${esc(i.title)}" />`
    if (this.hasAttribute('deeplink')) history.replaceState(null, '', `#${encodeURIComponent(i.id)}`)
  }

  closed() {
    // Emptying the stage is what stops a playing video or a running prototype
    this.dialog.querySelector('.gal-stage').innerHTML = ''
    document.documentElement.style.overflow = ''
    if (this.hasAttribute('deeplink')) history.replaceState(null, '', location.pathname + location.search)
  }
}

customElements.define('gc-gallery', Gallery)
})()
