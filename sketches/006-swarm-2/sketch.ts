import { clamp, Cnvs, lerp, Loop, map, MouseTracker, random, Vec2 } from 'utils'
import { getAllPairs, getPaletteVariants } from 'mish-bainrow'
import { swarmKeys } from './swarm-keys'
import chroma from 'chroma-js'
import { GuiExtra } from '../../packages/lilgui-extra'

// const pairs = getAllPairs()
// let colors = random(pairs)
let colorOpts: [string, string][] = [
    ['#5F0F40', '#F2832E'],
    ['#fff8e8', '#d52941'],
    ['#fcd581', '#c41144'],
    ['#320d6d', '#ff92bc'],
    ['#454a96', '#65f49e'],
    ['#ffedeb', '#700353'],
    ['#c4f5ed', '#7244ab'],
]

let colors: [string, string]
let colorScale: chroma.Scale
let textColor: string
// let colorScale = chroma.scale(colors).mode('oklch')
// colorScale.padding([0.1, 0])
const cnvs = new Cnvs({ autoResize: true })
const mouse = new MouseTracker(cnvs.canvas)
const P = {
    massMin: 6,
    massMax: 9,
    damping: 0.985,
    bubbleDistMin: 185,
    bubbleSize: 300,
    bubbleDistPow: 1.7,
    maxVel: 15,
    mouseMass: 100,
    mouseSize: 150,
    mouseDistMin: 50,
    mouseDistMax: 240,
    mouseDistPow: 2,
    useMouse: true,
    colorMode: 'hsl',
    offscreen: 0,
    colorScalePadStart: 0.15,
    colorScalePadEnd: 0,
    clear: () => {
        while (particles.length > 0) {
            particles.pop()
        }
    },
    newColors: () => {
        colors = random(colorOpts)
        let contrastBgWhite = chroma.contrast(colors[0], '#ffffff')
        let contrastBgBlack = chroma.contrast(colors[0], '#000000')
        textColor = contrastBgWhite > contrastBgBlack ? '#ffffff' : '#000000'
        colorScale = chroma.scale(colors).mode(P.colorMode as chroma.InterpolationMode)
        colorScale.padding([P.colorScalePadStart, P.colorScalePadEnd])
    },
}
P.newColors()

export class Particle extends Vec2 {
    vel = new Vec2()
    acc = new Vec2()
    massVal: number
    mouseAlignment = 0

    constructor(x = 0, y = 0, massVal?: number) {
        super(x, y)
        this.massVal = massVal ?? random(0, 1)
    }

    get mass() {
        return map(this.massVal, 0, 1, P.massMin, P.massMax)
    }

    update(deltaRatio: number) {
        this.vel.mult(Math.pow(P.damping, deltaRatio))
        this.vel.add(this.acc.mult(deltaRatio).div(this.mass))
        this.vel.limit(P.maxVel)
        this.acc.mult(0)

        this.add(this.vel.copy().mult(deltaRatio))
    }

    draw(ctx: CanvasRenderingContext2D) {
        const radius = map(this.mass, P.massMin, P.massMax, 5, 25)
        const speed = this.vel.mag()

        // const color = colorScale(clamp(headingScale, 0, 1)).css()
        const color = colorScale(clamp(speed / 10, 0, 1)).css()
        const gradient = ctx.createRadialGradient(
            this.x - radius * 0.75,
            this.y - radius * 0.75,
            0,
            this.x,
            this.y,
            radius * 1.5,
        )

        gradient.addColorStop(0, colors[1])
        gradient.addColorStop(1, color)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2)
        ctx.fill()
    }
}

let particles: Particle[] = []
const spawnInterval = 1000 / 60
let lastParticleSpawnAt = 0

const loop = new Loop(draw)

