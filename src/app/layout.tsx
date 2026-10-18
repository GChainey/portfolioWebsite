import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Caveat } from 'next/font/google'
import { ThemeProvider } from '@/context/ThemeContext'
import { FeatureFlagProvider } from '@/context/FeatureFlagContext'
import { FeatureFlagDrawer } from '@/components/FeatureFlagDrawer'
import { AgentationProvider } from '@/components/AgentationProvider'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-signature',
})

export const metadata: Metadata = {
  title: 'Gareth Chainey | Product Designer × AI',
  description: 'Product designer showcasing the transformation of design through AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Day mode and amber only: one opinionated look, no theme menu
  return (
    <html lang="en" className="accent-amber" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} ${caveat.variable} antialiased`}>
        <ThemeProvider>
          <FeatureFlagProvider>
            <ScrollToTop />
            {children}
            <FeatureFlagDrawer />
          </FeatureFlagProvider>
        </ThemeProvider>
        <AgentationProvider />
        <Analytics />
      </body>
    </html>
  )
}
