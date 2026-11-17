// Best Practice study: the New appointment dialog, rebuilt in Fluent 2 (recreations/bestpractice/,
// static HTML) and recorded beat by beat. Serve the recreations folder, then record:
//
//   (cd recreations && python3 -m http.server 8794)
//   npm run replays:record -- scripts/replays/bestpractice.mjs [bestpractice/final] --base http://localhost:8794 --out public/replays
//   npm run replays                    # edit in Recording Studio
//
// Names carry the study folder, so recordings land in public/replays/bestpractice/ and their assets
// in the shared public/replays/assets/. Stills of the "before" and iteration screens:
//   node scripts/replays/bestpractice.mjs stills   (same server; writes public/case-studies/bestpractice-booking/fluent-*.png)
import { record } from 'html-recording'

const which = process.argv[2]
const VIEWPORT = { width: 960, height: 704 }
const GLIDE = 520 // a calm cursor
const go = (v) => `/bestpractice/?v=${v}`
const want = (name) => !which || which === name

// The hero: find the patient, open the details, pick three providers, jump to the next available
// time for the one with nothing today, book it
if (want('bestpractice/final')) await record('bestpractice/final', async (r) => {
  const { page } = r
  await r.goto(go('final'))
  await r.start()
  await r.wait(900)
  await r.click(page.getByLabel('Search patients'), { after: 200, duration: GLIDE })
  await r.type(page.getByLabel('Search patients'), 'Bob', { delay: 120 })
  await r.wait(500)
  await r.click(page.getByRole('option', { name: /Bobby Smith/ }), { after: 700, duration: GLIDE })
  await r.click(page.getByRole('button', { name: 'Appointment details' }), { after: 1000, duration: GLIDE })
  await r.click(page.getByRole('combobox', { name: 'Provider' }), { after: 500, duration: GLIDE })
  for (const n of ['Charlie Charmoose', 'Dominique Sat', 'Yarn Oldrick']) await r.click(page.getByRole('option', { name: n }), { after: 250, duration: 360 })
  await r.click({ x: 700, y: 610 }, { after: 1200, duration: GLIDE })
  await r.moveTo(page.locator('[data-key="DS"]').getByRole('button', { name: '9:30 am' }), { duration: GLIDE })
  await r.wait(500)
  await r.moveTo(page.locator('[data-key="YO"]').getByRole('button', { name: '11:00 am' }), { duration: GLIDE })
  await r.wait(500)
  await r.click(page.locator('[data-key="CC"]').getByRole('button', { name: /26\/05\/2021/ }), { after: 1300, duration: GLIDE })
  await r.click(page.locator('[data-key="CC"]').getByRole('button', { name: '4:00 pm' }), { after: 1200, duration: GLIDE })
  await r.moveTo(page.getByRole('button', { name: 'Book appointment' }), { duration: GLIDE })
  await r.wait(1800)
}, { viewport: VIEWPORT })

// Proof of concept: a repeat is one more row, set up in the same right panel
if (want('bestpractice/repeat')) await record('bestpractice/repeat', async (r) => {
  const { page } = r
  await r.goto(go('repeat'))
  await r.start()
  await r.wait(800)
  await r.click(page.getByRole('button', { name: 'Repeat', exact: true }), { after: 800, duration: GLIDE })
  await r.click(page.getByRole('button', { name: 'Repeat appointment' }), { after: 900, duration: GLIDE })
  await r.click(page.getByLabel('every up'), { after: 300, duration: GLIDE })
  await r.click(page.getByRole('combobox', { name: 'unit' }), { after: 400, duration: GLIDE })
  await r.click(page.getByRole('option', { name: 'Weeks' }), { after: 300, duration: 360 })
  await r.click(page.getByRole('combobox', { name: 'on' }), { after: 400, duration: GLIDE })
  await r.click(page.getByRole('option', { name: 'Tuesday' }), { after: 300, duration: 360 })
  for (let i = 0; i < 3; i++) await r.click(page.getByLabel('total up'), { after: 180, duration: i ? 120 : GLIDE })
  await r.wait(1600)
  await r.click(page.getByRole('button', { name: 'Set up repeat' }), { after: 400, duration: GLIDE })
  await r.moveTo({ x: 640, y: 420 }, { duration: GLIDE })
  await r.wait(2000)
}, { viewport: VIEWPORT })

