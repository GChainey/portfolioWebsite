import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { WhyteLens } from '@/components/posters/WhyteLens'

export const metadata: Metadata = {
  title: 'What to Remember When Waking · poster study',
  robots: { index: false },
}

// Poster study 02: David Whyte at Marble Collegiate Church, 14 Nov 2026. The Paper sketch (Studies
// file, "David Whyte" page) rebuilt live, so the lens shader can be tuned and set moving.
export default function WhytePosterPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  // ?embed and ?export run inside an iframe (the explainer, the case study): no site header
  const bare = 'embed' in searchParams || 'export' in searchParams
  return (
    <>
      {!bare && <Header showBack />}
      <WhyteLens />
    </>
  )
}
