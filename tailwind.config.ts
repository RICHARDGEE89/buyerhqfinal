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
				// Universal Monochrome Palette
				background: '#FFFFFF', // Clean White
				foreground: '#000000', // Pure Black

				// Primary Action (Grey)
				primary: {
					DEFAULT: '#4B5563', // Gray-600 (Medium Grey)
					50: '#F9FAFB',
					100: '#F3F4F6',
					200: '#E5E7EB',
					300: '#D1D5DB',
					400: '#9CA3AF',
					500: '#6B7280',
					600: '#4B5563', // DEFAULT
					700: '#374151', // Hover
					800: '#1F2937',
					900: '#111827',
				},

				// Secondary (Lighter Grey)
				secondary: {
					DEFAULT: '#E5E7EB', // Gray-200
					foreground: '#000000',
				},

				// Neutrals
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

				// Keep legacy names mapped to new monochrome values to prevent breaking
				midnight: '#000000',
				lime: '#E5E7EB', // Maps to light grey
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
		}
	},
	plugins: [],
};
export default config;
