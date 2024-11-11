import { json } from '@sveltejs/kit';
import { prisma } from '$lib/db/prismaClient';
import bcrypt from 'bcryptjs';

export async function POST({ request }) {
    try {
        const { email, password, name } = await request.json();

       
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return json({ message: 'Email already registered' }, { status: 400 });
        }

       
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

       
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword
            }
        });

      
        return json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        return json({ message: 'Internal server error' }, { status: 500 });
    }
}
