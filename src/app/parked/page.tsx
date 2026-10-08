'use client'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import { Header } from '@/components/Header'
import { PARKED, PARKED_LIVE, PARKED_STATUS, type ParkedStatus } from '@/content/parked'

const STATUSES = Object.keys(PARKED_STATUS) as ParkedStatus[]
const row = 'grid grid-cols-[5rem_minmax(0,1fr)] gap-4 py-2.5 border-t border-border text-sm'

const day = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })

// Everything that is merged but not on the public site. Content is src/content/parked.ts.
export default function ParkedPage() {
  if (!PARKED_LIVE) notFound()

  return (
    <div className="min-h-screen bg-background transition-colors duration-700">
      <Header />

      <main className="max-w-4xl mx-auto px-6 pt-14 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-14">
          <h1 className="text-5xl font-medium text-foreground mb-5">Parked</h1>
          <p className="text-xl text-muted leading-relaxed max-w-2xl">
            Work that is merged but not on the public site. This page only exists on the dev server. The list
            is <code className="text-base text-foreground">src/content/parked.ts</code>.
          </p>

          <div className="mt-8 border-b border-border">
            {STATUSES.map((status) => (
              <div key={status} className="grid grid-cols-[2rem_8rem_minmax(0,1fr)] gap-4 py-2.5 border-t border-border text-sm">
                <span className="font-mono text-accent tabular-nums">{PARKED.filter((p) => p.status === status).length}</span>
                <span className="text-foreground">{PARKED_STATUS[status].label}</span>
                <span className="text-muted">{PARKED_STATUS[status].meaning}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {PARKED.map((item) => (
          <section key={item.id} id={item.id} className="scroll-mt-14 py-12 border-t border-border">
            <p className="text-xs text-muted uppercase tracking-widest mb-4">
              <span className="text-accent mr-2">{PARKED_STATUS[item.status].label}</span>
              since {day(item.since)}
            </p>
            <h2 className="text-3xl font-medium text-foreground mb-4">{item.name}</h2>
            <p className="text-lg text-muted leading-relaxed max-w-2xl">{item.summary}</p>

            <div className="mt-8 border-b border-border">
              <div className={row}>
                <span className="text-muted">Open</span>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                  {item.links.map(({ label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      className="text-foreground underline decoration-border decoration-2 underline-offset-4 hover:decoration-accent transition-colors"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className={row}>
                <span className="text-muted">Switch</span>
                <span className="text-foreground">{item.gate}</span>
              </div>
              <div className={row}>
                <span className="text-muted">To do</span>
                <ul className="flex flex-col gap-1.5 text-foreground">
                  {item.todo.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
