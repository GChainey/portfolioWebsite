'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// Where else to find me, then the small print. On the homepage and the About page
const LINKS = [
  { label: 'X', href: 'https://x.com/garethchainey', external: true }, // @garethchainey
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/garethchainey/', external: true },
  { label: 'Email', href: 'mailto:gareth.chainey@gmail.com', external: false },
]

export function SiteFooter() {
  // ?width=narrow: on the narrow homepage's 540px column, in its type (15px, soft ink, one grey)
  const [narrow, setNarrow] = useState(false)
  useEffect(() => { setNarrow(new URLSearchParams(window.location.search).get('width') === 'narrow') }, [])
  if (narrow) {
    const quiet = 'text-[#666] transition-colors hover:text-[#181818]'
    return (
      <footer className="mx-auto mt-auto w-full max-w-[588px] px-6 pb-12 text-[15px] leading-[22px]">
        <div className="flex flex-col gap-8 border-t border-[#F0F0F0] pt-10">
          <div className="flex flex-col">
            <p className="text-[#181818]">Gareth Chainey</p>
            <p className="text-[#666]">Product designer, an Aussie in New York</p>
          </div>
          <nav aria-label="Elsewhere" className="flex flex-wrap gap-x-5 gap-y-2">
            {LINKS.map((l) => (
              <a key={l.label} href={l.href} {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={quiet}>
                {l.label}{l.external && ' ↗'}
              </a>
            ))}
            <Link href="/changelog" className={quiet}>Changelog</Link>
          </nav>
          <div className="flex items-center justify-between text-[#666]">
            <p>© 2026 Gareth Chainey</p>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={quiet}>↑ Back to top</button>
          </div>
        </div>
      </footer>
    )
  }
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
