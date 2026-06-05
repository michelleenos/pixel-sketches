export function lerp(a: number, b: number, alpha: number) {
    return a + alpha * (b - a)
}

export function map(num: number, inMin: number, inMax: number, outMin: number, outMax: number) {
    return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
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
