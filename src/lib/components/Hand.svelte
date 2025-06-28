<script lang="ts">
	import { boardState, hand, setHand } from '$lib/stores/Cards.svelte';
	import type { CardData } from '$lib/types/Card';
	import { scale } from 'svelte/transition';
	import Card from './Card.svelte';
	import { expoIn, expoOut } from 'svelte/easing';

	let { dragOut } = $props() as {
		dragOut: (card: CardData) => void;
	};

	let handElement: HTMLDivElement;
	let zoom = 1;

	let offset = $state(0);
	// let active_card = $state(Math.round(hand.length / 2));
	// let r = 0.5;
	// function onmousemove(e: MouseEvent & { currentTarget: HTMLElement }) {
	// 	let x = e.clientX;
	// 	r = x/window.innerWidth;
	// }

	// function loop() {
	//     requestAnimationFrame(loop);

	//     if(!handElement) return;
	//     let first = handElement.firstElementChild;
	//     let first_rect = first?.getBoundingClientRect();
	//     let last = handElement.lastElementChild;
	//     let last_rect = last?.getBoundingClientRect();
	//     if(!first_rect || !last_rect) return;

	//     if(r<0.2 && first_rect.left < 0){
	//         offset += 10;
	//     }else if (r>0.8 && last_rect.right > window.innerWidth) {
	//         offset -= 10;
	//     }
	// }
	// loop();

	let gap = $state(-40);

	$effect(() => {
		if (!handElement) return;
		let rect = handElement.getBoundingClientRect();
		let n_gap = rect.width / hand.length - 150;
		if (n_gap > -20) n_gap = -20;

		if (gap != n_gap) {
			gap = n_gap;
		}
	});

	function drag_out_transition(
		node: HTMLElement,
		params: { delay?: number; duration?: number; easing?: (t: number) => number }
	) {
		const start_width: number = node.offsetWidth;
		const end_width: number = -gap;
		return {
			delay: params.delay || 0,
			duration: params.duration || 500,
			easing: params.easing || expoOut,
			css: (t, u) => {
				const width = (1 - t) * end_width + t * start_width;
				return `width: ${width}px; opacity: 0;`;
			}
		};
	}

	let removeTimeout = 0;
	function onCardHover(card: CardData) {
		clearTimeout(removeTimeout);

		if (card.id == -1) {
			return;
		}
		// Insert virtual card just before hovered card if draging.
		setHand(hand.filter((c) => c.id != -1));
		if (boardState.dragging && boardState.dragging_card) {
			let index = hand.indexOf(card);
			if (index > -1) {
				hand.splice(index + 1, 0, { ...boardState.dragging_card, id: -1 });
				boardState.hand_dropping_index = index;

				// hand.splice(index + 1, 1);
			}
		}
	}
	function onCardLeave() {
		removeTimeout = setTimeout(() => {
			setHand(hand.filter((c) => c.id != -1));
            boardState.hand_dropping_index = undefined;
		}, 100);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="hand"
	class:dragging={boardState.dragging}
	style="--offset: {offset}px; --gap: {gap}px"
	bind:this={handElement}
>
	{#each hand as card, i (card.id)}
		<div
			class="hand-item border-2 border-black"
			out:drag_out_transition
			onmouseleave={() => onCardLeave()}
			onmouseenter={() => onCardHover(card)}
		>
			<div
				class="card-wrapper"
				style="--index: {Math.round(i - hand.length / 2)}"
				onmouseenter={() => {
					// active_card = i;
				}}
			>
				<!-- {#if card.id != -1} -->
					<Card
						hand
						data={card}
						{zoom}
						start_drag={() => {
                            if(card.id == -1) return;
							hand.splice(i, 1);
							dragOut(card);
						}}
						end_drag={() => {}}
						scroll_position={{ x: 0, y: 0 }}
						force_index={1000 + i}
					/>
				<!-- {/if} -->
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

		translate: var(--offset) 90px;

		overflow-y: visible;
	}
	.hand-item {
		flex-grow: 0;
		flex-shrink: 0;
		width: 150px;
		min-height: 200px;
		margin-right: var(--gap);
		margin-left: 0px;

		z-index: 1000;

		transition: all 400ms linear;

		&:last-of-type {
			margin-left: 0;
		}

		.card-wrapper {
			margin-right: 0px;
			margin-left: 0px;
			width: 100%;
			translate: 0 calc(abs(var(--index)) * 5px);
			rotate: calc(var(--index) * -1deg);
			transition: all 400ms linear;
		}
	}

	.hand:not(.dragging) .hand-item:hover {
		margin-right: 10px;
		margin-left: calc(10px - var(--gap));
		width: 250px;

		.card-wrapper {
			translate: 0 -200px;
			rotate: 0deg;
		}
	}
</style>
