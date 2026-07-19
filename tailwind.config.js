/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {
      colors: {
        sss: {
          brand: '#5b5bd6',
          'brand-dark': '#4b49c8',
          'brand-soft': '#eeeefb',
          'brand-border': '#ddddf6',
          success: '#3aa17a',
          'success-soft': '#e9f5f0',
          warning: '#cc8b3c',
          'warning-soft': '#f9f1e6',
          error: '#d96a63',
          'error-soft': '#fbeeed',
          info: '#4a8fd6',
          'info-soft': '#eaf2fb',
          neutral: '#8a94a6',
          'neutral-soft': '#f2f4f7',
          page: '#f5f6fa',
          border: '#ecedf3',
          muted: '#667085',
          text: '#111827'
        }
      },
      boxShadow: {
        'sss-sm': '0 1px 2px rgba(17, 24, 39, 0.04)',
        'sss-md': '0 8px 24px rgba(91, 91, 214, 0.10)',
        'sss-lg': '0 16px 40px rgba(91, 91, 214, 0.14)',
        'sss-card': '0 4px 16px rgba(17, 24, 39, 0.05)'
      },
      borderRadius: {
        'sss': '1rem',
        'sss-lg': '1.25rem'
      },
      fontFamily: {
        sss: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      keyframes: {
        'sss-fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'sss-pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.65' }
        },
        'sss-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        'sss-fade-up': 'sss-fade-up 0.35s ease-out both',
        'sss-pulse-soft': 'sss-pulse-soft 2s ease-in-out infinite',
        'sss-shimmer': 'sss-shimmer 1.6s linear infinite'
      }
    }
  },
  plugins: []
};
