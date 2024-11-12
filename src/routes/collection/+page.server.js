import { db } from '$lib/db/db';
import { eq } from 'drizzle-orm';
import { artworks, userCollections } from '$lib/db/schema';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
    const sessionCookie = cookies.get('session');
    if (!sessionCookie) {
        throw redirect(302, '/login');
    }

    const session = JSON.parse(sessionCookie);
    if (!session.id) {
        throw redirect(302, '/login');
    }

    try {
       
        const collection = await db
            .select({
                id: artworks.id,
                title: artworks.title,
                creator: artworks.creator,
                thumbnail: artworks.thumbnail,
                source: artworks.source
            })
            .from(userCollections)
            .innerJoin(artworks, eq(userCollections.artworkId, artworks.id))
            .where(eq(userCollections.userId, session.id));

        return {
            collection
        };
    } catch (error) {
        console.error('Error fetching collection:', error);
        return {
            collection: []
        };
    }
}
