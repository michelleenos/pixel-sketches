/// <reference no-default-lib="true"/>
/// <reference lib="ES2022" />
/// <reference lib="WebWorker" />

import { Flow } from './flow'
import type { ToFlowWorker } from './flow.types'

let canvas: OffscreenCanvas
let ctx: OffscreenCanvasRenderingContext2D
let flow: Flow

async function drawFlow() {
    flow.draw()
}

async function regenerateFlow(live: boolean) {
    self.postMessage({ type: live ? 'generating-live' : 'generating' })
    await flow.generate(live)
    if (!live) flow.draw()
    self.postMessage({ type: 'none' })
}

self.onmessage = (e: MessageEvent<ToFlowWorker>) => {
    const msg = e.data
    if (msg.type === 'init') {
        canvas = msg.canvas
        ctx = canvas.getContext('2d')!
        flow = new Flow(ctx, msg.params)
    } else if (msg.type === 'draw') {
        drawFlow()
    } else if (msg.type === 'update') {
        Object.assign(flow, msg.params)
        console.log('received update')
    } else if (msg.type === 'setSize') {
        let sizes = msg.sizes
        canvas.width = sizes.width * sizes.pixelRatio
        canvas.height = sizes.height * sizes.pixelRatio
        ctx.scale(sizes.pixelRatio, sizes.pixelRatio)
        flow.setSize(msg.sizes)
    } else if (msg.type === 'regenerate') {
        regenerateFlow(msg.live)
    }
}
