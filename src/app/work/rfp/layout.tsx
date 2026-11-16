import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Winning a tender | Gareth Chainey',
  description: 'One designer answered a state government tender with a working product, built with AI. $2 million in deals won since.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
