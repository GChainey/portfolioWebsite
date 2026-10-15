/* 07 · Split brain — brand data, brand voices and the live brand lookup.
   Nike, Apple and CommBank are hand-checked. Qantas, Canva and Atlassian are
   hand-set for the "sell to many" strips. Anything else a visitor types is
   looked up live (Clearbit -> Microlink, icon.horse fallback, hash fallback),
   the same approach as sell-to-many/sell.js. */
(function () {
  'use strict';

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  const SWOOSH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 7.8 6.442 15.276c-1.456.616-2.679.925-3.668.925-1.11 0-1.922-.392-2.437-1.177-.317-.503-.4-1.152-.25-1.947.152-.795.532-1.643 1.14-2.543.505-.75 1.371-1.708 2.6-2.874-.365.615-.766 1.395-1.084 2.155-.55 1.32-.68 2.4-.394 3.24.13.375.365.65.68.83.36.2.83.29 1.41.29.44 0 .93-.06 1.47-.18L24 7.8Z" fill="currentColor"/></svg>';
  const APPLE = '<svg viewBox="150 100 500 560" aria-hidden="true"><path fill="currentColor" d="M584.8426,276.8632c-2.3411,1.4432-53.8358,31.4239-53.251,93.7952c0.6472,74.6027,65.3989,99.4457,66.1427,99.7276c-0.58,1.7759-10.3524,35.3838-34.1321,70.0925c-20.5507,30.0693-41.8387,59.968-75.4384,60.5922c-33.0098,0.6046-43.6489-19.5858-81.3589-19.5858c-37.7331,0-49.5436,18.9615-80.7596,20.1904c-32.4307,1.227-57.1214-32.4709-77.8236-62.3746c-42.3212-61.1983-74.679-172.9508-31.23-248.3679c21.5705-37.4546,60.1253-61.1835,101.9581-61.7964c31.8589-0.6021,61.9044,21.4174,81.3918,21.4174c19.209,0,53.636-25.6686,94.2163-22.6665C510.4626,229.066,555.6122,233.8129,584.8426,276.8632z M469.5186,187.488c17.2347-20.8293,28.8305-49.8377,25.6375-78.6904c-24.8053,0.9837-54.8058,16.5229-72.5975,37.339c-15.9324,18.4398-29.925,47.9732-26.1259,76.237C424.0806,224.5099,452.2985,208.3302,469.5186,187.488z"/></svg>';
  const CBA = '<img src="../../logos/commbank.svg" alt="" />';
  const mono = (ch) => `<span class="mono">${esc(ch)}</span>`;

  /* b = action colour, head/headOn = app bar, world = the warm room the end
     user sits in, display = the headline face in their world. */
  const BRANDS = {
    nike: {
      key: 'nike', name: 'Nike', domain: 'nike.com', logo: SWOOSH,
      b: '#FA5400', on: '#FFFFFF', head: '#111111', headOn: '#FFFFFF', logoOn: '#FA5400',
      surface: '#FFF3EC', world: '#F2E6D8', ink: '#16110D',
      font: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      display: 'Anton, "Helvetica Neue", Impact, sans-serif', caps: true,
      tone: 'Direct, urgent, athlete-first', warmTone: 'Warm, encouraging, athlete-first',
      person: { name: 'Maya', team: 'Nike marketing', initials: 'MO' },
      goal: 'Launch the Pegasus 41…', audience: 'Nike Run Club members', date: '3 October',
      files: ['nike-brand-guide.pdf', 'tone-of-voice.docx', 'pegasus-41-shots.zip'],
      cta: 'Shop now',
      voice: {
        base: {
          subjects: ['Pegasus 41 is here. Go.', 'Your next PB starts now', 'Run Club members get first access'],
          body: 'The Pegasus 41 is here — lighter, faster, built for your next PB. Run Club members get first access this week, before anyone else.',
          short: 'Pegasus 41. Lighter. Faster. Yours first.',
        },
        warm: {
          subjects: ['Your next run just got lighter', 'Made for every mile you love', 'Run Club, this one’s for you'],
          body: 'We made the Pegasus 41 for the runs you love — lighter underfoot, softer on the long ones. Run Club, you get it first, because you showed up all year.',
          short: 'Lighter, softer, made for the runs you love. Yours first.',
        },
      },
      qa: [['Suggest a subject line', 'Pegasus 41 is here. Go.'], ['Make the CTA punchier', '“Shop now” → “Run it first”'], ['Check the tone', 'Direct and urgent. On brand.']],
    },
    apple: {
      key: 'apple', name: 'Apple', domain: 'apple.com', logo: APPLE,
      b: '#0071E3', on: '#FFFFFF', head: '#1D1D1F', headOn: '#F5F5F7', logoOn: '#F5F5F7',
      surface: '#EEF5FD', world: '#ECEAE6', ink: '#1D1D1F',
      font: '-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif',
      display: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif', caps: false, tight: true,
      tone: 'Simple, confident, understated', warmTone: 'Warm, simple, quietly confident',
      person: { name: 'Sam', team: 'Apple marketing', initials: 'SR' },
      goal: 'Introduce the new iPhone…', audience: 'Apple Store customers', date: '9 October',
      files: ['apple-brand-guidelines.pdf', 'voice-and-tone.docx', 'iphone-product-shots.zip'],
      cta: 'Learn more',
      voice: {
        base: {
          subjects: ['Say hello to the new iPhone.', 'Pro. Beyond.', 'Available now at the Apple Store'],
          body: 'Introducing the new iPhone. Our most advanced camera yet, in a design you’ll love to hold. Available now at the Apple Store.',
          short: 'The new iPhone. Our best camera yet.',
        },
        warm: {
          subjects: ['The iPhone you’ve been waiting for', 'Made for the moments you love', 'Come say hello in store'],
          body: 'Meet the new iPhone — made for the moments you love, with our best camera yet. Come and hold one at your Apple Store.',
          short: 'Made for the moments you love. Come say hello.',
        },
      },
      qa: [['Suggest a subject line', 'Say hello to the new iPhone.'], ['Shorten the intro', 'The new iPhone. Our best camera yet.'], ['Check the tone', 'Simple and confident. On brand.']],
    },
    commbank: {
      key: 'commbank', name: 'CommBank', domain: 'commbank.com.au', logo: CBA, logoImg: true,
      b: '#FFCC00', on: '#000000', head: '#000000', headOn: '#FFFFFF', logoOn: '#FFCC00',
      surface: '#FFF8DB', world: '#F3EDDB', ink: '#111111',
      font: 'system-ui, -apple-system, sans-serif',
      display: 'Archivo, system-ui, sans-serif', caps: false, heavy: true,
      tone: 'Clear, helpful, reassuring', warmTone: 'Warm, clear, genuinely helpful',
      person: { name: 'Priya', team: 'CommBank marketing', initials: 'PS' },
      goal: 'Launch Yello rewards for everyday accounts…', audience: 'CommBank app customers', date: '16 October',
      files: ['commbank-brand-guide.pdf', 'yello-offers.xlsx', 'app-screens.zip'],
      cta: 'See my offers',
      voice: {
        base: {
          subjects: ['Your Yello rewards are here', 'More value from everyday banking', 'Unlock offers in the CommBank app'],
          body: 'Earn Yello rewards on your everyday account. See your offers in the CommBank app — there’s nothing to sign up for.',
          short: 'Yello rewards are here. See them in the app.',
        },
        warm: {
          subjects: ['A little thank you, every day', 'Rewards that come to you', 'Here’s something for being with us'],
          body: 'A thank you for banking with us: Yello rewards on your everyday account. They’re waiting for you in the CommBank app.',
          short: 'A little thank you — your rewards are in the app.',
        },
      },
      qa: [['Suggest a subject line', 'Your Yello rewards are here'], ['Is this clear enough?', 'Yes — one action, plain words.'], ['Shorten the intro', 'Yello rewards are here. See them in the app.']],
    },
    qantas: {
      key: 'qantas', name: 'Qantas', domain: 'qantas.com', logo: mono('Q'),
      b: '#E40000', on: '#FFFFFF', head: '#E40000', headOn: '#FFFFFF', logoOn: '#FFFFFF',
      surface: '#FDEDED', world: '#F2E7DE', ink: '#1A1A1A',
      font: 'system-ui, -apple-system, sans-serif', display: 'Archivo, system-ui, sans-serif',
      tone: 'Warm, proud, going places', warmTone: 'Warm, proud, going places',
      person: { name: 'Tom', team: 'Qantas marketing', initials: 'TB' },
      goal: 'Launch spring getaways…', audience: 'Frequent Flyers', date: '21 October',
      cta: 'Find a flight',
      voice: { base: { subjects: ['Your next escape starts here'], body: '', short: '' } },
      qa: [['Suggest a subject line', 'Your next escape starts here'], ['Add a points angle', 'Fly further on points this spring'], ['Shorter?', 'Spring’s calling. Go.']],
    },
    canva: {
      key: 'canva', name: 'Canva', domain: 'canva.com', logo: mono('C'),
      b: '#7D2AE8', on: '#FFFFFF', head: '#7D2AE8', headOn: '#FFFFFF', logoOn: '#FFFFFF',
      surface: '#F3ECFD', world: '#EEE9F0', ink: '#1B1530',
      font: 'system-ui, -apple-system, sans-serif', display: 'Archivo, system-ui, sans-serif',
      tone: 'Playful, bright, encouraging', warmTone: 'Playful, bright, encouraging',
      person: { name: 'Lena', team: 'Canva marketing', initials: 'LK' },
      goal: 'Launch the new templates…', audience: 'Canva Pro teams', date: '24 October',
      cta: 'Start designing',
      voice: { base: { subjects: ['Design something great today'], body: '', short: '' } },
      qa: [['Suggest a subject line', 'Design something great today'], ['Make it more fun', 'Your next big idea, now in one click ✦'], ['CTA?', 'Start designing']],
    },
    atlassian: {
      key: 'atlassian', name: 'Atlassian', domain: 'atlassian.com', logo: mono('A'),
      b: '#0052CC', on: '#FFFFFF', head: '#0052CC', headOn: '#FFFFFF', logoOn: '#FFFFFF',
      surface: '#EAF1FC', world: '#E9EAEE', ink: '#172B4D',
      font: 'system-ui, -apple-system, sans-serif', display: 'Archivo, system-ui, sans-serif',
      tone: 'Open, practical, team-first', warmTone: 'Open, practical, team-first',
      person: { name: 'Dev', team: 'Atlassian marketing', initials: 'DN' },
      goal: 'Announce the new Jira…', audience: 'Team admins', date: '30 October',
      cta: 'See what’s new',
      voice: { base: { subjects: ['Your team, working as one'], body: '', short: '' } },
      qa: [['Suggest a subject line', 'Your team, working as one'], ['Make it clearer', 'Plan, track and ship — together.'], ['Check the tone', 'Practical and open. On brand.']],
    },
  };
  const ALIASES = {
    'commonwealth bank': 'commbank', 'commonwealth bank of australia': 'commbank', cba: 'commbank',
    'commbank.com.au': 'commbank', 'apple.com': 'apple', 'nike.com': 'nike', 'qantas.com': 'qantas',
    'canva.com': 'canva', 'atlassian.com': 'atlassian', 'jira': 'atlassian',
  };
  function curated(raw) {
    const key = raw.trim().toLowerCase().replace(/[.!?]+$/, '').replace(/\s+/g, ' ');
    return BRANDS[key] || BRANDS[ALIASES[key]] || null;
  }

  /* ---- Colour helpers ---- */
  function rgbOf(hex) {
    const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function hslOf(hex) {
    const [r, g, b] = rgbOf(hex).map((v) => v / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
    const d = max - min;
    return { s: d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1)), l };
  }
  function lum(hex) {
    const ch = rgbOf(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }
  const inkFor = (hex) => (lum(hex) > 0.45 ? '#111111' : '#FFFFFF');
  const toHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
  const mix = (hex, amt) => toHex(rgbOf(hex).map((v) => Math.round(255 - (255 - v) * amt)));
  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return toHex([f(0), f(8), f(4)].map((v) => Math.round(v * 255)));
  }
  function pickPrimary(logoPal, imagePal) {
    const ok = (hex) => { const { s, l } = hslOf(hex); return s > 0.35 && l > 0.18 && l < 0.72; };
    const bySat = (a, b) => hslOf(b).s - hslOf(a).s;
    const fromLogo = logoPal.filter(ok).sort(bySat)[0];
    if (fromLogo) return fromLogo;
    const dark = logoPal.filter((h) => hslOf(h).l < 0.3).sort((a, b) => hslOf(a).l - hslOf(b).l)[0];
    if (dark) return dark;
    return imagePal.filter(ok).sort(bySat)[0] || '#1D1D1F';
  }

  /* A full brand object for any client, from a name + primary colour. */
  function generic(name, domain, primary, logoUrl, how) {
    primary = primary.toUpperCase();
    const n = name;
    const logo = logoUrl ? `<img src="${esc(logoUrl)}" alt="" referrerpolicy="no-referrer" data-fallback="${esc(n[0].toUpperCase())}" />` : mono(n[0].toUpperCase());
    return {
      key: 'live:' + n.toLowerCase(), name: n, domain, live: how === 'live', guess: how === 'guess',
      logo, logoImg: !!logoUrl, logoChip: !!logoUrl,
      b: primary, on: inkFor(primary), head: primary, headOn: inkFor(primary), logoOn: inkFor(primary),
      surface: mix(primary, 0.08), world: '#F1EAE0', ink: '#16110D',
      font: 'system-ui, -apple-system, sans-serif', display: 'Archivo, system-ui, sans-serif',
      tone: how === 'guess' ? 'Best guess — couldn’t reach their site' : 'Read live from their site',
      warmTone: 'Warmer, still in their voice',
      person: { name: 'Alex', team: `${n} marketing`, initials: 'AK' },
      goal: `Announce what’s new at ${n}…`, audience: `${n} customers`, date: '28 October',
      files: [`${n.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-brand-guide.pdf`, 'tone-of-voice.docx', 'product-shots.zip'],
      cta: 'Find out more',
      voice: {
        base: {
          subjects: [`What’s new at ${n}`, `${n}: made for you`, `Don’t miss this from ${n}`],
          body: `Here’s what’s new at ${n} this month — picked for ${n} customers, in ${n}’s own words.`,
          short: `New at ${n}, picked for you.`,
        },
        warm: {
          subjects: [`A little something from ${n}`, 'We made this with you in mind', `From all of us at ${n}`],
          body: `We’ve been working on something we think you’ll love. Here’s what’s new at ${n} this month — made with you in mind.`,
          short: `Something new from ${n}, made for you.`,
        },
      },
      qa: [['Suggest a subject line', `What’s new at ${n}`], ['Shorter?', `New at ${n}, picked for you.`]],
    };
  }

  /* ---- Live lookup ---- */
  function withTimeout(ms) { const c = new AbortController(); setTimeout(() => c.abort(), ms); return c.signal; }
  async function findDomain(name) {
    if (/\.[a-z]{2,}$/i.test(name)) return { name: name.replace(/^https?:\/\//, '').replace(/\..*$/, ''), domain: name.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '') };
    try {
      const r = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(name)}`, { signal: withTimeout(4500) });
      const list = await r.json();
      if (list[0] && list[0].domain) return { name: list[0].name, domain: list[0].domain };
    } catch (e) { /* fall through */ }
    return { name, domain: name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com' };
  }
  const shortName = (n) => n.replace(/\s+(of|pty|ltd|inc|limited|group|corporation|corp)\b.*$/i, '').trim();
  async function viaMicrolink(found) {
    const url = `https://api.microlink.io/?url=${encodeURIComponent('https://' + found.domain)}&palette=true&prerender=false`;
    const json = await fetch(url, { signal: withTimeout(12000) }).then((r) => r.json());
    if (json.status !== 'success') throw new Error('lookup failed');
    const d = json.data;
    const logoPal = (d.logo && d.logo.palette) || [];
    const imagePal = (d.image && d.image.palette) || [];
    return generic(shortName(found.name), found.domain, pickPrimary(logoPal, imagePal), d.logo && d.logo.url, 'live');
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
          res(generic(shortName(found.name), found.domain, pickPrimary(pal, []), src, 'live'));
        } catch (e) { rej(e); }
      };
      img.src = src;
    });
  }
  function hashBrand(raw) {
    const name = raw.trim().replace(/\s+/g, ' ').replace(/^./, (c) => c.toUpperCase());
    let h = 0;
    for (const ch of name.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return generic(name, name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com', hslToHex(h % 360, 62, 44), null, 'guess');
  }
  /* Resolve any client name. onStep(text) narrates what's happening. */
  async function resolve(raw, onStep) {
    const c = curated(raw);
    if (c) return c;
    let found;
    try { found = await findDomain(raw); } catch (e) { found = null; }
    if (!found) return hashBrand(raw);
    onStep && onStep(`Found ${found.domain}`);
    const full = viaMicrolink(found).catch(() => null);
    const icon = viaIcon(found).catch(() => null);
    const later = new Promise((r) => setTimeout(r, 5000)).then(() => icon);
    let b = await Promise.race([full, later]);
    if (!b) b = (await Promise.race([full, new Promise((r) => setTimeout(r, 3000))])) || (await icon);
    return b || hashBrand(raw);
  }

  function voiceOf(br, tone) {
    return (tone === 'warm' && br.voice.warm) || br.voice.base;
  }

  window.SPLIT = { BRANDS, curated, resolve, hashBrand, voiceOf, esc, inkFor, mix };
})();
