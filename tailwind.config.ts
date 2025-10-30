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
        background: "#0a0a0f",
        surface: "#1a1a24",
        primary: "#ffffff",      // White
        secondary: "#e5e5e5",    // Light gray
        accent: "#d4d4d4",       // Gray
      },
      animation: {
        // Fade animations
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-in-fast": "fadeIn 0.3s ease-in-out",
        "fade-in-slow": "fadeIn 1s ease-in-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "fade-in-down": "fadeInDown 0.6s ease-out",

        // Slide animations
        "slide-up": "slideUp 0.5s ease-out",
        "slide-up-slow": "slideUp 0.8s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        "slide-left": "slideLeft 0.5s ease-out",
        "slide-right": "slideRight 0.5s ease-out",

        // Scale animations
        "scale-in": "scaleIn 0.3s ease-out",
        "scale-in-slow": "scaleIn 0.6s ease-out",
        "scale-bounce": "scaleBounce 0.5s ease-in-out",
        "scale-pulse": "scalePulse 2s ease-in-out infinite",

        // Glow animations
        "glow": "glow 2s ease-in-out infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",

        // Bounce animations
        "bounce-slow": "bounceSlow 2s ease-in-out infinite",
        "bounce-subtle": "bounceSubtle 1s ease-in-out infinite",

        // Rotate animations
        "spin-slow": "spin 3s linear infinite",
        "spin-slower": "spin 6s linear infinite",

        // Float animations
        "float": "float 3s ease-in-out infinite",
        "float-slow": "float 6s ease-in-out infinite",

        // Shimmer animations
        "shimmer": "shimmer 2s linear infinite",
        "shimmer-slow": "shimmer 4s linear infinite",

        // Wiggle animations
        "wiggle": "wiggle 1s ease-in-out infinite",
        "wiggle-slow": "wiggle 2s ease-in-out infinite",

        // Swing animations
        "swing": "swing 1s ease-in-out infinite",

        // Gradient animations
        "gradient": "gradient 3s ease infinite",
        "gradient-slow": "gradient 8s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        fadeInDown: {
          "0%": {
            opacity: "0",
            transform: "translateY(-30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideLeft: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideRight: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        scaleBounce: {
          "0%": { transform: "scale(0.8)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        scalePulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        glow: {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 40px rgba(255, 255, 255, 0.5), 0 0 60px rgba(255, 255, 255, 0.2)",
          },
        },
        glowPulse: {
          "0%, 100%": {
            boxShadow: "0 0 10px rgba(255, 255, 255, 0.2)",
            filter: "brightness(1)",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(255, 255, 255, 0.4), 0 0 50px rgba(255, 255, 255, 0.2)",
            filter: "brightness(1.2)",
          },
        },
        bounceSlow: {
          "0%, 100%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(-10%)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        swing: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
