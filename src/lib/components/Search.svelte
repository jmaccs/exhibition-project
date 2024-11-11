<script>
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import api from '../../utils/api';
	import Results from './Results.svelte';
	import ResultPage from './ResultPage.svelte';
	import { crossfade } from 'svelte/transition';

	import Book from './Book.svelte';
	import { is } from 'drizzle-orm';
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
	// let inputPlaceholder = new SuperPlaceholder({
	// 	placeholders: ['aesthetics at your fingertips','from the gallery to you'], preText: 'Imagine...', stay:1000, speed:100, element: '#dynamic-placeholder'
	// })
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

	async function search(page = 1) {
		if (!query.trim()) return;

		isLoading = true;
		error = null;

		try {
			const searchData = await api.searchArtworks(query, filter);
			allResults = searchData.results;
			currentPage = page;

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

      
	function handleKeyDown(event) {
		if (event.key === 'Enter' && !isLoading) {
			search(1);
		}
	}

	function previousPage() {
		if (currentPage > 1) {
			currentPage--;
		}
	}

	function nextPage() {
		if (currentPage < totalPages) {
			currentPage++;
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
		// inputPlaceholder.init();
		
	});
</script>

{#if showSearch}
	<div class="flex h-full w-full flex-col items-center justify-center p-4">
		<div class="flex w-full max-w-6xl flex-col items-center justify-center p-4">
			<div class="w-full max-w-2xl gap-8">
				
				<input
					type="text"
					id="dynamic-placeholder"
					placeholder="Search {allApiObjects} artworks"
					class="text-md h-12 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-center font-sans text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
					bind:value={query}
					onkeydown={handleKeyDown}
				/>
				<button
					class="my-8 w-32 rounded-md bg-stone-600 px-4 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-stone-700"
					onclick={() => search(1)}
					disabled={isLoading}
				>
					{isLoading ? 'Searching...' : 'Search'}
				</button>
				<label for="filter-select" class="sr-only">Filter search by</label>
				<select
					id="filter-select"
					class="mt-4 h-10 w-auto rounded-md border border-gray-200 bg-white px-4 py-2 font-sans text-sm text-gray-800 focus:border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-200"
					bind:value={filter}
				>
					<option value="">-Filter Results-</option>
					<option value="artist">Artist</option>
					<option value="title">Title</option>
					<option value="medium">Medium</option>
				</select>
			</div>

			{#if error}
				<div class="w-full rounded-md bg-red-100 p-4 text-red-700">
					{error}
				</div>
			{/if}
			{#if isLoading}
			<button type="button" class="bg-grey-500 ..." disabled>
				<svg class="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
				  <!-- ... -->
				</svg>
				Processing...
			  </button>
			{/if}

			{#if displayedResults.length > 0}
				<div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					{#each displayedResults as result, i (result.id)}
						<button
							type="button"
							class="aspect-square relative bg-gray-100"
							in:crossfade={{ key: result.id }}
							out:crossfade={{ key: result.id }}
							onclick={() => handleArtworkSelect(result)}
						>
							<Results
								result={detailedArtworks.get(result.id) || result}
								isLoading={loadingDetails.has(result.id)}
							/>
						</button>
					{/each}
				</div>

				<div class="mt-4 flex items-center justify-center gap-4">
					<button
						class="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300 disabled:opacity-50"
						disabled={currentPage === 1}
						onclick={previousPage}
					>
						Previous
					</button>

					<span class="text-gray-700">
						Page {currentPage} of {totalPages}
					</span>

					<button
						class="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300 disabled:opacity-50"
						disabled={currentPage === totalPages}
						onclick={nextPage}
					>
						Next
					</button>
				</div>
			{:else if !isLoading && query}
				<div class="w-full rounded-md bg-gray-100 p-4 text-center text-gray-700">
					No results found for "{query}"
				</div>
			{/if}
		</div>
	</div>
{:else}
	<ResultPage artwork={selectedArtwork} onBack={handleBack} />
{/if}
