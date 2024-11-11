import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfigm loadEnv } from 'vite';
import dotenv from 'dotenv'

dotenv.config()
export default defineConfig({
	plugins: [sveltekit()],

});
