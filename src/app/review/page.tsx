import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'

// The design review from Paper ("Design review · fonts, colours, consistency"), as a page: the
// homepage frames against the 13 graphic design principles, with every font and colour they
// use. The pinned excerpts are exports of the board; everything else is text. Dev server only.

type Verdict = 'keep' | 'warn' | 'fail'
const COLOUR: Record<Verdict, string> = { keep: '#15803D', warn: '#B45309', fail: '#B91C1C' }
const WORD: Record<Verdict, string> = { keep: 'Pass', warn: 'Warn', fail: 'Fail' }

const STYLES: { sample: string; css: React.CSSProperties; spec: string; use: string; verdict: Verdict; label: string; note?: string }[] = [
  { sample: 'Product Orchestrator*', css: { fontSize: 56, lineHeight: '60px', fontWeight: 500, letterSpacing: '-0.03em' }, spec: '56 / 60 · 500 · −3%', use: 'Hero', verdict: 'keep', label: 'Keep' },
  { sample: 'Products I’ve made', css: { fontSize: 36, lineHeight: '40px', fontWeight: 500, letterSpacing: '-0.02em' }, spec: '36 / 40 · 500 · −2%', use: 'Section headings', verdict: 'keep', label: 'Keep' },
  { sample: 'A council’s whole caseload', css: { fontSize: 24, lineHeight: '30px', fontWeight: 500, letterSpacing: '-0.01em' }, spec: '24 / 30 · 500 · −1%', use: 'Piece titles', verdict: 'keep', label: 'Keep' },
  { sample: 'an asset to any team', css: { fontSize: 24, lineHeight: '34px', letterSpacing: '-0.01em', color: '#737373' }, spec: '24 / 34 · 400 · −1%', use: 'Kind words', verdict: 'warn', label: 'Two line-heights', note: 'Same size as Title, different line-height (34 vs 30)' },
  { sample: 'Gareth Chainey', css: { fontSize: 18, lineHeight: '22px', fontWeight: 500 }, spec: '18 / 22 · 500', use: 'Header wordmark', verdict: 'warn', label: 'Off-scale', note: 'The only 18px on the page. Use 16 Medium' },
  { sample: 'A state tender, won with a working product', css: { fontSize: 16, lineHeight: '26px', color: '#737373' }, spec: '16 / 26 · 400', use: 'Summaries', verdict: 'keep', label: 'Keep' },
  { sample: 'Winnie Bamra', css: { fontSize: 16, lineHeight: '20px', fontWeight: 500 }, spec: '16 / 20 · 500', use: 'Byline, creative titles', verdict: 'warn', label: 'Two line-heights', note: '16px is 26 line-height everywhere else' },
  { sample: 'Read the story →', css: { fontSize: 14, lineHeight: '18px', color: '#737373' }, spec: '14 / 18 · 400', use: 'Nav, links, captions, counters', verdict: 'keep', label: 'Keep' },
  { sample: 'Shader Wall', css: { fontSize: 14, lineHeight: '18px', fontWeight: 500 }, spec: '14 / 18 · 500', use: 'Active tab, avatar initial', verdict: 'keep', label: 'Keep' },
  { sample: 'SPACEX', css: { fontSize: 14, lineHeight: '18px', fontWeight: 500, letterSpacing: '0.3em', color: '#737373' }, spec: '14 / 18 · 500 · +30%', use: 'Company logo stand-in', verdict: 'fail', label: 'Placeholder', note: 'Use the real SpaceX logo, as the site does' },
  { sample: 'DAISY ASSESS', css: { fontSize: 12, lineHeight: '16px', fontWeight: 500, letterSpacing: '0.08em', color: '#737373' }, spec: '12 / 16 · 500 · +8% caps', use: 'Labels, eyebrows', verdict: 'keep', label: 'Keep' },
  { sample: '© 2025 Gareth Chainey', css: { fontSize: 12, lineHeight: '16px', color: '#737373' }, spec: '12 / 16 · 400', use: 'Footer', verdict: 'warn', label: 'Extra style', note: 'A second 12px style. Use 14 Regular' },
]

