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
        // Nuevos colores Premium
        fondoClaro: '#F8FAFC', // Slate 50
        fondo: '#F9FAFB',
        fondoOscuro: '#0F172A', // Slate 900
        textoPrimario: '#0F172A', // Slate 900
        textoPrimarioClaro: '#334155', // Slate 700
        textoSecundario: '#64748B', // Slate 500
        textoClaro: '#FFFFFF',
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        heading: ['var(--font-outfit)', ...fontFamily.sans],
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        kamaluso: '0 4px 16px rgba(255,107,53,0.15)',
        kamalusoSoft: '0 4px 14px rgba(0,0,0,0.1)',
        kamalusoPink: '0 4px 16px rgba(232, 67, 147, 0.2)',
        kamalusoPinkXl: '0 20px 25px -5px rgba(232, 67, 147, 0.1), 0 8px 10px -6px rgba(232, 67, 147, 0.1)',
        kamalusoWarm: '0 4px 16px rgba(255, 107, 53, 0.25)',
        kamalusoWarmXl: '0 20px 25px -5px rgba(255, 107, 53, 0.15), 0 8px 10px -6px rgba(255, 107, 53, 0.1)',
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
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        cartBounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.2)' },
          '50%': { transform: 'scale(0.9)' },
          '75%': { transform: 'scale(1.1)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(-6deg)' },
          '50%': { transform: 'translateY(-20px) rotate(-6deg)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(1.05)' },
        },
        'blob': {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' }
        },
        'glow-pulse': {
          '0%, 100%': { opacity: 0.5, boxShadow: '0 0 20px currentColor' },
          '50%': { opacity: 1, boxShadow: '0 0 40px currentColor' }
        }
      },
      backgroundImage: {
        'rainbow-subtle': 'linear-gradient(135deg, rgba(232,67,147,0.1) 0%, rgba(255,107,53,0.1) 25%, rgba(255,209,0,0.1) 50%, rgba(46,204,113,0.1) 75%, rgba(31,117,254,0.1) 100%)',
        'organic-pink': 'radial-gradient(ellipse at top left, rgba(232,67,147,0.15), transparent 50%)',
        'organic-orange': 'radial-gradient(ellipse at top right, rgba(255,107,53,0.15), transparent 50%)',
        'organic-yellow': 'radial-gradient(ellipse at bottom left, rgba(255,209,0,0.15), transparent 50%)',
        'organic-green': 'radial-gradient(ellipse at bottom right, rgba(46,204,113,0.15), transparent 50%)',
        'organic-blue': 'radial-gradient(ellipse at center, rgba(31,117,254,0.15), transparent 50%)',
      },
      animation: {
        'pulse-once': 'pulse-once 2s ease-in-out infinite',
        'slideInRight': 'slideInRight 0.3s ease-out',
        'fadeIn': 'fadeIn 0.2s ease-out',
        'cartBounce': 'cartBounce 0.5s ease-in-out',
        'shimmer': 'shimmer 2.5s infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'blob': 'blob 8s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

