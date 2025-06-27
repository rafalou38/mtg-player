<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';
	import type { CardData } from '$lib/types/Card';

	let {
		data,
		start_drag,
		end_drag,
		zoom
	}: { data: CardData; start_drag: () => void; end_drag: () => void; zoom: number } = $props();

	const slide_scale = 5;
	let tapped = $state(false);

	let position = $state({ x: 0, y: 0 });
	let dragStart = { x: 0, y: 0 };
	let initialPosition = { x: 0, y: 0 };

	let dragging = $state(false);
	let moved = false;
	function onmousemove(e: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (dragging) {
			// Calculate the delta from the initial drag position
			const deltaX = e.clientX - dragStart.x;
			const deltaY = e.clientY - dragStart.y;

			position.x = initialPosition.x + deltaX / zoom;
			position.y = initialPosition.y + deltaY / zoom;
		}
		moved = true;
	}
	function onmousedown(e: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		const rect = e.currentTarget.getBoundingClientRect();

		dragging = true;
		moved = false;

		dragStart.x = e.clientX;
		dragStart.y = e.clientY;

		initialPosition = { ...position };

		start_drag();
	}

	function onmouseup() {
		if (!moved) {
			tapped = !tapped;
		}
		dragging = false;
		end_drag();
	}
</script>

<svelte:body {onmousemove} {onmouseup} oncontextmenu={(e) => e.preventDefault()} />

<button
	class="card"
	style="--x: {position.x}px; --y: {position.y}px; z-index: {data.order}"
	class:tapped
	class:dragging
	{onmousedown}
>
	<img src={data.img.replace('normal', 'large')} alt="" draggable="false" />
</button>

<style>
	.card {
		position: absolute;

		cursor: pointer;

		width: 200px;
		overflow: hidden;
		border-radius: 13px;
		margin: 1em;
		/* box-shadow: 4px 4px 8px 0px rgba(0,0,0,0.24); */
		transform-origin: center;

		scale: 1;
		translate: var(--x) var(--y);

		transition:
			scale 200ms ease,
			box-shadow 200ms ease,
			rotate 200ms ease;

		img {
			user-select: none;
		}

		&.tapped {
			rotate: 90deg;
		}

		&:hover {
			scale: 1.025 !important;
			box-shadow: 0px 0px 8px 4px rgba(0, 0, 0, 0.24);
		}
		&.dragging {
			scale: 1.05 !important;
		}
		/* &:active {
			cursor: pointer;
			transition: all 40ms linear;
			transform: scale(1.05) translate(calc(var(--mouse-x) * 1px), calc(var(--mouse-y) * 1px));
		} */
	}
</style>
