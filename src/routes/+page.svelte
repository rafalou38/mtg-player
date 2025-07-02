<script lang="ts">
	import { goto } from '$app/navigation';
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
	let capacity = $state(2);

	$effect(() => {
		if (status != 'connected' && connectionManager.peer_cnt == capacity - 1) {
			status = 'connected';
		}

		if (status == 'connected' && connectionManager.ready_cnt == capacity) {
			goto('/player');
		}
	});

	function ready() {
		if (gameManager.ready) return;

		gameManager.shuffle('library');
		gameManager.draw(7);
		connectionManager.send_pile_update('library');
		connectionManager.send_pile_update('graveyard');
		connectionManager.send_pile_update('exile');
		connectionManager.send_pile_update('commander');

		connectionManager.send_ready();
	}
</script>

<div class="main">
	{#if status == 'config'}
		<DeckSelector bind:deck={active_deck} />
		{#if active_deck}
			<PlayMatSelector bind:selected={playmat_url} />
			{#if playmat_url}
				<ConnectionSelector bind:capacity bind:code connect={start} />
			{/if}
		{/if}
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
			<h1>Choose board position</h1>
		{/if}
		<div class="">
			<button
				onclick={ready}
				class="cursor-pointer rounded-xl border-4 border-white px-10 py-4 text-xl font-bold text-white opacity-50 transition-all hover:bg-white hover:text-black active:scale-95"
				class:ready={gameManager.ready}>READY</button
			>

			<p>
				{connectionManager.ready_cnt}/{capacity}
			</p>
		</div>
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
