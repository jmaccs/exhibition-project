export async function load({ fetch, data }) {
	const articRes = await fetch(`https://api.artic.edu/api/v1/artworks`);
	const metRes = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/objects');
	const articData = await articRes.json();
	const metData = await metRes.json();

	const metEuropeanPaintings = await fetch(
		'https://collectionapi.metmuseum.org/public/collection/v1/search?isHighlight=true&q=still life'
	);

	const metHighlightRes = await metEuropeanPaintings.json();

	const randomSelection = metHighlightRes.objectIDs.slice(0, 30);
	const metArtworks = await Promise.all(
		randomSelection.map((id) =>
			fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)
				.then((res) => res.json())
				.catch(() => null)
		)
	);

	const thumbnails = metArtworks
		.filter((item) => item && item.primaryImageSmall)
		.map((item) => ({
			id: item.objectID,
			title: item.title,
			creator: item.artistDisplayName,
			thumbnail: item.primaryImageSmall,
			source: 'met'
		}));
		const uniqueThumbnails = Array.from(
			new Map(thumbnails.map(item => [item.title, item])).values()
		);
	return {
		allApiObjects: articData.pagination.total + metData.total,
		thumbnails: uniqueThumbnails.slice(0, 15),
		user: data.user
	};
}
