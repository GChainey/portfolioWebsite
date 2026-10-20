'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Facehash } from 'facehash'
import { ChatInterface, type PageContext } from './ChatInterface'

// The chat as a popup in the corner, like Intercom: a face to tap, and a window that opens over
// the page instead of a sidebar that takes space from it. Escape closes it.
export function ChatPopup({ pageContext, defaultOpen = false }: { pageContext: PageContext; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Chat with Gareth's AI"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ transformOrigin: 'bottom right' }}
            className="fixed bottom-24 right-6 z-50 flex h-[min(640px,calc(100vh-136px))] w-[min(400px,calc(100vw-48px))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-muted transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <ChatInterface pageContext={pageContext} />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Chat with Gareth’s AI'}
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg transition-transform hover:scale-110"
      >
        <Facehash name="GarethLLM" size={48} showInitial enableBlink interactive={false} intensity3d="subtle" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 60%, var(--background))', borderRadius: '9999px' }} />
      </button>
    </>
  )
}
