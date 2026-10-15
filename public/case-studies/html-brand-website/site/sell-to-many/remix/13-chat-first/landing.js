/* Landing pages by tagline (../27-taglines/, ?lp=<key>). Does nothing without ?lp=.
   Brand book v5, pages 17–21: five landing page taglines for ICP 1, one page
   each. Every page is the V3 page (?theme=brand&layout=mvp3) with its own
   hero, its own short run of sections and its own copy on them:

     after-the-build    Everything after the build.            default landing page
     sold-twice         Sold twice. Built once.                warm base email, referral
     off-your-laptop    Off your laptop. Into your client’s    paid social
                        hands.
     build-like-one     You don’t need to be an enterprise     SMB partner page
                        to build like one.
     client-can-trust   Helping you deliver AI your client     founder post, sales deck
                        can trust.

   From the book: the headline carries her pain and the subhead carries the
   platform, together under 34 words (page 25). The prompt box, "Free to
   build. You pay when it goes live." and the brand tagline at the close are
   the book's production strings, verbatim (pages 12, 14). Each headline
   underlines the phrase socials/BRAND.md gives it. Short surface: a page
   shows only the sections that carry its tagline.

   Loads before arrange.js, which reads window.EAILanding for the order, and
   writes its copy on every `arrange:change`, after the V2 and V3 copy.

   &lpv=2 is the second pass (../30-taglines-v2/). The five pages above stay
   as they were; with the flag each one also gets:
     - its tagline as a picture under the prompt box: a scene from
       ../29-lean/scenes.js whose words are the page's own subhead;
     - the V4 page underneath (the folders send ?layout=mvp4): what the
       visitor types builds its own app, and clients have no names or logos,
       so the suggestions and the builder's line stop naming one;
     - the lean site's menu and footer (&site=1&ia=2), without its "who we
       help" section: a landing page stays short. */
