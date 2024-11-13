import { redirect, error } from '@sveltejs/kit';

export async function POST({ cookies }) {
    try {
      
        cookies.delete('authToken', { 
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
        throw error(500, 'Failed to logout');
    }
}


export function GET() {
    throw redirect(303, '/');
}
