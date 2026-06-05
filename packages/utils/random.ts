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
