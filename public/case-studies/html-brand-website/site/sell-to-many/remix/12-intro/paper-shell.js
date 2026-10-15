/* Remix 06 — Paper shell.
   Concept: the Paper marketing-site design ("Home — Abstracted fill v3") is
   the site shell, pixel-matched from Paper; the existing "Build once. Sell to
   many." live demo is dropped into its placeholder plates. The hero's
   Warp-bordered "Product" plate runs the builder (sell.js: chat builds a
   four-step Campaign email app for Nike, then re-skins it for the next
   client), and the showcase's "Product" plate runs the phone preview / share
   demo (mobile-demo.js). Both demo scripts are loaded unchanged from
   ../../; this file only wires the shell's own small interactions. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);

  // Hero chat: "Build" takes you to the builder demo in the media frame.
  const chat = $('psChat');
  chat.addEventListener('submit', (e) => {
    e.preventDefault();
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    $('psMedia').scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });
  });

  // FAQ search: match listed questions as you type.
  const list = $('psFaqList');
  const items = [...list.querySelectorAll('li')];
  const input = $('psFaqInput');
  let empty = null;
  function filter() {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    items.forEach((li) => {
      const hit = !q || li.textContent.toLowerCase().includes(q);
      li.hidden = !hit;
      if (hit) shown++;
    });
    if (!shown && !empty) {
      empty = document.createElement('li');
      empty.className = 'ps-faq-empty';
      empty.textContent = 'No listed question matches — we’d retrieve an answer from the knowledge base.';
      list.appendChild(empty);
    } else if (shown && empty) {
      empty.remove();
      empty = null;
    }
  }
  input.addEventListener('input', filter);
  $('psFaqSearch').addEventListener('submit', (e) => { e.preventDefault(); filter(); });
})();
