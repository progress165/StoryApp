const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const WorkboxWebpackPlugin = require('workbox-webpack-plugin'); // <-- Komentari atau hapus baris ini

module.exports = {
    entry: {
        main: path.resolve(__dirname, 'src/main.js'),
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js',
        clean: true,
        publicPath: '/',
    },

    mode: 'development',

    devServer: {
        static: {
            directory: path.resolve(__dirname, 'public'),
        },
        port: 9000,
        open: true,
        hot: true,
        historyApiFallback: true,
        devMiddleware: {
            publicPath: '/',
        },
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },

    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'public/index.html'),
            filename: 'index.html',
        }),
        // --- Komentari atau hapus plugin Workbox di sini ---
        // new WorkboxWebpackPlugin.GenerateSW({
        //     clientsClaim: true,
        //     skipWaiting: true,
        //     runtimeCaching: [
        //         { urlPattern: ({ url }) => url.origin === 'https://story-api.dicoding.dev', handler: 'NetworkFirst', options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7, }, }, },
        //         { urlPattern: ({ url }) => url.origin === 'https://api.maptiler.com', handler: 'CacheFirst', options: { cacheName: 'maptiler-tiles', expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30, }, }, },
        //         { urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com', handler: 'CacheFirst', options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30, }, }, },
        //     ],
        // }),
        // --- Akhir komentar/penghapusan plugin Workbox ---
    ],
};
