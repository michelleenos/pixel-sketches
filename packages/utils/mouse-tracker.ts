export default class MouseTracker {
    target: HTMLElement | Window
    trackMove: boolean
    over = false
    mouseIsDown = false
    pos = { x: 0, y: 0 }

    constructor(target: HTMLElement | Window = window, move = true) {
        this.trackMove = move
        this.target = target

        if (move) this.target.addEventListener('mousemove', this.onMouseMove)
        this.target.addEventListener('mouseenter', this.onMouseEnter)
        this.target.addEventListener('mouseleave', this.onMouseLeave)
        this.target.addEventListener('mousedown', this.onMouseDown)
        this.target.addEventListener('mouseup', this.onMouseUp)
    }

    onMouseMove = (event: Event) => {
        const e = event as MouseEvent
        this.over = true
        this.pos.x = e.clientX
        this.pos.y = e.clientY
    }

    onMouseEnter = () => {
        this.over = true
    }

    onMouseLeave = () => {
        this.over = false
        this.mouseIsDown = false
        if (!this.trackMove) this.target.removeEventListener('mousemove', this.onMouseMove)
    }

    onMouseDown = () => {
        this.mouseIsDown = true
        if (!this.trackMove) this.target.addEventListener('mousemove', this.onMouseMove)
    }

    onMouseUp = () => {
        this.mouseIsDown = false
        if (!this.trackMove) this.target.removeEventListener('mousemove', this.onMouseMove)
    }
}
