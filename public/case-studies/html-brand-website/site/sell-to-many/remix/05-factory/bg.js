/* Generative background: a slow violet nebula with an acid-lime ribbon,
   tinted towards the last brand stamped. Rendered with raw WebGL at a
   fraction of screen resolution (it's soft, so nobody sees the pixels). */

const FRAG = `precision mediump float;
uniform vec2 uRes; uniform float uTime; uniform vec3 uTint; uniform float uTintAmt; uniform vec2 uMouse; uniform float uProg;
float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a*n(p); p = p*2.03 + 7.1; a *= 0.5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float t = uTime * 0.04;
  vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t + 3.7));
  float f = fbm(p * 1.8 + q * 1.6 + uMouse * 0.15 + uProg * 0.3);
  vec3 deep = vec3(0.035, 0.012, 0.085);
  vec3 vio = vec3(0.22, 0.08, 0.48);
  vec3 col = mix(deep, vio, smoothstep(0.35, 0.95, f) * 0.85);
  // lime ribbon
  float y = p.y + 0.22 * sin(p.x * 1.7 + t * 6.0 + q.x * 2.5) - 0.18 + uProg * 0.02;
  float rib = exp(-y * y * 38.0) * smoothstep(0.2, 0.9, f + 0.25);
  col += vec3(0.62, 0.85, 0.12) * rib * 0.32;
  col = mix(col, uTint * (0.25 + f * 0.6), uTintAmt * smoothstep(0.3, 1.0, f) * 0.55);
  // vignette + grain
  col *= 1.0 - dot(p * vec2(0.6, 0.9), p * vec2(0.6, 0.9)) * 0.9;
  col += (h(gl_FragCoord.xy + uTime) - 0.5) * 0.03;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}`;
const VERT = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }';

export function startBg(canvas, S) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
  gl.useProgram(pr);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {};
  ['uRes', 'uTime', 'uTint', 'uTintAmt', 'uMouse', 'uProg'].forEach((k) => { U[k] = gl.getUniformLocation(pr, k); });
  const SCALE = 0.4;
  function resize() {
    canvas.width = Math.max(2, Math.round(window.innerWidth * SCALE));
    canvas.height = Math.max(2, Math.round(window.innerHeight * SCALE));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);
  const tint = [0.83, 1, 0.23];
  const target = [0.83, 1, 0.23];
  let amt = 0, mx = 0, my = 0;
  window.addEventListener('pointermove', (e) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; });
  const t0 = performance.now();
  let sx = 0, sy = 0;
  function frame() {
    const now = (performance.now() - t0) / 1000;
    if (S.tint) {
      const c = parseInt(S.tint.slice(1), 16);
      target[0] = ((c >> 16) & 255) / 255; target[1] = ((c >> 8) & 255) / 255; target[2] = (c & 255) / 255;
    }
    for (let i = 0; i < 3; i++) tint[i] += (target[i] - tint[i]) * 0.04;
    amt += ((S.tint ? 1 : 0) - amt) * 0.03;
    sx += (mx - sx) * 0.05; sy += (my - sy) * 0.05;
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, S.reduced ? 0 : now);
    gl.uniform3f(U.uTint, tint[0], tint[1], tint[2]);
    gl.uniform1f(U.uTintAmt, amt);
    gl.uniform2f(U.uMouse, sx, -sy);
    gl.uniform1f(U.uProg, S.t || 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!S.reduced) requestAnimationFrame(frame);
  }
  frame();
  return true;
}
