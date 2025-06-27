<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';
	import type { CardData } from '$lib/types/Card';

	let { data, on_top, zoom }: { data: CardData; on_top: () => void; zoom: number } = $props();

	// console.log(card_id);

	const slide_scale = 5;
	let tapped = $state(false);

	let position = $state({ x: 0, y: 0 });
	let dragStart = { x: 0, y: 0 };
	let initialPosition = { x: 0, y: 0 };

	function onmousemove(e: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		var rect = e.currentTarget.getBoundingClientRect();

		if (dragging) {
			// Calculate the delta from the initial drag position
			const deltaX = e.clientX - dragStart.x;
			const deltaY = e.clientY - dragStart.y;

			position.x = initialPosition.x + deltaX / zoom;
			position.y = initialPosition.y + deltaY / zoom;

			console.log(zoom);

			// position.x = Math.round(position.x / 20) * 20;
			// position.y = Math.round(position.y / 20) * 20;
		} else {
			// var locX = e.clientX - rect.left;
			// var locY = e.clientY - rect.top;
			// let rx = ((locX / e.currentTarget.offsetWidth) * 2 - 1) * slide_scale;
			// let ry = ((locY / e.currentTarget.offsetHeight) * 2 - 1) * slide_scale;
			// e.currentTarget.style.setProperty('--mouse-x', rx.toString());
			// e.currentTarget.style.setProperty('--mouse-y', ry.toString());
		}
	}

	let drag_timeout = 0;
	let dragging = $state(false);

	function cancel_drag_timer() {
		clearTimeout(drag_timeout);
		drag_timeout = 0;
	}
	function onmousedown(e: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		const rect = e.currentTarget.getBoundingClientRect();

		if (drag_timeout != 0) {
			cancel_drag_timer();
		}

		drag_timeout = setTimeout(() => {
			drag_timeout = 0;

			dragging = true;

			dragStart.x = e.clientX;
			dragStart.y = e.clientY;

			initialPosition = { ...position };

			on_top();
		}, 100);
	}

	function onmouseup() {
		if (!dragging && drag_timeout != 0) {
			cancel_drag_timer();
			tapped = !tapped;
		} else {
			dragging = false;
		}
	}
</script>

<svelte:body {onmousemove} {onmouseup} />

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