const SWATCHES = [
  { name: 'Text', value: '#0A0A0A', token: 'foreground', use: 'Headings, titles, names, the active nav item', fill: '#0A0A0A' },
  { name: 'Muted text', value: '#737373', token: 'muted', use: 'Summaries, links, labels, the quote’s plain words', fill: '#737373' },
  { name: 'Lines', value: '#E5E5E5', token: 'border', use: 'Panel rules, frame outlines, idle tabs and arrows', fill: '#E5E5E5' },
  { name: 'Page', value: '#FFFFFF', token: 'background', use: 'Every surface', fill: '#FFFFFF' },
  { name: 'Amber', value: '#D97706', token: 'accent, at 32%', use: 'Only the quote highlighter. Never at full strength', fill: 'linear-gradient(90deg, #D97706 50%, #F3D3AF 50%)' },
  { name: 'Avatar tan', value: '#F3C98B', token: 'no token', use: 'Winnie’s initial. Use the amber at 32%, or her photo', fill: '#F3C98B', off: true },
]

const EXCERPTS: { title: string; variant: string; src: string; w: number; h: number; notes: { n: number; v: Verdict; text: string }[] }[] = [
  { title: 'Header and first piece', variant: 'A · v2 with panels', src: '/review/excerpt-1.webp', w: 2880, h: 840, notes: [
    { n: 1, v: 'fail', text: 'The wordmark starts at 104px, the content at 113px. The header’s 24px padding doesn’t match the column’s 32px plus its 1px rule. Make it 33px so they share one edge.' },
    { n: 2, v: 'warn', text: 'Big frames carry a drop shadow; the 800px carousel slides in C have none. Pick one: outline only, everywhere.' },
    { n: 3, v: 'keep', text: 'Title 24 over summary 16, link on the right, image under: clear and repeatable. Keep this anatomy and use it in every variant.' },
  ] },
  { title: 'Projects carousel', variant: 'C · carousels (image cut short)', src: '/review/excerpt-2.webp', w: 2880, h: 1058, notes: [
    { n: 4, v: 'warn', text: 'The arrows and “1 / 3” sit above the image; the tabs sit below it, about 800px apart. Two controls for one carousel, split either side of it.' },
    { n: 5, v: 'warn', text: 'The tabs say the same as “1 / 3”, and name the project the caption already names. Keep the tabs, drop the counter; put the arrows on the image.' },
    { n: 6, v: 'warn', text: 'Here the title sits under the image; in A, B, D and the case studies it sits above. One rule: title, then image.' },
  ] },
  { title: 'Case study, side carousel', variant: 'C · carousels', src: '/review/excerpt-3.webp', w: 2880, h: 1498, notes: [
    { n: 7, v: 'warn', text: 'Five controls in one row: link, divider, counter, two arrows. Move “Read the story” under the summary; leave the arrows.' },
    { n: 8, v: 'warn', text: 'No shadow here, a shadow on the 1216px frames. Same thing, two treatments (see 2).' },
    { n: 9, v: 'warn', text: 'The first caption is black, the rest grey, but nothing else marks the current slide. Make them all grey, or dim the slides that aren’t current.' },
    { n: 10, v: 'keep', text: 'The next slide peeking in from the right says “there’s more” without a word. The strongest idea on the page.' },
  ] },
  { title: 'Kind words', variant: 'A, C and D (B puts it in an outlined card)', src: '/review/excerpt-4.webp', w: 2880, h: 678, notes: [
    { n: 11, v: 'fail', text: '#F3C98B is the only colour on the page outside the tokens. Use the 32% amber, or her face as the site does.' },
    { n: 12, v: 'fail', text: '“SPACEX” in spaced type stands in for a logo. It’s the reason Winnie leads; use the real mark.' },
    { n: 13, v: 'warn', text: '24px quote on a 34px line, 24px titles on a 30px line. Pick 32 for both and the two read as one size.' },
    { n: 14, v: 'keep', text: 'Grey words with the best phrases in black on amber: you can read it in two seconds. The only place colour is used, so it lands.' },
  ] },
]

