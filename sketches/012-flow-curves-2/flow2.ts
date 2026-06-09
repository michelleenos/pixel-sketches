import chroma from 'chroma-js'
import { Bounds, Circle, easing, map, QuadTree, random, randomBiased, type Easing } from 'utils'
import { randomFlowVals } from './flow-vals'
import type { FlowParams, FlowVals } from './flow2.types'

type DrawCtx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

function dist(p1: [number, number], p2: [number, number]) {
    let dx = p2[0] - p1[0]
    let dy = p2[1] - p1[1]
    return Math.sqrt(dx * dx + dy * dy)
}
function circlePack(
    bounds: Bounds,
    radius = 20,
    maxAttempts = 50,
    existing: Circle[] = [],
    maxCircles: number = Infinity,
) {
    if (radius <= 0) {
        console.warn("can't circle pack with an under 0 radius!")
        return []
    }
    let circles: Circle[] = existing || []
    let attempts = 0

    while (attempts < maxAttempts && circles.length < maxCircles) {
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

    return circles
}

type Curve = {
    points: [number, number][]
    color: string
}

export const flowDefaults: Required<Omit<FlowParams, 'width' | 'height' | 'palette' | 'vals'>> = {
    stepLength: 1,
    maxSteps: 200,
    minSteps: 10,
    lineWidthMax: 7,
    lineWidthMin: 0.5,
    decreaseStep: 5,
    minSpace: 6,
    maxFailsMin: 300,
    maxFailsMax: 300,
    scale: 1 / 800,
    offset: 0,
    minInitialCurves: 3,
    taperEase: 'outCirc',
    taperLength: 100,
    colorRepeats: 1,
    colorsMethod: 'clumps',
    colorRandomDist: 200,
    showColors: false,
    lineCap: 'round',
    brightenMax: 0,
    brightenMin: 0,
    qtCapacity: 20,
    liveInterval: 10,
}

export class Flow {
    _palette: { bg: string; colors: string[] } = { bg: '#121212', colors: ['#ffffff'] }
    _colorSeeds!: { color: string; x: number; y: number }[]
    scale: number
    offset: number
    _bounds: Bounds
    _colorRepeats: number
    _colorsMethod: 'clumps' | 'hue' | 'temp'
    _colorRandomDist: number
    _qtCapacity: number
    brightenMax: number
    brightenMin: number
    showColors = false
    vals: FlowVals
    margin = 25
    stepLength: number
    maxSteps: number
    maxFailsMax: number
    maxFailsMin: number
    // maxFailsIncrease: number
    minSteps: number
    minSpace: number
    minInitialCurves: number
    decreaseStep: number
    lineCap: 'round' | 'square'
    lineWidthMax: number
    lineWidthMin: number
    taperLength: number
    taperEase: Easing
    qt: QuadTree
    curves: Curve[] = []
    liveInterval: number
    lastFrame: number | null = null

    constructor(params: FlowParams) {
        this.stepLength = params.stepLength ?? flowDefaults.stepLength
        this.maxSteps = params.maxSteps ?? flowDefaults.maxSteps
        this.minSteps = params.minSteps ?? flowDefaults.minSteps
        this.lineWidthMax = params.lineWidthMax ?? flowDefaults.lineWidthMax
        this.lineWidthMin = params.lineWidthMin ?? flowDefaults.lineWidthMin
        this.scale = params.scale ?? flowDefaults.scale
        this.offset = params.offset ?? flowDefaults.offset
        this.minSpace = params.minSpace ?? flowDefaults.minSpace
        this.maxFailsMax = params.maxFailsMax ?? flowDefaults.maxFailsMax
        this.maxFailsMin = params.maxFailsMin ?? flowDefaults.maxFailsMin
        this.taperEase = params.taperEase ?? flowDefaults.taperEase
        this.taperLength = params.taperLength ?? flowDefaults.taperLength
        this.lineCap = params.lineCap ?? flowDefaults.lineCap
        this.decreaseStep = params.decreaseStep ?? flowDefaults.decreaseStep
        this.minInitialCurves = params.minInitialCurves ?? flowDefaults.minInitialCurves
        this.brightenMax = params.brightenMax ?? flowDefaults.brightenMax
        this.brightenMin = params.brightenMin ?? flowDefaults.brightenMin
        this._colorRepeats = params.colorRepeats ?? flowDefaults.colorRepeats
        this._colorsMethod = params.colorsMethod ?? flowDefaults.colorsMethod
        this.showColors = params.showColors ?? flowDefaults.showColors
        this._colorRandomDist = params.colorRandomDist ?? flowDefaults.colorRandomDist
        this._qtCapacity = params.qtCapacity ?? flowDefaults.qtCapacity
        this.liveInterval = params.liveInterval ?? flowDefaults.liveInterval
        this.vals = params.vals ?? randomFlowVals()

        this._palette = params.palette ?? { bg: '#121212', colors: ['#ffffff'] }

        this._bounds = new Bounds(
            this.margin,
            params.width - this.margin,
            this.margin,
            params.height - this.margin,
        )

        // this._scale = 1 / this._bounds.width
        // this._offset = this._scale * 50

        this.qt = new QuadTree(this._bounds, this._qtCapacity)
        this.setSize({ width: params.width, height: params.height })
    }

    // TODO fix issue with palette set when it has one extra color
    set palette(p: { colors: string[]; bg: string }) {
        if (this._palette.bg === p.bg && this._palette.colors.every((c) => p.colors.includes(c)))
            return
        this._palette = p
        this.updateColorSeeds()
    }

    get palette() {
        return this._palette
    }

    set colorsMethod(colorsMethod: 'clumps' | 'temp' | 'hue') {
        if (this._colorsMethod === colorsMethod) return
        this._colorsMethod = colorsMethod
        this.updateColorSeeds()
    }

    get colorsMethod() {
        return this._colorsMethod
    }

    set colorRepeats(repeats: number) {
        if (repeats === this._colorRepeats) return
        this._colorRepeats = repeats
        this.updateColorSeeds()
    }

    get colorRepeats() {
        return this._colorRepeats
    }

    set colorRandomDist(val: number) {
        if (val === this._colorRandomDist) return
        this._colorRandomDist = val
        this.updateCurveColors()
    }

    set qtCapacity(val: number) {
        if (val === this._qtCapacity) return
        this._qtCapacity = val
        this.qt = new QuadTree(this._bounds, this._qtCapacity)
    }

    setSize = (size: { width: number; height: number }) => {
        this._bounds.x2 = size.width > this.margin * 2 ? size.width - this.margin : size.width
        this._bounds.y2 = size.height > this.margin * 2 ? size.height - this.margin : size.height
        this.qt.clear()
        this.updateColorSeeds()
    }

    getTaper = (i: number, curveLen: number) => {
        let distFromEnd = i < curveLen / 2 ? i * this.stepLength : (curveLen - i) * this.stepLength
        if (distFromEnd > this.taperLength) return this.lineWidthMax
        let amt = Math.min(distFromEnd / this.taperLength, 1)
        amt = easing[this.taperEase](amt)
        return map(amt, 0, 1, this.lineWidthMin, this.lineWidthMax)
    }

    getPointColor(point: [number, number], baseColor: string) {
        if (this.brightenMin === 0 && this.brightenMax === 0) return baseColor
        const c = chroma(baseColor)
        const angle = this.getAngle(point[0], point[1])

        let amt = map(Math.sin(angle), -1, 1, this.brightenMin, this.brightenMax)
        return c.brighten(amt).css()
    }

    getCurveColor = (points: [number, number][]) => {
        const mid = Math.floor(points.length / 2)
        let [x, y] = points[mid]
        x += randomBiased(-this._colorRandomDist, this._colorRandomDist, 0, 1)
        y += randomBiased(-this._colorRandomDist, this._colorRandomDist, 0, 1)
        const nearest = this._colorSeeds.reduce((a, b) => {
            const dxa = x - a.x
            const dxb = x - b.x
            const dya = y - a.y
            const dyb = y - b.y
            return dxa * dxa + dya * dya < dxb * dxb + dyb * dyb ? a : b
        })

        return nearest.color
    }

    updateColorSeeds() {
        let colors: string[] = []
        for (let i = 0; i < this._colorRepeats; i++) {
            colors.push(...this._palette.colors)
        }

        if (this._colorsMethod === 'clumps') {
            let radiusMult = 0.14
            let circles = circlePack(
                this._bounds,
                this._bounds.width * radiusMult,
                25,
                [],
                colors.length,
            )
            while (circles.length < colors.length && radiusMult > 0.02) {
                radiusMult -= 0.02
                circles = circlePack(
                    this._bounds,
                    this._bounds.width * radiusMult,
                    25,
                    circles,
                    colors.length,
                )
            }
            let seedPoints = circles.map((c) => [c.x, c.y])
            this._colorSeeds = colors.map((c, i) => {
                let point = seedPoints[i] || [
                    random(this._bounds.x1, this._bounds.x2),
                    random(this._bounds.y1, this._bounds.y2),
                ]
                return {
                    color: c,
                    x: point[0],
                    y: point[1],
                }
            })
        } else {
            let chromas = colors.map((c) => chroma(c))
            if (this._colorsMethod === 'temp') {
                chromas.sort((a, b) => a.temperature() - b.temperature())
            } else if (this._colorsMethod === 'hue') {
                chromas.sort((a, b) => a.get('hsl.h') - b.get('hsl.h'))
            }

            let scale = chroma.scale(chromas)
            colors = scale.colors(chromas.length)

            let xStep = this._bounds.width / colors.length
            this._colorSeeds = colors.map((c, i) => {
                return {
                    color: c,
                    x: i * xStep + xStep / 2 + this._bounds.x1,
                    y: random(this._bounds.y1, this._bounds.y2),
                }
            })
        }

        this.updateCurveColors()
    }

    updateCurveColors() {
        this.curves.forEach((c) => {
            c.color = this.getCurveColor(c.points)
        })
    }

    pointIsValid = (x: number, y: number, tempQt?: QuadTree) => {
        if (!this._bounds.contains(x, y)) return false

        if (tempQt && tempQt.paddedConflicts([x, y], this.stepLength * 0.7)) return false
        if (this.qt.paddedConflicts([x, y], this.minSpace)) return false
        return true
    }

    getAngle = (x: number, y: number) => {
        const xv = x * this.scale + this.offset
        const yv = y * this.scale + this.offset
        const fx = Math.sin(xv * this.vals[0] + Math.cos(yv * this.vals[1]))
        const fy = -Math.cos(yv * this.vals[2] - Math.sin(xv * this.vals[3]))
        const a = Math.atan2(fy, fx)
        return a
    }

    getNextPoint = ([x, y]: [number, number], reverse = false) => {
        let angle = this.getAngle(x, y)
        if (reverse) angle += Math.PI
        const xStep = this.stepLength * Math.cos(angle)
        const yStep = this.stepLength * Math.sin(angle)
        return [x + xStep, y + yStep] as [number, number]
    }

    drawCurve = (curve: Curve, ctx: DrawCtx) => {
        const { color, points } = curve

        ctx.lineCap = this.lineCap

        if (this.lineWidthMin === this.lineWidthMax) {
            ctx.strokeStyle = color
            ctx.beginPath()
            ctx.lineWidth = this.lineWidthMax
            ctx.moveTo(points[0][0], points[0][1])
            for (let i = 1; i < points.length; i++) {
                let cur = points[i]
                ctx.lineTo(cur[0], cur[1])
            }
            ctx.stroke()
        } else {
            for (let i = 1; i < points.length; i++) {
                let prev = points[i - 1]
                let cur = points[i]
                let taper = this.getTaper(i, points.length)
                let pointColor = this.getPointColor(points[i], color)
                ctx.strokeStyle = pointColor
                ctx.lineWidth = taper
                ctx.beginPath()
                ctx.moveTo(prev[0], prev[1])
                ctx.lineTo(cur[0], cur[1])
                ctx.stroke()
            }
        }
    }

    getPointFromCurve = (points: [number, number][]): [number, number] => {
        let index = Math.floor(random(1, points.length))
        index = random() > 0.5 ? points.length - 1 : 1

        let p = points[index]
        let prev = points[index - 1]
        let dx = p[0] - prev[0]
        let dy = p[1] - prev[1]
        let turned = random() < 0.5 ? Math.atan2(-dx, dy) : Math.atan2(dx, -dy) // rotated 90 deg
        const dist = random(this.minSpace, this.minSpace * 3)
        return [p[0] + Math.cos(turned) * dist, p[1] + Math.sin(turned) * dist]
    }

    getRandomPoint = (margin = 0.15): [number, number] => {
        let { width, height } = this._bounds
        return [
            random(width * margin, width * (1 - margin)),
            random(height * margin, height * (1 - margin)),
        ]
    }

    addCurve = (points: [number, number][]) => {
        const color = this.getCurveColor(points)
        const curve = { points, color }
        this.curves.push(curve)
        points.forEach((p) => this.qt.insert(p))
        return curve
    }

    getInitialCurves = async (
        minLength: number,
        idealCount: number,
        maxFails: number,
        ctx: DrawCtx,
        live = false,
        drawFn = this.drawWithTimeout,
    ) => {
        let fails = 0
        let created = 0
        let initPoints: [number, number][] = circlePack(
            this._bounds,
            this._bounds.width * 0.02,
            maxFails,
        ).map((c) => [c.x, c.y])
        let point: [number, number]
        while (initPoints.length > 0 && created < idealCount && fails < maxFails) {
            point = initPoints.pop()!
            let points = this.attemptCurve(point, minLength)
            if (points.length >= minLength) {
                this.addCurve(points)
                if (live) await drawFn(ctx)
                created++
                fails = 0
            } else {
                fails++
            }
        }

        return created
    }

    generate = async (
        liveDraw = true,
        ctx: DrawCtx,
        onDraw?: (ctx: DrawCtx) => Promise<void>,
    ) => {
        const drawFn = onDraw ?? this.drawWithTimeout

        let start = performance.now()

        this.curves = []
        this.qt.clear()

        if (liveDraw) await drawFn(ctx)

        let maxFails = this.maxFailsMin
        let fails = 0
        let idealLen = this.maxSteps

        let initialCurves = 0
        let minInitial = this.minInitialCurves
        while (initialCurves < minInitial && idealLen >= this.minSteps) {
            initialCurves += await this.getInitialCurves(
                idealLen,
                minInitial * 2,
                maxFails,
                ctx,
                liveDraw,
                drawFn,
            )
            console.log(`have ${initialCurves} initial curves (idealLen ${idealLen})`)
            if (initialCurves < minInitial) idealLen -= this.decreaseStep
        }

        const neighborCurves: Curve[] = [...this.curves]
        let decreases = 0
        let point =
            this.curves.length > 0 ?
                this.getPointFromCurve(neighborCurves.pop()!.points)
            :   this.getRandomPoint(0)
        let randomCount = 0
        let nextPointGen: 'random' | 'neighbor' = 'neighbor'

        while (fails < maxFails && idealLen >= this.minSteps) {
            let points = this.attemptCurve(point, idealLen)
            if (points.length >= idealLen) {
                const addedCurve = this.addCurve(points)
                neighborCurves.push(addedCurve)

                fails = 0
                if (liveDraw) await drawFn(ctx)

                if (nextPointGen === 'random') {
                    randomCount++
                    nextPointGen = 'neighbor'
                }
            } else {
                fails++
            }

            if (fails >= maxFails) {
                if (nextPointGen === 'neighbor') {
                    nextPointGen = 'random'
                } else {
                    idealLen -= this.decreaseStep
                    decreases++
                    // maxFails = this.maxFails + this.maxFails * this.maxFailsIncrease * decreases
                    maxFails = map(
                        idealLen,
                        this.minSteps,
                        this.maxSteps,
                        this.maxFailsMax,
                        this.maxFailsMin,
                    )

                    console.log(`maxFails: ${maxFails} / idealLen: ${idealLen}`)
                    nextPointGen = 'neighbor'
                }

                fails = 0
            }

            // if (performance.now() - start > 30000) {
            //     console.log('breaking generation loop because more than 30s has passed')
            //     break
            // }

            if (neighborCurves.length === 0) {
                neighborCurves.push(...this.curves)
            }
            point =
                nextPointGen === 'neighbor' && neighborCurves.length > 0 ?
                    this.getPointFromCurve(neighborCurves.pop()!.points)
                :   this.getRandomPoint(0)
        }

        console.log(`random count: ${randomCount}; total: ${this.curves.length}`)
        if (liveDraw) this.draw(ctx)
    }

    attemptCurve = (start: [number, number], idealLen = Infinity) => {
        let point = start
        let points: [number, number][] = []
        let reversePoints: [number, number][] = []
        let done = false
        let reversed = false
        if (!this.pointIsValid(point[0], point[1])) return []

        const closeOffset = Math.ceil(this.minSpace / this.stepLength)
        const selfConflict = (point: [number, number]) => {
            let toCheck = reversed ? reversePoints : points
            for (let i = 0; i < toCheck.length; i++) {
                if (i > toCheck.length - closeOffset - 1) {
                    if (dist(point, toCheck[i]) < this.stepLength * 0.9) return true
                } else {
                    if (dist(point, toCheck[i]) < this.minSpace) return true
                }
            }
            return false
        }

        while (points.length + reversePoints.length < idealLen && !done) {
            point = this.getNextPoint(point, reversed)

            if (this.pointIsValid(point[0], point[1]) && !selfConflict(point)) {
                reversed ? reversePoints.push(point) : points.push(point)
            } else {
                if (!reversed) {
                    reversed = true
                    point = start
                } else {
                    done = true
                }
            }
        }
        return [...reversePoints.reverse(), ...points]
    }

    drawWithTimeout = (ctx: DrawCtx) => {
        const now = performance.now()
        const elapsed = this.lastFrame ? now - this.lastFrame : 0
        const wait = Math.max(this.liveInterval - elapsed, 0)

        return new Promise<void>((resolve) => {
            this.draw(ctx)
            setTimeout(() => {
                this.lastFrame = performance.now()
                resolve()
            }, wait)
        })
    }

    draw = (ctx: DrawCtx) => {
        ctx.fillStyle = this.palette.bg
        ctx.fillRect(
            0,
            0,
            this._bounds.width + this.margin * 2,
            this._bounds.height + this.margin * 2,
        )
        this.curves.forEach((c) => this.drawCurve(c, ctx))
        if (this.showColors) {
            this._colorSeeds.forEach(({ color, x, y }) => {
                ctx.fillStyle = chroma(color).alpha(0.5).css()
                ctx.beginPath()
                ctx.arc(x, y, 25, 0, Math.PI * 2)
                ctx.fill()
            })
        }
    }
}
