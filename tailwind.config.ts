import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        kuaizi: {
          primary: '#F07820',
          secondary: '#1D3557',
          accent: '#457B9D',
          light: '#F1FAEE',
          dark: '#1D3557',
          ink: '#1A1A1A',
          paper: '#FAFAF7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
} satisfies Config;
