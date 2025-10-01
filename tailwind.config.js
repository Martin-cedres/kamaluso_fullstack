const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores principales de Kamaluso
        naranja: '#FF6B35',
        amarillo: '#FFD100',
        verde: '#2ECC71',
        verdeClaro: '#00B894',
        azul: '#1F75FE',
        morado: '#8E44AD',
        moradoClaro: '#6C63FF',
        rosa: '#E84393',
        fucsia: '#E84393',
        fondoClaro: '#F8F9FA',
        fondo: '#F9FAFB',
        fondoOscuro: '#121212',
        textoPrimario: '#1A1A1A',
        textoPrimarioClaro: '#333333',
        textoSecundario: '#666666',
        textoClaro: '#FFFFFF',
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        kamaluso: '0 4px 16px rgba(255,107,53,0.15)',
        kamalusoSoft: '0 4px 14px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      keyframes: {
        'pulse-once': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      animation: {
        'pulse-once': 'pulse-once 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
}
