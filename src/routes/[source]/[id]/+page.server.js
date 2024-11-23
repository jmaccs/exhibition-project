import { db } from '$lib/db/db';
import { eq, and } from 'drizzle-orm';
import { artworks, userCollections } from '$lib/db/schema';
import { fail } from '@sveltejs/kit';

export const actions = {
	addToCollection: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'You must be logged in to add to your collection' });
		}

		const formData = await request.formData();
		const artworkData = JSON.parse(formData.get('artwork'));

		try {
			let [existingArtwork] = await db
				.select()
				.from(artworks)
				.where(and(eq(artworks.source, artworkData.source), eq(artworks.title, artworkData.title)))
				.limit(1);

			if (!existingArtwork) {
				[existingArtwork] = await db
					.insert(artworks)
					.values({
						title: artworkData.title,
						creator: artworkData.creator,
						thumbnail: artworkData.image,
						source: artworkData.source,
						sourceId: artworkData.id
					})
					.returning();
			}

			const [existingCollection] = await db
				.select()
				.from(userCollections)
				.where(
					and(
						eq(userCollections.userId, locals.user.id),
						eq(userCollections.artworkId, existingArtwork.id)
					)
				)
				.limit(1);

			if (existingCollection) {
				return fail(400, { message: 'This artwork is already in your collection' });
			}

			await db.insert(userCollections).values({
				userId: locals.user.id,
				artworkId: existingArtwork.id
			});

			return {
				success: true,
				message: 'Artwork added to your collection'
			};
		} catch (error) {
			console.error('Error adding to collection:', error);
			return fail(500, { message: 'An error occurred while adding to your collection' });
		}
	}
};
