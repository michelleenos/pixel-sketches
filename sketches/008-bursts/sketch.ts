import { Cnvs, easing, random } from 'utils'
import { hexToHsb, hsbToHex } from './colors'
import { generateNoise } from './generate-noise'
import { GUI } from 'lil-gui'

let red = '#f24333' // 4
let orange = '#ff8019' // 3
let yellow = '#f6b02c' // 2
let blue = '#2ec2ea' // 0
let green = '#3bed73' // 1
let pink = '#fc6c9c' // 5

const params = {
    countX: 3,
    countY: 4,
    spaceX: 0,
    spaceY: 10,
    dotsPosMin: 0.15,
    dotsPosMax: 0.45,
    dotsRadiusMin: 0.01,
    dotsRadiusMax: 0.05,
    flamesRadiusMin: 0.5,
    flamesRadiusMax: 0.75,
    flamesThicknessMin: 0.15,
    flamesThicknessMax: 0.4,
    florRadiusMin: 0.8,
    florRadiusMax: 1,
}

const cnvs = new Cnvs({ autoResize: false })

// *************** Drawing Functions *************** //

interface BurstParams {
    thickness: number
    radiusInner: number
    length: number
    sides?: number
    style?: 'strokeTop' | 'fill'
}

function burst(
    ctx: CanvasRenderingContext2D,
    { thickness, length, radiusInner, sides = 20, style = 'fill' }: BurstParams,
) {
    let radiusOuter = radiusInner + length - thickness

    for (let i = 0; i < sides; i++) {
        let angle = (i / sides) * Math.PI * 2

        ctx.save()
        ctx.rotate(angle)
        if (style === 'fill') {
            ctx.beginPath()
            ctx.moveTo(-thickness, radiusInner)
            ctx.lineTo(thickness, radiusInner)
            ctx.lineTo(thickness, radiusOuter)
            ctx.arc(0, radiusOuter, thickness, 0, Math.PI)
            ctx.closePath()
            ctx.fill()
        } else {
            ctx.beginPath()
            ctx.moveTo(thickness, radiusInner)
            ctx.lineTo(thickness, radiusOuter)
            ctx.arc(0, radiusOuter, thickness, 0, Math.PI)
            ctx.lineTo(-thickness, radiusInner)
            ctx.stroke()
        }

        ctx.restore()
    }
}

interface BurstFlamesParams {
    radius: number
    sides: number
    color: string
    thicknessAmt?: number
    innerSteps?: number
}
function burstFlames(
    ctx: CanvasRenderingContext2D,
    { radius, sides, color, thicknessAmt = 0.2, innerSteps = 3 }: BurstFlamesParams,
) {
    let baseColor = hexToHsb(color)

    let prevRadius = 0

    for (let j = 0; j < 3; j++) {
        let je = (j + 1) / 3
        je = easing.inQuad(je)
        let r = je * radius
        // let rInner = easing.inCubic(j / 3) * radius
        let rInner = Math.max(prevRadius - r * 0.1, 0)
        prevRadius = r
        let thickness = r * thicknessAmt
        let distMult = thickness * 0.5
        for (let i = 0; i < innerSteps; i++) {
            let col = { ...baseColor }
            col.h = col.h - i * i * 9
            col.s = col.h < 20 ? col.s - i : col.s + i * 5
            ctx.fillStyle = hsbToHex(col)

            let length = r - distMult * (innerSteps - 1) - rInner + distMult * i
            if (length <= 0) continue
            burst(ctx, {
                thickness,
                radiusInner: rInner,
                length,
                sides,
                style: 'fill',
            })
        }
    }
}

interface BurstFlorParams {
    radius: number
    color: string
    count?: number
    sides: number
}

function burstFlor(
    ctx: CanvasRenderingContext2D,
    { radius, sides, color, count = 5 }: BurstFlorParams,
) {
    let colHsb = hexToHsb(color)
    ctx.lineWidth = radius * 0.02

    // let rInner = radiusInner
    let thicknessMax = radius * 0.16
    let thicknessAcc = 0

    for (let i = 0; i < count; i++) {
        let stroke = { ...colHsb }
        let fill = { ...colHsb }
        stroke.b -= 10

        if (colHsb.h < 100) {
            // yellow = 39, 82, 96
            stroke.h -= i * 20
            fill.h -= i * 15
        } else if (colHsb.h < 150) {
            // green 139, 75, 93
            fill.h -= i * 20
            fill.s -= i * 4
            fill.b = Math.min(fill.b + i * 5, 100)
        } else if (colHsb.h < 200) {
            // blue 193, 80, 92
            fill.h += i * 8
            fill.s += i
        } else {
            // pink 340, 57, 99
            stroke.h -= 20 + i * 10
            fill.h -= i * 20
            fill.s += i * 2
        }

        ctx.fillStyle = hsbToHex(fill)
        ctx.strokeStyle = hsbToHex(stroke)
        let frac = i / count
        let thickness = thicknessMax - radius * 0.08 * frac

        let radiusInner = radius - thickness - thicknessAcc
        thicknessAcc += thickness

        burst(ctx, {
            thickness,
            length: thickness,
            radiusInner,
            sides,
            style: 'fill',
        })
        burst(ctx, {
            thickness: thickness * 0.7,
            length: thickness * 0.7,
            radiusInner,
            sides,
            style: 'strokeTop',
        })
    }
}

