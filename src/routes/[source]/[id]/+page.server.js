import { db } from '$lib/db/db';
import { eq, and } from 'drizzle-orm';
import { artworks, userCollections } from '$lib/db/schema';
import { fail } from '@sveltejs/kit';

export const actions = {
    addToCollection: async ({ request, cookies }) => {
        // Get session cookie and verify user is logged in
        const sessionCookie = cookies.get('session');
        if (!sessionCookie) {
            return fail(401, { message: 'Not authenticated' });
        }

        const session = JSON.parse(sessionCookie);
        if (!session.id) {
            return fail(401, { message: 'Invalid session' });
        }

        const formData = await request.formData();
        const artworkData = JSON.parse(formData.get('artwork'));

        try {
           
            let [existingArtwork] = await db
                .select()
                .from(artworks)
                .where(
                    and(
                        eq(artworks.source, artworkData.source),
                        eq(artworks.title, artworkData.title)
                    )
                )
                .limit(1);

           
            if (!existingArtwork) {
                [existingArtwork] = await db
                    .insert(artworks)
                    .values({
                        title: artworkData.title,
                        creator: artworkData.creator,
                        thumbnail: artworkData.image,
                        source: artworkData.source
                    })
                    .returning();
            }

           
            const [existingCollection] = await db
                .select()
                .from(userCollections)
                .where(
                    and(
                        eq(userCollections.userId, session.id),
                        eq(userCollections.artworkId, existingArtwork.id)
                    )
                )
                .limit(1);

            if (existingCollection) {
                return fail(400, { message: 'Artwork already in collection' });
            }

         
            await db
                .insert(userCollections)
                .values({
                    userId: session.id,
                    artworkId: existingArtwork.id
                });

            return { success: true };
        } catch (error) {
            console.error('Error adding to collection:', error);
            return fail(500, { message: 'Internal server error' });
        }
    }
};
