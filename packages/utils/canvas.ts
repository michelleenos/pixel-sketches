interface CanvasOpts {
    append?: boolean | string
    className?: string
    autoResize?: boolean
    width?: number
    height?: number
    pixelRatio?: number
}

export class Canvas {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    _pixelRatio: number
    _width!: number
    _height!: number

    constructor({
        append = true,
        className,
        autoResize = false,
        width,
        height,
        pixelRatio,
    }: CanvasOpts = {}) {
        this.canvas = document.createElement('canvas')
        if (className) this.canvas.classList.add(className)
        this.ctx = this.canvas.getContext('2d')!
        this._pixelRatio = pixelRatio || Math.min(window.devicePixelRatio, 2)
        this.setSize(width || window.innerWidth, height || window.innerHeight)

        if (append === true) {
            document.body.appendChild(this.canvas)
        } else if (typeof append === 'string') {
            document.querySelector(append)?.appendChild(this.canvas)
        }

        if (autoResize) window.addEventListener('resize', this.onWindowResize)
    }

    get width() {
        return this._width
    }

    get height() {
        return this._height
    }

    get pixelRatio() {
        return this._pixelRatio
    }

    set pixelRatio(ratio: number) {
        if (this._pixelRatio === ratio) return
        this._pixelRatio = ratio
        this.canvas.width = this._width * this._pixelRatio
        this.canvas.height = this._height * this._pixelRatio
        this.ctx.scale(this._pixelRatio, this._pixelRatio)
    }

    setSize(width: number, height: number, pixelRatio?: number) {
        if (
            width === this._width &&
            height === this._height &&
            (pixelRatio === undefined || pixelRatio === this._pixelRatio)
        )
            return
        if (pixelRatio) this._pixelRatio = pixelRatio
        this._width = width
        this._height = height
        this.canvas.width = width * this._pixelRatio
        this.canvas.height = height * this._pixelRatio
        this.canvas.style.width = `${width}px`
        this.canvas.style.height = `${height}px`
        this.ctx.scale(this._pixelRatio, this._pixelRatio)
    }

    onWindowResize = () => {
        this._pixelRatio = Math.min(window.devicePixelRatio, 2)
        this.setSize(window.innerWidth, window.innerHeight)
    }
}
