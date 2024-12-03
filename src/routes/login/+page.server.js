import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { users } from '$lib/db/schema';
import { randomUUID } from 'crypto';

export const load = async ({ locals }) => {
	if (locals.user) {
		throw redirect(302, '/collection');
	}
};

const login = async ({ request, cookies }) => {
	const data = await request.formData();
	const email = data.get('email');
	const password = data.get('password');

	if (!email || !password) {
		console.log('Login attempt failed: Missing email or password');
		return fail(400, { message: 'Missing email or password' });
	}

	try {
		const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

		if (!user) {
			console.log(`Login attempt failed: No user found for email ${email}`);
			return fail(401, { message: 'Invalid email or password' });
		}

		const isValidPassword = await bcrypt.compare(password, user.password);

		if (!isValidPassword) {
			console.log(`Login attempt failed: Invalid password for email ${email}`);
			return fail(401, { message: 'Invalid email or password' });
		}

		const newAuthToken = randomUUID();
		await db
			.update(users)
			.set({
				userAuthToken: newAuthToken,
				updatedAt: new Date().toISOString()
			})
			.where(eq(users.id, user.id));

		cookies.set('session', newAuthToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 30
		});

		return { success: true };
	} catch (error) {
		console.error('Login error:', error);
		return fail(500, { message: 'Internal server error during login' });
	}
};

export const actions = { login };