interface DotsParams {
    color: string
    sides: number
    dotRadius: number
    dotPos: number
    fill?: boolean
}
function dots(
    ctx: CanvasRenderingContext2D,
    { color, sides, dotRadius, dotPos, fill = true }: DotsParams,
) {
    for (let i = 0; i < sides; i++) {
        let angle = (i / sides) * Math.PI * 2 + Math.PI / sides
        ctx.save()
        ctx.rotate(angle)
        ctx.beginPath()
        ctx.arc(0, dotPos, dotRadius, 0, Math.PI * 2)
        if (fill) {
            ctx.fillStyle = color
            ctx.fill()
        } else {
            ctx.strokeStyle = color
            ctx.stroke()
        }
        ctx.restore()
    }
}

// *************** Main Draw Fn *************** //

function draw() {
    const { ctx, width, height } = cnvs
    const noiseImage = generateNoise(width, height)
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#121212'
    ctx.fillRect(0, 0, width, height)

    ctx.save()
    ctx.globalAlpha = 0.035
    ctx.drawImage(noiseImage, 0, 0, width, height)
    ctx.restore()

    ctx.save()
    ctx.translate(width / 2, height / 2)
    let m = Math.min(width, height) * 0.9

    const { spaceX, spaceY, countX, countY } = params
    const cellSizeX = (m - spaceX * (countX - 1)) / countX
    const cellSizeY = (m - spaceY * (countY - 1)) / countY
    const cellSize = Math.min(cellSizeX, cellSizeY)
    ctx.translate((cellSizeX - m) * 0.5, (cellSizeY - m) * 0.5)

    for (let cx = 0; cx < countX; cx++) {
        for (let cy = 0; cy < countY; cy++) {
            ctx.save()
            ctx.translate(cx * cellSizeX + spaceX * cx, cy * cellSizeY + spaceY * cy)
            const sides = random([3, 4, 4, 5, 5, 6])

            ctx.globalCompositeOperation = random(['lighter', 'screen'])
            const colorFlor = random([blue, pink, yellow, orange])
            const double = random() < 0.5
            burstFlor(ctx, {
                radius: (cellSize / 2) * random(params.florRadiusMin, params.florRadiusMax),
                color: colorFlor,
                count: random([4, 5]),
                sides: double ? sides * 2 : sides,
            })
            if (!double && random() < 0.8) {
                const dotRadius = cellSize * random(params.dotsRadiusMin, params.dotsRadiusMax)
                const dotPos = cellSize * random(params.dotsPosMin, params.dotsPosMax)
                dots(ctx, {
                    color: colorFlor,
                    sides,
                    dotRadius,
                    dotPos,
                    fill: random() < 0.5,
                })
            }

            ctx.globalCompositeOperation = random(['lighten', 'screen'])
            ctx.globalAlpha = 0.8
            let colorFlames = random([orange, red, yellow, pink])
            burstFlames(ctx, {
                radius: cellSize * 0.5 * random(params.flamesRadiusMin, params.flamesRadiusMax),
                thicknessAmt: random(params.flamesThicknessMin, params.flamesThicknessMax),
                sides,
                color: colorFlames,
            })

            ctx.globalAlpha = 0.6
            if (random() < 0.5) {
                ctx.rotate(Math.PI / sides)
                burstFlames(ctx, {
                    radius: cellSize * 0.5 * random(params.flamesRadiusMin, params.flamesRadiusMax),
                    sides,
                    color: colorFlames,
                })
            }

            if (random() < 0.5) {
                ctx.globalCompositeOperation = 'color-burn'
                ctx.globalAlpha = 0.3
                ctx.beginPath()
                ctx.arc(0, 0, cellSize * random(0.15, 0.3), 0, Math.PI * 2)
                ctx.fillStyle = random([pink, yellow])
                ctx.fill()
            } else {
                ctx.globalCompositeOperation = random(['lighter', 'screen'])
                ctx.globalAlpha = 0.8
                ctx.beginPath()
                ctx.arc(0, 0, cellSize * random(0.15, 0.4), 0, Math.PI * 2)
                ctx.lineWidth = cellSize * random(0.03, 0.06)
                ctx.strokeStyle = random([green, blue, pink, yellow])
                ctx.stroke()
            }

            ctx.restore()
        }
    }

    ctx.restore()
}

// *************** GUI *************** //

const gui = new GUI()
gui.add(params, 'countX', 0, 30, 1)
gui.add(params, 'countY', 0, 30, 1)
gui.add(params, 'spaceX', 0, 150, 1)
gui.add(params, 'spaceY', 0, 150, 1)
gui.add(params, 'dotsPosMin', 0, 0.5, 0.01)
gui.add(params, 'dotsPosMax', 0, 0.5, 0.01)
gui.add(params, 'dotsRadiusMin', 0, 1, 0.01)
gui.add(params, 'dotsRadiusMax', 0, 1, 0.01)
gui.add(params, 'flamesRadiusMin', 0, 1, 0.01)
gui.add(params, 'flamesRadiusMax', 0, 1, 0.01)
gui.add(params, 'flamesThicknessMin', 0, 1, 0.01)
gui.add(params, 'flamesThicknessMax', 0, 1, 0.01)
gui.add(params, 'florRadiusMin', 0, 1, 0.01)
gui.add(params, 'florRadiusMax', 0, 1, 0.01)

gui.onChange(draw)

// *************** Events *************** //

window.addEventListener('resize', () => {
    cnvs.setSize(window.innerWidth, window.innerHeight)
    draw()
})

window.addEventListener('click', () => {
    draw()
})

draw()
