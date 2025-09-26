import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // VSCode-like theme
        'vscode': {
          'bg-primary': '#1e1e1e',      // Main background
          'bg-secondary': '#252526',    // Sidebar/secondary
          'bg-tertiary': '#2d2d30',     // Hover/active states
          'bg-elevated': '#383838',     // Cards/elevated elements
          'border': '#3e3e42',          // Borders
          'text-primary': '#cccccc',    // Primary text
          'text-secondary': '#9d9d9d',  // Secondary text
          'text-muted': '#6a6a6a',      // Muted text
          'accent': '#007acc',          // Blue accent
          'success': '#4caf50',         // Green
          'warning': '#ff9800',         // Orange
          'error': '#f44336',           // Red
        },
        quantum: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        cosmic: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: (() => {
    try {
      return [require('@tailwindcss/typography')];
    } catch (error) {
      console.warn('Failed to load @tailwindcss/typography plugin:', error);
      return [];
    }
  })(),
}

export default config