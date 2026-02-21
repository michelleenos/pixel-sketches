import { getPaletteVariants, type PaletteVariant } from 'mish-bainrow'
import p5 from 'p5'

const palettes = getPaletteVariants({
    minColors: 3,
    isolateColors: true,
    useStroke: true,
})

let palette: PaletteVariant

const PARAMS = {
    // noiseTranslate:
}

new p5((p: p5) => {
    p.setup = function () {
        p.createCanvas(window.innerWidth, window.innerHeight)
        p.background(0)
        p.noLoop()
    }

    p.draw = function () {
        console.log('draw')
        p.angleMode(p.DEGREES)
        let squareSize = 100
        let xPos = squareSize * -0.5

        p.stroke('#000')
        p.strokeWeight(2)

        while (xPos < p.width) {
            let yPos = squareSize * -0.5
            while (yPos < p.height) {
                p.push()
                p.translate(xPos, yPos)
                p.fill(p.random(100, 200), p.random(0, 100), p.random(100, 255))
                p.rect(0, 0, squareSize)
                p.pop()

                yPos += squareSize
            }
            xPos += squareSize
        }
    }
})
