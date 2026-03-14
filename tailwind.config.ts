import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        safora: {
          50: '#EDF6F9',
          100: '#D4ECF1',
          200: '#B0D9E3',
          300: '#83C5D3',
          400: '#4DA8BB',
          500: '#1A8FA6',
          600: '#0F6E82',
          700: '#0C5567',
          800: '#0A3D4C',
          900: '#082D38',
          950: '#051C24',
        },
        accent: {
          DEFAULT: '#2EC4B6',
          light: '#5DD9CE',
          dark: '#1B9A8E',
        },
        emergency: {
          DEFAULT: '#E63946',
          light: '#FF6B6B',
          dark: '#C62828',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'scale-in': 'scaleIn 0.4s ease-out',
        'countdown': 'countdown 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        countdown: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      backgroundImage: {
        'safora-gradient': 'linear-gradient(135deg, #0A3D4C 0%, #1A8FA6 50%, #B0D9E3 100%)',
        'safora-light': 'linear-gradient(180deg, #D4ECF1 0%, #EDF6F9 50%, #FFFFFF 100%)',
        'safora-card': 'linear-gradient(135deg, #EDF6F9 0%, #D4ECF1 100%)',
      },
    },
  },
  plugins: [],
}
export default config
