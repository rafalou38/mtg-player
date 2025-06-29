<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';
	import type { CardData } from '$lib/types/Card';
	import { boardState } from '$lib/stores/Board.svelte';

	let {
		data = $bindable(),
		start_drag,
		end_drag,
		hand: in_hand,
		force_drag,
		can_tap
	}: {
		data: CardData;
		start_drag: () => void | true;
		end_drag: () => void;
		hand?: boolean;
		force_drag?: boolean;
		can_tap?: boolean;
	} = $props();

	const slide_scale = 5;
	let tapped = $state(false);

	let dragStart = { x: 0, y: 0 };
	let initialPosition = { x: 0, y: 0 };

	let dragging = $state(false);
	let moved = false;
	let clientX = 0;
	let clientY = 0;

	let ECard: HTMLButtonElement;
	function onmousemove(e: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (!data?.position) return;

		clientX = e.clientX;
		clientY = e.clientY;
		if (dragging) {
			// Calculate the delta from the initial drag data.position
			const deltaX = e.clientX - dragStart.x;
			const deltaY = e.clientY - dragStart.y;

			data.position.x = initialPosition.x + deltaX / boardState.zoom;
			data.position.y = initialPosition.y + deltaY / boardState.zoom;
		}
		moved = true;
	}
	function onmousedown(e: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (!data.position) return;
		if (start_drag()) return;

		const rect = e.currentTarget.getBoundingClientRect();

		dragging = true;
		moved = false;

		boardState.dragging_card = data;
		boardState.dragging = true;

		dragStart.x = e.clientX;
		dragStart.y = e.clientY;

		initialPosition = { ...data.position };
	}

	function onmouseup() {
		if (in_hand) return;

		if (!moved && can_tap) {
			tapped = !tapped;
		}
		dragging = false;

		setTimeout(() => {
			boardState.dragging_card = undefined;
			boardState.dragging = false;
			end_drag();
		}, 10);
	}

	function start_forced_drag() {
		const board = document.querySelector('.board');
		if (!board) return;

		const boardRect = board.getBoundingClientRect();
		const rect = ECard.getBoundingClientRect();

		dragging = true;
		moved = true;

		boardState.dragging_card = data;
		boardState.dragging = true;

		dragStart.x = clientX;
		dragStart.y = clientY;

		initialPosition.x = (clientX - boardRect.left - rect.width / 2) / boardState.zoom;
		initialPosition.y = (clientY - boardRect.top - rect.height / 2) / boardState.zoom;

		start_drag();
	}

	$effect(() => {
		if (force_drag) {
			start_forced_drag();
			force_drag = false;
		}
	});
</script>

<svelte:body {onmousemove} {onmouseup} oncontextmenu={(e) => e.preventDefault()} />

<button
	class="card"
	class:hand={in_hand}
	style="--x: {data.position.x}px; --y: {data.position.y}px; z-index: {data.order}"
	hidden={dragging && (boardState.hand_dropping_index != undefined || boardState.pile_dropping)}
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
		height: 280px;
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
			/* position: relative; */
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
			pointer-events: none;
		}
		/* &:active {
			cursor: pointer;
			transition: all 40ms linear;
			transform: scale(1.05) translate(calc(var(--mouse-x) * 1px), calc(var(--mouse-y) * 1px));
		} */
	}
</style>
