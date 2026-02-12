'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ArrowUp } from 'lucide-react'
import { ContentDialog } from './ContentDialog'
import { ShimmeringText } from './ui/shimmering-text'
import { projects } from '@/content/projects'
import { Facehash } from 'facehash'

const AVATAR_COLORS = ['#1a3040', '#1d5c52', '#6b5a2a', '#7a4a2a', '#6b3530']

// Project card component for inline chat responses
function ProjectCard({ projectId }: { projectId: string }) {
  const project = projects.find(p => p.id === projectId)
  if (!project) return null

  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <div className="my-2 p-3 border border-border rounded-lg hover:border-foreground/30 transition-colors bg-background">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted uppercase tracking-wide">{project.category}</span>
          <ArrowRight className="w-3 h-3 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
        </div>
        <h4 className="font-medium text-foreground group-hover:text-accent text-sm transition-colors">{project.title}</h4>
        <p className="text-xs text-muted mt-1 line-clamp-2">{project.description}</p>
      </div>
    </Link>
  )
}

// Strip [[name:X]] tags from content
function stripNameTag(content: string): string {
  return content.replace(/\s*\[\[name:[^\]]+\]\]\s*/g, '').trim()
}

// Parse message content and render project cards
function MessageContent({ content }: { content: string }) {
  const cleaned = stripNameTag(content)
  // Match [[project:id]] pattern
  const parts = cleaned.split(/(\[\[project:[^\]]+\]\])/g)

  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/\[\[project:([^\]]+)\]\]/)
        if (match) {
          return <ProjectCard key={i} projectId={match[1]} />
        }
        return part ? <span key={i}>{part}</span> : null
      })}
    </>
  )
}

// Extract name from [[name:X]] tag in LLM response
function extractName(content: string): string | null {
  const match = content.match(/\[\[name:([^\]]+)\]\]/)
  return match ? match[1].trim() : null
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface DialogContent {
  title: string
  content: string
  link?: { href: string; label: string }
}

interface PageContext {
  page: string
  description: string
  suggestedQuestions: string[]
  followUpQuestions: string[]
}

interface ChatInterfaceProps {
  pageContext?: PageContext
  hideHeader?: boolean
}

const DEFAULT_CONTEXT: PageContext = {
  page: 'home',
  description: 'Portfolio homepage showing experience, projects, and GitHub activity',
  suggestedQuestions: [
    "How has your role evolved with AI?",
    "What's your design philosophy?",
    "What projects are you working on?",
  ],
  followUpQuestions: [
    "Tell me more about your AI workflow",
    "How do you balance speed vs quality?",
    "What tools do you use daily?",
  ]
}

const BASE_CONTEXT = `You represent Gareth Chainey. Keep responses to 2-3 sentences MAX. Be direct and conversational.

WHO GARETH IS:
- Product designer who now operates as a one-person product team: PM, Designer, QA, Engineer
- Uses AI (Claude, Cursor) to build real code, not just Figma mockups
- Creates "lite" versions of products for rapid testing and iteration

PHILOSOPHY:
- Shape Up, JTBD, Teresa Torres frameworks
- No bureaucracy—just do the thing
- Collaboration over handoff
- Early team buy-in, not late approval

AVAILABLE PROJECTS (you can link to these):
- the-future-is-now: Article about AI transformation journey
- conflict-and-experiments: How to handle disagreements with experiments
- rfp: Enterprise RFP response system
- productlite: Real code prototyping tool
- configurator: No-code LLM workflow builder
- llm-features: Features built with LLMs

TO LINK A PROJECT: Use [[project:id]] syntax. Example: "Check out my article on this transformation. [[project:the-future-is-now]]"
When someone asks about projects or examples, include a relevant project card!

EXAMPLE ANSWERS:
Q: How has your role evolved?
A: "I went from Figma to shipping real code. AI lets me be a one-person product team—PM, designer, QA, and engineer. [[project:the-future-is-now]]"

Q: What tools do you use?
A: "Claude for thinking, Cursor for coding. The stack changes weekly—I use whatever ships fastest."

Q: Show me an example project
A: "Here's ProductLite—a prototyping tool I built with AI: [[project:productlite]]"

Keep it SHORT. Answer like you're texting a colleague.`

