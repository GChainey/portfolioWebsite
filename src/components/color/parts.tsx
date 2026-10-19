'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

// Pieces every chapter's exercise is built from

export function Step({ n, title, quote, children }: { n: number; title: string; quote?: string; children: ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="border-t border-border pt-10">
      <p className="mb-2 text-xs uppercase tracking-widest text-muted">Step {n}</p>
      <h2 className="mb-4 text-3xl font-medium text-foreground">{title}</h2>
      {quote && <blockquote className="mb-6 max-w-2xl font-serif text-lg italic leading-relaxed text-muted">{quote}</blockquote>}
      {children}
    </motion.section>
  )
}

export function Swatch({ hex, label }: { hex: string; label: string }) {
  return (
    <figure>
      <div className="h-40 w-40 rounded-sm border border-border" style={{ background: hex }} />
      <figcaption className="mt-2 text-sm text-muted">{label}</figcaption>
    </figure>
  )
}

export function Next({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-8 rounded border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-foreground"
    >
      {children}
    </button>
  )
}
