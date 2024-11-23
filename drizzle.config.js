import * as dotenv from 'dotenv';
dotenv.config();

/** @type {import('drizzle-kit').Config} */
export default {
	schema: './src/lib/db/schema.js',
	out: './migrations',
	dialect: 'turso',
	dbCredentials: {
		url: process.env.TURSO_DB_URL || "libsql://exhibition-db-jmaccs.turso.io",
		authToken: process.env.TURSO_DB_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MzEzMDUzOTMsImlkIjoiYTM4NWFlMWEtZmFiYi00ODhlLWJlMzAtZjE5YTU2Y2QyOWIyIn0.fSgI6yWvKUWm-3qEM-k3ancR1uDbor7FtPVdT8520fi4HYFvTSWAG5YXwtkeFAZCpRtmKAP8LnhRB2sg4cfJDg"
	}
};
