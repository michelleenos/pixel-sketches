import { Cnvs, FixedFpsLoop } from 'utils'
import { Petal } from './_petal'

function drawPoint(ctx: CanvasRenderingContext2D, x: number, y: number, radius = 5, fill = '#fff') {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = fill
    ctx.fill()
}

export class PetalDrawing {
    width = 800
    height = 800
    showBaseCps = false
    _showMovingCps = false
    rotate = 180
    type: 'star' | 'flower' | 'petal' = 'star'
    points = 6
    cnvs = new Cnvs({ className: 'sketch', append: true })
    petal = new Petal({ length: this.height * 0.8, maxLines: 1000 })
    cnvsPetal = new Cnvs({ append: false, width: this.width, height: this.height })
    cnvsCps = new Cnvs({ append: false, width: this.width, height: this.height })
    loop: FixedFpsLoop

    constructor() {
        window.addEventListener('resize', this.onResize)
        this.loop = new FixedFpsLoop(this.draw)
    }

    get showMovingCps() {
        return this._showMovingCps
    }

    set showMovingCps(val: boolean) {
        this._showMovingCps = val
        this.cnvsCps.clear()
    }

    onResize = () => {
        this.cnvs.setSize(window.innerWidth, window.innerHeight)
        this.cnvs.ctx.clearRect(0, 0, this.cnvs.width, this.cnvs.height)
    }

    drawPetal = () => {
        const { ctx, width, height } = this.cnvsPetal
        ctx.save()
        ctx.translate(width / 2, (height - this.petal.length) / 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'
        ctx.lineWidth = 0.5
        const cps = this.petal.drawLine(ctx)
        ctx.restore()
        return cps
    }

    draw = () => {
        if (this.type === 'petal' && this.petal.done) return

        const { ctx } = this.cnvs
        ctx.clearRect(0, 0, this.cnvs.width, this.cnvs.height)
        ctx.fillStyle = 'hsl(240, 4%, 10%)'
        ctx.fillRect(0, 0, this.cnvs.width, this.cnvs.height)
        ctx.save()

        let tx = (this.cnvs.width - this.width) / 2
        let ty = (this.cnvs.height - this.height) / 2
        ctx.translate(tx, ty)

        ctx.beginPath()
        ctx.fillStyle = 'hsl(0, 4%, 4%)'
        ctx.rect(-10, -10, this.width + 20, this.height + 20)
        ctx.fill()

        ctx.beginPath()
        ctx.strokeStyle = '#7b7b7b'
        ctx.rect(0, 0, this.width, this.height)
        ctx.stroke()

        if (this.type === 'star') {
            let a = (Math.PI * 2) / this.points
            this.drawPetal()
            for (let i = 0; i < this.points; i++) {
                ctx.save()
                ctx.translate(this.width / 2, this.height / 2)
                ctx.rotate(a * i)
                ctx.translate(-this.width / 2, -this.height / 2)
                ctx.drawImage(this.cnvsPetal.canvas, 0, 0, this.width, this.height)
                ctx.restore()
            }
        } else if (this.type === 'flower') {
            const a = (Math.PI * 2) / this.points
            this.drawPetal()
            for (let i = 0; i < this.points; i++) {
                ctx.save()
                ctx.translate(this.width / 2, this.height / 2)
                ctx.rotate(a * i)
                ctx.translate(-this.width / 2, -this.height / 2)
                ctx.translate(0, this.petal.length / 2)
                ctx.drawImage(this.cnvsPetal.canvas, 0, 0, this.width, this.height)
                ctx.restore()
            }
        } else {
            ctx.translate(this.width / 2, this.height / 2)
            ctx.rotate((this.rotate / 180) * Math.PI)
            ctx.translate(-this.width / 2, -this.height / 2)

            const cps = this.drawPetal()
            ctx.drawImage(this.cnvsPetal.canvas, 0, 0, this.width, this.height)
            if (cps && this.showMovingCps) {
                let { cp1, cp2 } = cps
                const cpCtx = this.cnvsCps.ctx
                cpCtx.save()
                cpCtx.translate(
                    this.cnvsCps.width / 2,
                    (this.cnvsCps.height - this.petal.length) / 2,
                )
                drawPoint(cpCtx, cp1.x, cp1.y, 2)
                drawPoint(cpCtx, cp2.x, cp2.y, 2)
                cpCtx.restore()

                ctx.drawImage(this.cnvsCps.canvas, 0, 0, this.width, this.height)
            }

            if (this.showBaseCps) {
                ctx.translate(
                    this.cnvsPetal.width / 2,
                    (this.cnvsPetal.height - this.petal.length) / 2,
                )
                const { cp1, cp2, length } = this.petal
                drawPoint(ctx, cp1.x * length, cp1.y * length, 5, '#f0f')
                drawPoint(ctx, cp2.x * length, cp2.y * length, 5, '#0ff')
            }
        }

        ctx.restore()
    }

    restart = () => {
        this.petal.restart()
        this.cnvsPetal.clear()
        this.cnvsCps.clear()
    }
}
