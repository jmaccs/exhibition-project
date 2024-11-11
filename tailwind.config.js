import aspectRatio from '@tailwindcss/aspect-ratio';
import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		fontFamily: {
			'sans': ['Catrinity', "sans-serif"],
		},
		extend: {
			animation: {
				scroll: 'slide 1s infinite linear',
			  },
			  keyframes: {
				slide: {
				  '0%': { transform: 'translateY(0)' },
				  '100%': { transform: 'translateY(-100%)' },
				},
			  },
			
		}
	},

	plugins: [typography, forms, containerQueries, aspectRatio]
};
