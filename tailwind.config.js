/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        primary: "#ea0b2c",
        secondary: "#f98092",
        surface: '#F7F8FA',
        bg:{
          primary: "#FFFFFF",
          secondary: "#F7F7F7",
        },
        text:{
          primary: "#1C1C1E",
          secondary: "#8A8A8E",
        },
        border: {
          primary: "#E5E5EA",   
        },
      },
      fontFamily: {
        inter: ["Inter-Regular", "sans-serif"],
        "inter-bold": ["Inter-Bold", "sans-serif"],
        "inter-semibold": ["Inter-SemiBold", "sans-serif"],
        "inter-light": ["Inter-Light", "sans-serif"],
        "inter-medium": ["Inter-Medium", "sans-serif"],
        "inter-italic": ["Inter-Italic", "sans-serif"],
        "inter-extrabolditalic": ["Inter-ExtraBoldItalic", "sans-serif"],
        "inter-extrabold": ["Inter-ExtraBold", "sans-serif"],
      }
    },
  },
  plugins: [],
}