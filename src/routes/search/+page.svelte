<script>
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import api from '../../utils/api';
	import Search from '$lib/components/Search.svelte';

	let allApiObjects = $state(0);
	let filter = $state('');
	let query = $state('');
	let allResults = $state([]);
	let isLoading = $state(false);
	let error = $state(null);
	let currentPage = $state(1);
	let itemsPerPage = $state(20);
	let detailedArtworks = $state(new Map());
	let loadingDetails = $state(new Set());
	let showSearch = $state(true);
	let selectedArtwork = $state(null);

	let totalPages = $derived(Math.ceil(allResults.length / itemsPerPage));
	let displayedResults = $derived(
		allResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	$effect(() => {
		if (displayedResults.length > 0) {
			fetchDetailsForCurrentPage();
		}
	});

	const progress = tweened(0.5, {duration:10000, easing: cubicInOut});

	async function fetchDetailsForCurrentPage() {
		for (const artwork of displayedResults) {
			if (!detailedArtworks.has(artwork.id) && !loadingDetails.has(artwork.id)) {
				loadingDetails.add(artwork.id);

				try {
					const detailFetcher =
						artwork.source === 'artic' ? api.fetchArticDetail : api.fetchMetDetail;

					const details = await detailFetcher(artwork.id);
					if (details) {
						detailedArtworks.set(artwork.id, details);
					}
				} catch (err) {
					console.error(`Error fetching details for artwork ${artwork.id}:`, err);
				} finally {
					loadingDetails.delete(artwork.id);
				}
			}
		}
	}

	async function handleSearch(searchQuery, searchFilter = '') {
		if (!searchQuery.trim()) return;

		isLoading = true;
		error = null;
		query = searchQuery;
		filter = searchFilter;

		try {
			const searchData = await api.searchArtworks(searchQuery, searchFilter);
			allResults = searchData.results;
			currentPage = 1;

			detailedArtworks.clear();
			loadingDetails.clear();
		} catch (err) {
			console.error('Search error:', err);
			if (err.message.includes('401') || err.message.includes('403')) {
				error = 'API authentication error. Please check your API key.';
			} else if (err.message.includes('CORS')) {
				error =
					'CORS error: Unable to access the API. Please check the API endpoint configuration.';
			} else {
				error = `Search error: ${err.message}`;
			}
		} finally {
			isLoading = false;
		}
	}

	function handlePageChange(newPage) {
		if (newPage >= 1 && newPage <= totalPages) {
			currentPage = newPage;
		}
	}

	function handleArtworkSelect(artwork) {
		selectedArtwork = detailedArtworks.get(artwork.id) || artwork;
		showSearch = false;
	}

	function handleBack() {
		showSearch = true;
		selectedArtwork = null;
	}

	onMount(async () => {
		allApiObjects = await api.searchArtworks('*');
	});
</script>

<div class="flex h-full w-full flex-col items-center p-16">
	<Search
		{allApiObjects}
		{filter}
		{query}
		{displayedResults}
		{isLoading}
		{error}
		{currentPage}
		{totalPages}
		{detailedArtworks}
		{loadingDetails}
		{showSearch}
		{selectedArtwork}
		on:search={({ detail }) => handleSearch(detail.query, detail.filter)}
		on:pageChange={({ detail }) => handlePageChange(detail.page)}
		on:selectArtwork={({ detail }) => handleArtworkSelect(detail.artwork)}
		on:back={handleBack}
	/>
</div>