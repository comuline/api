import { defineConfig, type Options } from "tsup"

export default defineConfig((options: Options) => ({
  entry: ["src/index.ts"],
  format: ["esm"],
  minify: true,
  outDir: ".dist",
  clean: true,
  metafile: true,
  ...options,
}))
