/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', 
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lightBg: '#f5f7fa',
        lightMid: '#c3e0dc',
        lightBottom: '#9ad0c2',
        darkTop: '#000000',
        darkMid: '#0a0a0a',
        darkBottom: '#1a1a1a',
      },
    },
  },
  plugins: [],
};
