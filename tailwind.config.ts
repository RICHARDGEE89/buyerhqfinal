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
				// Monochrome palette (blacks, whites, greys only)
				background: '#FFFFFF',
				foreground: '#000000',

				primary: {
					DEFAULT: '#4B5563', // medium grey
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

				secondary: {
					DEFAULT: '#E5E7EB',
					foreground: '#000000',
				},

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

				// Legacy semantic tokens mapped to greyscale
				midnight: '#020617',
				lime: '#E5E7EB',
				muted: '#6B7280',
				border: '#E5E7EB',

				// Warm surfaces (soft light greys)
				warm: {
					DEFAULT: '#F3F4F6',
					10: '#F9FAFB',
					20: '#F3F4F6',
					30: '#E5E7EB',
					50: '#D1D5DB',
				},

				// "Verified" accent as neutral grey highlight
				verified: {
					DEFAULT: '#4B5563',
					10: '#E5E7EB',
					20: '#D1D5DB',
				},

				// Background topo pattern replacement
				topo: '#020617',

				// Teal remapped to darker greys for shadows/accents
				teal: {
					400: '#9CA3AF',
					500: '#6B7280',
					600: '#4B5563',
				},
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
