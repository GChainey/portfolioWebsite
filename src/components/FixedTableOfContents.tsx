'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { extractHeadings, type TocHeading } from './TableOfContents'
import type { ContentBlock } from '@/content/projects'

interface FixedTableOfContentsProps {
  blocks: ContentBlock[]
}

export function FixedTableOfContents({ blocks }: FixedTableOfContentsProps) {
  const [mounted, setMounted] = useState(false)
  const [isPastInline, setIsPastInline] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [leftPos, setLeftPos] = useState<number>(0)
  const panelRef = useRef<HTMLDivElement>(null)

  const headings = extractHeadings(blocks)
  const h2Headings = headings.filter(h => h.level === 2)

  // Don't render if not enough headings
  const shouldRender = h2Headings.length >= 2

  // Mount portal target
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate left position from article element
  const updateLeftPos = useCallback(() => {
    const article = document.querySelector('article')
    if (article) {
      const rect = article.getBoundingClientRect()
      setLeftPos(rect.left)
    }
  }, [])

  // Track scroll to show/hide and update position
  useEffect(() => {
    if (!shouldRender) return

    const handleScroll = () => {
      // Find the inline TOC wrapper
      const inlineToc = document.querySelector('[data-inline-toc]')
      if (inlineToc) {
        const rect = inlineToc.getBoundingClientRect()
        setIsPastInline(rect.bottom < 0)
      }
      updateLeftPos()
    }

    const handleResize = () => {
      updateLeftPos()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })

    // Initial calculation
    updateLeftPos()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [shouldRender, updateLeftPos])

  // Track active heading via IntersectionObserver
  useEffect(() => {
    if (!shouldRender) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )

    // Observe all heading elements
    headings.forEach(h => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [shouldRender, headings])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    // Use setTimeout to avoid the opening click triggering close
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  const handleScrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setTimeout(() => setIsOpen(false), 300)
    }
  }, [])

  if (!mounted || !shouldRender) return null

  const show = isPastInline

  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: `${leftPos - 8}px`,
        top: '50%',
        transform: show ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(20px)',
        zIndex: 45,
        pointerEvents: show ? 'auto' : 'none',
        opacity: show ? 1 : 0,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
      className="hidden lg:block"
    >
      {/* Compact lines - rest state */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            padding: '8px 4px',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
          }}
          aria-label="Open table of contents"
        >
          {h2Headings.map((h, i) => (
            <div
              key={h.id}
              style={{
                width: h.id === activeId ? '20px' : '12px',
                height: '2px',
                backgroundColor: 'var(--foreground)',
                opacity: h.id === activeId ? 0.7 : 0.25,
                borderRadius: '1px',
                transition: 'all 0.2s ease',
                transitionDelay: show ? `${i * 50}ms` : '0ms',
              }}
            />
          ))}
        </button>
      )}

      {/* Expanded panel */}
      {isOpen && (
        <div
          ref={panelRef}
          style={{
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '12px 16px',
            minWidth: '200px',
            maxWidth: '260px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--muted)',
              marginBottom: '8px',
              opacity: 0.6,
            }}
          >
            Contents
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {headings.map(h => (
              <li key={h.id}>
                <button
                  onClick={() => handleScrollTo(h.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    fontSize: h.level === 3 ? '12px' : '13px',
                    lineHeight: '1.5',
                    padding: '2px 0',
                    paddingLeft: h.level === 3 ? '12px' : '0',
                    color: h.id === activeId ? 'var(--foreground)' : 'var(--muted)',
                    opacity: h.id === activeId ? 1 : 0.6,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.15s ease, opacity 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--foreground)'
                    e.currentTarget.style.opacity = '1'
                  }}
                  onMouseLeave={(e) => {
                    if (h.id !== activeId) {
                      e.currentTarget.style.color = 'var(--muted)'
                      e.currentTarget.style.opacity = '0.6'
                    }
                  }}
                >
                  {h.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>,
    document.body
  )
}
