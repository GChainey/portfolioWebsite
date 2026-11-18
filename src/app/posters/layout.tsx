import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { PARKED_LIVE } from '@/content/parked'

// Poster studies (typography, colour and style practice) are on the dev server only: the live site
// returns 404. Listed on /parked.
export default function PostersLayout({ children }: { children: ReactNode }) {
  if (!PARKED_LIVE) notFound()
  return children
}
