'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/Header'
import { WorkList } from '@/components/WorkList'
import { useFeatureFlags } from '@/context/FeatureFlagContext'
import { writing } from '@/content/projects'

// The essays, one per row: the plain list that used to close the homepage
const ESSAYS = writing.filter((p) => p.category === 'Article').map((p) => p.id)

export default function EssaysPage() {
  const { flags } = useFeatureFlags()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto pt-14">
        <main className="border-x border-border min-h-[calc(100vh-56px)]">
          <section className="p-8 border-b border-border">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl font-medium tracking-tight text-foreground">Essays</h1>
            </motion.div>
          </section>
          <WorkList label={`${ESSAYS.length} essays`} ids={ESSAYS} titleBorders={flags.sectionTitleBorders} />
        </main>
      </div>
    </div>
  )
}
