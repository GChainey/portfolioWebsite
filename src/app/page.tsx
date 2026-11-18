'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { GitHubContributions } from '@/components/GitHubContributions'
import { Media, heroItem } from '@/components/HomeShowcase'
import { ALL_PIECES } from '@/content/home-showcase'
import { RfpLetter } from '@/components/stageshow/RfpLetter'
import { TESTIMONIALS } from '@/content/testimonials'
import { CompanyPeek } from '@/components/site/companies'
import { PARKED_LIVE } from '@/content/parked'
import { EMAIL, EssayCard, ESSAYS, SKILLS, GREY, Headline, INK, LINE, SHADOW, SHELL } from '@/components/site/style'

// The homepage: justinschueler.com's narrow design with my content. One 540px column; styles from
// components/site/style (after the Polar audit: one weight, four sizes,
// ink and one grey, shells holding panels).
// The statement lights up word by word while the rest waits in a fog; sections rise in after.
// The work leads with Stageshow scenes where there is one (Shader Wall, the RFP letter) and clean
// stills elsewhere: no coloured mats. Case studies are short, enough to start a conversation
// (/work/rfp is the first).

type Run = { text: string; href?: string }
const STATEMENT: Run[] = [
  { text: 'I’m Gareth, an Aussie product designer in New York. I design by building: ' },
  { text: 'working prototypes', href: '#projects' },
  { text: ', made with AI, that help small teams win big deals.' },
]

// What I do at Enterprise AI, under the contributions: one two-tone line, the job in ink and what it
// covers in grey (design, sales, marketing, engineering, product, shipping). Variations to choose
// from with ?about=1 to 5 or the review panel; the second is the default
const ABOUT: { lead: string; rest: string }[] = [
  { lead: 'Currently I lead design at Enterprise AI.', rest: 'Delight for our users, prototypes that win deals for sales, the brand and website for marketing, building with engineering, a hand on where the product goes. And I ship to prod.' },
  { lead: 'Currently I lead design at Enterprise AI.', rest: 'Some days that’s a prototype that wins a deal. Others it’s the website, a pull request to prod, or where the product goes next.' },
  { lead: 'At Enterprise AI I lead design, and wear a few hats.', rest: 'Designer, sales sidekick, brand keeper, engineering pair, product compass, and the one who ships to prod.' },
  { lead: 'Currently I lead design at Enterprise AI.', rest: 'Design, sales, marketing, engineering and product, often in the same week. Most of it ships.' },
  { lead: 'Currently I lead design at Enterprise AI,', rest: 'where a good prototype wins the deal, the website is mine too, and design doesn’t stop at the handoff: I build with engineering and ship to prod.' },
]

// landing: a still of the product's landing page, for the hover card on its name in the sentence
// piece: the homepage showcase's piece (content/home-showcase), whose hero clip plays here: the
// real page as an HTML replay (or the real video), so it's sharp at any size. On the card it sits
// inset on the grey, by the padding the controls set
// desc: what the thing is, one line under its card, so the card says it without a hover or a click
const PRODUCTS: { name: string; desc: string; href: string; landing: string; piece: string }[] = [
  { name: 'Shader Wall', desc: 'A Mac app for shader wallpapers. Tune one with sliders, or ask your agent.', href: 'https://www.shaderwall.com', landing: '/draft/landing-shaderwall.jpg', piece: 'shader-wall' },
  { name: 'Dispatch', desc: 'Send articles to your Kindle in one click, from the browser, the Mac or a bot.', href: 'https://www.dispatchmac.com', landing: '/draft/landing-dispatch.jpg', piece: 'dispatch' },
  { name: 'Thesis', desc: 'Every claim in a plan is a bet. AI drafts the tests and gathers the evidence.', href: 'https://thesis-phi-self.vercel.app', landing: '/draft/landing-thesis.jpg', piece: 'thesis' },
]

