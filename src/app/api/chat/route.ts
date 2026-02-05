import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

// Groq for dev (free tier), Anthropic for production
const isProduction = process.env.NODE_ENV === 'production'

const anthropic = isProduction && process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

const groq = !isProduction && process.env.GROQ_API_KEY
  ? new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    })
  : null

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json()

    let content: string | undefined

    if (anthropic) {
      // Production: Anthropic Haiku 4.5
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20241022',
        max_tokens: 256,
        system: context,
        messages: messages.map((msg: { role: string; content: string }) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      })
      const textBlock = response.content.find(block => block.type === 'text')
      if (textBlock && textBlock.type === 'text') {
        content = textBlock.text
      }
    } else if (groq) {
      // Dev: Groq free tier (Llama)
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 256,
        temperature: 0.7,
        messages: [
          { role: 'system', content: context },
          ...messages.map((msg: { role: string; content: string }) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
        ],
      })
      content = response.choices[0]?.message?.content ?? undefined
    } else {
      return NextResponse.json(
        { error: 'No API key configured. Set GROQ_API_KEY for dev or ANTHROPIC_API_KEY for production.' },
        { status: 500 }
      )
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
