// src/lib/stores/GameStateManager.svelte.ts
import type { CardData, CardId } from "$lib/types/Card";
import { Vector2 } from "$lib/util/math.svelte";
import images from '$lib/data/test_deck.json';
import type { Pile, PileType } from "$lib/types/Pile";
import { assert } from "$lib/util/assert";
import { connectionManager } from "./ConnectionManager.svelte";
import type { ArchidektDeck } from "$lib/types/ArchidektApi";
import type { Trinket } from "$lib/types/Trinkets";

export class GameStateManager {

    passive: boolean;
    ready = $state(false);

    hand = $state<CardData[]>([]);
    partial_hand = $state<string[]>([]);
    board = $state<CardData[]>([]);

    piles: { [key in PileType]: Pile };

    trinkets = $state<Trinket[]>([]);


    root: Vector2 = $state(new Vector2(0, 0));
    flipped: boolean = $state(false);
    playmat_url: string = $state('');

    // UI state
    zoom = $state(1);
    translate = $state<Vector2>(Vector2.zero)

    dragging = $state(false);
    dragging_card = $state<CardData | undefined>(undefined);
    dragging_card_origin = $state<PileType | "hand" | "board" | undefined>(undefined);
    prev_dragging_card = $state<CardData | undefined>(undefined);

    dragging_pile: PileType | undefined = $state(undefined);

    dragging_trinket = $state(false);

    hand_dropping_index = $state<number | undefined>(undefined);
    pile_dropping = $state<string | undefined>(undefined);

    cursor_position = $state<Vector2>(Vector2.zero);

    blocked = $state(false);

    constructor(is_passive: boolean = false) {
        this.passive = $state(is_passive);
        if (is_passive) {
            this.ready = false;
        } else {
            this.ready = false;
        }
        this.piles = $state({
            library: {
                cards: [],
                position: new Vector2(30 + 2160, 0),
                revealed: false,
                id: Math.random()
            },
            graveyard: {
                cards: [],
                position: new Vector2(30 + 2160, 400),
                revealed: true,
                id: Math.random()
            },
            exile: {
                cards: [],
                position: new Vector2(30 + 2160 + 300, 0),
                revealed: true,
                id: Math.random()
            },
            commander: {
                cards: [],
                position: new Vector2(30 + 2160 + 300, 400),
                revealed: true,
                id: Math.random()
            }
        });
    }

    // State manipulation methods
    tapCard(cardId: CardId) {
        const index = this.board.findIndex(c => c.id === cardId);
        if (index !== -1) {
            this.board[index].tapped = !this.board[index].tapped;
        }
        connectionManager.send_board_update(this.board[index], false);
    }

    setCardPosition(cardId: CardId, x: number, y: number) {
        const index = this.board.findIndex(c => c.id === cardId);
        if (index !== -1) {
            this.board[index].position.set(x, y);
        }
        connectionManager.send_board_update(this.board[index], false);
    }

    addCardToHand(card: CardData, index?: number) {
        this.removeCardFromHand(card.id);

        if (index !== undefined) {
            this.hand.splice(index, 0, card);
            return;
        }
        card.tapped = false;
        this.hand.push(card);


        connectionManager.send_hand_update();
    }

    removeCardFromHand(cardId: CardId) {
        const index = this.hand.findIndex(c => c.id === cardId);
        if (index !== -1) {
            this.hand.splice(index, 1);
        }

        connectionManager.send_hand_update();
    }
    removeCardFromBoard(cardId: CardId, send = true) {
        const index = this.board.findIndex(c => c.id === cardId);
        if (index !== -1) {
            this.board.splice(index, 1);
        }

        if (send) connectionManager.send_board_update();
    }

