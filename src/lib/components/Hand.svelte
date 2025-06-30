<script lang="ts">
	import { board_self, hand, setBoardSelf, setHand } from '$lib/stores/Cards.svelte';
	import type { CardData } from '$lib/types/Card';
	import { scale } from 'svelte/transition';
	import Card from './Card.svelte';
	import { expoIn, expoOut } from 'svelte/easing';
	import { boardState } from '$lib/stores/Board.svelte';

	let { dragOut } = $props() as {
		dragOut: (card: CardData) => void;
	};

	let handElement: HTMLDivElement;
	let zoom = 1;

	let gap = $state(-40);

	let hand_state = $state(hand);
	let stale;

	$effect(() => {
		if (!handElement) return;
		let rect = handElement.getBoundingClientRect();
		let n_gap = rect.width / hand_state.length - 150;
		if (n_gap > -20) n_gap = -20;

		if (gap != n_gap) {
			gap = n_gap;
		}
	});

	function drag_out_transition(
		node: HTMLElement,
		params: { delay?: number; duration?: number; easing?: (t: number) => number }
	) {
		const start_width: number = 160;
		const end_width: number = -gap;
		return {
			delay: params.delay || 0,
			duration: params.duration || 500,
			easing: params.easing || expoOut,
			css: (t, u) => {
				const width = (1 - t) * end_width + t * start_width;
				return `width: ${width}px; opacity: 0`;
			}
		};
	}

	let removeTimeout = 0;
	let prevX = 0;
	function onCardHover(
		card: CardData,
		e: MouseEvent & {
			currentTarget: HTMLElement;
		}
	) {
		clearTimeout(removeTimeout);

		if (card.id == -1) {
			return;
		}

		let d = prevX - e.clientX;
		prevX = e.clientX;

		// Insert virtual card just before hovered card if draging.
		hand_state = hand_state.filter((c) => c.id != -1);
		if (boardState.dragging && boardState.dragging_card) {
			let index = hand_state.indexOf(card);
			if (empty) {
				hand_state = [{ ...boardState.dragging_card, id: -1 }];
				boardState.hand_dropping_index = 0;
			} else if (index > -1) {
				if (d > 0) {
					hand_state.splice(index + 1, 0, { ...boardState.dragging_card, id: -1 });
				} else {
					// OK
					hand_state.splice(index, 0, { ...boardState.dragging_card, id: -1 });
				}
				boardState.hand_dropping_index = index;
			}
		}
	}
	function onCardLeave() {
		removeTimeout = setTimeout(() => {
			hand_state = hand_state.filter((c) => c.id != -1);
			boardState.hand_dropping_index = undefined;
		}, 100);
	}

	function onmouseup() {
		if (
			boardState.dragging &&
			boardState.hand_dropping_index != undefined &&
			boardState.dragging_card != undefined
		) {
			let data = boardState.dragging_card;

			hand_state = hand_state.map((c) => {
				if (c.id == -1) {
					return data;
				}
				return c;
			});

			boardState.hand_dropping_index = undefined;
			boardState.dragging = false;
			boardState.dragging_card = undefined;

			setBoardSelf(board_self.filter((c) => c.id != data.id));
			setHand(hand_state);
		}
	}
	let empty_hand_card: CardData = {
		id: -3,
		img: 'card_bg.jpg',
		order: 0,
		position: { x: 0, y: 0 }
	};
	let empty = $derived(hand_state.length == 0);
</script>

<svelte:body {onmouseup} />
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="hand"
	class:dragging={boardState.dragging}
	style="--gap: {gap}px"
	bind:this={handElement}
>
	{#each empty ? [empty_hand_card] : hand_state as card, i (card.id)}
		<div
			class="hand-item"
			class:dropped={card.id == -1}
			out:drag_out_transition
			onmouseleave={() => onCardLeave()}
			onmouseenter={(e) => onCardHover(card, e)}
		>
			<div
				class="card-wrapper"
				style="--index: {Math.round(i - hand_state.length / 2)}"
				onmouseenter={() => {
					// active_card = i;
				}}
			>
				<!-- {#if card.id != -1} -->
				{#if empty}
					<Card hand data={empty_hand_card} start_drag={() => {}} end_drag={() => {}} />
				{:else}
					<Card
						hand
						bind:data={hand_state[i]}
						start_drag={() => {
							if (empty) return;
							if (card.id == -1) return;
							boardState.hand_dropping_index = i;
							setTimeout(() => {
								hand_state.splice(i, 1);
								setHand(hand_state);
							}, 1000);
							dragOut(card);
							console.log(card);
						}}
						end_drag={() => {}}
					/>
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	.hand {
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

		transition: all 200ms ease-out 100ms;
	}
	.hand-item {
		flex-grow: 0;
		flex-shrink: 0;
		width: 150px;
		min-height: 200px;
		margin-right: var(--gap);
		margin-left: 0px;

		z-index: 1000;

		transition: all 200ms ease-out 100ms;

		&:last-of-type {
			margin-left: 0;
		}

		.card-wrapper {
			margin-right: 0px;
			margin-left: 0px;
			width: 100%;
			translate: 0 calc(abs(var(--index)) * 5px);
			rotate: calc(var(--index) * -1deg);
			transition: all 200ms ease-out 100ms;
		}
		&.dropped {
			width: 160px;
			.card-wrapper {
				translate: 0 -20px;
				rotate: 0deg;
			}
		}
	}

	.hand:not(.dragging) {
		&:hover {
			translate: 0 -20px;
		}
		.hand-item:hover {
			margin-right: 10px;
			margin-left: calc(10px - var(--gap));
			width: 200px;

			.card-wrapper {
				translate: 0 -80px;
				rotate: 0deg;
			}
		}
	}
</style>
