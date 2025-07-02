<script lang="ts">
	import type { GameStateManager } from '$lib/stores/GameStateManager.svelte';

	let {
		gameManager,
		flipped
	}: {
		gameManager: GameStateManager;
		flipped: boolean;
	} = $props();

	let position = $derived.by(() => {
		if (flipped) {
			return {
				x: gameManager.root.x - 2160,
				y: gameManager.root.y - 1080 - 250
			};
		} else {
			return {
				x: gameManager.root.x,
				y: gameManager.root.y + 1080
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
