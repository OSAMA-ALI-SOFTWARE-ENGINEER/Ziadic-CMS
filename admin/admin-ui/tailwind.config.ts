import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#e11a1d',
        cream: '#fff0de',
        pink: '#f4a0a8',
        yellow: '#ffd28f',
        coral: '#ff6b5b',
        green: '#2ea99e',
        ink: '#0d0d0d',
        border: '#e8dcc8',
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Marcellus"', 'serif'],
      },
      screens: {
        xs: '480px',
        sm: '640px',
        md: '768px',
        lg: '992px',
        xl: '1280px',
        '2xl': '1440px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
} satisfies Config
