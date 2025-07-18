<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { CardData } from '$lib/types/Card';
	import Card from './Card.svelte';
	import { gameManager as GMRoot, GameStateManager } from '$lib/stores/GameStateManager.svelte';
	import type { PileType } from '$lib/types/Pile';
	import { Vector2 } from '$lib/util/math.svelte';
	import { assert } from '$lib/util/assert';
	import { connectionManager } from '$lib/stores/ConnectionManager.svelte';
	import { flip } from 'svelte/animate';
	import { card_preview, pile_context } from '$lib/stores/GlobalContext.svelte';

	const {
		label,
		peer_id,
		root
	}: {
		label: PileType;
		peer_id: string | undefined;
		root: Vector2;
	} = $props();

	const gameManager = $derived(peer_id ? connectionManager.game_managers[peer_id] : GMRoot);

	const pile = $derived(gameManager.piles[label]);
	const shown_card: CardData | null = $derived.by(() => {
		if (gameManager.pile_dropping == label && gameManager.dragging_card) {
			return {
				img: gameManager.dragging_card.img,
				id: pile.id,
				order: 0,
				position: Vector2.zero,
				tapped: false,
				name: ''
			};
		}

		if (pile.cards.length == 0) return null;
		else
			return {
				img: pile.revealed ? pile.cards.at(-1)!.img : 'card_bg.jpg',
				id: pile.id,
				order: 0,
				position: Vector2.zero,
				tapped: false,
				name: ''
			};
	});

	let pileDragStart = { x: 0, y: 0 };
	let pileInitialPosition = { x: 0, y: 0 };

	let dragging_pile = $derived(gameManager.dragging_pile == label);
	let dropping_card = $derived(gameManager.pile_dropping == label);

	function startContainerDrag(e: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (gameManager.passive) return;
		if (e.buttons != 1) return;

		const board = document.querySelector('.board');
		if (!board) return;

		gameManager.startDragPile(label);

		const boardRect = board.getBoundingClientRect();

		pileDragStart.x = e.clientX;
		pileDragStart.y = e.clientY;

		pileInitialPosition.x = pile.position.x;
		pileInitialPosition.y = pile.position.y;
	}

	function onmouseenter() {

		if (gameManager.passive) return;
		if (gameManager.dragging && gameManager.dragging_card) {
			gameManager.pile_dropping = label;
		}
	}
	function onmousemove(e: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (gameManager.passive) return;
		if (dragging_pile) {
			gameManager.setPilePosition(
				label,
				pileInitialPosition.x + (e.clientX - pileDragStart.x) / gameManager.zoom,
				pileInitialPosition.y + (e.clientY - pileDragStart.y) / gameManager.zoom
			);
		}
	}
	function onmouseup() {
		if (gameManager.passive) return;
		if (dragging_pile) {
			gameManager.stopDragPile();
		}

		if (dropping_card) {
			gameManager.dropCardOnPile(label);
		}
	}

	function onmouseleave() {
		if (gameManager.passive) return;
		gameManager.pile_dropping = undefined;
	}
</script>

<svelte:body {onmousemove} {onmouseup} />
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="card-pile"
	class:dragging_pile
	style="--x: {pile.position.x}px; --y: {pile.position.y}px"
	{onmouseenter}
	{onmouseleave}
>
	<div class="label">{label} ({pile.cards.length})</div>
	<button class="thumb" onmousedown={startContainerDrag}>
		<Icon className="iconify" icon="mdi:cursor-move" />
	</button>
</div>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="card-pile card-pile--container"
	class:dragging_pile
	style="--x: {pile.position.x}px; --y: {pile.position.y}px"
	class:dropping_card={gameManager.dragging}
>
	{#if shown_card}
		<Card
			{root}
			data={shown_card}
			start_drag={() => {
				if (gameManager.passive) return true;
				gameManager.dragging_card_origin = label;
				pile.cards.at(-1)?.position.set(pile.position.x, pile.position.y);
				gameManager.getOutOfPile(label);
				return true;
			}}
			end_drag={() => {}}
			trigger_context={(x, y) => {
				if (gameManager.passive) return;
				pile_context.pile = label;
				pile_context.position = new Vector2(x, y);
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
