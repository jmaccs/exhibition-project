const articEndpoint = 'https://api.artic.edu/api/v1/artworks';
const metSearchEndpoint = 'https://collectionapi.metmuseum.org/public/collection/v1/search';
const metRecordEndpoint = 'https://collectionapi.metmuseum.org/public/collection/v1/objects';
const articSearchEndpoint = `${articEndpoint}/search?q=`;
let filters = {
	artist: { met: 'artistOrCulture', artic: 'artist_display' },
	title: { artic: 'title' },
	medium: { met: 'medium', artic: 'medium' }
};
async function searchArtworks(query) {
	try {
		if (query === '*') {
			const articRes = await fetch(`${articEndpoint}`);
			const metRes = await fetch(`${metRecordEndpoint}`);
			const articData = await articRes.json();
			const metData = await metRes.json();

			return {
				results: articData.data + metData,
				total: articData.pagination.total + metData.total
			};
		}
		const [articData, metData] = await Promise.all([
			searchArtic(query),
			searchMet(query)
		]);

		const allResults = [...articData.results, ...metData.results].filter(
			(item) => item.thumbnail !== null
		);

		return {
			results: allResults,
			totalResults: articData.total + metData.total
		};
	} catch (error) {
		console.error('Error searching artworks:', error);
		return {
			results: [],
			totalResults: 0
		};
	}
}

async function searchArtic(query, filter = '') {
	try {
		const searchQuery = filter !== '' ? `${filters[filter].artic}:"${query}"` : query;
		const params = new URLSearchParams({
			q: searchQuery,
			limit: 100,
			is_public_domain: true,
			fields: ['id', 'title', 'image_id', 'artist_display'].join(',')
		});
		const response = await fetch(`${articSearchEndpoint}${params}`);
		if (!response.ok) throw new Error(`Art Institute of Chicago API error: ${response.status}`);
		const data = await response.json();
		return {
			results: data.data.map((data) => standardizeArtworkData(data, 'artic')),
			total: data.pagination?.total || 0
		};
	} catch (error) {
		console.error('Error in searchArtic:', error);
		return { results: [], total: 0 };
	}
}

async function searchMet(query, filter = '') {
	try {
		let searchParams = new URLSearchParams();
		if (filter && filters[filter]?.met) {
			searchParams.append(filters[filter].met, true);
		}
		searchParams.append('q', query);

		const searchQuery = searchParams.toString();
		console.log(searchQuery);
		const response = await fetch(`${metSearchEndpoint}?${searchQuery}`);
		console.log(response);
		if (!response.ok) throw new Error(`Met Search API error: ${response.status}`);
		const data = await response.json();

		let objectIds = (data.objectIDs || [])
			.slice(0, 200)
			.filter((id) => id && typeof id === 'number');

		const details = await Promise.all(
			objectIds.map(async (id) => {
				try {
					const detailResponse = await fetch(`${metRecordEndpoint}/${id}`);

					const detailData = await detailResponse.json();

					return detailData;
				} catch (error) {
					console.error(`Error fetching details for Met ID ${id}:`, error);
					return null;
				}
			})
		);
		console.log(details);
		const results = details.map((data) => {
			return {
				id: data.id,
				title: data.title || 'Untitled',
				creator: data.artist_title || data.artist_display || 'Unknown',
				description: data.description || data.publication_history || data.exhibition_history || '',
				image: data.image_id
					? `https://www.artic.edu/iiif/2/${data.image_id}/full/843,/0/default.jpg`
					: null,
				thumbnail: data.image_id
					? `https://www.artic.edu/iiif/2/${data.image_id}/full/400,/0/default.jpg`
					: null,
				provider: 'Art Institute of Chicago',
				rights: data.copyright_notice || '',
				medium: data.medium_display || '',
				boost: data.is_boosted || false,
				link: `https://www.artic.edu/artworks/${data.id}`
			};
		});
		return {
			results: results,
			total: data.total || 0
		};
	} catch (error) {
		console.error('Error in searchMet:', error);
		return { results: [], total: 0 };
	}
}

function standardizeArtworkData(data, source) {
	const baseData = {
		id: '',
		title: '',
		creator: '',
		description: '',
		image: null,
		thumbnail: null,
		source,
		provider: '',
		rights: '',
		medium: '',
		boost: false,
		link: ''
	};

	switch (source) {
		case 'artic':
			return {
				...baseData,
				id: data.id,
				title: data.title || 'Untitled',
				creator: data.artist_title || data.artist_display || 'Unknown',
				description: data.description || data.publication_history || data.exhibition_history || '',
				image: data.image_id
					? `https://www.artic.edu/iiif/2/${data.image_id}/full/843,/0/default.jpg`
					: null,
				thumbnail: data.image_id
					? `https://www.artic.edu/iiif/2/${data.image_id}/full/400,/0/default.jpg`
					: null,
				provider: 'Art Institute of Chicago',
				rights: data.copyright_notice || '',
				medium: data.medium_display || '',
				boost: data.is_boosted || false,
				link: `https://www.artic.edu/artworks/${data.id}`,
				filters: {
					classification_titles: data.classification_titles || []
				}
			};

		case 'met':
			return {
				...baseData,
				id: data.objectID,
				title: data.title || 'Untitled',
				creator: data.artistDisplayName || 'Unknown',
				description: data.objectDescription || data.objectHistory || '',
				image: data.primaryImage || data.primaryImageSmall || data.additionalImages[0],
				thumbnail: data.primaryImageSmall || data.primaryImage,
				provider: 'The Metropolitan Museum of Art',
				rights: data.rightsAndReproduction || '',
				medium: data.medium || '',
				boost: data.isHighlight || false,
				link: `https://www.metmuseum.org/art/collection/search/${data.objectID}`
			};

		default:
			return baseData;
	}
}

const api = {
	searchArtworks,
	standardizeArtworkData,
	searchArtic,
	searchMet
};

export default api;
