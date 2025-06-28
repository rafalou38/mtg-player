<script lang="ts">
	import { boardState, hand } from '$lib/stores/Cards.svelte';
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
		let n_gap = rect.width / hand.length - 200;
		if (n_gap > -40) n_gap = -40;

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
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="hand"
	class:dragging={boardState.dragging}
	style="--offset: {offset}px; --gap: {gap}px"
	bind:this={handElement}
>
	{#each hand as card, i (card.id)}
		<div class="hand-item" transition:drag_out_transition>
			<div
				class="card-wrapper"
				onmouseenter={() => {
					// active_card = i;
				}}
			>
				<Card
					hand
					data={card}
					{zoom}
					start_drag={() => {
						hand.splice(i, 1);
						dragOut(card);
					}}
					end_drag={() => {}}
					scroll_position={{ x: 0, y: 0 }}
				/>
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
		flex-wrap: nowrap;
		justify-content: center;
		align-items: center;

		translate: var(--offset) 100px;

		overflow-y: visible;
		/* overflow-x: scroll; */
	}
	.hand-item {
		flex-grow: 0; /* Don't grow */
		flex-shrink: 0; /* Don't shrink */
		width: 150px;
		margin-right: var(--gap);
		margin-left: 0px;
		box-shadow: -2px 0px 5px 0 black;
		z-index: 1000;

		transition: all 400ms ease-out;

		/* overflow: hidden;
        border-radius: 11px; */
		&:last-of-type {
			margin-left: 0;
		}

		.card-wrapper {
			margin-right: 0px;
			margin-left: 0px;
			width: 100%;
			translate: 0 0px;
			transition: all 400ms ease-out;
		}
	}

	.hand:not(.dragging) .hand-item:hover {
		margin-right: 10px;
		margin-left: calc(10px - var(--gap));
		width: 250px;

		.card-wrapper {
			translate: 0 -200px;
		}
	}
</style>
