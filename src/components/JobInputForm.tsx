'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Upload, Link, FileText, Loader2 } from 'lucide-react'

type Tab = 'paste' | 'url' | 'upload'

interface JobInputFormProps {
  onSubmit: (jobText: string) => void
  isLoading: boolean
}

export function JobInputForm({ onSubmit, isLoading }: JobInputFormProps) {
  const [activeTab, setActiveTab] = useState<Tab>('paste')
  const [pasteText, setPasteText] = useState('')
  const [urlValue, setUrlValue] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileText, setFileText] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'paste', label: 'Paste Text', icon: <FileText className="w-4 h-4" /> },
    { id: 'url', label: 'From URL', icon: <Link className="w-4 h-4" /> },
    { id: 'upload', label: 'Upload File', icon: <Upload className="w-4 h-4" /> },
  ]

  const handleSubmit = async () => {
    setError('')

    if (activeTab === 'paste') {
      if (pasteText.trim().length < 20) {
        setError('Please paste a job description (at least a few sentences).')
        return
      }
      onSubmit(pasteText.trim())
    } else if (activeTab === 'url') {
      if (!urlValue.trim()) {
        setError('Please enter a URL.')
        return
      }
      setUrlLoading(true)
      try {
        const res = await fetch('/api/fetch-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlValue.trim() }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Could not fetch URL.')
          return
        }
        onSubmit(data.text)
      } catch {
        setError('Could not fetch that URL. Try pasting the job description instead.')
      } finally {
        setUrlLoading(false)
      }
    } else if (activeTab === 'upload') {
      if (!fileText) {
        setError('Please upload a file first.')
        return
      }
      onSubmit(fileText)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 1024 * 1024) {
      setError('File is too large (max 1MB). Try pasting the text instead.')
      return
    }

    setFileName(file.name)

    if (file.name.endsWith('.txt') || file.type === 'text/plain') {
      const text = await file.text()
      setFileText(text)
    } else if (file.name.endsWith('.pdf')) {
      // For PDFs, read as text — won't work for all PDFs but handles text-based ones
      try {
        const text = await file.text()
        // If it looks like binary PDF data, suggest copy-paste instead
        if (text.includes('%PDF') && text.length > 100 && !/[a-zA-Z]{10,}/.test(text.slice(100, 500))) {
          setError('This PDF has embedded formatting. Please open it and copy-paste the text instead.')
          setFileText('')
          return
        }
        setFileText(text)
      } catch {
        setError('Could not read this file. Try pasting the text instead.')
      }
    } else {
      setError('Only .txt and .pdf files are supported. For other formats, copy-paste the text.')
    }
  }

  const isSubmitDisabled =
    isLoading ||
    urlLoading ||
    (activeTab === 'paste' && !pasteText.trim()) ||
    (activeTab === 'url' && !urlValue.trim()) ||
    (activeTab === 'upload' && !fileText)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Tabs */}
      <div className="flex gap-0 border-b border-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setError('') }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-accent border-accent'
                : 'text-muted border-transparent hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[200px]">
        {activeTab === 'paste' && (
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={10}
            className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-y"
            placeholder="Paste the full job description here..."
          />
        )}

        {activeTab === 'url' && (
          <div className="space-y-3">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              placeholder="https://www.seek.com.au/job/12345678"
            />
            <p className="text-xs text-muted">
              We&apos;ll fetch the page content server-side. Some sites may block this — if so, just paste the text.
            </p>
          </div>
        )}

        {activeTab === 'upload' && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-8 h-8 text-muted mx-auto mb-3" />
            {fileName ? (
              <p className="text-sm text-foreground">{fileName}</p>
            ) : (
              <>
                <p className="text-sm text-foreground mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-muted">.txt or .pdf files (max 1MB)</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 mt-3">{error}</p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitDisabled}
        className="mt-6 inline-flex items-center gap-2 bg-accent text-background text-sm font-medium rounded-full px-6 py-2.5 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {urlLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Fetching URL...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Analyze Match
          </>
        )}
      </button>
    </motion.div>
  )
}
