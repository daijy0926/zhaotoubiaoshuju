/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'apple-blue': '#0066CC', 
        'apple-gray': '#F5F5F7',
        'apple-dark': '#1D1D1F',
      },
      borderRadius: {
        'xl': '12px',
      },
      boxShadow: {
        'apple': '0 4px 16px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}; 