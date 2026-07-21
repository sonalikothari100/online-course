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
        background: "#FDFBF7",      // Soft warm Alabaster background
        cardBg: "#FFFFFF",          // Crisp white for card backdrops
        cardBorder: "#F0E5F0",      // Soft plum-tinted borders
        plumAccent: "#4A124A",      // Rich Deep Plum brand primary
        peachAccent: "#F4B393",     // Sophisticated Peach brand secondary
        tealAccent: "#0D9488",      // Teal blue for secondary highlights
        goldAccent: "#D97706",      // Gold for points and streaks
        textPrimary: "#1A0C1A",     // Espresso dark charcoal plum for readability
        textSecondary: "#7C6C80",   // Warm grey-plum for descriptions
        success: "#10B981",         // Green for success
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
