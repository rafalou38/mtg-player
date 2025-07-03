<script lang="ts">
	import { playmat_positions } from '$lib/data/playmats';
	import type { GameStateManager } from '$lib/stores/GameStateManager.svelte';
	import { Vector2 } from '$lib/util/math.svelte';

	let {
		gameManager,
		flipped
	}: {
		gameManager: GameStateManager;
		flipped: boolean;
	} = $props();

	let root = $derived(
		new Vector2(
			playmat_positions[gameManager.playmat_index][0].x,
			playmat_positions[gameManager.playmat_index][0].y
		)
	);

	let position = $derived.by(() => {
		if (flipped) {
			return {
				x: root.x - 2160,
				y: root.y - 1080 - 250
			};
		} else {
			return {
				x: root.x,
				y: root.y + 1080
			};
		}
	});
</script>

<div class="partial-hand" style="left: {position.x}px; top: {position.y}px;">
	<div class="count">
		{gameManager.partial_hand.length}
	</div>
	{#each gameManager.partial_hand as card_image}
		<div class="element">
			<img src={card_image} alt="" />
		</div>
	{/each}
</div>

<style>
	.partial-hand {
		position: absolute;
		display: flex;
		align-items: center;

		pointer-events: none;

		.element {
			margin-right: -20px;
			width: 150px;
			/* height: 200px; */
		}
		.count {
			margin: 0 50px;
			font-size: 100px;
			font-weight: 800;
			color: white;
		}
	}
</style>
