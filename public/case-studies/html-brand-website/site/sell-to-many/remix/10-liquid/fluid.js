/* fluid.js — a small stable-fluids solver in raw WebGL2, written for this page.
   Jos Stam's "Stable Fluids" (semi-Lagrangian advection, Jacobi pressure solve,
   vorticity confinement), in the spirit of Pavel Dobryakov's WebGL fluid demo.

   One Fluid = one canvas. The page uses a few of them:
     mode 'mercury' — the page itself (EAI's colour, rendered as liquid metal)
     mode 'ink'     — a vessel: the client's brand colour as glossy paint
     mode 'cells'   — many vessels (metaball-masked), for the sell-to-many beat

   Coordinates in the public API are CSS pixels relative to the canvas, and
   velocities are CSS px per second. */

const VS = `#version 300 es
in vec2 aPos;
uniform vec2 texel;
out vec2 vUv; out vec2 vL; out vec2 vR; out vec2 vT; out vec2 vB;
void main(){
  vUv = aPos * .5 + .5;
  vL = vUv - vec2(texel.x, 0.); vR = vUv + vec2(texel.x, 0.);
  vT = vUv + vec2(0., texel.y); vB = vUv - vec2(0., texel.y);
  gl_Position = vec4(aPos, 0., 1.);
}`;

const H = `#version 300 es
precision highp float; precision highp sampler2D;
in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB;
out vec4 o;
`;

const SMIN = `
float smin(float a, float b, float k){ float h = max(k - abs(a - b), 0.) / k; return min(a, b) - h * h * k * .25; }
`;

