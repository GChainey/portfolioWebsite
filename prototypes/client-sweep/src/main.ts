import { Replayer } from '@rrweb/replay'
import { createShader, playSweep, type ShaderController } from 'glimm'

// DAISY changing scenario: Cumberland Council → NSW Planning → Polska, on a loop. Every change runs
// the same beats over real recordings of the app (public/replays, made by scripts/clips.mjs):
//   one scenario's Caseload → a popup naming the change → the placeholders (skeleton) → a glimm
//   band from the bottom reveals the next scenario's data.
// The skeleton and the band stay inside the cards whose content changes (the summary cards and the
// table), each band clipped to its own card's rounded rect. The page, top bar, nav and title stay as
// they are and switch at the band's midpoint. The variants (picker, PICKER.md) differ only in the
// popup: Centre card, Toast, Command.

const SCALE = 880 / 1440 // the recordings are 1440 × 900; the frame is 880 × 550

type Rec = { events: unknown[] }
type Clip = { player: Replayer; el: HTMLDivElement }

const cache = new Map<string, Promise<unknown>>()
const load = <T>(src: string) => {
  if (!cache.has(src)) cache.set(src, fetch(src).then((r) => r.json()))
  return cache.get(src) as Promise<T>
}

const stage = document.getElementById('stage') as HTMLDivElement
const frame = document.getElementById('frame') as HTMLDivElement
const client = document.getElementById('client') as HTMLSpanElement

// Each mount gets a generation; anything from an older one stops at its next wait
let gen = 0
class Stopped extends Error {}
let clips: Clip[] = []
let bands: Array<{ ctrl: ShaderController | null; box: HTMLDivElement; cv: HTMLCanvasElement }> = []

// Free a band's WebGL context now, not at garbage collection (Chrome keeps only 16)
function drop(b: { ctrl: ShaderController | null; box: HTMLDivElement; cv: HTMLCanvasElement }) {
  b.ctrl?.destroy()
  ;(b.cv.getContext('webgl') as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext()
  b.box.remove()
}

function teardown() {
  clips.forEach((c) => { try { (c.player as unknown as { destroy: () => void }).destroy() } catch { /* already gone */ } })
  clips = []
  bands.forEach(drop)
  bands = []
  stage.innerHTML = ''
  frame.querySelectorAll('.pop-layer').forEach((n) => n.remove())
  client.textContent = ''
}

async function clip(name: string): Promise<Clip> {
  const rec = await load<Rec>(`/replays/${name}.json`)
  const el = document.createElement('div')
  el.className = 'rec'
  el.style.transform = `scale(${SCALE})`
  el.style.visibility = 'hidden'
  stage.appendChild(el)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const player = new Replayer(rec.events as any, {
    root: el,
    mouseTail: false,
    showWarning: false,
    triggerFocus: false,
    // No scrollbar inside the frame
    insertStyleRules: ['html, body { scrollbar-width: none !important; }', '::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }'],
  })
  player.pause(0)
  const c = { player, el }
  clips.push(c)
  return c
}


// ---------- The cards that change ----------

// The summary cards and the table: bordered, rounded boxes in the content area, outermost only.
// rect is the card's visible part, in the recording's pixels (1440 × 900); a card running off the
// bottom of the view keeps its rounded corners only at the top
type Card = { el: HTMLElement; rect: DOMRect; radius: number; clipped: boolean }

function changingCards(player: Replayer): Card[] {
  const doc = player.iframe.contentDocument
  if (!doc) return []
  const view = doc.defaultView!
  const side = doc.querySelector('[data-sidebar="sidebar"]')?.getBoundingClientRect().right ?? 0
  const found: Card[] = []
  for (const el of Array.from(doc.querySelectorAll<HTMLElement>('body *'))) {
    const r = el.getBoundingClientRect()
    if (r.left < side - 1 || r.right > view.innerWidth + 1 || r.width < 200 || r.height < 80 || r.top < 0 || r.top > view.innerHeight - 80) continue
    const cs = view.getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0) continue
    const radius = parseFloat(cs.borderTopLeftRadius) || 0
    const edged = parseFloat(cs.borderTopWidth) > 0 || (cs.boxShadow && cs.boxShadow !== 'none')
    if (radius < 4 || !edged) continue
    const bottom = Math.min(r.bottom, view.innerHeight)
    found.push({ el, rect: new DOMRect(r.left, r.top, r.width, bottom - r.top), radius, clipped: bottom < r.bottom })
  }
  return found.filter((c) => !found.some((o) => o !== c && o.el.contains(c.el)))
}

