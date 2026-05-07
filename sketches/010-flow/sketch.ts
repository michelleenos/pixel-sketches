import p5 from 'p5'
import { lerp } from 'utils'
import { FlowField } from './flow-field'

const PARAMS = {
    res: 30,
    noiseScale: 3,
    noiseFreq: 0.05,
}

new p5((p: p5) => {
    let field: p5.Vector[][] = []
    let particles: p5.Vector[] = []
    let m: number
    let cellSize: number

    function generateField() {
        cellSize = m / PARAMS.res

        let ms = p.millis()
        field = []
        for (let xi = 0; xi < PARAMS.res; xi++) {
            let row: p5.Vector[] = []
            for (let yi = 0; yi < PARAMS.res; yi++) {
                let n = p.noise(xi * PARAMS.noiseFreq, yi * PARAMS.noiseFreq, ms / 1000)
                n *= PARAMS.noiseScale * Math.PI * 2
                let v = p.createVector(Math.cos(n), Math.sin(n))

                // let n2 = p.noise(v.x * 0.25, v.y * 0.25)
                // n2 *= PARAMS.noiseScale * Math.PI * 2
                // let v2 = p.createVector(Math.cos(n2), Math.sin(n2))

                row.push(v)
            }
            field.push(row)
        }
    }

    function smoothstep(t: number) {
        return t * t * (3 - 2 * t)
    }
    function interpolateGridValue(x: number, y: number) {
        let gridX = x / cellSize
        let gridY = y / cellSize

        let x0 = Math.floor(gridX)
        let x1 = Math.min(x0 + 1, PARAMS.res - 1)
        let y0 = Math.floor(gridY)
        let y1 = Math.min(y0 + 1, PARAMS.res - 1)

        let dx = gridX - x0
        let dy = gridY - y0

        let tl = field[x0][y0]
        let tr = field[x1][y0]
        let bl = field[x0][y1]
        let br = field[x1][y1]

        let topX = lerp(tl.x, tr.x, dx)
        let topY = lerp(tl.y, tr.y, dx)
        let botX = lerp(bl.x, br.x, dx)
        let botY = lerp(bl.y, br.y, dx)
        let midX = lerp(topX, botX, dy)
        let midY = lerp(topY, botY, dy)
        return Math.atan2(midY, midX)
        // let top = lerp(tl, tr, dx)
        // let bottom = lerp(bl, br, dx)
        // let mid = lerp(top, bottom, dy)

        // return mid
    }

    // function drawField() {
    //     for (let xi = 0; xi < PARAMS.res; xi++) {
    //         for (let yi = 0; yi < PARAMS.res; yi++) {
    //             // let index = (xi % PARAMS.res) + yi * PARAMS.res
    //             let angle = field[xi][yi]
    //             let x = cellSize * xi
    //             let y = cellSize * yi

    //             p.stroke(200)
    //             p.strokeWeight(1)
    //             p.line(x, y, x + Math.cos(angle) * 15, y + Math.sin(angle) * 15)

    //             p.stroke(200, 100, 0)
    //             p.strokeWeight(5)
    //             p.point(x, y)
    //         }
    //     }
    // }

    p.setup = function () {
        m = Math.min(window.innerWidth, window.innerHeight) * 0.9
        let renderer = p.createCanvas(window.innerWidth, window.innerHeight)
        renderer.addClass('sketch sketch--centered')
        p.frameRate(60)
        p.strokeCap(p.SQUARE)

        for (let i = 0; i < 1000; i++) {
            particles.push(p.createVector(p.random(m), p.random(m)))
        }

        generateField()
    }

    p.draw = function () {
        generateField()
        // p.background(0)
        p.push()
        p.translate((p.width - m) / 2, (p.height - m) / 2)

        // p.fill(255, 10)
        // p.rect(0, 0, m, m)

        // drawField()
        particles.forEach((particle) => {
            if (particle.x >= m || particle.x < 0 || particle.y >= m || particle.y < 0) {
                particle.set(p.random(m), p.random(m))
            }
            let angle = interpolateGridValue(particle.x, particle.y)
            let va = p.createVector(-1, 1).setMag(5).setHeading(angle)
            let prevPos = particle.copy()
            particle.add(va)
            p.stroke(255, 10)
            // p.fill(255)
            p.line(prevPos.x, prevPos.y, particle.x, particle.y)
            // p.circle(particle.x, particle.y, 5)
        })

        p.pop()
    }

    p.mouseClicked = function (e) {
        if (!e || !(e.target instanceof HTMLCanvasElement)) return
    }
})
