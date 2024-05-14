const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const glob = require('glob')
const webpack = require('webpack')

let config = {
    mode: 'development',
    entry: {
        'index': './src/index.js',
        'Pong': './src/pong/Pong.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../dist'),
        library: {
            name: '[name]',
            type: 'global',
            export: 'default',
        },
        publicPath: '/',
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9999,
    },
    resolve: {
        alias: {
            '@components': path.resolve(__dirname, '../src/components'),
            '@sass': path.resolve(__dirname, '../src/sass'),
        },
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
    externals: {
        'jquery': 'jQuery',
        'bootstrap': 'bootstrap',
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    MiniCssExtractPlugin.loader, 
                    {
                        loader: 'css-loader',
                        options: {
                            url: false,
                        },
                    },
                    'sass-loader',
                ],
            },
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                }
            },
            {
                test: /\.ejs$/,
                use: [
                    {
                        loader: 'ejs-loader',
                        options: {
                            variable: 'data',
                            esModule: false, // other wise "require" in does not work .ejs
                        },
                    }
                ],
            },
            {
                test: /\.worker\.js$/, // Fichiers pour Web Workers
                use: { loader: 'worker-loader' },
            },  
        ],
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
        }),
        //new webpack.HotModuleReplacementPlugin(),
    ],
}


module.exports = config