const V = (v: Verdict, note: string) => ({ v, note })
const PRINCIPLES: { name: string; def: string; cells: { v: Verdict; note: string }[]; fix: string }[] = [
  { name: 'Alignment', def: 'Things share edges', cells: [V('warn', 'Header at 104px, content at 113px'), V('warn', 'Same 9px offset'), V('warn', 'Same offset; controls split top and bottom'), V('warn', 'Same 9px offset')], fix: 'Header padding 33px, so the wordmark sits on the content edge' },
  { name: 'Contrast', def: 'What differs looks different', cells: [V('keep', 'Black titles over grey summaries'), V('keep', 'Same, with more air'), V('warn', 'Current slide marked only by a black caption'), V('keep', 'Black titles over grey summaries')], fix: 'Dim the slides that aren’t current; keep every caption grey' },
  { name: 'Balance', def: 'Weight spread evenly', cells: [V('warn', 'Three dark screenshots stack at the top'), V('warn', 'Same stack'), V('keep', 'One dark image, then light rows'), V('warn', 'Dark, light, dark, no pattern')], fix: 'Order screenshots so dark ones don’t stack' },
  { name: 'Hierarchy', def: 'Most important is biggest', cells: [V('keep', '56 / 36 / 24 / 16, clear steps'), V('keep', 'Same steps'), V('keep', 'Same steps'), V('keep', 'Same steps')], fix: 'Keep. Fold the 18px wordmark into 16' },
  { name: 'Colour', def: 'Few hues, one meaning each', cells: [V('warn', 'Amber only on highlights; one off-token tan'), V('warn', 'Same'), V('warn', 'Same'), V('warn', 'Same')], fix: 'Avatar in the 32% amber, or a photo' },
  { name: 'White space', def: 'Space groups and separates', cells: [V('keep', '80 above sections, 48 around pieces'), V('keep', 'No lines needed; space does it'), V('warn', '32px above the project image, 48 elsewhere'), V('keep', 'Even gaps')], fix: 'One gap from text to image: 24px' },
  { name: 'Proportion', def: 'Size matches importance', cells: [V('warn', 'Every image 1216 × 760, big or small story'), V('warn', 'Same'), V('keep', 'Products big, slides 800, quote between'), V('warn', 'Every image the same size')], fix: 'Products full width; case studies and tools at 800' },
  { name: 'Repetition', def: 'Same thing, same style', cells: [V('warn', 'Shadow on big frames only'), V('warn', 'Same'), V('fail', 'Captions in three places, two shadow styles'), V('warn', 'Link moved under summary in one block')], fix: 'One anatomy: label, title, summary, link, then image' },
  { name: 'Rhythm', def: 'A beat the eye can follow', cells: [V('keep', 'Piece, piece, piece, quote'), V('keep', 'Same beat, calmer'), V('keep', 'Big, quote, rows'), V('keep', 'Same beat')], fix: 'Keep a quote about every three pieces' },
  { name: 'Movement', def: 'Eye goes where it should', cells: [V('keep', 'Straight down'), V('keep', 'Straight down'), V('warn', 'Arrows top-right pull the eye off the image'), V('keep', 'Straight down')], fix: 'Arrows on the image’s edges' },
  { name: 'Emphasis', def: 'One focal point per view', cells: [V('keep', 'One image per screen'), V('keep', 'One image per screen'), V('keep', 'One project at a time'), V('keep', 'One image per screen')], fix: 'Keep' },
  { name: 'Proximity', def: 'Related things together', cells: [V('keep', 'Link beside its title'), V('keep', 'Same'), V('fail', 'Counter above, tabs below one 760px image'), V('keep', 'Link under its summary')], fix: 'Carousel controls in one place, under the image' },
  { name: 'Unity', def: 'Feels like one system', cells: [V('keep', 'One piece pattern throughout'), V('keep', 'The calmest of the four'), V('warn', 'Carousels add a second set of controls'), V('keep', 'One pattern, no lines')], fix: 'One control style for every carousel' },
]

const FIXES = [
  { tag: '1 · All variants', title: 'One left edge', body: 'Header padding 33px so the wordmark, headings and images all start at 113px.' },
  { tag: '2 · C most', title: 'One piece anatomy', body: 'Label, title, summary, link, then the image. Titles never go under the image.' },
  { tag: '3 · All variants', title: 'One image frame', body: '12px corners and a 1px line, no shadow, at every size.' },
  { tag: '4 · C', title: 'Controls together', body: 'Arrows on the image, tabs under it, no “1 / 3”. Dim slides that aren’t current.' },
  { tag: '5 · Type and colour', title: 'Twelve styles to nine', body: 'Wordmark 16, quote on a 32 line, footer 14, real SpaceX logo, avatar from the tokens. Prune the file’s tokens.' },
]

