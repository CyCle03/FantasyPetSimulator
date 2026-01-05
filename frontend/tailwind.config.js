/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./app/components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        parchment: "#f8f3e6",
        ember: "#f97316",
        moss: "#2f855a",
        sky: "#2563eb",
        pearl: "#e2e8f0",
        iris: "#6d28d9"
      }
    }
  },
  plugins: []
};
