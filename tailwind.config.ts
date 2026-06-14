import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Real Shelby palette (from explorer.shelby.xyz) ──
        shelby: {
          // Backgrounds
          cream:       '#FAF7F2',   // main bg
          white:       '#FFFFFF',   // card bg
          beige:       '#F0EDE6',   // subtle section bg
          'beige-dark':'#E8E0D8',   // borders

          // Accent — Shelby pink/magenta
          pink:        '#E91E8C',   // primary CTA (Connect Wallet button)
          'pink-light':'#F48FB1',   // charts, icons, soft highlights
          'pink-pale': '#FCE4EC',   // very subtle pink bg
          'pink-dark': '#C2185B',   // hover states

          // Text
          black:       '#1A1A1A',   // headings
          gray:        '#6B6B6B',   // body text
          'gray-light':'#9E9E9E',   // captions, labels
          'gray-dim':  '#BDBDBD',   // placeholders

          // Dark mode equivalents
          'd-bg':      '#0F0E0C',   // dark cream
          'd-panel':   '#1A1916',   // dark card
          'd-border':  '#2C2923',   // dark border
          'd-muted':   '#252219',   // dark subtle
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      backgroundImage: {
        'shelby-hero': 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(233,30,140,0.08) 0%, transparent 60%)',
        'shelby-card': 'linear-gradient(135deg, #FFFFFF 0%, #FAF7F2 100%)',
        'ticker-grad-l': 'linear-gradient(to right, var(--bg) 0%, transparent 15%)',
        'ticker-grad-r': 'linear-gradient(to left,  var(--bg) 0%, transparent 15%)',
      },
      animation: {
        'fade-up':   'fadeUp .5s ease forwards',
        'fade-in':   'fadeIn .35s ease forwards',
        'slide-in':  'slideIn .3s ease forwards',
        'ticker':    'ticker 30s linear infinite',
        'ticker-rev':'tickerRev 30s linear infinite',
        'pulse-pink':'pulsePink 2s ease-in-out infinite',
        'float':     'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:    { '0%':{ opacity:'0', transform:'translateY(14px)' }, '100%':{ opacity:'1', transform:'translateY(0)' } },
        fadeIn:    { '0%':{ opacity:'0' }, '100%':{ opacity:'1' } },
        slideIn:   { '0%':{ opacity:'0', transform:'translateX(-8px)' }, '100%':{ opacity:'1', transform:'translateX(0)' } },
        ticker:    { '0%':{ transform:'translateX(0)' }, '100%':{ transform:'translateX(-50%)' } },
        tickerRev: { '0%':{ transform:'translateX(-50%)' }, '100%':{ transform:'translateX(0)' } },
        pulsePink: { '0%,100%':{ boxShadow:'0 0 0 0 rgba(233,30,140,0.3)' }, '50%':{ boxShadow:'0 0 0 8px rgba(233,30,140,0)' } },
        float:     { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-10px)' } },
      },
      boxShadow: {
        'shelby':    '0 2px 12px rgba(233,30,140,0.12), 0 0 0 1px rgba(233,30,140,0.08)',
        'shelby-lg': '0 8px 32px rgba(233,30,140,0.15), 0 0 0 1px rgba(233,30,140,0.1)',
        'card':      '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        'card-hover':'0 4px 20px rgba(0,0,0,0.1), 0 0 0 1px rgba(233,30,140,0.1)',
        'panel':     '0 8px 40px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}

export default config
