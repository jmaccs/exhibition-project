const EUROPEANA_API_KEY = import.meta.env.VITE_EUROPEANA_API_KEY;

const articEndpoint = 'https://api.artic.edu/api/v1/artworks';
const europeanaEndpoint = 'https://api.europeana.eu';

const articSearchEndpoint = `${articEndpoint}/search?q=`;
const europeanaSearchEndpoint = '/api/v2/search.json';

const RESULTS_PER_PAGE = 20; // 20 from each API to total 40

const europeanaFilters = [
	'europeana_id',
	'PROVIDER',
	'RIGHTS',
	'europeana_collectionName',
	'COUNTRY',
	'wr_cc_license',
	'ag_foaf_name',
	'dc_description',
	'dc_title',
	'proxy_dcterms_medium',
	'dc_creator'
];

const articFilters = ['classification_titles'];

// Helper function to clean text fields
function cleanText(text) {
    if (!text) return '';
    
    // Remove URLs
    text = text.replace(/https?:\/\/[^\s]+/g, '');
    
    // Remove unusual characters and normalize spaces
    text = text
        .replace(/[#[\]{}()<>]/g, '') // Remove special characters
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
    
    return text;
}

// Helper function to validate text fields
function isValidText(text) {
    if (!text) return false;
    
    const cleaned = cleanText(text);
    

    if (cleaned.length < 2) return false;
    
    
    if (!/[a-zA-Z]/.test(cleaned)) return false;
    
    return true;
}

async function searchEuropeana(query, page = 1) {
	try {
		const baseParams = `wskey=${EUROPEANA_API_KEY}&query=${encodeURIComponent(query)}&profile=rich&page=${page}&rows=${RESULTS_PER_PAGE}`;
		const additionalParams = '&theme=art&reusability=open&media=true&thumbnail=true';

		const url = `${europeanaEndpoint}${europeanaSearchEndpoint}?${baseParams}${additionalParams}`;
		console.log('Europeana search URL:', url);

		const response = await fetch(url);
		if (!response.ok) {
			const errorText = await response.text();
			console.error('Europeana API error:', errorText);
			throw new Error(`Europeana API error: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		console.log('Europeana response:', data);

		if (!data.items) {
			console.log('No items found in Europeana response');
			return [];
		}

		return data.items
            .map((item) => {
               
                const title = cleanText(
                    item.dcTitleLangAware?.en?.[0] || 
                    item.title?.[0]
                );

               
                const creator = cleanText(
                    item.dcCreatorLangAware?.en?.[0] || 
                    item.edmAgentLabelLangAware?.en?.[0] ||
                    item.dcCreator?.[0]
                );

               
                const description = cleanText(
                    item.dcDescriptionLangAware?.en?.[0] || 
                    item.dcDescription?.[0]
                );

                return {
                    id: item.id,
                    title,
                    creator,
                    description,
                    image: item.edmIsShownBy?.[0] || item.edmPreview?.[0],
                    thumbnail: item.edmPreview?.[0] || item.edmIsShownBy?.[0],
                    source: 'europeana',
                    provider: cleanText(item.dataProvider?.[0]),
                    rights: item.rights?.[0],
                    medium: item.dctermsMediaType?.[0]
                };
            })
            .filter((item) => {
             
                return isValidText(item.title) && isValidText(item.creator);
            });
	} catch (error) {
		console.error('Error in searchEuropeana:', error);
		throw error;
	}
}

async function searchArtic(query, page = 1) {
	const params = new URLSearchParams({
		q: query,
		page,
		limit: RESULTS_PER_PAGE,
		fields: [
			'id',
			'title',
			'artist_display',
			'description',
			'image_id',
			'classification_titles'
		].join(',')
	});

	const response = await fetch(`${articSearchEndpoint}${params}`);
	const data = await response.json();

	if (!data.data) return [];

	return data.data.map((item) => ({
		id: item.id,
		title: item.title || 'Untitled',
		creator: item.artist_display || 'Unknown',
		description: item.description || '',
		image: item.image_id
			? `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`
			: null,
		thumbnail: item.image_id
			? `https://www.artic.edu/iiif/2/${item.image_id}/full/200,/0/default.jpg`
			: null,
		source: 'artic',
		filters: {
			classification_titles: item.classification_titles || []
		}
	}));
}

export async function searchArtworks(query, page = 1) {
	try {
		const [europeanaResults, articResults] = await Promise.all([
			searchEuropeana(query, page),
			searchArtic(query, page)
		]);

		// Filter out items without thumbnails
		const validEuropeanaResults = europeanaResults.filter((item) => item.thumbnail);
		const validArticResults = articResults.filter((item) => item.thumbnail);

		return [...validEuropeanaResults, ...validArticResults];
	} catch (error) {
		console.error('Error searching artworks:', error);
		return [];
	}
}

export { europeanaFilters, articFilters };
