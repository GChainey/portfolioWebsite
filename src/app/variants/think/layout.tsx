import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Think · Homepage variant | Gareth Chainey',
  description: 'AI-native, text-led homepage A/B variant for Gareth Chainey’s portfolio.',
  robots: { index: false, follow: false },
}

export default function ThinkVariantLayout({ children }: { children: React.ReactNode }) {
  return children
}
