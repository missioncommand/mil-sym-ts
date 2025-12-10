import { defineConfig } from "tsdown";

const isDev = process.env.NODE_ENV === "development";

const config = isDev
  ? defineConfig({
      entry: "C5Ren.ts",
      platform: "browser",

      format: "umd",
      outputOptions: {
        name: "C5Ren",
      },
      watch: true,
      outDir: "dist",
      noExternal: ["canvas"],
    })
  : defineConfig([
      {
        entry: "C5Ren.ts",
        platform: "browser",

        format: {
          esm: {
            minify: false,
          },
          umd: {
            minify: true,
          },
        },
        outputOptions: {
          name: "C5Ren",
        },
        outDir: "dist",
        noExternal: ["canvas"],
      },
      {
        entry: "C5Ren.ts",
        platform: "node",

        format: "commonjs",
        outputOptions: {
          name: "C5Ren",
        },
        outDir: "dist-node",
      },
    ]);

export default config;
