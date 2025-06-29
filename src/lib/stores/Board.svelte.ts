import type { CardData } from "$lib/types/Card";

export const boardState = $state({
    dragging: false,
    hand_dropping_index: undefined as number | undefined,
    pile_dropping: undefined as number | undefined,
    dragging_card: undefined as CardData | undefined,
    scroll_position: { x: 0, y: 0 },
    zoom: 1,
    drag_locked: false
});