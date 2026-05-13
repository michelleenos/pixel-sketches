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
    bounds: Bounds
    fn: CurvePointFn
    minSpace = 10

    constructor(bounds: Bounds, fn: CurvePointFn) {
        this.bounds = bounds
        this.fn = fn
        this.qt = new QuadTree(this.bounds, 4)
    }

    pointIntersects = (x: number, y: number, tempQt?: QuadTree) => {
        let paddedBounds = new Bounds(
            x - this.minSpace,
            x + this.minSpace,
            y - this.minSpace,
            y + this.minSpace,
        )
        if (!this.bounds.contains(x, y)) return true
        if (this.qt.query(paddedBounds).length > 0) return true
        if (tempQt && tempQt.query(paddedBounds).length > 0) return true
        return false
    }

    attemptGenerate = (start: [number, number], minLength = 3, maxLength = Infinity) => {
        let [x, y] = start

        let points: [number, number][] = []
        let done = false
        let tempQt = new QuadTree(this.bounds, 4)

        while (points.length < maxLength && !done) {
            if (this.pointIntersects(x, y)) {
                done = true
                break
            }

            points.push([x, y])
            tempQt.insert([x, y])

            if (points.length >= maxLength) {
                done = true
                break
            }

            ;[x, y] = this.fn([x, y])
        }

        if (points.length >= minLength) {
            const c = new Curve(points)
            points.forEach((p) => this.qt.insert(p))
            this.curves.push(c)
            return c
        }

        return false
    }
}
