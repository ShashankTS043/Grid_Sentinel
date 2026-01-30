/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          900: '#0B0E14', // Deep Background
          800: '#151921', // Card Background
          700: '#2A2F3A', // Borders
        },
        neon: {
          blue: '#00F0FF', // Healthy
          amber: '#FFB800', // Warning
          red: '#FF003C',   // Critical
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}