import type { CardData } from "$lib/types/Card";
import { Vector2 } from "$lib/util/math.svelte";



export const board_context = $state({
    card: undefined as CardData | undefined,
    position: Vector2.zero
})
