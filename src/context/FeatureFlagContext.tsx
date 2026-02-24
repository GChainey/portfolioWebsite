'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type SignatureVariant = 'off' | 'clippath' | 'penflow'

interface FeatureFlags {
  sectionTitleBorders: boolean
  particleField: boolean
  feedPage: boolean
  signature: boolean
  signatureVariant: SignatureVariant
  signatureSize: number
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
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined)

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags)
  const [isDrawerOpen, setDrawerOpen] = useState(false)

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
  }, [])

  // Save flags to localStorage when they change
  useEffect(() => {
    localStorage.setItem('featureFlags', JSON.stringify(flags))
  }, [flags])

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
