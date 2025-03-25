const CopyPlugin = require("copy-webpack-plugin");
const path = require('path');
module.exports = {
   entry: './dist/index.js',
   mode: 'development', //production
   target: "web",
   devtool: 'inline-source-map',
   watch: true,
   output: {
      filename: 'C5RenDebug.js',
      path: path.resolve(__dirname, 'dist'),
      library: 'C5Ren',
      libraryTarget: 'umd',     
   },
   resolve: {
      extensions: ['.ts', '.js'],
   },
   module: {
      rules: [
         {
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/,
         },
      ],
   }, 
   plugins: [
      new CopyPlugin({
        patterns: [
          { from: "./src/main/ts/armyc2/c5isr/data/*", to: "[name][ext]" }
        ],
      }),
    ],
};