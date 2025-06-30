// src/lib/stores/GameStateManager.svelte.ts
import type { CardData, CardId } from "$lib/types/Card";
import { Vector2 } from "$lib/util/math.svelte";
import images from '$lib/data/test_deck.json';
import type { Pile, PileType } from "$lib/types/Pile";
import { assert } from "$lib/util/assert";


export class GameStateManager {
    hand = $state<CardData[]>([]);
    board = $state<CardData[]>([]);

    piles: { [key in PileType]: Pile };

    opponent_hand_size = $state(0);


    // UI state
    zoom = $state(1);
    translate = $state<Vector2>(Vector2.zero)

    dragging = $state(false);
    dragging_card = $state<CardData | undefined>(undefined);
    prev_dragging_card = $state<CardData | undefined>(undefined);

    dragging_pile: PileType | undefined = $state(undefined);

    hand_dropping_index = $state<number | undefined>(undefined);
    pile_dropping = $state<string | undefined>(undefined);

    cursor_position = $state<Vector2>(Vector2.zero);

    constructor() {
        this.piles = $state({
            library: {
                cards: [],
                position: new Vector2(1000, 100),
                revealed: false,
                id: Math.random()
            },
            graveyard: {
                cards: [],
                position: new Vector2(1000, 500),
                revealed: true,
                id: Math.random()
            },
            exile: {
                cards: [],
                position: new Vector2(1300, 500),
                revealed: true,
                id: Math.random()
            },
            commander: {
                cards: [],
                position: new Vector2(1300, 100),
                revealed: true,
                id: Math.random()
            }
        });

        this.loadTestData();
    }

    // State manipulation methods
    tapCard(cardId: CardId) {
        const index = this.board.findIndex(c => c.id === cardId);
        if (index !== -1) {
            this.board[index].tapped = !this.board[index].tapped;
        }
    }

    setCardPosition(cardId: CardId, x: number, y: number) {
        const index = this.board.findIndex(c => c.id === cardId);
        if (index !== -1) {
            this.board[index].position.set(x, y);
        }
    }

    addCardToHand(card: CardData, index?: number) {
        if (index !== undefined) {
            this.hand.splice(index, 0, card);
            return;
        }
        this.hand.push(card);
    }

    removeCardFromHand(cardId: CardId) {
        const index = this.hand.findIndex(c => c.id === cardId);
        if (index !== -1) {
            this.hand.splice(index, 1);
        }
    }

    addToBoardDragging(card: CardData) {
        this.dragging = true;
        this.dragging_card = card;
        this.prev_dragging_card = card;

        card.position.x = this.cursor_position.x;
        card.position.x = this.cursor_position.y;

        this.board.push(card);
    }
    moveCardFromHandToBoard(cardId: CardId, position: Vector2) {
        const cardIndex = this.hand.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
            const [card] = this.hand.splice(cardIndex, 1);
            card.position = position;
            this.board.push(card);
        }
    }
    moveCardFromBoardToHand(cardId: CardId, position?: number) {
        const cardIndex = this.board.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
            const [card] = this.board.splice(cardIndex, 1);
            if (position !== undefined) {
                this.hand.splice(position, 0, card);
            } else {
                this.hand.push(card);
            }
        }
    }


    setDragging(card: CardData | undefined) {
        this.dragging = true;
        this.dragging_card = card;
        this.prev_dragging_card = card;
    }
    stopDragging() {
        this.dragging = false;
        this.dragging_card = undefined;
    }

    getOutOfPile(pile: PileType, index?: number) {
        const card = index !== undefined ? this.piles[pile].cards.splice(index, 1)[0] : this.piles[pile].cards.pop();
        assert(card, 'Pile is empty');

        this.addToBoardDragging(card);
    }

    dropCardOnPile(pile: PileType) {
        assert(this.prev_dragging_card, 'No card is being dragged');

        const card = this.prev_dragging_card;
        const cardIndex = this.board.findIndex(c => c.id === card.id);
        if (cardIndex !== -1) {
            const [card] = this.board.splice(cardIndex, 1);
            this.piles[pile].cards.push(card);
        }

        this.pile_dropping = undefined;
        this.stopDragging();
    }

    putCardOnTop(cardId: CardId) {
        const cardIndex = this.board.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
            const [card] = this.board.splice(cardIndex, 1);
            this.board.push(card);
        }

        /*
        let base_order = data.order;
        let max_order = 0;
        board_self.forEach((c) => {
            if (c.order > max_order) max_order = c.order;

            if (c.order > base_order) c.order--;
        });

        data.order = max_order;
         */
    }

    setPilePosition(pile: PileType, x: number, y: number) {
        this.piles[pile].position.set(x, y);
    }

    startDragPile(pile: PileType) {
        this.dragging_pile = pile;
    }
    stopDragPile() {
        this.dragging_pile = undefined;
    }

    moveCardInHand(cardId: CardId, index: number) {
        const cardIndex = this.hand.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
            const [card] = this.hand.splice(cardIndex, 1);
            this.hand.splice(index, 0, card);
        }
    }

    // getOutOfHand(cardId: CardId) {
    //     const cardIndex = this.hand.findIndex(c => c.id === cardId);
    //     if (cardIndex !== -1) {
    //         // const [card] = this.hand.splice(cardIndex, 1);
    //         this.addToBoardDragging(card);
    //     }
    // }


    loadTestData() {
        const cards: CardData[] =
            images.map((link, i) => ({
                img: link,
                id: Math.random(),
                order: i,
                equipped_to: undefined,
                position: Vector2.zero,
                tapped: false
            }))
            .sort(() => Math.random() - 0.5);
        this.hand = cards.splice(0, 7);
        this.board = cards.splice(0, 1);
        this.piles["library"].cards = cards;
    }
}

// Export singleton instance
export const gameManager = new GameStateManager();