// ---------- Placeholders, drawn from the recording's own DOM ----------

type Item = { mid: number; card: Card; done: boolean; restore: () => void; bars: HTMLElement[] }

function skeleton(player: Replayer, cards: Card[]) {
  const doc = player.iframe.contentDocument
  const items: Item[] = []
  if (!doc) return { revealBelow: (_p: number) => {}, revealAll: () => {} }
  const view = doc.defaultView!
  const layer = doc.createElement('div')
  layer.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;z-index:2147483647'
  doc.body.appendChild(layer)
  // Hidden at once; the fade is only for the reveal, set once the hidden state has painted
  const later: Array<() => void> = []
  for (const el of Array.from(doc.querySelectorAll<HTMLElement>('body *'))) {
    if (el === layer || layer.contains(el)) continue
    // Only what sits inside a card that changes
    const card = cards.find((c) => c.el.contains(el))
    if (!card) continue
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0 || r.top > view.innerHeight) continue
    const tag = el.tagName.toLowerCase()
    // Icons, avatars and status dots hide too
    if (tag === 'svg' || tag === 'img' || (r.width <= 10 && r.height <= 10 && view.getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)')) {
      el.style.setProperty('opacity', '0', 'important')
      later.push(() => { el.style.transition = 'opacity 200ms ease-out' })
      items.push({ mid: r.top + r.height / 2, card, done: false, bars: [], restore: () => el.style.removeProperty('opacity') })
      continue
    }
    const texts = Array.from(el.childNodes).filter((n) => n.nodeType === 3 && n.textContent!.trim())
    if (!texts.length) continue
    const bars: HTMLElement[] = []
    for (const t of texts) {
      const range = doc.createRange()
      range.selectNodeContents(t)
      for (const rect of Array.from(range.getClientRects())) {
        if (rect.width < 2) continue
        const h = Math.max(6, Math.min(12, Math.round(rect.height * 0.55)))
        const bar = doc.createElement('div')
        bar.style.cssText = `position:absolute;left:${rect.left + view.scrollX}px;top:${rect.top + view.scrollY + (rect.height - h) / 2}px;width:${rect.width}px;height:${h}px;border-radius:4px;background:#ECECEE;transition:opacity 200ms ease-out`
        layer.appendChild(bar)
        bars.push(bar)
      }
    }
    el.style.setProperty('color', 'transparent', 'important')
    el.style.setProperty('-webkit-text-fill-color', 'transparent', 'important')
    later.push(() => { el.style.transition = 'color 200ms ease-out, -webkit-text-fill-color 200ms ease-out' })
    items.push({
      mid: r.top + r.height / 2, card, done: false, bars,
      restore: () => { el.style.removeProperty('color'); el.style.removeProperty('-webkit-text-fill-color') },
    })
  }
  requestAnimationFrame(() => requestAnimationFrame(() => later.forEach((f) => f())))
  const fill = (it: Item) => { if (it.done) return; it.done = true; it.restore(); it.bars.forEach((b) => { b.style.opacity = '0' }) }
  return {
    // Each card's band edge at progress p (0 at the card's bottom, 1 at its top): fill what's below it
    revealBelow: (p: number) => { for (const it of items) if (it.mid >= it.card.rect.top + it.card.rect.height * (1 - p)) fill(it) },
    revealAll: () => items.forEach(fill),
  }
}

// The cards as one clip-path (recording pixels; the .rec element is scaled after clipping).
// Every rounded rect is drawn clockwise, so overlapping ones union under the nonzero rule.
function cardsPath(cards: Card[]) {
  return `path('${cards.map(({ rect: { x, y, width: w, height: h }, radius: r, clipped }) => {
    const b = clipped ? 0 : r
    return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - b}A${b} ${b} 0 0 1 ${x + w - b} ${y + h}H${x + b}A${b} ${b} 0 0 1 ${x} ${y + h - b}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`
  }).join('')}')`
}

