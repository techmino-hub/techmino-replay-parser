import esbuild from 'npm:esbuild';

await esbuild.build({
    entryPoints: ["./src/index.ts"],
    outdir: "./dist",
    bundle: true,
    minify: true,
    format: "esm",
    alias: {
        "npm:buffer": "./node_modules/buffer/index.js",
    },
});