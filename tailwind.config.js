/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        foreground: "#fafafa",
        emerald: {
          950: "#022c22",
          900: "#064e3b",
          800: "#065f46",
          DEFAULT: "#10b981",
        },
        gold: {
          500: "#d4af37",
          400: "#fbbf24",
          300: "#fcd34d",
        },
        onyx: {
          950: "#050505",
          900: "#0a0a0a",
          800: "#121212",
          700: "#181818",
        }
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'emerald-glow': 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 80%)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
