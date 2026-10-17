'use client'

import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import { Header } from '@/components/Header'
import { GALLERY_LIVE } from '@/components/Gallery'
import { Visuals } from '@/components/Visuals'

export default function GalleryPage() {
  if (!GALLERY_LIVE) notFound()

  return (
    <div className="min-h-screen bg-background transition-colors duration-700">
      <Header />

      <div className="max-w-7xl mx-auto pt-14">
        <main className="border-x border-border min-h-[calc(100vh-56px)]">
          {/* Title */}
          <section className="p-8 border-b border-border">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl font-medium text-foreground mb-4">Gallery</h1>
              <p className="text-lg text-muted max-w-2xl">
                Screens, prototypes and sites I&apos;ve designed by building them, playing as the
                real thing. Click one to open it large.
              </p>
            </motion.div>
          </section>

          <section>
            <Visuals />
          </section>
        </main>
      </div>
    </div>
  )
}
