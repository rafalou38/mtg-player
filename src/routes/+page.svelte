<script lang="ts">
	import { connectionManager } from '$lib/stores/ConnectionManager.svelte';
	import { onMount } from 'svelte';

	let room_name: string = $state('toto');
	function start() {
		connectionManager.connect(room_name);
	}
</script>

<div class="main">
	<a href="/player">player</a>

	<label for="name">Game Name</label>
	<input id="name" type="text" bind:value={room_name} />

	<button onclick={start}>connect</button>

    
    connected: {connectionManager.connected}

	{#each Object.keys(connectionManager.peers) as key}
		<div>{key}</div>
	{/each}
</div>


<style>
    .main {
        display: flex;
        flex-direction: column;
        background-color: white;
        width: 60vw;
        height: 80vh;
        margin: auto;
    }
</style>