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
			<div class="container h-[600px] max-w-7xl" transition:fade={{ duration: 500 }}>
				<CollectionCarousel {userCollection} />
			</div>
		{:else if !showSlideShowLoader}
			<div class="artwork" transition:fly={{ y: 200, duration: 1000 }}>
				<div class="artwork-bg">
				<ArtworkGrid artworks={userCollection} />
			</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.artwork {
  background-color:#ddc;
  border:solid 5vmin #eee;
  border-bottom-color:#fff;
  border-left-color:#eee;
  border-radius:2px;
  border-right-color:#eee;
  border-top-color:#ddd;
  box-shadow:0 0 5px 0 rgba(0,0,0,.25) inset, 0 5px 10px 5px rgba(0,0,0,.25);
  box-sizing:border-box;
  display:inline-block;
  margin:1vh 1vw;
  max-height: max-content;
  max-width: max-content;
  padding:8vmin;
  position:relative;
  text-align:center;
  &:before {
    border-radius:2px;
    bottom:-2vmin;
    box-shadow:0 2px 5px 0 rgba(0,0,0,.25) inset;
    content:"";
    left:-2vmin;
	max-width: 1280px;
    position:absolute;
    right:-2vmin;
    top:-2vmin;
  }
  &:after {
    border-radius:2px;
    bottom:-2.5vmin;
    box-shadow: 0 2px 5px 0 rgba(0,0,0,.25);
    content:"";
    left:-2.5vmin;
    position:absolute;
    right:-2.5vmin;
    top:-2.5vmin;
  }
}
	.artwork-bg {
		
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

	}
</style>
