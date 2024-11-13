import { fail } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { users } from '$lib/db/schema';
import { createJWT } from '$lib/jwt';

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

            const token = createJWT({
                id: user.id,
                email: user.email,
                name: user.name
            });

            cookies.set('authToken', token, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 30 
            });

            console.log(`User logged in successfully: ${email}`);
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

            const [newUser] = await db
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

            if (!newUser || !newUser.id) {
                console.error('Failed to create new user in database');
                return fail(500, { message: 'Failed to create user account' });
            }

          
            const token = createJWT({
                id: newUser.id,
                email: newUser.email,
                name: newUser.name
            });

          
            cookies.set('authToken', token, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 30 // 30 days
            });

            console.log(`User signed up successfully: ${email}`);
            return { success: true };
        } catch (error) {
            console.error('Signup error:', error);
            return fail(500, { message: 'Internal server error during signup' });
        }
    }
};
