import esbuild from 'npm:esbuild';

await esbuild.build({
    entryPoints: ["./src/index.ts"],
    outdir: "./dist",
    bundle: true,
    minify: true,
    format: "esm",
    alias: {
        "npm:buffer": "buffer"
    },
});