/* THE BRAND FACTORY — the 3D scene.

   Concept: one blank four-step app (Brief → Assets → Compose → Review) is
   built once. Scroll drives a factory line: the app assembles from its four
   panels, copies peel off the master and ride a conveyor under brand presses
   (Nike, Apple, CommBank). Each press slams down and re-skins its copy —
   colour, logo and copy in their voice — with sparks and a camera shake. The
   copies lift into a showcase where the in-app assistant (the orb) answers
   in each brand's voice. A fourth press waits for the visitor to type a
   client; then one phone flies to camera to be shared, and the finale pulls
   back to dozens of branded copies orbiting the one master.

   Everything is keyed off S.t — a continuous chapter index (0..7) computed
   from scroll in main.js — so it scrubs both ways. Presses fire on crossing
   their threshold; the rest is pure functions of t. Screens are
   CanvasTextures drawn by brands.js, so they stay crisp and brandable. */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BRANDS, BLANK, EXTRAS, CARD, SW, SH, drawBase, drawCards, drawPressSign, fillAssistant } from './brands.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, v) => { const x = clamp((v - a) / (b - a)); return x * x * (3 - 2 * x); };
const easeOutCubic = (x) => 1 - (1 - x) ** 3;
const easeInCubic = (x) => x * x * x;
const easeOutBack = (x) => { const c = 1.9; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2; };
const V = (x, y, z) => new THREE.Vector3(x, y, z);

const LIME = '#D4FF3A';
const VIOLET = '#8E6BF0';
const BELT_Y = -4;
const PRESS_X = [-3, 0, 3, 6.6];
const START_X = -6;
const PED_X = -8.2;
const SHOW = (k) => V(PRESS_X[k], -2.05, 3.1);
const ORBIT_C = V(0, 6.2, -2);
const ASSIST_AT = V(0.66, 0.62, 0.14); // phone-local: right edge, level with the app bar

