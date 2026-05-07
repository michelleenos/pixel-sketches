import { Cnvs, random, saveCanvas } from 'utils'
import { GuiExtra } from '../../packages/lilgui-extra'
import { SegmentsTestStuff } from './edges-visual-test'

// *************** Utils *************** //
type SymmetryType = 'reflect' | 'rotate' | 'horizontal' | 'vertical'
type NodesList = [number, number][]
type EdgesList = { [key: string]: NodesList }

const directions = [
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, 0],
]

// *************** Setup *************** //

const cnvs = new Cnvs({ autoResize: false })
const sizes = { width: cnvs.width, height: cnvs.height }

function resize(width: number, height: number) {
    sizes.width = width
    sizes.height = height
    cnvs.setSize(width, height)
}

const P = {
    blockPadding: 80,
    blockSize: 200,
    useWindowSize: true,
    maxWidthRatio: 0.9,
    maxHeightRatio: 0.85,

    maxEdges: 20,
    maxFails: 50,
    maxSegmentLen: 10,
    innerGrid: 5,
    symmetry: 'reflect' as SymmetryType,

    lineWidth: 3,
}

window.addEventListener('resize', () => {
    if (P.useWindowSize) {
        resize(window.innerWidth, window.innerHeight)
        draw()
    }
})

// *************** Generate Nodes & Edges *************** //

interface BlockParams {
    gridX: number
    gridY: number
    maxFails: number
    maxEdges: number
    maxSegmentLen: number
}

function buildBlock({ gridX, gridY, maxFails, maxEdges, maxSegmentLen }: BlockParams) {
    const getEdges = (x: number, y: number) => {
        let key = `${x}-${y}`
        if (!edges[key]) edges[key] = []
        return edges[key]
    }

    const getAvailableDirections = (x: number, y: number, pointsVisited: NodesList) => {
        return [...directions].filter(([dx, dy]) => {
            if (x + dx < 0 || x + dx >= gridX) return false
            if (y + dy < 0 || y + dy >= gridY) return false
            if (pointsVisited.find(([vx, vy]) => vx === x + dx && vy === y + dy)) return false
            return true
        })
    }

    const getNewPoint = () => {
        let x = Math.floor(Math.random() * (gridX + 1))
        let y = Math.floor(Math.random() * (gridY + 1))
        return [x, y]
    }

    let segments: NodesList[] = []
    let edges: EdgesList = {}

    let [x, y] = getNewPoint()

    let fails = 0
    let edgesCount = 0
    let shouldPushCurrentNode = false
    let currentSegment: NodesList = [[x, y]]

    while (fails < maxFails && edgesCount < maxEdges) {
        let visited = getEdges(x, y)
        let options = getAvailableDirections(x, y, visited)

        if (options.length === 0) {
            ;[x, y] = getNewPoint()
            fails++
            if (currentSegment.length > 1) segments.push(currentSegment)
            currentSegment = []
            shouldPushCurrentNode = true
            continue
        }

        if (shouldPushCurrentNode) {
            currentSegment.push([x, y])
            shouldPushCurrentNode = false
        }
        let prevX = x
        let prevY = y

        let dir = random(options)
        x += dir[0]
        y += dir[1]
        visited.push([x, y])
        getEdges(x, y).push([prevX, prevY])
        currentSegment.push([x, y])
        edgesCount++

        if (currentSegment.length >= maxSegmentLen) {
            ;[x, y] = getNewPoint()

            shouldPushCurrentNode = true
            segments.push(currentSegment)
            currentSegment = []
        }
    }

    if (currentSegment.length > 1) segments.push(currentSegment)
    return { segments, edges }
}

// ***************  Draw Helpers *************** //

export function drawSegments(segments: NodesList[], size: number) {
    segments.forEach((segment) => drawSegment(segment, size))
}

export function drawSegment(segment: NodesList, size: number) {
    const { ctx } = cnvs
    let step = size / P.innerGrid

    let start = segment[0]

    ctx.beginPath()
    ctx.moveTo(start[0] * step, start[1] * step)

    for (let i = 1; i < segment.length; i++) {
        let [x, y] = segment[i]
        ctx.lineTo(x * step, y * step)
    }
    ctx.stroke()
}

// *************** Reflect Block *************** //