    addToBoardDragging(card: CardData) {
        this.dragging = true;
        this.dragging_card = card;
        this.prev_dragging_card = card;
        card.tapped = false;

        this.removeCardFromBoard(card.id);
        this.board.push(card);


        if (card) this.putCardOnTop(card.id, false);

        connectionManager.send_board_update(card, true);
    }
    moveCardFromHandToBoard(cardId: CardId, position: Vector2) {
        const cardIndex = this.hand.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
            const [card] = this.hand.splice(cardIndex, 1);
            card.position = position;
            card.tapped = false;
            this.removeCardFromBoard(cardId);
            this.board.push(card);
            connectionManager.send_board_update(card, true);
        }

        connectionManager.send_hand_update();

    }
    moveCardFromBoardToHand(cardId: CardId, position?: number) {
        this.removeCardFromHand(cardId);

        const cardIndex = this.board.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
            const [card] = this.board.splice(cardIndex, 1);
            card.tapped = false;
            if (position !== undefined) {
                this.hand.splice(position, 0, card);
            } else {
                this.hand.push(card);
            }

            connectionManager.send_board_update();
        }

        this.dragging = false;
        this.dragging_card = undefined;
    }


    setDragging(card: CardData | undefined) {
        this.dragging = true;
        this.dragging_card = card;
        this.prev_dragging_card = card;
        if (card) this.putCardOnTop(card.id);
    }
    stopDragging() {
        this.dragging = false;
        this.dragging_card = undefined;

        connectionManager.send_board_update();
    }

    getOutOfPile(pile: PileType, index?: number) {
        const card = index !== undefined ? this.piles[pile].cards.splice(index, 1)[0] : this.piles[pile].cards.pop();
        assert(card, 'Pile is empty');

        connectionManager.send_pile_update(pile);


        this.addToBoardDragging(card);
    }

    dropCardOnPile(pile: PileType) {
        assert(this.prev_dragging_card, 'No card is being dragged');

        const card = this.prev_dragging_card;
        card.tapped = false;
        const cardIndex = this.board.findIndex(c => c.id === card.id);
        if (cardIndex !== -1) {
            const [card] = this.board.splice(cardIndex, 1);
            this.piles[pile].cards.push(card);
        }

        this.pile_dropping = undefined;
        this.stopDragging();

        connectionManager.send_pile_update(pile);
        connectionManager.send_board_update();
    }

    putCardOnTop(cardId: CardId, send = true) {
        const cardIndex = this.board.findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
            const card = this.board[cardIndex];

            const base_order = card.order;
            const duplicate = this.board.filter(c => c.order === base_order).length > 1;

            if (duplicate) {
                let max_order = 0;
                this.board.forEach((c) => {
                    if (c.id === card.id) return;
                    if (c.order > max_order) max_order = c.order;
                });
                card.order = max_order + 1;
            } else {
                let max_order = 10;
                this.board.forEach((c) => {
                    if (c.id === card.id) return;

                    if (c.order > max_order) max_order = c.order;
                    if (c.order > base_order) c.order--;
                });
                card.order = max_order;
            }
        }

        if (send) connectionManager.send_board_update();
    }

    setPilePosition(pile: PileType, x: number, y: number) {
        this.piles[pile].position.set(x, y);

        connectionManager.send_pile_update(pile);
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

        connectionManager.send_hand_update();
    }

    // getOutOfHand(cardId: CardId) {
    //     const cardIndex = this.hand.findIndex(c => c.id === cardId);
    //     if (cardIndex !== -1) {
    //         // const [card] = this.hand.splice(cardIndex, 1);
    //         this.addToBoardDragging(card);
    //     }
    // }

    setPlaymat(playmat_url: string) {
        this.playmat_url = playmat_url;
    }
    loadDeck(active_deck: ArchidektDeck) {

        // this.active_deck = active_deck;
        // this.piles["library"].cards = active_deck.cards;

        const excluded_categories = new Set(["sideboard", "maybeboard"]);
        for (const cat of active_deck.categories) {
            if (!cat.includedInDeck) {
                excluded_categories.add(cat.name.toLowerCase());
            }
        }
        for (const card of active_deck.cards) {
            loop: {
                const url = `https://api.scryfall.com/cards/${card.card.edition.editioncode}/${card.card.collectorNumber}?format=image`;

                for (const cat of card.categories) {
                    if (excluded_categories.has(cat.toLowerCase())) {
                        break loop;
                    }
                }

                for (let index = 0; index < card.quantity; index++) {
                    const cardData: CardData = {
                        img: url,
                        id: Math.random() + index,
                        name: card.card.oracleCard.name,
                        order: 0,
                        equipped_to: undefined,
                        position: Vector2.zero,
                        tapped: false
                    }

                    if (card.categories.includes("Commander")) {
                        this.piles["commander"].cards.push(cardData);
                    } else {
                        this.piles["library"].cards.push(cardData);
                    }
                }
            }
        }

        console.log(this.piles);
    }

    shuffle(pile: PileType) {
        const temp_pile = this.piles[pile].cards;
        this.piles[pile].cards = [];

        while (temp_pile.length > 0) {
            const index = Math.floor(Math.random() * temp_pile.length);
            this.piles[pile].cards.push(temp_pile[index]);
            temp_pile.splice(index, 1);
        }
    }
    draw(amount: number) {
        for (let i = 0; i < amount; i++) {
            const card = this.piles["library"].cards.pop();
            if (card)
                this.hand.push(card);
        }
        connectionManager.send_pile_update("library");
        connectionManager.send_hand_update();
    }

    mulligan() {
        this.piles["library"].cards = [...this.piles["library"].cards, ...this.hand];
        this.hand = [];
        this.shuffle("library");
        this.draw(7);

        connectionManager.send_pile_update("library");
        connectionManager.send_hand_update();
    }

    setTrinketPosition(trinketID: CardId, x: number, y: number) {
        const trinketIndex = this.trinkets.findIndex(c => c.id === trinketID);
        if (trinketIndex !== -1) {
            this.trinkets[trinketIndex].position.set(x, y);
        }

        connectionManager.sendTrinketsUpdate([this.trinkets[trinketIndex]]);
    }

    setTrinketValue(trinketID: CardId, value: number) {
        const trinketIndex = this.trinkets.findIndex(c => c.id === trinketID);
        if (trinketIndex !== -1) {
            this.trinkets[trinketIndex].value = value;
        }
        connectionManager.sendTrinketsUpdate([this.trinkets[trinketIndex]]);
    }

    addTrinket(trinket: Trinket) {
        this.trinkets.push(trinket);
        connectionManager.sendTrinketsUpdate([trinket]);
    }

    loadTestData() {
        const cards: CardData[] =
            images.map((link, i) => ({
                img: link,
                id: Math.random(),
                order: i,
                equipped_to: undefined,
                position: Vector2.zero,
                tapped: false,
                name: "test card"
            }))
                .sort(() => Math.random() - 0.5);
        this.hand = cards.splice(0, 7);
        this.board = cards.splice(0, 1);
        this.piles["library"].cards = cards.splice(0, 10);
    }

    handToBottom(card: CardData, pile: PileType) {
        this.removeCardFromHand(card.id);
        this.piles[pile].cards.unshift(card);

        connectionManager.send_pile_update(pile);
        connectionManager.send_hand_update();
    }
    boardToBottom(card: CardData, pile: PileType) {
        this.removeCardFromBoard(card.id);
        this.piles[pile].cards.unshift(card);

        connectionManager.send_pile_update(pile);

        card.tapped = false;
    }

    removeCardFromPile(card: CardData, pile: PileType) {
        this.piles[pile].cards = this.piles[pile].cards.filter(c => c.id !== card.id);

        connectionManager.send_pile_update(pile);
    }

    upkeep() {
        this.draw(1);
        this.board.forEach(c => (c.tapped = false));

        connectionManager.send_pile_update("library");
        connectionManager.send_board_update();
        connectionManager.send_hand_update();
    }
}

// Export singleton instance
export const gameManager = new GameStateManager(false);
