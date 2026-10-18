'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown, ArrowUp, X } from 'lucide-react'
import { useFeatureFlags, HOME_SECTIONS, HOME_ORDER, validOrder } from '@/context/FeatureFlagContext'

export function FeatureFlagDrawer() {
  const { flags, setFlag, isDrawerOpen, setDrawerOpen } = useFeatureFlags()
  const order = validOrder(flags.homeOrder)
  const move = (from: number, by: number) => {
    const next = [...order]
    const [id] = next.splice(from, 1)
    next.splice(from + by, 0, id)
    setFlag('homeOrder', next)
  }
  const isDefaultOrder = order.every((id, i) => id === HOME_ORDER[i])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/20 z-50"
          />

          {/* Drawer - slides in from right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-background border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-medium text-foreground">Feature Flags</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 hover:bg-border rounded transition-colors"
              >
                <X className="w-4 h-4 text-muted" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Homepage section order */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Homepage order</p>
                  {!isDefaultOrder && (
                    <button onClick={() => setFlag('homeOrder', HOME_ORDER)} className="text-xs text-muted hover:text-foreground">Reset</button>
                  )}
                </div>
                <ol className="rounded-lg border border-border divide-y divide-border">
                  {order.map((id, i) => (
                    <li key={id} className="flex items-center gap-2 px-3 py-2">
                      <span className="text-xs font-mono text-muted tabular-nums">{i + 1}</span>
                      <span className="flex-1 text-sm text-foreground">{HOME_SECTIONS.find((s) => s.id === id)?.label}</span>
                      <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="p-1 rounded text-muted hover:text-foreground hover:bg-border disabled:opacity-30 disabled:pointer-events-none">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => move(i, 1)} disabled={i === order.length - 1} aria-label="Move down" className="p-1 rounded text-muted hover:text-foreground hover:bg-border disabled:opacity-30 disabled:pointer-events-none">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ol>
                <p className="text-xs text-muted">
                  Only this browser. The live site uses the order in HOME_SECTIONS (FeatureFlagContext.tsx)
                </p>
              </div>

              {/* Section Title Borders Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Section Title Borders</p>
                  <button
                    onClick={() => setFlag('sectionTitleBorders', !flags.sectionTitleBorders)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      flags.sectionTitleBorders ? 'bg-accent' : 'bg-border'
                    }`}
                  >
                    <motion.div
                      className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow"
                      animate={{ x: flags.sectionTitleBorders ? 20 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
                <p className="text-xs text-muted">
                  Add border below section titles (Projects, Testimonials)
                </p>
              </div>

              {/* Feed Page Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Feed Page</p>
                  <button
                    onClick={() => setFlag('feedPage', !flags.feedPage)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      flags.feedPage ? 'bg-accent' : 'bg-border'
                    }`}
                  >
                    <motion.div
                      className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow"
                      animate={{ x: flags.feedPage ? 20 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
                <p className="text-xs text-muted">
                  Show the Feed link in navigation
                </p>
              </div>

              {/* Homepage layout picker */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Homepage work</p>
                <div className="grid grid-cols-2 gap-1 bg-border/50 rounded-lg p-1">
                  {([
                    { value: 'tiles', label: 'Tiles (live)' },
                    { value: 'carousel', label: 'Carousels' },
                    { value: 'autoplay', label: '1 · Autoplay' },
                    { value: 'coverflow', label: '2 · Coverflow' },
                    { value: 'scrolly', label: '3 · Scroll story' },
                    { value: 'billboard', label: '4 · Billboard' },
                    { value: 'wall', label: '5 · The wall' },
                  ] as const).map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setFlag('homeLayout', value)}
                      className={`text-xs py-1.5 px-2 rounded-md transition-colors ${
                        flags.homeLayout === value
                          ? 'bg-accent text-white'
                          : 'text-muted hover:text-foreground'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted">
                  How the homepage shows the products and case studies. Also ?home=billboard and so on
                </p>
              </div>

              {/* Signature Variant Picker */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Signature</p>
                <div className="flex gap-1 bg-border/50 rounded-lg p-1">
                  {([
                    { value: 'off', label: 'Off' },
                    { value: 'clippath', label: 'Clip-path' },
                    { value: 'penflow', label: 'Penflow' },
                  ] as const).map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setFlag('signatureVariant', value)}
                      className={`flex-1 text-xs py-1.5 px-2 rounded-md transition-colors ${
                        flags.signatureVariant === value
                          ? 'bg-accent text-white'
                          : 'text-muted hover:text-foreground'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {flags.signatureVariant !== 'off' && (
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="range"
                      min={20}
                      max={72}
                      step={2}
                      value={flags.signatureSize}
                      onChange={(e) => setFlag('signatureSize', Number(e.target.value))}
                      className="flex-1 accent-accent h-1"
                    />
                    <span className="text-xs text-muted tabular-nums w-8 text-right">{flags.signatureSize}px</span>
                  </div>
                )}
                <p className="text-xs text-muted">
                  Animated cursive signature in footers and CV title
                </p>
              </div>

              {/* Colour lights Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Colour window buttons</p>
                  <button
                    onClick={() => setFlag('colourLights', !flags.colourLights)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      flags.colourLights ? 'bg-accent' : 'bg-border'
                    }`}
                  >
                    <motion.div
                      className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow"
                      animate={{ x: flags.colourLights ? 20 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
                <p className="text-xs text-muted">
                  Red, amber and green buttons on the windows around clips, instead of grey
                </p>
              </div>

              {/* Particle Field Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Particle Field</p>
                  <button
                    onClick={() => setFlag('particleField', !flags.particleField)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      flags.particleField ? 'bg-accent' : 'bg-border'
                    }`}
                  >
                    <motion.div
                      className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow"
                      animate={{ x: flags.particleField ? 20 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
                <p className="text-xs text-muted">
                  Interactive particle constellation in the hero section
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-border/30">
              <p className="text-xs text-muted text-center">
                Press <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-foreground">⌘K</kbd> to toggle
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
