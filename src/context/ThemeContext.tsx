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

// One look: day mode, amber (the first colour), no effects. The theme menu is gone, so the
// choices visitors saved before are ignored. The setters stay so callers still compile.
const MODE: ResolvedMode = 'light'
const ACCENT: AccentColor = ACCENT_COLORS[0].id
const noop = () => {}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const root = document.documentElement
    root.classList.remove('dark', 'warm', 'crt-glass', 'crt-scanlines')
    root.className = root.className.split(' ').filter(c => !c.startsWith('accent-')).join(' ')
    root.classList.add(`accent-${ACCENT}`)
  }, [])

  return (
    <ThemeContext.Provider value={{
      mode: MODE,
      resolvedMode: MODE,
      accent: ACCENT,
      warm: false,
      effect: 'off',
      setMode: noop,
      setAccent: noop,
      setWarm: noop,
      setEffect: noop,
      toggleMode: noop,
      toggleWarm: noop,
      mounted,
      // Legacy support
      theme: MODE,
      toggleTheme: noop,
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
