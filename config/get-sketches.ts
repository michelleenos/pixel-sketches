import fg from 'fast-glob'
import path from 'path'
import fs from 'fs/promises'
import HTMLWebpackPlugin from 'html-webpack-plugin'
import { fileURLToPath } from 'url'
import { styleText } from 'util'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log({ __filename, __dirname })
const htmlConfigShared: HTMLWebpackPlugin.Options = {
    template: 'shared/sketch.ejs',
    minify: false,
}

const sharedChunks = ['style', 'sketchinfo']

interface SketchConfigJson {
    title?: string
    useP5?: boolean
    created?: string
    lastUpdated?: string
    description?: string
    skip?: boolean
}

interface SketchConfigOpts {
    slug: string
    filePath: string
    htmlConfig: HTMLWebpackPlugin.Options
    sketchJson: SketchConfigJson & {
        slug: string
    }
}

export async function getSketchConfigs(sketchesDir: string) {
    const entries: Record<string, string> = {}
    const htmlConfigs: HTMLWebpackPlugin.Options[] = []
    const sketchJsons: (SketchConfigJson & { slug: string })[] = []

    const items = await fg(`${sketchesDir}/**/sketch.json`)

    for (const file of items) {
        try {
            const configs = await getSketchConfig(file, sketchesDir)
            if (configs.sketchJson.skip) continue
            entries[configs.slug] = configs.filePath
            htmlConfigs.push(configs.htmlConfig)
            sketchJsons.push(configs.sketchJson)
        } catch (e) {
            console.log(styleText(['bgRedBright'], 'error parsing sketch: '))
            console.log(file, e)
        }
    }

    return { entries, htmlConfigs, sketchJsons }
}

async function getSketchConfig(file: string, sketchesDir: string): Promise<SketchConfigOpts> {
    const sketchDir = path.dirname(file)
    const tsFilePath = path.resolve(__dirname, `${sketchDir}/sketch.ts`)

    try {
        await fs.access(tsFilePath)
    } catch {
        throw new Error(`file doesn't exist: ${tsFilePath}`)
    }

    const sketchConfig = JSON.parse(await fs.readFile(file, 'utf-8')) as SketchConfigJson
    const sketchPath = path.relative(sketchesDir, sketchDir)
    // console.log(sketchPath)
    // const slug = sketchDir.split('/').reverse()[0] as string
    const slug = sketchPath

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
        sketchJson: {
            ...sketchConfig,
            slug,
        },
    }
}
