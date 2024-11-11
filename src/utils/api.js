const articEndpoint = 'https://api.artic.edu/api/v1/artworks';
const metSearchEndpoint = 'https://collectionapi.metmuseum.org/public/collection/v1/search';
const metRecordEndpoint = 'https://collectionapi.metmuseum.org/public/collection/v1/objects';
const articSearchEndpoint = `${articEndpoint}/search?q=`;

let filters = {
	artist: { met: '?artistOrCulture', artic: 'artist_display' },
	title: { artic: 'title' },
	medium: { met: '?medium', artic: 'medium' }
};

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
				image: data.primaryImage || data.primaryImageSmall,
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
			results: (data.data || []).map((item) => ({
				id: item.id,
				title: item.title || 'Untitled',
				thumbnail: item.image_id
					? `https://www.artic.edu/iiif/2/${item.image_id}/full/200,/0/default.jpg`
					: null,
				creator: item.artist_display || 'Unknown',
				source: 'artic'
			})),
			total: data.pagination?.total || 0
		};
	} catch (error) {
		console.error('Error in searchArtic:', error);
		return { results: [], total: 0 };
	}
}

async function searchMet(query, filter = '') {
	try {
		let searchParams = new URLSearchParams({
			q: query,
			hasImages: true
		});

		if (filter !== '' && filters[filter].met) {
			searchParams.append(filters[filter].met, true);
		}

		const searchQuery = searchParams.toString();
		const response = await fetch(`${metSearchEndpoint}?${searchQuery}`);
		if (!response.ok) throw new Error(`Met Search API error: ${response.status}`);

		const data = await response.json();

		const detailPromises = (data.objectIDs || []).slice(0, 50).map((id) =>
			fetch(`${metRecordEndpoint}/${id}`)
				.then((res) => res.json())
				.catch(() => null)
		);
		console.log('metdetailPromises', detailPromises);
		const details = await Promise.all(detailPromises);
		const results = details
			.filter((item) => item !== null)
			.filter((item) => item.isPublicDomain === true)
			.map((item) => ({
				id: item.objectID,
				title: item.title || 'Untitled',
				thumbnail: item.primaryImageSmall,
				creator: item.artistDisplayName || 'Unknown',
				source: 'met'
			}));
			console.log('metResults', results);
		return {
			results,
			total: data.total || 0
		};
	} catch (error) {
		console.error('Error in searchMet:', error);
		return { results: [], total: 0 };
	}
}

async function searchArtworks(query, filter = '') {
	try {
		if (query === '*') {
			const articRes= await fetch(`${articEndpoint}`);
			const metRes = await fetch(`${metRecordEndpoint}`)
			const articData = await articRes.json();
			const metData = await metRes.json();
			console.log('articTotal', articData, 'metTotal', metData);
			return articData.pagination.total + metData.total;
		}

		const [articData, metData] = await Promise.all([
			searchArtic(query, filter),
			searchMet(query, filter)
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

async function fetchArticDetail(id) {
	try {
		const fields = [
			'id',
			'title',
			'artist_title',
			'artist_display',
			'description',
			'publication_history',
			'exhibition_history',
			'image_id',
			'classification_titles',
			'copyright_notice',
			'medium_display',
			'is_boosted'
		].join(',');

		const response = await fetch(`${articEndpoint}/${id}?fields=${fields}`);
		if (!response.ok) throw new Error(`Art Institute of Chicago API error: ${response.status}`);

		const data = await response.json();
		return data.data ? standardizeArtworkData(data.data, 'artic') : null;
	} catch (error) {
		console.error(`Error fetching Artic artwork ${id}:`, error);
		return null;
	}
}

async function fetchMetDetail(id) {
	try {
		const response = await fetch(`${metRecordEndpoint}/${id}`);
		if (!response.ok) throw new Error(`Met API error: ${response.status}`);
		const data = await response.json();
		return standardizeArtworkData(data, 'met');
	} catch (error) {
		console.error(`Error fetching Met artwork ${id}:`, error);
		return null;
	}
}

const api = {
	searchArtworks,
	fetchArticDetail,
	fetchMetDetail
};

export default api;
