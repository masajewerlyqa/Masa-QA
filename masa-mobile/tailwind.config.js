/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        masa: {
          primary: '#531C24',
          secondary: '#E7D8C3',
          gold: '#D4AF37',
          muted: '#635C5C',
          surface: '#F7F3EE',
        },
      },
    },
  },
  plugins: [],
};
