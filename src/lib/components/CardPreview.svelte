<script lang="ts">
	import { card_preview } from '$lib/stores/GlobalContext.svelte';
	import { untrack } from 'svelte';

    let last_card = $state(card_preview.card);

    $effect(() => {
        last_card = card_preview.card || untrack(()=>last_card);
    })
</script>

<div class="card-preview" class:active={card_preview.card != undefined}>
	{#if last_card}
		<img src={last_card.img} alt="" />
	{/if}
</div>


<style>
    .card-preview {
        position: absolute;
        right: -50px;
        height: 100vh;
        width: 300px;
        pointer-events: none;
        opacity: 0;
        transition: all 100ms ease-out;

        display: flex;
        justify-content: center;
        align-items: center;
        align-items: start;

        &.active {
            right: 20px;
            opacity: 1;
        }

        img {
            width: 100%;
            height: auto;

            border-radius: 20px;

            opacity: 0.8;
            
        }
    }
</style>