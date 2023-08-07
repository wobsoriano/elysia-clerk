const result = await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  minify: true,
  target: 'node',
  sourcemap: 'external',
  external: ['@clerk/backend', 'elysia'],
})

if (result.success) {
  const file = Bun.file('./index.d.ts');
  await Bun.write('./dist/index.d.ts', file);

  console.log('Build success!')
}
