import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Essays | Gareth Chainey',
  description: 'How AI changes the way a product designer works.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
