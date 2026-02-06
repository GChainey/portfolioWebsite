'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Disable browser's automatic scroll restoration to prevent
    // pages from loading at a previously-scrolled position
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    // Scroll to top on every route change
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