export function start(S, hooks) {
  const canvas = document.getElementById('gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.fog = new THREE.Fog(0x0b0518, 26, 60);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.4, 200);
  scene.add(new THREE.AmbientLight(0x6b4fd8, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(4, 8, 6);
  scene.add(key);
  const rimL = new THREE.PointLight(0xd4ff3a, 30, 30, 1.6);
  rimL.position.set(-5, 1, -2);
  scene.add(rimL);
  const rimV = new THREE.PointLight(0x8e6bf0, 40, 40, 1.6);
  rimV.position.set(6, -1, 4);
  scene.add(rimV);

  /* ---------- Shared textures & geometry ---------- */
  function radialTex(inner = 'rgba(255,255,255,1)') {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, inner);
    g.addColorStop(0.35, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const glowTex = radialTex();

  const bodyGeo = new RoundedBoxGeometry(1.1, 2.14, 0.1, 5, 0.1);
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0x1a1526, metalness: 0.55, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12 });
  const screenShape = new THREE.Shape();
  screenShape.moveTo(-0.5, -1);
  (function roundRect(s, x, y, w, h, r) {
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  })(screenShape, -0.5, -1, 1, 2, 0.085);
  const screenGeo = new THREE.ShapeGeometry(screenShape, 10);
  {
    const p = screenGeo.attributes.position, uv = screenGeo.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) + 0.5, (p.getY(i) + 1) / 2);
  }
  const PANELS = [0, 1, 2, 3].map((i) => {
    const c = CARD(i);
    const w = c.w / SW, h = (c.h / SH) * 2;
    const geo = new THREE.PlaneGeometry(w, h);
    const uv = geo.attributes.uv;
    const u0 = c.x / SW, u1 = (c.x + c.w) / SW, v0 = 1 - (c.y + c.h) / SH, v1 = 1 - c.y / SH;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, lerp(u0, u1, uv.getX(k)), lerp(v0, v1, uv.getY(k)));
    return { geo, cx: (c.x + c.w / 2) / SW - 0.5, cy: 1 - (2 * (c.y + c.h / 2)) / SH, w, h };
  });
  const glowGeo = new THREE.PlaneGeometry(2.8, 4);

  /* ---------- Brand materials (cached per brand + resolution) ---------- */
  const mats = new Map();
  function canvasTex(w, h, draw) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    return t;
  }
  function brandMats(br, res = 640) {
    const id = br.key + '@' + res;
    if (mats.has(id)) return mats.get(id);
    const base = canvasTex(res, res * 2, (c) => drawBase(c, br));
    const cards = canvasTex(res, res * 2, (c) => drawCards(c, br));
    const m = {
      base: new THREE.MeshBasicMaterial({ map: base, toneMapped: false }),
      cards: new THREE.MeshBasicMaterial({ map: cards, transparent: true, toneMapped: false }),
      color: new THREE.Color(br.blank ? VIOLET : br.b === '#FFFFFF' ? br.head : br.b),
    };
    mats.set(id, m);
    return m;
  }

  /* ---------- Phones ---------- */
  const clickable = [];
  function makePhone(br, res = 640) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    g.add(body);
    const m = brandMats(br, res);
    const screen = new THREE.Mesh(screenGeo, m.base);
    screen.position.z = 0.051;
    g.add(screen);
    const pans = PANELS.map((P) => {
      const p = new THREE.Mesh(P.geo, m.cards);
      p.position.set(P.cx, P.cy, 0.056);
      p.renderOrder = 2;
      g.add(p);
      return p;
    });
    const flash = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    flash.position.z = 0.062;
    flash.renderOrder = 3;
    g.add(flash);
    const glow = new THREE.Mesh(glowGeo, new THREE.MeshBasicMaterial({ map: glowTex, color: m.color, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    glow.position.z = -0.12;
    g.add(glow);
    g.userData = { br, body, screen, pans, flash, glow, res, hover: 0, pulse: 0 };
    body.userData.phone = g;
    return g;
  }
  function skin(phone, br) {
    const m = brandMats(br, phone.userData.res);
    const d = phone.userData;
    d.screen.material = m.base;
    d.pans.forEach((p) => { p.material = m.cards; });
    d.glow.material.color.copy(m.color);
    d.br = br;
  }

  /* ---------- The factory floor ---------- */
  const floorMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color(LIME) }, uTime: { value: 0 } },
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }',
    fragmentShader: `uniform vec3 uColor; uniform float uTime; varying vec3 vW;
      void main(){
        vec2 c = vW.xz * 0.5;
        vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
        float line = 1.0 - min(min(g.x, g.y), 1.0);
        float fade = exp(-length(vW.xz - vec2(0.0, 1.0)) * 0.085);
        float scan = smoothstep(0.0, 1.0, 1.0 - abs(fract(vW.x * 0.04 - uTime * 0.05) - 0.5) * 6.0);
        gl_FragColor = vec4(uColor * (0.55 + scan * 0.8), line * fade * (0.28 + scan * 0.25));
      }`,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(90, 60), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = BELT_Y - 0.9;
  scene.add(floor);

  // Conveyor
  const beltTex = (() => {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 128;
    const x = c.getContext('2d');
    x.fillStyle = '#17121F';
    x.fillRect(0, 0, 256, 128);
    x.strokeStyle = 'rgba(212,255,58,0.22)';
    x.lineWidth = 10;
    for (let i = -1; i < 3; i++) {
      x.beginPath();
      x.moveTo(i * 128 + 20, 12); x.lineTo(i * 128 + 70, 64); x.lineTo(i * 128 + 20, 116);
      x.stroke();
    }
    x.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < 256; i += 32) x.fillRect(i, 0, 2, 128);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(22 / 1.6, 1);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    return t;
  })();
  const line = new THREE.Group();
  scene.add(line);
  const BELT_L = 22, BELT_CX = 2.2;
  const belt = new THREE.Mesh(new THREE.BoxGeometry(BELT_L, 0.16, 2.7), new THREE.MeshStandardMaterial({ color: 0x1b1624, roughness: 0.7, metalness: 0.4 }));
  belt.position.set(BELT_CX, BELT_Y - 0.08, 0);
  line.add(belt);
  const beltTop = new THREE.Mesh(new THREE.PlaneGeometry(BELT_L, 2.5), new THREE.MeshStandardMaterial({ map: beltTex, roughness: 0.55, metalness: 0.2 }));
  beltTop.rotation.x = -Math.PI / 2;
  beltTop.position.set(BELT_CX, BELT_Y + 0.002, 0);
  line.add(beltTop);
  const railMat = new THREE.MeshBasicMaterial({ color: LIME, toneMapped: false });
  [-1.32, 1.32].forEach((z) => {
    const r = new THREE.Mesh(new THREE.BoxGeometry(BELT_L, 0.05, 0.05), railMat);
    r.position.set(BELT_CX, BELT_Y + 0.02, z);
    line.add(r);
  });
  const legGeo = new THREE.BoxGeometry(0.14, 0.9, 0.14);
  const metal = new THREE.MeshStandardMaterial({ color: 0x2a2336, roughness: 0.35, metalness: 0.85 });
  for (let x = -8; x <= 12; x += 2.5) {
    [-1.2, 1.2].forEach((z) => {
      const l = new THREE.Mesh(legGeo, metal);
      l.position.set(x, BELT_Y - 0.6, z);
      line.add(l);
    });
  }

  // Pedestal for the master
  const ped = new THREE.Group();
  ped.position.set(PED_X, BELT_Y, 0);
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.15, 0.5, 48), metal);
  plinth.position.y = 0.25;
  ped.add(plinth);
  const pedRing = new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.025, 8, 64), railMat);
  pedRing.rotation.x = Math.PI / 2;
  pedRing.position.y = 0.5;
  ped.add(pedRing);
  const pedSign = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.35), new THREE.MeshBasicMaterial({
    transparent: true, toneMapped: false,
    map: canvasTex(512, 128, (c) => {
      const x = c.getContext('2d');
      x.fillStyle = LIME; x.font = '800 44px Unbounded, sans-serif'; x.textBaseline = 'middle'; x.textAlign = 'center';
      x.fillText('MASTER', 256, 50);
      x.fillStyle = 'rgba(255,255,255,0.6)'; x.font = '500 22px "Geist Mono", monospace';
      x.fillText('BUILT ONCE · 4 STEPS', 256, 100);
    }),
  }));
  pedSign.position.set(0, 0.25, 1.16);
  ped.add(pedSign);
  line.add(ped);

  // Presses
  const signGeo = new THREE.PlaneGeometry(2.0, 1.0);
  const pillarGeo = new THREE.BoxGeometry(0.22, 4.2, 0.22);
  const beamGeo = new THREE.BoxGeometry(1.5, 0.55, 3.1);
  const headGeo = new THREE.BoxGeometry(1.3, 0.34, 2.45);
  const pistonGeo = new THREE.CylinderGeometry(0.11, 0.11, 1, 20);
  const lampGeo = new THREE.SphereGeometry(0.11, 16, 12);
  const edgeGeo = new THREE.BoxGeometry(1.32, 0.04, 2.47);
  const HEAD_REST = 2.4, HEAD_HIT = 0.1 + 0.17;
  const presses = PRESS_X.map((x, k) => {
    const br = [BRANDS.nike, BRANDS.apple, BRANDS.commbank, null][k];
    const g = new THREE.Group();
    g.position.set(x, BELT_Y, 0);
    [-0.6, 0.6].forEach((x) => {
      const p = new THREE.Mesh(pillarGeo, metal);
      p.position.set(x, 2.0, -1.62);
      g.add(p);
    });
    const beam = new THREE.Mesh(beamGeo, metal);
    beam.position.set(0, 3.9, -0.3);
    g.add(beam);
    const head = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({ color: 0x241d31, roughness: 0.25, metalness: 0.9 }));
    head.position.y = HEAD_REST;
    g.add(head);
    const edge = new THREE.Mesh(edgeGeo, new THREE.MeshBasicMaterial({ color: br ? br.b : LIME, toneMapped: false }));
    edge.position.y = -0.17;
    head.add(edge);
    const piston = new THREE.Mesh(pistonGeo, new THREE.MeshStandardMaterial({ color: 0xcfc8dd, roughness: 0.15, metalness: 1 }));
    g.add(piston);
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 640; signCanvas.height = 320;
    drawPressSign(signCanvas, br || BLANK, { empty: !br });
    const signTex = new THREE.CanvasTexture(signCanvas);
    signTex.colorSpace = THREE.SRGBColorSpace;
    signTex.anisotropy = maxAniso;
    const sign = new THREE.Mesh(signGeo, new THREE.MeshBasicMaterial({ map: signTex, toneMapped: false }));
    sign.position.set(0, 4.05, 1.27);
    g.add(sign);
    const lampCol = new THREE.Color(br ? (br.b === '#FFFFFF' ? LIME : br.b) : LIME);
    const lamp = new THREE.Mesh(lampGeo, new THREE.MeshBasicMaterial({ color: lampCol, toneMapped: false }));
    lamp.position.set(0, 4.72, 1.0);
    g.add(lamp);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: lampCol, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.setScalar(1.3);
    lamp.add(halo);
    line.add(g);
    return { g, head, edge, piston, sign, signCanvas, signTex, lamp, halo, lampCol, br, fired: -1, stamped: false, pendingSkin: null, hit: false };
  });
  function setPressBrand(k, br) {
    const P = presses[k];
    P.br = br;
    drawPressSign(P.signCanvas, br, {});
    P.signTex.needsUpdate = true;
    P.lampCol.set(br.b === '#FFFFFF' ? LIME : br.b);
    P.lamp.material.color.copy(P.lampCol);
    P.halo.material.color.copy(P.lampCol);
    P.edge.material.color.set(br.b);
  }

  /* ---------- Sparks, shockwaves, shake ---------- */
  const SPARK_N = 900;
  const spPos = new Float32Array(SPARK_N * 3), spVel = new Float32Array(SPARK_N * 3), spCol = new Float32Array(SPARK_N * 3);
  const spLife = new Float32Array(SPARK_N), spMax = new Float32Array(SPARK_N).fill(1);
  let spNext = 0;
  const spGeo = new THREE.BufferGeometry();
  spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
  spGeo.setAttribute('color', new THREE.BufferAttribute(spCol, 3));
  spGeo.setAttribute('aLife', new THREE.BufferAttribute(spLife, 1));
  const spMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
    uniforms: { uScale: { value: 1 } },
    vertexShader: `attribute float aLife; varying vec3 vC; varying float vL; uniform float uScale;
      void main(){ vC = color; vL = aLife; vec4 mv = modelViewMatrix*vec4(position,1.0);
      gl_PointSize = uScale * (14.0 * clamp(aLife, 0.0, 1.0) + 1.0) * (10.0 / -mv.z); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `varying vec3 vC; varying float vL;
      void main(){ float d = length(gl_PointCoord - 0.5); if (vL <= 0.0 || d > 0.5) discard;
      gl_FragColor = vec4(vC * (1.0 - d * 2.0) * 1.6, 1.0); }`,
  });
  const sparks = new THREE.Points(spGeo, spMat);
  sparks.frustumCulled = false;
  scene.add(sparks);
  const tmpC = new THREE.Color();
  function burst(p, color, n = 140, power = 1) {
    for (let i = 0; i < n; i++) {
      const j = spNext; spNext = (spNext + 1) % SPARK_N;
      const a = Math.random() * Math.PI * 2, sp = (1.5 + Math.random() * 5) * power;
      spPos[j * 3] = p.x + Math.cos(a) * 0.5; spPos[j * 3 + 1] = p.y + 0.05; spPos[j * 3 + 2] = p.z + Math.sin(a) * 0.9;
      spVel[j * 3] = Math.cos(a) * sp; spVel[j * 3 + 1] = (1 + Math.random() * 4.5) * power; spVel[j * 3 + 2] = Math.sin(a) * sp;
      tmpC.set(Math.random() < 0.45 ? '#FFFFFF' : Math.random() < 0.5 ? LIME : color);
      spCol[j * 3] = tmpC.r; spCol[j * 3 + 1] = tmpC.g; spCol[j * 3 + 2] = tmpC.b;
      spMax[j] = 0.45 + Math.random() * 0.6;
      spLife[j] = 1;
    }
  }
  function updateSparks(dt) {
    for (let j = 0; j < SPARK_N; j++) {
      if (spLife[j] <= 0) continue;
      spVel[j * 3 + 1] -= 11 * dt;
      spPos[j * 3] += spVel[j * 3] * dt; spPos[j * 3 + 1] += spVel[j * 3 + 1] * dt; spPos[j * 3 + 2] += spVel[j * 3 + 2] * dt;
      spVel[j * 3] *= 0.985; spVel[j * 3 + 2] *= 0.985;
      spLife[j] -= dt / spMax[j];
    }
    spGeo.attributes.position.needsUpdate = true;
    spGeo.attributes.aLife.needsUpdate = true;
    spGeo.attributes.color.needsUpdate = true;
  }
  const ringGeo = new THREE.RingGeometry(0.92, 1, 64);
  const rings = [0, 1, 2, 3].map(() => {
    const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: LIME, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    m.rotation.x = -Math.PI / 2;
    m.visible = false;
    scene.add(m);
    return { m, t: 9 };
  });
  let ringNext = 0;
  function shock(p, color) {
    const r = rings[ringNext]; ringNext = (ringNext + 1) % rings.length;
    r.m.position.set(p.x, p.y + 0.02, p.z);
    r.m.material.color.set(color);
    r.t = 0;
    r.m.visible = true;
  }
  let shake = 0;

  /* ---------- The master and its copies ---------- */
  const master = makePhone(BLANK, 768);
  scene.add(master);
  const copies = [0, 1, 2, 3].map(() => {
    const p = makePhone(BLANK);
    p.visible = false;
    scene.add(p);
    return p;
  });
  const shareP = makePhone(BRANDS.commbank);
  shareP.visible = false;
  scene.add(shareP);

  // Finale: extra clients (lower-res screens) + the real ones join the orbit.
  const RINGS = [{ r: 3.9, n: 8, tilt: 0.62, tz: -0.3, w: 0.16 }, { r: 6.5, n: 12, tilt: 0.5, tz: 0.22, w: -0.1 }, { r: 9.2, n: 16, tilt: 0.7, tz: 0.04, w: 0.07 }];
  const slots = [];
  RINGS.forEach((R, ri) => { for (let j = 0; j < R.n; j++) slots.push({ ri, a: (j / R.n) * Math.PI * 2 + ri * 0.4 }); });
  const orbiters = [];
  for (let i = 4; i < slots.length; i++) {
    const br = EXTRAS[(i - 4) % EXTRAS.length];
    const p = makePhone(br, 320);
    p.visible = false;
    p.userData.slot = i;
    scene.add(p);
    orbiters.push(p);
  }
  copies.forEach((p, k) => { p.userData.slot = [2, 9, 14, 5][k]; });
  // Put the three hand-checked brands in prominent slots; shuffle extras around them.
  orbiters.forEach((p, i) => { const taken = copies.map((c) => c.userData.slot); let s = 4 + i; while (taken.includes(s % slots.length)) s++; p.userData.slot = s % slots.length; });
  {
    const used = new Set();
    [...copies, ...orbiters].forEach((p) => { let s = p.userData.slot; while (used.has(s)) s = (s + 1) % slots.length; used.add(s); p.userData.slot = s; });
  }
  let orbitTime = 0;
  const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _m = new THREE.Matrix4();
  function slotPose(s, out) {
    const S0 = slots[s], R = RINGS[S0.ri];
    const a = S0.a + orbitTime * R.w;
    out.set(Math.cos(a) * R.r, 0, Math.sin(a) * R.r);
    out.applyAxisAngle(V(1, 0, 0), R.tilt);
    out.applyAxisAngle(V(0, 0, 1), R.tz);
    return out.add(ORBIT_C);
  }

  /* ---------- The assistant orb ---------- */
  const orbMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uA: { value: new THREE.Color(LIME) }, uB: { value: new THREE.Color(VIOLET) } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vP = position; vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
    fragmentShader: `uniform float uTime; uniform vec3 uA; uniform vec3 uB; varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main(){ float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.2);
        float w = 0.5 + 0.5 * sin(uTime * 2.4 + vP.y * 14.0 + sin(vP.x * 9.0 + uTime) * 2.0);
        vec3 c = mix(uB, uA, w);
        gl_FragColor = vec4(c * (0.55 + f * 1.8) + f * 0.4, 1.0); }`,
  });
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 40, 28), orbMat);
  const orbHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: LIME, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
  orbHalo.scale.setScalar(1.25);
  orb.add(orbHalo);
  scene.add(orb);

  /* ---------- DOM hooks: labels, bubble, tooltip ---------- */
  const $ = (id) => document.getElementById(id);
  const panelLabels = [0, 1, 2, 3].map((i) => $('pl' + i));
  const bubble = $('bubble');
  const tip = $('tip');
  let bubbleBrand = null, bubbleStart = 0;
  function setBubble(br, now) {
    if (bubbleBrand === br) return;
    bubbleBrand = br;
    bubbleStart = now;
    if (!br) return;
    fillAssistant(bubble, br, true);
  }
  function typeBubble(now) {
    if (!bubbleBrand) return;
    const el = (now - bubbleStart) * 38; // chars per second
    let used = 8; // a beat before the answer starts
    bubble.querySelectorAll('.bb-a li').forEach((li) => {
      const full = li.dataset.full;
      const n = clamp(Math.floor(el - used), 0, full.length);
      if (li.textContent.length !== n) li.textContent = full.slice(0, n);
      li.classList.toggle('typing', n > 0 && n < full.length);
      used += full.length + 4;
    });
  }

  /* ---------- Sizing ---------- */
  let W = 1, H = 1, aspect = 1, mobile = false;
  let finaleTop = 0, finaleHalfW = 0;
  const _v = new THREE.Vector3();
  const finaleCopy = document.querySelector('.chap-final');
  function measureFinale() {
    // the headline block (eyebrow → CTA) is fixed-position, so measure it directly
    const r = finaleCopy.getBoundingClientRect();
    const h1 = finaleCopy.querySelector('.final-h').getBoundingClientRect();
    finaleTop = r.top;
    finaleHalfW = Math.max(h1.width, r.width * 0.5) / 2;
  }
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    aspect = W / H;
    mobile = aspect < 0.9;
    renderer.setSize(W, H, false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    spMat.uniforms.uScale.value = H / 900 * renderer.getPixelRatio();
    measureFinale();
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---------- Camera path ---------- */
  // Focus x for the assistant chapter: the orb visits each stamped copy.
  const aiFocus = (t) => {
    const u = t - 3;
    return lerp(lerp(PRESS_X[0], PRESS_X[1], ss(0.3, 0.4, u)), PRESS_X[2], ss(0.63, 0.73, u));
  };
  const aiPos = (t) => { const x = aiFocus(t) + 0.9; return V(x, -1.1, 10.4); };
  const aiLook = (t) => { const x = aiFocus(t) + 0.9; return V(x, -2.0, 3.1); };
  const K = [
    [0.0, V(0, 0, 5.7), V(0, 0, 0)],
    [0.5, V(0, 0, 5.7), V(0, 0, 0)],
    [1.12, V(-0.5, 0.5, 6.6), V(0.35, -0.1, 0)],
    [1.82, V(-0.5, 0.5, 6.6), V(0.35, -0.1, 0)],
    [2.1, V(-5.6, 0.4, 9.2), V(-6.4, -3.1, 0)],
    [2.24, V(-4.4, 1.2, 11), V(-4.2, -3.5, 0)],
    [2.44, V(0.3, 4.0, 12.4), V(0.4, -2.95, 0)],
    [2.68, V(0.3, 4.0, 12.4), V(0.4, -2.95, 0)],
    [2.96, V(0.4, 0.4, 13.5), V(0.4, -2.3, 2.2)],
    [3.06, aiPos, aiLook],
    [3.94, aiPos, aiLook],
    [4.14, V(5.6, 1.5, 9.8), V(6.6, -2.45, 0.2)],
    [4.9, V(5.6, 1.5, 9.8), V(6.6, -2.45, 0.2)],
    [5.12, V(4.6, 0.8, 12), V(5.6, -2.8, 0)],
    [5.88, V(4.6, 0.8, 12), V(5.6, -2.8, 0)],
    [6.36, V(0, 9.6, 31), V(0, 5.4, -2)],
    [7.2, V(0, 9.6, 31), V(0, 5.4, -2)],
  ];
  const val = (v, t) => (typeof v === 'function' ? v(t) : v);
  const camPos = V(0, 0, 6.6), camLook = V(0, 0, 0);
  function cameraAt(t) {
    let i = 0;
    while (i < K.length - 2 && t > K[i + 1][0]) i++;
    const [t0, p0, l0] = K[i], [t1, p1, l1] = K[i + 1];
    const a = ss(t0, t1, t);
    camPos.copy(val(p0, t)).lerp(val(p1, t), a);
    camLook.copy(val(l0, t)).lerp(val(l1, t), a);
  }
  // How far the subject sits right of centre (desktop, room for copy on the
  // left) or below centre (mobile, copy on top).
  const OFFX = [[0, 0.18], [0.6, 0.18], [1.1, 0.16], [2.0, 0.17], [2.9, 0.14], [3.1, 0.14], [4.0, 0.12], [4.9, 0.12], [5.1, 0.2], [5.9, 0.2], [6.3, 0], [7, 0]];
  const OFFY = [[0, 0], [5.9, 0], [6.3, 0.1], [7, 0.1]];
  const OFFY_M = [[0, -0.27], [0.8, -0.27], [1.1, -0.2], [3.9, -0.2], [4.1, -0.28], [5.9, -0.28], [6.3, 0.12], [7, 0.12]];
  function tableAt(T, t) {
    let i = 0;
    while (i < T.length - 2 && t > T[i + 1][0]) i++;
    return lerp(T[i][1], T[i + 1][1], ss(T[i][0], T[i + 1][0], t));
  }

  /* ---------- Interaction: parallax, hover, click-to-fly ---------- */
  const mouse = new THREE.Vector2(0, 0), mouseS = new THREE.Vector2(0, 0), ndc = new THREE.Vector2(-9, -9);
  let pointerOnUI = false;
  window.addEventListener('pointermove', (e) => {
    mouse.set((e.clientX / W) * 2 - 1, -(e.clientY / H) * 2 + 1);
    ndc.copy(mouse);
    pointerOnUI = !!e.target.closest('a, button, input, label, .modal, .chap-ui, .nav, .rail');
    tip.style.transform = `translate(${e.clientX + 18}px, ${e.clientY + 14}px)`;
  });
  const ray = new THREE.Raycaster();
  let hovered = null;
  let focus = null; // { phone, from: {pos, look}, start, dir }
  window.addEventListener('click', (e) => {
    if (e.target.closest('a, button, input, label, .modal, .chap-ui, .nav, .rail, footer')) return;
    if (hovered && !focus) {
      const phone = hovered;
      focus = { phone, start: performance.now() / 1000 };
      hooks.sound('tick');
      setTimeout(() => hooks.onPick(phone.userData.br), 650);
    }
  });
  function unfocus() { if (focus) focus.release = performance.now() / 1000; }

  /* ---------- Intro: the four panels fly in and snap into the master ---------- */
  const INTRO_FROM = [V(-3.2, 2.6, 2.2), V(3.4, 1.6, 1.4), V(-3.6, -1.4, 1.8), V(2.8, -2.8, 2.6)];
  const INTRO_ROT = [V(0.9, -1.2, 0.6), V(-0.7, 1.4, -0.5), V(1.1, 0.8, 0.9), V(-1.0, -0.9, -0.7)];
  const introAt = [0.5, 0.82, 1.14, 1.46];
  const INTRO_DUR = 0.75;
  let introClock = -1;
  const landed = [false, false, false, false];

  /* ---------- Frame ---------- */
  let last = performance.now() / 1000, first = last, ts = S.t, lastT = S.t;
  const v1 = V(0, 0, 0), v2 = V(0, 0, 0), v3 = V(0, 0, 0);
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
  const FLAT = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
  const UP = new THREE.Quaternion();

  function placeOnBelt(p, x) {
    p.position.set(x, BELT_Y + 0.05, 0);
    p.quaternion.copy(FLAT);
  }

  function slam(k, now, br, fx = true) {
    const P = presses[k];
    P.fired = fx ? now : -1;
    P.hit = !fx;
    P.pendingSkin = br;
    P.stamped = true;
    if (!fx) skin(copies[k], br);
  }

  let visitorQueued = null;
  const api = {
    stampVisitor(br) {
      visitorQueued = br;
    },
    unfocus,
    get ready() { return true; },
  };

  function frame() {
    const now = performance.now() / 1000;
    const dt = Math.min(0.05, now - last);
    last = now;
    if (introClock < 0) introClock = now;
    const it = now - introClock;

    // smooth the scroll
    ts += (S.t - ts) * (1 - Math.exp(-dt * 5.5));
    if (Math.abs(S.t - ts) < 0.0004) ts = S.t;
    const t = ts;
    const jump = Math.abs(t - lastT) > 0.35;
    lastT = t;
    mouseS.lerp(mouse, 1 - Math.exp(-dt * 3));
    if (!focus) orbitTime += dt * (hovered ? 0.08 : 1);
    floorMat.uniforms.uTime.value = now;
    orbMat.uniforms.uTime.value = now;

    /* camera */
    cameraAt(t);
    const mf = mobile ? lerp(1, 1.9, clamp((0.9 - aspect) / 0.45)) : 1;
    const wide = t < 1.95 ? 0.35 : t < 3 ? 1 : t < 4 ? 0.55 : t < 6 ? 0.8 : 0.7;
    v1.copy(camPos).sub(camLook).multiplyScalar(1 + (mf - 1) * wide);
    camPos.copy(camLook).add(v1);
    // keep fog behind the subject, however far back the camera sits
    const dist = v1.length();
    scene.fog.near = Math.max(26, dist + 10);
    scene.fog.far = scene.fog.near + 34;
    if (focus) {
      const fp = focus.phone;
      fp.getWorldPosition(v2);
      v3.set(0, 0, 1).applyQuaternion(fp.getWorldQuaternion(qa)).multiplyScalar(mobile ? 5 : 3.6);
      const into = easeOutCubic(clamp((now - focus.start) / 0.9));
      const out = focus.release ? easeOutCubic(clamp((now - focus.release) / 0.8)) : 0;
      const k = into * (1 - out);
      camPos.lerp(v1.copy(v2).add(v3).add(V(mobile ? 0 : -0.9, 0, 0)), k);
      camLook.lerp(v2.clone().add(V(mobile ? 0 : -0.9, 0, 0)), k);
      if (focus.release && out >= 1) focus = null;
    }
    camera.position.copy(camPos);
    // parallax: nudge in the camera's own right/up axes
    camera.lookAt(camLook);
    v1.set(1, 0, 0).applyQuaternion(camera.quaternion).multiplyScalar(mouseS.x * 0.35);
    v2.set(0, 1, 0).applyQuaternion(camera.quaternion).multiplyScalar(mouseS.y * 0.22);
    camera.position.add(v1).add(v2);
    if (shake > 0.001) {
      camera.position.x += (Math.random() - 0.5) * shake;
      camera.position.y += (Math.random() - 0.5) * shake;
      shake *= Math.exp(-dt * 9);
    }
    camera.lookAt(camLook);
    const offx = mobile ? 0 : tableAt(OFFX, t);
    const offy = mobile ? tableAt(OFFY_M, t) : tableAt(OFFY, t);
    camera.setViewOffset(W, H, -offx * W, offy * H, W, H);

    /* master: hero → exploded → pedestal → orbit centre */
    const m = master.userData;
    const e = ss(1.08, 1.4, t) * (1 - ss(1.72, 1.96, t));
    const toPed = ss(1.95, 2.1, t);
    const toCentre = ss(6.05, 6.5, t);
    const heroPos = V(0, 0.05 + Math.sin(now * 0.9) * 0.05, 0);
    const heroRot = new THREE.Euler(0.06 + mouseS.y * -0.12, lerp(-0.42, -0.62, ss(1.0, 1.35, t) * (1 - ss(1.8, 2.0, t))) + mouseS.x * 0.3 + Math.sin(now * 0.5) * 0.04, 0.02);
    const pedPos = V(PED_X, BELT_Y + 0.5 + 1.1, 0.05);
    const pedRot = new THREE.Euler(-0.08, 0.35 + Math.sin(now * 0.7) * 0.05, 0);
    v1.copy(heroPos).lerp(pedPos, toPed);
    v1.y += Math.sin(toPed * Math.PI) * 1.2;
    qa.setFromEuler(heroRot);
    qb.setFromEuler(pedRot);
    master.quaternion.copy(qa).slerp(qb, toPed);
    if (toCentre > 0) {
      v1.lerp(ORBIT_C, toCentre);
      qb.setFromEuler(new THREE.Euler(0, Math.sin(now * 0.4) * 0.3, 0));
      master.quaternion.slerp(qb, toCentre);
    }
    master.position.copy(v1);
    master.scale.setScalar(1 + toCentre * 0.6);
    m.glow.material.opacity = 0.45 + toCentre * 0.5;
    // panels: intro fly-in + explode
    m.pans.forEach((p, i) => {
      const P = PANELS[i];
      const a = clamp((it - introAt[i]) / INTRO_DUR);
      const f = S.reduced ? 1 : easeOutBack(a);
      if (a >= 1 && !landed[i]) {
        landed[i] = true;
        master.getWorldPosition(v2);
        m.pulse = 1;
        hooks.sound('tick');
      }
      const ex = e;
      p.position.set(
        P.cx + INTRO_FROM[i].x * (1 - f) + ex * (0.8 + i * 0.16),
        P.cy + INTRO_FROM[i].y * (1 - f) + ex * (P.cy * 0.3 - 0.05),
        0.056 + INTRO_FROM[i].z * (1 - f) + ex * (0.3 + i * 0.3),
      );
      p.rotation.set(INTRO_ROT[i].x * (1 - f), INTRO_ROT[i].y * (1 - f) + ex * 0.28, INTRO_ROT[i].z * (1 - f));
      p.scale.setScalar(1 + ex * 0.12);
      p.visible = a > 0;
    });
    m.pulse *= Math.exp(-dt * 5);
    m.flash.material.opacity = m.pulse * 0.35;
    // panel labels (projected)
    panelLabels.forEach((el, i) => {
      if (e < 0.05) { if (el.style.opacity !== '0') el.style.opacity = '0'; return; }
      const p = m.pans[i];
      v2.set(PANELS[i].w / 2, 0, 0);
      p.localToWorld(v2);
      v2.project(camera);
      const x = (v2.x * 0.5 + 0.5) * W, y = (-v2.y * 0.5 + 0.5) * H;
      el.style.opacity = String(ss(0.4, 0.9, e));
      el.style.transform = `translate(${x + 16}px, ${y}px) translateY(-50%)`;
    });

    /* conveyor: copies ride to their presses */
    const u2 = t - 2;
    const vBelt = 9 / 0.33;
    const spawn = [0.34, 0.23, 0.12];
    const beltOffset = vBelt * clamp(u2, 0.12, 0.45) + (t > 4 ? 12.6 / 0.33 * clamp(t - 4 - 0.06, 0, 0.33) : 0);
    beltTex.offset.x = -beltOffset / 1.6;
    const thr = [0.5, 0.56, 0.62];
    for (let k = 0; k < 3; k++) {
      const p = copies[k];
      const d = p.userData;
      const s0 = spawn[k];
      const born = ss(s0 - 0.02, s0 + 0.03, u2);
      const x = Math.min(PRESS_X[k], START_X + vBelt * Math.max(0, u2 - s0));
      p.visible = born > 0.001;
      // press state follows scroll: fire when crossing forward, reset backward
      const P = presses[k];
      const want = u2 >= thr[k];
      if (want && !P.stamped) slam(k, now, [BRANDS.nike, BRANDS.apple, BRANDS.commbank][k], !jump && u2 < thr[k] + 0.3);
      if (!want && P.stamped) { P.stamped = false; P.fired = -1; P.pendingSkin = null; skin(p, BLANK); }
      // lift to the showcase, then into orbit in the finale
      const lift = ss(0.7, 0.98, u2);
      placeOnBelt(p, x);
      if (born < 1) { p.position.y += (1 - born) * 0.6; p.position.x = lerp(PED_X + 0.8, x, born); }
      if (lift > 0) {
        const sp = SHOW(k);
        v2.copy(p.position).lerp(sp, easeOutCubic(lift));
        v2.y += Math.sin(lift * Math.PI) * 0.9;
        p.position.copy(v2);
        qb.setFromEuler(new THREE.Euler(0, (k - 1) * -0.12, 0));
        p.quaternion.slerp(qb, ss(0, 0.8, lift));
      }
      // assistant chapter: the copy being spoken to steps forward
      const near = 1 - clamp(Math.abs(aiFocus(t) - PRESS_X[k]) / 1.5);
      const inAI = ss(3.0, 3.1, t) * (1 - ss(3.9, 4.05, t));
      p.position.z += near * inAI * 0.5 - (1 - near) * inAI * 0.9;
      // after the assistant chapter the copies go up to the rack, out of the way
      const rack = ss(3.94, 4.16, t);
      if (rack > 0) { p.position.y += easeOutCubic(rack) * 4.6; p.position.z -= rack * 1.6; }
      d.glow.material.opacity = 0.25 + near * inAI * 0.5 + d.hover * 0.5;
      // share + finale
      d.clear = 1;
      finaleFly(p, t, k * 0.02);
      p.scale.setScalar(Math.max(0.001, (0.001 + born * 0.999) * (1 + d.hover * 0.08 + d.pulse * 0.06) * d.clear));
    }

    // Visitor copy: rides out in chapter 4 and waits under the fourth press
    {
      const p = copies[3];
      const d = p.userData;
      const u4 = t - 4;
      const born = ss(0.02, 0.07, u4);
      const x = Math.min(PRESS_X[3], START_X + (12.6 / 0.33) * Math.max(0, u4 - 0.06));
      p.visible = born > 0.001 || t > 5;
      placeOnBelt(p, t > 5 ? PRESS_X[3] : x);
      if (born < 1 && t < 5) { p.position.y += (1 - born) * 0.6; p.position.x = lerp(PED_X + 0.8, x, born); }
      const P = presses[3];
      const atPress = x >= PRESS_X[3] - 0.01 || t > 5;
      if (visitorQueued && atPress && t > 4.2 && (P.fired < 0 || now - P.fired > 0.9)) {
        slam(3, now, visitorQueued, true);
        setPressBrand(3, visitorQueued);
        visitorQueued = null;
      }
      d.glow.material.opacity = 0.3 + d.hover * 0.5;
      d.clear = 1;
      finaleFly(p, t, 0.08);
      p.scale.setScalar(Math.max(0.001, (t > 5 ? 1 : 0.001 + born * 0.999) * (1 + d.hover * 0.08 + d.pulse * 0.06) * d.clear));
    }

    /* presses: head motion, impact effects */
    presses.forEach((P, k) => {
      let hy = HEAD_REST;
      if (P.fired > 0) {
        const tt = now - P.fired;
        if (tt < 0.14) hy = lerp(HEAD_REST, HEAD_HIT, easeInCubic(tt / 0.14));
        else if (tt < 0.32) hy = HEAD_HIT;
        else if (tt < 0.9) hy = lerp(HEAD_HIT, HEAD_REST, easeOutCubic((tt - 0.32) / 0.58));
        if (tt >= 0.14 && !P.hit) {
          P.hit = true;
          if (P.pendingSkin) skin(copies[k], P.pendingSkin);
          const col = P.lampCol.getStyle();
          v2.set(PRESS_X[k], BELT_Y + 0.1, 0);
          burst(v2, col, 170, 1);
          shock(v2, col);
          shake = Math.max(shake, 0.22);
          copies[k].userData.pulse = 1;
          hooks.sound('thunk', k);
          hooks.onStamp(P.pendingSkin, k);
        }
        if (tt > 1) P.fired = -1;
      }
      if (P.stamped && P.fired < 0 && !P.hit) { P.hit = true; if (P.pendingSkin) skin(copies[k], P.pendingSkin); }
      P.head.position.y = hy;
      P.piston.position.y = (3.9 + hy) / 2;
      P.piston.scale.y = Math.max(0.01, 3.9 - hy);
      const glowOn = P.fired > 0 ? 1 - clamp((now - P.fired - 0.14) / 0.8) : 0;
      P.halo.material.opacity = 0.45 + glowOn * 0.9 + (k === 3 && !P.stamped ? 0.35 * (0.5 + 0.5 * Math.sin(now * 5)) : 0);
      P.halo.scale.setScalar(1.2 + glowOn * 1.8);
    });
    copies.forEach((p) => {
      const d = p.userData;
      d.pulse *= Math.exp(-dt * 4);
      d.flash.material.opacity = d.pulse * 0.9;
    });

    /* orb: circles the master, visits the showcase, greets the visitor */
    {
      const inAI = ss(2.96, 3.08, t) * (1 - ss(3.92, 4.02, t));
      const heroOrb = 0; // the assistant only lives inside a client's app
      const vis = copies[3].userData.br !== BLANK && t > 4.05 && t < 5.02 ? 1 : 0;
      let scale = 0;
      if (heroOrb > 0) {
        master.getWorldPosition(v2);
        v2.add(V(Math.cos(now * 0.8) * 0.95, 0.9 + Math.sin(now * 1.6) * 0.12, Math.sin(now * 0.8) * 0.6 + 0.2));
        orb.position.copy(v2);
        scale = heroOrb * ss(2.0, 2.6, it);
      }
      if (inAI > 0) {
        // sits on the right edge of the app, by its "Ask AI" pill
        const fx = aiFocus(t);
        const f = clamp((fx - PRESS_X[0]) / 3, 0, 1.999);
        const k0 = Math.floor(f), fr = f - k0;
        copies[k0].localToWorld(v2.copy(ASSIST_AT));
        copies[Math.min(2, k0 + 1)].localToWorld(v3.copy(ASSIST_AT));
        v2.lerp(v3, fr);
        v2.y += Math.sin(fr * Math.PI) * 0.7 + Math.sin(now * 1.7) * 0.03;
        orb.position.copy(v2);
        scale = inAI;
      }
      if (vis) {
        copies[3].localToWorld(v2.copy(ASSIST_AT));
        v2.y += 0.25 + Math.sin(now * 1.7) * 0.03;
        orb.position.copy(v2);
        scale = Math.max(scale, ss(4.05, 4.12, t) * (1 - ss(4.95, 5.02, t)));
      }
      orb.scale.setScalar(Math.max(0.001, scale));
      orb.visible = scale > 0.01;
      // bubble: brand the orb is speaking for
      let br = null;
      if (inAI > 0.5) {
        const fx = aiFocus(t);
        const k = fx < -1.5 ? 0 : fx < 1.5 ? 1 : 2;
        br = copies[k].userData.br;
        if (br === BLANK) br = null;
      } else if (vis) br = copies[3].userData.br;
      setBubble(br, now);
      typeBubble(now);
      const bubOn = !!br && scale > 0.5;
      bubble.classList.toggle('on', bubOn);
      if (bubOn) {
        v2.copy(orb.position).project(camera);
        let x = (v2.x * 0.5 + 0.5) * W, y = (-v2.y * 0.5 + 0.5) * H;
        const bw = bubble.offsetWidth || 320;
        if (mobile) { x = Math.min(Math.max(12, x - bw / 2), W - bw - 12); y = y + 30; }
        else if (x + 30 + bw > W - 90) x = x - bw - 30; else x = x + 30;
        bubble.style.transform = `translate(${x}px, ${y}px) translateY(-22px)`;
      }
    }

    /* share: one phone flies to camera */
    {
      const sp = ss(5.0, 5.28, t) * (1 - ss(5.86, 6.1, t));
      const br = hooks.shareBrand();
      if (shareP.userData.br !== br) skin(shareP, br);
      const src = br === copies[3].userData.br ? copies[3] : copies[2];
      shareP.visible = sp > 0.001;
      src.userData.hideForShare = sp > 0.001;
      if (sp > 0.001) {
        src.getWorldPosition(v2);
        src.getWorldQuaternion(qa);
        v3.set(mobile ? 0 : -0.15, mobile ? -1.05 : -0.02, mobile ? -6.2 : -4.6).applyMatrix4(camera.matrixWorld);
        qb.copy(camera.quaternion).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05, -0.28 + Math.sin(now * 0.8) * 0.08 + mouseS.x * 0.2, 0.04)));
        const k = easeOutCubic(sp);
        shareP.position.copy(v2).lerp(v3, k);
        shareP.position.y += Math.sin(k * Math.PI) * 0.6;
        shareP.quaternion.copy(qa).slerp(qb, k);
        shareP.userData.glow.material.opacity = 0.35 + k * 0.4;
      }
      src.visible = src.visible && !(sp > 0.02);
    }

    /* finale: the orbit */
    orbiters.forEach((p, i) => {
      finaleFly(p, t, 0.06 + i * 0.012, true);
      const d = p.userData;
      d.glow.material.opacity = 0.2 + d.hover * 0.6;
    });

    /* hover */
    let hit = null;
    if (!pointerOnUI && !focus && ndc.x > -2) {
      ray.setFromCamera(ndc, camera);
      const bodies = [];
      [...copies, ...orbiters].forEach((p) => { if (p.visible && p.userData.br !== BLANK && p.scale.x > 0.4) bodies.push(p.userData.body); });
      const hits = ray.intersectObjects(bodies, false);
      if (hits.length) hit = hits[0].object.userData.phone;
    }
    if (hit !== hovered) {
      hovered = hit;
      document.body.classList.toggle('hovering', !!hit);
      if (hit) {
        tip.querySelector('b').textContent = hit.userData.br.name;
        tip.querySelector('span').textContent = 'Click to preview on a phone';
      }
      tip.classList.toggle('on', !!hit);
    }
    [...copies, ...orbiters].forEach((p) => { p.userData.hover += ((p === hovered ? 1 : 0) - p.userData.hover) * (1 - Math.exp(-dt * 10)); });

    /* effects */
    updateSparks(dt);
    rings.forEach((r) => {
      if (!r.m.visible) return;
      r.t += dt;
      const k = r.t / 0.6;
      r.m.scale.setScalar(0.6 + easeOutCubic(clamp(k)) * 3.2);
      r.m.material.opacity = (1 - clamp(k)) * 0.9;
      if (k >= 1) r.m.visible = false;
    });
    line.visible = t > 1.7 && t < 6.9;
    floor.visible = t > 1.6;
    hooks.frame(t, now);

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  // Finale flight: from wherever a phone is to its orbit slot.
  function finaleFly(p, t, delay, fromEnd = false) {
    const f = easeOutCubic(ss(6.02 + delay, 6.42 + delay, t));
    if (fromEnd) {
      p.visible = f > 0.001;
      if (!p.visible) return;
      v2.set(12.5, BELT_Y + 0.1, 0);
      p.quaternion.copy(FLAT);
    } else {
      if (f <= 0) return;
      v2.copy(p.position);
    }
    slotPose(p.userData.slot, v3);
    // keep the orbit clear of the finale headline: phones that would pass
    // over the copy shrink away behind it and grow back as they leave
    let clear = 1;
    if (finaleTop > 0) {
      _v.copy(v3).project(camera);
      const sy = (-_v.y * 0.5 + 0.5) * H, sx = (_v.x * 0.5 + 0.5) * W;
      const inX = Math.abs(sx - W / 2) < finaleHalfW + 70;
      clear = inX ? 1 - ss(finaleTop - 150, finaleTop - 40, sy) : 1;
    }
    const arc = Math.sin(f * Math.PI) * 2.5;
    p.position.copy(v2).lerp(v3, f);
    p.position.y += arc;
    // face the camera, with a little life
    _m.lookAt(camera.position, v3, camera.up);
    qb.setFromRotationMatrix(_m);
    _q.setFromEuler(_e.set(Math.sin(orbitTime * 0.7 + p.userData.slot) * 0.12, Math.sin(orbitTime * 0.5 + p.userData.slot * 1.7) * 0.25, 0));
    qb.multiply(_q);
    p.quaternion.slerp(qb, f);
    if (fromEnd) p.scale.setScalar(Math.max(0.001, (0.2 + 0.8 * f) * (1 + p.userData.hover * 0.1) * lerp(1, clear, f)));
    p.userData.clear = lerp(1, clear, f);
    if (clear < 0.3 && f > 0.9) p.visible = false;
  }

  // Draw once fonts are in so canvas text uses Unbounded / Geist Mono.
  requestAnimationFrame(frame);
  return api;
}
