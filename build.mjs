import dts from 'bun-plugin-dts-auto'

await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  minify: true,
  target: 'node',
  sourcemap: 'external',
  external: ['@clerk/backend', 'elysia'],
  plugins: [dts()],
})
