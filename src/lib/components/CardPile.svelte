<script lang="ts">
	import { boardState } from '$lib/stores/Board.svelte';
	import type { CardData } from '$lib/types/Card';
	import Card from './Card.svelte';

	const { cards, revealed, position } = $props() as {
		cards: CardData[];
		revealed: boolean;
		position: { x: number; y: number };
	};

	const face_down_card: CardData = {
		img: 'card_bg.png',
		id: -2,
		order: 0,
        position,
	};
</script>

<div class="card-pile" style="--x: {position.x}px; --y: {position.y}px">
    
	<Card data={cards[0] ?? face_down_card} start_drag={() => {}} end_drag={() => {}} />
</div>
