'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export interface ComparisonItem {
  category: string
  garethTrait: string
  otherTrait: string
  wittyComment: string
}

interface ComparisonTableProps {
  comparisons: ComparisonItem[]
  jobTitle: string
  company: string
  isLoading: boolean
}

const LOADING_MESSAGES = [
  'Scanning job requirements...',
  'Cross-referencing Gareth\'s superpowers...',
  'Calibrating confidence levels...',
  'Preparing to make other candidates nervous...',
  'Checking if Gareth can ship this page faster than you can read it...',
  'Quantifying years of design + code experience...',
  'Almost done. Other designers would still be opening Figma...',
  'Generating the most compelling case you\'ll see today...',
]

function SkeletonRow({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="border-b border-border p-4"
    >
      {/* Category skeleton */}
      <div className="h-3 w-24 bg-border/60 rounded animate-pulse mb-3" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gareth side skeleton */}
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-green-500/20 animate-pulse flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-border/50 rounded animate-pulse w-full" />
            <div className="h-3.5 bg-border/40 rounded animate-pulse w-3/4" />
          </div>
        </div>

        {/* Other side skeleton */}
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-red-500/20 animate-pulse flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-border/50 rounded animate-pulse w-full" />
            <div className="h-3.5 bg-border/40 rounded animate-pulse w-2/3" />
          </div>
        </div>
      </div>

      {/* Witty comment skeleton */}
      <div className="mt-3 h-3 bg-border/30 rounded animate-pulse w-1/2 ml-8" />
    </motion.div>
  )
}

function ComparisonRow({ item, index }: { item: ComparisonItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className="border-b border-border p-4"
    >
      {/* Category */}
      <p className="text-xs text-muted uppercase tracking-widest mb-3 font-medium">
        {item.category}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gareth */}
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: index * 0.12 + 0.2, stiffness: 300, damping: 15 }}
          >
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          </motion.div>
          <p className="text-sm text-foreground">{item.garethTrait}</p>
        </div>

        {/* Others */}
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: index * 0.12 + 0.35, stiffness: 300, damping: 15 }}
          >
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          </motion.div>
          <p className="text-sm text-muted">{item.otherTrait}</p>
        </div>
      </div>

      {/* Witty comment */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.12 + 0.4 }}
        className="text-xs text-muted italic mt-3 ml-8"
      >
        {item.wittyComment}
      </motion.p>
    </motion.div>
  )
}

export function ComparisonTable({ comparisons, jobTitle, company, isLoading }: ComparisonTableProps) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (!isLoading) return
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [isLoading])

  return (
    <div>
      {/* Header */}
      <div className="border-b border-border p-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="h-5 w-48 bg-border/50 rounded animate-pulse mb-2" />
              <div className="h-3 w-32 bg-border/40 rounded animate-pulse" />
            </motion.div>
          ) : (
            <motion.div
              key="loaded-header"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-lg font-medium text-foreground">
                {jobTitle} {company !== 'this company' ? `at ${company}` : ''}
              </h2>
              <p className="text-sm text-muted mt-1">
                {comparisons.length} reasons to hire Gareth
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-border/10 border-b border-border">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-green-500">Gareth</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm font-medium text-red-500">Other Candidates</span>
        </div>
      </div>

      {/* Rows */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonRow key={i} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {comparisons.map((item, i) => (
              <ComparisonRow key={i} item={item} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading message */}
      {isLoading && (
        <div className="p-4 border-b border-border">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-muted italic text-center"
            >
              {LOADING_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      )}

      {/* Summary footer */}
      {!isLoading && comparisons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: comparisons.length * 0.12 + 0.3 }}
          className="p-6 bg-accent/10 rounded-b-lg"
        >
          <p className="text-sm font-medium text-foreground mb-1">
            Match Score: {comparisons.length}/{comparisons.length} in Gareth&apos;s favor
          </p>
          <p className="text-xs text-muted mb-4">
            Look, we&apos;re not saying it&apos;s not even close... but it&apos;s not even close.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-accent text-background text-sm font-medium rounded-full px-5 py-2 hover:brightness-110 transition-all"
          >
            Convinced? Get in touch
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}
    </div>
  )
}
