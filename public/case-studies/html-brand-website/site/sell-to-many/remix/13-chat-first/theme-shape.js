/* Remix 13/17/18 — the shapeshifter theme (?theme=shape). Does nothing in
   the other themes. Adds remix 04's client-name marquee under the hero chat;
   everything else is CSS (theme-shape.css).

   ?ss=brand (remix 18) also mounts EAI's Paper Warp shaders behind the big
   slabs: dark behind the hero and the footer, light behind the builder,
   cyan behind the closing CTA. Same parameters as the Paper exports. Each
   one only runs while it's on screen; reduced motion gets a still frame.
   No WebGL2 or no CDN: the slabs keep their CSS fallback. */
(function () {
  'use strict';
  const root = document.documentElement;
  if (root.dataset.theme !== 'shape') return;
  const $ = (id) => document.getElementById(id);

  const chat = $('chat');
  if (chat) {
    const names = ['Nike', 'Qantas', 'Apple', 'CommBank', 'Canva', 'Atlassian', 'Telstra', 'Woolworths'];
    const run = names.map((n) => `<span>${n}</span>`).join('');
    const m = document.createElement('div');
    m.className = 'ss-marquee';
    m.setAttribute('aria-hidden', 'true');
    m.innerHTML = `<div class="ss-track">${run}${run}</div>`;
    chat.appendChild(m);
  }

  if (root.dataset.ss !== 'brand') return;

  /* ---------- EAI's Warp shaders ---------- */
  const PRESETS = {
    dark: { colors: ['#0D3856', '#0E3755', '#0A180D'], frame: 5877564.16 },
    cyan: { colors: ['#0D3856', '#8EDFF9', '#0E3756'], frame: 12709205.68 },
    light: { colors: ['#0D3856', '#D1D1D1', '#ECECEC'], frame: 12709762.96 },
  };
  const SPEED = 1.8;
  const MAX_DPR = 2;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function slab(host, preset) {
    if (!host) return null;
    const el = document.createElement('div');
    el.className = 'ss-sh';
    el.dataset.preset = preset;
    el.setAttribute('aria-hidden', 'true');
    host.prepend(el);
    return el;
  }
  const slabs = [
    slab(chat, 'dark'),
    slab($('build'), 'light'),
    slab($('cta'), 'cyan'),
    slab(document.querySelector('.ps-footer-inner'), 'dark'),
  ].filter(Boolean);

  // The builder's band starts partway down the window, so the heading stays on paper.
  const build = $('build');
  const band = build && build.querySelector(':scope > .ss-sh');
  function placeBand() {
    const frame = build.querySelector('.bx-frame');
    if (!band || !frame) return;
    band.style.top = `${frame.offsetTop + Math.round(frame.offsetHeight * 0.3)}px`;
  }
  placeBand();
  addEventListener('resize', placeBand);
  addEventListener('arrange:change', placeBand);
  addEventListener('load', placeBand);

  let lib = null;
  const load = () => (lib ||= import('https://cdn.jsdelivr.net/npm/@paper-design/shaders@0.0.81/+esm'));
  const budget = (el) => Math.max(1, Math.round(el.clientWidth * el.clientHeight * Math.min(devicePixelRatio || 1, MAX_DPR) ** 2));

  async function mount(el) {
    const S = await load();
    const noise = S.getShaderNoiseTexture();
    await noise.decode();
    const p = PRESETS[el.dataset.preset];
    return new S.ShaderMount(el, S.warpFragmentShader, {
      u_colors: p.colors.map(S.getShaderColorFromString),
      u_colorsCount: p.colors.length,
      u_proportion: 0.64, u_softness: 1.5, u_distortion: 0.2, u_swirl: 0.86, u_swirlIterations: 7,
      u_shapeScale: 0.6, u_shape: S.WarpPatterns.edge, u_noiseTexture: noise,
      u_scale: 1, u_rotation: 0, u_fit: S.ShaderFitOptions.none,
      u_offsetX: 0, u_offsetY: 0, u_originX: 0.5, u_originY: 0.5, u_worldWidth: 0, u_worldHeight: 0,
    }, undefined, 0, p.frame, 1, budget(el));
  }

  // Mount each slab the first time it nears the screen; run it only while visible.
  const mounts = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const el = e.target;
      let m = mounts.get(el);
      if (!m) { m = mount(el).catch(() => null); mounts.set(el, m); }
      m.then((sm) => { if (sm) sm.setSpeed(e.isIntersecting && !reduced ? SPEED : 0); });
    });
  }, { rootMargin: '200px 0px' });
  slabs.forEach((el) => io.observe(el));

  let t = 0;
  addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => mounts.forEach((m, el) => m.then((sm) => sm && sm.setMaxPixelCount(budget(el)))), 150);
  });
})();
