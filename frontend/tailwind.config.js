/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          // 60% — Dominant backgrounds
          50:  '#e0faff',   // page bg
          100: '#b1f2ff',   // card tint, light borders
          // 30% — Secondary surfaces
          200: '#7eeaff',
          300: '#63e5ff',   // navbar, hero
          400: '#2ecff0',
          // 10% — Accent
          500: '#0ab5d6',   // accent, links
          600: '#0a4a57',   // deep accent, buttons
          700: '#0c5a6a',   // hover buttons
          800: '#083d47',   // dark surfaces
          900: '#052e36',   // darkest
        },
        // Dark mode palette
        dark: {
          bg:      '#0d1117',   // 60% dark body
          card:    '#0c2a32',   // 30% dark card
          surface: '#0f3a47',   // 30% dark surface alt
          accent:  '#67e8f9',   // 10% dark cyan accent
          text:    '#e0faff',   // 10% dark text
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #63e5ff 0%, #b1f2ff 100%)',
        'brand-gradient-dark': 'linear-gradient(135deg, #0c2a32 0%, #0f3a47 100%)',
        'brand-gradient-deep': 'linear-gradient(135deg, #0a4a57 0%, #0ab5d6 100%)',
      },
      boxShadow: {
        'brand': '0 4px 14px rgba(10, 181, 214, 0.15)',
        'brand-lg': '0 8px 24px rgba(10, 181, 214, 0.2)',
      }
    },
  },
  plugins: [],
}