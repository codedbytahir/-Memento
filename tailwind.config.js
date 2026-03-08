/**
 * Tailwind CSS configuration defining the application's design system and theme.
 * It specifies custom color palettes, typography, and unique animations for the Memento brand.
 */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'navy': {
          DEFAULT: '#1F3864',
          light: '#2E4B7F',
          dark: '#152849',
        },
        'copper': {
          DEFAULT: '#D4A574',
          light: '#E5C09E',
          dark: '#B88F5F',
        },
        'charcoal': {
          DEFAULT: '#2C2C2C',
          light: '#595959',
        },
        'cream': '#FAF9F6',
      },
      fontFamily: {
        'serif': ['Georgia', 'Times New Roman', 'serif'],
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      letterSpacing: {
        'tagline': '0.1em',
      },
      animation: {
        'wave': 'wave 1.5s ease-in-out infinite',
        'book-open': 'bookOpen 0.6s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(1.5)' },
        },
        bookOpen: {
          '0%': { transform: 'rotateY(-90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
