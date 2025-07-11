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
        // ClipKit Brand Colors - Elite Dark Theme
        brand: {
          50: "#f8fafc", // Very light neutral
          100: "#f1f5f9", // Light neutral
          200: "#e2e8f0", // Light gray
          300: "#cbd5e1", // Medium gray
          400: "#94a3b8", // Dark gray
          500: "#64748b", // Main dark
          600: "#475569", // Darker
          700: "#334155", // Very dark
          800: "#1e293b", // Almost black
          900: "#0f172a", // Deep black
        },
        accent: {
          50: "#faf5ff", // Very light purple
          100: "#f3e8ff", // Light purple
          200: "#e9d5ff", // Light purple
          300: "#d8b4fe", // Medium purple
          400: "#c084fc", // Purple
          500: "#a855f7", // Main purple
          600: "#9333ea", // Dark purple
          700: "#7c3aed", // Darker purple
          800: "#6b21a8", // Very dark purple
          900: "#581c87", // Deep purple
        },
        secondary: {
          50: "#fdf2f8", // Very light pink
          100: "#fce7f3", // Light pink
          200: "#fbcfe8", // Light pink
          300: "#f9a8d4", // Medium pink
          400: "#f472b6", // Pink
          500: "#ec4899", // Main pink
          600: "#db2777", // Dark pink
          700: "#be185d", // Darker pink
          800: "#9d174d", // Very dark pink
          900: "#831843", // Deep pink
        },
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
        // Keep existing colors for compatibility
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
