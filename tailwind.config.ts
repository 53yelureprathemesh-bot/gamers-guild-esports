import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['var(--font-orbitron)', 'sans-serif'],
        rajdhani: ['var(--font-rajdhani)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        gaming: ['var(--font-orbitron)', 'sans-serif'],
      },
      colors: {
        background: "#05070c",
        foreground: "#f8fafc",
        cyber: {
          black: "#040508",
          dark: "#080c14",
          slate: "#0e1526",
          card: "#0f172a",
          border: "#1e293b",
          borderBright: "#334155",
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
        'neon-red': '0 0 20px rgba(255, 42, 85, 0.4)',
        'hud': 'inset 0 0 15px rgba(0, 240, 255, 0.15), 0 0 15px rgba(0, 0, 0, 0.7)',
        'card-glow': '0 0 25px rgba(0, 255, 157, 0.15), inset 0 0 12px rgba(0, 240, 255, 0.08)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-grid': 'linear-gradient(to right, rgba(0, 240, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.04) 1px, transparent 1px)',
        'hex-grid': 'radial-gradient(circle at 50% 50%, rgba(0, 255, 157, 0.08) 0%, transparent 60%)',
        'cyber-glow': 'radial-gradient(circle at 50% 0%, rgba(0, 255, 157, 0.18) 0%, rgba(0, 240, 255, 0.08) 50%, transparent 80%)',
        'arena-spotlight': 'radial-gradient(circle at 50% -20%, rgba(0, 240, 255, 0.22) 0%, rgba(0, 255, 157, 0.12) 30%, transparent 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'laser-sweep': 'laserSweep 4s linear infinite',
        'radar-spin': 'radarSpin 6s linear infinite',
        'float-slow': 'floatSlow 4s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(0, 255, 157, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 255, 157, 0.6)' },
        },
        laserSweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        radarSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
};

export default config;
