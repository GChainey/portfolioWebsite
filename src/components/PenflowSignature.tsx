'use client'

import { useRef, useState, useEffect } from 'react'
import { useInView } from 'motion/react'
import { Penflow } from 'penflow/react'
import { useFeatureFlags } from '@/context/FeatureFlagContext'
import { useTheme } from '@/context/ThemeContext'

interface PenflowSignatureProps {
  className?: string
  delay?: number
}

export function PenflowSignature({ className = '' }: PenflowSignatureProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const [color, setColor] = useState('#fafafa')
  const { flags } = useFeatureFlags()
  const { resolvedMode } = useTheme()

  useEffect(() => {
    const fg = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim()
    if (fg) setColor(fg)
  }, [resolvedMode])

  return (
    <div ref={ref} className={className}>
      {isInView && (
        <Penflow
          text="Gareth Chainey"
          fontUrl="/fonts/BrittanySignatureScript.ttf"
          color={color}
          size={flags.signatureSize}
          speed={1.2}
          lineHeight={1.8}
          quality="snappy"
          seed="gareth"
        />
      )}
    </div>
  )
}
