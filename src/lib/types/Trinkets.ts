import type { Vector2 } from "$lib/util/math.svelte";
import type { CardId } from "./Card";

export type Trinket = {
    id: CardId;
    type: 'counter' | "marker";
    image: string;
    value: number;
    position: Vector2;
};