'use client'

import { createElement } from 'react'
import Script from 'next/script'
import { GalleryLiveMount } from '@/components/gallery/GalleryLiveMount'

// Not in production yet: the gallery only shows on the local dev server. LIVE in
// public/gallery/gallery.js is the matching switch for the static variants. Flip both to launch.
export const GALLERY_LIVE = process.env.NODE_ENV === 'development'

interface GalleryProps {
  filters?: boolean // Show the group filter pills
  limit?: number // Cap the number of tiles (for the homepage teaser)
  deeplink?: boolean // Keep the open item in the URL hash so it can be shared
}

// Thin wrapper around <gc-gallery> (public/gallery/gallery.js). The gallery is a custom element
// rather than a React component so the static homepage variants in public/variants can share it.
// Content lives in public/gallery/items.json.
export function Gallery({ filters, limit, deeplink }: GalleryProps) {
  return (
    <>
      <Script src="/gallery/gallery.js" strategy="afterInteractive" />
      <GalleryLiveMount />
      {createElement('gc-gallery', {
        filters: filters ? '' : undefined,
        limit,
        deeplink: deeplink ? '' : undefined,
        suppressHydrationWarning: true,
      })}
    </>
  )
}
