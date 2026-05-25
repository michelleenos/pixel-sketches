import Vec2 from './vec2'

export class Rectangle {
    x: number
    y: number
    w: number
    h: number

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }

    contains(x: number, y: number) {
        return x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h
    }

    intersects(rect: Rectangle) {
        return (
            this.x <= rect.x + rect.w &&
            this.x + this.w >= rect.x &&
            this.y <= rect.y + rect.h &&
            this.y + this.h >= rect.y
        )
    }
}

export class Bounds {
    x1: number
    y1: number
    x2: number
    y2: number

    constructor(x1: number, x2: number, y1: number, y2: number) {
        this.x1 = x1
        this.y1 = y1
        this.x2 = x2
        this.y2 = y2
    }

    get width() {
        return this.x2 - this.x1
    }

    get height() {
        return this.y2 - this.y1
    }

    contains(x: number, y: number) {
        return x >= this.x1 && x < this.x2 && y >= this.y1 && y < this.y2
    }

    intersects(x1: number, y1: number, x2: number, y2: number): boolean
    intersects(bounds: Bounds): boolean
    intersects(...args: [Bounds] | [number, number, number, number]) {
        if (args[0] instanceof Bounds) {
            return (
                this.x1 <= args[0].x2 &&
                this.x2 >= args[0].x1 &&
                this.y1 <= args[0].y2 &&
                this.y2 >= args[0].y1
            )
        } else {
            let [x1, y1, x2, y2] = args as [number, number, number, number]
            return this.x1 <= x2 && this.x2 >= x1 && this.y1 <= y2 && this.y2 >= y1
        }
    }
}

export class Circle extends Vec2 {
    _r: number
    rSquared: number

    constructor(x: number, y: number, r: number) {
        super(x, y)
        this._r = r
        this.rSquared = r * r
    }

    get radius() {
        return this._r
    }

    set radius(v: number) {
        this._r = v
        this.rSquared = v * v
    }

    contains(x: number, y: number) {
        let distSq = this.copy().sub(x, y).magSq()
        return distSq <= this.rSquared
    }

    intersectsCircle(other: Circle, padding = 0) {
        let dist = this.distance(other)
        return dist <= this._r + other._r + padding
    }
}
