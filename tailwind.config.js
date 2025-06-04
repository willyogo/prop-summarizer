/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            h1: {
              marginTop: '0',
            },
            table: {
              marginTop: '1rem',
              marginBottom: '1rem',
            },
            'ul > li': {
              marginTop: '0.25rem',
              marginBottom: '0.25rem',
            },
            pre: {
              backgroundColor: 'transparent',
              color: '#374151',
              fontSize: '0.875rem',
              padding: '0',
              margin: '0',
            },
            code: {
              backgroundColor: 'transparent',
              color: '#374151',
              fontWeight: '400',
              padding: '0',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};