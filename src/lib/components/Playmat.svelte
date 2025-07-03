<script lang="ts">
	import { playmat_positions } from '$lib/data/playmats';
	import type { GameStateManager } from '$lib/stores/GameStateManager.svelte';
	import { gameManager as GMRoot } from '$lib/stores/GameStateManager.svelte';
	import { board_context } from '$lib/stores/GlobalContext.svelte';
	import type { CardData } from '$lib/types/Card';
	import { Vector2 } from '$lib/util/math.svelte';
	import Card from './Card.svelte';
	import CardPile from './CardPile.svelte';
	import ContextMenu from './ContextMenu.svelte';
	import Counter from './Counter.svelte';
	import Marker from './Marker.svelte';
	import OtherHand from './OtherHand.svelte';

	const {
		gameManager,
		peer_id
	}: {
		gameManager: GameStateManager;
		peer_id: string | undefined;
	} = $props();

	let flip = $derived(gameManager.playmat_index == 2 || gameManager.playmat_index == 3);

	let root = $derived(
		new Vector2(
			playmat_positions[gameManager.playmat_index][0].x,
			playmat_positions[gameManager.playmat_index][0].y
		)
	);

	// let flip = $derived(GMRoot.flipped);
</script>

<div class="wrapper pm" style="--flip: {flip ? -1 : 1}; --root-x: {root.x}px; --root-y: {root.y}px">
	<div
		class="playmat {gameManager.playmat_index}"
		style="--playmat: url('{gameManager.playmat_url}')"
	>
		<div class="texture"></div>
	</div>
</div>

<div class="wrapper" style="--flip: {flip ? -1 : 1}; --root-x: {root.x}px; --root-y: {root.y}px">
	<CardPile {root} label="library" {peer_id} />
	<CardPile {root} label="graveyard" {peer_id} />
	<CardPile {root} label="exile" {peer_id} />
	<CardPile {root} label="commander" {peer_id} />

	{#each gameManager.board as card, i}
		<Card
			{root}
			data={gameManager.board[i]}
			start_drag={() => {
				if (gameManager.passive) return true;

				gameManager.dragging_card_origin = 'board';

				gameManager.setDragging(card);
			}}
			end_drag={() => {
				if (gameManager.passive) return;

				gameManager.stopDragging();
			}}
			trigger_context={(x, y) => {
				if (gameManager.passive) return;
				board_context.card = card;
				board_context.position = new Vector2(x, y);
			}}
			can_tap
		/>
	{/each}
</div>

<div
	class="wrapper tr"
	class:passive={gameManager.passive}
	style="--flip: {flip ? -1 : 1}; --root-x: {root.x}px; --root-y: {root.y}px"
>
	{#each gameManager.trinkets as trinket}
		{#if trinket.type == 'marker'}
			<Marker {trinket} />
		{:else if trinket.type == 'counter'}
			<Counter {trinket} />
		{/if}
	{/each}
</div>

<!-- {#if gameManager.passive}
	<OtherHand {gameManager} {flipped} />
{/if} -->

<style>
	.wrapper {
		position: absolute;

		width: 0px;
		height: 1080px;

		left: var(--root-x);
		top: var(--root-y);

		scale: 1 var(--flip);

		z-index: 5;
		&.pm {
			z-index: 0;
		}
		&.tr {
			z-index: 10;
		}
		&.passive {
			z-index: 10;
		}
	}
	.playmat {
		position: absolute;
		left: 0;
		top: 0;

		width: 2160px;
		height: 1080px;

		pointer-events: none;

		flex-grow: 1;
		/* height: max-content; */
		/* margin: 100px; */

		background-image: var(--playmat);
		background-repeat: no-repeat;
		background-size: cover;

		border-radius: 20px;
		overflow: hidden;

		/* border: solid #171717 4px; */
		box-shadow: 0px 0px 0px 8px black;

		/* translate: -1080px -1080px; */

		/* scale: var(--flip) var(--flip); */
	}

	.texture {
		position: absolute;
		width: 100%;
		height: 100%;
		/* background-image: url('/texture/cloth-alike.png'); */
		background-image: url('/texture/classy-fabric.png');
		/* background-image: url('/texture/45-degree-fabric-light.png'); */
		background-size: 400px;
		opacity: 0.2;
	}
</style>
