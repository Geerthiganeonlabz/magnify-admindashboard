import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["var(--font-inter)", "Inter", "sans-serif"],
        manrope: ["var(--font-manrope)", "Manrope", "sans-serif"],
        playfair: ["Playfair Display", "serif"],
      },
      colors: {
        brand: {
          navy: "#002B73",
          blue: "#1E3A8A",
          red: "#BC0000",
          slate: "#475569",
        },
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#1a56db",
          600: "#1e40af",
          700: "#1e3a8a",
          800: "#1e3370",
          900: "#172554",
        },
        accent: "#c8956c",
        dark: "#0f172a",
      },
    },
  },
  plugins: [],
};

export default config;