import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'
import { fileURLToPath } from 'url'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import WebpackRemoveEmptyScriptsPlugin from 'webpack-remove-empty-scripts'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { getSketchConfigs } from './config/get-sketches.ts'
import CopyPlugin from 'copy-webpack-plugin'

// console.log(process.argv)

const analyze = process.argv.includes('--analyze')
const isProduction = process.env.NODE_ENV === 'production'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sketchesDir = path.resolve(__dirname, './sketches')
const sketchConfigs = await getSketchConfigs(sketchesDir)

const sortedSketches = sketchConfigs.sketchJsons.sort((a, b) => {
    if (a.slug.toUpperCase() < b.slug.toUpperCase()) {
        return -1
    }
    return 1
})

const plugins = [
    ...sketchConfigs.htmlConfigs.map((c) => new HtmlWebpackPlugin(c)),
    new HtmlWebpackPlugin({
        title: 'Code Art Gallery',
        filename: 'index.html',
        template: path.resolve(__dirname, 'shared/index.ejs'),
        chunks: ['galleryIndex', 'style'],
        templateParameters: {
            sketches: sortedSketches,
        },
    }),
    new MiniCssExtractPlugin({
        filename: 'style.css',
    }),
    new WebpackRemoveEmptyScriptsPlugin(),
    new CopyPlugin({
        patterns: [
            {
                from: path.resolve(__dirname, 'shared/sketches-info.json'),

                transform() {
                    return JSON.stringify(sketchConfigs.sketchJsons)
                },
            },
        ],
    }),
]

if (analyze) plugins.push(new BundleAnalyzerPlugin())

/** @type {import('webpack').Configuration} */
const config = {
    mode: isProduction ? 'production' : 'development',

    entry: {
        ...sketchConfigs.entries,
        galleryIndex: path.resolve(__dirname, 'shared/gallery-index.ts'),
        sketchinfo: path.resolve(__dirname, 'shared/sketchinfo.ts'),
        style: path.resolve(__dirname, 'shared/shared-style.scss'),
    },
    module: {
        rules: [
            // { test: /\.ts$/, loader: 'ts-loader' },
            {
                test: /\.[jt]sx?$/,
                loader: 'esbuild-loader',
                options: {
                    supported: {
                        'import-meta': true,
                    },
                },
            },
            {
                test: /\.s[ac]ss$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
        ],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    externals: ['p5', 'p5/global'],
    optimization: {
        splitChunks: {
            chunks: 'all',
            // minChunks: 2,
            name: false,
        },
        runtimeChunk: 'single',
    },
    // devServer: {
    //     devMiddleware: {
    //         writeToDisk: true,
    //     },
    // },
    plugins,
    devtool: isProduction ? false : 'source-map',
}

export default config
