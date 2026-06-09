import type { Easing } from 'utils'

export type FlowVals = [number, number, number, number]
export type FlowPalette = { bg: string; colors: string[] }
export interface FlowParams {
    width: number
    height: number
    scale?: number
    offset?: number
    qtCapacity?: number
    stepLength?: number
    maxSteps?: number
    minSteps?: number
    decreaseStep?: number
    lineWidthMax?: number
    lineWidthMin?: number
    taperEase?: Easing
    taperLength?: number
    minSpace?: number
    maxFailsMin?: number
    maxFailsMax?: number
    // maxFailsIncrease?: number
    minInitialCurves?: number
    vals?: FlowVals
    palette?: FlowPalette
    colorsMethod?: 'clumps' | 'hue' | 'temp'
    colorRepeats?: number
    colorRandomDist?: number
    showColors?: boolean
    lineCap?: 'round' | 'square'
    brightenMin?: number
    brightenMax?: number
    liveInterval?: number
}

export interface GrainParams {
    type: 'over' | 'adjust' | 'none'
    adjustAmount: number
    overAlpha: number
    overOperation: GlobalCompositeOperation
}

export type Sizes = { width: number; height: number; pixelRatio: number }

export type ToFlowWorker =
    | {
          type: 'init'
          canvas: OffscreenCanvas
          params: Omit<FlowParams, 'width' | 'height'>
          sizes: Sizes
      }
    | { type: 'draw' }
    | { type: 'setSize'; sizes: Sizes }
    | { type: 'updateGrain'; params: GrainParams }
    | { type: 'update'; params: Partial<FlowParams> }
    | { type: 'regenerate'; live: boolean }
    | { type: 'regenerate-record' }

export type WorkerStatus = 'generating' | 'generating-live' | 'generating-record' | 'none'
export type FromFlowWorker = { type: WorkerStatus } | { type: 'frame'; blob: Blob }

export type FlowWorker = Omit<Worker, 'postMessage' | 'onmessage'> & {
    postMessage(msg: ToFlowWorker, transfer?: Transferable[]): void
    onmessage: ((e: MessageEvent<FromFlowWorker>) => void) | null
}
