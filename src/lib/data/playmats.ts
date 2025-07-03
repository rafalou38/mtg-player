import { Vector2 } from "$lib/util/math.svelte";

export const playmats = [
    { name: '01', url: '/bg/01.jpg' },
    { name: '02', url: '/bg/02.jpg' },
    // { name: '03', url: '/bg/03.jpg' },
    { name: '04', url: '/bg/04.jpg' },
    { name: '05', url: '/bg/05.jpg' },
    { name: '06', url: '/bg/06.jpg' },
    { name: '07', url: '/bg/07.jpg' },
    { name: '08', url: '/bg/08.jpg' },
    { name: '09', url: '/bg/09.jpg' },
    { name: '10', url: '/bg/10.jpg' },
    // { name: '11', url: '/bg/11.jpg' },
    // { name: '12', url: '/bg/12.jpg' },
    { name: '13', url: '/bg/13.jpg' },
    { name: '14', url: '/bg/14.jpg' },
    { name: '15', url: '/bg/15.jpg' }
];

export const playmat_gap = 200;
export const playmat_positions: [Vector2, boolean][] = [
    [new Vector2(0, 0), false],


    [new Vector2(0, 0), false],
    [new Vector2(0, -1080 - playmat_gap), true],

    [new Vector2(2160 + playmat_gap + 500, -1080 - playmat_gap), true],
    [new Vector2(2160 + playmat_gap + 500, 0), false],
];