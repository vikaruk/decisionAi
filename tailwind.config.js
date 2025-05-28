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
        background: 'var(--color-bg)',
        text: 'var(--color-text)',
        primary: 'var(--color-primary)',
        border: 'var(--color-border)',
        placeholder: 'var(--color-placeholder)',
        surface: 'var(--color-surface)',
      },
    },
  },
  plugins: [],
}

