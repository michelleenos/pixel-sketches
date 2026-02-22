function info() {
    const info = document.querySelector<HTMLElement>('.sketchinfo')
    const infoToggle = document.querySelector<HTMLButtonElement>('button.sketchinfo__toggle')

    console.log({ info, infoToggle })

    if (!info || !infoToggle) return

    let open = infoToggle.getAttribute('aria-expanded') === 'true'

    infoToggle.addEventListener('click', () => {
        open = !open
        infoToggle.setAttribute('aria-expanded', `${open}`)
        info.classList.toggle('sketchinfo--open', open)
    })
}

info()
