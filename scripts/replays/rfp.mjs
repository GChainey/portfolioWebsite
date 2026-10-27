// RFP study (DAISY): one prototype, three clients. Cumberland (council), NSW Planning (State
// significant development) and Polska, switched from the sidebar tenancy switcher; and a State
// significant case through today's case pages.
//
// Needs DesignConfigurator with the SSD statewide tenancy (enterpriseaigroup/DesignConfigurator
// PR #83) running locally, e.g. `npx vite --port 55190` in a worktree of that branch.
//
//   npm run replays:record -- scripts/replays/rfp.mjs [rfp/tenancy-switch] --base http://localhost:55190 --out public/replays
//   npm run replays                    # edit in Recording Studio
//
// Names carry the study folder (rfp/…) so recordings land in public/replays/rfp/ and their
// assets in the shared public/replays/assets/.
import { record } from 'html-recording'

const which = process.argv[2]
const VIEWPORT = { width: 1440, height: 900 }
const GLIDE = 380 // cursor glide in ms (the recorder's default is 650)

// Every page load: hide the mesurer dev toolbar; the sidebar collapsed (icon rail) unless the
// clip needs its header (the tenancy switcher)
const setupWith = (collapsed) => async (context) => {
  await context.addInitScript((collapsed) => {
    try { localStorage.setItem('daisy-sidebar-collapsed', String(collapsed)) } catch {}
    const style = () => {
      const el = document.createElement('style')
      el.textContent = '.mesurer-root { display: none !important; }'
      document.head.appendChild(el)
    }
    if (document.head) style()
    else document.addEventListener('DOMContentLoaded', style)
  }, collapsed)
}

// Council → State → Polska from the tenancy switcher: the same caseload, each client's own data
if (!which || which === 'rfp/tenancy-switch') await record('rfp/tenancy-switch', async (r) => {
  const { page } = r
  await r.goto('/select-tenancy')
  await page.getByText('Cumberland Council', { exact: true }).first().click()
  await page.getByRole('heading', { name: 'Future State' }).click()
  await page.getByRole('heading', { name: 'Daisy Assess' }).click()
  await page.getByRole('table').first().waitFor()
  await page.waitForTimeout(600)
  await r.start()
  await r.wait(1400)

  const switcher = () => page.locator('[aria-haspopup="menu"][data-sidebar="menu-button"]')
  const pick = async (name) => {
    await r.click(switcher(), { after: 900, duration: GLIDE })
    await r.click(page.getByRole('menuitem', { name: new RegExp(name) }), { after: 400, duration: GLIDE })
    await page.getByRole('table').first().waitFor()
    await r.wait(1800)
    await r.moveTo({ x: 840, y: 620 }, { duration: GLIDE })
    await r.scroll(240)
    await r.wait(1300)
    await r.scroll(-240, { duration: 500 })
  }
  await pick('NSW Planning')
  await pick('Polska')
  await r.wait(600)
}, { viewport: VIEWPORT, setup: setupWith(false) })

// A State significant case in today's case pages: SEARs, exhibition, assessment
if (!which || which === 'rfp/ssd-case') await record('rfp/ssd-case', async (r) => {
  const { page } = r
  await r.goto('/select-tenancy')
  await page.getByText('State Significant Development', { exact: true }).first().click()
  await page.getByRole('heading', { name: 'English' }).click()
  await page.getByRole('heading', { name: 'Daisy Assess' }).click()
  await page.getByRole('table').first().waitFor()
  await page.waitForTimeout(600)
  await r.start()
  await r.wait(900)
  await r.click(page.getByText('18 Archbold Road, Eastern Creek NSW 2766'), { after: 1800, duration: GLIDE })
  await r.click(page.getByRole('button', { name: 'Continue to exhibition' }), { after: 2000, duration: GLIDE })
  await r.click(page.getByRole('button', { name: 'Continue to assessment' }), { after: 1000, duration: GLIDE })
  await r.moveTo({ x: 820, y: 600 }, { duration: GLIDE })
  await r.scroll(420)
  await r.wait(2000)
}, { viewport: VIEWPORT, setup: setupWith(true) })
