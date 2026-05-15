export function lerp(a: number, b: number, alpha: number) {
    return a + alpha * (b - a)
}

export function map(num: number, inMin: number, inMax: number, outMin: number, outMax: number) {
    return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

// Notes about Math.random() and bias:
// - https://github.com/ckknight/random-js
// - https://stackoverflow.com/questions/71446632/generating-unbiased-random-float-numbers-0-1-in-javascript
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

/**
 *
 * @param min
 * @param max
 * @param bias numbers will be more likely to land here
 * @param influence [0-1]
 * @returns
 */
export function randomBiased(min: number, max: number, bias: number, influence = 1) {
    const base = random(min, max)
    const mix = random(0, 1) * influence
    return base * (1 - mix) + bias * mix
}

export function step(edge: number, value: number) {
    return value < edge ? 0 : 1
}

export function smoothstep(edge0: number, edge1: number, value: number) {
    const x = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)))
    return x * x * (3 - 2 * x)
}

/**
 * shuffle an array according to fisher-yates algorithm
 * either modifying it in place or returning a new array
 */
export function shuffle<T>(array: T[], inPlace = true) {
    let arr = inPlace ? array : [...array]
    let currentIndex = arr.length
    let randomIndex

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex -= 1
        ;[arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]]
    }

    return arr
}

export function round(num: number, precision = 1) {
    const factor = Math.pow(10, precision)
    return Math.round(num * factor) / factor
}

export function floorToNearest(value: number, multiple: number) {
    return Math.floor(value / multiple) * multiple
}

export function roundToNearest(value: number, multiple: number) {
    return Math.round(value / multiple) * multiple
}

export function clamp(num: number, min: number, max: number) {
    return Math.max(Math.min(num, max), min)
}
