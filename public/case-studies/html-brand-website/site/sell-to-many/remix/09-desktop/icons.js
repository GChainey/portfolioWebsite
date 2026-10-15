/* EAI OS — the icon set. Drawn by hand in SVG: flat, warm, a little
   hardware-ish. Every icon is a 52×52 tile. */

const INK = '#1B1B19', PAPER = '#F4F1EA', CHROME = '#D3CCBD', SIGNAL = '#E4322B', SAGE = '#B3BDA3', SKY = '#AFBCC8', GRAPH = '#2B2A27';
const tile = (fill, inner, stroke) =>
  `<svg viewBox="0 0 52 52" aria-hidden="true"><rect x="1" y="1" width="50" height="50" rx="13" fill="${fill}"${stroke ? ` stroke="${INK}" stroke-width="1.5"` : ''}/>${inner}</svg>`;

export const ICONS = {
  // Four pads, one lit. The four-step rule, as a logo.
  builder: tile(INK,
    `<rect x="13" y="13" width="11.5" height="11.5" rx="3" fill="${PAPER}"/><rect x="27.5" y="13" width="11.5" height="11.5" rx="3" fill="${PAPER}"/>` +
    `<rect x="13" y="27.5" width="11.5" height="11.5" rx="3" fill="${PAPER}"/><rect x="27.5" y="27.5" width="11.5" height="11.5" rx="3" fill="${SIGNAL}"/>`),
  // A folder with three clients' colours on the tab.
  clients: tile(CHROME,
    `<path d="M11 18.5a3 3 0 0 1 3-3h8l3 3h13a3 3 0 0 1 3 3V36a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3Z" fill="${PAPER}" stroke="${INK}" stroke-width="1.6"/>` +
    `<path d="M11 23h30" stroke="${INK}" stroke-width="1.6"/><circle cx="18" cy="31" r="3" fill="#FA5400"/><circle cx="26" cy="31" r="3" fill="#0071E3"/><circle cx="34" cy="31" r="3" fill="#FFCC00" stroke="${INK}" stroke-width=".8"/>`),
  phone: tile(SAGE,
    `<rect x="17" y="9.5" width="18" height="33" rx="4.5" fill="${PAPER}" stroke="${INK}" stroke-width="1.6"/><rect x="22.5" y="12.5" width="7" height="2.2" rx="1.1" fill="${INK}"/>` +
    `<rect x="20.5" y="19" width="4.5" height="4.5" fill="${INK}"/><rect x="27" y="19" width="4.5" height="4.5" fill="${INK}"/><rect x="20.5" y="25.5" width="4.5" height="4.5" fill="${INK}"/><rect x="27.5" y="26" width="3.5" height="3.5" fill="${SIGNAL}"/>` +
    `<rect x="23" y="36.5" width="6" height="1.6" rx=".8" fill="${INK}"/>`),
  calc: tile(GRAPH,
    `<rect x="11" y="10" width="30" height="11" rx="2.5" fill="#12110F"/><text x="38" y="18.6" text-anchor="end" font-family="Geist Mono, monospace" font-size="8" font-weight="600" fill="${SIGNAL}">×3</text>` +
    [0, 1, 2].map((c) => [0, 1].map((r) => `<circle cx="${16 + c * 10}" cy="${29 + r * 8.5}" r="3.2" fill="${c === 2 && r === 1 ? SIGNAL : PAPER}"/>`).join('')).join('')),
  notes: tile(PAPER,
    `<path d="M17 10v32" stroke="${SIGNAL}" stroke-width="1.4"/>` +
    [16, 22, 28, 34, 40].map((y) => `<path d="M11 ${y}h30" stroke="#CBC4B5" stroke-width="1.2"/>`).join('') +
    `<text x="31" y="35" text-anchor="middle" font-family="Geist, sans-serif" font-size="20" font-weight="700" fill="${INK}">4</text>`, true),
  trash: tile(CHROME,
    `<rect x="15" y="15" width="22" height="26" rx="3" fill="${PAPER}" stroke="${INK}" stroke-width="1.6"/><path d="M12 15h28" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/><path d="M22 11.5h8" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>` +
    [20.5, 24.5, 28.5, 32.5].map((x) => `<path d="M${x} 20v16" stroke="${INK}" stroke-width="1.3" stroke-linecap="round"/>`).join('')),
  readme: tile(PAPER,
    `<circle cx="26" cy="26" r="12" fill="none" stroke="${INK}" stroke-width="1.8"/><circle cx="26" cy="20.5" r="1.7" fill="${SIGNAL}"/><path d="M26 25v8" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`, true),
  about: tile(SKY,
    `<circle cx="26" cy="26" r="13" fill="${PAPER}" stroke="${INK}" stroke-width="1.6"/>` +
    [0, 1].map((r) => [0, 1].map((c) => `<rect x="${20 + c * 7}" y="${20 + r * 7}" width="5" height="5" rx="1.2" fill="${r && c ? SIGNAL : INK}"/>`).join('')).join('')),
  keys: tile(SKY,
    `<rect x="10" y="17" width="32" height="19" rx="3" fill="${PAPER}" stroke="${INK}" stroke-width="1.6"/>` +
    [0, 1, 2, 3].map((c) => `<rect x="${14 + c * 6.5}" y="21" width="4" height="4" rx="1" fill="${INK}"/>`).join('') +
    `<rect x="17" y="28.5" width="18" height="3.5" rx="1" fill="${SIGNAL}"/>`),
  alert: tile(SIGNAL,
    `<path d="M26 13 40 38H12Z" fill="${PAPER}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M26 22v8" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/><circle cx="26" cy="33.5" r="1.5" fill="${INK}"/>`),
};

// A client's folder, painted in their colours.
export function folderIcon(br) {
  const fill = br.b || '#888';
  return `<svg viewBox="0 0 64 52" aria-hidden="true"><path d="M3 9a4 4 0 0 1 4-4h14l4 4.5h32a4 4 0 0 1 4 4V45a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" fill="${fill}" stroke="${INK}" stroke-width="1.6"/>` +
    `<path d="M3 16h58" stroke="${INK}" stroke-width="1.6"/></svg>`;
}

// A published client app, as a home-screen tile (mobile).
export function clientTile(br) {
  return `<span class="ct" style="--cb:${br.head};--co:${br.headOn}">${br.logo ? `<span class="ct-logo${br.logoClass ? ' ' + br.logoClass : ''}">${br.logo}</span>` : `<b>${br.name[0]}</b>`}</span>`;
}

export const EAI_MARK = `<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="2" width="7" height="7" rx="1.8" fill="currentColor"/><rect x="11" y="2" width="7" height="7" rx="1.8" fill="currentColor"/><rect x="2" y="11" width="7" height="7" rx="1.8" fill="currentColor"/><rect x="11" y="11" width="7" height="7" rx="1.8" fill="${SIGNAL}"/></svg>`;
