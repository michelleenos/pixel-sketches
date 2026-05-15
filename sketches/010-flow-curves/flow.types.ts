import type { Easing } from 'utils'

export type FlowFn = (x: number, y: number) => number

export type FlowDrawStrategy =
    | {
          type: 'random'
          count: number
      }
    | {
          type: 'grid'
          spacing: number
      }
    | {
          type: 'circlePack'
          radius: number
          maxAttempts?: number
      }

export interface FlowParams {
    width: number
    height: number
    gridSize?: number
    stepLength?: number
    maxSteps?: number
    minSteps?: number
    lineWidthMax?: number
    lineWidthMin?: number
    noiseMult?: number
    taperEase?: Easing
    taperLength?: number
    minSpace?: number
    palette?: { bg: string; colors: string[] }
    drawStrategy?: FlowDrawStrategy
}

export type ToFlowWorker =
    | { type: 'init'; canvas: OffscreenCanvas; params: FlowParams }
    | { type: 'draw'; regenerate: boolean }
    | { type: 'setSize'; sizes: { width: number; height: number; pixelRatio: number } }
    | { type: 'update'; params: Partial<FlowParams>; regenerate: boolean }
    | { type: 'reseed' }

export type FromFlowWorker = { type: 'done' } | { type: 'start' }

export type FlowWorker = Omit<Worker, 'postMessage' | 'onmessage'> & {
    postMessage(msg: ToFlowWorker, transfer?: Transferable[]): void
    onmessage: ((e: MessageEvent<FromFlowWorker>) => void) | null
}
