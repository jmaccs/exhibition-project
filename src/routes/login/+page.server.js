import { fail } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { users } from '$lib/db/schema';

export const actions = {
    login: async ({ request, cookies }) => {
        const data = await request.formData();
        const email = data.get('email');
        const password = data.get('password');

        if (!email || !password) {
            return fail(400, { message: 'Missing email or password' });
        }

        try {
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);

            if (!user) {
                return fail(401, { message: 'Invalid email or password' });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return fail(401, { message: 'Invalid email or password' });
            }

         
            cookies.set('session', JSON.stringify({
                id: user.id,
                email: user.email,
                name: user.name
            }), {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 30 
            });

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return fail(500, { message: 'Internal server error' });
        }
    },

    signUp: async ({ request, cookies }) => {
        const data = await request.formData();
        const email = data.get('email');
        const password = data.get('password');
        const name = data.get('name');

        if (!email || !password || !name) {
            return fail(400, { message: 'Missing required fields' });
        }

        try {
            const [existingUser] = await db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);

            if (existingUser) {
                return fail(400, { message: 'Email already registered' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const [user] = await db
                .insert(users)
                .values({
                    email,
                    name,
                    password: hashedPassword
                })
                .returning({
                    id: users.id,
                    email: users.email,
                    name: users.name
                });

           
            cookies.set('session', JSON.stringify({
                id: user.id,
                email: user.email,
                name: user.name
            }), {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 30 
            });

            return { success: true };
        } catch (error) {
            console.error('Signup error:', error);
            return fail(500, { message: 'Internal server error' });
        }
    }
};
