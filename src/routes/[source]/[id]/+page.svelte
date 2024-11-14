<script>
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	let { data } = $props();
	let formMessage = $state('');
	let formError = $state(false);
	let isSubmitting = $state(false);

	function handleSubmit() {
		isSubmitting = true;
		return async ({ result }) => {
			isSubmitting = false;
			if (result.type === 'failure') {
				formError = true;
				formMessage = result.data?.message || 'Failed to add to collection';
			} else if (result.type === 'success') {
				formError = false;
				formMessage = 'Successfully added to collection!';
				setTimeout(() => {
					goto('/collection');
				}, 1500);
			}
		};
	}
</script>

<div class="container mx-auto px-4 py-8">
	{#await data}
		<div role="status">
			<svg
				aria-hidden="true"
				class="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
				viewBox="0 0 100 101"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
					fill="currentColor"
				/>
				<path
					d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
					fill="currentFill"
				/>
			</svg>
			<span class="sr-only">Loading...</span>
		</div>
	{:then data}
		{@const artwork = data.artwork}
		{@const user = data.user}
		<div class="grid gap-8 md:grid-cols-2">
			<div class="flex-col justify-items-center">
				<div class="aspect-square relative">
					{#if artwork.image}
						<img
							src={artwork.image}
							alt={artwork.title}
							class="z-0 h-full w-full rounded-lg object-contain"
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
				{#if !user}
					<div class="mt-8 text-center">
						<p class="mb-4 text-gray-600">Please log in to add artworks to your collection</p>
						<a
							href="/login"
							class="inline-block rounded-lg bg-blue-600 p-4 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
						>
							Log in
						</a>
					</div>
				{:else}
					<form action="?/addToCollection" method="POST" use:enhance={handleSubmit}>
						<input type="hidden" name="artwork" value={JSON.stringify(artwork)} />
						<button
							type="submit"
							class="mt-8 w-full rounded-lg bg-blue-600 p-4 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
							disabled={isSubmitting}
						>
							{#if isSubmitting}
								Adding to collection...
							{:else}
								Add to personal collection
							{/if}
						</button>
						{#if formMessage}
							<div
								class={`mt-4 rounded-lg p-4 ${formError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
							>
								{formMessage}
							</div>
						{/if}
					</form>
				{/if}
			</div>
			<div>
				<h1 class="mb-4 font-sans text-xl font-bold xl:text-2xl">{artwork.title}</h1>
				{#if artwork.creator}
					<p class="text-l mb-4 font-sans text-gray-600 xl:text-xl">By {artwork.creator}</p>
				{/if}
				{#if artwork.description}
					<div class="mb-6 rounded-lg border border-dashed bg-white p-4">
						<h2 class="text-md xl:text-l mb-2 font-sans">Description</h2>
						<article class="prose-xs font-sans lg:prose-sm">
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
							<a href={artwork.link}> Object Link </a>
							Art Institute of Chicago
						{:else}
							<a href={artwork.link}> Object Link </a>
							Metropolitan Museum
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
	{/await}
	<div class="mt-8">
		<hr class="dashed" />
		<div class="mt-8">
			<a
				href="/search"
				class="mb-6 h-auto w-8 items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-400"
			>
				← Back to Search
			</a>
		</div>
	</div>
</div>
