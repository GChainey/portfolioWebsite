'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { CHANGELOG } from '@/content/changelog'

export default function ChangelogPage() {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [zoom, setZoom] = useState(100)

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images)
    setLightboxIndex(index)
    setLightboxImage(images[index])
    setZoom(100)
  }

  const closeLightbox = () => {
    setLightboxImage(null)
    setLightboxImages([])
    setLightboxIndex(0)
    setZoom(100)
  }

  const goToPrev = useCallback(() => {
    const newIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length
    setLightboxIndex(newIndex)
    setLightboxImage(lightboxImages[newIndex])
  }, [lightboxIndex, lightboxImages])

  const goToNext = useCallback(() => {
    const newIndex = (lightboxIndex + 1) % lightboxImages.length
    setLightboxIndex(newIndex)
    setLightboxImage(lightboxImages[newIndex])
  }, [lightboxIndex, lightboxImages])

  const zoomIn = () => setZoom(z => Math.min(z + 25, 200))
  const zoomOut = () => setZoom(z => Math.max(z - 25, 25))
  const fitToScreen = () => setZoom(50)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxImage) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goToPrev()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === '+' || e.key === '=') zoomIn()
      if (e.key === '-') zoomOut()
      if (e.key === '0') setZoom(100)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxImage, goToPrev, goToNext])

  return (
    <div className="min-h-screen bg-background">
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 bg-black/50">
              <div className="flex items-center gap-2">
                <button onClick={zoomOut} className="p-2 text-white/70 hover:text-white transition-colors rounded hover:bg-white/10" title="Zoom out (-)">
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-white/70 text-sm w-16 text-center">{zoom}%</span>
                <button onClick={zoomIn} className="p-2 text-white/70 hover:text-white transition-colors rounded hover:bg-white/10" title="Zoom in (+)">
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button onClick={fitToScreen} className="p-2 text-white/70 hover:text-white transition-colors rounded hover:bg-white/10 ml-2" title="Fit to screen">
                  <Maximize2 className="w-5 h-5" />
                </button>
                <button onClick={() => setZoom(100)} className="px-2 py-1 text-white/70 hover:text-white transition-colors rounded hover:bg-white/10 text-sm" title="Actual size (0)">
                  100%
                </button>
              </div>
              {lightboxImages.length > 1 && (
                <div className="text-white/70 text-sm">{lightboxIndex + 1} / {lightboxImages.length}</div>
              )}
              <button onClick={closeLightbox} className="p-2 text-white/70 hover:text-white transition-colors rounded hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-start justify-center p-4" onClick={closeLightbox}>
              {lightboxImages.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); goToPrev() }} className="fixed left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors rounded-full bg-black/50 hover:bg-black/70 z-10">
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); goToNext() }} className="fixed right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors rounded-full bg-black/50 hover:bg-black/70 z-10">
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
              <motion.div
                key={lightboxImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{ width: `${zoom}%`, minWidth: zoom > 100 ? `${zoom}%` : 'auto' }}
                className="flex-shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lightboxImage} alt="Lightbox image" className="w-full h-auto rounded-lg shadow-2xl" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header />
      <div className="max-w-3xl mx-auto px-8 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-medium text-foreground mb-2">
            Changelog
          </h1>
          <p className="text-muted mb-12">
            Everyone can vibe code. But design is iterative, not a one-shot process. The magic is being able to refine faster than ever, in a real environment. This is every version of this site, start to finish.
          </p>
        </motion.div>

        <div className="space-y-8">
          {CHANGELOG.map((entry, index) => (
            <motion.div
              key={entry.version}
              className="relative pl-8 pb-8 border-l border-border last:pb-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              {/* Version dot */}
              <div className="absolute left-0 top-0 w-4 h-4 -translate-x-1/2 rounded-full bg-foreground" />

              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="inline-block px-2 py-0.5 text-xs font-mono bg-border rounded mr-2">
                    v{entry.version}
                  </span>
                  <span className="text-sm text-muted">{entry.date}</span>
                </div>
                {entry.pr && (
                  <a
                    href={entry.pr}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted hover:text-foreground transition-colors"
                  >
                    View PR →
                  </a>
                )}
              </div>

              <h3 className="text-lg font-medium text-foreground mb-2">
                {entry.title}
              </h3>

              <p className="text-muted mb-4">
                {entry.description}
              </p>

              <ul className="space-y-1 mb-4">
                {entry.changes.map((change, i) => (
                  <li key={i} className="text-sm text-muted flex items-start gap-2">
                    <span className="text-foreground/50">•</span>
                    {change}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Built with:</span>
                {entry.aiTools.map((tool) => (
                  <span
                    key={tool}
                    className="inline-block px-2 py-0.5 text-xs bg-accent/10 text-accent rounded"
                  >
                    {tool}
                  </span>
                ))}
              </div>

              {entry.image && (
                <button
                  onClick={() => openLightbox([entry.image!], 0)}
                  className="mt-4 rounded-lg overflow-hidden border border-border block w-full hover:border-accent transition-colors cursor-zoom-in h-48"
                >
                  <Image
                    src={entry.image}
                    alt={`Screenshot of v${entry.version}`}
                    width={800}
                    height={500}
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              )}

              {entry.images && entry.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {entry.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => openLightbox(entry.images!, i)}
                      className="rounded-lg overflow-hidden border border-border hover:border-accent transition-colors cursor-zoom-in h-32"
                    >
                      <Image
                        src={img}
                        alt={`Screenshot ${i + 1} of v${entry.version}`}
                        width={400}
                        height={250}
                        className="w-full h-full object-cover object-top"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <footer className="mt-16 pt-8 border-t border-border">
          <p className="text-xs text-muted">
            © 2025 Gareth Chainey · Built iteratively with AI
          </p>
        </footer>
      </div>
    </div>
  )
}
