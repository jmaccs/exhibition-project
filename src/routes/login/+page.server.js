import { json } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { users } from '$lib/db/schema';


export const actions = {
    login: async (request) =>{
        try {
            const { email, password } = await request.json();
    
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);
    
            if (!user) {
                return json({ message: 'Invalid email or password' }, { status: 401 });
            }
    
            const isValidPassword = await bcrypt.compare(password, user.password);
    
            if (!isValidPassword) {
                return json({ message: 'Invalid email or password' }, { status: 401 });
            }
    
            return json({
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            return json({ message: 'Internal server error' }, { status: 500 });
        }
    },
    signUp: async (request) => {
        try {
            const { email, password, name } = await request.json();
    
          
            const [existingUser] = await db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);
    
            if (existingUser) {
                return json({ message: 'Email already registered' }, { status: 400 });
            }
    
           
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
    
            // Create new user
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
    
            return json({ user });
        } catch (error) {
            console.error('Signup error:', error);
            return json({ message: 'Internal server error' }, { status: 500 });
        }
    }
}