export function ChatInterface({ pageContext = DEFAULT_CONTEXT, hideHeader = false }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showFollowUps, setShowFollowUps] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [welcomeText, setWelcomeText] = useState('')
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load user name from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('chat-user-name')
    if (stored) {
      setUserName(stored)
      setWelcomeText(`Hey ${stored}! What would you like to know?`)
    } else {
      setWelcomeText("Hey! I'm GarethLLM — Gareth's AI stand-in. What's your name?")
    }
  }, [])

  // Build context with page-specific info and name extraction
  const fullContext = `${BASE_CONTEXT}

VISITOR NAME: ${userName ? `The visitor's name is ${userName}. Use their name occasionally.` : "You don't know the visitor's name yet. Your greeting already asked for it — if they tell you, greet them warmly."}

NAME EXTRACTION:
If the visitor tells you their name at any point, include [[name:TheirName]] at the very end of your response. This tag is parsed and hidden from display. Only include it the FIRST time you learn their name. Example: "Nice to meet you, Sarah! What would you like to know? [[name:Sarah]]"

CURRENT PAGE CONTEXT:
The user is viewing: ${pageContext.page}
Page description: ${pageContext.description}
Focus answers on this context when relevant, but can reference other experience too.`

  const scrollToBottom = () => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setIsLoading(true)
    setShowFollowUps(false)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: fullContext
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      // Extract name if present in response
      const detectedName = extractName(data.content)
      if (detectedName && !userName) {
        setUserName(detectedName)
        localStorage.setItem('chat-user-name', detectedName)
      }

      // Store clean content (name tag stripped in MessageContent rendering)
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
      setShowFollowUps(true)
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment."
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const resizeTextarea = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {!hideHeader && (
        <div className="p-4 border-b border-border flex-shrink-0 flex items-center gap-3">
          <Facehash name="Gareth Chainey" size={28} showInitial enableBlink interactive={false} intensity3d="subtle" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 60%, var(--background))', borderRadius: '6px' }} />
          <h3 className="font-medium text-foreground">GarethLLM<sup className="text-xs text-muted ml-0.5">™</sup></h3>
        </div>
      )}

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto chat-scroll p-4 space-y-4">

        {/* Welcome message from GarethLLM */}
        {welcomeText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-[85%] p-3 text-sm bg-border text-foreground rounded-tl-lg rounded-tr-lg rounded-br-lg">
              {welcomeText}
            </div>
          </motion.div>
        )}

        {/* Suggested questions */}
        {messages.length === 0 && (
          <div className="space-y-2">
            {pageContext.suggestedQuestions.map((q, i) => (
              <motion.button
                key={i}
                onClick={() => sendMessage(q)}
                className="block w-full text-left text-sm p-3 border border-border rounded hover:bg-border/50 transition-colors text-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {q}
              </motion.button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-foreground text-background rounded-t-2xl rounded-bl-2xl rounded-br-md'
                    : 'bg-border text-foreground rounded-t-2xl rounded-br-2xl rounded-bl-md'
                }`}
              >
                {msg.role === 'assistant' ? <MessageContent content={msg.content} /> : msg.content}
              </div>

              {/* User avatar (once name is known) */}
              {msg.role === 'user' && userName && (
                <div className="flex-shrink-0 pt-0.5">
                  <Facehash name={userName} size={40} showInitial enableBlink interactive={false} intensity3d="subtle" colors={AVATAR_COLORS} style={{ borderRadius: '6px' }} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading state */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="max-w-[85%] px-4 py-3 text-sm bg-border text-foreground rounded-t-2xl rounded-br-2xl rounded-bl-md">
              <ShimmeringText
                text="Thinking..."
                duration={1.5}
                spread={1.5}
              />
            </div>
          </motion.div>
        )}

        {/* Follow-up questions after response */}
        {showFollowUps && !isLoading && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 pt-2"
          >
            <p className="text-xs text-muted">Follow up:</p>
            <div className="flex flex-wrap gap-2">
              {pageContext.followUpQuestions.map((q, i) => (
                <motion.button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 border border-border rounded-full hover:bg-border/50 transition-colors text-muted hover:text-foreground"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {q}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 flex-shrink-0">
        <div className="flex items-end gap-2 border border-border rounded-xl px-3 py-2 focus-within:ring-1 focus-within:ring-ring transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); resizeTextarea() }}
            onKeyDown={handleKeyDown}
            placeholder="Ask Gareth a question"
            rows={1}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus-visible:outline-none resize-none leading-[1.75rem]"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 w-7 h-7 mb-px flex items-center justify-center rounded-full transition-all disabled:opacity-30 bg-foreground text-background"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
