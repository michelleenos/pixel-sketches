import type {
    FlowParams,
    FlowWorker,
    FromFlowWorker,
    GrainParams,
    Sizes,
    WorkerStatus,
} from './flow2.types'
import { createNanoEvents } from 'nanoevents'

type InitParams = Omit<FlowParams, 'width' | 'height'>
interface FlowClientEvents {
    busy: (status: 'generating' | 'generating-live' | 'generating-record') => void
    notBusy: (lastTime: number) => void
    frame: (blob: Blob) => void
}

export class FlowClient {
    worker: FlowWorker
    busy = false
    pending = false
    lastStartTime = 0
    timings: number[] = []
    emitter = createNanoEvents<FlowClientEvents>()

    constructor(canvas: OffscreenCanvas, params: InitParams, sizes: Sizes) {
        this.worker = new Worker(new URL('./sketch-flow2.worker.ts', import.meta.url), {
            type: 'module',
        }) as FlowWorker
        this.worker.postMessage({ type: 'init', canvas, params, sizes }, [canvas])
        this.worker.onmessage = (e) => this.handleMessage(e.data)
    }

    handleMessage(msg: FromFlowWorker) {
        if (msg.type === 'frame') {
            this.emitter.emit('frame', msg.blob)
            return
        }
        if (msg.type === 'none') {
            if (this.busy) {
                this.busy = false
                const time = performance.now() - this.lastStartTime
                this.timings.push(time)
                this.emitter.emit('notBusy', time)
                if (this.pending) {
                    this.pending = false
                    this.regenerate()
                }
            }
        } else if (!this.busy) {
            this.busy = true
            this.lastStartTime = performance.now()
            this.emitter.emit('busy', msg.type)
        }
    }

    regenerate(live = false) {
        if (this.busy) {
            this.pending = true
            return
        }

        this.worker.postMessage({ type: 'regenerate', live })
    }

    regenerateForRecording() {
        if (this.busy) {
            this.pending = true
            return
        }

        this.worker.postMessage({ type: 'regenerate-record' })
    }

    update(params: Partial<FlowParams>) {
        this.worker.postMessage({ type: 'update', params })
    }

    redraw() {
        if (!this.busy) this.worker.postMessage({ type: 'draw' })
    }

    setSize(sizes: Sizes) {
        this.worker.postMessage({ type: 'setSize', sizes })
    }

    setGrain(params: GrainParams) {
        this.worker.postMessage({ type: 'updateGrain', params })
    }

    on<E extends keyof FlowClientEvents>(event: E, callback: FlowClientEvents[E]) {
        return this.emitter.on(event, callback)
    }
}
