import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/context/ThemeContext'
import { FeatureFlagProvider } from '@/context/FeatureFlagContext'
import { FeatureFlagDrawer } from '@/components/FeatureFlagDrawer'
import { AgentationProvider } from '@/components/AgentationProvider'
import { ScrollToTop } from '@/components/ScrollToTop'
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
    <html lang="en" className="dark accent-amber" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('theme-mode');var a=localStorage.getItem('theme-accent')||'amber';var d=document.documentElement;d.className=d.className.split(' ').filter(function(c){return!c.startsWith('accent-')}).join(' ');d.classList.add('accent-'+a);if(m==='light'){d.classList.remove('dark')}else if(m==='system'){if(!window.matchMedia('(prefers-color-scheme: dark)').matches){d.classList.remove('dark')}};}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${mono.variable} antialiased`}>
        <ThemeProvider>
          <FeatureFlagProvider>
            <ScrollToTop />
            {children}
            <FeatureFlagDrawer />
          </FeatureFlagProvider>
        </ThemeProvider>
        <AgentationProvider />
      </body>
    </html>
  )
}
