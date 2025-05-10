import { defineConfig } from 'tsup'
import pkg from './package.json'

export default defineConfig(() => {
  return {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    clean: true,
    minify: false,
    dts: true,
    define: {
      PACKAGE_NAME: `"${pkg.name}"`,
      PACKAGE_VERSION: `"${pkg.version}"`,
    },
  }
})
