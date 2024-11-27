import { fail } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { users } from '$lib/db/schema';
import { randomUUID } from 'crypto';

export const actions = {
    login: async ({ request, cookies }) => {
        const data = await request.formData();
        const email = data.get('email');
        const password = data.get('password');

        if (!email || !password) {
            console.log('Login attempt failed: Missing email or password');
            return fail(400, { message: 'Missing email or password' });
        }

        try {
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);

            if (!user) {
                console.log(`Login attempt failed: No user found for email ${email}`);
                return fail(401, { message: 'Invalid email or password' });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                console.log(`Login attempt failed: Invalid password for email ${email}`);
                return fail(401, { message: 'Invalid email or password' });
            }

            // Generate new auth token and update user
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
                maxAge: 60 * 60 * 24 * 30 // 30 days
            });

            // Return success to show success message before redirect
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return fail(500, { message: 'Internal server error during login' });
        }
    },

    signUp: async ({ request, cookies }) => {
        const data = await request.formData();
        const email = data.get('email');
        const password = data.get('password');
        const name = data.get('name');

        if (!email || !password || !name) {
            console.log('Signup attempt failed: Missing required fields');
            return fail(400, { message: 'Missing required fields' });
        }

        try {
            const [existingUser] = await db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);

            if (existingUser) {
                console.log(`Signup attempt failed: Email already exists ${email}`);
                return fail(400, { message: 'Email already registered' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const authToken = randomUUID();

            const result = await db
                .insert(users)
                .values({
                    email,
                    name,
                    password: hashedPassword,
                    userAuthToken: authToken,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })
                .returning();

            const newUser = result[0];
            if (!newUser || !newUser.id) {
                console.error('Failed to create new user in database');
                return fail(500, { message: 'Failed to create user account' });
            }

            cookies.set('session', authToken, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 30 // 30 days
            });

            console.log(`User signed up successfully: ${email}`);
            // Return success to show success message before redirect
            return { success: true };
        } catch (error) {
            console.error('Signup error:', error);
            return fail(500, { message: 'Internal server error during signup' });
        }
    }
};
