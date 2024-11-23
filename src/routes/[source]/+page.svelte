<script>
    import { invalidateAll } from '$app/navigation';
    import Spinner from '$lib/components/Spinner.svelte';
    import Results from '$lib/components/Results.svelte';

    let { data } = $props();
    let isLoading = $state(false);
    let met = "Metropolitan Museum of Art";
    let artic = "Art Institute of Chicago";

    async function loadMore() {
        if (!isLoading && data.pagination.hasMore) {
            isLoading = true;
            const url = new URL(window.location);
            const nextPage = (data.pagination.page || 1) + 1;
            url.searchParams.set('page', nextPage.toString());
            window.history.pushState({}, '', url);
            
            await invalidateAll();
            isLoading = false;
        }
    }
</script>

<div class="container mx-4">
    <h1 class="underlined p-8 font-sans text-lg">
        Works from the {data.source === 'artic' ? artic : met}
    </h1>

    <div class="mt-8 grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {#each data.results as result (result.id)}
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

    {#if data.pagination.hasMore}
        <div class="flex justify-center my-8">
            <button
                class="rounded-md bg-gray-100 px-6 py-2 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                onclick={loadMore}
                disabled={isLoading}
            >
                {isLoading ? 'Loading...' : 'Load More'}
            </button>
        </div>
    {/if}
</div>
