import { error } from '@sveltejs/kit';
import api from '../../../utils/api';

export const load = async({ fetch, params, parent }) => {
    const parentData = await parent();
    const { source, id } = params;
    
    const articFields = [
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
    
    if (!source || !id) {
        throw error(404, 'Source and ID are required');
    }

    if (!['artic', 'met'].includes(source)) {
        throw error(400, 'Invalid source. Must be either "artic" or "met"');
    }

    try {
        const endpoint = source === 'artic' ? `https://api.artic.edu/api/v1/artworks/${id}?fields=${articFields}`: `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;
        const res = await fetch(`${endpoint}`)
        let unprocessed = await res.json();
        if(source === 'artic') {
            unprocessed = unprocessed.data;
        }

        const artwork = api.standardizeArtworkData(unprocessed, source);

        if (!artwork) {
            throw error(404, 'Artwork not found');
        }

        return {
            artwork,
            user: parentData.user
        };
    } catch (err) {
        console.error(`Error loading artwork ${id} from ${source}:`, err);
        throw error(500, 'Error loading artwork details');
    }
}
