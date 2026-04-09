import { Vec2, MouseTracker, Cnvs, Loop, random, clamp, map, FixedFpsLoop } from 'utils'
import { GuiExtra } from '../../packages/lilgui-extra'

const cnvs = new Cnvs({ autoResize: true })
const mouse = new MouseTracker(cnvs.canvas)
const PARAMS = {
    massMin: 1,
    massMax: 3,
    targetFps: 60,
}

class Particle extends Vec2 {
    vel = new Vec2()
    acc = new Vec2()
    // _mass: number
    massVal: number

    constructor(x = 0, y = 0) {
        super(x, y)
        this.massVal = random(0, 1)
    }

    get mass() {
        return map(this.massVal, 0, 1, PARAMS.massMin, PARAMS.massMax)
    }
}

let particles: Particle[] = []
const spawnInterval = 1000 / 60
let lastParticleSpawnAt = 0

const loop = new Loop(draw)

function draw(t: number) {
    const { ctx, width, height } = cnvs
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, width, height)

    // let deltaRatio = loop.deltaRatio
    let delta = loop.delta
    let deltaRatio = delta / (1000 / PARAMS.targetFps)

    if (!mouse.over) {
        mouse.pos.x = width / 2
        mouse.pos.y = height / 2
    }

    const now = t
    if (mouse.mouseIsDown && now - lastParticleSpawnAt >= spawnInterval) {
        particles.push(new Particle(mouse.pos.x, mouse.pos.y))
        lastParticleSpawnAt = now
    }

    ctx.fillStyle = 'rgba(0, 255, 191, 0.824)'
    // let log = posX.length === 2 && !hasLogged

    // particles.forEach((pa) => {
    //     particles.forEach((pb) => {
    //         if (pa === pb) return
    //         let diff = pb.copy().sub(pa)
    //         let dir = diff.copy().normalize()
    //         let dist = pb.distance(pa)
    //         if (dist < 1) dist = 1

    //         let force = ((dist - 320) * pb.mass * pa.mass) / dist
    //         pa.acc.add(diff.mult(force))
    //     })

    //     pa.vel.mult(1 - 0.01 * deltaRatio)
    //     pa.vel.add(pa.acc.mult(deltaRatio))
    //     pa.acc.mult(0)
    // })

    particles.forEach((pa) => {
        particles.forEach((pb) => {
            if (pa === pb) return
            let diff = pb.copy().sub(pa)
            let dir = diff.copy().normalize()
            let dist = pb.distance(pa)
            if (dist < 1) dist = 1

            // let strength = (pa.mass * pb.mass * (dist - 320)) / dist
            let strength = (pa.mass * pb.mass * (dist - 150)) / (dist * dist)
            let force = dir.mult(strength)
            pa.acc.add(force.div(pa.mass))
        })

        pa.vel.mult(Math.pow(0.99, deltaRatio))
        pa.vel.add(pa.acc.mult(deltaRatio))
        pa.acc.mult(0)
    })

    particles.forEach((p) => {
        p.add(p.vel.copy().mult(deltaRatio))
        const radius = map(p.mass, PARAMS.massMin, PARAMS.massMax, 5, 25)
        ctx.beginPath()
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
        ctx.fill()
    })

    ctx.fillStyle = '#fff'
    ctx.fillText(`deltaRatio: ${deltaRatio.toFixed(2)}`, 10, 80)

    ctx.fillText(`mouseIsOver: ${mouse.over}`, 10, 100)
}

const gui = new GuiExtra()

const mf = gui.addFolder('mass')
mf.add(PARAMS, 'massMin', 0, 10, 0.0001).name('min')
mf.add(PARAMS, 'massMax', 0, 10, 0.0001).name('max')

gui.add({ clear: () => (particles = []) }, 'clear')
gui.add(PARAMS, 'targetFps', 1, 200, 1)
