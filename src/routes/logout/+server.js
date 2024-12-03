import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db/db';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export const POST = async ({ cookies, locals }) => {
  const session = cookies.get('session');
  
  if (session && locals.user) {

    const newToken = crypto.randomBytes(32).toString('hex');
    
    try {
 
      await db
        .update(users)
        .set({ userAuthToken: newToken })
        .where(eq(users.id, locals.user.id));

     
      cookies.delete('session', { path: '/' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  

  throw redirect(303, '/');
}
