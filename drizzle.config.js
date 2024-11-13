import * as dotenv from 'dotenv';
dotenv.config();

/** @type {import('drizzle-kit').Config} */
export default {
	schema: './src/lib/db/schema.js',
	out: './migrations',
	dialect: 'turso',
	dbCredentials: {
		url: process.env.TURSO_DB_URL || import.meta.env.DEV.VITE_TURSO_DB_URL,
		authToken: process.env.TURSO_DB_AUTH_TOKEN || import.meta.env.DEV.VITE_TURSO_DB_AUTH_TOKEN
	}
};
