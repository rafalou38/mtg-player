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
	let scroll_dir = { x: 0, y: 0 };
	let scroll_position = $state({ x: 0, y: -40 });

	let prev_loop = new Date();
	function scroll_loop() {
		let dt = new Date().getTime() - prev_loop.getTime();

		console.log('loop', dt);

		scroll_position.x += scroll_dir.x ** 3 * dt * -0.1;
		scroll_position.y += scroll_dir.y ** 3 * dt * -0.1;

		requestAnimationFrame(scroll_loop);
		prev_loop = new Date();
	}
	onMount(() => {
		scroll_loop();
	});

	function onwheel(e: WheelEvent & { currentTarget: HTMLElement }) {
		e.preventDefault();
		if (e.deltaY > 0) {
			zoom *= 0.9;
		} else {
			zoom *= 1.1;
		}
	}

	function onmousemove(e: MouseEvent & { currentTarget: HTMLElement }) {
        

		const bodyRect = e.currentTarget.getBoundingClientRect();
		let x = e.clientX;
		let w = bodyRect.width;
		const limitX = w * 0.25;
		let x_factor = 0;
		if (x < limitX) {
			x_factor = x / limitX - 1;
		} else if (x - w > -limitX) {
			x_factor = (x - w) / limitX + 1;
		}

		let y = e.clientY;
		let h = bodyRect.height;
		const limitY = h * 0.25;
		let y_factor = 0;
		if (y < limitY) {
			y_factor = y / limitY - 1;
		} else if (y - h > -limitY) {
			y_factor = (y - h) / limitY + 1;
		}

		// console.log(x_factor, y_factor);

		scroll_dir = {
			x: x_factor,
			y: y_factor
		};
	}
	function onmouseout() {
		scroll_dir = { x: 0, y: 0 };
	}
</script>

<svelte:body {onwheel} {onmousemove} {onmouseout} />

<div class="board" style="--zoom: {zoom}; --x: {scroll_position.x}px; --y: {scroll_position.y}px">
    <div class="bg"></div>
	<div class="playmat playmat--1">
		<div class="texture"></div>
	</div>
	<div class="playmat playmat--2">
		<div class="texture"></div>
	</div>
	each
	{#each cards as data}
		<Card {data} {zoom} on_top={() => put_on_top(data)} />
	{/each}
</div>

<style>
    .bg{
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
        width: 720px;
        height: 420px;
		scale: var(--zoom);
		translate: var(--x) var(--y);

        backface-visibility: hidden;

        transform-origin: center;

		/* transition:
			scale 600ms cubic-bezier(0.16, 1, 0.3, 1), */
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
