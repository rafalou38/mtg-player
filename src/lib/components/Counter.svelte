<script lang="ts">
	import { gameManager } from '$lib/stores/GameStateManager.svelte';
	import type { Trinket } from '$lib/types/Trinkets';
	import { Vector2 } from '$lib/util/math.svelte';

	export const { trinket, flipped }: { trinket: Trinket; flipped?: boolean } = $props();

	let dragStart = Vector2.zero;
	let initialPosition = Vector2.zero;
	let dragging = false;
	let editing = $state(false);
	let edit_value = $state(trinket.value);
	let saved_value = $state(trinket.value);

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

	let icon = {
		loyalty: 'counter-loyalty',
		energy: 'e',
		mana: 'c',
		poison: 'p',
		rad: 'counter-rad'
	}[trinket.image];

	let EInput: HTMLInputElement;
	function increase() {
		gameManager.setTrinketValue(trinket.id, trinket.value + 1);
	}
	function decrease() {
		gameManager.setTrinketValue(trinket.id, trinket.value - 1);
	}

	function edit(e: MouseEvent & { currentTarget: HTMLElement }) {
		editing = true;
		edit_value = trinket.value;
		setTimeout(() => EInput.select(), 0);
		// EInput.focus();
	}

	function submit() {
		gameManager.setTrinketValue(trinket.id, parseInt(edit_value.toString()) || trinket.value);
		editing = false;
	}

	let timer: any = null;
	let diff_visible = $state(false);
	function reset_timer() {
		if (timer) clearTimeout(timer);
		diff_visible = true;
		timer = setTimeout(() => {
			diff_visible = false;
			setTimeout(() => {
				saved_value = trinket.value;
			}, 500);
		}, 1000);
	}

	$effect(() => {
		if (saved_value != trinket.value) reset_timer();
	});
</script>

<svelte:body {onmousemove} {onmouseup} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="counter"
	onmousedown={start_drag}
	style="--xp: {flipped ? trinket.position.x - 300 : trinket.position.x}px; --yp: {flipped
		? trinket.position.y - 100
		: trinket.position.y}px"
	class:m11={trinket.image == '/'}
>
	<div class="popup" class:visible={saved_value - trinket.value != 0 && diff_visible}>
		{#if saved_value - trinket.value < 0}
			+{Math.abs(saved_value - trinket.value)}
		{:else}
			-{Math.abs(saved_value - trinket.value)}
		{/if}
	</div>
	<button class="button" onclick={decrease}>-</button>
	<div class="block">
		{#if icon}
			<i class="ms ms-{icon}">-</i>
		{:else}
			<!-- else content here -->
		{/if}
		<!-- {#if editing} -->
		<form class="contents">
			<input
				type="text"
				hidden={!editing}
				bind:value={edit_value}
				bind:this={EInput}
				onblur={submit}
				onsubmit={submit}
			/>
		</form>

		{#if trinket.image == '/'}
			<button class="label" hidden={editing} onclick={edit}>
				{#if trinket.value > 0}
					<!-- content here -->
					+{trinket.value}/+{trinket.value}
				{:else}
					{trinket.value}/{trinket.value}
				{/if}
			</button>
		{:else}
			<button class="label" hidden={editing} onclick={edit}>{trinket.value}</button>
		{/if}
	</div>
	<button class="button" onclick={increase}>+</button>
</div>

<style>
	.popup {
		position: absolute;
		top: -40px;
		width: 100%;
		text-align: center;
		font-size: 30px;
		color: white;
		opacity: 0;
		transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
		&.visible {
			top: -50px;
			opacity: 1;
		}
	}
	.counter {
		scale: 0.8;
		cursor: pointer;

		position: absolute;
		z-index: 999;

		left: var(--xp);
		top: var(--yp);

		/* width: 65px; */
		width: 300px;
		height: 100px;
		border-radius: 100px;

		display: flex;
		place-items: center;

		background-color: #151515;
		color: white;

		font-size: 30px;

		box-shadow: 2px 2px 1px 2px #16161643;
	}
	.block {
		flex-grow: 1;
		display: flex;
		/* flex-direction: column; */
		justify-content: center;
		align-items: center;
		gap: 16px;
	}

	.label,
	input {
		text-wrap: nowrap;
		text-align: center;
		width: 60px;
		cursor: text;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		margin: 0;
		&:focus {
			outline: none;
		}
	}

	.m11 .label {
		width: 100px;
	}

	.button {
		width: 100px;
		height: 100px;
		font-size: 20px;
		cursor: pointer;
		display: grid;
		place-items: center;
		border-radius: 100px;
		&:hover {
			background-color: #101010;
		}
	}

	i {
		font-size: 40px;
	}
</style>
