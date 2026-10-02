module.exports = {
  content: [
    './*.html',
    './admin/**/*.html',
    './assets/js/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        blush: { DEFAULT: '#D7B77F', light: '#F2EADD', dark: '#72152B' },
        cream: { DEFAULT: '#FBF8F3', dark: '#EEE5D8' },
        leaf: { DEFAULT: '#B08B56', light: '#F4EEE3', dark: '#75552E' },
        ink: '#321B20',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
};
