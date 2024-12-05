import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        clash: ["ClashDisplay", "sans-serif"],
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
} satisfies Config;
