<script>
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import api from '../../utils/api';
	import Results from '$lib/components/Results.svelte';
	import Spinner from '$lib/components/Spinner.svelte';

	let allApiObjects = $state(0);
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
	let displayedResults = $derived.by(() => {
		if (filter === '')
			return allResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
		else if (filter === 'artist')
			return allResults.filter(
				(result) => result.creator && result.creator.toLowerCase().includes(query.toLowerCase())
			);
		else if (filter === 'title')
			return allResults.filter(
				(result) => result.title && result.title.toLowerCase().includes(query.toLowerCase())
			);
		else
			return allResults.filter(
				(result) => result.medium && result.medium.toLowerCase().includes(query.toLowerCase())
			);
	});
	$inspect(displayedResults);
	const progress = tweened(0.5, { duration: 10000, easing: cubicInOut });

	async function handleSearch(event) {
		if (event.type === 'keydown' && event.key !== 'Enter') {
			return;
		}

		if (!query.trim()) return;

		isLoading = true;
		error = null;

		try {
			const searchData = await api.searchArtworks(query);
			allResults = searchData.results;

			currentPage = 1;
		} catch (err) {
			console.error('Search error:', err);
			if (err.message.includes('401') || err.message.includes('403')) {
				error = 'API authentication error.';
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
		selectedArtwork = artwork;
		showSearch = false;
	}

	onMount(async () => {
		try {
			const res = await api.searchArtworks('*');
			allApiObjects = res.total;
			console.log(res.results[0]);
		} catch (err) {
			console.error('Error fetching total artworks:', err);
			allApiObjects = 0;
		}
	});
</script>

<div class="flex h-full w-full flex-col items-center p-16">
	<div class="flex h-full w-full flex-col items-center justify-center p-4">
		<div class="flex w-full max-w-6xl flex-col items-center justify-center p-4">
			<div class="w-full max-w-2xl gap-8">
				<input
					type="text"
					id="dynamic-placeholder"
					placeholder="Search {allApiObjects.toLocaleString()} artworks"
					class="text-md h-12 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-center font-sans text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
					bind:value={query}
					onkeydown={handleSearch}
				/>
				<button
					class="my-8 w-32 rounded-md bg-stone-600 px-4 py-3 font-sans text-sm font-semibold text-white transition-colors hover:bg-stone-700 disabled:opacity-50"
					onclick={handleSearch}
					disabled={isLoading}
				>
					{isLoading ? 'Searching...' : 'Search'}
				</button>
				{#if displayedResults === 0}
					<h3 class="whitespace-pre font-sans">
						Or browse by provider: <a href={'/met'}>Metropolitan Museum of Art</a>
						<a href="/artic">Art Institute of Chicago</a>
					</h3>
				{/if}
			</div>

			{#if error}
				<div class="mt-4 w-full rounded-md bg-red-100 p-4 text-red-700" transition:fade>
					{error}
				</div>
			{/if}

			{#if isLoading}
				<div class="mt-8 flex items-center justify-center">
					<Spinner />
				</div>
			{:else if displayedResults.length > 0}
				<select
					id="filter-select"
					class="mb-4 h-10 w-auto rounded-md border border-gray-200 bg-white mx-auto font-sans text-sm text-gray-800 focus:border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-200"
					bind:value={filter}
				>
					<option value="">-Filter Results-</option>
					<option value="artist">Artist</option>
					<option value="title">Title</option>
					<option value="medium">Medium</option>
				</select>
				<div
					class="mt-8 grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
					transition:fade
				>
					{#each displayedResults as result (result.id)}
						<a href={`${result.source}/${result.id}`}>
							<Results
								{result}
								isLoading={false}
								title={result.title}
								artist={result.creator}
								medium={result.medium}
							/>
						</a>
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
			{:else if query}
				<div
					class="mt-8 w-full rounded-md bg-gray-100 p-4 text-center text-gray-700"
					transition:fade
				>
					Search for "{query}"
				</div>
			{/if}
		</div>
	</div>
</div>
