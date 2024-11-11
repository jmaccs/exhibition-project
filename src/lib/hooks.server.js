import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
const dbUrl = process.env.VITE_TURSO_DB_URL;
const dbAuthToken = process.env.VITE_TURSO_DB_AUTH_TOKEN;



const client = createClient({
  url: dbUrl,
  authToken: dbAuthToken
});

export const db = drizzle(client);

export const handle = async ({ event, resolve }) => {
  event.locals.db = db;
  return resolve(event);
};