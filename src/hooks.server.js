/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const session = event.cookies.get('session');
    
    if (session) {
        try {
            event.locals.user = JSON.parse(session);
        } catch {
            event.cookies.delete('session', { path: '/' });
        }
    }

    const response = await resolve(event);
    return response;
}
