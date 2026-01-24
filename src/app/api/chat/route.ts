import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json()

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: context,
      messages: messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content
      }))
    })

    const content = response.content[0]
    if (content.type === 'text') {
      return NextResponse.json({ content: content.text })
    }

    return NextResponse.json({ content: 'Unable to generate response' })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
