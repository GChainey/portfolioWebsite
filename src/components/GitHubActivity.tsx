'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface GitHubEvent {
  id: string
  type: string
  repo: { name: string }
  created_at: string
  payload: {
    action?: string
    commits?: { message: string }[]
    issue?: { title: string }
    pull_request?: { title: string }
  }
}

interface GitHubProfile {
  login: string
  name: string
  avatar_url: string
  html_url: string
  public_repos: number
  followers: number
  following: number
}

export function GitHubActivity() {
  const [profile, setProfile] = useState<GitHubProfile | null>(null)
  const [events, setEvents] = useState<GitHubEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGitHub() {
      try {
        const [profileRes, eventsRes] = await Promise.all([
          fetch('https://api.github.com/users/GChainey'),
          fetch('https://api.github.com/users/GChainey/events?per_page=10')
        ])

        if (profileRes.ok) {
          setProfile(await profileRes.json())
        }
        if (eventsRes.ok) {
          setEvents(await eventsRes.json())
        }
      } catch (error) {
        console.error('Failed to fetch GitHub data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchGitHub()
  }, [])

  const getEventDescription = (event: GitHubEvent) => {
    switch (event.type) {
      case 'PushEvent':
        return `Pushed to ${event.repo.name.split('/')[1]}`
      case 'IssuesEvent':
        return `${event.payload.action} issue in ${event.repo.name.split('/')[1]}`
      case 'PullRequestEvent':
        return `${event.payload.action} PR in ${event.repo.name.split('/')[1]}`
      case 'CreateEvent':
        return `Created in ${event.repo.name.split('/')[1]}`
      case 'WatchEvent':
        return `Starred ${event.repo.name.split('/')[1]}`
      default:
        return `Activity in ${event.repo.name.split('/')[1]}`
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Generate mock contribution data for visualization
  const generateContributions = () => {
    const weeks = 12
    const contributions = []
    for (let w = 0; w < weeks; w++) {
      const week = []
      for (let d = 0; d < 7; d++) {
        week.push(Math.floor(Math.random() * 5))
      }
      contributions.push(week)
    }
    return contributions
  }

  const contributions = generateContributions()

  if (loading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-4 bg-border rounded w-1/3 mb-4" />
        <div className="h-20 bg-border rounded" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {profile?.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-10 h-10 rounded-full border border-border"
            />
          )}
          <div>
            <h3 className="font-medium text-foreground">{profile?.name || 'Gareth Chainey'}</h3>
            <a
              href={profile?.html_url || 'https://github.com/GChainey'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted hover:text-accent transition-colors"
            >
              @{profile?.login || 'GChainey'}
            </a>
          </div>
        </div>
      </div>

      {/* Contribution Graph */}
      <div className="p-4 border-b border-border">
        <p className="text-xs text-muted mb-3">Contributions</p>
        <div className="flex gap-[2px]">
          {contributions.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {week.map((level, di) => (
                <motion.div
                  key={`${wi}-${di}`}
                  className={`contribution-cell contribution-${level}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (wi * 7 + di) * 0.005 }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="flex-1 overflow-auto">
        <p className="text-xs text-muted p-4 pb-2">Recent Activity</p>
        <div className="space-y-0">
          {events.slice(0, 6).map((event, i) => (
            <motion.div
              key={event.id}
              className="px-4 py-3 border-b border-border hover:bg-border/30 transition-colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-sm text-foreground">{getEventDescription(event)}</p>
              <p className="text-xs text-muted mt-1">{formatDate(event.created_at)}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 border-t border-border">
        <div className="p-3 text-center border-r border-border">
          <p className="text-lg font-medium text-foreground">{profile?.public_repos || 0}</p>
          <p className="text-xs text-muted">Repos</p>
        </div>
        <div className="p-3 text-center border-r border-border">
          <p className="text-lg font-medium text-foreground">{profile?.followers || 0}</p>
          <p className="text-xs text-muted">Followers</p>
        </div>
        <div className="p-3 text-center">
          <p className="text-lg font-medium text-foreground">{profile?.following || 0}</p>
          <p className="text-xs text-muted">Following</p>
        </div>
      </div>
    </div>
  )
}
