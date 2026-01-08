import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["Cinzel", "serif"],
        body: ["Crimson Text", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Railway route colors
        route: {
          red: "hsl(var(--route-red))",
          blue: "hsl(var(--route-blue))",
          green: "hsl(var(--route-green))",
          yellow: "hsl(var(--route-yellow))",
          orange: "hsl(var(--route-orange))",
          pink: "hsl(var(--route-pink))",
          white: "hsl(var(--route-white))",
          black: "hsl(var(--route-black))",
          gray: "hsl(var(--route-gray))",
        },
        // Player colors
        player: {
          red: "hsl(var(--player-red))",
          blue: "hsl(var(--player-blue))",
          green: "hsl(var(--player-green))",
          yellow: "hsl(var(--player-yellow))",
          black: "hsl(var(--player-black))",
        },
        // Decorative
        ornament: "hsl(var(--ornament))",
        gold: "hsl(var(--gold))",
        bronze: "hsl(var(--bronze))",
        parchment: {
          DEFAULT: "hsl(var(--background))",
          dark: "hsl(var(--parchment-dark))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 10px hsl(43 80% 50% / 0.5)" },
          "50%": { boxShadow: "0 0 25px hsl(43 80% 50% / 0.8)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
      },
      backgroundImage: {
        "parchment-gradient": "linear-gradient(180deg, hsl(38 35% 93%) 0%, hsl(36 30% 88%) 100%)",
        "vintage-button": "linear-gradient(180deg, hsl(24 60% 25%) 0%, hsl(24 60% 20%) 100%)",
        "gold-gradient": "linear-gradient(180deg, hsl(43 80% 50%) 0%, hsl(30 60% 40%) 100%)",
      },
      boxShadow: {
        "vintage": "0 4px 20px hsl(30 50% 35% / 0.3)",
        "ornate": "inset 0 0 0 2px hsl(43 80% 50%), 0 4px 20px hsl(30 50% 35% / 0.3)",
        "card-hover": "0 8px 25px hsl(30 50% 35% / 0.3)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
