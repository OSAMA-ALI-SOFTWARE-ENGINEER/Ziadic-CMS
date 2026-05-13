import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '992px',
      xl: '1280px',
      '2xl': '1440px',
    },
    extend: {
      colors: {
        admin: {
          primary: '#e11a1d',
          bg: '#f7f7fb',
          panel: '#ffffff',
          ink: '#1f2937',
          muted: '#6b7280',
          border: '#e5e7eb',
        },
      },
      boxShadow: {
        panel: '0 16px 40px rgb(15 23 42 / 8%)',
      },
    },
  },
} satisfies Config
