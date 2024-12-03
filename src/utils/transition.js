export function typewriter(node, { speed = 1, scaleSpeedByLength = true }) {
	// Validate the node
	const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;
	if (!valid) {
		throw new Error(`This transition only works on elements with a single text node child`);
	}

	
	const text = node.textContent;
	const baseDuration = text.length / (speed * 0.01);


	const duration = scaleSpeedByLength ? Math.min(baseDuration, 10000) : baseDuration; 

	return {
		duration,
		tick: (t) => {
			
			const i = Math.trunc(text.length * t);
			node.textContent = text.slice(0, i);
		}
	};
}
