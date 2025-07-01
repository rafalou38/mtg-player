<script lang="ts">
	import Icon from '@iconify/svelte';
	import TokenGrab from './TokenGrab.svelte';
	import { gameManager } from '$lib/stores/GameStateManager.svelte';

	let token_active = $state(true);
	function addToken() {
        token_active = true;
        gameManager.blocked = true;
    }
</script>

<div class="quick-actions">
	<button onclick={addToken}>
		<!-- <Icon icon="streamline:interface-id-user-identification-angle-secure-human-id-person-face-silhouette-security-brackets" /> -->
		<Icon icon="mdi:card-plus" />
	</button>
</div>

{#if token_active}
	<TokenGrab bind:active={token_active} />
{/if}


<style>
    .quick-actions {
        position: absolute;
        top: 0px;
        left: 0px;
        height: 100%;
        z-index: 1000;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 16px;
    }

    button {
        width: 40px;
        height: 40px;
        font-size: 20px;
        /* border-radius: 100%; */
        background: rgba(255, 255, 255, 0.8);
        border: none;
        cursor: pointer;
        display: grid;
        place-items: center;
    }
</style>