const FS = {
  clear: H + `uniform sampler2D uT; uniform float value;
    void main(){ o = value * texture(uT, vUv); }`,

  splat: H + `uniform sampler2D uT; uniform float aspect; uniform vec3 color; uniform vec2 point; uniform float radius;
    void main(){
      vec2 p = vUv - point; p.x *= aspect;
      vec3 s = exp(-dot(p, p) / radius) * color;
      o = vec4(texture(uT, vUv).xyz + s, 1.);
    }`,

  // Ink shaped like a logo. For velocity: color.x = outward burst, color.y = swirl.
  logo: H + `uniform sampler2D uT; uniform sampler2D uLogo; uniform vec4 rect; uniform vec3 color;
    uniform float isVel; uniform vec2 center; uniform float aspect;
    void main(){
      vec2 l = (vUv - rect.xy) / (rect.zw - rect.xy);
      float a = 0.;
      if (l.x > 0. && l.x < 1. && l.y > 0. && l.y < 1.) a = texture(uLogo, vec2(l.x, 1. - l.y)).a;
      vec4 b = texture(uT, vUv);
      if (isVel > .5) {
        vec2 d = vUv - center; d.x *= aspect;
        float r = length(d) + 1e-3; vec2 dir = d / r; vec2 sw = vec2(-dir.y, dir.x);
        o = vec4(b.xy + (dir * color.x + sw * color.y) * a, 0., 1.);
      } else {
        o = vec4(b.xyz + color * a, 1.);
      }
    }`,

  advect: H + `uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 velTexel; uniform float dt; uniform float dissipation;
    void main(){
      vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * velTexel;
      o = texture(uSource, coord) / (1. + dissipation * dt);
    }`,

  divergence: H + `uniform sampler2D uVelocity;
    void main(){
      float L = texture(uVelocity, vL).x, R = texture(uVelocity, vR).x;
      float T = texture(uVelocity, vT).y, B = texture(uVelocity, vB).y;
      vec2 C = texture(uVelocity, vUv).xy;
      if (vL.x < 0.) L = -C.x; if (vR.x > 1.) R = -C.x;
      if (vT.y > 1.) T = -C.y; if (vB.y < 0.) B = -C.y;
      o = vec4(.5 * (R - L + T - B), 0., 0., 1.);
    }`,

  curl: H + `uniform sampler2D uVelocity;
    void main(){
      float L = texture(uVelocity, vL).y, R = texture(uVelocity, vR).y;
      float T = texture(uVelocity, vT).x, B = texture(uVelocity, vB).x;
      o = vec4(.5 * (R - L - T + B), 0., 0., 1.);
    }`,

  vorticity: H + `uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
    void main(){
      float L = texture(uCurl, vL).x, R = texture(uCurl, vR).x, T = texture(uCurl, vT).x, B = texture(uCurl, vB).x;
      float C = texture(uCurl, vUv).x;
      vec2 f = .5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      f /= length(f) + 1e-4; f *= curl * C; f.y *= -1.;
      vec2 v = texture(uVelocity, vUv).xy + f * dt;
      o = vec4(clamp(v, -1000., 1000.), 0., 1.);
    }`,

  pressure: H + `uniform sampler2D uPressure; uniform sampler2D uDivergence;
    void main(){
      float L = texture(uPressure, vL).x, R = texture(uPressure, vR).x, T = texture(uPressure, vT).x, B = texture(uPressure, vB).x;
      o = vec4((L + R + B + T - texture(uDivergence, vUv).x) * .25, 0., 0., 1.);
    }`,

  gradient: H + `uniform sampler2D uPressure; uniform sampler2D uVelocity;
    void main(){
      float L = texture(uPressure, vL).x, R = texture(uPressure, vR).x, T = texture(uPressure, vT).x, B = texture(uPressure, vB).x;
      vec2 v = texture(uVelocity, vUv).xy - vec2(R - L, T - B);
      o = vec4(v, 0., 1.);
    }`,

  // Many vessels: inject each cell's colour, move the liquid with its cell,
  // and drain anything that leaks outside the (metaball) walls.
  cells: H + SMIN + `uniform sampler2D uT; uniform float aspect; uniform float n; uniform float isVel; uniform float amt; uniform float k;
    uniform vec4 cells[16]; uniform vec3 cols[16]; uniform vec4 motion[16];
    void main(){
      vec2 p = vec2(vUv.x * aspect, vUv.y);
      float sd = 1e3; float w = 0.; vec3 tgt = vec3(0.); vec2 vadd = vec2(0.);
      for (int i = 0; i < 16; i++) {
        if (float(i) >= n) break;
        vec2 c = vec2(cells[i].x * aspect, cells[i].y); float r = cells[i].z;
        float d = length(p - c);
        sd = smin(sd, d - r, k);
        vec2 ij = vec2(motion[i].z * aspect, motion[i].w);
        float g = exp(-dot(p - ij, p - ij) / (r * r * .8));
        w += g; tgt += cols[i] * g;
        float inside = smoothstep(r, r * .7, d);
        vec2 q = p - c;
        vadd += (motion[i].xy + cells[i].w * vec2(-q.y, q.x) / max(r, 1e-3)) * inside;
      }
      float m = smoothstep(.003, -.003, sd);
      vec4 b = texture(uT, vUv);
      if (isVel > .5) {
        vec2 v = mix(b.xy * .86, mix(b.xy, vadd, amt), m);
        o = vec4(v, 0., 1.);
      } else {
        vec3 c = b.rgb * mix(.8, 1., m);
        if (w > 1e-4) c = mix(c, tgt / w, clamp(w * amt, 0., 1.));
        o = vec4(c, 1.);
      }
    }`,
};

