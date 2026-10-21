import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { KitWall } from '@/components/kit/KitWall'
import { KIT_LIVE } from '@/content/kit'

// The component wall on its own page, for working on it. The homepage shows the same wall.
export default function KitPage() {
  if (!KIT_LIVE) notFound()

  return (
    <div className="min-h-screen bg-background transition-colors duration-700">
      <Header />
      <main className="mx-auto max-w-7xl pt-14">
        <div className="border-x border-border">
          <div className="px-8 pb-2 pt-16 text-center">
            <p className="mb-3 text-xs uppercase tracking-widest text-muted">Enterprise AI</p>
            <h1 className="text-4xl font-medium tracking-tight text-foreground">Pieces of the products</h1>
            <p className="mx-auto mt-3 max-w-xl text-muted">Designed and built for four Enterprise AI apps. Click one to see it working in its app.</p>
          </div>
          <KitWall />
        </div>
      </main>
    </div>
  )
}
