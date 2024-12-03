<script>
	import { page } from '$app/stores';
	import Spinner from '$lib/components/Spinner.svelte';

	import { typewriter } from '../utils/transition';
	let user = $derived($page.data.user);
	let randomArt = $derived($page.data.thumbnails);
	let loading = $derived(randomArt.length === 0);

	let innerWidth = $state(0);

	const messages = [
		'A database of thousands of the greatest works of art produced by mankind.......',
		'A blisteringly powerful search at your fingertips.......',
		'Curate your own (virtual) collection of priceless masterworks.......',
		'Sign up, now!'
	];
	let i = $state(-1);
	$effect(() => {
		const interval = setInterval(() => {
			i += 1;
			i %= messages.length;
			if (i === messages.length - 1) {
				clearInterval(interval);
			}
		}, 10000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<svelte:window bind:innerWidth />

<div class="h-full w-full px-4 py-8">
	<div class="h-32">
		{#if user}
			<span class="p-4 font-sans text-stone-600">
				Hello

				<a
					href="/collection"
					class="text-bold font-serif text-blue m-8 rounded-full border bg-zinc-300 px-6 py-1 text-lg shadow-sm ring-2 ring-blue-200 hover:animate-pulse hover:ring-blue-600"
				>
					{user.name}
					<br />
				</a>
			</span>
		{:else}
			<span class="m-8 p-4 text-stone-600">
				{#key i}
					<a href="register" class="font-serif" in:typewriter={{ speed: 1 }}>
						{messages[i] || ''}
					</a>
				{/key}
			</span>
		{/if}
	</div>
	{#if loading}
		<div class="flex p-8">
			<Spinner />
		</div>
	{:else}
		<div class="carousel-container">
			{#each randomArt as art, index}
				{@const className = `item item${index + 1}`}
				<div class={className}>
					<a href={`${art.source}/${art.id}`}>
						<img
							src={art.thumbnail}
							alt={art.title}
							class="max-h-[200px] w-auto rounded-md object-cover shadow-md"
						/>
						<div class="item-text">
							<h2>
								{art.title} <br />
								{art.creator}
							</h2>
						</div>
					</a>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	*,
	*::before,
	*::after {
		box-sizing: border-box;
	}

	* {
		margin: 0;
	}

	.carousel-container {
		width: 90%;
		max-width: 1536px;
		margin-inline: auto;
		position: relative;
		height: 200px;
		margin-top: 5rem;
		overflow: hidden;
		mask-image: linear-gradient(
			to right,
			rgba(0, 0, 0, 0),
			rgba(0, 0, 0, 1) 20%,
			rgba(0, 0, 0, 1) 80%,
			rgba(0, 0, 0, 0)
		);
	}

	@keyframes scrollLeft {
		to {
			left: -200px;
		}
	}

	.item {
		width: 200px;
		height: 200px;
		border-radius: 6px;
		position: absolute;
		left: max(calc(200px * 15), 100%);
		animation-name: scrollLeft;
		animation-duration: 30s;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
	}

	.item a {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
	}

	.item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.item-text {
		display: none;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(12px);
		color: white;
		padding: 1rem;
		padding-top: 4rem;
		text-wrap: wrap;
		font-family: 'Quivira';
		font-size: 0.75rem;
		line-height: 1rem;
	}

	.carousel-container:hover .item {
		animation-play-state: paused;
	}

	.item:hover .item-text {
		display: block;
	}

	.item1 {
		animation-delay: calc(30s / 15 * (15 - 1) * -1);
	}
	.item2 {
		animation-delay: calc(30s / 15 * (15 - 2) * -1);
	}
	.item3 {
		animation-delay: calc(30s / 15 * (15 - 3) * -1);
	}
	.item4 {
		animation-delay: calc(30s / 15 * (15 - 4) * -1);
	}
	.item5 {
		animation-delay: calc(30s / 15 * (15 - 5) * -1);
	}
	.item6 {
		animation-delay: calc(30s / 15 * (15 - 6) * -1);
	}
	.item7 {
		animation-delay: calc(30s / 15 * (15 - 7) * -1);
	}
	.item8 {
		animation-delay: calc(30s / 15 * (15 - 8) * -1);
	}
	.item9 {
		animation-delay: calc(30s / 15 * (15 - 9) * -1);
	}
	.item10 {
		animation-delay: calc(30s / 15 * (15 - 10) * -1);
	}
	.item11 {
		animation-delay: calc(30s / 15 * (15 - 11) * -1);
	}
	.item12 {
		animation-delay: calc(30s / 15 * (15 - 12) * -1);
	}
	.item13 {
		animation-delay: calc(30s / 15 * (15 - 13) * -1);
	}
	.item14 {
		animation-delay: calc(30s / 15 * (15 - 14) * -1);
	}
	.item15 {
		animation-delay: calc(30s / 15 * (15 - 15) * -1);
	}
</style>
