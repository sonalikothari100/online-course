import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A192F",      // Deep serene navy background
        cardBg: "#172A45",          // Slate blue for card backdrops
        cardBorder: "#233554",      // Border for cards
        tealAccent: "#64FFDA",      // Calming teal for active states and highlights
        goldAccent: "#FFD700",      // Gold for points, badges, and streaks
        textPrimary: "#CCD6F6",     // Soft off-white for primary text
        textSecondary: "#8892B0",   // Grey-blue for subtitles and descriptions
        success: "#10B981",         // Green for completed items
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        display: ["var(--font-display)", "Outfit", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
