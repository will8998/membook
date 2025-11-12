import type { Config } from 'tailwindcss';

export default {
	content: [
		'./app/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./pages/**/*.{ts,tsx}'
	],
	theme: {
		extend: {
			colors: {
				mem: {
					bg: '#0b0f12',
					card: '#12181f',
					accent: '#78E6D0',
					text: '#E6F1F7'
				}
			}
		}
	},
	plugins: []
} satisfies Config;


