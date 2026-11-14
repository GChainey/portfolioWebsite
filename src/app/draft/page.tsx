'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { GitHubContributions } from '@/components/GitHubContributions'
import { Media, heroItem } from '@/components/HomeShowcase'
import { SHOWCASE_SECTIONS } from '@/content/home-showcase'
import { RfpLetter } from '@/components/stageshow/RfpLetter'
import { TESTIMONIALS } from '@/content/testimonials'
import { COMPANY_MARKS } from '@/content/company-marks'
import { EssayCard, ESSAYS, SKILLS, GREY, Headline, INK, LINE, SHADOW, SHELL } from './style'

// A draft homepage (/draft): justinschueler.com's design with my content, to compare against the
// live one. One 540px column; styles from ./style (after the Polar audit: one weight, four sizes,
// ink and one grey, shells holding panels).
// The statement lights up word by word while the rest waits in a fog; sections rise in after.
// The work leads with Stageshow scenes where there is one (Shader Wall, the RFP letter) and clean
// stills elsewhere: no coloured mats. Case studies are short, enough to start a conversation
// (/draft/rfp is the first).

const EMAIL = 'gareth.chainey@gmail.com'

type Run = { text: string; href?: string }
const STATEMENT: Run[] = [
  { text: 'I’m Gareth, an Aussie product designer in New York. I design by building: ' },
  { text: 'working prototypes', href: '#projects' },
  { text: ', made with AI, that help small teams win big deals.' },
]

// Each company as a little card, the three side by side across the column: its mark (the facet
// style of the prototypes' app icons, content/company-marks), the name, what the company is, then
// the role and years. The EAI line is a placeholder until we write it
const COMPANIES: { name: string; mark: string; about: string; role: string; years: string }[] = [
  { name: 'Enterprise AI Group', mark: 'eai', about: 'A platform where consultants build apps with agents', role: 'Lead product designer', years: '2025 – now' },
  { name: 'SEEK', mark: 'seek', about: 'Australia’s largest job marketplace', role: 'Senior product designer', years: '2022 – 2024' },
  { name: 'Best Practice', mark: 'best-practice', about: 'Australia’s largest practice management platform', role: 'Product designer', years: '2019 – 2022' },
]

// landing: a still of the product's landing page, for the hover card on its name in the sentence
// piece: the homepage showcase's piece (content/home-showcase), whose hero clip plays here: the
// real page as an HTML replay (or the real video), so it's sharp at any size. On the card it sits
// inset on the grey, by the padding the controls set
const PRODUCTS: { name: string; href: string; landing: string; piece: string }[] = [
  { name: 'Shader Wall', href: 'https://www.shaderwall.com', landing: '/draft/landing-shaderwall.jpg', piece: 'shader-wall' },
  { name: 'Dispatch', href: 'https://www.dispatchmac.com', landing: '/draft/landing-dispatch.jpg', piece: 'dispatch' },
  { name: 'Thesis', href: 'https://thesis-phi-self.vercel.app', landing: '/draft/landing-thesis.jpg', piece: 'thesis' },
]

// piece as the products; the RFP's is its Stageshow scene, which fills its card instead
const PROJECTS: { name: string; year: string; href?: string; piece: string; scene?: ReactNode }[] = [
  { name: 'Winning a tender', year: '2025', href: '/draft/rfp', piece: 'rfp', scene: <RfpLetter bare /> },
  { name: 'Testing on live models', year: '2025–26', piece: 'configurator' },
  { name: 'An agent-built website', year: '2026', piece: 'html-brand-website' },
  { name: 'SEEK, fixing the funnel', year: '2024', piece: 'seek' },
  { name: 'Booking in two panels', year: '2021', piece: 'bestpractice' },
]

