import pkg from './package.json'
import { mock, jest } from 'bun:test'

globalThis.PACKAGE_NAME = pkg.name
globalThis.PACKAGE_VERSION = pkg.version

console.log(import.meta.env.TESTS)

process.env.CLERK_SECRET_KEY = 'TEST_SECRET_KEY'
process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_dGlnaHQtcmFiYml0LTk0LmNsZXJrLmFjY291bnRzLmRldiQ'

declare global {
    var authenticateRequestMock: ReturnType<typeof jest.fn>;
}

globalThis.authenticateRequestMock = jest.fn()

mock.module('@clerk/backend', () => {
  const mod = require('@clerk/backend');
  return {
    ...mod,
    createClerkClient: () => {
      return {
        authenticateRequest: (...args: any) => globalThis.authenticateRequestMock(...args),
      }
    },
  }
})
