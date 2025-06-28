<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';
	import type { CardData } from '$lib/types/Card';
	import { boardState } from '$lib/stores/Cards.svelte';

	let {
		data,
		start_drag,
		end_drag,
		zoom,
		scroll_position,
		hand,
		force_drag
	}: {
		data: CardData;
		start_drag: () => void;
		end_drag: () => void;
		zoom: number;
		scroll_position: { x: number; y: number };
		hand?: boolean;
		force_drag?: boolean;
	} = $props();

	const slide_scale = 5;
	let tapped = $state(false);

	let position = $state({ x: 0, y: 0 });
	let dragStart = { x: 0, y: 0 };
	let initialPosition = { x: 0, y: 0 };

	let dragging = $state(false);
	let moved = false;
	let clientX = 0;
	let clientY = 0;

	let ECard: HTMLButtonElement;
	function onmousemove(e: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		clientX = e.clientX;
		clientY = e.clientY;
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
		if (hand) return;

		if (!moved) {
			tapped = !tapped;
		}
		dragging = false;
		end_drag();
	}

	function start_forced_drag() {
		const board = document.querySelector('.board');
		if (!board) return;

		const boardRect = board.getBoundingClientRect();
		const rect = ECard.getBoundingClientRect();

		dragging = true;
		moved = true;

		console.log(scroll_position);

		dragStart.x = clientX;
		dragStart.y = clientY;

		initialPosition.x = (clientX - boardRect.left - rect.width / 2) / zoom;
		initialPosition.y = (clientY - boardRect.top - rect.height / 2) / zoom;

		start_drag();
	}

	$effect(() => {
		if (force_drag) {
			start_forced_drag();
			force_drag = false;
		}
	});
	$effect(() => {
		boardState.dragging = dragging;
	});
</script>

<svelte:body {onmousemove} {onmouseup} oncontextmenu={(e) => e.preventDefault()} />

<button
	class="card"
	class:hand
	style="--x: {position.x}px; --y: {position.y}px; z-index: {data.order}"
	class:tapped
	class:dragging
	{onmousedown}
	bind:this={ECard}
>
	<img src={data.img.replace('normal', 'large')} alt="" draggable="false" />
</button>

<style>
	.card {
		position: absolute;

		cursor: pointer;

		width: 200px;
		overflow: hidden;
		border-radius: 10px;
		box-shadow: -1px 2px 5px 0 rgba(0, 0, 0, 0.2);
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

		&.hand {
			translate: 0 0;
			scale: 1;
			position: relative;
			width: auto;
			height: auto;
			border-radius: 8px;
			box-shadow: -6px 2px 5px 0 black;
		}

		&.tapped {
			rotate: 90deg;
		}

		&:hover {
			scale: 1.025 !important;
			box-shadow: 0px 0px 8px 4px rgba(0, 0, 0, 0.24);
		}
		&.dragging {
			scale: 1.025 !important;
			z-index: 1000000;
		}
		/* &:active {
			cursor: pointer;
			transition: all 40ms linear;
			transform: scale(1.05) translate(calc(var(--mouse-x) * 1px), calc(var(--mouse-y) * 1px));
		} */
	}
</style>
