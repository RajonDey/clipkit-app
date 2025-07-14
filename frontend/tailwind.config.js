/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Creative Palette
        creative: {
          yellow: {
            50: "#FFFBEA",
            100: "#FFF3C4",
            200: "#FCE588",
            300: "#FADB5F",
            400: "#F7C948",
            500: "#F0B429",
            600: "#DE911D",
            700: "#CB6E17",
            800: "#B44D12",
            900: "#8D2B0B",
          },
          orange: {
            50: "#FFF8F1",
            100: "#FEECDC",
            200: "#FFD8B5",
            300: "#FFB385",
            400: "#FD7E14",
            500: "#F76707",
            600: "#E8590C",
            700: "#D9480F",
            800: "#A61E4D",
            900: "#6F1D1B",
          },
          blue: {
            50: "#E3F8FF",
            100: "#B3ECFF",
            200: "#81DEFD",
            300: "#5ED0FA",
            400: "#40C3F7",
            500: "#2BB0ED",
            600: "#1992D4",
            700: "#127FBF",
            800: "#0B69A3",
            900: "#035388",
          },
          neutral: {
            50: "#FDFCFB",
            100: "#F5F3EF",
            200: "#EAE6DF",
            300: "#D5CDC5",
            400: "#B6AFA3",
            500: "#978D7C",
            600: "#7A6A4F",
            700: "#5C4A1C",
            800: "#3E2C00",
            900: "#1A1300",
          },
        },
        // Semantic shortcuts for easy use
        primary: "#F7C948", // creative yellow-400
        secondary: "#FD7E14", // creative orange-400
        accent: "#2BB0ED", // creative blue-500
        background: "#FFFBEA", // creative yellow-50
        surface: "#F5F3EF", // creative neutral-100
        text: "#035388", // creative blue-900
        muted: "#B6AFA3", // creative neutral-400
        success: {
          50: "#f0fdf4",
          500: "#22c55e",
          600: "#16a34a",
        },
        warning: {
          50: "#fffbeb",
          500: "#f59e0b",
          600: "#d97706",
        },
        danger: {
          50: "#fef2f2",
          500: "#ef4444",
          600: "#dc2626",
        },
        // Keep existing colors for compatibility (CSS variable-based)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
