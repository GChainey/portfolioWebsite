'use client'

import { CompareTab } from '@/components/site/CompareTab'
import { GREY, INK, LINE } from '@/components/site/style'

// The two versions of the RFP short case study side by side (dev server only): each page in its own
// frame, scrolling on its own
const SIDES = [
  { src: '/work/rfp', label: 'Current · /work/rfp' },
  { src: '/draft/daisy-assess', label: 'Template · /draft/daisy-assess' },
]

export default function CompareRfp() {
  return (
    <div className="grid h-screen grid-cols-2 bg-white text-[13px] leading-[20px]" style={{ color: INK }}>
      {SIDES.map((s, i) => (
        <div key={s.src} className="flex min-h-0 flex-col" style={{ borderLeft: i ? `1px solid ${LINE}` : undefined }}>
          <a href={s.src} className="px-4 py-2" style={{ color: GREY, borderBottom: `1px solid ${LINE}` }}>{s.label}</a>
          <iframe src={s.src} title={s.label} className="min-h-0 w-full flex-1" />
        </div>
      ))}
      <CompareTab />
    </div>
  )
}
