import { type Vec2Like, random } from 'utils'

export interface PetalOpts {
    // start?: Vec2Like
    // end?: Vec2Like
    cp1?: Vec2Like
    cp2?: Vec2Like
    cpAmp?: Vec2Like
    cp1Freq?: Vec2Like
    cp2Freq?: Vec2Like
    lineSpace?: number
    maxLines?: number
    length?: number
    shiftEnd?: number
}

export const petalDefaults: Required<PetalOpts> = {
    length: 300,
    shiftEnd: 0,
    cp1: { x: 0.15, y: 0.3 },
    cp2: { x: -0.15, y: 0.8 },
    cp1Freq: { x: 2, y: 3 },
    cp2Freq: { x: 5, y: 4 },
    cpAmp: { x: 0.26, y: 0.15 },
    lineSpace: 1,
    maxLines: 3000,
}

export class Petal {
    cp1: Vec2Like
    cp2: Vec2Like
    length: number
    shiftEnd: number
    cp1Freq: Vec2Like
    cp2Freq: Vec2Like
    cpAmp: Vec2Like
    lineSpace: number
    maxLines: number

    #count = 0

    constructor(opts: PetalOpts = {}) {
        const { cp1, cp2, cp1Freq, cp2Freq, cpAmp, lineSpace, maxLines, length, shiftEnd } = {
            ...petalDefaults,
            ...opts,
        }

        this.cp1Freq = cp1Freq
        this.cp2Freq = cp2Freq
        this.cpAmp = cpAmp
        this.lineSpace = lineSpace
        this.maxLines = maxLines
        this.length = length
        this.shiftEnd = shiftEnd
        // this.end = end
        this.cp1 = cp1
        this.cp2 = cp2
    }

    get count() {
        return this.#count
    }

    get done() {
        return this.#count >= this.maxLines
    }

    drawLine = (ctx: CanvasRenderingContext2D) => {
        if (this.done) return
        let t = this.#count * 0.01 * this.lineSpace

        let cp1 = {
            x: this.cp1.x * this.length + this.cpAmp.x * this.length * Math.cos(t * this.cp1Freq.x),
            y: this.cp1.y * this.length + this.cpAmp.y * this.length * Math.sin(t * this.cp1Freq.y),
        }

        let cp2 = {
            x: this.cp2.x * this.length + this.cpAmp.x * this.length * Math.cos(t * this.cp2Freq.x),
            y: this.cp2.y * this.length + this.cpAmp.y * this.length * Math.sin(t * this.cp2Freq.y),
        }

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, this.length * this.shiftEnd, this.length)
        ctx.stroke()

        this.#count++

        return { cp1, cp2 }
    }

    restart = () => {
        this.#count = 0
    }
}

interface RandomizedAlwaysPetalOpts {
    cpXMin?: number
    cpXMax?: number
    cpYMin?: number
    cpYMax?: number
    lengthMin?: number
    lengthMax?: number
    shiftEndMin?: number
    shiftEndMax?: number
}

interface Vec2RandomOpts {
    xMin: number
    xMax: number
    yMin: number
    yMax: number
}
export interface RandomPetalOpts extends RandomizedAlwaysPetalOpts {
    amp?: Vec2RandomOpts
}

export const randomPetalDefaults: Required<RandomizedAlwaysPetalOpts> = {
    cpXMin: 0.15,
    cpXMax: 0.35,
    cpYMin: 0.1,
    cpYMax: 0.4,
    lengthMin: 300,
    lengthMax: 350,
    shiftEndMin: -0.3,
    shiftEndMax: 0.3,
}

function vec2Random({ xMin, xMax, yMin, yMax }: Vec2RandomOpts) {
    return {
        x: random(xMin, xMax),
        y: random(yMin, yMax),
    }
}

export const randomizePetal = (
    randomOpts: RandomPetalOpts = {},
    petalOpts: PetalOpts = {},
    petal?: Petal,
) => {
    const { cpXMin, cpXMax, cpYMin, cpYMax, shiftEndMin, shiftEndMax, lengthMin, lengthMax, amp } =
        {
            ...randomPetalDefaults,
            ...randomOpts,
        }
    let cpxl = random(-cpXMin, -cpXMax)
    let cpxr = random(cpXMin, cpXMax)
    let cpyt = random(cpYMin, cpYMax)
    let cpyb = random(1 - cpYMin, 1 - cpYMax)

    let cp1 = { x: cpxl, y: cpyt }
    let cp2 = { x: cpxr, y: cpyb }
    if (random() < 0.5) {
        ;[cp1.x, cp2.x] = [cp2.x, cp1.x]
    }

    if (!petal) {
        petal = new Petal({
            cp1,
            cp2,
            length: random(lengthMin, lengthMax),
            shiftEnd: random(shiftEndMin, shiftEndMax),
            ...petalOpts,
        })
    } else {
        petal.cp1 = cp1
        petal.cp2 = cp2
        petal.length = random(lengthMin, lengthMax)
        petal.shiftEnd = random(shiftEndMin, shiftEndMax)
        if (petalOpts) {
            Object.entries(petalOpts).forEach(
                ([key, val]) => (petal![key as keyof PetalOpts] = val),
            )
        }
    }

    if (amp) {
        petal.cpAmp = vec2Random(amp)
    }

    return petal
}
