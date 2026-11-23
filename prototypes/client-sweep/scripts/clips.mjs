// The recordings the client-sweep prototype plays, made from DesignConfigurator main running
// locally (README: `npx vite --port 55190` in a worktree at origin/main).
//
//   npx html-recording record scripts/clips.mjs [clip] --base http://localhost:55190 --out public/replays
//
// caseload-council, caseload-state, caseload-polska: one scenario's Caseload with the left nav
// collapsed to its icon rail; a short hold while the cursor drifts and returns. The same frame and
// cursor path in each, so the change can cut from the end of one to the start of the next.
import { record } from 'html-recording'

const which = process.argv[2]
const VIEWPORT = { width: 1440, height: 900 }

// The nav opens expanded so the scenario can be picked from its switcher, then collapses before
// recording starts (the app remembers it as daisy-sidebar-collapsed)
const setup = async (context) => {
  await context.addInitScript(() => {
    try { localStorage.setItem('daisy-sidebar-collapsed', 'false') } catch {}
  })
}

const CASELOADS = { 'caseload-council': null, 'caseload-state': 'NSW Planning', 'caseload-polska': 'Polska' }
for (const [name, tenancy] of Object.entries(CASELOADS)) {
  if (which && which !== name) continue
  await record(name, async (r) => {
    const { page } = r
    await r.goto('/select-tenancy')
    await page.getByText('Cumberland Council', { exact: true }).first().click()
    await page.getByRole('heading', { name: 'Future State' }).click()
    await page.getByRole('heading', { name: 'Daisy Assess' }).click()
    await page.getByRole('table').first().waitFor()
    if (tenancy) {
      await page.locator('[aria-haspopup="menu"][data-sidebar="menu-button"]').click()
      await page.getByRole('menuitem', { name: new RegExp(tenancy) }).click()
      await page.getByRole('table').first().waitFor()
    }
    await page.getByRole('button', { name: /Toggle Sidebar/i }).first().click()
    await page.waitForTimeout(1200)
    if (await page.evaluate(() => localStorage.getItem('daisy-sidebar-collapsed')) !== 'true') throw new Error('nav not collapsed')
    await r.start()
    // The recorder's cursor starts mid-page (720, 450); it drifts and comes back there
    await r.wait(600)
    await r.moveTo({ x: 840, y: 520 }, { duration: 900 })
    await r.wait(400)
    await r.moveTo({ x: 720, y: 450 }, { duration: 800 })
    await r.wait(300)
  }, { viewport: VIEWPORT, setup })
}
