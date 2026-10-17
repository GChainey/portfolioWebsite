# Builds public/screens/ (small webp stills and short muted mp4 loops) and src/content/screens.ts
# from the site's own case-study, gallery and showcase assets. Re-run after changing the list.
import json, os, subprocess, sys
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUB = os.path.join(ROOT, 'public')
OUT = os.path.join(PUB, 'screens')
os.makedirs(OUT, exist_ok=True)

EAI, RFP, CONF, SW, DIS, TH, WB, SEEK, BP = 'Enterprise AI', 'Daisy Assess', 'Configurator', 'Shader Wall', 'Dispatch', 'Thesis', 'Wallbounce', 'SEEK', 'Best Practice'
SITE = '/projects/html-brand-website'

# id, source, project, title, kind, href, best
# kind: app | marketing | brand | mobile | mac | game | research
S = [
    # The six pieces of work the homepage leads with
    ('rfp', 'showcase/rfp.webp', RFP, "A council's whole caseload, against its targets", 'app', '/projects/rfp', True),
    ('configurator', 'showcase/configurator.webp', CONF, "Today's process, mapped onto a four-step app", 'app', '/projects/configurator', True),
    ('site', 'showcase/html-brand-website.webp', EAI, 'A marketing site built from an HTML brand', 'marketing', SITE, True),
    ('shader-wall', 'showcase/shader-wall.webp', SW, 'Your Mac desktop, alive', 'mac', 'https://www.shaderwall.com', True),
    ('dispatch', 'showcase/dispatch.webp', DIS, 'Send articles to your Kindle in one click', 'mac', 'https://www.dispatchmac.com', True),
    ('thesis', 'showcase/thesis.webp', TH, 'Every claim in a plan is a bet', 'app', 'https://thesis-phi-self.vercel.app', True),
    # Moments from the replays, captured from the site's own Visuals overlay
    ('rfp-caseload', 'case-studies/rfp/frames/rfp-overview-1.webp', RFP, 'Every application, against its targets', 'app', '/projects/rfp', True),
    ('rfp-notes', 'case-studies/rfp/frames/rfp-llm-chat-3.webp', RFP, 'A live model rewrites the notes in council wording', 'app', '/projects/rfp', False),
    ('rfp-letter', 'case-studies/rfp/frames/rfp-determination-1.webp', RFP, 'The decision letter, written from the case', 'app', '/projects/rfp', True),
    ('rfp-answer', 'case-studies/rfp/frames/rfp-overview-3.webp', RFP, "Answers from the applicant's own documents", 'app', '/projects/rfp', False),
    ('rfp-sent', 'case-studies/rfp/frames/rfp-overview-4.webp', RFP, 'Determination letter sent', 'app', '/projects/rfp', False),
    ('conf-nike', 'case-studies/configurator/frames/conf-brand-1.webp', CONF, 'The same app, in Nike', 'app', '/projects/configurator', True),
    ('conf-commbank', 'case-studies/configurator/frames/conf-brand-2.webp', CONF, 'In CommBank', 'app', '/projects/configurator', False),
    ('conf-qantas', 'case-studies/configurator/frames/conf-brand-3.webp', CONF, 'In Qantas', 'app', '/projects/configurator', True),
    ('conf-kyc', 'case-studies/configurator/frames/conf-overview-4.webp', CONF, 'Client onboarding, built from a description', 'app', '/projects/configurator', False),
    ('conf-match', 'case-studies/configurator/frames/conf-overview-3.webp', CONF, 'Jev picks the closest template, and says how sure it is', 'app', '/projects/configurator', False),
    # The Enterprise AI site and its remixes
    ('site-phone', 'gallery/shots/eai-website.jpg', EAI, 'On their phone before the meeting ends', 'marketing', SITE, True),
    ('shapeshifter', 'variants/shots/shapeshifter.jpg', EAI, 'Build it once. Run it everywhere.', 'marketing', SITE, True),
    ('shapeshifter-cyan', 'gallery/shots/shapeshifter-cyan.jpg', EAI, 'Make your apps enterprise grade', 'marketing', SITE, True),
    ('shapeshifter-phone', 'gallery/shots/shapeshifter-cyan-mobile.jpg', EAI, 'Shapeshifter, on a phone', 'mobile', SITE, False),
    ('dark-shader', 'variants/shots/dark-shader.jpg', EAI, 'What do you want to build today?', 'marketing', SITE, False),
    ('sell-to-many', 'variants/shots/sell-to-many.jpg', EAI, 'Build once. Sell to many.', 'marketing', SITE, False),
    ('builder-web', 'variants/shots/builder-web.jpg', EAI, "Let's improve a process", 'marketing', SITE, False),
    ('template-flow', 'variants/shots/template-flow.jpg', EAI, 'Browse 50 templates by the shelf', 'marketing', SITE, False),
    ('book-ads', 'case-studies/html-brand-website/book-ads.webp', EAI, 'Ads from the brand book', 'brand', SITE, False),
    ('html-ads', 'case-studies/html-brand-website/html-ads.webp', EAI, 'Ads, as HTML', 'brand', SITE, False),
] + [
    (f'remix-{n}', f'case-studies/html-brand-website/remixes/{n}.webp', EAI, f'Home page remix {n}', 'marketing', SITE, n in ('03', '07', '13'))
    for n in ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '13-value', '14', '15', '15-race']
] + [
    # The brand book
    ('book-cover', 'case-studies/html-brand-website/brand-book/01.webp', EAI, 'Brand guidelines', 'brand', SITE, True),
    ('book-execute', 'case-studies/html-brand-website/brand-book/04.webp', EAI, 'A brand document should execute the brand', 'brand', SITE, False),
    ('book-buyers', 'case-studies/html-brand-website/brand-book/09.webp', EAI, 'Three buyers, grounded in revenue', 'brand', SITE, False),
    ('book-claim', 'case-studies/html-brand-website/brand-book/10.webp', EAI, 'Build once, sell many', 'brand', SITE, False),
    ('book-logo', 'case-studies/html-brand-website/brand-book/29.webp', EAI, 'The Configurator mark', 'brand', SITE, True),
    ('book-lockups', 'case-studies/html-brand-website/brand-book/35.webp', EAI, 'Lockups', 'brand', SITE, False),
    ('book-colour', 'case-studies/html-brand-website/brand-book/40.webp', EAI, 'Colour palette', 'brand', SITE, False),
    ('book-type', 'case-studies/html-brand-website/brand-book/43.webp', EAI, 'Archivo and IBM Plex Mono', 'brand', SITE, False),
    ('book-icons', 'case-studies/html-brand-website/brand-book/47.webp', EAI, 'Icons', 'brand', SITE, False),
    ('book-phones', 'case-studies/html-brand-website/brand-book/48.webp', EAI, 'On the phone', 'brand', SITE, False),
    ('book-inbox', 'case-studies/html-brand-website/brand-book/51.webp', EAI, 'Straight to the inbox', 'brand', SITE, False),
    ('book-tiles', 'case-studies/html-brand-website/brand-book/52.webp', EAI, 'One system for every tile', 'brand', SITE, True),
    ('book-after', 'case-studies/html-brand-website/brand-book/53.webp', EAI, 'Everything after the build', 'brand', SITE, False),
    # The Enterprise AI product
    ('build', 'variants/shots/build.jpg', EAI, 'What do you want to build?', 'mac', '/projects/configurator', True),
    ('app-builder', 'variants/shots/app-builder.jpg', CONF, 'A process card, written by a live model', 'app', '/projects/configurator', False),
    ('app-editor', 'variants/shots/app-editor.jpg', EAI, 'How do you want to edit your app?', 'app', '/projects/eai-settings', False),
    ('billing', 'variants/shots/billing.jpg', EAI, 'Plan and billing', 'app', '/projects/eai-settings', False),
    ('cli', 'variants/shots/cli.jpg', EAI, 'Enterprise AI Setup, a native installer', 'mac', None, True),
    ('statemachine', 'variants/shots/statemachine.jpg', EAI, 'Setup, as a state machine', 'app', None, False),
    ('surface', 'variants/shots/surface.jpg', EAI, "Let's build an app", 'app', None, False),
    ('workspace', 'variants/shots/workspace.jpg', EAI, 'The workspace', 'app', None, False),
    ('eai-settings', 'case-studies/eai-settings/hero.webp', EAI, 'Two levels of settings, without getting lost', 'app', '/projects/eai-settings', True),
    ('add-document', 'case-studies/add-document/hero.webp', EAI, 'Add document', 'app', '/projects/add-document', False),
    ('add-doc-r01', 'case-studies/add-document/timelapse/r01.webp', EAI, 'Add document, round 1', 'research', '/projects/add-document', False),
    ('add-doc-r05', 'case-studies/add-document/timelapse/r05.webp', EAI, 'Add document, round 5', 'research', '/projects/add-document', False),
    ('add-doc-r12', 'case-studies/add-document/timelapse/r12.webp', EAI, 'Add document, round 12', 'research', '/projects/add-document', False),
    # Essays and games
    ('wallbounce', 'gallery/shots/wallbounce-title.jpg', WB, 'Wallbounce, on an arcade screen', 'game', '/projects/wallbounce-dev-tools', True),
    ('balatro', 'essays/balatro-opportunity-sizing/cover.jpg', TH, 'Opportunity sizing, but Balatro', 'game', '/projects/balatro-opportunity-sizing', True),
    ('agentic-testing', 'essays/agentic-user-testing/cover.png', EAI, 'Agentic user testing', 'research', '/projects/agentic-user-testing', False),
    ('agentic-setup', 'essays/agentic-user-testing/setup.jpg', EAI, 'Agents running a usability study', 'research', '/projects/agentic-user-testing', False),
    ('shader-wall-site', 'gallery/shots/shader-wall-site.jpg', SW, 'The whole app, on the landing page', 'mac', 'https://www.shaderwall.com', False),
    # Earlier work
    ('seek', 'case-studies/seek-learning/hero.webp', SEEK, 'Courses with in-demand skills', 'app', '/projects/seek-case-study-1', True),
    ('seek-find', 'case-studies/seek-learning/find-a-course.webp', SEEK, 'Find a course', 'app', '/projects/seek-case-study-1', False),
    ('seek-select', 'case-studies/seek-learning/select-a-course.webp', SEEK, 'Select a course', 'app', '/projects/seek-case-study-1', False),
    ('bp', 'case-studies/bestpractice-booking/hero.webp', BP, 'Booking, for practice management', 'app', '/projects/bestpractice-case-study-1', True),
    ('bp-comparison', 'case-studies/bestpractice-booking/comparison.webp', BP, 'Old and new, side by side', 'research', '/projects/bestpractice-case-study-1', False),
    ('bp-iterations', 'case-studies/bestpractice-booking/early-iterations.webp', BP, 'Early iterations', 'research', '/projects/bestpractice-case-study-1', False),
    ('bp-future', 'case-studies/bestpractice-booking/future-workflows.webp', BP, 'Future workflows', 'app', '/projects/bestpractice-case-study-1', False),
    ('bp-injury', 'case-studies/bestpractice-booking/injury-claim.webp', BP, 'Injury claims', 'app', '/projects/bestpractice-case-study-1', False),
    ('bp-dates', 'case-studies/bestpractice-booking/provider-dates.webp', BP, 'Provider dates', 'app', '/projects/bestpractice-case-study-1', False),
    ('bp-repeat', 'case-studies/bestpractice-booking/repeat.webp', BP, 'Repeat appointments', 'app', '/projects/bestpractice-case-study-1', False),
    ('bp-unavailable', 'case-studies/bestpractice-booking/unavailable.webp', BP, 'When nobody is free', 'app', '/projects/bestpractice-case-study-1', False),
]

