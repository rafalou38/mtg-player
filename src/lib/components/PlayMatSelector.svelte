<script lang="ts">
	import { playmats } from '$lib/data/playmats';
	import type { ArchidektDeck } from '$lib/types/ScryfallApi';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let {
		selected = $bindable(),
	}: {
		selected: string
	} = $props();
</script>

<h2>
	<Icon icon="mdi:fabric" /> Choose your playmat
</h2>

<div class="playmats">
	{#each playmats as playmat}
		<button
			class="wrapper"
			class:active={selected == playmat.url}
			onclick={() => {
				selected = playmat.url;
			}}
		>
			<img src={playmat.url} alt={playmat.name} />
		</button>
	{/each}
</div>

<style>
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

	.playmats {
		display: flex;
		justify-content: space-between;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 16px;
		.wrapper {
			cursor: pointer;
			border-radius: 4px;
			overflow: hidden;

			/* transition: all 200ms ease; */
			&.active {
				outline: 3px solid rgb(255, 255, 255);
				outline-offset: 4px;
			}
		}

		img {
			width: 240px;
			height: 120px;
			object-fit: cover;
			flex-grow: grow;
		}
	}
</style>
