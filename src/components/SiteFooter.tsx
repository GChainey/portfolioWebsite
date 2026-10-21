'use client'

import Link from 'next/link'

// Where else to find me, then the small print. On the homepage and the About page
const LINKS = [
  { label: 'X', href: 'https://x.com/garethchainey', external: true }, // @garethchainey
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/garethchainey/', external: true },
  { label: 'Email', href: 'mailto:gareth.chainey@gmail.com', external: false },
]

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border px-6 pb-10 pt-16">
      <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-base font-medium text-foreground">Gareth Chainey</p>
          <p className="text-sm text-muted">Product designer, an Aussie in New York</p>
        </div>
        <nav aria-label="Elsewhere" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="text-muted transition-colors hover:text-foreground">
              {l.label}{l.external && ' ↗'}
            </a>
          ))}
          <Link href="/changelog" className="text-muted transition-colors hover:text-foreground">Changelog</Link>
        </nav>
      </div>
      <div className="mt-10 flex items-center justify-between">
        <p className="text-xs text-muted">© 2026 Gareth Chainey</p>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xs text-muted transition-colors hover:text-foreground">
          ↑ Back to top
        </button>
      </div>
    </footer>
  )
}
