<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import images from '$lib/data/test_deck.json';
	import type { CardData } from '$lib/types/Card';
	import { onMount } from 'svelte';
	import type { WheelEventHandler } from 'svelte/elements';

	const cards: CardData[] = $state(
		images.map((link, i) => ({
			img: link,
			id: Math.random(),
			order: i,
			equipped_to: undefined
		}))
	);

	function put_on_top(data: CardData) {
		let base_order = data.order;
		let max_order = 0;
		cards.forEach((c) => {
			if (c.order > max_order) max_order = c.order;

			if (c.order > base_order) c.order--;
		});

		data.order = max_order;
	}

	let zoom = $state(0.3);
	let scroll_position = $state({ x: 370, y: 20 });
	let drag_locked = false;

	function onwheel(e: WheelEvent & { currentTarget: HTMLElement }) {
		e.preventDefault();
		if (e.deltaY > 0) {
			zoom *= 0.9;
		} else {
			zoom *= 1.1;
		}
	}

	function onmousemove(e: MouseEvent & { currentTarget: HTMLElement }) {
		if (e.buttons == 1 && !drag_locked) {
			scroll_position.x += e.movementX;
			scroll_position.y += e.movementY;
		}
	}
</script>

<svelte:body {onwheel} {onmousemove} />

<div class="board" style="--zoom: {zoom}; --x: {scroll_position.x}px; --y: {scroll_position.y}px">
	<div class="bg"></div>
	<div class="playmat playmat--1">
		<div class="texture"></div>
	</div>
	<div class="playmat playmat--2">
		<div class="texture"></div>
	</div>
	{#each cards as data}
		<Card
			{data}
			{zoom}
			start_drag={() => {
				put_on_top(data);
				drag_locked = true;
			}}
			end_drag={()=>{
				drag_locked = false;
			}}
		/>
	{/each}
</div>

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
		translate: var(--x) var(--y);

		backface-visibility: hidden;

		transform-origin: calc(var(--x) * var(--zoom)) calc(var(--y) * var(--zoom));

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
