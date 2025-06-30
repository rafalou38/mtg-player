import type { Vector2 } from "$lib/util/math.svelte";
import type { CardData, CardId } from "./Card";

export type PileType = "library" | "graveyard" | "exile" | "commander";

export interface Pile {
    cards: CardData[];
    position: Vector2;
    revealed: boolean;
    id: CardId;
}