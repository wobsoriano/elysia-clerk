import pkg from './package.json';
import { mock, jest } from 'bun:test';

globalThis.PACKAGE_NAME = pkg.name;
globalThis.PACKAGE_VERSION = pkg.version;

declare global {
  var authenticateRequestMock: ReturnType<typeof jest.fn>;
  var createClerkClientMock: ReturnType<typeof jest.fn>;
}

if (process.env.NODE_ENV === 'test') {
  process.env.CLERK_SECRET_KEY = 'TEST_SECRET_KEY';
  process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_dGlnaHQtcmFiYml0LTk0LmNsZXJrLmFjY291bnRzLmRldiQ';

  globalThis.authenticateRequestMock = jest.fn();
  globalThis.createClerkClientMock = jest.fn();

  mock.module('@clerk/backend', () => {
    const mod = require('@clerk/backend');
    return {
      ...mod,
      createClerkClient: (options: any) => {
        globalThis.createClerkClientMock(options);

        return {
          options,
          users: {
            getUser: jest.fn(),
          },
          authenticateRequest: (...args: any) => globalThis.authenticateRequestMock(...args),
        };
      },
    };
  });
}
