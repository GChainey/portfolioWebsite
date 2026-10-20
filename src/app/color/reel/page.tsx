import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { ColorReel } from '@/components/color/ColorReel'
import { COLOR_LIVE } from '@/content/color'

// Every chapter of Interaction of Color in one reel. Scenes are in src/content/colorReel.ts.
export const metadata: Metadata = { title: 'Sizzle reel | Interaction of Color | Gareth Chainey' }

export default function ColorReelPage() {
  if (!COLOR_LIVE) notFound()

  return (
    <div className="min-h-screen bg-background">
      <Header showBack />
      <main className="mx-auto max-w-7xl pt-14">
        <ColorReel />
      </main>
    </div>
  )
}
