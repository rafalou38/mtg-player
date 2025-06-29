<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import CardPile from '$lib/components/CardPile.svelte';
	import Hand from '$lib/components/Hand.svelte';
	import images from '$lib/data/test_deck.json';
	import { boardState } from '$lib/stores/Board.svelte';
	import { board_self, hand, library, setBoardSelf, setHand, setLibrary } from '$lib/stores/Cards.svelte';
	import type { CardData } from '$lib/types/Card';
	import { onMount } from 'svelte';
	import type { WheelEventHandler } from 'svelte/elements';

	setBoardSelf(
		images.splice(0, 1).map((link, i) => ({
			img: link,
			id: Math.random(),
			order: i,
			equipped_to: undefined,
			position: { x: 0, y: 0 }
		}))
	);
	setHand(
		images.splice(0, 7).map((link, i) => ({
			img: link,
			id: Math.random(),
			order: i,
			equipped_to: undefined,
			position: { x: 0, y: 0 }
		}))
	);
	setLibrary(
		images.map((link, i) => ({
			img: link,
			id: Math.random(),
			order: i,
			equipped_to: undefined,
			position: { x: 0, y: 0 }
		}))
	);

	function put_on_top(data: CardData) {
		let base_order = data.order;
		let max_order = 0;
		board_self.forEach((c) => {
			if (c.order > max_order) max_order = c.order;

			if (c.order > base_order) c.order--;
		});

		data.order = max_order;
	}

	let force_drag: CardData | undefined = $state(undefined);

	function onwheel(e: WheelEvent & { currentTarget: HTMLElement }) {
		e.preventDefault();
		if (e.deltaY > 0) {
			boardState.zoom *= 0.9;
		} else {
			boardState.zoom *= 1.1;
		}

		if (boardState.zoom > 1.2) boardState.zoom = 1.2;
		if (boardState.zoom < 0.2) boardState.zoom = 0.2;
	}

	function onmousemove(e: MouseEvent & { currentTarget: HTMLElement }) {
		if (e.buttons == 1 && !boardState.drag_locked) {
			boardState.scroll_position.x += e.movementX;
			boardState.scroll_position.y += e.movementY;
		}
	}

	function dragOutOf(card: CardData) {
		board_self.push(card);
		put_on_top(card);
		boardState.drag_locked = true;
		force_drag = card;
	}
</script>

<svelte:body {onwheel} {onmousemove} />

<div
	class="board"
	style="--zoom: {boardState.zoom}; --scroll-x: {boardState.scroll_position
		.x}px; --scroll-y: {boardState.scroll_position.y}px"
>
	<div class="bg"></div>
	<div class="playmat playmat--1">
		<div class="texture"></div>
	</div>
	<div class="playmat playmat--2">
		<div class="texture"></div>
	</div>
	{#each board_self as data, i}
		<Card
			bind:data={board_self[i]}
			start_drag={() => {
				put_on_top(data);
				boardState.drag_locked = true;
			}}
			end_drag={() => {
				boardState.drag_locked = false;
			}}
			force_drag={force_drag == data}
			can_tap
		/>
	{/each}

	<CardPile
		label="library"
		cards={library}
		revealed={false}
		position={{ x: 1000, y: 100 }}
		dragOut={dragOutOf}
	/>
	<CardPile label="graveyard" cards={[]} revealed={true} position={{ x: 1000, y: 500 }} dragOut={dragOutOf}/>
	<CardPile label="exile" cards={[]} revealed={true} position={{ x: 1300, y: 500 }} dragOut={dragOutOf}/>
	<CardPile label="commander" cards={[]} revealed={true} position={{ x: 1300, y: 100 }} dragOut={dragOutOf}/>
</div>

<Hand dragOut={dragOutOf} />

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
