import GUI from 'lil-gui'
import { easing, random, saveCanvas } from 'utils'
import { flowElements } from './flow-elements'
import { randomFlowVals } from './flow-vals'
import { FlowClient } from './flow2-client'
import type { FlowParams, FlowVals, GrainParams, Sizes } from './flow2.types'
import { makePalettesGui, palettes } from './flow-palettes'
import { flowDefaults } from './flow2'
import { flowPresets } from './presets'

const USE_MISH_CONTROLS = false

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
    ...flowDefaults,
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

const client = new FlowClient(canvas.transferControlToOffscreen(), params, sizes)

client.on('busy', (status) => {
    if (status === 'generating') loading.style.display = 'flex'
    gui.controllersRecursive().forEach((c) => c.disable())
})

client.on('notBusy', () => {
    loading.style.display = 'none'
    gui.controllersRecursive().forEach((c) => c.enable())

    if (USE_MISH_CONTROLS) {
        stats.innerText = client.timings.map((t) => t.toFixed(2)).join(', ')
    }
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

let guiRefreshing = false

const gui = new GUI()
const f = gui.addFolder('flow')
f.add(params, 'stepLength', 0.1, 30, 0.1)
f.add(params, 'maxSteps', 1, 2000, 1)
f.add(params, 'minSteps', 1, 1000, 1)
f.add(params, 'minSpace', 1, 100, 1)
f.onFinishChange(() => {
    if (guiRefreshing) return
    console.log('send update from flow folder')
    client.update(params)
})

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
    if (guiRefreshing) return

    console.log('send update from vals folder')
    sendUpdate()
})

const drf = gui.addFolder('drawing')
drf.add(params, 'lineWidthMax', 0.5, 50, 0.5)
drf.add(params, 'lineWidthMin', 0.5, 50, 0.5)
drf.add(params, 'taperLength', 1, 800, 1)
drf.add(params, 'lineCap', ['round', 'square'])
drf.add(params, 'colorRepeats', 1, 10, 1)
drf.add(params, 'colorsMethod', ['clumps', 'hue', 'temp'])
drf.add(params, 'colorRandomDist', 0, 500, 1)
drf.onChange(() => {
    if (guiRefreshing) return

    console.log('send update from draw folder')
    sendUpdate()
    client.redraw()
})

makePalettesGui(gui.addFolder('palette'), params.palette, (pal) => {
    params.palette = pal
    if (guiRefreshing) return
    console.log('send update from palette folder')
    sendUpdate()
    client.redraw()
})

const sf = gui.addFolder('size').close()
sf.add(sizes, 'width', 10, 3000, 10)
sf.add(sizes, 'height', 10, 3000, 10)
sf.onChange(() => {
    console.log('send update from sizes folder')
    setSize()
})

const gf = gui.addFolder('grain').close()
gf.add(grainParams, 'type', ['over', 'adjust', 'none'])
gf.add(grainParams, 'adjustAmount', 0, 255, 1)
gf.add(grainParams, 'overAlpha', 0, 1, 0.01)
gf.add(grainParams, 'overOperation', ['overlay', 'soft-light', 'screen', 'multiply'])
gf.onChange(() => {
    client.setGrain(grainParams)
})

const actions = {
    regenerate,
    regenerateLive() {
        regenerate(true)
    },
    saveConfig() {
        const config = gui.save()
        navigator.clipboard.writeText(JSON.stringify(config))
    },
    save() {
        const str = (input: number) => input.toFixed(2).replaceAll('.', 'd')
        let filename = `flow-${str(params.vals[0])}-${str(params.vals[1])}-${str(params.vals[2])}-${str(params.vals[3])}`
        saveCanvas(canvas, filename, 'png')
    },
}

gui.add(params, 'liveInterval', 1, 200, 1)
gui.add(actions, 'regenerateLive')
gui.add(actions, 'regenerate')
gui.add(actions, 'save')

if (USE_MISH_CONTROLS) {
    f.add(params, 'decreaseStep', 1, 50, 1)
    f.add(params, 'minInitialCurves', 1, 20, 1)
    f.add(params, 'qtCapacity', 4, 40, 1)
    f.add(params, 'scale', 0, 0.01, 0.0001)
    f.add(params, 'offset', 0, 50, 1)
    f.add(params, 'maxFailsMax', 10, 2000, 1)
    f.add(params, 'maxFailsMin', 10, 2000, 1)

    drf.add(params, 'taperEase', Object.keys(easing))
    drf.add(params, 'brightenMin', -2, 2, 0.1)
    drf.add(params, 'brightenMax', -2, 2, 0.1)
    drf.add(params, 'showColors')

    gui.add(actions, 'saveConfig')
    gui.add({ preset: '' }, 'preset', flowPresets).onChange((val: any) => {
        if (guiRefreshing) return
        guiRefreshing = true
        console.log('load preset', val)
        gui.load(val)
        sendUpdate()
        console.log('regenerating from load preset fn')
        regenerate()
        guiRefreshing = false
    })
}

// *************** Initialize *************** //

syncUrl()
setSize()
regenerate()
