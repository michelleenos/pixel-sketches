import { GuiExtra } from 'lilgui-extra'
import { Canvas, fixedFpsLoop, type Vec2Like } from 'utils'
import {
    Petal,
    petalDefaults,
    randomizePetal,
    type PetalOpts,
    type RandomPetalOpts,
} from './_petal'

function drawPoint(ctx: CanvasRenderingContext2D, x: number, y: number, radius = 5, fill = '#fff') {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = fill
    ctx.fill()
}

const O = {
    preset: '',
    width: 800,
    height: 800,
    showBaseControlPoints: false,
    showMovingControlPoints: false,
    rotate: 180,
    type: 'star' as 'star' | 'flower' | 'petal',
    points: 6,
}

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

type Preset = {
    petal: PetalOpts
    fps?: number
} & (
    | {
          type: 'petal'
          rotate?: number
      }
    | {
          type: 'star' | 'flower'
          points?: number
      }
)

const presets: { [key: string]: Preset } = {
    default: {
        type: 'petal',
        petal: {
            ...petalDefaults,
            length: O.height * 0.8,
        },
    },
    star6: {
        type: 'star',
        points: 6,
        petal: {
            cp1Freq: { x: 2, y: 3 },
            cp2Freq: { x: 2, y: 3 },
            lineSpace: 1,
            cp1: { x: -0.237, y: 0.36 },
            cp2: { x: 0.2, y: 0.73 },
            length: 722,
            shiftEnd: 0,
            maxLines: 1400,
        },
    },
    flower: {
        type: 'flower',
        points: 8,
        fps: 120,
        petal: {
            shiftEnd: 0.015,
            length: 320,
            cp1: { x: 0.2, y: 0.33 },
            cp2: { x: -0.21, y: 0.525 },
            cpAmp: { x: 0.35, y: 0.2 },
            lineSpace: 0.5,
            maxLines: 1500,
            cp1Freq: { x: 5, y: 4 },
            cp2Freq: { x: 5, y: 4 },
        },
    },
    funky: {
        type: 'petal',
        rotate: 180,
        petal: {
            shiftEnd: 0,
            length: 640,
            cp1: { x: -0.24, y: 0.97 },
            cp2: { x: 0.17, y: -0.26 },
            cpAmp: { x: 0.25, y: 0.15 },
            lineSpace: 1,
            maxLines: 1000,
            cp1Freq: { x: 2, y: 3 },
            cp2Freq: { x: 2, y: 3 },
        },
    },
}

let cnvs = new Canvas({ className: 'sketch', append: true })
let petal = new Petal({ length: O.height * 0.8, maxLines: 1000 })
let petalCnvs = new Canvas({ append: false, width: O.width, height: O.height })
let cpsCnvs = new Canvas({ append: false, width: O.width, height: O.height })

const onResize = () => {
    cnvs.setSize(window.innerWidth, window.innerHeight)
    cnvs.ctx.clearRect(0, 0, cnvs.width, cnvs.height)
}

window.addEventListener('resize', onResize)

function offscreenDraw(c: Canvas) {
    c.ctx.save()
    c.ctx.translate(c.width / 2, (c.height - petal.length) / 2)
    c.ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    c.ctx.lineWidth = 0.5
    const cps = petal.drawLine(c.ctx)
    c.ctx.restore()
    return cps
}

function offscreenDrawCps(cp1: Vec2Like, cp2: Vec2Like) {
    let ctx = cpsCnvs.ctx
    ctx.save()
    ctx.translate(cpsCnvs.width / 2, (cpsCnvs.height - petal.length) / 2)
    drawPoint(ctx, cp1.x, cp1.y, 2)
    drawPoint(ctx, cp2.x, cp2.y, 2)
    ctx.restore()
}

