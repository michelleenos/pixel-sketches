import { Cnvs, createElement } from 'utils'

export class SegmentTest {
    data: [number, number][] = []
    shouldDraw = false
    input: HTMLInputElement
    onChange?: () => void

    constructor(data: [number, number][], onChange?: () => void) {
        this.data = data
        this.input = createElement('input', { type: 'checkbox' })
        this.input.addEventListener('change', this.onDrawChange)
        this.onChange = onChange
    }

    onDrawChange = () => {
        this.shouldDraw = this.input.checked
        this.onChange?.()
    }

    stringify = () => {
        return this.data.map(([x, y]) => `[${x}, ${y}]`).join('\n')
    }

    makeRow = () => {
        const tr = createElement('tr', {}, [
            createElement('td', {}, this.stringify()),
            createElement('td', {}, this.input),
        ])
        return tr
    }
}

export class SegmentsTestStuff {
    segments: SegmentTest[]
    table: HTMLTableElement
    onChange?: () => void
    blockSize: number
    innerGrid: number
    domContainer: HTMLElement
    cnvs: Cnvs

    constructor(segments: [number, number][][], cnvs: Cnvs, blockSize = 800, innerGrid = 3) {
        this.cnvs = cnvs
        this.blockSize = blockSize
        this.innerGrid = innerGrid

        this.segments = segments.map(
            (s) =>
                new SegmentTest(s, () => {
                    testDraw(this)
                }),
        )
        const { container, table } = this.createDom()
        this.table = table
        this.domContainer = container

        this.segments.forEach((s) => {
            this.table.appendChild(s.makeRow())
        })
    }

    createDom = () => {
        const container = document.createElement('div')
        const pre = document.createElement('pre')
        const table = createElement('table')
        container.appendChild(pre)
        pre.appendChild(table)

        container.style =
            'position: fixed;bottom:0;left:0;width: 300px; height: auto; max-height: 400px; overflow: auto; background: rgba(255,255,255,0.9);color:#000; font-family: monospace'

        document.body.appendChild(container)
        return { container, table }
    }
}

export function drawGrid(testStuff: SegmentsTestStuff) {
    const { cnvs, innerGrid, blockSize } = testStuff
    const { ctx } = cnvs

    let stepX = blockSize / innerGrid
    let stepY = blockSize / innerGrid

    for (let xi = 0; xi < innerGrid + 1; xi++) {
        for (let yi = 0; yi < innerGrid + 1; yi++) {
            let x = stepX * xi
            let y = stepY * yi

            ctx.fillStyle = '#ffffff'
            ctx.beginPath()
            ctx.arc(x, y, 5, 0, Math.PI * 2)
            ctx.fill()
        }
    }
}

export function testDraw(testStuff: SegmentsTestStuff) {
    const { cnvs, blockSize, innerGrid } = testStuff
    const { ctx, width, height } = cnvs

    ctx.fillStyle = '#121212'
    ctx.fillRect(0, 0, width, height)

    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#ffffff'

    ctx.save()
    ctx.translate((width - blockSize) / 2, (height - blockSize) / 2)
    drawGrid(testStuff)

    let step = blockSize / innerGrid

    testStuff.segments.forEach(({ data, shouldDraw }) => {
        if (!shouldDraw) return
        let start = data[0]
        ctx.beginPath()
        ctx.moveTo(start[0] * step, start[1] * step)

        for (let i = 1; i < data.length; i++) {
            let [x, y] = data[i]
            ctx.lineTo(x * step, y * step)
        }
        ctx.stroke()
    })

    ctx.restore()
}
