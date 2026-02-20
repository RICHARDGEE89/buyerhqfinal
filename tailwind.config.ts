import type { Config } from "tailwindcss";

const spacingScale: Record<string, string> = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  9: "36px",
  10: "40px",
  11: "44px",
  12: "48px",
  14: "56px",
  16: "64px",
  20: "80px",
  24: "96px",
  28: "112px",
  32: "128px",
};

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "16px",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // BuyerHQ Direct token system
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        navy: {
          DEFAULT: "hsl(var(--navy))",
          mid: "hsl(var(--navy-mid))",
          light: "hsl(var(--navy-light))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          light: "hsl(var(--gold-light))",
          pale: "hsl(var(--gold-pale))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
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

        // Legacy palette (kept for portal/auth compatibility)
        surface: "#ffffff",
        "surface-2": "#f5f5f5",
        "surface-3": "#ebebeb",
        "border-light": "#c7c7c7",
        "text-primary": "#0f0f0f",
        "text-secondary": "#333333",
        "text-muted": "#666666",
        "text-inverse": "#ffffff",
        "accent-dim": "#2a2a2a",
        success: "#15803d",
        destructive: "#dc2626",
      },
      fontFamily: {
        sans: ["var(--font-primary)", "system-ui", "sans-serif"],
        display: ["var(--font-primary)", "system-ui", "sans-serif"],
        body: ["var(--font-primary)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "display-xl": [
          "4.5rem",
          { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "700" },
        ],
        "display-lg": [
          "3.5rem",
          { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "700" },
        ],
        display: [
          "2.5rem",
          { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
        heading: [
          "1.75rem",
          { lineHeight: "1.25", letterSpacing: "-0.015em", fontWeight: "600" },
        ],
        subheading: [
          "1.25rem",
          { lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "500" },
        ],
        "body-lg": ["1.125rem", { lineHeight: "1.7" }],
        body: ["1rem", { lineHeight: "1.65" }],
        "body-sm": ["0.9rem", { lineHeight: "1.6" }],
        caption: ["0.8rem", { lineHeight: "1.5", letterSpacing: "0.02em" }],
        label: [
          "0.75rem",
          { lineHeight: "1.4", letterSpacing: "0.08em", fontWeight: "600" },
        ],
      },
      spacing: spacingScale,
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        none: "0",
        xl: "16px",
        full: "9999px",
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
        "count-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 220ms ease-out",
        "accordion-up": "accordion-up 220ms ease-out",
        "count-up": "count-up 0.6s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },
      backgroundImage: {
        "gradient-navy": "linear-gradient(135deg, hsl(var(--navy)) 0%, hsl(var(--navy-mid)) 100%)",
        "gradient-gold": "linear-gradient(135deg, hsl(var(--gold)) 0%, hsl(var(--gold-light)) 100%)",
      },
      boxShadow: {
        gold: "0 4px 20px hsl(42 72% 48% / 0.35)",
        card: "0 4px 16px hsl(218 65% 12% / 0.10)",
        "card-hover": "0 8px 32px hsl(218 65% 12% / 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
