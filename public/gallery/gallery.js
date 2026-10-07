/* <gc-gallery> — bento grid of work; click a tile to open the artefact (live HTML, video or image)
   in a large dialog. Framework-free so the Next site and the static homepage variants share it.

   Attributes: src (items JSON, default /gallery/items.json) · filters (show group filters)
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
const KIND = { html: 'Live', video: 'Video' }
// The bento rule: a website gets a large tile, a feature or interaction a small one
const SIZE = { website: 'lg' }
// Curating writes to the content file, which only the local dev server can do
const EDIT = LOCAL && new URLSearchParams(location.search).has('edit')
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`)

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
    this.group = 'All'
    this.render()
    if (this.hasAttribute('deeplink') && location.hash) this.open(decodeURIComponent(location.hash.slice(1)))
  }

  disconnectedCallback() { document.documentElement.style.overflow = '' }

  get visible() {
    const list = this.group === 'All' ? this.items : this.items.filter(i => i.group === this.group)
    const limit = +this.getAttribute('limit')
    return limit ? list.slice(0, limit) : list
  }

  render() {
    const groups = ['All', ...new Set(this.items.map(i => i.group))]
    this.innerHTML = `
      ${this.hasAttribute('filters') ? `<div class="gal-filters">${groups.map(g => `<button type="button" data-g="${esc(g)}" aria-pressed="${g === this.group}">${esc(g)}${g === 'All' ? ` · ${this.items.length}` : ''}</button>`).join('')}</div>` : ''}
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
    // An item's own size is a hand-tuned exception that makes the full set pack without holes,
    // so it only applies when nothing is filtered out
    const size = i => (this.group === 'All' && i.size) || SIZE[i.kind]
    this.querySelector('.gal-grid').innerHTML = this.visible.map(i => `
      <div class="gal-tile${i.hidden ? ' gal-off' : ''}" data-id="${esc(i.id)}"${size(i) ? ` data-size="${esc(size(i))}"` : ''}>
        <button type="button" class="gal-open" aria-label="${esc(i.title)}">
        ${i.thumb ? `<img src="${esc(i.thumb)}" alt="" loading="lazy"${i.focus ? ` style="object-position:${esc(i.focus)}"` : ''} />` : i.type === 'video' ? `<video src="${esc(i.src)}" muted playsinline preload="metadata"></video>` : `<img src="${esc(i.src)}" alt="" loading="lazy" />`}
        ${KIND[i.type] ? `<span class="gal-kind">${KIND[i.type]}</span>` : ''}
        <span class="gal-cap"><b>${esc(i.title)}</b><span>${esc(i.project || i.group)}</span></span>
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
    const filter = e.target.closest('.gal-filters button')
    if (filter) {
      this.group = filter.dataset.g
      this.querySelectorAll('.gal-filters button').forEach(b => b.setAttribute('aria-pressed', b === filter))
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
    q('.gal-title').innerHTML = `${esc(i.title)}<span>${esc([i.project, i.group].filter(Boolean).join(' · '))}</span>`
    q('.gal-count').textContent = `${this.index + 1} / ${this.list.length}`
    q('[data-act="live"]').hidden = i.type !== 'html'
    q('[data-act="live"]').href = i.src
    q('.gal-stage').innerHTML =
      i.type === 'html' ? `${i.thumb ? `<img class="gal-poster" src="${esc(i.thumb)}" alt="" />` : ''}<iframe src="${esc(i.src)}" title="${esc(i.title)}" allow="fullscreen"></iframe>`
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
