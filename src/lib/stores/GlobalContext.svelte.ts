import type { CardData } from "$lib/types/Card";
import type { PileType } from "$lib/types/Pile";
import { Vector2 } from "$lib/util/math.svelte";



export const board_context = $state({
    card: undefined as CardData | undefined,
    position: Vector2.zero
})

export const pile_context = $state({
    pile: undefined as PileType | undefined,
    position: Vector2.zero
})

export const card_preview = $state({
    card: undefined as CardData | undefined,
    force_enable: false
})