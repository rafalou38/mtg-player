<script lang="ts">
	import { gameManager } from '$lib/stores/GameStateManager.svelte';
	import type { Trinket } from '$lib/types/Trinkets';
	import { Vector2 } from '$lib/util/math.svelte';

	export const { trinket, flipped }: { trinket: Trinket, flipped?: boolean } = $props();

	let dragStart = Vector2.zero;
	let initialPosition = Vector2.zero;
	let dragging = false;

	function start_drag(e: MouseEvent & { currentTarget: HTMLElement }) {
		dragStart = new Vector2(e.clientX, e.clientY);
		initialPosition = trinket.position.clone();
		gameManager.dragging_trinket = true;
		dragging = true;
	}
	function onmousemove(e: MouseEvent & { currentTarget: HTMLElement }) {
		if (dragging) {
			gameManager.setTrinketPosition(
				trinket.id,
				initialPosition.x + (e.clientX - dragStart.x) / gameManager.zoom,
				initialPosition.y + (e.clientY - dragStart.y) / gameManager.zoom
			);
		}
	}

	function onmouseup() {
		dragging = false;
		gameManager.dragging_trinket = false;
	}
</script>

<svelte:body {onmousemove} {onmouseup} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="simple"
	onmousedown={start_drag}
	style="--xp: {flipped ? trinket.position.x - 65 : trinket.position.x}px; --yp: {flipped
		? trinket.position.y - 65
		: trinket.position.y}px"
>
	<i class="ms ms-{trinket.image}">-</i>
</div>

<style>
	.simple {
		cursor: pointer;

		position: absolute;
		z-index: 999;

		left: var(--xp);
		top: var(--yp);

		width: 65px;
		height: 65px;
		border-radius: 100%;

		display: grid;
		place-items: center;

		background-color: #151515;
		color: white;

		font-size: 30px;

		box-shadow: 2px 2px 1px 2px #16161643;
	}
</style>
