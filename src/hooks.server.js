
import { db } from '$lib/db/db';
import { eq } from 'drizzle-orm';
import { users } from '$lib/db/schema';

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {


    const session = event.cookies.get('session');
    if (!session) {

        return await resolve(event)
      }
    if (session) {
      
        try {
            const [user] = await db
                .select({
                    id: users.id,
                    email: users.email,
                    name: users.name
                })
                .from(users)
                .where(eq(users.userAuthToken, session))
                .limit(1);

            if (user) {
                event.locals.user = {
                    id: user.id,
                    email: user.email,
                    name: user.name
                };
            }
        } catch (error) {
            console.error('Session verification error:', error);
            event.cookies.delete('session', { path: '/' });
        }
    
    }

    return await resolve(event);
};