# Moving tiles: id, source, start, seconds, project, title, kind, href, best
CLIPS = [
    ('clip-site-build', 'gallery/clips/eai-website-build.mp4', 2, 7, EAI, 'Build an app inside the marketing site', 'marketing', SITE, True),
    ('clip-setup', 'gallery/clips/eai-setup.mp4', 3, 7, EAI, 'From sign-in to building in Claude Code', 'mac', None, False),
    ('clip-balatro', 'essays/balatro-opportunity-sizing/play.mp4', 1, 7, TH, 'Sizing a bet like a hand of cards', 'game', '/projects/balatro-opportunity-sizing', True),
    ('clip-balatro-create', 'essays/balatro-opportunity-sizing/create.mp4', 1, 6, TH, 'Deal a new opportunity', 'game', '/projects/balatro-opportunity-sizing', False),
    ('clip-wallbounce', 'essays/wallbounce-dev-tools/reel.mp4', 4, 7, WB, 'A game, and the tools to tune it', 'game', '/projects/wallbounce-dev-tools', True),
    ('clip-seek', 'case-studies/seek-learning/final-desktop.mp4', 2, 7, SEEK, 'The course finder, shipped', 'app', '/projects/seek-case-study-1', False),
    ('clip-seek-mobile', 'case-studies/seek-learning/connection-mobile.mp4', 0, 7, SEEK, 'Skills to courses, on a phone', 'mobile', '/projects/seek-case-study-1', True),
    ('clip-seek-mvp', 'case-studies/seek-learning/mvp.mp4', 0, 7, SEEK, 'The first version, on a phone', 'mobile', '/projects/seek-case-study-1', False),
    ('clip-bp', 'case-studies/bestpractice-booking/final.mp4', 1, 7, BP, 'Booking an appointment, start to end', 'app', '/projects/bestpractice-case-study-1', False),
    ('clip-bp-two-panel', 'case-studies/bestpractice-booking/two-panel-idea.mp4', 0, 7, BP, 'The two-panel idea', 'research', '/projects/bestpractice-case-study-1', False),
]

