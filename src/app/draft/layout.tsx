import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { PARKED_LIVE } from '@/content/parked'

// Work in progress for the short case studies (/draft/apps-table) is on the dev server only: the
// live site returns 404. Listed on /parked.
export default function DraftLayout({ children }: { children: ReactNode }) {
  if (!PARKED_LIVE) notFound()
  return children
}
