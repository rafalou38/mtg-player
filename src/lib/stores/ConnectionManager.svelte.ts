import { assert } from '$lib/util/assert';
import { joinRoom, type ActionSender, type BaseRoomConfig, type RelayConfig, type Room, type TurnConfig } from 'trystero'
import { gameManager, GameStateManager } from './GameStateManager.svelte';
import type { CardData } from '$lib/types/Card';
import type { PileType } from '$lib/types/Pile';
import { Vector2 } from '$lib/util/math.svelte';
import type { Trinket } from '$lib/types/Trinkets';
type PileUpdate = {
    label: PileType;
    cards: (CardData & {
        position: [number, number]
    })[],
    position: [number, number],
    id: number,
    revealed: boolean
}

type BoardUpdate = {
    cards: (CardData & {
        position: [number, number]
    })[]
}

type Ready = {
    playmat: string
}

type TrinketsUpdate = {
    trinkets: (Trinket & {
        position: [number, number]
    })[],
    partial: boolean
}


const playmat_gap = 200;
const roots: [Vector2, boolean][] = [
    [new Vector2(0, 0), false],
    [new Vector2(2160, -playmat_gap), true],
    [new Vector2(2160 + playmat_gap, 0), false],
    [new Vector2(2160 * 2 + playmat_gap, -playmat_gap), true]
];

export class ConnectionManager {
    config: BaseRoomConfig & RelayConfig & TurnConfig = {
        appId: "mtg-player-fae55",

    };
    private room: Room | null = null;

    peer_cnt = $state(0);
    peers: Record<string, RTCPeerConnection> = $state({});
    connected: boolean = $state(false);
    game_managers: Record<string, GameStateManager> = $state({});
    ready_cnt = $state(0);

    private _dispatch_pile_update: ActionSender<PileUpdate> | null = null;
    private _dispatch_board_update: ActionSender<BoardUpdate> | null = null;
    private _dispatch_ready: ActionSender<Ready> | null = null;
    private _dispatch_trinkets: ActionSender<TrinketsUpdate> | null = null;

    constructor() {

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
        this.game_managers[peerId].root = roots[this.peer_cnt + 1][0];
        this.game_managers[peerId].flipped = roots[this.peer_cnt + 1][1];
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
    }

    private on_pile_update(data: PileUpdate, peer_id: string) {
        const pile_name = data["label"];
        const gm = this.game_managers[peer_id];
        const pile = gm.piles[pile_name];

        const sgn = gm.flipped ? -1 : 1;
        const pos = new Vector2(data.position[0], data.position[1]).scale(sgn).add(gm.root);

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

        const gm = this.game_managers[peer_id];

        const sgn = gm.flipped ? -1 : 1;

        const cards = data["cards"].map((card) => {
            const pos = new Vector2(card.position[0], card.position[1]).scale(sgn).add(gm.root);
            return {
                ...card,
                position: pos
            }
        });
        this.game_managers[peer_id].board = cards;
    }
    private on_ready(data: Ready, peer_id: string) {
        this.game_managers[peer_id].ready = true;
        this.game_managers[peer_id].playmat_url = data.playmat;
        this.ready_cnt++;
    }

    send_ready() {
        assert(this.room);
        assert(this._dispatch_ready);
        this._dispatch_ready({
            playmat: gameManager.playmat_url
        });
        gameManager.ready = true;
        this.ready_cnt++;
    }

    send_board_update() {
        assert(this.room);
        assert(this._dispatch_board_update);
        let cards: (CardData & { position: [number, number] })[] = gameManager.board.map((card) => {
            return {
                id: card.id,
                img: card.img,
                tapped: card.tapped,
                equipped_to: card.equipped_to,
                order: card.order,
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
            cards: cards
        });
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
            const sgn = this.game_managers[peer_id].flipped ? -1 : 1;
            const pos = new Vector2(trinket.position[0], trinket.position[1]).scale(sgn).add(this.game_managers[peer_id].root);
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
}

export const connectionManager = new ConnectionManager();