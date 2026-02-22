import { getPaletteVariants, type PaletteVariant } from 'mish-bainrow'
import p5 from 'p5'
import GUI from 'lil-gui'
import { random } from 'utils'

const palettes = getPaletteVariants({
    minColors: 3,
    isolateColors: true,
    useStroke: true,
})

let palette: PaletteVariant

const O = {
    noiseScale: random(0.002, 0.004),
    squareSize: Math.floor(random(40, 100)),
    minStrips: 4,
    maxStrips: 10,
    strokeWidth: 2,
    noiseOctaves: 4,
    noiseFalloff: 0.5,
    clampNoise: 0.25,
    animate: false,
    speed: 1,
    palette: Math.floor(random(palettes.length)),
}

new p5((p: p5) => {
    const getGui = () => {
        const gui = new GUI()
        gui.add(O, 'squareSize', 30, 500, 1)
        gui.add(O, 'noiseScale', 0.0005, 0.01, 0.0001).decimals(4)
        gui.add(O, 'minStrips', 1, 16, 1)
        gui.add(O, 'maxStrips', 1, 15, 1)
        gui.add(O, 'clampNoise', 0, 1, 0.01).decimals(2)
        gui.add(O, 'strokeWidth', 0, 10, 0.5).decimals(1)
        gui.add(O, 'animate').onChange((val: boolean) => {
            if (val) {
                p.loop()
                lastTime = p.millis()
            } else {
                p.noLoop()
            }
        })
        gui.add(O, 'speed', 0, 5, 0.1)
        gui.add(O, 'palette', 0, palettes.length - 1, 1).onChange((i: number) => {
            palette = palettes[i]
        })
        gui.add({ randomize }, 'randomize')
        gui.add({ newSeed }, 'newSeed')
        gui.onChange(() => {
            if (!O.animate) {
                lastTime = p.millis()
                p.redraw()
            }
        })

        return gui
    }

    let lastTime = 0
    let accTime = 0
    let randomSeed = 1

    const gui = getGui()
    function strips(squareSize: number, pieces: number, chance: number) {
        let wid = squareSize / pieces

        for (let i = 0; i < pieces; i++) {
            let fill1 = palette.colors[i % palette.colors.length]
            let fill2 = palette.colors[(i + 1) % palette.colors.length]

            if (p.random() < chance) {
                p.fill(fill1)
                p.rect(wid * i, wid * i, squareSize - wid * i, wid)
            }
            if (p.random() < chance) {
                p.fill(fill2)
                p.rect(wid * i, wid * i, wid, squareSize - wid * i)
            }
        }
    }

    function randomize() {
        O.squareSize = Math.floor(random(40, 100))
        O.noiseScale = random(0.002, 0.004)
        O.clampNoise = random(0.15, 0.4)
        O.palette = Math.floor(random(palettes.length))
        O.minStrips = 4
        O.maxStrips = 10
        newSeed()
        gui.controllersRecursive().forEach((c) => c.updateDisplay())
    }

    function newSeed() {
        p.randomSeed(randomSeed++)
        p.noiseSeed(p.random(9999))
    }

    p.setup = function () {
        p.createCanvas(window.innerWidth, window.innerHeight)
        p.angleMode(p.DEGREES)
        p.noLoop()
    }

    p.draw = function () {
        let elapsed = p.millis() - lastTime
        accTime += elapsed
        lastTime = p.millis()

        p.randomSeed(randomSeed)
        palette = palettes[O.palette]

        const squareSize = O.squareSize
        const sqHalf = squareSize * 0.5

        p.noiseDetail(O.noiseOctaves, O.noiseFalloff)

        p.background(palette.bg)
        p.stroke(palette.stroke || '#000')
        p.strokeWeight(O.strokeWidth)

        let xPos = -sqHalf
        while (xPos < p.width) {
            let yPos = -sqHalf
            while (yPos < p.height) {
                p.push()
                p.translate(xPos, yPos)

                const count = Math.floor(p.random(O.minStrips, O.maxStrips + 1))
                const rotate = p.random([0, 90]),
                    scaleX = p.random([1, -1]),
                    scaleY = p.random([1, -1])

                p.translate(sqHalf, sqHalf)
                p.rotate(rotate)
                p.scale(scaleX, scaleY)
                p.translate(-sqHalf, -sqHalf)

                const noiseVal = p.noise(
                    xPos * O.noiseScale,
                    yPos * O.noiseScale,
                    accTime * O.speed * 0.001,
                )
                let edges = (1 - O.clampNoise) / 2
                const chance = p.constrain(p.map(noiseVal, edges, 1 - edges, 0, 1), 0, 1)

                strips(squareSize, count, chance)
                p.pop()

                yPos += squareSize
            }
            xPos += squareSize
        }
    }

    p.mouseClicked = function (e: MouseEvent) {
        if (!(e.target instanceof HTMLCanvasElement)) return
        O.palette = Math.floor(random(palettes.length))
        p.redraw()
    }

    p.windowResized = function () {
        p.resizeCanvas(window.innerWidth, window.innerHeight)
        lastTime = p.millis()
        p.redraw()
    }
})
