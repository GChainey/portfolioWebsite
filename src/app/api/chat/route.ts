import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { searchInterview } from '@/lib/interview-search'
import { checkLimits, recordUsage, MAX_CONTEXT_CHARS, MAX_HISTORY_MESSAGES, MAX_MESSAGE_CHARS } from '@/lib/chat-limits'

// Lazy-init to avoid build-time errors when env vars aren't available
const isProduction = process.env.NODE_ENV === 'production'

let anthropicClient: Anthropic | null = null
let groqClient: OpenAI | null = null

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return anthropicClient
}

function getGroqClient(): OpenAI {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not set')
    }
    groqClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    })
  }
  return groqClient
}

// A few of Gareth's recorded interview answers that relate to what the visitor is asking, as
// background for the reply. Searched on the last two visitor messages, so a follow-up like
// "why?" still finds the subject. Added here, not by the client, so a visitor can't edit them.
function interviewNotes(messages: ChatMessage[]): string {
  const query = messages
    .filter(m => m.role === 'user')
    .slice(-2)
    .map(m => m.content)
    .join(' ')
  const matches = searchInterview(query)
  if (matches.length === 0) return ''

  const notes = matches.map(m => `- Asked "${m.answer.question}", Gareth said: ${m.answer.answer}`).join('\n')
  return `

BACKGROUND FROM GARETH'S INTERVIEW:
Notes from a recorded interview with Gareth that relate to this question. They're background, not a script: answer in your own short, conversational words, keep his opinions and any specifics, and don't paste or recite them. Only use what's relevant, and don't add views he hasn't given.
${notes}`
}

type ChatMessage = { role: 'user' | 'assistant'; content: string }

function sanitizeMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return []
  const cleaned = raw
    .filter(
      (m): m is ChatMessage =>
        m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim() !== ''
    )
    .map(m => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }))
    .slice(-MAX_HISTORY_MESSAGES)
  // The API requires the conversation to start with a user turn
  while (cleaned.length && cleaned[0].role !== 'user') cleaned.shift()
  return cleaned
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const messages = sanitizeMessages(body.messages)
    const clientContext = typeof body.context === 'string' ? body.context.slice(0, MAX_CONTEXT_CHARS) : ''
    const context = clientContext + interviewNotes(messages)

    if (messages.length === 0) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }

    let content: string | undefined

    if (isProduction) {
      if (!process.env.ANTHROPIC_API_KEY) {
        console.error('ANTHROPIC_API_KEY is not set in production')
        return NextResponse.json({ error: 'Chat is offline for now.' }, { status: 503 })
      }

      const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
      const limit = await checkLimits(ip)
      if (!limit.ok) {
        return NextResponse.json({ error: limit.error }, { status: limit.status })
      }

      // Production: Anthropic Haiku 4.5
      const client = getAnthropicClient()
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: context,
        messages,
      })
      await recordUsage(response.usage.input_tokens, response.usage.output_tokens)
      const textBlock = response.content.find(block => block.type === 'text')
      if (textBlock && textBlock.type === 'text') {
        content = textBlock.text
      }
    } else {
      // Dev: Groq free tier. Low reasoning effort, or the thinking uses up the token budget
      const client = getGroqClient()
      const response = await client.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        reasoning_effort: 'low',
        max_tokens: 1024,
        temperature: 0.7,
        messages: [{ role: 'system', content: context }, ...messages],
      })
      content = response.choices[0]?.message?.content ?? undefined
    }

    if (content) {
      return NextResponse.json({ content })
    }

    return NextResponse.json({ content: 'Unable to generate response' })
  } catch (error: unknown) {
    console.error('Chat API error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (errorMessage.includes('credit') || errorMessage.includes('billing') || errorMessage.includes('quota')) {
      return NextResponse.json(
        { error: 'API credits needed. Please check your billing.' },
        { status: 402 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
