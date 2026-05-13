import GUI from 'lil-gui'
import { getPaletteVariants } from 'mish-bainrow'
import type { FlowParams, FlowWorker } from './flow.types'
import { createElement, easing, random } from 'utils'

const palettes = getPaletteVariants({
    isolateColors: true,
})
const palette = random(palettes)

const params: FlowParams = {
    width: window.innerWidth,
    height: window.innerHeight,
    colorCycles: 6,
    maxSteps: 500,
    minSteps: 10,
    stepLength: 4,
    lineWidthMax: 7,
    lineWidthMin: 0.5,
    gridSize: 60,
    noiseMult: 0.1,
    minSpace: 4,
    taperEase: 'outCirc',
    taperLength: 200,
    palette: palette,
    shouldDrawField: false,
    drawStrategy: { type: 'circlePack', radius: 8, maxAttempts: 70 },
}

const sizes = {
    width: params.width,
    height: params.height,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    useWindowSize: true,
}

// *************** Elements *************** //

const canvas = createElement('canvas', { style: 'display:block' })
const loading = createElement(
    'div',
    {
        style: 'background:#fff;text-align:center;display:flex;align-items:center;justify-content:center;font-size:18px;position:absolute;width:100%;height:100%;top:0;left:0;color:#000;font-weight:600;opacity:0.8',
    },
    ['drawing...'],
)
const container = createElement('div', { style: 'position:relative;display:inline-block;' }, [
    canvas,
    loading,
])
document.body.appendChild(container)

// *************** Worker *************** //

const offscreenCanvas = canvas.transferControlToOffscreen()
let workerBusy = false
let pendingUpdate = false

const worker = new Worker(new URL('./sketch.worker.ts', import.meta.url)) as FlowWorker
worker.postMessage({ type: 'init', canvas: offscreenCanvas, params }, [offscreenCanvas])

worker.onmessage = (e) => {
    const type = e.data.type
    if (type === 'start') {
        workerBusy = true
        loading.style.display = 'flex'
    } else if (type === 'done') {
        workerBusy = false
        loading.style.display = 'none'
        if (pendingUpdate) sendUpdate()
    }
}

function sendUpdate() {
    if (workerBusy) {
        pendingUpdate = true
    } else {
        worker.postMessage({ type: 'update', params })
        pendingUpdate = false
    }
}

// *************** Sizes *************** //

function setSize() {
    worker.postMessage({ type: 'setSize', sizes })
    canvas.style.width = `${sizes.width}px`
    canvas.style.height = `${sizes.height}px`
}

setSize()

// *************** GUI *************** //

const debg = {
    reseed: () => worker.postMessage({ type: 'reseed' }),
    palette: palette.name,
    drawStrategyType: 'circlePack' as 'grid' | 'circlePack' | 'random',
    drawGridParams: { spacing: 20 },
    drawRandomParams: { count: 800 },
    drawCircleParams: { radius: 8, maxAttempts: 70 },
}

const gui = new GUI()
const f = gui.addFolder('flow')
f.add(params, 'stepLength', 0.1, 30, 0.1)
f.add(params, 'maxSteps', 1, 2000, 1)
f.add(params, 'minSteps', 1, 1000, 1)
f.add(params, 'gridSize', 1, 250, 1)
f.add(params, 'colorCycles', 1, 30, 1)
f.add(params, 'lineWidthMax', 0.5, 20, 0.5)
f.add(params, 'lineWidthMin', 0.1, 20, 0.1)
f.add(params, 'noiseMult', 0, 2, 0.01)
f.add(params, 'taperEase', Object.keys(easing))
f.add(params, 'taperLength', 1, 800, 1)
f.add(params, 'minSpace', 0.1, 20, 0.1)
f.add(params, 'shouldDrawField')
f.add(
    params,
    'palette',
    palettes.reduce((list, palette) => ({ ...list, [palette.name]: palette }), {}),
)
f.onFinishChange(sendUpdate)

const sf = gui.addFolder('size')
sf.add(sizes, 'useWindowSize').onChange((val: boolean) => {
    if (val) {
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight
        setSize()
        whctrls.forEach((c) => c.hide())
    } else {
        whctrls.forEach((c) => c.show())
    }
})
const whctrls = [sf.add(sizes, 'width', 10, 3000, 1), sf.add(sizes, 'height', 10, 3000, 1)]
whctrls.forEach((c) => {
    c.onFinishChange(setSize)
    c.hide()
})

const df = gui.addFolder('drawStrategy').onFinishChange(() => {
    let type = debg.drawStrategyType
    if (type === 'grid') {
        params.drawStrategy = { type: 'grid', ...debg.drawGridParams }
    } else if (type === 'circlePack') {
        params.drawStrategy = { type: 'circlePack', ...debg.drawCircleParams }
    } else {
        params.drawStrategy = { type: 'random', ...debg.drawRandomParams }
    }
    sendUpdate()
})
df.add(debg, 'drawStrategyType', ['grid', 'circlePack', 'random']).onFinishChange(
    (val: 'grid' | 'circlePack' | 'random') => drawFolderShow(val),
)

// draw strategy folders
const drfs = {
    grid: df.addFolder('grid'),
    circlePack: df.addFolder('circlePack'),
    random: df.addFolder('random'),
}

const drawFolderShow = (type: keyof typeof drfs) => {
    ;(Object.keys(drfs) as (keyof typeof drfs)[]).forEach((val) => {
        type === val ? drfs[val].show() : drfs[val].hide()
    })
}

drawFolderShow(params.drawStrategy!.type)

drfs.grid.add(debg.drawGridParams, 'spacing', 1, 50, 0.5)
drfs.circlePack.add(debg.drawCircleParams, 'radius', 1, 100, 1)
drfs.circlePack.add(debg.drawCircleParams, 'maxAttempts', 2, 200, 1)
drfs.random.add(debg.drawRandomParams, 'count', 1, 5000, 1)

gui.add(debg, 'reseed')
