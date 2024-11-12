<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    let { data } = $props();
    let grid;
    let Muuri;

    onMount(async () => {
        if (browser) {
          
            const muuriModule = await import('muuri');
            Muuri = muuriModule.default;
            
            grid = new Muuri('#grid', {
                items: '.grid-item',
                dragEnabled: true,
                dragHandle: '.drag-handle',
                layout: {
                    fillGaps: true,
                    horizontal: false,
                    alignRight: false,
                    alignBottom: false,
                    rounding: false
                },
                dragStartPredicate: {
                    distance: 0,
                    delay: 0,
                    handle: '.drag-handle'
                }
            });

            return () => {
                if (grid) {
                    grid.destroy();
                }
            };
        }
    });
</script>

<style>
    .grid {
        position: relative;
    }
    .grid-item {
        position: absolute;
        width: 300px;
        margin: 5px;
        z-index: 1;
    }
    .grid-item.muuri-item-dragging {
        z-index: 3;
    }
    .grid-item.muuri-item-releasing {
        z-index: 2;
    }
    .grid-item.muuri-item-hidden {
        z-index: 0;
    }
    .drag-handle {
        position: absolute;
        top: 0;
        right: 0;
        padding: 8px;
        cursor: move;
        background: rgba(0, 0, 0, 0.4);
        color: white;
        border-radius: 0 8px 0 8px;
        opacity: 0;
        transition: opacity 0.2s;
    }
    .grid-item:hover .drag-handle {
        opacity: 1;
    }
    .item-content {
        position: relative;
        width: 100%;
        height: 100%;
    }
</style>

<div class="container mx-auto px-4 py-8">
    <h1 class="mb-8 text-2xl font-bold">My Collection</h1>

    {#if data.collection.length === 0}
        <div class="rounded-lg bg-gray-100 p-8 text-center">
            <p class="text-gray-600">Your collection is empty. Start adding artworks from the search page!</p>
            <a 
                href="/search" 
                class="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
                Search Artworks
            </a>
        </div>
    {:else}
        <div class="grid" id="grid">
            {#each data.collection as artwork}
                <div class="grid-item">
                    <div class="item-content rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md">
                        <div class="relative">
                            <div class="drag-handle">
                                ⋮
                            </div>
                            {#if artwork.thumbnail}
                                <img
                                    src={artwork.thumbnail}
                                    alt={artwork.title}
                                    class="w-full rounded-t-lg"
                                    loading="lazy"
                                    onerror={(e) => (e.target.src = 'https://via.placeholder.com/400x400?text=No+Image')}
                                />
                            {:else}
                                <div class="flex h-48 w-full items-center justify-center bg-gray-200 text-gray-500 rounded-t-lg">
                                    No Image Available
                                </div>
                            {/if}
                        </div>
                        <div class="p-4">
                            <h2 class="mb-2 font-semibold font-sans text-gray-900 line-clamp-2" title={artwork.title}>
                                {artwork.title}
                            </h2>
                            {#if artwork.creator}
                                <p class="text-sm text-gray-600 font-sans">
                                    By {artwork.creator}
                                </p>
                            {/if}
                            <p class="mt-2 text-xs text-gray-500 font-sans">
                                Source: {artwork.source === 'artic' ? 'Art Institute of Chicago' : artwork.source}
                            </p>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
