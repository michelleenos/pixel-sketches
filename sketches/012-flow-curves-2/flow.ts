import chroma from 'chroma-js'
import {
    Bounds,
    Circle,
    clamp,
    easing,
    map,
    QuadTree,
    random,
    randomBiased,
    round,
    type Easing,
} from 'utils'
import type { FlowParams } from './flow.types'

function circlePack(
    bounds: Bounds,
    radius = 20,
    maxAttempts = 50,
    existing?: Circle[],
): [number, number][] {
    let circles: Circle[] = existing || []
    let attempts = 0

    while (attempts < maxAttempts) {
        let circle = new Circle(
            random(bounds.x1 + radius, bounds.x2 - radius),
            random(bounds.y1 + radius, bounds.y2 - radius),
            radius,
        )
        let valid = true

        for (let i = 0; i < circles.length; i++) {
            if (circle.intersectsCircle(circles[i])) {
                valid = false
                break
            }
        }

        if (valid) {
            circles.push(circle)
            attempts = 0
        } else {
            attempts++
        }
    }

    return circles.map((c) => [c.x, c.y])
}

type Curve = {
    points: [number, number][]
    color: string
}

export class Flow {
    _palette: { bg: string; colors: string[] } = { bg: '#121212', colors: ['#ffffff'] }
    _colorScale: chroma.Scale
    vals: [number, number, number, number]
    margin = 25
    _bounds: Bounds
    stepLength: number = 4
    maxSteps = 50
    minSteps = 10
    lineWidthMax = 7
    lineWidthMin = 0.5
    minSpace = 6
    taperEase: Easing = 'outCirc'
    taperLength = 200
    qt: QuadTree
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
    curves: Curve[] = []

    constructor(
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
        params: FlowParams,
    ) {
        this.ctx = ctx

        if (params.stepLength !== undefined) this.stepLength = params.stepLength
        if (params.maxSteps !== undefined) this.maxSteps = params.maxSteps
        if (params.lineWidthMax !== undefined) this.lineWidthMax = params.lineWidthMax
        if (params.lineWidthMin !== undefined) this.lineWidthMin = params.lineWidthMin
        if (params.taperEase !== undefined) this.taperEase = params.taperEase
        if (params.palette) this._palette = params.palette
        if (params.minSteps) this.minSteps = params.minSteps
        if (params.minSpace) this.minSpace = params.minSpace
        if (params.taperLength) this.taperLength = params.taperLength
        this.vals = params.vals || Flow.randomFlowVals()

        this._bounds = new Bounds(
            this.margin,
            params.width - this.margin,
            this.margin,
            params.height - this.margin,
        )

        this.qt = new QuadTree(this._bounds, 4)
        this.setSize({ width: params.width, height: params.height })
        this._colorScale = chroma.scale(this.palette.colors).mode('hsl')
    }

    static randomFlowVals = (): [number, number, number, number] => {
        return [
            round(random(2, 10), 2),
            round(random(5, 15), 2) * random([-1, 1]),
            round(random(5, 10), 2),
            round(random(5, 20), 2),
        ]
    }

    set palette(p: { colors: string[]; bg: string }) {
        this._palette = p
        let colors = this._palette.colors.map((c) => chroma(c))
        colors.sort((a, b) => a.temperature() - b.temperature())
        this._colorScale = chroma.scale(colors).mode('hsl')
    }

    get palette() {
        return this._palette
    }

    setSize = (size: { width: number; height: number }) => {
        this._bounds.x2 = size.width - this.margin
        this._bounds.y2 = size.height - this.margin
        this.qt.clear()
    }

    getTaper = (i: number, curveLen: number) => {
        let distFromEnd = i < curveLen / 2 ? i * this.stepLength : (curveLen - i) * this.stepLength
        if (distFromEnd > this.taperLength) return this.lineWidthMax
        let amt = Math.min(distFromEnd / this.taperLength, 1)
        amt = easing[this.taperEase](amt)
        return map(amt, 0, 1, this.lineWidthMin, this.lineWidthMax)
    }

    getColor = (x: number, _y: number) => {
        // let pos = randomBiased(0, 1)
        let pos = clamp(map(x, this._bounds.x1, this._bounds.x2, 0, 1), 0, 1)

        let scaleVal = randomBiased(0, 1, pos, 1)

        return this._colorScale(scaleVal)
    }

    pointIsValid = (x: number, y: number, tempQt?: QuadTree) => {
        if (!this._bounds.contains(x, y)) return false

        if (tempQt?.paddedConflicts([x, y], this.stepLength / 2)) return false
        if (this.qt.paddedConflicts([x, y], this.minSpace)) return false
        return true
    }

    getAngle = (x: number, y: number) => {
        const fx = Math.sin(x * this.vals[0] + Math.cos(y * this.vals[1]))
        const fy = -Math.cos(y * this.vals[2] - Math.sin(x * this.vals[3]))
        const a = Math.atan2(fy, fx)
        return a
    }

    getNextPoint = ([x, y]: [number, number], reverse = false) => {
        let scale = 1 / this._bounds.width
        let offset = scale * 50
        let angle = this.getAngle(x * scale + offset, y * scale + offset)
        if (reverse) angle += Math.PI
        let xStep = this.stepLength * Math.cos(angle)
        let yStep = this.stepLength * Math.sin(angle)
        return [x + xStep, y + yStep] as [number, number]
    }

