'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type SignatureVariant = 'off' | 'clippath' | 'penflow'
// How the homepage shows the products and case studies. tiles is live; the carousels and the
// five showcase variants (components/showcase) are parked here to compare
export const HOME_LAYOUTS = ['carousel', 'tiles', 'autoplay', 'coverflow', 'scrolly', 'billboard', 'wall'] as const
export type HomeLayout = (typeof HOME_LAYOUTS)[number]
// The homepage under the hero: 'website' is the Paper frame of that name (no panel lines, each
// piece a title, a line, links and its picture); 'list' is the earlier Visuals list
export type HomeDesign = 'website' | 'list'

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
  panels: boolean // the boxed look: a ruled column, every section between hairlines
  v2: boolean // the simplified design (globals.css, html.v2): six type steps, two weights, one grey, three corners
  homeDesign: HomeDesign
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
  panels: true,
  v2: false,
  homeDesign: 'website',
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined)

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags)
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  // ?panels=off or on, and ?v=2 or 1, for this visit only (not saved)
  const [panelsParam, setPanelsParam] = useState<boolean | null>(null)
  const [v2Param, setV2Param] = useState<boolean | null>(null)
  const [designParam, setDesignParam] = useState<HomeDesign | null>(null)

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
    const panels = new URLSearchParams(window.location.search).get('panels')
    if (panels === 'off' || panels === 'on') setPanelsParam(panels === 'on')
    const v = new URLSearchParams(window.location.search).get('v')
    if (v === '1' || v === '2') setV2Param(v === '2')
    const design = new URLSearchParams(window.location.search).get('design')
    if (design === 'website' || design === 'list') setDesignParam(design)
    setLoaded(true)
  }, [])

  // Save flags to localStorage when they change, once the stored ones are in (saving before that
  // would write the defaults over them)
  useEffect(() => {
    if (loaded) localStorage.setItem('featureFlags', JSON.stringify(flags))
  }, [flags, loaded])

  const picked = { ...flags, ...(panelsParam === null ? {} : { panels: panelsParam }), ...(v2Param === null ? {} : { v2: v2Param }), ...(designParam === null ? {} : { homeDesign: designParam }) }
  // The website design has no panel lines
  const shown = picked.homeDesign === 'website' ? { ...picked, panels: false } : picked

  // The simplified design is CSS on html.v2 (globals.css)
  useEffect(() => {
    document.documentElement.classList.toggle('v2', shown.v2)
  }, [shown.v2])

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
    <FeatureFlagContext.Provider value={{ flags: shown, setFlag, isDrawerOpen, setDrawerOpen }}>
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