// piece as the products; the RFP's is its Stageshow scene, which fills its card instead. A /draft/
// href is a short case study still on the dev server only: off it, the name is plain text
const PROJECTS: { name: string; desc: string; year: string; href?: string; piece: string; scene?: ReactNode }[] = [
  { name: 'Winning a tender', desc: 'A working product, not mock-ups, that answered a state government tender.', year: '2025', href: '/work/rfp', piece: 'rfp', scene: <RfpLetter filled /> },
  { name: 'Testing on live models', desc: 'Built in code on real models, where a Figma prototype couldn’t answer the question.', year: '2025–26', href: '/draft/configurator', piece: 'configurator' },
  { name: 'An agent-built website', desc: 'Our brand written as files agents build from, then the website built from them.', year: '2026', href: '/draft/website', piece: 'html-brand-website' },
]

// Before AI: the earlier work, on its own rail
const BEFORE_AI: typeof PROJECTS = [
  { name: 'SEEK, fixing the funnel', desc: 'A launch that missed its goal, then sign-ups from 9% to 20%, one step at a time.', year: '2024', href: '/draft/seek', piece: 'seek' },
  { name: 'Booking in two panels', desc: 'A booking dialog that had grown unwieldy, rebuilt from a few reusable patterns.', year: '2021', href: '/draft/bestpractice', piece: 'bestpractice' },
]

// Creative: the games, on their own rail
const CREATIVE: typeof PROJECTS = [
  { name: 'Opportunity sizing x Balatro', desc: 'Sizing a product bet, played like the card game: each number deals its card.', year: '2026', href: '/projects/balatro-opportunity-sizing', piece: 'balatro' },
  { name: 'Wallbounce', desc: 'A small top-down game, made with the dev tools an agent built for it.', year: '2026', href: '/projects/wallbounce-dev-tools', piece: 'wallbounce' },
]


// The header, the statement and the graph sit 72px apart, whatever the gap between sections
const INTRO_PULL = 'calc(72px - var(--sec))'

const WORD_START = 0.3
const WORD_STEP = 0.04
const WORD_TIME = 0.9

const CSS = `
.dr-word { display: inline-block; opacity: .15; animation: dr-word ${WORD_TIME}s cubic-bezier(.23,1,.32,1) forwards; }
@keyframes dr-word { to { opacity: 1 } }
.dr-fog { animation: dr-fog 2.2s cubic-bezier(.23,1,.32,1) backwards; }
@keyframes dr-fog { from { opacity: .2; filter: blur(8px) } to { opacity: 1; filter: none } }
.dr-rise { animation: dr-rise .5s cubic-bezier(.2,0,0,1) backwards; }
@keyframes dr-rise { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
.dr-link { text-decoration-line: underline; text-decoration-thickness: 1px; text-underline-offset: 4px; text-decoration-color: #c8c8c8; transition: text-decoration-color 150ms ease; }
@media (hover: hover) and (pointer: fine) { .dr-link:hover { text-decoration-color: ${INK}; } }
/* A product's landing page peeks up from its name: grows from the link, quick out */
.dr-peek { position: relative; white-space: nowrap; }
.dr-peek-card { position: absolute; left: 50%; bottom: calc(100% + 10px); z-index: 20; display: block; width: 288px; padding: 4px; border-radius: 16px; background: ${SHELL}; box-shadow: ${SHADOW}; opacity: 0; pointer-events: none; transform: translateX(-50%) translateY(6px) scale(.96); transform-origin: 50% 100%; transition: opacity 120ms ease, transform 120ms ease; }
.dr-peek-card img { display: block; width: 100%; aspect-ratio: 16 / 10; border-radius: 12px; }
.dr-peek-card span { display: block; padding: 6px 8px 2px; font-size: 13px; line-height: 20px; letter-spacing: 0; color: ${GREY}; }
.dr-co { text-decoration-line: underline; text-decoration-style: dotted; text-decoration-thickness: 1px; text-underline-offset: 4px; text-decoration-color: #b4b4b4; cursor: default; outline-offset: 4px; }
.dr-peek-card.dr-co-card { width: 300px; padding: 12px; white-space: normal; text-align: left; }
.dr-co-card .dr-co-row { display: flex; gap: 12px; align-items: flex-start; padding: 0; }
.dr-co-card .dr-co-row svg { width: 40px; height: 40px; flex: none; }
.dr-co-card span { padding: 0; }
.dr-co-card .dr-co-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.dr-co-card .dr-co-name { font-size: 15px; line-height: 22px; }
.dr-co-card .dr-co-role { margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.08); }
.dr-peek:focus-visible .dr-peek-card { opacity: 1; transform: translateX(-50%); transition: opacity 200ms cubic-bezier(.23,1,.32,1), transform 200ms cubic-bezier(.23,1,.32,1); }
@media (hover: hover) and (pointer: fine) { .dr-peek:hover .dr-peek-card { opacity: 1; transform: translateX(-50%); transition: opacity 200ms cubic-bezier(.23,1,.32,1) 60ms, transform 200ms cubic-bezier(.23,1,.32,1) 60ms; } }
/* The contributions graph is a shared component: bring its labels onto the page's type and greys */
.dr-gh .text-xs, .dr-gh .text-sm { font-size: 13px; line-height: 20px; }
.dr-gh .text-muted { color: ${GREY}; }
.dr-gh .text-foreground { color: ${INK}; font-weight: 400; }
/* Back from a case study: the page is already known, so it's there at once */
.dr-still .dr-word, .dr-still .dr-fog, .dr-still .dr-rise { animation: none; opacity: 1; }
@media (prefers-reduced-motion: reduce) { .dr-word, .dr-fog, .dr-rise { animation: none; opacity: 1; } .dr-peek-card, .dr-peek:hover .dr-peek-card { transform: translateX(-50%); } }
`

