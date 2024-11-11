import { json } from '@sveltejs/kit';
import { prisma } from '$lib/db/prismaClient';
import bcrypt from 'bcryptjs';


export async function POST({ request }) {
    try {
        const { email, password } = await request.json();

        const user = await prisma.user.findUnique({
            where: { email }
        });

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
}