// ---------- The scenarios and the shared sequence ----------

type Scene = { clip: string; name: string; level: string; logo: string }
const SCENES: Scene[] = [
  { clip: 'caseload-council', name: 'Cumberland Council', level: 'Council', logo: '/logos/Cumberland_City_Council_mark.svg' },
  { clip: 'caseload-state', name: 'NSW Planning', level: 'State', logo: '/logos/NSW-ONLY-nsw-government-logo.svg' },
  { clip: 'caseload-polska', name: 'Polska', level: 'Country', logo: '/logos/poland-flag.svg' },
]
// Each clip plays from FROM until TAIL before its end: the cursor drifts and returns to where it
// started, so the cut to the next clip doesn't move it
const FROM = 1000
const TAIL = 250
const SKELETON_HOLD = 400

type Kit = {
  wait: (ms: number) => Promise<void>
  // The bands for these cards, set up (WebGL contexts made, shaders compiled) but not yet drawn;
  // sweep() runs them: from the bottom inside each card, glimm's defaults otherwise, the change at
  // the midpoint
  bands: (cards: Card[]) => { sweep: (change?: () => void, onProgress?: (p: number) => void) => Promise<void> }
}
// A popup: shows the change from one scenario to the next over the page, and resolves as it starts
// to close (it finishes closing on its own, in 150 ms)
type Popup = (layer: HTMLElement, from: Scene, to: Scene, k: Kit) => Promise<void>

const duration = (c: Clip) => (c.player as unknown as { getMetaData: () => { totalTime: number } }).getMetaData().totalTime

async function sequence(popup: Popup, k: Kit) {
  const cs = await Promise.all(SCENES.map((s) => clip(s.clip)))
  const layer = document.createElement('div')
  layer.className = 'pop-layer'
  layer.style.transform = `scale(${SCALE})`
  frame.appendChild(layer)
  let i = 0
  const marks = ((window as unknown as { __marks?: number[] }).__marks = [performance.now()])
  cs[0].el.style.visibility = 'visible'
  client.textContent = SCENES[0].name
  for (;;) {
    const a = cs[i]
    const j = (i + 1) % cs.length
    const b = cs[j]
    // 1. This scenario's Caseload
    a.player.play(FROM)
    await k.wait(duration(a) - TAIL - FROM)
    a.player.pause(duration(a) - TAIL)
    // 2. The popup names the change
    b.player.pause(FROM)
    await popup(layer, SCENES[i], SCENES[j], k)
    // 3. The skeleton, as the popup goes: the next scenario shows inside the cards only, as
    //    placeholders; everything outside the cards is still this one
    const cards = changingCards(b.player)
    b.el.style.clipPath = cardsPath([...cards, ...changingCards(a.player)])
    b.el.style.zIndex = '2'
    a.el.style.zIndex = '1'
    const sk = skeleton(b.player, cards)
    const band = k.bands(cards)
    b.el.style.opacity = '0'
    b.el.style.visibility = 'visible'
    await nextFrame()
    b.el.style.transition = 'opacity 150ms ease-out'
    b.el.style.opacity = '1'
    await k.wait(SKELETON_HOLD)
    b.el.style.transition = ''
    // 4. The band, bottom up in each card, shows the data as it passes; the rest of the page
    //    switches at its midpoint
    await band.sweep(() => {
      b.el.style.clipPath = ''
      a.el.style.visibility = 'hidden'
      client.textContent = SCENES[j].name
    }, (p) => sk.revealBelow(p))
    sk.revealAll()
    i = j
    // Capture (?capture=1) reads these: one entry per change, a loop is 3 changes
    marks.push(performance.now())
  }
}

// ---------- The popups ----------

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))
const make = (html: string) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild as HTMLElement }
const scn = (s: Scene, cls = '') => `<span class="pop-scn ${cls}"><img src="${s.logo}" alt="" /><span class="pop-scn-text"><span class="pop-name">${s.name}</span><span class="pop-level">${s.level}</span></span></span>`
const ARROW = '<svg class="pop-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'

