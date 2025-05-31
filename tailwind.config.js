/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        third: 'var(--color-third)',
        fourth: 'var(--color-fourth)',
        fifth: 'var(--color-fifth)',
        sixth: 'var(--color-sixth)',
        seveth: 'var(--color-seveth)',
        eighth: 'var(--color-eighth)',
      },
    },
  },
  plugins: [],
}

