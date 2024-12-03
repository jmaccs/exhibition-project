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

<div class="relative h-16 w-16 self-end object-contain">
	<a href="/">
		<canvas bind:this={canvas} width={16} height={16}></canvas>
	</a>
</div>

<style>
	canvas {
		position: absolute;
		left: 0;
		bottom: 0;
		margin-bottom: 0;
		width: 100%;
		height: 100%;
		background-color: #666;
		mask: url(./palette.svg) 50% 50% no-repeat;
		mask-size: 10vmin;
		-webkit-mask: url(./palette.svg) 50% 50% no-repeat;
		-webkit-mask-size: 10vmin;
	}
</style>
