import { SCREENS, type Screen } from '@/content/screens'
import { TESTIMONIALS, type Testimonial } from '@/content/testimonials'
import { WORK, type WorkItem } from '@/content/work'
import { colourOf } from '../shared'

// The mosaic, drawn as a map: every character is one cell of an 18 x 9 grid, and a letter that
// repeats makes a bigger tile. Written out like this so the wall can't have a hole in it, and so
// it reads the way it looks. The legend says what goes in each tile.

export const COLS = 18
export const ROWS = 9

// The three AI case studies take the most room, so they are where the eye lands: Daisy Assess
// top left with its letters and notes beside it, the Enterprise AI site top right, and
// Configurator across the middle as the same app in three clients' brands.
const MAP = [
  'AAAAAARRRRbbBBBBBB',
  'AAAAAARRRRccBBBBBB',
  'AAAAAAddeeffBBBBBB',
  'WWWWggiijjkkDDDDoo',
  'WWWWhhllmmnnDDDDpp',
  'NNNNCCCCQQQQEE11XX',
  'NNNNCCCCQQQQEE22XX',
  'HHKKKKqqssttTTTTXX',
  'HHKKKKrruuvvTTTTww',
]

// Screen ids, or q: and a colleague's name
const LEGEND: Record<string, string> = {
  // Daisy Assess: the caseload, then the notes, the answers, the letter and the letter sent
  A: 'rfp-caseload', g: 'rfp-notes', h: 'rfp-answer', d: 'rfp-letter', e: 'rfp-sent',
  // The Enterprise AI site, with its phone view, a remix and the brand book beside it
  B: 'site', b: 'site-phone', c: 'shapeshifter', f: 'remix-07', o: 'book-cover', p: 'book-tiles',
  // Configurator: one app in three brands, then onboarding and the template match
  N: 'conf-nike', C: 'conf-commbank', Q: 'conf-qantas', '1': 'conf-kyc', '2': 'conf-match',
  // Other strong pieces
  K: 'shader-wall', T: 'clip-balatro', X: 'clip-seek-mobile',
  // Kind words
  W: 'q:Winnie Bamra', R: 'q:Richard Simms', D: 'q:David Deville', H: 'q:Henry Vesander', E: 'q:Ahmed Hakeem',
  // The rest
  i: 'thesis', j: 'wallbounce', k: 'cli', l: 'bp', m: 'seek', n: 'clip-wallbounce',
  q: 'dispatch', s: 'remix-13', t: 'clip-site-build', r: 'book-logo', u: 'clip-bp', v: 'build', w: 'seek-find',
}

// The work each quote sits against, for its tint
const QUOTE_BESIDE: Record<string, string> = { W: 'Daisy Assess', R: 'Enterprise AI', D: 'Configurator', H: 'Shader Wall', E: 'Thesis' }

// The tiles that open a case study. A lead tile carries the label and steps forward when the
// three are singled out; the rest of a case study's tiles just stay lit.
const FEATURED: Record<string, { work: string; lead: boolean }> = {
  'rfp-caseload': { work: 'rfp', lead: true },
  site: { work: 'html-brand-website', lead: true },
  'conf-nike': { work: 'configurator', lead: true },
  'conf-commbank': { work: 'configurator', lead: false },
  'conf-qantas': { work: 'configurator', lead: false },
}
const CASE_PROJECTS = ['Daisy Assess', 'Configurator']
const ORDER = ['rfp', 'html-brand-website', 'configurator']

export interface Cell {
  key: string
  c: number
  r: number
  w: number
  h: number
  screen?: Screen
  quote?: Testimonial
  featured?: { item: WorkItem; index: number; lead: boolean }
  lit?: boolean // part of a case study: stays lit when the rest steps back
  colour: string // the project's colour, or for a quote the colour of the work beside it
}

const byId = new Map(SCREENS.map((s) => [s.id, s]))

function parse(): Cell[] {
  const seen = new Map<string, { c0: number; r0: number; c1: number; r1: number }>()
  MAP.forEach((row, r) => {
    row.split('').forEach((ch, c) => {
      const b = seen.get(ch)
      if (!b) seen.set(ch, { c0: c, r0: r, c1: c, r1: r })
      else seen.set(ch, { c0: Math.min(b.c0, c), r0: Math.min(b.r0, r), c1: Math.max(b.c1, c), r1: Math.max(b.r1, r) })
    })
  })
  const cells: Cell[] = []
  seen.forEach((b, ch) => {
    const id = LEGEND[ch]
    if (!id) return
    const cell: Cell = { key: ch, c: b.c0, r: b.r0, w: b.c1 - b.c0 + 1, h: b.r1 - b.r0 + 1, colour: 'var(--accent)' }
    if (id.startsWith('q:')) {
      cell.quote = TESTIMONIALS.find((t) => t.name === id.slice(2))
      if (!cell.quote) return
    } else {
      cell.screen = byId.get(id)
      if (!cell.screen) return
      cell.colour = colourOf(cell.screen.project)
      const f = FEATURED[id]
      const work = f && WORK.find((x) => x.id === f.work)
      if (f && work) cell.featured = { item: work, index: ORDER.indexOf(f.work), lead: f.lead }
      cell.lit = !!cell.featured || CASE_PROJECTS.includes(cell.screen.project)
    }
    cells.push(cell)
  })
  // A quote takes a tint of the big piece of work it sits against, so each one is its own colour
  cells.forEach((q) => {
    if (q.quote && QUOTE_BESIDE[q.key]) q.colour = colourOf(QUOTE_BESIDE[q.key])
  })
  return cells.sort((a, b) => a.r - b.r || a.c - b.c)
}

export const CELLS = parse()

// For a phone and a small tablet: the same pieces, a simple dense grid
export const SMALL_ORDER: string[] = [
  'rfp-caseload', 'q:Richard Simms', 'clip-seek-mobile', 'rfp-letter', 'rfp-notes', 'thesis', 'site',
  'q:Ahmed Hakeem', 'book-cover', 'remix-13', 'conf-nike', 'conf-commbank', 'conf-qantas', 'q:Winnie Bamra',
  'shader-wall', 'seek', 'clip-wallbounce', 'book-tiles', 'cli', 'q:David Deville', 'dispatch', 'balatro',
  'shapeshifter-phone', 'bp', 'remix-07', 'build', 'q:Henry Vesander', 'wallbounce', 'clip-site-build',
]

export const SMALL_CELLS: Cell[] = SMALL_ORDER.map((id) => {
  if (id.startsWith('q:')) {
    const t = TESTIMONIALS.find((x) => x.name === id.slice(2))!
    const desk = CELLS.find((c) => c.quote === t)
    return { key: id, c: 0, r: 0, w: 2, h: t.pull.length < 40 ? 1 : 2, quote: t, colour: desk?.colour ?? 'var(--accent)' }
  }
  const s = byId.get(id)!
  const desk = CELLS.find((c) => c.screen === s)
  const tall = s.h > s.w
  const big = !!(desk?.featured?.lead || s.id === 'shader-wall')
  return { key: id, c: 0, r: 0, w: big ? 2 : 1, h: big ? 2 : tall ? 3 : 1, screen: s, featured: desk?.featured, colour: colourOf(s.project) }
}).filter((c) => c.screen || c.quote)

// Small, repeatable randomness, so the pile lands the same way every time
export function seeded(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const COUNTS = {
  screens: SCREENS.length,
  projects: new Set(SCREENS.map((s) => s.project)).size,
  colleagues: TESTIMONIALS.length,
}
