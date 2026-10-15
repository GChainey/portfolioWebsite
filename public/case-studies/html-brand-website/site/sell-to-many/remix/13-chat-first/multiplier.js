/* Remix 13/22 — the multiplier (from remix 03), as one section.
   One Nike app, then "Sell it again": the wall doubles 1 → 2 → 4 … 32, and
   every copy lands in a different client's brand. The ticker counts the
   clients, what one build has earned, and build hours against building
   each one from scratch. Plays once when it's in view; the button steps it
   by hand and starts again at 32. Reduced motion: shows the full wall.

   Only shown by layouts that ask for it (arrange.js, ?layout=mvp-multi). */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const section = $('multiplier');
  if (!section) return;
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const fmt = (n) => Math.round(n).toLocaleString('en-AU');

  const PRICE = 6000;  // per client, as the calculator
  const BUILD = 60;    // hours to build it once
  const EACH = 1;      // hours for each new client
  const MAX = 32;

  /* [name, brand colour, the line their campaign email leads with] */
  const CLIENTS = [
    ['Nike', '#FA5400', 'Pegasus 41 is here. Go.'],
    ['Apple', '#1D1D1F', 'Say hello to the new iPhone.'],
    ['CommBank', '#FFCC00', 'Your Yello rewards are here.'],
    ['Qantas', '#E40000', 'Sydney to Dallas, from 6 October.'],
    ['Saltbush Coffee', '#6B3E26', 'Your first flat white of spring is on us.'],
    ['Harbour Line Dental', '#0E7C86', 'Six months since your last clean. Book in.'],
    ['Kestrel Surf', '#00A6D6', 'Swell’s up this weekend. So is the sale.'],
    ['Ironbark Legal', '#1F3A2E', 'Buying your first home? Here’s what to check.'],
    ['Pip & Pantry', '#F2B8C6', 'Lunchboxes, sorted for the whole term.'],
    ['Northgate Realty', '#C8102E', 'Three new listings in your street this week.'],
    ['Moonah Pilates', '#9A8CFF', 'Your reformer spot is saved for Thursday.'],
    ['Copperline Electrical', '#D9731F', 'Solar rebates close 30 June. Let’s get you in.'],
    ['Blue Heeler Vets', '#2350A5', 'Tick season is here. Is Max protected?'],
    ['Fern & Fig', '#2F7D4F', 'Mother’s Day orders close Thursday.'],
    ['Rowdy Brewing', '#FFB000', 'New hazy IPA. Tap room, Friday.'],
    ['Southerly Air', '#5B2C83', 'Fly south for winter. Hobart from $89.'],
    ['Lumen Optometry', '#00B2A9', 'Your eyes called. They’d like a check-up.'],
    ['Grove Grocer', '#7AB800', 'Seasonal box: mandarins, leeks and more.'],
    ['Nimbus Super', '#3C1E73', 'Your super, explained on one page.'],
    ['Paperbark Books', '#B5462E', 'Our staff picks for the long weekend.'],
    ['Brightside Physio', '#FF7AA2', 'Sore back after gardening? We have a spot.'],
    ['Cinder Pizza', '#D7261E', 'Two-for-one Tuesdays are back.'],
    ['Quokka Kids', '#FFC629', 'School holiday camps: 12 spots left.'],
    ['Meridian Accounting', '#20394D', 'Tax time, minus the shoebox of receipts.'],
    ['Velo Cycles', '#00C389', 'Service your bike before the spring rides.'],
    ['Olive & Oak', '#6E7F3A', 'Winter textures for every room.'],
    ['Clearwater Pools', '#00A3E0', 'Summer’s close. Is your pool ready?'],
    ['Summit Insurance', '#0033A0', 'Storm season: check your cover in two minutes.'],
    ['Dusk Wine Bar', '#3B0D2E', 'New Barossa reds on the list.'],
    ['Kiln Studio', '#E2725B', 'Wheel classes for beginners. Six weeks.'],
    ['Coastal Credit Union', '#00857C', 'A better rate on your savings, today.'],
    ['Sprout Childcare', '#62BB46', 'Enrolments open for 2027.'],
  ];

  function lum(hex) {
    const n = parseInt(hex.slice(1), 16);
    const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }
  const inkFor = (hex) => (lum(hex) > 0.42 ? '#16130F' : '#FFFFFF');
  const initials = (name) => name.replace(/&/g, ' ').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  const wall = $('mxWall');
  const go = $('mxGo');
  const goN = $('mxGoN');

  wall.innerHTML = CLIENTS.slice(0, MAX).map(([name, c, line], i) => `
    <div class="mx-card" data-i="${i}" style="--c:${c};--c-on:${inkFor(c)}">
      <div class="mx-hd"><span class="mx-mk">${esc(initials(name))}</span><b>${esc(name)}</b>${i === 0 ? '<em>Original</em>' : ''}</div>
      <p>${esc(line)}</p>
      <div class="mx-steps"><i class="on"></i><i></i><i></i><i></i></div>
    </div>`).join('');
  const cards = [...wall.children];

  /* Merged with the calculator (remix 22): when the calculator's own
     section is hidden, its sliders and results move in under the wall. The
     "Clients you sell it to" slider becomes the count (capped at the wall's
     32), "Sell it again" doubles it, and the calculator does the maths, so
     the ticker steps aside. Put the calculator section back and everything
     returns to where it was. */
  const calcBox = document.querySelector('.sg-calc-box');
  const calcHome = $('calculator');
  const slot = $('mxCalc');
  const slider = $('ciClients');
  const ticker = section.querySelector('.mx-ticker');
  const sub = section.querySelector('.mx-head .sg-sub');
  const SUB = sub.textContent;
  const sliderMax = slider ? slider.max : null;
  let merged = false;
  function place() {
    const want = !!(calcBox && calcHome && calcHome.hidden && !section.hidden);
    if (want === merged) return;
    merged = want;
    if (merged) {
      slot.appendChild(calcBox);
      slider.max = MAX;
      sub.textContent = 'Move the sliders, or sell it again. Each new client is the same four-step app in their brand, and about an hour of your time.';
    } else {
      calcHome.appendChild(calcBox);
      slider.max = sliderMax;
      sub.textContent = SUB;
    }
    ticker.hidden = merged;
    slot.hidden = !merged;
    slider.dispatchEvent(new Event('input', { bubbles: true })); // redraw the slider fill for its new range
    set(merged ? Math.min(+slider.value, MAX) : n || 1, false);
  }

  let n = 0;
  function show(count, animate) {
    cards.forEach((el, i) => {
      const on = i < count;
      if (on && !el.classList.contains('in')) {
        el.style.setProperty('--d', animate ? `${Math.min(i - n, 16) * 22}ms` : '0ms');
        el.classList.add('in');
      } else if (!on) el.classList.remove('in');
    });
    n = count;
    $('mxClients').textContent = fmt(count);
    $('mxClientsK').textContent = count === 1 ? 'client' : 'clients';
    $('mxEarned').textContent = '$' + fmt(count * PRICE);
    $('mxScratch').textContent = fmt(count * BUILD);
    $('mxHours').textContent = fmt(BUILD + (count - 1) * EACH);
    section.classList.toggle('mx-many', count > 1);
    const done = count >= MAX;
    go.firstChild.textContent = done ? 'Start again ' : 'Sell it again ';
    goN.textContent = done ? '↺' : '×2';
  }
  // Set the count: through the slider when merged (so the calculator follows), directly otherwise.
  function set(count, animate) {
    if (merged && +slider.value !== count) {
      slider.value = count;
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    }
    show(count, animate);
  }
  function step() { set(n >= MAX ? 1 : Math.min(MAX, n * 2), true); }
  if (slider) slider.addEventListener('input', () => { if (merged) show(Math.min(+slider.value, MAX), true); });

  let timer = 0;
  function auto() {
    clearInterval(timer);
    set(1, false);
    timer = setInterval(() => { if (n >= MAX) { clearInterval(timer); return; } step(); }, 750);
  }
  go.addEventListener('click', () => { clearInterval(timer); step(); });
  if (slider) slider.addEventListener('pointerdown', () => clearInterval(timer));

  slot.hidden = true;
  place();
  addEventListener('arrange:change', place);
  if (!merged) show(REDUCED ? MAX : 1, false);
  else if (REDUCED) set(MAX, false);
  if (!REDUCED) {
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { io.disconnect(); setTimeout(auto, 400); }
    }, { threshold: 0.35 });
    io.observe(wall);
  }
})();
