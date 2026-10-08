import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Show · Homepage variant | Gareth Chainey',
  description: 'Visual-first homepage A/B variant for Gareth Chainey’s portfolio.',
  robots: { index: false, follow: false },
}

export default function ShowVariantLayout({ children }: { children: React.ReactNode }) {
  return children
}