const PIECES = Object.fromEntries(ALL_PIECES.map((p) => [p.id, p]))
// The clips are laid out on the showcase's 1600x1000 stage
const RATIO = 1.6

// A piece's hero clip, playing while its card is in focus. Pieces whose page is cleared to just the
// app's windows (Dispatch, Thesis) sit straight on the card's grey
//
// The recorded sites fade their windows in on load, and a replay plays that in real time, so a card
// sat empty for seconds: their entrance animations are skipped here, straight to where they end.
// near: the rail is close to the screen, so every card loads ahead of being scrolled to
const NO_ENTRANCE = '*, *::before, *::after { animation-delay: 0s !important; animation-duration: 0s !important; }'
const ITEMS = Object.fromEntries(Object.values(PIECES).map((p) => {
  // Windows recorded on their own (Dispatch, Thesis) sit on white inside the frame, like every other
  // piece: one grey frame, a hairline, the work
  const item = { ...heroItem(p), matte: p.matte ? '#fff' : undefined }
  return [p.id, item.scene?.src ? { ...item, scene: { ...item.scene, css: [...(item.scene.css ?? []), NO_ENTRANCE] } } : item]
}))
function Live({ id, focus, near }: { id: string; focus: boolean; near: boolean }) {
  const item = ITEMS[id]
  if (!item) return null
  return <Media item={item} playing={focus} near={near || undefined} />
}

// The work inset on the card's grey by \`pad\` on every side, the card taking the work's own ratio
// so the gap is even all round, and the corners concentric: the card's radius is the window's
// plus the padding. A hairline edge, not a shadow: one grey, nothing raised inside it
const INNER = 8
// How far the work sits in from its card's edge
const PAD = 12
const outer = (pad: number) => pad + INNER
function Framed({ pad, ratio, bare = false, children }: { pad: number; ratio: number; bare?: boolean; children: ReactNode }) {
  return (
    <div style={{ padding: pad, borderRadius: outer(pad), background: SHELL }}>
      <div className="relative overflow-hidden" style={{ aspectRatio: ratio, borderRadius: INNER, boxShadow: pad && !bare ? `0 0 0 1px ${LINE}` : undefined }}>{children}</div>
    </div>
  )
}

