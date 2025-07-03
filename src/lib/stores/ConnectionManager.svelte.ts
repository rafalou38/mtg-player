import { assert } from '$lib/util/assert';
import { joinRoom, type ActionSender, type BaseRoomConfig, type RelayConfig, type Room, type TurnConfig } from 'trystero/firebase';
import { gameManager, GameStateManager } from './GameStateManager.svelte';
import type { CardData } from '$lib/types/Card';
import type { PileType } from '$lib/types/Pile';
import { Vector2 } from '$lib/util/math.svelte';
import type { Trinket } from '$lib/types/Trinkets';
type PileUpdate = {
    label: PileType;
    cards: (Omit<CardData, "position"> & {
        position: [number, number]
    })[],
    position: [number, number],
    id: number,
    revealed: boolean
}

type BoardUpdate = {
    cards: (Omit<CardData, "position"> & {
        position: [number, number]
    })[],
    type: "board" | "add" | "edit"
}

type Ready = {
    playmat: string,
    deck_img: string,
    playmat_id: number
}

type TrinketsUpdate = {
    trinkets: (Omit<Trinket, "position"> & {
        position: [number, number]
    })[],
    partial: boolean
}

type HandUpdate = {
    cards: string[],
}


export class ConnectionManager {
    config: BaseRoomConfig & RelayConfig & TurnConfig = {
        appId: "https://mtg-player-default-rtdb.europe-west1.firebasedatabase.app",
    };
    private room: Room | null = null;

    peer_cnt = $state(0);
    peers: Record<string, RTCPeerConnection> = $state({});
    connected: boolean = $state(false);
    game_managers: Record<string, GameStateManager> = $state({});
    ready_cnt = $state(0);
    playmat_users = $state<string[]>(new Array(10).fill(''));

    private _dispatch_pile_update: ActionSender<PileUpdate> | null = null;
    private _dispatch_board_update: ActionSender<BoardUpdate> | null = null;
    private _dispatch_ready: ActionSender<Ready> | null = null;
    private _dispatch_trinkets: ActionSender<TrinketsUpdate> | null = null;
    private _dispatch_hand_update: ActionSender<HandUpdate> | null = null;

    constructor() {
        // this.playmat_users[1] = "https://storage.googleapis.com/archidekt-card-images/slx/c35accd3-92ee-4b0b-a30a-4dcd3252d1b8_art_crop.jpg";
    }
    connect(code: string) {
        this.room = joinRoom(this.config, code);
        if (!this.room) return;

        this.room.onPeerJoin(this.onPeerJoin.bind(this));
        this.room.onPeerLeave(this.onPeerLeave.bind(this));

        this.connected = true;

        this.setup_actions()
    }
    disconnect() {
        if (this.room) {
            this.room.leave();
            this.room = null;
            this.peers = {};
        }
    }

    private onPeerJoin(peerId: string) {
        console.log("Peer joined", peerId);
        assert(this.room);
        this.peers = this.room.getPeers();

        this.game_managers[peerId] = new GameStateManager(true);
        this.peer_cnt++;
    }
    private onPeerLeave(peerId: string) {
        console.log("Peer left", peerId);
        assert(this.room);
        this.peers = this.room.getPeers();

        delete this.game_managers[peerId];
    }

    private setup_actions() {
        assert(this.room);
        const [send_pile_update, connect_pile_update] = this.room.makeAction<PileUpdate>('pile_update');
        this._dispatch_pile_update = send_pile_update;
        connect_pile_update(this.on_pile_update.bind(this));

        const [send_board_update, connect_board_update] = this.room.makeAction<BoardUpdate>('board_update');
        this._dispatch_board_update = send_board_update;
        connect_board_update(this.on_board_update.bind(this));

        const [send_ready, connect_ready] = this.room.makeAction<Ready>('ready');
        this._dispatch_ready = send_ready;
        connect_ready(this.on_ready.bind(this));


        const [send_trinkets, connect_trinkets] = this.room.makeAction<TrinketsUpdate>('trinkets');
        this._dispatch_trinkets = send_trinkets;
        connect_trinkets(this.on_trinket_update.bind(this));

        const [send_hand_update, connect_hand_update] = this.room.makeAction<HandUpdate>('hand_update');
        this._dispatch_hand_update = send_hand_update;
        connect_hand_update(this.on_hand_update.bind(this));
    }

    private on_pile_update(data: PileUpdate, peer_id: string) {
        const pile_name = data["label"];
        const gm = this.game_managers[peer_id];
        const pile = gm.piles[pile_name];

        const pos = new Vector2(data.position[0], data.position[1]);

        const cards = data["cards"].map((card) => {
            return {
                ...card,
                position: pos.clone(),
            }
        });

        pile.cards = cards;
        pile.position = pos;
        pile.revealed = data.revealed;
        pile.id = data.id;

        console.log("received pile", pile);
    }

