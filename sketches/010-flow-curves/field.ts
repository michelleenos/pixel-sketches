import { lerp, Bounds, map } from 'utils'
import type { FlowFn } from './flow.types'

type BoundsArr = [x1: number, y1: number, x2: number, y2: number]

interface FlowFieldParams {
    gridSize: number
    bounds: Bounds | BoundsArr
    fn: FlowFn
}

export class FlowField {
    field: number[][] = []
    _gridSize!: number
    _numCols!: number
    _numRows!: number
    _bounds: Bounds
    fn: FlowFn

    constructor({ gridSize, bounds, fn }: FlowFieldParams) {
        this._bounds = bounds instanceof Bounds ? bounds : new Bounds(...bounds)
        this.fn = fn
        this.gridSize = gridSize
    }

    get gridSize() {
        return this._gridSize
    }

    set gridSize(n: number) {
        this._gridSize = n
        this.updateSizes()
    }

    set bounds(bounds: Bounds | BoundsArr) {
        this._bounds = bounds instanceof Bounds ? bounds : new Bounds(...bounds)
        this.updateSizes()
    }

    updateSizes() {
        this._numCols = Math.ceil(this._bounds.width / this._gridSize + 1)
        this._numRows = Math.ceil(this._bounds.height / this._gridSize + 1)
    }

    generate = () => {
        this.field = []

        for (let x = 0; x < this._numCols; x++) {
            const col: number[] = []
            for (let y = 0; y < this._numRows; y++) {
                col.push(this.fn(x, y))
            }
            this.field.push(col)
        }
    }

    getValue = (x: number, y: number) => {
        let xOffset = x - this._bounds.x1
        let yOffset = y - this._bounds.y1

        let gridX = xOffset / this._gridSize
        let gridY = yOffset / this._gridSize

        let x0 = Math.floor(gridX)
        let x1 = Math.min(x0 + 1, this.field.length - 1)
        let y0 = Math.floor(gridY)
        let y1 = Math.min(y0 + 1, this.field[0].length - 1)
        let dx = gridX - x0
        let dy = gridY - y0

        let tl = this.field[x0][y0]
        let tr = this.field[x1][y0]
        let bl = this.field[x0][y1]
        let br = this.field[x1][y1]

        let top = lerp(tl, tr, dx)
        let bottom = lerp(bl, br, dx)
        let mid = lerp(top, bottom, dy)

        return mid
    }

    draw = (
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
        color = '#10101088',
    ) => {
        this.field.forEach((col, colIndex) => {
            col.forEach((angle, rowIndex) => {
                let x = this._bounds.x1 + colIndex * this._gridSize
                let y = this._bounds.y1 + rowIndex * this._gridSize

                ctx.strokeStyle = color
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.moveTo(x, y)
                ctx.lineTo(x + Math.cos(angle) * 15, y + Math.sin(angle) * 15)
                ctx.stroke()

                ctx.fillStyle = color
                ctx.beginPath()
                ctx.arc(x, y, 3, 0, Math.PI * 2)
                ctx.fill()
            })
        })
    }
}
