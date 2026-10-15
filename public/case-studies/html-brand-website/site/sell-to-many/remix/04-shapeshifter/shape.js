/* Shapeshifter — remix 04 of "Build once. Sell to many."

   The site IS the demo. Instead of showing an app being re-skinned inside a
   frame, this whole marketing page re-skins itself. The hero is a prompt:
   name your next client (or click Nike / Apple / CommBank) and a colour wipe
   floods the screen from the input, then collapses into a "Now wearing" pill
   — and underneath, every token has changed: colours, type, radius, button
   shapes, layout, logo, and every line of copy, rewritten in that brand's
   voice. The four-step Campaign email app, the tone-of-voice dial, the
   assistant and the phone preview all follow. Any other company name is
   read live (Clearbit -> Microlink / icon.horse, same as the main site) for
   colour and logo, with a templated voice.

   ?wear=apple      start wearing a brand (nike | apple | commbank | any name)
   ?autoplay=0      don't auto-play the "Apple" moment on load
*/
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  root.classList.add('js');
  const params = new URLSearchParams(location.search);
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => RM.matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const STM = window.STM || null;

  /* ------------------------------------------------------------------
     Logos
  ------------------------------------------------------------------ */
  const SWOOSH = '<svg viewBox="0 7 24 10" aria-hidden="true"><path d="M24 7.8 6.442 15.276c-1.456.616-2.679.925-3.668.925-1.11 0-1.922-.392-2.437-1.177-.317-.503-.4-1.152-.25-1.947.152-.795.532-1.643 1.14-2.543.505-.75 1.371-1.708 2.6-2.874-.365.615-.766 1.395-1.084 2.155-.55 1.32-.68 2.4-.394 3.24.13.375.365.65.68.83.36.2.83.29 1.41.29.44 0 .93-.06 1.47-.18L24 7.8Z" fill="currentColor"/></svg>';
  const APPLE = '<svg viewBox="150 100 500 560" aria-hidden="true"><path fill="currentColor" d="M584.8426,276.8632c-2.3411,1.4432-53.8358,31.4239-53.251,93.7952c0.6472,74.6027,65.3989,99.4457,66.1427,99.7276c-0.58,1.7759-10.3524,35.3838-34.1321,70.0925c-20.5507,30.0693-41.8387,59.968-75.4384,60.5922c-33.0098,0.6046-43.6489-19.5858-81.3589-19.5858c-37.7331,0-49.5436,18.9615-80.7596,20.1904c-32.4307,1.227-57.1214-32.4709-77.8236-62.3746c-42.3212-61.1983-74.679-172.9508-31.23-248.3679c21.5705-37.4546,60.1253-61.1835,101.9581-61.7964c31.8589-0.6021,61.9044,21.4174,81.3918,21.4174c19.209,0,53.636-25.6686,94.2163-22.6665C510.4626,229.066,555.6122,233.8129,584.8426,276.8632z M469.5186,187.488c17.2347-20.8293,28.8305-49.8377,25.6375-78.6904c-24.8053,0.9837-54.8058,16.5229-72.5975,37.339c-15.9324,18.4398-29.925,47.9732-26.1259,76.237C424.0806,224.5099,452.2985,208.3302,469.5186,187.488z"/></svg>';
  const WORDMARK = '<img class="wordmark" src="../../../assets/logos/eai-wordmark.svg" alt="Enterprise AI" />';
  const CB = '../../logos/commbank.svg';

  function logo(br, where) {
    if (br.key === 'house') {
      if (where === 'app') return '<span class="am-mono">Y</span>';
      return WORDMARK;
    }
    if (br.key === 'nike') return `<span class="lg-nike">${SWOOSH}</span>`;
    if (br.key === 'apple') return `<span class="lg-apple">${APPLE}</span>`;
    if (br.key === 'commbank') {
      if (where === 'nav') return `<span class="lg-tile"><img src="${CB}" alt="" /></span>`;
      if (where === 'read' || where === 'curtain') return `<span class="big-tile"><img src="${CB}" alt="" /></span>`;
      return `<img src="${CB}" alt="" />`;
    }
    // Live brand
    const mono = `<span class="am-mono">${esc(br.name[0].toUpperCase())}</span>`;
    if (!br.logoUrl) return where === 'nav' ? '' : mono;
    const img = `<img class="lg-img" src="${esc(br.logoUrl)}" alt="" referrerpolicy="no-referrer" data-fallback="${esc(br.name[0].toUpperCase())}" />`;
    return where === 'app' ? `<span class="lg-img">${img.replace('class="lg-img" ', '')}</span>` : img;
  }
  // Broken live logos fall back to a monogram.
  document.addEventListener('error', (e) => {
    const t = e.target;
    if (t.tagName === 'IMG' && t.dataset.fallback) {
      const s = document.createElement('span');
      s.className = 'am-mono';
      s.textContent = t.dataset.fallback;
      (t.closest('.lg-img:not(img)') || t).replaceWith(s);
    }
  }, true);

  /* ------------------------------------------------------------------
     Brands. `app` is how the client's Campaign email app looks; the site
     tokens live in shape.css under [data-theme].
  ------------------------------------------------------------------ */
  const BRANDS = {
    house: {
      key: 'house', name: 'Enterprise AI', appName: 'Your client', domain: 'enterpriseaigroup.com', dot: '#C6FF1A',
      tone: 'Stark, plain, confident', typeName: 'Archivo Expanded — wide, heavy, no apologies',
      swatches: ['#0B0B0B', '#F2F2EC', '#C6FF1A', '#FFFFFF'],
      disp: { f: "'Archivo'", w: 900, s: '125%', c: 'uppercase', t: '-0.025em' },
      curtain: ['#C6FF1A', '#0B0B0B'],
      app: { head: '#0B0B0B', headOn: '#F2F2EC', b: '#C6FF1A', on: '#0B0B0B', surface: '#F2F2EC', border: '#D6D6CC', font: "'Archivo', system-ui, sans-serif", btnR: '0px' },
      content: {
        goal: 'Launch the spring range…', audience: 'Loyalty members', date: '1 October',
        files: ['brand-guide.pdf', 'tone-of-voice.docx', 'spring-range-shots.zip'],
        subject: 'The spring range is here', body: 'New colours, new fits — and first pick for loyalty members this week.', cta: 'Shop the range',
      },
      dial: 50,
      voice: [
        ['Spring, whenever you’re ready.', 'The new range is in store now. Take a look when it suits — we’ve kept your size aside.', 'Take a look'],
        ['The spring range is here.', 'New colours, new fits, and first pick for loyalty members this week.', 'Shop the range'],
        ['48 hours. First pick. Go.', 'Loyalty members get the spring range before anyone else — until Sunday night.', 'Shop now'],
      ],
      chat: {
        hello: 'Hi — I’m the campaign assistant in this app. I can suggest subject lines, tighten copy or check the brief.',
        subjects: ['The spring range is here', 'First pick for loyalty members', 'New colours. New fits.'],
        who: 'Loyalty members. The brief says they get first pick this week, so I’ve led with that.',
        shorter: 'Spring range. First pick. This week.',
        other: 'I can help with that. Try one of the suggestions below.',
      },
    },
    nike: {
      key: 'nike', name: 'Nike', domain: 'nike.com', dot: '#FA5400',
      tone: 'Direct, urgent, athlete-first', typeName: 'Condensed. Uppercase. Loud.',
      swatches: ['#FA5400', '#111111', '#FFFFFF', '#F5F5F5'],
      disp: { f: "'Anton'", w: 400, s: '100%', c: 'uppercase', t: '0em' },
      curtain: ['#FA5400', '#FFFFFF'],
      app: { head: '#FA5400', headOn: '#FFFFFF', b: '#111111', on: '#FFFFFF', surface: '#F5F5F5', border: '#E5E5E5', font: "'Helvetica Neue', Helvetica, Arial, sans-serif", btnR: '999px' },
      content: {
        goal: 'Launch the Pegasus 41…', audience: 'Nike Run Club members', date: '3 October',
        files: ['nike-brand-guide.pdf', 'tone-of-voice.docx', 'pegasus-41-shots.zip'],
        subject: 'Pegasus 41 is here. Go.', body: 'Lighter, faster, ready for your next PB. Run Club members get first access this week.', cta: 'Shop now',
      },
      dial: 86,
      voice: [
        ['Your next run starts here.', 'The Pegasus 41. Lighter underfoot, softer on the long ones. Ready when you are.', 'Explore'],
        ['Pegasus 41 is here.', 'Lighter, faster, built for your next PB. Run Club members get first access this week.', 'Shop now'],
        ['Pegasus 41. Now. Go.', 'First access ends Sunday. Lace up, get out, beat your best.', 'Get yours'],
      ],
      chat: {
        hello: 'Hey. I’m the Nike campaign assistant. Let’s get this out the door.',
        subjects: ['Pegasus 41 is here. Go.', 'Your next PB starts now', 'Run Club: you’re first'],
        who: 'Nike Run Club members. Runners. Talk to them like a coach, not a catalogue.',
        shorter: 'Pegasus 41. Out now. Go.',
        other: 'Got it. Pick a prompt below and I’ll move fast.',
      },
    },
    apple: {
      key: 'apple', name: 'Apple', domain: 'apple.com', dot: '#0071E3',
      tone: 'Simple, confident, understated', typeName: 'San Francisco — quiet, precise, tight',
      swatches: ['#1D1D1F', '#0071E3', '#F5F5F7', '#FFFFFF'],
      disp: { f: "-apple-system, 'SF Pro Display', 'Inter', sans-serif", w: 600, s: '100%', c: 'none', t: '-0.035em' },
      curtain: ['#000000', '#F5F5F7'],
      app: { head: '#1D1D1F', headOn: '#F5F5F7', b: '#0071E3', on: '#FFFFFF', surface: '#F5F5F7', border: '#E3E3E8', font: "-apple-system, 'SF Pro Text', 'Inter', sans-serif", btnR: '980px' },
      content: {
        goal: 'Introduce the new iPhone…', audience: 'Apple Store customers', date: '9 October',
        files: ['apple-brand-guidelines.pdf', 'voice-and-tone.docx', 'iphone-product-shots.zip'],
        subject: 'Say hello to the new iPhone.', body: 'Our most advanced camera yet, in a design you’ll love to hold.', cta: 'Learn more',
      },
      dial: 16,
      voice: [
        ['Say hello to the new iPhone.', 'A camera that sees more. A design that feels like nothing else. Take your time.', 'Learn more'],
        ['The new iPhone is here.', 'Our most advanced camera yet, in a design you’ll love to hold. Available now.', 'Buy'],
        ['Pre-order today.', 'The new iPhone arrives Friday. Order now and pick it up at your nearest Apple Store.', 'Pre-order'],
      ],
      chat: {
        hello: 'Hello. I’m the Apple campaign assistant. How can I help?',
        subjects: ['Say hello to the new iPhone.', 'Pro. Beyond.', 'Available now at the Apple Store.'],
        who: 'Apple Store customers who’ve shown interest in iPhone. I’ve kept it simple and confident.',
        shorter: 'The new iPhone. Available now.',
        other: 'Happy to help. Try one of the suggestions below.',
      },
    },
    commbank: {
      key: 'commbank', name: 'CommBank', domain: 'commbank.com.au', dot: '#FFCC00',
      tone: 'Clear, helpful, reassuring', typeName: 'Rounded. Friendly. Easy to read.',
      swatches: ['#FFCC00', '#000000', '#FFFFFF', '#F7F7F7'],
      disp: { f: "'Plus Jakarta Sans'", w: 800, s: '100%', c: 'none', t: '-0.04em' },
      curtain: ['#FFCC00', '#000000'],
      app: { head: '#000000', headOn: '#FFFFFF', b: '#FFCC00', on: '#000000', surface: '#F7F7F7', border: '#E5E5E5', font: "'Plus Jakarta Sans', system-ui, sans-serif", btnR: '10px' },
      content: {
        goal: 'Launch Yello rewards for everyday accounts…', audience: 'CommBank app customers', date: '16 October',
        files: ['commbank-brand-guide.pdf', 'yello-offers.xlsx', 'app-screens.zip'],
        subject: 'Your Yello rewards are here', body: 'Earn rewards on your everyday account. See your offers in the CommBank app — no sign-up needed.', cta: 'See my offers',
      },
      dial: 50,
      voice: [
        ['Your rewards, whenever you need them.', 'Yello offers are waiting in the CommBank app. No sign-up, no fuss — open it when it suits you.', 'Have a look'],
        ['Your Yello rewards are here.', 'Earn rewards on your everyday account. See your offers in the CommBank app — no sign-up needed.', 'See my offers'],
        ['Don’t miss this week’s Yello offers.', 'New cashback offers end Sunday. Open the CommBank app today to activate yours.', 'Activate now'],
      ],
      chat: {
        hello: 'Hi, I’m the CommBank campaign assistant. I’m here to help you get this right.',
        subjects: ['Your Yello rewards are here', 'More value from your everyday account', 'Your offers are waiting in the app'],
        who: 'Everyday account customers who use the CommBank app. I’ve kept the tone clear and reassuring for them.',
        shorter: 'Your Yello rewards are ready in the app.',
        other: 'Thanks for asking. Choose a suggestion below and I’ll help straight away.',
      },
    },
  };
  const ALIASES = {
    'commonwealth bank': 'commbank', 'commonwealth bank of australia': 'commbank', cba: 'commbank', 'commbank.com.au': 'commbank', 'comm bank': 'commbank',
    'apple.com': 'apple', 'apple inc': 'apple', 'nike.com': 'nike', 'nike inc': 'nike',
    eai: 'house', 'enterprise ai': 'house', house: 'house',
  };
  function keyFor(raw) {
    const k = raw.trim().toLowerCase().replace(/\s+/g, ' ');
    if (BRANDS[k]) return k;
    return ALIASES[k] || null;
  }

  /* ------------------------------------------------------------------
     Copy, in each voice
  ------------------------------------------------------------------ */
  const COPY = {
    house: {
      kicker: 'Enterprise AI — for agencies, consultants and builders',
      h1a: 'Build once.', h1b: 'Sell to many.',
      sub: 'Build a four-step app for one client. Name the next one and it wears their logo, their colours and their voice. Same wiring underneath.',
      prompt: 'Who’s your next client?', placeholder: 'Type any company', hint: 'Watch this whole page change.',
      navCta: 'Start building',
      readTitle: 'One sentence. Their whole brand.',
      readSub: 'Name a client and EAI reads their website for colours, logo and tone of voice. The app wears it. Try it on this page — pick a client above.',
      stepsTitle: 'Four steps. Always four.',
      stepsSub: 'Every app is exactly four steps. It’s the shape clients understand — and the reason one build sells again and again.',
      step0: 'The client fills in four fields. Nothing new to learn.',
      step1: 'Pulls their brand guide and product shots from where they already live.',
      step2: 'AI drafts the email from the brief and assets — in the client’s voice.',
      step3: 'One person approves. Then it sends.',
      voiceTitle: 'It talks like them.',
      voiceSub: 'Tone of voice is read from their site, then yours to tune. Slide it.',
      aiTitle: 'Every app has its own assistant.',
      aiSub: 'Not for you — for your client’s team. It lives inside the published app, wears their brand and speaks in their voice.',
      ai1: 'Inside the app, on the right — where the work happens.', ai2: 'Helps their team write, shorten and check.', ai3: 'Helps with the work. Never changes the app.',
      phoneTitle: 'On their phone in one scan.',
      phoneSub: 'Share gives you a link and a QR code. Your client opens their app — the same four steps, in their pocket.',
      ctaTitle: 'What would you sell twice?',
      ctaSub: 'Build it once. Then sell it to the next client, and the one after that.',
      ctaBtn: 'Start building',
    },
    nike: {
      kicker: 'Enterprise AI × Nike — for the ones who ship',
      h1a: 'Build it once.', h1b: 'Run it everywhere.',
      sub: 'Four steps. Zero rebuilds. Name the next client and the app suits up in their colours and talks their talk. Go.',
      prompt: 'Who’s next?', placeholder: 'Name your next client', hint: 'No warm-up needed.',
      navCta: 'Start now',
      readTitle: 'One sentence. Full kit.',
      readSub: 'We read nike.com. Colour. Swoosh. Voice. The whole page suited up in a second.',
      stepsTitle: 'Four steps. No shortcuts.',
      stepsSub: 'Exactly four. Every app. Every client. That discipline is what makes it repeatable.',
      step0: 'Four fields. Done. Move.',
      step1: 'Brand guide and Pegasus shots, pulled in. Always current.',
      step2: 'AI writes it the Nike way — direct, fast, athlete-first.',
      step3: 'One sign-off. Then it ships.',
      voiceTitle: 'Speaks Nike.',
      voiceSub: 'Voice read from nike.com. It starts loud. Turn it up or bring it down.',
      aiTitle: 'A coach in every app.',
      aiSub: 'Built for Nike’s team, inside the app. Wears the swoosh. Talks like Nike.',
      ai1: 'Inside the app. Right where the work is.', ai2: 'Writes. Cuts. Checks. Fast.', ai3: 'Backs the team. Never touches the build.',
      phoneTitle: 'In their hand. One scan.',
      phoneSub: 'Share. Scan. Nike’s app is on the phone — same four steps, ready to run.',
      ctaTitle: 'What would you sell twice?',
      ctaSub: 'Build it once. Then go again. And again.',
      ctaBtn: 'Start building',
    },
    apple: {
      kicker: 'Enterprise AI. For Apple.',
      h1a: 'One app.', h1b: 'Every client.',
      sub: 'Build it once, in four simple steps. Name your next client and it becomes theirs — their look, their voice. Everything underneath stays the same.',
      prompt: 'Who’s next?', placeholder: 'Any company', hint: 'The whole page adapts.',
      navCta: 'Get started',
      readTitle: 'One sentence. Completely theirs.',
      readSub: 'Colour, logo and tone of voice, read from apple.com. Applied everywhere. Instantly.',
      stepsTitle: 'Four steps. Nothing more.',
      stepsSub: 'Every app is exactly four steps. Simple to build. Simple to sell. Again and again.',
      step0: 'Four fields. That’s the brief.',
      step1: 'Brand guidelines and product shots. Always up to date.',
      step2: 'Written for you. In Apple’s voice.',
      step3: 'Approve once. It’s on its way.',
      voiceTitle: 'Sounds like Apple.',
      voiceSub: 'Tone of voice, read from apple.com. Adjust it with a touch.',
      aiTitle: 'Intelligence, built in.',
      aiSub: 'For Apple’s team, right inside the app. Designed for the brand. Fluent in its voice.',
      ai1: 'Inside the app.', ai2: 'Helps with the work.', ai3: 'Leaves the app exactly as it is.',
      phoneTitle: 'Right there. In your pocket.',
      phoneSub: 'Share a link or a QR code. The client’s app opens on their iPhone — the same four steps.',
      ctaTitle: 'What would you sell twice?',
      ctaSub: 'Build it once. Then bring it to everyone.',
      ctaBtn: 'Get started',
    },
    commbank: {
      kicker: 'Enterprise AI for CommBank',
      h1a: 'Build it once.', h1b: 'Share it with many.',
      sub: 'Make a four-step app for one client, then set it up for the next in a sentence. Their brand and their voice, with the same wiring underneath — so there’s nothing to rebuild.',
      prompt: 'Who would you like to set up next?', placeholder: 'Enter a company name', hint: 'We’ll update this page for you.',
      navCta: 'Get started',
      readTitle: 'One sentence. We’ll handle the rest.',
      readSub: 'We read commbank.com.au for colours, logo and tone of voice, then apply them for you. You can check everything before it goes live.',
      stepsTitle: 'Four clear steps, every time.',
      stepsSub: 'Every app follows the same four steps, so it’s easy to understand and easy to reuse.',
      step0: 'Four simple fields to get you started.',
      step1: 'Your brand guide and offers, kept up to date automatically.',
      step2: 'A first draft written for you, in a clear and helpful voice.',
      step3: 'One approval before anything is sent.',
      voiceTitle: 'Sounds like CommBank.',
      voiceSub: 'We’ve read the tone from commbank.com.au. Adjust it to suit the moment.',
      aiTitle: 'Help is always on hand.',
      aiSub: 'Every app includes its own assistant for your client’s team — inside the published app, in CommBank’s brand and voice.',
      ai1: 'Right there in the app, whenever the team needs it.', ai2: 'Helps write, shorten and check campaign emails.', ai3: 'It helps with the work — it won’t change the app itself.',
      phoneTitle: 'Ready on their phone.',
      phoneSub: 'Share a link or QR code and your client can open their app straight away — the same four steps.',
      ctaTitle: 'What would you sell twice?',
      ctaSub: 'Start with one app. We’ll help you take it further.',
      ctaBtn: 'Get started',
    },
  };
  function liveCopy(br) {
    const N = br.name, D = br.domain;
    return Object.assign({}, COPY.house, {
      kicker: `Enterprise AI × ${N}`,
      h1a: 'Build once.', h1b: `Sell to ${N}.`,
      sub: `The same four-step app, now in ${N}’s colours, logo and voice — read from ${D} a moment ago. Nothing underneath changed.`,
      prompt: 'Who’s next?', hint: 'Try another — any company.',
      readTitle: `One sentence. All ${N}.`,
      readSub: `We read ${D} for colour, logo and tone of voice, and this page wore it. Here’s what we found.`,
      step2: `AI drafts the email from the brief and assets — in ${N}’s voice.`,
      voiceTitle: `Talks like ${N}.`,
      voiceSub: `Tone read from ${D}. Slide it to suit the moment.`,
      aiTitle: `${N}’s own assistant.`,
      aiSub: `For ${N}’s team, inside the published app — in ${N}’s brand and voice.`,
      phoneTitle: `${N}’s app, on a phone.`,
    });
  }
  const copyFor = (br) => (br.live ? liveCopy(br) : COPY[br.key]);

  /* ------------------------------------------------------------------
     Colour helpers (for live brands)
  ------------------------------------------------------------------ */
  function rgbOf(hex) {
    const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const toHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
  function lum(hex) {
    const ch = rgbOf(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }
  const inkFor = (hex) => (lum(hex) > 0.4 ? '#111111' : '#FFFFFF');
  const tint = (hex, amt) => toHex(rgbOf(hex).map((v) => 255 - (255 - v) * amt));
  const shade = (hex, amt) => toHex(rgbOf(hex).map((v) => v * (1 - amt)));
  function hslHex(h, s, l) {
    s /= 100; l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return toHex([f(0) * 255, f(8) * 255, f(4) * 255]);
  }
  function hashOf(s) { let h = 0; for (const ch of s.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }

  const LIVE_FONTS = [
    { f: "'Space Grotesk', system-ui, sans-serif", w: 700, s: '100%', c: 'none', t: '-0.045em', lead: '.92', h1: '150px', name: 'Space Grotesk — geometric, modern' },
    { f: "'Fraunces', Georgia, serif", w: 800, s: '100%', c: 'none', t: '-0.03em', lead: '.92', h1: '150px', name: 'Fraunces — a serif with character' },
    { f: "'Archivo', system-ui, sans-serif", w: 800, s: '75%', c: 'uppercase', t: '-0.01em', lead: '.88', h1: '180px', name: 'Archivo Condensed — tall and tight' },
  ];
  const LIVE_SHAPES = [['0px', '0px'], ['16px', '999px'], ['10px', '8px']];

  // Site tokens for a brand we've only just read: the colour decides the page.
  function liveTokens(P, h) {
    const f = LIVE_FONTS[h % 3];
    const [r, btnR] = LIVE_SHAPES[(h >> 3) % 3];
    const L = lum(P);
    const on = inkFor(P);
    const base = {
      'f-display': f.f, 'h-weight': String(f.w), 'h-stretch': f.s, 'h-case': f.c, 'h-track': f.t, 'h-lead': f.lead, h1: f.h1, h1m: 'calc(' + f.h1 + ' * .36)', h2: '84px',
      'f-body': "'Archivo', system-ui, sans-serif", 'f-label': "'JetBrains Mono', ui-monospace, monospace",
      'label-case': 'uppercase', 'label-track': '.04em', 'label-weight': '500', 'label-size': '12px',
      r, 'btn-r': btnR, lw: '2px', 'btn-shadow': 'none', shadow: '0 24px 60px -30px rgba(0,0,0,.45)',
      'h-word': '0em', cur: P, 'cur-edge': on === '#111111' ? '#111111' : '#FFFFFF',
    };
    if (L > 0.42) { // light brand colour: the page wears it, like CommBank
      return Object.assign(base, {
        bg: P, ink: '#111111', muted: shade(P, 0.68), line: '#111111', surface: '#FFFFFF',
        block: '#111111', 'block-ink': '#FFFFFF', 'block-muted': '#B5B5B5', 'block-accent': P,
        pop: '#FFFFFF', 'pop-ink': '#111111', 'pop-muted': '#555555',
        'mark-bg': '#111111', 'mark-ink': P, link: '#111111',
        'btn-bg': '#111111', 'btn-ink': '#FFFFFF', 'btn-line': '#111111',
        'nav-bg': P, 'nav-line': '#111111',
        'cta-bg': P, 'cta-ink': '#111111', 'cta-btn-bg': '#111111', 'cta-btn-ink': P,
        'phone-bg': '#FFFFFF', 'phone-ink': '#111111', 'phone-muted': '#555555', 'surface-muted': '#555555',
      });
    }
    // mid or dark: a light page, the colour in blocks and marks
    const dark = L < 0.12;
    return Object.assign(base, {
      bg: tint(P, 0.05), ink: '#111111', muted: '#55555A', line: '#111111', surface: '#FFFFFF',
      block: dark ? P : '#111111', 'block-ink': '#FFFFFF', 'block-muted': dark ? tint(P, 0.45) : '#A8A8A8', 'block-accent': dark ? tint(P, 0.3) : tint(P, 0.75),
      pop: P, 'pop-ink': on, 'pop-muted': on === '#111111' ? '#333333' : tint(P, 0.25),
      'mark-bg': P, 'mark-ink': on, link: dark ? P : shade(P, 0.25),
      'btn-bg': P, 'btn-ink': on, 'btn-line': P,
      'nav-bg': tint(P, 0.05), 'nav-line': '#111111',
      'cta-bg': P, 'cta-ink': on, 'cta-btn-bg': '#111111', 'cta-btn-ink': '#FFFFFF',
      'phone-bg': '#FFFFFF', 'phone-ink': '#111111', 'phone-muted': '#55555A', 'surface-muted': '#55555A',
    });
  }
  const LIVE_KEYS = Object.keys(liveTokens('#336699', 0));

  // Turn a looked-up brand (from app-view.js's liveBrand, or our guess) into ours.
  function fromLive(lb) {
    const P = /^#/.test(lb.b) ? lb.b.toUpperCase() : '#1D1D1F';
    const h = hashOf(lb.name);
    const m = /src="([^"]+)"/.exec(lb.logo || '');
    const on = inkFor(P);
    const f = LIVE_FONTS[h % 3];
    const N = lb.name;
    const sw = (lb.swatches || [P]).slice(0, 4);
    while (sw.length < 4) sw.push(['#FFFFFF', '#111111', tint(P, 0.1)][sw.length - 1] || '#FFFFFF');
    return {
      key: 'live', live: true, name: N, domain: lb.domain, logoUrl: m ? m[1].replace(/&amp;/g, '&') : null, dot: P,
      tone: lb.about ? `“${lb.about.length > 90 ? lb.about.slice(0, 88) + '…' : lb.about}”` : (lb.tone || 'Read live from their site'),
      typeName: f.name, swatches: sw,
      disp: f, curtain: [P, on], tokens: liveTokens(P, h),
      app: { head: P, headOn: on, b: P, on, surface: tint(P, 0.05), border: tint(P, 0.16), font: "'Archivo', system-ui, sans-serif", btnR: LIVE_SHAPES[(h >> 3) % 3][1] },
      content: {
        goal: `Announce what’s new at ${N}…`, audience: `${N} customers`, date: '28 October',
        files: [`${N.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-brand-guide.pdf`, 'tone-of-voice.docx', 'product-shots.zip'],
        subject: `What’s new at ${N}`, body: `Here’s what’s new at ${N} this month — picked for you.`, cta: 'Find out more',
      },
      dial: 50,
      voice: [
        [`Something new from ${N}, when you’re ready.`, 'We’ve put together what’s new this month. Take a look whenever it suits.', 'Take a look'],
        [`What’s new at ${N}`, `Here’s what’s new at ${N} this month — picked for ${N} customers.`, 'Find out more'],
        [`This week only at ${N}.`, 'It ends Sunday. Open it now before it’s gone.', 'Don’t miss it'],
      ],
      chat: {
        hello: `Hi — I’m the ${N} campaign assistant. I’ve read ${lb.domain}, so I’ll write the way they do.`,
        subjects: [`What’s new at ${N}`, `${N}: made for you`, `Don’t miss this from ${N}`],
        who: `${N} customers. I’ve matched the tone to what’s on ${lb.domain}.`,
        shorter: `New at ${N}. Take a look.`,
        other: 'Sure. Try one of the suggestions below.',
      },
      stm: lb,
    };
  }

  /* ------------------------------------------------------------------
     Live lookup (same approach as sell.js)
  ------------------------------------------------------------------ */
  function withTimeout(ms) { const c = new AbortController(); setTimeout(() => c.abort(), ms); return c.signal; }
  async function findDomain(name) {
    if (/\.[a-z]{2,}$/i.test(name)) return { name, domain: name.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '') };
    try {
      const r = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(name)}`, { signal: withTimeout(4000) });
      const list = await r.json();
      if (list[0] && list[0].domain) return { name: list[0].name, domain: list[0].domain };
    } catch (e) { /* fall through */ }
    return { name, domain: name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com' };
  }
  async function viaMicrolink(found) {
    const url = `https://api.microlink.io/?url=${encodeURIComponent('https://' + found.domain)}&palette=true&prerender=false`;
    const json = await fetch(url, { signal: withTimeout(12000) }).then((r) => r.json());
    if (json.status !== 'success') throw new Error('lookup failed');
    const d = json.data;
    const logoPal = (d.logo && d.logo.palette) || [];
    const imagePal = (d.image && d.image.palette) || [];
    return STM.liveBrand(found, STM.pickPrimary(logoPal, imagePal), d.logo && d.logo.url, logoPal.concat(imagePal), d.description || d.title);
  }
  function viaIcon(found) {
    const src = `https://icon.horse/icon/${found.domain}`;
    return new Promise((res, rej) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onerror = rej;
      img.onload = () => {
        try {
          const c = document.createElement('canvas');
          c.width = c.height = 32;
          const x = c.getContext('2d');
          x.drawImage(img, 0, 0, 32, 32);
          const px = x.getImageData(0, 0, 32, 32).data;
          const counts = {};
          for (let i = 0; i < px.length; i += 4) {
            if (px[i + 3] < 200) continue;
            const hex = '#' + [px[i], px[i + 1], px[i + 2]].map((v) => (v & 0xf0).toString(16).padStart(2, '0')).join('');
            counts[hex] = (counts[hex] || 0) + 1;
          }
          const pal = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 8);
          res(STM.liveBrand(found, STM.pickPrimary(pal, []), src, pal, ''));
        } catch (e) { rej(e); }
      };
      img.src = src;
    });
  }
  function guess(name) {
    const h = hashOf(name);
    const P = hslHex(h % 360, 64, 44);
    return { name, domain: name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com', b: P, logo: null, swatches: [P, '#FFFFFF', '#111111', hslHex((h + 150) % 360, 60, 55)], tone: 'Best guess — couldn’t reach their site' };
  }
  async function readLive(name, say) {
    if (!STM) return guess(name);
    const found = await findDomain(name);
    say(`Found ${found.domain} — reading logo, colours and voice…`);
    const full = viaMicrolink(found).catch(() => null);
    const icon = viaIcon(found).catch(() => null);
    const later = wait(6000).then(() => icon);
    let b = await Promise.race([full, later]);
    if (!b) b = (await Promise.race([full, wait(4000)])) || (await icon);
    return b || Object.assign(guess(name), { domain: found.domain });
  }

  /* ------------------------------------------------------------------
     Text effects
  ------------------------------------------------------------------ */
  const UP = 'ABCDEFGHKLMNOPRSTUVXYZ#%&+=0123456789';
  const LO = 'abcdefghkmnoprstuvxyz#%&+=';
  const running = new WeakMap();
  function scramble(el, text, dur) {
    dur = dur || 800;
    const prev = running.get(el);
    if (prev) cancelAnimationFrame(prev);
    if (reduced()) { el.textContent = text; return; }
    const n = text.length;
    const at = Array.from(text, (c, i) => (i / Math.max(1, n)) * dur * 0.6 + Math.random() * dur * 0.4);
    const t0 = performance.now();
    const tick = (now) => {
      const t = now - t0;
      let out = '';
      let done = true;
      for (let i = 0; i < n; i++) {
        const c = text[i];
        if (t >= at[i] || c === ' ' || c === '.' || c === ',') out += c;
        else {
          done = false;
          const set = c === c.toLowerCase() && c !== c.toUpperCase() ? LO : UP;
          out += set[(Math.random() * set.length) | 0];
        }
      }
      el.textContent = out;
      if (done) running.delete(el);
      else running.set(el, requestAnimationFrame(tick));
    };
    running.set(el, requestAnimationFrame(tick));
  }
  const typers = new WeakMap();
  function typeOut(el, text, speed) {
    const id = (typers.get(el) || 0) + 1;
    typers.set(el, id);
    if (reduced()) { el.textContent = text; return; }
    el.textContent = '';
    let i = 0;
    const step = () => {
      if (typers.get(el) !== id) return;
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(step, speed || 38);
    };
    step();
  }
  function inView(el) {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight && r.width > 0;
  }

  // Fit the big lines to the width available.
  function textWidth(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    return range.getBoundingClientRect().width;
  }
  function fit() {
    const h1 = $('h1');
    h1.style.fontSize = '';
    const mobile = innerWidth <= 820;
    const max = parseFloat(getComputedStyle(h1).fontSize);
    const lines = [...h1.querySelectorAll('.h1-line')];
    const avail = h1.clientWidth;
    const widest = Math.max(...lines.map(textWidth));
    const heightCap = Math.max(56, (innerHeight - 470) / 2 / 0.92);
    if (!mobile) { // desktop: each line fills the width, never wraps
      const size = Math.min(max, max * (avail / widest) * 0.985, heightCap);
      h1.style.fontSize = size.toFixed(1) + 'px';
    }

    const foot = $('footBig');
    foot.style.fontSize = '100px';
    const fw = textWidth(foot);
    foot.style.fontSize = Math.min(420, (100 * foot.clientWidth) / fw * 0.99).toFixed(1) + 'px';
  }

  /* ------------------------------------------------------------------
     The client's Campaign email app, at each step
  ------------------------------------------------------------------ */
  const STEP_NAMES = ['Brief', 'Assets', 'Compose', 'Review'];
  const NEXT = ['Next: assets', 'Next: compose', 'Next: review', 'Approve and send'];
  function appHTML(br, i) {
    const c = br.content;
    const head = `<div class="am-head"><span class="am-logo">${logo(br, 'app')}</span><span class="am-name">${esc(br.appName || br.name)}</span><span class="am-app">Campaign email</span></div>`;
    const steps = '<div class="am-steps">' + STEP_NAMES.map((s, n) => `<span class="${n < i ? 'done' : n === i ? 'on' : ''}">${s}</span>`).join('') + '</div>';
    const cta = `<span class="am-cta">${NEXT[i]}</span>`;
    let card;
    if (i === 0) {
      card = '<div class="am-ct">Tell us about the campaign</div><div class="am-cs">Four fields. The rest is written for you.</div>' +
        `<div class="am-f"><small>Campaign goal</small><span>${esc(c.goal)}</span></div>` +
        `<div class="am-row"><div class="am-f"><small>Audience</small><span>${esc(c.audience)}</span></div><div class="am-f"><small>Send date</small><span>${esc(c.date)}</span></div></div>`;
    } else if (i === 1) {
      card = '<div class="am-ct">Assets</div><div class="am-cs">Pulled from SharePoint · Brand / Guidelines</div>' +
        c.files.map((f) => `<div class="am-file"><i></i><span>${esc(f)}</span><small>Synced 2 min ago</small></div>`).join('') +
        '<div class="am-note">Kept current — the next campaign reads whatever’s newest.</div>';
    } else if (i === 2) {
      card = `<div class="am-ct">Compose</div><div class="am-cs">Drafted by AI, in ${esc(br.appName ? 'your client' : br.name)}’s voice.</div>` +
        `<div class="am-subj"><b>Subject</b>${esc(c.subject)}</div>` +
        `<div class="am-mail"><div class="am-mail-bar">${logo(br, 'app')}</div><div class="am-mail-in"><b>${esc(c.subject)}</b><p>${esc(c.body)}</p><span>${esc(c.cta)}</span></div></div>`;
    } else {
      card = `<div class="am-ct">Review</div><div class="am-cs">One approval before it sends on ${esc(c.date)}.</div>` +
        '<div class="am-who"><span class="am-av">JL</span><div><b>Jordan Lee</b><small>Marketing lead · approver</small></div><span class="am-state">Waiting</span></div>' +
        ['Brand colours and logo', `Tone of voice — ${br.live ? 'read from ' + br.domain : br.tone}`, 'Links and unsubscribe checked']
          .map((t) => `<div class="am-check"><i>✓</i>${esc(t)}</div>`).join('');
    }
    return `<div class="am">${head}<div class="am-body">${steps}<div class="am-card">${card}${cta}</div></div></div>`;
  }

  /* ------------------------------------------------------------------
     Apply a brand to the whole page
  ------------------------------------------------------------------ */
  let current = BRANDS.house;
  let voiceZone = -1;

  function setCopy(br, animate) {
    const copy = copyFor(br);
    document.querySelectorAll('[data-copy]').forEach((el) => {
      const text = copy[el.dataset.copy];
      if (text == null) return;
      if (animate && inView(el)) scramble(el, text, el.closest('.h1') ? 900 : 700);
      else { const p = running.get(el); if (p) cancelAnimationFrame(p); el.textContent = text; }
    });
  }

  function apply(br, opts) {
    opts = opts || {};
    current = br;
    const house = br.key === 'house';
    root.dataset.theme = br.live ? 'live' : br.key;
    LIVE_KEYS.forEach((k) => root.style.removeProperty('--' + k));
    if (br.live) Object.entries(br.tokens).forEach(([k, v]) => root.style.setProperty('--' + k, v));
    const a = br.app;
    [['am-head', a.head], ['am-head-on', a.headOn], ['am-b', a.b], ['am-on', a.on], ['am-surface', a.surface], ['am-border', a.border], ['am-font', a.font], ['am-btn-r', a.btnR]]
      .forEach(([k, v]) => root.style.setProperty('--' + k, v));
    document.querySelector('meta[name="theme-color"]').content = getComputedStyle(root).getPropertyValue('--bg').trim() || '#fff';

    // Nav + pill
    $('navLogo').innerHTML = house ? WORDMARK
      : logo(br, 'nav') + (br.live ? `<span class="lg-name">${esc(br.name)}</span>` : '') + '<span class="lg-with label">with Enterprise AI</span>';
    $('wearing').hidden = house;
    $('wearingName').textContent = br.name;
    $('wearing').style.setProperty('--wear-c', br.dot);
    $('heroMetaR').textContent = house ? 'House style · 01' : `Read from ${br.domain}`;
    document.querySelectorAll('#chips .chip').forEach((c) => c.classList.toggle('on', c.dataset.wear === br.key));

    setCopy(br, opts.animate);

    // 02 — the read
    document.querySelectorAll('[data-src]').forEach((s) => (s.textContent = `from ${br.domain}`));
    $('readLogo').innerHTML = logo(br, 'read');
    $('readSwatches').innerHTML = br.swatches.map((c, i) =>
      `<span class="sw" style="background:${c};color:${inkFor(c)};animation-delay:${i * 70}ms">${c}</span>`).join('');
    $('readTone').textContent = br.tone;
    $('readType').textContent = br.typeName;
    const sentence = house ? 'Make it right for ______.' : `Make it right for ${br.name}.`;
    if (opts.animate && inView($('sentenceText'))) typeOut($('sentenceText'), sentence);
    else $('sentenceText').textContent = sentence;

    // 03 — the app at each step
    document.querySelectorAll('[data-app]').forEach((el) => (el.innerHTML = appHTML(br, +el.dataset.app)));

    // 04 — voice
    $('dial').value = br.dial;
    $('mailLogo').innerHTML = logo(br, 'app');
    $('mailFrom').textContent = `From: ${house ? 'your client' : br.name} · news@${br.domain}`;
    $('dialRead').innerHTML = `Read from <b>${esc(br.domain)}</b>: ${esc(br.live ? 'matched to their site' : br.tone)}. The dial starts where their site sits.`;
    voiceZone = -1;
    renderVoice(opts.animate);

    // 01 — the builder answers the maker (EAI's voice, not the client's)
    $('bldSay').textContent = house
      ? 'Who’s your next client? I’ll read their site and re-skin this app — and this whole page. Same four steps underneath.'
      : `Done. This app now wears ${br.name} — colours, logo and voice read from ${br.domain}. Same four steps, same wiring. Who’s next?`;

    // 05 — the in-app assistant, for the client's team
    renderInapp();

    // 06 — phone
    paintShare();

    // Footer
    $('footBig').innerHTML = house ? 'ENTERPRISE AI' : `${esc(br.name)} <span class="x">×</span> EAI`;

    // Shareable URL
    const u = new URL(location.href);
    if (house) u.searchParams.delete('wear');
    else u.searchParams.set('wear', br.live ? br.name : br.key);
    history.replaceState(null, '', u);

    fit();
    if (document.fonts) document.fonts.ready.then(fit);
    layoutSteps();
  }

  /* ------------------------------------------------------------------
     Wearing a brand: the curtain
  ------------------------------------------------------------------ */
  const curtain = $('curtain');
  const curtainIn = $('curtainIn');
  let busy = false;

  function centreOf(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  const reach = (p) => Math.hypot(Math.max(p.x, innerWidth - p.x), Math.max(p.y, innerHeight - p.y)) + 2;

  function paintCurtain(br) {
    curtain.style.setProperty('--curtain-bg', br.curtain[0]);
    curtain.style.setProperty('--curtain-ink', br.curtain[1]);
    $('curtainLogo').innerHTML = logo(br, 'curtain');
    const n = $('curtainName');
    n.textContent = br.key === 'house' ? 'House style' : br.name;
    const d = br.disp;
    Object.assign(n.style, { fontFamily: d.f, fontWeight: d.w, fontStretch: d.s, textTransform: d.c, letterSpacing: d.t });
    n.style.fontSize = br.key === 'house' ? '64px' : '';
    $('curtainRead').textContent = br.key === 'house' ? 'Back to Enterprise AI' : `Read from ${br.domain} — colour · logo · voice`;
  }

  async function transition(br, from) {
    if (reduced() || !curtain.animate) { apply(br, { animate: false }); return; }
    paintCurtain(br);
    curtain.classList.add('on');
    const o = from || { x: innerWidth / 2, y: innerHeight / 2 };
    const R = reach(o);
    const grow = curtain.animate({ clipPath: [`circle(0px at ${o.x}px ${o.y}px)`, `circle(${R}px at ${o.x}px ${o.y}px)`] },
      { duration: 760, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' });
    const inA = curtainIn.animate([{ transform: 'scale(.55) translateY(40px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: 620, delay: 260, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
    await grow.finished;
    apply(br, { animate: false });
    await wait(420);

    const target = br.key === 'house' ? centreOf($('navLogo')) : centreOf($('wearing'));
    const R2 = reach(target);
    const shrink = curtain.animate({ clipPath: [`circle(${R2}px at ${target.x}px ${target.y}px)`, `circle(0px at ${target.x}px ${target.y}px)`] },
      { duration: 820, easing: 'cubic-bezier(.7,0,.25,1)', fill: 'forwards' });
    inA.cancel();
    const outA = curtainIn.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${target.x - innerWidth / 2}px, ${target.y - innerHeight / 2}px) scale(.08)`, opacity: 0 }],
      { duration: 700, easing: 'cubic-bezier(.7,0,.3,1)', fill: 'forwards' });
    setTimeout(() => setCopy(br, true), 120);
    await shrink.finished;
    curtain.classList.remove('on');
    grow.cancel(); shrink.cancel(); outA.cancel();
  }

  const status = $('status');
  function say(t, isBusy) { status.textContent = t; status.classList.toggle('is-busy', !!isBusy); }

  function preloadImg(url, ms) {
    if (!url) return Promise.resolve();
    return Promise.race([new Promise((r) => { const i = new Image(); i.referrerPolicy = 'no-referrer'; i.onload = i.onerror = r; i.src = url; }), wait(ms)]);
  }

  async function wear(what, fromEl) {
    if (busy) return;
    touched = true;
    const key = BRANDS[what] ? what : keyFor(what);
    let br = key ? BRANDS[key] : null;
    const from = fromEl ? centreOf(fromEl) : null;
    busy = true;
    try {
      if (!br) {
        const name = what.trim();
        say(`Looking up ${name}…`, true);
        $('who').disabled = true;
        const lb = await readLive(name, (t) => say(t, true));
        br = fromLive(lb);
        await preloadImg(br.logoUrl, 2500);
        $('who').disabled = false;
      }
      if (br === current || (br.live && current.live && br.name === current.name)) {
        say(`Already wearing ${br.name}.`);
        busy = false;
        return;
      }
      say('');
      $('who').value = '';
      await transition(br, from);
    } catch (e) {
      say('Couldn’t read that one — try another name.');
      $('who').disabled = false;
    }
    busy = false;
  }

  /* ------------------------------------------------------------------
     Hero prompt, chips, pill, marquee
  ------------------------------------------------------------------ */
  let touched = false;
  $('prompt').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('who').value.trim();
    if (!v) { $('who').focus(); return; }
    wear(v, $('whoGo'));
  });
  $('who').addEventListener('focus', () => { touched = true; });
  document.querySelectorAll('[data-wear]').forEach((b) => b.addEventListener('click', () => wear(b.dataset.wear, b)));
  $('wearingX').addEventListener('click', () => wear('house', $('wearingX')));
  $('ctaAgain').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
    setTimeout(() => $('who').focus({ preventScroll: true }), reduced() ? 0 : 700);
  });

  const NAMES = ['Nike', 'Apple', 'CommBank', 'Qantas', 'Atlassian', 'Canva', 'Telstra', 'Woolworths', 'Bunnings', 'Afterpay', 'Aesop', 'Spotify'];
  const track = $('marqueeTrack');
  const setHTML = NAMES.map((n) => `<button type="button" class="mq-item" data-name="${n}"><span>${n}</span><span class="star" aria-hidden="true">✺</span></button>`).join('');
  track.innerHTML = `<div class="mq-set">${setHTML}</div><div class="mq-set" aria-hidden="true">${setHTML}</div>`;
  track.querySelectorAll('.mq-set')[1].querySelectorAll('button').forEach((b) => (b.tabIndex = -1));
  track.addEventListener('click', (e) => { const b = e.target.closest('.mq-item'); if (b) wear(b.dataset.name, b); });

  let mqX = 0, mqBoost = 0, mqLast = performance.now(), mqOn = true, lastY = scrollY;
  const mqSet = track.querySelector('.mq-set');
  function marquee(now) {
    const dt = Math.min(64, now - mqLast);
    mqLast = now;
    if (mqOn && !reduced()) {
      mqBoost *= 0.93;
      mqX -= (60 + mqBoost) * dt / 1000;
      const w = mqSet.offsetWidth;
      if (w && -mqX >= w) mqX += w;
      track.style.transform = `translate3d(${mqX.toFixed(1)}px,0,0)`;
    }
    requestAnimationFrame(marquee);
  }
  requestAnimationFrame(marquee);
  new IntersectionObserver((es) => { mqOn = es[0].isIntersecting; }).observe($('marquee'));
  $('marquee').addEventListener('mouseenter', () => { mqBoost = -45; });

  /* ------------------------------------------------------------------
     03 — pinned horizontal steps
  ------------------------------------------------------------------ */
  const stepsSec = $('steps');
  const stepsTrack = $('stepsTrack');
  const meter = [...$('stepsMeter').children];
  let stepsDist = 0;
  const pinned = () => innerWidth > 820 && !reduced();
  function layoutSteps() {
    if (!pinned()) { stepsSec.style.height = ''; stepsTrack.style.transform = ''; return; }
    const last = stepsTrack.lastElementChild;
    const pad = parseFloat(getComputedStyle(stepsTrack).paddingLeft);
    stepsDist = Math.max(0, last.offsetLeft + last.offsetWidth + pad - innerWidth);
    stepsSec.style.height = `${innerHeight + stepsDist}px`;
    onScroll();
  }
  function onScroll() {
    const dy = scrollY - lastY;
    lastY = scrollY;
    mqBoost = Math.min(900, mqBoost + Math.abs(dy) * 1.4);
    if (!pinned()) return;
    const top = stepsSec.offsetTop;
    const p = Math.max(0, Math.min(1, (scrollY - top) / (stepsDist || 1)));
    stepsTrack.style.transform = `translate3d(${(-p * stepsDist).toFixed(1)}px,0,0)`;
    const idx = Math.min(3, Math.round(p * 3));
    meter.forEach((m, i) => m.classList.toggle('on', i === idx));
  }
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; onScroll(); });
  }, { passive: true });
  addEventListener('resize', () => { fit(); layoutSteps(); });

  /* ------------------------------------------------------------------
     04 — voice dial
  ------------------------------------------------------------------ */
  const ZONES = ['Calm', 'Balanced', 'Urgent'];
  function renderVoice(animate) {
    const v = +$('dial').value;
    const z = v < 34 ? 0 : v < 67 ? 1 : 2;
    if (z === voiceZone) return;
    voiceZone = z;
    const [s, b, cta] = current.voice[z];
    $('dialTop').querySelectorAll('span').forEach((sp) => sp.classList.toggle('on', +sp.dataset.z === z));
    $('dial').setAttribute('aria-valuetext', ZONES[z]);
    if (animate) { scramble($('mailSubj'), s, 650); scramble($('mailBody'), b, 900); }
    else { $('mailSubj').textContent = s; $('mailBody').textContent = b; }
    $('mailCta').textContent = cta;
  }
  $('dial').addEventListener('input', () => renderVoice(true));

  /* ------------------------------------------------------------------
     05 — the in-app assistant. Used by the client's team inside the
     published app; it helps with the work and never edits the app.
  ------------------------------------------------------------------ */
  const thread = $('iaThread');
  const SUGS = [['shorter', 'Make the intro shorter'], ['who', 'Who is this for?'], ['subjects', 'Suggest subject lines']];
  let iaRun = 0;
  const teamOf = (br) => (br.key === 'house' ? 'your client’s team' : `${br.name} marketing`);
  const botName = (br) => `${br.key === 'house' ? 'Campaign' : br.name} assistant`;
  function iaMsg(html, me) {
    const br = current;
    const d = document.createElement('div');
    d.className = 'ia-m' + (me ? ' me' : '');
    const who = me
      ? `<span class="ia-k"><i class="ia-av">JL</i>Jordan · ${esc(teamOf(br))}</span>`
      : `<span class="ia-k"><i class="ia-av ai">✦</i>${esc(botName(br))}</span>`;
    d.innerHTML = who + `<div class="ia-b">${html}</div>`;
    thread.appendChild(d);
    thread.scrollTop = thread.scrollHeight;
    return d;
  }
  function answer(kind) {
    const c = current.chat;
    const who = current.key === 'house' ? 'your client' : current.name;
    if (kind === 'subjects') return `Here are three, in ${esc(who)}’s voice:<ul>${c.subjects.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    if (kind === 'shorter') return `A shorter intro you could use: <b>“${esc(c.shorter)}”</b>`;
    return esc(c[kind] || c.other);
  }
  function renderInapp() {
    iaRun++;
    const br = current;
    const house = br.key === 'house';
    const name = house ? 'your client' : br.name;
    const Name = house ? 'Your client' : br.name;
    $('iaLogo').innerHTML = logo(br, 'app');
    $('iaName').textContent = br.appName || br.name;
    $('iaUser').textContent = `Signed in: Jordan Lee · ${house ? 'client team' : br.name + ' marketing'}`;
    $('iaTitle').textContent = botName(br);
    const main = $('iaMain');
    main.innerHTML = appHTML(br, 2);
    main.replaceChildren(...main.querySelector('.am-body').children);
    $('aiWho').textContent = `What ${name}’s team gets inside the app`;
    $('tcThemT').textContent = `${Name}’s team, using the app`;
    $('iaCap').textContent = `Inside ${name}’s published app · their team’s assistant sits on the right`;
    thread.innerHTML = '';
    iaMsg(esc(br.chat.hello));
    iaMsg(`Suggest three subject lines for ${esc(br.content.audience)}`, true);
    iaMsg(answer('subjects'));
    $('iaSugs').innerHTML = SUGS.map(([k, t]) => `<button type="button" data-k="${k}">${t}</button>`).join('');
  }
  async function ask(text, kind) {
    const id = iaRun;
    iaMsg(esc(text), true);
    const dots = iaMsg('<i class="d"></i><i class="d"></i><i class="d"></i>');
    dots.classList.add('typing');
    await wait(reduced() ? 150 : 700);
    dots.remove();
    if (id !== iaRun) return;
    iaMsg(answer(kind));
  }
  $('iaSugs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) ask(b.textContent, b.dataset.k); });
  $('iaForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('iaInput').value.trim();
    if (!v) return;
    $('iaInput').value = '';
    const k = /subject/i.test(v) ? 'subjects' : /who|audience/i.test(v) ? 'who' : /short|tight|brief/i.test(v) ? 'shorter' : 'other';
    ask(v, k);
  });

  /* ------------------------------------------------------------------
     06 — share: QR + phone
  ------------------------------------------------------------------ */
  function appUrl(br) {
    let q;
    if (br.key === 'house') q = 'n=Your%20client&d=enterpriseaigroup.com&p=0B0B0B';
    else if (!br.live) q = `c=${br.key}`;
    else if (STM && br.stm && br.stm.head) q = STM.shareParams(br.stm);
    else q = new URLSearchParams({ n: br.name, d: br.domain, p: br.dot.replace('#', '') }).toString();
    return new URL('../../app.html?' + q, location.href).href;
  }
  let phoneReady = false;
  function paintShare() {
    const url = appUrl(current);
    $('shareName').textContent = current.appName || current.name;
    $('shareUrl').textContent = url.replace(/^https?:\/\//, '');
    $('shareOpen').href = url;
    if (window.QRCode) window.QRCode.toCanvas($('qr'), url, { width: 168, margin: 0, errorCorrectionLevel: 'L', color: { dark: '#111111', light: '#FFFFFF' } }, () => {});
    if (phoneReady) $('phoneFrame').src = url;
  }
  new IntersectionObserver((es, obs) => {
    if (es.some((e) => e.isIntersecting)) { phoneReady = true; $('phoneFrame').src = appUrl(current); obs.disconnect(); }
  }, { rootMargin: '600px 0px' }).observe($('phone'));
  $('shareCopy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(appUrl(current)); $('shareCopy').textContent = 'Copied'; } catch (e) { $('shareCopy').textContent = 'Press ⌘C'; }
    setTimeout(() => ($('shareCopy').textContent = 'Copy link'), 1600);
  });

  /* ------------------------------------------------------------------
     Reveals + the sentence typing in
  ------------------------------------------------------------------ */
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  new IntersectionObserver((es, obs) => {
    if (es[0].isIntersecting) { typeOut($('sentenceText'), $('sentenceText').textContent); obs.disconnect(); }
  }, { threshold: 0.6 }).observe($('sentence'));

  /* ------------------------------------------------------------------
     Cursor, in the brand colour
  ------------------------------------------------------------------ */
  const cursor = $('cursor');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced()) {
    let tx = -100, ty = -100, cx = -100, cy = -100, raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.28;
      cy += (ty - cy) * 0.28;
      cursor.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      root.classList.add('has-cursor');
      tx = e.clientX; ty = e.clientY;
      cursor.classList.toggle('big', !!e.target.closest('a, button, .chip, .mq-item, #dial'));
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    document.addEventListener('mouseleave', () => root.classList.remove('has-cursor'));
  }

  /* ------------------------------------------------------------------
     Boot
  ------------------------------------------------------------------ */
  if (document.fonts && document.fonts.load) {
    ['expanded 900 40px Archivo', 'condensed 800 40px Archivo', '400 40px Anton', '800 40px "Plus Jakarta Sans"', '700 40px "Space Grotesk"', '800 40px Fraunces', '500 20px "JetBrains Mono"', '600 20px Inter']
      .forEach((f) => document.fonts.load(f).catch(() => {}));
  }

  const start = params.get('wear');
  const startKey = start && keyFor(start);
  apply(startKey ? BRANDS[startKey] : BRANDS.house, { animate: false });
  if (start && !startKey) { touched = true; wear(start, null); }
  if (startKey) touched = true;

  ['pointerdown', 'keydown'].forEach((t) => addEventListener(t, () => { touched = true; }, { once: true, capture: true }));

  // Auto-play the signature moment once: type "Apple", wear it.
  async function autoplay() {
    if (touched || params.get('autoplay') === '0' || reduced()) return;
    if (document.fonts) await Promise.race([document.fonts.ready, wait(1500)]);
    await wait(1500);
    const input = $('who');
    for (const ch of 'Apple') {
      if (touched || scrollY > 200) { input.value = ''; return; }
      input.value += ch;
      await wait(130);
    }
    await wait(500);
    if (touched || scrollY > 200) { input.value = ''; return; }
    $('whoGo').classList.add('is-down');
    await wait(180);
    $('whoGo').classList.remove('is-down');
    wear('apple', $('whoGo'));
  }
  autoplay();
})();
