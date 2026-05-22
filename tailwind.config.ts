import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:      '#0D0D1A',
        card:    '#16213E',
        'card-2':'#0F3460',
        cyan:    '#00FFFF',
        lime:    '#39FF14',
        violet:  '#BB86FC',
        border:  '#333366',
        muted:   '#E0E0E0',
        dim:     '#888899',
      },
      fontFamily: {
        mono: ['Fira Code', 'monospace'],
        sans: ['Fira Sans', 'sans-serif'],
      },
      boxShadow: {
        cyan:   '0 0 16px rgba(0,255,255,0.25)',
        lime:   '0 0 16px rgba(57,255,20,0.25)',
        violet: '0 0 16px rgba(187,134,252,0.25)',
      },
    },
  },
  plugins: [],
}
export default config
