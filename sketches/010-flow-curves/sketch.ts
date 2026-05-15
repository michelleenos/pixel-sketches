import GUI from 'lil-gui'
import { getPaletteVariants } from 'mish-bainrow'
import { easing, floorToNearest, random } from 'utils'
import { flowElements } from './flow-elements'
import type { FlowParams, FlowWorker } from './flow.types'

const palettes = getPaletteVariants({ isolateColors: true })
const palette = random(palettes)

const params: FlowParams = {
    width: Math.min(floorToNearest(window.innerWidth - 100, 10), 800),
    height: Math.min(floorToNearest(window.innerHeight - 100, 10), 900),
    maxSteps: 400,
    minSteps: 10,
    stepLength: 4,
    lineWidthMax: 7,
    lineWidthMin: 0.5,
    gridSize: 80,
    noiseMult: 0.1,
    minSpace: 6,
    taperEase: 'outCirc',
    taperLength: 200,
    palette: palette,
    drawStrategy: { type: 'grid', spacing: 10 },
}

const sizes = {
    width: params.width,
    height: params.height,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
}

const { canvas, loading } = flowElements()

// *************** Worker *************** //

const offscreenCanvas = canvas.transferControlToOffscreen()
let workerStatus = { busy: false, pendingUpdate: false, shouldRegenerate: false }

const worker = new Worker(new URL('./sketch.worker.ts', import.meta.url)) as FlowWorker
worker.postMessage({ type: 'init', canvas: offscreenCanvas, params }, [offscreenCanvas])

worker.onmessage = (e) => {
    const type = e.data.type
    if (type === 'start') {
        workerStatus.busy = true
        loading.style.display = 'flex'
    } else if (type === 'done') {
        workerStatus.busy = false
        loading.style.display = 'none'
        if (workerStatus.pendingUpdate) sendUpdate(workerStatus.shouldRegenerate)
    }
}

function sendUpdate(regenerate: boolean) {
    if (workerStatus.busy) {
        workerStatus.pendingUpdate = true
        workerStatus.shouldRegenerate = regenerate
    } else {
        worker.postMessage({ type: 'update', params, regenerate })
        workerStatus.pendingUpdate = false
        workerStatus.shouldRegenerate = false
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
    drawStrategyType: 'grid' as 'grid' | 'circlePack' | 'random',
    drawGridParams: { spacing: 10 },
    drawRandomParams: { count: 800 },
    drawCircleParams: { radius: 8, maxAttempts: 70 },
}

const gui = new GUI()
const f = gui.addFolder('flow')
f.add(params, 'stepLength', 0.1, 30, 0.1)
f.add(params, 'maxSteps', 1, 2000, 1)
f.add(params, 'minSteps', 1, 1000, 1)
f.add(params, 'gridSize', 1, 250, 1)
f.add(params, 'noiseMult', 0, 2, 0.01)
f.add(params, 'minSpace', 0.1, 20, 0.1)
f.onFinishChange(() => sendUpdate(true))

const drf = gui.addFolder('drawing')
drf.add(params, 'lineWidthMax', 0.5, 20, 0.5)
drf.add(params, 'lineWidthMin', 0.1, 20, 0.1)
drf.add(params, 'taperEase', Object.keys(easing))
drf.add(params, 'taperLength', 1, 800, 1)
drf.add(
    params,
    'palette',
    palettes.reduce((list, palette) => ({ ...list, [palette.name]: palette }), {}),
)
drf.onFinishChange(() => sendUpdate(false))

const sf = gui.addFolder('size')
sf.add(sizes, 'width', 10, 3000, 10)
sf.add(sizes, 'height', 10, 3000, 10)
sf.onChange(setSize)

const df = gui.addFolder('drawStrategy').onFinishChange(() => {
    let type = debg.drawStrategyType
    if (type === 'grid') {
        params.drawStrategy = { type: 'grid', ...debg.drawGridParams }
    } else if (type === 'circlePack') {
        params.drawStrategy = { type: 'circlePack', ...debg.drawCircleParams }
    } else {
        params.drawStrategy = { type: 'random', ...debg.drawRandomParams }
    }
    sendUpdate(true)
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
