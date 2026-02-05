import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Lazy-init to avoid build-time errors when env vars aren't available
let groq: OpenAI | null = null

function getGroqClient(): OpenAI {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not set')
    }
    groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    })
  }
  return groq
}

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json()

    let content: string | undefined

    const client = getGroqClient()
    const response = await client.chat.completions.create({
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
