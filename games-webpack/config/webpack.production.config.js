const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const glob = require('glob')
const TerserPlugin = require('terser-webpack-plugin')

let config = {
    mode: 'production',
    entry: {
        'App': './src/pong/Pong.js',
    },
    output: {
        filename: '[name].[contenthash].js',  
        path: path.resolve(__dirname, '../dist'),
        library: {
            name: '[name]',
            type: 'global',
            export: 'default',
        },
        clean: true,
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
            }    
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            terserOptions: {
                compress: {
                    drop_console: true,
                },
            },
        })],
    },
}



module.exports = config