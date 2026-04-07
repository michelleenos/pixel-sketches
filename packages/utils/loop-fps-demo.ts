import { FixedFpsLoop, fixedFpsLoop, Loop } from './loop'

const ctrlsStyle: Partial<CSSStyleDeclaration> = {
    position: 'fixed',
    bottom: '0',
    right: '0',
    backgroundColor: '#fff',
    color: '#000',
    padding: '1rem',
}

const bigTextStyle: Partial<CSSStyleDeclaration> = {
    position: 'fixed',
    background: 'rgba(0,0,0,0.7)',
    color: '#fff',
    fontFamily: 'monospace',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '20px',
    textAlign: 'center',
}

const fpsLabelStyle: Partial<CSSStyleDeclaration> = {
    fontSize: '40px',
    lineHeight: '1.5',
}
const fpsTextStyle: Partial<CSSStyleDeclaration> = {
    fontSize: '100px',
    lineHeight: '1',
}

const controls = () => {
    const container = document.createElement('div')

    const label = document.createElement('label')
    label.innerText += 'fps: '
    const input = document.createElement('input')
    input.type = 'number'
    input.step = '1'
    input.min = '1'
    input.value = '60'
    label.appendChild(input)
    const btn = document.createElement('button')
    btn.innerHTML = 'stop'

    Object.assign(container.style, ctrlsStyle)

    container.append(label, btn)
    document.body.appendChild(container)
    return { input, btn }
}

const fpsStyle = `
.fps-demo{
	position: fixed;
    background: rgba(0,0,0,0.7);
    color: #fff;
    font-family: monospace;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
	padding:20px;
	text-align: center;
}
.fps-past {
	display: flex;
	column-gap: 10px;
}
.fps-current {font-size: 100px;font-weight:600;line-height:1;}
	.fps-label{
	font-size: 20px;
	}
	.fps-list {
	display: flex;
	align-items: baseline;
	column-gap: 10px;
	}
`

const bigText = () => {
    const el = document.createElement('div')
    el.className = 'fps-demo'
    el.innerHTML = `
	<div class="fps-label">measured fps:</div>
	<div class="fps-list">
		<div class="fps-past">
			<div class="fps-past-item">..</div>
			<div class="fps-past-item">..</div>
			<div class="fps-past-item">..</div>
			<div class="fps-past-item">..</div>
			<div class="fps-past-item">..</div>
			<div class="fps-past-item">..</div>
		</div>
		<div class="fps-current">..</div>
	</div>
`

    const fpsCur = el.querySelector('.fps-current')!
    const fpsPast = el.querySelector('.fps-past')!

    const style = document.createElement('style')
    style.innerText = fpsStyle
    document.body.append(el, style)

    const update = (val: string) => {
        const pastItems = fpsPast.children
        if (pastItems.length > 5) {
            pastItems[0].remove()
        }
        const newPastEl = document.createElement('div')
        newPastEl.className = 'fps-past-item'
        newPastEl.innerText = fpsCur.innerHTML
        fpsPast.appendChild(newPastEl)
        fpsCur.innerHTML = val
    }
    return { container: el, update }
}

export const fixedFpsLoopDemo = () => {
    let count = 0
    const loop = new FixedFpsLoop(() => {
        count++
    })

    const { input, btn } = controls()
    const { update } = bigText()
    input.addEventListener('change', () => {
        let val = +input.value
        if (!val || Number.isNaN(val)) return
        loop.fps = val
    })

    btn.addEventListener('click', () => {
        if (loop.looping) {
            loop.stop()
            btn.innerHTML = 'start'
        } else {
            loop.start()
            btn.innerHTML = 'stop'
        }
    })

    // log how many times the loop cb was called each second
    setInterval(() => {
        update(`${count}`)
        count = 0
    }, 1000)
}
