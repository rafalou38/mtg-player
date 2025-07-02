<script lang="ts">
	import type { GameStateManager } from '$lib/stores/GameStateManager.svelte';
	import type { Vector2 } from '$lib/util/math.svelte';
	import Card from './Card.svelte';
	import CardPile from './CardPile.svelte';
	import Counter from './Counter.svelte';
	import Marker from './Marker.svelte';

	const {
		gameManager,
		peer_id
	}: {
		gameManager: GameStateManager;
		peer_id: string | undefined;
	} = $props();

	const root: Vector2 = $derived(gameManager.root);
	const flipped: boolean = $derived(gameManager.flipped);
</script>

<div
	class="playmat"
	style="--playmat: url('{gameManager.playmat_url}'); --root-x: {flipped
		? root.x - 2160
		: root.x}px; --root-y: {flipped ? root.y - 1080 : root.x}px; --flip: {flipped ? '-1' : '1'}"
>
	<div class="texture"></div>
</div>

{#each gameManager.board as card, i}
	<Card
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
		can_tap
		{flipped}
	/>
{/each}

{#each gameManager.trinkets as trinket}
	{#if trinket.type == 'marker'}
		<Marker {trinket} {flipped}/>
	{:else if trinket.type == 'counter'}
		<Counter {trinket} {flipped} />
	{/if}
{/each}

<CardPile {flipped} label="library" {peer_id} />
<CardPile {flipped} label="graveyard" {peer_id} />
<CardPile {flipped} label="exile" {peer_id} />
<CardPile {flipped} label="commander" {peer_id} />

<style>
	.playmat {
		position: absolute;
		width: 2160px;
		height: 1080px;

		left: var(--root-x);
		top: var(--root-y);

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

		scale: var(--flip) var(--flip);
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
