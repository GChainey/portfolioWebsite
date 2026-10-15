/* Remix 20 — the Configurator brand theme (?theme=cfg). Does nothing in the
   other themes. Draws the Configurator lockup (Brand Book v3: modular
   blocks forming a C, the lifted block and the trailing dot in light blue)
   into the header, and the inverted lockup into the footer. */
(function () {
  'use strict';
  if (document.documentElement.dataset.theme !== 'cfg') return;

  const MARK = `<svg viewBox="0 0 90 90" aria-hidden="true">
    <g fill="currentColor" class="cfg-block">
      <rect x="0" y="0" width="22" height="22" rx="6"/><rect x="32" y="0" width="22" height="22" rx="6"/>
      <rect x="0" y="32" width="22" height="22" rx="6"/>
      <rect x="0" y="64" width="22" height="22" rx="6"/><rect x="32" y="64" width="22" height="22" rx="6"/><rect x="64" y="64" width="22" height="22" rx="6"/>
    </g>
    <rect x="64" y="0" width="22" height="22" rx="6" fill="#8EDFF9"/>
    <circle cx="75" cy="43" r="5.5" fill="#8EDFF9"/>
  </svg>`;
  const lockup = (cls) => `<span class="cfg-logo ${cls}">${MARK}<span class="cfg-wm"><b>CONFIGURATOR</b><small>BY ENTERPRISE AI</small></span></span>`;

  const brand = document.querySelector('.nav-brand');
  if (brand) {
    brand.insertAdjacentHTML('afterbegin', lockup(''));
    brand.setAttribute('aria-label', 'Configurator by Enterprise AI, back to the top');
  }
  const footMark = document.querySelector('.ps-footer-mark');
  if (footMark) footMark.insertAdjacentHTML('afterend', lockup('cfg-inv cfg-lg'));
  // The brand tagline lives at the close of things (Brand Book v3, "The Brand Tagline").
  const lead = document.querySelector('.ps-footer-lead');
  if (lead) lead.textContent = 'Everything your app needs that you should never have to build twice.';
})();
