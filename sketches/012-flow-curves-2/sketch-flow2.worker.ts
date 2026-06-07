/// <reference no-default-lib="true"/>
/// <reference lib="ES2022" />
/// <reference lib="WebWorker" />

import { Flow } from './flow2'
import type { GrainParams, Sizes, ToFlowWorker } from './flow2.types'
import { random } from 'utils'

type Sketch = {
    canvas: OffscreenCanvas
    ctx: OffscreenCanvasRenderingContext2D
    flow: Flow
    sizes: { width: number; height: number; pixelRatio: number }
    grain: GrainParams & {
        canvas: OffscreenCanvas
        ctx: OffscreenCanvasRenderingContext2D
    }
}

let sketch: Sketch | null = null

async function regenerateFlow(live: boolean) {
    if (!sketch) return
    self.postMessage({ type: live ? 'generating-live' : 'generating' })
    await sketch.flow.generate(live, sketch.ctx)
    sketch.flow.draw(sketch.ctx)
    drawGrain()
    self.postMessage({ type: 'none' })
}

function drawGrain() {
    if (!sketch) return

    if (sketch.grain.type === 'none') return

    if (sketch.grain.type === 'over') {
        const grainCtx = sketch.grain.canvas.getContext('2d')!
        const iData = grainCtx.createImageData(
            sketch.sizes.width * sketch.sizes.pixelRatio,
            sketch.sizes.height * sketch.sizes.pixelRatio,
        )
        const buffer32 = new Uint32Array(iData.data.buffer)
        const len = buffer32.length
        let subArrayLength = Math.ceil(len / 8)
        for (let i = 0; i < subArrayLength; i++) {
            const g = (Math.random() * 256) | 0
            buffer32[i] = 0xff000000 | (g << 16) | (g << 8) | g
        }
        buffer32.set(buffer32.subarray(0, subArrayLength), subArrayLength)
        buffer32.set(buffer32.subarray(0, subArrayLength * 2), subArrayLength * 2)
        buffer32.set(buffer32.subarray(0, subArrayLength * 4), len - subArrayLength * 4)
        grainCtx.putImageData(iData, 0, 0)

        sketch.ctx.save()
        sketch.ctx.globalCompositeOperation = sketch.grain.overOperation
        sketch.ctx.globalAlpha = sketch.grain.overAlpha
        sketch.ctx.drawImage(sketch.grain.canvas, 0, 0, sketch.sizes.width, sketch.sizes.height)
        sketch.ctx.restore()
    } else {
        const data = sketch.ctx.getImageData(
            0,
            0,
            sketch.sizes.width * sketch.sizes.pixelRatio,
            sketch.sizes.height * sketch.sizes.pixelRatio,
        )
        for (let i = 0; i < data.data.length; i += 4) {
            const noise = (random() - 0.5) * sketch.grain.adjustAmount
            data.data[i] = Math.min(255, Math.max(0, data.data[i] + noise))
            data.data[i + 1] = Math.min(255, Math.max(0, data.data[i + 1] + noise))
            data.data[i + 2] = Math.min(255, Math.max(0, data.data[i + 2] + noise))
        }
        sketch.ctx.putImageData(data, 0, 0)
    }
}

function draw() {
    if (!sketch) return
    sketch.flow.draw(sketch.ctx)
    drawGrain()
}

function setSizes(newSizes: Sizes) {
    if (!sketch) return
    sketch.sizes = newSizes
    const { width, height, pixelRatio } = newSizes
    const { ctx, canvas, flow } = sketch
    canvas.width = width * pixelRatio
    canvas.height = height * pixelRatio
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    flow.setSize({ width, height })
    ctx.fillStyle = flow.palette.bg
    ctx.fillRect(0, 0, width, height)

    sketch.grain.canvas.width = width * pixelRatio
    sketch.grain.canvas.height = height * pixelRatio
}

self.onmessage = (e: MessageEvent<ToFlowWorker>) => {
    const msg = e.data
    console.log(msg)
    if (msg.type === 'init') {
        let { canvas, params, sizes } = msg

        let ctx = canvas.getContext('2d', { willReadFrequently: true })!
        let grainCanvas = new OffscreenCanvas(
            sizes.width * sizes.pixelRatio,
            sizes.height * sizes.pixelRatio,
        )
        sketch = {
            canvas,
            ctx,
            flow: new Flow({ ...params, width: sizes.width, height: sizes.height }),
            sizes: sizes,
            grain: {
                type: 'none',
                overAlpha: 0.15,
                overOperation: 'overlay',
                adjustAmount: 30,
                canvas: grainCanvas,
                ctx: grainCanvas.getContext('2d')!,
            },
        }
    } else if (msg.type === 'draw') {
        draw()
    } else if (msg.type === 'setSize') {
        setSizes(msg.sizes)
    } else if (msg.type === 'update') {
        if (sketch) {
            Object.assign(sketch.flow, msg.params)
        }
    } else if (msg.type === 'regenerate') {
        regenerateFlow(msg.live)
    } else if (msg.type === 'updateGrain') {
        if (!sketch) return
        Object.assign(sketch.grain, msg.params)
        draw()
    }
}
