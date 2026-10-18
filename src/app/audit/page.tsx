import { notFound } from 'next/navigation'
import colors from 'tailwindcss/colors'
import { Header } from '@/components/Header'
import { audit } from '@/lib/design-audit'

// Design audit: the fonts, type sizes, colours and corners the site uses, counted from src each
// time the page loads, beside a simpler set to move to. Dev server only.

export const dynamic = 'force-dynamic'

const SIZE_PX: Record<string, number> = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48, '6xl': 60, '7xl': 72 }
const WEIGHT: Record<string, number> = { thin: 100, light: 300, normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 }
const RADIUS: Record<string, string> = { rounded: '4px', 'rounded-none': '0', 'rounded-sm': '2px', 'rounded-md': '6px', 'rounded-lg': '8px', 'rounded-xl': '12px', 'rounded-2xl': '16px', 'rounded-3xl': '24px', 'rounded-full': '9999px' }
const TOKENS: Record<string, string> = { foreground: 'var(--foreground)', muted: 'var(--muted)', accent: 'var(--accent)', background: 'var(--background)', primary: 'var(--primary)', white: '#ffffff', black: '#000000' }

// The colour a text-* class draws
function colourOf(cls: string): string {
  const name = cls.replace(/^text-/, '')
  if (TOKENS[name]) return TOKENS[name]
  const arb = name.match(/^\[(#[0-9a-fA-F]+)\]$/)
  if (arb) return arb[1]
  const [family, shade] = name.split('-')
  const fam = (colors as unknown as Record<string, Record<string, string>>)[family]
  return fam?.[shade] ?? 'transparent'
}

// Where each size shows up on the homepage
const HOMEPAGE_USE: Record<string, string> = {
  'text-5xl': 'Hero and section headings (same size)',
  'text-4xl': 'Hero and section headings on small screens',
  'text-3xl': 'Piece titles and quotes (same size)',
  'text-2xl': 'Impact numbers, quotes on small screens',
  'text-lg': 'Open piece title',
  'text-sm': 'Links, meta',
  'text-xs': 'Labels, counters',
}

const PROPOSED_TYPE = [
  { name: 'Display', px: 56, weight: 500, tracking: '-0.03em', use: 'The hero only' },
  { name: 'Heading', px: 36, weight: 500, tracking: '-0.02em', use: 'Section headings' },
  { name: 'Title', px: 24, weight: 500, tracking: '-0.01em', use: 'Piece titles; quotes, in muted' },
  { name: 'Body', px: 16, weight: 400, tracking: '0', use: 'Summaries, the essays list' },
  { name: 'Small', px: 14, weight: 400, tracking: '0', use: 'Links, captions, meta' },
  { name: 'Label', px: 12, weight: 500, tracking: '0.08em', use: 'Eyebrows, counters', caps: true },
]

const PROPOSED_COLOURS = [
  { name: 'Background', value: '#ffffff' },
  { name: 'Text', value: '#0a0a0a' },
  { name: 'Muted text', value: '#737373' },
  { name: 'Border', value: '#e5e5e5' },
  { name: 'Accent', value: '#d97706' },
  { name: 'Accent light', value: '#fef3c7', note: 'Highlighter marks' },
]

function Section({ title, now, children }: { title: string; now: string; children: React.ReactNode }) {
  return (
    <section className="px-8 py-16">
      <h2 className="text-3xl font-medium tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 max-w-2xl text-muted">{now}</p>
      <div className="mt-10">{children}</div>
    </section>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted">{children}</p>
}

function Count({ n }: { n: number }) {
  return <span className="shrink-0 text-sm text-muted tabular-nums">×{n}</span>
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border p-6 ${className}`}>{children}</div>
}

export default function AuditPage() {
  if (process.env.NODE_ENV !== 'development') notFound()
  const { all, live, files, cssLines } = audit()
  const sizes = all.size.filter(([c]) => SIZE_PX[c.replace('text-', '')]).sort((a, b) => SIZE_PX[b[0].replace('text-', '')] - SIZE_PX[a[0].replace('text-', '')])
  const maxSize = Math.max(...sizes.map(([, n]) => n))
  const hexes = all.hex.slice(0, 40)
  const greys = all.textColour.filter(([c]) => /zinc|neutral|gray|white|black|foreground|muted/.test(c))
  const noOps = all.noOpOpacity

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto pt-14">
        <main>
          <section className="px-8 pt-20 pb-8">
            <p className="text-xs font-medium uppercase tracking-widest text-muted">Dev only · counted from src just now</p>
            <h1 className="mt-3 text-5xl font-medium tracking-tight text-foreground">Design audit</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted">
              What the site uses today across {files.all} files ({files.live} of them on the live pages), and a simpler set to move to.
              Each section shows what&apos;s there now, then the proposal.
            </p>
          </section>

          {/* Fonts */}
          <Section title="Fonts" now="Three families load on every page. Caveat is only for the signature experiment, which is off.">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { name: 'Inter', css: 'var(--font-inter)', use: 'Everything', n: (all.family.find(([c]) => c === 'font-sans')?.[1] ?? 0), keep: true },
                { name: 'JetBrains Mono', css: 'var(--font-mono)', use: 'Section numbers, counters, code', n: all.family.find(([c]) => c === 'font-mono')?.[1] ?? 0 },
                { name: 'Caveat', css: 'var(--font-signature)', use: 'The signature experiment (flag off)', n: 1 },
              ].map((f) => (
                <Card key={f.name} className={f.keep ? '' : 'opacity-60'}>
                  <p className="text-5xl text-foreground" style={{ fontFamily: f.css }}>Aa 0123</p>
                  <p className="mt-6 font-medium text-foreground">{f.name}</p>
                  <p className="text-sm text-muted">{f.use}{f.name !== 'Inter' && ` · ${f.n} uses`}</p>
                  <p className={`mt-3 text-sm ${f.keep ? 'text-foreground' : 'text-muted'}`}>{f.keep ? 'Keep' : 'Drop'}</p>
                </Card>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted">Proposal: Inter only. Numbers in Inter with tabular figures, so they still line up.</p>
          </Section>

          {/* Type sizes */}
          <Section title="Type sizes" now={`${sizes.length} sizes, plus ${all.arbitrarySize.length} one-off pixel sizes in the reel captions. On the homepage the section headings are the hero's size, and the quotes are the piece titles' size.`}>
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <Label>Now</Label>
                <div className="space-y-5">
                  {sizes.map(([cls, n]) => {
                    const px = SIZE_PX[cls.replace('text-', '')]
                    return (
                      <div key={cls}>
                        <div className="flex items-baseline justify-between gap-4">
                          <p className="truncate font-medium text-foreground" style={{ fontSize: px, lineHeight: 1.15, letterSpacing: px > 24 ? '-0.02em' : undefined }}>Product designer</p>
                          <Count n={n} />
                        </div>
                        <div className="mt-1.5 flex items-center gap-3">
                          <div className="h-1 rounded-full bg-[color-mix(in_srgb,var(--accent)_60%,transparent)]" style={{ width: `${(n / maxSize) * 100}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-muted">{cls} · {px}px{HOMEPAGE_USE[cls] ? ` · ${HOMEPAGE_USE[cls]}` : ''}</p>
                      </div>
                    )
                  })}
                  {all.arbitrarySize.length > 0 && (
                    <p className="text-sm text-muted">One-offs: {all.arbitrarySize.map(([px, n]) => `${px}px ×${n}`).join(', ')}</p>
                  )}
                </div>
              </div>
              <div>
                <Label>Proposed: six steps, two weights</Label>
                <div className="space-y-6">
                  {PROPOSED_TYPE.map((t) => (
                    <div key={t.name} className="border-b border-border pb-5 last:border-b-0">
                      <p className="text-foreground" style={{ fontSize: t.px, fontWeight: t.weight, letterSpacing: t.tracking, lineHeight: 1.1, textTransform: t.caps ? 'uppercase' : undefined }}>
                        {t.caps ? 'Products I’ve made' : 'Product designer'}
                      </p>
                      <p className="mt-2 text-xs text-muted">{t.name} · {t.px}px · {t.weight === 500 ? 'Medium' : 'Regular'} · {t.use}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Weights, tracking, leading */}
          <Section title="Weight and spacing" now={`${all.weight.length} weights, ${all.tracking.length} letter-spacings and ${all.leading.length} line-heights, most of them one-offs.`}>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <Label>Weights</Label>
                <div className="space-y-3">
                  {all.weight.map(([cls, n]) => (
                    <div key={cls} className="flex items-baseline justify-between gap-4">
                      <span className="text-xl text-foreground" style={{ fontWeight: WEIGHT[cls.replace('font-', '')] }}>{cls.replace('font-', '')}</span>
                      <Count n={n} />
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-sm text-muted">Proposal: regular and medium.</p>
              </Card>
              <Card>
                <Label>Letter-spacing</Label>
                <div className="flex flex-wrap gap-2">
                  {all.tracking.map(([cls, n]) => (
                    <span key={cls} className="rounded-full border border-border px-3 py-1 text-sm text-foreground">{cls.replace('tracking-', '')} <span className="text-muted">×{n}</span></span>
                  ))}
                </div>
                <p className="mt-5 text-sm text-muted">Proposal: tight on headings, wide on labels, nothing else.</p>
              </Card>
              <Card>
                <Label>Line-height</Label>
                <div className="flex flex-wrap gap-2">
                  {all.leading.map(([cls, n]) => (
                    <span key={cls} className="rounded-full border border-border px-3 py-1 text-sm text-foreground">{cls.replace('leading-', '')} <span className="text-muted">×{n}</span></span>
                  ))}
                </div>
                <p className="mt-5 text-sm text-muted">Proposal: tight for headings, relaxed for body.</p>
              </Card>
            </div>
          </Section>

          {/* Colours */}
          <Section title="Colours" now={`${all.textColour.length} text colours and ${all.hex.length} different hex values. Two grey families sit side by side: the site's neutral greys and the reels' slightly blue zinc.`}>
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <Label>Text colours in use</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {all.textColour.map(([cls, n]) => (
                    <div key={cls} className="flex items-center gap-3 rounded-lg border border-border p-2">
                      <span className="h-8 w-8 shrink-0 rounded-md border border-border" style={{ background: colourOf(cls) }} />
                      <span className="min-w-0">
                        <span className="block truncate text-xs text-foreground">{cls.replace('text-', '')}</span>
                        <span className="block text-xs text-muted">×{n}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <Label>
                  <span className="mt-8 block">Greys, side by side</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {greys.map(([cls]) => (
                    <span key={cls} title={cls} className="h-10 w-10 rounded-md border border-border" style={{ background: colourOf(cls) }} />
                  ))}
                </div>
              </div>
              <div>
                <Label>The 40 most used hex values</Label>
                <div className="grid grid-cols-8 gap-1.5">
                  {hexes.map(([hex, n]) => (
                    <span key={hex} title={`${hex} ×${n}`} className="aspect-square rounded-md border border-border" style={{ background: hex }} />
                  ))}
                </div>
                <Label>
                  <span className="mt-8 block">Proposed: one palette</span>
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {PROPOSED_COLOURS.map((c) => (
                    <div key={c.name} className="rounded-lg border border-border p-2">
                      <span className="block h-14 rounded-md border border-border" style={{ background: c.value }} />
                      <p className="mt-2 text-xs text-foreground">{c.name}</p>
                      <p className="text-xs text-muted">{c.value}{c.note ? ` · ${c.note}` : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* The opacity bug */}
          <Section title="A bug: see-through backgrounds draw nothing" now={`Tailwind opacity on the site's colours (bg-border/50 and so on) produces no CSS, because the colours are var()s. ${noOps.reduce((t, [, n]) => t + n, 0)} places expect a tint and get nothing.`}>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <Label>What the code asks for: bg-border/50</Label>
                <div className="h-24 rounded-lg bg-border/50" />
                <p className="mt-3 text-sm text-muted">Renders nothing.</p>
              </Card>
              <Card>
                <Label>What it should be</Label>
                <div className="h-24 rounded-lg" style={{ background: 'color-mix(in srgb, var(--border) 50%, transparent)' }} />
                <p className="mt-3 text-sm text-muted">Fix: define the colours as rgb(var(--x) / &lt;alpha-value&gt;) once, and every /50 works.</p>
              </Card>
            </div>
            <p className="mt-4 text-sm text-muted">{noOps.map(([cls, n]) => `${cls} ×${n}`).join(' · ')}</p>
          </Section>

          {/* Radius */}
          <Section title="Corners" now={`${all.radius.length} corner radii.`}>
            <div className="flex flex-wrap gap-4">
              {all.radius.map(([cls, n]) => (
                <div key={cls} className="text-center">
                  <div className="h-20 w-28 border-2 border-foreground" style={{ borderRadius: RADIUS[cls] }} />
                  <p className="mt-2 text-xs text-foreground">{cls.replace('rounded-', '').replace('rounded', 'default')}</p>
                  <p className="text-xs text-muted">{RADIUS[cls]} ×{n}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted">Proposal: three. Full for pills and avatars, 12px for media frames, 6px for controls.</p>
          </Section>

          <section className="px-8 py-16">
            <p className="text-sm text-muted">Done already, with no visual change: the CSS for dark mode, the warm theme, the CRT effects and 15 unused accents is gone (globals.css is {cssLines} lines). The header tint is fixed.</p>
          </section>
        </main>
      </div>
    </div>
  )
}
