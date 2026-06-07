import type { FlowVals } from './flow2.types'
import { round, random } from 'utils'

export function randomFlowVals(): FlowVals {
    return [
        round(random(2, 10), 2),
        round(random(5, 15), 2) * random([-1, 1]),
        round(random(5, 10), 2),
        round(random(5, 20), 2),
    ]
}
