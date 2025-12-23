/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'njc-dark': '#0F172A',      // Fundo principal (Dark Blue)
        'njc-sidebar': '#1E293B',   // Fundo da Sidebar
        'njc-accent': '#3B82F6',    // Azul vibrante dos botões
        'njc-silver': '#94A3B8',    // Texto cinzento metálico
        'njc-card': '#1E293B',      // Fundo dos cartões/cards
      }
    }
  },
  plugins: [],
}