const EUROPEANA_API_KEY = import.meta.env.VITE_EUROPEANA_API_KEY;

const articEndpoint = 'https://api.artic.edu/api/v1/artworks';
const europeanaEndpoint = 'https://api.europeana.eu';
const metSearchEndpoint = 'https://collectionapi.metmuseum.org/public/collection/v1/search';
const metRecordEndpoint = 'https://collectionapi.metmuseum.org/public/collection/v1/objects';

const articSearchEndpoint = `${articEndpoint}/search?q=`;
const europeanaSearchEndpoint = '/api/v2/search.json';
const RESULTS_PER_PAGE = 12;

let filters = {
	artist: { europeana: 'proxy_dc_creator', met: '?artistOrCulture', artic: 'artist_display' },
	title: { europeana: 'dcTitle', met: '?title', artic: 'title' },
	medium: { europeana: 'proxy_dcterms_medium', met: '?medium', artic: 'medium' }
};

let metSearchCache = {
	query: '',
	objectIDs: [],
	total: 0
};

let articSearchCache = {
	query: '',
	objectIDs: [],
	total: 0
};

function cleanText(text) {
	if (!text) return '';
	text = text.replace(/https?:\/\/[^\s]+/g, '');
	text = text
		.replace(/[#[\]{}()<>]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
	return text;
}

function isValidText(text) {
	if (!text) return false;
	const cleaned = cleanText(text);
	if (cleaned.length < 2) return false;
	if (!/[a-zA-Z]/.test(cleaned)) return false;
	return true;
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
		case 'europeana':
			return {
				...baseData,
				id: data.id,
				title: cleanText(data.dcTitleLangAware?.en?.[0] || data.title?.[0]),
				creator: cleanText(
					data.dcCreatorLangAware?.en?.[0] ||
						data.edmAgentLabelLangAware?.en?.[0] ||
						data.dcCreator?.[0]
				),
				description: cleanText(data.dcDescriptionLangAware?.en?.[0] || data.dcDescription?.[0]),
				image: data.edmIsShownBy?.[0] || data.edmPreview?.[0],
				thumbnail: data.edmPreview?.[0] || data.edmIsShownBy?.[0],
				provider: cleanText(data.dataProvider?.[0]),
				rights: data.rights?.[0],
				medium: data.dctermsMediaType?.[0],
				boost: data.completeness > 6 ? true : false,
				link: data.edmIsShownBy?.[0] || data.link || ''
			};

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
					? `https://www.artic.edu/iiif/2/${data.image_id}/full/200,/0/default.jpg`
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
				boost: data.isHighlight || false
			};

		default:
			return baseData;
	}
}

async function searchEuropeana(query, filter) {
	try {
		let searchQuery = query;
		if (filter !== '') {
			searchQuery = `${filters[filter].europeana}:"${query}"`;
		}

		const baseParams = `wskey=${EUROPEANA_API_KEY}&query=${encodeURIComponent(searchQuery)}&profile=rich&rows=1000`;
		const additionalParams =
			'&theme=art&reusability=open&media=true&thumbnail=true&sort=score+desc';
		const url = `${europeanaEndpoint}${europeanaSearchEndpoint}?${baseParams}${additionalParams}`;

		const response = await fetch(url);
		if (!response.ok) throw new Error(`Europeana API error: ${response.status}`);

		const data = await response.json();
		if (!data.items) return { results: [], totalResults: 0 };

		const results = data.items
			.map((item) => standardizeArtworkData(item, 'europeana'))
			.filter((item) => isValidText(item.title) && isValidText(item.creator));

		return {
			results,
			totalResults: data.totalResults || 0
		};
	} catch (error) {
		console.error('Error in searchEuropeana:', error);
		return { results: [], totalResults: 0 };
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

async function searchArtic(query, page = 1, filter = '') {
	try {
		const searchQuery = filter !== '' ? `${filters[filter].artic}:"${query}"` : query;

		if (searchQuery !== articSearchCache.query) {
			const params = new URLSearchParams({
				q: searchQuery,
				limit: 100,
				fields: ['id', 'image_id'].join(',')
			});

			const response = await fetch(`${articSearchEndpoint}${params}`);
			if (!response.ok) throw new Error(`Art Institute of Chicago API error: ${response.status}`);

			const data = await response.json();
			articSearchCache = {
				query: searchQuery,
				objectIDs: (data.data || []).filter((item) => item.image_id).map((item) => item.id),
				total: data.pagination?.total || 0
			};
		}

		const startIndex = (page - 1) * RESULTS_PER_PAGE;
		const pageIds = articSearchCache.objectIDs.slice(startIndex, startIndex + RESULTS_PER_PAGE);

		const detailPromises = pageIds.map((id) => fetchArticDetail(id));
		const results = await Promise.all(detailPromises);
		const filteredResults = results
			.filter((item) => item !== null && item.thumbnail)
			.filter((item) => isValidText(item.title));

		return {
			results: filteredResults,
			totalResults: articSearchCache.total
		};
	} catch (error) {
		console.error('Error in searchArtic:', error);
		return { results: [], totalResults: 0 };
	}
}

async function searchMet(query, filter = '') {
	try {
		let searchParams = new URLSearchParams({
			q: query,
			hasImages: true
		});
		if (filter !== '') {
			searchParams = new URLSearchParams({
				[filters[filter].met]: true,
				q: query,
				hasImages: true
			});
		}

		const searchQuery = searchParams.toString();

		if (searchQuery !== metSearchCache.query) {
			const searchResponse = await fetch(`${metSearchEndpoint}?${searchQuery}`);
			if (!searchResponse.ok) throw new Error(`Met Search API error: ${searchResponse.status}`);

			const searchData = await searchResponse.json();
			console.log('met search data', searchData);
			metSearchCache = {
				query: searchQuery,
				objectIDs: searchData.objectIDs || [],
				total: searchData.total || 0
			};
		}
		console.log('metSearchCache', metSearchCache);
		const pageIds = metSearchCache.objectIDs

		const detailPromises = pageIds.map(async (objectId) => {
			try {
				const detailResponse = await fetch(`${metRecordEndpoint}/${objectId}`);
				console.log(
					'met detail response',
					detailResponse.url,
					'status',
					detailResponse.status,
					detailResponse.statusText
				);
				if (!detailResponse.ok) return null;
				const detailData = await detailResponse.json();
				return standardizeArtworkData(detailData, 'met');
			} catch (error) {
				console.error(`Error fetching Met artwork ${objectId}:`, error);
				return null;
			}
		});

		const results = await Promise.all(detailPromises);
		const filteredResults = results
			.filter((item) => item !== null && item.image)
			.filter((item) => isValidText(item.title));

		return {
			results: filteredResults,
			totalResults: metSearchCache.total
		};
	} catch (error) {
		console.error('Error in searchMet:', error);
		return { results: [], totalResults: 0 };
	}
}

async function searchArtworks(query, page = 1, filter = '') {
	try {
		const [europeanaData, articData, metData] = await Promise.all([
			searchEuropeana(query, filter),
			searchArtic(query, page, filter),
			searchMet(query, filter)
		]);

		const allResults = [...europeanaData.results, ...articData.results, ...metData.results].filter(
			(item) => item.thumbnail
		);
		console.log('allResults', allResults);
		const totalResults = allResults.length;

		return {
			results: allResults,
			totalResults
		};
	} catch (error) {
		console.error('Error searching artworks:', error);
		return {
			results: [],
			totalResults: 0
		};
	}
}

const api = {
	searchArtworks
};

export default api;
