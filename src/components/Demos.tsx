'use client'

import { useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Header } from '@/components/Header'
import { ScaledFrame } from '@/components/ScaledFrame'
import { DemoDock } from '@/components/DemoDock'
import { IterationTimelapse } from '@/components/IterationTimelapse'
import { ROUNDS, TIMELAPSE_FRAMES } from '@/content/add-document-rounds'
import { DEMOS, DEMOS_LIVE, type Demo, type FrameDemo, type Selection } from '@/content/demos'

// Three takes on the same page, to compare side by side:
//   split   each demo is a bordered cell, text and controls on the left, prototype on the right
//   doc     one reading column like a written document: heading, paragraph, a table of
//           options, then the prototype as a figure
//   hybrid  heading and paragraph on the page like the document, then the options in a
//           column beside the prototype like the split. A demo with nothing to choose
//           has no column and runs the full width
export type DemosLayout = 'split' | 'doc' | 'hybrid'

const LAYOUTS: { id: DemosLayout; label: string; href: string }[] = [
  { id: 'split', label: 'Split', href: '/demos' },
  { id: 'doc', label: 'Document', href: '/demos/doc' },
  { id: 'hybrid', label: 'Hybrid', href: '/demos/hybrid' },
]

const dotted = {
  backgroundImage: 'radial-gradient(color-mix(in srgb, var(--foreground) 14%, transparent) 1px, transparent 1px)',
  backgroundSize: '16px 16px',
}

const INTRO =
  'How I build with AI, shown rather than described. Most of these are real prototypes running live, so the buttons do what they say.'

// Walk the axes in order, keeping each pick only while it is still on offer. A later axis can
// depend on an earlier one, so changing screen drops a failure the new screen can't have.
function resolve(demo: FrameDemo, picked: Selection) {
  const selection: Selection = {}
  const axes = demo.axes.map((axis) => {
    const options = typeof axis.options === 'function' ? axis.options(selection) : axis.options
    const want = picked[axis.key] ?? demo.initial?.[axis.key]
    selection[axis.key] = options.some((o) => o.id === want) ? want : options[0].id
    return { ...axis, options }
  })
  return { axes, selection }
}

function LayoutSwitch({ layout }: { layout: DemosLayout }) {
  return (
    <p className="text-xs text-muted mb-6 flex items-center gap-3">
      Layout
      {LAYOUTS.map(({ id, label, href }) => (
        <Link
          key={id}
          href={href}
          aria-current={id === layout ? 'page' : undefined}
          className={id === layout ? 'text-foreground underline decoration-accent decoration-2 underline-offset-4' : 'hover:text-foreground transition-colors'}
        >
          {label}
        </Link>
      ))}
    </p>
  )
}

