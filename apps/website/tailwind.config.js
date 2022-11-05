/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx,jsx,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif']
      },
      colors: {
        primary: {
          DEFAULT: '#1d1d42',
          500: '#1d1d42',
          600: '#1b1a42'
        },
        secondary: '#141432',
        accent: '#26264d',
        action: '#524eee',
        gray: '#bdbdc8'
      }
    }
  },
  plugins: []
};
