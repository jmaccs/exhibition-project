<script>
	import { onMount } from 'svelte';
	import api from '../../utils/api';
	import Results from './Results.svelte';
	import ResultPage from './ResultPage.svelte';
	import { crossfade } from 'svelte/transition';
	import Book from './Book.svelte';
	let filter = $state('');
	let query = $state('');
	let allResults = $state([]);
	let isLoading = $state(false);
	let error = $state(null);
	let currentPage = $state(1);
	let itemsPerPage = $state(20);

	let showSearch = $state(true);
	let selectedArtwork = $state(null);

	let totalPages = $derived(Math.ceil(allResults.length / itemsPerPage));
	let displayedResults = $derived(allResults.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	));

	async function search(page = 1) {
		if (!query.trim()) return;

		isLoading = true;
		error = null;

		try {
			const searchData = await api.searchArtworks(query, page, filter);
			allResults = searchData.results;
			currentPage = page;
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

	async function loadPage(page) {
		if (!isLoading && page >= 1 && page <= totalPages) {
			await search(page);
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
					class="h-12 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-center text-lg text-gray-800  focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 "
					bind:value={query}
					onkeydown={handleKeyDown}
				/>
				<button
					class="mt-4 h-12 w-full rounded-md bg-indigo-500 px-4 py-2 text-center text-lg text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
					onclick={() => search(1)}
					disabled={isLoading}
				>
					{isLoading ? 'Searching...' : 'Search'}
				</button>
				<label for="filter-select"></label>
				<select class="appearance-none row-start-1 col-start-1 bg-slate-50" bind:value={filter}>
					<option value="">--Please choose an option--</option>
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
							<Results {result} />
						</button>
					{/each}
				</div>

				<div class="mt-4 flex items-center justify-center gap-4">
					<button
						class="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300 disabled:opacity-50"
						disabled={currentPage === 1}
						onclick={() => loadPage(currentPage - 1)}
					>
						Previous
					</button>

					<span class="text-gray-700">
						Page {currentPage} of {totalPages}
					</span>

					<button
						class="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300 disabled:opacity-50"
						disabled={currentPage === totalPages}
						onclick={() => loadPage(currentPage + 1)}
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