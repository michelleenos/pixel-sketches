import GUI from 'lil-gui'
import { defaultFlowFieldParams, type FlowFieldParams } from './flowfield'
import { Drawing } from './sketch'
import { defaultTimerParams, type TimerParams } from './timer'

interface ParamsPreset {
    field?: FlowFieldParams
    timer?: TimerParams
    palette?: string
}

export function setPreset(drawing: Drawing, params: ParamsPreset) {
    const { field, timer, palette } = params
    Object.assign(drawing.field, field)
    Object.assign(drawing.timer, timer)
    if (palette) drawing.palette = palette
    drawing.gui?.controllersRecursive().forEach((c) => c.updateDisplay())
    drawing.restart()
}

const defaultPreset: ParamsPreset = {
    field: { ...defaultFlowFieldParams },
    timer: { ...defaultTimerParams },
}

export const presets: { [key: string]: ParamsPreset } = {
    default: defaultPreset,

    veins: {
        field: {
            noiseScale: 0.0042,
            speed: 1.7,
            count: 3700,
            lerpVal: 0.61,
            bgAlpha: 1,
            lineAlpha: 32,
            turns: 4,
        },
        timer: {
            timeJump: 580,
            timeJumpInterval: 3500,
        },
    },
    steps: {
        field: {
            noiseScale: 0.0032,
            speed: 11.4,
            lerpVal: 0.65,
            turns: 4,
            bgAlpha: 0,
            lineAlpha: 10,
            count: 3900,
        },
        timer: {
            timeJump: 30,
            timeJumpInterval: 500,
        },
        palette: 'autmn-0',
    },
    spray: {
        field: {
            noiseScale: 0.001,
            speed: 5.5,
            lerpVal: 0.21,
            turns: 6,
            count: 2500,
        },
        timer: {
            timeJump: 1000,
            timeJumpInterval: 2000,
        },
    },
    bubbles: {
        field: {
            noiseScale: 0.0079,
            speed: 4.1,
            lerpVal: 0.08,
            turns: 3,
            bgAlpha: 0,
            lineAlpha: 14,
            count: 4600,
        },
        timer: {
            timeJump: 0,
            timeJumpInterval: 10000,
        },
        palette: 'autmn-2',
    },
    switch: {
        field: {
            noiseScale: 0.0054,
            speed: 4,
            count: 3000,
            lerpVal: 0.5,
            bgAlpha: 90,
            lineAlpha: 130,
            turns: 4,
        },
        timer: {
            timeJump: 1900,
            timeJumpInterval: 1000,
        },
    },
}

export function flowFieldDrawingGui(drawing: Drawing) {
    let refreshing = false

    const gui = new GUI()
    gui.add(drawing.field, 'noiseScale', 0.0001, 0.01, 0.0001)
    gui.add(drawing.field, 'speed', 0.1, 20, 0.1)
    gui.add(drawing.field, 'lerpVal', 0.01, 1, 0.01)
    gui.add(drawing.field, 'turns', 1, 10, 1)
    gui.add(drawing.field, 'bgAlpha', 0, 255, 1)
    gui.add(drawing.field, 'lineAlpha', 0, 255, 1)
    gui.add(drawing.field, 'count', 0, 5000, 1)

    const tf = gui.addFolder('Timer')
    tf.add(drawing.timer, 'timeJump', 0, 5000, 10)
    tf.add(drawing.timer, 'timeJumpInterval', 0, 10000, 10)

    gui.add(
        drawing,
        'palette',
        drawing._palettes
            .map((pal) => ({ [pal.name]: pal }))
            .reduce((acc, pal) => {
                return { ...acc, ...pal }
            }, {}),
    ).onChange(() => drawing.restart())

    gui.add(drawing, 'save')
    gui.add(drawing, 'restart')
    gui.add(drawing, 'restartWithNewColors')

    const debg = { preset: 'default' }

    let presetCtrl = gui.add(debg, 'preset', presets).onChange((preset: ParamsPreset) => {
        if (refreshing) return
        console.log('setting preset', preset)
        setPreset(drawing, preset)
    })

    gui.onChange((ev) => {
        if (ev.property !== 'preset') {
            refreshing = true
            presetCtrl.setValue('')
            refreshing = false
        }
    })

    return gui
}
