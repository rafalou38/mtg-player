<script lang="ts">
	import { gameManager } from '$lib/stores/GameStateManager.svelte';
	import type { CardSearchResults } from '$lib/types/ScryfallApi';
	import { Vector2 } from '$lib/util/math.svelte';
	import { onMount } from 'svelte';
	import Window from './Window.svelte';
	import type { PileType } from '$lib/types/Pile';

	let { pile = $bindable() }: { pile: PileType | undefined } = $props();

	let search = $state('');

	function submit() {}

	function addC(card: string, x: number, y: number) {
		if (card) {
		}

		gameManager.blocked = false;
		pile = undefined;
	}
</script>

<Window
	active={pile != undefined}
	on_close={() => {
		pile = undefined;
		gameManager.blocked = false;
	}}
>
	<div class="wrapper">
		{#if pile}
			<form class="window-body" onsubmit={submit}>
				<input type="text" placeholder="search" bind:value={search} />
			</form>
			<div class="results">
				{#each gameManager.piles[pile].cards.filter((c) => c.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())) as card}
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<img
						src={card.img}
						alt=""
						onmousedown={(e) => {
							if(!pile) return;
                            gameManager.removeCardFromPile(card, pile);
							gameManager.addCardToHand(card, 0);
						}}
					/>
				{/each}
			</div>
		{/if}
	</div>
</Window>

<style>
	.wrapper {
		max-width: 60vw;
		max-height: 90vh;

		display: flex;
		flex-direction: column;
		justify-content: center;
		/* align-items: center; */
		gap: 16px;
	}
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
