/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0b0d12',
        panel: '#12151d',
        sidebarBg: '#0e1016',
        borderDark: '#242936',
        lime: {
          DEFAULT: '#c8f169',
          light: '#d7ff8a',
          dark: '#9ec447',
        },
        purpleAccent: '#a99bff',
        blueAccent: '#6cb9ff',
        orangeAccent: '#ffb86c',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
