/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brown: {
          DEFAULT: '#2C1810',
          light: '#4A2C1A',
          dark: '#1A0E09',
        },
        navy: {
          DEFAULT: '#0F1E3A',
          light: '#1B2F55',
          dark: '#080F1E',
        },
        sky: {
          film: '#5BBCD6',
          light: '#8DD4E8',
          dark: '#3A8FA8',
        },
        cream: {
          DEFAULT: '#F0E6D3',
          dark: '#D4C4A8',
          muted: '#B5A48A',
        },
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      animation: {
        'rec-blink': 'recBlink 1.2s ease-in-out infinite',
        'scanline': 'scanlineMove 8s linear infinite',
        'flicker': 'flicker 4s ease-in-out infinite',
        'noise': 'noise 0.5s steps(1) infinite',
        'tracking': 'tracking 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        recBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scanlineMove: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100px' },
        },
        flicker: {
          '0%, 95%, 100%': { opacity: '1' },
          '96%': { opacity: '0.85' },
          '97%': { opacity: '1' },
          '98%': { opacity: '0.9' },
          '99%': { opacity: '1' },
        },
        noise: {
          '0%': { transform: 'translate(0,0)' },
          '10%': { transform: 'translate(-2px, 1px)' },
          '20%': { transform: 'translate(2px, -1px)' },
          '30%': { transform: 'translate(-1px, 2px)' },
          '40%': { transform: 'translate(1px, -2px)' },
          '50%': { transform: 'translate(-2px, -1px)' },
          '60%': { transform: 'translate(2px, 1px)' },
          '70%': { transform: 'translate(-1px, -2px)' },
          '80%': { transform: 'translate(1px, 2px)' },
          '90%': { transform: 'translate(0px, 1px)' },
          '100%': { transform: 'translate(0,0)' },
        },
        tracking: {
          '0%, 100%': { clipPath: 'inset(0 0 100% 0)', opacity: '0' },
          '10%': { clipPath: 'inset(40% 0 58% 0)', opacity: '0.6' },
          '12%': { clipPath: 'inset(20% 0 78% 0)', opacity: '0.4' },
          '14%': { clipPath: 'inset(60% 0 38% 0)', opacity: '0.3' },
          '16%, 90%': { clipPath: 'inset(0 0 100% 0)', opacity: '0' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
