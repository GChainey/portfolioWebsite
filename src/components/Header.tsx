'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ThemeSelector } from './ThemeSelector'
import { GALLERY_LIVE } from './Gallery'
import { DEMOS_LIVE } from '@/content/demos'
import { PARKED_LIVE } from '@/content/parked'
import { useFeatureFlags } from '@/context/FeatureFlagContext'

interface HeaderProps {
  showBack?: boolean
}

export function Header({ showBack }: HeaderProps) {
  const { flags } = useFeatureFlags()
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-medium text-foreground hover:opacity-70 transition-opacity">
            Gareth Chainey
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
        <nav className="flex items-center gap-6">
          <Link href="/cv" className="text-sm text-muted hover:text-foreground transition-colors">
            CV
          </Link>
          <Link href="/projects" className="text-sm text-muted hover:text-foreground transition-colors">
            Projects
          </Link>
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
          <Link href="/changelog" className="text-sm text-muted hover:text-foreground transition-colors">
            Changelog
          </Link>
          <Link href="/contact" className="text-sm text-muted hover:text-foreground transition-colors">
            Contact
          </Link>
          <ThemeSelector />
        </nav>
      </div>
    </header>
  )
}
