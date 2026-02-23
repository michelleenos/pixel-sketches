type StringOrEl = string | Element

export function setAttributes(
    el: HTMLElement | SVGElement,
    attrs: { [key: string]: string | number },
) {
    Object.entries(attrs).forEach(([key, value]) => {
        el.setAttribute(key, `${value}`)
    })
}

export function createElement<T extends keyof HTMLElementTagNameMap>(
    tag: T,
    atts?: Record<string, string | number>,
    children: StringOrEl | StringOrEl[] = [],
): HTMLElementTagNameMap[T] {
    const el = document.createElement<T>(tag)

    if (atts) setAttributes(el, atts)
    ;(Array.isArray(children) ? children : [children]).forEach((child) => {
        if (typeof child === 'string') {
            el.innerHTML += child
        } else {
            el.appendChild(child)
        }
    })

    return el
}
