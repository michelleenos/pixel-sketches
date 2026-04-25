import p5 from 'p5'
import type { FlowField } from './flowfield'

export class Particle {
    p: p5
    pos: p5.Vector
    angle: number
    prev: p5.Vector
    field: FlowField
    noiseVal: number

    constructor(field: FlowField, initialTime = 0) {
        this.field = field
        this.p = field.p

        this.pos = this.p.createVector(this.p.random(field.width), this.p.random(field.height))
        this.prev = this.pos.copy()
        this.noiseVal = this.field.getNoise(this.pos.x, this.pos.y, initialTime)
        this.angle = this.field.getAngle(this.noiseVal)
    }

    restart(time: number) {
        this.pos = this.p.createVector(
            this.p.random(this.field.width),
            this.p.random(this.field.height),
        )
        this.prev = this.pos.copy()
        this.noiseVal = this.field.getNoise(this.pos.x, this.pos.y, time)
        this.angle = this.field.getAngle(this.noiseVal)
    }

    update(time: number) {
        this.noiseVal = this.field.getNoise(this.pos.x, this.pos.y, time)
        let angle = this.field.getAngle(this.noiseVal)
        this.angle +=
            Math.atan2(Math.sin(angle - this.angle), Math.cos(angle - this.angle)) *
            this.field.lerpVal
        this.prev = this.pos.copy()
        this.pos.add(
            Math.cos(this.angle) * this.field.speed,
            Math.sin(this.angle) * this.field.speed,
        )
    }

    draw(colors: [p5.Color, number][]) {
        this.p.strokeWeight(1)
        // let lerpVal = this.p.map(this.noiseVal, 0.3, 0.7, 0, 1)
        let lerpVal = this.p.map(this.angle, 0, Math.PI * 2, 0, 1)
        let colorStr = this.p.paletteLerp(colors, lerpVal).toString()
        let c = this.p.color(colorStr)
        c.setAlpha(this.field.lineAlpha)
        this.p.stroke(c)
        this.p.line(this.prev.x, this.prev.y, this.pos.x, this.pos.y)
    }

    checkEdges(time: number) {
        if (
            this.pos.x < 0 ||
            this.pos.x > this.field.width ||
            this.pos.y < 0 ||
            this.pos.y > this.field.height
        ) {
            this.restart(time)
        }
    }
}
