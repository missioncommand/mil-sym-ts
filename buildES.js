//run with "node buildES.js"
require("esbuild")
  .build({
    logLevel: "info",
    entryPoints: ["dist/src/main/ts/indexWP.js"],
    bundle: true,
    outfile: "dist/C5RenDebug.js",
    loader: { '.json': 'file' }, // This tells esbuild to treat JSON files as assets
    sourcemap: 'inline', // This enables sourcemaps ('inline', 'external', false)
    format: 'esm', // This specifies the output format (e.g., 'iife', 'cjs', 'esm')
    globalName: 'C5Ren' // This specifies the global variable name for your library
  })
  .catch(() => process.exit(1));