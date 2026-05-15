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

type SwarmParamWithKey = Exclude<keyof SwarmParams, 'clear' | 'newColors'>

const keys = ['as', 'df', 'zx', 'cv', 'qw', 'er', 'ty', 'gh', 'bn', 'ui', 'jk', 'op']

const paramKeys: Record<SwarmParamWithKey, string[]> = {
    damping: keys[0].split(''),
    maxVel: keys[1].split(''),
    bubbleSize: keys[2].split(''),
    mouseMass: keys[3].split(''),
    mouseSize: keys[4].split(''),
    mouseDistMin: keys[5].split(''),
    mouseDistMax: keys[6].split(''),
    massMax: keys[7].split(''),
    massMin: keys[8].split(''),
    mouseDistPow: keys[9].split(''),
    bubbleDistMin: keys[10].split(''),
    bubbleDistPow: keys[11].split(''),
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

        const writeVal = (key: SwarmParamWithKey) => {
            writeText(`${key.padEnd(15, ' ')} (${paramKeys[key].join(', ')}): ${P[key]}`)
        }

        ctx.save()

        if (paramsShown) {
            ctx.translate(10, height - 360)

            writeVal('damping')
            writeVal('maxVel')
            writeVal('bubbleSize')
            writeVal('mouseMass')
            writeVal('mouseSize')
            writeVal('mouseDistMin')
            writeVal('mouseDistMax')
            writeVal('massMin')
            writeVal('massMax')
            writeVal('mouseDistPow')
            writeVal('bubbleDistMin')
            writeVal('bubbleDistPow')
            writeText(' ')
            writeText('shift + key = bigger change')
            writeText('spacebar    = clear particles')
            writeText('.           = new colors')
            writeText(',           = reset parameters')
            writeText('/           = hide parameters')
        } else {
            ctx.translate(10, height - 40)
            writeText('click + drag to add')
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
            case paramKeys.damping[0]:
                adjust('damping', 0.001 * shift, 3, 0, 1)
                break
            case paramKeys.damping[1]:
                adjust('damping', -0.001 * shift, 3, 0, 1)
                break
            case paramKeys.maxVel[0]:
                adjust('maxVel', 0.1 * shift, 1, 0)
                break
            case paramKeys.maxVel[1]:
                adjust('maxVel', -0.1 * shift, 1, 0)
                break
            case paramKeys.bubbleSize[0]:
                adjust('bubbleSize', -1 * shift, 0)
                break
            case paramKeys.bubbleSize[1]:
                adjust('bubbleSize', 1 * shift, 0)
                break
            case paramKeys.mouseMass[0]:
                adjust('mouseMass', -1 * shift, 1, 1)
                break
            case paramKeys.mouseMass[1]:
                adjust('mouseMass', 1 * shift, 1)
                break
            case paramKeys.mouseSize[0]:
                adjust('mouseSize', -1 * shift, 0, 1)
                break
            case paramKeys.mouseSize[1]:
                adjust('mouseSize', 1 * shift, 0)
                break
            case paramKeys.mouseDistMin[0]:
                adjust('mouseDistMin', -1 * shift, 1, 5)
                break
            case paramKeys.mouseDistMin[1]:
                adjust('mouseDistMin', 1 * shift, 1, 5)
                break
            case paramKeys.mouseDistMax[0]:
                adjust('mouseDistMax', -1 * shift, 1, 5)
                break
            case paramKeys.mouseDistMax[1]:
                adjust('mouseDistMax', 1 * shift, 1, 5)
                break
            case paramKeys.massMax[0]:
                adjust('massMax', -0.1 * shift, 1, 0.1)
                break
            case paramKeys.massMax[1]:
                adjust('massMax', 0.1 * shift, 1, 0.1)
                break
            case paramKeys.massMin[0]:
                adjust('massMin', -0.1 * shift, 0, 0.1)
                break
            case paramKeys.massMin[1]:
                adjust('massMin', 0.1 * shift, 0, 0.1)
                break
            case paramKeys.mouseDistPow[0]:
                adjust('mouseDistPow', -0.1 * shift, 1, 0.1)
                break
            case paramKeys.mouseDistPow[1]:
                adjust('mouseDistPow', 0.1 * shift, 1, 0.1)
                break
            case paramKeys.bubbleDistMin[0]:
                adjust('bubbleDistMin', -1 * shift, 0, 5)
                break
            case paramKeys.bubbleDistMin[1]:
                adjust('bubbleDistMin', 1 * shift, 0, 5)
                break
            case paramKeys.bubbleDistPow[0]:
                adjust('bubbleDistPow', -0.1 * shift, 1, 0.1)
                break
            case paramKeys.bubbleDistPow[1]:
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
