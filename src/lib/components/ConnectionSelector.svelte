<script lang="ts">
	import type { ArchidektDeck } from '$lib/types/ArchidektApi';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let recent_rooms = $state<string[]>([]);

	let { code = $bindable(), capacity= $bindable(), connect }: { code: string, capacity: number, connect: () => void } = $props();

	function submit() {
		recent_rooms = recent_rooms.filter((r) => r != code);
		recent_rooms.unshift(code);
		localStorage.setItem('recent_rooms', JSON.stringify(recent_rooms));

        connect();
	}

	onMount(() => {
		recent_rooms = JSON.parse(localStorage.getItem('recent_rooms') || '[]');
	});
</script>

<h2>
	<Icon icon="material-symbols:globe" />
	Connect to room
</h2>
<form class="input-wrapper" onsubmit={submit}>
	<div class="players-select-row">
		<button class:active={capacity == 2} onclick={() => (capacity = 2)}>2P</button>
		<!-- <button class:active={capacity == 3} onclick={() => (capacity = 3)}>3P</button>
		<button class:active={capacity == 4} onclick={() => (capacity = 4)}>4P</button> -->
	</div>
	<input type="text" name="" id="" placeholder="Room name" bind:value={code} />
	<button class="search" type="submit">
		<Icon icon="mdi:magnify" />
	</button>
</form>
<div class="deck-chooser flex gap-5">
	<div class="grow">
		{#if recent_rooms.length != 0}
			<h3>Recent rooms</h3>
			<ul>
				{#each recent_rooms as r_code}
					<li>
						<button
							onclick={() => {
								code = r_code
								submit();
							}}
						>
							<Icon icon="mdi:note" />
							{r_code}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
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
		.players-select-row {
			display: flex;
			gap: 0px;
			button {
				width: 44px;
				height: 44px;
				cursor: pointer;
				background: none;
				border: none;
				color: rgba(255, 255, 255, 0.8);
				font-size: 16px;
				background: rgba(60, 60, 60, 0.5);
				&:hover {
					background: rgba(60, 60, 60, 1);
				}
				&.active {
					background: rgba(20, 20, 20, 1);
				}
			}
		}
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