    drawCurve = (curve: Curve) => {
        const { ctx } = this
        const { color, points } = curve

        ctx.strokeStyle = color
        ctx.lineCap = 'round'

        for (let i = 1; i < points.length; i++) {
            let prev = points[i - 1]
            let cur = points[i]
            let taper = this.getTaper(i, points.length)

            ctx.lineWidth = taper
            ctx.beginPath()
            ctx.moveTo(prev[0], prev[1])
            ctx.lineTo(cur[0], cur[1])
            ctx.stroke()
        }
    }

    getPointFromCurve = (points: [number, number][]): [number, number] => {
        let index = Math.floor(random(1, points.length))
        let p = points[index]
        let prev = points[index - 1]
        let dx = p[0] - prev[0]
        let dy = p[1] - prev[1]
        let turned = random() < 0.5 ? Math.atan2(-dx, dy) : Math.atan2(dx, -dy) // rotated 90 deg
        return [
            p[0] + Math.cos(turned) * (this.minSpace * 3),
            p[1] + Math.sin(turned) * (this.minSpace * 3),
        ]
    }

    getRandomPoint = (margin = 0.15): [number, number] => {
        let { width, height } = this._bounds
        return [
            random(width * margin, width * (1 - margin)),
            random(height * margin, height * (1 - margin)),
        ]
    }

    addCurve = (points: [number, number][]) => {
        const color = this.getColor(points[0][0], points[0][1]).css()
        this.curves.push({
            points,
            color,
        })
        points.forEach((p) => this.qt.insert(p))
        return points
    }

    circlePackToCurves = (minLength: number, idealCount: number, maxFails: number) => {
        let fails = 0
        let created = 0
        let initPoints = circlePack(this._bounds, this._bounds.width * 0.02, 50)
        let point: [number, number]

        while (initPoints.length > 0 && created < idealCount && fails < maxFails) {
            if (initPoints.length === 0)
                initPoints = circlePack(this._bounds, this._bounds.width * 0.1, 50)
            point = initPoints.pop()!
            let points = this.attemptCurve(point)
            if (points.length >= minLength) {
                this.addCurve(points)
                created++
                fails = 0
            } else {
                fails++
            }
        }

        console.log(`circle pack curves... minLength: ${minLength}, created: ${created}`)
        return created
    }

    drawWithTimeout = (timeout = 100) => {
        return new Promise<void>((resolve) => {
            this.draw()
            setTimeout(() => resolve(), timeout)
        })
    }

    generate = async (liveDraw = true) => {
        this.curves = []
        this.qt.clear()

        if (liveDraw) await this.drawWithTimeout(50)

        let maxFails = 200
        let fails = 0
        let idealLen = this.maxSteps

        let circlePackCreated = 0
        while (circlePackCreated === 0 && idealLen >= this.minSteps) {
            circlePackCreated = this.circlePackToCurves(idealLen, 10, 50)
            if (circlePackCreated === 0) idealLen -= 10
        }

        if (liveDraw) await this.drawWithTimeout(50)

        let point =
            this.curves.length > 0 ?
                this.getPointFromCurve(random(this.curves).points)
            :   this.getRandomPoint(0)
        let randomCount = 0
        let nextPointGen: 'random' | 'neighbor' = 'neighbor'

        while (fails < maxFails && idealLen > this.minSteps) {
            let points = this.attemptCurve(point)
            if (points.length >= idealLen) {
                let addedCurve = this.addCurve(points)
                fails = 0
                if (liveDraw) await this.drawWithTimeout(50)

                if (nextPointGen === 'random') {
                    console.log('random')
                    randomCount++
                    point = this.getPointFromCurve(addedCurve)
                    nextPointGen = 'neighbor'
                    continue
                }
            } else {
                fails++
            }

            if (fails >= maxFails) {
                if (nextPointGen === 'neighbor') {
                    nextPointGen = 'random'
                } else {
                    idealLen -= 10
                    nextPointGen = 'neighbor'
                }
                fails = 0
            }

            point =
                nextPointGen === 'neighbor' && this.curves.length > 0 ?
                    this.getPointFromCurve(random(this.curves).points)
                :   this.getRandomPoint(0)
        }

        if (liveDraw) this.draw()
    }

    generateFromRandom = (idealLen: number) => {
        let fails = 0
        let maxFails = 50

        while (fails < maxFails) {
            let points = this.attemptCurve(this.getRandomPoint())
            if (points.length >= idealLen) {
                return points
            }
            fails++
        }
    }

    attemptCurve = (start: [number, number], idealLen = Infinity) => {
        let point = start
        let points: [number, number][] = []
        let done = false
        let reversed = false
        if (!this.pointIsValid(point[0], point[1])) return []

        let tempQt = new QuadTree(this._bounds, 4)
        tempQt.insert(point)

        while (points.length < idealLen && !done) {
            point = this.getNextPoint(point, reversed)

            if (this.pointIsValid(point[0], point[1], tempQt)) {
                reversed ? points.unshift(point) : points.push(point)
                tempQt.insert(point)
            } else {
                if (!reversed) {
                    reversed = true
                    point = start
                } else {
                    done = true
                }
            }
        }
        return points
    }

    draw = () => {
        const { ctx } = this

        ctx.fillStyle = this.palette.bg
        ctx.fillRect(
            0,
            0,
            this._bounds.width + this.margin * 2,
            this._bounds.height + this.margin * 2,
        )
        this.curves.forEach(this.drawCurve)
    }
}
