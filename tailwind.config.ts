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
  theme: {
    extend: {
      colors: {
        background: "#080808",
        surface: "#111111",
        "surface-2": "#1a1a1a",
        "surface-3": "#222222",
        border: "#2c2c2c",
        "border-light": "#383838",
        "text-primary": "#f2f2f2",
        "text-secondary": "#9a9a9a",
        "text-muted": "#555555",
        "text-inverse": "#080808",
        accent: "#ffffff",
        "accent-dim": "#cccccc",
        success: "#4ade80",
        destructive: "#f87171",
      },
      fontFamily: {
        sans: ["var(--font-primary)", "system-ui", "sans-serif"],
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
        none: "0",
        sm: "4px",
        md: "8px",
        lg: "12px",
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
      },
      animation: {
        "accordion-down": "accordion-down 220ms ease-out",
        "accordion-up": "accordion-up 220ms ease-out",
      },
    },
    container: {
      center: true,
      padding: "16px",
      screens: {
        "2xl": "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
