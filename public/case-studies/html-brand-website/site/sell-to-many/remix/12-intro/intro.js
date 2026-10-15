/* Remix 12 — the Paper shell, with an intro in the manner of Dia's.
   Concept: the site opens as one full-screen sheet of the live Warp shader.
   The Enterprise AI wordmark rises in letter by letter out of a blur, a band
   of light runs through it — then the whole sheet
   folds down into the nav bar (the shader becomes the nav's background) while
   the wordmark flies into its place at the nav's left. Then the hero reveals:
   "Build once. Sell to many.", word by word, and the live builder demo rises
   into the Warp frame below it.

   ?intro=0 skips it. Reduced motion skips it. Click, a key or scroll skips it. */

const root = document.documentElement;
const $ = (id) => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- the Warp shader (same parameters as the Paper design) ---------- */
let shaders = null;
async function loadShaders() {
  if (!shaders) shaders = import('https://cdn.jsdelivr.net/npm/@paper-design/shaders@0.0.81/+esm');
  return shaders;
}
async function mountWarp(el, { speed = 1.8, frame = 3387639.82 } = {}) {
  const S = await loadShaders();
  const noise = S.getShaderNoiseTexture();
  await noise.decode();
  const colors = ['#0D3856', '#0E3755', '#0A180D'];
  return new S.ShaderMount(el, S.warpFragmentShader, {
    u_colors: colors.map(S.getShaderColorFromString),
    u_colorsCount: colors.length,
    u_proportion: 0.64,
    u_softness: 1.5,
    u_distortion: 0.2,
    u_swirl: 0.86,
    u_swirlIterations: 7,
    u_shapeScale: 0.6,
    u_shape: S.WarpPatterns.edge,
    u_noiseTexture: noise,
    u_scale: 1,
    u_rotation: 0,
    u_fit: S.ShaderFitOptions.none,
    u_offsetX: 0,
    u_offsetY: 0,
    u_originX: 0.5,
    u_originY: 0.5,
    u_worldWidth: 0,
    u_worldHeight: 0,
  }, undefined, reduced ? 0 : speed, frame);
}

// The real nav gets the live shader too, so the hand-off from the intro is seamless.
mountWarp($('psNavShader')).catch(() => { /* the texture image stays */ });

/* ---------- replay ---------- */
$('psReplayIntro').addEventListener('click', () => {
  const u = new URL(location.href);
  u.searchParams.delete('intro');
  u.hash = '';
  location.href = u.toString();
});

/* ---------- the intro ---------- */
function settle() {
  root.classList.remove('intro-pending');
  setTimeout(() => root.classList.add("intro-settled"), 1100);
}

if (!root.classList.contains('intro-pending')) {
  settle();
} else {
  history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  play().catch(() => { $('intro')?.remove(); settle(); });
}

async function play() {
  window.__introStart = performance.now(); // for recordings
  const intro = $('intro');
  const mark = $('introMark');
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

  // Skip: jump every running animation to its end.
  const skip = () => {
    if (skipped) return;
    skipped = true;
    anims.forEach((a) => a.finish());
  };
  intro.addEventListener('click', skip);
  addEventListener('keydown', skip, { once: true });
  addEventListener('wheel', skip, { once: true, passive: true });
  addEventListener('touchmove', skip, { once: true, passive: true });

  // Shader fades in over the texture while the wordmark loads.
  mountWarp($('introShader'), { speed: 2.4 }).then(() => $('introShader').classList.add('on')).catch(() => {});

  const svgText = await fetch('wordmark-light.svg').then((r) => r.text());
  mark.insertAdjacentHTML('afterbegin', svgText);
  const svg = mark.querySelector('svg');
  svg.removeAttribute('width');
  svg.removeAttribute('height');

  // Place the big mark in the centre of the screen.
  const VW = 1007.42, VH = 73.96;
  const bigW = Math.min(620, innerWidth * 0.78);
  const bigH = bigW * (VH / VW);
  const start = { left: (innerWidth - bigW) / 2, top: (innerHeight - bigH) / 2, width: bigW };
  mark.style.width = `${bigW}px`;
  mark.style.transform = `translate(${start.left}px, ${start.top}px)`;

  // Every shape in the mark (letters and the cyan dot), in reading order.
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
  const sweep = mark.querySelector('.intro-sweep');
  A(sweep, [
    { opacity: 0, backgroundPosition: '130% 0' },
    { opacity: 1, backgroundPosition: '60% 0', offset: 0.3 },
    { opacity: 1, backgroundPosition: '-40% 0', offset: 0.9 },
    { opacity: 0, backgroundPosition: '-40% 0' },
  ], { duration: 560, delay: 950, easing: 'cubic-bezier(.4,0,.2,1)' });

  await wait(1550);

  // 3. Fold into the nav: the sheet clips down to the nav bar, the mark flies home.
  scrollTo(0, 0);
  const nav = document.querySelector('.ps-nav').getBoundingClientRect();
  const brand = document.querySelector('.ps-nav-brand img').getBoundingClientRect();
  const s = brand.width / bigW;
  const fold = { duration: 650, easing: 'cubic-bezier(.76,0,.18,1)' };
  A(intro, [
    { clipPath: 'inset(0px 0px 0px 0px round 0px)' },
    { clipPath: `inset(${nav.top}px ${innerWidth - nav.right}px ${innerHeight - nav.bottom}px ${nav.left}px round 16px)` },
  ], fold);
  A(mark, [
    { transform: `translate(${start.left}px, ${start.top}px) scale(1)` },
    { transform: `translate(${brand.left}px, ${brand.top}px) scale(${s})` },
  ], fold);
  A(intro.querySelector('.intro-vignette'), [{ opacity: 1 }, { opacity: 0 }], { duration: 400, delay: 150 });
  A($('introSkip'), [{ opacity: 1 }, { opacity: 0 }], { duration: 200 });

  // 4. Reveal the shell as the fold lands, then hand over to the real nav.
  await wait(skipped ? 0 : 480);
  settle();
  await wait(120);
  const out = A(intro, [{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: 'ease-out' });
  await out.finished;
  intro.remove();
  removeEventListener('keydown', skip);
  removeEventListener('wheel', skip);
  removeEventListener('touchmove', skip);
}
