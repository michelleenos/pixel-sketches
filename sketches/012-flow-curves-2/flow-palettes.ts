import type GUI from 'lil-gui'
import { getPaletteVariants, type PaletteVariant } from 'mish-bainrow'
import type { FlowPalette } from './flow2.types'

export const palettes = getPaletteVariants({
    isolateColors: true,
    minContrastBg: 1.5,
    minColors: 3,
    // includePalettes: ['market', 'magritte', 'earthGem2', 'autmn', 'glowFish', 'harimau'],
    bgColor: {
        type: 'edge',
        edge: 20,
    },
})

export const palettesByName = Object.fromEntries(palettes.map((p) => [p.name, p]))

export function makePalettesGui(
    gui: GUI,
    currentPalette: FlowPalette,
    onUpdate: (pal: FlowPalette) => void,
) {
    const paletteProxy = {
        paletteIndex: (palettes as FlowPalette[]).indexOf(currentPalette),
        palette: currentPalette,
    }
    const select = gui
        .add(paletteProxy, 'palette', palettesByName)
        .onChange((pal: PaletteVariant) => {
            setPalette(pal, palettes.indexOf(pal))
            slider.updateDisplay()
        })
    const slider = gui
        .add(paletteProxy, 'paletteIndex', 0, palettes.length - 1, 1)
        .onChange((i: number) => {
            let palette = palettes[i]
            setPalette(palettes[i], i)
            select.updateDisplay()
        })

    const setPalette = (p: PaletteVariant, idx: number) => {
        paletteProxy.palette = p
        paletteProxy.paletteIndex = idx
        onUpdate(p)
    }
}
