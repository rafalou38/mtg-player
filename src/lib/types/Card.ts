import type { Vector2 } from "$lib/util/math.svelte"

export type CardId = number

export type CardData = {
    img: string,
    id: CardId,
    order: number,
    equipped_to?: CardId,
    position: Vector2,
    tapped: boolean
}