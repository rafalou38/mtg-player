<script lang="ts">
	import Card from "$lib/components/Card.svelte";
    import images from "$lib/data/test_deck.json";

</script>



{#each images.slice(0, 5) as image}
    <Card img_url={image} card_id={image.match(/(?<=\/)[\da-z-]+(?=\.jpg)/)?.[0]} />
{/each}