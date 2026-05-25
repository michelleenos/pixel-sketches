import type { Easing } from 'utils'

export interface FlowParams {
    width: number
    height: number
    stepLength?: number
    maxSteps?: number
    minSteps?: number
    lineWidthMax?: number
    lineWidthMin?: number
    taperEase?: Easing
    taperLength?: number
    minSpace?: number
    vals?: [number, number, number, number]
    palette?: { bg: string; colors: string[] }
}

export type ToFlowWorker =
    | { type: 'init'; canvas: OffscreenCanvas; params: FlowParams }
    | { type: 'draw' }
    | { type: 'setSize'; sizes: { width: number; height: number; pixelRatio: number } }
    | { type: 'update'; params: Partial<FlowParams> }
    | { type: 'regenerate'; live: boolean }

type WorkerStatus = 'generating' | 'generating-live' | 'none'
export type FromFlowWorker = { type: WorkerStatus }

export type FlowWorker = Omit<Worker, 'postMessage' | 'onmessage'> & {
    postMessage(msg: ToFlowWorker, transfer?: Transferable[]): void
    onmessage: ((e: MessageEvent<FromFlowWorker>) => void) | null
}
