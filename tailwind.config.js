/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#D8B11B', soft: '#F6EEC1',
          50: '#FBF7E6', 100: '#F6EEC1', 200: '#EDDC83', 300: '#E4CA45',
          400: '#D8B11B', 500: '#B89614', 600: '#937711', 700: '#6E590D',
          800: '#4A3C09', 900: '#251E04',
        },
        ink: { DEFAULT: '#0A0A0A', soft: '#2A2A2A', 900: '#0A0A0A', 800: '#1A1A1A', 700: '#2A2A2A' },
        cream: { DEFAULT: '#F5F2EC', paper: '#FBFAF7', 50: '#FBFAF7', 100: '#F5F2EC', 200: '#EDE7DA' },
        slate: { ardoise: '#273341' },
        success: '#1F6E3A',
        warning: '#F59B42',
        danger: '#C92B12',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(10 10 10 / 0.04), 0 8px 24px -12px rgb(10 10 10 / 0.10)',
        'card-lg': '0 2px 4px 0 rgb(10 10 10 / 0.06), 0 16px 40px -16px rgb(10 10 10 / 0.18)',
      },
    },
  },
  plugins: [],
}