WIDTH = 800  # wide enough for a tile at 2x; the impact sections use the case studies' own media


def still(src, dest, crop_tall=False):
    im = Image.open(os.path.join(PUB, src)).convert('RGB')
    if im.width > WIDTH:
        im = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
    im.save(dest, 'WEBP', quality=74, method=6)
    return im.size


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


items = []
for id_, src, project, title, kind, href, best in S:
    dest = os.path.join(OUT, f'{id_}.webp')
    w, h = still(src, dest)
    items.append(dict(id=id_, src=f'/screens/{id_}.webp', w=w, h=h, project=project, title=title, kind=kind, href=href, best=best))

for id_, src, start, secs, project, title, kind, href, best in CLIPS:
    mp4 = os.path.join(OUT, f'{id_}.mp4')
    poster = os.path.join(OUT, f'{id_}.webp')
    path = os.path.join(PUB, src)
    w0, h0 = map(int, subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path]).decode().strip().split(','))
    w = min(640, w0) if w0 >= h0 else min(360, w0)
    w -= w % 2
    if not os.path.exists(mp4) or '--force' in sys.argv:
        run(['ffmpeg', '-y', '-ss', str(start), '-t', str(secs), '-i', path, '-an', '-vf', f'scale={w}:-2,fps=24', '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4])
    run(['ffmpeg', '-y', '-ss', str(start + 0.5), '-i', path, '-frames:v', '1', '-vf', f'scale={w}:-2', os.path.join(OUT, f'{id_}.png')])
    im = Image.open(os.path.join(OUT, f'{id_}.png')).convert('RGB')
    im.save(poster, 'WEBP', quality=74)
    os.remove(os.path.join(OUT, f'{id_}.png'))
    items.append(dict(id=id_, src=f'/screens/{id_}.webp', video=f'/screens/{id_}.mp4', w=im.width, h=im.height, project=project, title=title, kind=kind, href=href, best=best))

ts = '''// Generated by scripts/build-screens.py from the site's own case-study, gallery and
// showcase assets: every screen small enough to put dozens on one page. Stills are 800px webp;
// clips are short muted loops with a poster. Don't edit by hand, re-run the script.

export type ScreenKind = 'app' | 'marketing' | 'brand' | 'mobile' | 'mac' | 'game' | 'research'

export interface Screen {
  id: string
  src: string // still, or a clip's poster
  video?: string // a short muted loop
  w: number
  h: number
  project: string
  title: string
  kind: ScreenKind
  href: string | null
  best: boolean // one of the strongest: lead with these
}

export const SCREENS: Screen[] = ''' + json.dumps(items, indent=2) + '''

// The screens in an order that mixes projects and kinds, so no two neighbours look alike
export function mixed(list: Screen[] = SCREENS): Screen[] {
  const byProject = new Map<string, Screen[]>()
  list.forEach((s) => byProject.set(s.project, [...(byProject.get(s.project) ?? []), s]))
  const queues = Array.from(byProject.values()).sort((a, b) => b.length - a.length)
  const out: Screen[] = []
  while (out.length < list.length) {
    for (const q of queues) {
      const next = q.shift()
      if (next) out.push(next)
    }
  }
  return out
}

export const BEST = SCREENS.filter((s) => s.best)
'''
with open(os.path.join(ROOT, 'src', 'content', 'screens.ts'), 'w') as f:
    f.write(ts)
total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
print(len(items), 'screens,', round(total / 1e6, 1), 'MB')
