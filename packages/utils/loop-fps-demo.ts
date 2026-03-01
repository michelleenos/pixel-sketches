import { fixedFpsLoop } from './loop'

const labelStyle: Partial<CSSStyleDeclaration> = {
    position: 'fixed',
    bottom: '0',
    right: '0',
    backgroundColor: '#fff',
    color: '#000',
    padding: '1rem',
}

const controls = () => {
    const label = document.createElement('label')
    label.innerText += 'fps: '
    const input = document.createElement('input')
    input.type = 'number'
    input.step = '1'
    input.min = '1'
    input.value = '60'
    label.appendChild(input)
    document.body.appendChild(label)

    Object.assign(label.style, labelStyle)
    return { input, label }
}

export const fixedFpsLoopDemo = () => {
    let count = 0
    const loop = fixedFpsLoop(() => {
        count++
    })

    const { input } = controls()
    input.addEventListener('change', () => {
        let val = +input.value
        if (!val || Number.isNaN(val)) return
        loop.fps = val
    })

    // log how many times the loop cb was called each second
    setInterval(() => {
        console.log(count)
        count = 0
    }, 1000)
}
