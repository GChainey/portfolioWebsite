'use client'

import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { useTheme, ACCENT_COLORS } from '@/context/ThemeContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeSelector() {
  const { mode, resolvedMode, accent, setMode, setAccent } = useTheme()

  // Icon for the trigger button based on current resolved mode
  const TriggerIcon = resolvedMode === 'dark' ? Moon : Sun

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 hover:bg-border/50 rounded transition-colors flex items-center gap-2"
          aria-label="Theme settings"
        >
          <TriggerIcon className="w-5 h-5 text-foreground" />
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-background border-border">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Mode</DropdownMenuLabel>
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setMode('system') }} className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            System
          </span>
          {mode === 'system' && <Check className="w-4 h-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setMode('light') }} className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sun className="w-4 h-4" />
            Day
          </span>
          {mode === 'light' && <Check className="w-4 h-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setMode('dark') }} className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Moon className="w-4 h-4" />
            Night
          </span>
          {mode === 'dark' && <Check className="w-4 h-4" />}
        </DropdownMenuItem>

        <DropdownMenuLabel className="text-xs text-muted-foreground mt-2">Accent Color</DropdownMenuLabel>
        <div className="grid grid-cols-8 gap-1 p-2">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => setAccent(color.id)}
              className="w-5 h-5 rounded-full flex items-center justify-center transition-transform hover:scale-110"
              style={{ backgroundColor: color.hex }}
              title={color.label}
            >
              {accent === color.id && (
                <Check className="w-3 h-3 text-white" />
              )}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
