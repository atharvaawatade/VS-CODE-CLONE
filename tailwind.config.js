/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'fadeIn': 'fadeIn 0.2s ease-in-out',
        'slideDown': 'slideDown 0.3s ease-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'pulse-custom': 'pulse 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: 0.6 },
          '50%': { opacity: 1 },
        },
      },
      colors: {
        editor: {
          bg: '#1E1E1E',
          secondary: '#252526',
          tertiary: '#3C3C3C',
          highlight: '#264F78',
        },
        accent: {
          blue: '#0078D4',
          green: '#107C10',
          yellow: '#FFBC44',
          red: '#D83B01',
        }
      }
    },
  },
  plugins: [],
};
