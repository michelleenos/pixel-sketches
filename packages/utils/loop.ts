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
    let id: number
    let isLooping: boolean = !!paused
    let _fps = fps
    let interval = 1000 / _fps

    let then = performance.now()

    function animation(t: number) {
        id = requestAnimationFrame(animation)
        let now = performance.now()
        let delta = now - then
        // console.log(`delta: ${delta.toFixed()}, current then: ${then.toFixed()}`)

        while (delta >= interval) {
            delta -= interval
            then += interval
            cb(then)
        }
    }

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // otherwise when user leaves the page and comes back, we get several seconds/minutes/more worth of frames at once
            then = performance.now()
        }
    })
    // window.addEventListener('vis')

    if (!paused) id = requestAnimationFrame(animation)

    return {
        stop: () => {
            cancelAnimationFrame(id)
            isLooping = false
        },
        start: () => {
            if (isLooping) return
            then = performance.now()
            id = requestAnimationFrame(animation)
            isLooping = true
        },
        get fps() {
            return _fps
        },
        set fps(fps: number) {
            _fps = fps
            interval = 1000 / _fps
        },
        get looping() {
            return isLooping
        },
        get id() {
            return id
        },
    }
}