async function open(el: HTMLElement, layer: HTMLElement) {
  layer.appendChild(el)
  await nextFrame()
  el.setAttribute('data-open', '')
}
function close(el: HTMLElement) {
  el.removeAttribute('data-open')
  el.setAttribute('data-closing', '')
  setTimeout(() => el.remove(), 160)
}

// 1. Centre card: a modal-like card over a slightly dimmed page, from → to, a thin progress line
const centreCard: Popup = async (layer, from, to, k) => {
  const dim = make('<div class="pop-dim"></div>')
  const card = make(`<div class="pop pop-centre" role="status">
    <span class="pop-eyebrow">Switching scenario</span>
    <span class="pop-change">${scn(from, 'is-from')}${ARROW}${scn(to)}</span>
    <span class="pop-progress"><span></span></span>
  </div>`)
  layer.appendChild(dim)
  await open(card, layer)
  dim.setAttribute('data-open', '')
  await k.wait(200)
  card.querySelector<HTMLElement>('.pop-progress > span')!.style.transform = 'scaleX(1)'
  await k.wait(900)
  close(card)
  close(dim)
}

// 2. Toast: compact, top centre over the top bar, no dim
const toast: Popup = async (layer, from, to, k) => {
  const t = make(`<div class="pop pop-toast" role="status">
    <img src="${from.logo}" alt="" /><span class="pop-toast-from">${from.name}</span>${ARROW}<img src="${to.logo}" alt="" /><span>${to.name}</span>
  </div>`)
  await open(t, layer)
  await k.wait(1200)
  close(t)
}

// 3. Command: a palette; the next scenario typed, its row highlighted, Enter, closed
const command: Popup = async (layer, from, to, k) => {
  const rows = SCENES.map((s) => `<span class="pop-row" data-name="${s.name}"><img src="${s.logo}" alt="" /><span class="pop-row-name">${s.name}</span><span class="pop-row-meta">${s === from ? 'Current' : s.level}</span></span>`).join('')
  const p = make(`<div class="pop pop-command" role="dialog" aria-label="Switch scenario">
    <span class="pop-input"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span class="pop-query"></span><span class="pop-caret"></span><span class="pop-placeholder">Switch scenario…</span></span>
    <span class="pop-group">Scenarios</span>
    <span class="pop-rows">${rows}</span>
    <span class="pop-foot"><span class="pop-kbd">↵</span> Switch</span>
  </div>`)
  const query = p.querySelector<HTMLElement>('.pop-query')!
  const rowEls = [...p.querySelectorAll<HTMLElement>('.pop-row')]
  const highlight = (name: string) => rowEls.forEach((r) => r.toggleAttribute('data-active', r.dataset.name === name))
  highlight(from.name)
  await open(p, layer)
  await k.wait(260)
  for (let n = 1; n <= to.name.length; n++) {
    query.textContent = to.name.slice(0, n)
    const q = query.textContent.toLowerCase()
    const hit = SCENES.find((s) => s.name.toLowerCase().startsWith(q))
    if (hit) highlight(hit.name)
    await k.wait(45)
  }
  await k.wait(380)
  const row = rowEls.find((r) => r.dataset.name === to.name)!
  row.setAttribute('data-pressed', '')
  p.querySelector('.pop-kbd')!.setAttribute('data-pressed', '')
  await k.wait(140)
  close(p)
}

const variants: Popup[] = [centreCard, toast, command]

// ---------- Mounting: each run loops until switched or replayed ----------

