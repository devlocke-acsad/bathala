import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        text: "#e2e5ee",
        background: "#0d0f17",
        primary: "#afb5d0",
        secondary: "#53406d",
        accent: "#9c7bb2",
      },
      fontFamily: {
        heading: ["Centrion-Regular", "serif"],
        body: ["Chivo", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
