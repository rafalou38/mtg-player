<script lang="ts">
	import type { ArchidektDeck } from '$lib/types/ScryfallApi';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	const PROXY_URL = 'https://corsproxy.io/?url=';
	const API_URL = 'https://archidekt.com/api/decks/';


	let {
		deck = $bindable()
	}: {
		deck: ArchidektDeck | null;
	} = $props();


	let deck_url = $state('');

	let status = $state<'void' | 'loading' | 'valid' | 'invalid'>('void');

	let recent_decks = $state<
		{
			name: string;
			url: string;
		}[]
	>([]);


	async function handle_data(r: Response) {
		if (!r.ok) {
			status = 'invalid';
			return;
		}

		deck = (await r.json()) as ArchidektDeck;

		status = 'valid';
		recent_decks = recent_decks.filter((d) => d.url != deck_url);
		recent_decks.unshift({
			name: deck.name,
			url: deck_url
		});
		deck_url = '';
	}

	function submit_request() {
		const deck_id = deck_url.match(/(?<=archidekt\.com\/decks\/)\d+/);
		if (deck_id) {
			const url = PROXY_URL + encodeURIComponent(API_URL + deck_id + '/');
			console.log(url);
			fetch(url)
				.then(handle_data)
				.catch((e) => {
					console.error(e);
					status = 'invalid';
				});
		}

		localStorage.setItem('recent_decks', JSON.stringify(recent_decks));
	}

	onMount(() => {
		recent_decks = JSON.parse(localStorage.getItem('recent_decks') || '[]');
	});
</script>

<h2>
	Choose your deck
	<!-- <Icon icon="material-symbols:find-in-page-outline-sharp" /> -->
</h2>
<form class="input-wrapper" onsubmit={submit_request}>
	<input type="text" name="" id="" placeholder="Archidekt URL" bind:value={deck_url} />
	<button class="search" type="submit">
		<Icon icon="mdi:magnify" />
	</button>
</form>
<div class="deck-chooser flex gap-5">
	<div class="grow">
		<h3>Recent decks</h3>
		<ul>
			{#each recent_decks as deck}
				<li>
					<button
						onclick={() => {
							deck_url = deck.url;
							submit_request();
						}}
					>
						<Icon icon="mdi:cards" />
						{deck.name}
					</button>
				</li>
			{/each}
		</ul>
	</div>

	{#if status == 'valid' && deck}
		<div class="deck">
			<img src={deck.featured} alt="" />
			<p>{deck.name}</p>
		</div>
	{/if}
</div>

<style>
	.deck {
		width: 200px;
		height: 150px;

		position: relative;
		display: flex;
		/* flex-direction: column; */
		justify-content: center;
		align-items: center;
		background: black;

		overflow: hidden;
		border-radius: 16px;
		img {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			object-fit: cover;
			opacity: 0.8;
		}
		p {
			position: relative;
			z-index: 10;
			width: 100%;
			text-align: center;

			color: white;
			font-weight: bold;
			font-size: 20px;
			text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
		}
	}
	h2 {
		font-size: 24px;
		color: white;
		font-weight: bold;
		margin-bottom: 5px;
		margin-top: 40px;

		display: flex;
		align-items: center;
		gap: 8px;
	}

	h3 {
		font-size: 20px;
		color: rgba(255, 255, 255, 0.8);
		font-weight: 600;
		margin-bottom: 5px;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		button {
			font-size: 18px;
			margin: 0 0 4px 10px;
			color: rgba(255, 255, 255, 0.6);
			cursor: pointer;

			display: flex;
			align-items: center;
			gap: 8px;

			transition: all 100ms ease;
			&:hover {
				color: rgba(255, 255, 255, 1);
			}
		}
	}
	.input-wrapper {
		display: flex;
		background: rgba(40, 40, 40, 0.45);
		border-radius: 4px;
		box-shadow: 0px 0px 1px 2px #161616;
		margin-bottom: 16px;
		.search {
			font-weight: 600;
			padding: 9px;

			transition: all 200ms ease;
			font-size: 16px;
			color: rgba(255, 255, 255, 0.8);
			cursor: pointer;

			width: 44px;
			height: 44px;
			display: grid;
			place-items: center;

			color: white;
			font-size: 20px;

			&:hover {
				background: rgba(60, 60, 60, 0.5);
			}

			/* height: 60px; */
		}
		input {
			/* @apply px-3.5 py-2; */
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
	}
</style>
