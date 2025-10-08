/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
        //Add colours here
        "smart-light-blue": "#00CFFF", // neon cyan-blue
        "smart-dark-blue": "#1740d1ff", // bright neon navy/royal blue
        "smart-red": "#FF073A", // neon red
        "smart-pink": "#FF1493", // neon pink (deep)
        "smart-light-pink": "#FF66CC", // lighter bright neon pink
        "smart-yellow": "#FFD300", // vivid yellow (neon school-bus style)
        "smart-green": "#39FF14", // neon green
        "smart-orange": "#FF6700", // bright neon orange
        "smart-purple": "#BF00FF", // vivid purple
        "smart-white": "#FFFFFF",
        "smart-black": "#000000",
        "smart-login-bg": "#0c1b2a",
      },
      fontFamily: {
        //Add fonts here
        heading: ['"Press Start 2P"', "cursive"],
        button: ["Roboto", "sans-serif"],
        round: ['"Press Start 2P"'],
        body: ["Inter", "sans-serif"],
        fun: ["Comic Neue", "cursive"],
      },
    },
  },
  plugins: [],
};
