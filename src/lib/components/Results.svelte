<script>
	export let result;
</script>

<div class="rounded-lg border shadow-sm transition-shadow hover:shadow-md">
	<div class="aspect-square relative bg-gray-100">
		<div class="overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md">
			{#if result.thumbnail}
				<img
					src={result.thumbnail}
					alt={result.title}
					class="h-48 w-full object-cover"
					on:error={(e) => (e.target.src = 'https://via.placeholder.com/300x200?text=No+Image')}
				/>
			{:else}
				<div class="flex h-48 w-full items-center justify-center bg-gray-200 text-gray-500">
					No Image Available
				</div>
			{/if}
		</div>
	</div>
	<div class="p-3">
		<h3 class="line-clamp-1 text-base font-medium" title={result.title}>{result.title}</h3>
		{#if result.creator}
			<p class="line-clamp-1 text-sm text-gray-600" title={result.creator}>By {result.creator}</p>
		{/if}
		<div class="mt-1">
			<span class="text-xs text-gray-500">
				{#if result.source === 'artic'}
					Art Institute Chicago
				{:else}
					{result.provider || result.source}
				{/if}
			</span>
		</div>
	</div>
</div>
