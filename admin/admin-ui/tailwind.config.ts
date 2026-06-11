import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#fbbf24',
        ink: '#1f2937',
      },
    },
  },
  plugins: [],
} satisfies Config
