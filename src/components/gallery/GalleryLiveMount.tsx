'use client'

import { useEffect, useRef, type ComponentType } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import dynamic from 'next/dynamic'

const EAIShaderBannerVisual = dynamic(
  () =>
    import('@/components/eai-shader-banner/EAIShaderBannerVisual').then((m) => m.EAIShaderBannerVisual),
  { ssr: false },
)

const LIVE_COMPONENTS: Record<string, ComponentType<{ className?: string }>> = {
  'eai-shader-banners': EAIShaderBannerVisual,
}

function mountLiveHosts(roots: Map<Element, Root>) {
  document.querySelectorAll('.gal-live-host[data-live]').forEach((host) => {
    if (!(host instanceof HTMLElement) || roots.has(host)) return
    const id = host.getAttribute('data-live')
    const Component = id ? LIVE_COMPONENTS[id] : undefined
    if (!Component) return
    const root = createRoot(host)
    root.render(<Component className="h-full w-full" />)
    roots.set(host, root)
  })
}

function unmountDetached(roots: Map<Element, Root>) {
  for (const [host, root] of roots) {
    if (!host.isConnected) {
      root.unmount()
      roots.delete(host)
    }
  }
}

/** Hydrates `type: "live"` gallery tiles rendered by public/gallery/gallery.js */
export function GalleryLiveMount() {
  const rootsRef = useRef(new Map<Element, Root>())

  useEffect(() => {
    const sync = () => {
      unmountDetached(rootsRef.current)
      mountLiveHosts(rootsRef.current)
    }

    sync()
    document.addEventListener('gal-live-mount', sync)
    return () => {
      document.removeEventListener('gal-live-mount', sync)
      for (const root of rootsRef.current.values()) root.unmount()
      rootsRef.current.clear()
    }
  }, [])

  return null
}