(function () {
  'use strict';

  const PAGES = {
    'after-the-build': {
      short: 'After the build', channel: 'Default landing page · search and GEO',
      h1: ['Everything', 'after the build.'],
      // The claim's subhead, verbatim: this line must never run without "the AI that does the work" (page 17).
      sub: 'Enterprise AI adds the AI that does the work, connects it to your client’s systems, and sets it up again for the next client.',
      order: ['chat', 'manage', 'features', 'control', 'enterprise', 'builder'],
      // the subhead's three promises, added to a demo in turn
      scene: { name: 'gap', items: 'The AI that does the work|Your client’s systems|Set up again for the next client', label: 'A demo gets the AI that does the work, a connection to the client’s systems and a set-up for the next client, then goes live.' },
      copy: {
        '#mgH': 'You have already built the hard part.',
        '#manage .sg-sub': 'Here is what it takes to give someone a login. Keep building in Claude Code, Codex or Cursor, and every change lands in Enterprise AI, where your client signs in.',
        '#featH': 'The AI inside it does the work.',
        '#ctH': 'Connected to your client’s systems.',
        '#control .sg-sub': 'Their tables, records and files in one place, and one map of every step and the data it uses.',
        '#entH': ['A login for', 'your client.'],
        '.bstage-sub': 'Set it up again for the next client. Name them, and the same app goes out in their logo, colours and voice.',
      },
    },
    'sold-twice': {
      short: 'Sold twice', channel: 'Warm base email · referral',
      // "Needs a headline above it to supply the object" (page 18).
      lede: 'What you built for your last client',
      h1: ['Sold twice.', 'Built once.'],
      sub: 'Enterprise AI sets up what you built again for the second client, in their brand and on their systems. Nothing gets rebuilt.',
      // No calculator section: its sliders move in under the multiplier's wall (multiplier.js).
      order: ['chat', 'builder', 'multiplier', 'control'],
      scene: { name: 'resell', label: 'The app built for one client is set up again for a second, in their brand: built once, sold twice.' },
      copy: {
        // the builder's own slogan would only echo the headline back, reversed
        '#slA': 'Built for one client.',
        '#slB': 'Sold to the next.',
        '.bstage-sub': 'You built it for one client. Name the second, and the same app goes out in their logo, colours and voice.',
        '#ctH': 'Change it once. Every client gets it.',
        '#control .sg-sub': 'Each client has their own data, users and brand. The workflow underneath is the one you built.',
      },
    },
    'off-your-laptop': {
      short: 'Off your laptop', channel: 'Paid social · her words',
      h1: ['Off your laptop.', 'Into your client’s hands.'],
      sub: 'You have already built the hard part. Enterprise AI gives it a live URL, a login for your client, and their real data behind it.',
      order: ['chat', 'agents', 'enterprise', 'control'],
      scene: { name: 'live', items: 'Your client:Signed in|Their real data:Connected', label: 'What runs on a laptop gets a live address, a login for the client and their real data behind it.' },
      copy: {
        '#agentsH': 'Bring what you built. Leave with it live.',
        '#agents .sg-sub': { html: 'Connect Claude Code, Codex or Cursor to Enterprise AI and type <code>/eai</code>. What you built gets a live URL your client can open.' },
        '#entH': ['A login for', 'your client.'],
        '#ctH': ['Their real data', 'behind it.'],
        '#control .sg-sub': 'Each client’s tables, records and files in one place, and one map of every step that uses them.',
      },
    },
    'build-like-one': {
      short: 'Build like one', channel: 'SMB partner page · LinkedIn ad',
      h1: ['You don’t need to be an enterprise to', 'build like one.'],
      // Names EAI's role in the build (page 20), and doesn't lead with security.
      sub: 'Enterprise AI adds the AI that does the work, a login for your client, and answers for their IT team.',
      order: ['chat', 'features', 'enterprise', 'agents', 'maths'],
      scene: { name: 'firm', items: 'The AI that does the work|A login for your client|Answers for their IT team', label: 'What you built, plus the AI that does the work, a login for your client and answers for their IT team.' },
      copy: {
        '#featH': 'The AI inside it does the work.',
        '#entH': 'Your client’s IT team will ask where their data sits. We answer that.',
      },
    },
    'client-can-trust': {
      short: 'Client can trust', channel: 'Founder post · sales deck · proposal cover',
      h1: ['Helping you deliver AI', 'your client can trust.'],
      // Shows how EAI earns it (page 21), with what the sections below demonstrate.
      sub: 'You can see every step the AI takes, every answer shows the page it came from, and a person approves before it goes live.',
      order: ['chat', 'control', 'features', 'enterprise'],
      scene: { name: 'cite', label: 'An answer shows the steps the AI took and the page it came from, and a person approves it.' },
      copy: {
        '#ctH': 'Nothing hidden inside a prompt.',
        '#control .sg-sub': 'Every step, and the AI and data it uses, on one map. You can show your client how it works before they ask.',
        '#featH': 'Every answer shows the page it came from.',
        '#features .sg-sub': 'Upload the handbook and the assistant answers from it. Every client’s copy answers from their own documents.',
        '#entH': 'Every action recorded. A person approves.',
      },
    },
  };

  const key = new URLSearchParams(location.search).get('lp');
  const lp = PAGES[key];
  if (!lp) return;

  const root = document.documentElement;
  root.dataset.lp = key;
  /* &site=1 as well: this tagline as the home page of the V3 site (remix 26),
     with the site's menu and footer. site.js loads last and names the tab
     after remix 26, so the tagline's title goes back on once it has. */
  const SITE = new URLSearchParams(location.search).get('site') === '1';
  const V2 = new URLSearchParams(location.search).get('lpv') === '2';
  if (V2) {
    root.dataset.lpv = '2';
    // The scenes' styles now, their script once the page is parsed (it has nothing to draw until hero() runs).
    document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="../29-lean/scenes.css" />');
    const js = document.createElement('script');
    js.src = '../29-lean/scenes.js';
    js.onload = () => scene();
    document.head.append(js);
  }
  const title = `${lp.h1.join(' ')} · Enterprise AI`;
  document.title = title;
  if (SITE) addEventListener('DOMContentLoaded', () => { document.title = title; });

  const all = [...document.querySelectorAll('.ps-page > [data-section]')].map((s) => s.dataset.section);
  window.EAILanding = { key, order: lp.order.slice(), hide: all.filter((k) => !lp.order.includes(k)) };

  const esc = (v) => v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // [head, tail]: the tail takes the cyan underline. A plain string is underlined by theme-brand.js's rule.
  const marked = ([head, tail]) => `${esc(head)} <span class="hl">${esc(tail)}</span>`;
  function set(sel, v) {
    const el = document.querySelector(sel);
    if (!el) return;
    if (Array.isArray(v)) el.innerHTML = marked(v);
    else if (v && v.html) el.innerHTML = v.html;
    else el.textContent = v;
  }

  /* The prompt box, as the claim has it (page 12). The suggestions are the
     four apps this demo can build, named the way the book's ads name theirs. */
  const CHIPS = [
    ['Client onboarding', 'A client onboarding app'],
    ['Campaign email', V2 ? 'A campaign email app' : 'A campaign email app for Nike'],
    ['Insurance claims', 'An insurance claims app'],
    ['Document review', 'A document review app for a law firm'],
  ];
  function hero() {
    const prompt = document.getElementById('hxPrompt');
    const h1 = prompt.querySelector('.hx-h1');
    let i = 0;
    const words = (t) => t.split(' ').map((w) => `<span class="w" style="--i:${i++}">${esc(w)}</span>`).join(' ');
    h1.innerHTML = `${words(lp.h1[0])} <span class="hl">${words(lp.h1[1])}</span>`;
    set('.hx-sub', lp.sub);
    if (lp.lede && !prompt.querySelector('.lp-lede')) {
      const p = document.createElement('p');
      p.className = 'lp-lede';
      p.textContent = lp.lede;
      prompt.prepend(p);
    }
    document.getElementById('hxInput').placeholder = 'Describe something you deliver for clients';
    document.querySelector('label[for="hxInput"]').textContent = 'Describe something you deliver for clients';
    prompt.querySelectorAll('.hx-chips [data-prompt]').forEach((b, n) => {
      b.textContent = CHIPS[n][0];
      b.dataset.prompt = CHIPS[n][1];
    });
    if (!prompt.querySelector('.lp-terms')) {
      const p = document.createElement('p');
      p.className = 'lp-terms';
      p.innerHTML = 'Free to build. You pay when it goes live. <span aria-hidden="true">·</span> <a href="mailto:growth@enterpriseaigroup.com">Talk to sales</a>';
      prompt.append(p);
    }
  }

  /* V2: the tagline as a picture, under the prompt box and its terms. Drawn
     once both the hero and scenes.js are there, whichever comes second. */
  function scene() {
    const prompt = document.getElementById('hxPrompt');
    if (!V2 || !lp.scene || !window.EAIScenes || prompt.querySelector('.lp-scene')) return;
    const el = document.createElement('div');
    el.className = 'lp-scene';
    el.dataset.scene = lp.scene.name;
    if (lp.scene.items) el.dataset.items = lp.scene.items;
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', lp.scene.label);
    prompt.append(el);
    window.EAIScenes.play(el);
  }

  /* Pricing, for the sign-up: remix 26's plans (the section in index.html,
     styled by ../26-site/site.css) just above the closing panel, under the
     commercial line (page 15). Each plan gets the button it has on
     ../26-site/pricing.html; here the first three go to sign up. */
  const SIGNUP = '../../../signup/pages/signup.html';
  const PLAN_ACTIONS = [
    ['Start building', SIGNUP],
    ['Choose Pro', SIGNUP],
    ['Choose Team', SIGNUP, true],
    ['Talk to sales', V2 ? '../29-lean/book-a-demo.html' : '../26-site/book-a-demo.html'],
  ];
  function pricing() {
    const sec = document.getElementById('pricing');
    const cta = document.getElementById('cta');
    if (!sec) return;
    sec.hidden = false;
    // arrange.js puts the sections back above the closing panel each time: pricing goes after them
    if (sec.nextElementSibling !== cta) cta.before(sec);
    set('#prH', ['Free to build,', 'pay to ship.']);
    // the plans' own buttons are the ask here; the link to the full page steps back
    sec.querySelector('.pr-home-head .st-btn').classList.add('st-btn-2');
    sec.querySelectorAll('.pr-tier').forEach((tier, n) => {
      if (tier.querySelector('.pr-tier-actions') || !PLAN_ACTIONS[n]) return;
      const [label, href, primary] = PLAN_ACTIONS[n];
      tier.insertAdjacentHTML('beforeend', `<div class="pr-tier-actions"><a class="st-btn${primary ? '' : ' st-btn-2'}" href="${href}">${label}</a></div>`);
    });
    // With ?site=1 the header is remix 26's site menu, which has its own Pricing.
    const links = document.querySelector('.nav-links');
    if (!SITE && !links.querySelector('a[href="#pricing"]')) links.insertAdjacentHTML('beforeend', '<a href="#pricing">Pricing</a>');
  }

  function apply() {
    hero();
    scene();
    Object.keys(lp.copy).forEach((sel) => set(sel, lp.copy[sel]));
    // V2's clients have no logos (arrange.js, V4): the builder's line promises colours and voice only
    if (V2 && typeof lp.copy['.bstage-sub'] === 'string') set('.bstage-sub', lp.copy['.bstage-sub'].replace('logo, colours and voice', 'colours and voice'));
    pricing();
    // The brand tagline lives at the close of things, never in the hero (page 14).
    set('#cta h2', ['Everything your app needs that you should never have to build', 'twice.']);
    // the pricing above it has just said what it costs
    document.querySelector('#cta p').hidden = true;
    // "Agent" isn't her word (page 26): the menu names the section the way its own kicker does.
    document.querySelectorAll('a[href="#agents"]').forEach((el) => { el.textContent = 'Bring your own AI'; });
  }
  addEventListener('arrange:change', apply);

  /* The meta layer (prototype only, like "All remixes" and "Arrange"): one bar
     over the page to move between the five. Each is a link to this address
     with the other key, so the page loads fresh in that tagline's copy.
     Keys 1–5 and the arrow keys do the same when you're not typing. */
  const keys = Object.keys(PAGES);
  const hrefFor = (k) => { const u = new URL(location.href); u.searchParams.set('lp', k); u.hash = ''; return u.pathname + u.search; };
  const bar = document.createElement('nav');
  bar.className = 'lp-switch';
  bar.setAttribute('aria-label', 'Landing pages by tagline (prototype only)');
  bar.innerHTML = '<span class="lp-switch-k">Tagline</span>' + keys.map((k, n) => {
    const p = PAGES[k];
    return `<a href="${esc(hrefFor(k))}" title="${esc(p.h1.join(' '))} · ${esc(p.channel)}"${k === key ? ' aria-current="page"' : ''}><b>${n + 1}</b><span>${esc(p.short)}</span></a>`;
  }).join('') + `<span class="lp-switch-for">${esc(lp.channel)}</span>`;
  document.body.append(bar);
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input, textarea, select, [contenteditable]')) return;
    const at = keys.indexOf(key);
    const to = /^[1-5]$/.test(e.key) ? Number(e.key) - 1 : e.key === 'ArrowRight' ? at + 1 : e.key === 'ArrowLeft' ? at - 1 : -1;
    if (to < 0 || to >= keys.length || to === at) return;
    location.assign(hrefFor(keys[to]));
  });
})();
