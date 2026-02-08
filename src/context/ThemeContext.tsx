'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Mode = 'system' | 'light' | 'dark'
type ResolvedMode = 'light' | 'dark'
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

interface ThemeContextType {
  mode: Mode
  resolvedMode: ResolvedMode
  accent: AccentColor
  setMode: (mode: Mode) => void
  setAccent: (accent: AccentColor) => void
  toggleMode: () => void
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
  const [mounted, setMounted] = useState(false)

  // Get resolved mode based on mode setting and system preference
  const resolvedMode: ResolvedMode = mode === 'system' ? systemPreference : mode

  useEffect(() => {
    setMounted(true)
    const storedMode = localStorage.getItem('theme-mode') as Mode | null
    const storedAccent = localStorage.getItem('theme-accent') as AccentColor | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    // Default to 'dark' if no stored preference (portfolio looks best in dark)
    const initialMode = storedMode || 'dark'
    const initialAccent = storedAccent || 'amber'
    const initialSystemPref = prefersDark ? 'dark' : 'light'

    setModeState(initialMode)
    setAccentState(initialAccent)
    setSystemPreference(initialSystemPref)

    // Apply classes based on resolved mode
    const resolved = initialMode === 'system' ? initialSystemPref : initialMode
    document.documentElement.classList.toggle('dark', resolved === 'dark')
    document.documentElement.className = document.documentElement.className
      .split(' ')
      .filter(c => !c.startsWith('accent-'))
      .join(' ')
    document.documentElement.classList.add(`accent-${initialAccent}`)

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
      setMode,
      setAccent,
      toggleMode,
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