function mount(i: number) {
  const my = ++gen
  teardown()
  const wait = (ms: number) => new Promise<void>((resolve, reject) => setTimeout(() => (my === gen ? resolve() : reject(new Stopped())), ms))
  // One band per card, each on its own canvas clipped to the card's rounded rect, all together
  const makeBands = (cards: Card[]) => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const mine = reduced ? [] : cards.map((c) => {
      const box = document.createElement('div')
      box.className = 'band-box'
      box.style.cssText = `left:${c.rect.left * SCALE}px;top:${c.rect.top * SCALE}px;width:${c.rect.width * SCALE}px;height:${c.rect.height * SCALE}px;border-radius:${c.clipped ? `${c.radius * SCALE}px ${c.radius * SCALE}px 0 0` : `${c.radius * SCALE}px`}`
      const cv = document.createElement('canvas')
      cv.className = 'band'
      box.appendChild(cv)
      frame.appendChild(box)
      const ctrl = createShader({ canvas: cv, direction: 'btt' })
      const band = { ctrl, box, cv }
      bands.push(band)
      return band
    })
    const sweep = (change?: () => void, onProgress?: (p: number) => void) => new Promise<void>((resolve, reject) => {
      if (my !== gen) { reject(new Stopped()); return }
      const live = mine.filter((b) => b.ctrl) as Array<{ ctrl: ShaderController; box: HTMLDivElement; cv: HTMLCanvasElement }>
      const finish = () => { mine.forEach(drop); bands = bands.filter((b) => !mine.includes(b)) }
      if (!live.length) { change?.(); finish(); resolve(); return }
      let running = true
      let changed = false
      const tick = () => { if (!running || my !== gen) return; onProgress?.(live[0].ctrl.getProgress()); requestAnimationFrame(tick) }
      if (onProgress) requestAnimationFrame(tick)
      let left = live.length
      for (const b of live) {
        playSweep(b.ctrl, {
          direction: 'btt',
          onMidpoint: () => { if (my === gen && !changed) { changed = true; change?.() } },
          onComplete: () => {
            if (--left > 0) return
            running = false
            finish()
            my === gen ? resolve() : reject(new Stopped())
          },
        })
      }
    })
    return { sweep }
  }
  ;(async () => {
    try {
      await sequence(variants[i], { wait, bands: makeBands })
    } catch (e) {
      if (!(e instanceof Stopped)) console.error(e)
    }
  })()
}

// ---------- The picker (PICKER.md reference wiring) ----------

const picker = document.querySelector('.proto-picker') as HTMLElement
const highlight = picker.querySelector('.proto-picker-highlight') as HTMLElement
const items = [...picker.querySelectorAll<HTMLButtonElement>('.proto-picker-item:not(.proto-picker-replay)')]
const replay = picker.querySelector('.proto-picker-replay')
let current = 0

function moveHighlight() {
  const el = items[current]
  highlight.style.width = el.offsetWidth + 'px'
  highlight.style.transform = `translateX(${el.offsetLeft}px)`
}

function setActive(i: number) {
  if (i < 0 || i >= variants.length) return
  current = i
  items.forEach((el, j) => {
    el.toggleAttribute('data-active', j === i)
    if (j === i) el.setAttribute('aria-current', 'true')
    else el.removeAttribute('aria-current')
  })
  moveHighlight()
  const url = new URL(location.href)
  url.searchParams.set('v', String(i + 1))
  history.replaceState(null, '', url)
  mount(i)
}

items.forEach((el, i) => el.addEventListener('click', () => setActive(i)))
replay?.addEventListener('click', () => mount(current))
window.addEventListener('resize', moveHighlight)

document.addEventListener('keydown', (e) => {
  const t = e.target as HTMLElement
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return
  if (e.metaKey || e.ctrlKey || e.altKey) return
  const num = parseInt(e.key, 10)
  if (num >= 1 && num <= variants.length) setActive(num - 1)
  else if (e.key === 'ArrowRight') setActive((current + 1) % variants.length)
  else if (e.key === 'ArrowLeft') setActive((current - 1 + variants.length) % variants.length)
  else if (e.key === 'r' || e.key === 'R') mount(current)
})

// ?capture=1: just the frame, for recording the video (no picker, no surround)
if (new URLSearchParams(location.search).has('capture')) document.documentElement.classList.add('capture')
setActive((parseInt(new URLSearchParams(location.search).get('v') ?? '', 10) || 1) - 1)
// Enable the slide only after first paint, so load doesn't animate.
requestAnimationFrame(() => requestAnimationFrame(() => picker.setAttribute('data-ready', '')))
