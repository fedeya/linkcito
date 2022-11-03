/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx,jsx,js}'],
  theme: {
    extend: {
      colors: {
        indigo: '#838ff5',
        primary: '#D499B9',
        secondary: '#9055A2',
        tertiary: '#2E294E',
        quaternary: '#011638'
      },
      fontFamily: {
        // serif: ['Roboto', 'sans-serif'],
        monospace: ['Noto Sans Mono', 'monospace']
      }
    }
  },
  plugins: []
};
