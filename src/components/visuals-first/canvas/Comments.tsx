'use client'

import { forwardRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, X } from 'lucide-react'
import { Facehash, stringHash } from 'facehash'
import { CompanyLogo } from '@/components/CompanyLogo'
import type { Testimonial } from '@/content/testimonials'
import { Highlighted } from '../shared'
import type { Pin } from './layout'
import { WORLD } from './layout'

// Colleagues' words as comments on the canvas: a pin on the screen they worked on, a preview
// with the line that carries it, and the whole note, its best phrases in full ink, when opened.

const AVATAR = ['#d97706', '#ea580c', '#dc2626', '#e11d48', '#db2777', '#c026d3', '#9333ea', '#7c3aed', '#4f46e5', '#2563eb', '#0891b2', '#0d9488', '#059669', '#16a34a', '#65a30d', '#ca8a04']
// Each colleague a colour of their own, so five pins never read as one
const PIN_COLOURS: Record<string, string> = {
  'Winnie Bamra': '#f59e0b',
  'Richard Simms': '#22c55e',
  'Ahmed Hakeem': '#0ea5e9',
  'David Deville': '#f43f5e',
  'Henry Vesander': '#a855f7',
}
export const avatarColour = (name: string) => PIN_COLOURS[name] ?? AVATAR[stringHash(name) % AVATAR.length]

export const POPOVER = {
  background: 'color-mix(in srgb, var(--foreground) 5%, var(--background))',
  boxShadow: '0 0 0 1px color-mix(in srgb, var(--foreground) 11%, transparent), 0 16px 40px -12px rgba(0,0,0,0.45), 0 4px 12px -4px rgba(0,0,0,0.2)',
} as const

export function Avatar({ t, size }: { t: Testimonial; size: number }) {
  return (
    <Facehash
      name={t.name}
      size={size}
      showInitial
      enableBlink
      interactive={false}
      intensity3d="subtle"
      style={{ backgroundColor: `color-mix(in srgb, ${avatarColour(t.name)} 60%, var(--background))`, borderRadius: 9999 }}
    />
  )
}

export function Quote({ t }: { t: Testimonial }) {
  return (
    <p className="text-[13px] leading-relaxed text-muted">
      <Highlighted t={t} mark={(text) => <span className="font-medium text-foreground">{text}</span>} />
    </p>
  )
}

export function Who({ t, size = 32 }: { t: Testimonial; size?: number }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <span className="shrink-0"><Avatar t={t} size={size} /></span>
      <div className="min-w-0">
        {t.linkedIn ? (
          <a href={t.linkedIn} target="_blank" rel="noopener noreferrer" className="group/l inline-flex items-center gap-1 text-[13px] font-medium text-foreground hover:text-accent transition-colors">
            {t.name}
            <ArrowUpRight className="h-3 w-3 text-muted group-hover/l:text-accent transition-colors" />
          </a>
        ) : (
          <p className="text-[13px] font-medium text-foreground">{t.name}</p>
        )}
        <p className="truncate text-[11px] text-muted">{t.role} · {t.company}</p>
      </div>
    </div>
  )
}

const where = (p: Pin) => `${WORLD.frames[p.board.frame].name} · ${p.board.screen.title}`

export type Side = { h: 'left' | 'right'; v: 'down' | 'up' }

