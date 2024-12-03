<script>
	import { page } from '$app/stores';
	import CollectionCarousel from '$lib/components/CollectionCarousel.svelte';
	import { fly, fade } from 'svelte/transition';
	import ArtworkGrid from '$lib/components/ArtworkGrid.svelte';

	let user = $derived($page.data.user);
	let { data } = $props();
	let userCollection = $derived(data.collection);

	let showSlideShowLoader = $state(false);

	let innerWidth = $state(null);
</script>

<svelte:window bind:innerWidth />
<div class="container mx-auto max-w-screen-xl px-4 py-8">
	<h1 class="font-serif mb-8 text-2xl font-bold">{user.name}'s collection</h1>
	{#if data.collection.length === 0}
		<div class="rounded-lg p-8 text-center font-sans">
			<p class="text-gray-600">
				Your collection is empty. Start adding artworks from the search page!
			</p>
			<a
				href="/search"
				class="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 font-sans text-white hover:bg-blue-700"
				tabindex="0"
			>
				Search Artworks
			</a>
		</div>
	{:else}
		<div class="mb-8 flex justify-end">
			<button
				class="rounded-sm text-xs bg-gray-500 px-6 py-2 text-white ring-2 ring-blue-400 ring-offset-2 hover:bg-gray-400"
				onclick={() => (showSlideShowLoader = !showSlideShowLoader)}
				tabindex="0"
			>
				{showSlideShowLoader ? 'Hide' : 'Slide Show View'}
			</button>
		</div>
		{#if showSlideShowLoader}
			<div class="container h-96 max-w-7xl" transition:fade={{ duration: 500 }}>
				<CollectionCarousel {userCollection} />
			</div>
		{:else if !showSlideShowLoader}
			<div class="artwork-bg" transition:fly={{ y: 200, duration: 1000 }}>
				<ArtworkGrid artworks={userCollection} />
			</div>
		{/if}
	{/if}
</div>

<style>
	.artwork-bg {
		height: 200vh;
		max-height: max-content;
		padding: 40px;
		max-width: 2048px;

		--s: 84px;
		--c1: #f2f2f2;
		--c2: #cdcbcc;
		--c3: #999999;

		--_g: 0 120deg, #0000 0;
		background: conic-gradient(at calc(250% / 3) calc(100% / 3), var(--c3) var(--_g)),
			conic-gradient(from -120deg at calc(50% / 3) calc(100% / 3), var(--c2) var(--_g)),
			conic-gradient(from 120deg at calc(100% / 3) calc(250% / 3), var(--c1) var(--_g)),
			conic-gradient(from 120deg at calc(200% / 3) calc(250% / 3), var(--c1) var(--_g)),
			conic-gradient(from -180deg at calc(100% / 3) 50%, var(--c2) 60deg, var(--c1) var(--_g)),
			conic-gradient(from 60deg at calc(200% / 3) 50%, var(--c1) 60deg, var(--c3) var(--_g)),
			conic-gradient(
				from -60deg at 50% calc(100% / 3),
				var(--c1) 120deg,
				var(--c2) 0 240deg,
				var(--c3) 0
			);
		background-size: calc(var(--s) * sqrt(3)) var(--s);
		overflow: hidden;
		mask-image: linear-gradient(
				to bottom,
				rgba(0, 0, 0, 0),
				rgba(0, 0, 0, 1) 2%,
				rgba(0, 0, 0, 1) 98%,
				rgba(0, 0, 0, 0)
			),
			linear-gradient(
				to right,
				rgba(0, 0, 0, 0),
				rgba(0, 0, 0, 1) 2%,
				rgba(0, 0, 0, 1) 98%,
				rgba(0, 0, 0, 0)
			);

		mask-composite: intersect; /* For some browsers */
		-webkit-mask-composite: destination-in;
	}
</style>
