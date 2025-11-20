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
        primary: {
          white: "#FFFFFF",
          charcoal: "#2D2D2D",
          black: "#000000",
          tiffany: "#81D8D0", // Tiffany Blue
          "tiffany-dark": "#6BC3BB", // 10% darker for hover
          gray: "#F9F9F9",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Cormorant Garamond", "serif"],
        sans: ["Inter", "Proxima Nova", "sans-serif"],
      },
      fontSize: {
        h1: "72px",
        h2: "48px",
        h3: "36px",
        body: "18px",
        small: "16px",
      },
      spacing: {
        section: "120px",
        "section-mobile": "60px",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "parallax": "parallax 20s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        parallax: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