function Label({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return <div className="flex items-baseline justify-between" style={{ color: GREY }}><h2 className="font-normal">{children}</h2>{right}</div>
}

// A row that runs the window's full width, the item in focus on the column, its neighbours smaller
// and fainter either side (as justinschueler.com's projects do). A rail under a written sentence
// hides its label (hideLabel): the sentence introduces the cards. Only sections with no sentence
// (Kind words, Thoughts) keep a label
function Rail<T>({ items, render, label, hideLabel = false }: { items: T[]; render: (item: T, focus: boolean, near: boolean) => ReactNode; label: string; hideLabel?: boolean }) {
  const row = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = row.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '100% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const [at, setAt] = useState(0)
  // The row breaks out of the text column to the window's edges; the card in focus sits centred,
  // as wide as --card-w (which can be wider than the text)
  const TEXT = 'min(540px, calc(100vw - 48px))'
  const COL = 'min(var(--card-w), calc(100vw - 48px))'
  const onScroll = () => {
    const el = row.current
    const s = el?.querySelectorAll<HTMLElement>('[data-slide]')
    if (!el || !s || s.length < 2) return
    setAt(Math.min(items.length - 1, Math.max(0, Math.round(el.scrollLeft / (s[1].offsetLeft - s[0].offsetLeft)))))
  }
  return (
    <div className="flex flex-col gap-6" role="region" aria-label={label}>
      {!hideLabel && <Label>{label}</Label>}
      <div
        ref={row}
        onScroll={onScroll}
        className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        style={{ gap: 'var(--cards)', marginInline: `calc((${TEXT} - 100vw) / 2)`, paddingInline: `calc((100vw - ${COL}) / 2)`, scrollPaddingInline: `calc((100vw - ${COL}) / 2)` }}
      >
        {items.map((item, i) => (
          <div key={i} data-slide className="shrink-0 snap-center transition-[transform,opacity] duration-500 ease-[cubic-bezier(.23,1,.32,1)] motion-reduce:transition-none" style={{ width: COL, transform: i === at ? undefined : 'scale(0.8)', opacity: i === at ? 1 : 0.7 }}>
            {render(item, i === at, near)}
          </div>
        ))}
      </div>
    </div>
  )
}

// A company's mark on its tile: ink on the shell grey, a hairline round it
const liveHref = (href?: string) => href && (!href.startsWith('/draft/') || PARKED_LIVE) ? href : undefined
function StudyLink({ href, children }: { href?: string; children: ReactNode }) {
  const live = liveHref(href)
  return live ? <Link href={live} className="dr-link">{children}</Link> : <>{children}</>
}
// A company's name in a sentence, its card peeking up on hover (or keyboard focus when the name
// isn't already a link). The companies section is hidden for now; this is where they show
const COMPANY_NAME: Record<string, string> = { 'Enterprise AI': 'Enterprise AI Group', SEEK: 'SEEK', 'Best Practice': 'Best Practice' }
function Co({ name, children, focusable = true }: { name: string; children?: ReactNode; focusable?: boolean }) {
  return <span className="dr-peek dr-co" tabIndex={focusable ? 0 : undefined}>{children ?? name}<CompanyPeek name={COMPANY_NAME[name] ?? name} /></span>
}
const withCompanies = (text: string) => text.split(/(Enterprise AI|SEEK|Best Practice)/).map((t, i) => i % 2 ? <Co key={i} name={t} /> : t)

// A list as a sentence: a, b and c.
const listed = (items: { name: string; href?: string }[], name = (n: string) => n) => items.map((p, i) => (
  <span key={p.name}><StudyLink href={p.href}>{name(p.name)}</StudyLink>{i < items.length - 2 ? ', ' : i === items.length - 2 ? ' and ' : '.'}</span>
))

// A project or creative piece: its clip framed on the grey (or its Stageshow scene filling the card),
// then the name and year
function WorkCard({ p, focus, near, pad }: { p: (typeof PROJECTS)[number]; focus: boolean; near: boolean; pad: number }) {
  const card = (
    <div className="flex flex-col gap-4">
      {p.scene ? <Framed pad={pad} ratio={RATIO}><div className="absolute inset-0">{p.scene}</div></Framed> : <Framed pad={pad} ratio={RATIO}><Live id={p.piece} focus={focus} near={near} /></Framed>}
      <div className="flex flex-col"><div className="flex justify-between gap-4"><span>{p.name}</span><span className="tabular-nums" style={{ color: GREY }}>{p.year}</span></div><p className="text-pretty" style={{ color: GREY }}>{p.desc}</p></div>
    </div>
  )
  const href = liveHref(p.href)
  return href ? <Link href={href} className="block">{card}</Link> : card
}

// Kind words, as justinschueler.com's numbered services: the person, then their words when opened
function KindWords() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="flex flex-col">
      {TESTIMONIALS.slice(0, 4).map((t, i) => (
        <div key={t.name} className="border-b" style={{ borderColor: LINE }}>
          <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center gap-6 py-3.5 text-left">
            <span className="w-6 shrink-0 tabular-nums" style={{ color: GREY }}>{String(i + 1).padStart(2, '0')}</span>
            <span className="flex-1">{t.name}<span style={{ color: GREY }}>, {t.role}</span></span>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out" style={{ color: GREY, transform: open === i ? 'rotate(180deg)' : undefined }} />
          </button>
          <div className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(.23,1,.32,1)] motion-reduce:transition-none" style={{ gridTemplateRows: open === i ? '1fr' : '0fr' }}>
            <div className="overflow-hidden">
              <p className="pb-5 pl-12 pr-4" style={{ color: GREY }}>“{t.content}”</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Thoughts: the essays as little cards in one shell, like the companies, scrolling sideways:
// title and year, then the essay's leading line under a hairline
function Thoughts() {
  return (
    <div className="rounded-[20px] p-1" style={{ background: SHELL }}>
      <div className="scrollbar-hide flex snap-x snap-mandatory gap-1 overflow-x-auto overscroll-x-contain rounded-[16px]">
        {[...ESSAYS, ...SKILLS].map((e) => <EssayCard key={e.title} essay={e} className="w-[232px] shrink-0 snap-start" />)}
      </div>
    </div>
  )
}

// The intro plays once per visit: on the first load, not when you come back to the page from a case
// study. Module state lives as long as the app does in the tab, so a reload plays it again
let introPlayed = false
// Where the page was when you left it, so coming back puts you there again
let leftAt = 0

// The page's spacing, as CSS variables on the page so the sliders can move them without a render:
// between sections, from a section's sentence to its cards, between the cards in a row, and how
// wide a card is (the text column stays 540). Defaults are what's live; ?sec= ?intro= ?cards= ?w=
const SPACE = [
  { key: 'sec', css: '--sec', label: 'Between sections', min: 80, max: 320, step: 8, value: 120 },
  { key: 'intro', css: '--intro', label: 'Sentence to cards', min: 24, max: 160, step: 8, value: 64 },
  { key: 'cards', css: '--cards', label: 'Between cards', min: 16, max: 200, step: 4, value: 32 },
  { key: 'w', css: '--card-w', label: 'Card width', min: 540, max: 900, step: 10, value: 540 },
] as const
type SpaceKey = (typeof SPACE)[number]['key']
type Space = Record<SpaceKey, number>
const SPACE_DEFAULT = Object.fromEntries(SPACE.map((k) => [k.key, k.value])) as Space
const spaceVars = (v: Space) => Object.fromEntries(SPACE.map((k) => [k.css, `${v[k.key]}px`]))
function spaceFromUrl(): Space {
  const q = new URLSearchParams(window.location.search)
  return Object.fromEntries(SPACE.map((k) => {
    const n = Number(q.get(k.key))
    return [k.key, q.has(k.key) && n >= k.min && n <= k.max ? n : k.value]
  })) as Space
}

// Dev server only: one panel, bottom left, to flip between the versions under review (the EAI line)
// and tune the spacing. Each change is written to the URL, so a version can be shared
type Review = { about: number }
function ReviewPanel({ r, set, page }: { r: Review; set: (r: Review) => void; page: React.RefObject<HTMLDivElement> }) {
  const [open, setOpen] = useState(true)
  const [space, setSpace] = useState<Space>(SPACE_DEFAULT)
  useEffect(() => setSpace(spaceFromUrl()), [])
  // Straight onto the page's style, then the URL: the page itself doesn't re-render while dragging
  const move = (next: Space) => {
    setSpace(next)
    SPACE.forEach((k) => page.current?.style.setProperty(k.css, `${next[k.key]}px`))
    const q = new URLSearchParams(window.location.search)
    SPACE.forEach((k) => next[k.key] === k.value ? q.delete(k.key) : q.set(k.key, String(next[k.key])))
    window.history.replaceState(null, '', `${window.location.pathname}${q.size ? `?${q}` : ''}`)
  }
  const changed = SPACE.some((k) => space[k.key] !== k.value)
  if (!PARKED_LIVE) return null
  const seg = <V extends string | number>(label: string, value: V, options: [V, string][], on: (v: V) => void, off = false) => (
    <div className="flex flex-col gap-1" style={{ opacity: off ? 0.4 : 1 }}>
      <span className="px-1" style={{ color: GREY }}>{label}</span>
      <div className="flex gap-1 rounded-[10px] p-0.5" style={{ background: SHELL }}>
        {options.map(([v, l]) => (
          <button key={String(v)} type="button" disabled={off} onClick={() => on(v)} className="flex-1 rounded-[8px] px-2.5 py-1 transition-[background-color,box-shadow] duration-150 active:scale-[0.97]" style={v === value ? { background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' } : { color: GREY }}>{l}</button>
        ))}
      </div>
    </div>
  )
  return (
    <nav className="fixed bottom-4 left-4 z-50 flex w-[236px] flex-col gap-3 rounded-[16px] bg-white p-2 text-[13px] leading-[20px]" style={{ boxShadow: SHADOW, color: INK, outline: `1px solid ${LINE}` }}>
      <button type="button" onClick={() => setOpen(!open)} className="flex justify-between px-1 text-left"><span>Review</span><span style={{ color: GREY }}>{open ? 'Hide' : 'Show'}</span></button>
      {open && (
        <>
          {seg('EAI line', r.about, ABOUT.map((_, i) => [i, String(i + 1)] as [number, string]), (about) => set({ ...r, about }))}
          <p className="px-1 text-pretty" style={{ color: GREY }}>{ABOUT[r.about].lead} {ABOUT[r.about].rest}</p>
          <div className="flex flex-col gap-2 border-t px-1 pt-3" style={{ borderColor: LINE }}>
            <div className="flex justify-between"><span>Spacing</span>{changed && <button type="button" onClick={() => move(SPACE_DEFAULT)} style={{ color: GREY }} className="dr-link">Reset</button>}</div>
            {SPACE.map((k) => (
              <label key={k.key} className="flex flex-col gap-0.5">
                <span className="flex justify-between" style={{ color: GREY }}><span>{k.label}</span><span className="tabular-nums" style={{ color: space[k.key] === k.value ? GREY : INK }}>{space[k.key]}</span></span>
                <input type="range" min={k.min} max={k.max} step={k.step} value={space[k.key]} onChange={(e) => move({ ...space, [k.key]: Number(e.target.value) })} className="w-full" style={{ accentColor: INK }} />
              </label>
            ))}
          </div>
        </>
      )}
    </nav>
  )
}

export default function Home() {
  const [intro] = useState(() => !introPlayed)
  useEffect(() => {
    introPlayed = true
    if (!intro && leftAt) {
      const y = leftAt
      // after the browser's own attempt, which lands at the top while the page is still short
      requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' })))
    }
    const keep = () => { leftAt = window.scrollY }
    window.addEventListener('scroll', keep, { passive: true })
    return () => window.removeEventListener('scroll', keep)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [copied, setCopied] = useState(false)
  // Spacing: the live defaults, or the URL's (?sec= ?intro= ?cards= ?w=), as CSS variables on the page
  const page = useRef<HTMLDivElement>(null)
  const [space, setSpace] = useState<Space>(SPACE_DEFAULT)
  useEffect(() => setSpace(spaceFromUrl()), [])
  // The EAI line under review, set from the panel (dev server only) or the URL: ?about=1-5
  const [review, setReview] = useState<Review>({ about: 1 })
  const { about } = review
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const a = Number(q.get('about'))
    setReview({ about: a >= 1 && a <= ABOUT.length ? a - 1 : 1 })
  }, [])
  const changeReview = (r: Review) => {
    setReview(r)
    const q = new URLSearchParams(window.location.search)
    q.set('about', String(r.about + 1))
    window.history.replaceState(null, '', `${window.location.pathname}?${q}`)
  }
  // Copy the email: click it, or press E as justinschueler.com does. There's no contact page
  const copy = () => navigator.clipboard?.writeText(EMAIL).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600) })
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'e' || e.metaKey || e.ctrlKey || (e.target as HTMLElement).closest('input, textarea')) return
      copy()
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])

  let n = 0
  const words = (text: string) => text.split(/(\s+)/).filter(Boolean).map((w, k) => /^\s+$/.test(w) ? w : <span key={k} className="dr-word" style={{ animationDelay: `${WORD_START + n++ * WORD_STEP}s` }}>{w}</span>)
  const statement = STATEMENT.map((r, k) => r.href ? <a key={k} href={r.href} className="dr-link">{words(r.text)}</a> : <span key={k}>{words(r.text)}</span>)
  const fog = { animationDelay: `${WORD_START + n * WORD_STEP + WORD_TIME - 0.6}s` }
  const rise = (i: number) => ({ animationDelay: `${2.6 + i * 0.1}s` })

  return (
    <div ref={page} className={`min-h-screen overflow-x-clip bg-white text-[15px] leading-[22px] ${intro ? '' : 'dr-still'}`} style={{ color: INK, ...spaceVars(space) } as React.CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <main className="mx-auto flex max-w-[588px] flex-col px-6 pb-16 pt-16" style={{ gap: 'var(--sec)' }}>
        <header className="dr-fog flex items-start justify-between" style={fog}>
          <div className="flex flex-col"><Link href="/">Gareth Chainey</Link><span style={{ color: GREY }}>Product designer</span></div>
          <span style={{ color: GREY }}>New York</span>
        </header>

        <h1 className="text-[24px] font-normal leading-[30px] tracking-[-0.02em] text-pretty" style={{ marginTop: INTRO_PULL }}>{statement}</h1>

        {/* The contributions: the change in the role, from designing to building */}
        <div className="dr-fog dr-gh" style={{ ...fog, marginTop: INTRO_PULL }}><GitHubContributions variant="full" animate={intro} /></div>

        {/* The products I build alongside the day job, then the day job */}
        <section className="dr-fog flex flex-col" style={{ ...fog, gap: 'var(--intro)' }}>
          <Headline
            as="p"
            lead="Alongside the day job, I build my own products."
            rest={PRODUCTS.map((p, i) => (
              <span key={p.name}><a href={p.href} target="_blank" rel="noopener noreferrer" className="dr-link dr-peek">{p.name}<span className="dr-peek-card" aria-hidden>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={p.landing} alt="" /><span>{p.href.replace(/^https:\/\/(www\.)?/, '')}</span></span></a>{i < PRODUCTS.length - 2 ? ', ' : i === PRODUCTS.length - 2 ? ' and ' : '.'}</span>
            ))}
          />
          <Rail
            label="Products"
            hideLabel
            items={PRODUCTS}
            render={(p, focus, near) => (
              <a href={p.href} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-4">
                <Framed pad={PAD} ratio={RATIO}><Live id={p.piece} focus={focus} near={near} /></Framed>
                <span className="flex flex-col"><span>{p.name}</span><span className="text-pretty" style={{ color: GREY }}>{p.desc}</span></span>
              </a>
            )}
          />
        </section>


        {/* What I do at EAI, then the projects it covers. The sentence introduces them, so the rail
            has no label */}
        <section id="projects" className="dr-rise flex scroll-mt-10 flex-col" style={{ ...rise(1), gap: 'var(--intro)' }}>
          <Headline as="p" lead={withCompanies(ABOUT[about].lead)} rest={withCompanies(ABOUT[about].rest)} />
          <Rail label="Work at Enterprise AI" hideLabel items={PROJECTS} render={(p, focus, near) => <WorkCard p={p} focus={focus} near={near} pad={PAD} />} />
        </section>


        {/* Companies: hidden for now, they show on hover where their names come up (Co). The cards and
            their review options are in components/site/companies.tsx */}

        <section className="dr-rise flex flex-col" style={{ ...rise(2), gap: 'var(--intro)' }}>
          <Headline
            as="p"
            lead="Before AI."
            rest={<>At <Co name="SEEK" focusable={!liveHref('/draft/seek')}><StudyLink href="/draft/seek">SEEK</StudyLink></Co> I learned a release is where the work starts: follow the funnel, one assumption at a time. At <Co name="Best Practice" focusable={!liveHref('/draft/bestpractice')}><StudyLink href="/draft/bestpractice">Best Practice</StudyLink></Co>, the craft was in small decisions, like three toggles becoming one control.</>}
          />
          <Rail label="Before AI" hideLabel items={BEFORE_AI} render={(p, focus, near) => <WorkCard p={p} focus={focus} near={near} pad={PAD} />} />
        </section>

        <section className="dr-rise flex flex-col" style={{ ...rise(3), gap: 'var(--intro)' }}>
          <Headline as="p" lead="AI enables so much more." rest={<>Internal tools that help build the thing, scratching a curious itch, or dreaming big: {listed(CREATIVE)}</>} />
          <Rail label="Creative" hideLabel items={CREATIVE} render={(p, focus, near) => <WorkCard p={p} focus={focus} near={near} pad={PAD} />} />
        </section>

        <section className="dr-rise flex flex-col gap-10" style={rise(4)}>
          <div className="flex flex-col gap-6">
            <Label>Kind words</Label>
            <KindWords />
          </div>
        </section>

        <section className="dr-rise flex flex-col gap-6" style={rise(5)}>
          <Label right={<Link href="/essays" className="dr-link">All essays</Link>}>Thoughts</Label>
          <Thoughts />
        </section>

        <footer className="flex flex-col gap-6 border-t pt-8" style={{ borderColor: LINE, color: GREY }}>
          <div className="flex items-baseline justify-between gap-4">
            <button type="button" onClick={copy} className="dr-link text-left" style={{ color: INK }} aria-label={`Copy ${EMAIL}`}>{EMAIL}</button>
            <span aria-live="polite">{copied ? 'Copied' : <span className="hidden [@media(hover:hover)_and_(pointer:fine)]:inline">Click or press E to copy</span>}</span>
          </div>
          <div className="flex gap-5"><Link href="/essays">Essays</Link><Link href="/cv">CV</Link><a href="https://x.com/garethchainey" target="_blank" rel="noopener noreferrer">X ↗</a><Link href="/changelog">Changelog</Link></div>
        </footer>
      </main>
      <ReviewPanel r={review} set={changeReview} page={page} />
    </div>
  )
}
