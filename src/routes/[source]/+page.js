import { error } from '@sveltejs/kit';


export const load = async({ fetch, params }) => {
    const { source} = params;
 
    
    if (!source) {
        throw error(404, 'Valid provider not specified');
    }
    


    if (!['artic', 'met'].includes(source)) {
        throw error(400, 'Invalid source. Must be either "artic" or "met"');
    }

    try {
		let searchParams = source === 'met' ? new URLSearchParams({
			q: "*",
			hasImages: true
		}) : new URLSearchParams({
			q: "*",
			limit: 100,
			is_public_domain: true,
			fields: ['id', 'title', 'image_id', 'artist_display'].join(',')
		});
		const searchQuery = searchParams.toString();
        const endpoint = source === 'artic' ? `https://api.artic.edu/api/v1/artworks/search?${searchQuery}` : `https://collectionapi.metmuseum.org/public/collection/v1/search?${searchQuery}`;
        const res = await fetch(`${endpoint}`)
        let data = await res.json();
		let metPromises
		let metData
		if (source === 'met') {
			metPromises = (data.objectIDs || []).slice(0, 50).map((id) =>
				fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)
					.then((res) => res.json())
					.catch(() => null)
			)
		}
		metData = await Promise.all(metPromises);
       

        if (!data || !metData) {
            throw error(404, 'Artworks not found');
        }
		const results = source === 'artic' ? data.data.map((item) => ({
			id: item.id,
			title: item.title || 'Untitled',
			thumbnail: item.image_id
				? `https://www.artic.edu/iiif/2/${item.image_id}/full/200,/0/default.jpg`
				: null,
			creator: item.artist_display || 'Unknown',
			source: 'artic'
		})) : metData
		.filter((item) => item !== null)
		.filter((item) => item.isPublicDomain === true)
		.map((item) => ({
			id: item.objectID,
			title: item.title || 'Untitled',
			thumbnail: item.primaryImageSmall,
			creator: item.artistDisplayName || 'Unknown',
			source: 'met'
		}));
        return {
            results
        };
    } catch (err) {
        console.error(`Error loading  ${source}:`, err);
        throw error(500, 'Error loading artwork details');
    }
}
