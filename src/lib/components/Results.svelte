<script>
	 import { scale } from "svelte/transition";
	 import { quintOut } from "svelte/easing";
	let { result, isLoading } = $props();
	
</script>

<div class="relative rounded-lg border shadow-sm hover:shadow-md">
	<div class="aspect-square relative bg-gray-100">
		<div class="overflow-hidden rounded-lg border shadow-sm hover:shadow-md">
			{#if result.thumbnail && !isLoading}
				<img
					src={result.thumbnail}
					transition:scale={{ delay: 250, duration: 300, easing: quintOut }}
					alt={result.title}
					class="h-48 w-full object-cover"
					onerror={(e) => (e.target.src = 'https://via.placeholder.com/300x200?text=No+Image')}
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
		<div class="mt-1 flex items-center justify-center">
			<span class="text-xs text-gray-500">
				{#if result.source === 'artic'}
					Art Institute Chicago
				{:else}
					The Metropolitan Museum of Art
				{/if}
			</span>
			{#if isLoading}
				<span class="text-xs text-indigo-500">Loading details...</span>
			{/if}
		</div>
	</div>

	{#if isLoading}
		<div class="absolute inset-0 flex items-center justify-center bg-white/50">
			<div
				class="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"
			></div>
		</div>
	{/if}
</div>
