// tailwind.config.js
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}", 
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}" // add this for app directory support
  ],
  theme: {
    extend: {
      fontFamily: {
        PPNeueMontreal: ['"PP Neue Montreal"', 'Arial', 'Helvetica', 'sans-serif'],
        PPNeueMontrealThin: ['"PPNeueMontrealThin"', '"PP Neue Montreal"', 'Arial', 'Helvetica', 'sans-serif'],
        PPFragment: ['"PP Fragment"', 'Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
}