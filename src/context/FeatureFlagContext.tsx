'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type SignatureVariant = 'off' | 'clippath' | 'penflow'
// How the homepage shows the products and case studies. tiles is live; the carousels and the
// five showcase variants (components/showcase) are parked here to compare
export const HOME_LAYOUTS = ['carousel', 'tiles', 'autoplay', 'coverflow', 'scrolly', 'billboard', 'wall'] as const
export type HomeLayout = (typeof HOME_LAYOUTS)[number]

interface FeatureFlags {
  sectionTitleBorders: boolean
  particleField: boolean
  feedPage: boolean
  signature: boolean
  signatureVariant: SignatureVariant
  signatureSize: number
  warmth: boolean
  colourLights: boolean
  homeLayout: HomeLayout
}

interface FeatureFlagContextType {
  flags: FeatureFlags
  setFlag: <K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => void
  isDrawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
}

const defaultFlags: FeatureFlags = {
  sectionTitleBorders: true,
  particleField: false,
  feedPage: false,
  signature: false,
  signatureVariant: 'off',
  signatureSize: 36,
  warmth: false,
  colourLights: false,
  homeLayout: 'tiles',
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined)

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags)
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Load flags from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('featureFlags')
    if (stored) {
      try {
        setFlags({ ...defaultFlags, ...JSON.parse(stored) })
      } catch {
        // ignore parse errors
      }
    }
    setLoaded(true)
  }, [])

  // Save flags to localStorage when they change, once the stored ones are in (saving before that
  // would write the defaults over them)
  useEffect(() => {
    if (loaded) localStorage.setItem('featureFlags', JSON.stringify(flags))
  }, [flags, loaded])

  // Window buttons in colour, styled in globals.css
  useEffect(() => {
    document.documentElement.classList.toggle('colour-lights', flags.colourLights)
  }, [flags.colourLights])

  // Listen for Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setDrawerOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const setFlag = <K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => {
    setFlags((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <FeatureFlagContext.Provider value={{ flags, setFlag, isDrawerOpen, setDrawerOpen }}>
      {children}
    </FeatureFlagContext.Provider>
  )
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext)
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider')
  }
  return context
}
