<script lang="ts">
	import Icon from '@iconify/svelte';
	import { boardState } from '$lib/stores/Board.svelte';
	import type { CardData } from '$lib/types/Card';
	import Card from './Card.svelte';
	import { board_self, setBoardSelf } from '$lib/stores/Cards.svelte';

	const {
		dragOut,
		label,
		cards,
		revealed,
		position = $bindable()
	} = $props() as {
		dragOut: (card: CardData) => void;
		label: string;
		cards: CardData[];
		revealed: boolean;
		position: { x: number; y: number };
	};

	let position_state = $state(position);
	let cards_state = $state(cards);

	const id = Math.random();

	$effect(() => {
		cards_state.forEach((card) => {
			if (card.position.x != position.x || card.position.y != position.y) {
				card.position = position;
			}
		});
	});
	const last = $derived(cards_state.at(-1));
	let shown_card = $derived(
		cards_state.length > 0
			? {
					img: revealed || last?.id == -1 ? last!.img : 'card_bg.png',
					id: id,
					order: 0,
					position: { x: 0, y: 0 }
				}
			: null
	);

	let dragging_pile = $state(false);
	let pileDragStart = { x: 0, y: 0 };
	let pileInitialPosition = { x: 0, y: 0 };

	function save_state() {
		position.x = position_state.x;
		position.y = position_state.y;

		cards.splice(0, cards_state.length, ...cards_state);
	}

	function startContainerDrag(e: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (e.buttons != 1) return;

		const board = document.querySelector('.board');
		if (!board) return;

		const boardRect = board.getBoundingClientRect();

		dragging_pile = true;

		pileDragStart.x = e.clientX;
		pileDragStart.y = e.clientY;

		pileInitialPosition.x = (e.clientX - boardRect.left) / boardState.zoom;
		pileInitialPosition.y = (e.clientY - boardRect.top) / boardState.zoom;

		boardState.drag_locked = true;
	}
	function onmousemove(e: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (dragging_pile) {
			position_state.x = pileInitialPosition.x + (e.clientX - pileDragStart.x) / boardState.zoom;
			position_state.y = pileInitialPosition.y + (e.clientY - pileDragStart.y) / boardState.zoom;
		}
	}
	function onmouseup() {
		if (dragging_pile) {
			dragging_pile = false;
			boardState.drag_locked = false;
			position.x = position_state.x;
			position.y = position_state.y;
		}

		if (boardState.pile_dropping == id && boardState.dragging_card) {
			boardState.pile_dropping = undefined;

			setBoardSelf(board_self.filter((c) => c != boardState.dragging_card));

			// cards_state = cards_state.filter((c) => c.id != -1);
			cards_state.push(boardState.dragging_card);

			save_state();
		}
	}

	function onmouseenter() {
		cards_state = cards_state.filter((c) => c.id != -1);
		if (boardState.dragging && boardState.dragging_card) {
			boardState.pile_dropping = id;
			cards_state.push({
				...boardState.dragging_card,
				id: -1
			});
		}
	}

	function onmouseleave() {
		// if (boardState.pile_dropping || boardState.dragging) {
			cards_state = cards_state.filter((c) => c.id != -1);
			save_state();
			boardState.pile_dropping = undefined;
		// }
	}
</script>

<svelte:body {onmousemove} {onmouseup} />
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="card-pile"
	class:dragging_pile
	style="--x: {position_state.x}px; --y: {position_state.y}px"
	{onmouseenter}
	{onmouseleave}
>
	<div class="label">{label} ({cards_state.length})</div>
	<button class="thumb" onmousedown={startContainerDrag}>
		<Icon className="iconify" icon="mdi:cursor-move" />
	</button>
</div>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="card-pile card-pile--container"
	class:dragging_pile
	style="--x: {position_state.x}px; --y: {position_state.y}px"
	class:dropping_card={boardState.dragging}
>
	{#if shown_card}
		<Card
			bind:data={shown_card}
			start_drag={() => {
				boardState.drag_locked = true;
				let ret = cards_state.pop();
				save_state();
				if (!ret) throw new Error('This should not have happened');
				dragOut(ret);
				return true;
			}}
			end_drag={() => {
				boardState.drag_locked = false;
			}}
		/>
	{/if}
</div>

<style>
	.thumb {
		position: absolute;
		width: 40px;
		height: 40px;
		left: -20px;
		top: -20px;
		color: white;
		display: grid;
		place-items: center;
		background: rgba(100, 100, 100);
		border-radius: 100%;
		cursor: pointer;
		:global(.iconify) {
			/* font-size: 40px; */
			width: 20px;
			height: 20px;
		}
	}
	.label {
		position: absolute;
		height: 100%;
		top: 0;
		text-align: center;
		color: rgba(100, 100, 100);
		font-weight: bold;
		writing-mode: vertical-rl;
		text-orientation: mixed;
		text-transform: uppercase;
		font-size: 24px;
		right: -30px;
		user-select: none;
	}
	.card-pile {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: 200px;
		height: 280px;
		padding: 10px;
		border-radius: 20px;
		border: 3px solid rgba(100, 100, 100);
		box-sizing: content-box;
		filter: drop-shadow(2px 2px 1px rgb(0, 0, 0));

		transition:
			scale 200ms ease,
			opacity 200ms ease;

		opacity: 0.6;
		/* pointer-events: none; */
		:global(&:not(.dropping_card) button) {
			pointer-events: auto;
		}

		&:has(> .thumb:hover) {
			opacity: 1;
		}

		&.dragging {
			scale: 1.06;
		}
	}
	.card-pile--container {
		pointer-events: none;
		border: 3px solid transparent;
		opacity: 1;
		filter: none;
	}
</style>
