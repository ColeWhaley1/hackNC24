/** @type {import('tailwindcss').Config} */

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [require("daisyui"), require("tailwindcss-animate")],
  theme: {
  	extend: {
  		fontFamily: {
  			istok: ['Istok Web"', 'sans-serif'],
  			grotesk: ['Space Grotesk"', 'sans-serif']
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {}
  	}
  },
}