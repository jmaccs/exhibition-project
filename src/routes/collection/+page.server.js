import { db } from '$lib/db/db';
import { eq } from 'drizzle-orm';
import { artworks, userCollections } from '$lib/db/schema';
import { redirect } from '@sveltejs/kit';

export async function load({ parent }) {
    const { user } = await parent();
    
    if (!user) {
        throw redirect(302, '/login');
    }

    try {
        const collection = await db
            .select({
                id: artworks.id,
                title: artworks.title,
                creator: artworks.creator,
                thumbnail: artworks.thumbnail,
                source: artworks.source,
                sourceId: artworks.sourceId
            })
            .from(userCollections)
            .innerJoin(artworks, eq(userCollections.artworkId, artworks.id))
            .where(eq(userCollections.userId, user.id));
           
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
