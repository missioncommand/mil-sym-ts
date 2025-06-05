const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const path = require('path');
module.exports = {
   entry: './dist/index.js',
   mode: 'production', //production
   target: "node",
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
      extensions: ['.ts', '.js', ".json"],
   },
   plugins: [
      new WebpackManifestPlugin({
        fileName: 'manifest.json',
      })],
   externals: {
      canvas: "commonjs canvas"
   }, 
   module: {
   }, 
};