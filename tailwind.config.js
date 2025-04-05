/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        'twinkle': 'twinkle 3s infinite ease-in-out',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
} 