function mouseAttract(particle: Particle, deltaRatio: number) {
    let diffX = mouse.pos.x - particle.x
    let diffY = mouse.pos.y - particle.y
    let magSq = diffX * diffX + diffY * diffY
    let dist = Math.max(Math.sqrt(magSq), P.mouseDistMin)
    if (dist > P.mouseDistMax) return new Vec2(0, 0)

    let dir = new Vec2(diffX / dist, diffY / dist)

    let force =
        ((dist - P.mouseSize) * particle.mass * P.mouseMass) / Math.pow(dist, P.mouseDistPow)

    return dir.mult(force)
}

// @ts-ignore
window.particles = particles

const drawParams = swarmKeys(P)

let shouldSpawn = false
mouse.on('move', () => {
    if (mouse.down) shouldSpawn = true
})
mouse.on('click', () => {
    shouldSpawn = true
})

function draw(t: number) {
    // return colorTest()
    const { ctx, width, height } = cnvs

    let delta = loop.delta
    let deltaRatio = delta / (1000 / 60)

    ctx.globalAlpha = 1 - Math.pow(0.6, deltaRatio)
    ctx.fillStyle = colors[0]
    ctx.fillRect(0, 0, width, height)

    ctx.globalAlpha = 1

    const now = t
    if (shouldSpawn && now - lastParticleSpawnAt >= spawnInterval) {
        const p = new Particle(mouse.pos.x, mouse.pos.y)
        particles.push(p)
        lastParticleSpawnAt = now
        shouldSpawn = false
    }

    for (let i = 0; i < particles.length; i++) {
        let pa = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
            let pb = particles[j]
            let diffX = pb.x - pa.x
            let diffY = pb.y - pa.y
            let dist = Math.sqrt(diffX * diffX + diffY * diffY)
            dist = Math.max(dist, 1)
            let dir = new Vec2(diffX / dist, diffY / dist)
            if (dist < P.bubbleDistMin) dist = P.bubbleDistMin
            let force =
                ((dist - P.bubbleSize) * pb.mass * pa.mass) / Math.pow(dist, P.bubbleDistPow)
            pa.acc.add(dir.copy().mult(force))
            pb.acc.add(dir.copy().mult(-force))
        }

        if (P.useMouse && mouse.over) {
            pa.acc.add(mouseAttract(pa, deltaRatio))
        }

        pa.update(deltaRatio)
        pa.draw(ctx)
    }

    ctx.fillStyle = textColor
    // ctx.globalAlpha = 1
    drawParams(ctx, height)
}

function testColors() {
    const { ctx, width, height } = cnvs
    let steps = 100
    let stepSize = width / steps
    let y = height / 2 - 100
    for (let x = 0; x < steps; x++) {
        ctx.fillStyle = colorScale(x / steps).css()
        ctx.fillRect(x * stepSize, y, stepSize, 200)
    }
}

function setupSquare() {
    let { width, height } = cnvs
    let startX = width / 2 - 3 * 20
    let startY = height / 2 - 3 * 20
    for (let x = 0; x < 6; x++) {
        for (let y = 0; y < 6; y++) {
            particles.push(new Particle(startX + x * 20, startY + y * 20))
        }
    }
}

function setupPerfTest() {
    let { width, height } = cnvs
    let startX = width / 2
    let startY = height / 2

    for (let i = 0; i < 350; i++) {
        particles.push(new Particle(startX + random(-30, 30), startY + random(-30, 30)))
    }
}

// const gui = new GuiExtra()
// gui.add(P, 'colorScalePadStart', 0, 1, 0.01).onChange((val: number) => {
//     colorScale.padding([val, P.colorScalePadEnd])
// })
// gui.add(P, 'colorScalePadEnd', 0, 1, 0.01).onChange((val: number) => {
//     colorScale.padding([P.colorScalePadStart, val])
// })
// gui.add(P, 'colorMode', ['oklch', 'oklab', 'rgb', 'hsl', 'hsv']).onChange(
//     (val: chroma.InterpolationMode) => {
//         colorScale.mode(val)
//     },
// )
