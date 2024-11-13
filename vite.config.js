import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';

// Load .env.local file
dotenv.config({ path: '.env.local' });

export default defineConfig({
    plugins: [sveltekit()],
    server: {
        fs: {
            allow: ['.']
        }
    },
    // Expose environment variables to the server
    define: {
        'process.env.JWT_SECRET': JSON.stringify(process.env.JWT_SECRET)
    }
});
