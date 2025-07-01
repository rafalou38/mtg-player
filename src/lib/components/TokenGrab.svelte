<script lang="ts">
	import { gameManager } from '$lib/stores/GameStateManager.svelte';
	import type { CardSearchResults } from '$lib/types/ScryfallApi';
	import { Vector2 } from '$lib/util/math.svelte';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	let { active = $bindable(false) } = $props();
	let search = $state('');
	let results: CardSearchResults | null = $state(null);
	let images: string[] = $state([]);
	let recent = $state<string[]>([]);

	async function submit() {
		const url = 'https://api.scryfall.com/cards/search?q=is:token+' + encodeURIComponent(search);
		const r = await fetch(url);

		if (r.ok) {
			results = await r.json();

			images = results!.data.map(
				(c) => c.image_uris?.normal || c.card_faces?.[0].image_uris?.normal || ''
			);
		}
	}

	function addToken(card: string, x: number, y: number) {
		console.log('add');

		if (card) {
			gameManager.addToBoardDragging({
				id: Math.random(),
				img: card,
				order: 0,
				position: new Vector2(x, y),

				tapped: false,

				equipped_to: undefined
			});

			recent = [card, ...recent.filter((c) => c != card)];
			localStorage.setItem('recent_tokens', JSON.stringify(recent));
		}

		gameManager.blocked = false;
		active = false;
	}

	onMount(() => {
		recent = JSON.parse(localStorage.getItem('recent_tokens') || '[]');
	});
</script>

<div
	class="token-grabber"
	class:active
	onclick={() => {
		active = false;
		gameManager.blocked = false;
	}}
>
	<div class="window" onclick={(e) => e.stopPropagation()}>
		<form class="window-body" onsubmit={submit}>
			<input type="text" placeholder="search" bind:value={search} />
		</form>
		<div class="recent mb-4">
			{#each recent as img}
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<img src={img} alt="" onmousedown={(e) => addToken(img, e.clientX, e.clientY)} />
			{/each}
		</div>

		<div class="results">
			{#each images as img}
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<img src={img} alt="" onmousedown={(e) => addToken(img, e.clientX, e.clientY)} />
			{/each}
		</div>
	</div>
</div>

<style>
	.results {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
		flex-grow: 1;
		overflow-y: scroll;
		overflow-x: hidden;
		img {
			cursor: pointer;
			width: 200px;
			border-radius: 10px;

			transition: all 200ms ease;

			&:hover {
				scale: 1.025;
			}

			&:active {
				scale: 0.975;
			}
		}
	}
	.recent {
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		gap: 16px;
		img {
			cursor: pointer;
			width: 100px;
			border-radius: 10px;

			transition: all 200ms ease;

			&:hover {
				scale: 1.025;
			}

			&:active {
				scale: 0.975;
			}
		}
	}

	.token-grabber {
		position: absolute;
		top: 0px;
		left: 0px;
		width: 100%;
		height: 100%;
		z-index: 1000;

		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(2px);

		justify-content: center;
		align-items: center;

		display: none;
		&.active {
			display: flex;
		}

		.window {
			display: flex;
			flex-direction: column;
			width: 60%;
			height: 90%;
			padding: 1em;
			background: black;
			background-image: url('/texture/45-degree-fabric-light.png');
			background-size: 128px 128px;
			border-radius: 8px;
			box-shadow: 4px 4px 8px 0px rgba(0, 0, 0, 0.24);
		}
	}

	input {
		background: rgba(40, 40, 40, 0.45);
		border-radius: 4px;
		box-shadow: 0px 0px 1px 2px #161616;
		margin-bottom: 16px;

		font-weight: 600;
		padding: 10px 20px;
		width: 100%;

		transition: all 200ms ease;
		font-size: 16px;
		color: rgba(255, 255, 255, 0.8);

		/* margin-bottom: 10px; */

		&:focus {
			outline: none;
			background: rgba(60, 60, 60, 0.5);
		}

		&::placeholder {
			color: rgba(255, 255, 255, 0.45);
		}
	}
</style>
