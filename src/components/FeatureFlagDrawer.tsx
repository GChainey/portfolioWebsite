'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useFeatureFlags } from '@/context/FeatureFlagContext'

export function FeatureFlagDrawer() {
  const { flags, setFlag, isDrawerOpen, setDrawerOpen } = useFeatureFlags()

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
