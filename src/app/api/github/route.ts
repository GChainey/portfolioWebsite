import { NextResponse } from 'next/server'

export interface ContributionDay {
  date: string
  count: number
}

export interface GitHubContributionsResponse {
  totalContributions: number
  days: ContributionDay[]
  fetchedAt: string
}

// In-memory cache
let cachedData: GitHubContributionsResponse | null = null
let cacheTimestamp = 0
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql'
const DAY_MS = 24 * 60 * 60 * 1000

interface CalendarResponse {
  contributionCalendar: {
    totalContributions: number
    weeks: { contributionDays: { date: string; contributionCount: number }[] }[]
  }
}

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
    // A contributionsCollection can span at most one year, so fetch the last
    // two years as two aliased windows. Using `viewer` (the token's owner)
    // means the calendar already includes private contributions — adding
    // restrictedContributionsCount on top would double count them.
    const now = Date.now()
    const yearAgo = new Date(now - 365 * DAY_MS).toISOString()
    const twoYearsAgo = new Date(now - 730 * DAY_MS).toISOString()
    const query = `
      query {
        viewer {
          recent: contributionsCollection(from: "${yearAgo}", to: "${new Date(now).toISOString()}") {
            contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
          }
          prior: contributionsCollection(from: "${twoYearsAgo}", to: "${yearAgo}") {
            contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
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
    const recent: CalendarResponse | undefined = data?.data?.viewer?.recent
    const prior: CalendarResponse | undefined = data?.data?.viewer?.prior
    const totalContributions = recent?.contributionCalendar?.totalContributions

    if (!recent || !prior || typeof totalContributions !== 'number') {
      throw new Error('Unexpected response shape from GitHub API')
    }

    // The two windows share a boundary day; key by date to de-duplicate
    const byDate = new Map<string, number>()
    for (const calendar of [prior, recent]) {
      for (const week of calendar.contributionCalendar.weeks) {
        for (const day of week.contributionDays) {
          byDate.set(day.date, day.contributionCount)
        }
      }
    }
    const days = Array.from(byDate, ([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    cachedData = {
      totalContributions,
      days,
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
