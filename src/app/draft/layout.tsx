import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { PARKED_LIVE } from '@/content/parked'

// The draft homepage and its pages (/draft, /draft/rfp, /draft/essays) are on the dev server only:
// the live site returns 404 until the design is chosen. Listed on /parked as "Draft homepage".
export default function DraftLayout({ children }: { children: ReactNode }) {
  if (!PARKED_LIVE) notFound()
  return children
}
