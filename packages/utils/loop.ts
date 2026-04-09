export class Loop {
    _id: number | null = null
    _fps: number
    _interval: number
    _last: number = performance.now()
    delta: number = 0
    // deltaRatio: number = 0
    cb: FrameRequestCallback

    constructor(cb: FrameRequestCallback, { paused = false, fps = 60 } = {}) {
        this.cb = cb
        this._fps = fps
        this._interval = 1000 / this._fps
        if (!paused) this.start()
    }

    _animation(t: DOMHighResTimeStamp) {
        this._id = requestAnimationFrame(this._animation.bind(this))
        this.delta = t - this._last
        // this.deltaRatio = this.delta / this._interval
        this._last = t
        this.cb(t)
    }

    get looping() {
        return this._id !== null
    }

    set fps(val: number) {
        this._fps = val
        this._interval = 1000 / val
    }

    get fps() {
        return this._fps
    }

    stop() {
        if (!this._id) return
        cancelAnimationFrame(this._id)
        this._id = null
    }

    start() {
        if (this.looping) return
        this._last = performance.now()
        this._id = requestAnimationFrame(this._animation.bind(this))
    }
}

export class FixedFpsLoop {
    _id: number | null = null
    _fps: number
    _interval: number
    _then: number = performance.now()
    cb: FrameRequestCallback

    constructor(
        cb: FrameRequestCallback,
        { paused = false, fps = 60, listenVisibility = true } = {},
    ) {
        // super(cb, { paused })
        this.cb = cb
        this._fps = fps
        this._interval = 1000 / this._fps

        if (listenVisibility)
            document.addEventListener('visibilitychange', this._onVisibilityChange.bind(this))

        if (!paused) this.start()
    }

    get looping() {
        return this._id !== null
    }

    get fps() {
        return this._fps
    }

    set fps(val: number) {
        this._fps = val
        this._interval = 1000 / val
    }

    start() {
        if (this.looping) return
        this._then = performance.now()
        this._id = requestAnimationFrame(this._animation.bind(this))
    }

    stop() {
        if (!this._id) return
        cancelAnimationFrame(this._id)
        this._id = null
    }

    _animation() {
        this._id = requestAnimationFrame(this._animation.bind(this))
        let now = performance.now()
        let delta = now - this._then
        while (delta >= this._interval) {
            delta -= this._interval
            this._then += this._interval
            this.cb(this._then)
        }
    }

    _onVisibilityChange() {
        console.log('visibility change', this)
        if (document.visibilityState === 'visible' && this.looping) {
            this._then = performance.now()
        }
    }
}

export function loop(cb: FrameRequestCallback, paused = false) {
    let id: number
    let isLooping: boolean = !!paused
    function animation(t: DOMHighResTimeStamp) {
        id = requestAnimationFrame(animation)
        cb(t)
    }
    if (!paused) id = requestAnimationFrame(animation)

    return {
        stop: () => {
            cancelAnimationFrame(id)
            isLooping = false
        },
        start: () => {
            id = requestAnimationFrame(animation)
            isLooping = true
        },
        get looping() {
            return isLooping
        },
        get id() {
            return id
        },
    }
}

export function fixedFpsLoop(cb: FrameRequestCallback, paused = false, fps = 60) {
    return new FixedFpsLoop(cb, { paused, fps })
}
