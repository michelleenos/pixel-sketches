export function lerp(a: number, b: number, alpha: number) {
    return a + alpha * (b - a)
}

export function map(num: number, inMin: number, inMax: number, outMin: number, outMax: number) {
    return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

export function random(): number
export function random(max: number): number
export function random(minOrMax: number, max: number): number
export function random<T>(array: readonly T[]): T
export function random<T>(numOrArray?: number | readonly T[], max?: number) {
    if (typeof numOrArray === 'undefined') {
        return Math.random()
    }

    if (typeof numOrArray === 'number') {
        if (typeof max === 'undefined') {
            return Math.random() * numOrArray
        }
        return Math.random() * (max - numOrArray) + numOrArray
    }

    return numOrArray[Math.floor(Math.random() * numOrArray.length)]
}

export function step(edge: number, value: number) {
    return value < edge ? 0 : 1
}

export function smoothstep(edge0: number, edge1: number, value: number) {
    const x = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)))
    return x * x * (3 - 2 * x)
}

/**
 * shuffle an array in place
 */
export function shuffle<T>(array: T[]) {
    let currentIndex = array.length
    let randomIndex

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex -= 1
        ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
    }

    return array
}

export function round(num: number, precision = 1) {
    const factor = Math.pow(10, precision)
    return Math.round(num * factor) / factor
}
