/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
        hand: ['"Comic Sans MS"', '"Segoe Print"', 'cursive'],
      },
      colors: {
        // Windows 9x / WinForm palette
        win: {
          face: '#c0c0c0',
          light: '#ffffff',
          shadow: '#808080',
          dark: '#404040',
          highlight: '#000080',
          text: '#000000',
        },
        paper: '#f4ecd8',
        night: '#0b1220',
      },
      boxShadow: {
        'win-out': 'inset -1px -1px #404040, inset 1px 1px #ffffff, inset -2px -2px #808080, inset 2px 2px #dfdfdf',
        'win-in': 'inset 1px 1px #404040, inset -1px -1px #ffffff, inset 2px 2px #808080, inset -2px -2px #dfdfdf',
      },
    },
  },
  plugins: [],
};
