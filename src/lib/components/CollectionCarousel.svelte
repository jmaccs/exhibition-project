<script>
	import { onMount } from 'svelte';
	import { spring } from 'svelte/motion';

	let { userCollection } = $props();
	let length = $derived(userCollection.length)
	let sliderStyle = $derived(`--quantity: ${length}`)
	
	let isRotating = $state(true);
	let currentRotation = $state(0);
	
	function toggleRotation() {
		isRotating = !isRotating;
	}

	function handleKeydown(event) {
		if (event.key === 'ArrowLeft') {
			currentRotation += 360/length;
		} else if (event.key === 'ArrowRight') {
			currentRotation -= 360/length;
		} else if (event.key === ' ') {
			toggleRotation();
		}
	}

	$effect(() => {
		if (isRotating) {
			const interval = setInterval(() => {
				currentRotation -= 1;
			}, 50);
			return () => clearInterval(interval);
		}
	});
</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="banner">
	<div 
		class="slider" 
		style="{sliderStyle}; --rotation: {currentRotation}deg"
		on:click={toggleRotation}
	>
		{#each userCollection as art, i}
			{@const style = `--position: ${i+1}`}
			{@const url = art.thumbnail}
			{@const alt = art.title}
			<div class="item" style={style}>
				<img src={url} alt={alt}>
			
			</div>
		{/each}
	</div>
	<div class="controls">
		<p class="text-sm font-serif text-gray-600">
			Space to pause/play • Arrow keys to navigate
		</p>
	</div>
</div>

<style>
	.banner {
		width: 100%;
		height: 500px;
		text-align: center;
		overflow: hidden;
		position: relative;
		background: transparent;
	}

	.controls {
		position: absolute;
		bottom: 20px;
		left: 0;
		right: 0;
		text-align: center;
	}

	.slider {
		position: absolute;
		width: 200px;
		height: 250px;
		top: 50%;
		left: 50%;
		transform-style: preserve-3d;
		transform: translate(-50%, -50%) perspective(1000px) rotateX(-10deg) rotateY(var(--rotation));
		z-index: 2;
		cursor: pointer;
	}

	.slider .item {
		position: absolute;
		inset: 0;
		transform: rotateY(calc((var(--position) - 1) * (360 / var(--quantity)) * 1deg)) translateZ(400px);
		transition: transform 0.5s ease;
	}

	.slider .item:hover {
		transform: rotateY(calc((var(--position) - 1) * (360 / var(--quantity)) * 1deg)) translateZ(420px);
	}

	.slider .item img {
		width: 60%;
		height: 60%;
		object-fit: cover;
		border-radius: 8px;
		box-shadow: 0 5px 15px rgba(0,0,0,0.3);
	}

	/* .caption {
		position: absolute;
		bottom: -3px;
		left: 0;
		right: 0;
		text-align: center;
		color: #4a5568;
		font-size: 0.875rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		padding: 0 5px;
	} */

	@media screen and (max-width: 1023px) {
		.slider {
			width: 160px;
			height: 200px;
		}
		.slider .item {
			transform: rotateY(calc((var(--position) - 1) * (360 / var(--quantity)) * 1deg)) translateZ(300px);
		}
		.slider .item:hover {
			transform: rotateY(calc((var(--position) - 1) * (360 / var(--quantity)) * 1deg)) translateZ(320px);
		}
	}

	@media screen and (max-width: 767px) {
		.slider {
			width: 120px;
			height: 150px;
		}
		.slider .item {
			transform: rotateY(calc((var(--position) - 1) * (360 / var(--quantity)) * 1deg)) translateZ(200px);
		}
		.slider .item:hover {
			transform: rotateY(calc((var(--position) - 1) * (360 / var(--quantity)) * 1deg)) translateZ(220px);
		}
	}
</style>
