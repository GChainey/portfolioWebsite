/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Inlines @import (typeset.css) so Tailwind sees its @layer blocks in the same pass
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config
