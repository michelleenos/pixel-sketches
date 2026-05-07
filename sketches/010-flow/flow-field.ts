import p5 from 'p5'
import { lerp } from 'utils'

interface FlowFieldParams {
    res?: number
    noiseScale?: number
    noiseFreq?: number
}

export class FlowField {
    res: number
    noiseScale: number
    noiseFreq: number
    field: number[][] | null = null
    _width: number
    _height: number
    _cellWidth: number
    _cellHeight: number

    constructor({
        res = 30,
        noiseScale = 2,
        noiseFreq = 0.05,
        width,
        height,
    }: FlowFieldParams & { width: number; height: number }) {
        this.res = res
        this.noiseScale = noiseScale
        this.noiseFreq = noiseFreq
        this._width = width
        this._height = height
        this._cellWidth = this._width / res
        this._cellHeight = this._height / res
    }

    get width() {
        return this._width
    }

    set width(w: number) {
        this._width = w
        this._cellWidth = this._width / this.res
    }

    get height() {
        return this._height
    }

    set height(h: number) {
        this._height = h
        this._cellHeight = this._height / this.res
    }

    generate(p: p5) {
        this.field = []
        for (let xi = 0; xi < this.res; xi++) {
            const row: number[] = []
            for (let yi = 0; yi < this.res; yi++) {
                let n = p.noise(xi * this.noiseFreq, yi * this.noiseFreq)
                n *= this.noiseScale * Math.PI * 2

                const v = p.createVector(Math.cos(n), Math.sin(n))
                row.push(v.heading())
            }
            this.field.push(row)
        }
    }

    getValue(x: number, y: number) {
        if (!this.field) throw new Error('call flowField.generate()')
        const gridX = x / this._cellWidth
        const gridY = y / this._cellHeight

        let x0 = Math.floor(gridX)
        let x1 = Math.min(x0 + 1, this.res - 1)
        let y0 = Math.floor(gridY)
        let y1 = Math.min(y0 + 1, this.res - 1)

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
}
