<script lang="ts">
	import { goto } from '$app/navigation';
	import BoardPositionSelect from '$lib/components/BoardPositionSelect.svelte';
	import ConnectionSelector from '$lib/components/ConnectionSelector.svelte';
	import DeckSelector from '$lib/components/DeckSelector.svelte';
	import PlayMatSelector from '$lib/components/PlayMatSelector.svelte';
	import { connectionManager } from '$lib/stores/ConnectionManager.svelte';
	import { gameManager } from '$lib/stores/GameStateManager.svelte';
	import type { ArchidektDeck } from '$lib/types/ArchidektApi';
	import { assert } from '$lib/util/assert';
	import { onMount } from 'svelte';

	let status = $state<'config' | 'connecting' | 'connected'>('config');

	function start() {
		assert(active_deck);
		assert(code);
		assert(playmat_url);

		status = 'connecting';

		gameManager.loadDeck(active_deck);
		gameManager.setPlaymat(playmat_url);
		connectionManager.connect(`${capacity}-${code}`);
	}

	let active_deck = $state<ArchidektDeck | null>(null);
	let code = $state('');
	let playmat_url = $state('');
	let capacity = $state(3);

	$effect(() => {
		if (status != 'connected' && connectionManager.peer_cnt == capacity - 1) {
			status = 'connected';
		}

		if (status == 'connected' && connectionManager.ready_cnt == capacity) {
			goto('/player');
		}
	});

	function ready(n: number) {
		if (gameManager.ready) return;

		gameManager.shuffle('library');
		gameManager.draw(7);
		connectionManager.send_pile_update('library');
		connectionManager.send_pile_update('graveyard');
		connectionManager.send_pile_update('exile');
		connectionManager.send_pile_update('commander');


		connectionManager.send_ready(n);
	}
</script>

<div class="main">
	{#if status == 'config'}
		{#if active_deck}
			{#if playmat_url}
				<ConnectionSelector bind:capacity bind:code connect={start} />
			{/if}
			<PlayMatSelector bind:selected={playmat_url} />
		{/if}
		<DeckSelector bind:deck={active_deck} />
	{:else if status == 'connecting'}
		<div
			class="absolute left-0 flex h-full w-full flex-col items-center justify-center gap-8 text-4xl font-bold text-white"
		>
			<p class="text-3xl">{code}</p>
			<p class="">Waiting for players</p>
			<p class="text-6xl">{connectionManager.peer_cnt + 1}/{capacity}</p>
		</div>
	{:else if status == 'connected'}
		{#if capacity > 2}
			<h2>Choose your board position</h2>
		{/if}
		<BoardPositionSelect {capacity} choose={ready} />
	{/if}

	<!-- 
	<label for="name">Game Name</label>
	<input id="name" type="text" bind:value={room_name} />

	<button onclick={start}>connect</button>

    
    connected: {connectionManager.connected}

	{#each Object.keys(connectionManager.peers) as key}
		<div>{key}</div>
	{/each} -->
</div>

<style>
	h2 {
		font-size: 24px;
		color: white;
		font-weight: bold;
		margin-bottom: 5px;
		margin-top: 50px;

		display: flex;
		align-items: center;
		gap: 8px;
	}
	.ready {
		/* @apply bg-white text-black; */
		background: white;
		color: black;
	}
	.main {
		display: flex;
		flex-direction: column;
		/* background-color: white; */
		width: 60vw;
		height: 100vh;

		padding: 20px 20px 500px 20px;
		overflow-y: scroll;
		margin: auto;
	}
</style>
