// SEEK study: the courses module on a career page, recreated in SEEK's current look
// (recreations/seek/, every state behind ?v=) and recorded on a phone-sized screen.
//
// Serve the recreation, then record:
//   python3 -m http.server 8933 --bind 127.0.0.1 --directory recreations/seek
//   npm run replays:record -- scripts/replays/seek.mjs [seek/hero] --base http://127.0.0.1:8933 --out public/replays
//   npm run replays                    # edit in Recording Studio
//
// Names carry the study folder (seek/…) so recordings land in public/replays/seek/ and their
// assets in the shared public/replays/assets/.
import { record } from 'html-recording'

const which = process.argv[2]
const opts = {
  viewport: { width: 390, height: 844 },
}
const GLIDE = 520
const clip = (name, run) => (!which || which === name) && record(name, run, opts)

// Open a state with the fonts loaded, the cursor parked low on the screen
async function open(r, v) {
  await r.goto(`/index.html?v=${v}`)
  await r.page.evaluate(() => document.fonts.ready)
  await r.page.mouse.move(200, 640)
}

// Mark the end: a still hold records no events and a take ends at its last event, so the clip's
// last wait would be lost. An invisible change to the page keeps it
async function hold(r, ms = 200) {
  await r.wait(ms)
  await r.page.evaluate(() => { document.body.dataset.end = String(Date.now()) })
}

// Swipe a row of cards sideways
async function swipe(r, rail, dx, duration = 700) {
  await r.moveTo(rail, { duration: GLIDE })
  const steps = Math.round(duration / 16)
  for (let i = 0; i < steps; i++) { await r.page.mouse.wheel(dx / steps, 0); await r.page.waitForTimeout(duration / steps) }
}

// The first release: one qualification at a time
await clip('seek/release', async (r) => {
  const { page } = r
  await open(r, 'release')
  await r.start()
  await r.wait(1200)
  for (const name of ['VET', 'Short courses', 'Postgraduate']) {
    await r.click(page.getByRole('tab', { name, exact: true }), { after: 1500, duration: GLIDE })
  }
  await r.click(page.getByRole('tab', { name: 'Undergraduate', exact: true }), { after: 1400, duration: GLIDE })
  await hold(r)
})

// Leak 1 fixed: All by default, every qualification on one scroll
await clip('seek/all-tab', async (r) => {
  const { page } = r
  await open(r, 'all')
  await r.start()
  await r.wait(1300)
  await r.moveTo({ x: 200, y: 560 }, { duration: GLIDE })
  await r.scroll(360, { duration: 900 })
  await r.wait(700)
  await r.scroll(420, { duration: 900 })
  await r.wait(1100)
  await r.scroll(-780, { duration: 900 })
  await r.click(page.getByRole('tab', { name: 'Bootcamps', exact: true }), { after: 1600, duration: GLIDE })
  await hold(r)
})

// Leak 2: the same cards, text-only, then logo and course name first
await clip('seek/cards', async (r) => {
  const { page } = r
  await open(r, 'cards')
  await page.evaluate(() => scrollTo(0, 250))
  await page.waitForTimeout(200)
  await r.start()
  await r.wait(1800)
  await r.moveTo(page.locator('.card').first(), { duration: GLIDE })
  await r.wait(500)
  await page.evaluate(() => swapCards())
  await r.wait(1600)
  await r.moveTo({ x: 300, y: 720 }, { duration: GLIDE })
  await r.wait(1400)
  await hold(r)
})

// Leak 2, side by side: the same row of cards before and after, each swiped once
for (const [name, after] of [['seek/cards-before', false], ['seek/cards-after', true]]) {
  await clip(name, async (r) => {
    const { page } = r
    await open(r, 'cards')
    if (after) await page.evaluate(() => swapCards())
    await page.evaluate(() => scrollTo(0, 250))
    await page.waitForTimeout(400)
    await r.start()
    await r.wait(1400)
    await swipe(r, page.locator('.rail').first(), 280)
    await r.wait(1400)
    await swipe(r, page.locator('.rail').first(), -280)
    await r.wait(1200)
    await hold(r)
  })
}

// Leak 3 before: a card leaves the page for a course page, then a form on another page
await clip('seek/connect-before', async (r) => {
  const { page } = r
  await open(r, 'before')
  await page.evaluate(() => scrollTo(0, 250))
  await page.waitForTimeout(200)
  await r.start()
  await r.wait(1200)
  await r.click(page.locator('.card').first(), { after: 1600, duration: GLIDE })
  await r.click(page.getByRole('button', { name: 'Enquire' }), { after: 1300, duration: GLIDE })
  await r.type(page.locator('[name=email]'), 'sam@example.com', { delay: 45 })
  await r.type(page.locator('[name=first]'), 'Sam', { delay: 60 })
  await page.keyboard.press('Tab') // a typed value is only saved by the next interaction
  await r.wait(1400)
  await hold(r)
})

// Leak 3 fixed: the card opens a sheet over the page, and the form opens in it
await clip('seek/connect-after', async (r) => {
  const { page } = r
  await open(r, 'after')
  await page.evaluate(() => scrollTo(0, 250))
  await page.waitForTimeout(200)
  await r.start()
  await r.wait(1200)
  await r.click(page.locator('.card').first(), { after: 1400, duration: GLIDE })
  await r.click(page.locator('[data-enquire]'), { after: 900, duration: GLIDE })
  await r.type(page.locator('.sheet [name=email]'), 'sam@example.com', { delay: 45 })
  await r.type(page.locator('.sheet [name=first]'), 'Sam', { delay: 60 })
  await r.click(page.locator('[data-send]'), { after: 1800, duration: GLIDE })
  await hold(r)
})

// The shipped module: browse the courses, open one
await clip('seek/hero', async (r) => {
  const { page } = r
  await open(r, 'final')
  await r.start()
  await r.wait(1200)
  await r.moveTo({ x: 200, y: 600 }, { duration: GLIDE })
  await r.scroll(250, { duration: 800 })
  await r.wait(600)
  await swipe(r, page.locator('.rail').first(), 300)
  await r.wait(800)
  await r.click(page.locator('.card[data-course="bit"]'), { after: 2200, duration: GLIDE })
  await hold(r)
})
