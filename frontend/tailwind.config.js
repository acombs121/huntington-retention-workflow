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
