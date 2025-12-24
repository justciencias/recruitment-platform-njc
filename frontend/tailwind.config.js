/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'njc-dark': '#0F172A',      // Main background
        'njc-sidebar': '#1E293B',   // Sidebar background
        'njc-accent': '#3B82F6',    // Buttons
        'njc-silver': '#94A3B8',    // Text
        'njc-card': '#1E293B',      // Cards background
      }
    }
  },
  plugins: [],
}