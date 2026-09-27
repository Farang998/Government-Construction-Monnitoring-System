import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0f294a',
          blue: '#1b4d89',
          lightBlue: '#e9f1fa',
          darkSlate: '#1e293b',
          surface: '#f8fafc',
          border: '#cbd5e1',
          gold: '#c2850c',
          success: '#15803d',
          warning: '#b45309',
          danger: '#b91c1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
