const CopyPlugin = require("copy-webpack-plugin");
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const path = require('path');
module.exports = {
   entry: './dist/index.js',
   mode: 'production', //production
   target: "web",
   devtool: 'source-map',
   watch: true,
   output: {
      filename: 'C5Ren.js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
      library: 'C5Ren',
      libraryTarget: 'umd',     
   },
   resolve: {
      extensions: ['.ts', '.js'],
   },
   plugins: [
      new WebpackManifestPlugin({
        fileName: 'manifest.json',
      })],
   module: {
      rules: [
         {
            test: /\.json$/,
            type: 'asset/resource',
            generator: {
               filename: 'data/[name].[contenthash][ext]' // Stores JSON separately in 'data/' folder
            }
         },
         {
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/,
         }
      ],
   }, 
   /*plugins: [
      new CopyPlugin({
        patterns: [
          { from: "./src/main/ts/armyc2/c5isr/data/*", to: "[name][ext]" }
        ],
      }),
    ],//*/
};