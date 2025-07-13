const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        main: path.resolve(__dirname, 'src/main.js'),
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js',
        clean: true,
        // --- PENTING: publicPath sudah diatur ke '/' ---
        publicPath: '/', // Ini sempurna untuk Firebase Hosting
        // --- AKHIR VERIFIKASI ---
    },

    mode: 'production', // Mode ini akan digunakan untuk build

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

    resolve: {
        modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
        extensions: ['.js', '.json', '.wasm', '.css'],
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            url: true,
                        },
                    },
                ],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
                generator: {
                    publicPath: '/', // Ini juga harus '/' untuk Firebase Hosting
                    filename: 'assets/images/[name].[hash][ext]',
                },
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
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'public/manifest.json'),
                    to: path.resolve(__dirname, 'dist/manifest.json'),
                    noErrorOnMissing: true
                },
                {
                    from: path.resolve(__dirname, 'public/favicon.ico'),
                    to: path.resolve(__dirname, 'dist/favicon.ico'),
                    noErrorOnMissing: true
                },
                {
                    from: path.resolve(__dirname, 'public/favicon-32x32.png'),
                    to: path.resolve(__dirname, 'dist/favicon-32x32.png'),
                    noErrorOnMissing: true
                },
                {
                    from: path.resolve(__dirname, 'public/images/icons'),
                    to: path.resolve(__dirname, 'dist/images/icons'),
                    noErrorOnMissing: true
                },
                {
                    from: path.resolve(__dirname, 'public/images/screenshots'),
                    to: path.resolve(__dirname, 'dist/images/screenshots'),
                    noErrorOnMissing: true
                },
            ],
        }),
        new WorkboxWebpackPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true,
            runtimeCaching: [
                {
                    urlPattern: ({ url }) => url.origin === 'https://story-api.dicoding.dev',
                    handler: 'NetworkFirst',
                    options: {
                        cacheName: 'api-cache',
                        expiration: {
                            maxEntries: 50,
                            maxAgeSeconds: 60 * 60 * 24 * 7,
                        },
                    },
                },
                {
                    urlPattern: ({ url }) => url.origin === 'https://api.maptiler.com',
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'maptiler-tiles',
                        expiration: {
                            maxEntries: 100,
                            maxAgeSeconds: 60 * 60 * 24 * 30,
                        },
                    },
                },
                {
                    urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'google-fonts',
                        expiration: {
                            maxEntries: 10,
                            maxAgeSeconds: 60 * 60 * 24 * 30,
                        },
                    },
                },
            ],
        }),
    ],
};
