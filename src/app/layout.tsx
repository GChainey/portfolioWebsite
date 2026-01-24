import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/context/ThemeContext'
import { FeatureFlagProvider } from '@/context/FeatureFlagContext'
import { FeatureFlagDrawer } from '@/components/FeatureFlagDrawer'
import { AgentationProvider } from '@/components/AgentationProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} antialiased`}>
        <ThemeProvider>
          <FeatureFlagProvider>
            {children}
            <FeatureFlagDrawer />
          </FeatureFlagProvider>
        </ThemeProvider>
        <AgentationProvider />
      </body>
    </html>
  )
}
