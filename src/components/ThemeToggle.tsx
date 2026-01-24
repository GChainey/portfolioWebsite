'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative w-12 h-6 border border-border rounded-full flex items-center px-1 transition-colors"
      aria-label="Toggle theme"
    >
      <motion.div
        className="w-4 h-4 bg-foreground rounded-full"
        animate={{ x: theme === 'dark' ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}