// One pin. The wrapper is placed by the canvas every frame; its origin is the pinned corner.
export const CommentPin = forwardRef<HTMLDivElement, {
  pin: Pin; index: number; shown: boolean; reduced: boolean
  state: 'closed' | 'preview' | 'open'; side: Side; docked: boolean
  onPin: () => void; onExpand: () => void; onClose: () => void; onHover?: (on: boolean) => void
}>(function CommentPin({ pin, shown, reduced, state, side, docked, onPin, onExpand, onClose, onHover }, ref) {
  const { t } = pin
  const ring = avatarColour(t.name)
  const bubble: React.CSSProperties = {
    position: 'absolute',
    ...(side.h === 'right' ? { left: 46 } : { right: 8 }),
    ...(side.v === 'down' ? { top: -38 } : { bottom: 0 }),
    transformOrigin: `${side.h === 'right' ? 'left' : 'right'} ${side.v === 'down' ? 'top' : 'bottom'}`,
    ...POPOVER,
  }
  return (
    <div ref={ref} className="absolute left-0 top-0 h-0 w-0" style={{ zIndex: state === 'open' ? 30 : state === 'preview' ? 20 : 10, visibility: shown ? 'visible' : 'hidden' }}>
      <motion.button
        type="button"
        data-ui
        onClick={onPin}
        aria-label={`Comment from ${t.name}`}
        aria-expanded={state === 'open'}
        className="absolute bottom-0 left-0 block h-9 w-9 p-[3px] outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={{ borderRadius: '18px 18px 18px 4px', background: ring, boxShadow: '0 6px 16px -4px rgba(0,0,0,0.45), 0 0 0 1.5px color-mix(in srgb, var(--background) 80%, transparent)', transformOrigin: '0% 100%' }}
        initial={false}
        animate={shown ? { opacity: 1, y: 0, scale: state === 'open' ? 1.12 : 1 } : { opacity: 0, y: -28, scale: 0.4 }}
        whileHover={{ scale: 1.1 }}
        transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 22, mass: 0.9, delay: shown && state === 'closed' ? 0 : 0 }}
      >
        <span className="block overflow-hidden rounded-full"><Avatar t={t} size={30} /></span>
      </motion.button>

      <AnimatePresence>
        {state === 'preview' && (
          <motion.button
            key="preview"
            type="button"
            data-ui
            onClick={onExpand}
            onPointerEnter={() => onHover?.(true)}
            onPointerLeave={() => onHover?.(false)}
            className="w-[248px] rounded-xl p-3 text-left"
            style={bubble}
            initial={{ opacity: 0, scale: 0.92, y: side.v === 'down' ? -4 : 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          >
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="font-medium text-foreground">{t.name}</span>
              <span className="truncate text-muted">{t.company}</span>
            </span>
            <span className="mt-1 block text-[13px] leading-snug text-foreground text-pretty">&ldquo;{t.pull}&rdquo;</span>
            <span className="mt-2 flex items-center gap-1 text-[11px] text-muted">Read the whole note <ArrowRight className="h-3 w-3" /></span>
          </motion.button>
        )}
        {state === 'open' && !docked && (
          <motion.div
            key="open"
            data-ui
            role="dialog"
            aria-label={`${t.name}'s comment`}
            className="w-[340px] rounded-xl"
            style={bubble}
            initial={{ opacity: 0, scale: 0.94, y: side.v === 'down' ? -6 : 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          >
            <Card pin={pin} onClose={onClose} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

export function Card({ pin, onClose }: { pin: Pin; onClose: () => void }) {
  const { t } = pin
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <Who t={t} />
        <div className="flex items-center gap-3 pt-1">
          {t.logo && <CompanyLogo id={t.logo} className="text-muted opacity-80" />}
          <button type="button" onClick={onClose} aria-label="Close comment" className="-m-1 rounded-md p-1 text-muted hover:text-foreground transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="mt-3"><Quote t={t} /></div>
      <p className="mt-3 truncate border-t pt-2.5 text-[11px] text-muted" style={{ borderColor: 'color-mix(in srgb, var(--foreground) 9%, transparent)' }}>
        On {where(pin)}
      </p>
    </div>
  )
}

// Every comment in a list, as Figma keeps them in its sidebar
export function CommentList({ open, active, onPick, onClose }: { open: boolean; active: number | null; onPick: (i: number) => void; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          data-ui
          aria-label="Comments"
          className="absolute bottom-3 right-3 top-[60px] z-40 flex w-[min(340px,calc(100%-24px))] flex-col overflow-hidden rounded-xl"
          style={POPOVER}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'color-mix(in srgb, var(--foreground) 9%, transparent)' }}>
            <p className="text-[13px] font-medium text-foreground">Comments <span className="ml-1 font-mono text-[11px] text-muted">{WORLD.pins.length}</span></p>
            <button type="button" onClick={onClose} aria-label="Close comments" className="-m-1 rounded-md p-1 text-muted hover:text-foreground transition-colors"><X className="h-4 w-4" /></button>
          </div>
          <ul className="flex-1 overflow-y-auto overscroll-contain">
            {WORLD.pins.map((p, i) => (
              <li key={p.t.name}>
                <button
                  type="button"
                  onClick={() => onPick(i)}
                  className="w-full px-4 py-3.5 text-left transition-colors border-b"
                  style={{ borderColor: 'color-mix(in srgb, var(--foreground) 6%, transparent)', background: active === i ? 'color-mix(in srgb, var(--foreground) 6%, transparent)' : undefined }}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="shrink-0"><Avatar t={p.t} size={24} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium text-foreground">{p.t.name}</span>
                      <span className="block truncate text-[11px] text-muted">{p.t.role} · {p.t.company}</span>
                    </span>
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: avatarColour(p.t.name) }} />
                  </span>
                  <span className="mt-2 block text-[13px] leading-snug text-foreground">&ldquo;{p.t.pull}&rdquo;</span>
                  <span className="mt-1.5 block truncate text-[11px] text-muted">On {where(p)}</span>
                </button>
              </li>
            ))}
          </ul>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
