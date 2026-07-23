import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F172A", // Dark Slate Background
        foreground: "#F8FAFC",
        brand: {
          blue: "#2563EB",
          "blue-glow": "#3B82F6",
          orange: "#F97316",
          "orange-glow": "#FB923C",
          dark: "#0F172A",
          surface: "rgba(15, 23, 42, 0.75)",
          border: "rgba(255, 255, 255, 0.1)",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "mesh-pattern": "radial-gradient(rgba(37, 99, 235, 0.15) 1px, transparent 1px)",
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(37, 99, 235, 0.4)",
        "glow-orange": "0 0 25px -5px rgba(249, 115, 22, 0.4)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        spin: "spin 10s linear infinite",
        glow: "glow 3s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { opacity: "0.4", filter: "blur(20px)" },
          "100%": { opacity: "0.8", filter: "blur(35px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
