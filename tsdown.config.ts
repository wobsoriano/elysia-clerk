import { defineConfig } from 'tsdown'
import pkg from './package.json' with { type: 'json' }

export default defineConfig(() => {
  return {
    entry: ['src/index.ts', 'src/webhooks.ts'],
    platform: 'neutral',
    define: {
      PACKAGE_NAME: `"${pkg.name}"`,
      PACKAGE_VERSION: `"${pkg.version}"`,
    },
  }
})
