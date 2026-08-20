/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // The full seven-item menu fits from here up; below it the burger takes over
      screens: { nav: '1100px' },
      colors: {
        // Deep green + saffron, sampled from the Guruvan Foundation logo
        forest: {
          DEFAULT: '#14532D',
          50:  '#F1F7F1',
          100: '#DCEBDD',
          600: '#1B6B3A',
          700: '#155B31',
          800: '#12492A',
          900: '#0E3B21',
          950: '#0A2A17',
          deep: '#0E3B21',
          dark: '#0E3B21',
          mid:  '#1B6B3A',
          tint: '#EEF4E9',
          pale: '#EEF4E9',
          wash: '#F7F9F5',
          line: '#E3EBE0'
        },
        saffron: { DEFAULT: '#E8912B', 500: '#E8912B', 600: '#CD7A18', dark: '#CD7A18' },
        leaf:    { 500: '#4B9B3F' },
        // Muted gold used for the figures and icons on the deep-green impact band
        gold:    '#E3CE8C',
        cream:   '#F6F4EC',
        ink:     { DEFAULT: '#16281C', soft: '#5B6B60' }
      },
      fontFamily: {
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      fontWeight: { 600: '600', 700: '700', 800: '800' },
      borderRadius: { card: '1rem' },
      maxWidth: { shell: '1200px' },
      boxShadow: {
        card: '0 1px 2px rgba(20,83,45,.04), 0 8px 24px -12px rgba(20,83,45,.18)'
      }
    }
  },
  plugins: []
}
