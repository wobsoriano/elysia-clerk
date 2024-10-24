import type { BuildConfig } from 'bun'
import { name, version } from './package.json'
import dts from 'bun-plugin-dts'

const defaultBuildConfig: BuildConfig = {
  entrypoints: ['./src/index.ts'],
  packages: 'external',
  outdir: './dist',
  sourcemap: 'external',
  minify: true,
  define: {
    PACKAGE_NAME: JSON.stringify(name),
    PACKAGE_VERSION: JSON.stringify(version),
  },
}

console.log('Building packages...')

const [mjsBuild, cjsBuild] = await Promise.all([
  // ESM build
  Bun.build({
    ...defaultBuildConfig,
    plugins: [dts()],
    format: 'esm',
    naming: "[dir]/[name].mjs",
  }),

  // CJS build
  Bun.build({
    ...defaultBuildConfig,
    format: 'cjs',
    naming: "[dir]/[name].js",
  })
])

if (mjsBuild.success && cjsBuild.success) {
  console.log('All builds completed successfully!')
} else {
  console.error('Build failed')
  process.exit(1)
}