// Creative: the games, on their own rail
const CREATIVE: typeof PROJECTS = [
  { name: 'Opportunity sizing x Balatro', year: '2026', href: '/projects/balatro-opportunity-sizing', piece: 'balatro' },
  { name: 'Wallbounce', year: '2026', href: '/projects/wallbounce-dev-tools', piece: 'wallbounce' },
]


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
.dr-peek:focus-visible .dr-peek-card { opacity: 1; transform: translateX(-50%); transition: opacity 200ms cubic-bezier(.23,1,.32,1), transform 200ms cubic-bezier(.23,1,.32,1); }
@media (hover: hover) and (pointer: fine) { .dr-peek:hover .dr-peek-card { opacity: 1; transform: translateX(-50%); transition: opacity 200ms cubic-bezier(.23,1,.32,1) 60ms, transform 200ms cubic-bezier(.23,1,.32,1) 60ms; } }
/* The contributions graph is a shared component: bring its labels onto the draft's type and greys */
.dr-gh .text-xs, .dr-gh .text-sm { font-size: 13px; line-height: 20px; }
.dr-gh .text-muted { color: ${GREY}; }
.dr-gh .text-foreground { color: ${INK}; font-weight: 400; }
/* Back from a case study: the page is already known, so it's there at once */
.dr-still .dr-word, .dr-still .dr-fog, .dr-still .dr-rise { animation: none; opacity: 1; }
@media (prefers-reduced-motion: reduce) { .dr-word, .dr-fog, .dr-rise { animation: none; opacity: 1; } .dr-peek-card, .dr-peek:hover .dr-peek-card { transform: translateX(-50%); } }
`

const PIECES = Object.fromEntries(SHOWCASE_SECTIONS.flatMap((sec) => sec.pieces).map((p) => [p.id, p]))
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
  const item = { ...heroItem(p), matte: p.matte ? 'transparent' : undefined }
  return [p.id, item.scene?.src ? { ...item, scene: { ...item.scene, css: [...(item.scene.css ?? []), NO_ENTRANCE] } } : item]
}))
function Live({ id, focus, near }: { id: string; focus: boolean; near: boolean }) {
  const item = ITEMS[id]
  if (!item) return null
  return <Media item={item} playing={focus} near={near || undefined} />
}
const onlyWindows = (id: string) => !!PIECES[id]?.matte

// The work inset on the card's grey by \`pad\` on every side, the card taking the work's own ratio
// so the gap is even all round, and the corners concentric: the card's radius is the window's
// plus the padding
const INNER = 8
const outer = (pad: number) => pad + INNER
function Framed({ pad, ratio, bare = false, children }: { pad: number; ratio: number; bare?: boolean; children: ReactNode }) {
  return (
    <div style={{ padding: pad, borderRadius: outer(pad), background: SHELL }}>
      <div className="relative overflow-hidden" style={{ aspectRatio: ratio, borderRadius: INNER, boxShadow: pad && !bare ? SHADOW : undefined }}>{children}</div>
    </div>
  )
}

function Label({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return <div className="flex items-baseline justify-between" style={{ color: GREY }}><h2 className="font-normal">{children}</h2>{right}</div>
}

// A row that runs the window's full width, the item in focus on the column, its neighbours smaller
// and fainter either side (as justinschueler.com's projects do)
function Rail<T>({ items, render, label }: { items: T[]; render: (item: T, focus: boolean, near: boolean) => ReactNode; label: string }) {
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
  const COL = 'min(540px, calc(100vw - 48px))'
  const onScroll = () => {
    const el = row.current
    const s = el?.querySelectorAll<HTMLElement>('[data-slide]')
    if (!el || !s || s.length < 2) return
    setAt(Math.min(items.length - 1, Math.max(0, Math.round(el.scrollLeft / (s[1].offsetLeft - s[0].offsetLeft)))))
  }
  return (
    <div className="flex flex-col gap-6">
      <Label>{label}</Label>
      <div
        ref={row}
        onScroll={onScroll}
        className="scrollbar-hide flex snap-x snap-mandatory gap-8 overflow-x-auto overscroll-x-contain"
        style={{ marginInline: `calc((${COL} - 100vw) / 2)`, paddingInline: `calc((100vw - ${COL}) / 2)`, scrollPaddingInline: `calc((100vw - ${COL}) / 2)` }}
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
function Mark({ id, outline }: { id: string; outline: boolean }) {
  const m = COMPANY_MARKS[id]
  return (
    <svg viewBox="0 0 100 100" className="h-10 w-10 shrink-0" aria-hidden>
      <rect width="100" height="100" rx="22" fill={SHELL} />
      {outline && <rect x=".75" y=".75" width="98.5" height="98.5" rx="21.25" fill="none" stroke={INK} strokeOpacity=".08" strokeWidth="1.5" />}
      <path d={m.f} fill={INK} />
      {m.h && <path d={m.h} fill={SHELL} />}
    </svg>
  )
}

// Companies: one shell, a little panel per company side by side, together the column's width
function CompaniesCard({ logos, seekDots }: { logos: Logos; seekDots: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-1 rounded-[20px] p-1 min-[480px]:grid-cols-3" style={{ background: SHELL }}>
      {COMPANIES.map((c) => (
        <article key={c.name} className="flex flex-col gap-6 rounded-[16px] bg-white p-4 min-[480px]:min-h-[176px]" style={{ boxShadow: SHADOW }}>
          {logos !== 'none' && <Mark id={c.mark === 'seek' && seekDots ? 'seek-dots' : c.mark} outline={logos === 'outline'} />}
          <div className="flex flex-col gap-1">
            <h3 className="font-normal">{c.name}</h3>
            <p className="text-[13px] leading-[20px] text-pretty" style={{ color: GREY }}>{c.about}</p>
          </div>
          <div className="mt-auto flex flex-col border-t pt-3 text-[13px] leading-[20px]" style={{ borderColor: LINE, color: GREY }}>
            <span>{c.role}</span>
            <span className="tabular-nums">{c.years}</span>
          </div>
        </article>
      ))}
    </div>
  )
}

// A project or creative piece: its clip framed on the grey (or its Stageshow scene filling the card),
// then the name and year
function WorkCard({ p, focus, near, pad }: { p: (typeof PROJECTS)[number]; focus: boolean; near: boolean; pad: number }) {
  const card = (
    <div className="flex flex-col gap-4">
      {p.scene ? <div className="overflow-hidden" style={{ aspectRatio: 540 / 340, borderRadius: outer(pad), background: SHELL }}>{p.scene}</div> : <Framed pad={pad} ratio={RATIO} bare={onlyWindows(p.piece)}><Live id={p.piece} focus={focus} near={near} /></Framed>}
      <div className="flex justify-between gap-4"><span>{p.name}</span><span className="tabular-nums" style={{ color: GREY }}>{p.year}</span></div>
    </div>
  )
  return p.href ? <Link href={p.href} className="block">{card}</Link> : card
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

type Logos = 'outline' | 'plain' | 'none'

// The draft's knobs, bottom left: the company logo style, and how far the work sits in from its
// card's edge (the card's radius follows, concentric)
function Controls({ logos, setLogos, seekDots, setSeekDots, pad, setPad }: { logos: Logos; setLogos: (l: Logos) => void; seekDots: boolean; setSeekDots: (b: boolean) => void; pad: number; setPad: (n: number) => void }) {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex w-[232px] flex-col gap-3 rounded-[16px] bg-white p-3 text-[13px] leading-[20px]" style={{ boxShadow: SHADOW, color: INK, outline: `1px solid ${LINE}` }}>
      <div className="flex flex-col gap-1.5">
        <span style={{ color: GREY }}>Company logos</span>
        <div className="grid grid-cols-3 gap-1 rounded-[10px] p-0.5" style={{ background: SHELL }}>
          {(['outline', 'plain', 'none'] as Logos[]).map((l) => (
            <button key={l} onClick={() => setLogos(l)} className="rounded-[8px] py-1 capitalize transition-[background-color,box-shadow] duration-150" style={l === logos ? { background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' } : { color: GREY }}>{l === 'outline' ? 'Outline' : l === 'plain' ? 'No outline' : 'None'}</button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span style={{ color: GREY }}>SEEK mark</span>
        <div className="grid grid-cols-2 gap-1 rounded-[10px] p-0.5" style={{ background: SHELL }}>
          {[false, true].map((d) => (
            <button key={String(d)} onClick={() => setSeekDots(d)} className="rounded-[8px] py-1 transition-[background-color,box-shadow] duration-150" style={d === seekDots ? { background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' } : { color: GREY }}>{d ? 'Dots' : 'Disc'}</button>
          ))}
        </div>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="flex justify-between" style={{ color: GREY }}>Card padding<span className="tabular-nums" style={{ color: INK }}>{pad}px</span></span>
        <input type="range" min={0} max={64} step={4} value={pad} onChange={(e) => setPad(Number(e.target.value))} className="w-full accent-[#181818]" />
      </label>
    </div>
  )
}

// The intro plays once per visit: on the first load, not when you come back to the page from a case
// study. Module state lives as long as the app does in the tab, so a reload plays it again
let introPlayed = false
// Where the page was when you left it, so coming back puts you there again
let leftAt = 0

export default function DraftHome() {
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
  const [logos, setLogos] = useState<Logos>('outline')
  const [seekDots, setSeekDots] = useState(true)
  const [pad, setPad] = useState(12)
  // press E: copy the email, as justinschueler.com does
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'e' || e.metaKey || e.ctrlKey || (e.target as HTMLElement).closest('input, textarea')) return
      navigator.clipboard?.writeText(EMAIL).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600) })
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
    <div className={`min-h-screen overflow-x-clip bg-white text-[15px] leading-[22px] ${intro ? '' : 'dr-still'}`} style={{ color: INK }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <main className="mx-auto flex max-w-[588px] flex-col gap-[120px] px-6 pb-16 pt-16">
        <header className="dr-fog flex items-start justify-between" style={fog}>
          <div className="flex flex-col"><Link href="/draft">Gareth Chainey</Link><span style={{ color: GREY }}>Product designer</span></div>
          <span style={{ color: GREY }}>New York</span>
        </header>

        <h1 className="-mt-12 text-[24px] font-normal leading-[30px] tracking-[-0.02em] text-pretty">{statement}</h1>

        {/* The contributions: the change in the role, from designing to building */}
        <div className="dr-fog dr-gh" style={fog}><GitHubContributions variant="full" animate={intro} /></div>

        <section className="dr-fog flex flex-col gap-6" style={fog}>
          <Label>Companies</Label>
          <CompaniesCard logos={logos} seekDots={seekDots} />
        </section>

        <section className="dr-rise flex flex-col gap-16" style={rise(0)}>
          <Headline
            as="p"
            lead="Alongside the day job, I build my own products."
            rest={PRODUCTS.map((p, i) => (
              <span key={p.name}><a href={p.href} target="_blank" rel="noopener noreferrer" className="dr-link dr-peek">{p.name}<span className="dr-peek-card" aria-hidden>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={p.landing} alt="" /><span>{p.href.replace(/^https:\/\/(www\.)?/, '')}</span></span></a>{i < PRODUCTS.length - 2 ? ', ' : i === PRODUCTS.length - 2 ? ' and ' : '.'}</span>
            ))}
          />
          <Rail
            label="Products"
            items={PRODUCTS}
            render={(p, focus, near) => (
              <a href={p.href} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-4">
                <Framed pad={pad} ratio={RATIO} bare={onlyWindows(p.piece)}><Live id={p.piece} focus={focus} near={near} /></Framed>
                <span>{p.name}</span>
              </a>
            )}
          />
        </section>

        <section id="projects" className="dr-rise scroll-mt-10" style={rise(1)}>
          <Rail label="Projects" items={PROJECTS} render={(p, focus, near) => <WorkCard p={p} focus={focus} near={near} pad={pad} />} />
        </section>

        <section className="dr-rise" style={rise(2)}>
          <Rail label="Creative" items={CREATIVE} render={(p, focus, near) => <WorkCard p={p} focus={focus} near={near} pad={pad} />} />
        </section>

        <section className="dr-rise flex flex-col gap-10" style={rise(3)}>
          <div className="flex flex-col gap-6">
            <Label>Kind words</Label>
            <KindWords />
          </div>
        </section>

        <section className="dr-rise flex flex-col gap-6" style={rise(4)}>
          <Label right={<Link href="/draft/essays" className="dr-link">All essays</Link>}>Thoughts</Label>
          <Thoughts />
        </section>

        <footer className="flex flex-col gap-6 border-t pt-8" style={{ borderColor: LINE, color: GREY }}>
          <div className="flex items-baseline justify-between gap-4">
            <a href={`mailto:${EMAIL}`} className="dr-link" style={{ color: INK }}>{EMAIL}</a>
            <span>{copied ? 'Copied' : 'press E'}</span>
          </div>
          <div className="flex gap-5"><Link href="/draft/essays">Essays</Link><Link href="/cv">CV</Link><Link href="/contact">Contact</Link><Link href="/changelog">Changelog</Link></div>
        </footer>
      </main>
      <Controls logos={logos} setLogos={setLogos} seekDots={seekDots} setSeekDots={setSeekDots} pad={pad} setPad={setPad} />
    </div>
  )
}
