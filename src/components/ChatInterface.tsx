'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const PRECONFIGURED_QUESTIONS = [
  "How has your role as a product designer evolved with AI?",
  "What AI tools do you use in your design workflow?",
  "Can you share examples of AI-enhanced projects?",
  "How do you see AI shaping the future of design?",
]

const ABOUT_CONTEXT = `You are an AI assistant representing Gareth Chainey, a product designer who has embraced AI to transform their role and massively increase their impact.

Key points about Gareth:
- Product designer who actively uses AI in their workflow
- Has transitioned from traditional design to AI-augmented design
- Uses tools like Claude, Cursor, and other AI assistants
- Believes in the multiplication of capabilities through AI
- Active on GitHub (GChainey) contributing to projects
- Focused on showing the transformation of the designer role
- Works on projects involving enterprise AI

When answering, speak as if you're helping visitors learn about Gareth's work and philosophy around AI in design. Be conversational, insightful, and specific about how AI changes design work.`

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: ABOUT_CONTEXT
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
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

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-medium text-foreground">Ask me anything</h3>
        <p className="text-xs text-muted mt-1">Chat with AI to learn about my work</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-scroll p-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted">Try asking:</p>
            {PRECONFIGURED_QUESTIONS.map((q, i) => (
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
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-foreground text-background rounded-tl-lg rounded-tr-lg rounded-bl-lg'
                    : 'bg-border text-foreground rounded-tl-lg rounded-tr-lg rounded-br-lg'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-1 p-3"
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-muted rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
              />
            ))}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 bg-transparent border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded disabled:opacity-50 transition-opacity"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
