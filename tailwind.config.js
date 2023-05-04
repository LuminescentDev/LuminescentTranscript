/** @type {import('tailwindcss').Config} */

const gray = {
  50: "hsl(0deg, 0%, 95%)",
 100: "hsl(0deg, 0%, 85%)",
 200: "hsl(0deg, 0%, 75%)",
 300: "hsl(0deg, 0%, 65%)",
 400: "hsl(0deg, 0%, 55%)",
 500: "hsl(0deg, 0%, 45%)",
 600: "hsl(0deg, 0%, 35%)",
 700: "hsl(0deg, 0%, 25%)",
 800: "hsl(0deg, 0%, 15%)",
 900: "hsl(0deg, 0%, 5%)"
};

const discord = {
 300: "#4E5058",
 400: "#36393F",
 500: "#32353B",
 600: "#313338",
 700: "#2F3136",
 800: "#2B2D31",
 900: "#202225"
};


module.exports = {
 content: ['./src/**/*.{js,ts,jsx,tsx}'],
 theme: {
   extend: {
     colors: { gray, discord },
   },
 },
 plugins: [],
};