function Badge({ v, children }: { v: Verdict; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium" style={{ borderColor: COLOUR[v], color: COLOUR[v] }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLOUR[v] }} />
      {children}
    </span>
  )
}

function Dot({ v, n }: { v: Verdict; n: number }) {
  return <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white" style={{ background: COLOUR[v] }}>{n}</span>
}

function Section({ id, title, intro, stats, children }: { id: string; title: string; intro: string; stats?: { n: string; label: string; colour?: string }[]; children: React.ReactNode }) {
  return (
    <section id={id} className="border-t border-border px-20 py-16">
      <div className="mb-8 flex items-end justify-between gap-8">
        <div>
          <h2 className="text-4xl font-medium tracking-tight text-foreground">{title}</h2>
          <p className="mt-2 text-muted">{intro}</p>
        </div>
        {stats && (
          <div className="flex gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-right">
                <p className="text-4xl font-medium" style={{ color: s.colour ?? '#0A0A0A' }}>{s.n}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      {children}
    </section>
  )
}

export default function ReviewPage() {
  if (process.env.NODE_ENV !== 'development') notFound()
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[1440px] pt-14">
        <section className="px-20 pb-12 pt-24">
          <p className="text-xs font-medium uppercase tracking-widest text-muted">Design review · 20 Oct 2026</p>
          <h1 className="mt-4 text-[56px] font-medium leading-[60px] tracking-[-0.03em] text-foreground">Fonts, colours, consistency</h1>
          <p className="mt-4 max-w-[860px] text-lg text-muted">The homepage frames in Paper, against the 13 graphic design principles, with every font and colour they use. A: v2 with panels · B: no panel lines · C: carousels · D: your carousel edit.</p>
          <div className="mt-12 flex max-w-[1100px] gap-6">
            <div className="w-1 shrink-0 bg-foreground" />
            <p className="text-2xl font-medium leading-8 tracking-tight text-foreground">The type and colour are already tight: one family, two weights, five colours. What’s loose is structure: the header and content don’t share an edge, images are framed two ways, and captions sit above the image in one place and below it in the next. B is the calmest; C has the best ideas but says things twice.</p>
          </div>
        </section>

        <Section id="fonts" title="Fonts" intro="Geist only. Two weights: Regular 400 and Medium 500. Twelve text styles." stats={[{ n: '1', label: 'family' }, { n: '2', label: 'weights' }, { n: '12', label: 'text styles' }, { n: '5', label: 'to fix', colour: '#B45309' }]}>
          <div className="flex border-b border-foreground py-3 text-xs font-medium uppercase tracking-widest text-muted">
            <span className="w-[700px]">Specimen</span><span className="w-[220px]">Size / line · weight</span><span className="w-[200px]">Used for</span><span>Verdict</span>
          </div>
          {STYLES.map((s) => (
            <div key={s.use} className="flex items-center border-b border-border py-5">
              <span className="w-[700px] overflow-hidden whitespace-nowrap pr-6 text-foreground" style={s.css}>{s.sample}</span>
              <span className="w-[220px] text-sm tabular-nums text-foreground">{s.spec}</span>
              <span className="w-[200px] pr-4 text-sm text-muted">{s.use}</span>
              <span className="flex w-[160px] flex-col items-start gap-1.5"><Badge v={s.verdict}>{s.label}</Badge>{s.note && <span className="text-xs text-muted">{s.note}</span>}</span>
            </div>
          ))}
        </Section>

        <Section id="colours" title="Colours" intro="Five colours from the site’s tokens, plus one that isn’t. Amber appears once: the highlighter." stats={[{ n: '5', label: 'tokens used' }, { n: '1', label: 'off-token', colour: '#B91C1C' }, { n: '51', label: 'unused tokens', colour: '#B45309' }]}>
          <div className="flex gap-4">
            {SWATCHES.map((s) => (
              <div key={s.name} className="w-[200px]">
                <div className="relative h-[140px] rounded-xl border border-border" style={{ background: s.fill }}>
                  {s.off && <span className="absolute right-2.5 top-2.5 rounded-full bg-white px-2.5 py-0.5 text-xs font-medium" style={{ color: COLOUR.fail }}>● Off-token</span>}
                </div>
                <p className="mt-3 font-medium text-foreground">{s.name}</p>
                <p className="text-sm text-foreground">{s.value} · {s.token}</p>
                <p className="text-sm text-muted">{s.use}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-start gap-4 rounded-xl border border-border px-6 py-5">
            <Badge v="warn">File tokens</Badge>
            <p className="text-sm text-foreground">The Paper file still holds the old theme: dark and warm colours, 16 accents (light and dark), Inter as --font-sans, and 18, 20, 30, 48 and 60px sizes. 51 of 56 colour tokens go unused. Prune it to the five colours and the six sizes so new frames start from the simple set.</p>
          </div>
        </Section>

        <section id="inconsistencies" className="border-t border-border pt-16">
          <div className="px-20 pb-4">
            <h2 className="text-4xl font-medium tracking-tight text-foreground">Where it’s inconsistent</h2>
            <p className="mt-2 text-muted">Pinned on copies of the frames at full size. Red: fix. Amber: tidy. Green: works.</p>
          </div>
          {EXCERPTS.map((e) => (
            <div key={e.title} className="pb-12">
              <p className="px-20 pb-4 pt-6"><span className="font-medium text-foreground">{e.title}</span> <span className="text-sm text-muted">· {e.variant}</span></p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={e.src} alt={e.title} width={e.w / 2} height={e.h / 2} className="block h-auto w-full border-y border-border" />
              <div className="flex gap-6 px-20 pt-5">
                {e.notes.map((n) => (
                  <div key={n.n} className="flex flex-1 gap-2.5"><Dot v={n.v} n={n.n} /><p className="text-sm text-foreground">{n.text}</p></div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <Section id="principles" title="The 13 principles" intro="From Figma’s graphic design principles. A verdict per variant, one observation, one fix.">
          <div className="flex border-b border-foreground py-3 text-xs font-medium uppercase tracking-widest text-muted">
            <span className="w-[220px]">Principle</span><span className="w-[175px]">A · Panels</span><span className="w-[175px]">B · No lines</span><span className="w-[175px]">C · Carousels</span><span className="w-[175px]">D · Your edit</span><span>Fix</span>
          </div>
          {PRINCIPLES.map((p, i) => (
            <div key={p.name} className="flex border-b border-border py-4">
              <div className="flex w-[220px] gap-2.5 pr-4">
                <span className="w-6 text-sm tabular-nums text-muted">{i + 1}</span>
                <div><p className="font-medium text-foreground">{p.name}</p><p className="text-xs text-muted">{p.def}</p></div>
              </div>
              {p.cells.map((c, j) => (
                <div key={j} className="w-[175px] pr-4">
                  <p className="flex items-center gap-1.5 text-xs font-medium" style={{ color: COLOUR[c.v] }}><span className="h-2 w-2 rounded-full" style={{ background: COLOUR[c.v] }} />{WORD[c.v]}</p>
                  <p className="mt-1.5 text-[13px] leading-[18px] text-foreground">{c.note}</p>
                </div>
              ))}
              <p className="w-[360px] text-[13px] leading-[18px] text-foreground">{p.fix}</p>
            </div>
          ))}
        </Section>

        <Section id="fix-first" title="Fix first" intro="In order. The first three apply to every variant.">
          {/* Room below, so a walkthrough can bring this to the top */}
          <div className="flex gap-6 pb-[50vh]">
            {FIXES.map((f) => (
              <div key={f.title} className="flex-1 border-t-2 border-foreground pt-4">
                <p className="text-xs font-medium uppercase tracking-widest text-muted">{f.tag}</p>
                <p className="mt-3 text-2xl font-medium tracking-tight text-foreground">{f.title}</p>
                <p className="mt-3 text-sm text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </Section>
      </main>
    </div>
  )
}
