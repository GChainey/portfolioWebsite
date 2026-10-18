import fs from 'node:fs'
import path from 'node:path'

// Counts the type, colour and radius classes the site uses, straight from src, for the dev-only
// /audit page. "Live" is the part of the site visitors see now.

export const LIVE_PATHS = [
  'src/app/page.tsx',
  'src/app/essays',
  'src/app/cv',
  'src/app/contact',
  'src/app/projects',
  'src/app/changelog',
  'src/components/Visuals.tsx',
  'src/components/KindWord.tsx',
  'src/components/Header.tsx',
  'src/components/WorkList.tsx',
  'src/components/showcase/ShowcaseReel.tsx',
  'src/components/GitHubContributions.tsx',
  'src/components/ChatInterface.tsx',
]

const PATTERNS = {
  size: /\btext-(xs|sm|base|lg|xl|[2-9]xl)\b/g,
  arbitrarySize: /\btext-\[(\d+(?:\.\d+)?)px\]/g,
  weight: /\bfont-(thin|light|normal|medium|semibold|bold|extrabold|black)\b/g,
  family: /\bfont-(sans|mono|serif)\b/g,
  tracking: /\btracking-(tighter|tight|normal|wide|wider|widest|\[[^\]]+\])/g,
  leading: /\bleading-(none|tight|snug|normal|relaxed|loose|\d+|\[[^\]]+\])/g,
  textColour: /\btext-(foreground|muted|accent|white|black|background|primary|(?:zinc|neutral|gray|amber|red|green|blue)-\d+|\[#[0-9a-fA-F]{3,6}\])(?=[\s"'`]|$)/g,
  radius: /\brounded(?:-(none|sm|md|lg|xl|2xl|3xl|full))?(?=[\s"'`]|$)/g,
  hex: /#[0-9a-fA-F]{6}\b/g,
  noOpOpacity: /\bbg-(border|background|foreground|muted|card|accent)\/\d+\b/g,
} as const

type Counts = Record<keyof typeof PATTERNS, [string, number][]>

function files(root: string, rel: string[]): string[] {
  const out: string[] = []
  for (const r of rel) {
    const p = path.join(root, r)
    if (!fs.existsSync(p)) continue
    if (fs.statSync(p).isDirectory()) {
      for (const f of fs.readdirSync(p, { recursive: true }) as string[]) if (/\.(tsx?|css)$/.test(f)) out.push(path.join(p, f))
    } else out.push(p)
  }
  // Not this audit itself
  return out.filter((f) => !f.includes(`${path.sep}audit${path.sep}`) && !f.endsWith('design-audit.ts'))
}

function count(paths: string[]): Counts {
  const tallies = Object.fromEntries(Object.keys(PATTERNS).map((k) => [k, new Map<string, number>()])) as Record<keyof typeof PATTERNS, Map<string, number>>
  for (const f of paths) {
    const src = fs.readFileSync(f, 'utf8')
    for (const [k, re] of Object.entries(PATTERNS) as [keyof typeof PATTERNS, RegExp][]) {
      for (const m of src.matchAll(re)) {
        const key = k === 'arbitrarySize' ? m[1] : k === 'hex' ? m[0].toLowerCase() : m[0]
        tallies[k].set(key, (tallies[k].get(key) ?? 0) + 1)
      }
    }
  }
  return Object.fromEntries(Object.entries(tallies).map(([k, m]) => [k, [...m.entries()].sort((a, b) => b[1] - a[1])])) as Counts
}

export function audit() {
  const root = process.cwd()
  const all = files(root, ['src'])
  const live = files(root, LIVE_PATHS)
  const css = fs.readFileSync(path.join(root, 'src/app/globals.css'), 'utf8')
  return { all: count(all), live: count(live), files: { all: all.length, live: live.length }, cssLines: css.split('\n').length }
}
