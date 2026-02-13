import { NextResponse } from 'next/server'

interface CachedData {
  totalContributions: number
  fetchedAt: string
}

// In-memory cache
let cachedData: CachedData | null = null
let cacheTimestamp = 0
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql'

export async function GET() {
  // Return cached data if fresh
  if (cachedData && Date.now() - cacheTimestamp < CACHE_TTL) {
    return NextResponse.json(cachedData, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    })
  }

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return NextResponse.json(
      { error: 'GITHUB_TOKEN not configured' },
      { status: 503 }
    )
  }

  try {
    // Use viewer query (authenticated user) to include private contributions
    const query = `
      query {
        viewer {
          contributionsCollection {
            contributionCalendar {
              totalContributions
            }
            restrictedContributionsCount
          }
        }
      }
    `

    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`)
    }

    const data = await response.json()
    const collection = data?.data?.viewer?.contributionsCollection
    const publicContributions = collection?.contributionCalendar?.totalContributions
    const privateContributions = collection?.restrictedContributionsCount ?? 0

    if (typeof publicContributions !== 'number') {
      throw new Error('Unexpected response shape from GitHub API')
    }

    const totalContributions = publicContributions + privateContributions

    cachedData = {
      totalContributions,
      fetchedAt: new Date().toISOString(),
    }
    cacheTimestamp = Date.now()

    return NextResponse.json(cachedData, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    })
  } catch (error) {
    console.error('GitHub API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GitHub contributions' },
      { status: 500 }
    )
  }
}
