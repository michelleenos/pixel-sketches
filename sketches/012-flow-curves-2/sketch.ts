import GUI from 'lil-gui'
import { getPaletteVariants } from 'mish-bainrow'
import { easing, floorToNearest, random, round } from 'utils'
import { flowElements } from './flow-elements'
import type { FlowParams, FlowWorker } from './flow.types'
import { Flow } from './flow'

const palettes = getPaletteVariants({ isolateColors: true })
const palette = random(palettes)

const params: Required<FlowParams> = {
    width: Math.min(floorToNearest(window.innerWidth - 100, 10), 800),
    height: Math.min(floorToNearest(window.innerHeight - 100, 10), 900),
    maxSteps: 400,
    minSteps: 10,
    stepLength: 4,
    lineWidthMax: 7,
    lineWidthMin: 1,
    minSpace: 7,
    taperEase: 'outCirc',
    taperLength: 200,
    palette: palette,
    vals: Flow.randomFlowVals(),
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
    console.log('message', e.data)

    if (type === 'generating') {
        workerStatus.busy = true
        loading.style.display = 'flex'
        gui.controllersRecursive().forEach((c) => c.disable())
    } else if (type === 'generating-live') {
        workerStatus.busy = true
        loading.style.display = 'none'
        gui.controllersRecursive().forEach((c) => c.disable())
    } else if (type === 'none') {
        workerStatus.busy = false
        loading.style.display = 'none'
        gui.controllersRecursive().forEach((c) => c.enable())
        if (workerStatus.pendingUpdate) sendUpdate(workerStatus.shouldRegenerate)
    }
}

function sendUpdate(regenerate: boolean) {
    console.log('send update... ', { ...workerStatus })
    if (workerStatus.busy) {
        workerStatus.pendingUpdate = true
        workerStatus.shouldRegenerate = regenerate
    } else {
        console.log('sending update')
        worker.postMessage({ type: 'update', params })
        if (regenerate) {
            console.log('sending regenerate')
            worker.postMessage({ type: 'regenerate', live: false })
        }
        worker.postMessage({ type: 'draw' })
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

// *************** GUI *************** //

const gui = new GUI()
const f = gui.addFolder('flow')
f.add(params, 'stepLength', 0.1, 30, 0.1)
f.add(params, 'maxSteps', 1, 2000, 1)
f.add(params, 'minSteps', 1, 1000, 1)
f.add(params, 'minSpace', 1, 20, 1)
f.onFinishChange(() => sendUpdate(true))

const vf = gui.addFolder('flow vals')
vf.add(params.vals, 0, -20, 20, 0.1)
vf.add(params.vals, 1, -20, 20, 0.1)
vf.add(params.vals, 2, -20, 20, 0.1)
vf.add(params.vals, 3, -20, 20, 0.1)
vf.add(
    {
        randomizeVals: () => {
            const newVals = Flow.randomFlowVals()
            Object.assign(params.vals, newVals)
            vf.controllersRecursive().forEach((c) => c.updateDisplay())
            sendUpdate(true)
        },
    },
    'randomizeVals',
)
vf.onFinishChange(() => sendUpdate(true))

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
drf.onChange(() => sendUpdate(false))

const sf = gui.addFolder('size')
sf.add(sizes, 'width', 10, 3000, 10)
sf.add(sizes, 'height', 10, 3000, 10)
sf.onChange(setSize)

// *************** Initialize *************** //

setSize()
worker.postMessage({ type: 'regenerate', live: false })
