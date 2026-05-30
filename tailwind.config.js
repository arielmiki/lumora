/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: "#15110c",
          2: "#1c1711",
        },
        surface: {
          DEFAULT: "#241e16",
          2: "#2e271d",
          3: "#392f22",
        },
        bone: {
          DEFAULT: "#f4efe5",
          dim: "#cec6b6",
        },
        muted: {
          DEFAULT: "#988e7c",
          2: "#6b6353",
        },
        gold: {
          DEFAULT: "#e3bd83",
          soft: "#eed3a6",
          deep: "#c99c5b",
        },
        plum: "#bd8ca2",
        sage: "#aab991",
        clay: "#d4957a",
        line: "rgba(244,239,229,.085)",
        line2: "rgba(244,239,229,.17)",
      },
      fontFamily: {
        sans: ["Hanken Grotesk", "system-ui", "-apple-system", "sans-serif"],
        display: ["Fraunces", "Georgia", "Times New Roman", "serif"],
        mono: ["Hanken Grotesk", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "1.02", letterSpacing: "-0.02em", fontWeight: "500" }],
        "display-lg": ["3.5rem", { lineHeight: "1.04", letterSpacing: "-0.02em", fontWeight: "500" }],
        "display-md": ["2.75rem", { lineHeight: "1.08", letterSpacing: "-0.015em", fontWeight: "500" }],
        "display-sm": ["2.125rem", { lineHeight: "1.12", letterSpacing: "-0.01em", fontWeight: "500" }],
        "heading-lg": ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "500" }],
        "heading-md": ["1.25rem", { lineHeight: "1.3", fontWeight: "500" }],
        "heading-sm": ["1.125rem", { lineHeight: "1.35", fontWeight: "500" }],
        "body-lg": ["1.125rem", { lineHeight: "1.65" }],
        "body-md": ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.55" }],
        "caption": ["0.75rem", { lineHeight: "1.5", fontWeight: "500" }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        xl: "12px",
        "2xl": "18px",
        "3xl": "28px",
      },
      boxShadow: {
        card: "0 34px 70px -24px rgba(0,0,0,.75)",
        "card-soft": "0 20px 44px -26px rgba(0,0,0,.8)",
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
