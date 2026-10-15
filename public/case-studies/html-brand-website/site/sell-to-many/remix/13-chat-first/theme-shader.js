/* Remix 13/14 — the shader theme (?theme=shader). Does nothing in the light theme.

   Lifted from remix 14-dark-shader's intro.js: one fixed, full-viewport live
   Warp shader is the background of the whole page (DPR capped, a slight
   drift with scroll, paused by ShaderMount when the tab is hidden). The
   intro plays on that same canvas: the wordmark rises in out of a blur, a
   band of light runs through it, then it flies into the nav while the glass
   bar forms around it, and the page rises in. The shader eases from intro
   pace to a calmer page pace.

   When the intro has settled it fires `intro:settled`; chat-first.js starts
   its auto-play idle clock from there.
   ?intro=0 skips the intro. Reduced motion: no intro, a still shader frame,
   no drift. Click, a key, a wheel or a swipe skips the intro. */

const root = document.documentElement;
const $ = (id) => document.getElementById(id);

if (root.dataset.theme === 'shader') run();

function run() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const introPlaying = root.classList.contains('intro-pending');
  const INTRO_SPEED = 2.4;
  const PAGE_SPEED = 1.1;
  const MAX_DPR = 2;

  /* ---------- the page shader (same parameters as the Paper design) ---------- */
  let shaders = null;
  const loadShaders = () => (shaders ||= import('https://cdn.jsdelivr.net/npm/@paper-design/shaders@0.0.81/+esm'));
  const pixelBudget = (el) =>
    Math.max(1, Math.round(el.clientWidth * el.clientHeight * Math.min(devicePixelRatio || 1, MAX_DPR) ** 2));

  async function mountWarp(el, speed) {
    const S = await loadShaders();
    const noise = S.getShaderNoiseTexture();
    await noise.decode();
    const colors = ['#0D3856', '#0E3755', '#0A180D'];
    return new S.ShaderMount(el, S.warpFragmentShader, {
      u_colors: colors.map(S.getShaderColorFromString),
      u_colorsCount: colors.length,
      u_proportion: 0.64, u_softness: 1.5, u_distortion: 0.2, u_swirl: 0.86, u_swirlIterations: 7,
      u_shapeScale: 0.6, u_shape: S.WarpPatterns.edge, u_noiseTexture: noise,
      u_scale: 1, u_rotation: 0, u_fit: S.ShaderFitOptions.none,
      u_offsetX: 0, u_offsetY: 0, u_originX: 0.5, u_originY: 0.5, u_worldWidth: 0, u_worldHeight: 0,
    }, undefined, speed, 3387639.82, 1, pixelBudget(el));
    // (ShaderMount pauses itself while the tab is hidden.)
  }

  const bgEl = $('bgShader');
  let bg = null;
  const bgReady = mountWarp(bgEl, reduced ? 0 : introPlaying ? INTRO_SPEED : PAGE_SPEED)
    .then((m) => {
      bg = m;
      requestAnimationFrame(() => bgEl.classList.add('on'));
      let t = 0;
      addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => bg.setMaxPixelCount(pixelBudget(bgEl)), 150); });
      return m;
    })
    .catch(() => null); // no WebGL2 / no CDN: the texture image stays

  function rampSpeed(to, ms) {
    if (reduced) return;
    bgReady.then((m) => {
      if (!m) return;
      const from = m.speed;
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / ms);
        m.setSpeed(from + (to - from) * (1 - (1 - k) ** 3));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- scroll: a slight drift, and the nav's contrast over light windows ---------- */
  const navIn = document.querySelector('.nav-in');
  const lightWindows = () => [...document.querySelectorAll('.bx, .feat-app-wrap, .cms, .sg-device, .sg-qr, .ag-arrive')];
  let driftTarget = 0, drift = 0, rafId = 0;
  const progress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  };
  function checkNav() {
    const n = navIn.getBoundingClientRect();
    const over = lightWindows().some((p) => {
      const r = p.getBoundingClientRect();
      return r.top < n.bottom && r.bottom > n.top && r.left < n.right && r.right > n.left;
    });
    navIn.classList.toggle('is-over-light', over);
  }
  function tick() {
    rafId = 0;
    checkNav();
    if (reduced || !bg) return;
    drift += (driftTarget - drift) * 0.08;
    if (Math.abs(driftTarget - drift) < 0.0005) drift = driftTarget;
    bg.setUniformValues({ u_offsetY: drift * 0.16, u_rotation: drift * 6 });
    if (drift !== driftTarget) rafId = requestAnimationFrame(tick);
  }
  function onScroll() {
    driftTarget = progress();
    if (!rafId) rafId = requestAnimationFrame(tick);
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  bgReady.then(onScroll);
  onScroll();

  /* ---------- replay ---------- */
  $('psReplayIntro').addEventListener('click', () => {
    const u = new URL(location.href);
    u.searchParams.delete('intro');
    u.searchParams.set('theme', 'shader');
    u.hash = '';
    location.href = u.toString();
  });

  /* ---------- the intro ---------- */
  function settle() {
    root.classList.remove('intro-pending');
    window.__introSettled = true;
    window.dispatchEvent(new Event('intro:settled'));
    setTimeout(() => root.classList.add('intro-settled'), 1400);
  }
  function finish() {
    root.classList.remove('intro-pending', 'intro-brand');
    $('intro')?.remove();
  }

  if (!introPlaying) {
    finish();
    settle();
  } else {
    history.scrollRestoration = 'manual';
    scrollTo(0, 0);
    play().catch(() => { finish(); settle(); rampSpeed(PAGE_SPEED, 800); });
  }

  async function play() {
    window.__introStart = performance.now(); // for recordings
    const intro = $('intro');
    const mark = $('introMark');
    const glass = $('navGlass');
    const anims = [];
    let skipped = false;
    const A = (el, frames, opts) => {
      const a = el.animate(frames, { fill: 'both', ...opts });
      anims.push(a);
      if (skipped) a.finish();
      return a;
    };
    // Timers are empty animations, so they skip (and slow down for recordings) with everything else.
    const wait = (ms) => (skipped ? Promise.resolve() : A(intro, null, { duration: ms, fill: 'none' }).finished);
    const skip = () => { if (skipped) return; skipped = true; anims.forEach((a) => a.finish()); };
    const unbind = () => {
      removeEventListener('keydown', skip);
      removeEventListener('wheel', skip);
      removeEventListener('touchmove', skip);
    };
    intro.addEventListener('click', skip);
    addEventListener('keydown', skip, { once: true });
    addEventListener('wheel', skip, { once: true, passive: true });
    addEventListener('touchmove', skip, { once: true, passive: true });

    const svgText = await fetch('wordmark-light.svg').then((r) => r.text());
    mark.insertAdjacentHTML('afterbegin', svgText);
    const svg = mark.querySelector('svg');
    svg.removeAttribute('width');
    svg.removeAttribute('height');

    const VW = 1007.42, VH = 73.96;
    const bigW = Math.min(620, innerWidth * 0.78);
    const bigH = bigW * (VH / VW);
    const start = { left: (innerWidth - bigW) / 2, top: (innerHeight - bigH) / 2 };
    mark.style.width = `${bigW}px`;
    mark.style.transform = `translate(${start.left}px, ${start.top}px)`;

    const parts = [...svg.querySelectorAll('path, rect, circle')].map((el) => {
      const b = el.getBBox();
      return { el, cx: b.x + b.width / 2 };
    });
    parts.forEach((p) => { p.el.style.opacity = '0'; });

    // 1. The letters arrive left to right, rising out of a blur.
    A(mark, [{ filter: 'blur(8px)' }, { filter: 'blur(0px)' }], { duration: 650, delay: 150, easing: 'ease-out' });
    parts.forEach(({ el, cx }) => {
      A(el, [
        { opacity: 0, transform: 'translateY(22px) scale(.92)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' },
      ], { duration: 450, delay: 150 + (cx / VW) * 380, easing: 'cubic-bezier(.16,.84,.24,1)' });
    });

    // 2. A band of light through the letters.
    A(mark.querySelector('.intro-sweep'), [
      { opacity: 0, backgroundPosition: '130% 0' },
      { opacity: 1, backgroundPosition: '60% 0', offset: 0.3 },
      { opacity: 1, backgroundPosition: '-40% 0', offset: 0.9 },
      { opacity: 0, backgroundPosition: '-40% 0' },
    ], { duration: 560, delay: 950, easing: 'cubic-bezier(.4,0,.2,1)' });

    await wait(1550);

    // 3. The mark flies home to the nav; the shader settles to page pace.
    scrollTo(0, 0);
    rampSpeed(PAGE_SPEED, skipped ? 400 : 1800);
    const n = navIn.getBoundingClientRect();
    const brand = document.querySelector('.nav-brand .wm-light').getBoundingClientRect();
    const s = brand.width / bigW;
    const flight = A(mark, [
      { transform: `translate(${start.left}px, ${start.top}px) scale(1)` },
      { transform: `translate(${brand.left}px, ${brand.top}px) scale(${s})` },
    ], { duration: 720, easing: 'cubic-bezier(.7,0,.2,1)' });
    A($('introVignette'), [{ opacity: 1 }, { opacity: 0 }], { duration: 520, delay: 120, easing: 'ease-out' });
    A($('introSkip'), [{ opacity: 1 }, { opacity: 0 }], { duration: 200 });

    // 4. The glass bar forms around the landing mark: a pill that opens out to the full nav.
    const pad = { x: 16, y: 10 };
    const from = {
      t: Math.max(0, brand.top - n.top - pad.y),
      r: Math.max(0, n.right - brand.right - pad.x),
      b: Math.max(0, n.bottom - brand.bottom - pad.y),
      l: Math.max(0, brand.left - n.left - pad.x),
    };
    const glassAnim = A(glass, [
      { opacity: 0, clipPath: `inset(${from.t}px ${from.r}px ${from.b}px ${from.l}px round 999px)` },
      { opacity: 1, offset: 0.3 },
      { opacity: 1, clipPath: 'inset(-60px -60px -60px -60px round 76px)' },
    ], { duration: 820, delay: 420, easing: 'cubic-bezier(.22,.9,.24,1)' });

    // 5. The page rises in over the shader as the mark lands.
    await wait(skipped ? 0 : 560);
    settle();
    await flight.finished;
    root.classList.remove('intro-brand'); // the flying mark sits exactly on the nav's: swap them
    intro.remove();
    unbind();
    await glassAnim.finished;
    glassAnim.cancel();
  }
}
