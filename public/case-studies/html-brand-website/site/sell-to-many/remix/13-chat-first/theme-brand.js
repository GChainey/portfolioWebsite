/* Remix 24 — the brand book v4 theme (?theme=brand). Does nothing in the other
   themes. Puts the cyan underline (.hl) on each headline's key phrase: the
   last sentence when there are two ("Build once. Sell to many."), otherwise
   the last three words. One phrase per headline (socials/BRAND.md).
   Runs again whenever the arrangement rewrites a headline's copy.
   Also mounts the Warp shader behind the footer (below). */
(function () {
  'use strict';
  if (document.documentElement.dataset.theme !== 'brand') return;

  const SEL = '.sg-h, .ps-cta h2';
  const esc = (v) => v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function underline(el) {
    if (el.querySelector('.hl') || el.children.length) return; // already marked, or built from spans
    const text = el.textContent.trim();
    if (!text) return;
    const sentences = text.split(/(?<=[.?!])\s+/);
    let head;
    let tail;
    if (sentences.length > 1) {
      tail = sentences.pop();
      head = sentences.join(' ') + ' ';
    } else {
      const words = text.split(/\s+/);
      const n = words.length > 4 ? 3 : Math.max(1, words.length - 2);
      tail = words.slice(-n).join(' ');
      head = words.slice(0, -n).join(' ') + ' ';
    }
    el.innerHTML = `${esc(head)}<span class="hl">${esc(tail)}</span>`;
  }
  const run = () => document.querySelectorAll(SEL).forEach(underline);
  run();
  addEventListener('arrange:change', run);

  /* The one expressive move: EAI's dark Paper Warp shader behind the footer,
     and nowhere else (same preset as remix 18). Runs only while the footer is
     on screen; reduced motion gets a still frame; no WebGL2 or no CDN keeps
     the still image (warp-bg.jpg). */
  const foot = document.querySelector('.ps-footer-inner');
  if (!foot) return;
  const sh = document.createElement('div');
  sh.className = 'br-sh';
  sh.setAttribute('aria-hidden', 'true');
  foot.prepend(sh);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const budget = () => Math.max(1, Math.round(sh.clientWidth * sh.clientHeight * Math.min(devicePixelRatio || 1, 2) ** 2));
  let mounted = null;
  async function mount() {
    const S = await import('https://cdn.jsdelivr.net/npm/@paper-design/shaders@0.0.81/+esm');
    const noise = S.getShaderNoiseTexture();
    await noise.decode();
    const colors = ['#0D3856', '#0E3755', '#0A180D'];
    return new S.ShaderMount(sh, S.warpFragmentShader, {
      u_colors: colors.map(S.getShaderColorFromString),
      u_colorsCount: colors.length,
      u_proportion: 0.64, u_softness: 1.5, u_distortion: 0.2, u_swirl: 0.86, u_swirlIterations: 7,
      u_shapeScale: 0.6, u_shape: S.WarpPatterns.edge, u_noiseTexture: noise,
      u_scale: 1, u_rotation: 0, u_fit: S.ShaderFitOptions.none,
      u_offsetX: 0, u_offsetY: 0, u_originX: 0.5, u_originY: 0.5, u_worldWidth: 0, u_worldHeight: 0,
    }, undefined, 0, 5877564.16, 1, budget());
  }
  new IntersectionObserver((es) => {
    const vis = es.some((e) => e.isIntersecting);
    if (!mounted) mounted = mount().catch(() => null);
    mounted.then((m) => { if (m) m.setSpeed(vis && !reduced ? 1.8 : 0); });
  }, { rootMargin: '200px 0px' }).observe(sh);
})();
