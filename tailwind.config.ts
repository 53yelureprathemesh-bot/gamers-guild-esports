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
        background: "#07090e",
        foreground: "#f8fafc",
        cyber: {
          black: "#05070b",
          dark: "#0b0f19",
          slate: "#0f172a",
          card: "#111827",
          border: "#1e293b",
          muted: "#94a3b8",
        },
        neon: {
          cyan: "#00f0ff",
          emerald: "#00ff9d",
          teal: "#00d2b4",
          gold: "#ffb800",
          purple: "#9d4edd",
          pink: "#ff007a",
          red: "#ff2a55",
        }
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.4)',
        'neon-emerald': '0 0 20px rgba(0, 255, 157, 0.4)',
        'neon-gold': '0 0 20px rgba(255, 184, 0, 0.4)',
        'neon-purple': '0 0 20px rgba(157, 78, 221, 0.4)',
        'hud': 'inset 0 0 15px rgba(0, 240, 255, 0.15), 0 0 15px rgba(0, 0, 0, 0.7)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-grid': 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
        'cyber-glow': 'radial-gradient(circle at 50% 0%, rgba(0, 255, 157, 0.15) 0%, rgba(0, 240, 255, 0.05) 50%, transparent 80%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(0, 255, 157, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 255, 157, 0.6)' },
        }
      }
    },
  },
  plugins: [],
};

export default config;
