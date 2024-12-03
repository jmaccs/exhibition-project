<script>
	import { onMount } from 'svelte';
	import { spring } from 'svelte/motion';

	/** @type {Array<{ title: string, thumbnail: string }>} */
	let { userCollection } = $props();
	let stage;
	let activeIndex = $state(0)
	let dragStart = $state(null);

	let lastIndex = $derived(userCollection.length - 1);
	const angle = 20;

	
	const rotation = spring(0, {
		stiffness: 0.1,
		damping: 0.4
	});

	function handleDragStart(e) {
		dragStart = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
	}

	function handleDragEnd(e) {
		if (!dragStart) return;
		
		const currentX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
		const diff = currentX - dragStart;
		
		if (Math.abs(diff) > 10) {
			moveSlide(diff > 0 ? 'prev' : 'next');
		}
		
		dragStart = null;
	}

	function handleKeyDown(event) {
		if (event.key === 'ArrowRight') {
			moveSlide('next');
		} else if (event.key === 'ArrowLeft') {
			moveSlide('prev');
		}
	}

	function moveSlide(side) {
		if ((side === 'next' && activeIndex < lastIndex) || (side === 'prev' && activeIndex > 0)) {
			side === 'next' ? activeIndex++ : activeIndex--;
			const multiplier = side === 'next' ? 1 : -1;
			rotation.set($rotation + (multiplier * angle));
		}
	}

	onMount(() => {
		stage.addEventListener('keydown', handleKeyDown);
		return () => {
			stage.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<div class="stage" 
	bind:this={stage}
	tabindex="0"
	onmousedown={handleDragStart}
	onmouseup={handleDragEnd}
	ontouchstart={handleDragStart}
	ontouchend={handleDragEnd}>
	<div class="container" style="perspective: 900px;">
		<div class="ring" style="transform: rotateY({$rotation}deg);">
			{#each userCollection as artwork, index}
				<div
					class="img"
					class:active={index === activeIndex}
					data-id={index}
					style="transform: {`rotateY(${index * -angle}deg) translateZ(-800px)`};"
				>
					<img alt={artwork.title} src={artwork.thumbnail} />
				</div>
			{/each}
		</div>
	</div>
	<div class="buttons">
		<button 
			class="prev" 
			onclick={() => moveSlide('prev')}
			disabled={activeIndex === 0}
		>
			prev
		</button>
		<button 
			class="next"
			onclick={() => moveSlide('next')}
			disabled={activeIndex === lastIndex}
		>
			next
		</button>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
	
	}

	.stage {
		position: relative;
		outline: none;
		height: 100%;
		width: 100%;
	}

	.container {
		overflow: hidden;
		height: 100%;
	}

	.ring {
		transform-style: preserve-3d;
		user-select: none;
		position: relative;
		height: 100%;
		transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	.img {
		position: absolute;
		width: 240px;
		height: 240px;
		left: 50%;
		top: 50%;
		margin-left: -120px;
		margin-top: -120px;
		backface-visibility: hidden;
		border-radius: 14px;
		border: 2px solid #5e5e5e;
		background: linear-gradient(
			141deg,
			rgba(217, 217, 217, 0.12) 15.25%,
			rgba(217, 217, 217, 0) 127.34%
		);
		backdrop-filter: blur(74px);
		display: flex;
		justify-content: center;
		align-items: center;
		transition: all 0.3s ease-out;
	}

	.img.active {
		border-color: #007bff;
		box-shadow: 0 0 15px rgba(0, 123, 255, 0.5);
	}

	.img img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 12px;
	}

	.buttons {
		position: absolute;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 100;
		display: flex;
		gap: 1rem;
	}

	button {
		padding: 0.5rem 1rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		color: gray;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	button:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.2);
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