const DISPLAY = {
  mercury: H + `uniform sampler2D uDye; uniform vec2 texel; uniform float gain;
    float lum(vec3 c){ return dot(c, vec3(.3, .59, .11)); }
    void main(){
      vec3 c = texture(uDye, vUv).rgb;
      float hL = lum(texture(uDye, vL).rgb), hR = lum(texture(uDye, vR).rgb);
      float hT = lum(texture(uDye, vT).rgb), hB = lum(texture(uDye, vB).rgb);
      float h = lum(c);
      vec3 n = normalize(vec3(-(hR - hL) * gain, -(hT - hB) * gain, 1.));
      vec3 r = reflect(vec3(0., 0., -1.), n);
      // A soft studio environment: dark floor, pale sky, one broad key light.
      float e = r.y * .85 + r.x * .3;
      vec3 sky = mix(vec3(.03, .032, .038), vec3(.74, .77, .82), smoothstep(-.6, .9, e));
      sky *= mix(.45, 1., smoothstep(.0, .3, abs(e - .1)));
      float spec = pow(max(dot(r, normalize(vec3(-.35, .55, .75))), 0.), 24.);
      float cover = smoothstep(.02, .38, h);
      vec3 merc = (sky * .9 + spec * .9) * cover;
      float d = max(c.r, max(c.g, c.b)); float mn = min(c.r, min(c.g, c.b));
      float sat = (d - mn) / (d + 1e-3);
      vec3 ink = c / max(d, 1.) * (.7 + .5 * smoothstep(-.5, .9, e)) * smoothstep(.01, .35, d);
      vec3 col = mix(merc, ink, smoothstep(.25, .6, sat));
      o = vec4(col, 1.);
    }`,

  ink: H + `uniform sampler2D uDye; uniform vec2 texel; uniform vec3 base; uniform float gain;
    void main(){
      vec3 c = max(texture(uDye, vUv).rgb, 0.);
      float dL = length(texture(uDye, vL).rgb), dR = length(texture(uDye, vR).rgb);
      float dT = length(texture(uDye, vT).rgb), dB = length(texture(uDye, vB).rgb);
      vec3 n = normalize(vec3(-(dR - dL) * gain, -(dT - dB) * gain, 1.));
      float diffuse = clamp(n.z + .15 * n.y - .1 * n.x, .6, 1.08);
      float d = max(c.r, max(c.g, c.b));
      vec3 hue = c / max(d, 1.);
      float cover = smoothstep(0., .3, d);
      vec3 col = mix(base, hue, cover) * mix(1., diffuse, cover);
      vec3 r = reflect(vec3(0., 0., -1.), n);
      float spec = pow(max(dot(r, normalize(vec3(-.3, .5, .8))), 0.), 36.);
      col += spec * .32 * cover;
      o = vec4(col, 1.);
    }`,

  cells: H + SMIN + `uniform sampler2D uDye; uniform vec2 texel; uniform float aspect; uniform float n; uniform float k; uniform float gain;
    uniform vec4 cells[16];
    void main(){
      vec2 p = vec2(vUv.x * aspect, vUv.y);
      float sd = 1e3;
      for (int i = 0; i < 16; i++) {
        if (float(i) >= n) break;
        vec2 c = vec2(cells[i].x * aspect, cells[i].y);
        sd = smin(sd, length(p - c) - cells[i].z, k);
      }
      float aa = 1.5 / (1. / texel.y);
      float m = smoothstep(aa * 2., -aa * 2., sd);
      vec3 c = texture(uDye, vUv).rgb;
      float dL = length(texture(uDye, vL).rgb), dR = length(texture(uDye, vR).rgb);
      float dT = length(texture(uDye, vT).rgb), dB = length(texture(uDye, vB).rgb);
      vec3 nn = normalize(vec3(-(dR - dL) * gain, -(dT - dB) * gain, 1.));
      float d = max(c.r, max(c.g, c.b));
      vec3 hue = c / max(d, 1.);
      float cover = smoothstep(0., .5, d);
      vec3 col = mix(vec3(.05, .05, .06), hue, cover) * clamp(nn.z + .15 * nn.y, .62, 1.06);
      vec3 r = reflect(vec3(0., 0., -1.), nn);
      col += pow(max(dot(r, normalize(vec3(-.3, .5, .8))), 0.), 36.) * .3 * cover;
      // glass wall: thin bright rim + inner shadow
      float rim = exp(-pow((sd + .003) / .0035, 2.));
      col = col * (1. - .35 * smoothstep(-.03, 0., sd)) + rim * .55;
      float a = max(m, rim * .9);
      o = vec4(col * a, a);
    }`,
};

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function webgl2Available() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    if (!gl) return false;
    const ok = !!gl.getExtension('EXT_color_buffer_float');
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    return ok;
  } catch (e) { return false; }
}

