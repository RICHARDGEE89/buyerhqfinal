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
				// Universal Color Palette
				background: '#FFFFFF',
				foreground: '#0F172A',

				// Primary Brand Color - Professional Blue
				primary: {
					DEFAULT: '#3B82F6',
					50: '#EFF6FF',
					100: '#DBEAFE',
					200: '#BFDBFE',
					300: '#93C5FD',
					400: '#60A5FA',
					500: '#3B82F6',
					600: '#2563EB',
					700: '#1D4ED8',
					800: '#1E40AF',
					900: '#1E3A8A',
				},

				// Secondary/Accent - Emerald Green
				secondary: {
					DEFAULT: '#10B981',
					50: '#ECFDF5',
					100: '#D1FAE5',
					200: '#A7F3D0',
					300: '#6EE7B7',
					400: '#34D399',
					500: '#10B981',
					600: '#059669',
					700: '#047857',
					800: '#065F46',
					900: '#064E3B',
				},

				// Neutral Grays
				gray: {
					50: '#F9FAFB',
					100: '#F3F4F6',
					200: '#E5E7EB',
					300: '#D1D5DB',
					400: '#9CA3AF',
					500: '#6B7280',
					600: '#4B5563',
					700: '#374151',
					800: '#1F2937',
					900: '#111827',
				},

				// Status Colors
				success: '#10B981',
				warning: '#F59E0B',
				error: '#EF4444',
				info: '#3B82F6',

				// Legacy aliases (for compatibility)
				midnight: '#0F172A',
				lime: '#10B981',
				muted: '#6B7280',
				border: '#E5E7EB',
			},
			fontFamily: {
				sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
			},
			borderRadius: {
				xl: '12px',
				'2xl': '16px',
				'3xl': '24px',
			},
			boxShadow: {
				soft: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08)',
				glow: '0 0 20px rgba(59, 130, 246, 0.3)',
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
