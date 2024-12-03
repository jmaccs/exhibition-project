const articEndpoint = 'https://api.artic.edu/api/v1/artworks';
const metSearchEndpoint = 'https://collectionapi.metmuseum.org/public/collection/v1/search';
const metRecordEndpoint = 'https://collectionapi.metmuseum.org/public/collection/v1/objects';
const articSearchEndpoint = `${articEndpoint}/search?q=`;



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
		const articData = await searchArtic(query);
		const metData = await searchMet(query);
		const allResults = interleaveResults(articData.results, metData.results);
		const resultsWithImage = allResults.filter((item) => item.thumbnail !== null);

		return {
			results: resultsWithImage,
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

async function searchArtic(query) {
	try {
		const searchQuery = query;
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

async function searchMet(query) {
	try {
		let searchParams = new URLSearchParams({
			hasImages: true,
			q: query
		});

		const searchQuery = searchParams.toString();

		const response = await fetch(`${metSearchEndpoint}?${searchQuery}`);
		const valid = await fetch(`${metRecordEndpoint}`)
		const validres = await valid.json()
		const validIds = validres.objectIDs
		if (!response.ok) throw new Error(`Met Search API error: ${response.status}`);
		const data = await response.json();

		
		let objectIds = (data.objectIDs || [])
			.slice(0, 100)
			.filter((id) => id && typeof id === 'number' && validIds.includes(id));

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

		const results = details.map((data) => standardizeArtworkData(data, 'met'));

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
		link: '',
		origin: ''
	};

	switch (source) {
		case 'artic':
			
			return {
				...baseData,
				id: parseInt(data.id),
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
				origin: data.place_of_origin || '',
				filters: {
					classification_titles: data.classification_titles || []
				}
			};

		case 'met':
			return {
				...baseData,
				id: parseInt(data.objectID),
				title: data.title || 'Untitled',
				creator: data.artistDisplayName || 'Unknown',
				description: data.period || data.period + ', ' + data.creditLine || '',
				image: data.primaryImage || data.primaryImageSmall || null,
				thumbnail: data.primaryImageSmall || data.primaryImage || null,
				provider: 'The Metropolitan Museum of Art',
				rights: data.rightsAndReproduction || '',
				medium: data.medium || '',
				boost: data.isHighlight || false,
				link: `https://www.metmuseum.org/art/collection/search/${data.objectID}`,
				origin: data.city || data.country || ''
			};

		default:
			return baseData;
	}
}
function interleaveResults(provider1Results, provider2Results) {
	const mergedResults = [];
	let i = 0,
		j = 0;
	const randomnessFactor = 0.5;

	while (i < provider1Results.length || j < provider2Results.length) {
		if (i < provider1Results.length && j < provider2Results.length) {
			const chooseFromApi1 = Math.random() < randomnessFactor ? false : i / (i + j + 1) < 0.5;

			if (chooseFromApi1) {
				mergedResults.push(provider1Results[i++]);
			} else {
				mergedResults.push(provider2Results[j++]);
			}
		} else if (i < provider1Results.length) {
			mergedResults.push(provider1Results[i++]);
		} else if (j < provider2Results.length) {
			mergedResults.push(provider2Results[j++]);
		}
	}

	return mergedResults;
}
const api = {
	searchArtworks,
	standardizeArtworkData,
	searchArtic,
	searchMet
};

export default api;
