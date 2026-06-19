import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: '#0A0A0B',
      },
    },
  },
  plugins: [],
} satisfies Config
