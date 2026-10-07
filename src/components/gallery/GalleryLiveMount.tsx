'use client'

import { useEffect, useRef, type ComponentType } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { EAIShaderBannerVisual } from '@/components/eai-shader-banner/EAIShaderBannerVisual'

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

    const observer = new MutationObserver(sync)
    document.querySelectorAll('gc-gallery').forEach((gallery) => {
      observer.observe(gallery, { childList: true, subtree: true })
    })

    const galleryObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.tagName === 'GC-GALLERY') {
            observer.observe(node, { childList: true, subtree: true })
            sync()
          }
        })
      }
    })
    galleryObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('gal-live-mount', sync)
      observer.disconnect()
      galleryObserver.disconnect()
      for (const root of rootsRef.current.values()) root.unmount()
      rootsRef.current.clear()
    }
  }, [])

  return null
}
