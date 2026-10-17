'use client'

import { CASE_STUDIES, PRODUCTS, type WorkItem } from '@/content/work'
import { TESTIMONIALS, type Testimonial } from '@/content/testimonials'
import { WorkLink, pad } from '@/components/showcase/shared'
import { colourOf } from '../shared'
import { Count } from '../mosaic/Work'
import { AppIcon, Callout, Reveal, Stage, Status, useReels } from './parts'

// The products, launched: one leads across the page and two sit under it, with a colleague's
// words between them. Then a band of kind words, then the three case studies in the same card
// language, a quote between the first two.

const line = 'var(--border)'
const quote = (name: string) => TESTIMONIALS.find((t) => t.name === name) as Testimonial
const tint = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, var(--background))`
function Label({ children, right }: { children: string; right?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-8 py-4 border-b border-border">
      <p className="text-xs text-muted uppercase tracking-widest">{children}</p>
      {right && <p className="hidden sm:block text-xs text-muted">{right}</p>}
    </div>
  )
}

function Cta({ item, solid = false }: { item: WorkItem; solid?: boolean }) {
  return solid ? (
    <WorkLink item={item} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition-[filter] hover:brightness-110" style={{ background: item.accent }} />
  ) : (
    <WorkLink item={item} className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80" style={{ color: item.accent }} />
  )
}

// Icon, kicker and name, Mac App Store style
function Identity({ item, size }: { item: WorkItem; size: number }) {
  return (
    <div className="flex items-center gap-4">
      <AppIcon item={item} size={size} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground" style={{ fontSize: size > 50 ? 18 : 16 }}>{item.name}</p>
          <Status item={item} />
        </div>
        <p className="text-xs text-muted mt-0.5">{item.kicker.replace(/^Product · /, '')}</p>
      </div>
    </div>
  )
}

// The lead product: the read on the left, its reel big on the right
function Lead({ item, reduced }: { item: WorkItem; reduced: boolean }) {
  const { hover } = useReels()
  return (
    <div className="grid lg:grid-cols-12" style={{ gap: 1, background: line }} onMouseEnter={() => hover(item.id)} onMouseLeave={() => hover(null)}>
      <Reveal className="lg:col-span-4 bg-background p-8 flex flex-col" reduced={reduced}>
        <Identity item={item} size={56} />
        <h3 className="mt-10 text-4xl font-medium tracking-tight text-foreground text-balance leading-[1.05]">{item.title}</h3>
        <p className="mt-4 text-muted leading-relaxed">{item.summary}</p>
        <ul className="mt-8 space-y-3">
          {item.features.map((f, i) => (
            <li key={f} className="flex gap-3 text-sm leading-relaxed text-foreground">
              <span className="mt-0.5 shrink-0 font-mono text-xs" style={{ color: item.accent }}>{pad(i + 1)}</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-10"><Cta item={item} solid /></div>
      </Reveal>
      <div className="lg:col-span-8 order-first lg:order-none bg-background p-4 sm:p-6 flex items-center" style={{ background: `radial-gradient(110% 80% at 60% 100%, ${tint(item.accent, 12)}, var(--background) 70%)` }}>
        <Stage item={item} />
      </div>
    </div>
  )
}

// A product beside the lead: icon and name, its reel, the line, its number
function Card({ item, reduced, delay }: { item: WorkItem; reduced: boolean; delay: number }) {
  const { hover } = useReels()
  const stat = item.stats?.[0]
  return (
    <Reveal className="bg-background p-6 sm:p-8 flex flex-col" onMouseEnter={() => hover(item.id)} onMouseLeave={() => hover(null)} reduced={reduced} delay={delay}>
      <Identity item={item} size={48} />
      <Stage item={item} className="mt-6" radius={10} glow={false} />
      <h3 className="mt-6 text-xl font-medium tracking-tight text-foreground text-balance">{item.title}</h3>
      <p className="mt-2 text-sm text-muted leading-relaxed">{item.summary}</p>
      <div className="mt-auto pt-8 flex items-end justify-between gap-4">
        {stat ? (
          <div>
            <Count value={stat.value} className="block text-3xl font-medium tracking-tight text-foreground leading-none" />
            <p className="mt-1.5 text-xs text-muted">{stat.label}</p>
          </div>
        ) : <span />}
        <Cta item={item} />
      </div>
    </Reveal>
  )
}

export function ProductsSection({ reduced }: { reduced: boolean }) {
  const [lead, ...rest] = PRODUCTS
  return (
    <section aria-label="Products" className="border-b border-border">
      <Label right="Built and shipped">Products</Label>
      <Lead item={lead} reduced={reduced} />
      <div className="grid lg:grid-cols-3" style={{ gap: 1, background: line, borderTop: `1px solid ${line}` }}>
        <Card item={rest[0]} reduced={reduced} delay={0} />
        <div className="bg-background p-4 sm:p-6 flex flex-col gap-4">
          <Callout t={quote('Richard Simms')} colour={rest[1].accent} font={24} reduced={reduced} className="flex-[1.35]" minHeight={260} anchor={{ x: 'left', y: 'top' }} />
          <Callout t={quote('Ahmed Hakeem')} colour={rest[0].accent} font={24} reduced={reduced} className="flex-1" minHeight={190} anchor={{ x: 'left', y: 'bottom' }} />
        </div>
        <Card item={rest[1]} reduced={reduced} delay={0.12} />
      </div>
    </section>
  )
}

// Three colleagues, between the products and the case studies
export function KindWords({ reduced }: { reduced: boolean }) {
  const band: [string, string][] = [['Winnie Bamra', colourOf('Shader Wall')], ['Henry Vesander', colourOf('Daisy Assess')]]
  return (
    <section aria-label="Kind words" className="border-b border-border">
      <Label right="From people I've worked with">Kind words</Label>
      <div className="grid md:grid-cols-2 gap-4 p-4 sm:p-6">
        {band.map(([name, colour], i) => (
          <Callout key={name} t={quote(name)} colour={colour} font={28} reduced={reduced} minHeight={220} anchor={{ x: i === 1 ? 'right' : 'left', y: 'top' }} popWidth={520} />
        ))}
      </div>
    </section>
  )
}

function Thinking({ item, className = '' }: { item: WorkItem; className?: string }) {
  return (
    <blockquote className={`border-l-2 pl-4 text-[15px] leading-relaxed text-foreground text-pretty ${className}`} style={{ borderColor: item.accent }}>
      {item.thinking}
    </blockquote>
  )
}

// A case study: its reel and thinking on one side, the read and its numbers on the other
function Case({ item, index, reduced }: { item: WorkItem; index: number; reduced: boolean }) {
  const { hover } = useReels()
  const [first, ...more] = item.stats ?? []
  const flip = index % 2 === 1
  return (
    <article className="grid lg:grid-cols-12 border-b border-border" style={{ gap: 1, background: line }} aria-labelledby={`pk-cs-${item.id}`} onMouseEnter={() => hover(item.id)} onMouseLeave={() => hover(null)}>
      <div className={`lg:col-span-7 bg-background p-4 sm:p-6 flex flex-col gap-6 justify-center ${flip ? 'lg:order-2' : ''}`} style={{ background: `radial-gradient(110% 80% at 50% 100%, ${tint(item.accent, 9)}, var(--background) 70%)` }}>
        <Stage item={item} />
        <Thinking item={item} className="hidden lg:block" />
      </div>
      <Reveal className={`lg:col-span-5 bg-background p-8 flex flex-col ${flip ? 'lg:order-1' : ''}`} reduced={reduced}>
        <p className="flex items-center gap-2 text-xs uppercase tracking-widest" style={{ color: item.accent }}>
          <span className="font-mono">{pad(index + 1)}</span>
          <span className="h-px w-6" style={{ background: item.accent }} />
          {item.kicker}
        </p>
        <h3 id={`pk-cs-${item.id}`} className="mt-5 text-3xl font-medium tracking-tight text-foreground text-balance leading-[1.1]">{item.title}</h3>
        <p className="mt-3 text-muted leading-relaxed">{item.summary}</p>
        {first && (
          <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-4">
            <div>
              <Count value={first.value} className={`block font-medium tracking-tighter text-foreground leading-none ${first.value.length > 5 ? 'text-4xl' : 'text-5xl'}`} />
              <p className="mt-2 text-xs text-muted max-w-[24ch]">{first.label}</p>
            </div>
            {more.map((s) => (
              <div key={s.label}>
                <Count value={s.value} className="block text-2xl font-medium tracking-tight text-foreground leading-none" />
                <p className="mt-2 text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        )}
        <ul className="mt-8 space-y-2.5">
          {item.features.map((f, i) => (
            <li key={f} className="flex gap-3 text-sm leading-relaxed text-foreground">
              <span className="mt-0.5 shrink-0 font-mono text-xs" style={{ color: item.accent }}>{pad(i + 1)}</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <Thinking item={item} className="lg:hidden mt-8" />
        <div className="mt-auto pt-8"><Cta item={item} solid /></div>
      </Reveal>
    </article>
  )
}

export function CaseStudies({ reduced }: { reduced: boolean }) {
  return (
    <section aria-label="Case studies" className="border-b border-border">
      <Label right="Three case studies in building with AI">The work that mattered most</Label>
      {CASE_STUDIES.map((w, i) => (
        <div key={w.id}>
          <Case item={w} index={i} reduced={reduced} />
          {i === 0 && (
            <div className="p-4 sm:p-6 border-b border-border">
              <Callout t={quote('David Deville')} colour={CASE_STUDIES[1].accent} font={30} reduced={reduced} minHeight={200} anchor={{ x: 'left', y: 'top' }} popWidth={520} />
            </div>
          )}
        </div>
      ))}
    </section>
  )
}

export const REEL_ORDER = [...PRODUCTS, ...CASE_STUDIES].map((w) => w.id)
