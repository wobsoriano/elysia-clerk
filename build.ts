import type { BuildConfig } from 'bun'
import { name, version } from './package.json';
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

console.log('Building mjs...')
const mjsBuild = await Bun.build({
  ...defaultBuildConfig,
  plugins: [dts()],
  format: 'esm',
  naming: "[dir]/[name].mjs",
})

if (mjsBuild.success) {
  console.log('mjs build successful')
}

console.log('Building cjs...')
const cjsBuild = await Bun.build({
  ...defaultBuildConfig,
  format: 'cjs',
  naming: "[dir]/[name].js",
})

if (cjsBuild.success) {
  console.log('cjs build successful')
}