function draw() {
    if (O.type === 'petal' && petal.done) return
    const { ctx } = cnvs
    ctx.clearRect(0, 0, cnvs.width, cnvs.height)
    ctx.fillStyle = 'hsl(240, 4%, 10%)'
    ctx.fillRect(0, 0, cnvs.width, cnvs.height)
    ctx.save()

    let tx = (cnvs.width - O.width) / 2
    let ty = (cnvs.height - O.height) / 2
    ctx.translate(tx, ty)

    ctx.beginPath()
    ctx.fillStyle = 'hsl(0, 4%, 4%)'
    ctx.rect(-10, -10, O.width + 20, O.height + 20)
    ctx.fill()

    ctx.beginPath()
    ctx.strokeStyle = '#7b7b7b'
    ctx.rect(0, 0, O.width, O.height)
    ctx.stroke()

    if (O.type === 'star') {
        let a = (Math.PI * 2) / O.points
        ctx.fillStyle = '#fff'
        offscreenDraw(petalCnvs)
        for (let i = 0; i < O.points; i++) {
            ctx.save()
            ctx.translate(O.width / 2, O.height / 2)
            ctx.rotate(a * i)
            ctx.translate(-O.width / 2, -O.height / 2)
            ctx.drawImage(petalCnvs.canvas, 0, 0, O.width, O.height)
            ctx.restore()
        }
    } else if (O.type === 'flower') {
        let a = (Math.PI * 2) / O.points
        offscreenDraw(petalCnvs)
        for (let i = 0; i < O.points; i++) {
            ctx.save()
            ctx.translate(O.width / 2, O.height / 2)
            ctx.rotate(a * i)
            ctx.translate(-O.width / 2, -O.height / 2)
            ctx.translate(0, petal.length / 2)
            ctx.drawImage(petalCnvs.canvas, 0, 0, O.width, O.height)
            ctx.restore()
        }
    } else {
        if (petal.done) return
        ctx.translate(O.width / 2, O.height / 2)
        ctx.rotate((O.rotate / 180) * Math.PI)
        ctx.translate(-O.width / 2, -O.height / 2)

        const cps = offscreenDraw(petalCnvs)

        ctx.drawImage(petalCnvs.canvas, 0, 0, O.width, O.height)
        if (cps && O.showMovingControlPoints) {
            let { cp1, cp2 } = cps
            offscreenDrawCps(cp1, cp2)
            ctx.drawImage(cpsCnvs.canvas, 0, 0, O.width, O.height)
        }
        ctx.translate(petalCnvs.width / 2, (petalCnvs.height - petal.length) / 2)

        if (O.showBaseControlPoints) {
            drawPoint(ctx, petal.cp1.x * petal.length, petal.cp1.y * petal.length, 5, '#f0f')
            drawPoint(ctx, petal.cp2.x * petal.length, petal.cp2.y * petal.length, 5, '#0ff')
        }
    }

    ctx.restore()

    if (petal.done) {
        ctx.save()
        ctx.translate(tx, ty)
        ctx.fillStyle = '#fff'
        ctx.fillText(
            `cp1: ${petal.cp1.x}, ${petal.cp1.y} / cp2: ${petal.cp2.x}, ${petal.cp2.y}`,
            10,
            -30,
        )
        ctx.fillText(`length: ${petal.length}`, 10, -15)
        ctx.restore()
    }
}

const loop = fixedFpsLoop(draw, false)

function clearCpsCanvas() {
    cpsCnvs.ctx.clearRect(0, 0, cpsCnvs.width, cpsCnvs.height)
}

function restart() {
    petal.restart()
    petalCnvs.ctx.clearRect(0, 0, petalCnvs.width, petalCnvs.height)
}

function randomize() {
    randomizePetal(randomOpts, {}, petal)
    buildPetalControls(petal, f)
    clearCpsCanvas()
    restart()
}

function onTypeChange(val: 'star' | 'flower' | 'petal', setLength = true) {
    if (val === 'star' || val === 'flower') {
        petalBaseCtrls.forEach((c) => c.hide())
        petalPointsCtrls.forEach((c) => c.show())
    } else {
        petalPointsCtrls.forEach((c) => c.hide())
        petalBaseCtrls.forEach((c) => c.show())
    }

    if (val === 'flower') {
        if (setLength) petal.length = O.height * 0.4
        randomOpts.lengthMin = O.height * 0.35
        randomOpts.lengthMax = O.height * 0.45
    } else {
        if (setLength) petal.length = O.height * 0.8
        randomOpts.lengthMin = O.height * 0.7
        randomOpts.lengthMax = O.height * 0.95
    }

    if (val === 'star') {
        randomOpts.shiftEndMax = 0
        randomOpts.shiftEndMin = 0
    }
    gui.updateAll()
    restart()
}

const gui = new GuiExtra()

const f1 = gui.addFolder('drawing')
f1.add(O, 'type', ['star', 'flower', 'petal']).onChange(onTypeChange)
const petalBaseCtrls = [
    f1.add(O, 'rotate', 0, 360, 1),
    f1.add(O, 'showBaseControlPoints'),
    f1.add(O, 'showMovingControlPoints').onChange(clearCpsCanvas),
]
const petalPointsCtrls = [f1.add(O, 'points', 1, 20, 1)]
f1.add(loop, 'fps', 1, 600, 1)
onTypeChange(O.type)

const f = gui.addFolder('petal')

function buildPetalControls(petal: Petal, f: GuiExtra) {
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
buildPetalControls(petal, f)
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

gui.add(O, 'preset', presets).onChange((preset?: Preset) => {
    if (!preset) return
    Object.assign(petal, { ...petalDefaults, ...preset.petal })

    O.type = preset.type
    if (preset.type !== 'petal') {
        O.points = preset.points || 6
    }
    if (preset.fps) loop.fps = preset.fps
    onTypeChange(preset.type, false)
    buildPetalControls(petal, f)
    gui.updateAll()
    restart()
})

gui.add(petal, 'count').disable().listen()
gui.add({ restart }, 'restart')
