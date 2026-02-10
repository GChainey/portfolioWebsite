import { NextRequest, NextResponse } from 'next/server'

function stripHtmlToText(html: string): string {
  // Remove script, style, nav, footer, header, aside tags and their content
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')

  // Replace common block elements with newlines
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|br|hr)[^>]*>/gi, '\n')
  text = text.replace(/<br\s*\/?>/gi, '\n')

  // Strip remaining HTML tags
  text = text.replace(/<[^>]+>/g, '')

  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')

  // Clean up whitespace: collapse multiple spaces and blank lines
  text = text.replace(/[ \t]+/g, ' ')
  text = text.replace(/\n\s*\n/g, '\n\n')
  text = text.trim()

  return text
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a URL.' },
        { status: 400 }
      )
    }

    // Validate URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol')
      }
    } catch {
      return NextResponse.json(
        { error: 'Please enter a valid URL (starting with http:// or https://).' },
        { status: 400 }
      )
    }

    // Fetch with timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PortfolioBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,text/plain',
      },
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return NextResponse.json(
        { error: `Could not fetch URL (status ${response.status}). Try pasting the job description instead.` },
        { status: 502 }
      )
    }

    const html = await response.text()
    const text = stripHtmlToText(html)

    if (text.length < 50) {
      return NextResponse.json(
        { error: 'No readable content found at that URL. Try pasting the job description instead.' },
        { status: 422 }
      )
    }

    // Truncate to avoid overwhelming the AI
    return NextResponse.json({ text: text.slice(0, 15000) })
  } catch (error: unknown) {
    console.error('Fetch URL error:', error)

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'URL took too long to respond. Try pasting the job description instead.' },
        { status: 408 }
      )
    }

    return NextResponse.json(
      { error: 'Could not fetch that URL. Try pasting the job description instead.' },
      { status: 502 }
    )
  }
}