function DemoSection({ demo, index, layout }: { demo: Demo; index: number; layout: DemosLayout }) {
  const [picked, setPicked] = useState<Selection>({})
  // Picking the option that's already on replays it from the start
  const [run, setRun] = useState(0)
  const frame = demo.kind === 'frame' ? { ...resolve(demo, picked), demo } : null
  const url = frame ? frame.demo.url(frame.selection) : ''
  const facts = frame ? frame.demo.facts : `${ROUNDS.length} rounds · ${TIMELAPSE_FRAMES.length} screenshots`
  const pick = (key: string, id: string) =>
    frame?.selection[key] === id ? setRun((r) => r + 1) : setPicked({ ...frame?.selection, [key]: id })

  const kicker = (
    <p className="text-xs text-muted uppercase tracking-widest mb-4">
      <span className="font-mono text-accent mr-2">{String(index + 1).padStart(2, '0')}</span>
      {demo.kicker}
    </p>
  )

  const stage = frame ? (
    <>
      <ScaledFrame src={url} title={demo.title} width={frame.demo.width} height={frame.demo.height} run={run} passive />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-3 flex items-center gap-2 text-xs text-muted hover:text-accent transition-colors"
      >
        <span className="font-mono truncate">{url.includes('?') ? `?${url.split('?')[1]}` : url}</span>
        <span className="ml-auto shrink-0 inline-flex items-center gap-1">
          Open full screen
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </span>
      </a>
    </>
  ) : (
    <IterationTimelapse className="bg-background" />
  )

  if (layout !== 'split') {
    // The options as rows of a plain table: the label, then the choices as words. Beside the
    // prototype the column is narrow, so the label sits above its choices instead.
    const beside = layout === 'hybrid'
    const row = `py-2.5 border-t border-border text-sm ${beside ? 'flex flex-col gap-1.5' : 'grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4'}`
    const options = (
      <div className="border-b border-border">
        {frame?.axes.map((axis) => (
          <div key={axis.key} role="group" aria-label={axis.label} className={row}>
            <span className="text-muted">{axis.label}</span>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              {axis.options.map((option) => {
                const on = frame.selection[axis.key] === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => pick(axis.key, option.id)}
                    className={
                      on
                        ? 'text-foreground underline decoration-accent decoration-2 underline-offset-4'
                        : 'text-muted hover:text-foreground transition-colors'
                    }
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        <div className={row}>
          <span className="text-muted">Scope</span>
          <span className="text-foreground">{facts}</span>
        </div>
      </div>
    )

    return (
      <section id={demo.id} className="scroll-mt-14 py-14 border-t border-border">
        {kicker}
        <h2 className="text-3xl font-medium text-foreground mb-4">{demo.title}</h2>
        <p className="text-lg text-muted leading-relaxed max-w-2xl">{demo.blurb}</p>

        {!beside ? (
          <>
            <div className="my-8">{options}</div>
            {stage}
          </>
        ) : frame ? (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[15rem_minmax(0,1fr)] gap-8 lg:gap-10 items-start">
            {options}
            <div>{stage}</div>
          </div>
        ) : (
          // Nothing to choose, so no column: the demo takes the full width
          <div className="mt-8">
            {stage}
            <p className="mt-3 font-mono text-xs text-muted">{facts}</p>
          </div>
        )}
      </section>
    )
  }

  return (
    <section id={demo.id} className="border-b border-border scroll-mt-14 grid grid-cols-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="p-8 flex flex-col gap-6"
      >
        <div>
          {kicker}
          <h2 className="text-2xl font-medium text-foreground mb-3">{demo.title}</h2>
          <p className="text-sm text-muted leading-relaxed">{demo.blurb}</p>
        </div>

        {frame?.axes.map((axis) => (
          <div key={axis.key} role="group" aria-label={axis.label}>
            <p className="text-xs text-muted mb-2">{axis.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {axis.options.map((option) => {
                const on = frame.selection[axis.key] === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => pick(axis.key, option.id)}
                    className={`h-8 px-3 rounded-full text-sm border transition-colors ${
                      on
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background text-muted border-border hover:text-foreground hover:border-foreground/30'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <p className="mt-auto font-mono text-xs text-muted">{facts}</p>
      </motion.div>

      <div className="p-3 sm:p-6 border-t lg:border-t-0 lg:border-l border-border" style={dotted}>
        {stage}
      </div>
    </section>
  )
}

export function Demos({ layout }: { layout: DemosLayout }) {
  if (!DEMOS_LIVE) notFound()

  const sections = DEMOS.map((demo, i) => <DemoSection key={demo.id} demo={demo} index={i} layout={layout} />)

  return (
    <div className="min-h-screen bg-background transition-colors duration-700">
      <Header />

      {layout !== 'split' ? (
        <main className={`${layout === 'doc' ? 'max-w-4xl' : 'max-w-6xl'} mx-auto px-6 pt-14 pb-28`}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-14">
            <LayoutSwitch layout={layout} />
            <h1 className="text-5xl font-medium text-foreground mb-5">Demos</h1>
            <p className="text-xl text-muted leading-relaxed max-w-2xl">{INTRO}</p>
          </motion.div>
          {sections}
        </main>
      ) : (
        <div className="max-w-7xl mx-auto pt-14">
          <main className="border-x border-border min-h-[calc(100vh-56px)] pb-24">
            {/* Title */}
            <section className="p-8 border-b border-border">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <LayoutSwitch layout={layout} />
                <h1 className="text-4xl font-medium text-foreground mb-4">Demos</h1>
                <p className="text-lg text-muted max-w-2xl">{INTRO}</p>
              </motion.div>
            </section>
            {sections}
          </main>
        </div>
      )}

      <DemoDock items={DEMOS.map(({ id, nav }) => ({ id, label: nav }))} />
    </div>
  )
}
