/* Remix 12 — the phone sugar hit and the calculator.
   The phone shows the real client app (../../app.html, the same view a client
   gets when they scan the code), tilted in 3D and following the cursor. The
   calculator works out what one build earns against building each client
   from scratch. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- on their phone ---------- */
  const NAMES = { nike: 'Nike', apple: 'Apple', commbank: 'CommBank' };
  const appUrl = (c) => new URL(`../../app.html?c=${c}`, location.href).toString();
  let client = 'nike';

  function drawQr() {
    if (!window.QRCode) return;
    QRCode.toCanvas($('sgQr'), appUrl(client), { width: 148, margin: 0, color: { dark: '#111111', light: '#ffffff' } }, () => {});
  }
  function show(c) {
    client = c;
    $('sgFrame').src = `../../app.html?c=${c}`;
    $('sgQrLink').href = `../../app.html?c=${c}`;
    $('sgQrName').textContent = NAMES[c];
    $('sgQrUrl').textContent = `eai.app/${c}/campaign-email`;
    document.querySelectorAll('#sgSeg button').forEach((b) => {
      const on = b.dataset.c === c;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', on);
    });
    drawQr();
  }
  $('sgSeg').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-c]');
    if (b) show(b.dataset.c);
  });
  $('sgCopy').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    try { await navigator.clipboard.writeText(appUrl(client)); btn.textContent = 'Copied'; }
    catch (err) { btn.textContent = 'Press ⌘C'; }
    setTimeout(() => { btn.textContent = 'Copy'; }, 1600);
  });
  drawQr();

  // The phone leans toward the cursor.
  const stage = $('sgStage');
  const device = $('sgDevice');
  const REST = 'rotateY(-14deg) rotateX(4deg) rotateZ(1.5deg)';
  if (!reduced && matchMedia('(hover: hover) and (min-width: 761px)').matches) {
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      device.style.transform = `rotateY(${-14 + x * 16}deg) rotateX(${4 - y * 10}deg) rotateZ(1.5deg)`;
    });
    stage.addEventListener('pointerleave', () => { device.style.transform = REST; });
  }

  /* ---------- the maths ---------- */
  const RATE = 150;          // your time, $ per hour
  const PER_CLIENT = 1;      // hours to name, check and share each new client
  const money = (n) => '$' + Math.round(n).toLocaleString('en-AU');
  const num = (n) => Math.round(n).toLocaleString('en-AU');

  // Numbers roll to their new value.
  const shown = new Map();
  function roll(el, to, fmt) {
    const from = shown.has(el) ? shown.get(el) : to;
    shown.set(el, to);
    if (reduced || from === to) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), d = 450;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / d);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (k < 1 && shown.get(el) === to) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const inputs = ['ciHours', 'ciClients', 'ciPrice'].map($);
  function calc() {
    const hours = +$('ciHours').value;
    const clients = +$('ciClients').value;
    const price = +$('ciPrice').value;
    inputs.forEach((i) => i.style.setProperty('--p', `${((i.value - i.min) / (i.max - i.min)) * 100}%`));
    $('cvHours').textContent = `${hours} hrs`;
    $('cvClients').textContent = num(clients);
    $('cvPrice').textContent = money(price);

    const revenue = clients * price;
    const once = hours + clients * PER_CLIENT;      // build once, then an hour per client
    const scratch = clients * hours;                // rebuild it for every client
    const saved = Math.max(0, scratch - once);
    const profit = revenue - once * RATE;           // always less than revenue
    const perHour = revenue / once;

    roll($('coRevenue'), revenue, money);
    $('coScratch').textContent = `${num(scratch)} hrs`;
    $('coOnce').textContent = `${num(once)} hrs`;
    const max = Math.max(scratch, once);
    $('cbScratch').style.width = `${(scratch / max) * 100}%`;
    $('cbOnce').style.width = `${Math.max(2, (once / max) * 100)}%`;
    roll($('coSaved'), saved, num);
    roll($('coProfit'), profit, (n) => (n < 0 ? '−' + money(-n) : money(n)));
    roll($('coRate'), perHour, money);
  }
  inputs.forEach((i) => i.addEventListener('input', calc));
  calc();
})();
