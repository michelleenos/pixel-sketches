export default class Vec2 {
    x: number
    y: number
    constructor(x = 0, y = 0) {
        this.x = x
        this.y = y
    }

    _getXYArgs(arg1: number | Vec2, arg2?: number) {
        if (arg1 instanceof Vec2) return [arg1.x, arg1.y]
        return [arg1, typeof arg2 === 'number' ? arg2 : arg1]
    }

    add(n: number, n2?: number): this
    add(vec2: Vec2): this
    add(arg1: number | Vec2, arg2?: number): this {
        const [x, y] = this._getXYArgs(arg1, arg2)
        this.x += x
        this.y += y
        return this
    }

    sub(n: number, n2?: number): this
    sub(vec2: Vec2): this
    sub(arg1: number | Vec2, arg2?: number): this {
        const [x, y] = this._getXYArgs(arg1, arg2)
        this.x -= x
        this.y -= y
        return this
    }

    mult(n: number, n2?: number): this
    mult(vec2: Vec2): this
    mult(arg1: Vec2 | number, arg2?: number) {
        const [x, y] = this._getXYArgs(arg1, arg2)
        this.x *= x
        this.y *= y
        return this
    }

    div(n: number, n2?: number): this
    div(vec2: Vec2): this
    div(arg1: Vec2 | number, arg2?: number) {
        const [x, y] = this._getXYArgs(arg1, arg2)
        this.x /= x
        this.y /= y
        return this
    }

    magSq() {
        return this.x * this.x + this.y * this.y
    }

    mag() {
        return Math.sqrt(this.magSq())
    }

    copy() {
        return new Vec2(this.x, this.y)
    }

    setMag(mag: number) {
        this.normalize().mult(mag)
        return this
    }

    normalize() {
        const m = this.mag()
        if (m !== 0) this.div(m)
        return this
    }

    limit(n: number) {
        const magSq = this.magSq()
        if (magSq > n * n) {
            this.div(Math.sqrt(magSq)).mult(n)
        }
        return this
    }

    distance(other: Vec2) {
        return this.copy().sub(other).mag()
    }
}
