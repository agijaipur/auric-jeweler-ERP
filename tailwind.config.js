/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf8eb',
          100: '#f4eca9',
          200: '#edd867',
          300: '#e5bf26',
          400: '#d4af37', // soft gold
          500: '#b89222',
          600: '#947018',
          700: '#705014',
          800: '#4d3410',
          900: '#2d1e08',
        },
        luxury: {
          black: '#121212',
          charcoal: '#1a1a1a',
          gray: '#242424',
          light: '#eaeaea',
          pearl: '#fafafa',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
