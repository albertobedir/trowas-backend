import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: '#ffffff',
  			foreground: '#0f172a',
  			card: {
  				DEFAULT: '#ffffff',
  				foreground: '#0f172a'
  			},
  			popover: {
  				DEFAULT: '#ffffff',
  				foreground: '#0f172a'
  			},
  			primary: {
  				DEFAULT: '#000000',
  				foreground: '#ffffff'
  			},
  			secondary: {
  				DEFAULT: '#f1f5f9',
  				foreground: '#0f172a'
  			},
  			muted: {
  				DEFAULT: '#f1f5f9',
  				foreground: '#64748b'
  			},
  			accent: {
  				DEFAULT: '#f8fafc',
  				foreground: '#0f172a'
  			},
  			destructive: {
  				DEFAULT: '#ef4444',
  				foreground: '#ffffff'
  			},
  			border: '#e2e8f0',
  			input: '#e2e8f0',
  			ring: '#0ea5e9',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: '#ffffff',
  				foreground: '#0f172a',
  				primary: '#0ea5e9',
  				'primary-foreground': '#ffffff',
  				accent: '#f8fafc',
  				'accent-foreground': '#0f172a',
  				border: '#e2e8f0',
  				ring: '#0ea5e9'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
      keyframes: {
        "slide-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "slide-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
        "zoom-in-98": {
          "0%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "slide-down": "slide-down 0.2s ease-out",
        "slide-up": "slide-up 0.2s ease-out",
        "zoom-in-98": "zoom-in-98 0.2s ease-out",
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
