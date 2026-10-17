import type { Metadata } from 'next'

// The page is a client component, so its title and link preview are set here
const title = 'Screen recordings as HTML, not video'
const description = 'The same screen recordings as HTML and as video: up to 158 times smaller, and sharp at any zoom.'

export const metadata: Metadata = {
  metadataBase: new URL('https://garethchainey.com'),
  title: `${title} | Gareth Chainey`,
  description,
  openGraph: { title, description, url: '/replay-vs-video', type: 'article', images: [{ url: '/replays/compare/og.png', width: 2400, height: 1260, alt: 'A screen recording as video and as HTML, zoomed in side by side' }] },
  twitter: { card: 'summary_large_image', title, description, images: ['/replays/compare/og.png'] },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
