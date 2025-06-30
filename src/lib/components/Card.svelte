<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';
	import type { CardData, CardId } from '$lib/types/Card';
	import { assert } from '$lib/util/assert';
	import { gameManager } from '$lib/stores/GameStateManager.svelte';
	import { Vector2 } from '$lib/util/math.svelte';
	import { onDestroy, onMount } from 'svelte';

	let {
		data,
		start_drag,
		end_drag,
		can_tap,
		in_hand
	}: {
		data: CardData;
		start_drag: () => void | true;
		end_drag: () => void;
		can_tap?: boolean;
		in_hand?: boolean; // for appearance
	} = $props();

	let dragStart = Vector2.zero;
	let initialPosition = Vector2.zero;
	let moved = false;

	let dragging = $state(false);

	function onmousedown(e: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		assert(data !== undefined && data.position != undefined, 'Card position is undefined');

		gameManager.cursor_position.x = e.clientX;
		gameManager.cursor_position.y = e.clientY;

		console.log('start drag', e.clientX, e.clientY);

		if (e.buttons != 1) return;
		if (start_drag()) return;

		console.log('passed drag');

		dragStart.x = e.clientX;
		dragStart.y = e.clientY;

		initialPosition.x = data.position.x;
		initialPosition.y = data.position.y;

		dragging = true;
		moved = false;
	}

	function onmousemove(e: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		assert(data != undefined && data.position != undefined, 'Card position is undefined');

		if (dragging) {
			// Calculate the delta from the initial drag data.position
			const deltaX = e.clientX - dragStart.x;
			const deltaY = e.clientY - dragStart.y;

			gameManager.setCardPosition(
				data.id,
				initialPosition.x + deltaX / gameManager.zoom,
				initialPosition.y + deltaY / gameManager.zoom
			);
			moved = true;
		}
	}

	function onmouseup() {
		if (!moved && can_tap && dragging) {
			gameManager.tapCard(data.id);
		}

		dragging = false;

		end_drag();
	}
	let ECard: HTMLElement;
	onMount(() => {
		if (gameManager.dragging && gameManager.dragging_card?.id == data.id) {
			assert(data !== undefined && data.position != undefined, 'Card position is undefined');
			const board = document.querySelector('.board');
			if (!board) return;

			const boardRect = board.getBoundingClientRect();
			const rect = ECard.getBoundingClientRect();

			dragStart.x = gameManager.cursor_position.x;
			dragStart.y = gameManager.cursor_position.y;

			initialPosition.x = (gameManager.cursor_position.x - boardRect.left - rect.width / 2) / gameManager.zoom;
			initialPosition.y = (gameManager.cursor_position.y - boardRect.top - rect.height / 2) / gameManager.zoom;

			dragging = true;
			moved = true;
		}
	});
</script>

<svelte:body {onmousemove} {onmouseup} oncontextmenu={(e) => e.preventDefault()} />

<button
	class="card"
	class:hand={in_hand}
	class:tapped={data.tapped}
	class:dragging
	style="--x: {data.position.x}px; --y: {data.position.y}px; z-index: {data.order}"
	hidden={dragging &&
		(gameManager.hand_dropping_index != undefined || gameManager.pile_dropping != undefined)}
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
