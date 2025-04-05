/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          orbitron: ['Orbitron', 'sans-serif'],
          'press-start': ['"Press Start 2P"', 'cursive'],
        },
        colors: {
          'primary': '#6a11cb',
          'secondary': '#2575fc',
          'danger': '#ff416c',
          'success': '#07c25e',
          'text-main': '#f1f1f1',
          'moon-surface': '#4a4e69',
          'stars': 'rgba(255, 255, 255, 0.8)',
          'shadow-col': 'rgba(0, 0, 0, 0.5)',
          'gradient-start': '#0f0c29',
          'gradient-mid': '#302b63',
          'gradient-end': '#24243e',
        },
        boxShadow: {
          'custom': '0 4px 10px var(--shadow-col)',
        },
        keyframes: {
           twinkle: {
             '0%, 100%': { opacity: 0.3 },
             '50%': { opacity: 1 },
           }
         },
         animation: {
           twinkle: 'twinkle var(--duration, 3s) infinite ease-in-out',
         }
      },
    },
    plugins: [],
  }