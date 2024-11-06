<script>
	import { onMount } from 'svelte';
	import api from '../../utils/api';
	import Results from './Results.svelte';
	import ResultPage from './ResultPage.svelte';

	let query = $state('');
	let results = $state([]);
	let isLoading = $state(false);
	let error = $state(null);
	let currentPage = $state(1);
	let totalResults = $state(0);
	let hasMore = $state(false);
	let showSearch = $state(true);
	let selectedArtwork = $state(null);
	
	const RESULTS_PER_PAGE = 40;

	async function search(page = 1) {
		if (!query.trim()) return;

		isLoading = true;
		error = null;
		
		if (page === 1) {
			results = [];
		}

		try {
			const searchResults = await api.searchArtworks(query, page);
			console.log('Search results:', searchResults);

			if (searchResults.length === 0 && page === 1) {
				console.log('No results found');
			} else {
				if (page === 1) {
					results = searchResults;
				} else {
					results = [...results, ...searchResults];
				}
				hasMore = searchResults.length === RESULTS_PER_PAGE;
			}
		} catch (err) {
			console.error('Search error:', err);
			if (err.message.includes('401') || err.message.includes('403')) {
				error = 'API authentication error. Please check your API key.';
			} else if (err.message.includes('CORS')) {
				error = 'CORS error: Unable to access the API. Please check the API endpoint configuration.';
			} else {
				error = `Search error: ${err.message}`;
			}
		} finally {
			isLoading = false;
		}
	}

	function handleKeyDown(event) {
		if (event.key === 'Enter' && !isLoading) {
			currentPage = 1;
			search(1);
		}
	}

	function loadMore() {
		if (!isLoading && hasMore) {
			currentPage++;
			search(currentPage);
		}
	}

	function handleArtworkSelect(artwork) {
		selectedArtwork = artwork;
		showSearch = false;
	}

	function handleBack() {
		showSearch = true;
		selectedArtwork = null;
	}
</script>

{#if showSearch}
	<div class="flex h-full w-full flex-col items-center justify-center p-4">
		<div class="flex w-full max-w-6xl flex-col items-center justify-center gap-4">
			<div class="w-full max-w-2xl">
				<input
					type="text"
					placeholder="Search for artworks"
					class="h-12 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-center text-lg text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
					bind:value={query}
					on:keydown={handleKeyDown}
				/>
				<button
					class="mt-4 h-12 w-full rounded-md bg-indigo-500 px-4 py-2 text-center text-lg text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
					on:click={() => {
						currentPage = 1;
						search(1);
					}}
					disabled={isLoading}
				>
					{isLoading ? 'Searching...' : 'Search'}
				</button>
			</div>

			{#if error}
				<div class="w-full rounded-md bg-red-100 p-4 text-red-700">
					{error}
				</div>
			{/if}

			{#if results.length > 0}
				<div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					{#each results as result}
						<div on:click={() => handleArtworkSelect(result)}>
							<Results {result} />
						</div>
					{/each}
				</div>
				
				{#if hasMore}
					<button
						class="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 disabled:opacity-50"
						on:click={loadMore}
						disabled={isLoading}
					>
						{isLoading ? 'Loading...' : 'Load More'}
					</button>
				{/if}
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
