import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'matrix-code': ['Matrix Code NFI', 'monospace'],
      },
      keyframes: {
        digitalRain: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
        // ... other existing keyframes
      },
      animation: {
        digitalRain: 'digitalRain 20s linear infinite',
        // ... other existing animations
      },
      // ... rest of your existing theme configuration
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;