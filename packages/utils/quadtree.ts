import { Bounds } from './shapes'

export class QuadTree {
    bounds: Bounds
    capacity: number
    depth: number
    children: QuadTree[] = []
    points: [number, number][] = []
    parent: QuadTree | null = null
    isLeaf = true
    _maxDepth: number | null = null
    _count: number | null = null

    depthLimit: number

    constructor(
        bounds: Bounds | [number, number, number, number],
        capacity = 4,
        depthLimit = 20,
        depth = 0,
        parent: QuadTree | null = null,
    ) {
        this.bounds = bounds instanceof Bounds ? bounds : new Bounds(...bounds)
        this.depth = depth
        this.capacity = capacity
        this.depthLimit = depthLimit
        this._maxDepth = depth
        this._count = 0
        if (parent) this.parent = parent
    }

    get count(): number {
        if (this._count === null) {
            this._count = this.children.reduce(
                (total, child) => total + child.count,
                this.points.length,
            )
        }
        return this._count
    }

    get maxDepth(): number {
        if (this._maxDepth === null) {
            let depth = this.depth
            this.children.forEach((child) => {
                depth = Math.max(depth, child.maxDepth)
            })

            this._maxDepth = depth
        }
        return this._maxDepth
    }

    insert(point: [number, number]) {
        try {
            this._count = null

            if (!this.bounds.contains(...point)) {
                return false
            }

            if (this.isLeaf) {
                if (this.points.length < this.capacity) {
                    this.points.push(point)
                    return true
                } else if (this.children.length === 0) {
                    if (this.depth >= this.depthLimit) {
                        this.points.push(point)
                        return true
                    }
                    this.subdivide()
                }
            }

            for (let i = 0; i < this.children.length; i++) {
                if (this.children[i].insert(point)) {
                    return true
                }
            }
            return false
        } catch (e) {
            console.log(point, this)
            return false
        }
    }

    subdivide() {
        this._maxDepth = null
        // let { x, y, w, h } = this.bounds
        let { x1, x2, y1, y2 } = this.bounds
        let halfWidth = this.bounds.width / 2
        let halfHeight = this.bounds.height / 2
        this.isLeaf = false

        let ne = new QuadTree(
            [x1 + halfWidth, x2, y1, y1 + halfHeight],
            this.capacity,
            this.depthLimit,
            this.depth + 1,
            this,
        )
        let nw = new QuadTree(
            [x1, x1 + halfWidth, y1, y1 + halfHeight],
            this.capacity,
            this.depthLimit,
            this.depth + 1,
            this,
        )
        let se = new QuadTree(
            [x1 + halfWidth, x2, y1 + halfHeight, y2],
            this.capacity,
            this.depthLimit,
            this.depth + 1,
            this,
        )
        let sw = new QuadTree(
            [x1, x1 + halfWidth, y1 + halfHeight, y2],
            this.capacity,
            this.depthLimit,
            this.depth + 1,
            this,
        )

        this.children = [ne, nw, se, sw]

        while (this.points.length > 0) {
            let point = this.points.pop()!
            this.insert(point)
        }
    }

    getLeafNodes() {
        let children: QuadTree[] = []

        this.children.forEach((child) => {
            let c = child.getLeafNodes()
            children.push(...c)
        })

        if (children.length === 0) {
            children.push(this)
        }

        return children
    }

    paddedConflicts(point: [number, number], padding: number) {
        return this.conflicts(
            new Bounds(
                point[0] - padding,
                point[0] + padding,
                point[1] - padding,
                point[1] + padding,
            ),
        )
    }

    conflicts(range: Bounds) {
        if (!this.bounds.intersects(range)) {
            return false
        }

        for (let i = 0; i < this.points.length; i++) {
            if (range.contains(...this.points[i])) return true
        }

        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].conflicts(range)) return true
        }

        return false
    }

    query(range: Bounds) {
        if (!this.bounds.intersects(range)) {
            return []
        }

        let found: [number, number][] = []
        for (let p of this.points) {
            if (range.contains(...p)) found.push(p)
        }

        this.children.forEach((child) => {
            found.push(...child.query(range))
        })

        return found
    }

    getAllPoints() {
        let points: [number, number][] = [...this.points]
        this.children.forEach((child) => {
            points.push(...child.getAllPoints())
        })

        return points
    }

    rebuild() {
        let points = this.getAllPoints()
        this.clear()
        points.forEach((p) => this.insert(p))
        this._maxDepth = null
    }

    clear() {
        this.points = []
        this.children = []
        this.isLeaf = true
        this._count = null
        this._maxDepth = this.depth
    }
}