// Finding 1: each provider has their own date
if (want('bestpractice/provider-dates')) await record('bestpractice/provider-dates', async (r) => {
  const { page } = r
  await r.goto(go('provider-dates'))
  await r.start()
  await r.wait(1000)
  await r.click(page.getByRole('button', { name: 'Dominique Sat next day' }), { after: 1500, duration: GLIDE })
  await r.moveTo(page.locator('[data-key="YO"]').getByRole('button', { name: '10:00 am' }), { duration: GLIDE })
  await r.wait(900)
  await r.click(page.locator('[data-key="DS"]').getByRole('button', { name: '2:00 pm' }), { after: 400, duration: GLIDE })
  await r.moveTo({ x: 640, y: 420 }, { duration: GLIDE })
  await r.wait(2000)
}, { viewport: VIEWPORT })

// Finding 2: a provider with nothing today shows their next free time, one click from it
if (want('bestpractice/unavailable')) await record('bestpractice/unavailable', async (r) => {
  const { page } = r
  await r.goto(go('unavailable'))
  await r.start()
  await r.wait(1200)
  await r.moveTo(page.locator('[data-key="YO"]').getByRole('button', { name: '12:00 pm' }), { duration: GLIDE })
  await r.wait(600)
  await r.click(page.locator('[data-key="CC"]').getByRole('button', { name: /26\/05\/2021/ }), { after: 1600, duration: GLIDE })
  await r.click(page.locator('[data-key="CC"]').getByRole('button', { name: '10:30 am' }), { after: 400, duration: GLIDE })
  await r.moveTo({ x: 640, y: 420 }, { duration: GLIDE })
  await r.wait(2000)
}, { viewport: VIEWPORT })

// Future workflows: an injury claim, in the same pattern
if (want('bestpractice/injury-claim')) await record('bestpractice/injury-claim', async (r) => {
  const { page } = r
  await r.goto(go('injury'))
  await r.start()
  await r.wait(900)
  await r.click(page.getByRole('button', { name: 'Injury claim' }), { after: 900, duration: GLIDE })
  await r.click(page.getByRole('switch', { name: 'related' }), { after: 900, duration: GLIDE })
  await r.click(page.getByRole('radio', { name: /Fractured ankle/ }), { after: 700, duration: GLIDE })
  await r.click(page.getByRole('button', { name: 'Done' }), { after: 400, duration: GLIDE })
  await r.moveTo({ x: 640, y: 420 }, { duration: GLIDE })
  await r.wait(2000)
}, { viewport: VIEWPORT })

// The problem: every feature made the old dialog longer
if (want('bestpractice/before')) await record('bestpractice/before', async (r) => {
  const { page } = r
  await r.goto(go('before'))
  // Shrink the page so the dialog at its longest still fits, and centre it
  await r.css('#stage{zoom:.64;display:flex!important;justify-content:center;width:100%!important;padding:40px 0!important} body{background:#F5F5F5}')
  await r.start()
  await r.wait(1000)
  await r.click(page.getByRole('switch', { name: 'o-waiting' }), { after: 1400, duration: GLIDE })
  await r.click(page.getByRole('switch', { name: 'o-repeat' }), { after: 1600, duration: GLIDE })
  await r.click(page.getByRole('switch', { name: 'o-urgent' }), { after: 400, duration: GLIDE })
  await r.moveTo({ x: 560, y: 400 }, { duration: GLIDE })
  await r.wait(2000)
}, { viewport: { width: 720, height: 800 } })

// Stills: the old two-step flow, the two early iterations, toggles and bundling, at 2x
if (which === 'stills') {
  const { default: pw } = await import('playwright')
  const browser = await pw.chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 })
  const base = process.env.BASE_URL ?? 'http://localhost:8794'
  for (const v of ['steps', 'iter-grid', 'iter-tabs', 'iter-empty', 'toggles', 'bundling']) {
    await page.goto(`${base}${go(v)}`)
    await page.waitForTimeout(400)
    await page.locator('#stage').screenshot({ path: `public/case-studies/bestpractice-booking/fluent-${v}.png` })
  }
  await browser.close()
}
