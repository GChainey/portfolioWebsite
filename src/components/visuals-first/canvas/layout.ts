import { SCREENS, type Screen } from '@/content/screens'
import { TESTIMONIALS, type Testimonial } from '@/content/testimonials'
import { colourOf } from '../shared'

// Where everything sits on the canvas, in world units (an 800px screen is 400 wide at 100%).
// Every project is a frame: a labelled section holding its screens in rows, like artboards.
// Frames are stacked into columns, columns into bands, and each band is spread to the same
// width so the whole canvas is one tidy rectangle.

export interface Board { screen: Screen; x: number; y: number; w: number; h: number; frame: number }
export interface Frame { id: string; name: string; colour: string; work?: string; x: number; y: number; w: number; h: number; boards: Board[] }
export interface Pin { t: Testimonial; board: Board; colour: string; x: number; y: number }

const STD = 400 // a landscape screen
const LEAD = 560 // the case studies' screens: bigger than the rest, and one bigger still
const TALL = 360 // portrait screens (phones, long research pages) share a height
const GX = 40 // between screens in a row
const GY = 64 // between rows: room for each screen's name above it
const PAD = 40
const PAD_TOP = 56
export const GAP = 140 // between frames

// `hero`: the case studies open on one big screen, the rest in a grid of `cols` beside it
// at `unit` wide (`bento`: the big one takes a 2×2 corner of a 3×3 grid instead).
// `order` puts their screens in the order that tells it best; ids missing from the catalogue are skipped.
interface Def { id: string; name: string; test: (s: Screen) => boolean; cols: number; work?: string; colour?: string; hero?: string; bento?: boolean; unit?: number; order?: string[] }

const EAI = (s: Screen) => s.project === 'Enterprise AI'
const DEFS: Def[] = [
  {
    id: 'daisy', name: 'Daisy Assess', test: (s) => s.project === 'Daisy Assess', cols: 3, unit: LEAD, work: 'rfp', hero: 'rfp-caseload', bento: true,
    order: ['rfp-letter', 'rfp-notes', 'rfp', 'rfp-answer', 'rfp-sent'],
  },
  {
    id: 'configurator', name: 'Configurator', test: (s) => s.project === 'Configurator', cols: 2, unit: LEAD, work: 'configurator', hero: 'conf-nike',
    order: ['conf-commbank', 'conf-qantas', 'configurator', 'conf-kyc', 'conf-match', 'app-builder'],
  },
  { id: 'site', name: 'Enterprise AI site', test: (s) => EAI(s) && (s.kind === 'marketing' || s.kind === 'mobile'), cols: 7, work: 'html-brand-website' },
  { id: 'brand', name: 'Brand book', test: (s) => EAI(s) && s.kind === 'brand', cols: 4, colour: '#0d9488' },
  { id: 'app', name: 'Enterprise AI app', test: (s) => EAI(s) && !['marketing', 'mobile', 'brand'].includes(s.kind), cols: 4, colour: '#4f46e5' },
  { id: 'shader', name: 'Shader Wall', test: (s) => s.project === 'Shader Wall', cols: 2, work: 'shader-wall' },
  { id: 'dispatch', name: 'Dispatch', test: (s) => s.project === 'Dispatch', cols: 1, work: 'dispatch' },
  { id: 'thesis', name: 'Thesis', test: (s) => s.project === 'Thesis', cols: 2, work: 'thesis' },
  { id: 'wallbounce', name: 'Wallbounce', test: (s) => s.project === 'Wallbounce', cols: 3 },
  { id: 'seek', name: 'SEEK', test: (s) => s.project === 'SEEK', cols: 3 },
  { id: 'bp', name: 'Best Practice', test: (s) => s.project === 'Best Practice', cols: 4 },
]

// Bands of columns of frames, top to bottom, left to right. The three case studies take the
// top band, the products and the earlier work the one under it.
const BANDS: string[][][] = [
  [['daisy'], ['configurator'], ['site']],
  [['brand'], ['app'], ['thesis', 'dispatch'], ['seek', 'wallbounce'], ['bp', 'shader']],
]

// Which screen each colleague's comment is pinned to: their own work, where there is some
const PIN_ON: Record<string, string> = {
  'Richard Simms': 'seek',
  'Winnie Bamra': 'seek-find',
  'Ahmed Hakeem': 'clip-seek',
  'David Deville': 'clip-seek-mvp',
  'Henry Vesander': 'bp',
}

function size(s: Screen, unit = STD) {
  const r = s.h / s.w
  if (r > 1.15) return { w: Math.round(TALL / r), h: TALL }
  return { w: unit, h: Math.round(unit * r) }
}

type Placed = { s: Screen; x: number; y: number; w: number; h: number }

