import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			midnight: '#0D1B2A',
  			ocean: '#1A6B8A',
  			sky: '#E8F4F8',
  			verified: '#0A7C4E',
  			warm: '#F5F0EB',
  			amber: '#E8A020',
  			coral: '#D95F3B',
  			stone: '#6B7280',
  			border: '#E2E8F0'
  		},
  		fontFamily: {
  			display: [
  				'var(--font-fraunces)',
  				'serif'
  			],
  			sans: [
  				'var(--font-jakarta)',
  				'sans-serif'
  			],
  			mono: [
  				'var(--font-jetbrains)',
  				'monospace'
  			]
  		},
  		borderRadius: {
  			xl: '12px',
  			'2xl': '24px'
  		},
  		boxShadow: {
  			soft: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [],
};
export default config;

