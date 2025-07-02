<script lang="ts">
	import Icon from '@iconify/svelte';
	import TokenGrab from './TokenGrab.svelte';
	import { gameManager } from '$lib/stores/GameStateManager.svelte';
	import Mulligan from './Mulligan.svelte';
	import MarkerWindow from './MarkerWindow.svelte';
	import { card_preview } from '$lib/stores/GlobalContext.svelte';

	let token_active = $state(false);
    let mulligan_active = $state(false);
    let marker_active = $state(false);
	function addToken() {
        token_active = true;
        gameManager.blocked = true;
    }
	function mulligan() {
        mulligan_active = true;
        gameManager.blocked = true;
    }

    function addMarker(){
        marker_active = true;
        gameManager.blocked = true;
    }

    function togglePreview() {
        card_preview.force_enable = !card_preview.force_enable;
    }
</script>

<div class="quick-actions">
	<button onclick={addToken}>
		<!-- <Icon icon="streamline:interface-id-user-identification-angle-secure-human-id-person-face-silhouette-security-brackets" /> -->
		<Icon icon="mdi:card-plus" />
	</button>
	<button onclick={mulligan}>
		<!-- <Icon icon="streamline:interface-id-user-identification-angle-secure-human-id-person-face-silhouette-security-brackets" /> -->
		<Icon icon="mdi:shuffle" />
	</button>
	<button onclick={addMarker}>
		<Icon icon="mingcute:coin-line" />
	</button>
	<button onclick={togglePreview} class:active={card_preview.force_enable}>
		<Icon icon="mdi:magnify" />
	</button>
</div>

<TokenGrab bind:active={token_active} />
<Mulligan bind:active={mulligan_active} />
<MarkerWindow bind:active={marker_active} />


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
        gap: 8px;
    }

    button {
        width: 40px;
        height: 40px;
        font-size: 20px;
        /* border-radius: 100%; */
        background: rgba(255, 255, 255, 0.5);
        border: none;
        cursor: pointer;
        display: grid;
        place-items: center;

        transition: all 200ms ease;

        &:hover {
            background: rgba(255, 255, 255, 0.7);
        }
        &.active {
            background: rgba(255, 255, 255, 1);
        }

    }
</style>