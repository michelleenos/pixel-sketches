import GUI from 'lil-gui'
import { easing, random, saveCanvas } from 'utils'
import { flowElements } from './flow-elements'
import { randomFlowVals } from './flow-vals'
import { FlowClient } from './flow2-client'
import type { FlowParams, FlowVals, GrainParams, Sizes } from './flow2.types'
import { makePalettesGui, palettes } from './flow-palettes'

const { canvas, loading, stats } = flowElements()

// *************** URL params *************** //

const urlParams = new URLSearchParams(window.location.search)

function parseVals(raw: string | null): FlowVals | null {
    if (!raw) return null
    const parts = raw.split(',').map(Number)
    return parts.length === 4 && parts.every(Number.isFinite) ? (parts as FlowVals) : null
}

function syncUrl() {
    const url = new URL(window.location.href)
    url.searchParams.set('vals', params.vals.map((val) => val.toFixed(2)).join(','))
    window.history.replaceState(null, '', url)
}

// *************** Initialize params *************** //

const params: Required<Omit<FlowParams, 'width' | 'height'>> = {
    maxSteps: 400,
    minSteps: 3,
    stepLength: 2,
    lineWidthMax: 7,
    lineWidthMin: 1,
    minSpace: 7,
    taperEase: 'outCirc',
    taperLength: 200,
    maxFails: 300,
    colorsMethod: 'clumps',
    colorRepeats: 2,
    colorRandomDist: 200,
    showColors: false,
    lineCap: 'round',
    brightenMax: 0,
    brightenMin: 0,
    palette: random(palettes),
    vals: parseVals(urlParams.get('vals')) ?? randomFlowVals(),
}

const grainParams: GrainParams = {
    overAlpha: 1,
    overOperation: 'overlay',
    type: 'none',
    adjustAmount: 30,
}

const sizes: Sizes = {
    width: 800,
    height: 800,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
}

// *************** Worker *************** //

// at 800x800, maxFails = 300, steps -> 3-400, length 2, minSpace 7
// 		bw 3500 - 5500ish
const timings: number[] = []
const client = new FlowClient(canvas.transferControlToOffscreen(), params, sizes)

client.on('busy', (status) => {
    if (status === 'generating') loading.style.display = 'flex'
    gui.controllersRecursive().forEach((c) => c.disable())
})

client.on('notBusy', (time) => {
    loading.style.display = 'none'
    gui.controllersRecursive().forEach((c) => c.enable())
    timings.push(time)
    stats.innerText = timings.map((t) => t.toFixed(2)).join(', ')
})

function sendUpdate() {
    client.update(params)
}

function regenerate(live = false) {
    syncUrl()
    client.regenerate(live)
}
// *************** Sizes *************** //

function setSize() {
    client.setSize(sizes)
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
f.add(params, 'maxFails', 10, 2000, 1)
f.onFinishChange(() => client.update(params))

const vf = gui.addFolder('flow vals')
vf.add(params.vals, 0, -20, 20, 0.1)
vf.add(params.vals, 1, -20, 20, 0.1)
vf.add(params.vals, 2, -20, 20, 0.1)
vf.add(params.vals, 3, -20, 20, 0.1)
vf.add(
    {
        randomizeVals: () => {
            Object.assign(params.vals, randomFlowVals())
            vf.controllersRecursive().forEach((c) => c.updateDisplay())
            sendUpdate()
            regenerate()
        },
    },
    'randomizeVals',
)
vf.onFinishChange(() => {
    sendUpdate()
})

const drf = gui.addFolder('drawing')
drf.add(params, 'lineWidthMax', 0.5, 20, 0.5)
drf.add(params, 'lineWidthMin', 0.1, 20, 0.1)
drf.add(params, 'taperEase', Object.keys(easing))
drf.add(params, 'taperLength', 1, 800, 1)
drf.add(params, 'lineCap', ['round', 'square'])
drf.add(params, 'colorRepeats', 1, 10, 1)
drf.add(params, 'colorsMethod', ['clumps', 'hue', 'temp'])
drf.add(params, 'colorRandomDist', 0, 500, 1)
drf.add(params, 'brightenMin', -2, 2, 0.1)
drf.add(params, 'brightenMax', -2, 2, 0.1)
drf.add(params, 'showColors')
drf.onChange(() => {
    sendUpdate()
    client.redraw()
})

makePalettesGui(gui.addFolder('palette'), params.palette, (pal) => {
    params.palette = pal
    sendUpdate()
    client.redraw()
})

const sf = gui.addFolder('size')
sf.add(sizes, 'width', 10, 3000, 10)
sf.add(sizes, 'height', 10, 3000, 10)
sf.onChange(setSize)

const gf = gui.addFolder('grain')
gf.add(grainParams, 'type', ['over', 'adjust', 'none'])
gf.add(grainParams, 'adjustAmount', 0, 255, 1)
gf.add(grainParams, 'overAlpha', 0, 1, 0.01)
gf.add(grainParams, 'overOperation', ['overlay', 'soft-light', 'screen', 'multiply'])
gf.onChange(() => client.setGrain(grainParams))

const actions = {
    regenerate,
    regenerateLive() {
        regenerate(true)
    },
    save() {
        const str = (input: number) => input.toFixed(2).replaceAll('.', 'd')
        let filename = `flow-${str(params.vals[0])}-${str(params.vals[1])}-${str(params.vals[2])}-${str(params.vals[3])}`
        saveCanvas(canvas, filename, 'png')
    },
}

gui.add(actions, 'regenerateLive')
gui.add(actions, 'regenerate')
gui.add(actions, 'save')

// *************** Initialize *************** //

syncUrl()
setSize()
regenerate()
