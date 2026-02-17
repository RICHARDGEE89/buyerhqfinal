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
				background: '#FFFFFF',
				foreground: '#1C1040',
				midnight: '#1C1040',
				lime: '#CDFF4F',
				muted: '#6B7280',
				border: '#E5E7EB',
				secondary: '#F7F7F7',
			},
			fontFamily: {
				sans: ['var(--font-dm-sans)', 'sans-serif'],
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

