import { createElement } from 'utils'

export const flowElements = (margin = 50) => {
    const canvas = createElement('canvas', { style: 'display:block' })
    const loading = createElement(
        'div',
        {
            style: 'background:#fff;text-align:center;display:none;align-items:center;justify-content:center;font-size:18px;position:absolute;width:100%;height:100%;top:0;left:0;color:#000;font-weight:600;opacity:0.8',
        },
        ['generating...'],
    )
    const container = createElement(
        'div',
        { style: `position:relative;display:inline-block;margin:${margin}px` },
        [canvas, loading],
    )

    document.body.appendChild(container)

    return { canvas, loading, container }
}
