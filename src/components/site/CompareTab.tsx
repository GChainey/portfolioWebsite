'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PARKED_LIVE } from '@/content/parked'
import { GREY, INK, LINE, SHADOW, SHELL } from './style'

// Dev server only: a little tab, bottom left, to flip between the two versions of the RFP short
// case study (the live /work/rfp and the template's /draft/daisy-assess) or see them side by side.
// Hidden inside the side-by-side frames themselves.
const TABS = [
  { href: '/work/rfp', label: 'Current' },
  { href: '/draft/daisy-assess', label: 'Template' },
  { href: '/draft/compare', label: 'Side by side' },
]

export function CompareTab() {
  const path = usePathname()
  const [framed, setFramed] = useState(true)
  useEffect(() => setFramed(window.self !== window.top), [])
  if (!PARKED_LIVE || framed) return null
  return (
    <nav className="fixed bottom-4 left-4 z-50 flex flex-col gap-1.5 rounded-[16px] bg-white p-2 text-[13px] leading-[20px]" style={{ boxShadow: SHADOW, color: INK, outline: `1px solid ${LINE}` }}>
      <span className="px-1" style={{ color: GREY }}>RFP case study</span>
      <div className="flex gap-1 rounded-[10px] p-0.5" style={{ background: SHELL }}>
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className="rounded-[8px] px-2.5 py-1 transition-[background-color,box-shadow] duration-150" style={t.href === path ? { background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' } : { color: GREY }}>{t.label}</Link>
        ))}
      </div>
    </nav>
  )
}
