import type { CardData } from "$lib/types/Card";

export const board_self = $state([]) as CardData[];
export const hand = $state([]) as CardData[];
export const library = $state([]) as CardData[];
export const boardState = $state({
    dragging: false,
});


export function setHand(newHand: CardData[]) {
    hand.splice(0, hand.length, ...newHand);
}
export function setBoardSelf(a: CardData[]) {
    board_self.splice(0, board_self.length, ...a);
}
export function setLibrary(a: CardData[]) {
    library.splice(0, library.length, ...a);
}