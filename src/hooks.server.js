import { verifyJWT } from '$lib/jwt';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const token = event.cookies.get('authToken');
    
    if (token) {
        try {
            const userData = verifyJWT(token);
            if (userData) {
                event.locals.user = {
                    id: userData.id,
                    email: userData.email,
                    name: userData.name
                };
            }
        } catch {
            event.cookies.delete('authToken', { path: '/' });
        }
    }

    const response = await resolve(event);
    return response;
}
