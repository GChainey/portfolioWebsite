'use client'

import { useEffect, useRef, useState } from 'react'

interface MagneticProps {
  children: React.ReactNode
  strength?: number
  radius?: number
  className?: string
  disabled?: boolean
}

export function Magnetic({
  children,
  strength = 0.3,
  radius = 120,
  className,
  disabled = false,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const isActive = useRef(false)

  useEffect(() => {
    // Skip on touch devices or when disabled
    if (disabled || window.matchMedia('(pointer: coarse)').matches) {
      setOffset({ x: 0, y: 0 })
      isActive.current = false
      return
    }

    const el = ref.current
    if (!el) return

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < radius) {
        const force = (1 - dist / radius) * strength
        setOffset({ x: dx * force, y: dy * force })
        isActive.current = true
      } else if (isActive.current) {
        setOffset({ x: 0, y: 0 })
        isActive.current = false
      }
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [strength, radius, disabled])

  const isSnappingBack = !isActive.current && (offset.x !== 0 || offset.y !== 0)

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: isSnappingBack
          ? 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
          : 'transform 0.15s ease-out',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  )
}
