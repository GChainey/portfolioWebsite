import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json()

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 256,
      temperature: 0.7,
      messages: [
        { role: 'system', content: context },
        ...messages.map((msg: { role: string; content: string }) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ]
    })

    const content = response.choices[0]?.message?.content
    if (content) {
      return NextResponse.json({ content })
    }

    return NextResponse.json({ content: 'Unable to generate response' })
  } catch (error: unknown) {
    console.error('Chat API error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
      return NextResponse.json(
        { error: 'API credits needed. Please check your OpenAI billing.' },
        { status: 402 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
