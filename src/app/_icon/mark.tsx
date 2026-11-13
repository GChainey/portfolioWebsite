// The site mark: G and C built from stacked blocks on a dark tile, after Conductor's app icon.
// Shared by icon.tsx (tab) and apple-icon.tsx (home screen). Rendered by next/og, so plain inline styles only.

// One string per row; '#' is a block. Neighbouring blocks in a row merge into one bar.
const GLYPHS = {
  G: ['####', '#...', '#.##', '#..#', '####'],
  C: ['####', '#...', '#...', '#...', '####'],
}
const ROWS = 5
const LETTER_GAP = 1 // empty columns between the letters

type Bar = { row: number; col: number; span: number }

function bars(): { list: Bar[]; cols: number } {
  const list: Bar[] = []
  let offset = 0
  for (const glyph of [GLYPHS.G, GLYPHS.C]) {
    glyph.forEach((line, row) => {
      let start = -1
      for (let c = 0; c <= line.length; c++) {
        if (line[c] === '#' && start < 0) start = c
        if (line[c] !== '#' && start >= 0) {
          list.push({ row, col: offset + start, span: c - start })
          start = -1
        }
      }
    })
    offset += glyph[0].length + LETTER_GAP
  }
  return { list, cols: offset - LETTER_GAP }
}

export function Mark({ size, rounded }: { size: number; rounded: boolean }) {
  const { list, cols } = bars()
  // Grid fills ~70% of the tile's width; blocks are taller than wide so the pair sits near-square
  const cellW = (size * 0.7) / cols
  const cellH = cellW * 1.35
  const gap = cellW * 0.24
  const gridW = cols * cellW
  const gridH = ROWS * cellH
  const left = (size - gridW) / 2
  const top = (size - gridH) / 2
  const r = cellW * 0.22

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        position: 'relative',
        borderRadius: rounded ? size * 0.225 : 0,
        background: 'linear-gradient(180deg, #2b2b2e 0%, #161618 100%)',
        boxShadow: rounded ? `inset 0 0 0 ${Math.max(1, size / 64)}px rgba(255,255,255,0.08)` : 'none',
      }}
    >
      {list.map((b, i) => {
        // The bottom row sits back a shade, as on Conductor's mark
        const last = b.row === ROWS - 1
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: left + b.col * cellW + gap / 2,
              top: top + b.row * cellH + gap / 2,
              width: b.span * cellW - gap,
              height: cellH - gap,
              borderRadius: r,
              background: last
                ? 'linear-gradient(180deg, #c9c9cc 0%, #9a9a9e 100%)'
                : 'linear-gradient(180deg, #ffffff 0%, #dcdce0 100%)',
            }}
          />
        )
      })}
    </div>
  )
}
