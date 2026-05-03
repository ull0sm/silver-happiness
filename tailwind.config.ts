import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Crimson Fury Design System ─────────────────────────────
      colors: {
        // Surfaces
        "surface":                  "#131313",
        "surface-dim":              "#131313",
        "surface-bright":           "#393939",
        "surface-container-lowest": "#0e0e0e",
        "surface-container-low":    "#1c1b1b",
        "surface-container":        "#201f1f",
        "surface-container-high":   "#2a2a2a",
        "surface-container-highest":"#353534",
        "surface-variant":          "#353534",
        "background":               "#131313",

        // Text
        "on-surface":         "#e5e2e1",
        "on-surface-variant": "#e9bcb5",
        "on-background":      "#e5e2e1",

        // Inverse
        "inverse-surface":    "#e5e2e1",
        "inverse-on-surface": "#313030",
        "inverse-primary":    "#c00000",

        // Outline
        "outline":         "#b08781",
        "outline-variant": "#5f3f3a",

        // Primary — CRIMSON RED
        "primary":              "#ffb4a8",
        "on-primary":           "#690000",
        "primary-container":    "#e60000",
        "on-primary-container": "#fff7f5",
        "primary-fixed":        "#ffdad4",
        "primary-fixed-dim":    "#ffb4a8",
        "on-primary-fixed":     "#410000",
        "on-primary-fixed-variant": "#930100",
        "surface-tint":         "#ffb4a8",

        // Secondary — ORANGE RED
        "secondary":              "#ffb5a0",
        "on-secondary":           "#601400",
        "secondary-container":    "#ff5625",
        "on-secondary-container": "#541100",
        "secondary-fixed":        "#ffdbd1",
        "secondary-fixed-dim":    "#ffb5a0",
        "on-secondary-fixed":     "#3b0900",
        "on-secondary-fixed-variant": "#872000",

        // Tertiary — GREY
        "tertiary":           "#c6c6c7",
        "on-tertiary":        "#2f3131",
        "tertiary-container": "#717272",
        "on-tertiary-container": "#f8f8f8",
        "tertiary-fixed":     "#e2e2e2",
        "tertiary-fixed-dim": "#c6c6c7",
        "on-tertiary-fixed":  "#1a1c1c",
        "on-tertiary-fixed-variant": "#454747",

        // Error
        "error":             "#ffb4ab",
        "on-error":          "#690005",
        "error-container":   "#93000a",
        "on-error-container":"#ffdad6",
      },

      // ── Typography ─────────────────────────────────────────────
      fontFamily: {
        lexend: ["Lexend", "sans-serif"],
        "display-xl":  ["Lexend", "sans-serif"],
        "headline-lg": ["Lexend", "sans-serif"],
        "headline-md": ["Lexend", "sans-serif"],
        "body-lg":     ["Lexend", "sans-serif"],
        "body-md":     ["Lexend", "sans-serif"],
        "label-bold":  ["Lexend", "sans-serif"],
      },

      fontSize: {
        "display-xl":  ["80px",  { lineHeight: "1.0",  letterSpacing: "-0.04em", fontWeight: "900" }],
        "headline-lg": ["48px",  { lineHeight: "1.1",  letterSpacing: "-0.02em", fontWeight: "800" }],
        "headline-md": ["32px",  { lineHeight: "1.2",  letterSpacing: "-0.01em", fontWeight: "700" }],
        "body-lg":     ["18px",  { lineHeight: "1.6",  letterSpacing: "0",       fontWeight: "400" }],
        "body-md":     ["16px",  { lineHeight: "1.5",  letterSpacing: "0",       fontWeight: "400" }],
        "label-bold":  ["14px",  { lineHeight: "1.0",  letterSpacing: "0.05em",  fontWeight: "700" }],
      },

      // ── Spacing ────────────────────────────────────────────────
      spacing: {
        "base-unit":      "8px",
        "gutter":         "16px",
        "margin-mobile":  "20px",
        "margin-desktop": "40px",
        "stack-sm":       "8px",
        "stack-md":       "24px",
        "stack-lg":       "48px",
      },

      // ── Shape (Brutalist — sharp edges) ───────────────────────
      borderRadius: {
        DEFAULT: "0px",
        sm:      "0px",
        md:      "0px",
        lg:      "0px",
        xl:      "0px",
        full:    "9999px", // only for pill/circle elements
      },
    },
  },
  plugins: [],
};

export default config;
