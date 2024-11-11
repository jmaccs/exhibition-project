<script>
	const { artwork, onBack } = $props();
</script>

<div class="container mx-auto px-4 py-8">
	<button
		onclick={onBack}
		class="mb-6 flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
	>
		<span>← Back to Search</span>
	</button>

	<div class="grid gap-8 md:grid-cols-2">
		<div class="aspect-square relative">
			{#if artwork.image}
				<img
					src={artwork.image}
					alt={artwork.title}
					class="h-full w-full rounded-lg object-contain"
					onerror={(e) => (e.target.src = 'https://via.placeholder.com/600x600?text=No+Image')}
				/>
			{:else}
				<div
					class="flex h-full w-full items-center justify-center rounded-lg bg-gray-200 text-gray-500"
				>
					No Image Available
				</div>
			{/if}
		</div>
		<div>
			<h1 class="mb-4 font-sans text-xl font-bold xl:text-2xl">{artwork.title}</h1>
			{#if artwork.creator}
				<p class="text-l mb-4 font-sans text-gray-600 xl:text-xl">By {artwork.creator}</p>
			{/if}
			{#if artwork.description}
				<div class="mb-6">
					<h2 class="mb-2 font-sans text-md xl:text-l">Description</h2>
					<article class="lg:prose-sm prose-xs font-sans">
						{@html artwork.description}
					</article>
				</div>
			{/if}
			<div class="space-y-2">
				{#if artwork.medium}
					<p class="text-gray-600">
						<span class="font-semibold">Medium:</span>
						{artwork.medium}
					</p>
				{/if}
				<p class="text-gray-600">
					<span class="font-semibold">Source:</span>
					{#if artwork.source === 'artic'}
						Art Institute of Chicago
					{:else}
						{artwork.provider || artwork.source}
					{/if}
				</p>
				{#if artwork.rights}
					<p class="text-sm text-gray-500">
						<span class="font-semibold">Rights:</span>
						{artwork.rights}
					</p>
				{/if}
			</div>
		</div>
	</div>
</div>
