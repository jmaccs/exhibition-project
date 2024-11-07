<script>
	import { tick } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';

	let bookAngle = 60;

	let speed = 5000;
	let borderColor = '#555';
	let imagesLoaded = false;
	let currentPage = 0;

	const imageUrls = [
		'https://picsum.photos/420/300?random=1',
		'https://picsum.photos/420/300?random=2',
		'https://picsum.photos/420/300?random=3',
		'https://picsum.photos/420/300?random=4',
		'https://picsum.photos/420/300?random=5'
	];

	
	let pageStyles = [
		{ angle: 0, animate: false }, 

        { angle: 4.5, animate: true }, 
		{ angle: 180, animate: false } 
	];

	const preloadImages = async () => {
		const imagePromises = imageUrls.map((url) => {
			return new Promise((resolve, reject) => {
				const img = new Image();
				img.onload = () => resolve(url);
				img.onerror = () => reject(url);
				img.src = url;
			});
		});

		try {
			await Promise.all(imagePromises);
			imagesLoaded = true;
		} catch (error) {
			console.error('Failed to load some images:', error);
		}
	};

	onMount(() => {
		preloadImages();
	});

	
	const handleAnimationEnd = () => {
		currentPage = (currentPage + 1) % imageUrls.length;
	};
</script>

{#if !imagesLoaded}
	<div class="fixed flex h-full w-full items-center justify-center bg-grey">
		<div
			class="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
		></div>
	</div>
{/if}
<div class="relative w-[420px] rounded h-[420px] border-white border-solid border-[2px]">
    <h1 class="absolute bg-grey  w-full text-[2em] font-[normal] leading-none left-0 top-[45px];">
        Book
    </h1>
<div
	class="book"
>
<div class="gap">
<div class="h-[300px] w-[210px] rounded-sm {!imagesLoaded
		? 'opacity-0'
		: 'opacity-100'} transition-opacity duration-500 transform-style-preserve-3d">
	{#each pageStyles as { angle, animate }, index}

		<div
			class="page {animate ? 'turning-page' : ''}"
			style="
				--borderColor: {borderColor};
				--currentImage: url('{imageUrls[currentPage % imageUrls.length]}');
				--nextImage: url('{imageUrls[(currentPage + 1) % imageUrls.length]}');
				--bookAngle: {bookAngle}deg;
				--pageAngle: {angle}deg;
				--animationDuration: {speed}ms;
				transform: rotateX(var(--bookAngle)) rotateY(var(--pageAngle));
			"
			onanimationend={animate ? handleAnimationEnd : null}
		>
			<div class="page-content" style="background-image: var(--currentImage)"></div>
			<div class="page-back" style="background-image: var(--nextImage)"></div>
		</div>
	{/each}
</div>
</div>
</div>
</div>
<style>
	@keyframes turnPage {
		from {
			transform: rotateX(var(--bookAngle)) rotateY(3deg);
		}
		to {
			transform: rotateX(var(--bookAngle)) rotateY(180deg);
		}
	}
    .book {
    position: relative;
    perspective: 630px;
    perspective-origin: center 50px; 
    transform: scale(1.2);
    border-radius: .125rem; 
    filter: drop-shadow(0px 10px 5px rgba(0,0,0,0.25));
}

	.page {
		width: 210px;
		height: 300px;
		position: absolute;
		top: 0;
		right: 50%;
		transform-style: preserve-3d;
		transform-origin: 100% 50%;
	}
	.page::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(to right, rgba(0,0,0,0.1), rgba(0,0,0,0));
		pointer-events: none;
	}
	.turning-page {
		animation: turnPage var(--animationDuration) cubic-bezier(0.4, 0, 0.2, 1) infinite;
		z-index: 10;
	}

	.page-content {
		width: 100%;
		height: 100%;
		position: absolute;
		backface-visibility: hidden;
		background-color: #bbb;
		border: solid 2px var(--borderColor, #555);
		background-size: 420px 300px;
		background-position: center;

	}

	.page-back {
		width: 100%;
		height: 100%;
		position: absolute;
		backface-visibility: hidden;
		background-color: #bbb;
		border: solid 2px var(--borderColor, #555);
		background-size: 420px 300px;
		background-position: center;
		transform: rotateY(180deg);
	}

	.page::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(to right, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));
		pointer-events: none;
	}

	.turning-page::after {
		animation: shadowFade var(--animationDuration) ease-in-out;
	}

	@keyframes shadowFade {
		0% {
			opacity: 0.1;
		}
		50% {
			opacity: 0.5;
		}
		100% {
			opacity: 0.1;
		}
	}
</style>
