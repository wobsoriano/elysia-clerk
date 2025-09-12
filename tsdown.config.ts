import { defineConfig } from 'tsdown'
import pkg from './package.json' with { type: 'json' }

export default defineConfig(() => {
  return {
    entry: ['src/index.ts', 'src/webhooks.ts'],
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
