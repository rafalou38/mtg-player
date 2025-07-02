<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/components/Card.svelte';
	import CardPile from '$lib/components/CardPile.svelte';
	import CardSearch from '$lib/components/CardSearch.svelte';
	import ContextMenu from '$lib/components/ContextMenu.svelte';
	import Counter from '$lib/components/Counter.svelte';
	import Hand from '$lib/components/Hand.svelte';
	import Playmat from '$lib/components/Playmat.svelte';
	import QuickActions from '$lib/components/QuickActions.svelte';
	import { connectionManager } from '$lib/stores/ConnectionManager.svelte';

	import { gameManager } from '$lib/stores/GameStateManager.svelte';
	import { board_context, pile_context } from '$lib/stores/GlobalContext.svelte';
	import type { CardData } from '$lib/types/Card';
	import type { PileType } from '$lib/types/Pile';
	import { assert } from '$lib/util/assert';
	import { Vector2 } from '$lib/util/math.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		if (!connectionManager.connected) {
			// return goto('/').then(() => {
			// 	// refresh the page
			// 	location.reload();
			// });

			connectionManager.connect('1p');
			gameManager.loadTestData();
		}
	});

	let searching_pile = $state<PileType | undefined>(undefined);

	function onwheel(e: WheelEvent & { currentTarget: HTMLElement }) {
		if (gameManager.blocked) return;
		e.preventDefault();
		if (e.deltaY > 0) {
			gameManager.zoom *= 0.9;
		} else {
			gameManager.zoom *= 1.1;
		}

		if (gameManager.zoom > 1.2) gameManager.zoom = 1.2;
		if (gameManager.zoom < 0.2) gameManager.zoom = 0.2;
	}

	function onmousemove(e: MouseEvent & { currentTarget: HTMLElement }) {
		if (gameManager.blocked) return;
		if (
			e.buttons == 1 &&
			!gameManager.dragging &&
			!gameManager.dragging_pile &&
			!gameManager.dragging_trinket
		) {
			gameManager.translate.x += e.movementX;
			gameManager.translate.y += e.movementY;
		}

		gameManager.cursor_position.set(e.clientX, e.clientY);
	}
</script>

<svelte:body {onwheel} {onmousemove} />

<!-- BOARD CONTEXT MENU -->
<ContextMenu
	open={board_context.card != undefined}
	position={board_context.position}
	options={[
		{
			name: 'send to bottom of library',
			action: () => {
				if (!board_context.card) return;
				gameManager.boardToBottom(board_context.card, 'library');
			}
		}
	]}
	onclose={() => (board_context.card = undefined)}
/>
<ContextMenu
	open={pile_context.pile != undefined}
	position={pile_context.position}
	options={[
		{
			name: 'Shuffle',
			action: () => {
				if (!pile_context.pile) return;
				gameManager.shuffle(pile_context.pile);
			}
		},
		{
			name: 'search for a card',
			action: () => {
				if (!pile_context.pile) return;
				searching_pile = pile_context.pile;
			}
		}
	]}
	onclose={() => (pile_context.pile = undefined)}
/>

<CardSearch bind:pile={searching_pile}  />

<div
	class="board"
	style="--zoom: {gameManager.zoom}; --scroll-x: {gameManager.translate
		.x}px; --scroll-y: {gameManager.translate.y}px"
>
	<div class="bg"></div>

	<Playmat {gameManager} peer_id={undefined} />

	{#each Object.keys(connectionManager.game_managers) as peer_id}
		<Playmat gameManager={connectionManager.game_managers[peer_id]} {peer_id} />
	{/each}
</div>

<QuickActions />

<Hand />

<style>
	.bg {
		position: absolute;
		transform: translate(-250vw, -250vh);
		width: calc(2160px * 4);
		height: calc(1080px * 4);
		background-color: black;
		background-image: url('/texture/45-degree-fabric-light.png');
		/* background-size: 300px; */
	}
	.board {
		position: absolute;
		/* transform: perspective(200px) rotateX(2deg); */
		width: 100px;
		height: 100px;
		scale: var(--zoom);
		translate: var(--scroll-x) var(--scroll-y);

		backface-visibility: hidden;

		/* transform-origin: calc(var(--scroll-x) * var(--zoom)) calc(var(--scroll-y) * var(--zoom)); */

		/* transition:
			scale 600ms cubic-bezier(0.16, 1, 0.3, 1); */
	}
</style>
