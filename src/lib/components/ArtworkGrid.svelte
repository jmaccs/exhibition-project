<script>
	let { artworks } = $props();
</script>

<div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
	{#each artworks as artwork (artwork.id)}
		<div class="relative rounded-lg" role="menuitem">
			<div
				class="relative flex-auto rounded-lg shadow-sm backdrop-blur-md transition-shadow hover:shadow-md"
			>
				<a class="relative block" href={artwork.source + '/' + artwork.sourceId}>
					{#if artwork.thumbnail}
						<img
							src={artwork.thumbnail}
							alt={artwork.title}
							class="h-full w-full rounded-t-lg object-cover p-4"
							loading="lazy"
							onerror={(e) => (e.target.src = 'https://via.placeholder.com/400x400?text=No+Image')}
						/>
					{:else}
						<div
							class="flex h-40 w-full items-center justify-center rounded-t-lg bg-gray-200 text-gray-500"
						>
							No Image
						</div>
					{/if}
					<div class="p-3">
						<h3 class="font-serif line-clamp-2 text-xs" title={artwork.title}>
							{artwork.title}
						</h3>
						{#if artwork.creator}
							<p class="font-serif mt-1 text-[0.5rem] text-gray-600">
								By {artwork.creator}
							</p>
						{/if}
					</div>
				</a>
			</div>
		</div>
	{/each}
</div>

<style>
	.artwork-card:hover img {
		@apply scale-[1.01];
	}
</style>
