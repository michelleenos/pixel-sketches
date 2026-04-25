export interface TimerParams {
    timeJump?: number
    timeJumpInterval?: number
    type?: 'jump' | 'linear'
    timeScale?: number
}

export const defaultTimerParams: Required<TimerParams> = {
    timeJump: 1000,
    timeJumpInterval: 2000,
    type: 'jump',
    timeScale: 0.2,
}

export class Timer {
    realMs = 0
    timeVal = 0
    timeSinceJump = 0
    timeScale: number
    timeJump: number
    timeJumpInterval: number
    type: 'jump' | 'linear'

    constructor(params: TimerParams = {}) {
        let time = performance.now()
        this.realMs = time
        this.timeVal = time

        const { timeJump, timeJumpInterval, type, timeScale } = { ...defaultTimerParams, ...params }
        this.timeJump = timeJump
        this.timeJumpInterval = timeJumpInterval
        this.type = type
        this.timeScale = timeScale
    }

    setFromNow() {
        let time = performance.now()
        this.realMs = time
        this.timeVal = time
        this.timeSinceJump = 0
    }

    update() {
        let ms = performance.now()
        if (this.type === 'linear') {
            this.realMs = ms
            this.timeVal = ms * this.timeScale
            return
        }

        let delta = ms - this.realMs
        this.timeSinceJump += delta
        this.realMs = ms

        if (this.timeSinceJump >= this.timeJumpInterval) {
            this.timeVal += this.timeJump * this.timeScale
            this.timeSinceJump = this.timeSinceJump - this.timeJumpInterval
        }
    }
}
