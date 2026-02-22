import fg from 'fast-glob'
import path from 'path'
import fs from 'fs/promises'
import HTMLWebpackPlugin from 'html-webpack-plugin'
import { fileURLToPath } from 'url'
import type { SketchConfigJson } from './sketch-config-type'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const htmlConfigShared: HTMLWebpackPlugin.Options = {
    template: 'template/sketch.ejs',
    minify: false,
}

const sharedChunks = ['style', 'sketchinfo']

interface SketchConfigOpts {
    slug: string
    filePath: string
    htmlConfig: HTMLWebpackPlugin.Options
}

export async function getSketchConfigs(sketchesDir: string) {
    const entries: Record<string, string> = {}
    const htmlConfigs: HTMLWebpackPlugin.Options[] = []

    const items = await fg(`${sketchesDir}/**/sketch.json`)

    for (const file of items) {
        const configs = await getSketchConfig(file)
        entries[configs.slug] = configs.filePath
        htmlConfigs.push(configs.htmlConfig)
    }

    return { entries, htmlConfigs }
}

async function getSketchConfig(file: string): Promise<SketchConfigOpts> {
    const sketchDir = path.dirname(file)
    const tsFilePath = path.resolve(__dirname, `${sketchDir}/sketch.ts`)

    try {
        await fs.access(tsFilePath)
    } catch {
        console.error(`file doesn't exist: ${tsFilePath}`)
    }

    const sketchConfig = JSON.parse(await fs.readFile(file, 'utf-8')) as SketchConfigJson
    const slug = sketchDir.split('/').reverse()[0] as string

    return {
        slug,
        filePath: tsFilePath,
        htmlConfig: {
            title: sketchConfig.title,
            filename: `${slug}/index.html`,
            chunks: [slug, ...sharedChunks],
            templateParameters: {
                useP5: sketchConfig.useP5 || false,
                created: sketchConfig.created,
                lastUpdated: sketchConfig.lastUpdated,
                description: sketchConfig.description,
            },
            ...htmlConfigShared,
        },
    }
}
