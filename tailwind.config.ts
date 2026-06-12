import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-be-vietnam-pro)", "system-ui", "Segoe UI", "Arial", "sans-serif"]
      },
      colors: {
        background: "#fffaf5",
        foreground: "#34231d",
        muted: "#f4e9df",
        "muted-foreground": "#7b655b",
        border: "#ead8ca",
        primary: "#bd5f42",
        "primary-foreground": "#fffaf5",
        accent: "#287a69",
        "accent-foreground": "#f5fffb",
        warning: "#a8551d"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(103, 64, 41, 0.12)"
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
