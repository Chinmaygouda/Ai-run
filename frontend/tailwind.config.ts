import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: '#0A0A0B',
        border: 'var(--border, #e5e7eb)',
        background: 'var(--background, #ffffff)',
        foreground: 'var(--foreground, #000000)',
        muted: 'var(--muted, #f3f4f6)',
        'muted-foreground': 'var(--muted-foreground, #6b7280)',
        accent: 'var(--accent, #6366f1)',
      },
    },
  },
  plugins: [],
} satisfies Config
