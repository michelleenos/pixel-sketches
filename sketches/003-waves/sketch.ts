import { GuiExtra } from 'lilgui-extra'
import p5 from 'p5'
import { map, random } from 'utils'

const defaults = {
    style: 1,
    rFreq: 6,
    rBase: 5,
    aScale: 1,
    aOff: 0,
    hOff: 0,
    hScale: 1,
    w: 400,
    h: 480,
    pow: 3,
    xSteps: 20,
    ySteps: 40,
}

type WaveParams = typeof defaults

const O: WaveParams = { ...defaults }

const presets: Partial<WaveParams>[] = [
    { style: 1, rFreq: 2.5, aScale: 0.5, aOff: 0.25, ySteps: 40, xSteps: 20 },
    { style: 1, rFreq: 3, aScale: 1, aOff: 0, ySteps: 70, xSteps: 20 },
    { style: 2, hOff: 0, rFreq: 2, aScale: 1, xSteps: 25, ySteps: 50 },
    { style: 2, hOff: 0.75, hScale: 1.7, rFreq: 5.25, ySteps: 55 },
    { style: 2, rFreq: 4.4, rBase: 7, aScale: 1.16, aOff: 1, hOff: 0.97, hScale: 1.6, ySteps: 75 },
    // prettier-ignore
    { style: 2, h: 500, ySteps: 67, rFreq: 3.75, rBase: 8, aScale: 0.8, aOff: 0.92, hOff: 0.88, hScale: 1.5 },
    // prettier-ignore
    { style: 2, w: 500, ySteps: 70, rFreq: 2.09, rBase: 10, aScale: 0.7, aOff: 1.11, hOff: 1.24, hScale: 1.2 },
]

new p5((p: p5) => {
    const gui = new GuiExtra()
    gui.add(O, 'style', [1, 2]).onChange(() => setStyleCtrls())
    gui.add(O, 'h', 10, 900, 1)
    gui.add(O, 'w', 50, 500, 1)
    gui.add(O, 'xSteps', 5, 50, 1).name('steps x')
    gui.add(O, 'ySteps', 5, 100, 1).name('steps y')
    gui.add(O, 'rFreq', 0, 15, 0.01)
    gui.add(O, 'rBase', 3, 20, 1)
    gui.add(O, 'aOff', -2, 2, 0.01)
    gui.add(O, 'aScale', 0.5, 5, 0.1)

    const ctrls2 = [gui.add(O, 'hOff', 0, 2, 0.01), gui.add(O, 'hScale', 0.5, 5, 0.1)]

    const presetCtrl = gui
        .add({ preset: '' }, 'preset', ['', 'default', ...Object.keys(presets)])
        .onChange((val: number | string) => {
            if (val === '') return
            let preset = val === 'default' ? defaults : presets[+val]
            if (!preset) return
            Object.assign(O, { ...defaults, ...preset })
            gui.updateAll()
            setStyleCtrls()
            p.redraw()
        })
    gui.onChange(() => p.redraw())

    const setStyleCtrls = () => {
        O.style === 1 ? ctrls2.forEach((c) => c.disable()) : ctrls2.forEach((c) => c.enable())
    }

    setStyleCtrls()

    p.setup = function () {
        p.createCanvas(window.innerWidth, window.innerHeight)
        p.noLoop()
    }

    p.draw = function () {
        p.push()
        p.background(230)
        p.stroke(0)
        p.strokeWeight(0.5)
        p.noFill()
        p.translate(p.width / 2, p.height / 2)

        drawings[O.style as 1 | 2]()
        p.pop()
    }

    p.mouseClicked = function (e) {
        if (!e || !e.target || !(e.target instanceof HTMLCanvasElement)) return
        Object.assign(O, defaults)
        O.style = random([1, 2])
        O.rFreq = random(3, 8)
        if (random() < 0.5) {
            O.aScale = random(0.5, 2)
        } else {
            O.aScale = 1
        }
        if (O.style === 2) {
            if (random() < 0.5) {
                O.hOff = random(0.02, 1.2)
                O.hScale = random(1, 1.3)
            } else {
                O.hOff = 0
                O.hScale = 1
            }
        }
        O.aOff = O.style === 2 ? random([1, 0]) : 0
        O.ySteps = Math.floor(random(40, 80))
        O.xSteps = 20
        presetCtrl.setValue('')
        gui.updateAll()
        setStyleCtrls()

        p.redraw()
    }

    p.windowResized = function () {
        p.resizeCanvas(window.innerWidth, window.innerHeight)
        p.clear()
        p.redraw()
    }

    const drawings = {
        shared: function () {
            let xSteps = O.xSteps
            let xStep = Math.floor(O.w / xSteps)
            let width = xStep * xSteps
            let aStep = 2 / O.ySteps
            return { xStep, aStep, width, xSteps }
        },
        1: function () {
            let { xStep, xSteps, aStep, width } = this.shared()

            for (let x = -(width / 2), xi = 1; x <= width / 2; x += xStep, xi++) {
                let ybase = -p.pow(xi / (xSteps + 1), O.pow) * (O.h / 2)
                // let ybase = (xv + O.hOff) * (xv - O.hOff) * xv
                // ybase *= O.h / 2

                for (let ai = -1; ai <= 1; ai += aStep) {
                    let angle = ai * Math.PI * 0.5
                    let y = ybase * p.sin(angle * O.aScale + O.aOff * Math.PI)

                    let radius = map(p.cos(angle * O.rFreq), -1, 1, 0, O.rBase)

                    p.circle(x, y, radius * 2)
                }
            }
        },
        2: function () {
            let { xStep, xSteps, aStep, width } = this.shared()

            for (let x = -(width / 2), xi = 0; x <= width / 2; x += xStep, xi++) {
                // let ybase = p.pow(xi / (total + 1), O.pow) * (O.h / 2)
                let xv = (xi / xSteps - 0.5) * 2
                // let ybase = (p.pow(xv, O.pow) * O.h) / 2
                let ybase = (xv + O.hOff) * (xv - O.hOff) * xv
                ybase *= (O.h / 2) * O.hScale

                for (let ai = -1; ai <= 1; ai += aStep) {
                    let angle = ai * Math.PI * 0.5
                    let y = ybase * p.cos(angle * O.aScale + O.aOff * Math.PI)
                    let radius = map(p.cos(angle * O.rFreq), -1, 1, 0, O.rBase)

                    p.circle(x, y, radius * 2)
                }
            }
        },

        3: function () {
            let { xStep, xSteps, aStep, width } = this.shared()

            for (let x = -(width / 2), xi = 0; x <= width / 2; x += xStep, xi++) {
                let xv = (xi / xSteps - 0.5) * 2
                let ybase = (xv + O.hOff) * (xv - O.hOff) * xv
                ybase *= (O.h / 2) * O.hScale
                for (let ai = -1; ai <= 1; ai += aStep) {
                    let angle = ai * Math.PI * 0.5
                    let y = ybase * p.cos(angle * O.aScale + O.aOff * Math.PI)
                    let radius = map(p.cos(angle * O.rFreq), -1, 1, 0, O.rBase)
                    p.circle(x, y, radius * 2)
                }
            }
        },
    }
})
