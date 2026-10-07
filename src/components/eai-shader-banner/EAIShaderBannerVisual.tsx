'use client'

import { useEffect, useRef, useState } from 'react'
import { Warp } from '@paper-design/shaders-react'
import { EAILogo } from '@/components/EAILogo'
import {
  EAI_BANNER_VARIANTS,
  VARIANT_CROSSFADE_MS,
  VARIANT_HOLD_MS,
  WARP_SETTINGS,
  LOGO_INSET_BOTTOM_RATIO,
  LOGO_INSET_RIGHT_RATIO,
  LOGO_WIDTH_RATIO,
  type EAIBannerVariant,
} from './constants'

const fadeStyle = {
  transition: `opacity ${VARIANT_CROSSFADE_MS}ms ease-in-out`,
}

function BannerWarpLayer({
  variant,
  animate,
  maxPixelCount,
}: {
  variant: EAIBannerVariant
  animate: boolean
  maxPixelCount: number
}) {
  return (
    <div className="absolute inset-0">
      <Warp
        {...WARP_SETTINGS}
        speed={animate ? WARP_SETTINGS.speed : 0}
        colors={[...variant.colors]}
        maxPixelCount={maxPixelCount}
        className="absolute inset-0 h-full w-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}

export function EAIShaderBannerVisual({ className = '' }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null)
  const [crossfading, setCrossfading] = useState(false)
  const [incomingVisible, setIncomingVisible] = useState(false)

  const active = EAI_BANNER_VARIANTS[activeIndex]
  const outgoing = outgoingIndex !== null ? EAI_BANNER_VARIANTS[outgoingIndex] : null

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const node = rootRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '10% 0px', threshold: 0.15 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!crossfading) {
      setIncomingVisible(false)
      return
    }
    setIncomingVisible(false)
    const id = requestAnimationFrame(() => setIncomingVisible(true))
    return () => cancelAnimationFrame(id)
  }, [crossfading, activeIndex])

  useEffect(() => {
    if (!isVisible || reducedMotion) return

    let cancelled = false
    let holdTimer: ReturnType<typeof setTimeout>
    let fadeTimer: ReturnType<typeof setTimeout>
    let index = activeIndex

    const advance = () => {
      holdTimer = setTimeout(() => {
        if (cancelled) return
        const next = (index + 1) % EAI_BANNER_VARIANTS.length
        setOutgoingIndex(index)
        setActiveIndex(next)
        setCrossfading(true)
        index = next

        fadeTimer = setTimeout(() => {
          if (cancelled) return
          setCrossfading(false)
          setOutgoingIndex(null)
          advance()
        }, VARIANT_CROSSFADE_MS)
      }, VARIANT_HOLD_MS)
    }

    advance()

    return () => {
      cancelled = true
      clearTimeout(holdTimer)
      clearTimeout(fadeTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- timer only restarts when visibility / motion prefs change
  }, [isVisible, reducedMotion])

  const shouldAnimate = isVisible && !reducedMotion
  const maxPixelCount = 480_000

  return (
    <div ref={rootRef} className={`relative h-full w-full overflow-hidden bg-[#0D3856] ${className}`}>
      {!crossfading && (
        <BannerWarpLayer variant={active} animate={shouldAnimate} maxPixelCount={maxPixelCount} />
      )}

      {crossfading && outgoing && (
        <>
          <div className="absolute inset-0" style={{ ...fadeStyle, opacity: incomingVisible ? 0 : 1 }}>
            <BannerWarpLayer variant={outgoing} animate={shouldAnimate} maxPixelCount={maxPixelCount} />
          </div>
          <div className="absolute inset-0" style={{ ...fadeStyle, opacity: incomingVisible ? 1 : 0 }}>
            <BannerWarpLayer variant={active} animate={shouldAnimate} maxPixelCount={maxPixelCount} />
          </div>
        </>
      )}

      <div className="pointer-events-none absolute inset-0 z-10">
        <div
          className="absolute transition-all ease-in-out"
          style={{
            width: `${LOGO_WIDTH_RATIO * 100}%`,
            transitionDuration: `${VARIANT_CROSSFADE_MS}ms`,
            ...(active.placement === 'center'
              ? {
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }
              : {
                  right: `${LOGO_INSET_RIGHT_RATIO * 100}%`,
                  bottom: `${LOGO_INSET_BOTTOM_RATIO * 100}%`,
                }),
          }}
        >
          <EAILogo color={active.logoColor} className="h-auto w-full" />
        </div>
      </div>
    </div>
  )
}
