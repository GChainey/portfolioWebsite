/* Footer background: Paper's ShaderWarp, run live with the same parameters
   as the design (@paper-design/shaders, the vanilla build of the component
   Paper uses). If WebGL or the CDN isn't available, the Warp texture image
   set in CSS stays visible underneath. */
const el = document.getElementById('psFooterWarp');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

try {
  const {
    ShaderMount, warpFragmentShader, WarpPatterns, ShaderFitOptions,
    getShaderColorFromString, getShaderNoiseTexture,
  } = await import('https://cdn.jsdelivr.net/npm/@paper-design/shaders@0.0.81/+esm');

  const noise = getShaderNoiseTexture();
  await noise.decode(); // the mount needs the noise image fully loaded
  const colors = ['#0D3856', '#0E3755', '#0A180D'];
  const uniforms = {
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_proportion: 0.64,
    u_softness: 1.5,
    u_distortion: 0.2,
    u_swirl: 0.86,
    u_swirlIterations: 7,
    u_shapeScale: 0.6,
    u_shape: WarpPatterns.edge,
    u_noiseTexture: noise,
    u_scale: 1,
    u_rotation: 0,
    u_fit: ShaderFitOptions.none,
    u_offsetX: 0,
    u_offsetY: 0,
    u_originX: 0.5,
    u_originY: 0.5,
    u_worldWidth: 0,
    u_worldHeight: 0,
  };
  new ShaderMount(el, warpFragmentShader, uniforms, undefined, reduced ? 0 : 1.8, 3387639.820011629);
} catch (e) {
  // No WebGL2 / CDN: the texture fallback in CSS stays visible.
}
