'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Mode = 'system' | 'light' | 'dark'
type ResolvedMode = 'light' | 'dark'
type Effect = 'off' | 'glass' | 'scanlines'
type AccentColor = 'amber' | 'orange' | 'red' | 'rose' | 'pink' | 'fuchsia' | 'purple' | 'violet' | 'indigo' | 'blue' | 'cyan' | 'teal' | 'emerald' | 'green' | 'lime' | 'yellow'

export const ACCENT_COLORS: { id: AccentColor; label: string; hex: string }[] = [
  { id: 'amber', label: 'Amber', hex: '#d97706' },
  { id: 'orange', label: 'Orange', hex: '#ea580c' },
  { id: 'red', label: 'Red', hex: '#dc2626' },
  { id: 'rose', label: 'Rose', hex: '#e11d48' },
  { id: 'pink', label: 'Pink', hex: '#db2777' },
  { id: 'fuchsia', label: 'Fuchsia', hex: '#c026d3' },
  { id: 'purple', label: 'Purple', hex: '#9333ea' },
  { id: 'violet', label: 'Violet', hex: '#7c3aed' },
  { id: 'indigo', label: 'Indigo', hex: '#4f46e5' },
  { id: 'blue', label: 'Blue', hex: '#2563eb' },
  { id: 'cyan', label: 'Cyan', hex: '#0891b2' },
  { id: 'teal', label: 'Teal', hex: '#0d9488' },
  { id: 'emerald', label: 'Emerald', hex: '#059669' },
  { id: 'green', label: 'Green', hex: '#16a34a' },
  { id: 'lime', label: 'Lime', hex: '#65a30d' },
  { id: 'yellow', label: 'Yellow', hex: '#ca8a04' },
]

// CSS overlays only, ported from Wallbounce's CRT looks. Its TUBE and ARCADE
// bow the picture by redrawing a canvas through WebGL; a page has no canvas to
// redraw, and warping it would break clicks and text selection.
export const EFFECTS: { id: Effect; label: string }[] = [
  { id: 'off', label: 'Off' },
  { id: 'glass', label: 'Glass' },
  { id: 'scanlines', label: 'Scanlines' },
]

// Swap the html crt-* class for the chosen effect; the layout's head script does the same before first paint.
function applyEffect(effect: Effect) {
  const root = document.documentElement
  root.classList.remove('crt-glass', 'crt-scanlines')
  if (effect !== 'off') root.classList.add(`crt-${effect}`)
}

interface ThemeContextType {
  mode: Mode
  resolvedMode: ResolvedMode
  accent: AccentColor
  warm: boolean
  effect: Effect
  setMode: (mode: Mode) => void
  setAccent: (accent: AccentColor) => void
  setWarm: (warm: boolean) => void
  setEffect: (effect: Effect) => void
  toggleMode: () => void
  toggleWarm: () => void
  mounted: boolean
  // Legacy support
  theme: ResolvedMode
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>('dark')
  const [systemPreference, setSystemPreference] = useState<ResolvedMode>('dark')
  const [accent, setAccentState] = useState<AccentColor>('amber')
  const [warm, setWarmState] = useState(false)
  const [effect, setEffectState] = useState<Effect>('off')
  const [mounted, setMounted] = useState(false)

  // Get resolved mode based on mode setting and system preference
  const resolvedMode: ResolvedMode = mode === 'system' ? systemPreference : mode

  useEffect(() => {
    setMounted(true)
    const storedMode = localStorage.getItem('theme-mode') as Mode | null
    const storedAccent = localStorage.getItem('theme-accent') as AccentColor | null
    const storedWarm = localStorage.getItem('theme-warm')
    const storedEffect = localStorage.getItem('theme-effect')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    // Default to 'dark' if no stored preference (portfolio looks best in dark)
    const initialMode = storedMode || 'dark'
    const initialAccent = storedAccent || 'amber'
    const initialWarm = storedWarm === 'true'
    const initialEffect = EFFECTS.find(e => e.id === storedEffect)?.id ?? 'off'
    const initialSystemPref = prefersDark ? 'dark' : 'light'

    setModeState(initialMode)
    setAccentState(initialAccent)
    setWarmState(initialWarm)
    setEffectState(initialEffect)
    setSystemPreference(initialSystemPref)

    // Apply classes based on resolved mode
    const resolved = initialMode === 'system' ? initialSystemPref : initialMode
    document.documentElement.classList.toggle('dark', resolved === 'dark')
    document.documentElement.classList.toggle('warm', initialWarm)
    document.documentElement.className = document.documentElement.className
      .split(' ')
      .filter(c => !c.startsWith('accent-'))
      .join(' ')
    document.documentElement.classList.add(`accent-${initialAccent}`)
    applyEffect(initialEffect)

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light')
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Apply dark class when resolved mode changes
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', resolvedMode === 'dark')
    }
  }, [resolvedMode, mounted])

  // Persist mode setting
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme-mode', mode)
    }
  }, [mode, mounted])

  // Apply warm class when warm changes
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('warm', warm)
      localStorage.setItem('theme-warm', String(warm))
    }
  }, [warm, mounted])

  useEffect(() => {
    if (mounted) {
      applyEffect(effect)
      localStorage.setItem('theme-effect', effect)
    }
  }, [effect, mounted])

  useEffect(() => {
    if (mounted) {
      // Remove old accent class and add new one
      document.documentElement.className = document.documentElement.className
        .split(' ')
        .filter(c => !c.startsWith('accent-'))
        .join(' ')
      document.documentElement.classList.add(`accent-${accent}`)
      localStorage.setItem('theme-accent', accent)
    }
  }, [accent, mounted])

  const setMode = (newMode: Mode) => setModeState(newMode)
  const setAccent = (newAccent: AccentColor) => setAccentState(newAccent)
  const setWarm = (newWarm: boolean) => setWarmState(newWarm)
  const setEffect = (newEffect: Effect) => setEffectState(newEffect)
  const toggleWarm = () => setWarmState(prev => !prev)
  const toggleMode = () => setModeState(prev => {
    if (prev === 'system') return 'light'
    if (prev === 'light') return 'dark'
    return 'system'
  })

  return (
    <ThemeContext.Provider value={{
      mode,
      resolvedMode,
      accent,
      warm,
      effect,
      setMode,
      setAccent,
      setWarm,
      setEffect,
      toggleMode,
      toggleWarm,
      mounted,
      // Legacy support
      theme: resolvedMode,
      toggleTheme: toggleMode,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export function useMounted() {
  const context = useContext(ThemeContext)
  return context?.mounted ?? false
}
