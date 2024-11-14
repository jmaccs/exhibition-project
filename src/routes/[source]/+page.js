// +page.js
import { error } from '@sveltejs/kit';

export const load = async ({ fetch, params, url }) => {
	const { source } = params;
	const page = Number(url.searchParams.get('page')) || 1;
	const limit = 50;

	if (!source) {
		throw error(404, 'Valid provider not specified');
	}

	if (!['artic', 'met'].includes(source)) {
		throw error(400, 'Invalid source. Must be either "artic" or "met"');
	}

	try {
		const searchParams =
			source === 'met'
				? new URLSearchParams({ hasImages: true })
				: new URLSearchParams({
						limit: limit.toString(),
						page: page.toString(),
						is_public_domain: true,
						fields: ['id', 'title', 'image_id', 'artist_display'].join(',')
					});

		const endpoint =
			source === 'artic'
				? `https://api.artic.edu/api/v1/artworks?${searchParams}`
				: `https://collectionapi.metmuseum.org/public/collection/v1/objects`;

		const res = await fetch(endpoint);
		const data = await res.json();

		let artworks = [];
		if (source === 'met') {
			const start = (page - 1) * limit;
			const objectPromises = (data.objectIDs || [])
				.slice(start, start + limit)
				.map((id) =>
					fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)
						.then((res) => res.json())
						.catch(() => null)
				);
			const metObjects = await Promise.all(objectPromises);
			artworks = metObjects
				.filter((item) => item && item.isPublicDomain)
				.map((item) => ({
					id: item.objectID,
					title: item.title || 'Untitled',
					thumbnail: item.primaryImageSmall,
					creator: item.artistDisplayName || 'Unknown',
					source: 'met'
				}));
		} else {
			artworks = data.data.map((item) => ({
				id: item.id,
				title: item.title || 'Untitled',
				thumbnail: item.image_id
					? `https://www.artic.edu/iiif/2/${item.image_id}/full/200,/0/default.jpg`
					: null,
				creator: item.artist_display || 'Unknown',
				source: 'artic'
			}));
		}

		if (!artworks.length) throw error(404, 'Artworks not found');

		const totalItems = source === 'met' ? data.total : data.pagination?.total;
		const hasMore = source === 'met' 
			? page * limit < Math.min(totalItems, 500) // MET API limitation
			: page * limit < totalItems;

		return {
			results: artworks,
			source: source,
			pagination: {
				page,
				hasMore
			}
		};
	} catch (err) {
		console.error(`Error loading ${source}:`, err);
		throw error(500, 'Error loading artwork details');
	}
};
