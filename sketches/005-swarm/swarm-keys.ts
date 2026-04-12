import { round } from 'utils'

interface SwarmParams {
    massMin: number
    massMax: number
    damping: number
    bubbleDistMin: number
    bubbleDistPow: number
    bubbleSize: number
    mouseMass: number
    mouseSize: number
    mouseDistMin: number
    mouseDistPow: number
    mouseAlignMult: number
    mouseAlignSmooth: number
    clear: () => void
}

export function swarmKeys(P: SwarmParams) {
    const defaultParams = { ...P }
    function adjust(
        param: Exclude<keyof SwarmParams, 'clear'>,
        amount: number,
        places = 2,
        min?: number,
        max?: number,
    ) {
        let newVal = P[param] + amount
        if (typeof min === 'number' && newVal < min) newVal = min
        if (typeof max === 'number' && newVal > max) newVal = max
        P[param] = round(newVal, places)
    }

    function drawParams(ctx: CanvasRenderingContext2D, height: number) {
        ctx.fillStyle = '#fff'
        ctx.font = '12px monospace'
        ctx.textAlign = 'left'

        let curY = 0
        const writeText = (text: string) => {
            ctx.fillText(text, 0, curY)
            curY += 20
        }

        ctx.save()
        ctx.translate(10, height - 220)

        writeText(`damping          (z, x): ${P.damping}`)
        writeText(`bubbleSize       (a, s): ${P.bubbleSize}`)
        writeText(`mouseMass        (c, v): ${P.mouseMass}`)
        writeText(`mouseSize        (d, f): ${P.mouseSize}`)
        writeText(`mouseDistMin     (e, r): ${P.mouseDistMin}`)
        writeText(`mouseAlignMult   (g, h): ${P.mouseAlignMult}`)
        writeText(`mouseAlignSmooth (n, m): ${P.mouseAlignSmooth}`)
        writeText(' ')
        writeText('shift + key = bigger change')
        writeText('spacebar    = clear particles')
        writeText('/           = reset parameters')

        ctx.restore()
    }

    function resetParams() {
        ;(Object.keys(defaultParams) as (keyof SwarmParams)[]).forEach((key) => {
            if (key === 'clear') return
            P[key] = defaultParams[key]
        })
    }

    window.addEventListener('keypress', (e) => {
        let shift = e.shiftKey ? 10 : 1
        switch (e.key.toLowerCase()) {
            case ' ':
                P.clear()
                break
            case 'x':
                adjust('damping', 0.001 * shift, 3, 0, 1)
                break
            case 'z':
                adjust('damping', -0.001 * shift, 3, 0, 1)
                break
            case 'a':
                adjust('bubbleSize', -1 * shift, 0)
                break
            case 's':
                adjust('bubbleSize', 1 * shift, 0)
                break
            case 'c':
                adjust('mouseMass', -1 * shift, 1, 1)
                break
            case 'v':
                adjust('mouseMass', 1 * shift, 1)
                break
            case 'd':
                adjust('mouseSize', -1 * shift, 0, 1)
                break
            case 'f':
                adjust('mouseSize', 1 * shift, 0)
                break
            case 'e':
                adjust('mouseDistMin', -1 * shift, 1, 5)
                break
            case 'r':
                adjust('mouseDistMin', 1 * shift, 1, 5)
                break
            case 'g':
                adjust('mouseAlignMult', -0.1 * shift, 1, 0)
                break
            case 'h':
                adjust('mouseAlignMult', 0.1 * shift, 1, 0)
                break
            case 'n':
                adjust('mouseAlignSmooth', -0.01 * shift, 2, 0, 1)
                break
            case 'm':
                adjust('mouseAlignSmooth', 0.01 * shift, 2, 0, 1)
                break
            case '/':
                resetParams()
                break
            default:
                break
        }
    })

    return drawParams
}
