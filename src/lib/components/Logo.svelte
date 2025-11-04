<script>
	import { paint } from '../../utils/paint.js';

	let canvas;

	$effect(() => {
		const context = canvas.getContext('2d');

		let frame = requestAnimationFrame(function loop(t) {
			frame = requestAnimationFrame(loop);
			paint(context, t);
		});

		return () => {
			cancelAnimationFrame(frame);
		};
	});
</script>

<div class="relative h-10 w-10 md:h-12 md:w-12 flex items-baseline">
	<a href="/" class="block h-full w-full">
		<canvas bind:this={canvas} class="h-full w-full" width={16} height={16}></canvas>
	</a>
</div>

<style>
	canvas {
		position: absolute;
		inset: 0;
		background-color: #666;
		mask: url(./palette.svg) center / contain no-repeat;
		-webkit-mask: url(./palette.svg) center / contain no-repeat;
	}
</style>