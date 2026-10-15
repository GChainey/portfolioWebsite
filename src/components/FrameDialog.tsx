'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowUpRight } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

interface FrameDialogProps {
  // null keeps it closed
  src: string | null
  title: string
  onClose: () => void
  // The window the prototype is drawn for, before it is scaled to fit the screen
  width?: number
  height?: number
  // A line under the frame on how to use it
  hint?: string
  // The prototype draws its own window (the Finder): no frame around it, and the page shows
  // through around its edges
  bare?: boolean
}

// A live HTML prototype in a dialog, scaled down to fit the screen. It takes the keyboard
// and the scroll wheel while it is open.
export function FrameDialog({ src, title, onClose, width = 1440, height = 900, hint, bare }: FrameDialogProps) {
  const { resolvedMode } = useTheme()
  const [scale, setScale] = useState(1)
  const [mounted, setMounted] = useState(false)
  const isOpen = src !== null

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!isOpen) return
    const fit = () => setScale(Math.min(1, (window.innerWidth - 32) / width, (window.innerHeight - 104) / height))
    fit()
    window.addEventListener('resize', fit)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('resize', fit)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose, width, height])

  if (!mounted) return null
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className={`relative ${bare ? '' : 'overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/10'}`}
            style={{ width: width * scale, height: height * scale }}
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          >
            <iframe
              src={src}
              title={title}
              className="absolute top-0 left-0 border-0 origin-top-left"
              // A bare frame matches the page's colour scheme so it stays see-through around the window
              style={{ width, height, transform: `scale(${scale})`, colorScheme: bare ? resolvedMode : 'light' }}
              // Takes the keyboard straight away, so keys and the scroll wheel reach the prototype
              onLoad={(e) => e.currentTarget.contentWindow?.focus()}
            />
          </motion.div>
          <div className="relative mt-3 flex items-center gap-4 text-sm text-muted">
            {hint && <span className="hidden sm:inline">{hint}</span>}
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="group hidden sm:inline-flex items-center gap-1 hover:text-accent transition-colors"
            >
              Full screen
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-foreground hover:border-accent hover:text-accent transition-colors"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
