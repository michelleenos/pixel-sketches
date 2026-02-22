import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'
import { fileURLToPath } from 'url'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import WebpackRemoveEmptyScriptsPlugin from 'webpack-remove-empty-scripts'
import { getSketchConfigs } from './config/get-sketches.ts'

const isProduction = process.env.NODE_ENV === 'production'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sketchesDir = path.resolve(__dirname, './sketches')
const sketchConfigs = await getSketchConfigs(sketchesDir)

/** @type {import('webpack').Configuration} */
const config = {
    mode: isProduction ? 'production' : 'development',
    entry: {
        ...sketchConfigs.entries,
        sketchinfo: path.resolve(__dirname, 'template/sketchinfo.ts'),
        style: path.resolve(__dirname, 'template/shared-style.scss'),
    },
    module: {
        rules: [
            { test: /\.ts$/, loader: 'ts-loader' },
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
    externals: ['p5'],
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                shared: {
                    name: 'shared',
                },
            },
        },
        runtimeChunk: 'single',
    },
    plugins: [
        ...sketchConfigs.htmlConfigs.map((c) => new HtmlWebpackPlugin(c)),
        new MiniCssExtractPlugin({
            filename: 'style.css',
        }),
        new WebpackRemoveEmptyScriptsPlugin(),
    ],
    devtool: isProduction ? false : 'cheap-source-map',
}

export default config
