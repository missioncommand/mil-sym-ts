//run with "node buildESR.js"
const { dtsPlugin } = require("esbuild-plugin-d.ts");
const { build } = require("esbuild");
require("esbuild")
  .build({
    logLevel: "info",
    entryPoints: ["index.ts"],
    bundle: true,
    outfile: "dist/C5Ren.js",
    platform: "browser",
    loader: { '.json': 'file' }, // This tells esbuild to treat JSON files as assets
    sourcemap: 'external', // This enables sourcemaps ('inline', 'external', false)
    format: 'iife', // This specifies the output format (e.g., 'iife', 'cjs', 'esm')
    globalName: 'C5Ren', // This specifies the global variable name for your library
    minify: true, // This enables minification
  })
  .catch(() => process.exit(1));