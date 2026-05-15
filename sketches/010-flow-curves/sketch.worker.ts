/// <reference no-default-lib="true"/>
/// <reference lib="ES2022" />
/// <reference lib="WebWorker" />

import { Flow } from './flow'
import type { ToFlowWorker } from './flow.types'

let canvas: OffscreenCanvas
let ctx: OffscreenCanvasRenderingContext2D
let flow: Flow

function drawFlow(regenerate: boolean) {
    self.postMessage({ type: 'start' })
    if (regenerate) flow.generate()
    flow.draw()
    self.postMessage({ type: 'done' })
}

self.onmessage = (e: MessageEvent<ToFlowWorker>) => {
    const msg = e.data
    if (msg.type === 'init') {
        canvas = msg.canvas
        ctx = canvas.getContext('2d')!
        flow = new Flow(ctx, msg.params)

        console.log({
            stepLength: flow.stepLength,
            maxSteps: flow.maxSteps,
            minSteps: flow.minSteps,
            minSpace: flow.minSpace,
            gridSize: flow.gridSize,
            noiseMult: flow.noiseMult,
        })
    } else if (msg.type === 'draw') {
        drawFlow(msg.regenerate)
    } else if (msg.type === 'update') {
        Object.assign(flow, msg.params)
        drawFlow(msg.regenerate)
    } else if (msg.type === 'reseed') {
        flow.reseed()
        drawFlow(true)
    } else if (msg.type === 'setSize') {
        let sizes = msg.sizes
        canvas.width = sizes.width * sizes.pixelRatio
        canvas.height = sizes.height * sizes.pixelRatio
        ctx.scale(sizes.pixelRatio, sizes.pixelRatio)
        flow.setSize(msg.sizes)
        drawFlow(true)
    }
}
