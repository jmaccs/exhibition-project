import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const authToken = import.meta.env.VITE_TURSO_DB_AUTH_TOKEN
const url = import.meta.env.VITE_TURSO_DB_URL

const libsql = createClient({
	url: url,
	authToken: authToken
});

// 3. Instantiate the libSQL driver adapter
const adapter = new PrismaLibSQL(libsql);
// Pass the adapter option to the Prisma Client instance
export const prisma = new PrismaClient({ adapter });
