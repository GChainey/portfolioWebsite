import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { PARKED_LIVE } from '@/content/parked'

// Creative work (posters and fun studies) is on the dev server only for now: the live site returns
// 404. Listed on /parked.
export default function CreativeLayout({ children }: { children: ReactNode }) {
  if (!PARKED_LIVE) notFound()
  return children
}
