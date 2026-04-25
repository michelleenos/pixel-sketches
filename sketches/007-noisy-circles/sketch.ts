import p5 from 'p5'
import GUI from 'lil-gui'

const PARAMS = {
    precision: 49,
    step: 100,
    circlesDiff: 0.4,
    noiseFreq: 0.8,
    noiseScale: 0.54,
    radiusToStep: 0.4,
    noiseMethod: 0,
}

new p5((p: p5) => {
    let palette = ['#f398c3', '#cf3895', '#a0d28d', '#06b4b0', '#fed000', '#FF8552']
    let grads: CanvasGradient[] = []
    let randomVals: number[] = []
    let m: number
    let noiseSeed = p.random()

    function newSeed() {
        grads = []
        noiseSeed++
        p.noiseSeed(noiseSeed)
        setVars()
        p.redraw()
    }

    function setVars() {
        const { step } = PARAMS
        m = p.min(p.width, p.height) * 0.9
        let count = p.floor(m / step)
        m = count * step
        let i = 0
        grads = []

        while (grads.length < count * count) {
            let gx = p.random(step * -0.25, step * 0.25)
            let gy = p.random(step * -0.25, step * 0.25)
            let grad = (p.drawingContext as CanvasRenderingContext2D).createRadialGradient(
                gx,
                gy,
                0,
                gx,
                gy,
                step,
            )
            p.shuffle(palette, true)
            let [c1, c2] = [palette[0], palette[1]]

            randomVals[i] = p.random(1, 50)
            grad.addColorStop(0, c1)
            grad.addColorStop(1, c2)
            grads.push(grad)
            i++
        }
    }

    function circle(x: number, y: number, r: number, noiseZ: number) {
        let noiseFreq = PARAMS.noiseFreq / r
        let noiseScale = r * PARAMS.noiseScale
        p.push()
        p.translate(x, y)
        p.rotate(p.noise(y + PARAMS.step, x - y) * p.TWO_PI)
        p.beginShape()

        let angleStep = p.TWO_PI / PARAMS.precision
        for (let i = -1; i <= PARAMS.precision + 1; i++) {
            let angle = angleStep * i
            let xx = p.cos(angle) * r
            let yy = p.sin(angle) * r

            if (PARAMS.noiseMethod === 0) {
                let noiseVal = p.map(
                    p.noise(noiseFreq * xx, noiseFreq * yy, noiseZ),
                    0,
                    1,
                    -noiseScale,
                    noiseScale,
                )
                xx += noiseVal
                yy += noiseVal
            } else {
                let noiseVal = p.map(
                    p.noise(noiseFreq * xx, noiseFreq * yy, noiseZ),
                    0,
                    1,
                    -p.TWO_PI,
                    p.TWO_PI,
                )
                xx += p.cos(noiseVal) * noiseScale
                yy += p.sin(noiseVal) * noiseScale
            }
            p.splineVertex(xx, yy)
        }

        p.endShape()
        p.pop()
    }

    p.setup = function () {
        p.createCanvas(window.innerWidth, window.innerHeight)
        setVars()
        p.noLoop()

        const gui = new GUI()
        gui.add(PARAMS, 'precision', 3, 180, 1)
        gui.add(PARAMS, 'step', 10, 300, 1)
        gui.add(PARAMS, 'circlesDiff', 0, 5, 0.01)
        gui.add(PARAMS, 'noiseFreq', 0, 5, 0.01)
        gui.add(PARAMS, 'noiseScale', 0, 2, 0.01)
        gui.add(PARAMS, 'radiusToStep', 0.01, 0.5, 0.01)
        // gui.add(PARAMS, 'noiseMethod', [0, 1]).onChange((val: number) => {
        //     PARAMS.noiseScale = val === 0 ? 0.54 : 0.15
        //     gui.controllersRecursive().forEach((c) => c.updateDisplay())
        // })
        gui.add({ newSeed }, 'newSeed').name('new seed (spacebar)')
        gui.onChange(() => {
            setVars()
            p.redraw()
        })
    }

    p.draw = function () {
        const { step, radiusToStep } = PARAMS
        p.background(10)
        let size = m
        let radius = step * radiusToStep

        p.push()
        p.translate((p.width - size) / 2 + step / 2, (p.height - size) / 2 + step / 2)
        p.noStroke()
        let i = 0
        for (let x = 0; x < size; x += step) {
            for (let y = 0; y < size; y += step) {
                p.push()
                ;(p.drawingContext as CanvasRenderingContext2D).fillStyle = grads[i]
                let z = randomVals[i]
                circle(x, y, radius, z)
                p.noFill()
                p.stroke(255)
                p.strokeWeight(2)
                circle(x, y, radius, z + PARAMS.circlesDiff)
                circle(x, y, radius, z + PARAMS.circlesDiff * 2)
                p.pop()
                i++
            }
        }
        p.pop()
    }

    p.windowResized = function () {
        p.resizeCanvas(window.innerWidth, window.innerHeight)
        setVars()
        p.redraw()
    }

    p.keyPressed = function () {
        if (p.key === ' ') {
            newSeed()
        }
    }
})
