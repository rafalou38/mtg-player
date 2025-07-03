<script lang="ts">
	import { connectionManager } from '$lib/stores/ConnectionManager.svelte';
	import { gameManager } from '$lib/stores/GameStateManager.svelte';

	let { capacity, choose }: { capacity: number; choose: (n: number) => void } = $props();
</script>

{#if capacity == 2}
	<div class="gr gr-2">
		<div class="row">
			<button
				onclick={() => choose(2)}
				style="--bg: url({connectionManager.playmat_users[2]})"
				disabled={connectionManager.playmat_users[2] != '' || gameManager.ready}>2</button
			>
		</div>
		<div class="row">
			<button
				onclick={() => choose(1)}
				style="--bg: url({connectionManager.playmat_users[1]})"
				disabled={connectionManager.playmat_users[1] != '' || gameManager.ready}>1</button
			>
		</div>
	</div>
{:else if capacity == 3}
	<div class="gr gr-3">
		<div class="row">
			<button
				onclick={() => choose(2)}
				style="--bg: url({connectionManager.playmat_users[2]})"
				disabled={connectionManager.playmat_users[2] != '' || gameManager.ready}>2</button
			>
			<button
				onclick={() => choose(3)}
				style="--bg: url({connectionManager.playmat_users[3]})"
				disabled={connectionManager.playmat_users[3] != '' || gameManager.ready}>3</button
			>
		</div>
		<div class="row">
			<button
				onclick={() => choose(1)}
				style="--bg: url({connectionManager.playmat_users[1]})"
				disabled={connectionManager.playmat_users[1] != '' || gameManager.ready}>1</button
			>
		</div>
	</div>
{:else if capacity == 4}
	<div class="gr gr-4">
		<div class="row">
			<button
				onclick={() => choose(2)}
				style="--bg: url({connectionManager.playmat_users[2]})"
				disabled={connectionManager.playmat_users[2] != '' || gameManager.ready}>2</button
			>
			<button
				onclick={() => choose(3)}
				style="--bg: url({connectionManager.playmat_users[3]})"
				disabled={connectionManager.playmat_users[3] != '' || gameManager.ready}>3</button
			>
		</div>
		<div class="row">
			<button
				onclick={() => choose(1)}
				style="--bg: url({connectionManager.playmat_users[1]})"
				disabled={connectionManager.playmat_users[1] != '' || gameManager.ready}>1</button
			>
			<button
				onclick={() => choose(4)}
				style="--bg: url({connectionManager.playmat_users[4]})"
				disabled={connectionManager.playmat_users[4] != '' || gameManager.ready}>4</button
			>
		</div>
	</div>
{/if}

<style>
	.gr {
		display: flex;
		flex-direction: column;

		gap: 10px;

		flex-wrap: wrap;
		justify-content: center;
		align-items: stretch;

		.row {
			display: flex;
			gap: 10px;
		}

		button {
			position: relative;
			width: 400px;
			height: 250px;
			font-size: 30px;
			border-radius: 16px;
			background: rgba(100, 100, 100, 0.8);

			overflow: hidden;

			color: white;
			border: none;
			cursor: pointer;
			display: grid;
			place-items: center;

			transition: all 200ms ease;

			&:hover {
				background: rgba(100, 100, 100, 1);
			}
			&::before {
				content: '';
				position: absolute;
				z-index: -1;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background-image: var(--bg);
				background-size: cover;
				background-position: center;
				/* opacity: 0.2; */
			}

			&:disabled {
				opacity: 0.5;
				cursor: not-allowed;
				pointer-events: none;
			}
		}
	}
</style>