function reflectBlock(segments: NodesList[], size: number) {
    const { ctx } = cnvs
    const step = size / 2

    ctx.save()
    if (P.symmetry === 'reflect') {
        ctx.translate(step, step)
        ctx.scale(1, -1)
        drawSegments(segments, step)
        ctx.scale(1, -1)
        drawSegments(segments, step)
        ctx.scale(-1, 1)
        drawSegments(segments, step)
        ctx.scale(1, -1)
        drawSegments(segments, step)
    } else if (P.symmetry === 'rotate') {
        ctx.translate(step, step)
        drawSegments(segments, step)
        ctx.rotate(Math.PI / 2)
        drawSegments(segments, step)
        ctx.rotate(Math.PI / 2)
        drawSegments(segments, step)
        ctx.rotate(Math.PI / 2)
        drawSegments(segments, step)
    } else if (P.symmetry === 'horizontal') {
        ctx.translate(0, step)
        drawSegments(segments, step)
        ctx.scale(1, -1)
        drawSegments(segments, step)
    } else if (P.symmetry === 'vertical') {
        ctx.translate(step, 0)
        drawSegments(segments, step)
        ctx.scale(-1, 1)
        drawSegments(segments, step)
    }

    ctx.restore()
}

// *************** Main Draw Fn *************** //

function draw() {
    const { ctx, width, height } = cnvs

    ctx.fillStyle = '#121212'
    ctx.fillRect(0, 0, width, height)

    let mw = width * P.maxWidthRatio
    let mh = height * P.maxHeightRatio
    const blocksX = Math.floor(mw / P.blockSize)
    const blocksY = Math.floor(mh / P.blockSize)
    mw = P.blockSize * blocksX
    mh = P.blockSize * blocksY

    ctx.lineWidth = P.lineWidth
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#ffffff'

    ctx.save()
    ctx.translate((width - mw) / 2, (height - mh) / 2)

    for (let x = 0; x < blocksX; x++) {
        for (let y = 0; y < blocksY; y++) {
            ctx.save()
            ctx.translate(
                x * P.blockSize + P.blockPadding / 2,
                y * P.blockSize + P.blockPadding / 2,
            )
            const { segments } = buildBlock({
                gridX: P.symmetry === 'horizontal' ? P.innerGrid * 2 : P.innerGrid,
                gridY: P.symmetry === 'vertical' ? P.innerGrid * 2 : P.innerGrid,
                maxFails: P.maxFails,
                maxEdges: P.maxEdges,
                maxSegmentLen: P.maxSegmentLen,
            })
            // drawSegments(segments, P.blockSize - P.blockPadding)
            reflectBlock(segments, P.blockSize - P.blockPadding)

            ctx.restore()
        }
    }

    ctx.restore()
}

draw()

// *************** GUI *************** //
const gui = new GuiExtra()
const fl = gui.addFolder('layout').onChange(draw)
fl.add(P, 'blockPadding', 0, 400, 1)
fl.add(P, 'blockSize', 10, 1000, 1)
fl.add(P, 'maxWidthRatio', 0, 1, 0.01)
fl.add(P, 'maxHeightRatio', 0, 1, 0.01)
fl.add(P, 'useWindowSize').onChange((val: boolean) => {
    if (val) {
        resize(window.innerWidth, window.innerHeight)
        sf.hide()
        draw()
    } else {
        sf.show()
    }
})

const sf = fl
    .addFolder('size')
    .hide()
    .onChange(() => {
        resize(sizes.width, sizes.height)
        draw()
    })
sf.add(sizes, 'width', 10, 3000, 1)
sf.add(sizes, 'height', 10, 3000, 1)

let nf = gui.addFolder('nodes/edges').onChange(draw)
nf.add(P, 'maxEdges', 1, 400, 1)
nf.add(P, 'maxFails', 1, 400, 1)
nf.add(P, 'maxSegmentLen', 1, 100, 1)
nf.add(P, 'innerGrid', 1, 30, 1)
nf.add(P, 'symmetry', ['reflect', 'rotate', 'horizontal', 'vertical'])

let df = gui.addFolder('draw').onChange(draw)
df.add(P, 'lineWidth', 0.5, 5, 0.5)

gui.add({ save: () => saveCanvas(cnvs.canvas, 'edges') }, 'save')

cnvs.canvas.addEventListener('click', draw)
