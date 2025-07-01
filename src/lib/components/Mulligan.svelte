<script lang="ts">
	import { gameManager } from '$lib/stores/GameStateManager.svelte';
	import Icon from '@iconify/svelte';
	import Window from './Window.svelte';

	let { active = $bindable(false) } = $props();

	let mulligan_index = $state(1);

    function mulligan() {
        gameManager.mulligan();
        gameManager.blocked = false
        active = false;
    }

</script>

<Window bind:active on_close={() => (gameManager.blocked = false)}>
	<div class="wrapper">
		<button onclick={mulligan}>MULLIGAN</button>
		<!-- <div class="row">
			<button>MULLIGAN {mulligan_index}</button>
			<button><Icon icon="mdi:restart" /></button>
		</div> -->
	</div>
</Window>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.row {
		display: flex;
		flex-direction: row;
		gap: 10px;
	}
	button {
		padding: 15px 30px;
		border-radius: 6px;
		background-color: #151515;
		color: #fff;
		border: none;
		cursor: pointer;

        font-weight: 500;
        font-size: 16px;

        transition: all 100ms ease;

        &:hover {
            scale: 1.02;
        }

        &:active {
            scale: 0.98;
        }
	}
</style>
