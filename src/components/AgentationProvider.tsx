'use client'

import { useEffect, useState } from 'react'
import { Agentation } from 'agentation'

export function AgentationProvider() {
  // Not inside an iframe: a page embedded in another (the poster explainers, the case studies'
  // live embeds) would show its own button, and it would end up in rendered videos
  const [framed, setFramed] = useState(true)
  useEffect(() => setFramed(window.self !== window.top), [])

  if (process.env.NODE_ENV !== 'development' || framed) {
    return null
  }

  return <Agentation />
}
