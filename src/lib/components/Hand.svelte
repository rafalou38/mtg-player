<script lang="ts">
	import type { CardData } from '$lib/types/Card';
	import { scale } from 'svelte/transition';
	import Card from './Card.svelte';
	import { expoIn, expoOut, quadIn, quadInOut } from 'svelte/easing';
	import { gameManager } from '$lib/stores/GameStateManager.svelte';
	import { Vector2 } from '$lib/util/math.svelte';
	import { assert } from '$lib/util/assert';

	let handElement: HTMLDivElement;

	let gap = $state(0);
	$effect(() => {
		if (!handElement) return;
		let rect = handElement.getBoundingClientRect();
		let n_gap = rect.width / gameManager.hand.length - 150;
		if (n_gap > -20) n_gap = -20;

		// console.log(n_gap);
		gap = n_gap;
	});

	let empty = $derived(gameManager.hand.length == 0);
	let activeCardIndex: number = $state(-1);
	let dragging_out = $state(false);
	let pending_removal = $state<CardData | undefined>(undefined);

	function onmousemove(e: MouseEvent & { currentTarget: HTMLElement }) {
		let match = null;
		let i = 0;
		for (const child of e.currentTarget.children) {
			let rect = child.getBoundingClientRect();
			if (rect.left < e.clientX && rect.right > e.clientX) match = i;
			i++;
		}

		if (match != null) {
			if (dragging_out && pending_removal) {
				gameManager.moveCardInHand(pending_removal.id, match);
			}
			activeCardIndex = match;
		}
	}

	function onmouseup() {
		if (dragging_out) {
			if (activeCardIndex != -1 && pending_removal) {
				gameManager.moveCardFromBoardToHand(pending_removal.id, activeCardIndex);
			}

			activeCardIndex = -1;
			dragging_out = false;
			assert(pending_removal, 'Pending removal is undefined');

			gameManager.removeCardFromHand(pending_removal.id);
			return;
		}
	}
	function onmouseenter(e: MouseEvent & { currentTarget: HTMLElement }) {
		// Update active card index
		onmousemove(e);

		// Update dragging out
		if (gameManager.dragging && gameManager.dragging_card && !dragging_out) {
			dragging_out = true;
			gameManager.addCardToHand(gameManager.dragging_card, activeCardIndex);
			pending_removal = gameManager.dragging_card;
			console.log(activeCardIndex);
		}
	}

	// function squish(
	// 	node: HTMLElement,
	// 	params: { delay?: number; duration?: number; easing?: (t: number) => number }
	// ) {
	// 	return {
	// 		delay: params.delay || 0,
	// 		duration: params.duration || 400,
	// 		easing: params.easing || quadIn,
	// 		css: (t: number, u: number) => `width: ${150 * t}px`
	// 	};
	// }
</script>

<svelte:body {onmouseup} />
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="hand"
	class:dragging={gameManager.dragging}
	style="--gap: {gap}px"
	{onmousemove}
	{onmouseenter}
	onmouseleave={() => {
		activeCardIndex = -1;
	}}
	bind:this={handElement}
>
	{#each gameManager.hand as card, i (card.id)}
		<div
			class="hand-item"
			class:active={activeCardIndex == i}
			class:dragged_out={dragging_out && pending_removal == card}
		>
			<div class="card-wrapper" style="--index: {Math.round(i - gameManager.hand.length / 2)}">
				<Card
					data={card}
					in_hand
					start_drag={() => {
						dragging_out = true;
						gameManager.addToBoardDragging(card);
						pending_removal = card;
						return true;
					}}
					end_drag={() => {}}
				/>
			</div>
		</div>
	{/each}
</div>

<style>
	.hand {
		--delay: 0ms;
		position: absolute;
		bottom: 0px;
		width: 80vw;
		left: 10vw;
		height: 160px;

		display: flex;
		flex-direction: row-reverse;
		flex-wrap: nowrap;
		justify-content: center;
		align-items: center;

		translate: 0 90px;

		overflow-y: visible;

		transition: all 200ms ease-out var(--delay);
	}
	.hand-item {
		flex-grow: 0;
		flex-shrink: 0;
		width: 150px;
		min-height: 200px;
		margin-right: var(--gap);
		margin-left: 0px;

		z-index: 1000;

		transition: all 200ms ease-out var(--delay);

		&:last-of-type {
			margin-left: 0;
		}
		&.dragged_out {
			opacity: 0.5;
		}
		.card-wrapper {
			margin-right: 0px;
			margin-left: 0px;
			width: 100%;
			translate: 0 calc(abs(var(--index)) * 5px);
			rotate: calc(var(--index) * -1deg);
			transition: all 200ms ease-out var(--delay);
		}
	}

	.hand {
		&:has(.hand-item.active),
		&.dragging {
			translate: 0 -20px;
		}
		.hand-item.active {
			margin-right: 10px;
			margin-left: calc(10px - var(--gap));
			/* width: 200px; */

			.card-wrapper {
				/* translate: 0 -80px; */
				rotate: 0deg;
			}
		}
	}
</style>
