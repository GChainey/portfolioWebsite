'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { Header } from '@/components/Header'
import { JobInputForm } from '@/components/JobInputForm'
import { ComparisonTable, ComparisonItem } from '@/components/ComparisonTable'

interface MatchResult {
  jobTitle: string
  company: string
  comparisons: ComparisonItem[]
}

export default function MatchPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<MatchResult | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (jobText: string) => {
    setError('')
    setIsLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jobText }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setIsLoading(false)
        return
      }

      setResult(data)
    } catch {
      setError('Failed to connect. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError('')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-700">
      <Header showBack />

      <div className="max-w-7xl mx-auto pt-14">
        <main className="border-x border-border min-h-[calc(100vh-56px)]">
          {/* Hero */}
          <section className="p-8 border-b border-border">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs text-muted uppercase tracking-widest mb-4">Job Match</p>
              <h1 className="text-4xl font-medium text-foreground mb-4">
                Why Gareth?
              </h1>
              <p className="text-lg text-muted max-w-2xl">
                Paste a job description and let AI show you why Gareth is the candidate you didn&apos;t know you were looking for.
              </p>
            </motion.div>
          </section>

          {/* Input form — visible when no result and not loading */}
          <AnimatePresence>
            {!result && !isLoading && !error && (
              <motion.section
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.3 }}
                className="p-8 border-b border-border"
              >
                <JobInputForm onSubmit={handleSubmit} isLoading={isLoading} />
              </motion.section>
            )}
          </AnimatePresence>

          {/* Comparison table — skeleton or populated */}
          <AnimatePresence>
            {(isLoading || result) && (
              <motion.section
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="border-b border-border"
              >
                <ComparisonTable
                  comparisons={result?.comparisons ?? []}
                  jobTitle={result?.jobTitle ?? ''}
                  company={result?.company ?? ''}
                  isLoading={isLoading}
                />
              </motion.section>
            )}
          </AnimatePresence>

          {/* Error state */}
          <AnimatePresence>
            {error && !isLoading && (
              <motion.section
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-8 border-b border-border"
              >
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="mt-4 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try again
                </button>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Reset button — visible when result is shown */}
          {result && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-8"
            >
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Try another job
              </button>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}
