import { PrismaClient } from '@prisma/client';
import 'dotenv/config'
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
export function tursoClient() {
	const authToken = import.meta.env.VITE_TURSO_DB_AUTH_TOKEN;
	const url = import.meta.env.VITE_TURSO_DB_URL;
	if (url === undefined) {
		throw new Error('TURSO_URL is not defined', url);
	}
	if (authToken === undefined) {
		if (!url.includes('file:')) {
			throw new Error('TURSO_AUTH_TOKEN is not defined');
		}
	}
	const libsql = createClient({
		url: url,
		authToken: authToken
	});

	// 3. Instantiate the libSQL driver adapter
	const adapter = new PrismaLibSQL(libsql);
	// Pass the adapter option to the Prisma Client instance
	const prisma = new PrismaClient({ adapter });
	return prisma;
}
