const EUROPEANA_API_KEY = import.meta.env.VITE_EUROPEANA_API_KEY;

const articEndpoint = 'https://api.artic.edu/api/v1/artworks';
const europeanaEndpoint = 'https://api.europeana.eu';
const metSearchEndpoint = 'https://collectionapi.metmuseum.org/public/collection/v1/search';
const metRecordEndpoint = 'https://collectionapi.metmuseum.org/public/collection/v1/objects';

const articSearchEndpoint = `${articEndpoint}/search?q=`;
const europeanaSearchEndpoint = '/api/v2/search.json';
const RESULTS_PER_PAGE = 20; 

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
        medium: ''
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
                description: cleanText(
                    data.dcDescriptionLangAware?.en?.[0] || 
                    data.dcDescription?.[0]
                ),
                image: data.edmIsShownBy?.[0] || data.edmPreview?.[0],
                thumbnail: data.edmPreview?.[0] || data.edmIsShownBy?.[0],
                provider: cleanText(data.dataProvider?.[0]),
                rights: data.rights?.[0],
                medium: data.dctermsMediaType?.[0]
            };

        case 'artic':
            return {
                ...baseData,
                id: data.id,
                title: data.title || 'Untitled',
                creator: data.artist_display || 'Unknown',
                description: data.description || '',
                image: data.image_id
                    ? `https://www.artic.edu/iiif/2/${data.image_id}/full/843,/0/default.jpg`
                    : null,
                thumbnail: data.image_id
                    ? `https://www.artic.edu/iiif/2/${data.image_id}/full/200,/0/default.jpg`
                    : null,
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
                medium: data.medium || ''
            };

        default:
            return baseData;
    }
}

async function searchEuropeana(query, page = 1) {
    try {
        const baseParams = `wskey=${EUROPEANA_API_KEY}&query=${encodeURIComponent(query)}&profile=rich&page=${page}&rows=${RESULTS_PER_PAGE}`;
        const additionalParams = '&theme=art&reusability=open&media=true&thumbnail=true';
        const url = `${europeanaEndpoint}${europeanaSearchEndpoint}?${baseParams}${additionalParams}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Europeana API error: ${response.status}`);

        const data = await response.json();
        if (!data.items) return [];

        return data.items
            .map(item => standardizeArtworkData(item, 'europeana'))
            .filter(item => isValidText(item.title) && isValidText(item.creator));
    } catch (error) {
        console.error('Error in searchEuropeana:', error);
        return [];
    }
}

async function searchArtic(query, page = 1) {
    try {
        const params = new URLSearchParams({
            q: query,
            page,
            limit: RESULTS_PER_PAGE,
            fields: ['id', 'title', 'artist_display', 'description', 'image_id', 'classification_titles'].join(',')
        });

        const response = await fetch(`${articSearchEndpoint}${params}`);
        if (!response.ok) throw new Error(`Art Institute of Chicago API error: ${response.status}`);

        const data = await response.json();
        if (!data.data) return [];

        return data.data
            .map(item => standardizeArtworkData(item, 'artic'))
            .filter(item => item.thumbnail);
    } catch (error) {
        console.error('Error in searchArtic:', error);
        return [];
    }
}

async function searchMet(query, page = 1) {
    try {
        // First, get the object IDs
        const searchParams = new URLSearchParams({
            q: query,
            hasImages: true
        });
        
        const searchResponse = await fetch(`${metSearchEndpoint}?${searchParams}`);
        if (!searchResponse.ok) throw new Error(`Met Search API error: ${searchResponse.status}`);

        const searchData = await searchResponse.json();
        if (!searchData.objectIDs) return [];

        // Calculate pagination
        const startIndex = (page - 1) * RESULTS_PER_PAGE;
        const pageIds = searchData.objectIDs.slice(startIndex, startIndex + RESULTS_PER_PAGE);

        // Fetch details for each object
        const detailPromises = pageIds.map(async (objectId) => {
            try {
                const detailResponse = await fetch(`${metRecordEndpoint}/${objectId}`);
                if (!detailResponse.ok) return null;
                const detailData = await detailResponse.json();
                return standardizeArtworkData(detailData, 'met');
            } catch (error) {
                console.error(`Error fetching Met artwork ${objectId}:`, error);
                return null;
            }
        });

        const results = await Promise.all(detailPromises);
        return results
            .filter(item => item !== null && item.image)
            .filter(item => isValidText(item.title));
    } catch (error) {
        console.error('Error in searchMet:', error);
        return [];
    }
}

async function searchArtworks(query, page = 1) {
    try {
        const [europeanaResults, articResults, metResults] = await Promise.all([
            searchEuropeana(query, page),
            searchArtic(query, page),
            searchMet(query, page)
        ]);

        // Combine and filter results
        const allResults = [
            ...europeanaResults,
            ...articResults,
            ...metResults
        ].filter(item => item.thumbnail);

        return allResults;
    } catch (error) {
        console.error('Error searching artworks:', error);
        return [];
    }
}

const api = {
    searchArtworks,
    europeanaFilters,
    articFilters
};

export default api;