// Rows of screens, top aligned, as many as fit in `cols` widths of `unit`, from (x0, y0)
function rows(screens: Screen[], cols: number, unit: number, x0: number, y0: number) {
  const max = cols * unit + (cols - 1) * GX
  const out: { s: Screen; w: number; h: number }[][] = [[]]
  let used = 0
  for (const s of screens) {
    const sz = size(s, unit)
    if (out[out.length - 1].length && used + GX + sz.w > max + 1) { out.push([]); used = 0 }
    const r = out[out.length - 1]
    used += (r.length ? GX : 0) + sz.w
    r.push({ s, ...sz })
  }
  const placed: Placed[] = []
  let y = y0
  let right = x0
  for (const row of out) {
    let x = x0
    const h = Math.max(...row.map((b) => b.h))
    for (const b of row) { placed.push({ s: b.s, x, y, w: b.w, h: b.h }); x += b.w + GX }
    right = Math.max(right, x - GX)
    y += h + GY
  }
  return { placed, right, bottom: y - GY }
}

function pack(d: Def, screens: Screen[]) {
  const ordered = d.order ? [...screens].sort((a, b) => rank(d, a) - rank(d, b)) : screens
  if (!d.hero) {
    const g = rows(ordered, d.cols, d.unit ?? STD, PAD, PAD_TOP)
    return { boards: g.placed, w: g.right + PAD, h: g.bottom + PAD }
  }
  const hero = ordered.find((s) => s.id === d.hero) ?? ordered[0]
  const rest = ordered.filter((s) => s !== hero)
  if (d.bento) {
    // The big screen in the top-left 2×2, the rest round it: down the right, then along the bottom
    const u = d.unit ?? STD
    const ch = Math.round(u * 0.625)
    const cells = [[2, 0], [2, 1], [0, 2], [1, 2], [2, 2], [3, 0], [3, 1], [3, 2]]
    const cell = (c: number, r: number) => ({ x: PAD + c * (u + GX), y: PAD_TOP + r * (ch + GY) })
    const boards: Placed[] = [{ s: hero, ...cell(0, 0), w: 2 * u + GX, h: 2 * ch + GY }]
    rest.forEach((s, k) => { const [c, r] = cells[k] ?? [3, 2]; boards.push({ s, ...cell(c, r), w: u, h: ch }) })
    const cols = Math.max(...boards.map((b) => Math.round((b.x - PAD + b.w + GX) / (u + GX))))
    return { boards, w: PAD + cols * (u + GX) - GX + PAD, h: PAD_TOP + 3 * (ch + GY) - GY + PAD }
  }
  // The big screen as tall as the grid beside it
  const probe = rows(rest, d.cols, d.unit ?? STD, 0, 0)
  const hh = probe.bottom
  const hw = Math.round((hh * hero.w) / hero.h)
  const g = rows(rest, d.cols, d.unit ?? STD, PAD + hw + GX, PAD_TOP)
  return { boards: [{ s: hero, x: PAD, y: PAD_TOP, w: hw, h: hh }, ...g.placed], w: g.right + PAD, h: g.bottom + PAD }
}
const rank = (d: Def, s: Screen) => { const i = d.order!.indexOf(s.id); return i < 0 ? 99 : i }

function build() {
  const sized = DEFS.map((d) => {
    const screens = SCREENS.filter(d.test)
    return { d, ...pack(d, screens) }
  })
  const byId = new Map(sized.map((s) => [s.d.id, s]))
  const placed = new Map<string, { x: number; y: number }>()

  // Each band's natural width, then spread its columns to the widest band
  const bands = BANDS.map((cols) => {
    const widths = cols.map((c) => Math.max(...c.map((id) => byId.get(id)!.w)))
    const heights = cols.map((c) => c.reduce((h, id) => h + byId.get(id)!.h, 0) + (c.length - 1) * GAP)
    return { cols, widths, heights, natural: widths.reduce((a, b) => a + b, 0) + (cols.length - 1) * GAP }
  })
  const W = Math.max(...bands.map((b) => b.natural))
  let y = 0
  for (const b of bands) {
    const gap = b.cols.length > 1 ? (W - b.widths.reduce((a, c) => a + c, 0)) / (b.cols.length - 1) : 0
    let x = 0
    b.cols.forEach((col, i) => {
      let cy = y
      for (const id of col) {
        placed.set(id, { x: Math.round(x), y: Math.round(cy) })
        cy += byId.get(id)!.h + GAP
      }
      x += b.widths[i] + gap
    })
    y += Math.max(...b.heights) + GAP
  }
  const H = y - GAP

  const frames: Frame[] = DEFS.map((d, fi) => {
    const s = byId.get(d.id)!
    const at = placed.get(d.id)!
    const colour = d.colour ?? colourOf(SCREENS.find(d.test)?.project ?? '')
    return {
      id: d.id, name: d.name, colour, work: d.work, x: at.x, y: at.y, w: s.w, h: s.h,
      boards: s.boards.map((b) => ({ screen: b.s, x: at.x + b.x, y: at.y + b.y, w: b.w, h: b.h, frame: fi })),
    }
  })
  const boards = frames.flatMap((f) => f.boards)

  const pins: Pin[] = TESTIMONIALS.map((t) => {
    const board = boards.find((b) => b.screen.id === PIN_ON[t.name]) ?? boards[0]
    return { t, board, colour: frames[board.frame].colour, x: board.x + board.w, y: board.y }
  })

  return { frames, boards, pins, W, H }
}

export const WORLD = build()
