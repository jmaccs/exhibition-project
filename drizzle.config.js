import * as dotenv from 'dotenv';
dotenv.config();

/** @type {import('drizzle-kit').Config} */
export default {
  schema: './src/lib/db/schema.js',
  out: './migrations',
  dialect: 'turso',
  dbCredentials: {
    url: "libsql://exhibition-db-jmaccs.turso.io",
    authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MzEzMDUzOTMsImlkIjoiYTM4NWFlMWEtZmFiYi00ODhlLWJlMzAtZjE5YTU2Y2QyOWIyIn0.fSgI6yWvKUWm-3qEM-k3ancR1uDbor7FtPVdT8520fi4HYFvTSWAG5YXwtkeFAZCpRtmKAP8LnhRB2sg4cfJDg"
,
  }
};
