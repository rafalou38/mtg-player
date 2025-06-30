export class Vector2 {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = $state(x);
        this.y = $state(y);
    }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(v: Vector2) {
        this.x += v.x;
        this.y += v.y;
    }

    sub(v: Vector2) {
        this.x -= v.x;
        this.y -= v.y;
    }

    scale(k: number) {
        this.x *= k;
        this.y *= k;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    serialize(): [number, number] {
        return [this.x, this.y];
    }
    static load(data: number[]) {
        try {
            return new Vector2(data[0], data[1]);
        } catch (e) {
            console.error("Invalid vector data", e);
            return new Vector2(0, 0);
        }
    }
    static get zero() {
        return new Vector2(0, 0);
    }
}