export class Fluid {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.o = Object.assign({
      mode: 'ink', simScale: 0.25, dyeScale: 0.5, dprCap: 2, curl: 18,
      velDiss: 0.35, dyeDiss: 0.08, pressureIters: 20, pressureDecay: 0.8,
      base: '#0b0b0d', gain: 10, alpha: false, maxSim: 256, maxDye: 1024,
    }, opts);
    const gl = canvas.getContext('webgl2', {
      alpha: this.o.alpha, antialias: false, depth: false, stencil: false,
      premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance',
    });
    if (!gl) throw new Error('webgl2 unavailable');
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('float render targets unavailable');
    this.gl = gl;
    this.active = true;
    this.base = hexToRgb(this.o.base);
    this.cellU = null;
    this.ink = [0, 0, 0];

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    this.vs = this._shader(gl.VERTEX_SHADER, VS);
    this.p = {};
    for (const k of Object.keys(FS)) {
      if (k === 'cells' && this.o.mode !== 'cells') continue;
      this.p[k] = this._program(FS[k]);
    }
    this.p.display = this._program(DISPLAY[this.o.mode]);

    this.lastSize = '';
    this.resize(true);
  }

  _shader(type, src) {
    const gl = this.gl;
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  _program(fsSrc) {
    const gl = this.gl;
    const pr = gl.createProgram();
    gl.attachShader(pr, this.vs);
    gl.attachShader(pr, this._shader(gl.FRAGMENT_SHADER, fsSrc));
    gl.bindAttribLocation(pr, 0, 'aPos');
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    const u = {};
    const n = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(pr, i);
      const name = info.name.replace(/\[0\]$/, '');
      u[name] = { loc: gl.getUniformLocation(pr, info.name), type: info.type };
    }
    return { pr, u };
  }

  _fbo(w, h, internal, format, type) {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex, fbo, w, h, texel: [1 / w, 1 / h] };
  }
  _double(w, h, internal, format, type) {
    let a = this._fbo(w, h, internal, format, type);
    let b = this._fbo(w, h, internal, format, type);
    return {
      w, h, texel: a.texel,
      get read() { return a; }, get write() { return b; },
      swap() { const t = a; a = b; b = t; },
    };
  }
  _free(f) {
    if (!f) return;
    const gl = this.gl;
    for (const x of f.read ? [f.read, f.write] : [f]) { gl.deleteTexture(x.tex); gl.deleteFramebuffer(x.fbo); }
  }

  resize(force) {
    const r = this.canvas.getBoundingClientRect();
    const cw = Math.max(2, Math.round(r.width)), ch = Math.max(2, Math.round(r.height));
    const dpr = Math.min(window.devicePixelRatio || 1, this.o.dprCap);
    const key = cw + 'x' + ch;
    if (!force && key === this.lastSize) return;
    // Ignore small height-only changes (mobile URL bar) once running.
    if (!force && this.cssW === cw && Math.abs(this.cssH - ch) < 120) return;
    this.lastSize = key;
    this.ink = [0, 0, 0];
    this.cssW = cw; this.cssH = ch;
    this.canvas.width = Math.round(cw * dpr);
    this.canvas.height = Math.round(ch * dpr);
    this.aspect = cw / ch;
    const fit = (scale, max) => {
      let w = Math.round(cw * scale), h = Math.round(ch * scale);
      const m = Math.max(w, h);
      if (m > max) { w = Math.round(w * max / m); h = Math.round(h * max / m); }
      return [Math.max(8, w), Math.max(8, h)];
    };
    const [sw, sh] = fit(this.o.simScale, this.o.maxSim);
    const [dw, dh] = fit(this.o.dyeScale, this.o.maxDye);
    const gl = this.gl;
    [this.vel, this.dye, this.div, this.curlF, this.pres].forEach((f) => this._free(f));
    this.vel = this._double(sw, sh, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);
    this.dye = this._double(dw, dh, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);
    this.div = this._fbo(sw, sh, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);
    this.curlF = this._fbo(sw, sh, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);
    this.pres = this._double(sw, sh, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);
    if (this.onResize) this.onResize(this);
  }

  _run(prog, uniforms, target, texel) {
    const gl = this.gl;
    const { pr, u } = this.p[prog];
    gl.useProgram(pr);
    let unit = 0;
    const tx = texel || (target ? target.texel : [1 / this.canvas.width, 1 / this.canvas.height]);
    if (u.texel) gl.uniform2f(u.texel.loc, tx[0], tx[1]);
    for (const k in uniforms) {
      const e = u[k];
      if (!e) continue;
      const v = uniforms[k];
      switch (e.type) {
        case gl.SAMPLER_2D:
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, v.tex || v);
          gl.uniform1i(e.loc, unit++);
          break;
        case gl.FLOAT: gl.uniform1f(e.loc, v); break;
        case gl.FLOAT_VEC2: gl.uniform2fv(e.loc, v); break;
        case gl.FLOAT_VEC3: gl.uniform3fv(e.loc, v); break;
        case gl.FLOAT_VEC4: gl.uniform4fv(e.loc, v); break;
        default: break;
      }
    }
    if (target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      gl.viewport(0, 0, target.w, target.h);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  /* ---- Public API ---- */

  // x, y: CSS px in the canvas. vx, vy: CSS px/s. color: hex or [r,g,b]. r: radius in CSS px.
  splat(x, y, vx, vy, color, r = 40) {
    const u = x / this.cssW, v = 1 - y / this.cssH;
    const rad = Math.pow(r / this.cssH, 2);
    const vel = this.vel;
    this._run('splat', { uT: vel.read, aspect: this.aspect, point: [u, v], radius: rad,
      color: [vx * vel.w / this.cssW, -vy * vel.h / this.cssH, 0] }, vel.write);
    vel.swap();
    if (color) {
      const c = typeof color === 'string' ? hexToRgb(color) : color;
      this._ledger(c, Math.PI * (r / this.cssH) * (r / this.cssW));
      this._run('splat', { uT: this.dye.read, aspect: this.aspect, point: [u, v], radius: rad, color: c }, this.dye.write);
      this.dye.swap();
    }
  }

  // Multiply the dye (or velocity) — drain old colour, calm the liquid.
  fade(value, which = 'dye') {
    const f = which === 'dye' ? this.dye : this.vel;
    if (which === 'dye') this.ink = this.ink.map((v) => v * value);
    this._run('clear', { uT: f.read, value }, f.write);
    f.swap();
  }

  logoTexture(source) {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    return tex;
  }

  // Ink in the shape of a logo, inside a CSS-px rect {x,y,w,h}.
  logoSplat(tex, rect, color, amount, burst = 0, swirl = 0) {
    const x0 = rect.x / this.cssW, x1 = (rect.x + rect.w) / this.cssW;
    const y0 = 1 - (rect.y + rect.h) / this.cssH, y1 = 1 - rect.y / this.cssH;
    const c = typeof color === 'string' ? hexToRgb(color) : color;
    const center = [(x0 + x1) / 2, (y0 + y1) / 2];
    this._ledger(c, amount * (x1 - x0) * (y1 - y0) * 0.3);
    this._run('logo', { uT: this.dye.read, uLogo: tex, rect: [x0, y0, x1, y1], color: c.map((v) => v * amount), isVel: 0, center, aspect: this.aspect }, this.dye.write);
    this.dye.swap();
    if (burst || swirl) {
      const s = this.vel.w / this.cssW;
      this._run('logo', { uT: this.vel.read, uLogo: tex, rect: [x0, y0, x1, y1], color: [burst * s, swirl * s, 0], isVel: 1, center, aspect: this.aspect }, this.vel.write);
      this.vel.swap();
    }
  }

  // Cells uniforms for the 'cells' mode (set every frame by the owner).
  setCells(cellU) { this.cellU = cellU; }

  // Average colour of the liquid: { rgb: [0..1]x3, cover: 0..1 }. Rather than
  // read pixels back from the GPU (a stall), the solver keeps an ink ledger:
  // every splat adds to it, fades and dissipation take from it, advection
  // conserves it. Its hue is the liquid's mean hue.
  sample() {
    const t = this.ink;
    const m = Math.max(t[0], t[1], t[2]);
    if (m < 1e-5) return { rgb: [0, 0, 0], cover: 0 };
    return { rgb: t.map((v) => Math.max(0, v) / m), cover: Math.min(1, m / 0.25) };
  }
  _ledger(c, weight) {
    for (let i = 0; i < 3; i++) this.ink[i] = Math.max(0, this.ink[i] + c[i] * weight);
  }

  step(dt) {
    if (this.onStep) this.onStep(this, dt);
    const k = 1 / (1 + this.o.dyeDiss * dt);
    this.ink = this.ink.map((v) => v * k);
    const { vel, dye } = this;
    const vt = vel.texel;
    if (this.o.mode === 'cells' && this.cellU) {
      const cu = this.cellU;
      this._run('cells', { uT: vel.read, aspect: this.aspect, n: cu.n, k: cu.k, isVel: 1, amt: cu.velAmt, cells: cu.cells, cols: cu.cols, motion: cu.motion }, vel.write);
      vel.swap();
      this._run('cells', { uT: dye.read, aspect: this.aspect, n: cu.n, k: cu.k, isVel: 0, amt: cu.dyeAmt, cells: cu.cells, cols: cu.cols, motion: cu.motion }, dye.write);
      dye.swap();
    }
    this._run('curl', { uVelocity: vel.read }, this.curlF);
    this._run('vorticity', { uVelocity: vel.read, uCurl: this.curlF, curl: this.o.curl, dt }, vel.write);
    vel.swap();
    this._run('divergence', { uVelocity: vel.read }, this.div);
    this._run('clear', { uT: this.pres.read, value: this.o.pressureDecay }, this.pres.write);
    this.pres.swap();
    for (let i = 0; i < this.o.pressureIters; i++) {
      this._run('pressure', { uPressure: this.pres.read, uDivergence: this.div }, this.pres.write);
      this.pres.swap();
    }
    this._run('gradient', { uPressure: this.pres.read, uVelocity: vel.read }, vel.write);
    vel.swap();
    this._run('advect', { uVelocity: vel.read, uSource: vel.read, velTexel: vt, dt, dissipation: this.o.velDiss }, vel.write, vt);
    vel.swap();
    this._run('advect', { uVelocity: vel.read, uSource: dye.read, velTexel: vt, dt, dissipation: this.o.dyeDiss }, dye.write, dye.texel);
    dye.swap();
  }

  render() {
    const u = { uDye: this.dye.read, base: this.base, gain: this.o.gain, aspect: this.aspect };
    if (this.o.mode === 'cells' && this.cellU) Object.assign(u, { n: this.cellU.n, k: this.cellU.k, cells: this.cellU.cells });
    const gl = this.gl;
    if (this.o.alpha) { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, this.canvas.width, this.canvas.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); }
    this._run('display', u, null, this.dye.texel);
  }
}

export { hexToRgb };
