import { createNanoEvents } from 'nanoevents'

interface MouseTrackerEvents {
    move: (x: number, y: number) => void
    click: (x: number, y: number) => void
    enter: () => void
    leave: () => void
    down: () => void
    up: () => void
}

export default class MouseTracker {
    target: HTMLElement
    trackMove: boolean
    over = false
    down = false
    pos = { x: 0, y: 0 }
    emitter = createNanoEvents<MouseTrackerEvents>()

    constructor(target: HTMLElement, move = true) {
        this.trackMove = move
        this.target = target

        if (move) this.target.addEventListener('mousemove', this.onMouseMove)
        this.target.addEventListener('mouseenter', this.onMouseEnter)
        this.target.addEventListener('mouseleave', this.onMouseLeave)
        this.target.addEventListener('mousedown', this.onMouseDown)
        this.target.addEventListener('mouseup', this.onMouseUp)
        this.target.addEventListener('click', this.onMouseClick)
    }

    onMouseMove = (event: Event) => {
        const e = event as MouseEvent
        this.over = true
        this.pos.x = e.clientX
        this.pos.y = e.clientY
        this.emitter.emit('move', this.pos.x, this.pos.y)
    }

    onMouseEnter = () => {
        this.over = true
        this.emitter.emit('enter')
    }

    onMouseLeave = () => {
        this.over = false
        this.emitter.emit('leave')
        if (this.down) {
            this.down = false
            if (!this.trackMove) this.target.removeEventListener('mousemove', this.onMouseMove)
        }
    }

    onMouseClick = (e: PointerEvent) => {
        this.pos.x = e.clientX
        this.pos.y = e.clientY
        this.emitter.emit('click', this.pos.x, this.pos.y)
    }

    onMouseDown = () => {
        this.down = true
        if (!this.trackMove) this.target.addEventListener('mousemove', this.onMouseMove)
        this.emitter.emit('down')
    }

    onMouseUp = () => {
        this.down = false
        if (!this.trackMove) this.target.removeEventListener('mousemove', this.onMouseMove)
        this.emitter.emit('up')
    }

    on<Event extends keyof MouseTrackerEvents>(event: Event, cb: MouseTrackerEvents[Event]) {
        this.emitter.on(event, cb)
    }
}
