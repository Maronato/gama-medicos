/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{tsx,css}"],
  theme: {
    extend: {
      animation: {
        "reverse-spin": "reverse-spin 1s linear infinite",
      },
      keyframes: {
        "reverse-spin": {
          from: {
            transform: "rotate(360deg)",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
}
