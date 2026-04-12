import { Cnvs, lerp, Loop, map, MouseTracker, random, Vec2 } from 'utils'
import { GuiExtra } from '../../packages/lilgui-extra'

const cnvs = new Cnvs({ autoResize: true })
const mouse = new MouseTracker(cnvs.canvas)
const P = {
    massMin: 1,
    massMax: 3,
    damping: 0.985,
    bubbleDistMin: 5,
    bubbleSize: 150,
    bubbleDistPow: 2,
    mouseMass: 195,
    mouseSize: 250,
    mouseDistMin: 80,
    mouseDistPow: 2,
    // mouseMult: 1,
    mouseAlignMult: 2,
    mouseAlignSmooth: 0.9,
    useMouse: true,
    offscreen: 0,
    clear: () => {
        while (particles.length > 0) {
            particles.pop()
        }
    },
}

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
}

let particles: Particle[] = []
const spawnInterval = 1000 / 60
let lastParticleSpawnAt = 0

const loop = new Loop(draw)
// const drawParams = swarmKeys(P)

function mouseAttract(particle: Particle, deltaRatio: number) {
    let diffX = mouse.pos.x - particle.x
    let diffY = mouse.pos.y - particle.y
    let magSq = diffX * diffX + diffY * diffY
    let dist = Math.max(Math.sqrt(magSq), P.mouseDistMin)

    let heading = Math.atan2(diffY, diffX)
    let headingV = Math.atan2(particle.vel.y, particle.vel.x)
    let align = Math.abs(heading - headingV)
    if (align > Math.PI) align = Math.PI * 2 - align
    align /= Math.PI
    particle.mouseAlignment = lerp(
        particle.mouseAlignment,
        align,
        1 - Math.pow(P.mouseAlignSmooth, deltaRatio),
    )

    let dir = new Vec2(diffX / dist, diffY / dist)

    let force =
        ((dist - P.mouseSize) * particle.mass * P.mouseMass) / Math.pow(dist, P.mouseDistPow)
    force += align * P.mouseAlignMult
    // force *= P.mouseMult

    return dir.mult(force)
}

// @ts-ignore
window.particles = particles

function draw(t: number) {
    // return colorTest()
    const { ctx, width, height } = cnvs
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, width, height)

    let delta = loop.delta
    let deltaRatio = delta / (1000 / 60)

    if (!mouse.over) {
        mouse.pos.x = width / 2
        mouse.pos.y = height / 2
    }

    const now = t
    if (mouse.mouseIsDown && now - lastParticleSpawnAt >= spawnInterval) {
        const p = new Particle(mouse.pos.x, mouse.pos.y)
        particles.push(p)
        lastParticleSpawnAt = now
    }

    ctx.fillStyle = 'rgba(0, 255, 191, 0.824)'

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

        if (P.useMouse) {
            pa.acc.add(mouseAttract(pa, deltaRatio))
        }
    }

    particles.forEach((p) => {
        p.vel.mult(Math.pow(P.damping, deltaRatio))
        p.vel.add(p.acc.mult(deltaRatio).div(p.mass))
        p.acc.mult(0)

        p.add(p.vel.copy().mult(deltaRatio))
        const radius = map(p.mass, P.massMin, P.massMax, 5, 25)
        ctx.fillStyle = colorRamp(p.mouseAlignment)
        ctx.beginPath()
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
        ctx.fill()
    })
}

function colorRamp(val: number) {
    return `rgba(${100 - 60 * val}, ${180 * val + 30}, ${100 + 155 * (1 - val)}, 0.7)`
}

function colorTest() {
    const { width, height, ctx } = cnvs
    let count = 20
    let size = width / count
    let y = height / 2 - 20
    for (let i = 0; i < count; i++) {
        ctx.fillStyle = colorRamp(i * (1 / count))
        ctx.fillRect(i * size, y, size, 40)
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

const gui = new GuiExtra()

const defaultParams = { ...P }

gui.add(P, 'massMin', 0, 20, 1)
gui.add(P, 'massMax', 0, 20, 1)
gui.add(P, 'damping', 0.9, 1, 0.001)
gui.add(P, 'bubbleDistMin', 0, 50, 0.1)
gui.add(P, 'bubbleSize', 1, 300, 1)
gui.add(P, 'bubbleDistPow', 0.1, 5, 0.1)

gui.add(P, 'useMouse')
gui.add(P, 'mouseMass', 0, 300, 0.1)
gui.add(P, 'mouseSize', 0, 400, 1)
gui.add(P, 'mouseDistMin', 0, 100, 0.1)
gui.add(P, 'mouseDistPow', 0, 5, 0.1)
gui.add(P, 'mouseAlignMult', 0, 5, 0.1)
gui.add(P, 'mouseAlignSmooth', 0, 1, 0.01)
// gui.add(P, 'mouseMult', 0, 5, 0.1)
gui.add(particles, 'length').disable().name('count').listen()
gui.add(P, 'clear')
gui.add(
    {
        resetParams: () => {
            ;(Object.keys(defaultParams) as (keyof typeof P)[]).forEach((key) => {
                let val = defaultParams[key]
                if (typeof val === 'number' || typeof val === 'boolean') {
                    ;(P[key] as typeof val) = val
                }
            })
            gui.updateAll()
        },
    },
    'resetParams',
)