    send_pile_update(pile_label: PileType) {
        assert(this.room);
        assert(this._dispatch_pile_update);
        const pile = gameManager.piles[pile_label];
        this._dispatch_pile_update({
            label: pile_label,
            cards: pile.cards.map((card) => {
                return {
                    id: card.id,
                    img: card.img,
                    name: card.name,
                    tapped: card.tapped,
                    equipped_to: card.equipped_to,
                    order: card.order,
                    position: card.position.serialize(),
                }
            }),
            position: pile.position.serialize(),
            id: pile.id,
            revealed: pile.revealed
        });
    }

    private on_board_update(data: BoardUpdate, peer_id: string) {
        const cards = data["cards"].map((card) => {
            const pos = new Vector2(card.position[0], card.position[1]);
            return {
                ...card,
                position: pos
            }
        });

        if (data.type == "board")
            this.game_managers[peer_id].board = cards;
        else if (data.type == "add") {
            this.game_managers[peer_id].board = this.game_managers[peer_id].board.concat(cards);
        } else if (data.type == "edit") {
            this.game_managers[peer_id].board = this.game_managers[peer_id].board.map((card) => {
                if (card.id == cards[0].id) {
                    return cards[0];
                } else {
                    return card;
                }
            });
        }
    }
    private on_ready(data: Ready, peer_id: string) {
        this.game_managers[peer_id].ready = true;

        this.game_managers[peer_id].playmat_url = data.playmat;
        this.game_managers[peer_id].deck_image = data.deck_img;
        // this.game_managers[peer_id].playmat_id = data.playmat_id;

        this.game_managers[peer_id].playmat_index = data.playmat_id;
        this.playmat_users[data.playmat_id] = data.deck_img;

        console.log("rcv", data.playmat_id);

        this.ready_cnt++;
    }

    send_ready(playmat_id: number) {
        assert(this.room);
        assert(this._dispatch_ready);
        console.log("self", playmat_id);
        this._dispatch_ready({
            playmat: gameManager.playmat_url,
            deck_img: gameManager.deck_image,
            playmat_id: playmat_id
        });
        gameManager.ready = true;
        gameManager.playmat_index = playmat_id;
        if([2,3].includes (playmat_id)) {
            gameManager.flipped = true;
        }
        this.playmat_users[playmat_id] = gameManager.deck_image;
        this.ready_cnt++;
    }

    send_board_update(card?: CardData, new_card = false) {
        assert(this.room);
        assert(this._dispatch_board_update);
        if (card) {
            const hidden = gameManager.dragging && gameManager.dragging_card && gameManager.dragging_card_origin != "board" && card.id == gameManager.dragging_card?.id;
            this._dispatch_board_update({
                cards: [
                    {
                        id: card.id,
                        img: hidden ? "/card_bg.jpg" : card.img,
                        tapped: card.tapped,
                        name: card.name,
                        equipped_to: card.equipped_to,
                        order: card.order,
                        position: card.position.serialize(),
                    }
                ],
                type: new_card ? "add" : "edit"
            })

        } else {
            let cards = gameManager.board.map((card) => {
                return {
                    id: card.id,
                    img: card.img,
                    tapped: card.tapped,
                    equipped_to: card.equipped_to,
                    order: card.order,
                    name: card.name,
                    position: card.position.serialize(),
                }
            });
            if (gameManager.dragging && gameManager.dragging_card && gameManager.dragging_card_origin != "board") {
                cards = cards.map((card) => {
                    if (card.id == gameManager.dragging_card?.id) {
                        card.img = "/card_bg.jpg"
                    }

                    return card;
                });
            }
            this._dispatch_board_update({
                cards: cards,
                type: "board"
            });
        }
    }

    sendTrinketsUpdate(trinkets?: Trinket[]) {
        assert(this.room);
        assert(this._dispatch_trinkets);
        if (trinkets) {
            this._dispatch_trinkets({
                trinkets: trinkets.map(t => ({ ...t, position: t.position.serialize() })),
                partial: true
            });
        } else {
            this._dispatch_trinkets({
                trinkets: gameManager.trinkets.map(t => ({ ...t, position: t.position.serialize() })),
                partial: false
            });
        }
    }

    private on_trinket_update(data: TrinketsUpdate, peer_id: string) {
        const trinkets = data["trinkets"].map((trinket) => {
            const pos = new Vector2(trinket.position[0], trinket.position[1]);
            return {
                ...trinket,
                position: pos
            }
        });
        if (data.partial) {
            for (const newTrinket of trinkets) {
                const found = this.game_managers[peer_id].trinkets.find(t => t.id == newTrinket.id);
                if (found) {
                    found.position = newTrinket.position;
                    found.value = newTrinket.value;
                } else {
                    this.game_managers[peer_id].trinkets.push(newTrinket);
                }
            }
        } else {
            this.game_managers[peer_id].trinkets = trinkets;
        }
    }
    send_hand_update() {
        assert(this.room);
        assert(this._dispatch_hand_update);
        this._dispatch_hand_update({
            cards: gameManager.hand.map(() => {
                return "/card_bg.jpg"
            })
        });
    }

    private on_hand_update(data: HandUpdate, peer_id: string) {
        const cards = data["cards"];
        this.game_managers[peer_id].partial_hand = cards;
    }
}

export const connectionManager = new ConnectionManager();