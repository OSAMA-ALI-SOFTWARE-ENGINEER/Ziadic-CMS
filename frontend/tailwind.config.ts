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
      '3xl': '1920px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#e11a1d',
          80: '#e11a1dcc',
        },
        cream: '#fff0de',
        pink: '#ff939a',
        yellow: '#ffd15c',
        coral: '#ff854b',
        green: '#43a574',
        ink: '#031634',
        border: '#5328221a',
        white80: '#fffc',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Marcellus', 'serif'],
      },
      maxWidth: {
        container: '1350px',
      },
      borderRadius: {
        zaidic: '8px',
        panel: '24px',
      },
      boxShadow: {
        nav: '0 20px 50px rgb(83 40 34 / 8%)',
      },
    },
  },
} satisfies Config
