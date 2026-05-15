import { Bounds, QuadTree } from 'utils'

type Point2d = [number, number]
export class Curve {
    points: Point2d[]

    constructor(points: Point2d[]) {
        this.points = points
    }
}

type CurvePointFn = ([x, y]: Point2d) => Point2d

export class Curves {
    curves: Curve[] = []
    qt: QuadTree
    _bounds: Bounds
    fn: CurvePointFn
    minSpace = 10

    constructor({ bounds, fn, minSpace }: { bounds: Bounds; fn: CurvePointFn; minSpace?: number }) {
        this._bounds = bounds
        this.fn = fn
        if (minSpace !== undefined) this.minSpace = minSpace
        this.qt = new QuadTree(this._bounds, 100)
    }

    set bounds(newBounds: Bounds) {
        this._bounds = newBounds
        this.qt = new QuadTree(this._bounds, 100)
    }

    clear = () => {
        this.qt.clear()
        this.curves = []
    }

    pointIsValid = (x: number, y: number) => {
        if (!this._bounds.contains(x, y)) return false
        let paddedBounds = new Bounds(
            x - this.minSpace,
            x + this.minSpace,
            y - this.minSpace,
            y + this.minSpace,
        )
        if (this.qt.query(paddedBounds).length > 0) return false
        return true
    }

    attemptGenerate = (start: [number, number], minLength = 3, maxLength = Infinity) => {
        let [x, y] = start

        let points: [number, number][] = []
        let done = false

        while (points.length < maxLength && !done) {
            if (!this.pointIsValid(x, y)) {
                done = true
                break
            }

            points.push([x, y])

            if (points.length >= maxLength) {
                done = true
                break
            }

            ;[x, y] = this.fn([x, y])
        }

        // console.log(`cur curves len: ${this.curves.length}; maxdepth: ${this.qt.maxDepth}`)

        if (points.length >= minLength) {
            const c = new Curve(points)
            points.forEach((p) => this.qt.insert(p))
            this.curves.push(c)
            return c
        }

        return false
    }
}
