import GUI from 'lil-gui'
import { getPaletteVariants, type PaletteVariant } from 'mish-bainrow'
import p5 from 'p5'
import { random } from 'utils'
import { FlowField } from './flowfield'
import { Timer } from './timer'
import { flowFieldDrawingGui } from './presets-and-gui'
// import GUI from 'lil-gui'

// speed: 1
// lerpVal: 0.26
// bgAlpha: 20
// lineAlpha: 174
// timeScale: 0.2,
// turns: 4

export class Drawing {
    _palettes = getPaletteVariants({
        bgColor: '#000',
        isolateColors: true,
        minColors: 3,
        minContrastBg: 5,
        excludePalettes: ['harimau'],
    })
    _palette!: PaletteVariant
    _lerpColors!: [p5.Color, number][]

    field: FlowField
    timer: Timer
    p: p5
    gui?: GUI

    constructor(p: p5) {
        this.p = p
        this.field = new FlowField(p)
        this.timer = new Timer()
        this.palette = random(this._palettes)
        this.drawBg()
    }

    drawBg() {
        const { p } = this
        p.fill(this._palette.bg)
        p.noStroke()
        p.rect(0, 0, p.width, p.height)
    }

    set palette(palette: PaletteVariant | string) {
        if (typeof palette === 'string') {
            palette = this._palettes.find((p) => p.name === palette) || this._palette
        }
        this._palette = palette
        this._lerpColors = this._palette.colors.map((c, i) => {
            return [this.p.color(c), i / (this._palette.colors.length - 1)] as [p5.Color, number]
        })
    }

    get palette(): PaletteVariant {
        return this._palette
    }

    restart() {
        this.field.resetParticles(this.timer.timeVal)
        this.timer.setFromNow()
        this.drawBg()
    }

    restartWithNewColors() {
        this.palette = random(this._palettes)
        this.gui?.controllersRecursive().forEach((c) => c.updateDisplay())
        this.restart()
    }

    draw() {
        const { p } = this
        this.timer.update()

        p.push()
        p.fill(10, this.field.bgAlpha)
        p.noStroke()
        p.rect(0, 0, p.width, p.height)

        this.field.particles.forEach((particle) => {
            particle.update(this.timer.timeVal)
            particle.draw(this._lerpColors)
            particle.checkEdges(this.timer.timeVal)
        })

        p.pop()
    }

    buildGui() {
        this.gui = flowFieldDrawingGui(this)
    }

    save() {
        const { field, timer } = this
        let name = `flowfield-${this._palette.name}-scale${field.noiseScale}-speed${field.speed}-lerp${field.lerpVal}-turns${field.turns}-bgAlpha${field.bgAlpha}-lineAlpha${field.lineAlpha}-count${field.count}-timeJump${timer.timeJump}-timeJumpInterval${timer.timeJumpInterval}`
        this.p.saveCanvas(name, 'png')
    }
}

new p5((p: p5) => {
    let drawing: Drawing

    p.setup = function () {
        let m = Math.min(window.innerWidth, window.innerHeight) * 0.9
        let renderer = p.createCanvas(m, m)
        renderer.addClass('sketch sketch--centered')
        p.frameRate(60)
        p.strokeCap(p.SQUARE)

        drawing = new Drawing(p)
        drawing.buildGui()
    }

    p.draw = function () {
        drawing.draw()
    }

    p.mouseClicked = function (e) {
        if (!e || !(e.target instanceof HTMLCanvasElement)) return
        drawing.restartWithNewColors()
    }
})
