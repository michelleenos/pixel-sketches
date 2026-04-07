import type { GuiExtra } from 'lilgui-extra'
import { petalDefaults, type PetalOpts } from './_petal'
import type { PetalDrawing } from './_petals-drawings'

export type Preset = {
    petal: PetalOpts
    fps?: number
} & (
    | {
          type: 'petal'
          rotate?: number
      }
    | {
          type: 'star' | 'flower'
          points?: number
      }
)

export const presets: { [key: string]: Preset } = {
    default: {
        type: 'petal',
        petal: {
            ...petalDefaults,
            length: 640,
        },
    },
    star6: {
        type: 'star',
        points: 6,
        petal: {
            cp1Freq: { x: 2, y: 3 },
            cp2Freq: { x: 2, y: 3 },
            lineSpace: 1,
            cp1: { x: -0.237, y: 0.36 },
            cp2: { x: 0.2, y: 0.73 },
            length: 722,
            shiftEnd: 0,
            maxLines: 1400,
        },
    },
    flower: {
        type: 'flower',
        points: 8,
        fps: 120,
        petal: {
            shiftEnd: 0.015,
            length: 320,
            cp1: { x: 0.2, y: 0.33 },
            cp2: { x: -0.21, y: 0.525 },
            cpAmp: { x: 0.35, y: 0.2 },
            lineSpace: 0.5,
            maxLines: 1500,
            cp1Freq: { x: 5, y: 4 },
            cp2Freq: { x: 5, y: 4 },
        },
    },
    funky: {
        type: 'petal',
        rotate: 180,
        petal: {
            shiftEnd: 0,
            length: 640,
            cp1: { x: -0.24, y: 0.97 },
            cp2: { x: 0.17, y: -0.26 },
            cpAmp: { x: 0.25, y: 0.15 },
            lineSpace: 1,
            maxLines: 1000,
            cp1Freq: { x: 2, y: 3 },
            cp2Freq: { x: 2, y: 3 },
        },
    },
}
