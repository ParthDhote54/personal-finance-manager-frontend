/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        AppBg: '#f5f7fb',
        CardBg: '#ffffff',
        CardBorder: '#e5e7eb',
        Income: '#22c55e',
        Expense: '#ef4444',
        Primary: '#7c5cff',
        Secondary: '#a78bfa',
        TextMain: '#111827',
        TextMuted: '#6b7280'
      },
      fontFamily: {
        sans: [
          '"Inter"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif'
        ],
      }
    },
  },
  plugins: [],
}
