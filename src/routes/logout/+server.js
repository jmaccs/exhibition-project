import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import { eq } from 'drizzle-orm';
import { users } from '$lib/db/schema';

export async function POST({ cookies, locals }) {
    try {
        if (locals.user) {
   
            await db
                .update(users)
                .set({ 
                    userAuthToken: '',
                    updatedAt: new Date().toISOString()
                })
                .where(eq(users.id, locals.user.id));
        }
        
       
        cookies.delete('session', { 
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (err) {
        console.error('Logout error:', err);
        return new Response(JSON.stringify({ error: 'Failed to logout' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

export function GET() {
    throw redirect(303, '/');
}
