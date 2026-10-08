'use client'

import Link from 'next/link'
import { ThemeSelector } from '@/components/ThemeSelector'

interface VariantChromeProps {
  variant: 'show' | 'think'
  label: string
}

/** Minimal chrome for A/B variants — not the production header or nav. */
export function VariantChrome({ variant, label }: VariantChromeProps) {
  const sibling = variant === 'show' ? { href: '/variants/think', name: 'Think' } : { href: '/variants/show', name: 'Show' }

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/variants"
            className="shrink-0 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:border-accent hover:text-accent transition-colors"
          >
            Launch pad
          </Link>
          <span className="text-muted hidden sm:inline">/</span>
          <span className="text-sm text-muted truncate hidden sm:inline">{label} variant</span>
        </div>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href={sibling.href}
            className="rounded-full border border-border px-3 py-1.5 text-sm text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            {sibling.name}
          </Link>
          <Link
            href="/"
            className="rounded-full border border-border px-3 py-1.5 text-sm text-muted hover:text-foreground hover:border-foreground/30 transition-colors hidden sm:inline-flex"
          >
            Current site
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-foreground text-background px-3 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Contact
          </Link>
          <ThemeSelector />
        </nav>
      </div>
    </header>
  )
}
