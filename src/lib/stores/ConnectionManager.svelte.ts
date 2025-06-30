import { assert } from '$lib/util/assert';
import { joinRoom, type ActionSender, type BaseRoomConfig, type RelayConfig, type Room, type TurnConfig } from 'trystero'
import { gameManager, GameStateManager } from './GameStateManager.svelte';
import type { CardData } from '$lib/types/Card';
import type { PileType } from '$lib/types/Pile';
import { Vector2 } from '$lib/util/math.svelte';
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
export class ConnectionManager {
    config: BaseRoomConfig & RelayConfig & TurnConfig = {
        appId: "mtg-player-fae55",

    };
    private room: Room | null = null;

    peers: Record<string, RTCPeerConnection> = $state({});
    connected: boolean = $state(false);
    game_managers: Record<string, GameStateManager> = $state({});

    private _dispatch_pile_update: ActionSender<PileUpdate> | null = null;
    private _dispatch_board_update: ActionSender<BoardUpdate> | null = null;

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
    }

    private on_pile_update(data: PileUpdate, peer_id: string) {
        const pile_name = data["label"];

        const pile = this.game_managers[peer_id].piles[pile_name];

        const cards = data["cards"].map((card) => {
            return {
                ...card,
                position: new Vector2(-card.position[0], -card.position[1])
            }
        });

        pile.cards = cards;
        pile.position = new Vector2(-data.position[0], -data.position[1]);
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
        const cards = data["cards"].map((card) => {
            return {
                ...card,
                position: new Vector2(-card.position[0], -card.position[1])
            }
        });
        this.game_managers[peer_id].board = cards;
    }

    send_board_update() {
        assert(this.room);
        assert(this._dispatch_board_update);
        this._dispatch_board_update({
            cards: gameManager.board.map((card) => {
                return {
                    id: card.id,
                    img: card.img,
                    tapped: card.tapped,
                    equipped_to: card.equipped_to,
                    order: card.order,
                    position: card.position.serialize(),
                }
            })
        });
    }
}

export const connectionManager = new ConnectionManager();