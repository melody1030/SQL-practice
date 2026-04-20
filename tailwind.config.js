/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
        },
      },
    },
  },
  plugins: [],
};
