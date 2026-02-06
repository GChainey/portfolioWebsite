'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/Header'
import { FeedCard } from '@/components/FeedCard'
import { FeedFilterBar } from '@/components/FeedFilterBar'
import { buildFeedItems, getAllFeedTags, type FeedItemType } from '@/content/feed'

export default function FeedPage() {
  const [activeType, setActiveType] = useState<FeedItemType | 'all'>('all')
  const [activeTags, setActiveTags] = useState<string[]>([])

  const allItems = useMemo(() => buildFeedItems(), [])

  const filteredItems = useMemo(() => {
    let items = allItems

    if (activeType !== 'all') {
      items = items.filter((item) => item.type === activeType)
    }

    if (activeTags.length > 0) {
      items = items.filter((item) =>
        activeTags.every((tag) => item.tags.includes(tag))
      )
    }

    return items
  }, [allItems, activeType, activeTags])

  const allTags = useMemo(() => {
    // Show tags relevant to the currently filtered type
    const itemsForTags = activeType !== 'all'
      ? allItems.filter((item) => item.type === activeType)
      : allItems
    return getAllFeedTags(itemsForTags)
  }, [allItems, activeType])

  const handleTypeChange = (type: FeedItemType | 'all') => {
    setActiveType(type)
    setActiveTags([]) // Clear tags when switching type
  }

  const handleTagToggle = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleClearTags = () => {
    setActiveTags([])
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-700">
      <Header />

      <div className="max-w-7xl mx-auto pt-14">
        <main className="border-x border-border min-h-[calc(100vh-56px)]">
          {/* Page header */}
          <section className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl font-medium text-foreground mb-4">Feed</h1>
              <p className="text-lg text-muted max-w-2xl">
                Essays, case studies, influences, and development updates — all in one place.
              </p>
            </motion.div>
          </section>

          {/* Sticky filter bar */}
          <FeedFilterBar
            activeType={activeType}
            activeTags={activeTags}
            allTags={allTags}
            onTypeChange={handleTypeChange}
            onTagToggle={handleTagToggle}
            onClearTags={handleClearTags}
          />

          {/* Feed items */}
          <section className="p-6 space-y-4">
            {filteredItems.map((item, index) => (
              <FeedCard key={item.id} item={item} index={index} />
            ))}

            {filteredItems.length === 0 && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-muted mb-2">No items match your filters.</p>
                <button
                  onClick={() => {
                    setActiveType('all')
                    setActiveTags([])
                  }}
                  className="text-sm text-accent hover:underline"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
