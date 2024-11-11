import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { browser, building, dev, version } from '$app/environment';



const dbUrl = import.meta?.env?.URSO_DB_URL || process.env.VITE_TURSO_DB_URL;
const dbAuthToken = import.meta?.env?.TURSO_DB_AUTH_TOKEN || process.env.VITE_TURSO_DB_AUTH_TOKEN;

if (!dbUrl || !dbAuthToken) {
  console.log('browser is ', browser, 'building is', building, 'dev is', dev, 'version is', version);
  throw new Error('Database credentials not found in environment variables');
}

const client = createClient({
  url: dbUrl,
  authToken: dbAuthToken
});

export const db = drizzle(client);
