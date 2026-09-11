/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#006738', // Huntington Corporate Green
          700: '#004724', // Deep Forest
          800: '#003319', // Darker Forest
          900: '#0B2818',
          950: '#041A0E',
        },
        slate: {
          50: 'rgb(var(--slate-50, 246 247 244) / <alpha-value>)',
          100: 'rgb(var(--slate-100, 238 241 236) / <alpha-value>)',
          200: 'rgb(var(--slate-200, 227 232 226) / <alpha-value>)',
          300: 'rgb(var(--slate-300, 205 212 204) / <alpha-value>)',
          400: 'rgb(var(--slate-400, 152 163 144) / <alpha-value>)',
          500: 'rgb(var(--slate-500, 107 117 112) / <alpha-value>)',
          600: 'rgb(var(--slate-600, 63 74 69) / <alpha-value>)',
          700: 'rgb(var(--slate-700, 45 56 51) / <alpha-value>)',
          800: 'rgb(var(--slate-800, 32 43 38) / <alpha-value>)',
          900: 'rgb(var(--slate-900, 22 33 29) / <alpha-value>)',
          950: 'rgb(var(--slate-950, 15 23 20) / <alpha-value>)',
        },
        palette: {
          bg: 'var(--color-bg)',
          surface: {
            DEFAULT: 'var(--color-surface)',
            2: 'var(--color-surface-2)',
            3: 'var(--color-surface-3)',
          },
          ink: {
            DEFAULT: 'var(--color-ink)',
            2: 'var(--color-ink-2)',
            3: 'var(--color-ink-3)',
            4: 'var(--color-ink-4)',
          },
          accent: {
            DEFAULT: 'var(--color-accent)',
            deep: 'var(--color-accent-deep)',
          },
          good: 'var(--color-good)',
          warn: 'var(--color-warn)',
          crit: 'var(--color-crit)',
        },
        hban: {
          green: '#006738',
          'green-dark': '#004724',
          'green-darker': '#003319',
          'green-hover': '#1B5630',
          'green-light': '#CDFA6C',
          'green-abundant': '#7ECF1C',
          'green-energy': '#A9D42C',
          'green-midnight': '#012D2A',
          mint: '#E8F5E9',
          'mint-border': '#A7F3D0',
          'sage-prosperous': '#B8EFE4',
          charcoal: '#0F172A',
          grey: '#394048',
        }
      },
      fontFamily: {
        sans: ["'Mulish'", "'Muli'", "'Apex New'", "'Helvetica Neue'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "Arial", "sans-serif"],
        serif: ["'Mulish'", "'Muli'", "'Apex New'", "'Helvetica Neue'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "Arial", "sans-serif"],
        mono: ["'Mulish'", "'Muli'", "'Apex New'", "'Helvetica Neue'", "-apple-system", "Arial", "sans-serif"],
      },
      borderRadius: {
        'pill': '9999px',
        'hban': '12px',
        'hban-card': '16px',
        'hban-panel': '20px',
      },
      boxShadow: {
        'hban-card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'hban-hero': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'hban-pill': '0 2px 4px 0 rgba(0, 103, 56, 0.15)',
      }
    },
  },
  plugins: [],
}
