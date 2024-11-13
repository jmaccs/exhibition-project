<script>
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';
	import { crossfade } from 'svelte/transition';
	import Results from './Results.svelte';
	import Spinner from './Spinner.svelte';
	const dispatch = createEventDispatcher();

	export let allApiObjects;
	export let filter;
	export let query;
	export let displayedResults;
	export let isLoading;
	export let error;
	export let currentPage;
	export let totalPages;
	export let detailedArtworks;
	export let loadingDetails;

	function handleKeyDown(event) {
		if (event.key === 'Enter' && !isLoading) {
			dispatch('search', { query, filter });
		}
	}

	function handleSearchClick() {
		dispatch('search', { query, filter });
	}

	function previousPage() {
		dispatch('pageChange', { page: currentPage - 1 });
	}

	function nextPage() {
		dispatch('pageChange', { page: currentPage + 1 });
	}

	function handleArtworkSelect(artwork) {
		goto(`/${artwork.source}/${artwork.id}`);
	}
</script>

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
				onclick={handleSearchClick}
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
		{#await displayedResults}
			<Spinner />
		{:then displayedResults}
			
	
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
			{/await}
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