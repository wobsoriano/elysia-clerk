import { defineConfig } from 'vite-plus';
import pkg from './package.json' with { type: 'json' };

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  define: {
    PACKAGE_NAME: JSON.stringify(pkg.name),
    PACKAGE_VERSION: JSON.stringify(pkg.version),
  },
  test: {},
  pack: {
    entry: ['src/index.ts', 'src/webhooks.ts'],
    platform: 'neutral',
    define: {
      PACKAGE_NAME: `"${pkg.name}"`,
      PACKAGE_VERSION: `"${pkg.version}"`,
    },
  },
  lint: {
    ignorePatterns: ['dev/**'],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    semi: true,
    singleQuote: true,
  },
});
