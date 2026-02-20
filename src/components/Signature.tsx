'use client'

import { useRef } from 'react'
import { motion, useInView } from 'motion/react'

interface SignatureProps {
  className?: string
  delay?: number
}

export function Signature({ className = '', delay = 0 }: SignatureProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <div ref={ref} className={`text-3xl ${className}`}>
      <motion.span
        className="inline-block text-foreground"
        style={{ fontFamily: 'var(--font-signature)', fontWeight: 700 }}
        initial={{
          opacity: 0,
          clipPath: 'inset(0 100% 0 0)',
        }}
        animate={
          isInView
            ? {
                opacity: 1,
                clipPath: 'inset(0 0% 0 0)',
              }
            : {}
        }
        transition={{
          opacity: { duration: 0.3, delay },
          clipPath: {
            duration: 1.4,
            delay,
            ease: [0.25, 0.1, 0.25, 1],
          },
        }}
      >
        Gareth Chainey
      </motion.span>
    </div>
  )
}
