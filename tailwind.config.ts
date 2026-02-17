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
				teal: '#00B4D8',
				sky: '#F0F9FF',
				verified: '#0D9488',
				warm: '#FAFAFA',
				amber: '#F59E0B',
				coral: '#EF4444',
				stone: '#64748B',
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

