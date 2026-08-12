'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Tablet, Smartphone, Maximize2, Grid3x3 } from 'lucide-react'
import { Header } from '@/components/Header'
import { specimens } from './specimens'

const WIDTHS = [
  { id: 'full', label: 'Full', icon: Maximize2, width: '100%' },
  { id: 'desktop', label: 'Desktop', icon: Monitor, width: '1280px' },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: '768px' },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, width: '390px' },
] as const

type WidthId = (typeof WIDTHS)[number]['id']

export default function PlaygroundPage() {
  const [activeId, setActiveId] = useState(specimens[0]?.id ?? '')
  const [widthId, setWidthId] = useState<WidthId>('full')
  const [showBounds, setShowBounds] = useState(false)

  const active = specimens.find((s) => s.id === activeId)
  const stageWidth = WIDTHS.find((w) => w.id === widthId)!.width

  return (
    <div className="min-h-screen bg-background transition-colors duration-700">
      <Header showBack />

      <div className="max-w-7xl mx-auto pt-14">
        <main className="border-x border-border min-h-[calc(100vh-56px)]">
          {/* Title */}
          <section className="p-8 border-b border-border">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-xs text-muted uppercase tracking-widest mb-4">Sandbox</p>
              <h1 className="text-4xl font-medium text-foreground mb-4">Playground</h1>
              <p className="text-lg text-muted max-w-2xl">
                A staging area for components before they earn a place on the site. Add
                entries to{' '}
                <code className="text-sm text-foreground">src/app/playground/specimens.tsx</code>{' '}
                to try them here.
              </p>
            </motion.div>
          </section>

          {/* Controls */}
          <section className="px-8 py-4 border-b border-border flex flex-wrap items-center gap-x-6 gap-y-3">
            {specimens.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {specimens.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveId(s.id)}
                    className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                      s.id === activeId
                        ? 'border-accent text-accent'
                        : 'border-border text-muted hover:text-foreground'
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1 ml-auto">
              {WIDTHS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setWidthId(id)}
                  title={label}
                  aria-label={label}
                  aria-pressed={id === widthId}
                  className={`p-2 rounded border transition-colors ${
                    id === widthId
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
              <button
                onClick={() => setShowBounds((v) => !v)}
                title="Toggle bounds"
                aria-label="Toggle bounds"
                aria-pressed={showBounds}
                className={`p-2 rounded border transition-colors ml-2 ${
                  showBounds
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Stage */}
          {active ? (
            <>
              {active.description && (
                <p className="px-8 pt-6 text-sm text-muted max-w-2xl">{active.description}</p>
              )}
              <section className={active.fullBleed ? 'py-8' : 'p-8 flex justify-center'}>
                <div
                  key={active.id}
                  style={active.fullBleed ? undefined : { width: stageWidth, maxWidth: '100%' }}
                  className={showBounds ? 'outline outline-1 outline-dashed outline-accent' : ''}
                >
                  {active.render()}
                </div>
              </section>
            </>
          ) : (
            <section className="p-8">
              <div className="border border-dashed border-border rounded p-12 text-center">
                <p className="text-muted mb-2">Nothing to test yet.</p>
                <p className="text-sm text-muted">
                  Add a specimen to{' '}
                  <code className="text-foreground">src/app/playground/specimens.tsx</code> and it
                  will appear here.
                </p>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
