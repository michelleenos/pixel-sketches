import { createNoise2D, type NoiseFunction2D } from 'simplex-noise'
import {
    Bounds,
    Circle,
    clamp,
    easing,
    map,
    random,
    randomBiased,
    shuffle,
    type Easing,
} from 'utils'
import { Curves } from './curve'
import { FlowField } from './field'
import type { FlowDrawStrategy, FlowParams } from './flow.types'
import chroma from 'chroma-js'

function circlePack(radius: number, bounds: Bounds, maxAttempts = 100, existing?: Circle[]) {
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

    return circles
}

export class Flow {
    _palette: { bg: string; colors: string[] } = { bg: '#121212', colors: ['#ffffff'] }
    _colorScale: chroma.Scale
    drawSize: { width: number; height: number }
    fieldSize: { width: number; height: number }
    _drawBounds: Bounds
    _fieldBounds: Bounds
    field: FlowField
    drawStrategy: FlowDrawStrategy = { type: 'grid', spacing: 60 }
    noise: NoiseFunction2D
    noiseMult = 0.1
    stepLength: number = 4
    maxSteps = 50
    minSteps = 10
    shouldDrawField = false
    colorCycles = 6
    lineWidthMax = 7
    lineWidthMin = 0.5
    minSpace = 3
    taperEase: Easing = 'outCirc'
    taperLength = 200
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

    constructor(
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
        params: FlowParams,
    ) {
        this.ctx = ctx
        this.drawSize = { width: params.width, height: params.height }

        if (params.stepLength !== undefined) this.stepLength = params.stepLength
        if (params.maxSteps !== undefined) this.maxSteps = params.maxSteps
        if (params.colorCycles !== undefined) this.colorCycles = params.colorCycles
        if (params.lineWidthMax !== undefined) this.lineWidthMax = params.lineWidthMax
        if (params.lineWidthMin !== undefined) this.lineWidthMin = params.lineWidthMin
        if (params.taperEase !== undefined) this.taperEase = params.taperEase
        if (params.palette) this._palette = params.palette
        if (params.drawStrategy) this.drawStrategy = params.drawStrategy
        if (params.minSteps) this.minSteps = params.minSteps
        if (params.minSpace) this.minSpace = params.minSpace
        if (params.taperLength) this.taperLength = params.taperLength
        this.fieldSize = { width: params.width * 1.5, height: params.height * 1.5 }

        let diffX = this.fieldSize.width - this.drawSize.width
        let diffY = this.fieldSize.height - this.drawSize.height
        this._drawBounds = new Bounds(0, 0, this.drawSize.width, this.drawSize.height)
        this._fieldBounds = new Bounds(
            -diffX / 2,
            this.drawSize.width + diffX / 2,
            -diffY / 2,
            this.drawSize.height + diffY / 2,
        )

        this.field = new FlowField({
            gridSize: params.gridSize || 20,
            bounds: this._fieldBounds,
            fn: this.getAngle,
        })

        this.noise = createNoise2D()

        this._colorScale = chroma.scale(this.palette.colors).mode('hsl')
    }

    set gridSize(n: number) {
        this.field.gridSize = n
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

    getTaper = (i: number, curveLen: number) => {
        let distFromEnd = i < curveLen / 2 ? i * this.stepLength : (curveLen - i) * this.stepLength
        if (distFromEnd > this.taperLength) return this.lineWidthMax
        let amt = Math.min(distFromEnd / this.taperLength, 1)
        amt = easing[this.taperEase](amt)
        return map(amt, 0, 1, this.lineWidthMin, this.lineWidthMax)
    }

    getColor = (x: number, y: number) => {
        // let pos = randomBiased(0, 1)
        let pos = clamp(map(x, this._fieldBounds.x1, this._fieldBounds.x2, 0, 1), 0, 1)

        let scaleVal = randomBiased(0, 1, pos, 1)

        return this._colorScale(scaleVal)
    }

    getAngle = (x: number, y: number) => {
        let n = this.noise(x * this.noiseMult, y * this.noiseMult)
        n = map(n, -1, 1, -Math.PI, Math.PI)
        return n
    }

    getNextPoint = ([x, y]: [number, number]) => {
        let angle = this.field.getValue(x, y)
        let xStep = this.stepLength * Math.cos(angle)
        let yStep = this.stepLength * Math.sin(angle)
        return [x + xStep, y + yStep] as [number, number]
    }

    drawGeneratedCurve = (points: [number, number][]) => {
        const { ctx } = this

        ctx.strokeStyle = this.getColor(points[0][0], points[0][1]).css()
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

            // const blur = Math.min(taper * 0.5, 1.5)
            // for (let j = 0; j < 1; j++) {
            //     ctx.beginPath()
            //     ctx.moveTo(prev[0] + random(-blur, blur), prev[1] + random(-blur, blur))
            //     ctx.lineTo(cur[0] + random(-blur, blur), cur[1] + random(-blur, blur))
            //     ctx.stroke()
            // }
        }
    }

    generateCurves = () => {
        let curves = new Curves(this._fieldBounds, this.getNextPoint)
        curves.minSpace = this.minSpace

        const strategy = this.drawStrategy
        let startPoints: [number, number][] = []

        if (strategy.type === 'grid') {
            let { spacing } = strategy
            let gridCountX = Math.ceil(this.fieldSize.width / spacing)
            let gridCountY = Math.ceil(this.fieldSize.height / spacing)

            for (let xi = 0; xi < gridCountX; xi++) {
                for (let yi = 0; yi < gridCountY; yi++) {
                    startPoints.push([
                        this._fieldBounds.x1 + xi * spacing,
                        this._fieldBounds.y1 + yi * spacing,
                    ])
                }
            }
            shuffle(startPoints)
        } else if (strategy.type === 'circlePack') {
            let cs = circlePack(strategy.radius, this._fieldBounds, strategy.maxAttempts)
            cs.forEach(({ x, y }) => startPoints.push([x, y]))
        } else {
            let count = strategy.count
            for (let i = 0; i < count; i++) {
                let x = random(this._fieldBounds.x1, this._fieldBounds.x2)
                let y = random(this._fieldBounds.y1, this._fieldBounds.y2)
                startPoints.push([x, y])
            }
        }

        startPoints.forEach((point) => {
            curves.attemptGenerate(point, this.minSteps, this.maxSteps)
        })

        return curves
    }

    generateAndDraw = () => {
        const { ctx } = this
        const colors = this._palette.colors
            .map((c) => chroma(c))
            .sort((a, b) => a.temperature() - b.temperature())

        ctx.fillStyle = this.palette.bg
        ctx.fillRect(0, 0, this.drawSize.width, this.drawSize.height)

        this.field.generate()
        if (this.shouldDrawField) this.field.draw(ctx)

        let curves = this.generateCurves()
        curves.curves.forEach((curve) => {
            this.drawGeneratedCurve(curve.points)
        })
    }

    reseed = () => {
        this.noise = createNoise2D()
    }
}
