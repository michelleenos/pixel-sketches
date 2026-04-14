import { round } from 'utils'

interface SwarmParams {
    massMin: number
    massMax: number
    maxVel: number
    damping: number
    bubbleDistMin: number
    bubbleDistPow: number
    bubbleSize: number
    mouseMass: number
    mouseSize: number
    mouseDistMin: number
    mouseDistMax: number
    mouseDistPow: number
    clear: () => void
    newColors: () => void
}

export function swarmKeys(P: SwarmParams) {
    const defaultParams = { ...P }
    let paramsShown = false
    function adjust(
        param: Exclude<keyof SwarmParams, 'clear' | 'newColors'>,
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
        ctx.font = '12px monospace'
        ctx.textAlign = 'left'

        let curY = 0
        const writeText = (text: string) => {
            ctx.fillText(text, 0, curY)
            curY += 20
        }

        ctx.save()

        if (paramsShown) {
            ctx.translate(10, height - 360)

            writeText(`damping          (z, x): ${P.damping}`)
            writeText(`maxVel           (v, b): ${P.maxVel}`)
            writeText(`bubbleSize       (a, s): ${P.bubbleSize}`)
            writeText(`mouseMass        (c, v): ${P.mouseMass}`)
            writeText(`mouseSize        (d, f): ${P.mouseSize}`)
            writeText(`mouseDistMin     (e, r): ${P.mouseDistMin}`)
            writeText(`mouseDistMax     (t, y): ${P.mouseDistMax}`)
            writeText(`massMin          (n, m): ${P.massMin}`)
            writeText(`massMax          (g, h): ${P.massMax}`)
            writeText(`mouseDistPow     (j, k): ${P.mouseDistPow}`)
            writeText(`bubbleDistMin    (u, i): ${P.bubbleDistMin}`)
            writeText(`bubbleDistPow    (o, p): ${P.bubbleDistPow}`)
            writeText(' ')
            writeText('shift + key = bigger change')
            writeText('spacebar    = clear particles')
            writeText('.           = new colors')
            writeText(',           = reset parameters')
            writeText('/           = hide parameters')
        } else {
            ctx.translate(10, height - 20)
            writeText(`press / to view options`)
        }

        ctx.restore()
    }

    function resetParams() {
        ;(Object.keys(defaultParams) as (keyof SwarmParams)[]).forEach((key) => {
            if (key === 'clear' || key === 'newColors') return
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
            case 'b':
                adjust('maxVel', 0.1 * shift, 1, 0)
                break
            case 'v':
                adjust('maxVel', -0.1 * shift, 1, 0)
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
            case 't':
                adjust('mouseDistMax', -1 * shift, 1, 5)
                break
            case 'y':
                adjust('mouseDistMax', 1 * shift, 1, 5)
                break
            case 'g':
                adjust('massMax', -0.1 * shift, 1, 0.1)
                break
            case 'h':
                adjust('massMax', 0.1 * shift, 1, 0.1)
                break
            case 'n':
                adjust('massMin', -0.1 * shift, 0, 0.1)
                break
            case 'm':
                adjust('massMin', 0.1 * shift, 0, 0.1)
                break
            case 'j':
                adjust('mouseDistPow', -0.1 * shift, 1, 0.1)
                break
            case 'k':
                adjust('mouseDistPow', 0.1 * shift, 1, 0.1)
                break
            case 'u':
                adjust('bubbleDistMin', -1 * shift, 0, 5)
                break
            case 'i':
                adjust('bubbleDistMin', 1 * shift, 0, 5)
                break
            case 'o':
                adjust('bubbleDistPow', -0.1 * shift, 1, 0.1)
                break
            case 'p':
                adjust('bubbleDistPow', 0.1 * shift, 1, 0.1)
                break
            case ',':
                resetParams()
                break
            case '.':
                P.newColors()
                break
            case '/':
                paramsShown = !paramsShown
                break
            default:
                break
        }
    })

    return drawParams
}
