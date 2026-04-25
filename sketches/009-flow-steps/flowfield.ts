import p5 from 'p5'
import { Particle } from './particle'

export interface FlowFieldParams {
    noiseScale?: number
    turns?: number
    lineAlpha?: number
    bgAlpha?: number
    lerpVal?: number
    speed?: number
    count?: number
}

export const defaultFlowFieldParams: Required<FlowFieldParams> = {
    noiseScale: 0.002,
    turns: 4,
    speed: 4,
    lineAlpha: 10,
    bgAlpha: 0,
    lerpVal: 0.1,
    count: 1500,
}

export class FlowField {
    width: number
    height: number
    p: p5
    particles: Particle[] = []

    noiseScale: number
    turns: number
    lineAlpha: number
    bgAlpha: number
    lerpVal: number
    speed: number

    constructor(
        p: p5,
        {
            width = p.width,
            height = p.height,
            ...params
        }: FlowFieldParams & { width?: number; height?: number } = {},
    ) {
        this.width = width
        this.height = height

        const s = { ...defaultFlowFieldParams, ...params }
        this.noiseScale = s.noiseScale
        this.turns = s.turns
        this.lineAlpha = s.lineAlpha
        this.bgAlpha = s.bgAlpha
        this.lerpVal = s.lerpVal
        this.speed = s.speed
        this.p = p

        for (let i = 0; i < s.count; i++) {
            this.particles.push(new Particle(this))
        }
    }

    get count() {
        return this.particles.length
    }

    set count(n: number) {
        const currentCount = this.particles.length
        if (n > currentCount) {
            for (let i = currentCount; i < n; i++) {
                this.particles.push(new Particle(this))
            }
        } else if (n < currentCount) {
            this.particles.splice(n, currentCount - n)
        }
    }

    resetParticles(time = 0) {
        for (let particle of this.particles) {
            particle.restart(time)
        }
    }

    getNoise(x: number, y: number, ms: number) {
        const { noiseScale } = this
        return this.p.noise(x * noiseScale, y * noiseScale, ms / 1000)
    }

    getAngle(noiseVal: number) {
        let angle = noiseVal * Math.PI * 2 * this.turns
        return Math.atan2(Math.sin(angle), Math.cos(angle))
    }
}
