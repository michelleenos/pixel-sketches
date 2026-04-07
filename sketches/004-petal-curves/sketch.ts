import { GuiExtra } from 'lilgui-extra'
import { Petal, petalDefaults, randomizePetal, type RandomPetalOpts } from './_petal'
import { PetalDrawing } from './_petals-drawings'
import { presets, type Preset } from './_presets'

const drawing = new PetalDrawing()

const randomOpts: RandomPetalOpts = {
    cpXMin: 0.15,
    cpXMax: 0.3,
    cpYMin: 0.1,
    cpYMax: 0.4,
    lengthMin: 500,
    lengthMax: 700,
    shiftEndMin: -0.3,
    shiftEndMax: 0.3,
}

function randomize() {
    randomizePetal(randomOpts, {}, drawing.petal)
    petalControls(drawing.petal, petalGui)
    drawing.restart()
}

const gui = new GuiExtra()

const onUpdateType = (val: 'star' | 'flower' | 'petal', setLength = true) => {
    if (val === 'flower') {
        if (setLength) drawing.petal.length = drawing.height * 0.4
        randomOpts.lengthMin = drawing.height * 0.35
        randomOpts.lengthMax = drawing.height * 0.45
    } else {
        if (setLength) drawing.petal.length = drawing.height * 0.8
        randomOpts.lengthMin = drawing.height * 0.7
        randomOpts.lengthMax = drawing.height * 0.95
    }

    if (val === 'star') {
        randomOpts.shiftEndMax = 0
        randomOpts.shiftEndMin = 0
    }

    gui.updateAll()
    drawing.restart()
}

const drawingControls = (gui: GuiExtra) => {
    const f = gui.addFolder('drawing')
    f.add(drawing, 'type', ['star', 'flower', 'petal']).onChange(onUpdateType)
    f.add(drawing, 'rotate', 0, 360, 1)
    f.add(drawing, 'showBaseCps')
    f.add(drawing, 'showMovingCps')
    f.add(drawing, 'points', 1, 20, 1)
    f.add(drawing.loop, 'fps', 1, 600, 1)
    return f
}

const petalControls = (petal: Petal, f: GuiExtra) => {
    f.destroyChildren()
    f.add(petal, 'shiftEnd', -2, 2, 0.001)
    f.add(petal, 'length', 100, 1000, 1)
    f.addVec2Items(petal, 'cp1', -2, 2, 0.001)
    f.addVec2Items(petal, 'cp2', -2, 2, 0.001)
    f.addVec2Items(petal, 'cpAmp', 0, 1, 0.01)
    f.add(petal, 'lineSpace', 0.5, 10, 0.1)
    f.add(petal, 'maxLines', 10, 10000, 1)
    const ffreq = f.addFolder('frequency').close()
    ffreq.addVec2Items(petal, 'cp1Freq', 0, 20, 1)
    ffreq.addVec2Items(petal, 'cp2Freq', 0, 20, 1)
}

const randomControls = (gui: GuiExtra) => {
    const fr = gui.addFolder('randomize')
    fr.add(randomOpts, 'cpXMax', 0, 1, 0.01)
    fr.add(randomOpts, 'cpXMin', 0, 1, 0.01)
    fr.add(randomOpts, 'cpYMax', 0, 1, 0.01)
    fr.add(randomOpts, 'cpYMin', 0, 1, 0.01)
    fr.add(randomOpts, 'lengthMin', 100, 1000, 1)
    fr.add(randomOpts, 'lengthMax', 100, 1000, 1)
    fr.add(randomOpts, 'shiftEndMin', -1, 1, 0.01)
    fr.add(randomOpts, 'shiftEndMax', -1, 1, 0.01)
    fr.onChange(() => randomize())
    fr.add({ randomize }, 'randomize')
    return fr
}

const presetControls = (gui: GuiExtra, presets: { [key: string]: Preset }) => {
    gui.add({ preset: '' }, 'preset', presets).onChange((preset?: Preset) => {
        if (!preset) return
        Object.assign(drawing.petal, { ...petalDefaults, ...preset.petal })

        drawing.type = preset.type
        if (preset.type !== 'petal') drawing.points = preset.points || 6
        drawing.loop.fps = preset.fps || 60

        onUpdateType(preset.type, false)
        petalControls(drawing.petal, petalGui)
        gui.updateAll()
        drawing.restart()
    })
}

drawingControls(gui)
const petalGui = gui.addFolder('petal')
petalControls(drawing.petal, petalGui)
randomControls(gui)
presetControls(gui, presets)

gui.add({ restart: drawing.restart }, 'restart')
gui.add({ save: () => drawing.cnvs.save('petal') }, 'save')
