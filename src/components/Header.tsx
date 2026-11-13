'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { GALLERY_LIVE } from './Gallery'
import { DEMOS_LIVE } from '@/content/demos'
import { PARKED_LIVE } from '@/content/parked'
import { useFeatureFlags } from '@/context/FeatureFlagContext'

interface HeaderProps {
  showBack?: boolean
}

// The menu: five places, the current one in full colour
const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/essays', label: 'Essays' },
  { href: '/cv', label: 'CV' },
  { href: '/contact', label: 'Contact' },
]

export function Header({ showBack }: HeaderProps) {
  const { flags } = useFeatureFlags()
  const pathname = usePathname()
  // ?width=narrow: the header sits on the narrow homepage's 540px column, in its type (15px, soft
  // ink and one grey), with the five places only (the dev-only links wouldn't fit)
  const [narrow, setNarrow] = useState(false)
  useEffect(() => { setNarrow(new URLSearchParams(window.location.search).get('width') === 'narrow') }, [pathname])
  if (narrow) {
    return (
      <header className="fixed top-0 left-0 right-0 z-40 bg-[color-mix(in_srgb,var(--background)_85%,transparent)] backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-[588px] items-center justify-between gap-6 px-6 text-[15px] leading-[22px]">
          <Link href="/?width=narrow" aria-label="Gareth Chainey" className="whitespace-nowrap text-[#181818] transition-opacity hover:opacity-70">
            <span className="sm:hidden">GC</span>
            <span className="hidden sm:inline">Gareth Chainey</span>
          </Link>
          <nav className="flex items-center gap-4">
            {NAV.map(({ href, label }) => {
              const here = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link key={href} href={href === '/' ? '/?width=narrow' : href} aria-current={here ? 'page' : undefined} className={`transition-colors ${here ? 'text-[#181818]' : 'text-[#666] hover:text-[#181818]'}`}>
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>
    )
  }
  return (
    // A tint of the page behind a blur (a Tailwind /80 does nothing here: the colours are var()s)
    <header className={`fixed top-0 left-0 right-0 z-40 bg-[color-mix(in_srgb,var(--background)_85%,transparent)] backdrop-blur-sm ${flags.panels ? 'border-b border-border' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          {/* Initials on phones: the full name wrapped onto two lines beside the menu */}
          <Link href="/" aria-label="Gareth Chainey" className="whitespace-nowrap text-lg font-medium text-foreground hover:opacity-70 transition-opacity">
            <span className="sm:hidden">GC</span>
            <span className="hidden sm:inline">Gareth Chainey</span>
          </Link>
          {showBack && (
            <>
              <span className="text-muted">/</span>
              <Link href="/" className="text-sm text-muted hover:text-foreground transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                Back
              </Link>
            </>
          )}
        </div>
        <nav className="flex items-center gap-4 sm:gap-6">
          {NAV.map(({ href, label }) => {
            const here = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link key={href} href={href} aria-current={here ? 'page' : undefined} className={`text-sm transition-colors ${here ? 'text-foreground' : 'text-muted hover:text-foreground'}`}>
                {label}
              </Link>
            )
          })}
          {/* Dev only, or behind a flag */}
          {GALLERY_LIVE && (
            <Link href="/gallery" className="text-sm text-muted hover:text-foreground transition-colors">
              Gallery
            </Link>
          )}
          {DEMOS_LIVE && (
            <Link href="/demos" className="text-sm text-muted hover:text-foreground transition-colors">
              Demos
            </Link>
          )}
          {PARKED_LIVE && (
            <Link href="/parked" className="text-sm text-muted hover:text-foreground transition-colors">
              Parked
            </Link>
          )}
          {flags.feedPage && (
            <Link href="/feed" className="text-sm text-muted hover:text-foreground transition-colors">
              Feed
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
