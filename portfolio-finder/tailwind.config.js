/** @type {import('tailwindcss').Config} */

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [require("daisyui")],
  theme: {
    extend: {
      fontFamily: {
        istok: ['"Istok Web"', 'sans-serif'],
        grotesk: ['"Space Grotesk"', 'sans-serif'],
      }
    }
  },
}