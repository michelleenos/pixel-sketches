import { getPaletteVariants, type PaletteVariant } from 'mish-bainrow'
import p5 from 'p5'
import { random } from '../../packages/utils'
import { HexelsUtils, type TrisOpts } from './hexels-utils'
import GUI, { Controller } from 'lil-gui'

const palettes = getPaletteVariants({
    includePalettes: ['valen', 'glowFish', 'market', 'neopolito', 'mondri'],
    minColors: 4,
    isolateColors: true,
    useStroke: false,
    minContrastBg: 2,
    bgShade: {
        type: 'edge',
        edge: 20,
    },
})

const O = {
    grid: 3,
    version: 2 as number | 'all',
    sides: 6,
    palette: Math.floor(random(palettes.length)),
}

new p5((p: p5) => {
    let palette: PaletteVariant
    let h: HexelsUtils
    let pts: p5.Vector[] = []
    let size: number
    let step: number
    const gui = new GUI()
    gui.add(O, 'grid', 1, 8, 1)
    gui.add(O, 'sides', 3, 12, 1)
    const palControl = gui.add(O, 'palette', 0, palettes.length - 1, 1)
    gui.add(O, 'version', [1, 2, 'all'])
    gui.onChange(() => p.redraw())

    function setupDrawing() {
        palette = palettes[O.palette]

        const m = p.min(p.width, p.height)
        size = m * 0.9
        step = size / O.grid
        const shapeSize = step * 0.25

        pts = []

        const angle = (Math.PI * 2) / O.sides
        for (let i = 0; i < O.sides; i++) {
            const a = angle * i
            pts.push(p.createVector(shapeSize * p.cos(a), shapeSize * p.sin(a)))
        }
    }

    p.setup = function () {
        p.createCanvas(window.innerWidth, window.innerHeight)
        p.noLoop()
        setupDrawing()
        h = new HexelsUtils(p, pts, palette.colors)
    }

    p.draw = function () {
        setupDrawing()

        h.colors = palette.colors
        h.pts = pts

        p.background(palette.bg)
        p.push()
        p.translate((p.width - size) / 2, (p.height - size) / 2)

        for (let xi = 0; xi < O.grid; xi += 1) {
            for (let yi = 0; yi < O.grid; yi += 1) {
                let x = (xi + 0.5) * step
                let y = (yi + 0.5) * step
                p.push()
                p.translate(x, y)
                p.shuffle(palette.colors, true)
                if (O.version === 1) {
                    design(pts)
                } else if (O.version === 2) {
                    designMushedTogether(pts)
                } else if (O.version === 'all') {
                    p.random() < 0.5 ? design(pts) : designMushedTogether(pts)
                }
                p.pop()
            }
        }
        p.pop()
    }

    p.mouseClicked = function (e?: Event) {
        if (!e?.target || !(e.target instanceof HTMLCanvasElement)) return
        O.palette = Math.floor(random(0, palettes.length))
        palControl.updateDisplay()
        p.redraw()
    }

    p.windowResized = function () {
        p.resizeCanvas(window.innerWidth, window.innerHeight)
        p.redraw()
    }

    function design(pts: p5.Vector[], style = -1) {
        let indexes = pts.map((_, i) => i)
        let len = pts.length
        p.shuffle(indexes, true)

        if (style < 0) {
            style = p.random([1, 2, 3])
        }

        switch (style) {
            case 1:
                h.fill(0).shape(pts, { scale: [0.8, 1.2] }, { dist: [0, 0.2] })

                let ind = p.floor(p.random(len))
                h.fill(1).shape(
                    { rotate: p.random() > 0.5, scale: [0.4, 0.6] },
                    { moveToIndex: ind, dist: [0.4, 1] },
                )

                h.stroke(2).shape(pts, { rotate: true }, { moveToIndex: (ind + 1) % len })

                let triScaleBase = p.random(0.3, 0.75)
                h.trisRound(
                    {
                        scaleBase: triScaleBase,
                        colorFn: () => (p.random() < 0.5 ? h.fill(3) : h.stroke(3)),
                    },
                    {
                        moveToIndex: (ind + 3) % len,
                        dist: triScaleBase > 0.65 ? [0.6, 0.7] : [0.7, 0.9],
                    },
                )

                h.stroke(1, 3).lines({ num: 2 })
                break
            case 2:
                h.strokeFill(0, 1, 5).trisRound({
                    translate: -0.4,
                    scaleBase: 1.5,
                    num: p.random([1, 2]),
                })

                h.stroke(2).shape({ scale: [0.8, 1.2] })

                h.fill(3).circles(
                    {
                        translate: p.random(0.6, 1.2),
                        radius: () => p.random(10, 25),
                        num: p.random([2, 3, 4, 5]),
                    },
                    { dist: [0.2, 0.4] },
                )
                break
            case 3:
                h.fill(0).trisRound({
                    num: p.random([4, 5, 6]),
                    translate: 0.3,
                    scaleBase: 0.8,
                })

                h.stroke(1).shape({ scale: [0.8, 1.3] }, { dist: [0.3, 0.6] })

                if (p.random() < 0.8) {
                    h.stroke(2, 6).lines({}, { dist: [0.2, 0.8] })
                }

                h.stroke(3).lines()
                break
            default:
                break
        }
    }

    function designMushedTogether(pts: p5.Vector[]) {
        let indexes = pts.map((_, i) => i)

        let steps: string[] = []
        steps.push(p.random(['tris', 'hex', 'bigTris']))

        p.shuffle(indexes, true)

        if (steps[0] === 'hex') {
            h.fill(1).shape({ scale: 1 }, { dist: [0, 0.2] })
            h.fill(0).shape({ rotate: true, scale: [0.5, 0.8] }, { moveToIndex: indexes[0] })
        } else if (steps[0] === 'bigTris') {
            h.strokeFill(1, 0, 3).trisRound({
                num: p.random([1, 2]),
                translate: -0.4,
                scaleBase: 1.5,
                scaleAlt: 1.8,
                scaleAltChance: 0.5,
            })
        } else if (steps[0] === 'tris') {
            h.fill(0).trisRound({
                num: p.random([5, 6]),
                translate: 0.3,
                scaleBase: 0.8,
                scaleAlt: 0.9,
                scaleAltChance: 0.6,
            })
        }

        if (steps[0] === 'bigTris' || p.random() < 0.5) {
            steps.push('shapeOutline')
            h.stroke(2).shape(pts, { rotate: true }, { dist: [0.4, 0.7] })
        }

        if (steps.length < 2 || p.random() < 0.5) {
            steps.push('thickLines')
            h.stroke(3, 7).lines({ num: p.random([3, 4, 5]) }, { dist: [0.2, 0.8] })
        }

        if (p.random() < 0.5) {
            steps.push('thinLines')
            h.stroke(2).lines()
        }

        if (p.random() < 0.5) {
            steps.push('trisRound')
            let trisOpts: TrisOpts = {
                scaleBase: p.random(0.4, 0.8),
                num: p.random([1, 2, 3, 4]),
            }
            if (steps[0] === 'hex') {
                trisOpts.colorFn = () => h.fillOrStroke(2)
            } else if (steps[0] === 'bigTris') {
                h.fill(1)
                trisOpts.scaleBase = p.random(0.25, 0.6)
            } else {
                h.fill(1)
                trisOpts.scaleBase = p.random(0.25, 0.35)
            }

            h.trisRound(trisOpts, {
                moveToIndex: indexes[2],
                dist: [0.4, 1],
            })
        }

        if (steps.length < 5 && p.random() < 0.5) {
            steps.push('circles')
            h.fill(2).circles({
                radius: p.random(12, 18),
                num: p.random([2, 3, 4]),
                translate: p.random(0.7, 1.3),
            })
        }

        if (steps.length < 3 || (steps.length === 3 && p.random() < 0.5)) {
            steps.push('shape')
            h.strokeFill(2, 1, 3).shape(
                {
                    scale: [0.2, 0.6],
                },
                { dist: [0.3, 0.7] },
            )
        }

        // p.fill(0).noStroke().text(steps.join('\n '), -100, 0, 100)
    }
})
