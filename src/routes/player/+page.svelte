<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/components/Card.svelte';
	import CardPile from '$lib/components/CardPile.svelte';
	import Hand from '$lib/components/Hand.svelte';
	import { connectionManager } from '$lib/stores/ConnectionManager.svelte';

	import { gameManager } from '$lib/stores/GameStateManager.svelte';
	import type { CardData } from '$lib/types/Card';
	import { assert } from '$lib/util/assert';
	import { onMount } from 'svelte';

	onMount(() => {
		if (!connectionManager.connected)
			return goto('/').then(() => {
				// refresh the page
				location.reload();
			});

		gameManager.loadTestData();

		connectionManager.send_pile_update('library');
		connectionManager.send_pile_update('graveyard');
		connectionManager.send_pile_update('exile');
		connectionManager.send_pile_update('commander');

		connectionManager.send_board_update();
	});

	let force_drag: CardData | undefined = $state(undefined);

	function onwheel(e: WheelEvent & { currentTarget: HTMLElement }) {
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
		if (e.buttons == 1 && !gameManager.dragging && !gameManager.dragging_pile) {
			gameManager.translate.x += e.movementX;
			gameManager.translate.y += e.movementY;
		}

		gameManager.cursor_position.set(e.clientX, e.clientY);
	}
</script>

<svelte:body {onwheel} {onmousemove} />

<div
	class="board"
	style="--zoom: {gameManager.zoom}; --scroll-x: {gameManager.translate
		.x}px; --scroll-y: {gameManager.translate.y}px"
>
	<div class="bg"></div>
	<div class="playmat playmat--1">
		<div class="texture"></div>
	</div>
	<div class="playmat playmat--2">
		<div class="texture"></div>
	</div>
	{#each gameManager.board as card, i}
		<Card
			data={gameManager.board[i]}
			start_drag={() => {
				gameManager.setDragging(card);
			}}
			end_drag={() => {
				gameManager.stopDragging();
			}}
			can_tap
		/>
	{/each}

	<CardPile label="library" />
	<CardPile label="graveyard" />
	<CardPile label="exile" />
	<CardPile label="commander" />

	{#each Object.keys(connectionManager.game_managers) as peer_id}

		{#each connectionManager.game_managers[peer_id].board as card, i}
			<Card
				data={connectionManager.game_managers[peer_id].board[i]}
				start_drag={() => {
					return true;
				}}
				end_drag={() => {
				}}
				can_tap
			/>
		{/each}

		<CardPile label="library" {peer_id} />
		<CardPile label="graveyard" {peer_id} />
		<CardPile label="exile" {peer_id} />
		<CardPile label="commander" {peer_id} />
	{/each}
</div>

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
	.playmat {
		position: absolute;
		width: 2160px;
		height: 1080px;
		flex-grow: 1;
		/* height: max-content; */
		/* margin: 100px; */

		background-repeat: no-repeat;
		background-size: cover;

		border-radius: 20px;
		overflow: hidden;

		/* border: solid #171717 4px; */
		box-shadow: 0px 0px 0px 8px black;

		translate: -1080px -1080px;
	}
	.playmat--1 {
		background-image: url('/bg/01.jpg');

		/* flip bg */
		transform: scaleY(-1);
	}
	.playmat--2 {
		top: 1200px;
		background-image: url('/bg/02.jpg');
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
