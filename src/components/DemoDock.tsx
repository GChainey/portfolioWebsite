'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface DockItem {
  id: string
  label: string
}

// A floating dock that follows the page: one stop per demo, the one on screen lit up.
// Each item scrolls to the section with the matching id.
export function DemoDock({ items }: { items: DockItem[] }) {
  const [active, setActive] = useState(items[0]?.id)

  useEffect(() => {
    // The active demo is whichever one is crossing the middle of the screen
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting)
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: '-50% 0px -50% 0px' }
    )
    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [items])

  return (
    <motion.nav
      aria-label="Demos"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="fixed bottom-5 inset-x-0 z-30 px-3 flex justify-center pointer-events-none"
    >
      <ol className="pointer-events-auto max-w-full flex items-center gap-1 p-1 rounded-full border border-border bg-background/95 backdrop-blur-md shadow-xl overflow-x-auto">
        {items.map(({ id, label }, i) => (
          <li key={id} className="shrink-0">
            <a
              href={`#${id}`}
              aria-current={id === active ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
              }}
              className={`relative flex items-center gap-2 h-9 px-3 rounded-full text-sm transition-colors ${
                id === active ? 'text-background' : 'text-muted hover:text-foreground'
              }`}
            >
              {id === active && (
                <motion.span
                  layoutId="demo-dock-active"
                  className="absolute inset-0 rounded-full bg-foreground"
                  transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                />
              )}
              <span className="relative font-mono text-xs tabular-nums opacity-70">{String(i + 1).padStart(2, '0')}</span>
              <span className={`relative ${id === active ? '' : 'hidden sm:inline'}`}>{label}</span>
            </a>
          </li>
        ))}
      </ol>
    </motion.nav>
  )
}
