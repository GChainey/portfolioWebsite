'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Testimonial {
  name: string
  role: string
  company: string
  content: string
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[]
  animationDelay?: number
}

export function TestimonialCarousel({ testimonials, animationDelay = 0 }: TestimonialCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Each card shows 50% width, so total "pages" is testimonials.length - 1
  // (since we see 2 at a time, last page starts at index length-2)
  const totalDots = Math.max(1, testimonials.length - 1)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return

    const scrollLeft = el.scrollLeft
    const maxScroll = el.scrollWidth - el.clientWidth
    const cardWidth = el.scrollWidth / testimonials.length

    setCanScrollLeft(scrollLeft > 5)
    setCanScrollRight(scrollLeft < maxScroll - 5)

    // Determine which dot is active based on scroll position
    const index = Math.round(scrollLeft / cardWidth)
    setActiveIndex(Math.min(index, totalDots - 1))
  }, [testimonials.length, totalDots])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      ro.disconnect()
    }
  }, [updateScrollState])

  const scrollTo = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.scrollWidth / testimonials.length
    el.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' })
  }

  const scrollToDot = (index: number) => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.scrollWidth / testimonials.length
    el.scrollTo({ left: cardWidth * index, behavior: 'smooth' })
  }

  return (
    <div>
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        <div className="flex" style={{ width: `${testimonials.length * 50}%` }}>
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              className={`flex-shrink-0 p-5 ${index === 0 ? 'pl-8' : ''} ${index < testimonials.length - 1 ? 'border-r border-border' : ''}`}
              style={{ width: `${100 / testimonials.length}%`, scrollSnapAlign: 'start' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: animationDelay + index * 0.08 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-foreground font-medium text-sm flex-shrink-0">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted">{testimonial.role} · {testimonial.company}</p>
                </div>
              </div>
              <p className="text-sm text-muted leading-relaxed">{testimonial.content}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Navigation: arrows + dots */}
      <div className="flex items-center justify-center gap-2 py-2 border-t border-border">
        <button
          onClick={() => scrollTo('left')}
          disabled={!canScrollLeft}
          className={`rounded transition-colors ${canScrollLeft ? 'text-muted hover:text-foreground' : 'invisible'}`}
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalDots }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToDot(i)}
              className={`rounded-full transition-all ${
                i === activeIndex
                  ? 'w-1.5 h-1.5 bg-foreground'
                  : 'w-1 h-1 bg-muted hover:bg-foreground/50'
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => scrollTo('right')}
          disabled={!canScrollRight}
          className={`rounded transition-colors ${canScrollRight ? 'text-muted hover:text-foreground' : 'invisible'}`}
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
