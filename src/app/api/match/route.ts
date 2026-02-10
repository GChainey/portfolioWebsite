import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { cvData } from '@/content/cv'

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

const SYSTEM_PROMPT = `You are a witty recruitment analyst creating a compelling, lighthearted comparison showing why a specific candidate is the perfect fit for a role. Your tone is playful and confident — like a friend hyping someone up at a party. Be funny but never mean-spirited about "other candidates."

CANDIDATE PROFILE:
${cvData.llmContext}

INSTRUCTIONS:
1. Analyze the job description carefully
2. Extract the job title and company name (use "this role" and "this company" if not found)
3. Generate 8-12 comparison points. Each must have:
   - "category": A short label (2-4 words) like "Prototyping Speed", "Discovery Chops", "AI Fluency"
   - "garethTrait": What Gareth specifically brings — use real numbers, tools, and achievements from his profile. Be specific, not generic.
   - "otherTrait": What a typical candidate probably offers — gently satirical, relatable, a bit self-deprecating on their behalf. Think "Sends Figma links and hopes for the best" not "Bad at design."
   - "wittyComment": A punchy one-liner observation. Think stand-up comedy meets LinkedIn. Keep under 15 words.
4. Tailor comparisons to the SPECIFIC requirements in the job posting — don't just list generic skills
5. Prioritize Gareth's rare combination: design + shipping real code + AI-native workflow + discovery experience
6. Mix serious achievements (revenue numbers, team growth) with playful framing
7. End with 1-2 personality/culture-fit comparisons (e.g., "Vibe Check", "Team Energy")

RESPOND WITH VALID JSON ONLY. No markdown, no code fences, no explanation. Just the JSON object:
{
  "jobTitle": "extracted job title",
  "company": "extracted company name or 'this company'",
  "comparisons": [
    {
      "category": "Category Name",
      "garethTrait": "What Gareth brings",
      "otherTrait": "What others typically bring",
      "wittyComment": "A witty observation"
    }
  ]
}`

export async function POST(request: NextRequest) {
  try {
    const { jobDescription } = await request.json()

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 20) {
      return NextResponse.json(
        { error: 'Please provide a job description (at least 20 characters).' },
        { status: 400 }
      )
    }

    let content: string | undefined
    let provider: string = 'none'

    // Try Groq first (free tier), fall back to Anthropic Claude
    if (process.env.GROQ_API_KEY) {
      try {
        provider = 'groq'
        const client = getGroqClient()
        const response = await client.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 2048,
          temperature: 0.7,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Analyze this job posting and generate the comparison JSON:\n\n${jobDescription.slice(0, 15000)}`,
            },
          ],
        })
        content = response.choices[0]?.message?.content ?? undefined
      } catch (groqError) {
        console.warn('Groq API failed, attempting Anthropic fallback:', groqError)
        content = undefined
      }
    }

    // Fallback to Anthropic if Groq didn't produce a result
    if (!content && process.env.ANTHROPIC_API_KEY) {
      provider = 'anthropic'
      const client = getAnthropicClient()
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20241022',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Analyze this job posting and generate the comparison JSON:\n\n${jobDescription.slice(0, 15000)}`,
          },
        ],
      })
      const textBlock = response.content.find(block => block.type === 'text')
      if (textBlock && textBlock.type === 'text') {
        content = textBlock.text
      }
    }

    if (!content) {
      if (!process.env.GROQ_API_KEY && !process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json(
          { error: 'No AI provider configured. Please set GROQ_API_KEY or ANTHROPIC_API_KEY in .env.local.' },
          { status: 503 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to generate analysis. Please try again.' },
        { status: 500 }
      )
    }

    // Parse the JSON response — strip any accidental markdown fencing
    const cleaned = content.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
    const result = JSON.parse(cleaned)

    if (!result.comparisons || !Array.isArray(result.comparisons)) {
      return NextResponse.json(
        { error: 'Analysis returned unexpected format. Please try again.' },
        { status: 422 }
      )
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('Match API error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    if (errorMessage.includes('credit') || errorMessage.includes('billing') || errorMessage.includes('quota')) {
      return NextResponse.json(
        { error: 'API credits needed. Please check billing.' },
        { status: 402 }
      )
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 422 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to analyze job posting. Please try again.' },
      { status: 500 }
    )
  }
}
