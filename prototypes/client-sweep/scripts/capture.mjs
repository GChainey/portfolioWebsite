// Records one full loop of a variant (default 3, Command) from ?capture=1 at 2x, for the video.
//   npm run dev  (another terminal)   then   node scripts/capture.mjs [variant]
// Needs Playwright's Chromium (npx playwright install chromium). Prints the loop's start and end in
// seconds from page creation; trim and encode with the ffmpeg lines in the README.
import { chromium } from 'playwright'
const b = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const ctx = await b.newContext({ viewport: { width: 1760, height: 1100 }, recordVideo: { dir: 'exports/raw', size: { width: 1760, height: 1100 } } })
const t0 = Date.now()
const p = await ctx.newPage()
const errors = []
p.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
p.on('pageerror', e => errors.push(String(e)))
await p.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { document.documentElement.style.zoom = '2' }))
await p.goto(`http://localhost:5410/?v=${process.argv[2] || 3}&capture=1`, { waitUntil: 'domcontentloaded' })
await p.waitForFunction(() => window.__marks && window.__marks.length >= 1, null, { timeout: 30000 })
await p.waitForFunction(() => window.__marks.length >= 4, null, { timeout: 60000 })
await p.waitForTimeout(600)
const marks = await p.evaluate(() => window.__marks.map(m => performance.timeOrigin + m))
const box = await p.locator('#frame').boundingBox()
await ctx.close(); await b.close()
console.log(JSON.stringify({ start: (marks[0] - t0) / 1000, end: (marks[3] - t0) / 1000, box, errors }))
